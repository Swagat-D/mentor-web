/* eslint-disable react-hooks/exhaustive-deps */
// app/(dashboard)/dashboard/sessions/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookOpen,
  Search,
  Plus,
  Calendar,
  Clock,
  User,
  Star,
  Video,
  MessageSquare,
  Eye,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Edit,
  Trash2,
  Play,
  Phone,
  DollarSign,
  X,
  Save,
  RefreshCw,
} from 'lucide-react'

// Types
interface SessionStats {
  total: number;
  completed: number;
  upcoming: number;
  cancelled: number;
  totalEarnings: number;
}

interface Mentor {
  _id: string;
  name: string;
  displayName?: string;
  email: string;
  avatar?: string;
}

interface Student {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Session {
  _id: string;
  mentorId: string;
  studentId: string;
  subject: string;
  scheduledAt: string;
  duration: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  type: 'video' | 'audio' | 'chat';
  notes?: string;
  feedback?: string;
  rating?: number;
  payment: {
    amount: number;
    currency: string;
    status: 'pending' | 'paid' | 'refunded';
    stripePaymentIntentId?: string;
  };
  createdAt: string;
  updatedAt: string;
  mentor: Mentor;
  student: Student;
}

interface SessionsResponse {
  success: boolean;
  data: Session[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats: SessionStats;
}

interface CreateSessionModal {
  isOpen: boolean;
  loading: boolean;
}

interface SessionModal {
  isOpen: boolean;
  session: Session | null;
  mode: 'view' | 'edit';
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [stats, setStats] = useState<SessionStats>({
    total: 0,
    completed: 0,
    upcoming: 0,
    cancelled: 0,
    totalEarnings: 0
  })
  const [createModal, setCreateModal] = useState<CreateSessionModal>({
    isOpen: false,
    loading: false
  })
  const [sessionModal, setSessionModal] = useState<SessionModal>({
    isOpen: false,
    session: null,
    mode: 'view'
  })
  const [editData, setEditData] = useState({
    notes: '',
    feedback: '',
    rating: 0,
    status: '' as Session['status']
  })

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ]

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
    'English', 'History', 'Economics', 'Psychology', 'Engineering'
  ]

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(selectedStatus !== 'all' && { status: selectedStatus }),
        ...(searchQuery && { search: searchQuery }),
        ...(selectedSubject && { subject: selectedSubject }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo })
      })

      const response = await fetch(`/api/sessions?${params}`)
      if (!response.ok) throw new Error('Failed to fetch sessions')

      const data: SessionsResponse = await response.json()
      
      if (data.success) {
        setSessions(data.data)
        setPagination(data.pagination)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchSessions()
    }, searchQuery ? 500 : 0)

    return () => clearTimeout(debounceTimer)
  }, [selectedStatus, searchQuery, selectedSubject, dateFrom, dateTo, pagination.page])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-success-500" />
      case 'scheduled':
        return <Clock className="w-4 h-4 text-accent-500" />
      case 'in-progress':
        return <Play className="w-4 h-4 text-blue-500" />
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-legal-warm-text" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success-100 text-success-700 border-success-200'
      case 'scheduled':
        return 'bg-accent-100 text-accent-700 border-accent-200'
      case 'in-progress':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-warm-100 text-warm-700 border-warm-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4" />
      case 'audio':
        return <Phone className="w-4 h-4" />
      case 'chat':
        return <MessageSquare className="w-4 h-4" />
      default:
        return <Video className="w-4 h-4" />
    }
  }

  const getAvatarColor = (index: number) => {
    const colors = [
      'bg-accent-100 text-accent-700',
      'bg-warm-100 text-warm-700',
      'bg-success-100 text-success-700',
      'bg-blue-100 text-blue-700',
      'bg-purple-100 text-purple-700'
    ]
    return colors[index % colors.length]
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase()
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const openSessionModal = (session: Session, mode: 'view' | 'edit' = 'view') => {
    setSessionModal({ isOpen: true, session, mode })
    setEditData({
      notes: session.notes || '',
      feedback: session.feedback || '',
      rating: session.rating || 0,
      status: session.status
    })
  }

  const closeSessionModal = () => {
    setSessionModal({ isOpen: false, session: null, mode: 'view' })
    setEditData({
      notes: '',
      feedback: '',
      rating: 0,
      status: '' as Session['status']
    })
  }

  const updateSession = async () => {
    if (!sessionModal.session) return

    try {
      const response = await fetch(`/api/sessions/${sessionModal.session._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editData)
      })

      const data = await response.json()

      if (data.success) {
        closeSessionModal()
        fetchSessions()
        alert('Session updated successfully!')
      } else {
        throw new Error(data.message || 'Failed to update session')
      }
    } catch (error) {
      console.error('Error updating session:', error)
      alert('Failed to update session. Please try again.')
    }
  }

  const deleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this session?')) return

    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        fetchSessions()
        alert('Session deleted successfully!')
      } else {
        throw new Error(data.message || 'Failed to delete session')
      }
    } catch (error) {
      console.error('Error deleting session:', error)
      alert('Failed to delete session. Please try again.')
    }
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedStatus('all')
    setSelectedSubject('')
    setDateFrom('')
    setDateTo('')
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-legal-lg border border-warm-200/50 p-4 sm:p-6 lg:p-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-accent-100 to-accent-200 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-accent-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-baskervville font-bold text-legal-dark-text">
                Sessions
              </h1>
              <p className="text-sm sm:text-base text-legal-warm-text font-montserrat">
                Manage and track all your mentoring sessions
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <button className="w-full sm:w-auto bg-white text-accent-600 font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl border border-accent-200 hover:bg-accent-50 transition-colors font-montserrat flex items-center justify-center space-x-2 text-sm sm:text-base">
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Export</span>
            </button>
            <button 
              onClick={() => setCreateModal({ isOpen: true, loading: false })}
              className="w-full sm:w-auto bg-gradient-to-r from-accent-700 to-accent-600 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl shadow-legal-lg hover:shadow-legal-xl transition-all duration-300 hover:scale-105 font-montserrat flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>New Session</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
        {[
          { label: 'Total', value: stats.total, icon: BookOpen, color: 'accent' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'success' },
          { label: 'Upcoming', value: stats.upcoming, icon: Calendar, color: 'warm' },
          { label: 'Cancelled', value: stats.cancelled, icon: XCircle, color: 'red' },
          { label: 'Earnings', value: formatCurrency(stats.totalEarnings), icon: DollarSign, color: 'blue', isFullWidth: true }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className={`bg-white/95 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-legal border border-warm-200/50 p-3 sm:p-4 lg:p-6 ${
              stat.isFullWidth ? 'col-span-2 lg:col-span-1' : ''
            }`}
          >
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${
                stat.color === 'accent' ? 'bg-accent-100 text-accent-600' :
                stat.color === 'success' ? 'bg-success-100 text-success-600' :
                stat.color === 'warm' ? 'bg-warm-100 text-warm-600' :
                stat.color === 'red' ? 'bg-red-100 text-red-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                <stat.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-legal-dark-text font-baskervville truncate">
                  {typeof stat.value === 'string' ? stat.value : stat.value.toLocaleString()}
                </p>
                <p className="text-xs sm:text-sm text-legal-warm-text font-montserrat">
                  {stat.label}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white/95 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-legal border border-warm-200/50 p-4 sm:p-6"
      >
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-legal-warm-text" />
            <input
              type="text"
              placeholder="Search sessions by subject, student, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 border border-legal-border rounded-lg sm:rounded-xl font-montserrat transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white text-sm sm:text-base"
            />
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 sm:px-4 py-2 sm:py-2.5 border border-legal-border rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            {/* Subject Filter */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 sm:px-4 py-2 sm:py-2.5 border border-legal-border rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
            >
              <option value="">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>

            {/* Date From */}
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 sm:px-4 py-2 sm:py-2.5 border border-legal-border rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
              placeholder="From Date"
            />

            {/* Date To */}
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 sm:px-4 py-2 sm:py-2.5 border border-legal-border rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
              placeholder="To Date"
            />

            {/* Clear Filters */}
            <button
              onClick={clearFilters}
              className="px-3 sm:px-4 py-2 sm:py-2.5 text-legal-warm-text border border-legal-border rounded-lg hover:bg-legal-bg-secondary/50 transition-colors font-montserrat text-sm flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8 sm:py-12">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-accent-600"></div>
          <span className="ml-3 text-legal-warm-text font-montserrat text-sm sm:text-base">Loading sessions...</span>
        </div>
      )}

      {/* Sessions List */}
      {!loading && (
        <div className="space-y-3 sm:space-y-4">
          {sessions.map((session, index) => (
            <motion.div
              key={session._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              className="bg-white/95 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-legal border border-warm-200/50 p-4 sm:p-6 hover:shadow-legal-lg transition-all duration-300 group"
            >
              {/* Mobile Layout */}
              <div className="block lg:hidden space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${getAvatarColor(index)}`}>
                      {getInitials(session.student.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-legal-dark-text font-baskervville truncate">
                        {session.subject}
                      </h3>
                      <p className="text-sm text-legal-warm-text font-montserrat truncate">
                        {session.student.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(session.status)}`}>
                      {getStatusIcon(session.status)}
                      <span className="ml-1 capitalize">{session.status}</span>
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-legal-warm-text">
                      <Calendar className="w-4 h-4" />
                      <span className="font-montserrat">{formatDateTime(session.scheduledAt).date}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-legal-warm-text">
                      <Clock className="w-4 h-4" />
                      <span className="font-montserrat">{formatDateTime(session.scheduledAt).time}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-legal-warm-text">
                      {getTypeIcon(session.type)}
                      <span className="font-montserrat capitalize">{session.type}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-legal-warm-text">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-montserrat">{formatCurrency(session.payment.amount)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <button 
                    onClick={() => openSessionModal(session, 'view')}
                    className="flex-1 bg-accent-100 text-accent-700 font-semibold py-2 px-3 rounded-lg hover:bg-accent-200 transition-colors font-montserrat text-sm flex items-center justify-center space-x-1"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                  <button 
                    onClick={() => openSessionModal(session, 'edit')}
                    className="flex-1 bg-white text-accent-600 font-semibold py-2 px-3 rounded-lg border border-accent-200 hover:bg-accent-50 transition-colors font-montserrat text-sm flex items-center justify-center space-x-1"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden lg:flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  {/* Avatar */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold ${getAvatarColor(index)}`}>
                    {getInitials(session.student.name)}
                  </div>

                  {/* Session Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-legal-dark-text font-baskervville">
                        {session.subject}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(session.status)}`}>
                        {getStatusIcon(session.status)}
                        <span className="ml-1 capitalize">{session.status}</span>
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-legal-warm-text font-montserrat">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{session.student.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDateTime(session.scheduledAt).date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatDateTime(session.scheduledAt).time}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getTypeIcon(session.type)}
                        <span>{session.duration}min</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="font-medium text-success-600">{formatCurrency(session.payment.amount)}</span>
                      </div>
                    </div>

                    {session.notes && (
                      <p className="text-sm text-legal-warm-text/80 font-montserrat mt-2 italic truncate">
                        &quot;{session.notes}&quot;
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => openSessionModal(session, 'view')}
                    className="p-2 text-legal-warm-text hover:text-accent-600 transition-colors rounded-lg hover:bg-legal-bg-secondary/50"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => openSessionModal(session, 'edit')}
                    className="p-2 text-legal-warm-text hover:text-accent-600 transition-colors rounded-lg hover:bg-legal-bg-secondary/50"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {session.status === 'scheduled' && (
                    <button 
                      onClick={() => deleteSession(session._id)}
                      className="p-2 text-legal-warm-text hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button className="p-2 text-legal-warm-text hover:text-accent-600 transition-colors rounded-lg hover:bg-legal-bg-secondary/50">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination.pages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 mt-6">
          <div className="text-sm text-legal-warm-text font-montserrat">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} sessions
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 sm:px-4 py-2 text-sm font-medium text-legal-warm-text bg-white border border-legal-border rounded-lg hover:bg-accent-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-lg ${
                    pagination.page === page
                      ? 'bg-accent-600 text-white'
                      : 'text-legal-warm-text bg-white border border-legal-border hover:bg-accent-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-3 sm:px-4 py-2 text-sm font-medium text-legal-warm-text bg-white border border-legal-border rounded-lg hover:bg-accent-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && sessions.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/95 backdrop-blur-sm rounded-xl shadow-legal border border-warm-200/50 p-8 sm:p-12 text-center"
        >
          <div className="w-16 h-16 bg-legal-bg-secondary/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-legal-warm-text" />
          </div>
          <h3 className="text-xl font-semibold text-legal-dark-text font-baskervville mb-2">
            No sessions found
          </h3>
          <p className="text-legal-warm-text font-montserrat mb-6">
            {searchQuery || selectedStatus !== 'all' || selectedSubject || dateFrom || dateTo
              ? 'Try adjusting your search or filters'
              : 'Start scheduling sessions with your students'}
          </p>
          {(!searchQuery && selectedStatus === 'all' && !selectedSubject && !dateFrom && !dateTo) && (
            <button 
              onClick={() => setCreateModal({ isOpen: true, loading: false })}
              className="bg-gradient-to-r from-accent-700 to-accent-600 text-white font-semibold py-3 px-6 rounded-xl shadow-legal-lg hover:shadow-legal-xl transition-all duration-300 hover:scale-105 font-montserrat"
            >
              Schedule Your First Session
            </button>
          )}
        </motion.div>
      )}

      {/* Session Detail/Edit Modal */}
      <AnimatePresence>
        {sessionModal.isOpen && sessionModal.session && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeSessionModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-6 border-b border-legal-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-accent-100 rounded-full flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-accent-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-legal-dark-text font-baskervville">
                        {sessionModal.mode === 'edit' ? 'Edit Session' : 'Session Details'}
                      </h3>
                      <p className="text-legal-warm-text font-montserrat text-sm">
                        {sessionModal.session.subject} with {sessionModal.session.student.name}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeSessionModal}
                    className="p-2 text-legal-warm-text hover:text-legal-dark-text rounded-lg hover:bg-legal-bg-secondary/50 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
                <div className="space-y-6">
                  {/* Session Info */}
                  <div className="bg-legal-bg-secondary/30 rounded-lg p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-legal-dark-text font-montserrat">Student</label>
                        <p className="text-legal-warm-text font-montserrat">{sessionModal.session.student.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-legal-dark-text font-montserrat">Subject</label>
                        <p className="text-legal-warm-text font-montserrat">{sessionModal.session.subject}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-legal-dark-text font-montserrat">Date & Time</label>
                        <p className="text-legal-warm-text font-montserrat">
                          {formatDateTime(sessionModal.session.scheduledAt).date} at {formatDateTime(sessionModal.session.scheduledAt).time}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-legal-dark-text font-montserrat">Duration</label>
                        <p className="text-legal-warm-text font-montserrat">{sessionModal.session.duration} minutes</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-legal-dark-text font-montserrat">Type</label>
                        <p className="text-legal-warm-text font-montserrat capitalize flex items-center space-x-1">
                          {getTypeIcon(sessionModal.session.type)}
                          <span>{sessionModal.session.type}</span>
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-legal-dark-text font-montserrat">Amount</label>
                        <p className="text-legal-warm-text font-montserrat">{formatCurrency(sessionModal.session.payment.amount)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-legal-dark-text font-montserrat mb-2">
                      Status
                    </label>
                    {sessionModal.mode === 'edit' ? (
                      <select
                        value={editData.status}
                        onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value as Session['status'] }))}
                        className="w-full px-4 py-3 border border-legal-border rounded-lg font-montserrat focus:outline-none focus:ring-2 focus:ring-accent-500"
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    ) : (
                      <div className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium border ${getStatusColor(sessionModal.session.status)}`}>
                        {getStatusIcon(sessionModal.session.status)}
                        <span className="ml-2 capitalize">{sessionModal.session.status}</span>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-legal-dark-text font-montserrat mb-2">
                      Notes
                    </label>
                    {sessionModal.mode === 'edit' ? (
                      <textarea
                        value={editData.notes}
                        onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Add session notes..."
                        rows={3}
                        className="w-full px-4 py-3 border border-legal-border rounded-lg font-montserrat focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none"
                      />
                    ) : (
                      <p className="text-legal-warm-text font-montserrat p-3 bg-legal-bg-secondary/30 rounded-lg">
                        {sessionModal.session.notes || 'No notes added'}
                      </p>
                    )}
                  </div>

                  {/* Feedback (for completed sessions) */}
                  {(sessionModal.session.status === 'completed' || editData.status === 'completed') && (
                    <div>
                      <label className="block text-sm font-medium text-legal-dark-text font-montserrat mb-2">
                        Session Feedback
                      </label>
                      {sessionModal.mode === 'edit' ? (
                        <textarea
                          value={editData.feedback}
                          onChange={(e) => setEditData(prev => ({ ...prev, feedback: e.target.value }))}
                          placeholder="Add feedback about the session..."
                          rows={3}
                          className="w-full px-4 py-3 border border-legal-border rounded-lg font-montserrat focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none"
                        />
                      ) : (
                        <p className="text-legal-warm-text font-montserrat p-3 bg-legal-bg-secondary/30 rounded-lg">
                          {sessionModal.session.feedback || 'No feedback added'}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Rating (for completed sessions) */}
                  {(sessionModal.session.status === 'completed' || editData.status === 'completed') && (
                    <div>
                      <label className="block text-sm font-medium text-legal-dark-text font-montserrat mb-2">
                        Session Rating
                      </label>
                      {sessionModal.mode === 'edit' ? (
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              onClick={() => setEditData(prev => ({ ...prev, rating }))}
                              className={`p-1 ${editData.rating >= rating ? 'text-amber-400' : 'text-gray-300'} hover:text-amber-400 transition-colors`}
                            >
                              <Star className="w-6 h-6 fill-current" />
                            </button>
                          ))}
                          <span className="ml-2 text-sm text-legal-warm-text font-montserrat">
                            {editData.rating > 0 ? `${editData.rating}/5` : 'No rating'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <Star
                              key={rating}
                              className={`w-5 h-5 ${(sessionModal.session?.rating || 0) >= rating ? 'text-amber-400 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                          <span className="ml-2 text-sm text-legal-warm-text font-montserrat">
                            {sessionModal.session.rating ? `${sessionModal.session.rating}/5` : 'No rating'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              {sessionModal.mode === 'edit' && (
                <div className="p-4 sm:p-6 border-t border-legal-border bg-legal-bg-secondary/20">
                  <div className="flex flex-col sm:flex-row items-center justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                    <button
                      onClick={closeSessionModal}
                      className="w-full sm:w-auto px-6 py-2 text-legal-warm-text font-semibold rounded-lg border border-legal-border hover:bg-legal-bg-secondary/50 transition-colors font-montserrat"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={updateSession}
                      className="w-full sm:w-auto px-6 py-2 bg-accent-600 text-white font-semibold rounded-lg hover:bg-accent-700 transition-colors font-montserrat flex items-center justify-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Session Modal (Placeholder) */}
      <AnimatePresence>
        {createModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setCreateModal({ isOpen: false, loading: false })}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-accent-600" />
                </div>
                <h3 className="text-xl font-bold text-legal-dark-text font-baskervville mb-2">
                  Create New Session
                </h3>
                <p className="text-legal-warm-text font-montserrat mb-6">
                  Session creation form will be implemented here. This would include student selection, scheduling, and session details.
                </p>
                <button
                  onClick={() => setCreateModal({ isOpen: false, loading: false })}
                  className="w-full bg-accent-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-accent-700 transition-colors font-montserrat"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}