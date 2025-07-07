'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { 
  ArrowRight,
  Play,
  Star,
  Users,
  Zap,
  GraduationCap,
  TrendingUp,
  Clock
} from 'lucide-react'

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function HeroSection() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoaded, setIsLoaded] = useState(false)
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <section className="relative pt-32 pb-20 overflow-hidden min-h-screen flex items-center" id='hero'>
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          style={{ y }}
          className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-accent-200/30 to-success-200/30 rounded-full blur-3xl"
        />
        <motion.div 
          style={{ y: useTransform(scrollYProgress, [0, 1], ['0%', '-30%']) }}
          className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-br from-warm-300/40 to-accent-300/40 rounded-full blur-3xl"
        />
        <motion.div 
          style={{ y: useTransform(scrollYProgress, [0, 1], ['0%', '20%']) }}
          className="absolute bottom-20 left-1/2 w-80 h-80 bg-gradient-to-br from-legal-gold/20 to-warm-400/20 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-8"
          >
            <motion.div variants={fadeInUp} className="space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 bg-white/80 rounded-full px-4 py-2 text-sm font-medium text-accent-700 border border-accent-200 shadow-warm font-montserrat">
                <Zap className="w-4 h-4" />
                <span>Empowering 10,000+ Students Worldwide</span>
              </div>
              
              {/* Main Headline */}
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-baskervville font-bold leading-tight">
                Share Your Expertise,{' '}
                <span className="gradient-text block lg:inline">Transform Lives</span>
              </h1>
              
              {/* Subtitle */}
              <p className="text-xl lg:text-2xl text-legal-warm-text leading-relaxed max-w-2xl font-montserrat">
                Join our prestigious community of expert mentors and help students achieve their academic dreams. 
                Flexible scheduling, competitive earnings, and meaningful impact.
              </p>

              {/* Key Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div className="flex items-center space-x-2 text-legal-dark-text">
                  <div className="w-2 h-2 bg-success-500 rounded-full"></div>
                  <span className="font-montserrat font-medium text-sm">$30-150/hour</span>
                </div>
                <div className="flex items-center space-x-2 text-legal-dark-text">
                  <div className="w-2 h-2 bg-accent-500 rounded-full"></div>
                  <span className="font-montserrat font-medium text-sm">Flexible Schedule</span>
                </div>
                <div className="flex items-center space-x-2 text-legal-dark-text">
                  <div className="w-2 h-2 bg-warm-600 rounded-full"></div>
                  <span className="font-montserrat font-medium text-sm">Global Students</span>
                </div>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/signup" 
                className="bg-gradient-to-r from-accent-700 to-accent-600 text-white font-semibold py-4 px-8 rounded-xl shadow-legal-lg hover:shadow-legal-xl transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2 text-lg font-montserrat group"
              >
                <span>Start Mentoring Today</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <button className="bg-white/90 text-accent-700 font-semibold py-4 px-8 rounded-xl border border-accent-200 shadow-warm hover:shadow-warm-lg transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2 text-lg font-montserrat group">
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Watch Demo</span>
              </button>
            </motion.div>

            {/* Social Proof */}
            <motion.div variants={fadeInUp} className="flex items-center space-x-8 pt-4">
              <div className="flex items-center space-x-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                  ))}
                </div>
                <span className="text-legal-warm-text font-medium font-montserrat text-sm">4.9/5 Rating</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-accent-600" />
                <span className="text-legal-warm-text font-medium font-montserrat text-sm">500+ Active Mentors</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Content - Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative">
              {/* Main visual container */}
              <div className="relative w-full h-[600px] rounded-3xl overflow-hidden shadow-legal-xl bg-gradient-to-br from-legal-bg-secondary to-warm-200 border border-legal-border/30">
                <div className="absolute inset-0 bg-gradient-to-tr from-accent-900/10 to-transparent" />
                
                {/* Central Illustration */}
                <div className="flex items-center justify-center h-full relative">
                  <div className="text-center text-legal-dark-text space-y-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                    >
                      <GraduationCap className="w-32 h-32 mx-auto text-accent-600" />
                    </motion.div>
                    
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                      className="space-y-2"
                    >
                      <h3 className="text-3xl font-baskervville font-bold">Expert Mentoring Platform</h3>
                      <p className="text-legal-warm-text font-montserrat text-lg">Connecting knowledge with ambition</p>
                    </motion.div>

                    {/* Floating elements around the main illustration */}
                    <motion.div className="absolute top-16 left-16 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-legal">
                      <div className="text-accent-600">
                        <Users className="w-6 h-6" />
                      </div>
                    </motion.div>

                    <motion.div className="absolute top-16 right-16 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-legal">
                      <div className="text-success-600">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                    </motion.div>

                    <motion.div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-legal">
                      <div className="text-warm-600">
                        <Clock className="w-6 h-6" />
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Floating stats cards */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="absolute -top-6 -right-6 bg-white/95 backdrop-blur-sm rounded-2xl shadow-legal-lg border border-warm-200/50 p-6 max-w-xs floating-element"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-success-500 to-success-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-legal-dark-text font-baskervville">95%</p>
                    <p className="text-sm text-legal-warm-text font-montserrat">Success Rate</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-sm rounded-2xl shadow-legal-lg border border-warm-200/50 p-6 max-w-xs floating-element"
                style={{ animationDelay: '2s' }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-legal-dark-text font-baskervville">24/7</p>
                    <p className="text-sm text-legal-warm-text font-montserrat">Flexible Hours</p>
                  </div>
                </div>
              </motion.div>

              {/* Additional floating element */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="absolute top-1/2 -left-12 transform -translate-y-1/2 bg-white/95 backdrop-blur-sm rounded-2xl shadow-legal-lg border border-warm-200/50 p-4 floating-element"
                style={{ animationDelay: '4s' }}
              >
                <div className="text-center">
                  <div className="w-10 h-10 bg-gradient-to-br from-warm-500 to-warm-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold text-sm font-baskervville">$150</span>
                  </div>
                  <p className="text-xs text-legal-warm-text font-montserrat">Per Hour</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}