/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/connection';
import { EmailService } from '@/lib/services/email.service';
import { z } from 'zod';

const verifyOTPSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp } = verifyOTPSchema.parse(body);

    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');

    // Find user with valid OTP
    const user = await usersCollection.findOne({
      email: email.toLowerCase(),
      otpCode: otp,
      otpExpires: { $gt: new Date() },
      isActive: false, // User should be inactive until verified
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    // Update user as verified and active
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          isVerified: true,
          isActive: true,
          updatedAt: new Date(),
        },
        $unset: {
          otpCode: "",
          otpExpires: "",
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
      message: 'Account verified successfully!',
      data: {
        verified: true,
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          isVerified: true,
        }
      }
    });

  } catch (error: any) {
    console.error('OTP verification error:', error);

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
}