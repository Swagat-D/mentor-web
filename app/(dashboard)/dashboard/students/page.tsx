'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Search,
  Filter,
  Plus,
  Users,
  Star,
  Calendar,
  MessageSquare,
  MoreHorizontal,
  BookOpen,
  Clock,
  DollarSign,
  TrendingUp,
} from 'lucide-react'

export default function StudentsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')

  const filters = [
    { value: 'all', label: 'All Students', count: 24 },
    { value: 'active', label: 'Active', count: 18 },
    { value: 'new', label: 'New', count: 3 },
    { value: 'inactive', label: 'Inactive', count: 3 }
  ]

  const students = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '+1 (555) 123-4567',
      avatar: 'SJ',
      subjects: ['Advanced Calculus', 'Statistics'],
      status: 'active',
      sessionsCompleted: 12,
      totalEarnings: 900,
      averageRating: 5.0,
      lastSession: '2 hours ago',
      nextSession: 'Today, 2:30 PM',
      joinedDate: '2023-10-15',
      notes: 'Excellent student, very engaged in learning',
      sessionRate: 75,
      preferredTime: 'Afternoons',
      timezone: 'EST'
    },
    {
      id: 2,
      name: 'Mike Chen',
      email: 'mike.chen@email.com',
      phone: '+1 (555) 234-5678',
      avatar: 'MC',
      subjects: ['Statistics', 'Data Analysis'],
      status: 'active',
      sessionsCompleted: 8,
      totalEarnings: 600,
      averageRating: 4.8,
      lastSession: '1 day ago',
      nextSession: 'Tomorrow, 4:00 PM',
      joinedDate: '2023-11-02',
      notes: 'Working on advanced statistical concepts',
      sessionRate: 75,
      preferredTime: 'Evenings',
      timezone: 'PST'
    },
    {
      id: 3,
      name: 'Emma Davis',
      email: 'emma.davis@email.com',
      phone: '+1 (555) 345-6789',
      avatar: 'ED',
      subjects: ['Linear Algebra', 'Calculus'],
      status: 'active',
      sessionsCompleted: 15,
      totalEarnings: 1125,
      averageRating: 4.9,
      lastSession: '3 days ago',
      nextSession: 'Today, 6:30 PM',
      joinedDate: '2023-09-20',
      notes: 'Preparing for university entrance exams',
      sessionRate: 75,
      preferredTime: 'Evenings',
      timezone: 'EST'
    },
    {
      id: 4,
      name: 'Alex Thompson',
      email: 'alex.t@email.com',
      phone: '+1 (555) 456-7890',
      avatar: 'AT',
      subjects: ['Probability Theory'],
      status: 'new',
      sessionsCompleted: 2,
      totalEarnings: 150,
      averageRating: 5.0,
      lastSession: '1 week ago',
      nextSession: 'Pending',
      joinedDate: '2023-12-01',
      notes: 'New student, showing great potential',
      sessionRate: 75,
      preferredTime: 'Mornings',
      timezone: 'CST'
    },
    {
      id: 5,
      name: 'Lisa Park',
      email: 'lisa.park@email.com',
      phone: '+1 (555) 567-8901',
      avatar: 'LP',
      subjects: ['Differential Equations'],
      status: 'inactive',
      sessionsCompleted: 6,
      totalEarnings: 450,
      averageRating: 4.7,
      lastSession: '2 weeks ago',
      nextSession: 'None scheduled',
      joinedDate: '2023-10-08',
      notes: 'Taking a break for exams',
      sessionRate: 75,
      preferredTime: 'Afternoons',
      timezone: 'MST'
    }
  ]

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

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.subjects.some(subject => subject.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesFilter = selectedFilter === 'all' || student.status === selectedFilter
    
    return matchesSearch && matchesFilter
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
              <Users className="w-6 h-6 text-accent-600" />
            </div>
            <div>
              <h1 className="text-3xl font-baskervville font-bold text-legal-dark-text">
                My Students
              </h1>
              <p className="text-legal-warm-text font-montserrat">
                Manage your student relationships and track progress
              </p>
            </div>
          </div>
          
          <button className="bg-gradient-to-r from-accent-700 to-accent-600 text-white font-semibold py-3 px-6 rounded-xl shadow-legal-lg hover:shadow-legal-xl transition-all duration-300 hover:scale-105 font-montserrat flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Add Student</span>
          </button>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Students', value: students.length, icon: Users, color: 'accent' },
          { label: 'Active Students', value: students.filter(s => s.status === 'active').length, icon: TrendingUp, color: 'success' },
          { label: 'Total Sessions', value: students.reduce((sum, s) => sum + s.sessionsCompleted, 0), icon: BookOpen, color: 'warm' },
          { label: 'Total Earnings', value: `$${students.reduce((sum, s) => sum + s.totalEarnings, 0).toLocaleString()}`, icon: DollarSign, color: 'blue' }
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
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-legal-border rounded-xl font-montserrat transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-3">
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

            <button className="p-2 text-legal-warm-text hover:text-accent-600 transition-colors border border-legal-border rounded-lg">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student, index) => (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
            className="bg-white/95 backdrop-blur-sm rounded-xl shadow-legal border border-warm-200/50 p-6 hover:shadow-legal-lg transition-all duration-300 cursor-pointer group"
          >
            {/* Student Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold ${getAvatarColor(index)}`}>
                  {student.avatar}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-legal-dark-text font-baskervville">
                    {student.name}
                  </h3>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(student.status)}`}>
                    {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                  </span>
                </div>
              </div>
              
              <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-legal-warm-text hover:text-accent-600">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Student Info */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-legal-warm-text font-montserrat">Sessions:</span>
                <span className="font-medium text-legal-dark-text">{student.sessionsCompleted}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-legal-warm-text font-montserrat">Earnings:</span>
                <span className="font-medium text-success-600">${student.totalEarnings}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-legal-warm-text font-montserrat">Rating:</span>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-amber-400 fill-current" />
                  <span className="font-medium text-legal-dark-text">{student.averageRating}</span>
                </div>
              </div>
            </div>

            {/* Subjects */}
            <div className="mb-4">
              <p className="text-xs text-legal-warm-text font-montserrat mb-2">Subjects:</p>
              <div className="flex flex-wrap gap-1">
                {student.subjects.map((subject, idx) => (
                  <span key={idx} className="bg-accent-100 text-accent-700 text-xs px-2 py-1 rounded-full font-montserrat">
                    {subject}
                  </span>
                ))}
              </div>
            </div>

            {/* Next Session */}
            {student.nextSession !== 'None scheduled' && student.nextSession !== 'Pending' && (
              <div className="mb-4 p-3 bg-accent-50 border border-accent-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <Clock className="w-4 h-4 text-accent-600" />
                  <span className="text-xs font-medium text-accent-700 font-montserrat">Next Session</span>
                </div>
                <p className="text-sm font-medium text-accent-800 font-montserrat">
                  {student.nextSession}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-2">
              <button className="flex-1 bg-accent-100 text-accent-700 font-semibold py-2 px-3 rounded-lg hover:bg-accent-200 transition-colors font-montserrat text-sm flex items-center justify-center space-x-1">
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

      {/* Empty State */}
      {filteredStudents.length === 0 && (
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
              : 'Start building your student network'}
          </p>
          <button className="bg-gradient-to-r from-accent-700 to-accent-600 text-white font-semibold py-3 px-6 rounded-xl shadow-legal-lg hover:shadow-legal-xl transition-all duration-300 hover:scale-105 font-montserrat">
            Add Your First Student
          </button>
        </motion.div>
      )}
    </div>
  )
}