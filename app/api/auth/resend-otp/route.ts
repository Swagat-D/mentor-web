/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/connection';
import { EmailService } from '@/lib/services/email.service';
import { z } from 'zod';

const resendOTPSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = resendOTPSchema.parse(body);

    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');

    // Find unverified user
    const user = await usersCollection.findOne({
      email: email.toLowerCase(),
      isActive: false,
      isVerified: false,
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found or already verified' },
        { status: 404 }
      );
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with new OTP
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          otpCode: otp,
          otpExpires: otpExpires,
          updatedAt: new Date(),
        }
      }
    );

    // Send new OTP email
    try {
      await EmailService.sendOTPEmail(
        email,
        otp,
        user.firstName,
        'signup'
      );
    } catch (emailError) {
      console.error('OTP email sending failed:', emailError);
      throw new Error('Failed to send verification code. Please try again.');
    }

    return NextResponse.json({
      success: true,
      message: 'New verification code sent successfully!',
    });

  } catch (error: any) {
    console.error('Resend OTP error:', error);

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