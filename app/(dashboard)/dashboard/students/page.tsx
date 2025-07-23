'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search,
  Users,
  Star,
  Calendar,
  MessageSquare,
  MoreHorizontal,
  BookOpen,
  Clock,
  DollarSign,
  TrendingUp,
  X,
  Send,
  Mail,
  AlertCircle,
  CheckCircle,
  MapPin,
  GraduationCap,
  Target,
  Activity,
} from 'lucide-react'

interface Student {
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

interface StudentsResponse {
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

interface MessageModal {
  isOpen: boolean;
  student: Student | null;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'my-students'>('all')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  })
  const [filters, setFilters] = useState({
    all: 0,
    'my-students': 0
  })
  const [messageModal, setMessageModal] = useState<MessageModal>({
    isOpen: false,
    student: null
  })
  const [messageForm, setMessageForm] = useState({
    subject: '',
    message: '',
    sending: false
  })

  const filterOptions = [
    { value: 'all', label: 'All Students' },
    { value: 'my-students', label: 'My Students' }
  ]

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        filter: selectedFilter,
        search: searchQuery,
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      })

      const response = await fetch(`/api/students?${params}`)
      if (!response.ok) throw new Error('Failed to fetch students')

      const data: StudentsResponse = await response.json()
      
      if (data.success) {
        setStudents(data.data)
        setPagination(data.pagination)
        setFilters(data.filters)
      }
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchStudents()
    }, searchQuery ? 500 : 0)

    return () => clearTimeout(debounceTimer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilter, searchQuery, pagination.page])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success-100 text-success-700 border-success-200'
      case 'new':
        return 'bg-accent-100 text-accent-700 border-accent-200'
      case 'inactive':
        return 'bg-red-100 text-red-700 border-red-200'
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

  const getStudyLevelDisplay = (level: string) => {
    const levels: { [key: string]: string } = {
      'undergraduate': 'Undergraduate',
      'graduate': 'Graduate',
      'high-school': 'High School',
      'middle-school': 'Middle School',
      'professional': 'Professional'
    }
    return levels[level] || level
  }

  const getGoalDisplay = (goal: string) => {
    const goals: { [key: string]: string } = {
      'academic-excellence': 'Academic Excellence',
      'exam-preparation': 'Exam Preparation',
      'skill-development': 'Skill Development',
      'career-advancement': 'Career Advancement',
      'personal-growth': 'Personal Growth'
    }
    return goals[goal] || goal
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'None scheduled'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n.charAt(0)).join('').toUpperCase()
  }

  const openMessageModal = (student: Student) => {
    setMessageModal({ isOpen: true, student })
    setMessageForm({
      subject: `Message regarding your ${student.studyLevel} studies`,
      message: '',
      sending: false
    })
  }

  const closeMessageModal = () => {
    setMessageModal({ isOpen: false, student: null })
    setMessageForm({ subject: '', message: '', sending: false })
  }

  const sendMessage = async () => {
    if (!messageModal.student || !messageForm.subject.trim() || !messageForm.message.trim()) {
      return
    }

    try {
      setMessageForm(prev => ({ ...prev, sending: true }))

      const response = await fetch('/api/students/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: messageModal.student._id,
          subject: messageForm.subject,
          message: messageForm.message
        })
      })

      const data = await response.json()

      if (data.success) {
        closeMessageModal()
        // Show success message (you can implement a toast notification here)
        alert('Message sent successfully!')
      } else {
        throw new Error(data.message || 'Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setMessageForm(prev => ({ ...prev, sending: false }))
    }
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-legal-lg border border-warm-200/50 p-8"
      >
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-accent-100 to-accent-200 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-accent-600" />
          </div>
          <div>
            <h1 className="text-3xl font-baskervville font-bold text-legal-dark-text">
              My Students
            </h1>
            <p className="text-legal-warm-text font-montserrat">
              Connect with and mentor students to help them achieve their academic goals
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Students', value: filters.all, icon: Users, color: 'accent' },
          { label: 'My Students', value: filters['my-students'], icon: TrendingUp, color: 'success' },
          { label: 'Total Sessions', value: students.reduce((sum, s) => sum + s.totalSessions, 0), icon: BookOpen, color: 'warm' },
          { label: 'Total Earnings', value: `${students.reduce((sum, s) => sum + s.totalEarnings, 0).toLocaleString()}`, icon: DollarSign, color: 'blue' }
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
                stat.color === 'success' ? 'bg-success-100 text-success-600' :
                stat.color === 'warm' ? 'bg-warm-100 text-warm-600' :
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

      {/* Search and Filters */}
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
              placeholder="Search students by name, email, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-legal-border rounded-xl font-montserrat transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 bg-legal-bg-secondary/30 rounded-lg p-1">
              {filterOptions.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setSelectedFilter(filter.value as 'all' | 'my-students')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors font-montserrat ${
                    selectedFilter === filter.value
                      ? 'bg-white text-accent-600 shadow-sm'
                      : 'text-legal-warm-text hover:text-accent-600'
                  }`}
                >
                  {filter.label} ({filter.value === 'all' ? filters.all : filters['my-students']})
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600"></div>
          <span className="ml-3 text-legal-warm-text font-montserrat">Loading students...</span>
        </div>
      )}

      {/* Students Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student, index) => (
            <motion.div
              key={student._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              className="bg-white/95 backdrop-blur-sm rounded-xl shadow-legal border border-warm-200/50 p-6 hover:shadow-legal-lg transition-all duration-300 cursor-pointer group"
            >
              {/* Student Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold ${getAvatarColor(index)}`}>
                    {getInitials(student.name)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-legal-dark-text font-baskervville">
                      {student.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(student.status)}`}>
                        {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                      </span>
                      {student.isEmailVerified && (
                        <CheckCircle className="w-4 h-4 text-success-500" aria-label="Email Verified" />
                      )}
                    </div>
                  </div>
                </div>
                
                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-legal-warm-text hover:text-accent-600">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              {/* Student Details */}
              <div className="space-y-3 mb-4">
                {/* Basic Info */}
                <div className="flex items-center space-x-2 text-sm text-legal-warm-text">
                  <GraduationCap className="w-4 h-4" />
                  <span className="font-montserrat">{getStudyLevelDisplay(student.studyLevel)}</span>
                  <span>•</span>
                  <span className="font-montserrat">{student.ageRange}</span>
                </div>

                {/* Location */}
                {student.location && (
                  <div className="flex items-center space-x-2 text-sm text-legal-warm-text">
                    <MapPin className="w-4 h-4" />
                    <span className="font-montserrat">{student.location}</span>
                  </div>
                )}

                {/* Session Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-legal-warm-text font-montserrat">Sessions:</span>
                    <span className="font-medium text-legal-dark-text">{student.totalSessions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-legal-warm-text font-montserrat">Hours:</span>
                    <span className="font-medium text-legal-dark-text">{student.stats.totalHoursLearned}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-legal-warm-text font-montserrat">Streak:</span>
                    <span className="font-medium text-legal-dark-text">{student.stats.studyStreak} days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-legal-warm-text font-montserrat">Progress:</span>
                    <span className="font-medium text-legal-dark-text">{student.stats.weeklyGoalProgress}%</span>
                  </div>
                </div>

                {/* Earnings (for my students only) */}
                {student.totalEarnings > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-legal-warm-text font-montserrat">Earnings:</span>
                    <span className="font-medium text-success-600">${student.totalEarnings}</span>
                  </div>
                )}

                {/* Rating */}
                {student.averageRating > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-legal-warm-text font-montserrat">Rating:</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-amber-400 fill-current" />
                      <span className="font-medium text-legal-dark-text">{student.averageRating}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Goals */}
              {student.goals && student.goals.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-legal-warm-text font-montserrat mb-2 flex items-center">
                    <Target className="w-3 h-3 mr-1" />
                    Goals:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {student.goals.slice(0, 2).map((goal, idx) => (
                      <span key={idx} className="bg-accent-100 text-accent-700 text-xs px-2 py-1 rounded-full font-montserrat">
                        {getGoalDisplay(goal)}
                      </span>
                    ))}
                    {student.goals.length > 2 && (
                      <span className="bg-warm-100 text-warm-700 text-xs px-2 py-1 rounded-full font-montserrat">
                        +{student.goals.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Subjects */}
              {student.subjects && student.subjects.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-legal-warm-text font-montserrat mb-2 flex items-center">
                    <BookOpen className="w-3 h-3 mr-1" />
                    Subjects:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {student.subjects.slice(0, 3).map((subject, idx) => (
                      <span key={idx} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-montserrat">
                        {subject}
                      </span>
                    ))}
                    {student.subjects.length > 3 && (
                      <span className="bg-warm-100 text-warm-700 text-xs px-2 py-1 rounded-full font-montserrat">
                        +{student.subjects.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Next Session */}
              {student.nextSession && (
                <div className="mb-4 p-3 bg-accent-50 border border-accent-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <Clock className="w-4 h-4 text-accent-600" />
                    <span className="text-xs font-medium text-accent-700 font-montserrat">Next Session</span>
                  </div>
                  <p className="text-sm font-medium text-accent-800 font-montserrat">
                    {formatDateTime(student.nextSession)}
                  </p>
                </div>
              )}

              {/* Last Activity */}
              <div className="mb-4 text-xs text-legal-warm-text font-montserrat flex items-center">
                <Activity className="w-3 h-3 mr-1" />
                {student.lastSession ? (
                  <span>Last session: {formatDate(student.lastSession)}</span>
                ) : (
                  <span>Last login: {formatDate(student.lastLoginAt)}</span>
                )}
              </div>

              {/* Contact Info */}
              <div className="mb-4 text-xs text-legal-warm-text font-montserrat">
                <div className="flex items-center space-x-1 mb-1">
                  <Mail className="w-3 h-3" />
                  <span>{student.email}</span>
                </div>
                {student.phone && (
                  <div className="flex items-center space-x-1">
                    <span>📞</span>
                    <span>{student.phone}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button 
                  onClick={() => openMessageModal(student)}
                  className="flex-1 bg-accent-100 text-accent-700 font-semibold py-2 px-3 rounded-lg hover:bg-accent-200 transition-colors font-montserrat text-sm flex items-center justify-center space-x-1"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Message</span>
                </button>
                <button className="flex-1 bg-white text-accent-600 font-semibold py-2 px-3 rounded-lg border border-accent-200 hover:bg-accent-50 transition-colors font-montserrat text-sm flex items-center justify-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Schedule</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination.pages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-8">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="px-4 py-2 text-sm font-medium text-legal-warm-text bg-white border border-legal-border rounded-lg hover:bg-accent-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
            const page = i + 1;
            return (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 text-sm font-medium rounded-lg ${
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
            className="px-4 py-2 text-sm font-medium text-legal-warm-text bg-white border border-legal-border rounded-lg hover:bg-accent-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && students.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/95 backdrop-blur-sm rounded-xl shadow-legal border border-warm-200/50 p-12 text-center"
        >
          <div className="w-16 h-16 bg-legal-bg-secondary/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-legal-warm-text" />
          </div>
          <h3 className="text-xl font-semibold text-legal-dark-text font-baskervville mb-2">
            No students found
          </h3>
          <p className="text-legal-warm-text font-montserrat mb-6">
            {searchQuery || selectedFilter !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'No students are currently registered on the platform.'}
          </p>
          {selectedFilter === 'all' && !searchQuery && (
            <div className="bg-accent-50 border border-accent-200 rounded-lg p-4 max-w-md mx-auto">
              <h4 className="font-semibold text-accent-800 mb-2">Start Your Mentoring Journey</h4>
              <p className="text-sm text-accent-700 font-montserrat">
                Students will find you through our platform. Make sure your profile is complete and optimized to attract learners!
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Message Modal */}
      <AnimatePresence>
        {messageModal.isOpen && messageModal.student && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeMessageModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-legal-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-accent-100 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-accent-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-legal-dark-text font-baskervville">
                        Send Message
                      </h3>
                      <p className="text-legal-warm-text font-montserrat text-sm">
                        To: {messageModal.student.name}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeMessageModal}
                    className="p-2 text-legal-warm-text hover:text-legal-dark-text rounded-lg hover:bg-legal-bg-secondary/50 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                {/* Student Info */}
                <div className="bg-legal-bg-secondary/30 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-accent-100 rounded-full flex items-center justify-center font-semibold text-accent-700">
                      {getInitials(messageModal.student.name)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-legal-dark-text font-montserrat">
                        {messageModal.student.name}
                      </h4>
                      <p className="text-sm text-legal-warm-text font-montserrat">
                        {messageModal.student.email}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-legal-warm-text font-montserrat mt-1">
                        <span>{getStudyLevelDisplay(messageModal.student.studyLevel)}</span>
                        <span>•</span>
                        <span>Sessions: {messageModal.student.totalSessions}</span>
                        <span>•</span>
                        <span>Joined: {formatDate(messageModal.student.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subject Field */}
                <div>
                  <label className="block text-sm font-medium text-legal-dark-text font-montserrat mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={messageForm.subject}
                    onChange={(e) => setMessageForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Enter message subject..."
                    className="w-full px-4 py-3 border border-legal-border rounded-lg font-montserrat focus:outline-none focus:ring-2 focus:ring-accent-500"
                    disabled={messageForm.sending}
                  />
                </div>

                {/* Message Field */}
                <div>
                  <label className="block text-sm font-medium text-legal-dark-text font-montserrat mb-2">
                    Message *
                  </label>
                  <textarea
                    value={messageForm.message}
                    onChange={(e) => setMessageForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Write your message here..."
                    rows={6}
                    className="w-full px-4 py-3 border border-legal-border rounded-lg font-montserrat focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none"
                    disabled={messageForm.sending}
                  />
                  <p className="text-xs text-legal-warm-text font-montserrat mt-1">
                    The student will receive this message via email and in their dashboard notifications.
                  </p>
                </div>

                {/* Warning */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800 font-montserrat">
                    <p className="font-medium">Professional Communication</p>
                    <p>Please maintain professional and respectful communication with students. All messages are logged for quality assurance.</p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-legal-border bg-legal-bg-secondary/20">
                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={closeMessageModal}
                    disabled={messageForm.sending}
                    className="px-6 py-2 text-legal-warm-text font-semibold rounded-lg border border-legal-border hover:bg-legal-bg-secondary/50 transition-colors font-montserrat disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={sendMessage}
                    disabled={messageForm.sending || !messageForm.subject.trim() || !messageForm.message.trim()}
                    className="px-6 py-2 bg-accent-600 text-white font-semibold rounded-lg hover:bg-accent-700 transition-colors font-montserrat disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {messageForm.sending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}