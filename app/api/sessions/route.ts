/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/sessions/route.ts
import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { connectToDatabase } from '@/lib/database/connection';
import { ObjectId } from 'mongodb';
import { z } from 'zod';

// Session creation schema
const createSessionSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  subject: z.string().min(1, 'Subject is required'),
  scheduledAt: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date format'),
  duration: z.number().min(30).max(180, 'Duration must be between 30-180 minutes'),
  type: z.enum(['video', 'audio', 'chat']),
  notes: z.string().optional(),
  rate: z.number().min(0).optional(),
});

// Session update schema
const updateSessionSchema = z.object({
  status: z.enum(['scheduled', 'in-progress', 'completed', 'cancelled']).optional(),
  notes: z.string().optional(),
  feedback: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
});

interface SessionDocument {
  _id: ObjectId;
  mentorId: ObjectId;
  studentId: ObjectId;
  subject: string;
  scheduledAt: Date;
  duration: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  type: 'video' | 'audio' | 'chat';
  notes?: string;
  feedback?: string;
  rating?: number;
  payment: {
    amount: number;
    currency: string;
    status: 'pending' | 'paid' | 'refunded';
    stripePaymentIntentId?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface SessionResponse extends Omit<SessionDocument, '_id' | 'mentorId' | 'studentId' | 'scheduledAt' | 'createdAt' | 'updatedAt'> {
  _id: string;
  mentorId: string;
  studentId: string;
  scheduledAt: string;
  createdAt: string;
  updatedAt: string;
  mentor: {
    _id: string;
    name: string;
    displayName?: string;
    email: string;
    avatar?: string;
  };
  student: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || '';
    const dateFrom = searchParams.get('dateFrom') || undefined;
    const dateTo = searchParams.get('dateTo') || undefined;
    const subject = searchParams.get('subject') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const { db } = await connectToDatabase();
    const userId = new ObjectId(req.user!.userId);

    // Build match query based on user role
    const baseMatch: any = {};
    
    if (req.user!.role === 'mentor') {
      baseMatch.mentorId = userId;
    } else {
      baseMatch.studentId = userId;
    }

    // Add filters
    if (status) {
      baseMatch.status = status;
    }

    if (subject) {
      baseMatch.subject = { $regex: subject, $options: 'i' };
    }

    if (dateFrom || dateTo) {
      baseMatch.scheduledAt = {};
      if (dateFrom) {
        baseMatch.scheduledAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        baseMatch.scheduledAt.$lte = new Date(dateTo);
      }
    }

    // Build aggregation pipeline
    const pipeline: any[] = [
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
      }
    ];

    // Add search filter if provided
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'mentorData.name': { $regex: search, $options: 'i' } },
            { 'studentData.name': { $regex: search, $options: 'i' } },
            { subject: { $regex: search, $options: 'i' } },
            { notes: { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    // Get total count
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await db.collection('sessions').aggregate(countPipeline).toArray();
    const totalCount = countResult[0]?.total || 0;

    // Add sorting and pagination
    pipeline.push(
      { $sort: { scheduledAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    );

    // Project final response format
    pipeline.push({
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
    });

    const sessions = await db.collection('sessions').aggregate(pipeline).toArray();

    // Transform the response
    const transformedSessions: SessionResponse[] = sessions.map(session => ({
      _id: session._id.toString(),
      mentorId: session.mentorId.toString(),
      studentId: session.studentId.toString(),
      subject: session.subject,
      scheduledAt: session.scheduledAt.toISOString(),
      duration: session.duration,
      status: session.status,
      type: session.type,
      notes: session.notes,
      feedback: session.feedback,
      rating: session.rating,
      payment: session.payment,
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
    }));

    // Get session stats
    const statsAggregation = await db.collection('sessions').aggregate([
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

    const stats = statsAggregation[0] || {
      total: 0,
      completed: 0,
      upcoming: 0,
      cancelled: 0,
      totalEarnings: 0
    };

    return NextResponse.json({
      success: true,
      data: transformedSessions,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      stats
    });

  } catch (error) {
    console.error('Get sessions error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    if (req.user!.role !== 'mentor') {
      return NextResponse.json(
        { success: false, message: 'Only mentors can create sessions' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = createSessionSchema.parse(body);

    const { db } = await connectToDatabase();
    const mentorId = new ObjectId(req.user!.userId);
    const studentId = new ObjectId(validatedData.studentId);

    // Verify student exists
    const student = await db.collection('users').findOne({
      _id: studentId,
      role: 'mentee',
      isActive: true
    });

    if (!student) {
      return NextResponse.json(
        { success: false, message: 'Student not found or inactive' },
        { status: 404 }
      );
    }

    // Get mentor's rate
    const mentorProfile = await db.collection('mentorProfiles').findOne({ userId: mentorId });
    const hourlyRate = mentorProfile?.pricing?.hourlyRate || 75;
    const sessionAmount = (hourlyRate * validatedData.duration) / 60;

    // Create session
    const session = {
      mentorId,
      studentId,
      subject: validatedData.subject,
      scheduledAt: new Date(validatedData.scheduledAt),
      duration: validatedData.duration,
      status: 'scheduled' as const,
      type: validatedData.type,
      notes: validatedData.notes || '',
      payment: {
        amount: sessionAmount,
        currency: 'USD',
        status: 'pending' as const
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('sessions').insertOne(session);

    // Create notification for student
    const notification = {
      userId: studentId,
      type: 'session',
      title: 'New Session Scheduled',
      message: `A new ${validatedData.subject} session has been scheduled with your mentor`,
      priority: 'high',
      read: false,
      actionUrl: '/dashboard/sessions',
      metadata: {
        sessionId: result.insertedId.toString(),
        subject: validatedData.subject,
        scheduledAt: validatedData.scheduledAt
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await db.collection('notifications').insertOne(notification);

    return NextResponse.json({
      success: true,
      message: 'Session created successfully',
      data: {
        sessionId: result.insertedId.toString(),
        scheduledAt: validatedData.scheduledAt,
        amount: sessionAmount
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Create session error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed',
          errors: error.errors.map((e: any) => e.message)
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const PATCH = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const { sessionId, ...updateData } = body;
    const validatedData = updateSessionSchema.parse(updateData);

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: 'Session ID is required' },
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
    const result = await db.collection('sessions').updateOne(
      { _id: new ObjectId(sessionId) },
      { 
        $set: {
          ...validatedData,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Session updated successfully'
    });

  } catch (error: any) {
    console.error('Update session error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed',
          errors: error.errors.map((e: any) => e.message)
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});