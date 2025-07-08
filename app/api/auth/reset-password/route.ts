/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectToDatabase } from "@/lib/database/connection";
import { NextRequest, NextResponse } from "next/server";
import { BcryptUtil } from "@/lib/utils/bcrypt";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password } = resetPasswordSchema.parse(body);

    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');

    // Find user with valid reset token
    const user = await usersCollection.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
      isActive: true,
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Hash new password
    const passwordHash = await BcryptUtil.hash(password);

    // Update user password and clear reset token
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          passwordHash,
          updatedAt: new Date(),
        },
        $unset: {
          passwordResetToken: "",
          passwordResetExpires: "",
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Password reset successful! You can now log in with your new password.',
    });

  } catch (error: any) {
    console.error('Reset password error:', error);

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