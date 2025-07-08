import { Filter, ObjectId } from 'mongodb';
import { BaseRepository } from './BaseRepository';
import { User } from '../models/User';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super('users');
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ email: email.toLowerCase() });
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    return this.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() }
    } as Filter<User>);
  }

  async findByResetToken(token: string): Promise<User | null> {
    return this.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    } as Filter<User>);
  }

  async updateLastLogin(userId: string | ObjectId): Promise<void> {
    await this.update(userId, { lastLoginAt: new Date() } as Partial<User>);
  }

  async verifyEmail(userId: string | ObjectId): Promise<User | null> {
    return this.update(userId, {
      isVerified: true,
      emailVerificationToken: undefined,
      emailVerificationExpires: undefined,
    } as Partial<User>);
  }

  async setVerificationToken(userId: string | ObjectId, token: string, expires: Date): Promise<User | null> {
    return this.update(userId, {
      emailVerificationToken: token,
      emailVerificationExpires: expires,
    } as Partial<User>);
  }

  async setPasswordResetToken(userId: string | ObjectId, token: string, expires: Date): Promise<User | null> {
    return this.update(userId, {
      passwordResetToken: token,
      passwordResetExpires: expires,
    } as Partial<User>);
  }

  async updatePassword(userId: string | ObjectId, passwordHash: string): Promise<User | null> {
    return this.update(userId, {
      passwordHash,
      passwordResetToken: undefined,
      passwordResetExpires: undefined,
    } as Partial<User>);
  }
}