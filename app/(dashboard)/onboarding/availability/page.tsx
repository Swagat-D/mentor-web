/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  DollarSign,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Calendar,
  Clock,
  Video,
  Users,
  Shield,
  Info,
  Copy,
  Check,
  X
} from 'lucide-react'

export default function OnboardingAvailability() {
  const [pricing, setPricing] = useState({
    hourlyRateINR: ''
  })
  const [calComSetup, setCalComSetup] = useState({
    username: '',
    isVerified: false,
    eventTypes: []
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [showInstructions, setShowInstructions] = useState(true)
  const [showBookingPreview, setShowBookingPreview] = useState(false)
  const [bookingPreviewData, setBookingPreviewData] = useState<any>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [copiedStep, setCopiedStep] = useState<number | null>(null)

  const setupSteps = [
    {
      title: "Create Cal.com Account",
      description: "Sign up at cal.com with your email",
      action: "Go to cal.com and create your account",
      link: "https://cal.com/signup"
    },
    {
      title: "Set Your Availability", 
      description: "Configure your weekly schedule",
      action: "Go to Settings → Availability → Set your working hours",
      details: [
        "Set your timezone correctly",
        "Add your available days and hours",
        "Set minimum booking notice to 2 hours"
      ]
    },
    {
      title: "Create Event Type",
      description: "Create a mentoring session event",
      action: "Go to Event Types → Create New Event Type",
      details: [
        "Title: 'Mentoring Session with [Your Name]'",
        "Duration: Choose 30, 45, or 60 minutes",
        "Location: Google Meet (will auto-generate links)",
        "Set booking window: 2 hours to 30 days",
        "Make event type PUBLIC"
      ]
    },
    {
      title: "Configure Google Meet",
      description: "Enable automatic Google Meet links",
      action: "In your event type → Locations → Add Google Meet",
      details: [
        "Connect your Google account",
        "Enable automatic meeting creation",
        "Test the integration"
      ]
    },
    {
      title: "Get Your Username",
      description: "Find your Cal.com username",
      action: "Go to Settings → Public Profile",
      details: [
        "Copy your username (e.g., john-doe-abc123)",
        "Ensure your profile is PUBLIC",
        "Test your booking page works"
      ]
    }
  ]

  const handlePricingChange = (value: string) => {
    setPricing({ hourlyRateINR: value })
    if (errors.hourlyRateINR) {
      setErrors(prev => ({ ...prev, hourlyRateINR: '' }))
    }
  }

  const handleUsernameChange = (value: string) => {
    setCalComSetup(prev => ({ ...prev, username: value, isVerified: false }))
    if (errors.username) {
      setErrors(prev => ({ ...prev, username: '' }))
    }
  }

  const fetchBookingPreview = async () => {
    if (!calComSetup.username || !calComSetup.isVerified) return

    setLoadingPreview(true)
    try {
      const response = await fetch('/api/calcom/booking-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: calComSetup.username,
          eventTypes: calComSetup.eventTypes,
          hourlyRate: parseInt(pricing.hourlyRateINR || '0')
        })
      })

      const data = await response.json()
      if (data.success) {
        setBookingPreviewData(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch booking preview:', error)
    } finally {
      setLoadingPreview(false)
    }
  }

  const copyToClipboard = (text: string, stepIndex: number) => {
    navigator.clipboard.writeText(text)
    setCopiedStep(stepIndex)
    setTimeout(() => setCopiedStep(null), 2000)
  }

  const verifyCalComUsername = async () => {
    if (!calComSetup.username.trim()) {
      setErrors(prev => ({ ...prev, username: 'Username is required' }))
      return
    }

    setIsVerifying(true)
    setErrors(prev => ({ ...prev, username: '' }))

    try {
      const response = await fetch('/api/calcom/verify-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: calComSetup.username.trim() })
      })

      const data = await response.json()

      if (data.success) {
        setCalComSetup(prev => ({
          ...prev,
          isVerified: true,
          eventTypes: data.eventTypes
        }))
      } else {
        setErrors(prev => ({ ...prev, username: data.message }))
      }
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        username: 'Failed to verify username. Please try again.' 
      }))
    } finally {
      setIsVerifying(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validate hourly rate
    if (!pricing.hourlyRateINR) {
      newErrors.hourlyRateINR = 'Hourly rate is required'
    } else {
      const rate = parseInt(pricing.hourlyRateINR)
      if (isNaN(rate) || rate < 500 || rate > 10000) {
        newErrors.hourlyRateINR = 'Hourly rate must be between ₹500 and ₹10,000'
      }
    }

    // Validate Cal.com setup
    if (!calComSetup.username.trim()) {
      newErrors.username = 'Cal.com username is required'
    } else if (!calComSetup.isVerified) {
      newErrors.username = 'Please verify your Cal.com username first'
    }

    if (calComSetup.isVerified && calComSetup.eventTypes.length === 0) {
      newErrors.username = 'No public event types found. Please create and make public at least one event type.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/onboarding/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          hourlyRateINR: parseInt(pricing.hourlyRateINR),
          calComUsername: calComSetup.username.trim(),
          calComEventTypes: calComSetup.eventTypes
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message)
      }

      // Save progress and navigate to next step
      const currentProgress = JSON.parse(localStorage.getItem('onboarding-progress') || '[]')
      localStorage.setItem('onboarding-progress', JSON.stringify([...currentProgress, 'availability']))
      window.location.href = '/onboarding/verification'
      
    } catch (error: any) {
      console.error('Availability save error:', error)
      setErrors({ general: error.message || 'Something went wrong. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-legal-lg border border-warm-200/50 p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-baskervville font-bold text-legal-dark-text mb-2">
            Set Your Pricing & Availability
          </h1>
          <p className="text-legal-warm-text font-montserrat text-sm sm:text-base">
            Configure your hourly rate and integrate with Cal.com for seamless booking
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* General Error */}
          {errors.general && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700 font-montserrat text-sm">{errors.general}</span>
            </motion.div>
          )}

          {/* Pricing Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 sm:p-6">
            <h3 className="text-xl font-baskervville font-bold text-legal-dark-text mb-4 flex items-center">
              <DollarSign className="w-6 h-6 mr-2 text-blue-600" />
              Set Your Hourly Rate
            </h3>
            
            <div className="max-w-md">
              <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                Hourly Rate in Indian Rupees (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg font-bold text-legal-warm-text">₹</span>
                <input
                  type="number"
                  min="500"
                  max="10000"
                  step="50"
                  value={pricing.hourlyRateINR}
                  onChange={(e) => handlePricingChange(e.target.value)}
                  className={`w-full pl-8 pr-4 py-3 border rounded-xl font-montserrat transition-colors text-sm sm:text-base ${
                    errors.hourlyRateINR ? 'border-red-300' : 'border-legal-border'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white`}
                  placeholder="2000"
                />
              </div>
              {errors.hourlyRateINR && (
                <p className="mt-1 text-sm text-red-600 font-montserrat">{errors.hourlyRateINR}</p>
              )}
              <p className="mt-2 text-xs text-legal-warm-text font-montserrat">
                Recommended range: ₹500 - ₹10,000 per hour
              </p>
              
              {pricing.hourlyRateINR && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-700 font-montserrat text-sm mb-2">
                    Session Pricing Examples:
                  </h4>
                  <div className="space-y-1 text-xs text-green-600 font-montserrat">
                    <div>30 minutes: ₹{Math.round((parseInt(pricing.hourlyRateINR) / 60) * 30)}</div>
                    <div>45 minutes: ₹{Math.round((parseInt(pricing.hourlyRateINR) / 60) * 45)}</div>
                    <div>60 minutes: ₹{parseInt(pricing.hourlyRateINR)}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cal.com Integration Instructions */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-baskervville font-bold text-legal-dark-text flex items-center">
                <Calendar className="w-6 h-6 mr-2 text-purple-600" />
                Cal.com Integration Setup
              </h3>
              <button
                type="button"
                onClick={() => setShowInstructions(!showInstructions)}
                className="text-purple-600 hover:text-purple-700 font-montserrat text-sm font-medium"
              >
                {showInstructions ? 'Hide Instructions' : 'Show Instructions'}
              </button>
            </div>

            {showInstructions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6"
              >
                <div className="space-y-4">
                  {setupSteps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white border border-purple-200 rounded-lg p-4"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-legal-dark-text font-montserrat mb-1">
                            {step.title}
                          </h4>
                          <p className="text-sm text-legal-warm-text font-montserrat mb-2">
                            {step.description}
                          </p>
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-purple-700 font-montserrat text-sm">
                                Action Required:
                              </span>
                              {step.link && (
                                <a
                                  href={step.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center"
                                >
                                  Open Cal.com <ExternalLink className="w-3 h-3 ml-1" />
                                </a>
                              )}
                            </div>
                            <p className="text-sm text-purple-600 font-montserrat font-medium mb-2">
                              {step.action}
                            </p>
                            {step.details && (
                              <ul className="space-y-1">
                                {step.details.map((detail, detailIndex) => (
                                  <li key={detailIndex} className="text-xs text-purple-600 font-montserrat flex items-start">
                                    <span className="w-1 h-1 bg-purple-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                    <span>{detail}</span>
                                    <button
                                      type="button"
                                      onClick={() => copyToClipboard(detail, index * 10 + detailIndex)}
                                      className="ml-2 text-purple-500 hover:text-purple-600"
                                    >
                                      {copiedStep === index * 10 + detailIndex ? (
                                        <Check className="w-3 h-3" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Username Verification */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                  Your Cal.com Username *
                </label>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={calComSetup.username}
                      onChange={(e) => handleUsernameChange(e.target.value)}
                      placeholder="e.g., john-doe-abc123"
                      className={`w-full px-4 py-3 border rounded-xl font-montserrat transition-colors text-sm sm:text-base ${
                        errors.username ? 'border-red-300' : 
                        calComSetup.isVerified ? 'border-green-300 bg-green-50' : 'border-legal-border'
                      } focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={verifyCalComUsername}
                    disabled={isVerifying || !calComSetup.username.trim()}
                    className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-montserrat flex items-center justify-center space-x-2 whitespace-nowrap"
                  >
                    {isVerifying ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Verify</span>
                        <CheckCircle className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600 font-montserrat">{errors.username}</p>
                )}
                <p className="mt-1 text-xs text-legal-warm-text font-montserrat">
                  Find this in your Cal.com Settings → Public Profile
                </p>
              </div>

              {/* Verification Success */}
              {calComSetup.isVerified && calComSetup.eventTypes.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 border border-green-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-semibold text-green-700 font-montserrat">
                        Verification Successful!
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowBookingPreview(true)
                        fetchBookingPreview()
                      }}
                      className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
                    >
                      Preview Booking Details
                    </button>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-green-600 font-montserrat">
                      Found {calComSetup.eventTypes.length} public event type(s):
                    </p>
                    {calComSetup.eventTypes.map((eventType: any, index: number) => (
                      <div key={index} className="bg-green-100 rounded-lg p-3">
                        <div className="font-medium text-green-700 font-montserrat text-sm">
                          {eventType.title}
                        </div>
                        <div className="text-xs text-green-600 font-montserrat">
                          Duration: {eventType.duration} minutes • 
                          Price: ₹{pricing.hourlyRateINR ? Math.round((parseInt(pricing.hourlyRateINR) / 60) * eventType.duration) : '---'}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4 sm:p-6">
            <h4 className="font-semibold text-amber-800 font-baskervville mb-4 flex items-center">
              <Info className="w-5 h-5 mr-2" />
              Important Session Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-montserrat">
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Shield className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-amber-800 block">Cancellation Policy</span>
                    <span className="text-amber-700">Students can cancel up to 2 hours before the session</span>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Users className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-amber-800 block">Session Type</span>
                    <span className="text-amber-700">One-on-one mentoring sessions only</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Video className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-amber-800 block">Meeting Platform</span>
                    <span className="text-amber-700">Google Meet links generated automatically</span>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Clock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-amber-800 block">Flexible Duration</span>
                    <span className="text-amber-700">30, 45, or 60-minute sessions supported</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Benefits */}
          <div className="bg-legal-bg-secondary/20 border border-legal-border/50 rounded-xl p-4 sm:p-6">
            <h4 className="font-semibold text-legal-dark-text font-baskervville mb-4">
              What happens next?
            </h4>
            <div className="space-y-4 text-sm font-montserrat text-legal-warm-text">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-accent-500 mt-0.5 flex-shrink-0" />
                <span>Students will see your availability in real-time from your Cal.com schedule</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-accent-500 mt-0.5 flex-shrink-0" />
                <span>Session pricing is calculated automatically based on duration and your hourly rate</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-accent-500 mt-0.5 flex-shrink-0" />
                <span>Google Meet links are created automatically for each booked session</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-accent-500 mt-0.5 flex-shrink-0" />
                <span>You&apos;ll receive email notifications for all bookings and changes</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-accent-500 mt-0.5 flex-shrink-0" />
                <span>Payments are processed through our secure Indian payment gateway</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center sm:justify-end pt-6">
            <button
              type="submit"
              disabled={isLoading || !calComSetup.isVerified || !pricing.hourlyRateINR}
              className="w-full sm:w-auto bg-gradient-to-r from-accent-700 to-accent-600 text-white font-semibold py-3 px-6 sm:px-8 rounded-xl shadow-legal-lg hover:shadow-legal-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-montserrat flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Continue to Verification</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

          {/* Booking Preview Modal */}
          {showBookingPreview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowBookingPreview(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-baskervville font-bold text-gray-900">
                      Booking System Preview
                    </h3>
                    <button
                      onClick={() => setShowBookingPreview(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    This is how students will see your booking information
                  </p>
                </div>

                <div className="p-6">
                  {loadingPreview ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                      <span className="ml-3 text-gray-600">Loading booking details...</span>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Mentor Info */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Mentor Information</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Username:</span>
                            <span className="ml-2 font-medium">{calComSetup.username}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Cal.com Profile:</span>
                            <a 
                              href={`https://cal.com/${calComSetup.username}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 text-blue-600 hover:text-blue-700 font-medium"
                            >
                              View Public Profile
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Available Event Types */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">Available Session Types</h4>
                        <div className="space-y-3">
                          {calComSetup.eventTypes.map((eventType: any, index: number) => (
                            <div key={index} className="bg-white border border-green-200 rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h5 className="font-medium text-gray-900">{eventType.title}</h5>
                                  <p className="text-sm text-gray-600">
                                    Duration: {eventType.duration} minutes
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-green-600">
                                    ₹{pricing.hourlyRateINR ? Math.round((parseInt(pricing.hourlyRateINR) / 60) * eventType.duration) : '---'}
                                  </div>
                                  <div className="text-xs text-gray-500">per session</div>
                                </div>
                              </div>
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <div className="flex items-center text-xs text-gray-500 space-x-4">
                                  <span>📅 Book up to 30 days in advance</span>
                                  <span>⏰ Cancel up to 2 hours before</span>
                                  <span>🎥 Google Meet included</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Student Booking Flow Preview */}
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">Student Booking Experience</h4>
                        <div className="space-y-4">
                          <div className="bg-white border border-purple-200 rounded-lg p-4">
                            <h5 className="font-medium text-gray-900 mb-2">Step 1: Select Session Type</h5>
                            <p className="text-sm text-gray-600">
                              Student chooses from your available event types with clear pricing
                            </p>
                          </div>
                          <div className="bg-white border border-purple-200 rounded-lg p-4">
                            <h5 className="font-medium text-gray-900 mb-2">Step 2: Pick Available Time</h5>
                            <p className="text-sm text-gray-600">
                              Real-time availability fetched from your Cal.com schedule
                            </p>
                          </div>
                          <div className="bg-white border border-purple-200 rounded-lg p-4">
                            <h5 className="font-medium text-gray-900 mb-2">Step 3: Complete Booking</h5>
                            <p className="text-sm text-gray-600">
                              Student pays through our app → Google Meet link generated automatically
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Technical Integration Status */}
                      <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">Integration Status</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center text-sm">
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                              <span>Cal.com username verified</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                              <span>Public event types found</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                              <span>Pricing calculation ready</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center text-sm">
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                              <span>API integration active</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                              <span>Google Meet auto-generation</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                              <span>Real-time availability sync</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* API Endpoints Preview */}
                      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">API Integration Details</h4>
                        <div className="space-y-2 text-sm font-mono">
                          <div className="bg-white border border-yellow-200 rounded p-2">
                            <span className="text-green-600">GET</span> /api/mentor/{calComSetup.username}/availability
                          </div>
                          <div className="bg-white border border-yellow-200 rounded p-2">
                            <span className="text-blue-600">POST</span> /api/sessions/book
                          </div>
                          <div className="bg-white border border-yellow-200 rounded p-2">
                            <span className="text-purple-600">WEBHOOK</span> /api/webhooks/calcom
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </form>
      </motion.div>
    </div>
  )
}