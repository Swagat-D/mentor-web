/* eslint-disable @typescript-eslint/no-explicit-any */
import { ObjectId } from 'mongodb';

export interface Notification {
  _id?: ObjectId;
  userId: ObjectId;
  title: string;
  message: string;
  type: 'session' | 'payment' | 'reminder' | 'review' | 'system' | 'message';
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  
  // Related entities
  relatedEntityId?: ObjectId; // Session ID, Payment ID, etc.
  relatedEntityType?: 'session' | 'payment' | 'user' | 'review';
  
  // Related user (for notifications about other users)
  relatedUser?: {
    id: ObjectId;
    name: string;
    email: string;
    avatar?: string;
  };
  
  // Action URL for deep linking
  actionUrl?: string;
  
  // Metadata
  metadata?: Record<string, any>;
  
  // Timing
  createdAt: Date;
  updatedAt: Date;
  readAt?: Date;
  expiresAt?: Date;
}

export interface NotificationPreferences {
  _id?: ObjectId;
  userId: ObjectId;
  
  // Email notifications
  emailNotifications: boolean;
  emailTypes: {
    sessions: boolean;
    payments: boolean;
    reminders: boolean;
    reviews: boolean;
    system: boolean;
    messages: boolean;
  };
  
  // SMS notifications
  smsNotifications: boolean;
  smsTypes: {
    sessions: boolean;
    reminders: boolean;
    urgent: boolean;
  };
  
  // Push notifications
  pushNotifications: boolean;
  pushTypes: {
    sessions: boolean;
    payments: boolean;
    reminders: boolean;
    reviews: boolean;
    messages: boolean;
  };
  
  // Notification timing
  quietHours: {
    enabled: boolean;
    startTime: string; // "22:00"
    endTime: string;   // "08:00"
    timezone: string;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationTemplate {
  _id?: ObjectId;
  type: string;
  title: string;
  message: string;
  variables: string[]; // Variables that can be replaced in title/message
  priority: 'low' | 'medium' | 'high';
  channels: ('email' | 'sms' | 'push' | 'in_app')[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}