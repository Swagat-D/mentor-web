import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { NotificationRepository } from '@/lib/database/repositories/NotificationRepository';

export const PATCH = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const url = new URL(req.url);
    const notificationId = url.pathname.split('/').slice(-2, -1)[0]; // Get ID from path

    const notificationRepository = new NotificationRepository();
    
    // First verify the notification belongs to the user
    const notification = await notificationRepository.findById(notificationId);
    if (!notification) {
      return NextResponse.json(
        { success: false, message: 'Notification not found' },
        { status: 404 }
      );
    }

    if (notification.userId.toString() !== req.user!.userId) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    const success = await notificationRepository.markAsRead(notificationId);
    
    if (!success) {
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