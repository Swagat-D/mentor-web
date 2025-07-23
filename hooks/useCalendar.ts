/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback, useMemo } from 'react';

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  type: 'video' | 'audio' | 'chat';
  mentor: {
    _id: string;
    name: string;
    displayName?: string;
    email: string;
    avatar?: string;
  };
  student: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  payment: {
    amount: number;
    currency: string;
    status: 'pending' | 'paid' | 'refunded';
  };
  notes?: string;
  feedback?: string;
  rating?: number;
  duration: number;
  extendedProps: {
    sessionId: string;
    mentorId: string;
    studentId: string;
    originalData: any;
  };
}

export interface CalendarStats {
  total: number;
  completed: number;
  upcoming: number;
  cancelled: number;
  inProgress: number;
  totalEarnings: number;
}

export interface UseCalendarParams {
  view?: 'month' | 'week' | 'day';
  date?: Date;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseCalendarReturn {
  // Data
  events: CalendarEvent[];
  stats: CalendarStats;
  loading: boolean;
  error: string | null;
  
  // Calendar state
  currentDate: Date;
  viewMode: 'month' | 'week' | 'day';
  
  // Actions
  setCurrentDate: (date: Date) => void;
  setViewMode: (mode: 'month' | 'week' | 'day') => void;
  refetch: () => Promise<void>;
  
  // Event management
  createSession: (sessionData: CreateSessionData) => Promise<boolean>;
  updateSessionStatus: (sessionId: string, status: string) => Promise<boolean>;
  deleteSession: (sessionId: string) => Promise<boolean>;
  bulkUpdateSessions: (sessionIds: string[], action: BulkAction) => Promise<boolean>;
  
  // Utility functions
  getEventsForDate: (date: Date) => CalendarEvent[];
  getTodaysEvents: () => CalendarEvent[];
  getUpcomingEvents: (limit?: number) => CalendarEvent[];
  
  // Google Calendar integration
  googleCalendar: {
    isConnected: boolean;
    connect: () => Promise<string>;
    sync: () => Promise<void>;
    syncLoading: boolean;
  };
}

export interface CreateSessionData {
  studentId: string;
  subject: string;
  scheduledAt: string;
  duration: number;
  type: 'video' | 'audio' | 'chat';
  notes?: string;
}

export interface BulkAction {
  type: 'status-update' | 'reschedule' | 'delete';
  data: any;
}

export function useCalendar(params: UseCalendarParams = {}): UseCalendarReturn {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [stats, setStats] = useState<CalendarStats>({
    total: 0,
    completed: 0,
    upcoming: 0,
    cancelled: 0,
    inProgress: 0,
    totalEarnings: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(params.date || new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>(params.view || 'month');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [googleConnected, setGoogleConnected] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);

  // Calculate date range based on view mode
  const dateRange = useMemo(() => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);

    switch (viewMode) {
      case 'day':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'week':
        start.setDate(start.getDate() - start.getDay());
        start.setHours(0, 0, 0, 0);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
      case 'month':
      default:
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(end.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        break;
    }

    return { start: start.toISOString(), end: end.toISOString() };
  }, [currentDate, viewMode]);

  // Fetch calendar events
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams({
        start: dateRange.start,
        end: dateRange.end,
        view: viewMode
      });

      const response = await fetch(`/api/calendar/events?${searchParams}`);
      const data = await response.json();

      if (data.success) {
        setEvents(data.data);
        setStats(data.stats);
      } else {
        throw new Error(data.message || 'Failed to fetch calendar events');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [dateRange.start, dateRange.end, viewMode]);

  // Create new session
  const createSession = useCallback(async (sessionData: CreateSessionData): Promise<boolean> => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      });

      const data = await response.json();

      if (data.success) {
        await fetchEvents();
        return true;
      } else {
        setError(data.message || 'Failed to create session');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
      return false;
    }
  }, [fetchEvents]);

  // Update session status
  const updateSessionStatus = useCallback(async (sessionId: string, status: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      const data = await response.json();

      if (data.success) {
        await fetchEvents();
        return true;
      } else {
        setError(data.message || 'Failed to update session');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update session');
      return false;
    }
  }, [fetchEvents]);

  // Delete session
  const deleteSession = useCallback(async (sessionId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        await fetchEvents();
        return true;
      } else {
        setError(data.message || 'Failed to delete session');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete session');
      return false;
    }
  }, [fetchEvents]);

  // Bulk update sessions
  const bulkUpdateSessions = useCallback(async (sessionIds: string[], action: BulkAction): Promise<boolean> => {
    try {
      const response = await fetch('/api/calendar/bulk-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: action.type,
          sessionIds,
          ...action.data
        })
      });

      const data = await response.json();

      if (data.success) {
        await fetchEvents();
        return true;
      } else {
        setError(data.message || 'Failed to perform bulk action');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform bulk action');
      return false;
    }
  }, [fetchEvents]);

  // Utility functions
  const getEventsForDate = useCallback((date: Date): CalendarEvent[] => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === date.toDateString();
    });
  }, [events]);

  const getTodaysEvents = useCallback((): CalendarEvent[] => {
    const today = new Date();
    return getEventsForDate(today).sort((a, b) => 
      new Date(a.start).getTime() - new Date(b.start).getTime()
    );
  }, [getEventsForDate]);

  const getUpcomingEvents = useCallback((limit: number = 5): CalendarEvent[] => {
    const now = new Date();
    return events
      .filter(event => 
        new Date(event.start) > now && 
        event.status === 'scheduled'
      )
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
      .slice(0, limit);
  }, [events]);

  // Google Calendar integration
  const connectGoogleCalendar = useCallback(async (): Promise<string> => {
    try {
      const response = await fetch('/api/calendar/google?action=auth-url');
      const data = await response.json();

      if (data.success) {
        return data.data.authUrl;
      } else {
        throw new Error(data.message || 'Failed to get Google Calendar auth URL');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect Google Calendar');
      throw err;
    }
  }, []);

  const syncGoogleCalendar = useCallback(async (): Promise<void> => {
    try {
      setSyncLoading(true);
      const response = await fetch('/api/calendar/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync-sessions' })
      });

      const data = await response.json();

      if (data.success) {
        await fetchEvents();
      } else {
        throw new Error(data.message || 'Failed to sync with Google Calendar');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync Google Calendar');
    } finally {
      setSyncLoading(false);
    }
  }, [fetchEvents]);

  // Auto-refresh functionality
  useEffect(() => {
    if (params.autoRefresh && params.refreshInterval) {
      const interval = setInterval(fetchEvents, params.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [params.autoRefresh, params.refreshInterval, fetchEvents]);

  // Initial fetch
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    // Data
    events,
    stats,
    loading,
    error,
    
    // Calendar state
    currentDate,
    viewMode,
    
    // Actions
    setCurrentDate,
    setViewMode,
    refetch: fetchEvents,
    
    // Event management
    createSession,
    updateSessionStatus,
    deleteSession,
    bulkUpdateSessions,
    
    // Utility functions
    getEventsForDate,
    getTodaysEvents,
    getUpcomingEvents,
    
    // Google Calendar integration
    googleCalendar: {
      isConnected: googleConnected,
      connect: connectGoogleCalendar,
      sync: syncGoogleCalendar,
      syncLoading
    }
  };
}