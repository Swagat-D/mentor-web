/* eslint-disable @typescript-eslint/no-explicit-any */
import { Filter, ObjectId } from 'mongodb';
import { BaseRepository } from './BaseRepository';
import { Notification, NotificationPreferences } from '../models/Notification';

export class NotificationRepository extends BaseRepository<Notification> {
  constructor() {
    super('notifications');
  }

  async findByUserId(
    userId: string | ObjectId,
    options?: {
      unreadOnly?: boolean;
      limit?: number;
      skip?: number;
      type?: string;
    }
  ): Promise<{ items: Notification[]; total: number; unread: number }> {
    const objectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    const filter: Filter<Notification> = { userId: objectId };

    if (options?.type) {
      filter.type = options.type as Notification['type'];
    }

    if (options?.unreadOnly) {
      filter.read = false;
    }

    // Get total count and unread count
    const [result, unreadCount] = await Promise.all([
      this.findMany(filter, {
        limit: options?.limit,
        skip: options?.skip,
        sort: { createdAt: -1 }
      }),
      this.collection?.countDocuments({ userId: objectId, read: false }) || 0
    ]);

    return {
      items: result.items,
      total: result.total,
      unread: unreadCount
    };
  }

  async markAsRead(notificationId: string | ObjectId): Promise<boolean> {
    const objectId = typeof notificationId === 'string' ? new ObjectId(notificationId) : notificationId;
    const collection = await this.getCollection();
    
    const result = await collection.updateOne(
      { _id: objectId },
      { 
        $set: { 
          read: true, 
          readAt: new Date(),
          updatedAt: new Date()
        } 
      }
    );

    return result.modifiedCount > 0;
  }

  async markAllAsRead(userId: string | ObjectId): Promise<number> {
    const objectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    const collection = await this.getCollection();
    
    const result = await collection.updateMany(
      { userId: objectId, read: false },
      { 
        $set: { 
          read: true, 
          readAt: new Date(),
          updatedAt: new Date()
        } 
      }
    );

    return result.modifiedCount;
  }

  async createNotification(data: {
    userId: ObjectId;
    title: string;
    message: string;
    type: Notification['type'];
    priority?: Notification['priority'];
    relatedEntityId?: ObjectId;
    relatedEntityType?: string;
    relatedUser?: Notification['relatedUser'];
    actionUrl?: string;
    metadata?: Record<string, any>;
    expiresAt?: Date;
  }): Promise<Notification> {
    return this.create({
      ...data,
      read: false,
      priority: data.priority || 'medium',
    } as Omit<Notification, '_id'>);
  }

  async getUnreadCount(userId: string | ObjectId): Promise<number> {
    const objectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    const collection = await this.getCollection();
    return collection.countDocuments({ userId: objectId, read: false });
  }

  async deleteExpired(): Promise<number> {
    const collection = await this.getCollection();
    const result = await collection.deleteMany({
      expiresAt: { $lt: new Date() }
    });
    return result.deletedCount;
  }
}

export class NotificationPreferencesRepository extends BaseRepository<NotificationPreferences> {
  constructor() {
    super('notificationPreferences');
  }

  async findByUserId(userId: string | ObjectId): Promise<NotificationPreferences | null> {
    const objectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    return this.findOne({ userId: objectId } as Filter<NotificationPreferences>);
  }

  async getOrCreateDefaultPreferences(userId: ObjectId): Promise<NotificationPreferences> {
    let preferences = await this.findByUserId(userId);
    
    if (!preferences) {
      preferences = await this.create({
        userId,
        emailNotifications: true,
        emailTypes: {
          sessions: true,
          payments: true,
          reminders: true,
          reviews: true,
          system: true,
          messages: true,
        },
        smsNotifications: false,
        smsTypes: {
          sessions: false,
          reminders: false,
          urgent: false,
        },
        pushNotifications: true,
        pushTypes: {
          sessions: true,
          payments: true,
          reminders: true,
          reviews: true,
          messages: true,
        },
        quietHours: {
          enabled: false,
          startTime: '22:00',
          endTime: '08:00',
          timezone: 'UTC',
        }
      } as Omit<NotificationPreferences, '_id'>);
    }
    
    return preferences;
  }
}