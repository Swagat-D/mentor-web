'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/context/AuthContext'
import { useRouter } from 'next/navigation'
import { 
  Calendar,
  Users,
  TrendingUp,
  Clock,
  Star,
  BookOpen,
  DollarSign,
  AlertCircle,
  Loader2,
  CheckCircle,
  Activity,
  ArrowRight,
  Plus,
  MessageSquare,
  Search
} from 'lucide-react'

interface DashboardData {
  stats: {
    totalStudents?: number;
    totalSessions: number;
    completedSessions: number;
    upcomingSessions: number;
    totalEarnings?: number;
    monthlyEarnings?: number;
    weeklyEarnings?: number;
    totalSpent?: number;
    monthlySpent?: number;
    averageRating?: number;
    completionRate: number;
    responseTime?: string;
    weeklyHours?: number;
    favoriteMentors?: number;
  };
  upcomingSessions: Array<{
    id: string;
    student?: { name: string; avatar: string };
    mentor?: { name: string; avatar: string };
    subject: string;
    scheduledAt: string;
    duration: number;
    status: string;
    type: string;
    rate: number;
  }>;
  recentSessions: Array<{
    id: string;
    student?: { name: string; avatar: string };
    mentor?: { name: string; avatar: string };
    subject: string;
    scheduledAt: string;
    duration: number;
    status: string;
    type: string;
    rate: number;
  }>;
  topStudents?: Array<{
    id: string;
    name: string;
    avatar: string;
    totalSessions: number;
    lastSession: string | null;
  }>;
  insights?: {
    weeklySessionsCompleted: number;
    earningsGrowth: number;
    peakHours: string;
    totalReviews: number;
    pendingReplies: number;
  };
}

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [quickStats, setQuickStats] = useState<{
    unreadMessages?: number;
    pendingReviews?: number;
    todaySessions?: number;
    upcomingSessions?: number;
  } | null>(null)

  useEffect(() => {
    fetchDashboardData()
    fetchQuickStats()
  }, [])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/dashboard', {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const result = await response.json()
      
      if (result.success) {
        setDashboardData(result.data)
      } else {
        throw new Error(result.message || 'Failed to load dashboard data')
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Dashboard data fetch failed:', error)
      setError(error.message || 'Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchQuickStats = async () => {
    try {
      const response = await fetch('/api/dashboard/quick-actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'quick-stats' })
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setQuickStats(result.data)
        }
      }
    } catch (error) {
      console.error('Failed to fetch quick stats:', error)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours > 0) {
      if (diffInHours < 24) {
        return diffInHours === 1 ? 'in 1 hour' : `in ${diffInHours} hours`
      } else {
        const days = Math.floor(diffInHours / 24)
        return days === 1 ? 'in 1 day' : `in ${days} days`
      }
    } else {
      const diffInPastHours = Math.abs(diffInHours)
      if (diffInPastHours < 24) {
        return diffInPastHours === 1 ? '1 hour ago' : `${diffInPastHours} hours ago`
      } else {
        const days = Math.floor(diffInPastHours / 24)
        return days === 1 ? '1 day ago' : `${days} days ago`
      }
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
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
    if (!dashboardData?.upcomingSessions.length) return null
    const nextSession = dashboardData.upcomingSessions[0]
    const date = new Date(nextSession.scheduledAt)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getTodaySessionsCount = () => {
    if (!dashboardData?.upcomingSessions) return 0
    const today = new Date().toDateString()
    return dashboardData.upcomingSessions.filter(s => 
      new Date(s.scheduledAt).toDateString() === today
    ).length
  }

  // Quick action handlers
  const handleQuickAction = async (action: string) => {
    setActionLoading(action)
    
    try {
      switch (action) {
        case 'schedule-session':
        case 'add-availability':
          // Navigate to calendar/scheduling page
          router.push('/dashboard/calendar')
          break
          
        case 'book-session':
          // Navigate to mentor search page
          router.push('/find-mentors')
          break
          
        case 'messages':
          // Navigate to messages page
          router.push('/dashboard/messages')
          break
          
        case 'students':
          // Navigate to students page (for mentors)
          router.push('/dashboard/students')
          break
          
        case 'find-mentors':
          // Navigate to find mentors page
          router.push('/find-mentors')
          break
          
        case 'reviews':
          // Navigate to reviews page
          router.push('/dashboard/reviews')
          break
          
        default:
          console.warn('Unknown action:', action)
      }
    } catch (error) {
      console.error('Navigation error:', error)
    } finally {
      setTimeout(() => setActionLoading(null), 500) // Small delay for visual feedback
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-accent-600 animate-spin mx-auto mb-4" />
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

  if (!dashboardData) return null

  const isMentor = user?.role === 'mentor'

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-legal-lg border border-warm-200/50 p-6 lg:p-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-6 lg:mb-0">
            <h1 className="text-3xl font-baskervville font-bold text-legal-dark-text mb-2">
              Welcome back, {user?.firstName || user?.email?.split('@')[0] || (isMentor ? 'Mentor' : 'Student')}! 👋
            </h1>
            <p className="text-legal-warm-text font-montserrat">
              {isMentor 
                ? "Here's what's happening with your mentoring sessions today."
                : "Ready for your next learning session?"
              }
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="bg-accent-50 border border-accent-200 rounded-xl p-4 text-center min-w-0">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Calendar className="w-4 h-4 text-accent-600 flex-shrink-0" />
                <span className="text-sm font-medium text-accent-700 font-montserrat">Today</span>
              </div>
              <p className="text-2xl font-bold text-accent-800 font-baskervville">
                {getTodaySessionsCount()}
              </p>
              <p className="text-xs text-accent-600 font-montserrat">Sessions</p>
            </div>
            
            <div className="bg-success-50 border border-success-200 rounded-xl p-4 text-center min-w-0">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Clock className="w-4 h-4 text-success-600 flex-shrink-0" />
                <span className="text-sm font-medium text-success-700 font-montserrat">Next Session</span>
              </div>
              <p className="text-xl font-bold text-success-800 font-baskervville">
                {getNextSessionTime() || 'None'}
              </p>
              <p className="text-xs text-success-600 font-montserrat truncate">
                {dashboardData.upcomingSessions[0] 
                  ? (isMentor 
                      ? dashboardData.upcomingSessions[0].student?.name 
                      : dashboardData.upcomingSessions[0].mentor?.name) || 'scheduled'
                  : 'scheduled'
                }
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {(isMentor
          ? [
              {
                name: 'Students',
                value: dashboardData.stats.totalStudents?.toString() || '0',
                icon: Users,
                color: 'accent',
                description: 'Active students'
              },
              {
                name: 'Sessions',
                value: dashboardData.stats.totalSessions.toString(),
                icon: BookOpen,
                color: 'warm',
                description: 'Total completed'
              },
              {
                name: 'This Month',
                value: formatCurrency(dashboardData.stats.monthlyEarnings || 0),
                icon: DollarSign,
                color: 'success',
                description: 'Earnings'
              },
              {
                name: 'Rating',
                value: dashboardData.stats.averageRating?.toFixed(1) || '0.0',
                icon: Star,
                color: 'amber',
                description: 'Average rating'
              },
              {
                name: 'Response',
                value: dashboardData.stats.responseTime || '< 2h',
                icon: Clock,
                color: 'blue',
                description: 'Response time'
              },
              {
                name: 'Success',
                value: `${dashboardData.stats.completionRate}%`,
                icon: TrendingUp,
                color: 'green',
                description: 'Completion rate'
              }
            ]
          : [
              {
                name: 'Sessions',
                value: dashboardData.stats.totalSessions.toString(),
                icon: BookOpen,
                color: 'accent',
                description: 'Total sessions'
              },
              {
                name: 'Completed',
                value: dashboardData.stats.completedSessions.toString(),
                icon: CheckCircle,
                color: 'success',
                description: 'Finished sessions'
              },
              {
                name: 'This Month',
                value: formatCurrency(dashboardData.stats.monthlySpent || 0),
                icon: DollarSign,
                color: 'warm',
                description: 'Investment'
              },
              {
                name: 'Mentors',
                value: dashboardData.stats.favoriteMentors?.toString() || '0',
                icon: Users,
                color: 'blue',
                description: 'Connected mentors'
              },
              {
                name: 'Success Rate',
                value: `${dashboardData.stats.completionRate}%`,
                icon: TrendingUp,
                color: 'green',
                description: 'Completion rate'
              },
              {
                name: 'Upcoming',
                value: dashboardData.stats.upcomingSessions.toString(),
                icon: Calendar,
                color: 'purple',
                description: 'Scheduled sessions'
              }
            ]
        ).map((stat, index) => {
          const colorClasses = {
            accent: 'bg-accent-50 border-accent-200 text-accent-600',
            warm: 'bg-warm-50 border-warm-200 text-warm-600',
            success: 'bg-success-50 border-success-200 text-success-600',
            amber: 'bg-amber-50 border-amber-200 text-amber-600',
            blue: 'bg-blue-50 border-blue-200 text-blue-600',
            green: 'bg-green-50 border-green-200 text-green-600',
            purple: 'bg-purple-50 border-purple-200 text-purple-600'
          }
          
          return (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white/95 backdrop-blur-sm rounded-xl shadow-legal border border-warm-200/50 p-6"
            >
              <div className={`w-10 h-10 rounded-lg border flex items-center justify-center mb-3 ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-legal-dark-text font-baskervville mb-1">
                {stat.value}
              </p>
              <p className="text-xs text-legal-warm-text font-montserrat">
                {stat.name}
              </p>
              <p className="text-xs text-legal-warm-text/70 font-montserrat mt-1">
                {stat.description}
              </p>
            </motion.div>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Sessions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Sessions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-legal-lg border border-warm-200/50 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-baskervville font-bold text-legal-dark-text">
                Upcoming Sessions
              </h3>
              <Calendar className="w-5 h-5 text-accent-600" />
            </div>
            
            <div className="space-y-4">
              {dashboardData.upcomingSessions.length > 0 ? dashboardData.upcomingSessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center space-x-4 p-4 rounded-xl border border-legal-border/30 hover:bg-legal-bg-secondary/20 transition-colors cursor-pointer"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm ${getAvatarColor(index)}`}>
                    {isMentor ? session.student?.avatar : session.mentor?.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-legal-dark-text font-montserrat truncate">
                      {isMentor ? session.student?.name : session.mentor?.name}
                    </p>
                    <p className="text-sm text-legal-warm-text font-montserrat truncate">
                      {session.subject}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium text-legal-dark-text font-montserrat">
                      {formatTime(session.scheduledAt)}
                    </p>
                    <p className="text-xs text-accent-600 font-montserrat">
                      {formatCurrency(session.rate)}
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
            className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-legal-lg border border-warm-200/50 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-baskervville font-bold text-legal-dark-text">
                Recent Sessions
              </h3>
              <Activity className="w-5 h-5 text-accent-600" />
            </div>
            
            <div className="space-y-4">
              {dashboardData.recentSessions.length > 0 ? dashboardData.recentSessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center space-x-4 p-4 rounded-xl border border-legal-border/30 hover:bg-legal-bg-secondary/20 transition-colors"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm ${getAvatarColor(index)}`}>
                    {isMentor ? session.student?.avatar : session.mentor?.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="font-semibold text-legal-dark-text font-montserrat truncate">
                        {isMentor ? session.student?.name : session.mentor?.name}
                      </p>
                      <CheckCircle className="w-4 h-4 text-success-500 flex-shrink-0" />
                    </div>
                    <p className="text-sm text-legal-warm-text font-montserrat truncate">
                      {session.subject} • {formatTime(session.scheduledAt)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium text-success-600 font-montserrat">
                      {formatCurrency(session.rate)}
                    </p>
                  </div>
                </motion.div>
              )) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-legal-warm-text mx-auto mb-4" />
                  <p className="text-legal-warm-text font-montserrat">No recent sessions</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-legal-lg border border-warm-200/50 p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-100 to-accent-200 rounded-xl flex items-center justify-center">
                <Plus className="w-5 h-5 text-accent-600" />
              </div>
              <h3 className="text-xl font-baskervville font-bold text-legal-dark-text">
                Quick Actions
              </h3>
            </div>
            
            <div className="space-y-3">
              {isMentor ? (
                <>
                  <button 
                    onClick={() => handleQuickAction('add-availability')}
                    disabled={actionLoading === 'add-availability'}
                    className="w-full bg-gradient-to-r from-accent-700 to-accent-600 text-white font-semibold py-3 px-4 rounded-xl shadow-legal hover:shadow-legal-lg transition-all duration-300 hover:scale-105 font-montserrat flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading === 'add-availability' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Plus className="w-5 h-5" />
                    )}
                    <span>Add Availability</span>
                  </button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => handleQuickAction('messages')}
                      disabled={actionLoading === 'messages'}
                      className="bg-legal-bg-secondary/30 hover:bg-legal-bg-secondary/50 text-legal-dark-text font-medium py-3 px-3 rounded-lg transition-colors font-montserrat flex flex-col items-center space-y-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed relative"
                    >
                      {actionLoading === 'messages' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <MessageSquare className="w-4 h-4" />
                      )}
                      <span>Messages</span>
                      {quickStats?.unreadMessages && quickStats.unreadMessages > 0 && (
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {quickStats.unreadMessages > 9 ? '9+' : quickStats.unreadMessages}
                        </div>
                      )}
                    </button>
                    <button 
                      onClick={() => handleQuickAction('students')}
                      disabled={actionLoading === 'students'}
                      className="bg-legal-bg-secondary/30 hover:bg-legal-bg-secondary/50 text-legal-dark-text font-medium py-3 px-3 rounded-lg transition-colors font-montserrat flex flex-col items-center space-y-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading === 'students' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Users className="w-4 h-4" />
                      )}
                      <span>Students</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => handleQuickAction('book-session')}
                    disabled={actionLoading === 'book-session'}
                    className="w-full bg-gradient-to-r from-accent-700 to-accent-600 text-white font-semibold py-3 px-4 rounded-xl shadow-legal hover:shadow-legal-lg transition-all duration-300 hover:scale-105 font-montserrat flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading === 'book-session' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Plus className="w-5 h-5" />
                    )}
                    <span>Book Session</span>
                  </button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => handleQuickAction('find-mentors')}
                      disabled={actionLoading === 'find-mentors'}
                      className="bg-legal-bg-secondary/30 hover:bg-legal-bg-secondary/50 text-legal-dark-text font-medium py-3 px-3 rounded-lg transition-colors font-montserrat flex flex-col items-center space-y-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading === 'find-mentors' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                      <span>Find Mentors</span>
                    </button>
                    <button 
                      onClick={() => handleQuickAction('reviews')}
                      disabled={actionLoading === 'reviews'}
                      className="bg-legal-bg-secondary/30 hover:bg-legal-bg-secondary/50 text-legal-dark-text font-medium py-3 px-3 rounded-lg transition-colors font-montserrat flex flex-col items-center space-y-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed relative"
                    >
                      {actionLoading === 'reviews' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Star className="w-4 h-4" />
                      )}
                      <span>Reviews</span>
                      {quickStats?.pendingReviews && quickStats.pendingReviews > 0 && (
                        <div className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {quickStats.pendingReviews > 9 ? '9+' : quickStats.pendingReviews}
                        </div>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>

          {isMentor && dashboardData.topStudents && (
            /* Top Students - Only for mentors */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-legal-lg border border-warm-200/50 p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-baskervville font-bold text-legal-dark-text">
                  Top Students
                </h3>
                <Users className="w-5 h-5 text-accent-600" />
              </div>
              
              <div className="space-y-4">
                {dashboardData.topStudents.slice(0, 5).map((student, index) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center space-x-3 p-3 rounded-lg hover:bg-legal-bg-secondary/20 transition-colors cursor-pointer"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${getAvatarColor(index)}`}>
                      {student.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-legal-dark-text font-montserrat truncate">
                        {student.name}
                      </p>
                      <p className="text-xs text-legal-warm-text font-montserrat">
                        {student.totalSessions} sessions • {student.lastSession ? formatTime(student.lastSession) : 'No recent sessions'}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-legal-warm-text flex-shrink-0" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Performance Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-legal-lg border border-warm-200/50 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-baskervville font-bold text-legal-dark-text">
                This Month
              </h3>
              <Activity className="w-5 h-5 text-success-600" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-legal-warm-text font-montserrat">Sessions Completed</span>
                <span className="text-lg font-bold text-legal-dark-text font-baskervville">
                  {dashboardData.stats.completedSessions}
                </span>
              </div>
              
              {isMentor ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-legal-warm-text font-montserrat">Average Rating</span>
                    <span className="text-lg font-bold text-legal-dark-text font-baskervville">
                      {dashboardData.stats.averageRating?.toFixed(1) || '0.0'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-legal-warm-text font-montserrat">Total Students</span>
                    <span className="text-lg font-bold text-legal-dark-text font-baskervville">
                      {dashboardData.stats.totalStudents}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-legal-warm-text font-montserrat">Monthly Earnings</span>
                    <span className="text-lg font-bold text-success-600 font-baskervville">
                      {formatCurrency(dashboardData.stats.monthlyEarnings || 0)}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-legal-warm-text font-montserrat">Completion Rate</span>
                    <span className="text-lg font-bold text-legal-dark-text font-baskervville">
                      {dashboardData.stats.completionRate}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-legal-warm-text font-montserrat">Mentors Connected</span>
                    <span className="text-lg font-bold text-legal-dark-text font-baskervville">
                      {dashboardData.stats.favoriteMentors}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-legal-warm-text font-montserrat">Monthly Investment</span>
                    <span className="text-lg font-bold text-success-600 font-baskervville">
                      {formatCurrency(dashboardData.stats.monthlySpent || 0)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Insights Section */}
      {isMentor && dashboardData.insights && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="bg-gradient-to-r from-accent-50 to-warm-50 border border-accent-200 rounded-2xl p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-accent-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-accent-800 font-baskervville mb-2">
                  Weekly Insights
                </h4>
                <div className="space-y-1 text-sm text-accent-700 font-montserrat">
                  <p>• You&apos;ve completed {dashboardData.insights.weeklySessionsCompleted} sessions this week</p>
                  <p>• Your earnings are {dashboardData.insights.earningsGrowth >= 0 ? 'up' : 'down'} {Math.abs(dashboardData.insights.earningsGrowth)}% from last week</p>
                  <p>• Peak hours: {dashboardData.insights.peakHours} with highest booking rates</p>
                  {dashboardData.insights.pendingReplies > 0 && (
                    <p>• You have {dashboardData.insights.pendingReplies} pending review replies</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button 
                onClick={() => window.location.href = '/dashboard/analytics'}
                className="bg-white text-accent-700 font-semibold py-2 px-4 rounded-lg border border-accent-200 hover:bg-accent-50 transition-colors font-montserrat text-sm"
              >
                View Analytics
              </button>
              <button 
                onClick={() => window.location.href = '/dashboard/earnings'}
                className="bg-accent-600 text-white font-semibold py-2 px-4 rounded-lg shadow-legal hover:shadow-legal-lg transition-all duration-300 font-montserrat text-sm"
              >
                View Earnings
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}