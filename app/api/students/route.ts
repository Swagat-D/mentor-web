/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/students/route.ts
import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { connectToDatabase } from '@/lib/database/connection';
import { ObjectId } from 'mongodb';

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    if (req.user!.role !== 'mentor') {
      return NextResponse.json(
        { success: false, message: 'Only mentors can access this endpoint' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'all';
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const { db } = await connectToDatabase();
    const mentorId = new ObjectId(req.user!.userId);

    let students;
    let totalCount = 0;

    if (filter === 'my-students') {
      // Get students who have had sessions with this mentor
      const sessionsWithStudents = await db.collection('sessions')
        .aggregate([
          { $match: { mentorId } },
          {
            $group: {
              _id: '$studentId',
              totalSessions: { $sum: 1 },
              completedSessions: {
                $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
              },
              lastSession: { $max: '$scheduledAt' },
              totalEarnings: {
                $sum: { $ifNull: ['$payment.amount', 75] }
              },
              subjects: { $addToSet: '$subject' }
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: '_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          { $unwind: '$user' },
          {
            $match: {
              'user.role': 'mentee',
              'user.isActive': true,
              ...(search && {
                $or: [
                  { 'user.name': { $regex: search, $options: 'i' } },
                  { 'user.email': { $regex: search, $options: 'i' } }
                ]
              })
            }
          },
          {
            $project: {
              _id: '$user._id',
              email: '$user.email',
              name: '$user.name',
              role: '$user.role',
              avatar: '$user.avatar',
              phone: '$user.phone',
              gender: '$user.gender',
              ageRange: '$user.ageRange',
              studyLevel: '$user.studyLevel',
              bio: '$user.bio',
              location: '$user.location',
              timezone: '$user.timezone',
              goals: '$user.goals',
              isEmailVerified: '$user.isEmailVerified',
              isActive: '$user.isActive',
              isOnboarded: '$user.isOnboarded',
              onboardingStatus: '$user.onboardingStatus',
              lastLoginAt: '$user.lastLoginAt',
              stats: '$user.stats',
              createdAt: '$user.createdAt',
              updatedAt: '$user.updatedAt',
              isTestGiven: '$user.isTestGiven',
              // Session-related data
              subjects: '$subjects',
              totalSessions: '$totalSessions',
              completedSessions: '$completedSessions',
              totalEarnings: '$totalEarnings',
              averageRating: { $ifNull: ['$user.stats.averageRating', 0] },
              lastSession: '$lastSession',
              status: {
                $cond: {
                  if: { $gt: ['$totalSessions', 5] },
                  then: 'active',
                  else: 'new'
                }
              }
            }
          },
          { $sort: { lastSession: -1 } },
          { $skip: skip },
          { $limit: limit }
        ]).toArray();

      // Get total count for pagination
      const countPipeline = await db.collection('sessions')
        .aggregate([
          { $match: { mentorId } },
          { $group: { _id: '$studentId' } },
          {
            $lookup: {
              from: 'users',
              localField: '_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          { $unwind: '$user' },
          {
            $match: {
              'user.role': 'mentee',
              'user.isActive': true,
              ...(search && {
                $or: [
                  { 'user.name': { $regex: search, $options: 'i' } },
                  { 'user.email': { $regex: search, $options: 'i' } }
                ]
              })
            }
          },
          { $count: 'total' }
        ]).toArray();

      students = sessionsWithStudents;
      totalCount = countPipeline[0]?.total || 0;

    } else {
      // Get all students from users collection
      const query: any = {
        role: 'mentee',
        isActive: true,
        isEmailVerified: true
      };

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { studyLevel: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } }
        ];
      }

      const allStudents = await db.collection('users')
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      totalCount = await db.collection('users').countDocuments(query);

      // Transform to match expected format and add session data
      students = await Promise.all(allStudents.map(async (user) => {
        // Get session data for this student with current mentor
        const sessionData = await db.collection('sessions')
          .aggregate([
            { $match: { mentorId, studentId: user._id } },
            {
              $group: {
                _id: null,
                totalSessions: { $sum: 1 },
                completedSessions: {
                  $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                },
                totalEarnings: {
                  $sum: { $ifNull: ['$payment.amount', 75] }
                },
                subjects: { $addToSet: '$subject' },
                lastSession: { $max: '$scheduledAt' }
              }
            }
          ]).toArray();

        const sessions = sessionData[0] || {
          totalSessions: 0,
          completedSessions: 0,
          totalEarnings: 0,
          subjects: [],
          lastSession: null
        };

        return {
          _id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
          phone: user.phone,
          gender: user.gender,
          ageRange: user.ageRange,
          studyLevel: user.studyLevel,
          bio: user.bio,
          location: user.location,
          timezone: user.timezone,
          goals: user.goals || [],
          isEmailVerified: user.isEmailVerified,
          isActive: user.isActive,
          isOnboarded: user.isOnboarded,
          onboardingStatus: user.onboardingStatus,
          lastLoginAt: user.lastLoginAt,
          stats: user.stats || {
            totalHoursLearned: 0,
            sessionsCompleted: 0,
            mentorsConnected: 0,
            studyStreak: 0,
            completionRate: 0,
            monthlyHours: 0,
            weeklyGoalProgress: 0,
            averageRating: 0
          },
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          isTestGiven: user.isTestGiven,
          // Session-related computed fields
          subjects: sessions.subjects,
          totalSessions: sessions.totalSessions,
          completedSessions: sessions.completedSessions,
          totalEarnings: sessions.totalEarnings,
          averageRating: user.stats?.averageRating || 0,
          lastSession: sessions.lastSession,
          status: sessions.totalSessions > 0 ? 'active' : 'new' as 'active' | 'new' | 'inactive',
          nextSession: null 
        };
      }));
    }

    // For each student, get upcoming sessions
    for (const student of students) {
      const upcomingSession = await db.collection('sessions')
        .findOne({
          mentorId,
          studentId: student._id,
          status: 'scheduled',
          scheduledAt: { $gt: new Date() }
        }, { sort: { scheduledAt: 1 } });

      if (upcomingSession) {
        student.nextSession = upcomingSession ?  upcomingSession.scheduledAt.toISOString(): null ;
      } else {
        student.nextSession = null;
      }
    }

    // Get filter counts
    const allStudentsCount = await db.collection('users').countDocuments({ 
      role: 'mentee', 
      isActive: true, 
      isEmailVerified: true 
    });

    const myStudentsCount = await db.collection('sessions')
      .distinct('studentId', { mentorId })
      .then(ids => ids.length);

    return NextResponse.json({
      success: true,
      data: students,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      filters: {
        all: allStudentsCount,
        'my-students': myStudentsCount
      }
    });

  } catch (error) {
    console.error('Get students error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});