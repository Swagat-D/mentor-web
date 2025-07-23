/* eslint-disable @typescript-eslint/no-explicit-any */
export class CalendarUtils {
  static formatTime(date: string | Date): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  static formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  static getStatusColor(status: string): string {
    switch (status) {
      case 'confirmed':
      case 'scheduled':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed':
        return 'bg-success-100 text-success-700 border-success-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'in-progress':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-warm-100 text-warm-700 border-warm-200';
    }
  }

  static getCalendarDays(currentDate: Date): Date[] {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }

  static getWeekDays(currentDate: Date): Date[] {
    const days = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    
    return days;
  }

  static generateTimeSlots(startTime: string, endTime: string, intervalMinutes: number = 30): string[] {
    const slots: string[] = [];
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    let currentHour = startHour;
    let currentMinute = startMinute;
    
    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
      const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      slots.push(timeString);
      
      currentMinute += intervalMinutes;
      if (currentMinute >= 60) {
        currentHour += Math.floor(currentMinute / 60);
        currentMinute = currentMinute % 60;
      }
    }
    
    return slots;
  }

  static isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  static isSameMonth(date1: Date, date2: Date): boolean {
    return date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
  }

  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  static addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  static getSessionDuration(start: string, end: string): number {
    const startTime = new Date(start);
    const endTime = new Date(end);
    return Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
  }

  static getTimeUntilSession(scheduledAt: string): string {
    const now = new Date();
    const sessionTime = new Date(scheduledAt);
    const diffMs = sessionTime.getTime() - now.getTime();
    
    if (diffMs < 0) return 'Past';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 24) {
      const diffDays = Math.floor(diffHours / 24);
      return `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
      return `in ${diffHours}h ${diffMinutes}m`;
    } else {
      return `in ${diffMinutes}m`;
    }
  }

  static validateTimeSlot(date: string, time: string, duration: number, existingSessions: any[]): boolean {
    const sessionStart = new Date(`${date}T${time}:00`);
    const sessionEnd = new Date(sessionStart.getTime() + duration * 60000);
    
    // Check if slot conflicts with existing sessions
    return !existingSessions.some(session => {
      const existingStart = new Date(session.scheduledAt);
      const existingEnd = new Date(existingStart.getTime() + session.duration * 60000);
      
      return (sessionStart < existingEnd && sessionEnd > existingStart);
    });
  }

  static getConflictingSessions(date: string, time: string, duration: number, sessions: any[]): any[] {
    const sessionStart = new Date(`${date}T${time}:00`);
    const sessionEnd = new Date(sessionStart.getTime() + duration * 60000);
    
    return sessions.filter(session => {
      const existingStart = new Date(session.scheduledAt);
      const existingEnd = new Date(existingStart.getTime() + session.duration * 60000);
      
      return (sessionStart < existingEnd && sessionEnd > existingStart);
    });
  }
}

