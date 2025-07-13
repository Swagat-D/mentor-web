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
      const [sessionsData, user] = await Promise.all([
        db.collection('sessions').find({ mentorId: userId }).toArray(),
        db.collection('users').findOne({ _id: userId })
      ]);

      const completedSessions = sessionsData.filter(s => s.status === 'completed');
      const uniqueStudents = [...new Set(sessionsData.map(s => s.studentId.toString()))];

      const totalEarnings = completedSessions.reduce((sum, session) => {
        return sum + (session.payment?.amount || 75); // Default to $75 if no payment info
      }, 0);

      const stats = {
        totalSessions: sessionsData.length,
        totalStudents: uniqueStudents.length,
        averageRating: 4.8, // Mock data - calculate from actual reviews
        totalEarnings,
        joinDate: new Date(user?.createdAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long' 
        }),
        lastActive: 'Active now', // Mock data - calculate from last login
      };

      return NextResponse.json({
        success: true,
        data: stats
      });

    } else {
      // Student stats
      const [sessionsData, user] = await Promise.all([
        db.collection('sessions').find({ studentId: userId }).toArray(),
        db.collection('users').findOne({ _id: userId })
      ]);

      const completedSessions = sessionsData.filter(s => s.status === 'completed');
      const totalSpent = completedSessions.reduce((sum, session) => {
        return sum + (session.payment?.amount || 75);
      }, 0);

      const stats = {
        totalSessions: sessionsData.length,
        completedSessions: completedSessions.length,
        totalSpent,
        joinDate: new Date(user?.createdAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long' 
        }),
        lastActive: 'Active now',
      };

      return NextResponse.json({
        success: true,
        data: stats
      });
    }

  } catch (error) {
    console.error('Get profile stats error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});