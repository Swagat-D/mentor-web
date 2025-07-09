/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { JWTUtil } from './lib/auth/jwt'

const publicPaths = [
  '/',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/verify-otp',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/verify-otp',
  '/api/auth/verify-reset-otp',
  '/api/auth/resend-otp',
  '/api/auth/refresh'
]

const protectedPaths = [
  '/dashboard',
  '/onboarding',
  '/profile',
  '/sessions',
  '/settings'
]

const onboardingSteps = [
  '/onboarding/profile',
  '/onboarding/expertise', 
  '/onboarding/availability',
  '/onboarding/verification',
  '/onboarding/review'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Allow public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Check for authentication token
  const token = request.cookies.get('accessToken')?.value

  if (!token) {
    // Redirect to login if no token
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    // Verify token
    const payload = JWTUtil.verifyAccessToken(token)
    
    // Check onboarding flow restrictions
    if (pathname.startsWith('/onboarding/') && payload.role === 'mentor') {
      return checkOnboardingAccess(request, pathname)
    }

    return NextResponse.next()
  } catch (error) {
    // Invalid token, redirect to login
    console.log('Invalid token:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

async function checkOnboardingAccess(request: NextRequest, pathname: string) {
  try {
    // Get user's onboarding progress
    const progressResponse = await fetch(new URL('/api/onboarding/progress', request.url), {
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    })

    if (!progressResponse.ok) {
      return NextResponse.redirect(new URL('/onboarding/profile', request.url))
    }

    const progressData = await progressResponse.json()
    const { completedSteps, currentStep } = progressData.data

    // Define step order
    const stepOrder = ['profile', 'expertise', 'availability', 'verification', 'review']
    const currentStepIndex = stepOrder.indexOf(currentStep)
    
    // Check if user is trying to access a step they haven't unlocked
    if (pathname === '/onboarding/profile' && !completedSteps.includes('profile')) {
      return NextResponse.next() // Allow profile page if not completed
    }
    
    if (pathname === '/onboarding/expertise') {
      if (!completedSteps.includes('profile')) {
        return NextResponse.redirect(new URL('/onboarding/profile', request.url))
      }
      return NextResponse.next()
    }
    
    if (pathname === '/onboarding/availability') {
      if (!completedSteps.includes('expertise')) {
        return NextResponse.redirect(new URL('/onboarding/expertise', request.url))
      }
      return NextResponse.next()
    }
    
    if (pathname === '/onboarding/verification') {
      if (!completedSteps.includes('availability')) {
        return NextResponse.redirect(new URL('/onboarding/availability', request.url))
      }
      return NextResponse.next()
    }
    
    if (pathname === '/onboarding/review') {
      if (!completedSteps.includes('verification')) {
        return NextResponse.redirect(new URL('/onboarding/verification', request.url))
      }
      return NextResponse.next()
    }

    // If accessing /onboarding root, redirect to current step
    if (pathname === '/onboarding' || pathname === '/onboarding/') {
      return NextResponse.redirect(new URL(`/onboarding/${currentStep}`, request.url))
    }

    return NextResponse.next()
  } catch (error) {
    console.log('Onboarding check error:', error)
    return NextResponse.redirect(new URL('/onboarding/profile', request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}