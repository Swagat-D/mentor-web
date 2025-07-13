import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { NotificationRepository } from '@/lib/database/repositories/NotificationRepository';

export const PATCH = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const notificationRepository = new NotificationRepository();
    const markedCount = await notificationRepository.markAllAsRead(req.user!.userId);

    return NextResponse.json({
      success: true,
      message: `${markedCount} notifications marked as read`,
      data: { markedCount }
    });

  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});