'use client'

import { motion } from 'framer-motion'
import { 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  MessageSquare,
  Star
} from 'lucide-react'

export default function RecentSessions() {
  const sessions = [
    {
      id: 1,
      student: {
        name: 'Sarah Johnson',
        avatar: 'SJ',
        email: 'sarah.j@email.com'
      },
      subject: 'Advanced Calculus',
      date: 'Today',
      time: '2:30 PM - 3:30 PM',
      status: 'upcoming',
      duration: 60,
      type: 'Video Call',
      rate: 75,
      notes: 'Focus on integration by parts'
    },
    {
      id: 2,
      student: {
        name: 'Mike Chen',
        avatar: 'MC',
        email: 'mike.chen@email.com'
      },
      subject: 'Statistics',
      date: 'Yesterday',
      time: '4:00 PM - 5:00 PM',
      status: 'completed',
      duration: 60,
      type: 'Video Call',
      rate: 75,
      rating: 5,
      notes: 'Covered hypothesis testing'
    },
    {
      id: 3,
      student: {
        name: 'Emma Davis',
        avatar: 'ED',
        email: 'emma.davis@email.com'
      },
      subject: 'Linear Algebra',
      date: 'Dec 10',
      time: '6:30 PM - 7:30 PM',
      status: 'completed',
      duration: 60,
      type: 'Video Call',
      rate: 75,
      rating: 5,
      notes: 'Matrix operations and eigenvalues'
    },
    {
      id: 4,
      student: {
        name: 'Alex Thompson',
        avatar: 'AT',
        email: 'alex.t@email.com'
      },
      subject: 'Probability Theory',
      date: 'Dec 9',
      time: '3:00 PM - 4:00 PM',
      status: 'cancelled',
      duration: 60,
      type: 'Video Call',
      rate: 75,
      notes: 'Student cancelled - rescheduled'
    },
    {
      id: 5,
      student: {
        name: 'Lisa Park',
        avatar: 'LP',
        email: 'lisa.park@email.com'
      },
      subject: 'Differential Equations',
      date: 'Dec 8',
      time: '5:00 PM - 6:00 PM',
      status: 'completed',
      duration: 60,
      type: 'Video Call',
      rate: 75,
      rating: 4,
      notes: 'Second-order linear equations'
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-success-500" />
      case 'upcoming':
        return <Clock className="w-4 h-4 text-accent-500" />
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-warm-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success-100 text-success-700 border-success-200'
      case 'upcoming':
        return 'bg-accent-100 text-accent-700 border-accent-200'
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-warm-100 text-warm-700 border-warm-200'
    }
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-legal-lg border border-warm-200/50 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-baskervville font-bold text-legal-dark-text">
          Recent Sessions
        </h3>
        <div className="flex items-center space-x-3">
          <button className="text-sm text-accent-600 hover:text-accent-700 font-medium font-montserrat">
            View All
          </button>
          <Calendar className="w-5 h-5 text-accent-600" />
        </div>
      </div>

      <div className="space-y-4">
        {sessions.map((session, index) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="border border-legal-border/30 rounded-xl p-4 hover:bg-legal-bg-secondary/20 transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                {/* Student Avatar */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm ${getAvatarColor(index)}`}>
                  {session.student.avatar}
                </div>

                {/* Session Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-sm font-semibold text-legal-dark-text font-montserrat">
                      {session.student.name}
                    </h4>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(session.status)}`}>
                      {getStatusIcon(session.status)}
                      <span className="ml-1 capitalize">{session.status}</span>
                    </span>
                  </div>
                  
                  <p className="text-sm text-legal-warm-text font-montserrat mb-1">
                    {session.subject}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-xs text-legal-warm-text font-montserrat">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{session.date}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{session.time}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>${session.rate}</span>
                    </div>
                  </div>

                  {session.notes && (
                    <p className="text-xs text-legal-warm-text/80 font-montserrat mt-2 italic">
                      &quot;{session.notes}&quot;
                    </p>
                  )}
                </div>
              </div>

              {/* Actions & Rating */}
              <div className="flex items-center space-x-2">
                {session.rating && (
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-amber-400 fill-current" />
                    <span className="text-sm font-medium text-legal-dark-text font-montserrat">
                      {session.rating}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1 text-legal-warm-text hover:text-accent-600 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-legal-warm-text hover:text-accent-600 transition-colors">
                    <MessageSquare className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Session Progress Bar (for upcoming sessions) */}
            {session.status === 'upcoming' && (
              <div className="mt-3 pt-3 border-t border-legal-border/20">
                <div className="flex items-center justify-between text-xs text-legal-warm-text font-montserrat mb-2">
                  <span>Session starts in 2 hours</span>
                  <span>Duration: {session.duration}min</span>
                </div>
                <div className="w-full bg-legal-border/30 rounded-full h-1">
                  <div className="bg-accent-500 h-1 rounded-full" style={{ width: '75%' }} />
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-6 pt-6 border-t border-legal-border/30">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-lg font-bold text-legal-dark-text font-baskervville">
              {sessions.filter(s => s.status === 'completed').length}
            </p>
            <p className="text-xs text-legal-warm-text font-montserrat">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-accent-600 font-baskervville">
              {sessions.filter(s => s.status === 'upcoming').length}
            </p>
            <p className="text-xs text-legal-warm-text font-montserrat">Upcoming</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-success-600 font-baskervville">
              ${sessions.filter(s => s.status === 'completed').reduce((sum, s) => sum + s.rate, 0)}
            </p>
            <p className="text-xs text-legal-warm-text font-montserrat">Earned</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}