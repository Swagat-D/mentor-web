/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/database/connection';
import { BcryptUtil } from '@/lib/utils/bcrypt';
import { EmailService } from '@/lib/services/email.service';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  role: z.enum(['mentor', 'student']),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = registerSchema.parse(body);

    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ 
      email: validatedData.email.toLowerCase() 
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User already exists with this email' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await BcryptUtil.hash(validatedData.password);

    //Gennerate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Generate verification token

    // Create user
    const newUser = {
      email: validatedData.email.toLowerCase(),
      passwordHash,
      role: validatedData.role,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      isVerified: false,
      isActive: false, //will be activated after otp verification
      otpCode: otp,
      otpExpires: otpExpires,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);

    //send OTP email
    try {
      await EmailService.sendOTPEmail(
        validatedData.email,
        otp,
        validatedData.firstName,
        'signup'
      );
    } catch (emailError) {
      console.error('OTP email sending failed:', emailError);
      // Delete the user if email fails
      await usersCollection.deleteOne({ _id: result.insertedId });
      throw new Error('Failed to send verification code. Please try again.');
    }    

    return NextResponse.json({
      success: true,
      message: 'Registration successful! Please check your email for the Verification Code.',
      data: {
        id: result.insertedId,
        email: newUser.email,
        role: newUser.role,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        isVerified: false,
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error('Registration error:', error);

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