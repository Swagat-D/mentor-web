/* eslint-disable @typescript-eslint/no-unused-vars */
// app/api/analytics/route.ts
import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { connectToDatabase } from '@/lib/database/connection';
import { ObjectId } from 'mongodb';

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    if (req.user!.role !== 'mentor') {
      return NextResponse.json(
        { success: false, message: 'Only mentors can access analytics' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'month';

    const { db } = await connectToDatabase();
    const mentorId = new ObjectId(req.user!.userId);
    const now = new Date();

    // Calculate date ranges
    let startDate: Date;
    const endDate = new Date();
    let prevStartDate: Date;
    let prevEndDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        prevStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        prevEndDate = new Date(startDate.getTime() - 1);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        prevEndDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'quarter':
        const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterMonth, 1);
        prevStartDate = new Date(now.getFullYear(), quarterMonth - 3, 1);
        prevEndDate = new Date(now.getFullYear(), quarterMonth, 0);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        prevStartDate = new Date(now.getFullYear() - 1, 0, 1);
        prevEndDate = new Date(now.getFullYear() - 1, 11, 31);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        prevEndDate = new Date(now.getFullYear(), now.getMonth(), 0);
    }

    // Get all sessions for current and previous periods
    const [currentSessions, previousSessions, allSessions, reviews] = await Promise.all([
      db.collection('sessions').find({
        mentorId,
        scheduledAt: { $gte: startDate, $lte: endDate }
      }).toArray(),
      db.collection('sessions').find({
        mentorId,
        scheduledAt: { $gte: prevStartDate, $lte: prevEndDate }
      }).toArray(),
      db.collection('sessions').find({ mentorId }).toArray(),
      db.collection('reviews').find({ mentorId }).toArray()
    ]);

    // Calculate current period stats
    const completedSessions = currentSessions.filter(s => s.status === 'completed');
    const uniqueStudents = [...new Set(currentSessions.map(s => s.studentId.toString()))].length;
    const totalEarnings = completedSessions.reduce((sum, s) => sum + (s.payment?.amount || 75), 0);
    const avgPerSession = completedSessions.length > 0 ? totalEarnings / completedSessions.length : 0;

    // Calculate previous period stats for comparison
    const prevCompletedSessions = previousSessions.filter(s => s.status === 'completed');
    const prevUniqueStudents = [...new Set(previousSessions.map(s => s.studentId.toString()))].length;
    const prevTotalEarnings = prevCompletedSessions.reduce((sum, s) => sum + (s.payment?.amount || 75), 0);

    // Calculate growth percentages
    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    // Calculate average rating
    const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

    // Calculate response time (mock for now - you can implement actual calculation)
    const responseTime = 1.5; // hours
    const prevResponseTime = 1.8; // hours

    // Calculate completion rate
    const completionRate = currentSessions.length > 0 ? (completedSessions.length / currentSessions.length) * 100 : 0;
    const prevCompletionRate = previousSessions.length > 0 ? (prevCompletedSessions.length / previousSessions.length) * 100 : 0;

    // Overview stats with trends
    const overviewStats = {
      sessions: {
        value: completedSessions.length,
        change: calculateGrowth(completedSessions.length, prevCompletedSessions.length),
        trend: completedSessions.length >= prevCompletedSessions.length ? 'up' : 'down'
      },
      students: {
        value: uniqueStudents,
        change: calculateGrowth(uniqueStudents, prevUniqueStudents),
        trend: uniqueStudents >= prevUniqueStudents ? 'up' : 'down'
      },
      avgRating: {
        value: Number(avgRating.toFixed(1)),
        change: 2.1, // Mock - implement actual calculation if needed
        trend: 'up'
      },
      earnings: {
        value: totalEarnings,
        change: calculateGrowth(totalEarnings, prevTotalEarnings),
        trend: totalEarnings >= prevTotalEarnings ? 'up' : 'down'
      },
      completionRate: {
        value: Math.round(completionRate),
        change: calculateGrowth(completionRate, prevCompletionRate),
        trend: completionRate >= prevCompletionRate ? 'up' : 'down'
      },
      responseTime: {
        value: responseTime,
        change: calculateGrowth(prevResponseTime - responseTime, 0), // Improvement is negative change
        trend: responseTime <= prevResponseTime ? 'up' : 'down'
      }
    };

    // Get monthly performance data for the last 12 months
    const monthlyData = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthSessions = allSessions.filter(s => {
        const sessionDate = new Date(s.scheduledAt);
        return sessionDate >= monthStart && sessionDate <= monthEnd && s.status === 'completed';
      });

      const monthStudents = [...new Set(monthSessions.map(s => s.studentId.toString()))].length;
      const monthEarnings = monthSessions.reduce((sum, s) => sum + (s.payment?.amount || 75), 0);
      const monthRating = monthSessions.length > 0 ? 4.8 : 0; // Mock rating per month

      monthlyData.push({
        period: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        sessions: monthSessions.length,
        students: monthStudents,
        earnings: monthEarnings,
        avgRating: monthRating
      });
    }

    // Subject breakdown
    const subjectStats = currentSessions.reduce((acc, session) => {
      const subject = session.subject || 'General';
      if (!acc[subject]) {
        acc[subject] = { sessions: 0, earnings: 0 };
      }
      if (session.status === 'completed') {
        acc[subject].sessions += 1;
        acc[subject].earnings += session.payment?.amount || 75;
      }
      return acc;
    }, {} as Record<string, { sessions: number; earnings: number }>);

    const totalSessionsForPercentage = Object.values(subjectStats).reduce((sum, s) => sum + s.sessions, 0);
    
    const subjectBreakdown = Object.entries(subjectStats)
      .map(([subject, data]) => ({
        subject,
        sessions: data.sessions,
        percentage: totalSessionsForPercentage > 0 ? (data.sessions / totalSessionsForPercentage) * 100 : 0,
        earnings: data.earnings
      }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 5);

    // Student performance
    const studentStats = currentSessions.reduce((acc, session) => {
      const studentId = session.studentId.toString();
      if (!acc[studentId]) {
        acc[studentId] = {
          sessions: 0,
          completion: 0,
          totalSessions: 0
        };
      }
      acc[studentId].totalSessions += 1;
      if (session.status === 'completed') {
        acc[studentId].sessions += 1;
        acc[studentId].completion += 1;
      }
      return acc;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }, {} as Record<string, any>);

    // Get student names
    const studentIds = Object.keys(studentStats).map(id => new ObjectId(id));
    const students = await db.collection('users').find({
      _id: { $in: studentIds }
    }).toArray();

    const studentPerformance = students.map(student => {
      const stats = studentStats[student._id.toString()];
      const completionRate = stats.totalSessions > 0 ? (stats.completion / stats.totalSessions) * 100 : 0;
      
      return {
        name: student.name,
        sessions: stats.sessions,
        avgRating: 4.8, // Mock - calculate from actual reviews
        completion: Math.round(completionRate),
        growth: 15 // Mock - calculate actual growth
      };
    }).slice(0, 5);

    // Time slot analysis
    const hourStats = currentSessions.reduce((acc, session) => {
      const hour = new Date(session.scheduledAt).getHours();
      if (!acc[hour]) {
        acc[hour] = { sessions: 0, booked: 0 };
      }
      acc[hour].sessions += 1;
      if (session.status === 'completed') {
        acc[hour].booked += 1;
      }
      return acc;
    }, {} as Record<number, { sessions: number; booked: number }>);

    const timeSlotAnalysis = Object.entries(hourStats)
      .map(([hour, data]) => {
        const h = parseInt(hour);
        const timeStr = h === 0 ? '12:00 AM' : h === 12 ? '12:00 PM' : h > 12 ? `${h - 12}:00 PM` : `${h}:00 AM`;
        const bookingRate = data.sessions > 0 ? (data.booked / data.sessions) * 100 : 0;
        
        return {
          time: timeStr,
          sessions: data.sessions,
          bookingRate: Math.round(bookingRate)
        };
      })
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 6);

    return NextResponse.json({
      success: true,
      data: {
        overviewStats,
        monthlyData,
        subjectBreakdown,
        studentPerformance,
        timeSlotAnalysis
      }
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});

// Export analytics data
export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    if (req.user!.role !== 'mentor') {
      return NextResponse.json(
        { success: false, message: 'Only mentors can export analytics' },
        { status: 403 }
      );
    }

    const { period, format } = await req.json();
    const { db } = await connectToDatabase();
    const mentorId = new ObjectId(req.user!.userId);

    // Get all completed sessions
    const sessions = await db.collection('sessions').find({
      mentorId,
      status: 'completed'
    }).toArray();

    const exportData = await Promise.all(sessions.map(async (session) => {
      const student = await db.collection('users').findOne({ _id: session.studentId });
      return {
        Date: new Date(session.scheduledAt).toLocaleDateString(),
        Student: student?.name || 'Unknown',
        Subject: session.subject,
        Duration: session.duration || 60,
        Amount: session.payment?.amount || 75,
        Status: session.status
      };
    }));

    if (format === 'json') {
      return NextResponse.json({
        success: true,
        data: exportData,
        filename: `analytics-${period}-${new Date().toISOString().split('T')[0]}.json`
      });
    }

    // For CSV format
    const csvHeaders = Object.keys(exportData[0] || {}).join(',');
    const csvRows = exportData.map(row => Object.values(row).join(','));
    const csvContent = [csvHeaders, ...csvRows].join('\n');

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=analytics-${period}-${new Date().toISOString().split('T')[0]}.csv`
      }
    });

  } catch (error) {
    console.error('Export analytics error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});