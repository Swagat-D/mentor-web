'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { 
  TrendingUp,
  DollarSign,
  Calendar,
  Download
} from 'lucide-react'

export default function EarningsChart() {
  const [timeRange, setTimeRange] = useState('7d')
  
  const timeRanges = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '3 Months' },
    { value: '1y', label: '1 Year' }
  ]

  // Mock data for different time ranges
  const getData = (range: string) => {
    const data = {
      '7d': {
        total: '$1,285',
        change: '+15.3%',
        sessions: 12,
        avgPerSession: '$107',
        chartData: [
          { day: 'Mon', amount: 150, sessions: 2 },
          { day: 'Tue', amount: 225, sessions: 3 },
          { day: 'Wed', amount: 180, sessions: 2 },
          { day: 'Thu', amount: 300, sessions: 4 },
          { day: 'Fri', amount: 210, sessions: 3 },
          { day: 'Sat', amount: 120, sessions: 1 },
          { day: 'Sun', amount: 100, sessions: 1 }
        ]
      },
      '30d': {
        total: '$4,850',
        change: '+23.1%',
        sessions: 48,
        avgPerSession: '$101',
        chartData: []
      },
      '90d': {
        total: '$14,250',
        change: '+18.7%',
        sessions: 142,
        avgPerSession: '$100',
        chartData: []
      },
      '1y': {
        total: '$58,400',
        change: '+28.4%',
        sessions: 584,
        avgPerSession: '$100',
        chartData: []
      }
    }
    return data[range as keyof typeof data]
  }

  const currentData = getData(timeRange)
  const maxAmount = Math.max(...(currentData.chartData.map(d => d.amount) || [300]))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-legal-lg border border-warm-200/50 p-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-success-100 to-success-200 rounded-xl flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-success-600" />
            </div>
            <h3 className="text-xl font-baskervville font-bold text-legal-dark-text">
              Earnings Overview
            </h3>
          </div>
          <p className="text-sm text-legal-warm-text font-montserrat">
            Track your mentoring income and session performance
          </p>
        </div>

        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          {/* Time Range Selector */}
          <div className="flex items-center space-x-1 bg-legal-bg-secondary/30 rounded-lg p-1">
            {timeRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range.value)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors font-montserrat ${
                  timeRange === range.value
                    ? 'bg-white text-accent-600 shadow-sm'
                    : 'text-legal-warm-text hover:text-accent-600'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          <button className="p-2 text-legal-warm-text hover:text-accent-600 transition-colors">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-success-50 border border-success-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-1">
            <DollarSign className="w-4 h-4 text-success-600" />
            <span className="text-xs font-medium text-success-700 font-montserrat">Total Earnings</span>
          </div>
          <p className="text-xl font-bold text-success-800 font-baskervville">{currentData.total}</p>
          <div className="flex items-center space-x-1 mt-1">
            <TrendingUp className="w-3 h-3 text-success-600" />
            <span className="text-xs text-success-600 font-montserrat">{currentData.change}</span>
          </div>
        </div>

        <div className="bg-accent-50 border border-accent-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-1">
            <Calendar className="w-4 h-4 text-accent-600" />
            <span className="text-xs font-medium text-accent-700 font-montserrat">Sessions</span>
          </div>
          <p className="text-xl font-bold text-accent-800 font-baskervville">{currentData.sessions}</p>
          <span className="text-xs text-accent-600 font-montserrat">Completed sessions</span>
        </div>

        <div className="bg-warm-50 border border-warm-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-1">
            <TrendingUp className="w-4 h-4 text-warm-600" />
            <span className="text-xs font-medium text-warm-700 font-montserrat">Avg/Session</span>
          </div>
          <p className="text-xl font-bold text-warm-800 font-baskervville">{currentData.avgPerSession}</p>
          <span className="text-xs text-warm-600 font-montserrat">Per session rate</span>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-1">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-700 font-montserrat">This Week</span>
          </div>
          <p className="text-xl font-bold text-blue-800 font-baskervville">
            {timeRange === '7d' ? currentData.total : '$285'}
          </p>
          <span className="text-xs text-blue-600 font-montserrat">Weekly earnings</span>
        </div>
      </div>

      {/* Chart */}
      {timeRange === '7d' && currentData.chartData.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-legal-dark-text font-montserrat">
              Daily Earnings Breakdown
            </h4>
            <div className="flex items-center space-x-4 text-xs text-legal-warm-text font-montserrat">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-accent-500 rounded-full"></div>
                <span>Earnings</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-success-300 rounded-full"></div>
                <span>Sessions</span>
              </div>
            </div>
          </div>

          <div className="relative h-64">
            {/* Chart Grid */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {[0, 1, 2, 3, 4].map((line) => (
                <div key={line} className="w-full h-px bg-legal-border/20"></div>
              ))}
            </div>

            {/* Chart Bars */}
            <div className="absolute inset-0 flex items-end justify-between px-2">
              {currentData.chartData.map((data, index) => (
                <motion.div
                  key={data.day}
                  initial={{ height: 0 }}
                  animate={{ height: `${(data.amount / maxAmount) * 100}%` }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex flex-col items-center space-y-2 flex-1 max-w-16"
                >
                  {/* Earnings Bar */}
                  <div className="w-full flex flex-col items-center">
                    <div 
                      className="w-8 bg-gradient-to-t from-accent-600 to-accent-400 rounded-t-md relative group cursor-pointer"
                      style={{ height: `${(data.amount / maxAmount) * 200}px` }}
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-legal-dark-text text-white text-xs rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        ${data.amount} • {data.sessions} sessions
                      </div>
                    </div>
                    
                    {/* Sessions Indicator */}
                    <div className="w-6 h-1 bg-success-300 rounded-full mt-1"></div>
                  </div>
                  
                  {/* Day Label */}
                  <span className="text-xs text-legal-warm-text font-montserrat">
                    {data.day}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Y-axis Labels */}
            <div className="absolute left-0 inset-y-0 flex flex-col justify-between text-xs text-legal-warm-text font-montserrat -ml-12">
              {[maxAmount, maxAmount * 0.75, maxAmount * 0.5, maxAmount * 0.25, 0].map((value) => (
                <span key={value}>${Math.round(value)}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Alternative view for other time ranges */}
      {timeRange !== '7d' && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-legal-bg-secondary/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-legal-warm-text" />
          </div>
          <h4 className="text-lg font-semibold text-legal-dark-text font-baskervville mb-2">
            Extended Analytics
          </h4>
          <p className="text-sm text-legal-warm-text font-montserrat mb-4">
            Detailed charts for {timeRanges.find(r => r.value === timeRange)?.label.toLowerCase()} coming soon
          </p>
          <div className="flex justify-center space-x-4 text-sm font-montserrat">
            <div className="text-center">
              <p className="font-semibold text-legal-dark-text">{currentData.total}</p>
              <p className="text-legal-warm-text">Total Earned</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-legal-dark-text">{currentData.sessions}</p>
              <p className="text-legal-warm-text">Sessions</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-success-600">{currentData.change}</p>
              <p className="text-legal-warm-text">Growth</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-legal-border/30">
        <button className="flex-1 bg-gradient-to-r from-accent-700 to-accent-600 text-white font-semibold py-2 px-4 rounded-lg shadow-legal hover:shadow-legal-lg transition-all duration-300 font-montserrat text-sm">
          View Detailed Report
        </button>
        <button className="flex-1 bg-white text-accent-600 font-semibold py-2 px-4 rounded-lg border border-accent-200 hover:bg-accent-50 transition-colors font-montserrat text-sm">
          Export Data
        </button>
      </div>
    </motion.div>
  )
}