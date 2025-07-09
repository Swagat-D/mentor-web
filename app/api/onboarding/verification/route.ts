/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { connectToDatabase } from '@/lib/database/connection';
import { z } from 'zod';
import { ObjectId } from 'mongodb';

const verificationSchema = z.object({
  documents: z.object({
    idDocument: z.object({
      name: z.string(),
      size: z.number(),
      type: z.string(),
      url: z.string(),
    }).optional(),
    educationCertificate: z.object({
      name: z.string(),
      size: z.number(),
      type: z.string(),
      url: z.string(),
    }).optional(),
    professionalCertification: z.object({
      name: z.string(),
      size: z.number(),
      type: z.string(),
      url: z.string(),
    }).optional(),
    backgroundCheck: z.object({
      name: z.string(),
      size: z.number(),
      type: z.string(),
      url: z.string(),
    }).optional(),
  }),
  videoIntroduction: z.object({
    name: z.string(),
    size: z.number(),
    type: z.string(),
    url: z.string(),
  }).optional(),
  additionalInfo: z.object({
    linkedinProfile: z.string().optional(),
    personalWebsite: z.string().optional(),
    additionalNotes: z.string().optional(),
    agreeToBackgroundCheck: z.boolean(),
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

    if (!validatedData.additionalInfo.agreeToBackgroundCheck || !validatedData.additionalInfo.agreeToTerms) {
      return NextResponse.json(
        { success: false, message: 'You must agree to background check and terms to proceed' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const mentorProfilesCollection = db.collection('mentorProfiles');
    const mentorVerificationsCollection = db.collection('mentorVerifications');

    // Create verification documents array
    const documents: any[] = [];
    Object.entries(validatedData.documents).forEach(([type, doc]) => {
      if (doc) {
        documents.push({
          id: new ObjectId().toString(),
          type,
          fileName: doc.name,
          fileUrl: doc.url,
          fileSize: doc.size,
          mimeType: doc.type,
          status: 'pending',
          uploadedAt: new Date(),
        });
      }
    });

    // Create or update verification record
    const verificationData = {
      userId: new ObjectId(req.user!.userId),
      status: 'pending',
      documents,
      videoIntroduction: validatedData.videoIntroduction,
      additionalInfo: validatedData.additionalInfo,
      updatedAt: new Date(),
    };

    // Update mentor profile as complete
    await mentorProfilesCollection.updateOne(
    { userId: new ObjectId(req.user!.userId) },
      {
        $set: {
          profileStep: 'verification',
          isProfileComplete: true,
          applicationSubmitted: false, // Add this
          updatedAt: new Date(),
        }
      }
    );

    // Update mentor profile as complete
    await mentorProfilesCollection.updateOne(
      { userId: new ObjectId(req.user!.userId) },
      {
        $set: {
          profileStep: 'verification',
          isProfileComplete: true,
          updatedAt: new Date(),
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Verification information saved successfully',
      data: { profileStep: 'verification', nextStep: 'review' }
    });

  } catch (error: any) {
    console.error('Update mentor verification error:', error);

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