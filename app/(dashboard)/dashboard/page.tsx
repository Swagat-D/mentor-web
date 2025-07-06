'use client'

import { motion } from 'framer-motion'
import OverviewCards from '@/components/dashboard/overview-cards'
import RecentSessions from '@/components/dashboard/recent-sessions'
import EarningsChart from '@/components/dashboard/earning-chart'
import QuickActions from '@/components/dashboard/quick-actions'
import { 
  Calendar,
  Users,
  TrendingUp,
  Clock
} from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-legal-lg border border-warm-200/50 p-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-baskervville font-bold text-legal-dark-text mb-2">
              Welcome back, John! 👋
            </h1>
            <p className="text-legal-warm-text font-montserrat">
              Here&apos;s what&apos;s happening with your mentoring sessions today.
            </p>
          </div>
          
          <div className="mt-6 lg:mt-0 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="bg-accent-50 border border-accent-200 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Calendar className="w-4 h-4 text-accent-600" />
                <span className="text-sm font-medium text-accent-700 font-montserrat">Today</span>
              </div>
              <p className="text-2xl font-bold text-accent-800 font-baskervville">3</p>
              <p className="text-xs text-accent-600 font-montserrat">Sessions</p>
            </div>
            
            <div className="bg-success-50 border border-success-200 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Clock className="w-4 h-4 text-success-600" />
                <span className="text-sm font-medium text-success-700 font-montserrat">Next Session</span>
              </div>
              <p className="text-lg font-bold text-success-800 font-baskervville">2:30 PM</p>
              <p className="text-xs text-success-600 font-montserrat">with Sarah</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Overview Cards */}
      <OverviewCards />

      {/* Main Dashboard Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Earnings Chart */}
          <EarningsChart />
          
          {/* Recent Sessions */}
          <RecentSessions />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <QuickActions />
          
          {/* Upcoming Sessions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-legal-lg border border-warm-200/50 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-baskervville font-bold text-legal-dark-text">
                Upcoming Sessions
              </h3>
              <Calendar className="w-5 h-5 text-accent-600" />
            </div>
            
            <div className="space-y-4">
              {[
                {
                  time: '2:30 PM',
                  student: 'Sarah Johnson',
                  subject: 'Calculus',
                  avatar: 'SJ',
                  color: 'bg-accent-100 text-accent-700'
                },
                {
                  time: '4:00 PM',
                  student: 'Mike Chen',
                  subject: 'Statistics',
                  avatar: 'MC',
                  color: 'bg-warm-100 text-warm-700'
                },
                {
                  time: '6:30 PM',
                  student: 'Emma Davis',
                  subject: 'Algebra',
                  avatar: 'ED',
                  color: 'bg-success-100 text-success-700'
                }
              ].map((session, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  className="flex items-center space-x-4 p-3 rounded-xl border border-legal-border/30 hover:bg-legal-bg-secondary/20 transition-colors cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${session.color} font-semibold text-sm`}>
                    {session.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-legal-dark-text font-montserrat">
                      {session.student}
                    </p>
                    <p className="text-xs text-legal-warm-text font-montserrat">
                      {session.subject}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-legal-dark-text font-montserrat">
                      {session.time}
                    </p>
                    <p className="text-xs text-accent-600 font-montserrat">
                      Today
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <button className="w-full mt-4 text-center text-sm text-accent-600 hover:text-accent-700 font-medium font-montserrat border border-accent-200 rounded-lg py-2 hover:bg-accent-50 transition-colors">
              View All Sessions
            </button>
          </motion.div>

          {/* Student Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-legal-lg border border-warm-200/50 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-baskervville font-bold text-legal-dark-text">
                Recent Activity
              </h3>
              <Users className="w-5 h-5 text-accent-600" />
            </div>
            
            <div className="space-y-4">
              {[
                {
                  action: 'New session booked',
                  student: 'Alex Thompson',
                  time: '2 hours ago',
                  type: 'booking'
                },
                {
                  action: 'Session completed',
                  student: 'Lisa Park',
                  time: '5 hours ago',
                  type: 'completed'
                },
                {
                  action: 'Review received',
                  student: 'David Wilson',
                  time: '1 day ago',
                  type: 'review'
                }
              ].map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  className="flex items-start space-x-3"
                >
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'booking' ? 'bg-accent-500' :
                    activity.type === 'completed' ? 'bg-success-500' :
                    'bg-warm-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-legal-dark-text font-montserrat">
                      <span className="font-medium">{activity.action}</span> by {activity.student}
                    </p>
                    <p className="text-xs text-legal-warm-text font-montserrat">
                      {activity.time}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Performance Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-legal-lg border border-warm-200/50 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-baskervville font-bold text-legal-dark-text">
                This Month
              </h3>
              <TrendingUp className="w-5 h-5 text-success-600" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-legal-warm-text font-montserrat">Sessions Completed</span>
                <span className="text-lg font-bold text-legal-dark-text font-baskervville">24</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-legal-warm-text font-montserrat">Average Rating</span>
                <span className="text-lg font-bold text-legal-dark-text font-baskervville">4.9</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-legal-warm-text font-montserrat">Response Rate</span>
                <span className="text-lg font-bold text-legal-dark-text font-baskervville">98%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-legal-warm-text font-montserrat">Total Earnings</span>
                <span className="text-lg font-bold text-success-600 font-baskervville">$1,850</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}