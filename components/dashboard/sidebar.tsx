'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/context/AuthContext'
import { 
  Scale,
  LayoutDashboard,
  Users,
  Calendar,
  BookOpen,
  DollarSign,
  BarChart3,
  Star,
  Settings,
  User,
  ChevronRight,
  LogOut,
  Bell,
  HelpCircle,
  X,
  Loader,
  Shield
} from 'lucide-react'
import Image from 'next/image'

interface SidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

interface UserProfile {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: string
  profilePhoto?: string
  isVerified: boolean
}

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number | null
  count?: number
}

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

const navigation: NavigationItem[] = [
  {
    name: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
    badge: null
  },
  {
    name: 'Students',
    href: '/dashboard/students',
    icon: Users,
    badge: null
  },
  {
    name: 'Calendar',
    href: '/dashboard/calendar',
    icon: Calendar,
    badge: null
  },
  {
    name: 'Sessions',
    href: '/dashboard/sessions',
    icon: BookOpen,
    badge: null
  },
  {
    name: 'Earnings',
    href: '/dashboard/earnings',
    icon: DollarSign,
    badge: null
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
    badge: null
  },
  {
    name: 'Reviews',
    href: '/dashboard/reviews',
    icon: Star,
    badge: null
  }
]

const secondaryNavigation = [
  {
    name: 'Profile Settings',
    href: '/dashboard/profile',
    icon: User
  },
  {
    name: 'Notifications',
    href: '/dashboard/notifications',
    icon: Bell
  },
  {
    name: 'Help & Support',
    href: '/dashboard/help',
    icon: HelpCircle
  },
  {
    name: 'Settings',
    href: '/dashboard/settings',
    icon: Settings
  }
]

export default function DashboardSidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const { user } = useAuth()
  const pathname = usePathname()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [navigationData, setNavigationData] = useState(navigation)
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [loadingCounts, setLoadingCounts] = useState(false)

  // Fetch user profile and navigation counts
  useEffect(() => {
    fetchUserProfile()
    fetchNavigationCounts()
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
          isVerified: user.isVerified || false
        })
      }
    } finally {
      setLoadingProfile(false)
    }
  }

  const fetchNavigationCounts = async () => {
    setLoadingCounts(true)
    try {
      const response = await fetch('/api/dashboard/navigation-counts', { 
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      
      if (response.ok) {
        const data: ApiResponse<{
          students: number
          upcomingSessions: number
          unreadReviews: number
          pendingNotifications: number
        }> = await response.json()
        
        if (data.success) {
          const counts = data.data
          setNavigationData(prev => prev.map(item => {
            switch (item.href) {
              case '/dashboard/students':
                return { ...item, badge: counts.students > 0 ? counts.students : null }
              case '/dashboard/sessions':
                return { ...item, badge: counts.upcomingSessions > 0 ? counts.upcomingSessions : null }
              case '/dashboard/reviews':
                return { ...item, badge: counts.unreadReviews > 0 ? counts.unreadReviews : null }
              default:
                return item
            }
          }))
        }
      }
    } catch (error) {
      console.error('Failed to fetch navigation counts:', error)
    } finally {
      setLoadingCounts(false)
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

  const getDisplayName = () => {
    if (userProfile) {
      return `${userProfile.firstName} ${userProfile.lastName}`.trim() || userProfile.email.split('@')[0]
    }
    return user?.email?.split('@')[0] || 'User'
  }

  const getDisplayRole = () => {
    if (userProfile?.role === 'mentor') {
      return 'Mathematics Mentor'
    }
    return 'Student'
  }

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3
      }
    })
  }

  const renderNavigation = (isMobile = false) => (
    <nav className="flex flex-1 flex-col">
      <ul role="list" className="flex flex-1 flex-col gap-y-7">
        <li>
          <ul role="list" className="-mx-2 space-y-1">
            {navigationData.map((item, index) => {
              const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard')
              
              return (
                <motion.li 
                  key={item.name}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={itemVariants}
                >
                  <Link
                    href={item.href}
                    onClick={() => isMobile && setSidebarOpen(false)}
                    onMouseEnter={() => setHoveredItem(item.name)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`group flex gap-x-3 rounded-xl p-3 text-sm leading-6 font-semibold transition-all duration-200 relative overflow-hidden ${
                      isActive
                        ? 'bg-gradient-to-r from-accent-700 to-accent-600 text-white shadow-legal-lg'
                        : 'text-legal-warm-text hover:text-accent-600 hover:bg-accent-50'
                    }`}
                  >
                    {/* Background effect for hover */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-accent-100 to-accent-50 rounded-xl"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ 
                        opacity: hoveredItem === item.name && !isActive ? 1 : 0,
                        scale: hoveredItem === item.name && !isActive ? 1 : 0.8
                      }}
                      transition={{ duration: 0.2 }}
                    />
                    
                    <div className="relative z-10 flex items-center gap-x-3 w-full">
                      <item.icon
                        className={`h-6 w-6 shrink-0 transition-colors ${
                          isActive ? 'text-white' : 'text-legal-warm-text group-hover:text-accent-600'
                        }`}
                      />
                      <span className="font-montserrat">{item.name}</span>
                      
                      <div className="ml-auto flex items-center space-x-2">
                        {item.badge && (
                          <motion.span 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              isActive 
                                ? 'bg-white/20 text-white' 
                                : 'bg-accent-100 text-accent-700'
                            }`}
                          >
                            {item.badge}
                          </motion.span>
                        )}
                        
                        <ChevronRight 
                          className={`h-4 w-4 transition-transform ${
                            isActive ? 'text-white rotate-90' : 'text-transparent group-hover:text-accent-400'
                          }`} 
                        />
                      </div>
                    </div>
                  </Link>
                </motion.li>
              )
            })}
          </ul>
        </li>

        {/* Secondary Navigation */}
        <li>
          <div className="text-xs font-semibold leading-6 text-legal-warm-text font-montserrat mb-4 px-3">
            Account
          </div>
          <ul role="list" className="-mx-2 space-y-1">
            {secondaryNavigation.map((item, index) => {
              const isActive = pathname === item.href
              
              return (
                <motion.li 
                  key={item.name}
                  custom={index + navigationData.length}
                  initial="hidden"
                  animate="visible"
                  variants={itemVariants}
                >
                  <Link
                    href={item.href}
                    onClick={() => isMobile && setSidebarOpen(false)}
                    className={`group flex gap-x-3 rounded-xl p-3 text-sm leading-6 font-semibold transition-all duration-200 font-montserrat ${
                      isActive
                        ? 'bg-accent-100 text-accent-700'
                        : 'text-legal-warm-text hover:text-accent-600 hover:bg-accent-50'
                    }`}
                  >
                    <item.icon
                      className={`h-5 w-5 shrink-0 ${
                        isActive ? 'text-accent-600' : 'text-legal-warm-text group-hover:text-accent-600'
                      }`}
                    />
                    {item.name}
                  </Link>
                </motion.li>
              )
            })}
          </ul>
        </li>

        {/* User Profile & Logout */}
        <li className="mt-auto">
          <div className="bg-legal-bg-secondary/30 rounded-xl p-4 border border-legal-border/50">
            <div className="flex items-center gap-x-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-100 to-accent-200 rounded-full flex items-center justify-center relative overflow-hidden">
                {userProfile?.profilePhoto ? (
                  <Image
                    src={userProfile.profilePhoto} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-accent-600" />
                )}
                {loadingProfile && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <Loader className="w-3 h-3 animate-spin text-accent-600" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-legal-dark-text font-montserrat truncate">
                  {getDisplayName()}
                </p>
                <p className="text-xs text-legal-warm-text font-montserrat truncate">
                  {getDisplayRole()}
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  <Shield className={`w-3 h-3 ${userProfile?.isVerified ? 'text-success-500' : 'text-amber-500'}`} />
                  <span className={`text-xs font-montserrat ${userProfile?.isVerified ? 'text-success-600' : 'text-amber-600'}`}>
                    {userProfile?.isVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="w-full flex items-center gap-x-2 text-sm text-legal-warm-text hover:text-red-600 transition-colors font-montserrat justify-center py-2 px-3 rounded-lg hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </motion.button>
          </div>
        </li>
      </ul>
    </nav>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white/95 backdrop-blur-md border-r border-legal-border/30 px-6 pb-4">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center">
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-accent-700 to-accent-600 rounded-xl flex items-center justify-center shadow-legal">
                <Scale className="text-white font-bold text-lg w-6 h-6" />
              </div>
              <Link href="/dashboard" className="text-2xl font-baskervville font-bold gradient-text">
                MentorMatch
              </Link>
            </motion.div>
          </div>

          {renderNavigation(false)}
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            
            {/* Sidebar */}
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={sidebarVariants}
              className="lg:hidden fixed inset-y-0 z-50 flex w-72 flex-col"
            >
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white/95 backdrop-blur-md border-r border-legal-border/30 px-6 pb-4">
                {/* Mobile Header */}
                <div className="flex h-16 shrink-0 items-center justify-between">
                  <motion.div 
                    className="flex items-center space-x-3"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-accent-700 to-accent-600 rounded-xl flex items-center justify-center shadow-legal">
                      <Scale className="text-white font-bold text-lg w-6 h-6" />
                    </div>
                    <Link 
                      href="/dashboard" 
                      onClick={() => setSidebarOpen(false)}
                      className="text-2xl font-baskervville font-bold gradient-text"
                    >
                      MentorMatch
                    </Link>
                  </motion.div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSidebarOpen(false)}
                    className="text-legal-warm-text hover:text-accent-600 transition-colors p-2 rounded-lg hover:bg-legal-bg-secondary/50"
                  >
                    <X className="h-6 w-6" />
                  </motion.button>
                </div>

                {renderNavigation(true)}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Loading overlay for counts */}
      {loadingCounts && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed bottom-4 right-4 z-40 bg-white/95 backdrop-blur-sm rounded-lg shadow-legal border border-legal-border/30 p-3 flex items-center space-x-2"
        >
          <Loader className="w-4 h-4 animate-spin text-accent-600" />
          <span className="text-sm text-legal-warm-text font-montserrat">Updating...</span>
        </motion.div>
      )}
    </>
  )
}