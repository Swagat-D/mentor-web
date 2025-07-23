// app/api/sessions/[id]/route.ts
import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { connectToDatabase } from '@/lib/database/connection';
import { ObjectId } from 'mongodb';

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const url = new URL(req.url);
    const sessionId = url.pathname.split('/').pop()!;

    if (!ObjectId.isValid(sessionId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid session ID' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const userId = new ObjectId(req.user!.userId);

    const pipeline = [
      { $match: { _id: new ObjectId(sessionId) } },
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
      }
    ];

    const sessions = await db.collection('sessions').aggregate(pipeline).toArray();
    const session = sessions[0];

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Session not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this session
    const hasAccess = req.user!.role === 'mentor' 
      ? session.mentorId.equals(userId)
      : session.studentId.equals(userId);

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    // Transform the response
    const transformedSession = {
      ...session,
      _id: session._id.toString(),
      mentorId: session.mentorId.toString(),
      studentId: session.studentId.toString(),
      scheduledAt: session.scheduledAt.toISOString(),
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
      mentor: {
        ...session.mentor,
        _id: session.mentor._id.toString()
      },
      student: {
        ...session.student,
        _id: session.student._id.toString()
      }
    };

    return NextResponse.json({
      success: true,
      data: transformedSession
    });

  } catch (error) {
    console.error('Get session error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const PATCH = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const url = new URL(req.url);
    const sessionId = url.pathname.split('/').pop()!;
    const body = await req.json();

    if (!ObjectId.isValid(sessionId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid session ID' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const userId = new ObjectId(req.user!.userId);

    // Find session and verify access
    const session = await db.collection('sessions').findOne({ _id: new ObjectId(sessionId) });

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Session not found' },
        { status: 404 }
      );
    }

    // Check if user has access to update this session
    const hasAccess = req.user!.role === 'mentor' 
      ? session.mentorId.equals(userId)
      : session.studentId.equals(userId);

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    // Update session
    const updateData = {
      ...body,
      updatedAt: new Date()
    };

    const result = await db.collection('sessions').updateOne(
      { _id: new ObjectId(sessionId) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Session not found' },
        { status: 404 }
      );
    }

    // Create notification if status changed
    if (body.status && body.status !== session.status) {
      const otherUserId = req.user!.role === 'mentor' ? session.studentId : session.mentorId;
      const statusMessages = {
        'completed': 'Session has been completed',
        'cancelled': 'Session has been cancelled',
        'in-progress': 'Session is now in progress'
      };

      if (statusMessages[body.status as keyof typeof statusMessages]) {
        const notification = {
          userId: otherUserId,
          type: 'session',
          title: 'Session Status Update',
          message: statusMessages[body.status as keyof typeof statusMessages],
          priority: 'medium',
          read: false,
          actionUrl: '/dashboard/sessions',
          metadata: {
            sessionId: sessionId,
            status: body.status
          },
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await db.collection('notifications').insertOne(notification);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Session updated successfully'
    });

  } catch (error) {
    console.error('Update session error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const url = new URL(req.url);
    const sessionId = url.pathname.split('/').pop()!;

    if (!ObjectId.isValid(sessionId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid session ID' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const userId = new ObjectId(req.user!.userId);

    // Find session and verify access
    const session = await db.collection('sessions').findOne({ _id: new ObjectId(sessionId) });

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Session not found' },
        { status: 404 }
      );
    }

    // Only mentors can delete sessions, and only if they're scheduled
    if (req.user!.role !== 'mentor' || !session.mentorId.equals(userId)) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    if (session.status !== 'scheduled') {
      return NextResponse.json(
        { success: false, message: 'Can only delete scheduled sessions' },
        { status: 400 }
      );
    }

    // Delete session
    const result = await db.collection('sessions').deleteOne({ _id: new ObjectId(sessionId) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Session not found' },
        { status: 404 }
      );
    }

    // Create notification for student
    const notification = {
      userId: session.studentId,
      type: 'session',
      title: 'Session Cancelled',
      message: 'Your scheduled session has been cancelled by the mentor',
      priority: 'high',
      read: false,
      actionUrl: '/dashboard/sessions',
      metadata: {
        sessionId: sessionId,
        subject: session.subject
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('notifications').insertOne(notification);

    return NextResponse.json({
      success: true,
      message: 'Session deleted successfully'
    });

  } catch (error) {
    console.error('Delete session error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});