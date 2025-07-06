'use client'

import { motion } from 'framer-motion'
import { 
  Plus,
  Calendar,
  Users,
  MessageSquare,
  FileText,
  Video,
  Clock,
  Star,
  Settings,
  Zap
} from 'lucide-react'

export default function QuickActions() {
  const quickActions = [
    {
      title: 'Schedule Session',
      description: 'Book a new mentoring session',
      icon: Plus,
      color: 'accent',
      action: 'primary'
    },
    {
      title: 'View Calendar',
      description: 'Check your upcoming sessions',
      icon: Calendar,
      color: 'warm',
      action: 'secondary'
    },
    {
      title: 'Message Students',
      description: 'Send messages to your students',
      icon: MessageSquare,
      color: 'blue',
      action: 'secondary'
    },
    {
      title: 'Create Resource',
      description: 'Upload study materials',
      icon: FileText,
      color: 'green',
      action: 'secondary'
    }
  ]

  const recentActions = [
    {
      title: 'Start Video Call',
      description: 'Join session with Sarah',
      icon: Video,
      time: '2:30 PM',
      urgent: true
    },
    {
      title: 'Review Assignment',
      description: 'Mike\'s calculus homework',
      icon: FileText,
      time: 'Due today',
      urgent: false
    },
    {
      title: 'Schedule Reminder',
      description: 'Emma\'s session tomorrow',
      icon: Clock,
      time: '6:30 PM',
      urgent: false
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      accent: {
        bg: 'bg-accent-500',
        hover: 'hover:bg-accent-600',
        text: 'text-white',
        icon: 'text-white'
      },
      warm: {
        bg: 'bg-warm-500',
        hover: 'hover:bg-warm-600',
        text: 'text-white',
        icon: 'text-white'
      },
      blue: {
        bg: 'bg-blue-500',
        hover: 'hover:bg-blue-600',
        text: 'text-white',
        icon: 'text-white'
      },
      green: {
        bg: 'bg-green-500',
        hover: 'hover:bg-green-600',
        text: 'text-white',
        icon: 'text-white'
      }
    }
    return colors[color as keyof typeof colors] || colors.accent
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-legal-lg border border-warm-200/50 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-accent-100 to-accent-200 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-accent-600" />
          </div>
          <h3 className="text-xl font-baskervville font-bold text-legal-dark-text">
            Quick Actions
          </h3>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="space-y-3 mb-6">
        {quickActions.map((action, index) => {
          const colorClasses = getColorClasses(action.color)
          const isPrimary = action.action === 'primary'
          
          return (
            <motion.button
              key={action.title}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 ${
                isPrimary
                  ? `${colorClasses.bg} ${colorClasses.hover} ${colorClasses.text} shadow-legal`
                  : 'bg-legal-bg-secondary/30 hover:bg-legal-bg-secondary/50 text-legal-dark-text border border-legal-border/30'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isPrimary 
                  ? 'bg-white/20' 
                  : `${colorClasses.bg.replace('500', '100')} ${colorClasses.icon.replace('white', colorClasses.bg.replace('bg-', '').replace('-500', '-600'))}`
              }`}>
                <action.icon className={`w-5 h-5 ${
                  isPrimary ? 'text-white' : colorClasses.icon.replace('white', colorClasses.bg.replace('bg-', '').replace('-500', '-600'))
                }`} />
              </div>
              <div className="flex-1 text-left">
                <h4 className={`text-sm font-semibold font-montserrat ${
                  isPrimary ? 'text-white' : 'text-legal-dark-text'
                }`}>
                  {action.title}
                </h4>
                <p className={`text-xs font-montserrat ${
                  isPrimary ? 'text-white/80' : 'text-legal-warm-text'
                }`}>
                  {action.description}
                </p>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Divider */}
      <div className="border-t border-legal-border/30 my-6"></div>

      {/* Recent Actions */}
      <div>
        <h4 className="text-sm font-semibold text-legal-dark-text font-montserrat mb-4 flex items-center">
          <Clock className="w-4 h-4 mr-2 text-legal-warm-text" />
          Recent Actions
        </h4>
        
        <div className="space-y-3">
          {recentActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
              className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-300 cursor-pointer hover:bg-legal-bg-secondary/20 ${
                action.urgent 
                  ? 'border-accent-300 bg-accent-50/50' 
                  : 'border-legal-border/30'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                action.urgent 
                  ? 'bg-accent-100 text-accent-600' 
                  : 'bg-legal-bg-secondary text-legal-warm-text'
              }`}>
                <action.icon className="w-4 h-4" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-legal-dark-text font-montserrat">
                  {action.title}
                </p>
                <p className="text-xs text-legal-warm-text font-montserrat">
                  {action.description}
                </p>
              </div>
              
              <div className="text-right">
                <p className={`text-xs font-medium font-montserrat ${
                  action.urgent ? 'text-accent-600' : 'text-legal-warm-text'
                }`}>
                  {action.time}
                </p>
                {action.urgent && (
                  <div className="w-2 h-2 bg-accent-500 rounded-full ml-auto mt-1"></div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Shortcuts */}
      <div className="mt-6 pt-6 border-t border-legal-border/30">
        <h4 className="text-sm font-semibold text-legal-dark-text font-montserrat mb-4">
          Shortcuts
        </h4>
        
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center space-x-2 p-3 bg-legal-bg-secondary/30 hover:bg-legal-bg-secondary/50 rounded-lg transition-colors border border-legal-border/30">
            <Users className="w-4 h-4 text-legal-warm-text" />
            <span className="text-xs font-medium text-legal-warm-text font-montserrat">Students</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 p-3 bg-legal-bg-secondary/30 hover:bg-legal-bg-secondary/50 rounded-lg transition-colors border border-legal-border/30">
            <Star className="w-4 h-4 text-legal-warm-text" />
            <span className="text-xs font-medium text-legal-warm-text font-montserrat">Reviews</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 p-3 bg-legal-bg-secondary/30 hover:bg-legal-bg-secondary/50 rounded-lg transition-colors border border-legal-border/30">
            <FileText className="w-4 h-4 text-legal-warm-text" />
            <span className="text-xs font-medium text-legal-warm-text font-montserrat">Resources</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 p-3 bg-legal-bg-secondary/30 hover:bg-legal-bg-secondary/50 rounded-lg transition-colors border border-legal-border/30">
            <Settings className="w-4 h-4 text-legal-warm-text" />
            <span className="text-xs font-medium text-legal-warm-text font-montserrat">Settings</span>
          </button>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-6 p-4 bg-gradient-to-r from-accent-50 to-warm-50 border border-accent-200 rounded-xl">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-accent-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-accent-600" />
          </div>
          <div>
            <h5 className="text-sm font-semibold text-accent-800 font-montserrat mb-1">
              Pro Tip
            </h5>
            <p className="text-xs text-accent-700 font-montserrat leading-relaxed">
              Schedule your sessions in advance to maintain a consistent income flow and give students better planning options.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}