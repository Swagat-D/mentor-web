// Create: app/api/notifications/[id]/route.ts

import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { connectToDatabase } from '@/lib/database/connection';
import { ObjectId } from 'mongodb';

export const DELETE = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const url = new URL(req.url);
    const notificationId = url.pathname.split('/').pop();

    console.log('Attempting to delete notification:', notificationId);

    if (!notificationId || !ObjectId.isValid(notificationId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid notification ID' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const userId = new ObjectId(req.user!.userId);

    console.log('User ID:', userId.toString());

    // First verify the notification exists and belongs to the user
    const notification = await db.collection('notifications').findOne({
      _id: new ObjectId(notificationId),
      userId: userId
    });

    console.log('Found notification:', notification ? 'Yes' : 'No');

    if (!notification) {
      return NextResponse.json(
        { success: false, message: 'Notification not found or access denied' },
        { status: 404 }
      );
    }

    // Delete the notification
    const result = await db.collection('notifications').deleteOne({
      _id: new ObjectId(notificationId),
      userId: userId
    });

    console.log('Delete result:', result);

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Failed to delete notification' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notification deleted successfully',
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Delete notification error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const PATCH = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const url = new URL(req.url);
    const notificationId = url.pathname.split('/').pop();

    if (!notificationId || !ObjectId.isValid(notificationId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid notification ID' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const userId = new ObjectId(req.user!.userId);
    
    // First verify the notification belongs to the user
    const notification = await db.collection('notifications').findOne({
      _id: new ObjectId(notificationId),
      userId: userId
    });

    if (!notification) {
      return NextResponse.json(
        { success: false, message: 'Notification not found or access denied' },
        { status: 404 }
      );
    }

    // Update the notification as read
    const result = await db.collection('notifications').updateOne(
      { _id: new ObjectId(notificationId), userId: userId },
      { 
        $set: { 
          read: true, 
          readAt: new Date(),
          updatedAt: new Date()
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Failed to mark notification as read' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('Mark notification as read error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});