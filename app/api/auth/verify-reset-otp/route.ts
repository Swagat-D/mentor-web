/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database/connection';
import { randomBytes } from 'crypto';
import { z } from 'zod';

const verifyResetOTPSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp } = verifyResetOTPSchema.parse(body);

    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');

    // Find user with valid reset OTP
    const user = await usersCollection.findOne({
      email: email.toLowerCase(),
      passwordResetOTP: otp,
      passwordResetOTPExpires: { $gt: new Date() },
      isActive: true,
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    // Generate password reset token
    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Update user with reset token and clear OTP
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          passwordResetToken: resetToken,
          passwordResetExpires: resetTokenExpires,
          updatedAt: new Date(),
        },
        $unset: {
          passwordResetOTP: "",
          passwordResetOTPExpires: "",
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully. You can now reset your password.',
      data: {
        resetToken,
      }
    });

  } catch (error: any) {
    console.error('Verify reset OTP error:', error);

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