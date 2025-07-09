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
  Clock,
  X,
  Video,
  BookOpen,
  Award,
  UserCheck,
  DollarSign,
  Trophy
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
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [activeMetric, setActiveMetric] = useState(0)
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])

  const metrics = [
    { number: "10,000+", label: "Students Helped", icon: Users, color: "from-accent-500 to-accent-600" },
    { number: "500+", label: "Expert Mentors", icon: UserCheck, color: "from-warm-500 to-warm-600" },
    { number: "$150", label: "Per Hour Max", icon: DollarSign, color: "from-legal-gold to-accent-500" },
    { number: "95%", label: "Success Rate", icon: Award, color: "from-success-500 to-success-600" }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveMetric((prev) => (prev + 1) % metrics.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [metrics.length])

  return (
    <section className="relative pt-20 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 overflow-hidden min-h-screen flex items-center" id='hero'>
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          style={{ y }}
          className="absolute top-20 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-gradient-to-br from-accent-200/30 to-warm-200/30 rounded-full blur-3xl"
        />
        <motion.div 
          style={{ y: useTransform(scrollYProgress, [0, 1], ['0%', '-30%']) }}
          className="absolute top-40 right-10 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-br from-warm-300/40 to-accent-300/40 rounded-full blur-3xl"
        />
        <motion.div 
          style={{ y: useTransform(scrollYProgress, [0, 1], ['0%', '20%']) }}
          className="absolute bottom-20 left-1/2 w-48 sm:w-80 h-48 sm:h-80 bg-gradient-to-br from-legal-gold/20 to-warm-400/20 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-6 sm:space-y-8 text-center lg:text-left"
          >
            <motion.div variants={fadeInUp} className="space-y-4 sm:space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center space-x-2 bg-white/80 rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-accent-700 border border-accent-200 shadow-warm font-montserrat">
                <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Empowering 10,000+ Students Worldwide</span>
              </div>
              
              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-baskervville font-bold leading-tight">
                Share Your Expertise,{' '}
                <span className="gradient-text block lg:inline">Transform Lives</span>
              </h1>
              
              {/* Subtitle */}
              <p className="text-lg sm:text-xl lg:text-2xl text-legal-warm-text leading-relaxed max-w-2xl mx-auto lg:mx-0 font-montserrat">
                Join our prestigious community of expert mentors and help students achieve their academic dreams. 
                Flexible scheduling, competitive earnings, and meaningful impact.
              </p>

              {/* Key Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-4">
                <div className="flex items-center justify-center lg:justify-start space-x-2 text-legal-dark-text">
                  <div className="w-2 h-2 bg-success-500 rounded-full floating-element"></div>
                  <span className="font-montserrat font-medium text-sm sm:text-base">$30-150/hour</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start space-x-2 text-legal-dark-text">
                  <div className="w-2 h-2 bg-accent-500 rounded-full floating-element" style={{animationDelay: '1s'}}></div>
                  <span className="font-montserrat font-medium text-sm sm:text-base">Flexible Schedule</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start space-x-2 text-legal-dark-text">
                  <div className="w-2 h-2 bg-warm-600 rounded-full floating-element" style={{animationDelay: '2s'}}></div>
                  <span className="font-montserrat font-medium text-sm sm:text-base">Global Students</span>
                </div>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <Link 
                href="/signup" 
                className="bg-gradient-to-r from-accent-700 to-accent-600 text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-xl shadow-legal-lg hover:shadow-legal-xl transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2 text-base sm:text-lg font-montserrat group"
              >
                <span>Start Mentoring Today</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <button 
                onClick={() => setIsVideoModalOpen(true)}
                className="bg-white/90 text-accent-700 font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-xl border border-accent-200 shadow-warm hover:shadow-warm-lg transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2 text-base sm:text-lg font-montserrat group"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
                <span>Watch Demo</span>
              </button>
            </motion.div>

            {/* Social Proof */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-8 pt-4">
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

          {/* Right Content - Enhanced Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative mt-8 lg:mt-0"
          >
            <div className="relative">
              {/* Main visual container */}
              <div className="relative w-full h-80 sm:h-96 md:h-[500px] lg:h-[600px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-legal-xl bg-gradient-to-br from-legal-bg-secondary to-warm-200 border border-legal-border/30">
                <div className="absolute inset-0 bg-gradient-to-tr from-accent-900/10 to-transparent" />
                
                {/* Central Mentoring Connection Animation */}
                <div className="flex items-center justify-center h-full relative px-4 sm:px-6">
                  
                  {/* Mentor Avatar (Left) */}
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="absolute left-4 sm:left-8 md:left-12 lg:left-16 top-1/2 transform -translate-y-1/2"
                  >
                    <div className="relative">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full border-2 sm:border-3 md:border-4 border-accent-500 shadow-legal-lg overflow-hidden bg-gradient-to-br from-accent-100 to-accent-200">
                        <div className="w-full h-full bg-gradient-to-br from-accent-600 to-accent-700 flex items-center justify-center">
                          <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
                        </div>
                      </div>
                      {/* Mentor badge */}
                      <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-gradient-to-br from-legal-gold to-accent-500 rounded-full flex items-center justify-center border-1 sm:border-2 border-white">
                        <Award className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-white" />
                      </div>
                      {/* Mentor label */}
                      <div className="absolute -bottom-6 sm:-bottom-8 left-1/2 transform -translate-x-1/2 text-center">
                        <p className="text-xs sm:text-xs font-semibold text-accent-700 font-montserrat whitespace-nowrap">Expert</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Student Avatar (Right) */}
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7, duration: 0.8 }}
                    className="absolute right-4 sm:right-8 md:right-12 lg:right-16 top-1/2 transform -translate-y-1/2"
                  >
                    <div className="relative">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full border-2 sm:border-3 md:border-4 border-warm-500 shadow-legal-lg overflow-hidden bg-gradient-to-br from-warm-100 to-warm-200">
                        <div className="w-full h-full bg-gradient-to-br from-warm-500 to-warm-600 flex items-center justify-center">
                          <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
                        </div>
                      </div>
                      {/* Student badge */}
                      <div className="absolute -bottom-0.5 -right-0.5 sm:-bottom-1 sm:-right-1 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-gradient-to-br from-success-500 to-success-600 rounded-full flex items-center justify-center border-1 sm:border-2 border-white">
                        <Users className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 text-white" />
                      </div>
                      {/* Student label */}
                      <div className="absolute -bottom-6 sm:-bottom-8 left-1/2 transform -translate-x-1/2 text-center">
                        <p className="text-xs sm:text-xs font-semibold text-warm-700 font-montserrat whitespace-nowrap">Student</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Central Connection Hub */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1, duration: 0.6 }}
                    className="relative z-10"
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-legal-gold/20 to-accent-200/30 rounded-full flex items-center justify-center border-2 border-legal-gold/50 shadow-legal backdrop-blur-sm">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gradient-to-br from-legal-gold to-accent-600 rounded-full flex items-center justify-center shadow-lg">
                        <Zap className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
                      </div>
                    </div>
                    
                    {/* Platform name */}
                    <div className="absolute -bottom-8 sm:-bottom-10 left-1/2 transform -translate-x-1/2 text-center">
                      <p className="text-xs sm:text-sm font-bold text-legal-dark-text font-baskervville whitespace-nowrap">MentorMatch</p>
                    </div>
                  </motion.div>

                  {/* Animated Connection Lines - Mobile Optimized */}
                  <div className="absolute inset-0 pointer-events-none">
                    <svg className="w-full h-full" viewBox="0 0 320 240">
                      <defs>
                        <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" style={{stopColor: '#8B4513', stopOpacity: 0.8}} />
                          <stop offset="50%" style={{stopColor: '#D4AF37', stopOpacity: 1}} />
                          <stop offset="100%" style={{stopColor: '#8B4513', stopOpacity: 0.8}} />
                        </linearGradient>
                      </defs>
                      
                      {/* Mentor to Platform connection */}
                      <motion.path 
                        d="M 60 120 Q 120 100 160 120" 
                        stroke="url(#connectionGradient)" 
                        strokeWidth="2" 
                        fill="none" 
                        strokeDasharray="4,4"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.5, delay: 1.2, repeat: Infinity, repeatType: "reverse", repeatDelay: 2 }}
                      />
                      
                      {/* Platform to Student connection */}
                      <motion.path 
                        d="M 160 120 Q 200 100 260 120" 
                        stroke="url(#connectionGradient)" 
                        strokeWidth="2" 
                        fill="none" 
                        strokeDasharray="4,4"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.5, delay: 1.8, repeat: Infinity, repeatType: "reverse", repeatDelay: 2 }}
                      />
                      
                      {/* Knowledge transfer particles */}
                      <motion.circle
                        cx="0"
                        cy="0"
                        r="2"
                        fill="#D4AF37"
                        initial={{ opacity: 0 }}
                        animate={{ 
                          opacity: [0, 1, 0],
                          cx: [60, 160],
                          cy: [120, 120]
                        }}
                        transition={{ 
                          duration: 2, 
                          delay: 2.5, 
                          repeat: Infinity, 
                          repeatDelay: 3,
                          ease: "easeInOut"
                        }}
                      />
                      
                      <motion.circle
                        cx="0"
                        cy="0"
                        r="2"
                        fill="#8B4513"
                        initial={{ opacity: 0 }}
                        animate={{ 
                          opacity: [0, 1, 0],
                          cx: [160, 260],
                          cy: [120, 120]
                        }}
                        transition={{ 
                          duration: 2, 
                          delay: 3, 
                          repeat: Infinity, 
                          repeatDelay: 3,
                          ease: "easeInOut"
                        }}
                      />
                    </svg>
                  </div>

                  {/* Floating Money/Success Indicators - Mobile Optimized */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ 
                      opacity: [0, 1, 0],
                      y: [10, -10, -20]
                    }}
                    transition={{ 
                      duration: 3, 
                      delay: 4, 
                      repeat: Infinity, 
                      repeatDelay: 4
                    }}
                    className="absolute top-4 sm:top-6 md:top-8 lg:top-12 left-1/2 transform -translate-x-1/2"
                  >
                    <div className="bg-gradient-to-br from-success-500 to-success-600 text-white px-2 sm:px-3 py-1 rounded-full shadow-lg flex items-center space-x-1">
                      <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="text-xs sm:text-sm font-semibold font-montserrat">150</span>
                    </div>
                  </motion.div>

                  {/* Success Indicator - Mobile Optimized */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: [0, 1, 0],
                      scale: [0, 1.1, 0]
                    }}
                    transition={{ 
                      duration: 2, 
                      delay: 5.5, 
                      repeat: Infinity, 
                      repeatDelay: 5
                    }}
                    className="absolute bottom-4 sm:bottom-6 md:bottom-8 lg:bottom-12 left-1/2 transform -translate-x-1/2"
                  >
                    <div className="bg-gradient-to-br from-accent-600 to-accent-700 text-white px-2 sm:px-3 md:px-4 py-1 sm:py-2 rounded-full shadow-lg flex items-center space-x-1 sm:space-x-2">
                      <Trophy className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                      <span className="text-xs sm:text-sm font-semibold font-montserrat">Success!</span>
                    </div>
                  </motion.div>

                  {/* Title and Description - Mobile Optimized */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5, duration: 0.8 }}
                    className="absolute bottom-10 sm:bottom-14 md:bottom-16 lg:bottom-20 left-1/2 transform -translate-x-1/2 text-center px-2 hidden sm:block"
                  >
                    <h3 className="text-lg sm:text-xl md:text-2xl font-baskervville font-bold text-legal-dark-text mb-1 sm:mb-2">
                      Connect, Teach, Earn
                    </h3>
                    <p className="text-legal-warm-text font-montserrat text-xs sm:text-sm md:text-base">
                      Share expertise • Transform lives • Build income
                    </p>
                  </motion.div>
                </div>
              </div>

              {/* Floating Metric Cards */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="absolute -top-4 sm:-top-6 -right-4 sm:-right-6 bg-white/95 backdrop-blur-sm rounded-2xl shadow-legal-lg border border-warm-200/50 p-4 sm:p-6 max-w-xs floating-element"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${metrics[activeMetric].color} rounded-xl flex items-center justify-center`}>
                    {(() => {
                      const Icon = metrics[activeMetric].icon;
                      return <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />;
                    })()}
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-legal-dark-text font-baskervville">{metrics[activeMetric].number}</p>
                    <p className="text-xs sm:text-sm text-legal-warm-text font-montserrat">{metrics[activeMetric].label}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="absolute -bottom-4 sm:-bottom-6 -left-4 sm:-left-6 bg-white/95 backdrop-blur-sm rounded-2xl shadow-legal-lg border border-warm-200/50 p-4 sm:p-6 max-w-xs floating-element"
                style={{ animationDelay: '2s' }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-legal-dark-text font-baskervville">24/7</p>
                    <p className="text-xs sm:text-sm text-legal-warm-text font-montserrat">Flexible Hours</p>
                  </div>
                </div>
              </motion.div>

              {/* Additional side element */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="absolute top-1/2 -left-8 sm:-left-12 transform -translate-y-1/2 bg-white/95 backdrop-blur-sm rounded-2xl shadow-legal-lg border border-warm-200/50 p-3 sm:p-4 floating-element"
                style={{ animationDelay: '4s' }}
              >
                <div className="text-center">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-warm-500 to-warm-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-white font-bold text-xs sm:text-sm font-baskervville">95%</span>
                  </div>
                  <p className="text-xs text-legal-warm-text font-montserrat">Success</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Video Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-legal-dark-text font-baskervville">Platform Demo</h3>
              <button 
                onClick={() => setIsVideoModalOpen(false)}
                className="p-2 hover:bg-legal-bg-secondary rounded-lg transition-colors"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
            <div className="aspect-video bg-legal-bg-secondary rounded-xl flex items-center justify-center">
              <div className="text-center">
                <Video className="w-12 h-12 sm:w-16 sm:h-16 text-legal-warm-text mx-auto mb-4" />
                <p className="text-legal-warm-text font-montserrat">Demo video would play here</p>
                <p className="text-legal-secondary text-sm font-montserrat mt-2">Experience the MentorMatch platform in action</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}