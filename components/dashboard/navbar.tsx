/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/context/AuthContext'
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
  ChevronDown,
  DollarSign,
  Shield,
  HelpCircle,
  Upload,
  X,
  Maximize2,
  Sun,
  Moon,
  RefreshCw,
  Loader,
  Zap,
  Users
} from 'lucide-react'
import Image from 'next/image'

interface DashboardNavbarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

interface Notification {
  _id: string
  title: string
  message: string
  type: 'session' | 'payment' | 'reminder' | 'review' | 'system'
  read: boolean
  createdAt: string
  relatedUser?: {
    name: string
    avatar?: string
  }
  actionUrl?: string
}

interface Message {
  _id: string
  fromUser: {
    name: string
    email: string
    avatar?: string
  }
  content: string
  read: boolean
  createdAt: string
  conversationId: string
}

interface UserProfile {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: string
  profilePhoto?: string
  isVerified: boolean
  settings: {
    theme: 'light' | 'dark'
    emailNotifications: boolean
    smsNotifications: boolean
  }
}

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  pagination?: {
    total: number
    unread: number
  }
}

export default function DashboardNavbar({ sidebarOpen, setSidebarOpen }: DashboardNavbarProps) {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [showMessages, setShowMessages] = useState(false)
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  
  // User profile state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(false)
  
  // Dynamic data states
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [lastFetch, setLastFetch] = useState<Date>(new Date())

  // Refs for click outside detection
  const searchRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const messagesRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const quickActionsRef = useRef<HTMLDivElement>(null)

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUnreadCounts()
      if (showNotifications) fetchNotifications()
      if (showMessages) fetchMessages()
    }, 30000)

    return () => clearInterval(interval)
  }, [showNotifications, showMessages])

  // Fetch initial data on mount
  useEffect(() => {
    fetchUserProfile()
    fetchUnreadCounts()
  }, [])

  // Handle click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
      if (messagesRef.current && !messagesRef.current.contains(event.target as Node)) {
        setShowMessages(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false)
      }
      if (quickActionsRef.current && !quickActionsRef.current.contains(event.target as Node)) {
        setShowQuickActions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Handle escape key to close dropdowns
  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeAllDropdowns()
      }
    }

    document.addEventListener('keydown', handleEscapeKey)
    return () => {
      document.removeEventListener('keydown', handleEscapeKey)
    }
  }, [])

  const fetchUserProfile = async () => {
    setLoadingProfile(true)
    try {
      const response = await fetch('/api/user/profile', { 
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      
      if (response.ok) {
        const data: ApiResponse<UserProfile> = await response.json()
        if (data.success) {
          setUserProfile(data.data)
          setIsDarkMode(data.data.settings?.theme === 'dark')
        }
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      // Fallback to auth context user data
      if (user) {
        setUserProfile({
          _id: user.id || '',
          firstName: user.firstName || user.email?.split('@')[0] || 'User',
          lastName: user.lastName || '',
          email: user.email || '',
          role: user.role || 'mentor',
          isVerified: user.isVerified || false,
          settings: {
            theme: 'light',
            emailNotifications: true,
            smsNotifications: false
          }
        })
      }
    } finally {
      setLoadingProfile(false)
    }
  }

  const fetchUnreadCounts = async () => {
    try {
      const [notificationsResponse, messagesResponse] = await Promise.all([
        fetch('/api/notifications?unreadOnly=true&limit=1', { 
          credentials: 'include',
          headers: { 'Cache-Control': 'no-cache' }
        }),
        fetch('/api/messages?unreadOnly=true&limit=1', { 
          credentials: 'include',
          headers: { 'Cache-Control': 'no-cache' }
        })
      ])

      if (notificationsResponse.ok) {
        const notificationsData: ApiResponse<Notification[]> = await notificationsResponse.json()
        setUnreadNotifications(notificationsData.pagination?.unread || 0)
      }

      if (messagesResponse.ok) {
        const messagesData: ApiResponse<Message[]> = await messagesResponse.json()
        setUnreadMessages(messagesData.pagination?.unread || 0)
      }
    } catch (error) {
      console.error('Failed to fetch unread counts:', error)
      // Use mock data as fallback
      setUnreadNotifications(Math.floor(Math.random() * 5))
      setUnreadMessages(Math.floor(Math.random() * 3))
    }
  }

  const fetchNotifications = async () => {
    setLoadingNotifications(true)
    try {
      const response = await fetch('/api/notifications?limit=10', { 
        credentials: 'include',
        headers: { 'Cache-Control': 'no-cache' }
      })
      
      if (response.ok) {
        const data: ApiResponse<Notification[]> = await response.json()
        if (data.success) {
          setNotifications(data.data || [])
          setUnreadNotifications(data.pagination?.unread || 0)
        }
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      // Use fallback mock data
      setNotifications([
        {
          _id: '1',
          title: 'New session request',
          message: 'Sarah wants to book a math session for tomorrow',
          type: 'session',
          read: false,
          createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
          relatedUser: { name: 'Sarah Johnson', avatar: 'SJ' }
        },
        {
          _id: '2',
          title: 'Payment received',
          message: '$75.00 for completed session with Mike',
          type: 'payment',
          read: false,
          createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          relatedUser: { name: 'Mike Chen', avatar: 'MC' }
        }
      ])
    } finally {
      setLoadingNotifications(false)
      setLastFetch(new Date())
    }
  }

  const fetchMessages = async () => {
    setLoadingMessages(true)
    try {
      const response = await fetch('/api/messages?limit=10', { 
        credentials: 'include',
        headers: { 'Cache-Control': 'no-cache' }
      })
      
      if (response.ok) {
        const data: ApiResponse<Message[]> = await response.json()
        if (data.success) {
          setMessages(data.data || [])
          setUnreadMessages(data.pagination?.unread || 0)
        }
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
      // Use fallback mock data
      setMessages([
        {
          _id: '1',
          fromUser: { name: 'Sarah Johnson', email: 'sarah@email.com', avatar: 'SJ' },
          content: 'Hi! Could we reschedule tomorrow\'s session?',
          read: false,
          createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          conversationId: 'conv1'
        },
        {
          _id: '2',
          fromUser: { name: 'Mike Chen', email: 'mike@email.com', avatar: 'MC' },
          content: 'Thank you for the great session today!',
          read: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          conversationId: 'conv2'
        }
      ])
    } finally {
      setLoadingMessages(false)
      setLastFetch(new Date())
    }
  }

  const updateTheme = async (theme: 'light' | 'dark') => {
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ theme })
      })

      if (response.ok) {
        setIsDarkMode(theme === 'dark')
        if (userProfile) {
          setUserProfile({
            ...userProfile,
            settings: { ...userProfile.settings, theme }
          })
        }
        // Apply theme to document
        document.documentElement.classList.toggle('dark', theme === 'dark')
      }
    } catch (error) {
      console.error('Failed to update theme:', error)
    }
  }

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        credentials: 'include'
      })
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId ? { ...notif, read: true } : notif
          )
        )
        setUnreadNotifications(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markMessageAsRead = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}/read`, {
        method: 'PATCH',
        credentials: 'include'
      })
      
      if (response.ok) {
        setMessages(prev => 
          prev.map(msg => 
            msg._id === messageId ? { ...msg, read: true } : msg
          )
        )
        setUnreadMessages(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Failed to mark message as read:', error)
    }
  }

  const markAllNotificationsAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH',
        credentials: 'include'
      })
      
      if (response.ok) {
        setNotifications(prev => prev.map(notif => ({ ...notif, read: true })))
        setUnreadNotifications(0)
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      
      if (response.ok) {
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Logout failed:', error)
      // Force redirect even if API fails
      window.location.href = '/'
    }
  }

  const quickActions = [
    { 
      icon: Plus, 
      label: 'New Session', 
      color: 'accent', 
      action: () => window.location.href = '/dashboard/sessions/new',
      shortcut: 'N'
    },
    { 
      icon: Calendar, 
      label: 'Calendar', 
      color: 'warm', 
      action: () => window.location.href = '/dashboard/calendar',
      shortcut: 'C'
    },
    { 
      icon: Users, 
      label: 'Students', 
      color: 'blue', 
      action: () => window.location.href = '/dashboard/students',
      shortcut: 'S'
    },
    { 
      icon: Upload, 
      label: 'Upload', 
      color: 'success', 
      action: () => document.getElementById('file-upload')?.click(),
      shortcut: 'U'
    }
  ]

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
      case 'system':
        return <Settings className="w-4 h-4 text-purple-500" />
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

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getDisplayName = () => {
    if (userProfile) {
      return `${userProfile.firstName} ${userProfile.lastName}`.trim() || userProfile.email.split('@')[0]
    }
    return user?.email?.split('@')[0] || 'User'
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return date.toLocaleDateString()
  }

  const closeAllDropdowns = () => {
    setShowNotifications(false)
    setShowProfile(false)
    setShowMessages(false)
    setShowQuickActions(false)
    setShowSearch(false)
  }

  const handleNotificationClick = (notification: Notification) => {
    markNotificationAsRead(notification._id)
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl
    }
    closeAllDropdowns()
  }

  const handleMessageClick = (message: Message) => {
    markMessageAsRead(message._id)
    window.location.href = `/dashboard/messages/${message.conversationId}`
    closeAllDropdowns()
  }

  return (
    <>
      <motion.header 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-50 flex h-14 sm:h-16 lg:h-18 shrink-0 items-center gap-x-2 sm:gap-x-4 border-b border-legal-border/30 bg-white/95 backdrop-blur-md px-3 sm:px-4 shadow-sm lg:px-6 xl:px-8"
      >
        {/* Mobile menu button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          className="-m-2.5 p-2.5 text-legal-warm-text hover:text-accent-600 transition-colors lg:hidden rounded-lg hover:bg-legal-bg-secondary/50"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
        </motion.button>

        {/* Separator */}
        <div className="h-4 w-px bg-legal-border lg:hidden" />

        <div className="flex flex-1 gap-x-2 sm:gap-x-4 self-stretch lg:gap-x-6">
          {/* Search bar */}
          <div ref={searchRef} className="relative flex flex-1 max-w-xs sm:max-w-sm lg:max-w-md xl:max-w-lg">
            <div className={`relative flex flex-1 transition-all duration-300 ${showSearch ? 'w-full' : ''}`}>
              <label htmlFor="search-field" className="sr-only">Search</label>
              <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-4 sm:w-5 text-legal-warm-text pl-2 sm:pl-3" />
              <input
                id="search-field"
                className="block h-full w-full border-0 py-0 pl-8 sm:pl-10 pr-8 sm:pr-10 text-legal-dark-text placeholder:text-legal-warm-text focus:ring-0 text-xs sm:text-sm bg-transparent font-montserrat rounded-lg focus:bg-white/50 transition-colors"
                placeholder="Search students, sessions, earnings..."
                type="search"
                name="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearch(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setShowSearch(false)
                    e.currentTarget.blur()
                  }
                  if (e.key === 'Enter') {
                    // Handle search
                    console.log('Search for:', searchQuery)
                  }
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-2 sm:pr-3 flex items-center text-legal-warm-text hover:text-accent-600 transition-colors"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>

            {/* Search suggestions dropdown */}
            <AnimatePresence>
              {showSearch && searchQuery && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-legal-lg border border-legal-border/30 z-50 max-h-60 overflow-y-auto"
                >
                  <div className="p-3">
                    <p className="text-xs text-legal-warm-text font-montserrat mb-2">Search suggestions</p>
                    <div className="space-y-1">
                      <button className="w-full text-left px-3 py-2 text-sm text-legal-dark-text hover:bg-legal-bg-secondary/50 rounded-lg transition-colors font-montserrat">
                        Search in students: &quot;{searchQuery}&quot;
                      </button>
                      <button className="w-full text-left px-3 py-2 text-sm text-legal-dark-text hover:bg-legal-bg-secondary/50 rounded-lg transition-colors font-montserrat">
                        Search in sessions: &quot;{searchQuery}&quot;
                      </button>
                      <button className="w-full text-left px-3 py-2 text-sm text-legal-dark-text hover:bg-legal-bg-secondary/50 rounded-lg transition-colors font-montserrat">
                        Search in earnings: &quot;{searchQuery}&quot;
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-x-1 sm:gap-x-2 lg:gap-x-3 xl:gap-x-4">
            {/* Quick Actions - Desktop only */}
            <div className="hidden xl:flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={quickActions[0].action}
                className="bg-gradient-to-r from-accent-700 to-accent-600 text-white font-semibold py-2 px-3 rounded-lg shadow-legal hover:shadow-legal-lg transition-all duration-300 font-montserrat flex items-center space-x-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden 2xl:inline">New Session</span>
              </motion.button>

              {quickActions.slice(1, 3).map((action) => (
                <motion.button 
                  key={action.label}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={action.action}
                  className="text-legal-warm-text hover:text-accent-600 transition-colors p-2 rounded-lg hover:bg-legal-bg-secondary/50"
                  title={`${action.label} (${action.shortcut})`}
                >
                  <action.icon className="w-4 h-4" />
                </motion.button>
              ))}
            </div>

            {/* Quick Actions Button - Mobile & Tablet */}
            <div ref={quickActionsRef} className="xl:hidden relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  closeAllDropdowns()
                  setShowQuickActions(!showQuickActions)
                }}
                className="text-legal-warm-text hover:text-accent-600 transition-colors p-1.5 sm:p-2 rounded-lg hover:bg-legal-bg-secondary/50 relative"
              >
                <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>

              <AnimatePresence>
                {showQuickActions && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-legal-lg border border-legal-border/30 z-50"
                  >
                    <div className="p-3">
                      <h3 className="text-sm font-semibold text-legal-dark-text font-baskervville mb-3">Quick Actions</h3>
                      {quickActions.map((action) => (
                        <motion.button
                          key={action.label}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            action.action()
                            closeAllDropdowns()
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 text-sm text-legal-dark-text hover:bg-legal-bg-secondary/50 rounded-lg transition-colors font-montserrat mb-1"
                        >
                          <div className="flex items-center space-x-3">
                            <action.icon className="w-4 h-4 text-legal-warm-text" />
                            <span>{action.label}</span>
                          </div>
                          <span className="text-xs text-legal-warm-text bg-legal-bg-secondary/50 px-1.5 py-0.5 rounded">
                            {action.shortcut}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle - Desktop only */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => updateTheme(isDarkMode ? 'light' : 'dark')}
              className="hidden lg:flex text-legal-warm-text hover:text-accent-600 transition-colors p-2 rounded-lg hover:bg-legal-bg-secondary/50"
              title="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </motion.button>

            {/* Full screen toggle - Desktop only */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (document.fullscreenElement) {
                  document.exitFullscreen()
                } else {
                  document.documentElement.requestFullscreen()
                }
              }}
              className="hidden lg:flex text-legal-warm-text hover:text-accent-600 transition-colors p-2 rounded-lg hover:bg-legal-bg-secondary/50"
              title="Toggle fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </motion.button>

            {/* Messages */}
            <div ref={messagesRef} className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  closeAllDropdowns()
                  setShowMessages(!showMessages)
                  if (!showMessages) fetchMessages()
                }}
                className="text-legal-warm-text hover:text-accent-600 transition-colors p-1.5 sm:p-2 rounded-lg hover:bg-legal-bg-secondary/50 relative"
              >
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadMessages > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-montserrat min-w-0 font-bold"
                  >
                    {unreadMessages > 99 ? '99+' : unreadMessages}
                  </motion.span>
                )}
              </motion.button>

              <AnimatePresence>
                {showMessages && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-legal-lg border border-legal-border/30 z-50"
                  >
                    <div className="p-4 border-b border-legal-border/30">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-legal-dark-text font-baskervville">Messages</h3>
                        <div className="flex items-center space-x-2">
                          {unreadMessages > 0 && (
                            <span className="text-xs text-blue-600 font-montserrat">
                              {unreadMessages} unread
                            </span>
                          )}
                          {loadingMessages && (
                            <Loader className="w-3 h-3 text-blue-600 animate-spin" />
                          )}
                          <button
                            onClick={() => fetchMessages()}
                            className="text-blue-600 hover:text-blue-700 transition-colors"
                            title="Refresh messages"
                          >
                            <RefreshCw className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="max-h-60 sm:max-h-80 overflow-y-auto">
                      {messages.length > 0 ? messages.slice(0, 6).map((message, index) => (
                        <div
                          key={message._id}
                          onClick={() => handleMessageClick(message)}
                          className={`p-3 sm:p-4 border-b border-legal-border/20 hover:bg-legal-bg-secondary/20 transition-colors cursor-pointer ${
                            !message.read ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs ${getAvatarColor(index)}`}>
                              {message.fromUser.avatar || getUserInitials(message.fromUser.name)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-medium text-legal-dark-text font-montserrat truncate">
                                  {message.fromUser.name}
                                </p>
                                <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                                  <span className="text-xs text-legal-warm-text font-montserrat">
                                    {formatTimeAgo(message.createdAt)}
                                  </span>
                                  {!message.read && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-legal-warm-text font-montserrat line-clamp-2">
                                {message.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="p-8 text-center">
                          <MessageSquare className="w-12 h-12 text-legal-warm-text mx-auto mb-4" />
                          <p className="text-legal-warm-text font-montserrat">No messages yet</p>
                        </div>
                      )}
                    </div>
                    <div className="p-4 border-t border-legal-border/30">
                      <button 
                        onClick={() => {
                          window.location.href = '/dashboard/messages'
                          closeAllDropdowns()
                        }}
                        className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium font-montserrat"
                      >
                        View all messages
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notifications */}
            <div ref={notificationsRef} className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  closeAllDropdowns()
                  setShowNotifications(!showNotifications)
                  if (!showNotifications) fetchNotifications()
                }}
                className="text-legal-warm-text hover:text-accent-600 transition-colors p-1.5 sm:p-2 rounded-lg hover:bg-legal-bg-secondary/50 relative"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadNotifications > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-montserrat min-w-0 font-bold"
                  >
                    {unreadNotifications > 99 ? '99+' : unreadNotifications}
                  </motion.span>
                )}
              </motion.button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-legal-lg border border-legal-border/30 z-50"
                  >
                    <div className="p-4 border-b border-legal-border/30">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-legal-dark-text font-baskervville">Notifications</h3>
                        <div className="flex items-center space-x-2">
                          {unreadNotifications > 0 && (
                            <span className="text-xs text-red-600 font-montserrat">
                              {unreadNotifications} unread
                            </span>
                          )}
                          {loadingNotifications && (
                            <Loader className="w-3 h-3 text-red-600 animate-spin" />
                          )}
                          <button
                            onClick={() => fetchNotifications()}
                            className="text-red-600 hover:text-red-700 transition-colors"
                            title="Refresh notifications"
                          >
                            <RefreshCw className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="max-h-60 sm:max-h-80 overflow-y-auto">
                      {notifications.length > 0 ? notifications.slice(0, 6).map((notification, index) => (
                        <div
                          key={notification._id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`p-3 sm:p-4 border-b border-legal-border/20 hover:bg-legal-bg-secondary/20 transition-colors cursor-pointer ${
                            !notification.read ? 'bg-red-50/30' : ''
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
                                  <p className="text-sm text-legal-warm-text font-montserrat mt-1 line-clamp-2">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-legal-warm-text font-montserrat mt-2">
                                    {formatTimeAgo(notification.createdAt)}
                                  </p>
                                </div>
                                <div className="ml-2 flex items-center space-x-2 flex-shrink-0">
                                  {notification.relatedUser?.avatar && (
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-semibold text-xs ${getAvatarColor(index)}`}>
                                      {notification.relatedUser.avatar || getUserInitials(notification.relatedUser.name)}
                                    </div>
                                  )}
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="p-8 text-center">
                          <Bell className="w-12 h-12 text-legal-warm-text mx-auto mb-4" />
                          <p className="text-legal-warm-text font-montserrat">No notifications yet</p>
                        </div>
                      )}
                    </div>
                    <div className="p-4 border-t border-legal-border/30">
                      <div className="flex space-x-3">
                        {unreadNotifications > 0 && (
                          <button 
                            onClick={() => markAllNotificationsAsRead()}
                            className="flex-1 text-center text-sm text-accent-600 hover:text-accent-700 font-medium font-montserrat"
                          >
                            Mark all read
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            window.location.href = '/dashboard/notifications'
                            closeAllDropdowns()
                          }}
                          className="flex-1 text-center text-sm text-accent-600 hover:text-accent-700 font-medium font-montserrat"
                        >
                          View all
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Separator */}
            <div className="hidden sm:block h-4 w-px bg-legal-border lg:h-6" />

            {/* Profile dropdown */}
            <div ref={profileRef} className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  closeAllDropdowns()
                  setShowProfile(!showProfile)
                }}
                className="flex items-center space-x-2 sm:space-x-3 text-sm leading-6 text-legal-dark-text hover:text-accent-600 transition-colors p-1 sm:p-2 rounded-lg hover:bg-legal-bg-secondary/50"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-accent-100 to-accent-200 rounded-full flex items-center justify-center relative overflow-hidden">
                  {userProfile?.profilePhoto ? (
                    <Image 
                      src={userProfile.profilePhoto} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-accent-600" />
                  )}
                  {loadingProfile && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <Loader className="w-3 h-3 animate-spin text-accent-600" />
                    </div>
                  )}
                </div>
                <span className="hidden sm:flex sm:items-center">
                  <span className="hidden lg:block text-sm font-semibold leading-6 text-legal-dark-text font-montserrat truncate max-w-24">
                    {getDisplayName()}
                  </span>
                  <ChevronDown className="ml-1 lg:ml-2 h-3 w-3 sm:h-4 sm:w-4 text-legal-warm-text" />
                </span>
              </motion.button>

              <AnimatePresence>
                {showProfile && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-56 sm:w-64 bg-white rounded-xl shadow-legal-lg border border-legal-border/30 z-50"
                  >
                    <div className="p-4 border-b border-legal-border/30">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-accent-100 to-accent-200 rounded-full flex items-center justify-center relative overflow-hidden">
                          {userProfile?.profilePhoto ? (
                            <Image 
                              src={userProfile.profilePhoto} 
                              alt="Profile" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-6 h-6 text-accent-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-legal-dark-text font-montserrat truncate">
                            {getDisplayName()}
                          </p>
                          <p className="text-xs text-legal-warm-text font-montserrat truncate">
                            {userProfile?.email || user?.email}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Shield className={`w-3 h-3 ${userProfile?.isVerified ? 'text-success-500' : 'text-amber-500'}`} />
                            <span className={`text-xs font-montserrat ${userProfile?.isVerified ? 'text-success-600' : 'text-amber-600'}`}>
                              {userProfile?.isVerified ? 'Verified' : 'Pending Verification'}
                            </span>
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
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">Your Profile</div>
                          <div className="text-xs text-legal-warm-text">Manage your profile</div>
                        </div>
                      </a>
                      <a
                        href="/dashboard/earnings"
                        className="flex items-center px-4 py-3 text-sm text-legal-dark-text hover:bg-legal-bg-secondary/50 transition-colors font-montserrat"
                      >
                        <DollarSign className="w-4 h-4 mr-3 text-legal-warm-text" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">Earnings</div>
                          <div className="text-xs text-legal-warm-text">View earnings and payouts</div>
                        </div>
                      </a>
                      <a
                        href="/dashboard/settings"
                        className="flex items-center px-4 py-3 text-sm text-legal-dark-text hover:bg-legal-bg-secondary/50 transition-colors font-montserrat"
                      >
                        <Settings className="w-4 h-4 mr-3 text-legal-warm-text" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">Settings</div>
                          <div className="text-xs text-legal-warm-text">Account preferences</div>
                        </div>
                      </a>

                      {/* Mobile-only theme toggle */}
                      <div className="lg:hidden border-t border-legal-border/30 mt-2 pt-2">
                        <button
                          onClick={() => updateTheme(isDarkMode ? 'light' : 'dark')}
                          className="flex items-center w-full px-4 py-3 text-sm text-legal-dark-text hover:bg-legal-bg-secondary/50 transition-colors font-montserrat"
                        >
                          {isDarkMode ? <Sun className="w-4 h-4 mr-3 text-legal-warm-text" /> : <Moon className="w-4 h-4 mr-3 text-legal-warm-text" />}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">Theme</div>
                            <div className="text-xs text-legal-warm-text">{isDarkMode ? 'Switch to light' : 'Switch to dark'}</div>
                          </div>
                        </button>
                      </div>

                      <a
                        href="/help"
                        className="flex items-center px-4 py-3 text-sm text-legal-dark-text hover:bg-legal-bg-secondary/50 transition-colors font-montserrat"
                      >
                        <HelpCircle className="w-4 h-4 mr-3 text-legal-warm-text" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">Help & Support</div>
                          <div className="text-xs text-legal-warm-text">Get help and support</div>
                        </div>
                      </a>
                    </div>
                    
                    <div className="border-t border-legal-border/30 py-2">
                      <button 
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-montserrat"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">Sign out</div>
                          <div className="text-xs text-red-500">Sign out of your account</div>
                        </div>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Hidden file input for upload */}
        <input
          id="file-upload"
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = e.target.files
            if (files && files.length > 0) {
              // Handle file upload logic here
              console.log('Files selected:', files)
            }
          }}
        />
      </motion.header>

      {/* Live status indicator */}
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        className="fixed top-20 right-4 z-40 hidden xl:block"
      >
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-legal border border-legal-border/30 p-2 flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
          <span className="text-xs text-legal-warm-text font-montserrat">
            Live • Updated {formatTimeAgo(lastFetch.toISOString())}
          </span>
        </div>
      </motion.div>
    </>
  )
}