'use client'

import { useState, useEffect } from 'react'
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
  Loader2,
} from 'lucide-react'

interface EarningsData {
  overview: {
    total: number;
    change: number;
    sessions: number;
    avgPerSession: number;
    pending: number;
    paid: number;
  };
  monthlyData: Array<{
    month: string;
    earnings: number;
    sessions: number;
    growth: number;
  }>;
  transactions: Array<{
    id: string;
    type: string;
    description: string;
    amount: number;
    date: string;
    status: string;
    student?: string;
    sessionId?: string;
  }>;
  payoutHistory: Array<{
    id: string;
    amount: number;
    date: string;
    status: string;
    method: string;
    account: string;
    sessionCount: number;
  }>;
}

export default function EarningsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedYear, setSelectedYear] = useState('2024')
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  const periods = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ]

  const years = ['2024', '2023', '2022']

  useEffect(() => {
    fetchEarningsData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod, selectedYear])

  const fetchEarningsData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/earnings?period=${selectedPeriod}&year=${selectedYear}`)
      const result = await response.json()
      
      if (result.success) {
        setEarningsData(result.data)
      } else {
        console.error('Failed to fetch earnings data:', result.message)
      }
    } catch (error) {
      console.error('Error fetching earnings data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      setExporting(true)
      const response = await fetch('/api/earnings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period: selectedPeriod, format })
      })

      if (format === 'csv') {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `earnings-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.csv`
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="w-8 h-8 animate-spin text-accent-600" />
      </div>
    )
  }

  if (!earningsData) {
    return (
      <div className="text-center py-12">
        <p className="text-legal-warm-text">Failed to load earnings data</p>
      </div>
    )
  }

  const maxEarnings = Math.max(...earningsData.monthlyData.map(d => d.earnings))

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
            
            <div className="relative">
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
                <span>Export CSV</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Earnings',
            value: formatCurrency(earningsData.overview.total),
            change: earningsData.overview.change,
            icon: DollarSign,
            color: 'success',
            description: `From ${earningsData.overview.sessions} sessions`
          },
          {
            title: 'Pending',
            value: formatCurrency(earningsData.overview.pending),
            change: null,
            icon: Clock,
            color: 'amber',
            description: 'Awaiting payout'
          },
          {
            title: 'Paid Out',
            value: formatCurrency(earningsData.overview.paid),
            change: null,
            icon: CheckCircle,
            color: 'blue',
            description: 'Successfully transferred'
          },
          {
            title: 'Avg/Session',
            value: formatCurrency(earningsData.overview.avgPerSession),
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
                    {Math.abs(stat.change).toFixed(1)}%
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
            {earningsData.monthlyData.map((data, index) => (
              <motion.div
                key={data.month}
                initial={{ height: 0 }}
                animate={{ height: maxEarnings > 0 ? `${(data.earnings / maxEarnings) * 100}%` : '0%' }}
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
                  {data.growth >= 0 ? '+' : ''}{data.growth.toFixed(1)}%
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
          </div>

          <div className="space-y-4">
            {earningsData.transactions.slice(0, 6).map((transaction, index) => (
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
            {earningsData.payoutHistory.map((payout, index) => (
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
                      {new Date(payout.date).toLocaleDateString('en-US', {
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

      {/* Export Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="bg-gradient-to-r from-accent-50 to-warm-50 border border-accent-200 rounded-xl p-6"
      >
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Download className="w-6 h-6 text-accent-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-accent-800 font-baskervville mb-2">
              Export Your Earnings Data
            </h3>
            <p className="text-sm text-accent-700 font-montserrat mb-4">
              Download your earnings data for tax reporting or personal records
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => handleExport('csv')}
                disabled={exporting}
                className="bg-white text-accent-700 font-semibold py-2 px-4 rounded-lg border border-accent-200 hover:bg-accent-50 transition-colors font-montserrat text-sm disabled:opacity-50"
              >
                Export as CSV
              </button>
              <button
                onClick={() => handleExport('json')}
                disabled={exporting}
                className="bg-accent-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-accent-700 transition-colors font-montserrat text-sm disabled:opacity-50"
              >
                Export as JSON
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}