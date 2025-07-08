/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { MentorProfileRepository } from '@/lib/database/repositories/MentorRepository';
import { mentorProfileSchema } from '@/lib/utils/validation';
import { ObjectId } from 'mongodb';

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const mentorProfileRepository = new MentorProfileRepository();
    const profile = await mentorProfileRepository.findByUserId(req.user!.userId);

    if (!profile) {
      return NextResponse.json(
        { success: false, message: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: profile
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
    const validatedData = mentorProfileSchema.parse(body);

    const mentorProfileRepository = new MentorProfileRepository();
    
    // Check if profile already exists
    const existingProfile = await mentorProfileRepository.findByUserId(req.user!.userId);
    if (existingProfile) {
      return NextResponse.json(
        { success: false, message: 'Profile already exists' },
        { status: 409 }
      );
    }

    // Create profile
    const profile = await mentorProfileRepository.create({
      userId: new ObjectId(req.user!.userId),
      firstName: validatedData.firstName || '',
      lastName: validatedData.lastName || '',
      displayName: validatedData.displayName,
      bio: validatedData.bio,
      location: validatedData.location,
      timezone: validatedData.timezone,
      languages: validatedData.languages,
      expertise: validatedData.expertise,
      education: validatedData.education,
      experience: validatedData.experience.map(exp => ({
        ...exp,
        startDate: new Date(exp.startDate),
        endDate: exp.endDate ? new Date(exp.endDate) : undefined,
      })),
      socialLinks: validatedData.socialLinks || {},
      isProfileComplete: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Profile created successfully',
      data: profile
    }, { status: 201 });

  } catch (error: any) {
    console.error('Create mentor profile error:', error);

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

export const PUT = withAuth(async (req: AuthenticatedRequest) => {
  try {
    if (req.user!.role !== 'mentor') {
      return NextResponse.json(
        { success: false, message: 'Only mentors can update profiles' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = mentorProfileSchema.parse(body);

    const mentorProfileRepository = new MentorProfileRepository();
    
    // Find existing profile
    const existingProfile = await mentorProfileRepository.findByUserId(req.user!.userId);
    if (!existingProfile) {
      return NextResponse.json(
        { success: false, message: 'Profile not found' },
        { status: 404 }
      );
    }

    // Update profile
    const updatedProfile = await mentorProfileRepository.update(existingProfile._id!, {
      displayName: validatedData.displayName,
      bio: validatedData.bio,
      location: validatedData.location,
      timezone: validatedData.timezone,
      languages: validatedData.languages,
      expertise: validatedData.expertise,
      education: validatedData.education,
      experience: validatedData.experience.map(exp => ({
        ...exp,
        startDate: new Date(exp.startDate),
        endDate: exp.endDate ? new Date(exp.endDate) : undefined,
      })),
      socialLinks: validatedData.socialLinks || {},
      isProfileComplete: true,
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile
    });

  } catch (error: any) {
    console.error('Update mentor profile error:', error);

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