import bcrypt from 'bcrypt';

export class BcryptUtil {
  private static rounds = parseInt(process.env.BCRYPT_ROUNDS || '12');

  static async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.rounds);
  }

  static async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}