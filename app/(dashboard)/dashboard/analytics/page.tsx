'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Star,
  BookOpen,
  Target,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  PieChart,
  Loader2,
} from 'lucide-react'

interface AnalyticsData {
  overviewStats: {
    sessions: { value: number; change: number; trend: string };
    students: { value: number; change: number; trend: string };
    avgRating: { value: number; change: number; trend: string };
    earnings: { value: number; change: number; trend: string };
    completionRate: { value: number; change: number; trend: string };
    responseTime: { value: number; change: number; trend: string };
  };
  monthlyData: Array<{
    period: string;
    sessions: number;
    students: number;
    earnings: number;
    avgRating: number;
  }>;
  subjectBreakdown: Array<{
    subject: string;
    sessions: number;
    percentage: number;
    earnings: number;
  }>;
  studentPerformance: Array<{
    name: string;
    sessions: number;
    avgRating: number;
    completion: number;
    growth: number;
  }>;
  timeSlotAnalysis: Array<{
    time: string;
    sessions: number;
    bookingRate: number;
  }>;
}

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedMetric, setSelectedMetric] = useState('sessions')
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

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

  useEffect(() => {
    fetchAnalyticsData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod])

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/analytics?period=${selectedPeriod}`)
      const result = await response.json()
      
      if (result.success) {
        setAnalyticsData(result.data)
      } else {
        console.error('Failed to fetch analytics data:', result.message)
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      setExporting(true)
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period: selectedPeriod, format })
      })

      if (format === 'csv') {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `analytics-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const result = await response.json()
        if (result.success) {
          const dataStr = JSON.stringify(result.data, null, 2)
          const dataBlob = new Blob([dataStr], { type: 'application/json' })
          const url = window.URL.createObjectURL(dataBlob)
          const a = document.createElement('a')
          a.href = url
          a.download = result.filename
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        }
      }
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setExporting(false)
    }
  }

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

  const getSubjectColor = (index: number) => {
    const colors = [
      'bg-accent-500',
      'bg-warm-500', 
      'bg-success-500',
      'bg-blue-500',
      'bg-purple-500'
    ]
    return colors[index % colors.length]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="w-8 h-8 animate-spin text-accent-600" />
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <p className="text-legal-warm-text">Failed to load analytics data</p>
      </div>
    )
  }

  const maxValue = Math.max(...analyticsData.monthlyData.map(d => {
    switch (selectedMetric) {
      case 'sessions': return d.sessions
      case 'students': return d.students
      case 'earnings': return d.earnings / 100
      case 'ratings': return d.avgRating * 5
      default: return d.sessions
    }
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-legal-lg border border-warm-200/50 p-6 lg:p-8"
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
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-1 bg-legal-bg-secondary/30 rounded-lg p-1">
              {periods.map((period) => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors font-montserrat ${
                    selectedPeriod === period.value
                      ? 'bg-white text-accent-600 shadow-sm'
                      : 'text-legal-warm-text hover:text-accent-600'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => handleExport('csv')}
              disabled={exporting}
              className="bg-white text-accent-600 font-semibold py-3 px-6 rounded-xl border border-accent-200 hover:bg-accent-50 transition-colors font-montserrat flex items-center space-x-2 disabled:opacity-50"
            >
              {exporting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              <span>Export</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
        {[
          {
            title: 'Total Sessions',
            value: analyticsData.overviewStats.sessions.value,
            change: analyticsData.overviewStats.sessions.change,
            trend: analyticsData.overviewStats.sessions.trend,
            icon: BookOpen,
            color: 'accent'
          },
          {
            title: 'Active Students',
            value: analyticsData.overviewStats.students.value,
            change: analyticsData.overviewStats.students.change,
            trend: analyticsData.overviewStats.students.trend,
            icon: Users,
            color: 'warm'
          },
          {
            title: 'Avg Rating',
            value: analyticsData.overviewStats.avgRating.value,
            change: analyticsData.overviewStats.avgRating.change,
            trend: analyticsData.overviewStats.avgRating.trend,
            icon: Star,
            color: 'amber',
            suffix: '/5'
          },
          {
            title: 'Earnings',
            value: analyticsData.overviewStats.earnings.value,
            change: analyticsData.overviewStats.earnings.change,
            trend: analyticsData.overviewStats.earnings.trend,
            icon: TrendingUp,
            color: 'success',
            prefix: '$'
          },
          {
            title: 'Completion Rate',
            value: analyticsData.overviewStats.completionRate.value,
            change: analyticsData.overviewStats.completionRate.change,
            trend: analyticsData.overviewStats.completionRate.trend,
            icon: Target,
            color: 'blue',
            suffix: '%'
          },
          {
            title: 'Response Time',
            value: analyticsData.overviewStats.responseTime.value,
            change: analyticsData.overviewStats.responseTime.change,
            trend: analyticsData.overviewStats.responseTime.trend,
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
            className="bg-white/95 backdrop-blur-sm rounded-xl shadow-legal border border-warm-200/50 p-4 lg:p-6"
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
                  {Math.abs(metric.change).toFixed(1)}%
                </span>
              </div>
            </div>
            <div>
              <p className="text-xl lg:text-2xl font-bold text-legal-dark-text font-baskervville mb-1">
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
        {/* Performance Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/95 backdrop-blur-sm rounded-xl shadow-legal border border-warm-200/50 p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
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
                  <span className="hidden sm:inline">{metric.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative h-64">
            <div className="absolute inset-0 flex items-end justify-between px-2">
              {analyticsData.monthlyData.map((data, index) => {
                let value: number;
                switch (selectedMetric) {
                  case 'sessions':
                    value = data.sessions;
                    break;
                  case 'students':
                    value = data.students;
                    break;
                  case 'earnings':
                    value = data.earnings / 100;
                    break;
                  case 'ratings':
                    value = data.avgRating * 5;
                    break;
                  default:
                    value = data.sessions;
                }
                
                return (
                  <motion.div
                    key={data.period}
                    initial={{ height: 0 }}
                    animate={{ height: maxValue > 0 ? `${(value / maxValue) * 100}%` : '0%' }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="flex flex-col items-center space-y-2 flex-1 max-w-16"
                  >
                    <div 
                      className="w-6 sm:w-8 bg-gradient-to-t from-accent-600 to-accent-400 rounded-t-md relative group cursor-pointer"
                      title={`${data.period}: ${
                        selectedMetric === 'earnings' ? formatCurrency(data.earnings) : 
                        selectedMetric === 'ratings' ? data.avgRating.toFixed(1) : value
                      }`}
                    >
                      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-legal-dark-text text-white text-xs rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {selectedMetric === 'earnings' ? formatCurrency(data.earnings) : 
                         selectedMetric === 'ratings' ? `${data.avgRating.toFixed(1)}/5` : value}
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

        {/* Subject Distribution */}
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
            {analyticsData.subjectBreakdown.map((subject, index) => (
              <motion.div
                key={subject.subject}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className={`w-4 h-4 rounded-full ${getSubjectColor(index)}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-legal-dark-text font-montserrat truncate">
                      {subject.subject}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="w-full bg-legal-border/30 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${subject.percentage}%` }}
                          transition={{ duration: 0.8, delay: index * 0.1 }}
                          className={`h-2 rounded-full ${getSubjectColor(index)}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right ml-4 flex-shrink-0">
                  <p className="text-sm font-semibold text-legal-dark-text font-montserrat">
                    {subject.sessions}
                  </p>
                  <p className="text-xs text-legal-warm-text font-montserrat">
                    {subject.percentage.toFixed(1)}%
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
            {analyticsData.studentPerformance.length > 0 ? analyticsData.studentPerformance.map((student, index) => (
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
                      {student.avgRating.toFixed(1)}
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
            )) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-legal-warm-text mx-auto mb-4" />
                <p className="text-legal-warm-text font-montserrat">No student data available</p>
              </div>
            )}
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
            {analyticsData.timeSlotAnalysis.length > 0 ? analyticsData.timeSlotAnalysis.map((slot, index) => (
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
            )) : (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-legal-warm-text mx-auto mb-4" />
                <p className="text-legal-warm-text font-montserrat">No time slot data available</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Insights & Export */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="bg-gradient-to-r from-accent-50 to-warm-50 border border-accent-200 rounded-xl p-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Target className="w-6 h-6 text-accent-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-accent-800 font-baskervville mb-2">
                Performance Insights
              </h3>
              <div className="space-y-2 text-sm text-accent-700 font-montserrat">
                <p>• Your completion rate is {analyticsData.overviewStats.completionRate.value}% for this period</p>
                <p>• {analyticsData.subjectBreakdown[0]?.subject || 'No subject'} is your most popular subject with {analyticsData.subjectBreakdown[0]?.sessions || 0} sessions</p>
                <p>• Average rating: {analyticsData.overviewStats.avgRating.value}/5 - great work!</p>
                <p>• Total earnings: {formatCurrency(analyticsData.overviewStats.earnings.value)} this period</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              onClick={() => handleExport('csv')}
              disabled={exporting}
              className="bg-white text-accent-700 font-semibold py-2 px-4 rounded-lg border border-accent-200 hover:bg-accent-50 transition-colors font-montserrat text-sm disabled:opacity-50"
            >
              Export CSV
            </button>
            <button
              onClick={() => handleExport('json')}
              disabled={exporting}
              className="bg-accent-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-accent-700 transition-colors font-montserrat text-sm disabled:opacity-50"
            >
              Export JSON
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}