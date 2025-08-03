// app/api/calcom/verify-username/route.ts
import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';

interface CalComEventType {
  id: number;
  title: string;
  slug: string;
  length: number;
  hidden: boolean;
}

interface CalComApiResponse {
  status: string;
  data: {
    eventTypeGroups: Array<{
      eventTypes: CalComEventType[];
    }>;
  };
}

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { username } = await req.json();

    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Username is required' },
        { status: 400 }
      );
    }

    // Clean username
    const cleanUsername = username.trim().toLowerCase();

    // Method 1: Try to fetch public profile first (no API key needed)
    try {
      const publicResponse = await fetch(`https://cal.com/${cleanUsername}`, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'MentorMatch-Bot/1.0'
        }
      });

      if (publicResponse.status !== 200) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Username not found. Please check your Cal.com username and ensure your profile is public.' 
          },
          { status: 404 }
        );
      }
    } catch (error) {
      console.error(error)
      return NextResponse.json(
        { 
          success: false, 
          message: 'Unable to verify username. Please check your Cal.com username.' 
        },
        { status: 500 }
      );
    }

    // Method 2: Use Cal.com API v2 to get event types
    const calcomApiKey = process.env.CALCOM_API_KEY;
    if (!calcomApiKey) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Cal.com integration not configured. Please contact support.' 
        },
        { status: 500 }
      );
    }

    try {
      // Search for user by username using API v2
      const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_CALCOM_BASE_URL}/event-types`, {
        headers: {
          'Authorization': `Bearer ${calcomApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!apiResponse.ok) {
        if (apiResponse.status === 401) {
          return NextResponse.json(
            { 
              success: false, 
              message: 'Cal.com API authentication failed. Please contact support.' 
            },
            { status: 500 }
          );
        }
        throw new Error(`API request failed: ${apiResponse.status}`);
      }

      const data: CalComApiResponse = await apiResponse.json();

      // Extract event types
      const allEventTypes: CalComEventType[] = [];
      data.data.eventTypeGroups.forEach(group => {
        group.eventTypes.forEach(eventType => {
          if (!eventType.hidden) {
            allEventTypes.push(eventType);
          }
        });
      });

      // For username verification, we'll check if any public event types exist
      // Note: This is a simplified approach - in production you might want to 
      // implement user-specific API key validation

      if (allEventTypes.length === 0) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'No public event types found. Please create at least one public event type in your Cal.com account.' 
          },
          { status: 404 }
        );
      }

      // Format event types for frontend
      const formattedEventTypes = allEventTypes.map(eventType => ({
        id: eventType.id,
        title: eventType.title,
        slug: eventType.slug,
        duration: eventType.length
      }));

      return NextResponse.json({
        success: true,
        message: 'Username verified successfully',
        eventTypes: formattedEventTypes,
        username: cleanUsername
      });

    } catch (apiError) {
      console.error('Cal.com API error:', apiError);
      
      // Fallback: If API fails but public profile exists, allow with warning
      return NextResponse.json({
        success: true,
        message: 'Username verified (limited data available)',
        eventTypes: [],
        username: cleanUsername,
        warning: 'Could not fetch event types. Please ensure you have public event types configured.'
      });
    }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Username verification error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Verification failed. Please try again.' 
      },
      { status: 500 }
    );
  }
});