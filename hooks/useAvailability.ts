import { useState, useEffect, useCallback } from 'react';

export interface TimeSlot {
  time: string;
  available: boolean;
  booked?: boolean;
  sessionId?: string;
}

export interface DayAvailability {
  start: string;
  end: string;
  available: boolean;
}

export interface WeeklyAvailability {
  monday: DayAvailability;
  tuesday: DayAvailability;
  wednesday: DayAvailability;
  thursday: DayAvailability;
  friday: DayAvailability;
  saturday: DayAvailability;
  sunday: DayAvailability;
}

export interface UseAvailabilityReturn {
  availability: WeeklyAvailability | null;
  timeSlots: TimeSlot[];
  loading: boolean;
  error: string | null;
  updateAvailability: (newAvailability: WeeklyAvailability) => Promise<boolean>;
  getAvailableSlots: (date: string) => Promise<TimeSlot[]>;
  isTimeSlotAvailable: (date: string, time: string) => boolean;
}

export function useAvailability(): UseAvailabilityReturn {
  const [availability, setAvailability] = useState<WeeklyAvailability | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailability = useCallback(async (date?: string) => {
    try {
      setLoading(true);
      setError(null);

      const url = date 
        ? `/api/calendar/availability?date=${date}`
        : '/api/calendar/availability';

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        if (date) {
          setTimeSlots(data.data.availableSlots.map((time: string) => ({
            time,
            available: true,
            booked: false
          })));
        } else {
          setAvailability(data.data.availability);
        }
      } else {
        throw new Error(data.message || 'Failed to fetch availability');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAvailability = useCallback(async (newAvailability: WeeklyAvailability): Promise<boolean> => {
    try {
      const response = await fetch('/api/calendar/availability', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability: newAvailability })
      });

      const data = await response.json();

      if (data.success) {
        setAvailability(newAvailability);
        return true;
      } else {
        setError(data.message || 'Failed to update availability');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update availability');
      return false;
    }
  }, []);

  const getAvailableSlots = useCallback(async (date: string): Promise<TimeSlot[]> => {
    try {
      const response = await fetch(`/api/calendar/availability?date=${date}`);
      const data = await response.json();

      if (data.success) {
        return data.data.availableSlots.map((time: string) => ({
          time,
          available: true,
          booked: false
        }));
      } else {
        throw new Error(data.message || 'Failed to fetch available slots');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch available slots');
      return [];
    }
  }, []);

  const isTimeSlotAvailable = useCallback((): boolean => {
    // This would check against fetched availability data
    // Implementation depends on how you want to cache/store the data
    return true; // Placeholder
  }, []);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  return {
    availability,
    timeSlots,
    loading,
    error,
    updateAvailability,
    getAvailableSlots,
    isTimeSlotAvailable
  };
}