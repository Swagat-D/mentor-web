/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { connectToDatabase } from '@/lib/database/connection';
import { EmailService } from '@/lib/services/email.service';
import { ObjectId } from 'mongodb';
import { z } from 'zod';

const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
});

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const validatedData = contactFormSchema.parse(body);

    const { db } = await connectToDatabase();
    const userId = new ObjectId(req.user!.userId);

    // Get user information
    const user = await db.collection('users').findOne({ _id: userId });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Create support ticket in database
    const supportTicket = {
      userId,
      name: validatedData.name,
      email: validatedData.email,
      subject: validatedData.subject,
      message: validatedData.message,
      priority: validatedData.priority,
      status: 'open',
      userRole: user.role,
      userInfo: {
        name: user.name,
        email: user.email,
        role: user.role,
        joinDate: user.createdAt
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      responses: []
    };

    const result = await db.collection('supportTickets').insertOne(supportTicket);

    // Send email to admin
    try {
      await EmailService.sendSupportEmail({
        ticketId: result.insertedId.toString(),
        fromName: validatedData.name,
        fromEmail: validatedData.email,
        subject: validatedData.subject,
        message: validatedData.message,
        priority: validatedData.priority,
        userRole: user.role,
        userInfo: {
          name: user.name,
          email: user.email,
          role: user.role,
          joinDate: user.createdAt
        }
      });

      // Send confirmation email to user
      await EmailService.sendSupportConfirmationEmail(
        validatedData.email,
        validatedData.name,
        result.insertedId.toString(),
        validatedData.subject
      );

    } catch (emailError) {
      console.error('Failed to send support emails:', emailError);
      // Don't fail the request if email fails, ticket is still created
    }

    // Create notification for user
    await db.collection('notifications').insertOne({
      userId,
      type: 'support',
      title: 'Support Ticket Created',
      message: `Your support ticket "${validatedData.subject}" has been created. We'll respond within 4 hours.`,
      priority: 'medium',
      read: false,
      actionUrl: '/help',
      metadata: {
        ticketId: result.insertedId.toString(),
        subject: validatedData.subject,
        priority: validatedData.priority
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({
      success: true,
      message: 'Support ticket created successfully',
      data: {
        ticketId: result.insertedId.toString(),
        subject: validatedData.subject,
        priority: validatedData.priority,
        estimatedResponse: getEstimatedResponseTime(validatedData.priority)
      }
    });

  } catch (error: any) {
    console.error('Support contact error:', error);

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

function getEstimatedResponseTime(priority: string): string {
  switch (priority) {
    case 'urgent':
      return 'Within 1 hour';
    case 'high':
      return 'Within 2 hours';
    case 'medium':
      return 'Within 4 hours';
    case 'low':
      return 'Within 24 hours';
    default:
      return 'Within 4 hours';
  }
}