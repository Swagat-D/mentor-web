import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { connectToDatabase } from '@/lib/database/connection';
import { ObjectId } from 'mongodb';

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const { action, sessionIds, newStatus, rescheduleData } = body;

    const { db } = await connectToDatabase();
    const userId = new ObjectId(req.user!.userId);

    let result;

    switch (action) {
      case 'bulk-status-update':
        if (!sessionIds || !newStatus) {
          return NextResponse.json(
            { success: false, message: 'Session IDs and new status are required' },
            { status: 400 }
          );
        }

        const sessionObjectIds = sessionIds.map((id: string) => new ObjectId(id));
        
        // Verify user has access to these sessions
        const accessQuery = req.user!.role === 'mentor' 
          ? { mentorId: userId }
          : { studentId: userId };

        const updateResult = await db.collection('sessions').updateMany(
          { 
            _id: { $in: sessionObjectIds },
            ...accessQuery
          },
          {
            $set: {
              status: newStatus,
              updatedAt: new Date()
            }
          }
        );

        // Create notifications for affected users
        if (updateResult.modifiedCount > 0) {
          const updatedSessions = await db.collection('sessions')
            .find({ _id: { $in: sessionObjectIds } })
            .toArray();

          for (const session of updatedSessions) {
            const otherUserId = req.user!.role === 'mentor' ? session.studentId : session.mentorId;
            
            await db.collection('notifications').insertOne({
              userId: otherUserId,
              type: 'session',
              title: 'Session Status Updated',
              message: `Your ${session.subject} session status has been updated to ${newStatus}`,
              priority: 'medium',
              read: false,
              actionUrl: '/dashboard/calendar',
              metadata: {
                sessionId: session._id.toString(),
                newStatus,
                bulkAction: true
              },
              createdAt: new Date(),
              updatedAt: new Date()
            });
          }
        }

        result = {
          modified: updateResult.modifiedCount,
          matched: updateResult.matchedCount
        };
        break;

      case 'bulk-reschedule':
        if (!sessionIds || !rescheduleData) {
          return NextResponse.json(
            { success: false, message: 'Session IDs and reschedule data are required' },
            { status: 400 }
          );
        }

        const rescheduleResults = [];
        for (const sessionId of sessionIds) {
          const sessionObjectId = new ObjectId(sessionId);
          const session = await db.collection('sessions').findOne({
            _id: sessionObjectId,
            ...(req.user!.role === 'mentor' ? { mentorId: userId } : { studentId: userId })
          });

          if (session) {
            const newScheduledAt = new Date(rescheduleData.newDateTime);
            
            await db.collection('sessions').updateOne(
              { _id: sessionObjectId },
              {
                $set: {
                  scheduledAt: newScheduledAt,
                  updatedAt: new Date()
                }
              }
            );

            // Create notification
            const otherUserId = req.user!.role === 'mentor' ? session.studentId : session.mentorId;
            await db.collection('notifications').insertOne({
              userId: otherUserId,
              type: 'session',
              title: 'Session Rescheduled',
              message: `Your ${session.subject} session has been rescheduled to ${newScheduledAt.toLocaleDateString()} at ${newScheduledAt.toLocaleTimeString()}`,
              priority: 'high',
              read: false,
              actionUrl: '/dashboard/calendar',
              metadata: {
                sessionId: sessionId,
                oldDateTime: session.scheduledAt,
                newDateTime: newScheduledAt,
                bulkAction: true
              },
              createdAt: new Date(),
              updatedAt: new Date()
            });

            rescheduleResults.push({
              sessionId,
              success: true,
              newDateTime: newScheduledAt
            });
          } else {
            rescheduleResults.push({
              sessionId,
              success: false,
              error: 'Session not found or access denied'
            });
          }
        }

        result = {
          results: rescheduleResults,
          successful: rescheduleResults.filter(r => r.success).length,
          failed: rescheduleResults.filter(r => !r.success).length
        };
        break;

      case 'bulk-delete':
        if (!sessionIds) {
          return NextResponse.json(
            { success: false, message: 'Session IDs are required' },
            { status: 400 }
          );
        }

        // Only mentors can delete sessions, and only scheduled ones
        if (req.user!.role !== 'mentor') {
          return NextResponse.json(
            { success: false, message: 'Only mentors can delete sessions' },
            { status: 403 }
          );
        }

        const deleteObjectIds = sessionIds.map((id: string) => new ObjectId(id));
        
        // Get sessions before deletion for notifications
        const sessionsToDelete = await db.collection('sessions')
          .find({
            _id: { $in: deleteObjectIds },
            mentorId: userId,
            status: 'scheduled'
          })
          .toArray();

        const deleteResult = await db.collection('sessions').deleteMany({
          _id: { $in: deleteObjectIds },
          mentorId: userId,
          status: 'scheduled'
        });

        // Create notifications for students
        for (const session of sessionsToDelete) {
          await db.collection('notifications').insertOne({
            userId: session.studentId,
            type: 'session',
            title: 'Session Cancelled',
            message: `Your ${session.subject} session scheduled for ${new Date(session.scheduledAt).toLocaleDateString()} has been cancelled`,
            priority: 'high',
            read: false,
            actionUrl: '/dashboard/calendar',
            metadata: {
              sessionId: session._id.toString(),
              subject: session.subject,
              scheduledAt: session.scheduledAt,
              bulkAction: true
            },
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }

        result = {
          deleted: deleteResult.deletedCount,
          notificationsCreated: sessionsToDelete.length
        };
        break;

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid bulk action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `Bulk ${action} completed successfully`,
      data: result
    });

  } catch (error) {
    console.error('Bulk calendar action error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});