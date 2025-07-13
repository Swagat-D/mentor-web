/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { connectToDatabase } from '@/lib/database/connection';
import { ObjectId } from 'mongodb';
import { z } from 'zod';

const settingsSchema = z.object({
  theme: z.enum(['light', 'dark']).optional(),
  emailNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
});

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { db } = await connectToDatabase();
    const userId = new ObjectId(req.user!.userId);

    const user = await db.collection('users').findOne({ _id: userId });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const settings = {
      theme: user.theme || 'light',
      emailNotifications: user.emailNotifications ?? true,
      smsNotifications: user.smsNotifications ?? false,
      language: user.language || 'en',
      timezone: user.timezone || 'UTC',
    };

    return NextResponse.json({
      success: true,
      data: settings
    });

  } catch (error) {
    console.error('Get user settings error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const PATCH = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const validatedData = settingsSchema.parse(body);

    const { db } = await connectToDatabase();
    const userId = new ObjectId(req.user!.userId);

    await db.collection('users').updateOne(
      { _id: userId },
      {
        $set: {
          ...validatedData,
          updatedAt: new Date(),
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully'
    });

  } catch (error: any) {
    console.error('Update user settings error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed',
          errors: error.errors.map((e: any) => e.message)
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});