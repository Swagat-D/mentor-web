/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  HelpCircle,
  Search,
  MessageCircle,
  Mail,
  Phone,
  ChevronDown,
  ChevronRight,
  Clock,
  CheckCircle,
  BookOpen,
  Users,
  Settings,
  CreditCard,
  Calendar,
  Send,
  ExternalLink,
  ArrowRight,
  AlertCircle,
  Loader
} from 'lucide-react'

// Quick Help Section Component
const QuickHelpSection = () => {
  const router = useRouter()

  const quickHelp = [
    {
      title: 'Schedule a Session',
      description: 'Create and manage tutoring sessions',
      icon: Calendar,
      action: () => router.push('/dashboard/calendar')
    },
    {
      title: 'Payment Issues',
      description: 'Billing and earnings support',
      icon: CreditCard,
      action: () => router.push('/dashboard/earnings')
    },
    {
      title: 'Account Settings',
      description: 'Update profile and preferences',
      icon: Settings,
      action: () => router.push('/dashboard/settings')
    },
    {
      title: 'Student Management',
      description: 'Working with your students',
      icon: Users,
      action: () => router.push('/dashboard/students')
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {quickHelp.map((item, index) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          onClick={item.action}
          className="bg-white/95 backdrop-blur-sm rounded-xl shadow-legal border border-warm-200/50 p-6 hover:shadow-legal-lg transition-all duration-300 group cursor-pointer"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center group-hover:bg-accent-200 transition-colors">
              <item.icon className="w-6 h-6 text-accent-600" />
            </div>
            <ArrowRight className="w-5 h-5 text-legal-warm-text group-hover:text-accent-600 transition-colors ml-auto" />
          </div>
          <h3 className="text-lg font-semibold text-legal-dark-text font-montserrat mb-2 group-hover:text-accent-600 transition-colors">
            {item.title}
          </h3>
          <p className="text-sm text-legal-warm-text font-montserrat">
            {item.description}
          </p>
        </motion.div>
      ))}
    </div>
  )
}

// FAQ Section Component
const FAQSection = ({ searchQuery }: { searchQuery: string }) => {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)

  const faqs = [
    {
      id: '1',
      question: 'How do I schedule a new tutoring session?',
      answer: 'Go to your Calendar page and click "New Session". Select your student, subject, date/time, and session type. The system will handle payment and notifications automatically.'
    },
    {
      id: '2',
      question: 'When do I receive payment for sessions?',
      answer: 'Payments are processed automatically after completed sessions. Funds are available in your account within 2-3 business days. View your earnings in the Earnings section.'
    },
    {
      id: '3',
      question: 'What if a student doesn\'t show up?',
      answer: 'If a student is 15+ minutes late without notice, mark the session as "no-show" in your calendar. Payment will be processed automatically.'
    },
    {
      id: '4',
      question: 'How do I update my availability?',
      answer: 'Go to Settings > Availability to set your weekly schedule. Set hours for each day, block unavailable times, and update your timezone.'
    },
    {
      id: '5',
      question: 'Can I reschedule sessions?',
      answer: 'Yes, you can reschedule sessions up to 24 hours before the scheduled time. For last-minute changes, contact the student directly.'
    },
    {
      id: '6',
      question: 'How do I connect Google Calendar?',
      answer: 'In Calendar settings, click "Connect Google Calendar" and follow the authorization steps. All sessions will sync automatically with video meeting links.'
    }
  ]

  const filteredFAQs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-4">
      {filteredFAQs.map((faq) => (
        <motion.div
          key={faq.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/95 backdrop-blur-sm rounded-xl shadow-legal border border-warm-200/50 overflow-hidden"
        >
          <button
            onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
            className="w-full p-6 text-left hover:bg-legal-bg-secondary/20 transition-colors flex items-center justify-between"
          >
            <span className="text-lg font-medium text-legal-dark-text font-montserrat pr-4">
              {faq.question}
            </span>
            {expandedFAQ === faq.id ? (
              <ChevronDown className="w-5 h-5 text-accent-600 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-5 h-5 text-legal-warm-text flex-shrink-0" />
            )}
          </button>
          
          <AnimatePresence>
            {expandedFAQ === faq.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t border-legal-border/30"
              >
                <div className="p-6 pt-4">
                  <p className="text-legal-warm-text font-montserrat leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  )
}

// Contact Section Component
const ContactSection = () => {
  const [showContactForm, setShowContactForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'medium'
  })

  const contactMethods = [
    {
      title: 'Live Chat',
      description: 'Get instant help',
      availability: '24/7',
      icon: MessageCircle,
      color: 'blue',
      action: () => {
        // Implement live chat - could integrate with Intercom, Zendesk Chat, etc.
        window.open('https://chat.mentormatch.com', '_blank')
      }
    },
    {
      title: 'Email Support',
      description: 'Detailed questions',
      availability: 'Within 4 hours',
      icon: Mail,
      color: 'green',
      action: () => setShowContactForm(true)
    },
    {
      title: 'Phone Support',
      description: 'Urgent matters',
      availability: 'Mon-Fri 9AM-6PM',
      icon: Phone,
      color: 'purple',
      action: () => window.open('tel:+1-555-MENTOR', '_self')
    }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/support/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setSubmitStatus('success')
        setFormData({ name: '', email: '', subject: '', message: '', priority: 'medium' })
        setTimeout(() => {
          setShowContactForm(false)
          setSubmitStatus('idle')
        }, 2000)
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Error sending support email:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {contactMethods.map((method, index) => (
          <motion.div
            key={method.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            onClick={method.action}
            className="bg-white/95 backdrop-blur-sm rounded-xl shadow-legal border border-warm-200/50 p-6 hover:shadow-legal-lg transition-all duration-300 cursor-pointer group"
          >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
              method.color === 'blue' ? 'bg-blue-100 group-hover:bg-blue-200' :
              method.color === 'green' ? 'bg-green-100 group-hover:bg-green-200' :
              'bg-purple-100 group-hover:bg-purple-200'
            }`}>
              <method.icon className={`w-6 h-6 ${
                method.color === 'blue' ? 'text-blue-600' :
                method.color === 'green' ? 'text-green-600' :
                'text-purple-600'
              }`} />
            </div>
            <h3 className="text-lg font-semibold text-legal-dark-text font-montserrat mb-2">
              {method.title}
            </h3>
            <p className="text-sm text-legal-warm-text font-montserrat mb-2">
              {method.description}
            </p>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-legal-warm-text" />
              <span className="text-xs text-legal-warm-text font-montserrat">
                {method.availability}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Contact Form Modal */}
      <AnimatePresence>
        {showContactForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowContactForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl border border-warm-200/50 p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-2xl font-baskervville font-bold text-legal-dark-text mb-6">
                Contact Support
              </h3>
              
              {submitStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Message sent successfully! We&apos;ll respond within 4 hours.</span>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>Failed to send message. Please try again.</span>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-legal-dark-text font-montserrat mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-legal-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 font-montserrat"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-legal-dark-text font-montserrat mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-legal-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 font-montserrat"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-legal-dark-text font-montserrat mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 border border-legal-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 font-montserrat"
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-legal-dark-text font-montserrat mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-3 border border-legal-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 font-montserrat"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-legal-dark-text font-montserrat mb-2">
                    Message
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-legal-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none font-montserrat"
                    placeholder="Describe your issue in detail..."
                    required
                  />
                </div>
                
                <div className="flex items-center justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowContactForm(false)}
                    className="px-6 py-3 text-legal-warm-text border border-legal-border rounded-lg hover:bg-legal-bg-secondary/30 transition-colors font-montserrat"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-accent-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-accent-700 transition-colors font-montserrat flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Resources Section Component
const ResourcesSection = () => {
  const router = useRouter()

  const resources = [
    {
      title: 'Getting Started Guide',
      description: 'Complete setup walkthrough',
      icon: BookOpen,
      type: 'guide',
      action: () => router.push('/dashboard/help/getting-started')
    },
    {
      title: 'Best Practices',
      description: 'Tips from successful mentors',
      icon: CheckCircle,
      type: 'tips',
      action: () => router.push('/dashboard/help/best-practices')
    },
    {
      title: 'Community Forum',
      description: 'Connect with other mentors',
      icon: Users,
      type: 'community',
      action: () => router.push('/dashboard/help/community')
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {resources.map((resource, index) => (
        <motion.div
          key={resource.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          onClick={resource.action}
          className="bg-white/95 backdrop-blur-sm rounded-xl shadow-legal border border-warm-200/50 p-6 hover:shadow-legal-lg transition-all duration-300 group cursor-pointer"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center group-hover:bg-accent-200 transition-colors">
              <resource.icon className="w-6 h-6 text-accent-600" />
            </div>
            <ExternalLink className="w-5 h-5 text-legal-warm-text group-hover:text-accent-600 transition-colors ml-auto" />
          </div>
          <h3 className="text-lg font-semibold text-legal-dark-text font-montserrat mb-2 group-hover:text-accent-600 transition-colors">
            {resource.title}
          </h3>
          <p className="text-sm text-legal-warm-text font-montserrat">
            {resource.description}
          </p>
        </motion.div>
      ))}
    </div>
  )
}

// Main Help & Support Page
export default function HelpSupportPage() {
  const [activeTab, setActiveTab] = useState<'faq' | 'contact' | 'resources'>('faq')
  const [searchQuery, setSearchQuery] = useState('')

  const tabs = [
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'contact', label: 'Contact Support', icon: MessageCircle },
    { id: 'resources', label: 'Resources', icon: BookOpen }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-legal-bg-primary via-white to-legal-bg-secondary">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-accent-100 to-accent-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-8 h-8 text-accent-600" />
          </div>
          <h1 className="text-4xl font-baskervville font-bold text-legal-dark-text mb-4">
            Help & Support
          </h1>
          <p className="text-xl text-legal-warm-text font-montserrat max-w-2xl mx-auto">
            Get the help you need to succeed as a mentor on our platform
          </p>
        </motion.div>

        {/* Quick Help Cards */}
        <QuickHelpSection />

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto mb-8"
        >
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-legal-warm-text" />
            <input
              type="text"
              placeholder="Search for help topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 border border-legal-border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white font-montserrat text-lg shadow-sm"
            />
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex justify-center mb-8"
        >
          <div className="flex items-center space-x-1 bg-white/95 backdrop-blur-sm rounded-xl p-1 shadow-legal border border-warm-200/50">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-300 font-montserrat ${
                  activeTab === tab.id
                    ? 'bg-accent-600 text-white shadow-md'
                    : 'text-legal-warm-text hover:text-accent-600 hover:bg-accent-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          {activeTab === 'faq' && <FAQSection searchQuery={searchQuery} />}
          {activeTab === 'contact' && <ContactSection />}
          {activeTab === 'resources' && <ResourcesSection />}
        </motion.div>
      </div>
    </div>
  )
}