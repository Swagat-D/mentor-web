'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Scale,
  Mail,
  Phone,
  MapPin,
  Heart,
  ArrowRight,
  Facebook,
  Twitter,
  Linkedin,
  Instagram
} from 'lucide-react'

const footerLinks = {
  mentors: [
    { name: 'Apply Now', href: '/signup' },
    { name: 'Mentor Resources', href: '/resources' },
    { name: 'Pricing Guide', href: '/pricing' },
    { name: 'Success Stories', href: '/success-stories' },
    { name: 'Community', href: '/community' }
  ],
  students: [
    { name: 'Find Mentors', href: '/find-mentors' },
    { name: 'How it Works', href: '/how-it-works' },
    { name: 'Download App', href: '/download' },
    { name: 'Student Support', href: '/student-support' },
    { name: 'Scholarships', href: '/scholarships' }
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Careers', href: '/careers' },
    { name: 'Press Kit', href: '/press' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' }
  ],
  legal: [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'GDPR', href: '/gdpr' },
    { name: 'Safety Guidelines', href: '/safety' }
  ]
}

const socialLinks = [
  { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/mentormatch' },
  { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/mentormatch' },
  { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/mentormatch' },
  { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/mentormatch' }
]

const contactInfo = [
  {
    icon: Mail,
    label: 'Email',
    value: 'hello@mentormatch.com',
    href: 'mailto:hello@mentormatch.com'
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+1 (555) 123-4567',
    href: 'tel:+15551234567'
  },
  {
    icon: MapPin,
    label: 'Address',
    value: 'San Francisco, CA',
    href: 'https://maps.google.com'
  }
]

export default function Footer() {
  return (
    <footer className="bg-legal-dark-text text-warm-100 relative overflow-hidden" id='footer'>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-accent-500 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-warm-500 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid lg:grid-cols-6 gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="flex items-center space-x-3"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center">
                  <Scale className="text-white font-bold text-lg w-6 h-6" />
                </div>
                <span className="text-2xl font-baskervville font-bold text-white">MentorMatch</span>
              </motion.div>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-warm-300 leading-relaxed font-montserrat max-w-md"
              >
                Connecting expert mentors with ambitious students worldwide. 
                Transform lives through personalized learning and professional guidance.
              </motion.p>

              {/* Contact Info */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="space-y-3"
              >
                {contactInfo.map((item, index) => (
                  <a
                    key={index}
                    href={item.href}
                    className="flex items-center space-x-3 text-warm-300 hover:text-accent-400 transition-colors group"
                  >
                    <div className="w-8 h-8 bg-warm-800 rounded-lg flex items-center justify-center group-hover:bg-accent-600 transition-colors">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs text-warm-400">{item.label}</div>
                      <div className="font-montserrat">{item.value}</div>
                    </div>
                  </a>
                ))}
              </motion.div>

              {/* Social Links */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="flex space-x-4"
              >
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="w-10 h-10 bg-warm-800 rounded-lg flex items-center justify-center hover:bg-accent-600 transition-colors group"
                    aria-label={social.name}
                  >
                    <social.icon className="w-5 h-5 text-warm-300 group-hover:text-white transition-colors" />
                  </a>
                ))}
              </motion.div>
            </div>

            {/* Links Sections */}
            <div className="lg:col-span-4 grid md:grid-cols-4 gap-8">
              {/* For Mentors */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h4 className="text-lg font-semibold text-white mb-6 font-baskervville">For Mentors</h4>
                <ul className="space-y-3">
                  {footerLinks.mentors.map((link, index) => (
                    <li key={index}>
                      <Link 
                        href={link.href} 
                        className="text-warm-300 hover:text-accent-400 transition-colors font-montserrat text-sm flex items-center group"
                      >
                        <span>{link.name}</span>
                        <ArrowRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* For Students */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <h4 className="text-lg font-semibold text-white mb-6 font-baskervville">For Students</h4>
                <ul className="space-y-3">
                  {footerLinks.students.map((link, index) => (
                    <li key={index}>
                      <Link 
                        href={link.href} 
                        className="text-warm-300 hover:text-accent-400 transition-colors font-montserrat text-sm flex items-center group"
                      >
                        <span>{link.name}</span>
                        <ArrowRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Company */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <h4 className="text-lg font-semibold text-white mb-6 font-baskervville">Company</h4>
                <ul className="space-y-3">
                  {footerLinks.company.map((link, index) => (
                    <li key={index}>
                      <Link 
                        href={link.href} 
                        className="text-warm-300 hover:text-accent-400 transition-colors font-montserrat text-sm flex items-center group"
                      >
                        <span>{link.name}</span>
                        <ArrowRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Legal */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                viewport={{ once: true }}
              >
                <h4 className="text-lg font-semibold text-white mb-6 font-baskervville">Legal</h4>
                <ul className="space-y-3">
                  {footerLinks.legal.map((link, index) => (
                    <li key={index}>
                      <Link 
                        href={link.href} 
                        className="text-warm-300 hover:text-accent-400 transition-colors font-montserrat text-sm flex items-center group"
                      >
                        <span>{link.name}</span>
                        <ArrowRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="py-12 border-t border-warm-800"
        >
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl font-baskervville font-bold text-white mb-4">
              Stay Updated with MentorMatch
            </h3>
            <p className="text-warm-300 font-montserrat mb-8 max-w-2xl mx-auto">
              Get the latest updates on platform features, success stories, and tips for effective mentoring.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl bg-warm-800 text-white placeholder-warm-400 border border-warm-700 focus:outline-none focus:border-accent-500 font-montserrat"
              />
              <button className="bg-gradient-to-r from-accent-600 to-accent-500 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transition-all duration-300 font-montserrat">
                Subscribe
              </button>
            </div>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="border-t border-warm-800 py-8 flex flex-col md:flex-row justify-between items-center"
        >
          <p className="text-warm-400 text-sm font-montserrat">
            © 2024 MentorMatch. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <span className="text-warm-400 text-sm font-montserrat">Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-current" />
            <span className="text-warm-400 text-sm font-montserrat">for education</span>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}