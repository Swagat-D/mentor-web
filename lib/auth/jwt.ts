/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'mentor' | 'student' | 'admin';
  iat?: number;
  exp?: number;
}

export class JWTUtil {
  private static readonly ACCESS_TOKEN_SECRET = process.env.JWT_SECRET!
  private static readonly REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET!
  
  static generateTokens(payload: JWTPayload, rememberMe = false) {
    const accessToken = jwt.sign(
      payload,
      this.ACCESS_TOKEN_SECRET,
      { 
        expiresIn: '15m',
        issuer: 'mentormatch',
        audience: 'mentormatch-users'
      }
    )

    const refreshToken = jwt.sign(
      { userId: payload.userId, tokenType: 'refresh' },
      this.REFRESH_TOKEN_SECRET,
      { 
        expiresIn: rememberMe ? '30d' : '7d',
        issuer: 'mentormatch',
        audience: 'mentormatch-users'
      }
    )

    return { accessToken, refreshToken }
  }

  static verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, this.ACCESS_TOKEN_SECRET, {
        issuer: 'mentormatch',
        audience: 'mentormatch-users'
      }) as JWTPayload
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('ACCESS_TOKEN_EXPIRED')
      }
      throw new Error('INVALID_ACCESS_TOKEN')
    }
  }

  static verifyRefreshToken(token: string): { userId: string } {
    try {
      const payload = jwt.verify(token, this.REFRESH_TOKEN_SECRET, {
        issuer: 'mentormatch',
        audience: 'mentormatch-users'
      }) as any
      
      if (payload.tokenType !== 'refresh') {
        throw new Error('INVALID_TOKEN_TYPE')
      }
      
      return { userId: payload.userId }
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('REFRESH_TOKEN_EXPIRED')
      }
      throw new Error('INVALID_REFRESH_TOKEN')
    }
  }
}