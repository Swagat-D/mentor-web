/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/dashboard/route.ts
import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { connectToDatabase } from '@/lib/database/connection';
import { ObjectId } from 'mongodb';

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { db } = await connectToDatabase();
    const userId = new ObjectId(req.user!.userId);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    if (req.user!.role === 'mentor') {
      // Get all sessions for this mentor
      const allSessions = await db.collection('sessions').find({ 
        mentorId: userId 
      }).sort({ scheduledAt: -1 }).toArray();

      // Get mentor profile
      const mentorProfile = await db.collection('mentorProfiles').findOne({ userId });

      // Calculate stats
      const completedSessions = allSessions.filter(s => s.status === 'completed');
      const upcomingSessions = allSessions.filter(s => 
        s.status === 'scheduled' && new Date(s.scheduledAt) > now
      ).slice(0, 5); // Get next 5 upcoming sessions

      const recentSessions = completedSessions.slice(0, 5); // Get last 5 completed sessions

      // Get unique students with their data
      const studentIds = [...new Set(allSessions.map(s => s.studentId.toString()))];
      const students = await db.collection('users').find({
        _id: { $in: studentIds.map(id => new ObjectId(id)) },
        role: 'mentee'
      }).toArray();

      // Calculate earnings
      const totalEarnings = completedSessions.reduce((sum, session) => 
        sum + (session.payment?.amount || 75), 0
      );

      const monthlyEarnings = completedSessions
        .filter(s => new Date(s.scheduledAt) >= startOfMonth)
        .reduce((sum, session) => sum + (session.payment?.amount || 75), 0);

      const weeklyEarnings = completedSessions
        .filter(s => new Date(s.scheduledAt) >= startOfWeek)
        .reduce((sum, session) => sum + (session.payment?.amount || 75), 0);

      // Get reviews for average rating
      const reviews = await db.collection('reviews').find({ mentorId: userId }).toArray();
      const averageRating = reviews.length > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
        : 0;

      // Calculate top students (most sessions)
      const studentSessionCounts = allSessions.reduce((acc, session) => {
        const studentId = session.studentId.toString();
        acc[studentId] = (acc[studentId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topStudents = students
        .map(student => ({
          id: student._id.toString(),
          name: student.name,
          email: student.email,
          avatar: student.name.split(' ').map((n: string) => n[0]).join(''),
          totalSessions: studentSessionCounts[student._id.toString()] || 0,
          lastSession: allSessions.find(s => s.studentId.toString() === student._id.toString())?.scheduledAt || null
        }))
        .sort((a, b) => b.totalSessions - a.totalSessions)
        .slice(0, 5);

      // Format upcoming sessions with student data
      const upcomingSessionsWithStudents = await Promise.all(
        upcomingSessions.map(async (session) => {
          const student = students.find(s => s._id.toString() === session.studentId.toString());
          return {
            id: session._id.toString(),
            student: {
              name: student?.name || 'Unknown Student',
              avatar: student?.name.split(' ').map((n: string) => n[0]).join('') || 'U'
            },
            subject: session.subject,
            scheduledAt: session.scheduledAt.toISOString(),
            duration: session.duration || 60,
            status: session.status,
            type: session.type || 'video',
            rate: session.payment?.amount || 75
          };
        })
      );

      // Format recent sessions with student data
      const recentSessionsWithStudents = await Promise.all(
        recentSessions.map(async (session) => {
          const student = students.find(s => s._id.toString() === session.studentId.toString());
          return {
            id: session._id.toString(),
            student: {
              name: student?.name || 'Unknown Student',
              avatar: student?.name.split(' ').map((n: string) => n[0]).join('') || 'U'
            },
            subject: session.subject,
            scheduledAt: session.scheduledAt.toISOString(),
            duration: session.duration || 60,
            status: session.status,
            type: session.type || 'video',
            rate: session.payment?.amount || 75
          };
        })
      );

      const stats = {
        totalStudents: studentIds.length,
        totalSessions: allSessions.length,
        completedSessions: completedSessions.length,
        upcomingSessions: upcomingSessions.length,
        totalEarnings,
        monthlyEarnings,
        weeklyEarnings,
        averageRating: Number(averageRating.toFixed(1)),
        completionRate: allSessions.length > 0 
          ? Math.round((completedSessions.length / allSessions.length) * 100) 
          : 0,
        responseTime: mentorProfile?.responseTime || '< 2h',
        weeklyHours: mentorProfile?.weeklyHours || 25
      };

      return NextResponse.json({
        success: true,
        data: {
          stats,
          upcomingSessions: upcomingSessionsWithStudents,
          recentSessions: recentSessionsWithStudents,
          topStudents,
          insights: {
            weeklySessionsCompleted: completedSessions.filter(s => 
              new Date(s.scheduledAt) >= startOfWeek
            ).length,
            earningsGrowth: calculateGrowthPercentage(weeklyEarnings, completedSessions, startOfWeek),
            peakHours: calculatePeakHours(allSessions),
            totalReviews: reviews.length,
            pendingReplies: reviews.filter(r => !r.reply).length
          }
        }
      });

    } else {
      // Student dashboard - simplified version
      const allSessions = await db.collection('sessions').find({ 
        studentId: userId 
      }).sort({ scheduledAt: -1 }).toArray();

      const completedSessions = allSessions.filter(s => s.status === 'completed');
      const upcomingSessions = allSessions.filter(s => 
        s.status === 'scheduled' && new Date(s.scheduledAt) > now
      ).slice(0, 5);

      const totalSpent = completedSessions.reduce((sum, session) => 
        sum + (session.payment?.amount || 75), 0
      );

      const monthlySpent = completedSessions
        .filter(s => new Date(s.scheduledAt) >= startOfMonth)
        .reduce((sum, session) => sum + (session.payment?.amount || 75), 0);

      // Get unique mentors
      const mentorIds = [...new Set(allSessions.map(s => s.mentorId.toString()))];
      const mentors = await db.collection('users').find({
        _id: { $in: mentorIds.map(id => new ObjectId(id)) },
        role: 'mentor'
      }).toArray();

      const stats = {
        totalSessions: allSessions.length,
        completedSessions: completedSessions.length,
        upcomingSessions: upcomingSessions.length,
        totalSpent,
        monthlySpent,
        favoriteMentors: mentorIds.length,
        completionRate: allSessions.length > 0 
          ? Math.round((completedSessions.length / allSessions.length) * 100) 
          : 0
      };

      return NextResponse.json({
        success: true,
        data: {
          stats,
          upcomingSessions: upcomingSessions.map(session => ({
            id: session._id.toString(),
            mentor: {
              name: mentors.find(m => m._id.toString() === session.mentorId.toString())?.name || 'Unknown Mentor',
              avatar: 'M'
            },
            subject: session.subject,
            scheduledAt: session.scheduledAt.toISOString(),
            duration: session.duration || 60,
            status: session.status,
            type: session.type || 'video',
            rate: session.payment?.amount || 75
          })),
          recentSessions: completedSessions.slice(0, 5).map(session => ({
            id: session._id.toString(),
            mentor: {
              name: mentors.find(m => m._id.toString() === session.mentorId.toString())?.name || 'Unknown Mentor',
              avatar: 'M'
            },
            subject: session.subject,
            scheduledAt: session.scheduledAt.toISOString(),
            duration: session.duration || 60,
            status: session.status,
            type: session.type || 'video',
            rate: session.payment?.amount || 75
          }))
        }
      });
    }

  } catch (error) {
    console.error('Get dashboard data error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});

// Helper functions
function calculateGrowthPercentage(currentWeekEarnings: number, allCompletedSessions: any[], startOfWeek: Date): number {
  const previousWeekStart = new Date(startOfWeek.getTime() - 7 * 24 * 60 * 60 * 1000);
  const previousWeekEarnings = allCompletedSessions
    .filter(s => {
      const sessionDate = new Date(s.scheduledAt);
      return sessionDate >= previousWeekStart && sessionDate < startOfWeek;
    })
    .reduce((sum, session) => sum + (session.payment?.amount || 75), 0);

  if (previousWeekEarnings === 0) return currentWeekEarnings > 0 ? 100 : 0;
  return Math.round(((currentWeekEarnings - previousWeekEarnings) / previousWeekEarnings) * 100);
}

function calculatePeakHours(sessions: any[]): string {
  const hourCounts = sessions.reduce((acc, session) => {
    const hour = new Date(session.scheduledAt).getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const peakHour = Object.entries(hourCounts)
    .sort(([,a], [,b]) => ((b as number) - (a as number)))[0];

  if (!peakHour) return 'No data';
  
  const hour = parseInt(peakHour[0]);
  const nextHour = hour + 1;
  const formatHour = (h: number) => h > 12 ? `${h - 12} PM` : h === 12 ? '12 PM' : h === 0 ? '12 AM' : `${h} AM`;
  
  return `${formatHour(hour)}-${formatHour(nextHour)}`;
}