/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell,
  CheckCircle,
  MoreVertical,
  Calendar,
  DollarSign,
  Star,
  Settings,
  MessageSquare,
  Clock,
  User,
  Trash2,
  Eye,
  RefreshCw,
  Loader,
  Search,
  ChevronDown,
  X
} from 'lucide-react'

interface Notification {
  _id: string
  title: string
  message: string
  type: 'session' | 'payment' | 'reminder' | 'review' | 'system' | 'message'
  read: boolean
  priority: 'low' | 'medium' | 'high'
  relatedUser?: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  actionUrl?: string
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
  readAt?: string
}

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    unread: number
    pages: number
  }
}

interface NotificationPopupProps {
  notification: Notification | null
  isOpen: boolean
  onClose: () => void
  onAction: (url: string) => void
}

const notificationTypes = [
  { value: 'all', label: 'All Notifications', icon: Bell },
  { value: 'session', label: 'Sessions', icon: Calendar },
  { value: 'payment', label: 'Payments', icon: DollarSign },
  { value: 'reminder', label: 'Reminders', icon: Clock },
  { value: 'review', label: 'Reviews', icon: Star },
  { value: 'message', label: 'Messages', icon: MessageSquare },
  { value: 'system', label: 'System', icon: Settings }
]

// Notification Popup Component
const NotificationPopup = ({ notification, isOpen, onClose, onAction }: NotificationPopupProps) => {
  if (!notification) return null

  const getActionText = (type: string) => {
    switch (type) {
      case 'session': return 'View Session'
      case 'payment': return 'View Payment'
      case 'review': return 'View Review'
      case 'message': return 'View Message'
      case 'reminder': return 'View Calendar'
      case 'system': return 'View Settings'
      default: return 'View Details'
    }
  }

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'session': return Calendar
      case 'payment': return DollarSign
      case 'review': return Star
      case 'message': return MessageSquare
      case 'reminder': return Clock
      case 'system': return Settings
      default: return Eye
    }
  }

  const getNotificationIcon = (type: string, priority: string) => {
    const typeConfig = notificationTypes.find(t => t.value === type)
    const IconComponent = typeConfig?.icon || Bell
    
    const colorClass = priority === 'high' ? 'text-red-500' : 
                      priority === 'medium' ? 'text-amber-500' : 
                      'text-blue-500'
    
    return <IconComponent className={`w-6 h-6 ${colorClass}`} />
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

  const ActionIcon = getActionIcon(notification.type)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-warm-200/50 max-w-md w-full max-h-[80vh] overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-legal-border/30 bg-gradient-to-r from-accent-50 to-warm-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {getNotificationIcon(notification.type, notification.priority)}
                    <div>
                      <h3 className="text-lg font-semibold text-legal-dark-text font-baskervville">
                        {notification.title}
                      </h3>
                      <p className="text-sm text-legal-warm-text font-montserrat">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="p-2 text-legal-warm-text hover:text-accent-600 transition-colors rounded-lg hover:bg-legal-bg-secondary/50"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <p className="text-legal-dark-text font-montserrat leading-relaxed mb-4">
                    {notification.message}
                  </p>

                  {/* Additional Info */}
                  {notification.relatedUser && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-legal-bg-secondary/20 rounded-lg p-4 mb-4"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${getAvatarColor(0)}`}>
                          {notification.relatedUser.avatar || notification.relatedUser.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-legal-dark-text font-montserrat">
                            {notification.relatedUser.name}
                          </p>
                          <p className="text-sm text-legal-warm-text font-montserrat">
                            {notification.relatedUser.email}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Metadata */}
                  {notification.metadata && Object.keys(notification.metadata).length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="bg-blue-50 rounded-lg p-4 mb-4"
                    >
                      <h4 className="font-semibold text-blue-900 font-montserrat mb-2">Details</h4>
                      {Object.entries(notification.metadata).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm mb-1">
                          <span className="text-blue-700 font-montserrat capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <span className="text-blue-900 font-montserrat">{String(value)}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {/* Priority Badge */}
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex items-center justify-between mb-6"
                  >
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      notification.priority === 'high' ? 'bg-red-100 text-red-700' :
                      notification.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {(notification.priority ? notification.priority.charAt(0).toUpperCase() + notification.priority.slice(1) : '')} Priority
                    </span>
                    <span className={`text-sm font-montserrat px-2 py-1 rounded-full ${
                      notification.read 
                        ? 'text-success-600 bg-success-50' 
                        : 'text-amber-600 bg-amber-50'
                    }`}>
                      {notification.read ? 'Read' : 'Unread'}
                    </span>
                  </motion.div>
                </motion.div>
              </div>

              {/* Actions */}
              <div className="p-6 border-t border-legal-border/30 bg-gray-50">
                <div className="flex space-x-3">
                  {notification.actionUrl && (
                    <motion.button
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onAction(notification.actionUrl!)}
                      className="flex-1 bg-gradient-to-r from-accent-700 to-accent-600 text-white font-semibold py-3 px-4 rounded-xl shadow-legal hover:shadow-legal-lg transition-all duration-300 font-montserrat flex items-center justify-center space-x-2"
                    >
                      <ActionIcon className="w-4 h-4" />
                      <span>{getActionText(notification.type)}</span>
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="px-6 py-3 border border-legal-border text-legal-dark-text font-semibold rounded-xl hover:bg-legal-bg-secondary/50 transition-all duration-300 font-montserrat"
                  >
                    Close
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedType, setSelectedType] = useState<string>('all')
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [unreadCount, setUnreadCount] = useState(0)
  const [showDropdown, setShowDropdown] = useState<string | null>(null)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [showNotificationPopup, setShowNotificationPopup] = useState(false)

  const notificationTypes = [
    { value: 'all', label: 'All Notifications', icon: Bell },
    { value: 'session', label: 'Sessions', icon: Calendar },
    { value: 'payment', label: 'Payments', icon: DollarSign },
    { value: 'reminder', label: 'Reminders', icon: Clock },
    { value: 'review', label: 'Reviews', icon: Star },
    { value: 'message', label: 'Messages', icon: MessageSquare },
    { value: 'system', label: 'System', icon: Settings }
  ]

  useEffect(() => {
    fetchNotifications(true)
  }, [selectedType, showUnreadOnly, searchQuery])

  const fetchNotifications = async (reset = false) => {
    if (reset) {
      setLoading(true)
      setCurrentPage(1)
    } else {
      setLoadingMore(true)
    }

    try {
      const params = new URLSearchParams({
        page: reset ? '1' : currentPage.toString(),
        limit: '10',
        ...(selectedType !== 'all' && { type: selectedType }),
        ...(showUnreadOnly && { unreadOnly: 'true' }),
        ...(searchQuery && { search: searchQuery })
      })

      const response = await fetch(`/api/notifications?${params}`, {
        credentials: 'include',
        headers: { 'Cache-Control': 'no-cache' }
      })

      if (response.ok) {
        const data: ApiResponse<Notification[]> = await response.json()
        if (data.success) {
          if (reset) {
            setNotifications(data.data)
          } else {
            setNotifications(prev => [...prev, ...data.data])
          }
          setTotalPages(data.pagination?.pages || 1)
          setUnreadCount(data.pagination?.unread || 0)
        }
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchNotifications(true)
  }

  const loadMore = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1)
      fetchNotifications(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        credentials: 'include'
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, read: true, readAt: new Date().toISOString() }
              : notif
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/notifications/mark-all-read', {
        method: 'PATCH',
        credentials: 'include'
      })

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ 
            ...notif, 
            read: true, 
            readAt: new Date().toISOString() 
          }))
        )
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
  console.log('Deleting notification:', notificationId);
  
  try {
    const response = await fetch(`/api/notifications/${notificationId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('Delete response status:', response.status);
    
    const data = await response.json();
    console.log('Delete response data:', data);

    if (response.ok && data.success) {
      // Update local state immediately
      setNotifications(prev => {
        const updated = prev.filter(notif => notif._id !== notificationId);
        console.log('Updated notifications count:', updated.length);
        return updated;
      });
      
      // Update unread count if the deleted notification was unread
      const deletedNotification = notifications.find(n => n._id === notificationId);
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      // Close dropdown
      setShowDropdown(null);
      
      // Show success message (optional)
      console.log('Notification deleted successfully');
      
    } else {
      console.error('Failed to delete notification:', data.message);
      alert('Failed to delete notification: ' + (data.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('Delete notification error:', error);
    alert('Failed to delete notification. Please try again.');
  }
};

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification._id)
    }
    setSelectedNotification(notification)
    setShowNotificationPopup(true)
  }

  const handlePopupAction = (url: string) => {
    setShowNotificationPopup(false)
    setSelectedNotification(null)
    window.location.href = url
  }

  const getNotificationIcon = (type: string, priority: string) => {
    const typeConfig = notificationTypes.find(t => t.value === type)
    const IconComponent = typeConfig?.icon || Bell
    
    const colorClass = priority === 'high' ? 'text-red-500' : 
                      priority === 'medium' ? 'text-amber-500' : 
                      'text-blue-500'
    
    return <IconComponent className={`w-5 h-5 ${colorClass}`} />
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

  const filteredNotifications = notifications.filter(notification => {
    if (searchQuery) {
      return notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             notification.message.toLowerCase().includes(searchQuery.toLowerCase())
    }
    return true
  })

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
            <div className="w-12 h-12 bg-gradient-to-br from-accent-100 to-accent-200 rounded-xl flex items-center justify-center">
              <Bell className="w-6 h-6 text-accent-600" />
            </div>
            <div>
              <h1 className="text-3xl font-baskervville font-bold text-legal-dark-text">
                Notifications
              </h1>
              <p className="text-legal-warm-text font-montserrat">
                Stay updated with your mentoring activities
                {unreadCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700"
                  >
                    {unreadCount} unread
                  </motion.span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-legal-warm-text hover:text-accent-600 transition-colors rounded-lg border border-legal-border hover:bg-legal-bg-secondary/50"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </motion.button>
            
            {unreadCount > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={markAllAsRead}
                className="bg-accent-100 text-accent-700 font-semibold py-2 px-4 rounded-lg hover:bg-accent-200 transition-colors font-montserrat text-sm"
              >
                Mark all read
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="bg-white/95 backdrop-blur-sm rounded-xl shadow-legal border border-warm-200/50 p-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-legal-warm-text" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-legal-border rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
            />
          </div>

          <div className="flex items-center space-x-4">
            {/* Type Filter */}
            <div className="relative">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="appearance-none bg-white border border-legal-border rounded-lg px-4 py-2 pr-8 font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
              >
                {notificationTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-legal-warm-text pointer-events-none" />
            </div>

            {/* Unread Filter */}
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showUnreadOnly}
                onChange={(e) => setShowUnreadOnly(e.target.checked)}
                className="w-4 h-4 text-accent-600 border-legal-border rounded focus:ring-accent-500"
              />
              <span className="text-sm font-montserrat text-legal-dark-text">
                Unread only
              </span>
            </label>
          </div>
        </div>
      </motion.div>

      {/* Notifications List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white/95 backdrop-blur-sm rounded-xl shadow-legal border border-warm-200/50"
      >
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-accent-600 animate-spin" />
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="divide-y divide-legal-border/30">
            {filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`p-6 hover:bg-legal-bg-secondary/20 transition-all duration-300 cursor-pointer relative group ${
                  !notification.read ? 'bg-blue-50/30 border-l-4 border-l-accent-500' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start space-x-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type, notification.priority)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className={`text-sm font-semibold font-montserrat ${
                            !notification.read ? 'text-legal-dark-text' : 'text-legal-warm-text'
                          }`}>
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <motion.div 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-2 h-2 bg-accent-500 rounded-full" 
                            />
                          )}
                        </div>
                        <p className="text-sm text-legal-warm-text font-montserrat mb-2 line-clamp-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center space-x-4 text-xs text-legal-warm-text font-montserrat">
                          <span>{formatTimeAgo(notification.createdAt)}</span>
                          {notification.relatedUser && (
                            <div className="flex items-center space-x-1">
                              <User className="w-3 h-3" />
                              <span>{notification.relatedUser.name}</span>
                            </div>
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            notification.priority === 'high' ? 'bg-red-100 text-red-700' :
                            notification.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {notification.priority}
                          </span>
                        </div>
                      </div>

                      {/* Related User Avatar */}
                      {notification.relatedUser && (
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${getAvatarColor(index)}`}>
                          {notification.relatedUser.avatar || notification.relatedUser.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowDropdown(showDropdown === notification._id ? null : notification._id)
                      }}
                      className="p-1 text-legal-warm-text hover:text-accent-600 transition-colors rounded opacity-0 group-hover:opacity-100"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </motion.button>

                    <AnimatePresence>
                      {showDropdown === notification._id && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-legal-lg border border-legal-border/30 z-50"
                        >
                          <div className="py-1">
                            {!notification.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  markAsRead(notification._id)
                                  setShowDropdown(null)
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-legal-dark-text hover:bg-legal-bg-secondary/50 transition-colors font-montserrat flex items-center space-x-2"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span>Mark as read</span>
                              </button>
                            )}
                            {notification.actionUrl && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  window.location.href = notification.actionUrl!
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-legal-dark-text hover:bg-legal-bg-secondary/50 transition-colors font-montserrat flex items-center space-x-2"
                              >
                                <Eye className="w-4 h-4" />
                                <span>View details</span>
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('Delete button clicked for notification:', notification._id);
                                if (confirm('Are you sure you want to delete this notification?')) {
                                  deleteNotification(notification._id);
                                }
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-montserrat flex items-center space-x-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-16 h-16 bg-legal-bg-secondary/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-legal-warm-text" />
              </div>
              <h3 className="text-lg font-semibold text-legal-dark-text font-baskervville mb-2">
                No notifications found
              </h3>
              <p className="text-legal-warm-text font-montserrat">
                {showUnreadOnly 
                  ? "You're all caught up! No unread notifications."
                  : searchQuery 
                    ? `No notifications match "${searchQuery}"`
                    : "You don't have any notifications yet."
                }
              </p>
            </motion.div>
          </div>
        )}

        {/* Load More Button */}
        {currentPage < totalPages && (
          <div className="p-6 border-t border-legal-border/30">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={loadMore}
              disabled={loadingMore}
              className="w-full bg-legal-bg-secondary/30 hover:bg-legal-bg-secondary/50 text-legal-dark-text font-semibold py-3 px-6 rounded-lg transition-colors font-montserrat flex items-center justify-center space-x-2"
            >
              {loadingMore ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <span>Load more notifications</span>
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </div>
        )}
      </motion.div>

      {/* Notification Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: 'Total', value: notifications.length, icon: Bell, color: 'accent' },
          { label: 'Unread', value: unreadCount, icon: Eye, color: 'red' },
          { label: 'Today', value: notifications.filter(n => new Date(n.createdAt).toDateString() === new Date().toDateString()).length, icon: Clock, color: 'blue' },
          { label: 'This Week', value: notifications.filter(n => new Date(n.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length, icon: Calendar, color: 'green' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
            whileHover={{ scale: 1.05, y: -2 }}
            className="bg-white/95 backdrop-blur-sm rounded-xl shadow-legal border border-warm-200/50 p-4 text-center cursor-pointer"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2 ${
              stat.color === 'accent' ? 'bg-accent-100 text-accent-600' :
              stat.color === 'red' ? 'bg-red-100 text-red-600' :
              stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
              'bg-green-100 text-green-600'
            }`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <p className="text-lg font-bold text-legal-dark-text font-baskervville">
              {stat.value}
            </p>
            <p className="text-xs text-legal-warm-text font-montserrat">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white/95 backdrop-blur-sm rounded-xl shadow-legal border border-warm-200/50 p-6"
      >
        <h3 className="text-lg font-baskervville font-bold text-legal-dark-text mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Settings', href: '/dashboard/settings', icon: Settings },
            { label: 'Calendar', href: '/dashboard/calendar', icon: Calendar },
            { label: 'Sessions', href: '/dashboard/sessions', icon: User },
            { label: 'Messages', href: '/dashboard/messages', icon: MessageSquare }
          ].map((action, index) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = action.href}
              className="flex flex-col items-center p-4 border border-legal-border rounded-lg hover:bg-legal-bg-secondary/20 transition-all duration-300 hover:border-accent-300 hover:shadow-lg"
            >
              <action.icon className="w-6 h-6 text-legal-warm-text mb-2 group-hover:text-accent-600" />
              <span className="text-sm font-montserrat text-legal-dark-text">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Notification Popup */}
      <NotificationPopup
        notification={selectedNotification}
        isOpen={showNotificationPopup}
        onClose={() => {
          setShowNotificationPopup(false)
          setSelectedNotification(null)
        }}
        onAction={handlePopupAction}
      />

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(null)}
        />
      )}
    </div>
  )
}