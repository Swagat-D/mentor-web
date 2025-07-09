import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { connectToDatabase } from '@/lib/database/connection';
import { ObjectId } from 'mongodb';

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { db } = await connectToDatabase();
    const userId = new ObjectId(req.user!.userId);

    if (req.user!.role === 'mentor') {
      // Get mentor stats
      const [sessionsData, profileData] = await Promise.all([
        db.collection('sessions').find({ mentorId: userId }).toArray(),
        db.collection('mentorProfiles').findOne({ userId })
      ]);

      const completedSessions = sessionsData.filter(s => s.status === 'completed');
      const upcomingSessions = sessionsData.filter(s => s.status === 'scheduled' && new Date(s.scheduledAt) > new Date());
      
      // Get unique students
      const uniqueStudents = [...new Set(sessionsData.map(s => s.studentId.toString()))];

      const totalEarnings = completedSessions.reduce((sum, session) => {
        return sum + (session.payment?.amount || 0);
      }, 0);

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyEarnings = completedSessions
        .filter(s => {
          const sessionDate = new Date(s.scheduledAt);
          return sessionDate.getMonth() === currentMonth && sessionDate.getFullYear() === currentYear;
        })
        .reduce((sum, session) => sum + (session.payment?.amount || 0), 0);

      const stats = {
        totalStudents: uniqueStudents.length,
        totalSessions: sessionsData.length,
        completedSessions: completedSessions.length,
        upcomingSessions: upcomingSessions.length,
        totalEarnings,
        monthlyEarnings,
        averageRating: 4.8, // TODO: Calculate from feedback
        responseTime: 120, // TODO: Calculate actual response time
        completionRate: sessionsData.length > 0 ? Math.round((completedSessions.length / sessionsData.length) * 100) : 0,
        weeklyHours: profileData?.weeklyHours || 25,
      };

      return NextResponse.json({
        success: true,
        data: stats
      });

    } else {
      // Student stats
      const sessionsData = await db.collection('sessions').find({ studentId: userId }).toArray();
      const completedSessions = sessionsData.filter(s => s.status === 'completed');
      const upcomingSessions = sessionsData.filter(s => s.status === 'scheduled' && new Date(s.scheduledAt) > new Date());

      const totalSpent = completedSessions.reduce((sum, session) => {
        return sum + (session.payment?.amount || 0);
      }, 0);

      const stats = {
        totalSessions: sessionsData.length,
        completedSessions: completedSessions.length,
        upcomingSessions: upcomingSessions.length,
        totalSpent,
        favoriteMentors: 5, // TODO: Calculate from session data
      };

      return NextResponse.json({
        success: true,
        data: stats
      });
    }

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});