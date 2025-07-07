'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Filter,
  Video,
  Eye,
  MessageSquare
} from 'lucide-react'

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('month') // 'month', 'week', 'day'
  const [showFilters, setShowFilters] = useState(false)

  // Mock calendar data
  const sessions = [
    {
      id: 1,
      title: 'Advanced Calculus',
      student: 'Sarah Johnson',
      date: new Date(2025, 11, 7, 14, 30), // Dec 12, 2:30 PM
      duration: 60,
      type: 'video',
      status: 'confirmed',
      rate: 75,
      recurring: false,
      notes: 'Focus on integration by parts'
    },
    {
      id: 2,
      title: 'Statistics Review',
      student: 'Mike Chen',
      date: new Date(2025, 11, 7, 16, 0), // Dec 12, 4:00 PM
      duration: 60,
      type: 'video',
      status: 'confirmed',
      rate: 75,
      recurring: true,
      notes: 'Weekly review session'
    },
    {
      id: 3,
      title: 'Linear Algebra',
      student: 'Emma Davis',
      date: new Date(2025, 11, 7, 18, 30), // Dec 12, 6:30 PM
      duration: 60,
      type: 'video',
      status: 'confirmed',
      rate: 75,
      recurring: false,
      notes: 'Matrix operations'
    },
    {
      id: 4,
      title: 'Probability Theory',
      student: 'Alex Thompson',
      date: new Date(2024, 11, 13, 15, 0), // Dec 13, 3:00 PM
      duration: 60,
      type: 'video',
      status: 'pending',
      rate: 75,
      recurring: false,
      notes: 'Introduction to probability'
    },
    {
      id: 5,
      title: 'Differential Equations',
      student: 'Lisa Park',
      date: new Date(2024, 11, 14, 17, 0), // Dec 14, 5:00 PM
      duration: 90,
      type: 'video',
      status: 'confirmed',
      rate: 75,
      recurring: true,
      notes: 'Second-order linear equations'
    }
  ]

  // Get calendar view data
  const getCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const current = new Date(startDate)
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return days
  }

  const getSessionsForDate = (date: Date) => {
    return sessions.filter(session => {
      const sessionDate = new Date(session.date)
      return sessionDate.toDateString() === date.toDateString()
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-success-100 text-success-700 border-success-200'
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-warm-100 text-warm-700 border-warm-200'
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  /*const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }*/

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  const days = getCalendarDays()
  const today = new Date()

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-legal-lg border border-warm-200/50 p-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center space-x-4 mb-6 lg:mb-0">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-100 to-accent-200 rounded-xl flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-accent-600" />
            </div>
            <div>
              <h1 className="text-3xl font-baskervville font-bold text-legal-dark-text">
                Calendar
              </h1>
              <p className="text-legal-warm-text font-montserrat">
                Manage your sessions and schedule
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 bg-legal-bg-secondary/30 rounded-lg p-1">
              {['month', 'week', 'day'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors font-montserrat capitalize ${
                    viewMode === mode
                      ? 'bg-white text-accent-600 shadow-sm'
                      : 'text-legal-warm-text hover:text-accent-600'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            
            <button className="bg-gradient-to-r from-accent-700 to-accent-600 text-white font-semibold py-3 px-6 rounded-xl shadow-legal-lg hover:shadow-legal-xl transition-all duration-300 hover:scale-105 font-montserrat flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>New Session</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Calendar Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-white/95 backdrop-blur-sm rounded-xl shadow-legal border border-warm-200/50 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 text-legal-warm-text hover:text-accent-600 transition-colors rounded-lg hover:bg-legal-bg-secondary/50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-baskervville font-bold text-legal-dark-text">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 text-legal-warm-text hover:text-accent-600 transition-colors rounded-lg hover:bg-legal-bg-secondary/50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentDate(new Date())}
              className="text-sm text-accent-600 hover:text-accent-700 font-medium font-montserrat"
            >
              Today
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 text-legal-warm-text hover:text-accent-600 transition-colors rounded-lg border border-legal-border"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-legal-warm-text font-montserrat">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {days.map((day, index) => {
            const isCurrentMonth = day.getMonth() === currentDate.getMonth()
            const isToday = day.toDateString() === today.toDateString()
            const daySessions = getSessionsForDate(day)
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.01 }}
                className={`min-h-[120px] p-2 border border-legal-border/20 transition-colors cursor-pointer hover:bg-legal-bg-secondary/30 ${
                  isCurrentMonth ? 'bg-white' : 'bg-legal-bg-secondary/10'
                } ${isToday ? 'bg-accent-50 border-accent-300' : ''}`}
              >
                <div className={`text-sm font-medium mb-2 ${
                  isCurrentMonth 
                    ? isToday 
                      ? 'text-accent-700' 
                      : 'text-legal-dark-text' 
                    : 'text-legal-warm-text/50'
                }`}>
                  {day.getDate()}
                </div>
                
                <div className="space-y-1">
                  {daySessions.slice(0, 3).map((session) => (
                    <div
                      key={session.id}
                      className={`text-xs p-1 rounded border cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(session.status)}`}
                    >
                      <div className="font-medium truncate">{formatTime(session.date)}</div>
                      <div className="truncate">{session.student}</div>
                    </div>
                  ))}
                  {daySessions.length > 3 && (
                    <div className="text-xs text-legal-warm-text">
                      +{daySessions.length - 3} more
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Today's Sessions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white/95 backdrop-blur-sm rounded-xl shadow-legal border border-warm-200/50 p-6"
      >
        <h3 className="text-xl font-baskervville font-bold text-legal-dark-text mb-6">
          Today&apos;s Sessions
        </h3>
        
        <div className="space-y-4">
          {sessions
            .filter(session => session.date.toDateString() === today.toDateString())
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center justify-between p-4 border border-legal-border/30 rounded-xl hover:bg-legal-bg-secondary/20 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent-100 to-accent-200 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-accent-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-legal-dark-text font-montserrat">
                      {session.title}
                    </h4>
                    <p className="text-sm text-legal-warm-text font-montserrat">
                      {session.student} • {formatTime(session.date)} • {session.duration}min
                    </p>
                    {session.notes && (
                      <p className="text-xs text-legal-warm-text/80 font-montserrat italic mt-1">
                        {session.notes}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(session.status)}`}>
                    {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                  </span>
                  <span className="text-sm font-medium text-success-600 font-montserrat">
                    ${session.rate}
                  </span>
                  <div className="flex space-x-1">
                    <button className="p-1 text-legal-warm-text hover:text-accent-600 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-legal-warm-text hover:text-accent-600 transition-colors">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-legal-warm-text hover:text-accent-600 transition-colors">
                      <Video className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          
          {sessions.filter(s => s.date.toDateString() === today.toDateString()).length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-legal-bg-secondary/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarIcon className="w-8 h-8 text-legal-warm-text" />
              </div>
              <h4 className="text-lg font-semibold text-legal-dark-text font-baskervville mb-2">
                No sessions today
              </h4>
              <p className="text-legal-warm-text font-montserrat">
                Take a break or schedule some sessions for today
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}