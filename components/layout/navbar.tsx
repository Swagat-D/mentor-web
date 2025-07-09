'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Scale, Menu, X } from 'lucide-react'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { 
      name: 'Hero', 
      href: '#hero',
      description: 'Mentor experiences'
    },
    { 
      name: 'Features', 
      href: '#features',
      description: 'Platform capabilities'
    },
    { 
      name: 'How it Works', 
      href: '#how-it-works',
      description: 'Simple 3-step process'
    },
    { 
      name: 'Connect', 
      href: '#footer',
      description: 'Get in touch'
    }
  ]

  const smoothScroll = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setIsMenuOpen(false)
    }
  }

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'glass-effect backdrop-blur-md border-b border-legal-border/50 shadow-legal-lg' 
          : 'glass-effect backdrop-blur-sm border-b border-legal-border/30'
      }`}
    >
      <nav className="container mx-auto px-4 sm:px-6 py-3 lg:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div 
            className="flex items-center space-x-2 sm:space-x-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-accent-700 to-accent-600 rounded-xl flex items-center justify-center shadow-legal">
              <Scale className="text-white font-bold text-lg w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <Link href="/" className="text-xl sm:text-2xl font-baskervville font-bold gradient-text">
              MentorMatch
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <button 
                  onClick={() => smoothScroll(item.href)}
                  className="text-legal-warm-text hover:text-accent-600 transition-colors font-medium font-montserrat relative group py-2"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-600 transition-all duration-300 group-hover:w-full"></span>
                </button>
              </motion.div>
            ))}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <Link 
              href="/login" 
              className="text-legal-warm-text hover:text-accent-600 transition-colors font-medium font-montserrat px-4 py-2 rounded-lg hover:bg-legal-bg-secondary/50"
            >
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className="bg-gradient-to-r from-accent-700 to-accent-600 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-xl shadow-legal-lg hover:shadow-legal-xl transition-all duration-300 hover:scale-105 font-montserrat"
            >
              Join as Mentor
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-legal-warm-text hover:text-accent-600 transition-colors p-2 rounded-lg hover:bg-legal-bg-secondary/50"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              ) : (
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={isMenuOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:hidden overflow-hidden"
        >
          <div className="py-4 sm:py-6 border-t border-legal-border/30 mt-4">
            <div className="space-y-3 sm:space-y-4">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isMenuOpen ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <button 
                    onClick={() => smoothScroll(item.href)}
                    className="block w-full text-left text-legal-warm-text hover:text-accent-600 transition-colors font-medium font-montserrat py-2 px-4 rounded-lg hover:bg-legal-bg-secondary/50"
                  >
                    <div>
                      <div className="font-semibold text-sm sm:text-base">{item.name}</div>
                      <div className="text-xs sm:text-sm text-legal-secondary">{item.description}</div>
                    </div>
                  </button>
                </motion.div>
              ))}
              
              <hr className="border-legal-border/30 my-4" />
              
              <div className="space-y-3 px-4">
                <Link 
                  href="/login" 
                  className="block text-legal-warm-text hover:text-accent-600 transition-colors font-medium font-montserrat py-2 rounded-lg hover:bg-legal-bg-secondary/50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link 
                  href="/signup" 
                  className="block bg-gradient-to-r from-accent-700 to-accent-600 text-white font-semibold py-3 px-6 rounded-xl shadow-legal-lg hover:shadow-legal-xl transition-all duration-300 text-center font-montserrat"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Join as Mentor
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </nav>
    </motion.header>
  )
}