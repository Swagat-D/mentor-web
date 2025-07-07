'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Star,
  BookOpen,
  Target,
  Award,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  PieChart,
} from 'lucide-react'

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedMetric, setSelectedMetric] = useState('sessions')

  const periods = [
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' },
    { value: 'quarter', label: 'Last 3 Months' },
    { value: 'year', label: 'Last 12 Months' }
  ]

  const metrics = [
    { value: 'sessions', label: 'Sessions', icon: BookOpen },
    { value: 'students', label: 'Students', icon: Users },
    { value: 'earnings', label: 'Earnings', icon: TrendingUp },
    { value: 'ratings', label: 'Ratings', icon: Star }
  ]

  // Mock analytics data
  const overviewStats = {
    week: {
      sessions: { value: 12, change: 15.3, trend: 'up' },
      students: { value: 8, change: -5.2, trend: 'down' },
      avgRating: { value: 4.9, change: 2.1, trend: 'up' },
      earnings: { value: 1285, change: 18.7, trend: 'up' },
      completionRate: { value: 96, change: 1.2, trend: 'up' },
      responseTime: { value: 1.2, change: -12.5, trend: 'up' }
    },
    month: {
      sessions: { value: 48, change: 23.1, trend: 'up' },
      students: { value: 24, change: 12.5, trend: 'up' },
      avgRating: { value: 4.8, change: 4.3, trend: 'up' },
      earnings: { value: 4850, change: 28.4, trend: 'up' },
      completionRate: { value: 94, change: -1.8, trend: 'down' },
      responseTime: { value: 1.8, change: -8.2, trend: 'up' }
    }
  }

  const sessionTrends = [
    { period: 'Week 1', sessions: 8, students: 6, earnings: 750, avgRating: 4.7 },
    { period: 'Week 2', sessions: 12, students: 8, earnings: 1050, avgRating: 4.8 },
    { period: 'Week 3', sessions: 15, students: 10, earnings: 1350, avgRating: 4.9 },
    { period: 'Week 4', sessions: 13, students: 9, earnings: 1200, avgRating: 4.8 }
  ]

  const subjectBreakdown = [
    { subject: 'Advanced Calculus', sessions: 18, percentage: 37.5, earnings: 1350, color: 'bg-accent-500' },
    { subject: 'Statistics', sessions: 12, percentage: 25, earnings: 900, color: 'bg-warm-500' },
    { subject: 'Linear Algebra', sessions: 10, percentage: 20.8, earnings: 750, color: 'bg-success-500' },
    { subject: 'Probability Theory', sessions: 5, percentage: 10.4, earnings: 375, color: 'bg-blue-500' },
    { subject: 'Differential Equations', sessions: 3, percentage: 6.3, earnings: 225, color: 'bg-purple-500' }
  ]

  const studentPerformance = [
    { name: 'Sarah Johnson', sessions: 12, avgRating: 5.0, completion: 100, growth: 15 },
    { name: 'Mike Chen', sessions: 8, avgRating: 4.8, completion: 95, growth: 12 },
    { name: 'Emma Davis', sessions: 15, avgRating: 4.9, completion: 98, growth: 18 },
    { name: 'Alex Thompson', sessions: 2, avgRating: 5.0, completion: 100, growth: 25 },
    { name: 'Lisa Park', sessions: 6, avgRating: 4.7, completion: 92, growth: 8 }
  ]

  const timeSlotAnalysis = [
    { time: '9:00 AM', sessions: 3, bookingRate: 60, preferredBy: ['Sarah', 'Alex'] },
    { time: '11:00 AM', sessions: 4, bookingRate: 80, preferredBy: ['Mike', 'Emma'] },
    { time: '2:00 PM', sessions: 8, bookingRate: 95, preferredBy: ['Sarah', 'Mike', 'Emma'] },
    { time: '4:00 PM', sessions: 12, bookingRate: 100, preferredBy: ['Mike', 'Emma', 'Lisa'] },
    { time: '6:00 PM', sessions: 15, bookingRate: 100, preferredBy: ['Emma', 'Lisa', 'Alex'] },
    { time: '8:00 PM', sessions: 6, bookingRate: 75, preferredBy: ['Lisa', 'Alex'] }
  ]

  const currentStats = overviewStats[selectedPeriod as keyof typeof overviewStats] || overviewStats.month

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getChangeIcon = (trend: string) => {
    return trend === 'up' ? (
      <ArrowUpRight className="w-4 h-4 text-success-500" />
    ) : (
      <ArrowDownRight className="w-4 h-4 text-red-500" />
    )
  }

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-success-600' : 'text-red-600'
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
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center space-x-4 mb-6 lg:mb-0">
            <div className="w-12 h-12 bg-gradient-to-br from-accent-100 to-accent-200 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-accent-600" />
            </div>
            <div>
              <h1 className="text-3xl font-baskervville font-bold text-legal-dark-text">
                Analytics
              </h1>
              <p className="text-legal-warm-text font-montserrat">
                Track your performance and insights
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 bg-legal-bg-secondary/30 rounded-lg p-1">
              {periods.map((period) => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors font-montserrat ${
                    selectedPeriod === period.value
                      ? 'bg-white text-accent-600 shadow-sm'
                      : 'text-legal-warm-text hover:text-accent-600'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
            
            <button className="bg-white text-accent-600 font-semibold py-3 px-6 rounded-xl border border-accent-200 hover:bg-accent-50 transition-colors font-montserrat flex items-center space-x-2">
              <Download className="w-5 h-5" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {[
          {
            title: 'Total Sessions',
            value: currentStats.sessions.value,
            change: currentStats.sessions.change,
            trend: currentStats.sessions.trend,
            icon: BookOpen,
            color: 'accent'
          },
          {
            title: 'Active Students',
            value: currentStats.students.value,
            change: currentStats.students.change,
            trend: currentStats.students.trend,
            icon: Users,
            color: 'warm'
          },
          {
            title: 'Avg Rating',
            value: currentStats.avgRating.value,
            change: currentStats.avgRating.change,
            trend: currentStats.avgRating.trend,
            icon: Star,
            color: 'amber',
            suffix: '/5'
          },
          {
            title: 'Earnings',
            value: currentStats.earnings.value,
            change: currentStats.earnings.change,
            trend: currentStats.earnings.trend,
            icon: TrendingUp,
            color: 'success',
            prefix: '₹'
          },
          {
            title: 'Completion Rate',
            value: currentStats.completionRate.value,
            change: currentStats.completionRate.change,
            trend: currentStats.completionRate.trend,
            icon: Target,
            color: 'blue',
            suffix: '%'
          },
          {
            title: 'Response Time',
            value: currentStats.responseTime.value,
            change: currentStats.responseTime.change,
            trend: currentStats.responseTime.trend,
            icon: Clock,
            color: 'purple',
            suffix: 'h'
          }
        ].map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="bg-white/95 backdrop-blur-sm rounded-xl shadow-legal border border-warm-200/50 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                metric.color === 'accent' ? 'bg-accent-100 text-accent-600' :
                metric.color === 'warm' ? 'bg-warm-100 text-warm-600' :
                metric.color === 'amber' ? 'bg-amber-100 text-amber-600' :
                metric.color === 'success' ? 'bg-success-100 text-success-600' :
                metric.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                'bg-purple-100 text-purple-600'
              }`}>
                <metric.icon className="w-5 h-5" />
              </div>
              <div className="flex items-center space-x-1">
                {getChangeIcon(metric.trend)}
                <span className={`text-sm font-medium font-montserrat ${getChangeColor(metric.change)}`}>
                  {Math.abs(metric.change)}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-legal-dark-text font-baskervville mb-1">
                {metric.prefix || ''}{metric.value}{metric.suffix || ''}
              </p>
              <p className="text-sm text-legal-warm-text font-montserrat">
                {metric.title}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Session Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/95 backdrop-blur-sm rounded-xl shadow-legal border border-warm-200/50 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-baskervville font-bold text-legal-dark-text">
              Performance Trends
            </h3>
            <div className="flex items-center space-x-2">
              {metrics.map((metric) => (
                <button
                  key={metric.value}
                  onClick={() => setSelectedMetric(metric.value)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors font-montserrat flex items-center space-x-1 ${
                    selectedMetric === metric.value
                      ? 'bg-accent-100 text-accent-700'
                      : 'text-legal-warm-text hover:text-accent-600'
                  }`}
                >
                  <metric.icon className="w-3 h-3" />
                  <span>{metric.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative h-64">
            <div className="absolute inset-0 flex items-end justify-between px-2">
              {sessionTrends.map((data, index) => {
                const value = selectedMetric === 'sessions' ? data.sessions :
                             selectedMetric === 'students' ? data.students :
                             selectedMetric === 'earnings' ? data.earnings / 100 :
                             data.avgRating * 5
                const maxValue = selectedMetric === 'sessions' ? 15 :
                                selectedMetric === 'students' ? 10 :
                                selectedMetric === 'earnings' ? 13.5 :
                                25
                
                return (
                  <motion.div
                    key={data.period}
                    initial={{ height: 0 }}
                    animate={{ height: `${(value / maxValue) * 100}%` }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="flex flex-col items-center space-y-2 flex-1 max-w-16"
                  >
                    <div 
                      className="w-8 bg-gradient-to-t from-accent-600 to-accent-400 rounded-t-md relative group cursor-pointer"
                      title={`${data.period}: ${
                        selectedMetric === 'earnings' ? formatCurrency(data.earnings) : value
                      }`}
                    >
                      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-legal-dark-text text-white text-xs rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {selectedMetric === 'earnings' ? formatCurrency(data.earnings) : value}
                      </div>
                    </div>
                    <span className="text-xs text-legal-warm-text font-montserrat">
                      {data.period}
                    </span>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* Subject Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white/95 backdrop-blur-sm rounded-xl shadow-legal border border-warm-200/50 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-baskervville font-bold text-legal-dark-text">
              Subject Distribution
            </h3>
            <PieChart className="w-5 h-5 text-accent-600" />
          </div>

          <div className="space-y-4">
            {subjectBreakdown.map((subject, index) => (
              <motion.div
                key={subject.subject}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className={`w-4 h-4 rounded-full ${subject.color}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-legal-dark-text font-montserrat">
                      {subject.subject}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="w-full bg-legal-border/30 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${subject.percentage}%` }}
                          transition={{ duration: 0.8, delay: index * 0.1 }}
                          className={`h-2 rounded-full ${subject.color}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="text-sm font-semibold text-legal-dark-text font-montserrat">
                    {subject.sessions}
                  </p>
                  <p className="text-xs text-legal-warm-text font-montserrat">
                    {subject.percentage}%
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Student Performance & Time Analysis */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Student Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white/95 backdrop-blur-sm rounded-xl shadow-legal border border-warm-200/50 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-baskervville font-bold text-legal-dark-text">
              Student Performance
            </h3>
            <Users className="w-5 h-5 text-accent-600" />
          </div>

          <div className="space-y-4">
            {studentPerformance.map((student, index) => (
              <motion.div
                key={student.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg border border-legal-border/30 hover:bg-legal-bg-secondary/20 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-accent-100 to-accent-200 rounded-full flex items-center justify-center">
                    <span className="text-xs font-semibold text-accent-600">
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-legal-dark-text font-montserrat">
                      {student.name}
                    </p>
                    <p className="text-xs text-legal-warm-text font-montserrat">
                      {student.sessions} sessions • {student.completion}% completion
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 mb-1">
                    <Star className="w-3 h-3 text-amber-400 fill-current" />
                    <span className="text-sm font-medium text-legal-dark-text font-montserrat">
                      {student.avgRating}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-3 h-3 text-success-500" />
                    <span className="text-xs text-success-600 font-montserrat">
                      +{student.growth}%
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Time Slot Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-white/95 backdrop-blur-sm rounded-xl shadow-legal border border-warm-200/50 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-baskervville font-bold text-legal-dark-text">
              Peak Hours Analysis
            </h3>
            <Activity className="w-5 h-5 text-accent-600" />
          </div>

          <div className="space-y-4">
            {timeSlotAnalysis.map((slot, index) => (
              <motion.div
                key={slot.time}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-legal-bg-secondary/30 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-legal-warm-text" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-legal-dark-text font-montserrat">
                      {slot.time}
                    </p>
                    <p className="text-xs text-legal-warm-text font-montserrat">
                      {slot.sessions} sessions • {slot.bookingRate}% booking rate
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-20 bg-legal-border/30 rounded-full h-2 mb-1">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${slot.bookingRate}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      className={`h-2 rounded-full ${
                        slot.bookingRate >= 90 ? 'bg-success-500' :
                        slot.bookingRate >= 70 ? 'bg-amber-500' :
                        'bg-red-500'
                      }`}
                    />
                  </div>
                  <p className="text-xs text-legal-warm-text font-montserrat">
                    {slot.bookingRate}%
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Insights & Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="bg-gradient-to-r from-accent-50 to-warm-50 border border-accent-200 rounded-xl p-6"
      >
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Award className="w-6 h-6 text-accent-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-accent-800 font-baskervville mb-2">
              Performance Insights
            </h3>
            <div className="space-y-2 text-sm text-accent-700 font-montserrat">
              <p>• Your evening sessions (6-8 PM) have the highest booking rate at 100%</p>
              <p>• Advanced Calculus is your most popular subject, accounting for 37.5% of sessions</p>
              <p>• Your average rating improved by 4.3% this month - great work!</p>
              <p>• Consider offering more time slots during peak hours to maximize earnings</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}