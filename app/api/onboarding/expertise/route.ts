/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { connectToDatabase } from '@/lib/database/connection';
import { z } from 'zod';
import { ObjectId } from 'mongodb';

const expertiseSchema = z.object({
  subjects: z.array(z.object({
    name: z.string().min(1, 'Subject name is required'),
    level: z.string().min(1, 'Level is required'),
    experience: z.string().min(1, 'Experience is required'),
  })).min(1, 'At least one subject is required'),
  teachingStyles: z.array(z.string()).optional(),
  specializations: z.array(z.string()).min(1, 'At least one teaching style is required'),
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
    const validatedData = expertiseSchema.parse(body);

    const { db } = await connectToDatabase();
    const mentorProfilesCollection = db.collection('mentorProfiles');

    // Update mentor profile with expertise
    const result = await mentorProfilesCollection.updateOne(
      { userId: new ObjectId(req.user!.userId) },
      {
        $set: {
          expertise: validatedData.subjects.map(s => s.name),
          subjects: validatedData.subjects,
          teachingStyles: validatedData.teachingStyles || [],
          specializations: validatedData.specializations,
          profileStep: 'expertise',
          updatedAt: new Date(),
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Profile not found. Please complete the profile step first.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Expertise saved successfully',
      data: { profileStep: 'expertise', nextStep: 'availability' }
    });

  } catch (error: any) {
    console.error('Update mentor expertise error:', error);

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