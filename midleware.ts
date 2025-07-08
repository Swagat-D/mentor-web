import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { JWTUtil } from './lib/auth/jwt'

// Define protected routes
const protectedRoutes = [
  '/dashboard',
  '/onboarding',
  '/profile',
  '/sessions',
  '/mentors/profile'
]

// Define auth routes (should redirect if already authenticated)
const authRoutes = [
  '/login',
  '/signup',
  '/verify-otp',
  '/forgot-password',
  '/reset-password'
]

// Define onboarding routes
const onboardingRoutes = [
  '/onboarding/profile',
  '/onboarding/expertise', 
  '/onboarding/availability',
  '/onboarding/verification',
  '/onboarding/review'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const accessToken = request.cookies.get('accessToken')?.value

  // Helper function to check if user is authenticated
  const isAuthenticated = () => {
    if (!accessToken) return false
    try {
      JWTUtil.verifyAccessToken(accessToken)
      return true
    } catch {
      return false
    }
  }

  // Helper function to get user from token
  const getUser = () => {
    if (!accessToken) return null
    try {
      return JWTUtil.verifyAccessToken(accessToken)
    } catch {
      return null
    }
  }

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Check if route is auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  )

  // Check if route is onboarding route
  const isOnboardingRoute = onboardingRoutes.some(route => 
    pathname.startsWith(route)
  )

  // If accessing protected routes without authentication
  if (isProtectedRoute && !isAuthenticated()) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If accessing auth routes while authenticated
  if (isAuthRoute && isAuthenticated()) {
    const user = getUser()
    
    // Special case for OTP verification - allow if user exists but check their status
    if (pathname.startsWith('/verify-otp')) {
      return NextResponse.next()
    }
    
    // Redirect authenticated users away from auth pages
    if (user?.role === 'mentor') {
      // Check if mentor profile is complete by making internal request
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } else {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Special handling for onboarding routes
  if (isOnboardingRoute && isAuthenticated()) {
    const user = getUser()
    
    // Only mentors can access onboarding
    if (user?.role !== 'mentor') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Allow the request to continue
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all routes except static files and API routes
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}