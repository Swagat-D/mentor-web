import { Filter, ObjectId } from 'mongodb';
import { BaseRepository } from './BaseRepository';
import { Session } from '../models/User';

export class SessionRepository extends BaseRepository<Session> {
  constructor() {
    super('sessions');
  }

  async findByMentorId(mentorId: string | ObjectId, options?: {
    status?: string;
    limit?: number;
    skip?: number;
  }): Promise<{ items: Session[]; total: number }> {
    const objectId = typeof mentorId === 'string' ? new ObjectId(mentorId) : mentorId;
    const filter: Filter<Session> = { mentorId: objectId };

    if (options?.status) {
      filter.status = options.status as Session['status'];
    }

    return this.findMany(filter, {
      limit: options?.limit,
      skip: options?.skip,
      sort: { scheduledAt: -1 }
    });
  }

  async findByStudentId(studentId: string | ObjectId, options?: {
    status?: string;
    limit?: number;
    skip?: number;
  }): Promise<{ items: Session[]; total: number }> {
    const objectId = typeof studentId === 'string' ? new ObjectId(studentId) : studentId;
    const filter: Filter<Session> = { studentId: objectId };

    if (options?.status) {
      filter.status = options.status as Session['status'];
    }

    return this.findMany(filter, {
      limit: options?.limit,
      skip: options?.skip,
      sort: { scheduledAt: -1 }
    });
  }

  async findUpcomingSessions(userId: string | ObjectId): Promise<Session[]> {
    const objectId = typeof userId === 'string' ? new ObjectId(userId) : userId;
    const now = new Date();

    const result = await this.findMany({
      $or: [
        { mentorId: objectId },
        { studentId: objectId }
      ],
      scheduledAt: { $gt: now },
      status: 'scheduled'
    } as Filter<Session>, {
      sort: { scheduledAt: 1 },
      limit: 10
    });

    return result.items;
  }

  async updateSessionStatus(
    sessionId: string | ObjectId,
    status: Session['status'],
    additionalData?: Partial<Session>
  ): Promise<Session | null> {
    return this.update(sessionId, {
      status,
      ...additionalData
    });
  }
}