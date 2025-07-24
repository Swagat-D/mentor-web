// app/api/earnings/route.ts
import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { connectToDatabase } from '@/lib/database/connection';
import { ObjectId } from 'mongodb';

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    if (req.user!.role !== 'mentor') {
      return NextResponse.json(
        { success: false, message: 'Only mentors can access earnings data' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'month';
    const year = parseInt(searchParams.get('year') || '2024');

    const { db } = await connectToDatabase();
    const mentorId = new ObjectId(req.user!.userId);

    // Get current date for period calculations
    const now = new Date();
    let startDate: Date;
    let endDate = new Date();

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterMonth, 1);
        break;
      case 'year':
        startDate = new Date(year, 0, 1);
        endDate = new Date(year, 11, 31);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    // Get sessions with earnings data
    const sessions = await db.collection('sessions').find({
      mentorId,
      status: 'completed',
      scheduledAt: { $gte: startDate, $lte: endDate }
    }).toArray();

    // Calculate overview stats
    const totalEarnings = sessions.reduce((sum, session) => sum + (session.payment?.amount || 75), 0);
    const totalSessions = sessions.length;
    const avgPerSession = totalSessions > 0 ? totalEarnings / totalSessions : 0;

    // Get pending earnings (scheduled but not paid)
    const pendingSessions = await db.collection('sessions').find({
      mentorId,
      status: 'completed',
      'payment.status': { $ne: 'paid' }
    }).toArray();
    const pendingAmount = pendingSessions.reduce((sum, session) => sum + (session.payment?.amount || 75), 0);

    // Calculate previous period for comparison
    let prevStartDate: Date;
    let prevEndDate: Date;
    
    switch (period) {
      case 'week':
        prevStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        prevEndDate = new Date(startDate.getTime() - 1);
        break;
      case 'month':
        prevStartDate = new Date(startDate.getFullYear(), startDate.getMonth() - 1, 1);
        prevEndDate = new Date(startDate.getTime() - 1);
        break;
      case 'quarter':
        prevStartDate = new Date(startDate.getFullYear(), startDate.getMonth() - 3, 1);
        prevEndDate = new Date(startDate.getTime() - 1);
        break;
      case 'year':
        prevStartDate = new Date(year - 1, 0, 1);
        prevEndDate = new Date(year - 1, 11, 31);
        break;
      default:
        prevStartDate = new Date(startDate.getFullYear(), startDate.getMonth() - 1, 1);
        prevEndDate = new Date(startDate.getTime() - 1);
    }

    const prevSessions = await db.collection('sessions').find({
      mentorId,
      status: 'completed',
      scheduledAt: { $gte: prevStartDate, $lte: prevEndDate }
    }).toArray();

    const prevTotalEarnings = prevSessions.reduce((sum, session) => sum + (session.payment?.amount || 75), 0);
    const earningsChange = prevTotalEarnings > 0 ? ((totalEarnings - prevTotalEarnings) / prevTotalEarnings) * 100 : 0;

    // Get monthly data for chart (last 12 months)
    const monthlyData = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthSessions = await db.collection('sessions').find({
        mentorId,
        status: 'completed',
        scheduledAt: { $gte: monthStart, $lte: monthEnd }
      }).toArray();

      const monthEarnings = monthSessions.reduce((sum, session) => sum + (session.payment?.amount || 75), 0);
      
      monthlyData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        earnings: monthEarnings,
        sessions: monthSessions.length,
        growth: i === 11 ? 0 : 0 // Will calculate growth if needed
      });
    }

    // Get recent transactions
    const recentTransactions = await db.collection('sessions').find({
      mentorId,
      status: 'completed'
    })
    .sort({ scheduledAt: -1 })
    .limit(10)
    .toArray();

    const transactions = await Promise.all(recentTransactions.map(async (session) => {
      const student = await db.collection('users').findOne({ _id: session.studentId });
      return {
        id: session._id.toString(),
        type: 'earning',
        description: `Session with ${student?.name || 'Unknown Student'} - ${session.subject}`,
        amount: session.payment?.amount || 75,
        date: session.scheduledAt,
        status: session.payment?.status || 'completed',
        student: student?.name || 'Unknown Student',
        sessionId: session._id.toString()
      };
    }));

    // Get payout history (mock for now - you can create a payouts collection)
    const payoutHistory = [
      {
        id: '1',
        amount: totalEarnings * 0.3,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        status: 'completed',
        method: 'Bank Transfer',
        account: '****1234',
        sessionCount: Math.floor(totalSessions * 0.3)
      }
    ];

    const overview = {
      total: totalEarnings,
      change: earningsChange,
      sessions: totalSessions,
      avgPerSession,
      pending: pendingAmount,
      paid: totalEarnings - pendingAmount
    };

    return NextResponse.json({
      success: true,
      data: {
        overview,
        monthlyData,
        transactions,
        payoutHistory
      }
    });

  } catch (error) {
    console.error('Get earnings error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});

// Export earnings data
export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    if (req.user!.role !== 'mentor') {
      return NextResponse.json(
        { success: false, message: 'Only mentors can export earnings data' },
        { status: 403 }
      );
    }

    const { period, format } = await req.json();
    const { db } = await connectToDatabase();
    const mentorId = new ObjectId(req.user!.userId);

    // Get all completed sessions for the period
    const sessions = await db.collection('sessions').find({
      mentorId,
      status: 'completed'
    }).toArray();

    const exportData = await Promise.all(sessions.map(async (session) => {
      const student = await db.collection('users').findOne({ _id: session.studentId });
      return {
        Date: session.scheduledAt.toLocaleDateString(),
        Student: student?.name || 'Unknown',
        Subject: session.subject,
        Duration: session.duration || 60,
        Amount: session.payment?.amount || 75,
        Status: session.payment?.status || 'completed'
      };
    }));

    if (format === 'json') {
      return NextResponse.json({
        success: true,
        data: exportData,
        filename: `earnings-${period}-${new Date().toISOString().split('T')[0]}.json`
      });
    }

    // For CSV format
    const csvHeaders = Object.keys(exportData[0] || {}).join(',');
    const csvRows = exportData.map(row => Object.values(row).join(','));
    const csvContent = [csvHeaders, ...csvRows].join('\n');

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=earnings-${period}-${new Date().toISOString().split('T')[0]}.csv`
      }
    });

  } catch (error) {
    console.error('Export earnings error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});