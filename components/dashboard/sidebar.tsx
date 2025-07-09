'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
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
  X
} from 'lucide-react'

interface SidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

const navigation = [
  {
    name: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
    current: true,
    badge: null
  },
  {
    name: 'Students',
    href: '/dashboard/students',
    icon: Users,
    current: false,
    badge: '12'
  },
  {
    name: 'Calendar',
    href: '/dashboard/calendar',
    icon: Calendar,
    current: false,
    badge: null
  },
  {
    name: 'Sessions',
    href: '/dashboard/sessions',
    icon: BookOpen,
    current: false,
    badge: '3'
  },
  {
    name: 'Earnings',
    href: '/dashboard/earnings',
    icon: DollarSign,
    current: false,
    badge: null
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
    current: false,
    badge: null
  },
  {
    name: 'Reviews',
    href: '/dashboard/reviews',
    icon: Star,
    current: false,
    badge: '2'
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
  const pathname = usePathname()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  const sidebarVariants: import("framer-motion").Variants = {
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
        delay: i * 0.1,
        duration: 0.3
      }
    })
  }

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

          {/* Primary Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item, index) => {
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
                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                  isActive 
                                    ? 'bg-white/20 text-white' 
                                    : 'bg-accent-100 text-accent-700'
                                }`}>
                                  {item.badge}
                                </span>
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
                        custom={index + navigation.length}
                        initial="hidden"
                        animate="visible"
                        variants={itemVariants}
                      >
                        <Link
                          href={item.href}
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
                    <div className="w-10 h-10 bg-gradient-to-br from-accent-100 to-accent-200 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-accent-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-legal-dark-text font-montserrat">John Doe</p>
                      <p className="text-xs text-legal-warm-text font-montserrat">Mathematics Mentor</p>
                    </div>
                  </div>
                  <button
                    onClick={async () =>{
                      try {
                        await fetch('api/auth/logout', {
                          method: 'post',
                          credentials: 'include',
                        });
                        window.location.href = '/';
                      }catch(error){
                        console.error('Logout failed', error);
                      }
                    }}
                      className='w-full flex items-center gap-x-2 text-sm text-legal-warm-text hover:text-red-600 transition-colors font-montserrat'
                    >
                      <LogOut className='w-4 h-4' />
                      Sign out
                  </button>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
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
                  <Link href="/dashboard" className="text-2xl font-baskervville font-bold gradient-text">
                    MentorMatch
                  </Link>
                </motion.div>

                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-legal-warm-text hover:text-accent-600 transition-colors p-2 rounded-lg hover:bg-legal-bg-secondary/50"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Mobile Navigation - Same as desktop */}
              <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                  <li>
                    <ul role="list" className="-mx-2 space-y-1">
                      {navigation.map((item, index) => {
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
                              onClick={() => setSidebarOpen(false)}
                              className={`group flex gap-x-3 rounded-xl p-3 text-sm leading-6 font-semibold transition-all duration-200 ${
                                isActive
                                  ? 'bg-gradient-to-r from-accent-700 to-accent-600 text-white shadow-legal-lg'
                                  : 'text-legal-warm-text hover:text-accent-600 hover:bg-accent-50'
                              }`}
                            >
                              <item.icon
                                className={`h-6 w-6 shrink-0 ${
                                  isActive ? 'text-white' : 'text-legal-warm-text group-hover:text-accent-600'
                                }`}
                              />
                              <span className="font-montserrat">{item.name}</span>
                              {item.badge && (
                                <span className={`ml-auto inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                  isActive 
                                    ? 'bg-white/20 text-white' 
                                    : 'bg-accent-100 text-accent-700'
                                }`}>
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          </motion.li>
                        )
                      })}
                    </ul>
                  </li>

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
                            custom={index + navigation.length}
                            initial="hidden"
                            animate="visible"
                            variants={itemVariants}
                          >
                            <Link
                              href={item.href}
                              onClick={() => setSidebarOpen(false)}
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

                  <li className="mt-auto">
                    <div className="bg-legal-bg-secondary/30 rounded-xl p-4 border border-legal-border/50">
                      <div className="flex items-center gap-x-3 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-accent-100 to-accent-200 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-accent-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-legal-dark-text font-montserrat">John Doe</p>
                          <p className="text-xs text-legal-warm-text font-montserrat">Mathematics Mentor</p>
                        </div>
                      </div>
                      <button className="w-full flex items-center gap-x-2 text-sm text-legal-warm-text hover:text-red-600 transition-colors font-montserrat">
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  </li>
                </ul>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}