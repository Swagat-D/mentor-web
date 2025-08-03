// app/api/onboarding/progress/route.ts
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
      return NextResponse.json(
        { success: false, message: 'Profile not found' },
        { status: 404 }
      );
    }

    // Determine completed steps based on NEW Cal.com structure
    const completedSteps = [];
    
    // Profile step
    if (profile.displayName && profile.bio && profile.languages?.length) {
      completedSteps.push('profile');
    }
    
    // Expertise step
    if (profile.expertise?.length) {
      completedSteps.push('expertise');
    }
    
    // Availability step (Cal.com integration)
    if (profile.hourlyRateINR && profile.calComUsername && profile.calComVerified) {
      completedSteps.push('availability');
    }
    
    // Verification step
    const skipVerification = process.env.SKIP_VERIFICATION === 'true';
    if (skipVerification) {
      if (profile.profileStep === 'verification' || profile.isProfileComplete) {
        completedSteps.push('verification');
      }
    } else {
      if (verification && verification.additionalInfo?.agreeToTerms) {
        completedSteps.push('verification');
      }
    }

    const isComplete = completedSteps.length === 4;
    const isSubmitted = profile.applicationSubmitted || false;

    // Convert Cal.com data to legacy format for review page compatibility
    const legacyAvailabilityData = profile.hourlyRateINR ? {
      weeklySchedule: {
        // Mock data for display - actual scheduling handled by Cal.com
        monday: [{ startTime: "09:00", endTime: "17:00", isAvailable: true }],
        tuesday: [{ startTime: "09:00", endTime: "17:00", isAvailable: true }],
        wednesday: [{ startTime: "09:00", endTime: "17:00", isAvailable: true }],
        thursday: [{ startTime: "09:00", endTime: "17:00", isAvailable: true }],
        friday: [{ startTime: "09:00", endTime: "17:00", isAvailable: true }],
        saturday: [],
        sunday: []
      },
      pricing: {
        hourlyRate: profile.hourlyRateINR,
        currency: 'INR',
        trialSessionEnabled: false,
        groupSessionEnabled: false
      },
      preferences: {
        sessionLength: '60 minutes',
        advanceBooking: '2 hours in advance',
        maxStudentsPerWeek: 'Flexible',
        preferredSessionType: 'One-on-one sessions',
        cancellationPolicy: '2 hours notice required'
      },
      // Cal.com specific data
      calComIntegration: {
        username: profile.calComUsername,
        verified: profile.calComVerified,
        eventTypes: profile.calComEventTypes || [],
        profileUrl: `https://cal.com/${profile.calComUsername}`
      }
    } : null;

    return NextResponse.json({
      success: true,
      data: {
        completedSteps,
        currentStep: profile.profileStep || 'profile',
        isComplete,
        isSubmitted,
        profile: {
          ...profile,
          // Add legacy data for compatibility
          ...(legacyAvailabilityData || {})
        },
        verification: verification || null,
        user: {
          firstName: user?.firstName,
          lastName: user?.lastName,
          email: user?.email,
          isOnboardingComplete: user?.isOnboardingComplete
        }
      }
    });

  } catch (error) {
    console.error('Progress fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});