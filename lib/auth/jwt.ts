import jwt, {SignOptions} from 'jsonwebtoken';

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
  private static secret = process.env.JWT_SECRET!;
  private static refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!;

  static generateTokens(payload: Omit<JWTPayload, 'iat' | 'exp'>) {
    const accessToken = jwt.sign(payload as object, this.secret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m'
    } as SignOptions
  );

    const refreshToken = jwt.sign(payload as object, this.refreshSecret, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    } as SignOptions
  );

    return { accessToken, refreshToken };
  }

  static verifyAccessToken(token: string): JWTPayload {
    return jwt.verify(token, this.secret) as JWTPayload;
  }

  static verifyRefreshToken(token: string): JWTPayload {
    return jwt.verify(token, this.refreshSecret) as JWTPayload;
  }
}