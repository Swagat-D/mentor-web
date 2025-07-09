'use client'

import { motion } from 'framer-motion'
import { 
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  Star
} from 'lucide-react'

export default function OverviewCards() {
  const stats = [
    {
      name: 'Total Students',
      value: '24',
      change: '+12%',
      changeType: 'positive',
      icon: Users,
      description: 'Active students this month',
      color: 'accent'
    },
    {
      name: 'Sessions This Week',
      value: '18',
      change: '+8%',
      changeType: 'positive',
      icon: Calendar,
      description: 'Completed and scheduled',
      color: 'warm'
    },
    {
      name: 'Monthly Earnings',
      value: '$1,850',
      change: '+23%',
      changeType: 'positive',
      icon: DollarSign,
      description: 'Total earnings this month',
      color: 'success'
    },
    {
      name: 'Average Rating',
      value: '4.9',
      change: '+0.2',
      changeType: 'positive',
      icon: Star,
      description: 'Based on recent reviews',
      color: 'amber'
    },
    {
      name: 'Response Time',
      value: '< 2h',
      change: '-15m',
      changeType: 'positive',
      icon: Clock,
      description: 'Average response time',
      color: 'blue'
    },
    {
      name: 'Success Rate',
      value: '96%',
      change: '+4%',
      changeType: 'positive',
      icon: TrendingUp,
      description: 'Session completion rate',
      color: 'green'
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      accent: {
        bg: 'bg-accent-50',
        border: 'border-accent-200',
        icon: 'text-accent-600',
        value: 'text-accent-700',
        change: 'text-accent-600'
      },
      warm: {
        bg: 'bg-warm-50',
        border: 'border-warm-200',
        icon: 'text-warm-600',
        value: 'text-warm-700',
        change: 'text-warm-600'
      },
      success: {
        bg: 'bg-success-50',
        border: 'border-success-200',
        icon: 'text-success-600',
        value: 'text-success-700',
        change: 'text-success-600'
      },
      amber: {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        icon: 'text-amber-600',
        value: 'text-amber-700',
        change: 'text-amber-600'
      },
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: 'text-blue-600',
        value: 'text-blue-700',
        change: 'text-blue-600'
      },
      green: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        icon: 'text-green-600',
        value: 'text-green-700',
        change: 'text-green-600'
      }
    }
    return colors[color as keyof typeof colors] || colors.accent
  }

  return (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
    {stats.map((stat, index) => {
      const colorClasses = getColorClasses(stat.color)
      
      return (
        <motion.div
          key={stat.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          whileHover={{ scale: 1.02, y: -2 }}
          className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-legal border border-warm-200/50 p-3 sm:p-4 lg:p-6 hover:shadow-legal-lg transition-all duration-300 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-4">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl ${colorClasses.bg} ${colorClasses.border} border flex items-center justify-center`}>
                  <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${colorClasses.icon}`} />
                </div>
                <div className="min-w-0 flex-1 lg:hidden xl:block">
                  <p className="text-xs sm:text-sm font-medium text-legal-warm-text font-montserrat truncate">
                    {stat.name}
                  </p>
                  <p className="text-xs text-legal-warm-text/70 font-montserrat truncate">
                    {stat.description}
                  </p>
                </div>
              </div>
              
              <div className="flex items-end justify-between">
                <div>
                  <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${colorClasses.value} font-baskervville`}>
                    {stat.value}
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-legal-warm-text font-montserrat lg:hidden xl:hidden">
                    {stat.name}
                  </p>
                </div>
                
                <div className="flex items-center space-x-1">
                  <TrendingUp className={`w-3 h-3 sm:w-4 sm:h-4 ${colorClasses.change}`} />
                  <span className={`text-xs sm:text-sm font-medium ${colorClasses.change} font-montserrat`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Progress indicator */}
          <div className="mt-3 sm:mt-4">
            <div className="w-full bg-legal-border/30 rounded-full h-1.5 sm:h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${65 + index * 5}%` }}
                transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                className={`h-1.5 sm:h-2 rounded-full ${colorClasses.bg.replace('50', '200')}`}
              />
            </div>
          </div>
        </motion.div>
      )
    })}
  </div>
)}