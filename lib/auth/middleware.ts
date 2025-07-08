import { NextRequest, NextResponse } from 'next/server';
import { JWTUtil, JWTPayload } from './jwt';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

export function withAuth(handler: (req: AuthenticatedRequest) => Promise<Response>) {
  return async (req: NextRequest): Promise<Response> => {
    try {
      const token = extractToken(req);
      
      if (!token) {
        return NextResponse.json(
          { success: false, message: 'Access token required' },
          { status: 401 }
        );
      }

      const payload = JWTUtil.verifyAccessToken(token);
      (req as AuthenticatedRequest).user = payload;

      return handler(req as AuthenticatedRequest);
    } catch (error) {
      console.log(error)
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }
  };
}

export function withRole(roles: string[]) {
  return function(handler: (req: AuthenticatedRequest) => Promise<Response>) {
    return withAuth(async (req: AuthenticatedRequest): Promise<Response> => {
      if (!req.user || !roles.includes(req.user.role)) {
        return NextResponse.json(
          { success: false, message: 'Insufficient permissions' },
          { status: 403 }
        );
      }

      return handler(req);
    });
  };
}

function extractToken(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Also check cookies for browser requests
  const tokenFromCookie = req.cookies.get('accessToken')?.value;
  return tokenFromCookie || null;
}

