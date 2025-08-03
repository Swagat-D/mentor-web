/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { connectToDatabase } from '@/lib/database/connection';
import { z } from 'zod';
import { ObjectId } from 'mongodb';

const availabilitySchema = z.object({
  hourlyRateINR: z.number().min(500).max(10000),
  calComUsername: z.string().min(1),
  calComEventTypes: z.array(z.object({
    id: z.number(),
    title: z.string(),
    slug: z.string(),
    duration: z.number(),
  })),
});

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    if (req.user!.role !== 'mentor') {
      return NextResponse.json(
        { success: false, message: 'Only mentors can access this endpoint' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = availabilitySchema.parse(body);

    const { db } = await connectToDatabase();
    const mentorProfilesCollection = db.collection('mentorProfiles');

    // Update mentor profile with Cal.com integration
    const result = await mentorProfilesCollection.updateOne(
      { userId: new ObjectId(req.user!.userId) },
      {
        // Remove old scheduling fields
        $unset: {
          weeklySchedule: "",
          preferences: "",
          pricing: ""
        },
        // Add new Cal.com integration fields
        $set: {
          hourlyRateINR: validatedData.hourlyRateINR,
          calComUsername: validatedData.calComUsername,
          calComEventTypes: validatedData.calComEventTypes,
          calComVerified: true,
          profileStep: 'availability',
          updatedAt: new Date(),
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Profile not found. Please complete previous steps first.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cal.com integration saved successfully',
      data: { 
        profileStep: 'availability', 
        nextStep: 'verification',
        calComUsername: validatedData.calComUsername,
        eventTypesCount: validatedData.calComEventTypes.length 
      }
    });

  } catch (error: any) {
    console.error('Update mentor availability error:', error);

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