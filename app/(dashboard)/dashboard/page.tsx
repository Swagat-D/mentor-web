/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/context/AuthContext'
import { 
  Calendar,
  Users,
  TrendingUp,
  Clock,
  Star,
  BookOpen,
  DollarSign,
  AlertCircle,
  Loader,
  CheckCircle,
  MessageSquare,
  Eye,
  Activity,
  PieChart,
  ArrowRight,
  Plus,
  Zap
} from 'lucide-react'

interface DashboardStats {
  totalStudents: number
  totalSessions: number
  completedSessions: number
  upcomingSessions: number
  totalEarnings: number
  averageRating: number
  responseTime: number
  monthlyEarnings: number
  weeklyHours: number
  completionRate: number
}

interface Session {
  id: string
  student: {
    name: string
    avatar: string
  }
  subject: string
  scheduledAt: string
  duration: number
  status: string
  type: string
  rate: number
}

interface Student {
  id: string
  name: string
  avatar: string
  totalSessions: number
  lastSession: string
  status: string
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([])
  const [recentSessions, setRecentSessions] = useState<Session[]>([])
  const [topStudents, setTopStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Fetch dashboard stats
      const statsResponse = await fetch('/api/dashboard/stats', {
        credentials: 'include'
      })

      if (!statsResponse.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const statsData = await statsResponse.json()
      
      // Mock data for now - replace with actual API calls
      setStats({
        totalStudents: 24,
        totalSessions: 156,
        completedSessions: 142,
        upcomingSessions: 8,
        totalEarnings: 11700,
        averageRating: 4.8,
        responseTime: 120,
        monthlyEarnings: 1850,
        weeklyHours: 25,
        completionRate: 96
      })

      setUpcomingSessions([
        {
          id: '1',
          student: { name: 'Sarah Johnson', avatar: 'SJ' },
          subject: 'Advanced Calculus',
          scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          duration: 60,
          status: 'confirmed',
          type: 'video',
          rate: 75
        },
        {
          id: '2',
          student: { name: 'Mike Chen', avatar: 'MC' },
          subject: 'Statistics',
          scheduledAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
          duration: 60,
          status: 'confirmed',
          type: 'video',
          rate: 75
        },
        {
          id: '3',
          student: { name: 'Emma Davis', avatar: 'ED' },
          subject: 'Linear Algebra',
          scheduledAt: new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString(),
          duration: 60,
          status: 'confirmed',
          type: 'video',
          rate: 75
        }
      ])

      setRecentSessions([
        {
          id: '4',
          student: { name: 'Alex Thompson', avatar: 'AT' },
          subject: 'Probability',
          scheduledAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          duration: 60,
          status: 'completed',
          type: 'video',
          rate: 75
        },
        {
          id: '5',
          student: { name: 'Lisa Park', avatar: 'LP' },
          subject: 'Differential Equations',
          scheduledAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          duration: 90,
          status: 'completed',
          type: 'video',
          rate: 75
        }
      ])

      setTopStudents([
        {
          id: '1',
          name: 'Sarah Johnson',
          avatar: 'SJ',
          totalSessions: 12,
          lastSession: '2 hours ago',
          status: 'active'
        },
        {
          id: '2',
          name: 'Emma Davis',
          avatar: 'ED',
          totalSessions: 15,
          lastSession: '1 day ago',
          status: 'active'
        },
        {
          id: '3',
          name: 'Mike Chen',
          avatar: 'MC',
          totalSessions: 8,
          lastSession: '3 days ago',
          status: 'active'
        }
      ])

    } catch (error: any) {
      console.error('Dashboard data fetch failed:', error)
      setError(error.message || 'Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours > 0) {
      return diffInHours === 1 ? 'in 1 hour' : `in ${diffInHours} hours`
    } else {
      const diffInPastHours = Math.abs(diffInHours)
      return diffInPastHours === 1 ? '1 hour ago' : `${diffInPastHours} hours ago`
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

  const getNextSessionTime = () => {
    if (upcomingSessions.length === 0) return null
    const nextSession = upcomingSessions[0]
    const date = new Date(nextSession.scheduledAt)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-accent-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-baskervville font-bold text-legal-dark-text mb-2">
            Loading Dashboard
          </h2>
          <p className="text-legal-warm-text font-montserrat">
            Fetching your latest data...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-baskervville font-bold text-legal-dark-text mb-2">
            Unable to Load Dashboard
          </h2>
          <p className="text-legal-warm-text font-montserrat mb-6">
            {error}
          </p>
          <button
            onClick={fetchDashboardData}
            className="bg-accent-600 text-white font-semibold py-3 px-6 rounded-xl shadow-legal hover:shadow-legal-lg transition-all duration-300 font-montserrat"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-legal-lg border border-warm-200/50 p-4 sm:p-6 lg:p-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-2xl sm:text-3xl font-baskervville font-bold text-legal-dark-text mb-2">
              Welcome back, {user?.email?.split('@')[0] || 'Mentor'}! 👋
            </h1>
            <p className="text-legal-warm-text font-montserrat text-sm sm:text-base">
              Here&apos;s what&apos;s happening with your mentoring sessions today.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="bg-accent-50 border border-accent-200 rounded-xl p-3 sm:p-4 text-center min-w-0">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Calendar className="w-4 h-4 text-accent-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-accent-700 font-montserrat">Today</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-accent-800 font-baskervville">
                {upcomingSessions.filter(s => {
                  const sessionDate = new Date(s.scheduledAt)
                  const today = new Date()
                  return sessionDate.toDateString() === today.toDateString()
                }).length}
              </p>
              <p className="text-xs text-accent-600 font-montserrat">Sessions</p>
            </div>
            
            <div className="bg-success-50 border border-success-200 rounded-xl p-3 sm:p-4 text-center min-w-0">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Clock className="w-4 h-4 text-success-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium text-success-700 font-montserrat">Next Session</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-success-800 font-baskervville">
                {getNextSessionTime() || 'None'}
              </p>
              <p className="text-xs text-success-600 font-montserrat truncate">
                {upcomingSessions[0]?.student.name || 'scheduled'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
        {[
          {
            name: 'Total Students',
            value: stats?.totalStudents.toString() || '0',
            icon: Users,
            color: 'accent',
            description: 'Active students'
          },
          {
            name: 'Sessions',
            value: stats?.totalSessions.toString() || '0',
            icon: BookOpen,
            color: 'warm',
            description: 'Total completed'
          },
          {
            name: 'This Month',
            value: `$${stats?.monthlyEarnings || 0}`,
            icon: DollarSign,
            color: 'success',
            description: 'Earnings'
          },
          {
            name: 'Rating',
            value: stats?.averageRating.toFixed(1) || '0.0',
            icon: Star,
            color: 'amber',
            description: 'Average rating'
          },
          {
            name: 'Response',
            value: '< 2h',
            icon: Clock,
            color: 'blue',
            description: 'Response time'
          },
          {
            name: 'Success',
            value: `${stats?.completionRate || 0}%`,
            icon: TrendingUp,
            color: 'green',
            description: 'Completion rate'
          }
        ].map((stat, index) => {
          const colorClasses = {
            accent: 'bg-accent-50 border-accent-200 text-accent-600',
            warm: 'bg-warm-50 border-warm-200 text-warm-600',
            success: 'bg-success-50 border-success-200 text-success-600',
            amber: 'bg-amber-50 border-amber-200 text-amber-600',
            blue: 'bg-blue-50 border-blue-200 text-blue-600',
            green: 'bg-green-50 border-green-200 text-green-600'
          }
          
          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white/95 backdrop-blur-sm rounded-xl shadow-legal border border-warm-200/50 p-3 sm:p-4 lg:p-6"
            >
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg border flex items-center justify-center mb-2 sm:mb-3 ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                <stat.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-legal-dark-text font-baskervville mb-1">
                {stat.value}
              </p>
              <p className="text-xs text-legal-warm-text font-montserrat">
                {stat.name}
              </p>
              <p className="text-xs text-legal-warm-text/70 font-montserrat mt-1 hidden sm:block">
                {stat.description}
              </p>
            </motion.div>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Sessions */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Upcoming Sessions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-legal-lg border border-warm-200/50 p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-baskervville font-bold text-legal-dark-text">
                Upcoming Sessions
              </h3>
              <Calendar className="w-5 h-5 text-accent-600" />
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              {upcomingSessions.length > 0 ? upcomingSessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-xl border border-legal-border/30 hover:bg-legal-bg-secondary/20 transition-colors cursor-pointer"
                >
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-semibold text-sm ${getAvatarColor(index)}`}>
                    {session.student.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-semibold text-legal-dark-text font-montserrat truncate">
                      {session.student.name}
                    </p>
                    <p className="text-xs sm:text-sm text-legal-warm-text font-montserrat truncate">
                      {session.subject}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium text-legal-dark-text font-montserrat">
                      {formatTime(session.scheduledAt)}
                    </p>
                    <p className="text-xs text-accent-600 font-montserrat">
                      ${session.rate}
                    </p>
                  </div>
                </motion.div>
              )) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-legal-warm-text mx-auto mb-4" />
                  <p className="text-legal-warm-text font-montserrat">No upcoming sessions</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Recent Sessions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-legal-lg border border-warm-200/50 p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-baskervville font-bold text-legal-dark-text">
                Recent Sessions
              </h3>
              <Eye className="w-5 h-5 text-accent-600" />
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              {recentSessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-xl border border-legal-border/30 hover:bg-legal-bg-secondary/20 transition-colors"
                >
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-semibold text-sm ${getAvatarColor(index)}`}>
                    {session.student.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm sm:text-base font-semibold text-legal-dark-text font-montserrat truncate">
                        {session.student.name}
                      </p>
                      <CheckCircle className="w-4 h-4 text-success-500 flex-shrink-0" />
                    </div>
                    <p className="text-xs sm:text-sm text-legal-warm-text font-montserrat truncate">
                      {session.subject} • {formatTime(session.scheduledAt)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium text-success-600 font-montserrat">
                      ${session.rate}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Section - Analytics Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="bg-gradient-to-r from-accent-50 to-warm-50 border border-accent-200 rounded-xl sm:rounded-2xl p-4 sm:p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <PieChart className="w-6 h-6 text-accent-600" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-accent-800 font-baskervville mb-2">
                Weekly Insights
              </h4>
              <div className="space-y-1 text-sm text-accent-700 font-montserrat">
                <p>• Youv&apos;e completed {stats?.completedSessions || 0} sessions this week</p>
                <p>• Your earnings are up 23% from last week</p>
                <p>• Peak hours: 4-6 PM with highest booking rates</p>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button className="bg-white text-accent-700 font-semibold py-2 px-4 rounded-lg border border-accent-200 hover:bg-accent-50 transition-colors font-montserrat text-sm">
              View Analytics
            </button>
            <button className="bg-accent-600 text-white font-semibold py-2 px-4 rounded-lg shadow-legal hover:shadow-legal-lg transition-all duration-300 font-montserrat text-sm">
              Download Report
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

        {/* Right Column */}
        <div className="space-y-4 sm:space-y-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-legal-lg border border-warm-200/50 p-4 sm:p-6"
          >
            <div className="flex items-center space-x-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-100 to-accent-200 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-accent-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-baskervville font-bold text-legal-dark-text">
                Quick Actions
              </h3>
            </div>
            
            <div className="space-y-3">
              <button className="w-full bg-gradient-to-r from-accent-700 to-accent-600 text-white font-semibold py-3 px-4 rounded-xl shadow-legal hover:shadow-legal-lg transition-all duration-300 hover:scale-105 font-montserrat flex items-center justify-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Schedule Session</span>
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <button className="bg-legal-bg-secondary/30 hover:bg-legal-bg-secondary/50 text-legal-dark-text font-medium py-3 px-3 rounded-lg transition-colors font-montserrat flex flex-col items-center space-y-1 text-xs sm:text-sm">
                  <MessageSquare className="w-4 h-4" />
                  <span>Messages</span>
                </button>
                <button className="bg-legal-bg-secondary/30 hover:bg-legal-bg-secondary/50 text-legal-dark-text font-medium py-3 px-3 rounded-lg transition-colors font-montserrat flex flex-col items-center space-y-1 text-xs sm:text-sm">
                  <Users className="w-4 h-4" />
                  <span>Students</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Top Students */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-legal-lg border border-warm-200/50 p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-baskervville font-bold text-legal-dark-text">
                Top Students
              </h3>
              <Users className="w-5 h-5 text-accent-600" />
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              {topStudents.map((student, index) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-legal-bg-secondary/20 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${getAvatarColor(index)}`}>
                    {student.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-legal-dark-text font-montserrat truncate">
                      {student.name}
                    </p>
                    <p className="text-xs text-legal-warm-text font-montserrat">
                      {student.totalSessions} sessions • {student.lastSession}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-legal-warm-text flex-shrink-0" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Performance Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-legal-lg border border-warm-200/50 p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-baskervville font-bold text-legal-dark-text">
                This Month
              </h3>
              <Activity className="w-5 h-5 text-success-600" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-legal-warm-text font-montserrat">Sessions Completed</span>
                <span className="text-lg font-bold text-legal-dark-text font-baskervville">
                  {stats?.completedSessions || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-legal-warm-text font-montserrat">Average Rating</span>
                <span className="text-lg font-bold text-legal-dark-text font-baskervville">
                  {stats?.averageRating.toFixed(1) || '0.0'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-legal-warm-text font-montserrat">Response Rate</span>
                <span className="text-lg font-bold text-legal-dark-text font-baskervville">98%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-legal-warm-text font-montserrat">Total Earnings</span>
                <span className="text-lg font-bold text-success-600 font-baskervville">
                  ${stats?.monthlyEarnings || 0}
                </span>
              </div>
            </div>
          </motion.div>
        </div>