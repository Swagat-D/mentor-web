/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth/middleware';
import { UploadService } from '@/lib/services/upload.service';

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = (formData.get('type') as string) || 'document';

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    const result = await UploadService.uploadFile(file, req.user!.userId, type as 'profile' | 'document');

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      data: result
    });

  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Upload failed' },
      { status: 500 }
    );
  }
});