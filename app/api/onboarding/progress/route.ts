import { AuthenticatedRequest, withAuth } from "@/lib/auth/middleware";
import { connectToDatabase } from "@/lib/database/connection";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    if (req.user!.role !== 'mentor') {
      return NextResponse.json(
        { success: false, message: 'Only mentors can access onboarding progress' },
        { status: 403 }
      );
    }

    const { db } = await connectToDatabase();
    const mentorProfilesCollection = db.collection('mentorProfiles');
    const mentorVerificationsCollection = db.collection('mentorVerifications');

    const profile = await mentorProfilesCollection.findOne({ 
      userId: new ObjectId(req.user!.userId) 
    });

    const verification = await mentorVerificationsCollection.findOne({ 
      userId: new ObjectId(req.user!.userId) 
    });

    // Check if we should skip verification for development
    const skipVerification = process.env.SKIP_VERIFICATION === 'true';

    // Determine completed steps
    const completedSteps: string[] = [];
    let currentStep = 'profile';

    if (profile) {
      completedSteps.push('profile');
      
      if (profile.subjects && profile.teachingStyles) {
        completedSteps.push('expertise');
        
        if (profile.weeklySchedule && profile.pricing) {
          completedSteps.push('availability');
          
          // Skip verification in development or check actual verification
          if (skipVerification || (verification && verification.documents)) {
            completedSteps.push('verification');
            currentStep = 'review';
            
            if (profile.applicationSubmitted) {
              completedSteps.push('submitted');
              currentStep = 'submitted';
            }
          } else {
            currentStep = 'verification';
          }
        } else {
          currentStep = 'availability';
        }
      } else {
        currentStep = 'expertise';
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        completedSteps,
        currentStep,
        isComplete: completedSteps.length >= 4,
        isSubmitted: profile?.applicationSubmitted || false,
        profile: profile || null,
        verification: verification || null,
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