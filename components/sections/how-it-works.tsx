'use client'

import { motion } from 'framer-motion'
import { 
  PlusCircle,
  Users,
  BookOpen,
  ArrowRight,
  CheckCircle,
  FileText,
  CreditCard,
  MessageCircle
} from 'lucide-react'

const steps = [
  {
    step: "01",
    title: "Create Your Expert Profile",
    description: "Sign up and build your professional profile. Add your expertise, credentials, education, and set your competitive rates.",
    icon: PlusCircle,
    details: [
      "Upload professional credentials",
      "Set your hourly rates",
      "Define your expertise areas",
      "Add availability schedule"
    ]
  },
  {
    step: "02", 
    title: "Get Matched with Students",
    description: "Our intelligent algorithm connects you with students who need your specific expertise and teaching style.",
    icon: Users,
    details: [
      "AI-powered student matching",
      "Review student profiles",
      "Accept session requests",
      "Schedule meetings"
    ]
  },
  {
    step: "03",
    title: "Start Teaching & Earning",
    description: "Conduct mentoring sessions, help students achieve their academic goals, and earn competitive rates for your expertise.",
    icon: BookOpen,
    details: [
      "Conduct video sessions",
      "Track student progress",
      "Receive instant payments",
      "Build your reputation"
    ]
  }
]

const benefits = [
  {
    icon: FileText,
    title: "Professional Documentation",
    description: "All sessions are documented with automatic transcripts and progress tracking."
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description: "Get paid instantly after each session with multiple payment options available."
  },
  {
    icon: MessageCircle,
    title: "Ongoing Communication",
    description: "Stay connected with students through our built-in messaging system."
  }
]

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-br from-legal-bg-primary via-warm-50 to-legal-bg-secondary relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-64 h-64 bg-accent-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-warm-300/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 bg-white/80 rounded-full px-4 py-2 text-sm font-medium text-accent-700 mb-6 font-montserrat">
            <CheckCircle className="w-4 h-4" />
            <span>Simple Process</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-baskervville font-bold gradient-text mb-6">
            Start Mentoring in 3 Simple Steps
          </h2>
          <p className="text-xl text-legal-warm-text max-w-3xl mx-auto font-montserrat leading-relaxed">
            Getting started as a mentor is easy. Join thousands of experts who are already making a difference in students&apos; lives.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid lg:grid-cols-3 gap-12 mb-20">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative group"
            >
              {/* Step Card */}
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-legal-lg border border-warm-200/50 p-8 text-center group-hover:shadow-legal-xl transition-all duration-300 h-full">
                {/* Step Number */}
                <div className="text-6xl font-bold text-accent-100 mb-4 font-baskervville group-hover:text-accent-200 transition-colors">
                  {step.step}
                </div>
                
                {/* Icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                
                {/* Content */}
                <h3 className="text-2xl font-bold text-legal-dark-text mb-4 font-baskervville">
                  {step.title}
                </h3>
                <p className="text-legal-warm-text leading-relaxed font-montserrat mb-6">
                  {step.description}
                </p>

                {/* Details List */}
                <div className="space-y-2 text-left">
                  {step.details.map((detail, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-sm text-legal-warm-text">
                      <CheckCircle className="w-4 h-4 text-success-500 flex-shrink-0" />
                      <span className="font-montserrat">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Arrow between steps (desktop only) */}
              {index < 2 && (
                <div className="hidden lg:block absolute top-1/2 -right-6 transform -translate-y-1/2 z-10">
                  <div className="w-12 h-12 bg-white rounded-full shadow-legal flex items-center justify-center">
                    <ArrowRight className="w-6 h-6 text-accent-400" />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Additional Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-legal-lg border border-warm-200/50 p-8 lg:p-12"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-baskervville font-bold text-legal-dark-text mb-4">
              What You Get as a Mentor
            </h3>
            <p className="text-legal-warm-text font-montserrat text-lg max-w-2xl mx-auto">
              Beyond competitive earnings, enjoy these additional benefits when you join our mentoring community.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <benefit.icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-legal-dark-text mb-2 font-baskervville">
                  {benefit.title}
                </h4>
                <p className="text-legal-warm-text font-montserrat leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Timeline Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-baskervville font-bold text-legal-dark-text mb-4">
              Your First Week Timeline
            </h3>
            <p className="text-legal-warm-text font-montserrat text-lg max-w-2xl mx-auto">
              See how quickly you can start earning and making an impact
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-accent-300 to-accent-600 rounded-full"></div>
            
            <div className="space-y-12">
              {[
                { day: "Day 1", title: "Sign Up & Profile Setup", description: "Complete your registration and build your expert profile" },
                { day: "Day 2", title: "Verification Process", description: "Our team reviews and verifies your credentials" },
                { day: "Day 3", title: "Platform Training", description: "Learn how to use our mentoring tools effectively" },
                { day: "Day 5", title: "First Student Match", description: "Get matched with your first student" },
                { day: "Day 7", title: "Start Earning", description: "Conduct your first session and receive payment" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`bg-white/95 backdrop-blur-sm rounded-xl shadow-legal border border-warm-200/50 p-6 max-w-sm ${index % 2 === 0 ? 'mr-8' : 'ml-8'}`}>
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">{index + 1}</span>
                      </div>
                      <span className="text-accent-600 font-semibold font-montserrat">{item.day}</span>
                    </div>
                    <h4 className="font-bold text-legal-dark-text mb-2 font-baskervville">{item.title}</h4>
                    <p className="text-legal-warm-text text-sm font-montserrat">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}