/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/reviews/route.ts
import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { connectToDatabase } from '@/lib/database/connection';
import { ObjectId } from 'mongodb';

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    if (req.user!.role !== 'mentor') {
      return NextResponse.json(
        { success: false, message: 'Only mentors can access reviews data' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter') || 'all';
    const rating = searchParams.get('rating') || 'all';
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const { db } = await connectToDatabase();
    const mentorId = new ObjectId(req.user!.userId);

    // Build match criteria for reviews
    const matchCriteria: any = { mentorId };

    if (rating !== 'all') {
      matchCriteria.rating = parseInt(rating);
    }

    // Get reviews with student information
    const reviewsAggregation: Record<string, any>[] = [
      { $match: matchCriteria },
      {
        $lookup: {
          from: 'users',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $lookup: {
          from: 'sessions',
          localField: 'sessionId',
          foreignField: '_id',
          as: 'session'
        }
      },
      { $unwind: { path: '$session', preserveNullAndEmptyArrays: true } }
    ];

    // Add search filter after lookup (we need to do this after lookup to search student names)
    if (search) {
      reviewsAggregation.push({
        $match: {
          $or: [
            { 'student.name': { $regex: search, $options: 'i' } },
            { content: { $regex: search, $options: 'i' } },
            { title: { $regex: search, $options: 'i' } },
            { 'session.subject': { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    // Add filter for status
    if (filter === 'recent') {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      reviewsAggregation.push({
        $match: { createdAt: { $gte: oneWeekAgo } }
      });
    } else if (filter === 'replied') {
      reviewsAggregation.push({
        $match: { reply: { $exists: true, $ne: null } }
      });
    } else if (filter === 'pending') {
      reviewsAggregation.push({
        $match: { reply: { $exists: false } }
      });
    }

    // Add sorting, skip, and limit
    reviewsAggregation.push(
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    );

    const reviews = await db.collection('reviews').aggregate(reviewsAggregation).toArray();

    // Get total count for pagination
    const countAggregation = [...reviewsAggregation.slice(0, -3), { $count: 'total' }];
    const countResult = await db.collection('reviews').aggregate(countAggregation).toArray();
    const totalReviews = countResult[0]?.total || 0;

    // Format reviews data
    const formattedReviews = await Promise.all(reviews.map(async (review) => {
      // Get session count for this student
      const sessionCount = await db.collection('sessions').countDocuments({
        mentorId,
        studentId: review.studentId
      });

      return {
        id: review._id.toString(),
        student: {
          name: review.student.name,
          email: review.student.email,
          avatar: review.student.name.split(' ').map((n: string) => n[0]).join(''),
          totalSessions: sessionCount
        },
        rating: review.rating,
        subject: review.session?.subject || 'General',
        sessionDate: review.session?.scheduledAt || review.createdAt,
        reviewDate: review.createdAt,
        title: review.title || 'Review',
        content: review.content,
        helpful: review.helpfulVotes || 0,
        replied: !!review.reply,
        reply: review.reply || null,
        replyDate: review.replyDate || null,
        tags: review.tags || []
      };
    }));

    // Calculate overview stats
    const allReviews = await db.collection('reviews').find({ mentorId }).toArray();
    const totalCount = allReviews.length;
    const averageRating = totalCount > 0 
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / totalCount 
      : 0;

    const ratingDistribution = {
      5: allReviews.filter(r => r.rating === 5).length,
      4: allReviews.filter(r => r.rating === 4).length,
      3: allReviews.filter(r => r.rating === 3).length,
      2: allReviews.filter(r => r.rating === 2).length,
      1: allReviews.filter(r => r.rating === 1).length
    };

    const repliedCount = allReviews.filter(r => r.reply).length;
    const replyRate = totalCount > 0 ? (repliedCount / totalCount) * 100 : 0;
    const helpfulVotes = allReviews.reduce((sum, r) => sum + (r.helpfulVotes || 0), 0);

    // Get filter counts
    const recentCount = await db.collection('reviews').countDocuments({
      mentorId,
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    const pendingCount = await db.collection('reviews').countDocuments({
      mentorId,
      reply: { $exists: false }
    });

    const overallStats = {
      averageRating: Number(averageRating.toFixed(1)),
      totalReviews: totalCount,
      ratingDistribution,
      replyRate: Number(replyRate.toFixed(1)),
      helpfulVotes
    };

    const filterCounts = {
      all: totalCount,
      recent: recentCount,
      replied: repliedCount,
      pending: pendingCount
    };

    return NextResponse.json({
      success: true,
      data: {
        reviews: formattedReviews,
        overallStats,
        filterCounts,
        pagination: {
          page,
          limit,
          total: totalReviews,
          pages: Math.ceil(totalReviews / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get reviews error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});

// Reply to a review
export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    if (req.user!.role !== 'mentor') {
      return NextResponse.json(
        { success: false, message: 'Only mentors can reply to reviews' },
        { status: 403 }
      );
    }

    const { reviewId, reply } = await req.json();

    if (!reviewId || !reply) {
      return NextResponse.json(
        { success: false, message: 'Review ID and reply are required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const mentorId = new ObjectId(req.user!.userId);

    // Update the review with reply
    const result = await db.collection('reviews').updateOne(
      { 
        _id: new ObjectId(reviewId),
        mentorId 
      },
      {
        $set: {
          reply,
          replyDate: new Date(),
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Review not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Reply added successfully'
    });

  } catch (error) {
    console.error('Reply to review error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});

// Export reviews
export const PUT = withAuth(async (req: AuthenticatedRequest) => {
  try {
    if (req.user!.role !== 'mentor') {
      return NextResponse.json(
        { success: false, message: 'Only mentors can export reviews' },
        { status: 403 }
      );
    }

    const { format } = await req.json();
    const { db } = await connectToDatabase();
    const mentorId = new ObjectId(req.user!.userId);

    // Get all reviews with student information
    const reviews = await db.collection('reviews').aggregate([
      { $match: { mentorId } },
      {
        $lookup: {
          from: 'users',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $lookup: {
          from: 'sessions',
          localField: 'sessionId',
          foreignField: '_id',
          as: 'session'
        }
      },
      { $unwind: { path: '$session', preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } }
    ]).toArray();

    const exportData = reviews.map(review => ({
      Date: review.createdAt.toLocaleDateString(),
      Student: review.student.name,
      Subject: review.session?.subject || 'General',
      Rating: review.rating,
      Title: review.title || 'Review',
      Content: review.content,
      Replied: review.reply ? 'Yes' : 'No',
      Reply: review.reply || '',
      HelpfulVotes: review.helpfulVotes || 0
    }));

    if (format === 'json') {
      return NextResponse.json({
        success: true,
        data: exportData,
        filename: `reviews-${new Date().toISOString().split('T')[0]}.json`
      });
    }

    // For CSV format
    const csvHeaders = Object.keys(exportData[0] || {}).join(',');
    const csvRows = exportData.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value
      ).join(',')
    );
    const csvContent = [csvHeaders, ...csvRows].join('\n');

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename=reviews-${new Date().toISOString().split('T')[0]}.csv`
      }
    });

  } catch (error) {
    console.error('Export reviews error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});