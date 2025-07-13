/* eslint-disable @typescript-eslint/no-explicit-any */
import { ObjectId } from 'mongodb';
import { NotificationRepository, NotificationPreferencesRepository } from '@/lib/database/repositories/NotificationRepository';
import { EmailService } from './email.service';

export interface NotificationData {
  userId: ObjectId;
  title: string;
  message: string;
  type: 'session' | 'payment' | 'reminder' | 'review' | 'system' | 'message';
  priority?: 'low' | 'medium' | 'high';
  relatedEntityId?: ObjectId;
  relatedEntityType?: string;
  relatedUser?: {
    id: ObjectId;
    name: string;
    email: string;
    avatar?: string;
  };
  actionUrl?: string;
  metadata?: Record<string, any>;
  channels?: ('email' | 'sms' | 'push' | 'in_app')[];
}

export class NotificationService {
  private static notificationRepo = new NotificationRepository();
  private static preferencesRepo = new NotificationPreferencesRepository();

  /**
   * Send a notification through multiple channels
   */
  static async sendNotification(data: NotificationData): Promise<void> {
    try {
      // Create in-app notification
      await this.notificationRepo.createNotification({
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        priority: data.priority || 'medium',
        relatedEntityId: data.relatedEntityId,
        relatedEntityType: data.relatedEntityType,
        relatedUser: data.relatedUser,
        actionUrl: data.actionUrl,
        metadata: data.metadata,
      });

      // Get user preferences
      const preferences = await this.preferencesRepo.getOrCreateDefaultPreferences(data.userId);
      
      // Send through other channels based on preferences and request
      const channels = data.channels || ['in_app'];
      
      if (channels.includes('email') && preferences.emailNotifications) {
        await this.sendEmailNotification(data, preferences);
      }

      if (channels.includes('sms') && preferences.smsNotifications) {
        await this.sendSMSNotification(data, preferences);
      }

      if (channels.includes('push') && preferences.pushNotifications) {
        await this.sendPushNotification(data, preferences);
      }

    } catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  }

  /**
   * Send email notification
   */
  private static async sendEmailNotification(
    data: NotificationData, 
    preferences: any
  ): Promise<void> {
    try {
      // Check if this type of email is enabled
      const emailTypeKey = data.type as keyof typeof preferences.emailTypes;
      if (!preferences.emailTypes[emailTypeKey]) {
        return;
      }

      // Get user email (you'll need to fetch this from user collection)
      // For now, using a placeholder
      const userEmail = data.relatedUser?.email || 'user@example.com';
      
      await EmailService.sendNotificationEmail(
        userEmail,
        data.title,
        data.message,
        data.actionUrl
      );
    } catch (error) {
      console.error('Failed to send email notification:', error);
    }
  }

  /**
   * Send SMS notification
   */
  private static async sendSMSNotification(
    data: NotificationData, 
    preferences: any
  ): Promise<void> {
    try {
      // Check if this type of SMS is enabled
      const smsTypeKey = data.type === 'reminder' ? 'reminders' : 
                        data.type === 'session' ? 'sessions' : 
                        data.priority === 'high' ? 'urgent' : null;
      
      if (!smsTypeKey || !preferences.smsTypes[smsTypeKey]) {
        return;
      }

      // TODO: Implement SMS sending logic (Twilio, etc.)
      console.log('SMS notification would be sent:', data.title);
    } catch (error) {
      console.error('Failed to send SMS notification:', error);
    }
  }

  /**
   * Send push notification
   */
  private static async sendPushNotification(
    data: NotificationData, 
    preferences: any
  ): Promise<void> {
    try {
      // Check if this type of push is enabled
      const pushTypeKey = data.type as keyof typeof preferences.pushTypes;
      if (!preferences.pushTypes[pushTypeKey]) {
        return;
      }

      // TODO: Implement push notification logic (Firebase, etc.)
      console.log('Push notification would be sent:', data.title);
    } catch (error) {
      console.error('Failed to send push notification:', error);
    }
  }

  /**
   * Quick notification creators for common scenarios
   */
  static async notifySessionBooked(
    mentorId: ObjectId, 
    studentName: string, 
    sessionTime: Date
  ): Promise<void> {
    await this.sendNotification({
      userId: mentorId,
      title: 'New Session Booked',
      message: `${studentName} has booked a session for ${sessionTime.toLocaleDateString()}`,
      type: 'session',
      priority: 'medium',
      actionUrl: '/dashboard/sessions',
      channels: ['in_app', 'email']
    });
  }

  static async notifyPaymentReceived(
    mentorId: ObjectId, 
    amount: number, 
    studentName: string
  ): Promise<void> {
    await this.sendNotification({
      userId: mentorId,
      title: 'Payment Received',
      message: `You received $${amount} from ${studentName}`,
      type: 'payment',
      priority: 'medium',
      actionUrl: '/dashboard/earnings',
      channels: ['in_app', 'email']
    });
  }

  static async notifySessionReminder(
    userId: ObjectId, 
    sessionDetails: string, 
    timeUntil: string
  ): Promise<void> {
    await this.sendNotification({
      userId,
      title: 'Session Reminder',
      message: `Your session "${sessionDetails}" starts in ${timeUntil}`,
      type: 'reminder',
      priority: 'high',
      actionUrl: '/dashboard/calendar',
      channels: ['in_app', 'email', 'push']
    });
  }

  static async notifyNewReview(
    mentorId: ObjectId, 
    rating: number, 
    studentName: string
  ): Promise<void> {
    await this.sendNotification({
      userId: mentorId,
      title: 'New Review Received',
      message: `${studentName} left you a ${rating}-star review`,
      type: 'review',
      priority: 'low',
      actionUrl: '/dashboard/reviews',
      channels: ['in_app', 'email']
    });
  }

  /**
   * Utility methods
   */
  static async getUnreadCount(userId: ObjectId): Promise<number> {
    return this.notificationRepo.getUnreadCount(userId);
  }

  static async markAsRead(notificationId: ObjectId): Promise<boolean> {
    return this.notificationRepo.markAsRead(notificationId);
  }

  static async markAllAsRead(userId: ObjectId): Promise<number> {
    return this.notificationRepo.markAllAsRead(userId);
  }

  static async cleanupExpiredNotifications(): Promise<number> {
    return this.notificationRepo.deleteExpired();
  }
}