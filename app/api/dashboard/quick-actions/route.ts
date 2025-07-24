// app/api/dashboard/quick-actions/route.ts
import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { connectToDatabase } from '@/lib/database/connection';
import { ObjectId } from 'mongodb';

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { action, data } = await req.json();
    const { db } = await connectToDatabase();
    const userId = new ObjectId(req.user!.userId);

    switch (action) {
      case 'get-unread-messages':
        // Get unread message count
        const unreadMessages = await db.collection('messages').countDocuments({
          receiverId: userId,
          readAt: null
        });
        
        return NextResponse.json({
          success: true,
          data: { unreadCount: unreadMessages }
        });

      case 'get-availability-slots':
        // Get mentor's current availability (if mentor)
        if (req.user!.role !== 'mentor') {
          return NextResponse.json(
            { success: false, message: 'Only mentors can access availability' },
            { status: 403 }
          );
        }

        const mentorProfile = await db.collection('mentorProfiles').findOne({ userId });
        
        return NextResponse.json({
          success: true,
          data: {
            availability: mentorProfile?.availability || [],
            weeklyHours: mentorProfile?.weeklyHours || 25
          }
        });

      case 'quick-stats':
        // Get quick stats for dashboard widgets
        if (req.user!.role === 'mentor') {
          const [pendingReviews, todaySessions, unreadMessages] = await Promise.all([
            db.collection('reviews').countDocuments({
              mentorId: userId,
              reply: { $exists: false }
            }),
            db.collection('sessions').countDocuments({
              mentorId: userId,
              status: 'scheduled',
              scheduledAt: {
                $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                $lt: new Date(new Date().setHours(23, 59, 59, 999))
              }
            }),
            db.collection('messages').countDocuments({
              receiverId: userId,
              readAt: null
            })
          ]);

          return NextResponse.json({
            success: true,
            data: {
              pendingReviews,
              todaySessions,
              unreadMessages
            }
          });
        } else {
          // Student quick stats
          const [upcomingSessions, unreadMessages] = await Promise.all([
            db.collection('sessions').countDocuments({
              studentId: userId,
              status: 'scheduled',
              scheduledAt: { $gt: new Date() }
            }),
            db.collection('messages').countDocuments({
              receiverId: userId,
              readAt: null
            })
          ]);

          return NextResponse.json({
            success: true,
            data: {
              upcomingSessions,
              unreadMessages
            }
          });
        }

      case 'create-availability-slot':
        // Quick create availability slot (for mentors)
        if (req.user!.role !== 'mentor') {
          return NextResponse.json(
            { success: false, message: 'Only mentors can create availability' },
            { status: 403 }
          );
        }

        const { dayOfWeek, startTime, endTime } = data;
        
        if (!dayOfWeek || !startTime || !endTime) {
          return NextResponse.json(
            { success: false, message: 'Missing required fields' },
            { status: 400 }
          );
        }

        // Create the availability slot object
        const availabilitySlot = {
          dayOfWeek: dayOfWeek,
          startTime: startTime,
          endTime: endTime,
          isActive: true,
          createdAt: new Date()
        };

        // Add availability slot to mentor profile
        const updateResult = await db.collection('mentorProfiles').updateOne(
          { userId: userId },
          {
            $push: {
              availability: availabilitySlot
            },
            $set: { 
              updatedAt: new Date() 
            }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any,
          { upsert: true }
        );

        if (updateResult.acknowledged) {
          return NextResponse.json({
            success: true,
            message: 'Availability slot added successfully'
          });
        } else {
          return NextResponse.json({
            success: false,
            message: 'Failed to add availability slot'
          }, { status: 500 });
        }

      case 'get-session-suggestions':
        // Get suggested sessions for students
        if (req.user!.role !== 'student') {
          return NextResponse.json(
            { success: false, message: 'Only students can get session suggestions' },
            { status: 403 }
          );
        }

        // Get user's previous sessions to suggest similar mentors/subjects
        const userSessions = await db.collection('sessions').find({
          studentId: userId,
          status: 'completed'
        }).limit(10).toArray();

        const subjectInterests = [...new Set(userSessions.map(s => s.subject))];

        // Find available mentors with similar subjects
        const suggestedMentors = await db.collection('mentorProfiles').find({
          subjects: { $in: subjectInterests },
          isActive: true
        }).limit(5).toArray();

        return NextResponse.json({
          success: true,
          data: {
            suggestedMentors: suggestedMentors.map(mentor => ({
              id: mentor._id.toString(),
              name: mentor.displayName,
              subjects: mentor.subjects,
              rating: mentor.averageRating || 4.5,
              hourlyRate: mentor.pricing?.hourlyRate || 75
            })),
            subjectInterests
          }
        });

      default:
        return NextResponse.json(
          { success: false, message: 'Unknown action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Quick actions error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});