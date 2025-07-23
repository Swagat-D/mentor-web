// lib/services/google-calendar.service.ts
import { google } from 'googleapis';
import { connectToDatabase } from '@/lib/database/connection';
import { ObjectId } from 'mongodb';

export class GoogleCalendarService {
  private static oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  static getAuthUrl(userId: string): string {
    const scopes = [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events'
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      state: userId, // Pass userId to identify the user in callback
      prompt: 'consent'
    });
  }

  static async handleCallback(code: string, userId: string) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      
      // Store tokens in database
      const { db } = await connectToDatabase();
      await db.collection('userIntegrations').updateOne(
        { userId: new ObjectId(userId), service: 'google_calendar' },
        {
          $set: {
            userId: new ObjectId(userId),
            service: 'google_calendar',
            tokens,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );

      return tokens;
    } catch (error) {
      console.error('Google Calendar callback error:', error);
      throw new Error('Failed to connect Google Calendar');
    }
  }

  static async getCalendars(userId: string) {
    try {
      const tokens = await this.getUserTokens(userId);
      this.oauth2Client.setCredentials(tokens);

      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
      const response = await calendar.calendarList.list();

      return response.data.items || [];
    } catch (error) {
      console.error('Get Google calendars error:', error);
      throw new Error('Failed to fetch Google calendars');
    }
  }

  static async getEvents(userId: string, startDate: string, endDate: string) {
    try {
      const tokens = await this.getUserTokens(userId);
      this.oauth2Client.setCredentials(tokens);

      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: startDate,
        timeMax: endDate,
        singleEvents: true,
        orderBy: 'startTime'
      });

      return response.data.items || [];
    } catch (error) {
      console.error('Get Google Calendar events error:', error);
      throw new Error('Failed to fetch Google Calendar events');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async createEvent(userId: string, eventData: any) {
    try {
      const tokens = await this.getUserTokens(userId);
      this.oauth2Client.setCredentials(tokens);

      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
      
      const event = {
        summary: eventData.summary,
        description: eventData.description,
        start: {
          dateTime: eventData.start,
          timeZone: eventData.timeZone || 'UTC'
        },
        end: {
          dateTime: eventData.end,
          timeZone: eventData.timeZone || 'UTC'
        },
        attendees: eventData.attendees || [],
        conferenceData: eventData.conferenceData,
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 15 }
          ]
        }
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
        conferenceDataVersion: 1
      });

      return response.data;
    } catch (error) {
      console.error('Create Google Calendar event error:', error);
      throw new Error('Failed to create Google Calendar event');
    }
  }

  static async syncSessionsToCalendar(userId: string) {
    try {
      const { db } = await connectToDatabase();
      const userObjectId = new ObjectId(userId);

      // Get user's upcoming sessions
      const sessions = await db.collection('sessions')
        .find({
          mentorId: userObjectId,
          status: 'scheduled',
          scheduledAt: { $gte: new Date() }
        })
        .toArray();

      const tokens = await this.getUserTokens(userId);
      this.oauth2Client.setCredentials(tokens);

      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
      const syncedEvents = [];

      for (const session of sessions) {
        // Check if event already exists
        const existingIntegration = await db.collection('sessionIntegrations')
          .findOne({ sessionId: session._id, service: 'google_calendar' });

        if (!existingIntegration) {
          // Get student info
          const student = await db.collection('users').findOne({ _id: session.studentId });
          
          const eventData = {
            summary: `${session.subject} - Tutoring Session`,
            description: `Tutoring session with ${student?.name || 'Student'}\nSubject: ${session.subject}\nDuration: ${session.duration} minutes\n${session.notes ? `Notes: ${session.notes}` : ''}`,
            start: {
              dateTime: session.scheduledAt.toISOString(),
              timeZone: 'UTC'
            },
            end: {
              dateTime: new Date(session.scheduledAt.getTime() + session.duration * 60000).toISOString(),
              timeZone: 'UTC'
            },
            attendees: student?.email ? [{ email: student.email }] : [],
            conferenceData: {
              createRequest: {
                requestId: session._id.toString(),
                conferenceSolutionKey: { type: 'hangoutsMeet' }
              }
            }
          };

          const event = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: eventData,
            conferenceDataVersion: 1
          });

          // Store integration record
          await db.collection('sessionIntegrations').insertOne({
            sessionId: session._id,
            userId: userObjectId,
            service: 'google_calendar',
            externalId: event.data.id,
            eventData: event.data,
            createdAt: new Date()
          });

          syncedEvents.push(event.data);
        }
      }

      return {
        synced: syncedEvents.length,
        total: sessions.length,
        events: syncedEvents
      };
    } catch (error) {
      console.error('Sync sessions to calendar error:', error);
      throw new Error('Failed to sync sessions to Google Calendar');
    }
  }

  private static async getUserTokens(userId: string) {
    const { db } = await connectToDatabase();
    const integration = await db.collection('userIntegrations')
      .findOne({ userId: new ObjectId(userId), service: 'google_calendar' });

    if (!integration || !integration.tokens) {
      throw new Error('Google Calendar not connected');
    }

    return integration.tokens;
  }
}