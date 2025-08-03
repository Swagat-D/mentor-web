/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';

export interface CalComEventType {
  id: number;
  title: string;
  slug: string;
  duration: number;
  price: number; // Calculated from hourlyRate
}

export interface MentorAvailabilityData {
  username: string;
  verified: boolean;
  eventTypes: CalComEventType[];
  hourlyRateINR: number;
  profileUrl: string;
  lastSync: Date | null;
}

export interface AvailabilitySlot {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  eventTypeId: number;
  available: boolean;
  booked: boolean;
}

export interface UseMentorAvailabilityReturn {
  availabilityData: MentorAvailabilityData | null;
  availableSlots: AvailabilitySlot[];
  loading: boolean;
  error: string | null;
  verifyUsername: (username: string) => Promise<boolean>;
  updateHourlyRate: (rate: number) => Promise<boolean>;
  syncEventTypes: () => Promise<boolean>;
  getAvailabilityPreview: (days?: number) => Promise<AvailabilitySlot[]>;
  refreshData: () => Promise<void>;
}

export function useMentorAvailability(): UseMentorAvailabilityReturn {
  const [availabilityData, setAvailabilityData] = useState<MentorAvailabilityData | null>(null);
  const [availableSlots, setAvailableSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMentorAvailability = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/mentor/profile/availability');
      const data = await response.json();

      if (data.success) {
        setAvailabilityData(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch availability data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyUsername = useCallback(async (username: string): Promise<boolean> => {
    try {
      setError(null);
      
      const response = await fetch('/api/calcom/verify-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });

      const data = await response.json();

      if (data.success) {
        // Update local state with verified data
        if (availabilityData) {
          setAvailabilityData({
            ...availabilityData,
            username: data.username,
            verified: true,
            eventTypes: data.eventTypes.map((et: any) => ({
              ...et,
              price: availabilityData.hourlyRateINR 
                ? Math.round((availabilityData.hourlyRateINR / 60) * et.duration)
                : 0
            }))
          });
        }
        return true;
      } else {
        setError(data.message);
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
      return false;
    }
  }, [availabilityData]);

  const updateHourlyRate = useCallback(async (rate: number): Promise<boolean> => {
    try {
      setError(null);

      const response = await fetch('/api/mentor/profile/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hourlyRateINR: rate })
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        if (availabilityData) {
          setAvailabilityData({
            ...availabilityData,
            hourlyRateINR: rate,
            eventTypes: availabilityData.eventTypes.map(et => ({
              ...et,
              price: Math.round((rate / 60) * et.duration)
            }))
          });
        }
        return true;
      } else {
        setError(data.message);
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update rate');
      return false;
    }
  }, [availabilityData]);

  const syncEventTypes = useCallback(async (): Promise<boolean> => {
    if (!availabilityData?.username) {
      setError('No username configured');
      return false;
    }

    try {
      setError(null);

      const response = await fetch('/api/calcom/sync-event-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: availabilityData.username })
      });

      const data = await response.json();

      if (data.success) {
        setAvailabilityData({
          ...availabilityData,
          eventTypes: data.eventTypes.map((et: any) => ({
            ...et,
            price: Math.round((availabilityData.hourlyRateINR / 60) * et.duration)
          })),
          lastSync: new Date()
        });
        return true;
      } else {
        setError(data.message);
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
      return false;
    }
  }, [availabilityData]);

  const getAvailabilityPreview = useCallback(async (days: number = 7): Promise<AvailabilitySlot[]> => {
    if (!availabilityData?.username || !availabilityData?.verified) {
      setError('Cal.com integration not configured');
      return [];
    }

    try {
      setError(null);

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + days);

      const response = await fetch('/api/calcom/availability-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: availabilityData.username,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        })
      });

      const data = await response.json();

      if (data.success) {
        const slots = data.slots || [];
        setAvailableSlots(slots);
        return slots;
      } else {
        setError(data.message);
        return [];
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch availability');
      return [];
    }
  }, [availabilityData]);

  const refreshData = useCallback(async () => {
    await fetchMentorAvailability();
    if (availabilityData?.verified) {
      await getAvailabilityPreview();
    }
  }, [fetchMentorAvailability, getAvailabilityPreview, availabilityData?.verified]);

  // Initial load
  useEffect(() => {
    fetchMentorAvailability();
  }, [fetchMentorAvailability]);

  return {
    availabilityData,
    availableSlots,
    loading,
    error,
    verifyUsername,
    updateHourlyRate,
    syncEventTypes,
    getAvailabilityPreview,
    refreshData
  };
}

// Utility hook for real-time session management
export function useMentorSessions() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/mentor/sessions');
      const data = await response.json();
      
      if (data.success) {
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addSessionNotes = useCallback(async (sessionId: string, notes: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/mentor/sessions/${sessionId}/notes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      });

      const data = await response.json();
      
      if (data.success) {
        // Update local session
        setSessions(prev => prev.map(session => 
          session._id === sessionId 
            ? { ...session, mentorNotes: notes }
            : session
        ));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to add notes:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    fetchSessions();
    
    // Poll for updates every 5 minutes
    const interval = setInterval(fetchSessions, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchSessions]);

  return {
    sessions,
    loading,
    refreshSessions: fetchSessions,
    addSessionNotes
  };
}