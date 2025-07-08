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

    if (!profile || !profile.isProfileComplete) {
      return NextResponse.json(
        { success: false, message: 'Please complete all onboarding steps before submitting' },
        { status: 400 }
      );
    }

    // Check if verification exists
    const verification = await mentorVerificationsCollection.findOne({ 
      userId: new ObjectId(req.user!.userId) 
    });

    if (!verification) {
      return NextResponse.json(
        { success: false, message: 'Please complete verification step before submitting' },
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