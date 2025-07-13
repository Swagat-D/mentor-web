/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { connectToDatabase } from '@/lib/database/connection';
import { ObjectId } from 'mongodb';

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type') || undefined;
    const search = searchParams.get('search') || undefined;
    const skip = (page - 1) * limit;

    const { db } = await connectToDatabase();
    const userId = new ObjectId(req.user!.userId);

    console.log('Fetching notifications for user:', userId.toString());

    // Build filter
    const filter: any = { userId };

    if (type && type !== 'all') {
      filter.type = type;
    }

    if (unreadOnly) {
      filter.read = false;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    console.log('Filter:', JSON.stringify(filter, null, 2));

    // Get notifications with pagination
    const [notifications, total, unreadCount] = await Promise.all([
      db.collection('notifications')
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection('notifications').countDocuments(filter),
      db.collection('notifications').countDocuments({ userId, read: false })
    ]);

    console.log('Found notifications:', notifications.length);
    console.log('Total count:', total);
    console.log('Unread count:', unreadCount);

    // Convert ObjectIds to strings for JSON serialization
    const serializedNotifications = notifications.map(notification => ({
      ...notification,
      _id: notification._id.toString(),
      userId: notification.userId.toString(),
      relatedEntityId: notification.relatedEntityId?.toString(),
      'relatedUser.id': notification.relatedUser?.id?.toString(),
    }));

    return NextResponse.json({
      success: true,
      data: serializedNotifications,
      pagination: {
        page,
        limit,
        total,
        unread: unreadCount,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error', 
        error: typeof error === 'object' && error !== null && 'message' in error ? (error as { message: string }).message : String(error)
      },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const { title, message, type, priority, actionUrl, metadata } = body;

    const { db } = await connectToDatabase();
    const userId = new ObjectId(req.user!.userId);

    const notification = {
      userId,
      title,
      message,
      type,
      priority: priority || 'medium',
      read: false,
      actionUrl,
      metadata,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('notifications').insertOne(notification);

    return NextResponse.json({
      success: true,
      data: {
        ...notification,
        _id: result.insertedId.toString(),
        userId: userId.toString()
      },
      message: 'Notification created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Create notification error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});