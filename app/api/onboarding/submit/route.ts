/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { connectToDatabase } from '@/lib/database/connection';
import { EmailService } from '@/lib/services/email.service';
import { ObjectId } from 'mongodb';

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    if (req.user!.role !== 'mentor') {
      return NextResponse.json(
        { success: false, message: 'Only mentors can submit applications' },
        { status: 403 }
      );
    }

    const { db } = await connectToDatabase();
    const mentorProfilesCollection = db.collection('mentorProfiles');
    const mentorVerificationsCollection = db.collection('mentorVerifications');
    const usersCollection = db.collection('users');

    // Check if profile is complete
    const profile = await mentorProfilesCollection.findOne({ 
      userId: new ObjectId(req.user!.userId) 
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, message: 'Profile not found. Please complete the onboarding process.' },
        { status: 400 }
      );
    }

    // Check each required step for MANUAL SCHEDULING
    const missingSteps = [];
    
    // Profile step
    if (!profile.displayName || !profile.bio || !profile.languages?.length) {
      missingSteps.push('profile');
    }
    
    // Expertise step
    if (!profile.expertise?.length) {
      missingSteps.push('expertise');
    }
    
    // Availability step (MANUAL SCHEDULING)
    if (!profile.hourlyRateINR || !profile.weeklySchedule || profile.scheduleType !== 'manual') {
      missingSteps.push('availability');
    }

    // Validate weekly schedule has at least one available day
    if (profile.weeklySchedule) {
      const hasAvailability = Object.values(profile.weeklySchedule).some((day: any) => 
        day.isAvailable && day.timeSlots && day.timeSlots.length > 0
      );
      
      if (!hasAvailability) {
        missingSteps.push('availability - no time slots configured');
      }
    }

    // Check verification step (simplified)
    const verification = await mentorVerificationsCollection.findOne({ 
      userId: new ObjectId(req.user!.userId) 
    });

    let verificationComplete = false;
    
    if (verification && verification.additionalInfo && verification.additionalInfo.agreeToTerms) {
      verificationComplete = true;
    } else if (profile.profileStep === 'verification' || profile.isProfileComplete) {
      // Fallback check if verification step was completed
      verificationComplete = true;
    }

    if (!verificationComplete) {
      missingSteps.push('verification');
    }

    if (missingSteps.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: `Please complete the following steps before submitting: ${missingSteps.join(', ')}`,
          missingSteps 
        },
        { status: 400 }
      );
    }

    // Get user data for email
    const user = await usersCollection.findOne({ 
      _id: new ObjectId(req.user!.userId) 
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Update verification status to submitted
    if (verification) {
      await mentorVerificationsCollection.updateOne(
        { userId: new ObjectId(req.user!.userId) },
        {
          $set: {
            status: 'pending',
            submittedAt: new Date(),
            updatedAt: new Date(),
          }
        }
      );
    } else {
      // Create a minimal verification record
      await mentorVerificationsCollection.insertOne({
        userId: new ObjectId(req.user!.userId),
        status: 'pending',
        verificationMethod: 'simplified',
        additionalInfo: {
          agreeToTerms: true,
        },
        submittedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Update profile with submission timestamp
    await mentorProfilesCollection.updateOne(
      { userId: new ObjectId(req.user!.userId) },
      {
        $set: {
          applicationSubmitted: true,
          submittedAt: new Date(),
          isProfileComplete: true,
          profileStep: 'complete',
          updatedAt: new Date(),
        }
      }
    );

    // Update user onboarding status
    await usersCollection.updateOne(
      { _id: new ObjectId(req.user!.userId) },
      {
        $set: {
          isOnboardingComplete: true,
          profileStatus: 'pending_verification',
          updatedAt: new Date(),
        }
      }
    );

    // Send confirmation email
    try {
      await EmailService.sendOnboardingCompletionEmail(
        user.email,
        user.firstName
      );
    } catch (emailError) {
      console.error('Failed to send onboarding completion email:', emailError);
      // Don't fail the request if email fails
    }

    // Calculate summary statistics for response
    const totalSlots = Object.values(profile.weeklySchedule).reduce((total: number, day: any) => 
      total + (day.timeSlots ? day.timeSlots.length : 0), 0
    );

    const availableDays = Object.values(profile.weeklySchedule).filter((day: any) => 
      day.isAvailable && day.timeSlots && day.timeSlots.length > 0
    ).length;

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully! Our team will review your application within 24-48 hours.',
      data: {
        submitted: true,
        submittedAt: new Date(),
        expectedReviewTime: '24-48 hours',
        redirectTo: '/dashboard',
        summary: {
          scheduleType: 'manual',
          hourlyRate: profile.hourlyRateINR,
          totalSlots,
          availableDays,
          hasResume: profile.hasResume || false,
          expertiseCount: profile.expertise?.length || 0
        }
      }
    });

  } catch (error) {
    console.error('Submit application error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});