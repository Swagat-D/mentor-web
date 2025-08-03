import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  email: string;
  passwordHash: string;
  role: 'mentor' | 'student' | 'admin';
  firstName: string; 
  lastName: string;  
  isVerified: boolean;
  isActive: boolean;
  isOnboardingComplete?: boolean; 
  profileStatus?: 'incomplete' | 'pending_verification' | 'verified' | 'rejected';
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  passwordResetOTP?: string; 
  passwordResetOTPExpires?: Date; 
  otpCode?: string; 
  otpExpires?: Date; 
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MentorProfile {
  _id?: ObjectId;
  userId: ObjectId;
  firstName: string;
  lastName: string;
  displayName: string;
  bio: string;
  profilePhoto?: string;
  location: string;
  timezone: string;
  languages: string[];
  expertise: string[];
  education: EducationEntry[];
  experience: ExperienceEntry[];
  achievements?: string;
  socialLinks: SocialLinks;
  
  // NEW: Cal.com Integration Fields
  hourlyRateINR: number;
  calComUsername: string;
  calComEventTypes: CalComEventType[];
  calComVerified: boolean;
  calComLastSync?: Date;
  
  // Profile status
  isProfileComplete: boolean;
  profileStep: 'profile' | 'expertise' | 'availability' | 'verification' | 'complete';
  
  createdAt: Date;
  updatedAt: Date;
}

export interface CalComEventType {
  id: number;
  title: string;
  slug: string;
  duration: number; // in minutes
  isActive: boolean;
}

export interface MentorVerification {
  _id?: ObjectId;
  userId: ObjectId;
  status: 'pending' | 'approved' | 'rejected';
  documents: VerificationDocument[];
  notes?: string;
  verifiedBy?: ObjectId;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface VerificationDocument {
  id: string;
  type: 'id' | 'education' | 'professional' | 'background_check';
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: Date;
}

// Session data structure for mentor dashboard (read-only from Cal.com)
export interface Session {
  _id?: ObjectId;
  mentorId: ObjectId;
  studentId?: ObjectId; // May be null for external bookings
  calComBookingId: string;
  eventTypeId: number;
  scheduledAt: Date;
  endTime: Date;
  durationMinutes: number;
  priceINR: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  meetingLink?: string;
  studentEmail?: string;
  studentName?: string;
  studentNotes?: string;
  mentorNotes?: string;
  feedback?: SessionFeedback[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  calComData?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionFeedback {
  fromUserId: ObjectId;
  toUserId: ObjectId;
  rating: number;
  comment?: string;
  tags: string[];
  createdAt: Date;
}

export interface EducationEntry {
  institution: string;
  degree: string;
  field: string;
  startYear: number;
  endYear?: number;
  description?: string;
}

export interface ExperienceEntry {
  company: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  description: string;
  skills: string[];
}

export interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  website?: string;
  github?: string;
}