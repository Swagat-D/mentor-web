/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  CheckCircle,
  User,
  GraduationCap,
  Clock,
  Shield,
  Edit3,
  Star,
  DollarSign,
  Globe,
  ArrowRight,
  FileText,
  MapPin,
  Languages,
  Menu,
  X,
  Loader,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from 'lucide-react'

interface OnboardingData {
  profile?: any
  expertise?: any
  availability?: any
  verification?: any
}

interface ProgressData {
  completedSteps: string[]
  currentStep: string
  isComplete: boolean
  isSubmitted: boolean
  profile: any
  verification: any
}

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
]

export default function OnboardingReview() {
  const [data, setData] = useState<OnboardingData>({})
  const [progressData, setProgressData] = useState<ProgressData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    fetchOnboardingData()
  }, [])

  const fetchOnboardingData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Fetch progress and all onboarding data
      const progressResponse = await fetch('/api/onboarding/progress', {
        credentials: 'include'
      })
      
      if (!progressResponse.ok) {
        throw new Error('Failed to fetch onboarding progress')
      }
      
      const progressResult = await progressResponse.json()
      setProgressData(progressResult.data)
      
      // Set the data from the API response
      setData({
        profile: progressResult.data.profile,
        verification: progressResult.data.verification
      })
      
    } catch (error: any) {
      console.error('Failed to fetch onboarding data:', error)
      setError(error.message || 'Failed to load application data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFinalSubmission = async () => {
    if (!progressData?.isComplete) {
      setError('Please complete all onboarding steps before submitting')
      return
    }

    setIsSubmitting(true)
    setError(null)
    
    try {
      const response = await fetch('/api/onboarding/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Submission failed')
      }

      // Show success message and redirect
      alert('Application submitted successfully! Our team will review it within 24-48 hours.')
      window.location.href = '/dashboard'
      
    } catch (error: any) {
      console.error('Submission failed:', error)
      setError(error.message || 'Submission failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    })
  }

  const renderLoadingState = () => (
    <div className="min-h-screen bg-gradient-to-br from-legal-bg-primary via-warm-100 to-legal-bg-secondary flex items-center justify-center">
      <div className="text-center">
        <Loader className="w-12 h-12 text-accent-600 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-baskervville font-bold text-legal-dark-text mb-2">
          Loading Your Application
        </h2>
        <p className="text-legal-warm-text font-montserrat">
          Please wait while we fetch your data...
        </p>
      </div>
    </div>
  )

  const renderErrorState = () => (
    <div className="min-h-screen bg-gradient-to-br from-legal-bg-primary via-warm-100 to-legal-bg-secondary flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-baskervville font-bold text-legal-dark-text mb-2">
          Unable to Load Application
        </h2>
        <p className="text-legal-warm-text font-montserrat mb-6">
          {error}
        </p>
        <button
          onClick={fetchOnboardingData}
          className="bg-accent-600 text-white font-semibold py-3 px-6 rounded-xl shadow-legal hover:shadow-legal-lg transition-all duration-300 font-montserrat flex items-center space-x-2 mx-auto"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Try Again</span>
        </button>
      </div>
    </div>
  )

  if (isLoading) return renderLoadingState()
  if (error && !data.profile) return renderErrorState()

  return (
    <div className="min-h-screen bg-gradient-to-br from-legal-bg-primary via-warm-100 to-legal-bg-secondary">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-legal-border/30 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-accent-700 to-accent-600 rounded-xl flex items-center justify-center shadow-legal">
                <Shield className="text-white font-bold w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-baskervville font-bold gradient-text">Application Review</h1>
                <p className="text-xs sm:text-sm text-legal-warm-text font-montserrat">MentorMatch</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="sm:hidden p-2 rounded-lg hover:bg-legal-bg-secondary transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-legal-dark-text" />
                ) : (
                  <Menu className="w-5 h-5 text-legal-dark-text" />
                )}
              </button>
              
              <button
                onClick={() => window.history.back()}
                className="hidden sm:block text-legal-warm-text hover:text-accent-600 font-montserrat font-medium text-sm"
              >
                ← Back
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3 mb-6"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700 font-montserrat text-sm">{error}</span>
            </motion.div>
          )}

          {/* Application Summary Header */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-legal-lg border border-warm-200/50 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-accent-100 to-accent-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-accent-600" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-baskervville font-bold text-legal-dark-text mb-2">
                Mentor Application Summary
              </h1>
              <p className="text-legal-warm-text font-montserrat mb-6 text-sm sm:text-base">
                {progressData?.isSubmitted 
                  ? 'Your application has been submitted and is under review'
                  : 'Complete overview of your mentor application details'
                }
              </p>
              
              {/* Progress Status */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                {[
                  { step: 'profile', label: 'Profile', icon: User },
                  { step: 'expertise', label: 'Expertise', icon: GraduationCap },
                  { step: 'availability', label: 'Availability', icon: Clock },
                  { step: 'verification', label: 'Verification', icon: Shield }
                ].map((item) => {
                  const isCompleted = progressData?.completedSteps.includes(item.step)
                  return (
                    <div key={item.step} className="text-center">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                        isCompleted ? 'bg-success-100' : 'bg-red-100'
                      }`}>
                        <item.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${
                          isCompleted ? 'text-success-600' : 'text-red-600'
                        }`} />
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-legal-dark-text">{item.label}</p>
                      <p className={`text-xs ${isCompleted ? 'text-success-600' : 'text-red-600'}`}>
                        {isCompleted ? 'Complete' : 'Incomplete'}
                      </p>
                    </div>
                  )
                })}
              </div>

              {progressData?.isSubmitted && (
                <div className="mt-6 p-4 bg-success-50 border border-success-200 rounded-lg">
                  <div className="flex items-center justify-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-success-600" />
                    <span className="text-success-700 font-semibold font-montserrat">
                      Application Submitted Successfully
                    </span>
                  </div>
                  <p className="text-success-600 text-sm mt-2 font-montserrat">
                    Our team will review your application within 24-48 hours
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6 sm:space-y-8">
            {/* Profile Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-legal-lg border border-warm-200/50 p-4 sm:p-6 lg:p-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
                <h2 className="text-xl sm:text-2xl font-baskervville font-bold text-legal-dark-text flex items-center">
                  <User className="w-6 h-6 sm:w-7 sm:h-7 mr-3 text-accent-600" />
                  Profile Information
                </h2>
                {!progressData?.isSubmitted && (
                  <button 
                    onClick={() => window.location.href = '/onboarding/profile'}
                    className="text-accent-600 hover:text-accent-700 flex items-center space-x-1 font-montserrat text-sm"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {data.profile ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-legal-dark-text mb-4 font-montserrat flex items-center text-sm sm:text-base">
                        <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-accent-600" />
                        Basic Information
                      </h4>
                      <div className="space-y-3 bg-legal-bg-secondary/20 rounded-xl p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <span className="text-legal-warm-text font-montserrat text-xs sm:text-sm">Display Name:</span>
                          <span className="text-legal-dark-text font-medium text-xs sm:text-sm">{data.profile.displayName || 'Not provided'}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <span className="text-legal-warm-text font-montserrat flex items-center text-xs sm:text-sm">
                            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            Location:
                          </span>
                          <span className="text-legal-dark-text font-medium text-xs sm:text-sm">{data.profile.location || 'Not provided'}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <span className="text-legal-warm-text font-montserrat flex items-center text-xs sm:text-sm">
                            <Globe className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            Timezone:
                          </span>
                          <span className="text-legal-dark-text font-medium text-xs break-all sm:break-normal">{data.profile.timezone || 'Not provided'}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-legal-dark-text mb-4 font-montserrat flex items-center text-sm sm:text-base">
                        <Languages className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-warm-600" />
                        Languages Spoken
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {data.profile.languages && data.profile.languages.length > 0 ? (
                          data.profile.languages.map((lang: string, index: number) => (
                            <span key={index} className="bg-warm-100 text-warm-700 px-2 sm:px-3 py-1 rounded-full text-xs font-montserrat">
                              {lang}
                            </span>
                          ))
                        ) : (
                          <span className="text-legal-warm-text text-xs sm:text-sm font-montserrat">No languages specified</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-legal-dark-text mb-4 font-montserrat text-sm sm:text-base">Professional Bio</h4>
                      <div className="bg-legal-bg-secondary/20 rounded-xl p-4">
                        <p className="text-legal-warm-text font-montserrat text-xs sm:text-sm leading-relaxed">
                          {data.profile.bio || 'No bio provided'}
                        </p>
                      </div>
                    </div>

                    {(data.profile.achievements || data.profile.socialLinks?.linkedin || data.profile.socialLinks?.website) && (
                      <div>
                        <h4 className="font-semibold text-legal-dark-text mb-4 font-montserrat text-sm sm:text-base">Additional Information</h4>
                        <div className="space-y-3 bg-legal-bg-secondary/20 rounded-xl p-4">
                          {data.profile.achievements && (
                            <div>
                              <span className="text-legal-warm-text font-montserrat text-xs sm:text-sm font-medium">Achievements:</span>
                              <p className="text-legal-dark-text text-xs sm:text-sm mt-1">{data.profile.achievements}</p>
                            </div>
                          )}
                          {data.profile.socialLinks?.linkedin && (
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                              <span className="text-legal-warm-text font-montserrat text-xs sm:text-sm">LinkedIn:</span>
                              <a href={data.profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" 
                                 className="text-accent-600 hover:text-accent-700 text-xs sm:text-sm underline break-all">
                                View Profile
                              </a>
                            </div>
                          )}
                          {data.profile.socialLinks?.website && (
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                              <span className="text-legal-warm-text font-montserrat text-xs sm:text-sm">Website:</span>
                              <a href={data.profile.socialLinks.website} target="_blank" rel="noopener noreferrer" 
                                 className="text-accent-600 hover:text-accent-700 text-xs sm:text-sm underline break-all">
                                Visit Website
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-legal-warm-text font-montserrat text-sm sm:text-base">Profile information not completed</p>
                  <button 
                    onClick={() => window.location.href = '/onboarding/profile'}
                    className="mt-4 text-accent-600 hover:text-accent-700 font-montserrat font-medium text-sm"
                  >
                    Complete Profile →
                  </button>
                </div>
              )}
            </motion.div>

            {/* Expertise Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-legal-lg border border-warm-200/50 p-4 sm:p-6 lg:p-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
                <h2 className="text-xl sm:text-2xl font-baskervville font-bold text-legal-dark-text flex items-center">
                  <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7 mr-3 text-warm-600" />
                  Areas of Expertise
                </h2>
                {!progressData?.isSubmitted && (
                  <button 
                    onClick={() => window.location.href = '/onboarding/expertise'}
                    className="text-accent-600 hover:text-accent-700 flex items-center space-x-1 font-montserrat text-sm"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {data.profile?.expertise ? (
                <div className="space-y-6 sm:space-y-8">
                  <div>
                    <h4 className="font-semibold text-legal-dark-text mb-4 font-montserrat text-sm sm:text-base">Subject Expertise</h4>
                    <div className="flex flex-wrap gap-2">
                      {data.profile.expertise.map((subject: string, index: number) => (
                        <span key={index} className="bg-warm-100 text-warm-700 px-3 py-2 rounded-lg text-sm font-montserrat">
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-legal-warm-text font-montserrat text-sm sm:text-base">Expertise information not completed</p>
                  <button 
                    onClick={() => window.location.href = '/onboarding/expertise'}
                    className="mt-4 text-accent-600 hover:text-accent-700 font-montserrat font-medium text-sm"
                  >
                    Complete Expertise →
                  </button>
                </div>
              )}
            </motion.div>

            {/* Manual Availability & Pricing */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-legal-lg border border-warm-200/50 p-4 sm:p-6 lg:p-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
                <h2 className="text-xl sm:text-2xl font-baskervville font-bold text-legal-dark-text flex items-center">
                  <Clock className="w-6 h-6 sm:w-7 sm:h-7 mr-3 text-success-600" />
                  Availability & Pricing
                </h2>
                {!progressData?.isSubmitted && (
                  <button 
                    onClick={() => window.location.href = '/onboarding/availability'}
                    className="text-accent-600 hover:text-accent-700 flex items-center space-x-1 font-montserrat text-sm"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              {data.profile?.weeklySchedule || data.profile?.hourlyRateINR ? (
                <div className="space-y-6 sm:space-y-8">
                  {/* Pricing Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    <div>
                      <h4 className="font-semibold text-legal-dark-text mb-4 font-montserrat flex items-center text-sm sm:text-base">
                        <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-success-600" />
                        Pricing Information
                      </h4>
                      <div className="space-y-4">
                        <div className="bg-success-50 rounded-xl p-4 border border-success-200">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 space-y-1 sm:space-y-0">
                            <span className="font-semibold text-success-800 font-montserrat text-sm">Hourly Rate</span>
                            <span className="text-xl sm:text-2xl font-bold text-success-700">
                              ₹{data.profile.hourlyRateINR || 'Not set'}
                            </span>
                          </div>
                          <p className="text-success-600 text-xs">Per hour (Indian Rupees)</p>
                        </div>
                        
                        {/* Session pricing */}
                        {data.profile.hourlyRateINR ? (
                          <div className="bg-white rounded-xl p-4 border border-legal-border">
                            <h5 className="font-semibold text-legal-dark-text mb-3 font-montserrat text-sm">Session Pricing</h5>
                            <div className="space-y-2 text-sm">
                              <span className="text-success-700 text-sm">Total Time Slots:</span>
                              <span className="text-success-800 font-medium text-sm">
                                {Object.values(data.profile.weeklySchedule).reduce((total: number, day: any) => 
                                  total + (day.timeSlots ? day.timeSlots.length : 0), 0
                                )} slots
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-success-700 text-sm">Timezone:</span>
                              <span className="text-success-800 font-medium text-sm">
                                {data.profile.timezone || 'Asia/Kolkata'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-success-700 text-sm">No schedule configured</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Weekly Schedule Details */}
                  {data.profile.weeklySchedule && (
                    <div>
                      <h4 className="font-semibold text-legal-dark-text mb-4 font-montserrat text-sm sm:text-base">
                        Weekly Availability
                      </h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {DAYS_OF_WEEK.map(({ key, label }) => {
                          const daySchedule = data.profile.weeklySchedule[key]
                          const isAvailable = daySchedule?.isAvailable && daySchedule?.timeSlots?.length > 0
                          
                          return (
                            <div key={key} className={`border-2 rounded-xl p-4 ${
                              isAvailable 
                                ? 'border-green-300 bg-green-50' 
                                : 'border-gray-200 bg-gray-50'
                            }`}>
                              <div className="flex items-center justify-between mb-3">
                                <h5 className={`font-semibold font-montserrat ${
                                  isAvailable ? 'text-green-700' : 'text-gray-500'
                                }`}>
                                  {label}
                                </h5>
                                {isAvailable && (
                                  <CheckCircle className="w-5 h-5 text-green-500" />
                                )}
                              </div>
                              
                              {isAvailable ? (
                                <div className="space-y-2">
                                  {daySchedule.timeSlots.map((slot: any, index: number) => (
                                    <div key={index} className="bg-white rounded-lg p-2 border border-green-200">
                                      <div className="flex items-center justify-center space-x-2 text-sm">
                                        <span className="text-green-700 font-medium">
                                          {formatTime(slot.startTime)}
                                        </span>
                                        <span className="text-green-600">to</span>
                                        <span className="text-green-700 font-medium">
                                          {formatTime(slot.endTime)}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-gray-500 text-sm">Not available</p>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Session Details */}
                  <div className="bg-legal-bg-secondary/20 rounded-xl p-4 sm:p-6">
                    <h5 className="font-semibold text-legal-dark-text mb-4 font-montserrat text-sm sm:text-base">Session Details</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
                      <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row sm:justify-between">
                          <span className="text-legal-warm-text">Session Duration:</span>
                          <span className="text-legal-dark-text font-medium">60 minutes</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between">
                          <span className="text-legal-warm-text">Session Type:</span>
                          <span className="text-legal-dark-text font-medium">One-on-one mentoring</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex flex-col sm:flex-row sm:justify-between">
                          <span className="text-legal-warm-text">Booking Method:</span>
                          <span className="text-legal-dark-text font-medium">Manual scheduling</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between">
                          <span className="text-legal-warm-text">Meeting Platform:</span>
                          <span className="text-legal-dark-text font-medium">To be arranged</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-legal-warm-text font-montserrat text-sm sm:text-base">Availability information not completed</p>
                  <button 
                    onClick={() => window.location.href = '/onboarding/availability'}
                    className="mt-4 text-accent-600 hover:text-accent-700 font-montserrat font-medium text-sm"
                  >
                    Complete Availability →
                  </button>
                </div>
              )}
            </motion.div>

            {/* Verification & Documents */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-legal-lg border border-warm-200/50 p-4 sm:p-6 lg:p-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
                <h2 className="text-xl sm:text-2xl font-baskervville font-bold text-legal-dark-text flex items-center">
                  <Shield className="w-6 h-6 sm:w-7 sm:h-7 mr-3 text-accent-600" />
                  Verification Status
                </h2>
                {!progressData?.isSubmitted && (
                  <button 
                    onClick={() => window.location.href = '/onboarding/verification'}
                    className="text-accent-600 hover:text-accent-700 flex items-center space-x-1 font-montserrat text-sm"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Resume Section */}
                <div>
                  <h4 className="font-semibold text-legal-dark-text mb-4 font-montserrat flex items-center text-sm sm:text-base">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-accent-600" />
                    Resume
                  </h4>
                  <div className="bg-accent-50 rounded-xl p-4 border border-accent-200">
                    {data.profile?.hasResume || data.verification?.resume ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-accent-600" />
                          </div>
                          <div>
                            <p className="font-medium text-accent-700 text-sm">Resume Uploaded</p>
                            <p className="text-accent-600 text-xs">Available for review</p>
                          </div>
                        </div>
                        <CheckCircle className="w-5 h-5 text-success-500" />
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-600 text-sm">No Resume Uploaded</p>
                          <p className="text-gray-500 text-xs">Resume upload was optional</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Information */}
                {(data.profile?.linkedinProfile || data.profile?.personalWebsite || data.profile?.additionalNotes) && (
                  <div>
                    <h4 className="font-semibold text-legal-dark-text mb-4 font-montserrat text-sm sm:text-base">
                      Additional Information
                    </h4>
                    <div className="space-y-3 bg-legal-bg-secondary/20 rounded-xl p-4">
                      {data.profile.linkedinProfile && (
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                          <span className="text-legal-warm-text font-montserrat text-xs sm:text-sm">LinkedIn:</span>
                          <a href={data.profile.linkedinProfile} target="_blank" rel="noopener noreferrer" 
                             className="text-accent-600 hover:text-accent-700 text-xs sm:text-sm underline break-all flex items-center">
                            View Profile <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </div>
                      )}
                      {data.profile.personalWebsite && (
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                          <span className="text-legal-warm-text font-montserrat text-xs sm:text-sm">Website:</span>
                          <a href={data.profile.personalWebsite} target="_blank" rel="noopener noreferrer" 
                             className="text-accent-600 hover:text-accent-700 text-xs sm:text-sm underline break-all flex items-center">
                            Visit Website <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </div>
                      )}
                      {data.profile.additionalNotes && (
                        <div>
                          <span className="text-legal-warm-text font-montserrat text-xs sm:text-sm font-medium">Additional Notes:</span>
                          <p className="text-legal-dark-text text-xs sm:text-sm mt-1 leading-relaxed">{data.profile.additionalNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Verification Status */}
                <div className="bg-success-50 rounded-xl p-4 border border-success-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-success-800 font-montserrat text-sm">Verification Status</span>
                    <CheckCircle className="w-5 h-5 text-success-500" />
                  </div>
                  <p className="text-success-700 text-sm font-montserrat">
                    Terms and conditions accepted - Ready for review
                  </p>
                  {data.verification?.status && (
                    <p className="text-success-600 text-xs mt-1">
                      Current Status: {data.verification.status.charAt(0).toUpperCase() + data.verification.status.slice(1)}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Final Submission Section */}
            {!progressData?.isSubmitted && progressData?.isComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-r from-accent-700 to-accent-600 rounded-2xl p-6 sm:p-8 text-white text-center"
              >
                <div className="max-w-2xl mx-auto">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl sm:text-2xl font-baskervville font-bold mb-4">
                    Ready to Submit Your Application?
                  </h3>
                  
                  <p className="text-white/90 font-montserrat mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
                    You&apos;ve completed all sections of your mentor application. Once submitted, 
                    our team will review your information and credentials within 24-48 hours.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 sm:mb-8 text-left">
                    <div className="bg-white/10 rounded-xl p-3 sm:p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="font-semibold font-montserrat text-sm">Quick Review</span>
                      </div>
                      <p className="text-xs text-white/80 font-montserrat">
                        Most applications reviewed within 24 hours
                      </p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3 sm:p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="font-semibold font-montserrat text-sm">Secure Process</span>
                      </div>
                      <p className="text-xs text-white/80 font-montserrat">
                        Your information is encrypted and secure
                      </p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3 sm:p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Star className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="font-semibold font-montserrat text-sm">Start Mentoring</span>
                      </div>
                      <p className="text-xs text-white/80 font-montserrat">
                        Begin mentoring immediately after approval
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleFinalSubmission}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto bg-white text-accent-700 font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-montserrat flex items-center justify-center space-x-2 mx-auto text-sm sm:text-base"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        <span>Submitting Application...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit My Application</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>

                  <p className="text-xs text-white/70 mt-4 font-montserrat">
                    By submitting, you confirm all information provided is accurate and complete.
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}