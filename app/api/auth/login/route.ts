/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { UserRepository } from '@/lib/database/repositories/UserRepository';
import { BcryptUtil } from '@/lib/utils/bcrypt';
import { JWTUtil } from '@/lib/auth/jwt';
import { loginSchema } from '@/lib/utils/validation';
import { connectToDatabase } from '@/lib/database/connection';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    const userRepository = new UserRepository();

    // Find user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: 'Account has been deactivated. Please contact support.' },
        { status: 401 }
      );
    }

    // Check if user is verified
    if (!user.isVerified) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Please verify your email address first.',
          code: 'EMAIL_NOT_VERIFIED'
        },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await BcryptUtil.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate tokens
    const tokens = JWTUtil.generateTokens({
      userId: user._id!.toString(),
      email: user.email,
      role: user.role,
    });

    // Update last login
    await userRepository.updateLastLogin(user._id!);

    // Determine redirect URL based on role and profile completion
    let redirectTo = '/dashboard';

    if (user.role === 'mentor') {
      // Check if mentor profile is complete
      const { db } = await connectToDatabase();
      const mentorProfilesCollection = db.collection('mentorProfiles');
      
      const profile = await mentorProfilesCollection.findOne({ 
        userId: user._id,
        isProfileComplete: true 
      });
      
      if (!profile) {
        // Check if any onboarding data exists to determine the correct step
        const incompleteProfile = await mentorProfilesCollection.findOne({ 
          userId: user._id 
        });
        
        if (!incompleteProfile) {
          redirectTo = '/onboarding/profile';
        } else if (!incompleteProfile.expertise) {
          redirectTo = '/onboarding/expertise';
        } else if (!incompleteProfile.weeklySchedule) {
          redirectTo = '/onboarding/availability';
        } else if (!incompleteProfile.isProfileComplete) {
          redirectTo = '/onboarding/verification';
        }
      }
    }

    // Set cookies for browser requests
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
        tokens,
        redirectTo
      }
    });

    // Set HTTP-only cookies
    response.cookies.set('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    });

    response.cookies.set('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;

  } catch (error: any) {
    console.error('Login error:', error);

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