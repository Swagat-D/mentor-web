/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/connection';
import { EmailService } from '@/lib/services/email.service';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = forgotPasswordSchema.parse(body);

    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');

    // Find active user
    const user = await usersCollection.findOne({
      email: email.toLowerCase(),
      isActive: true,
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, we have sent a password reset code.',
      });
    }

    // Generate OTP for password reset
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with reset OTP
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          passwordResetOTP: otp,
          passwordResetOTPExpires: otpExpires,
          updatedAt: new Date(),
        }
      }
    );

    // Send OTP email
    try {
      await EmailService.sendOTPEmail(
        email,
        otp,
        user.firstName,
        'reset'
      );
    } catch (emailError) {
      console.error('Reset OTP email sending failed:', emailError);
      throw new Error('Failed to send reset code. Please try again.');
    }

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, we have sent a password reset code.',
    });

  } catch (error: any) {
    console.error('Forgot password error:', error);

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