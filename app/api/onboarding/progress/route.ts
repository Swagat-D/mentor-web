/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { connectToDatabase } from '@/lib/database/connection';
import { ObjectId } from 'mongodb';

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
    const mentorVerificationsCollection = db.collection('mentorVerifications');
    const usersCollection = db.collection('users');

    // Get mentor profile
    const profile = await mentorProfilesCollection.findOne({
      userId: new ObjectId(req.user!.userId)
    });

    // Get verification data
    const verification = await mentorVerificationsCollection.findOne({
      userId: new ObjectId(req.user!.userId)
    });

    // Get user data
    const user = await usersCollection.findOne({
      _id: new ObjectId(req.user!.userId)
    });

    if (!profile) {
      return NextResponse.json({
        success: true,
        data: {
          completedSteps: [],
          currentStep: 'profile',
          isComplete: false,
          isSubmitted: false,
          profile: null,
          verification: null
        }
      });
    }

    // Determine completed steps for MANUAL SCHEDULING system
    const completedSteps = [];

    // Check profile step
    if (profile.displayName && profile.bio && profile.languages?.length > 0) {
      completedSteps.push('profile');
    }

    // Check expertise step
    if (profile.expertise && profile.expertise.length > 0) {
      completedSteps.push('expertise');
    }

    // Check availability step (MANUAL SCHEDULING)
    if (profile.hourlyRateINR && 
        profile.weeklySchedule && 
        profile.scheduleType === 'manual') {
      
      // Verify that at least one day has availability
      const hasAvailability = Object.values(profile.weeklySchedule).some((day: any) => 
        day.isAvailable && day.timeSlots && day.timeSlots.length > 0
      );
      
      if (hasAvailability) {
        completedSteps.push('availability');
      }
    }

    // Check verification step (simplified)
    if (verification && 
        verification.additionalInfo && 
        verification.additionalInfo.agreeToTerms) {
      completedSteps.push('verification');
    } else if (profile.profileStep === 'verification' || profile.isProfileComplete) {
      // Fallback check
      completedSteps.push('verification');
    }

    // Determine current step
    let currentStep = 'profile';
    if (completedSteps.includes('profile') && !completedSteps.includes('expertise')) {
      currentStep = 'expertise';
    } else if (completedSteps.includes('expertise') && !completedSteps.includes('availability')) {
      currentStep = 'availability';
    } else if (completedSteps.includes('availability') && !completedSteps.includes('verification')) {
      currentStep = 'verification';
    } else if (completedSteps.length === 4) {
      currentStep = 'review';
    }

    // Check if application is complete and submitted
    const isComplete = completedSteps.length === 4;
    const isSubmitted = profile.applicationSubmitted || false;

    // Calculate availability summary for the profile data
    let availabilitySummary = null;
    if (profile.weeklySchedule) {
      const availableDays = Object.values(profile.weeklySchedule).filter((day: any) => 
        day.isAvailable && day.timeSlots && day.timeSlots.length > 0
      ).length;
      
      const totalSlots = Object.values(profile.weeklySchedule).reduce((total: number, day: any) => 
        total + (day.timeSlots ? day.timeSlots.length : 0), 0
      );

      availabilitySummary = {
        availableDays,
        totalSlots,
        scheduleType: 'manual'
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        completedSteps,
        currentStep,
        isComplete,
        isSubmitted,
        profile: {
          ...profile,
          availabilitySummary
        },
        verification,
        user: user ? {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isOnboardingComplete: user.isOnboardingComplete,
          profileStatus: user.profileStatus
        } : null
      }
    });

  } catch (error) {
    console.error('Get onboarding progress error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});