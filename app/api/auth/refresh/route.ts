import { NextRequest, NextResponse } from 'next/server';
import { JWTUtil } from '@/lib/auth/jwt';
import { UserRepository } from '@/lib/database/repositories/UserRepository';

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: 'Refresh token not found' },
        { status: 401 }
      );
    }

    // Verify refresh token
    const payload = JWTUtil.verifyRefreshToken(refreshToken);
    
    // Verify user still exists and is active
    const userRepository = new UserRepository();
    const user = await userRepository.findById(payload.userId);
    
    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, message: 'User not found or inactive' },
        { status: 401 }
      );
    }

    // Generate new tokens
    const tokens = JWTUtil.generateTokens({
      userId: user._id!.toString(),
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Token refreshed successfully',
      data: { tokens }
    });

    // Update cookies
    response.cookies.set('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60,
    });

    response.cookies.set('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;

  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { success: false, message: 'Invalid refresh token' },
      { status: 401 }
    );
  }
}