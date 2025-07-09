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

    // Check each required step
    const missingSteps = [];
    
    if (!profile.displayName || !profile.bio || !profile.languages?.length) {
      missingSteps.push('profile');
    }
    
    if (!profile.subjects?.length || !profile.teachingStyles?.length) {
      missingSteps.push('expertise');
    }
    
    if (!profile.weeklySchedule || !profile.pricing) {
      missingSteps.push('availability');
    }

    // Check verification step
    const skipVerification = process.env.SKIP_VERIFICATION === 'true';
    const verification = await mentorVerificationsCollection.findOne({ 
      userId: new ObjectId(req.user!.userId) 
    });

    let verificationComplete = false;
    
    if (skipVerification) {
      // In development mode, verification is complete if the profile step indicates so
      verificationComplete = profile.profileStep === 'verification' || profile.isProfileComplete;
    } else {
      // In production, check verification documents and agreements
      verificationComplete = !!(verification && 
        verification.additionalInfo && 
        verification.additionalInfo.agreeToBackgroundCheck && 
        verification.additionalInfo.agreeToTerms);
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

    // Update verification status to submitted (if verification exists)
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
    } else if (skipVerification) {
      // Create a minimal verification record for development
      await mentorVerificationsCollection.insertOne({
        userId: new ObjectId(req.user!.userId),
        status: 'pending',
        documents: [],
        additionalInfo: {
          agreeToBackgroundCheck: true,
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

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully! Our team will review your application within 24-48 hours.',
      data: {
        submitted: true,
        submittedAt: new Date(),
        expectedReviewTime: '24-48 hours',
        redirectTo: '/dashboard'
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