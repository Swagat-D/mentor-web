import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export class UploadService {
  private static uploadDir = join(process.cwd(), 'public', 'uploads');
  
  static async ensureUploadDir() {
    if (!existsSync(this.uploadDir)) {
      await mkdir(this.uploadDir, { recursive: true });
    }
  }

  static async uploadFile(file: File, userId: string, type: 'profile' | 'document' = 'document'): Promise<{ url: string; filename: string }> {
    await this.ensureUploadDir();

    // Validate file
    const maxSize = type === 'profile' ? 5 * 1024 * 1024 : 10 * 1024 * 1024; // 5MB for profile, 10MB for documents
    const allowedTypes = type === 'profile' 
      ? ['image/jpeg', 'image/png', 'image/jpg']
      : ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];

    if (file.size > maxSize) {
      throw new Error(`File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`);
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `${userId}_${type}_${timestamp}.${extension}`;
    
    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filepath = join(this.uploadDir, filename);
    
    await writeFile(filepath, buffer);

    return {
      url: `/uploads/${filename}`,
      filename
    };
  }

  static async uploadMultipleFiles(files: File[], userId: string, type: 'document' = 'document'): Promise<Array<{ url: string; filename: string; originalName: string }>> {
    const results = [];
    
    for (const file of files) {
      const result = await this.uploadFile(file, userId, type);
      results.push({
        ...result,
        originalName: file.name
      });
    }
    
    return results;
  }
}