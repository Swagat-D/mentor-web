// app/api/calendar/availability/route.ts
import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { connectToDatabase } from '@/lib/database/connection';
import { ObjectId } from 'mongodb';

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    if (req.user!.role !== 'mentor') {
      return NextResponse.json(
        { success: false, message: 'Only mentors can access availability' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const { db } = await connectToDatabase();
    const mentorId = new ObjectId(req.user!.userId);

    // Get mentor's availability settings
    const mentorProfile = await db.collection('mentorProfiles').findOne({ userId: mentorId });
    
    const defaultAvailability = {
      monday: { start: '09:00', end: '17:00', available: true },
      tuesday: { start: '09:00', end: '17:00', available: true },
      wednesday: { start: '09:00', end: '17:00', available: true },
      thursday: { start: '09:00', end: '17:00', available: true },
      friday: { start: '09:00', end: '17:00', available: true },
      saturday: { start: '10:00', end: '16:00', available: false },
      sunday: { start: '10:00', end: '16:00', available: false }
    };

    const availability = mentorProfile?.availability || defaultAvailability;

    // Get existing sessions for the date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const existingSessions = await db.collection('sessions')
      .find({
        mentorId,
        scheduledAt: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ['scheduled', 'in-progress'] }
      })
      .toArray();

    // Generate available time slots
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const dayAvailability = availability[dayOfWeek as keyof typeof availability];

    let availableSlots: string[] = [];

    if (dayAvailability?.available) {
      const startTime = dayAvailability.start;
      const endTime = dayAvailability.end;
      
      // Generate 30-minute slots
      const slots = generateTimeSlots(startTime, endTime, 30);
      
      // Filter out booked slots
      availableSlots = slots.filter(slot => {
        const slotTime = new Date(`${date}T${slot}:00`);
        return !existingSessions.some(session => {
          const sessionStart = new Date(session.scheduledAt);
          const sessionEnd = new Date(sessionStart.getTime() + session.duration * 60000);
          return slotTime >= sessionStart && slotTime < sessionEnd;
        });
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        date,
        dayOfWeek,
        availability: dayAvailability,
        availableSlots,
        bookedSessions: existingSessions.map(session => ({
          id: session._id.toString(),
          start: session.scheduledAt,
          duration: session.duration,
          subject: session.subject
        }))
      }
    });

  } catch (error) {
    console.error('Get availability error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});

function generateTimeSlots(startTime: string, endTime: string, intervalMinutes: number): string[] {
  const slots: string[] = [];
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  let currentHour = startHour;
  let currentMinute = startMinute;
  
  while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
    const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    slots.push(timeString);
    
    currentMinute += intervalMinutes;
    if (currentMinute >= 60) {
      currentHour += Math.floor(currentMinute / 60);
      currentMinute = currentMinute % 60;
    }
  }
  
  return slots;
}

export const PUT = withAuth(async (req: AuthenticatedRequest) => {
  try {
    if (req.user!.role !== 'mentor') {
      return NextResponse.json(
        { success: false, message: 'Only mentors can update availability' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { availability, timezone } = body;

    const { db } = await connectToDatabase();
    const mentorId = new ObjectId(req.user!.userId);

    // Update mentor profile with new availability
    await db.collection('mentorProfiles').updateOne(
      { userId: mentorId },
      { 
        $set: { 
          availability,
          timezone,
          updatedAt: new Date()
        } 
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Availability updated successfully',
      data: { availability, timezone }
    });

  } catch (error) {
    console.error('Update availability error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});

