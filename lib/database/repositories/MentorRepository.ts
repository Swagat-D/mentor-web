/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Filter, ObjectId } from 'mongodb';
import { BaseRepository } from './BaseRepository';
import { MentorProfile, MentorVerification, Session, WeeklySchedule } from '../models/User';

export class MentorProfileRepository extends BaseRepository<MentorProfile> {
  constructor() {
    super('mentorProfiles');
  }

  async findByUserId(userId: string | ObjectId): Promise<MentorProfile | null> {
    const objectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    return this.findOne({ userId: objectId } as Filter<MentorProfile>);
  }

  async updateManualSchedule(
    userId: string | ObjectId, 
    data: {
      hourlyRateINR: number;
      weeklySchedule: WeeklySchedule;
      sessionDurations: number[];
      timezone: string;
    }
  ): Promise<MentorProfile | null> {
    return this.update(userId, {
      hourlyRateINR: data.hourlyRateINR,
      weeklySchedule: data.weeklySchedule,
      sessionDurations: data.sessionDurations,
      timezone: data.timezone,
      scheduleType: 'manual',
      profileStep: 'availability',
      updatedAt: new Date(),
      // Remove any old Cal.com fields
      $unset: {
        calComUsername: "",
        calComEventTypes: "",
        calComVerified: "",
        calComLastSync: ""
      }
    } as any);
  }

  async updateVerificationInfo(
    userId: string | ObjectId,
    data: {
      linkedinProfile?: string;
      personalWebsite?: string;
      additionalNotes?: string;
      hasResume?: boolean;
    }
  ): Promise<MentorProfile | null> {
    return this.update(userId, {
      linkedinProfile: data.linkedinProfile,
      personalWebsite: data.personalWebsite,
      additionalNotes: data.additionalNotes,
      hasResume: data.hasResume,
      profileStep: 'verification',
      isProfileComplete: true,
      updatedAt: new Date()
    } as Partial<MentorProfile>);
  }

  async searchMentors(filters: {
    expertise?: string[];
    location?: string;
    languages?: string[];
    priceRange?: { min: number; max: number };
    verified?: boolean;
    availableDays?: string[];
  }): Promise<MentorProfile[]> {
    const query: Filter<MentorProfile> = { 
      isProfileComplete: true,
      scheduleType: 'manual', // Only show mentors with manual scheduling
      applicationSubmitted: true
    };

    if (filters.expertise?.length) {
      query.expertise = { $in: filters.expertise };
    }

    if (filters.location) {
      query.location = { $regex: filters.location, $options: 'i' };
    }

    if (filters.languages?.length) {
      query.languages = { $in: filters.languages };
    }

    if (filters.priceRange) {
      query.hourlyRateINR = {
        $gte: filters.priceRange.min,
        $lte: filters.priceRange.max
      };
    }

    // Filter by available days if specified
    if (filters.availableDays?.length) {
      const dayQueries = filters.availableDays.map(day => ({
        [`weeklySchedule.${day}.isAvailable`]: true,
        [`weeklySchedule.${day}.timeSlots`]: { $not: { $size: 0 } }
      }));
      
      query.$or = dayQueries;
    }

    const result = await this.findMany(query, {
      sort: { updatedAt: -1 },
      limit: 50
    });

    return result.items;
  }

  async getVerifiedMentors(): Promise<MentorProfile[]> {
    const result = await this.findMany(
      { 
        isProfileComplete: true,
        scheduleType: 'manual',
        profileStep: 'complete',
        applicationSubmitted: true
      } as Filter<MentorProfile>,
      { sort: { updatedAt: -1 } }
    );
    return result.items;
  }

  async getMentorAvailability(userId: string | ObjectId): Promise<{
    weeklySchedule: WeeklySchedule;
    timezone: string;
    sessionDurations: number[];
    hourlyRate: number;
  } | null> {
    const mentor = await this.findByUserId(userId);
    
    if (!mentor || !mentor.weeklySchedule) {
      return null;
    }

    return {
      weeklySchedule: mentor.weeklySchedule,
      timezone: mentor.timezone,
      sessionDurations: mentor.sessionDurations || [60],
      hourlyRate: mentor.hourlyRateINR
    };
  }

  async getAvailableTimeSlots(
    userId: string | ObjectId, 
    date: Date
  ): Promise<Array<{
    startTime: string;
    endTime: string;
    isBooked: boolean;
  }>> {
    const mentor = await this.findByUserId(userId);
    
    if (!mentor || !mentor.weeklySchedule) {
      return [];
    }

    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof WeeklySchedule;
    const daySchedule = mentor.weeklySchedule[dayOfWeek];

    if (!daySchedule || !daySchedule.isAvailable) {
      return [];
    }

    // TODO: Check against booked sessions to mark slots as booked
    // For now, return all slots as available
    return daySchedule.timeSlots.map(slot => ({
      startTime: slot.startTime,
      endTime: slot.endTime,
      isBooked: false
    }));
  }

  async getMentorStats(userId: string | ObjectId): Promise<{
    totalSessions: number;
    completedSessions: number;
    upcomingSessions: number;
    totalEarnings: number;
    avgRating?: number;
    availabilityStats: {
      totalSlots: number;
      availableDays: number;
      scheduleType: string;
    };
  }> {
    const objectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    const mentor = await this.findByUserId(objectId);
    
    const availabilityStats = {
      totalSlots: 0,
      availableDays: 0,
      scheduleType: 'manual'
    };

    if (mentor?.weeklySchedule) {
      availabilityStats.totalSlots = Object.values(mentor.weeklySchedule).reduce(
        (total, day) => total + (day.timeSlots?.length || 0), 0
      );
      availabilityStats.availableDays = Object.values(mentor.weeklySchedule).filter(
        day => day.isAvailable && day.timeSlots && day.timeSlots.length > 0
      ).length;
    }
    
    // TODO: Calculate actual session stats from sessions collection
    return {
      totalSessions: 0,
      completedSessions: 0,
      upcomingSessions: 0,
      totalEarnings: 0,
      availabilityStats
    };
  }
}

export class MentorVerificationRepository extends BaseRepository<MentorVerification> {
  constructor() {
    super('mentorVerifications');
  }

  async findByUserId(userId: string | ObjectId): Promise<MentorVerification | null> {
    const objectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    return this.findOne({ userId: objectId } as Filter<MentorVerification>);
  }

  async createSimplifiedVerification(
    userId: string | ObjectId,
    data: {
      resume?: any;
      additionalInfo: {
        linkedinProfile?: string;
        personalWebsite?: string;
        additionalNotes?: string;
        agreeToTerms: boolean;
      };
    }
  ): Promise<MentorVerification> {
    const objectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    
    const verificationData = {
      userId: objectId,
      status: 'pending' as const,
      verificationMethod: 'simplified' as const,
      resume: data.resume || null,
      additionalInfo: data.additionalInfo,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await this.create(verificationData);
    return result;
  }

  async updateSimplifiedVerification(
    userId: string | ObjectId,
    data: {
      resume?: any;
      additionalInfo: {
        linkedinProfile?: string;
        personalWebsite?: string;
        additionalNotes?: string;
        agreeToTerms: boolean;
      };
    }
  ): Promise<MentorVerification | null> {
    return this.update(userId, {
      resume: data.resume || null,
      additionalInfo: data.additionalInfo,
      verificationMethod: 'simplified',
      updatedAt: new Date()
    } as Partial<MentorVerification>);
  }

  async findPendingVerifications(): Promise<MentorVerification[]> {
    const result = await this.findMany(
      { status: 'pending' } as Filter<MentorVerification>,
      { sort: { createdAt: 1 } }
    );
    return result.items;
  }

  async findSimplifiedVerifications(): Promise<MentorVerification[]> {
    const result = await this.findMany(
      { verificationMethod: 'simplified' } as Filter<MentorVerification>,
      { sort: { createdAt: -1 } }
    );
    return result.items;
  }

  async updateVerificationStatus(
    userId: string | ObjectId, 
    status: 'approved' | 'rejected',
    notes?: string,
    verifiedBy?: ObjectId
  ): Promise<MentorVerification | null> {
    return this.update(userId, {
      status,
      notes,
      verifiedBy,
      verifiedAt: new Date(),
      updatedAt: new Date()
    } as Partial<MentorVerification>);
  }

  async getVerificationStats(): Promise<{
    totalApplications: number;
    pendingApplications: number;
    approvedApplications: number;
    rejectedApplications: number;
    simplifiedApplications: number;
  }> {
    // TODO: Implement aggregation pipeline for stats
    return {
      totalApplications: 0,
      pendingApplications: 0,
      approvedApplications: 0,
      rejectedApplications: 0,
      simplifiedApplications: 0
    };
  }
}

// Session repository for manual booking system
export class SessionRepository extends BaseRepository<Session> {
  constructor() {
    super('sessions');
  }

  async findByMentorId(mentorId: string | ObjectId): Promise<Session[]> {
    const objectId = typeof mentorId === 'string' ? new ObjectId(mentorId) : mentorId;
    const result = await this.findMany(
      { mentorId: objectId } as Filter<Session>,
      { sort: { scheduledAt: -1 } }
    );
    return result.items;
  }

  async createManualSession(data: {
    mentorId: ObjectId;
    studentId?: ObjectId;
    scheduledAt: Date;
    durationMinutes: number;
    priceINR: number;
    studentEmail?: string;
    studentName?: string;
    studentNotes?: string;
  }): Promise<Session> {
    const sessionData = {
      ...data,
      endTime: new Date(data.scheduledAt.getTime() + data.durationMinutes * 60000),
      status: 'scheduled' as const,
      bookingMethod: 'manual' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return this.create(sessionData);
  }

  async getUpcomingSessions(mentorId: string | ObjectId): Promise<Session[]> {
    const objectId = typeof mentorId === 'string' ? new ObjectId(mentorId) : mentorId;
    const now = new Date();
    
    const result = await this.findMany(
      { 
        mentorId: objectId,
        scheduledAt: { $gte: now },
        status: { $in: ['scheduled', 'confirmed'] }
      } as Filter<Session>,
      { sort: { scheduledAt: 1 } }
    );
    return result.items;
  }

  async getSessionsForDateRange(
    mentorId: string | ObjectId,
    startDate: Date,
    endDate: Date
  ): Promise<Session[]> {
    const objectId = typeof mentorId === 'string' ? new ObjectId(mentorId) : mentorId;
    
    const result = await this.findMany(
      {
        mentorId: objectId,
        scheduledAt: {
          $gte: startDate,
          $lte: endDate
        }
      } as Filter<Session>,
      { sort: { scheduledAt: 1 } }
    );
    return result.items;
  }

  async updateSessionStatus(
    sessionId: string | ObjectId, 
    status: Session['status'],
    additionalData?: Partial<Session>
  ): Promise<Session | null> {
    return this.update(sessionId, {
      status,
      ...additionalData,
      updatedAt: new Date()
    } as Partial<Session>);
  }

  async cancelSession(
    sessionId: string | ObjectId,
    cancelledBy: ObjectId,
    reason?: string
  ): Promise<Session | null> {
    return this.update(sessionId, {
      status: 'cancelled',
      cancelledBy,
      cancellationReason: reason,
      cancelledAt: new Date(),
      updatedAt: new Date()
    } as Partial<Session>);
  }

  async addMentorNotes(sessionId: string | ObjectId, notes: string): Promise<Session | null> {
    return this.update(sessionId, {
      mentorNotes: notes,
      updatedAt: new Date()
    } as Partial<Session>);
  }

  async getSessionStats(mentorId: string | ObjectId): Promise<{
    totalSessions: number;
    completedSessions: number;
    upcomingSessions: number;
    cancelledSessions: number;
    totalEarnings: number;
    thisMonthSessions: number;
    thisMonthEarnings: number;
  }> {
    const objectId = typeof mentorId === 'string' ? new ObjectId(mentorId) : mentorId;
    
    // TODO: Implement aggregation pipeline for comprehensive stats
    // For now, return basic structure
    return {
      totalSessions: 0,
      completedSessions: 0,
      upcomingSessions: 0,
      cancelledSessions: 0,
      totalEarnings: 0,
      thisMonthSessions: 0,
      thisMonthEarnings: 0
    };
  }

  async isTimeSlotAvailable(
    mentorId: string | ObjectId,
    scheduledAt: Date,
    durationMinutes: number
  ): Promise<boolean> {
    const objectId = typeof mentorId === 'string' ? new ObjectId(mentorId) : mentorId;
    const endTime = new Date(scheduledAt.getTime() + durationMinutes * 60000);

    // Check for overlapping sessions
    const conflictingSessions = await this.findMany({
      mentorId: objectId,
      status: { $in: ['scheduled', 'confirmed', 'in_progress'] },
      $or: [
        {
          scheduledAt: { $lt: endTime },
          endTime: { $gt: scheduledAt }
        }
      ]
    } as Filter<Session>);

    return conflictingSessions.items.length === 0;
  }
}