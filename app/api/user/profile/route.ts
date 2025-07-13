/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { connectToDatabase } from '@/lib/database/connection';
import { ObjectId } from 'mongodb';
import { z } from 'zod';

const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  displayName: z.string().optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  location: z.string().optional(),
  timezone: z.string().optional(),
  bio: z.string().optional(),
  title: z.string().optional(),
  hourlyRate: z.number().min(10).max(1000).optional(),
  experience: z.string().optional(),
  education: z.string().optional(),
  subjects: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  teachingStyles: z.array(z.string()).optional(),
  specializations: z.array(z.string()).optional(),
  weeklyHours: z.number().min(1).max(168).optional(),
  responseTime: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  linkedin: z.string().url().optional().or(z.literal('')),
  twitter: z.string().url().optional().or(z.literal('')),
  profileVisibility: z.enum(['public', 'students', 'private']).optional(),
  contactVisibility: z.enum(['public', 'students', 'private']).optional(),
  showEarnings: z.boolean().optional(),
  showReviews: z.boolean().optional(),
  emailNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
});

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { db } = await connectToDatabase();
    const userId = new ObjectId(req.user!.userId);

    // Get user data
    const user = await db.collection('users').findOne({ _id: userId });
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Get mentor profile if user is a mentor
    let mentorProfile = null;
    if (user.role === 'mentor') {
      mentorProfile = await db.collection('mentorProfiles').findOne({ userId });
    }

    // Combine user data with mentor profile
    const profileData = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: mentorProfile?.displayName || `${user.firstName} ${user.lastName}`,
      email: user.email,
      phone: mentorProfile?.phone || '',
      location: mentorProfile?.location || '',
      timezone: mentorProfile?.timezone || 'UTC',
      profilePhoto: mentorProfile?.profilePhoto || '',
      
      // Professional Info
      title: mentorProfile?.title || (user.role === 'mentor' ? 'Mathematics Mentor' : 'Student'),
      bio: mentorProfile?.bio || '',
      hourlyRate: mentorProfile?.pricing?.hourlyRate || 75,
      experience: mentorProfile?.experience || '',
      education: mentorProfile?.education || '',
      certifications: mentorProfile?.certifications || [],
      
      // Contact & Social
      website: mentorProfile?.socialLinks?.website || '',
      linkedin: mentorProfile?.socialLinks?.linkedin || '',
      twitter: mentorProfile?.socialLinks?.twitter || '',
      
      // Teaching Info
      subjects: mentorProfile?.subjects || [],
      languages: mentorProfile?.languages || ['English'],
      teachingStyles: mentorProfile?.teachingStyles || [],
      specializations: mentorProfile?.specializations || [],
      
      // Availability
      weeklyHours: mentorProfile?.weeklyHours || 25,
      responseTime: mentorProfile?.responseTime || '< 2 hours',
      sessionTypes: mentorProfile?.sessionTypes || ['video', 'audio'],
      
      // Privacy Settings
      profileVisibility: mentorProfile?.profileVisibility || 'public',
      contactVisibility: mentorProfile?.contactVisibility || 'students',
      showEarnings: mentorProfile?.showEarnings ?? true,
      showReviews: mentorProfile?.showReviews ?? true,
      emailNotifications: user.emailNotifications ?? true,
      smsNotifications: user.smsNotifications ?? false,
      
      // Verification
      isVerified: user.isVerified || false,
      verificationStatus: {
        email: user.isVerified || false,
        phone: false,
        identity: false,
        education: false,
        background: false
      },
      
      // Metadata
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt || new Date(),
    };

    return NextResponse.json({
      success: true,
      data: profileData
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const PATCH = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const validatedData = updateProfileSchema.parse(body);

    const { db } = await connectToDatabase();
    const userId = new ObjectId(req.user!.userId);

    // Update user table
    const userUpdateData: any = {
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      email: validatedData.email,
      emailNotifications: validatedData.emailNotifications,
      smsNotifications: validatedData.smsNotifications,
      updatedAt: new Date(),
    };

    await db.collection('users').updateOne(
      { _id: userId },
      { $set: userUpdateData }
    );

    // Update mentor profile if user is a mentor
    if (req.user!.role === 'mentor') {
      const mentorUpdateData: any = {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        displayName: validatedData.displayName || `${validatedData.firstName} ${validatedData.lastName}`,
        bio: validatedData.bio,
        location: validatedData.location,
        timezone: validatedData.timezone,
        phone: validatedData.phone,
        title: validatedData.title,
        experience: validatedData.experience,
        education: validatedData.education,
        subjects: validatedData.subjects,
        languages: validatedData.languages,
        teachingStyles: validatedData.teachingStyles,
        specializations: validatedData.specializations,
        weeklyHours: validatedData.weeklyHours,
        responseTime: validatedData.responseTime,
        profileVisibility: validatedData.profileVisibility,
        contactVisibility: validatedData.contactVisibility,
        showEarnings: validatedData.showEarnings,
        showReviews: validatedData.showReviews,
        socialLinks: {
          website: validatedData.website,
          linkedin: validatedData.linkedin,
          twitter: validatedData.twitter,
        },
        updatedAt: new Date(),
      };

      // Update hourly rate in pricing structure
      if (validatedData.hourlyRate) {
        mentorUpdateData['pricing.hourlyRate'] = validatedData.hourlyRate;
      }

      await db.collection('mentorProfiles').updateOne(
        { userId },
        { $set: mentorUpdateData },
        { upsert: true }
      );
    }

    // Fetch updated profile
    const updatedUser = await db.collection('users').findOne({ _id: userId });
    let updatedMentorProfile = null;
    if (req.user!.role === 'mentor') {
      updatedMentorProfile = await db.collection('mentorProfiles').findOne({ userId });
    }

    // Return updated profile data (same structure as GET)
    const profileData = {
      _id: updatedUser!._id,
      firstName: updatedUser!.firstName,
      lastName: updatedUser!.lastName,
      displayName: updatedMentorProfile?.displayName || `${updatedUser!.firstName} ${updatedUser!.lastName}`,
      email: updatedUser!.email,
      phone: updatedMentorProfile?.phone || '',
      location: updatedMentorProfile?.location || '',
      timezone: updatedMentorProfile?.timezone || 'UTC',
      profilePhoto: updatedMentorProfile?.profilePhoto || '',
      title: updatedMentorProfile?.title || (updatedUser!.role === 'mentor' ? 'Mathematics Mentor' : 'Student'),
      bio: updatedMentorProfile?.bio || '',
      hourlyRate: updatedMentorProfile?.pricing?.hourlyRate || 75,
      experience: updatedMentorProfile?.experience || '',
      education: updatedMentorProfile?.education || '',
      certifications: updatedMentorProfile?.certifications || [],
      website: updatedMentorProfile?.socialLinks?.website || '',
      linkedin: updatedMentorProfile?.socialLinks?.linkedin || '',
      twitter: updatedMentorProfile?.socialLinks?.twitter || '',
      subjects: updatedMentorProfile?.subjects || [],
      languages: updatedMentorProfile?.languages || ['English'],
      teachingStyles: updatedMentorProfile?.teachingStyles || [],
      specializations: updatedMentorProfile?.specializations || [],
      weeklyHours: updatedMentorProfile?.weeklyHours || 25,
      responseTime: updatedMentorProfile?.responseTime || '< 2 hours',
      sessionTypes: updatedMentorProfile?.sessionTypes || ['video', 'audio'],
      profileVisibility: updatedMentorProfile?.profileVisibility || 'public',
      contactVisibility: updatedMentorProfile?.contactVisibility || 'students',
      showEarnings: updatedMentorProfile?.showEarnings ?? true,
      showReviews: updatedMentorProfile?.showReviews ?? true,
      emailNotifications: updatedUser!.emailNotifications ?? true,
      smsNotifications: updatedUser!.smsNotifications ?? false,
      isVerified: updatedUser!.isVerified || false,
      verificationStatus: {
        email: updatedUser!.isVerified || false,
        phone: false,
        identity: false,
        education: false,
        background: false
      },
      role: updatedUser!.role,
      createdAt: updatedUser!.createdAt,
      updatedAt: updatedUser!.updatedAt || new Date(),
    };

    return NextResponse.json({
      success: true,
      data: profileData,
      message: 'Profile updated successfully'
    });

  } catch (error: any) {
    console.error('Update user profile error:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed',
          errors: error.errors.reduce((acc: any, err: any) => {
            acc[err.path[0]] = err.message;
            return acc;
          }, {})
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