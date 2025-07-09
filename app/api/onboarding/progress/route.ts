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
          
          // Check verification completion properly
          let verificationComplete = false;
          
          if (skipVerification) {
            // In development mode, verification is considered complete if profile step is 'verification' or higher
            verificationComplete = profile.profileStep === 'verification' || profile.isProfileComplete;
          } else {
            // In production, check if verification documents exist and required agreements are made
            verificationComplete = !!(verification && 
              verification.additionalInfo && 
              verification.additionalInfo.agreeToBackgroundCheck && 
              verification.additionalInfo.agreeToTerms);
          }
          
          if (verificationComplete) {
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

    // Determine if application is complete (all required steps finished)
    const requiredSteps = 4; // profile, expertise, availability, verification
    const isComplete = completedSteps.length >= requiredSteps;

    return NextResponse.json({
      success: true,
      data: {
        completedSteps,
        currentStep,
        isComplete,
        isSubmitted: profile?.applicationSubmitted || false,
        profile: profile || null,
        verification: verification || null,
        skipVerification: skipVerification, // Include this for debugging
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