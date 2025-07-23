import React from 'react';
import { motion } from 'framer-motion';
import { CalendarEvent, CalendarStats } from '../hooks/useCalendar';
import { CalendarUtils } from '../utils/calendar';
import { CalendarIcon, ChevronLeft, ChevronRight, Download, Plus } from 'lucide-react';

export interface CalendarHeaderProps {
  currentDate: Date;
  viewMode: 'month' | 'week' | 'day';
  stats: CalendarStats;
  onDateChange: (date: Date) => void;
  onViewModeChange: (mode: 'month' | 'week' | 'day') => void;
  onNewSession: () => void;
  onExport: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  viewMode,
  stats,
  onDateChange,
  onViewModeChange,
  onNewSession,
  onExport
}) => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const navigateMonth = (direction: number) => {
    const newDate = CalendarUtils.addMonths(currentDate, direction);
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-legal-lg border border-warm-200/50 p-8"
    >
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
        <div className="flex items-center space-x-6">
          <div className="w-16 h-16 bg-gradient-to-br from-accent-100 to-accent-200 rounded-2xl flex items-center justify-center shadow-lg">
            <CalendarIcon className="w-8 h-8 text-accent-600" />
          </div>
          <div>
            <h1 className="text-4xl font-baskervville font-bold text-legal-dark-text mb-2">
              Smart Calendar
            </h1>
            <p className="text-legal-warm-text font-montserrat text-lg">
              {stats.upcoming} upcoming sessions • {CalendarUtils.formatCurrency(stats.totalEarnings)} this month
            </p>
          </div>
        </div>
        
        <div className="flex items-center flex-wrap gap-4">
          {/* Navigation */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-3 text-legal-warm-text hover:text-accent-600 transition-colors rounded-xl hover:bg-legal-bg-secondary/50"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <h2 className="text-2xl font-baskervville font-bold text-legal-dark-text min-w-[200px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            
            <button
              onClick={() => navigateMonth(1)}
              className="p-3 text-legal-warm-text hover:text-accent-600 transition-colors rounded-xl hover:bg-legal-bg-secondary/50"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-1 bg-legal-bg-secondary/30 rounded-xl p-1 shadow-inner">
            {(['month', 'week', 'day'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => onViewModeChange(mode)}
                className={`px-6 py-3 text-sm font-medium rounded-lg transition-all duration-300 font-montserrat capitalize ${
                  viewMode === mode
                    ? 'bg-white text-accent-600 shadow-md scale-105'
                    : 'text-legal-warm-text hover:text-accent-600 hover:bg-white/50'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
          
          {/* Action Buttons */}
          <button
            onClick={goToToday}
            className="text-accent-600 hover:text-accent-700 font-medium font-montserrat px-4 py-2 rounded-lg hover:bg-accent-50 transition-all duration-300"
          >
            Today
          </button>

          <button
            onClick={onNewSession}
            className="bg-gradient-to-r from-accent-700 to-accent-600 text-white font-semibold py-3 px-8 rounded-xl shadow-legal-lg hover:shadow-legal-xl transition-all duration-300 font-montserrat flex items-center space-x-3"
          >
            <Plus className="w-5 h-5" />
            <span>New Session</span>
          </button>

          <button
            onClick={onExport}
            className="bg-white text-accent-600 font-semibold py-3 px-6 rounded-xl border border-accent-200 hover:bg-accent-50 transition-all duration-300 font-montserrat flex items-center space-x-2 shadow-md"
          >
            <Download className="w-5 h-5" />
            <span>Export</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export interface CalendarGridProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDateClick: (date: Date) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentDate,
  events,
  onEventClick,
  onDateClick
}) => {
  const days = CalendarUtils.getCalendarDays(currentDate);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const today = new Date();

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter(event => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-legal border border-warm-200/50 p-8">
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="p-4 text-center text-sm font-semibold text-legal-warm-text font-montserrat">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day: Date, index: number) => {
          const isCurrentMonth = CalendarUtils.isSameMonth(day, currentDate);
          const isToday = CalendarUtils.isToday(day);
          const dayEvents = getEventsForDate(day);
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.01 }}
              onClick={() => onDateClick(day)}
              className={`min-h-[120px] p-3 border border-legal-border/20 transition-all duration-300 cursor-pointer hover:bg-legal-bg-secondary/30 rounded-lg ${
                isCurrentMonth ? 'bg-white' : 'bg-legal-bg-secondary/10'
              } ${isToday ? 'bg-accent-50 border-accent-300 shadow-md' : ''}`}
            >
              <div className={`text-sm font-semibold mb-2 ${
                isCurrentMonth 
                  ? isToday 
                    ? 'text-accent-700' 
                    : 'text-legal-dark-text' 
                  : 'text-legal-warm-text/50'
              }`}>
                {day.getDate()}
              </div>
              
              <div className="space-y-1">
                {dayEvents.slice(0, 2).map((event) => (
                  <motion.div
                    key={event.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                    className={`text-xs p-2 rounded-lg cursor-pointer transition-all duration-300 border ${CalendarUtils.getStatusColor(event.status)} hover:opacity-80`}
                  >
                    <div className="font-medium truncate">{CalendarUtils.formatTime(event.start)}</div>
                    <div className="truncate">{event.title}</div>
                    <div className="truncate opacity-80">{event.student.name}</div>
                  </motion.div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-xs text-legal-warm-text text-center py-1">
                    +{dayEvents.length - 2} more
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
