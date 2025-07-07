'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
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
} from 'lucide-react'

export default function SessionsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  const filters = [
    { value: 'all', label: 'All Sessions', count: 45 },
    { value: 'today', label: 'Today', count: 3 },
    { value: 'upcoming', label: 'Upcoming', count: 8 },
    { value: 'completed', label: 'Completed', count: 32 },
    { value: 'cancelled', label: 'Cancelled', count: 2 }
  ]

  const statusFilters = [
    { value: 'all', label: 'All Status' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'pending', label: 'Pending' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ]

  const sessions = [
    {
      id: 1,
      title: 'Advanced Calculus',
      student: {
        name: 'Sarah Johnson',
        email: 'sarah.j@email.com',
        avatar: 'SJ'
      },
      date: new Date(2024, 11, 12, 14, 30),
      duration: 60,
      status: 'confirmed',
      type: 'video',
      rate: 75,
      subject: 'Mathematics',
      level: 'Advanced',
      notes: 'Focus on integration by parts and advanced techniques',
      materials: ['Calculus Textbook Ch. 7', 'Practice Problems Set 3'],
      recurring: false,
      sessionNumber: 12,
      totalSessions: 20,
      rating: null,
      earnings: 75
    },
    {
      id: 2,
      title: 'Statistics Review',
      student: {
        name: 'Mike Chen',
        email: 'mike.chen@email.com',
        avatar: 'MC'
      },
      date: new Date(2024, 11, 12, 16, 0),
      duration: 60,
      status: 'confirmed',
      type: 'video',
      rate: 75,
      subject: 'Statistics',
      level: 'Intermediate',
      notes: 'Weekly review session covering hypothesis testing',
      materials: ['Statistics Notes', 'R Programming Examples'],
      recurring: true,
      sessionNumber: 8,
      totalSessions: null,
      rating: null,
      earnings: 75
    },
    {
      id: 3,
      title: 'Linear Algebra Fundamentals',
      student: {
        name: 'Emma Davis',
        email: 'emma.davis@email.com',
        avatar: 'ED'
      },
      date: new Date(2024, 11, 11, 18, 30),
      duration: 60,
      status: 'completed',
      type: 'video',
      rate: 75,
      subject: 'Mathematics',
      level: 'Intermediate',
      notes: 'Matrix operations and eigenvalues covered successfully',
      materials: ['Linear Algebra Guide', 'Matrix Calculator'],
      recurring: false,
      sessionNumber: 15,
      totalSessions: 20,
      rating: 5,
      earnings: 75
    },
    {
      id: 4,
      title: 'Probability Theory Introduction',
      student: {
        name: 'Alex Thompson',
        email: 'alex.t@email.com',
        avatar: 'AT'
      },
      date: new Date(2024, 11, 13, 15, 0),
      duration: 60,
      status: 'pending',
      type: 'video',
      rate: 75,
      subject: 'Mathematics',
      level: 'Beginner',
      notes: 'First session on probability theory basics',
      materials: ['Probability Textbook', 'Basic Examples'],
      recurring: false,
      sessionNumber: 2,
      totalSessions: 10,
      rating: null,
      earnings: 0
    },
    {
      id: 5,
      title: 'Differential Equations',
      student: {
        name: 'Lisa Park',
        email: 'lisa.park@email.com',
        avatar: 'LP'
      },
      date: new Date(2024, 11, 10, 17, 0),
      duration: 90,
      status: 'completed',
      type: 'video',
      rate: 75,
      subject: 'Mathematics',
      level: 'Advanced',
      notes: 'Second-order linear equations with constant coefficients',
      materials: ['DE Textbook Ch. 4', 'Solution Methods Guide'],
      recurring: true,
      sessionNumber: 6,
      totalSessions: null,
      rating: 4,
      earnings: 112.5
    },
    {
      id: 6,
      title: 'Algebra Basics',
      student: {
        name: 'David Wilson',
        email: 'david.w@email.com',
        avatar: 'DW'
      },
      date: new Date(2024, 11, 9, 16, 30),
      duration: 45,
      status: 'cancelled',
      type: 'video',
      rate: 75,
      subject: 'Mathematics',
      level: 'Beginner',
      notes: 'Student cancelled due to emergency',
      materials: ['Basic Algebra Worksheets'],
      recurring: false,
      sessionNumber: 1,
      totalSessions: 5,
      rating: null,
      earnings: 0
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-success-500" />
      case 'confirmed':
        return <Clock className="w-4 h-4 text-accent-500" />
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-amber-500" />
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'in-progress':
        return <Video className="w-4 h-4 text-blue-500" />
      default:
        return <Clock className="w-4 h-4 text-legal-warm-text" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success-100 text-success-700 border-success-200'
      case 'confirmed':
        return 'bg-accent-100 text-accent-700 border-accent-200'
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'in-progress':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      default:
        return 'bg-warm-100 text-warm-700 border-warm-200'
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

  const formatDateTime = (date: Date) => {
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

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.subject.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'today' && session.date.toDateString() === new Date().toDateString()) ||
                         (selectedFilter === 'upcoming' && session.date > new Date()) ||
                         (selectedFilter === 'completed' && session.status === 'completed') ||
                         (selectedFilter === 'cancelled' && session.status === 'cancelled')
    
    const matchesStatus = selectedStatus === 'all' || session.status === selectedStatus
    
    return matchesSearch && matchesFilter && matchesStatus
  })

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
              <BookOpen className="w-6 h-6 text-accent-600" />
            </div>
            <div>
              <h1 className="text-3xl font-baskervville font-bold text-legal-dark-text">
                Sessions
              </h1>
              <p className="text-legal-warm-text font-montserrat">
                Manage and track all your mentoring sessions
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="bg-white text-accent-600 font-semibold py-3 px-6 rounded-xl border border-accent-200 hover:bg-accent-50 transition-colors font-montserrat flex items-center space-x-2">
              <Download className="w-5 h-5" />
              <span>Export</span>
            </button>
            <button className="bg-gradient-to-r from-accent-700 to-accent-600 text-white font-semibold py-3 px-6 rounded-xl shadow-legal-lg hover:shadow-legal-xl transition-all duration-300 hover:scale-105 font-montserrat flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>New Session</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Sessions', value: sessions.length, icon: BookOpen, color: 'accent' },
          { label: 'This Week', value: sessions.filter(s => {
            const weekStart = new Date()
            weekStart.setDate(weekStart.getDate() - weekStart.getDay())
            return s.date >= weekStart
          }).length, icon: Calendar, color: 'warm' },
          { label: 'Completed', value: sessions.filter(s => s.status === 'completed').length, icon: CheckCircle, color: 'success' },
          { label: 'Total Earnings', value: `$${sessions.reduce((sum, s) => sum + s.earnings, 0)}`, icon: Star, color: 'blue' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="bg-white/95 backdrop-blur-sm rounded-xl shadow-legal border border-warm-200/50 p-6"
          >
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                stat.color === 'accent' ? 'bg-accent-100 text-accent-600' :
                stat.color === 'warm' ? 'bg-warm-100 text-warm-600' :
                stat.color === 'success' ? 'bg-success-100 text-success-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-legal-dark-text font-baskervville">
                  {stat.value}
                </p>
                <p className="text-sm text-legal-warm-text font-montserrat">
                  {stat.label}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white/95 backdrop-blur-sm rounded-xl shadow-legal border border-warm-200/50 p-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-legal-warm-text" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-legal-border rounded-xl font-montserrat transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-3">
            {/* Time Filter */}
            <div className="flex items-center space-x-1 bg-legal-bg-secondary/30 rounded-lg p-1">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setSelectedFilter(filter.value)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors font-montserrat ${
                    selectedFilter === filter.value
                      ? 'bg-white text-accent-600 shadow-sm'
                      : 'text-legal-warm-text hover:text-accent-600'
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-legal-border rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
            >
              {statusFilters.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Sessions List */}
      <div className="space-y-4">
        {filteredSessions.map((session, index) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
            className="bg-white/95 backdrop-blur-sm rounded-xl shadow-legal border border-warm-200/50 p-6 hover:shadow-legal-lg transition-all duration-300 group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                {/* Avatar */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold ${getAvatarColor(index)}`}>
                  {session.student.avatar}
                </div>

                {/* Session Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-legal-dark-text font-baskervville">
                      {session.title}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(session.status)}`}>
                      {getStatusIcon(session.status)}
                      <span className="ml-1 capitalize">{session.status}</span>
                    </span>
                    {session.recurring && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                        Recurring
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm text-legal-warm-text font-montserrat mb-3">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{session.student.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDateTime(session.date).date}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDateTime(session.date).time}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>{session.duration}min</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="font-medium text-success-600">${session.rate}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 text-sm text-legal-warm-text font-montserrat">
                    <div>
                      <span className="font-medium">Subject:</span> {session.subject}
                    </div>
                    <div>
                      <span className="font-medium">Level:</span> {session.level}
                    </div>
                    <div>
                      <span className="font-medium">Session:</span> {session.sessionNumber}
                      {session.totalSessions && `/${session.totalSessions}`}
                    </div>
                    {session.rating && (
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-amber-400 fill-current" />
                        <span>{session.rating}</span>
                      </div>
                    )}
                  </div>

                  {session.notes && (
                    <p className="text-sm text-legal-warm-text/80 font-montserrat mt-3 italic">
                      &quot;{session.notes}&quot;
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 text-legal-warm-text hover:text-accent-600 transition-colors rounded-lg hover:bg-legal-bg-secondary/50">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 text-legal-warm-text hover:text-accent-600 transition-colors rounded-lg hover:bg-legal-bg-secondary/50">
                  <MessageSquare className="w-4 h-4" />
                </button>
                <button className="p-2 text-legal-warm-text hover:text-accent-600 transition-colors rounded-lg hover:bg-legal-bg-secondary/50">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 text-legal-warm-text hover:text-accent-600 transition-colors rounded-lg hover:bg-legal-bg-secondary/50">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredSessions.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/95 backdrop-blur-sm rounded-xl shadow-legal border border-warm-200/50 p-12 text-center"
        >
          <div className="w-16 h-16 bg-legal-bg-secondary/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-legal-warm-text" />
          </div>
          <h3 className="text-xl font-semibold text-legal-dark-text font-baskervville mb-2">
            No sessions found
          </h3>
          <p className="text-legal-warm-text font-montserrat mb-6">
            {searchQuery || selectedFilter !== 'all' || selectedStatus !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Start scheduling sessions with your students'}
          </p>
        </motion.div>
      )}
    </div>
  )
}