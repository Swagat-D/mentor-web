// hooks/useStudents.ts
import { useState, useEffect, useCallback } from 'react';

export interface Student {
  _id: string;
  email: string;
  name: string;
  role: 'mentee';
  avatar: string | null;
  phone: string | null;
  gender: string;
  ageRange: string;
  studyLevel: string;
  bio: string | null;
  location: string | null;
  timezone: string;
  goals: string[];
  isEmailVerified: boolean;
  isActive: boolean;
  isOnboarded: boolean;
  onboardingStatus: string;
  lastLoginAt: string;
  stats: {
    totalHoursLearned: number;
    sessionsCompleted: number;
    mentorsConnected: number;
    studyStreak: number;
    completionRate: number;
    monthlyHours: number;
    weeklyGoalProgress: number;
    averageRating: number;
  };
  createdAt: string;
  updatedAt: string;
  isTestGiven: boolean;
  // Computed fields
  subjects: string[];
  totalSessions: number;
  completedSessions: number;
  totalEarnings: number;
  averageRating: number;
  lastSession: string | null;
  nextSession: string | null;
  status: 'active' | 'new' | 'inactive';
}

export interface StudentsResponse {
  success: boolean;
  data: Student[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  filters: {
    all: number;
    'my-students': number;
  };
}

export interface UseStudentsParams {
  filter?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface UseStudentsReturn {
  students: Student[];
  loading: boolean;
  error: string | null;
  pagination: StudentsResponse['pagination'];
  filters: StudentsResponse['filters'];
  refetch: () => Promise<void>;
  sendMessage: (studentId: string, subject: string, message: string) => Promise<boolean>;
}

export function useStudents(params: UseStudentsParams = {}): UseStudentsReturn {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({
    all: 0,
    'my-students': 0
  });

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams({
        filter: params.filter || 'all',
        search: params.search || '',
        page: (params.page || 1).toString(),
        limit: (params.limit || 20).toString()
      });

      const response = await fetch(`/api/students?${searchParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }

      const data: StudentsResponse = await response.json();
      
      if (data.success) {
        setStudents(data.data);
        setPagination(data.pagination);
        setFilters(data.filters);
      } else {
        throw new Error('Failed to load students');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [params.filter, params.search, params.page, params.limit]);

  const sendMessage = useCallback(async (studentId: string, subject: string, message: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/students/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId,
          subject,
          message
        })
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return {
    students,
    loading,
    error,
    pagination,
    filters,
    refetch: fetchStudents,
    sendMessage
  };
}