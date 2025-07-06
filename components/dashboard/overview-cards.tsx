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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, index) => {
        const colorClasses = getColorClasses(stat.color)
        
        return (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className={`bg-white/95 backdrop-blur-sm rounded-2xl shadow-legal border border-warm-200/50 p-6 hover:shadow-legal-lg transition-all duration-300 cursor-pointer`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl ${colorClasses.bg} ${colorClasses.border} border flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${colorClasses.icon}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-legal-warm-text font-montserrat">
                      {stat.name}
                    </p>
                    <p className="text-xs text-legal-warm-text/70 font-montserrat">
                      {stat.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-end justify-between">
                  <div>
                    <p className={`text-3xl font-bold ${colorClasses.value} font-baskervville`}>
                      {stat.value}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <TrendingUp className={`w-4 h-4 ${colorClasses.change}`} />
                    <span className={`text-sm font-medium ${colorClasses.change} font-montserrat`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Progress indicator */}
            <div className="mt-4">
              <div className="w-full bg-legal-border/30 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${65 + index * 5}%` }}
                  transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
                  className={`h-2 rounded-full ${colorClasses.bg.replace('50', '200')}`}
                />
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}