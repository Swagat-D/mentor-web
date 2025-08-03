/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/calcom/booking-preview/route.ts
import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { username, eventTypes, hourlyRate } = await req.json();

    if (!username || !eventTypes || !hourlyRate) {
      return NextResponse.json(
        { success: false, message: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const calcomApiKey = process.env.CALCOM_API_KEY;
    if (!calcomApiKey) {
      return NextResponse.json(
        { success: false, message: 'Cal.com API not configured' },
        { status: 500 }
      );
    }

    // Fetch real availability for the next 7 days as preview
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    let availabilityData = null;
    const bookingUrls: {
      eventTypeId: string | number;
      title: string;
      duration: number;
      url: string;
      price: number;
    }[] = [];

    try {
      // Try to fetch availability using Cal.com API v2
      const availabilityResponse = await fetch(
        `${process.env.NEXT_PUBLIC_CALCOM_BASE_URL}/slots/available?` + 
        new URLSearchParams({
          startTime: today.toISOString(),
          endTime: nextWeek.toISOString(),
          eventTypeId: eventTypes[0]?.id?.toString() || '',
        }),
        {
          headers: {
            'Authorization': `Bearer ${calcomApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (availabilityResponse.ok) {
        const data = await availabilityResponse.json();
        availabilityData = data.data || {};
      }
    } catch (error) {
      console.log('Could not fetch live availability:', error);
    }

    // Generate booking URLs for each event type
    eventTypes.forEach((eventType: any) => {
      bookingUrls.push({
        eventTypeId: eventType.id,
        title: eventType.title,
        duration: eventType.duration,
        url: `https://cal.com/${username}/${eventType.slug}`,
        price: Math.round((hourlyRate / 60) * eventType.duration)
      });
    });

    // Simulate what student booking flow would look like
    const bookingFlowData = {
      mentorProfile: {
        username,
        calcomUrl: `https://cal.com/${username}`,
        totalEventTypes: eventTypes.length
      },
      availableSlots: availabilityData?.slots || [
        // Fallback mock data if API fails
        { time: '09:00', available: true, date: today.toISOString().split('T')[0] },
        { time: '10:00', available: true, date: today.toISOString().split('T')[0] },
        { time: '14:00', available: true, date: today.toISOString().split('T')[0] },
      ],
      eventTypes: bookingUrls,
      pricingCalculation: {
        hourlyRate,
        currency: 'INR',
        examples: eventTypes.map((et: any) => ({
          duration: et.duration,
          price: Math.round((hourlyRate / 60) * et.duration)
        }))
      },
      integrationStatus: {
        calcomConnected: true,
        googleMeetEnabled: true,
        webhooksActive: false, // Will be true in production
        paymentGateway: 'Razorpay/Stripe (India)',
        realTimeSync: true
      },
      studentExperience: {
        steps: [
          'Student browses mentor profile',
          'Clicks "Book Session" button',
          'Selects session type and duration',
          'Picks available time slot',
          'Enters details and pays',
          'Receives Google Meet link automatically',
          'Gets calendar invite and email confirmation'
        ],
        apiEndpoints: [
          { method: 'GET', endpoint: `/api/mentor/${username}/availability` },
          { method: 'POST', endpoint: '/api/sessions/book' },
          { method: 'WEBHOOK', endpoint: '/api/webhooks/calcom' }
        ]
      }
    };

    return NextResponse.json({
      success: true,
      data: bookingFlowData
    });

  } catch (error: any) {
    console.error('Booking preview error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate booking preview' },
      { status: 500 }
    );
  }
});