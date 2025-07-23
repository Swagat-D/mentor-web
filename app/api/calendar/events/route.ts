// app/api/calendar/events/route.ts
import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { connectToDatabase } from '@/lib/database/connection';
import { ObjectId } from 'mongodb';

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('start') || new Date().toISOString();
    const endDate = searchParams.get('end') || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const viewType = searchParams.get('view') || 'month';

    const { db } = await connectToDatabase();
    const userId = new ObjectId(req.user!.userId);

    // Build match query based on user role
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const baseMatch: any = {
      scheduledAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };
    
    if (req.user!.role === 'mentor') {
      baseMatch.mentorId = userId;
    } else {
      baseMatch.studentId = userId;
    }

    // Aggregation pipeline to get sessions with user details
    const pipeline = [
      { $match: baseMatch },
      {
        $lookup: {
          from: 'users',
          localField: 'mentorId',
          foreignField: '_id',
          as: 'mentorData'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'studentId',
          foreignField: '_id',
          as: 'studentData'
        }
      },
      {
        $lookup: {
          from: 'mentorProfiles',
          localField: 'mentorId',
          foreignField: 'userId',
          as: 'mentorProfile'
        }
      },
      { $unwind: '$mentorData' },
      { $unwind: '$studentData' },
      {
        $addFields: {
          mentorProfile: { $arrayElemAt: ['$mentorProfile', 0] }
        }
      },
      {
        $project: {
          _id: 1,
          mentorId: 1,
          studentId: 1,
          subject: 1,
          scheduledAt: 1,
          duration: 1,
          status: 1,
          type: 1,
          notes: 1,
          feedback: 1,
          rating: 1,
          payment: 1,
          createdAt: 1,
          updatedAt: 1,
          mentor: {
            _id: '$mentorData._id',
            name: '$mentorData.name',
            displayName: '$mentorProfile.displayName',
            email: '$mentorData.email',
            avatar: '$mentorData.avatar'
          },
          student: {
            _id: '$studentData._id',
            name: '$studentData.name',
            email: '$studentData.email',
            avatar: '$studentData.avatar'
          }
        }
      },
      { $sort: { scheduledAt: 1 } }
    ];

    const events = await db.collection('sessions').aggregate(pipeline).toArray();

    // Transform sessions to calendar events format
    const calendarEvents = events.map(session => ({
      id: session._id.toString(),
      title: session.subject,
      start: session.scheduledAt,
      end: new Date(new Date(session.scheduledAt).getTime() + session.duration * 60000),
      status: session.status,
      type: session.type,
      mentor: {
        ...session.mentor,
        _id: session.mentor._id.toString()
      },
      student: {
        ...session.student,
        _id: session.student._id.toString()
      },
      payment: session.payment,
      notes: session.notes,
      feedback: session.feedback,
      rating: session.rating,
      duration: session.duration,
      extendedProps: {
        sessionId: session._id.toString(),
        mentorId: session.mentorId.toString(),
        studentId: session.studentId.toString(),
        originalData: session
      }
    }));

    // Get additional stats for the calendar view
    const stats = await db.collection('sessions').aggregate([
      { $match: req.user!.role === 'mentor' ? { mentorId: userId } : { studentId: userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          upcoming: { 
            $sum: { 
              $cond: [
                { 
                  $and: [
                    { $eq: ['$status', 'scheduled'] },
                    { $gt: ['$scheduledAt', new Date()] }
                  ]
                }, 
                1, 
                0
              ] 
            } 
          },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
          totalEarnings: { 
            $sum: { 
              $cond: [
                { $eq: ['$status', 'completed'] },
                '$payment.amount',
                0
              ]
            }
          }
        }
      }
    ]).toArray();

    const sessionStats = stats[0] || {
      total: 0,
      completed: 0,
      upcoming: 0,
      cancelled: 0,
      inProgress: 0,
      totalEarnings: 0
    };

    return NextResponse.json({
      success: true,
      data: calendarEvents,
      stats: sessionStats,
      meta: {
        startDate,
        endDate,
        viewType,
        userRole: req.user!.role,
        total: calendarEvents.length
      }
    });

  } catch (error) {
    console.error('Get calendar events error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});

