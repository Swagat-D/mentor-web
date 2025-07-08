import { Filter, ObjectId } from 'mongodb';
import { BaseRepository } from './BaseRepository';
import { MentorProfile, MentorVerification, MentorAvailability, MentorPricing } from '../models/User';

export class MentorProfileRepository extends BaseRepository<MentorProfile> {
  constructor() {
    super('mentorProfiles');
  }

  async findByUserId(userId: string | ObjectId): Promise<MentorProfile | null> {
    const objectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    return this.findOne({ userId: objectId } as Filter<MentorProfile>);
  }

  async searchMentors(filters: {
    expertise?: string[];
    location?: string;
    languages?: string[];
    rating?: number;
    priceRange?: { min: number; max: number };
  }): Promise<MentorProfile[]> {
    const query: Filter<MentorProfile> = { isProfileComplete: true };

    if (filters.expertise?.length) {
      query.expertise = { $in: filters.expertise };
    }

    if (filters.location) {
      query.location = { $regex: filters.location, $options: 'i' };
    }

    if (filters.languages?.length) {
      query.languages = { $in: filters.languages };
    }

    const result = await this.findMany(query, {
      sort: { updatedAt: -1 },
      limit: 50
    });

    return result.items;
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
}

export class MentorAvailabilityRepository extends BaseRepository<MentorAvailability> {
  constructor() {
    super('mentorAvailability');
  }

  async findByUserId(userId: string | ObjectId): Promise<MentorAvailability | null> {
    const objectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    return this.findOne({ userId: objectId } as Filter<MentorAvailability>);
  }
}

export class MentorPricingRepository extends BaseRepository<MentorPricing> {
  constructor() {
    super('mentorPricing');
  }

  async findByUserId(userId: string | ObjectId): Promise<MentorPricing | null> {
    const objectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    return this.findOne({ userId: objectId } as Filter<MentorPricing>);
  }
}