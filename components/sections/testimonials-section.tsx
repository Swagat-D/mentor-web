'use client'

import { motion } from 'framer-motion'
import {  Quote } from 'lucide-react'
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials"

const testimonials = [
  {
    quote: "MentorMatch completely transformed my teaching experience. The platform is intuitive, the students are engaged, and I'm earning more than I ever thought possible as an online mentor.",
    name: "Dr. Sarah Chen",
    designation: "Mathematics Professor & MentorMatch Expert",
    src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=500&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    quote: "The flexibility to work on my own schedule while helping students achieve their academic dreams has been life-changing. The earning potential is outstanding.",
    name: "Michael Rodriguez",
    designation: "Computer Science Expert & Former Google Engineer",
    src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=500&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    quote: "What I love most is the quality of students. They're motivated, respectful, and genuinely want to learn. It makes teaching an absolute joy.",
    name: "Dr. Emily Watson",
    designation: "Physics PhD & Science Communication Expert",
    src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=500&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    quote: "The support from MentorMatch has been exceptional. From onboarding to ongoing assistance, they truly care about mentor success. Highly recommend!",
    name: "James Kim",
    designation: "Business Strategy Consultant & MBA",
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=500&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    quote: "In just 6 months, I've built a thriving mentoring practice. The platform handles all the logistics so I can focus on what I love - teaching and inspiring students.",
    name: "Amanda Foster",
    designation: "English Literature Expert & Published Author",
    src: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=500&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    quote: "The AI matching system is incredible. I'm consistently paired with students who genuinely benefit from my expertise in data science and machine learning.",
    name: "David Thompson",
    designation: "Senior Data Scientist & AI Researcher",
    src: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=500&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-white via-legal-bg-primary to-warm-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-hero-pattern opacity-20"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 bg-accent-100 rounded-full px-4 py-2 text-sm font-medium text-accent-700 mb-6 font-montserrat">
            <Quote className="w-4 h-4" />
            <span>Mentor Success Stories</span>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-baskervville font-bold gradient-text mb-6">
            Trusted by Expert Mentors Worldwide
          </h2>
          <p className="text-xl text-legal-warm-text max-w-3xl mx-auto font-montserrat leading-relaxed">
            Join thousands of successful mentors who are making a meaningful impact while earning competitive rates. 
            Here&apos;s what they have to say about their experience.
          </p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center items-center gap-8 mb-16"
        >
        </motion.div>

        {/* Animated Testimonials */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-legal-lg border border-warm-200/50 p-4 lg:p-8"
        >
          <AnimatedTestimonials testimonials={testimonials} autoplay={true} />
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-accent-700 to-accent-600 rounded-2xl p-8 lg:p-12 text-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
            
            <div className="relative z-10">
              <h3 className="text-2xl lg:text-3xl font-baskervville font-bold mb-4">
                Ready to Join Our Community of Expert Mentors?
              </h3>
              <p className="text-white/90 font-montserrat text-lg mb-8 max-w-2xl mx-auto">
                Start your mentoring journey today and experience the same success as our featured mentors. 
                Your expertise could be exactly what a student needs to achieve their dreams.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-accent-700 font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-montserrat">
                  Start Mentoring Today
                </button>
                <button className="bg-white/20 backdrop-blur text-white font-semibold py-4 px-8 rounded-xl border border-white/30 hover:bg-white/30 transition-all duration-300 hover:scale-105 font-montserrat">
                  View More Stories
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}