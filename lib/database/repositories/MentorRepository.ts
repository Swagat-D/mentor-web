/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Filter, ObjectId } from 'mongodb';
import { BaseRepository } from './BaseRepository';
import { MentorProfile, MentorVerification, Session } from '../models/User';

export class MentorProfileRepository extends BaseRepository<MentorProfile> {
  constructor() {
    super('mentorProfiles');
  }

  async findByUserId(userId: string | ObjectId): Promise<MentorProfile | null> {
    const objectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    return this.findOne({ userId: objectId } as Filter<MentorProfile>);
  }

  async findByCalComUsername(username: string): Promise<MentorProfile | null> {
    return this.findOne({ calComUsername: username } as Filter<MentorProfile>);
  }

  async updateCalComIntegration(
    userId: string | ObjectId, 
    data: {
      calComUsername: string;
      calComEventTypes: any[];
      hourlyRateINR: number;
    }
  ): Promise<MentorProfile | null> {
    return this.update(userId, {
      calComUsername: data.calComUsername,
      calComEventTypes: data.calComEventTypes,
      hourlyRateINR: data.hourlyRateINR,
      calComVerified: true,
      calComLastSync: new Date(),
      profileStep: 'availability',
      updatedAt: new Date()
    } as Partial<MentorProfile>);
  }

  async syncCalComEventTypes(userId: string | ObjectId, eventTypes: any[]): Promise<MentorProfile | null> {
    return this.update(userId, {
      calComEventTypes: eventTypes,
      calComLastSync: new Date(),
      updatedAt: new Date()
    } as Partial<MentorProfile>);
  }

  async searchMentors(filters: {
    expertise?: string[];
    location?: string;
    languages?: string[];
    priceRange?: { min: number; max: number };
    verified?: boolean;
  }): Promise<MentorProfile[]> {
    const query: Filter<MentorProfile> = { 
      isProfileComplete: true,
      calComVerified: true // Only show mentors with Cal.com integration
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
        calComVerified: true,
        profileStep: 'complete'
      } as Filter<MentorProfile>,
      { sort: { updatedAt: -1 } }
    );
    return result.items;
  }

  async getMentorStats(userId: string | ObjectId): Promise<{
    totalSessions: number;
    completedSessions: number;
    upcomingSessions: number;
    totalEarnings: number;
  }> {
    const objectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    
    // This would typically use aggregation pipeline
    // For now, return basic structure
    return {
      totalSessions: 0,
      completedSessions: 0,
      upcomingSessions: 0,
      totalEarnings: 0
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

  async findPendingVerifications(): Promise<MentorVerification[]> {
    const result = await this.findMany(
      { status: 'pending' } as Filter<MentorVerification>,
      { sort: { createdAt: 1 } }
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
}

// Session repository for mentor dashboard (read-only Cal.com data)
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

  async findByCalComBookingId(bookingId: string): Promise<Session | null> {
    return this.findOne({ calComBookingId: bookingId } as Filter<Session>);
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

  async updateSessionStatus(
    calComBookingId: string, 
    status: Session['status'],
    additionalData?: Partial<Session>
  ): Promise<Session | null> {
    return this.update(
      { calComBookingId } as any,
      {
        status,
        ...additionalData,
        updatedAt: new Date()
      } as Partial<Session>
    );
  }

  async addMentorNotes(sessionId: string | ObjectId, notes: string): Promise<Session | null> {
    return this.update(sessionId, {
      mentorNotes: notes,
      updatedAt: new Date()
    } as Partial<Session>);
  }
}