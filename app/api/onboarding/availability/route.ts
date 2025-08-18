/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { connectToDatabase } from '@/lib/database/connection';
import { z } from 'zod';
import { ObjectId } from 'mongodb';

const timeSlotSchema = z.object({
  id: z.string(),
  startTime: z.string(),
  endTime: z.string(),
});

const dayScheduleSchema = z.object({
  isAvailable: z.boolean(),
  timeSlots: z.array(timeSlotSchema),
});

const weeklyScheduleSchema = z.object({
  monday: dayScheduleSchema,
  tuesday: dayScheduleSchema,
  wednesday: dayScheduleSchema,
  thursday: dayScheduleSchema,
  friday: dayScheduleSchema,
  saturday: dayScheduleSchema,
  sunday: dayScheduleSchema,
});

const availabilitySchema = z.object({
  hourlyRateINR: z.number().min(500).max(10000),
  weeklySchedule: weeklyScheduleSchema,
  sessionDurations: z.array(z.number()).default([60]),
  timezone: z.string().default('Asia/Kolkata'),
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

    // Validate that at least one day has availability
    const hasAvailability = Object.values(validatedData.weeklySchedule).some(
      day => day.isAvailable && day.timeSlots.length > 0
    );

    if (!hasAvailability) {
      return NextResponse.json(
        { success: false, message: 'Please set availability for at least one day' },
        { status: 400 }
      );
    }

    // Validate time slots
    for (const [dayName, daySchedule] of Object.entries(validatedData.weeklySchedule)) {
      if (daySchedule.isAvailable) {
        for (const slot of daySchedule.timeSlots) {
          if (slot.startTime >= slot.endTime) {
            return NextResponse.json(
              { success: false, message: `Invalid time slot on ${dayName}: start time must be before end time` },
              { status: 400 }
            );
          }
        }
      }
    }

    const { db } = await connectToDatabase();
    const mentorProfilesCollection = db.collection('mentorProfiles');

    // Update mentor profile with manual scheduling
    const result = await mentorProfilesCollection.updateOne(
      { userId: new ObjectId(req.user!.userId) },
      {
        // Remove old Cal.com fields
        $unset: {
          calComUsername: "",
          calComEventTypes: "",
          calComVerified: "",
          calComLastSync: ""
        },
        // Add new manual scheduling fields
        $set: {
          hourlyRateINR: validatedData.hourlyRateINR,
          weeklySchedule: validatedData.weeklySchedule,
          sessionDurations: validatedData.sessionDurations,
          timezone: validatedData.timezone,
          scheduleType: 'manual', // Indicate this is manual scheduling
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

    // Calculate total available slots for summary
    const totalSlots = Object.values(validatedData.weeklySchedule).reduce(
      (total, day) => total + day.timeSlots.length, 0
    );

    const availableDays = Object.values(validatedData.weeklySchedule).filter(
      day => day.isAvailable && day.timeSlots.length > 0
    ).length;

    return NextResponse.json({
      success: true,
      message: 'Availability schedule saved successfully',
      data: { 
        profileStep: 'availability', 
        nextStep: 'verification',
        scheduleType: 'manual',
        totalSlots,
        availableDays,
        hourlyRate: validatedData.hourlyRateINR
      }
    });

  } catch (error: any) {
    console.error('Update mentor availability error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed',
          errors: error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`)
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