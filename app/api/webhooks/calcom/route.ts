// app/api/webhooks/calcom/route.ts
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { connectToDatabase } from '@/lib/database/connection';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('cal-signature');
    
    // Verify webhook signature (ONLY in production)
    if (process.env.NODE_ENV === 'production') {
      const webhookSecret = process.env.CALCOM_WEBHOOK_SECRET;
      if (!webhookSecret || !signature) {
        return NextResponse.json(
          { error: 'Missing webhook secret or signature' },
          { status: 400 }
        );
      }

      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');

      if (signature !== expectedSignature) {
        console.error('Invalid webhook signature');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 400 }
        );
      }
    }

    const webhookData = JSON.parse(body);
    const { triggerEvent, payload } = webhookData;

    console.log(`Received Cal.com webhook: ${triggerEvent}`, payload);

    const { db } = await connectToDatabase();
    const sessionsCollection = db.collection('sessions');
    const mentorProfilesCollection = db.collection('mentorProfiles');

    switch (triggerEvent) {
      case 'BOOKING_CREATED': {
        const booking = payload;
        
        // Find mentor by Cal.com username or event type
        const mentor = await mentorProfilesCollection.findOne({
          $or: [
            { calComUsername: booking.organizer?.username },
            { 'calComEventTypes.id': booking.eventTypeId }
          ]
        });

        if (!mentor) {
          console.error('Mentor not found for booking:', booking.id);
          break;
        }

        // Create session record in your database
        const sessionData = {
          mentorId: mentor.userId,
          studentId: null, // Will be updated when student info is available
          calComBookingId: booking.id,
          eventTypeId: booking.eventTypeId,
          scheduledAt: new Date(booking.startTime),
          endTime: new Date(booking.endTime),
          durationMinutes: booking.eventType?.duration || 60,
          priceINR: calculatePrice(mentor.hourlyRateINR, booking.eventType?.duration || 60),
          status: 'confirmed',
          meetingLink: booking.location?.meetingUrl || booking.meetingUrl,
          studentEmail: booking.attendees?.[0]?.email,
          studentName: booking.attendees?.[0]?.name,
          notes: booking.responses?.notes || '',
          calComData: booking,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const insertResult = await sessionsCollection.insertOne(sessionData);

        // Send notifications (implement as needed)
        // await sendBookingConfirmationEmail(mentor, sessionData);
        // await sendSlackNotification(`New booking: ${sessionData.studentName}`);

        console.log('Session created successfully:', insertResult.insertedId);
        break;
      }

      case 'BOOKING_CANCELLED': {
        const booking = payload;
        
        // Update session status
        const result = await sessionsCollection.updateOne(
          { calComBookingId: booking.id },
          {
            $set: {
              status: 'cancelled',
              cancelledAt: new Date(),
              cancellationReason: booking.cancellationReason || 'No reason provided',
              updatedAt: new Date()
            }
          }
        );

        if (result.matchedCount > 0) {
          console.log('Session cancelled successfully:', booking.id);
          
          // Handle refunds if applicable
          // await processRefund(booking.id);
          
          // Send cancellation notifications
          // await sendCancellationEmail(booking);
        }
        break;
      }

      case 'BOOKING_RESCHEDULED': {
        const booking = payload;
        
        // Update session timing
        const result = await sessionsCollection.updateOne(
          { calComBookingId: booking.id },
          {
            $set: {
              scheduledAt: new Date(booking.startTime),
              endTime: new Date(booking.endTime),
              meetingLink: booking.location?.meetingUrl || booking.meetingUrl,
              status: 'confirmed',
              rescheduledAt: new Date(),
              updatedAt: new Date()
            }
          }
        );

        if (result.matchedCount > 0) {
          console.log('Session rescheduled successfully:', booking.id);
          
          // Send reschedule notifications
          // await sendRescheduleEmail(booking);
        }
        break;
      }

      case 'MEETING_ENDED': {
        const booking = payload;
        
        // Mark session as completed
        await sessionsCollection.updateOne(
          { calComBookingId: booking.id },
          {
            $set: {
              status: 'completed',
              completedAt: new Date(),
              updatedAt: new Date()
            }
          }
        );

        console.log('Session marked as completed:', booking.id);
        
        // Trigger payment processing
        // await processSessionPayment(booking.id);
        
        // Send feedback requests
        // await sendFeedbackRequests(booking);
        break;
      }

      default:
        console.log('Unhandled webhook event:', triggerEvent);
    }

    return NextResponse.json({ success: true, processed: triggerEvent });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// Helper function to calculate session price
function calculatePrice(hourlyRateINR: number, durationMinutes: number): number {
  return Math.round((hourlyRateINR / 60) * durationMinutes);
}

// Development mode: Manual sync endpoint
export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 });
  }

  return NextResponse.json({
    message: 'Webhook endpoint ready',
    environment: 'development',
    note: 'Webhooks require public URL - use ngrok for testing'
  });
}