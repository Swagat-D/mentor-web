'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
} from 'lucide-react'

export default function EarningsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedYear, setSelectedYear] = useState('2024')

  const periods = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ]

  const years = ['2024', '2023', '2022']

  // Mock earnings data
  const earningsOverview = {
    week: {
      total: 1285,
      change: 15.3,
      sessions: 12,
      avgPerSession: 107,
      pending: 225,
      paid: 1060
    },
    month: {
      total: 4850,
      change: 23.1,
      sessions: 48,
      avgPerSession: 101,
      pending: 450,
      paid: 4400
    },
    quarter: {
      total: 14250,
      change: 18.7,
      sessions: 142,
      avgPerSession: 100,
      pending: 675,
      paid: 13575
    },
    year: {
      total: 58400,
      change: 28.4,
      sessions: 584,
      avgPerSession: 100,
      pending: 900,
      paid: 57500
    }
  }

  const monthlyData = [
    { month: 'Jan', earnings: 3200, sessions: 32, growth: 12 },
    { month: 'Feb', earnings: 3800, sessions: 38, growth: 18.8 },
    { month: 'Mar', earnings: 4200, sessions: 42, growth: 10.5 },
    { month: 'Apr', earnings: 4600, sessions: 46, growth: 9.5 },
    { month: 'May', earnings: 4100, sessions: 41, growth: -10.9 },
    { month: 'Jun', earnings: 4900, sessions: 49, growth: 19.5 },
    { month: 'Jul', earnings: 5200, sessions: 52, growth: 6.1 },
    { month: 'Aug', earnings: 4800, sessions: 48, growth: -7.7 },
    { month: 'Sep', earnings: 5100, sessions: 51, growth: 6.3 },
    { month: 'Oct', earnings: 5400, sessions: 54, growth: 5.9 },
    { month: 'Nov', earnings: 4850, sessions: 48, growth: -10.2 },
    { month: 'Dec', earnings: 5300, sessions: 53, growth: 9.3 }
  ]

  const recentTransactions = [
    {
      id: 1,
      type: 'earning',
      description: 'Session with Sarah Johnson - Advanced Calculus',
      amount: 75,
      date: new Date(2024, 11, 12, 14, 30),
      status: 'completed',
      student: 'Sarah Johnson',
      sessionId: 'S001'
    },
    {
      id: 2,
      type: 'payout',
      description: 'Weekly payout to bank account',
      amount: -1285,
      date: new Date(2024, 11, 11, 9, 0),
      status: 'completed',
      payoutId: 'P001'
    },
    {
      id: 3,
      type: 'earning',
      description: 'Session with Mike Chen - Statistics',
      amount: 75,
      date: new Date(2024, 11, 11, 16, 0),
      status: 'completed',
      student: 'Mike Chen',
      sessionId: 'S002'
    },
    {
      id: 4,
      type: 'earning',
      description: 'Session with Emma Davis - Linear Algebra',
      amount: 75,
      date: new Date(2024, 11, 10, 18, 30),
      status: 'pending',
      student: 'Emma Davis',
      sessionId: 'S003'
    },
    {
      id: 5,
      type: 'bonus',
      description: 'Monthly performance bonus',
      amount: 200,
      date: new Date(2024, 11, 1, 0, 0),
      status: 'completed'
    }
  ]

  const payoutHistory = [
    {
      id: 1,
      amount: 1285,
      date: new Date(2024, 11, 11),
      status: 'completed',
      method: 'Bank Transfer',
      account: '****1234',
      sessionCount: 12
    },
    {
      id: 2,
      amount: 1450,
      date: new Date(2024, 11, 4),
      status: 'completed',
      method: 'Bank Transfer',
      account: '****1234',
      sessionCount: 14
    },
    {
      id: 3,
      amount: 1120,
      date: new Date(2024, 10, 27),
      status: 'completed',
      method: 'Bank Transfer',
      account: '****1234',
      sessionCount: 11
    },
    {
      id: 4,
      amount: 950,
      date: new Date(2024, 10, 20),
      status: 'processing',
      method: 'Bank Transfer',
      account: '****1234',
      sessionCount: 9
    }
  ]

  const currentData = earningsOverview[selectedPeriod as keyof typeof earningsOverview]
  const maxEarnings = Math.max(...monthlyData.map(d => d.earnings))

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earning':
        return <ArrowUpRight className="w-4 h-4 text-success-500" />
      case 'payout':
        return <ArrowDownRight className="w-4 h-4 text-blue-500" />
      case 'bonus':
        return <TrendingUp className="w-4 h-4 text-purple-500" />
      default:
        return <DollarSign className="w-4 h-4 text-legal-warm-text" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-success-600'
      case 'pending':
        return 'text-amber-600'
      case 'processing':
        return 'text-blue-600'
      case 'failed':
        return 'text-red-600'
      default:
        return 'text-legal-warm-text'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount))
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
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
            <div className="w-12 h-12 bg-gradient-to-br from-success-100 to-success-200 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-success-600" />
            </div>
            <div>
              <h1 className="text-3xl font-baskervville font-bold text-legal-dark-text">
                Earnings
              </h1>
              <p className="text-legal-warm-text font-montserrat">
                Track your income and manage payouts
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

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Earnings',
            value: formatCurrency(currentData.total),
            change: currentData.change,
            icon: DollarSign,
            color: 'success',
            description: `From ${currentData.sessions} sessions`
          },
          {
            title: 'Pending',
            value: formatCurrency(currentData.pending),
            change: null,
            icon: Clock,
            color: 'amber',
            description: 'Awaiting payout'
          },
          {
            title: 'Paid Out',
            value: formatCurrency(currentData.paid),
            change: null,
            icon: CheckCircle,
            color: 'blue',
            description: 'Successfully transferred'
          },
          {
            title: 'Avg/Session',
            value: formatCurrency(currentData.avgPerSession),
            change: null,
            icon: TrendingUp,
            color: 'purple',
            description: 'Average per session'
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="bg-white/95 backdrop-blur-sm rounded-xl shadow-legal border border-warm-200/50 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                stat.color === 'success' ? 'bg-success-100 text-success-600' :
                stat.color === 'amber' ? 'bg-amber-100 text-amber-600' :
                stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                'bg-purple-100 text-purple-600'
              }`}>
                <stat.icon className="w-5 h-5" />
              </div>
              {stat.change !== null && (
                <div className={`flex items-center space-x-1 ${
                  stat.change >= 0 ? 'text-success-600' : 'text-red-600'
                }`}>
                  {stat.change >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium font-montserrat">
                    {Math.abs(stat.change)}%
                  </span>
                </div>
              )}
            </div>
            <div>
              <p className="text-2xl font-bold text-legal-dark-text font-baskervville mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-legal-warm-text font-montserrat">
                {stat.title}
              </p>
              <p className="text-xs text-legal-warm-text/70 font-montserrat mt-1">
                {stat.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Earnings Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white/95 backdrop-blur-sm rounded-xl shadow-legal border border-warm-200/50 p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-baskervville font-bold text-legal-dark-text">
            Monthly Earnings Trend
          </h3>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2 border border-legal-border rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
          >
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {/* Chart */}
        <div className="relative h-64 mb-6">
          <div className="absolute inset-0 flex items-end justify-between px-2">
            {monthlyData.map((data, index) => (
              <motion.div
                key={data.month}
                initial={{ height: 0 }}
                animate={{ height: `${(data.earnings / maxEarnings) * 100}%` }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="flex flex-col items-center space-y-2 flex-1 max-w-16"
              >
                <div 
                  className="w-8 bg-gradient-to-t from-success-600 to-success-400 rounded-t-md relative group cursor-pointer"
                  title={`${data.month}: ${formatCurrency(data.earnings)}`}
                >
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-legal-dark-text text-white text-xs rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {formatCurrency(data.earnings)} • {data.sessions} sessions
                  </div>
                </div>
                <span className="text-xs text-legal-warm-text font-montserrat">
                  {data.month}
                </span>
                <div className={`text-xs font-medium ${
                  data.growth >= 0 ? 'text-success-600' : 'text-red-600'
                }`}>
                  {data.growth >= 0 ? '+' : ''}{data.growth}%
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white/95 backdrop-blur-sm rounded-xl shadow-legal border border-warm-200/50 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-baskervville font-bold text-legal-dark-text">
              Recent Transactions
            </h3>
            <button className="text-sm text-accent-600 hover:text-accent-700 font-medium font-montserrat">
              View All
            </button>
          </div>

          <div className="space-y-4">
            {recentTransactions.slice(0, 6).map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg border border-legal-border/30 hover:bg-legal-bg-secondary/20 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-legal-bg-secondary/30 rounded-lg flex items-center justify-center">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-legal-dark-text font-montserrat">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-legal-warm-text font-montserrat">
                      {formatDate(transaction.date)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold font-montserrat ${
                    transaction.amount >= 0 ? 'text-success-600' : 'text-blue-600'
                  }`}>
                    {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                  </p>
                  <p className={`text-xs font-montserrat ${getStatusColor(transaction.status)}`}>
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Payout History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white/95 backdrop-blur-sm rounded-xl shadow-legal border border-warm-200/50 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-baskervville font-bold text-legal-dark-text">
              Payout History
            </h3>
            <button className="bg-gradient-to-r from-accent-700 to-accent-600 text-white font-semibold py-2 px-4 rounded-lg shadow-legal hover:shadow-legal-lg transition-all duration-300 font-montserrat text-sm">
              Request Payout
            </button>
          </div>

          <div className="space-y-4">
            {payoutHistory.map((payout, index) => (
              <motion.div
                key={payout.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center justify-between p-4 rounded-lg border border-legal-border/30 hover:bg-legal-bg-secondary/20 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-legal-dark-text font-montserrat">
                      {formatCurrency(payout.amount)}
                    </p>
                    <p className="text-xs text-legal-warm-text font-montserrat">
                      {payout.method} {payout.account} • {payout.sessionCount} sessions
                    </p>
                    <p className="text-xs text-legal-warm-text font-montserrat">
                      {payout.date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    payout.status === 'completed' 
                      ? 'bg-success-100 text-success-700 border border-success-200'
                      : payout.status === 'processing'
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-amber-100 text-amber-700 border border-amber-200'
                  }`}>
                    {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}