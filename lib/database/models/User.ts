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
  profileStatus?: 'incomplete' | 'pending_verification' | 'verified' | 'rejected'; // Add this
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
  isProfileComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
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

export interface MentorAvailability {
  _id?: ObjectId;
  userId: ObjectId;
  weeklySchedule: WeeklySchedule;
  timezone: string;
  advanceBookingDays: number;
  maxSessionsPerWeek: number;
  sessionDurations: number[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WeeklySchedule {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface MentorPricing {
  _id?: ObjectId;
  userId: ObjectId;
  hourlyRate: number;
  currency: string;
  trialSessionEnabled: boolean;
  trialSessionRate?: number;
  groupSessionEnabled: boolean;
  groupSessionRate?: number;
  packageDeals: PackageDeal[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PackageDeal {
  sessions: number;
  discountPercentage: number;
  totalPrice: number;
}

export interface Session {
  _id?: ObjectId;
  mentorId: ObjectId;
  studentId: ObjectId;
  subject: string;
  scheduledAt: Date;
  duration: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  type: 'video' | 'audio' | 'chat';
  notes?: string;
  recording?: SessionRecording;
  feedback?: SessionFeedback[];
  payment: SessionPayment;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionRecording {
  url: string;
  duration: number; // duration in seconds
  createdAt: Date;
}

export interface SessionPayment {
  amount: number;
  currency: string;
  stripePaymentIntentId: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  paidAt?: Date;
  refundedAt?: Date;
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