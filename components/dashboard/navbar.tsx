'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu,
  Search,
  Bell,
  MessageSquare,
  User,
  Settings,
  LogOut,
  Calendar,
  Plus,
  Filter,
  ChevronDown,
  DollarSign,
  Shield,
  HelpCircle,
  Download,
  Upload,
  X
} from 'lucide-react'

interface DashboardNavbarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export default function DashboardNavbar({ sidebarOpen, setSidebarOpen }: DashboardNavbarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showMessages, setShowMessages] = useState(false)

  const notifications = [
    {
      id: 1,
      title: 'New session request',
      message: 'Sarah wants to book a math session for tomorrow',
      time: '2 min ago',
      unread: true,
      type: 'session',
      avatar: 'SJ'
    },
    {
      id: 2,
      title: 'Payment received',
      message: '$75.00 for completed session with Mike',
      time: '1 hour ago',
      unread: true,
      type: 'payment',
      avatar: 'MC'
    },
    {
      id: 3,
      title: 'Session reminder',
      message: 'You have a session with Emma in 30 minutes',
      time: '2 hours ago',
      unread: false,
      type: 'reminder',
      avatar: 'ED'
    },
    {
      id: 4,
      title: 'New review received',
      message: 'Alex left you a 5-star review with comments',
      time: '3 hours ago',
      unread: true,
      type: 'review',
      avatar: 'AT'
    },
    {
      id: 5,
      title: 'Session completed',
      message: 'Successfully completed session with Lisa',
      time: '5 hours ago',
      unread: false,
      type: 'session',
      avatar: 'LP'
    },
    {
      id: 6,
      title: 'Weekly report ready',
      message: 'Your performance report for this week is available',
      time: '1 day ago',
      unread: false,
      type: 'report',
      avatar: null
    }
  ]

  const messages = [
    {
      id: 1,
      student: 'Sarah Johnson',
      avatar: 'SJ',
      message: 'Hi! Could we reschedule tomorrow\'s session?',
      time: '5 min ago',
      unread: true
    },
    {
      id: 2,
      student: 'Mike Chen',
      avatar: 'MC',
      message: 'Thank you for the great session today!',
      time: '2 hours ago',
      unread: true
    },
    {
      id: 3,
      student: 'Emma Davis',
      avatar: 'ED',
      message: 'I have a question about the homework...',
      time: '4 hours ago',
      unread: false
    },
    {
      id: 4,
      student: 'Alex Thompson',
      avatar: 'AT',
      message: 'When is our next session scheduled?',
      time: '1 day ago',
      unread: false
    }
  ]

  const unreadNotifications = notifications.filter(n => n.unread).length
  const unreadMessages = messages.filter(m => m.unread).length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'session':
        return <Calendar className="w-4 h-4 text-accent-500" />
      case 'payment':
        return <DollarSign className="w-4 h-4 text-success-500" />
      case 'reminder':
        return <Bell className="w-4 h-4 text-warm-500" />
      case 'review':
        return <User className="w-4 h-4 text-blue-500" />
      case 'report':
        return <Download className="w-4 h-4 text-purple-500" />
      default:
        return <Bell className="w-4 h-4 text-legal-warm-text" />
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
    <motion.header 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-legal-border/30 bg-white/95 backdrop-blur-md px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8"
    >
      {/* Mobile menu button */}
      <button
        type="button"
        className="-m-2.5 p-2.5 text-legal-warm-text hover:text-accent-600 transition-colors lg:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-legal-border lg:hidden" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        {/* Search bar */}
        <form className="relative flex flex-1 max-w-md" action="#" method="GET">
          <label htmlFor="search-field" className="sr-only">
            Search
          </label>
          <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-legal-warm-text pl-3" />
          <input
            id="search-field"
            className="block h-full w-full border-0 py-0 pl-10 pr-0 text-legal-dark-text placeholder:text-legal-warm-text focus:ring-0 sm:text-sm bg-transparent font-montserrat"
            placeholder="Search students, sessions, earnings..."
            type="search"
            name="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-legal-warm-text hover:text-accent-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        {/* Right side actions */}
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Quick Actions */}
          <div className="hidden sm:flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-accent-700 to-accent-600 text-white font-semibold py-2 px-4 rounded-lg shadow-legal hover:shadow-legal-lg transition-all duration-300 font-montserrat flex items-center space-x-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>New Session</span>
            </motion.button>

            <button 
              className="text-legal-warm-text hover:text-accent-600 transition-colors p-2 rounded-lg hover:bg-legal-bg-secondary/50"
              title="Calendar"
            >
              <Calendar className="w-5 h-5" />
            </button>

            <button 
              className="text-legal-warm-text hover:text-accent-600 transition-colors p-2 rounded-lg hover:bg-legal-bg-secondary/50"
              title="Filter"
            >
              <Filter className="w-5 h-5" />
            </button>

            <button 
              className="text-legal-warm-text hover:text-accent-600 transition-colors p-2 rounded-lg hover:bg-legal-bg-secondary/50"
              title="Upload"
            >
              <Upload className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="relative">
            <button
              onClick={() => setShowMessages(!showMessages)}
              className="text-legal-warm-text hover:text-accent-600 transition-colors p-2 rounded-lg hover:bg-legal-bg-secondary/50 relative"
            >
              <MessageSquare className="w-5 h-5" />
              {unreadMessages > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-montserrat">
                  {unreadMessages}
                </span>
              )}
            </button>

            {/* Messages dropdown */}
            <AnimatePresence>
              {showMessages && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-legal-lg border border-legal-border/30 z-50"
                >
                  <div className="p-4 border-b border-legal-border/30">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-legal-dark-text font-baskervville">Messages</h3>
                      {unreadMessages > 0 && (
                        <span className="text-xs text-blue-600 font-montserrat">
                          {unreadMessages} unread
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {messages.map((message, index) => (
                      <div
                        key={message.id}
                        className={`p-4 border-b border-legal-border/20 hover:bg-legal-bg-secondary/20 transition-colors cursor-pointer ${
                          message.unread ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs ${getAvatarColor(index)}`}>
                            {message.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-medium text-legal-dark-text font-montserrat">
                                {message.student}
                              </p>
                              {message.unread && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              )}
                            </div>
                            <p className="text-sm text-legal-warm-text font-montserrat line-clamp-2">
                              {message.message}
                            </p>
                            <p className="text-xs text-legal-warm-text font-montserrat mt-1">
                              {message.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-legal-border/30">
                    <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium font-montserrat">
                      View all messages
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Click outside to close */}
            {showMessages && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMessages(false)}
              />
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="text-legal-warm-text hover:text-accent-600 transition-colors p-2 rounded-lg hover:bg-legal-bg-secondary/50 relative"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-montserrat">
                  {unreadNotifications}
                </span>
              )}
            </button>

            {/* Notifications dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-legal-lg border border-legal-border/30 z-50"
                >
                  <div className="p-4 border-b border-legal-border/30">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-legal-dark-text font-baskervville">Notifications</h3>
                      {unreadNotifications > 0 && (
                        <span className="text-xs text-red-600 font-montserrat">
                          {unreadNotifications} unread
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notification, index) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-legal-border/20 hover:bg-legal-bg-secondary/20 transition-colors cursor-pointer ${
                          notification.unread ? 'bg-red-50/30' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-legal-dark-text font-montserrat">
                                  {notification.title}
                                </p>
                                <p className="text-sm text-legal-warm-text font-montserrat mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-legal-warm-text font-montserrat mt-2">
                                  {notification.time}
                                </p>
                              </div>
                              <div className="ml-2 flex items-center space-x-2">
                                {notification.avatar && (
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-semibold text-xs ${getAvatarColor(index)}`}>
                                    {notification.avatar}
                                  </div>
                                )}
                                {notification.unread && (
                                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-legal-border/30">
                    <div className="flex space-x-3">
                      <button className="flex-1 text-center text-sm text-accent-600 hover:text-accent-700 font-medium font-montserrat">
                        Mark all read
                      </button>
                      <button className="flex-1 text-center text-sm text-accent-600 hover:text-accent-700 font-medium font-montserrat">
                        View all
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Click outside to close */}
            {showNotifications && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
            )}
          </div>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-legal-border" />

          {/* Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center space-x-3 text-sm leading-6 text-legal-dark-text hover:text-accent-600 transition-colors p-2 rounded-lg hover:bg-legal-bg-secondary/50"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-accent-100 to-accent-200 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-accent-600" />
              </div>
              <span className="hidden lg:flex lg:items-center">
                <span className="ml-2 text-sm font-semibold leading-6 text-legal-dark-text font-montserrat">
                  John Doe
                </span>
                <ChevronDown className="ml-2 h-4 w-4 text-legal-warm-text" />
              </span>
            </button>

            {/* Profile dropdown menu */}
            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-legal-lg border border-legal-border/30 z-50"
                >
                  <div className="p-4 border-b border-legal-border/30">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-accent-100 to-accent-200 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-accent-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-legal-dark-text font-montserrat">John Doe</p>
                        <p className="text-xs text-legal-warm-text font-montserrat">Mathematics Mentor</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Shield className="w-3 h-3 text-success-500" />
                          <span className="text-xs text-success-600 font-montserrat">Verified</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-2">
                    <a
                      href="/dashboard/profile"
                      className="flex items-center px-4 py-3 text-sm text-legal-dark-text hover:bg-legal-bg-secondary/50 transition-colors font-montserrat"
                    >
                      <User className="w-4 h-4 mr-3 text-legal-warm-text" />
                      <div>
                        <div className="font-medium">Your Profile</div>
                        <div className="text-xs text-legal-warm-text">Manage your mentor profile</div>
                      </div>
                    </a>
                    <a
                      href="/dashboard/earnings"
                      className="flex items-center px-4 py-3 text-sm text-legal-dark-text hover:bg-legal-bg-secondary/50 transition-colors font-montserrat"
                    >
                      <DollarSign className="w-4 h-4 mr-3 text-legal-warm-text" />
                      <div>
                        <div className="font-medium">Earnings & Payments</div>
                        <div className="text-xs text-legal-warm-text">View earnings and payouts</div>
                      </div>
                    </a>
                    <a
                      href="/dashboard/settings"
                      className="flex items-center px-4 py-3 text-sm text-legal-dark-text hover:bg-legal-bg-secondary/50 transition-colors font-montserrat"
                    >
                      <Settings className="w-4 h-4 mr-3 text-legal-warm-text" />
                      <div>
                        <div className="font-medium">Settings</div>
                        <div className="text-xs text-legal-warm-text">Account and preferences</div>
                      </div>
                    </a>
                    <a
                      href="/help"
                      className="flex items-center px-4 py-3 text-sm text-legal-dark-text hover:bg-legal-bg-secondary/50 transition-colors font-montserrat"
                    >
                      <HelpCircle className="w-4 h-4 mr-3 text-legal-warm-text" />
                      <div>
                        <div className="font-medium">Help & Support</div>
                        <div className="text-xs text-legal-warm-text">Get help and contact support</div>
                      </div>
                    </a>
                  </div>
                  
                  <div className="border-t border-legal-border/30 py-2">
                    <button className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-montserrat">
                      <LogOut className="w-4 h-4 mr-3" />
                      <div>
                        <div className="font-medium">Sign out</div>
                        <div className="text-xs text-red-500">Sign out of your account</div>
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Click outside to close */}
            {showProfile && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowProfile(false)}
              />
            )}
          </div>
        </div>
      </div>
    </motion.header>
  )
}