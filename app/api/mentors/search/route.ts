import { NextRequest, NextResponse } from 'next/server';
import { MentorProfileRepository } from '@/lib/database/repositories/MentorRepository';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    const filters = {
      expertise: searchParams.get('expertise')?.split(',').filter(Boolean),
      location: searchParams.get('location') || undefined,
      languages: searchParams.get('languages')?.split(',').filter(Boolean),
      rating: searchParams.get('rating') ? parseFloat(searchParams.get('rating')!) : undefined,
      priceRange: searchParams.get('minPrice') && searchParams.get('maxPrice') ? {
        min: parseFloat(searchParams.get('minPrice')!),
        max: parseFloat(searchParams.get('maxPrice')!)
      } : undefined,
    };

    const mentorProfileRepository = new MentorProfileRepository();
    const mentors = await mentorProfileRepository.searchMentors(filters);

    return NextResponse.json({
      success: true,
      data: mentors,
      total: mentors.length
    });

  } catch (error) {
    console.error('Search mentors error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}