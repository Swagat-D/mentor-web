/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { connectToDatabase } from '@/lib/database/connection';
import { z } from 'zod';
import { ObjectId } from 'mongodb';

const availabilitySchema = z.object({
  weeklySchedule: z.array(z.object({
    day: z.string(),
    available: z.boolean(),
    startTime: z.string(),
    endTime: z.string(),
  })),
  pricing: z.object({
    hourlyRate: z.string().transform(Number),
    packageDiscounts: z.boolean(),
    groupSessions: z.boolean(),
    groupRate: z.string().optional().transform(val => val ? Number(val) : undefined),
    trialSession: z.boolean(),
    trialRate: z.string().optional().transform(val => val ? Number(val) : undefined),
  }),
  preferences: z.object({
    sessionLength: z.string(),
    advanceBooking: z.string(),
    maxStudentsPerWeek: z.string().transform(Number),
    preferredSessionType: z.string(),
    cancellationPolicy: z.string(),
  }),
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

    // Transform weekly schedule to proper format
    const weeklySchedule: any = {};
    validatedData.weeklySchedule.forEach(slot => {
      const dayKey = slot.day.toLowerCase();
      if (slot.available) {
        weeklySchedule[dayKey] = [{
          startTime: slot.startTime,
          endTime: slot.endTime,
          isAvailable: true,
        }];
      } else {
        weeklySchedule[dayKey] = [];
      }
    });

    // Update mentor profile with availability and pricing
    const result = await mentorProfilesCollection.updateOne(
      { userId: new ObjectId(req.user!.userId) },
      {
        $set: {
          weeklySchedule,
          pricing: {
            hourlyRate: validatedData.pricing.hourlyRate,
            currency: 'USD',
            trialSessionEnabled: validatedData.pricing.trialSession,
            trialSessionRate: validatedData.pricing.trialRate,
            groupSessionEnabled: validatedData.pricing.groupSessions,
            groupSessionRate: validatedData.pricing.groupRate,
            packageDiscounts: validatedData.pricing.packageDiscounts,
          },
          preferences: validatedData.preferences,
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
      message: 'Availability and pricing saved successfully',
      data: { profileStep: 'availability', nextStep: 'verification' }
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