'use client'

import { motion } from 'framer-motion'
import { 
  Globe,
  Calendar,
  DollarSign,
  Shield,
  Target,
  Trophy,
  Users,
  Zap,
  Clock,
  Award
} from 'lucide-react'

const features = [
  {
    icon: Globe,
    title: "Global Network",
    description: "Connect with students from around the world and expand your teaching impact beyond geographical boundaries.",
    color: "bg-accent-600"
  },
  {
    icon: Calendar,
    title: "Flexible Scheduling",
    description: "Set your own availability and work on your terms. Perfect for busy professionals and expert educators.",
    color: "bg-warm-600"
  },
  {
    icon: DollarSign,
    title: "Competitive Earnings",
    description: "Earn $30-150 per hour based on your expertise. Multiple payment options with instant payouts available.",
    color: "bg-success-600"
  },
  {
    icon: Shield,
    title: "Verified Students",
    description: "All students are verified and committed to learning. Safe, secure, and professional environment.",
    color: "bg-accent-700"
  },
  {
    icon: Target,
    title: "Smart Matching",
    description: "Our AI algorithm matches you with students who need your specific expertise and learning style.",
    color: "bg-warm-700"
  },
  {
    icon: Trophy,
    title: "Recognition System",
    description: "Build your reputation with our rating system and showcase your expertise to attract more students.",
    color: "bg-success-700"
  }
]

const additionalFeatures = [
  {
    icon: Users,
    title: "Community Support",
    description: "Join a thriving community of educators sharing best practices and supporting each other."
  },
  {
    icon: Zap,
    title: "Instant Notifications",
    description: "Get real-time alerts for new student requests, session reminders, and platform updates."
  },
  {
    icon: Clock,
    title: "Session Management",
    description: "Easy-to-use tools for scheduling, rescheduling, and managing all your mentoring sessions."
  },
  {
    icon: Award,
    title: "Performance Analytics",
    description: "Track your teaching performance with detailed analytics and student feedback insights."
  }
]

export default function FeaturesSection() {
  return (
    <section id="features" className="py-12 sm:py-16 lg:py-20 bg-white/50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-hero-pattern opacity-30"></div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center space-x-2 bg-accent-100 rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-accent-700 mb-4 sm:mb-6 font-montserrat">
            <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Platform Features</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-baskervville font-bold gradient-text mb-4 sm:mb-6">
            Why Choose MentorMatch?
          </h2>
          <p className="text-lg sm:text-xl text-legal-warm-text max-w-3xl mx-auto font-montserrat leading-relaxed">
            We&apos;ve built the perfect platform for mentors to share their expertise 
            and build meaningful connections with students worldwide.
          </p>
        </motion.div>

        {/* Main Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-legal-lg border border-warm-200/50 p-6 sm:p-8 hover:shadow-legal-xl transition-all duration-300 text-center group-hover:scale-105 h-full">
                {/* Icon */}
                <div className={`w-12 h-12 sm:w-16 sm:h-16 ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <feature.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                
                {/* Content */}
                <h3 className="text-lg sm:text-xl font-bold text-legal-dark-text mb-3 sm:mb-4 font-baskervville group-hover:text-accent-700 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-legal-warm-text leading-relaxed font-montserrat text-sm sm:text-base">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-accent-700 to-accent-600 rounded-3xl p-6 sm:p-8 lg:p-12 text-white relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 rounded-full -mr-24 sm:-mr-32 -mt-24 sm:-mt-32"></div>
          <div className="absolute bottom-0 left-0 w-32 sm:w-48 h-32 sm:h-48 bg-white/5 rounded-full -ml-16 sm:-ml-24 -mb-16 sm:-mb-24"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-8 sm:mb-12">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-baskervville font-bold mb-4">
                Even More Features
              </h3>
              <p className="text-white/90 text-base sm:text-lg font-montserrat max-w-2xl mx-auto">
                Discover additional tools and features designed to enhance your mentoring experience
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {additionalFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center group"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-white/30 transition-colors">
                    <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h4 className="text-base sm:text-lg font-semibold mb-2 font-baskervville">
                    {feature.title}
                  </h4>
                  <p className="text-white/80 text-sm font-montserrat leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-12 sm:mt-16"
        >
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-legal-lg border border-warm-200/50 p-6 sm:p-8 lg:p-12 max-w-4xl mx-auto">
            <h3 className="text-2xl sm:text-2xl lg:text-3xl font-baskervville font-bold text-legal-dark-text mb-4">
              Ready to Start Your Mentoring Journey?
            </h3>
            <p className="text-legal-warm-text font-montserrat text-base sm:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto">
              Join thousands of expert mentors who are already making a difference in students&apos; lives while earning competitive rates.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button className="bg-gradient-to-r from-accent-700 to-accent-600 text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-xl shadow-legal-lg hover:shadow-legal-xl transition-all duration-300 hover:scale-105 font-montserrat">
                Get Started Today
              </button>
              <button className="bg-white text-accent-700 font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-xl border border-accent-200 shadow-warm hover:shadow-warm-lg transition-all duration-300 hover:scale-105 font-montserrat">
                Learn More
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}