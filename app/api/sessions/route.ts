/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { SessionRepository } from '@/lib/database/repositories/SessionRepository';
import { sessionSchema } from '@/lib/utils/validation';
import { ObjectId } from 'mongodb';

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const sessionRepository = new SessionRepository();
    let sessions;

    if (req.user!.role === 'mentor') {
      sessions = await sessionRepository.findByMentorId(req.user!.userId, {
        status,
        limit,
        skip
      });
    } else {
      sessions = await sessionRepository.findByStudentId(req.user!.userId, {
        status,
        limit,
        skip
      });
    }

    return NextResponse.json({
      success: true,
      data: sessions.items,
      pagination: {
        page,
        limit,
        total: sessions.total,
        pages: Math.ceil(sessions.total / limit)
      }
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
    if (req.user!.role !== 'student') {
      return NextResponse.json(
        { success: false, message: 'Only students can book sessions' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = sessionSchema.parse(body);

    const sessionRepository = new SessionRepository();

    // Create session
    const session = await sessionRepository.create({
      mentorId: new ObjectId(validatedData.mentorId),
      studentId: new ObjectId(req.user!.userId),
      subject: validatedData.subject,
      scheduledAt: new Date(validatedData.scheduledAt),
      duration: validatedData.duration,
      status: 'scheduled',
      type: validatedData.type,
      notes: validatedData.notes,
      payment: {
        amount: 0, // Will be calculated based on mentor pricing
        currency: 'USD',
        stripePaymentIntentId: '',
        status: 'pending'
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // TODO: Create Stripe payment intent
    // TODO: Send notification to mentor

    return NextResponse.json({
      success: true,
      message: 'Session booked successfully',
      data: session
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