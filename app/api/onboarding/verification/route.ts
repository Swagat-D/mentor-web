/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { connectToDatabase } from '@/lib/database/connection';
import { z } from 'zod';
import { ObjectId } from 'mongodb';

const resumeSchema = z.object({
  name: z.string(),
  size: z.number(),
  type: z.string(),
  url: z.string(),
}).nullable().optional();

const verificationSchema = z.object({
  resume: resumeSchema,
  additionalInfo: z.object({
    linkedinProfile: z.string().optional(),
    personalWebsite: z.string().optional(),
    additionalNotes: z.string().optional(),
    agreeToTerms: z.boolean(),
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
    const validatedData = verificationSchema.parse(body);

    if (!validatedData.additionalInfo.agreeToTerms) {
      return NextResponse.json(
        { success: false, message: 'You must agree to terms and conditions to proceed' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const mentorProfilesCollection = db.collection('mentorProfiles');
    const mentorVerificationsCollection = db.collection('mentorVerifications');

    // Create verification data
    const verificationData = {
      userId: new ObjectId(req.user!.userId),
      status: 'pending',
      resume: validatedData.resume || null,
      additionalInfo: validatedData.additionalInfo,
      verificationMethod: 'simplified', // Indicate this is the simplified verification
      updatedAt: new Date(),
    };

    // Check if verification record already exists
    const existingVerification = await mentorVerificationsCollection.findOne({ 
      userId: new ObjectId(req.user!.userId) 
    });

    if (existingVerification) {
      // Update existing verification
      await mentorVerificationsCollection.updateOne(
        { userId: new ObjectId(req.user!.userId) },
        { $set: verificationData }
      );
    } else {
      // Create new verification record
      await mentorVerificationsCollection.insertOne({
        ...verificationData,
        createdAt: new Date(),
      });
    }

    // Update mentor profile as complete
    await mentorProfilesCollection.updateOne(
      { userId: new ObjectId(req.user!.userId) },
      {
        $set: {
          profileStep: 'verification',
          isProfileComplete: true,
          applicationSubmitted: false,
          // Store additional info in profile for easy access
          linkedinProfile: validatedData.additionalInfo.linkedinProfile,
          personalWebsite: validatedData.additionalInfo.personalWebsite,
          additionalNotes: validatedData.additionalInfo.additionalNotes,
          hasResume: !!validatedData.resume,
          updatedAt: new Date(),
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Verification information saved successfully',
      data: { 
        profileStep: 'verification', 
        nextStep: 'review',
        verificationComplete: true,
        hasResume: !!validatedData.resume,
        verificationMethod: 'simplified'
      }
    });

  } catch (error: any) {
    console.error('Update mentor verification error:', error);

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