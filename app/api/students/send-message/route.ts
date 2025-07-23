/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/students/send-message/route.ts
import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { connectToDatabase } from '@/lib/database/connection';
import { EmailService } from '@/lib/services/email.service';
import { ObjectId } from 'mongodb';
import { z } from 'zod';

const sendMessageSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
});

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    if (req.user!.role !== 'mentor') {
      return NextResponse.json(
        { success: false, message: 'Only mentors can send messages' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { studentId, subject, message } = sendMessageSchema.parse(body);

    const { db } = await connectToDatabase();
    const mentorId = new ObjectId(req.user!.userId);
    const studentObjectId = new ObjectId(studentId);

    // Get mentor and student data
    const [mentor, student] = await Promise.all([
      db.collection('users').findOne({ _id: mentorId }),
      db.collection('users').findOne({ _id: studentObjectId, role: 'mentee', isActive: true })
    ]);

    if (!mentor || !student) {
      return NextResponse.json(
        { success: false, message: 'Mentor or student not found' },
        { status: 404 }
      );
    }

    // Get mentor profile for display name
    const mentorProfile = await db.collection('mentorProfiles').findOne({ userId: mentorId });
    const mentorDisplayName = mentorProfile?.displayName || student.name || `${mentor.firstName || ''} ${mentor.lastName || ''}`.trim();

    // Create notification for student
    const notification = {
      userId: studentObjectId,
      type: 'message',
      title: `New message from ${mentorDisplayName}`,
      message: `Subject: ${subject}`,
      priority: 'medium',
      read: false,
      actionUrl: '/dashboard/messages',
      metadata: {
        senderId: mentorId.toString(),
        senderName: mentorDisplayName,
        senderRole: 'mentor',
        originalMessage: message,
        messageSubject: subject
      },
      relatedEntityId: mentorId,
      relatedUser: {
        id: mentorId.toString(),
        name: mentorDisplayName,
        role: 'mentor'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const notificationResult = await db.collection('notifications').insertOne(notification);

    // Send email to student
    try {
      await EmailService.sendMentorMessageEmail(
        student.email,
        student.name || 'Student',
        mentorDisplayName,
        subject,
        message
      );
    } catch (emailError) {
      console.error('Failed to send message email:', emailError);
      // Don't fail the request if email fails, notification is still created
    }

    // Create a message record for tracking
    const messageRecord = {
      senderId: mentorId,
      receiverId: studentObjectId,
      senderType: 'mentor' as const,
      receiverType: 'mentee' as const,
      subject,
      content: message,
      status: 'sent' as const,
      readAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const messageResult = await db.collection('messages').insertOne(messageRecord);

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully to student',
      data: {
        notificationId: notificationResult.insertedId.toString(),
        messageId: messageResult.insertedId.toString(),
        sentTo: {
          name: student.name || 'Student',
          email: student.email
        }
      }
    });

  } catch (error: any) {
    console.error('Send message error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed',
          errors: error.errors.map((e: any) => e.message)
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});