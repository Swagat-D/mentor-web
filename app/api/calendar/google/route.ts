// app/api/calendar/google/route.ts
import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { GoogleCalendarService } from '@/lib/services/google-calendar.service';

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'auth-url':
        const authUrl = GoogleCalendarService.getAuthUrl(req.user!.userId);
        return NextResponse.json({
          success: true,
          data: { authUrl }
        });

      case 'calendars':
        const calendars = await GoogleCalendarService.getCalendars(req.user!.userId);
        return NextResponse.json({
          success: true,
          data: calendars
        });

      case 'events':
        const startDate = searchParams.get('start') || new Date().toISOString();
        const endDate = searchParams.get('end') || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        
        const events = await GoogleCalendarService.getEvents(
          req.user!.userId,
          startDate,
          endDate
        );
        
        return NextResponse.json({
          success: true,
          data: events
        });

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Google Calendar API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const { action, eventData, code } = body;

    switch (action) {
      case 'callback':
        // Handle OAuth callback
        const tokens = await GoogleCalendarService.handleCallback(code, req.user!.userId);
        return NextResponse.json({
          success: true,
          message: 'Google Calendar connected successfully',
          data: tokens
        });

      case 'create-event':
        const event = await GoogleCalendarService.createEvent(req.user!.userId, eventData);
        return NextResponse.json({
          success: true,
          message: 'Event created in Google Calendar',
          data: event
        });

      case 'sync-sessions':
        const syncResult = await GoogleCalendarService.syncSessionsToCalendar(req.user!.userId);
        return NextResponse.json({
          success: true,
          message: 'Sessions synced to Google Calendar',
          data: syncResult
        });

      default:
        return NextResponse.json(
          { success: false, message: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Google Calendar POST error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});

