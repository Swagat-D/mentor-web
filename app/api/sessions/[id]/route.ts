import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { SessionRepository } from '@/lib/database/repositories/SessionRepository';
import { ObjectId } from 'mongodb';


export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const url = new URL(req.url);
    const sessionId = url.pathname.split('/').pop()!;
    const sessionRepository = new SessionRepository();
    
    const session = await sessionRepository.findById(sessionId);
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Session not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this session
    const userId = new ObjectId(req.user!.userId);
    if (!session.mentorId.equals(userId) && !session.studentId.equals(userId)) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: session
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
    const { status, notes } = body;

    const sessionRepository = new SessionRepository();
    const session = await sessionRepository.findById(sessionId);
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Session not found' },
        { status: 404 }
      );
    }

    // Check if user has access to this session
    const userId = new ObjectId(req.user!.userId);
    if (!session.mentorId.equals(userId) && !session.studentId.equals(userId)) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    // Update session
    const updatedSession = await sessionRepository.updateSessionStatus(
      sessionId,
      status,
      { notes }
    );

    return NextResponse.json({
      success: true,
      message: 'Session updated successfully',
      data: updatedSession
    });

  } catch (error) {
    console.error('Update session error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});