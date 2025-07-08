import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/connection';
import { EmailService } from '@/lib/services/email.service';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Verification token is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');

    // Find user with valid verification token
    const user = await usersCollection.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
      isVerified: false,
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Update user as verified
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          isVerified: true,
          updatedAt: new Date(),
        },
        $unset: {
          emailVerificationToken: "",
          emailVerificationExpires: "",
        }
      }
    );

    // Send welcome email
    try {
      await EmailService.sendWelcomeEmail(
        user.email,
        user.firstName,
        user.role
      );
    } catch (emailError) {
      console.error('Welcome email failed:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! You can now log in.',
      data: {
        verified: true,
        redirectTo: user.role === 'mentor' ? '/onboarding/profile' : '/dashboard'
      }
    });

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}