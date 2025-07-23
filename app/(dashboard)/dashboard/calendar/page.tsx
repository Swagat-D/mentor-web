/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Video,
  MessageSquare,
  Search,
  User,
  DollarSign,
  Star,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Bell,
  Users,
  BookOpen,
  Phone,
  ArrowUpRight,
  ArrowRight,
  Settings,
  Calendar,
  CalendarPlus
} from 'lucide-react'

// Custom hooks (would be imported from separate files)
interface CalendarEvent {
  id: string
  title: string
  start: string
  end: string
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
  type: 'video' | 'audio' | 'chat'
  mentor: {
    _id: string
    name: string
    displayName?: string
    email: string
    avatar?: string
  }
  student: {
    _id: string
    name: string
    email: string
    avatar?: string
  }
  payment: {
    amount: number
    currency: string
    status: 'pending' | 'paid' | 'refunded'
  }
  notes?: string
  feedback?: string
  rating?: number
  duration: number
  extendedProps: {
    sessionId: string
    mentorId: string
    studentId: string
    originalData: any
  }
}

interface CalendarStats {
  total: number
  completed: number
  upcoming: number
  cancelled: number
  inProgress: number
  totalEarnings: number
}

interface Student {
  _id: string
  name: string
  email: string
}

export default function ModernCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showNewSessionModal, setShowNewSessionModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [students, setStudents] = useState<Student[]>([])
  const [googleConnected, setGoogleConnected] = useState(false)
  const [syncLoading, setSyncLoading] = useState(false)
  const [filters, setFilters] = useState({
    status: 'all',
    subject: '',
    search: ''
  })
  const [stats, setStats] = useState<CalendarStats>({
    total: 0,
    completed: 0,
    upcoming: 0,
    cancelled: 0,
    inProgress: 0,
    totalEarnings: 0
  })

  // Fetch calendar events from API
  const fetchEvents = async () => {
    try {
      setLoading(true)
      
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      
      const searchParams = new URLSearchParams({
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        view: viewMode,
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.subject && { subject: filters.subject }),
        ...(filters.search && { search: filters.search })
      })

      const response = await fetch(`/api/calendar/events?${searchParams}`)
      const data = await response.json()

      if (data.success) {
        setEvents(data.data)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch students for new session form
  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students?filter=my-students&limit=50')
      const data = await response.json()
      if (data.success) {
        setStudents(data.data)
      }
    } catch (error) {
      console.error('Error fetching students:', error)
    }
  }

  // Connect to Google Calendar
  const connectGoogleCalendar = async () => {
    try {
      const response = await fetch('/api/calendar/google?action=auth-url')
      const data = await response.json()
      
      if (data.success) {
        window.open(data.data.authUrl, '_blank')
      }
    } catch (error) {
      console.error('Error connecting Google Calendar:', error)
    }
  }

  // Sync sessions to Google Calendar
  const syncToGoogleCalendar = async () => {
    try {
      setSyncLoading(true)
      const response = await fetch('/api/calendar/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync-sessions' })
      })

      const data = await response.json()
      if (data.success) {
        // Show success message
        console.log('Synced successfully')
      }
    } catch (error) {
      console.error('Error syncing to Google Calendar:', error)
    } finally {
      setSyncLoading(false)
    }
  }

  // Update session status
  const updateSessionStatus = async (sessionId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        fetchEvents()
        setShowEventModal(false)
      }
    } catch (error) {
      console.error('Error updating session:', error)
    }
  }

  useEffect(() => {
    fetchEvents()
    fetchStudents()
  }, [currentDate, viewMode, filters])

  // Calendar utilities
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

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const getTodaysEvents = () => {
    const today = new Date()
    return events
      .filter(event => new Date(event.start).toDateString() === today.toDateString())
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
  }

  const getUpcomingEvents = () => {
    const now = new Date()
    return events
      .filter(event => 
        new Date(event.start) > now && 
        event.status === 'scheduled'
      )
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
      .slice(0, 5)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'scheduled':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'completed':
        return 'bg-success-100 text-success-700 border-success-200'
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'in-progress':
        return 'bg-amber-100 text-amber-700 border-amber-200'
      default:
        return 'bg-warm-100 text-warm-700 border-warm-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-3 h-3" />
      case 'cancelled':
        return <XCircle className="w-3 h-3" />
      case 'in-progress':
        return <AlertTriangle className="w-3 h-3" />
      default:
        return <Clock className="w-3 h-3" />
    }
  }

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const days = getCalendarDays()
  const today = new Date()
  const todaysEvents = getTodaysEvents()
  const upcomingEvents = getUpcomingEvents()

  return (
    <div className="min-h-screen bg-gradient-to-br from-legal-bg-primary via-white to-legal-bg-secondary">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Enhanced Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
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
                  {stats.upcoming} upcoming sessions • {formatCurrency(stats.totalEarnings)} this month
                </p>
              </div>
            </div>
            
            <div className="flex items-center flex-wrap gap-4">
              {/* Google Calendar Integration */}
              <div className="flex items-center space-x-2">
                {googleConnected ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={syncToGoogleCalendar}
                    disabled={syncLoading}
                    className="bg-green-100 text-green-700 font-semibold py-2 px-4 rounded-xl border border-green-200 hover:bg-green-200 transition-all duration-300 font-montserrat flex items-center space-x-2"
                  >
                    {syncLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    <span>Sync</span>
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={connectGoogleCalendar}
                    className="bg-blue-100 text-blue-700 font-semibold py-2 px-4 rounded-xl border border-blue-200 hover:bg-blue-200 transition-all duration-300 font-montserrat flex items-center space-x-2"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Connect Google</span>
                  </motion.button>
                )}
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center space-x-1 bg-legal-bg-secondary/30 rounded-xl p-1 shadow-inner">
                {['month', 'week', 'day'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode as 'month' | 'week' | 'day')}
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
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNewSessionModal(true)}
                className="bg-gradient-to-r from-accent-700 to-accent-600 text-white font-semibold py-3 px-8 rounded-xl shadow-legal-lg hover:shadow-legal-xl transition-all duration-300 font-montserrat flex items-center space-x-3"
              >
                <CalendarPlus className="w-5 h-5" />
                <span>New Session</span>
              </motion.button>

              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSettingsModal(true)}
                className="bg-white text-accent-600 font-semibold py-3 px-4 rounded-xl border border-accent-200 hover:bg-accent-50 transition-all duration-300 font-montserrat"
              >
                <Settings className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            { 
              title: 'Total Sessions', 
              value: stats.total, 
              icon: BookOpen, 
              color: 'blue', 
              change: '+12%',
              description: 'All time'
            },
            { 
              title: 'Completed', 
              value: stats.completed, 
              icon: CheckCircle, 
              color: 'success', 
              change: '+8%',
              description: 'This month'
            },
            { 
              title: 'Upcoming', 
              value: stats.upcoming, 
              icon: Clock, 
              color: 'amber', 
              change: '+5%',
              description: 'Next 30 days'
            },
            { 
              title: 'Earnings', 
              value: formatCurrency(stats.totalEarnings), 
              icon: DollarSign, 
              color: 'purple', 
              change: '+15%',
              description: 'This month'
            },
            { 
              title: 'Active Students', 
              value: students.length, 
              icon: Users, 
              color: 'warm', 
              change: '+3%',
              description: 'Regular students'
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-legal border border-warm-200/50 p-6 hover:shadow-legal-lg transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                  stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                  stat.color === 'success' ? 'bg-success-100 text-success-600' :
                  stat.color === 'amber' ? 'bg-amber-100 text-amber-600' :
                  stat.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                  'bg-warm-100 text-warm-600'
                }`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="flex items-center space-x-1">
                  <ArrowUpRight className="w-3 h-3 text-success-600" />
                  <span className="text-success-600 text-sm font-medium font-montserrat">
                    {stat.change}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-legal-dark-text font-baskervville mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-legal-warm-text font-montserrat mb-1">
                  {stat.title}
                </p>
                <p className="text-xs text-legal-warm-text/70 font-montserrat">
                  {stat.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Enhanced Main Calendar */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-legal border border-warm-200/50 p-8"
            >
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-6">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigateMonth(-1)}
                    className="p-3 text-legal-warm-text hover:text-accent-600 transition-colors rounded-xl hover:bg-legal-bg-secondary/50"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </motion.button>
                  
                  <h2 className="text-3xl font-baskervville font-bold text-legal-dark-text">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => navigateMonth(1)}
                    className="p-3 text-legal-warm-text hover:text-accent-600 transition-colors rounded-xl hover:bg-legal-bg-secondary/50"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </motion.button>
                </div>

                <div className="flex items-center space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={goToToday}
                    className="text-accent-600 hover:text-accent-700 font-medium font-montserrat px-4 py-2 rounded-lg hover:bg-accent-50 transition-all duration-300"
                  >
                    Today
                  </motion.button>
                  
                  {/* Search and Filter */}
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-legal-warm-text" />
                      <input
                        type="text"
                        placeholder="Search sessions..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="pl-10 pr-4 py-2 border border-legal-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white font-montserrat text-sm w-48"
                      />
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-legal-warm-text hover:text-accent-600 transition-colors rounded-lg border border-legal-border hover:border-accent-300"
                    >
                      <Filter className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="p-4 text-center text-sm font-semibold text-legal-warm-text font-montserrat">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  const isCurrentMonth = day.getMonth() === currentDate.getMonth()
                  const isToday = day.toDateString() === today.toDateString()
                  const dayEvents = getEventsForDate(day)
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.01 }}
                      className={`min-h-[120px] p-3 border border-legal-border/20 transition-all duration-300 cursor-pointer hover:bg-legal-bg-secondary/30 rounded-lg group ${
                        isCurrentMonth ? 'bg-white' : 'bg-legal-bg-secondary/10'
                      } ${isToday ? 'bg-accent-50 border-accent-300 shadow-md ring-2 ring-accent-200' : ''}`}
                    >
                      <div className={`text-sm font-semibold mb-2 transition-colors ${
                        isCurrentMonth 
                          ? isToday 
                            ? 'text-accent-700' 
                            : 'text-legal-dark-text group-hover:text-accent-600' 
                          : 'text-legal-warm-text/50'
                      }`}>
                        {day.getDate()}
                      </div>
                      
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <motion.div
                            key={event.id}
                            whileHover={{ scale: 1.02, y: -1 }}
                            onClick={() => {
                              setSelectedEvent(event)
                              setShowEventModal(true)
                            }}
                            className={`text-xs p-2 rounded-lg cursor-pointer transition-all duration-300 border shadow-sm hover:shadow-md ${getStatusColor(event.status)}`}
                          >
                            <div className="flex items-center space-x-1 mb-1">
                              {getStatusIcon(event.status)}
                              <span className="font-medium truncate">{formatTime(event.start)}</span>
                            </div>
                            <div className="truncate font-medium">{event.title}</div>
                            <div className="truncate opacity-80">{event.student.name}</div>
                            <div className="text-xs opacity-70 mt-1">
                              {formatCurrency(event.payment.amount)}
                            </div>
                          </motion.div>
                        ))}
                        {dayEvents.length > 2 && (
                          <motion.div 
                            whileHover={{ scale: 1.05 }}
                            className="text-xs text-legal-warm-text text-center py-1 bg-legal-bg-secondary/20 rounded cursor-pointer hover:bg-legal-bg-secondary/30 transition-colors"
                          >
                            +{dayEvents.length - 2} more
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          </div>

          {/* Enhanced Sidebar */}
          <div className="space-y-6">
            {/* Today's Sessions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-legal border border-warm-200/50 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-baskervville font-bold text-legal-dark-text">
                  Today&apos;s Sessions
                </h3>
                <div className="flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-accent-600" />
                  <span className="text-sm font-medium text-accent-600 font-montserrat bg-accent-100 px-2 py-1 rounded-full">
                    {todaysEvents.length}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {todaysEvents.length > 0 ? todaysEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    whileHover={{ scale: 1.02, x: 4 }}
                    onClick={() => {
                      setSelectedEvent(event)
                      setShowEventModal(true)
                    }}
                    className="flex items-center justify-between p-4 border border-legal-border/30 rounded-xl hover:bg-legal-bg-secondary/20 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        event.type === 'video' ? 'bg-blue-100' : 
                        event.type === 'audio' ? 'bg-green-100' : 'bg-purple-100'
                      }`}>
                        {event.type === 'video' ? (
                          <Video className="w-6 h-6 text-blue-600" />
                        ) : event.type === 'audio' ? (
                          <Phone className="w-6 h-6 text-green-600" />
                        ) : (
                          <MessageSquare className="w-6 h-6 text-purple-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-legal-dark-text font-montserrat group-hover:text-accent-600 transition-colors">
                          {event.title}
                        </h4>
                        <p className="text-sm text-legal-warm-text font-montserrat">
                          {event.student.name} • {formatTime(event.start)}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}>
                            {event.status}
                          </span>
                          <span className="text-xs text-success-600 font-montserrat font-medium">
                            {formatCurrency(event.payment.amount)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-legal-warm-text group-hover:text-accent-600 transition-colors transform group-hover:translate-x-1" />
                  </motion.div>
                )) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-legal-bg-secondary/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CalendarIcon className="w-8 h-8 text-legal-warm-text" />
                    </div>
                    <h4 className="text-lg font-semibold text-legal-dark-text font-baskervville mb-2">
                      No sessions today
                    </h4>
                    <p className="text-legal-warm-text font-montserrat mb-4">
                      Take a break or schedule new sessions
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowNewSessionModal(true)}
                      className="bg-accent-600 text-white px-4 py-2 rounded-lg font-montserrat text-sm hover:bg-accent-700 transition-colors"
                    >
                      Schedule Session
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Upcoming Sessions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-legal border border-warm-200/50 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-baskervville font-bold text-legal-dark-text">
                  Upcoming Sessions
                </h3>
                <ArrowUpRight className="w-5 h-5 text-accent-600" />
              </div>
              
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    whileHover={{ scale: 1.02, x: 2 }}
                    onClick={() => {
                      setSelectedEvent(event)
                      setShowEventModal(true)
                    }}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-legal-bg-secondary/20 transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        event.status === 'scheduled' ? 'bg-blue-500' :
                        'bg-gray-400'
                      }`}></div>
                      <div>
                        <p className="font-medium text-legal-dark-text font-montserrat text-sm group-hover:text-accent-600 transition-colors">
                          {event.title}
                        </p>
                        <p className="text-xs text-legal-warm-text font-montserrat">
                          {new Date(event.start).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })} • {formatTime(event.start)}
                        </p>
                        <p className="text-xs text-legal-warm-text/70 font-montserrat">
                          {event.student.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-success-600 font-montserrat">
                        {formatCurrency(event.payment.amount)}
                      </p>
                    </div>
                  </motion.div>
                ))}
                
                {upcomingEvents.length === 0 && (
                  <div className="text-center py-6">
                    <Clock className="w-8 h-8 text-legal-warm-text/50 mx-auto mb-2" />
                    <p className="text-sm text-legal-warm-text font-montserrat">
                      No upcoming sessions
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-gradient-to-r from-accent-50 to-warm-50 border border-accent-200 rounded-2xl p-6"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-accent-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-accent-800 font-baskervville">
                    Quick Insights
                  </h3>
                  <p className="text-sm text-accent-600 font-montserrat">
                    This month&apos;s performance
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-accent-700 font-montserrat">Completion Rate</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-accent-200 rounded-full h-2">
                      <div className="bg-accent-600 h-2 rounded-full" style={{ width: '94%' }}></div>
                    </div>
                    <span className="text-sm font-medium text-accent-800">94%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-accent-700 font-montserrat">Avg Rating</span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-amber-400 fill-current" />
                    <span className="text-sm font-medium text-accent-800">4.9</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-accent-700 font-montserrat">Response Time</span>
                  <span className="text-sm font-medium text-accent-800">&lt; 2h</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Session Details Modal */}
        <AnimatePresence>
          {showEventModal && selectedEvent && (
            <SessionDetailsModal
              event={selectedEvent}
              onClose={() => setShowEventModal(false)}
              onUpdateStatus={updateSessionStatus}
            />
          )}
        </AnimatePresence>

        {/* New Session Modal */}
        <AnimatePresence>
          {showNewSessionModal && (
            <NewSessionModal
              students={students}
              onClose={() => setShowNewSessionModal(false)}
              onSuccess={() => {
                fetchEvents()
                setShowNewSessionModal(false)
              }}
            />
          )}
        </AnimatePresence>

        {/* Settings Modal */}
        <AnimatePresence>
          {showSettingsModal && (
            <CalendarSettingsModal
              onClose={() => setShowSettingsModal(false)}
              googleConnected={googleConnected}
              onConnectGoogle={connectGoogleCalendar}
            />
          )}
        </AnimatePresence>

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-white/80 backdrop-blur-sm z-40 flex items-center justify-center"
          >
            <div className="flex items-center space-x-4">
              <RefreshCw className="w-8 h-8 text-accent-600 animate-spin" />
              <span className="text-lg font-montserrat text-legal-dark-text">Loading calendar...</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// Session Details Modal Component
function SessionDetailsModal({ 
  event, 
  onClose, 
  onUpdateStatus 
}: { 
  event: CalendarEvent
  onClose: () => void
  onUpdateStatus: (sessionId: string, status: string) => void
}) {
  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl border border-warm-200/50 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-baskervville font-bold text-legal-dark-text">
            Session Details
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-legal-warm-text hover:text-legal-dark-text transition-colors rounded-lg hover:bg-legal-bg-secondary/30"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-100 to-accent-200 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-accent-600" />
            </div>
            <div>
              <h4 className="text-xl font-semibold text-legal-dark-text font-montserrat">
                {event.title}
              </h4>
              <p className="text-legal-warm-text font-montserrat">
                with {event.student.name}
              </p>
            </div>
            <div className="ml-auto">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                event.status === 'scheduled' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                event.status === 'completed' ? 'bg-success-100 text-success-700 border-success-200' :
                event.status === 'cancelled' ? 'bg-red-100 text-red-700 border-red-200' :
                'bg-amber-100 text-amber-700 border-amber-200'
              }`}>
                {event.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-legal-warm-text font-montserrat mb-1">Date & Time</p>
                <p className="text-legal-dark-text font-montserrat">
                  {new Date(event.start).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-legal-dark-text font-montserrat">
                  {formatTime(event.start)} ({event.duration} min)
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-legal-warm-text font-montserrat mb-1">Session Type</p>
                <div className="flex items-center space-x-2">
                  {event.type === 'video' ? (
                    <Video className="w-4 h-4 text-accent-600" />
                  ) : event.type === 'audio' ? (
                    <Phone className="w-4 h-4 text-accent-600" />
                  ) : (
                    <MessageSquare className="w-4 h-4 text-accent-600" />
                  )}
                  <span className="text-legal-dark-text font-montserrat capitalize">
                    {event.type}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-legal-warm-text font-montserrat mb-1">Payment</p>
                <p className="text-legal-dark-text font-montserrat font-semibold">
                  {formatCurrency(event.payment.amount)}
                </p>
                <p className="text-sm text-legal-warm-text font-montserrat">
                  Status: {event.payment.status}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-legal-warm-text font-montserrat mb-1">Student</p>
                <p className="text-legal-dark-text font-montserrat">
                  {event.student.name}
                </p>
                <p className="text-sm text-legal-warm-text font-montserrat">
                  {event.student.email}
                </p>
              </div>
            </div>
          </div>

          {event.notes && (
            <div>
              <p className="text-sm font-medium text-legal-warm-text font-montserrat mb-2">Notes</p>
              <p className="text-legal-dark-text font-montserrat bg-legal-bg-secondary/30 p-4 rounded-lg">
                {event.notes}
              </p>
            </div>
          )}

          {event.feedback && (
            <div>
              <p className="text-sm font-medium text-legal-warm-text font-montserrat mb-2">Feedback</p>
              <p className="text-legal-dark-text font-montserrat bg-legal-bg-secondary/30 p-4 rounded-lg">
                {event.feedback}
              </p>
              {event.rating && (
                <div className="flex items-center space-x-2 mt-2">
                  <Star className="w-4 h-4 text-amber-400 fill-current" />
                  <span className="text-legal-dark-text font-montserrat">
                    {event.rating}/5
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-6 border-t border-legal-border/30">
            <div className="flex space-x-3">
              {event.status === 'scheduled' && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onUpdateStatus(event.extendedProps.sessionId, 'in-progress')}
                    className="bg-amber-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-amber-600 transition-colors font-montserrat"
                  >
                    Start Session
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onUpdateStatus(event.extendedProps.sessionId, 'cancelled')}
                    className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors font-montserrat"
                  >
                    Cancel
                  </motion.button>
                </>
              )}
              {event.status === 'in-progress' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onUpdateStatus(event.extendedProps.sessionId, 'completed')}
                  className="bg-success-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-success-600 transition-colors font-montserrat"
                >
                  Complete Session
                </motion.button>
              )}
            </div>
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-legal-warm-text hover:text-accent-600 transition-colors rounded-lg border border-legal-border hover:border-accent-300"
              >
                <MessageSquare className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-legal-warm-text hover:text-accent-600 transition-colors rounded-lg border border-legal-border hover:border-accent-300"
              >
                <Video className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// New Session Modal Component
function NewSessionModal({ 
  students, 
  onClose, 
  onSuccess 
}: { 
  students: Student[]
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    studentId: '',
    subject: '',
    scheduledAt: '',
    duration: 60,
    type: 'video' as 'video' | 'audio' | 'chat',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const subjects = [
    'Advanced Calculus',
    'Statistics',
    'Linear Algebra',
    'Probability Theory',
    'Differential Equations',
    'Mathematical Analysis',
    'Discrete Mathematics',
    'Number Theory',
    'Geometry',
    'Trigonometry'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        onSuccess()
      } else {
        if (data.errors) {
          const errorObj: Record<string, string> = {}
          data.errors.forEach((error: string) => {
            errorObj.general = error
          })
          setErrors(errorObj)
        } else {
          setErrors({ general: data.message || 'Failed to create session' })
        }
      }
    } catch (error) {
      console.log(error)
      setErrors({ general: 'An error occurred while creating the session' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl border border-warm-200/50 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-baskervville font-bold text-legal-dark-text">
            Schedule New Session
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-legal-warm-text hover:text-legal-dark-text transition-colors rounded-lg hover:bg-legal-bg-secondary/30"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {errors.general}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-legal-dark-text font-montserrat mb-2">
                Student
              </label>
              <select
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                className="w-full px-4 py-3 border border-legal-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white font-montserrat"
                required
              >
                <option value="">Select a student</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-legal-dark-text font-montserrat mb-2">
                Subject
              </label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-3 border border-legal-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white font-montserrat"
                required
              >
                <option value="">Select a subject</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-legal-dark-text font-montserrat mb-2">
                Date & Time
              </label>
              <input
                type="datetime-local"
                value={formData.scheduledAt}
                onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                className="w-full px-4 py-3 border border-legal-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white font-montserrat"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-legal-dark-text font-montserrat mb-2">
                Duration (minutes)
              </label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-legal-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white font-montserrat"
              >
                <option value={30}>30 minutes</option>
                <option value={60}>60 minutes</option>
                <option value={90}>90 minutes</option>
                <option value={120}>120 minutes</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-legal-dark-text font-montserrat mb-2">
                Session Type
              </label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: 'video', label: 'Video Call', icon: Video, color: 'blue' },
                  { value: 'audio', label: 'Audio Call', icon: Phone, color: 'green' },
                  { value: 'chat', label: 'Chat Session', icon: MessageSquare, color: 'purple' }
                ].map((type) => (
                  <motion.label
                    key={type.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all duration-300 ${
                      formData.type === type.value
                        ? `border-${type.color}-300 bg-${type.color}-50`
                        : 'border-legal-border hover:border-accent-300 hover:bg-accent-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={type.value}
                      checked={formData.type === type.value}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'video' | 'audio' | 'chat' })}
                      className="sr-only"
                    />
                    <type.icon className={`w-5 h-5 ${
                      formData.type === type.value ? `text-${type.color}-600` : 'text-legal-warm-text'
                    }`} />
                    <span className={`font-montserrat ${
                      formData.type === type.value ? `text-${type.color}-700` : 'text-legal-dark-text'
                    }`}>
                      {type.label}
                    </span>
                  </motion.label>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-legal-dark-text font-montserrat mb-2">
              Session Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-legal-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none font-montserrat"
              placeholder="Add any specific topics or preparation notes..."
            />
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-legal-border/30">
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="px-6 py-3 text-legal-warm-text border border-legal-border rounded-lg hover:bg-legal-bg-secondary/30 transition-colors font-montserrat"
            >
              Cancel
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading}
              className="bg-gradient-to-r from-accent-700 to-accent-600 text-white font-semibold px-8 py-3 rounded-lg shadow-legal hover:shadow-legal-lg transition-all duration-300 font-montserrat disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <CalendarPlus className="w-4 h-4" />
                  <span>Create Session</span>
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// Calendar Settings Modal Component
function CalendarSettingsModal({
  onClose,
  googleConnected,
  onConnectGoogle
}: {
  onClose: () => void
  googleConnected: boolean
  onConnectGoogle: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl border border-warm-200/50 p-8 max-w-lg w-full"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-baskervville font-bold text-legal-dark-text">
            Calendar Settings
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-legal-warm-text hover:text-legal-dark-text transition-colors rounded-lg hover:bg-legal-bg-secondary/30"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="border border-legal-border/30 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Calendar className="w-6 h-6 text-blue-600" />
                <div>
                  <h4 className="font-semibold text-legal-dark-text font-montserrat">
                    Google Calendar
                  </h4>
                  <p className="text-sm text-legal-warm-text font-montserrat">
                    Sync your sessions with Google Calendar
                  </p>
                </div>
              </div>
              {googleConnected ? (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-success-600" />
                  <span className="text-sm font-medium text-success-600 font-montserrat">
                    Connected
                  </span>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onConnectGoogle}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-montserrat text-sm hover:bg-blue-700 transition-colors"
                >
                  Connect
                </motion.button>
              )}
            </div>
            
            {googleConnected && (
              <div className="space-y-3 pt-4 border-t border-legal-border/30">
                <label className="flex items-center space-x-3">
                  <input type="checkbox" defaultChecked className="rounded border-legal-border" />
                  <span className="text-sm text-legal-dark-text font-montserrat">
                    Auto-sync new sessions
                  </span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" defaultChecked className="rounded border-legal-border" />
                  <span className="text-sm text-legal-dark-text font-montserrat">
                    Send calendar invites to students
                  </span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" defaultChecked className="rounded border-legal-border" />
                  <span className="text-sm text-legal-dark-text font-montserrat">
                    Create video meetings automatically
                  </span>
                </label>
              </div>
            )}
          </div>

          <div className="border border-legal-border/30 rounded-lg p-6">
            <h4 className="font-semibold text-legal-dark-text font-montserrat mb-4">
              Notification Settings
            </h4>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input type="checkbox" defaultChecked className="rounded border-legal-border" />
                <span className="text-sm text-legal-dark-text font-montserrat">
                  Email reminders 24 hours before sessions
                </span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" defaultChecked className="rounded border-legal-border" />
                <span className="text-sm text-legal-dark-text font-montserrat">
                  Push notifications 15 minutes before sessions
                </span>
              </label>
              <label className="flex items-center space-x-3">
                <input type="checkbox" className="rounded border-legal-border" />
                <span className="text-sm text-legal-dark-text font-montserrat">
                  Daily schedule summary
                </span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="px-6 py-3 text-legal-warm-text border border-legal-border rounded-lg hover:bg-legal-bg-secondary/30 transition-colors font-montserrat"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="bg-accent-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-accent-700 transition-colors font-montserrat"
            >
              Save Settings
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}