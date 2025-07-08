import { NextRequest, NextResponse } from 'next/server';
import { JWTUtil } from './lib/auth/jwt';

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const { pathname } = request.nextUrl;

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/api/auth/register',
    '/api/auth/login',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/auth/verify-email',
    '/api/mentors/search', // Public mentor search
  ];

  // Define admin-only routes
  const adminRoutes = [
    '/admin',
    '/api/admin',
  ];

  // Define mentor-only routes
  const mentorRoutes = [
    '/dashboard/analytics',
    '/dashboard/earnings',
    '/onboarding',
    '/api/mentors/profile',
    '/api/mentors/availability',
    '/api/mentors/pricing',
  ];

  // Check if the route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Get token from cookies or Authorization header
  const token = request.cookies.get('accessToken')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  // Redirect to login if no token
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Verify the token
    const payload = JWTUtil.verifyAccessToken(token);

    // Check admin routes
    if (adminRoutes.some(route => pathname.startsWith(route))) {
      if (payload.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    // Check mentor routes
    if (mentorRoutes.some(route => pathname.startsWith(route))) {
      if (payload.role !== 'mentor') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    // Add user info to request headers for API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId);
    requestHeaders.set('x-user-role', payload.role);
    requestHeaders.set('x-user-email', payload.email);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

  } catch (error) {
    console.log(error)
    // Token is invalid, redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    
    // Clear invalid tokens
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');
    
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};