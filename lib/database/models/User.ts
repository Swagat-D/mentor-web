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

// Time slot interface for manual scheduling
export interface TimeSlot {
  id: string;
  startTime: string; // Format: "HH:MM" (24-hour)
  endTime: string;   // Format: "HH:MM" (24-hour)
}

// Day schedule interface
export interface DaySchedule {
  isAvailable: boolean;
  timeSlots: TimeSlot[];
}

// Weekly schedule interface
export interface WeeklySchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
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
  
  // UPDATED: Manual Scheduling Fields (instead of Cal.com)
  hourlyRateINR: number;
  weeklySchedule: WeeklySchedule;
  sessionDurations: number[]; // Available session durations in minutes [60] by default
  scheduleType: 'manual'; // Indicates manual scheduling vs external integration
  
  // Additional profile info from verification
  linkedinProfile?: string;
  personalWebsite?: string;
  additionalNotes?: string;
  hasResume?: boolean;
  
  // Profile status
  isProfileComplete: boolean;
  profileStep: 'profile' | 'expertise' | 'availability' | 'verification' | 'complete';
  applicationSubmitted?: boolean;
  submittedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface MentorVerification {
  _id?: ObjectId;
  userId: ObjectId;
  status: 'pending' | 'approved' | 'rejected';
  verificationMethod: 'simplified' | 'full'; // Track verification type
  
  // Simplified verification data
  resume?: ResumeDocument;
  additionalInfo: {
    linkedinProfile?: string;
    personalWebsite?: string;
    additionalNotes?: string;
    agreeToTerms: boolean;
  };
  
  // Legacy fields for backward compatibility
  documents?: VerificationDocument[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  videoIntroduction?: any;
  
  notes?: string;
  verifiedBy?: ObjectId;
  verifiedAt?: Date;
  submittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResumeDocument {
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt?: Date;
}

export interface VerificationDocument {
  id: string;
  type: 'id' | 'education' | 'professional' | 'background_check' | 'resume';
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: Date;
}

// Session data structure for manual booking system
export interface Session {
  _id?: ObjectId;
  mentorId: ObjectId;
  studentId?: ObjectId;
  
  // Booking details
  scheduledAt: Date;
  endTime: Date;
  durationMinutes: number;
  priceINR: number;
  
  // Session info
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  meetingLink?: string;
  
  // Student details
  studentEmail?: string;
  studentName?: string;
  studentNotes?: string;
  
  // Mentor details
  mentorNotes?: string;
  
  // Feedback and ratings
  feedback?: SessionFeedback[];
  
  // Booking metadata
  bookingMethod: 'manual' | 'platform'; // How the session was booked
  cancellationReason?: string;
  cancelledBy?: ObjectId;
  cancelledAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionFeedback {
  fromUserId: ObjectId;
  toUserId: ObjectId;
  rating: number; // 1-5 stars
  comment?: string;
  tags: string[];
  createdAt: Date;
}

// Availability helper interfaces
export interface AvailabilitySlot {
  dayOfWeek: string; // 'monday', 'tuesday', etc.
  startTime: string;
  endTime: string;
  isBooked: boolean;
  sessionId?: ObjectId;
}

export interface MentorAvailability {
  mentorId: ObjectId;
  weeklySchedule: WeeklySchedule;
  timezone: string;
  sessionDurations: number[];
  lastUpdated: Date;
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