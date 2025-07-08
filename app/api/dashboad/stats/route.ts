import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { SessionRepository } from '@/lib/database/repositories/SessionRepository';
import { ObjectId } from 'mongodb';

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const sessionRepository = new SessionRepository();
    const userId = new ObjectId(req.user!.userId);

    let stats;

    if (req.user!.role === 'mentor') {
      // Get mentor stats
      const [totalSessions, completedSessions, upcomingSessions] = await Promise.all([
        sessionRepository.findByMentorId(userId),
        sessionRepository.findByMentorId(userId, { status: 'completed' }),
        sessionRepository.findUpcomingSessions(userId)
      ]);

      const totalEarnings = completedSessions.items.reduce((sum, session) => {
        return sum + (session.payment.amount || 0);
      }, 0);

      stats = {
        totalSessions: totalSessions.total,
        completedSessions: completedSessions.total,
        upcomingSessions: upcomingSessions.length,
        totalEarnings,
        averageRating: 4.8, // TODO: Calculate from feedback
        responseTime: 120, // TODO: Calculate actual response time
      };
    } else {
      // Get student stats
      const [totalSessions, completedSessions, upcomingSessions] = await Promise.all([
        sessionRepository.findByStudentId(userId),
        sessionRepository.findByStudentId(userId, { status: 'completed' }),
        sessionRepository.findUpcomingSessions(userId)
      ]);

      const totalSpent = completedSessions.items.reduce((sum, session) => {
        return sum + (session.payment.amount || 0);
      }, 0);

      stats = {
        totalSessions: totalSessions.total,
        completedSessions: completedSessions.total,
        upcomingSessions: upcomingSessions.length,
        totalSpent,
        favoriteMentors: 5, // TODO: Calculate from session data
      };
    }

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});