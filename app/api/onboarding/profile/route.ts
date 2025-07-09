/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { connectToDatabase } from '@/lib/database/connection';
import { z } from 'zod';
import { ObjectId } from 'mongodb';

const profileSchema = z.object({
  displayName: z.string().min(1, 'Display name is required'),
  location: z.string().min(1, 'Location is required'),
  timezone: z.string().min(1, 'Timezone is required'),
  languages: z.array(z.string()).min(1, 'At least one language is required'),
  bio: z.string().min(50, 'Bio must be at least 50 characters'),
  achievements: z.string().optional(),
  socialMedia: z.object({
    linkedin: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
    website: z.string().url().optional().or(z.literal('')),
  }).optional(),
});

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    if (req.user!.role !== 'mentor') {
      return NextResponse.json(
        { success: false, message: 'Only mentors can access this endpoint' },
        { status: 403 }
      );
    }

    const { db } = await connectToDatabase();
    const mentorProfilesCollection = db.collection('mentorProfiles');
    
    const profile = await mentorProfilesCollection.findOne({ 
      userId: new ObjectId(req.user!.userId) 
    });

    return NextResponse.json({
      success: true,
      data: profile || null
    });

  } catch (error) {
    console.error('Get mentor profile error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    if (req.user!.role !== 'mentor') {
      return NextResponse.json(
        { success: false, message: 'Only mentors can create profiles' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = profileSchema.parse(body);

    const { db } = await connectToDatabase();
    const mentorProfilesCollection = db.collection('mentorProfiles');
    const usersCollection = db.collection('users');

    // Get user data
    const user = await usersCollection.findOne({ 
      _id: new ObjectId(req.user!.userId) 
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if profile already exists
    const existingProfile = await mentorProfilesCollection.findOne({ 
      userId: new ObjectId(req.user!.userId) 
    });

    const profileData = {
      userId: new ObjectId(req.user!.userId),
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: validatedData.displayName,
      bio: validatedData.bio,
      location: validatedData.location,
      timezone: validatedData.timezone,
      languages: validatedData.languages,
      achievements: validatedData.achievements || '',
      socialLinks: validatedData.socialMedia || {},
      expertise: [], 
      subjects: [], 
      teachingStyles: [], 
      specializations: [], 
      isProfileComplete: false,
      profileStep: 'profile',
      updatedAt: new Date(),
    };

    if (existingProfile) {
      // Update existing profile
      await mentorProfilesCollection.updateOne(
        { userId: new ObjectId(req.user!.userId) },
        { $set: profileData }
      );
    } else {
      // Create new profile
      await mentorProfilesCollection.insertOne({
        ...profileData,
        createdAt: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Profile saved successfully',
      data: { profileStep: 'profile', nextStep: 'expertise' }
    });

  } catch (error: any) {
    console.error('Create/Update mentor profile error:', error);

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