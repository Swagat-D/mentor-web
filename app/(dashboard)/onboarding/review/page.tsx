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
  Calendar,
  DollarSign,
  Globe,
  ArrowRight,
  Download,
  FileText,
  MapPin,
  Languages,
  Camera
} from 'lucide-react'

interface OnboardingData {
  profile?: any
  expertise?: any
  availability?: any
  verification?: any
}

export default function OnboardingReview() {
  const [data, setData] = useState<OnboardingData>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Load all onboarding data from localStorage
    const profileData = localStorage.getItem('onboarding-profile')
    const expertiseData = localStorage.getItem('onboarding-expertise')
    const availabilityData = localStorage.getItem('onboarding-availability')
    const verificationData = localStorage.getItem('onboarding-verification')

    setData({
      profile: profileData ? JSON.parse(profileData) : null,
      expertise: expertiseData ? JSON.parse(expertiseData) : null,
      availability: availabilityData ? JSON.parse(availabilityData) : null,
      verification: verificationData ? JSON.parse(verificationData) : null,
    })
  }, [])

  const handleFinalSubmission = async () => {
    setIsSubmitting(true)
    
    try {
      // Simulate final API submission
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Clear onboarding data
      localStorage.removeItem('onboarding-progress')
      localStorage.removeItem('onboarding-profile')
      localStorage.removeItem('onboarding-expertise')
      localStorage.removeItem('onboarding-availability')
      localStorage.removeItem('onboarding-verification')
      
      // Redirect to dashboard
      window.location.href = '/dashboard'
      
    } catch (error) {
      console.error('Submission failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const generateReport = () => {
    // Generate a downloadable report
    const reportData = {
      timestamp: new Date().toISOString(),
      applicantName: `${data.profile?.firstName || ''} ${data.profile?.lastName || ''}`.trim(),
      ...data
    }
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mentor-application-summary.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-legal-bg-primary via-warm-100 to-legal-bg-secondary">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-legal-border/30 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-700 to-accent-600 rounded-xl flex items-center justify-center shadow-legal">
                <Shield className="text-white font-bold text-lg w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-baskervville font-bold gradient-text">Application Review</h1>
                <p className="text-sm text-legal-warm-text font-montserrat">MentorMatch</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={generateReport}
                className="flex items-center space-x-2 bg-white text-accent-700 font-semibold py-2 px-4 rounded-lg border border-accent-200 shadow-warm hover:shadow-warm-lg transition-all duration-300 font-montserrat"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
              <button
                onClick={() => window.history.back()}
                className="text-legal-warm-text hover:text-accent-600 font-montserrat font-medium"
              >
                ← Back
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Application Summary Header */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-legal-lg border border-warm-200/50 p-8 mb-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-accent-100 to-accent-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-accent-600" />
              </div>
              <h1 className="text-3xl font-baskervville font-bold text-legal-dark-text mb-2">
                Mentor Application Summary
              </h1>
              <p className="text-legal-warm-text font-montserrat mb-6">
                Complete overview of your mentor application details
              </p>
              
              <div className="grid md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${data.profile ? 'bg-success-100' : 'bg-red-100'}`}>
                    <User className={`w-6 h-6 ${data.profile ? 'text-success-600' : 'text-red-600'}`} />
                  </div>
                  <p className="text-sm font-medium text-legal-dark-text">Profile</p>
                  <p className={`text-xs ${data.profile ? 'text-success-600' : 'text-red-600'}`}>
                    {data.profile ? 'Complete' : 'Incomplete'}
                  </p>
                </div>
                <div className="text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${data.expertise ? 'bg-success-100' : 'bg-red-100'}`}>
                    <GraduationCap className={`w-6 h-6 ${data.expertise ? 'text-success-600' : 'text-red-600'}`} />
                  </div>
                  <p className="text-sm font-medium text-legal-dark-text">Expertise</p>
                  <p className={`text-xs ${data.expertise ? 'text-success-600' : 'text-red-600'}`}>
                    {data.expertise ? 'Complete' : 'Incomplete'}
                  </p>
                </div>
                <div className="text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${data.availability ? 'bg-success-100' : 'bg-red-100'}`}>
                    <Clock className={`w-6 h-6 ${data.availability ? 'text-success-600' : 'text-red-600'}`} />
                  </div>
                  <p className="text-sm font-medium text-legal-dark-text">Availability</p>
                  <p className={`text-xs ${data.availability ? 'text-success-600' : 'text-red-600'}`}>
                    {data.availability ? 'Complete' : 'Incomplete'}
                  </p>
                </div>
                <div className="text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${data.verification ? 'bg-success-100' : 'bg-red-100'}`}>
                    <Shield className={`w-6 h-6 ${data.verification ? 'text-success-600' : 'text-red-600'}`} />
                  </div>
                  <p className="text-sm font-medium text-legal-dark-text">Verification</p>
                  <p className={`text-xs ${data.verification ? 'text-success-600' : 'text-red-600'}`}>
                    {data.verification ? 'Complete' : 'Incomplete'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Profile Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-legal-lg border border-warm-200/50 p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-baskervville font-bold text-legal-dark-text flex items-center">
                  <User className="w-7 h-7 mr-3 text-accent-600" />
                  Profile Information
                </h2>
                <button 
                  onClick={() => window.location.href = '/onboarding/profile'}
                  className="text-accent-600 hover:text-accent-700 flex items-center space-x-1 font-montserrat"
                >
                  <Edit3 className="w-4 h-4" />
                  <span className="text-sm">Edit</span>
                </button>
              </div>

              {data.profile ? (
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-legal-dark-text mb-4 font-montserrat flex items-center">
                        <User className="w-5 h-5 mr-2 text-accent-600" />
                        Basic Information
                      </h4>
                      <div className="space-y-3 bg-legal-bg-secondary/20 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-legal-warm-text font-montserrat">Display Name:</span>
                          <span className="text-legal-dark-text font-medium">{data.profile.displayName || 'Not provided'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-legal-warm-text font-montserrat flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            Location:
                          </span>
                          <span className="text-legal-dark-text font-medium">{data.profile.location || 'Not provided'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-legal-warm-text font-montserrat flex items-center">
                            <Globe className="w-4 h-4 mr-1" />
                            Timezone:
                          </span>
                          <span className="text-legal-dark-text font-medium text-sm">{data.profile.timezone || 'Not provided'}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-legal-dark-text mb-4 font-montserrat flex items-center">
                        <Languages className="w-5 h-5 mr-2 text-warm-600" />
                        Languages Spoken
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {data.profile.languages && data.profile.languages.length > 0 ? (
                          data.profile.languages.map((lang: string, index: number) => (
                            <span key={index} className="bg-warm-100 text-warm-700 px-3 py-1 rounded-full text-sm font-montserrat">
                              {lang}
                            </span>
                          ))
                        ) : (
                          <span className="text-legal-warm-text text-sm font-montserrat">No languages specified</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-legal-dark-text mb-4 font-montserrat">Professional Bio</h4>
                      <div className="bg-legal-bg-secondary/20 rounded-xl p-4">
                        <p className="text-legal-warm-text font-montserrat text-sm leading-relaxed">
                          {data.profile.bio || 'No bio provided'}
                        </p>
                      </div>
                    </div>

                    {(data.profile.achievements || data.profile.socialMedia?.linkedin || data.profile.socialMedia?.website) && (
                      <div>
                        <h4 className="font-semibold text-legal-dark-text mb-4 font-montserrat">Additional Information</h4>
                        <div className="space-y-3 bg-legal-bg-secondary/20 rounded-xl p-4">
                          {data.profile.achievements && (
                            <div>
                              <span className="text-legal-warm-text font-montserrat text-sm font-medium">Achievements:</span>
                              <p className="text-legal-dark-text text-sm mt-1">{data.profile.achievements}</p>
                            </div>
                          )}
                          {data.profile.socialMedia?.linkedin && (
                            <div className="flex items-center space-x-2">
                              <span className="text-legal-warm-text font-montserrat text-sm">LinkedIn:</span>
                              <a href={data.profile.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" 
                                 className="text-accent-600 hover:text-accent-700 text-sm underline">
                                View Profile
                              </a>
                            </div>
                          )}
                          {data.profile.socialMedia?.website && (
                            <div className="flex items-center space-x-2">
                              <span className="text-legal-warm-text font-montserrat text-sm">Website:</span>
                              <a href={data.profile.socialMedia.website} target="_blank" rel="noopener noreferrer" 
                                 className="text-accent-600 hover:text-accent-700 text-sm underline">
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
                  <p className="text-legal-warm-text font-montserrat">Profile information not completed</p>
                  <button 
                    onClick={() => window.location.href = '/onboarding/profile'}
                    className="mt-4 text-accent-600 hover:text-accent-700 font-montserrat font-medium"
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
              className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-legal-lg border border-warm-200/50 p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-baskervville font-bold text-legal-dark-text flex items-center">
                  <GraduationCap className="w-7 h-7 mr-3 text-warm-600" />
                  Areas of Expertise
                </h2>
                <button 
                  onClick={() => window.location.href = '/onboarding/expertise'}
                  className="text-accent-600 hover:text-accent-700 flex items-center space-x-1 font-montserrat"
                >
                  <Edit3 className="w-4 h-4" />
                  <span className="text-sm">Edit</span>
                </button>
              </div>

              {data.expertise ? (
                <div className="space-y-8">
                  <div>
                    <h4 className="font-semibold text-legal-dark-text mb-4 font-montserrat">Subject Expertise</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      {data.expertise.subjects && data.expertise.subjects.length > 0 ? (
                        data.expertise.subjects.map((subject: any, index: number) => (
                          <div key={index} className="bg-warm-50 rounded-xl p-4 border border-warm-200">
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-semibold text-legal-dark-text font-montserrat">{subject.name}</h5>
                              <span className="text-xs bg-warm-200 text-warm-800 px-2 py-1 rounded-full">
                                {subject.level}
                              </span>
                            </div>
                            <p className="text-sm text-warm-700 font-montserrat">
                              <strong>Experience:</strong> {subject.experience}
                            </p>
                          </div>
                        ))
                      ) : (
                        <span className="text-legal-warm-text text-sm col-span-2">No subjects specified</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-legal-dark-text mb-4 font-montserrat">Teaching Styles</h4>
                    <div className="flex flex-wrap gap-2">
                      {data.expertise.teachingStyles && data.expertise.teachingStyles.length > 0 ? (
                        data.expertise.teachingStyles.map((style: string, index: number) => (
                          <span key={index} className="bg-success-100 text-success-700 px-3 py-2 rounded-lg text-sm font-montserrat">
                            {style}
                          </span>
                        ))
                      ) : (
                        <span className="text-legal-warm-text text-sm">No teaching styles specified</span>
                      )}
                    </div>
                  </div>

                  {data.expertise.specializations && data.expertise.specializations.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-legal-dark-text mb-4 font-montserrat">Specializations</h4>
                      <div className="flex flex-wrap gap-2">
                        {data.expertise.specializations.map((spec: string, index: number) => (
                          <span key={index} className="bg-accent-100 text-accent-700 px-3 py-2 rounded-lg text-sm font-montserrat">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-legal-warm-text font-montserrat">Expertise information not completed</p>
                  <button 
                    onClick={() => window.location.href = '/onboarding/expertise'}
                    className="mt-4 text-accent-600 hover:text-accent-700 font-montserrat font-medium"
                  >
                    Complete Expertise →
                  </button>
                </div>
              )}
            </motion.div>

            {/* Availability & Pricing */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-legal-lg border border-warm-200/50 p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-baskervville font-bold text-legal-dark-text flex items-center">
                  <Clock className="w-7 h-7 mr-3 text-success-600" />
                  Availability & Pricing
                </h2>
                <button 
                  onClick={() => window.location.href = '/onboarding/availability'}
                  className="text-accent-600 hover:text-accent-700 flex items-center space-x-1 font-montserrat"
                >
                  <Edit3 className="w-4 h-4" />
                  <span className="text-sm">Edit</span>
                </button>
              </div>

              {data.availability ? (
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-legal-dark-text mb-4 font-montserrat flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-success-600" />
                      Weekly Schedule
                    </h4>
                    <div className="space-y-2">
                      {data.availability.weeklySchedule && data.availability.weeklySchedule.filter((slot: any) => slot.available).length > 0 ? (
                        data.availability.weeklySchedule
                          .filter((slot: any) => slot.available)
                          .map((slot: any, index: number) => (
                            <div key={index} className="flex justify-between items-center bg-success-50 rounded-lg p-3 border border-success-200">
                              <span className="font-medium text-success-800 font-montserrat">{slot.day}</span>
                              <span className="text-success-700 font-montserrat text-sm">{slot.startTime} - {slot.endTime}</span>
                            </div>
                          ))
                      ) : (
                        <span className="text-legal-warm-text text-sm">No availability set</span>
                      )}
                    </div>

                    {data.availability.preferences && (
                      <div className="mt-6">
                        <h5 className="font-semibold text-legal-dark-text mb-3 font-montserrat">Session Preferences</h5>
                        <div className="bg-legal-bg-secondary/20 rounded-xl p-4 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-legal-warm-text">Session Length:</span>
                            <span className="text-legal-dark-text font-medium">{data.availability.preferences.sessionLength || 'Not set'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-legal-warm-text">Advance Booking:</span>
                            <span className="text-legal-dark-text font-medium">{data.availability.preferences.advanceBooking || 'Not set'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-legal-warm-text">Max Students/Week:</span>
                            <span className="text-legal-dark-text font-medium">{data.availability.preferences.maxStudentsPerWeek || 'Not set'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-legal-warm-text">Session Type:</span>
                            <span className="text-legal-dark-text font-medium text-right">{data.availability.preferences.preferredSessionType || 'Not set'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-legal-warm-text">Cancellation Policy:</span>
                            <span className="text-legal-dark-text font-medium text-right">{data.availability.preferences.cancellationPolicy || 'Not set'}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold text-legal-dark-text mb-4 font-montserrat flex items-center">
                      <DollarSign className="w-5 h-5 mr-2 text-success-600" />
                      Pricing Information
                    </h4>
                    <div className="space-y-4">
                      <div className="bg-success-50 rounded-xl p-4 border border-success-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-success-800 font-montserrat">Hourly Rate</span>
                          <span className="text-2xl font-bold text-success-700">
                            ${data.availability.pricing?.hourlyRate || 'Not set'}
                          </span>
                        </div>
                        <p className="text-success-600 text-sm">Per hour session</p>
                      </div>
                      
                      {data.availability.pricing?.trialSession && (
                        <div className="bg-warm-50 rounded-xl p-4 border border-warm-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-warm-800 font-montserrat flex items-center">
                              <Star className="w-4 h-4 mr-1" />
                              Trial Rate
                            </span>
                            <span className="text-xl font-bold text-warm-700">
                              ${data.availability.pricing.trialRate}
                            </span>
                          </div>
                          <p className="text-warm-600 text-sm">First session discount</p>
                        </div>
                      )}

                      {data.availability.pricing?.groupSessions && (
                        <div className="bg-accent-50 rounded-xl p-4 border border-accent-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-accent-800 font-montserrat flex items-center">
                              <Globe className="w-4 h-4 mr-1" />
                              Group Rate
                            </span>
                            <span className="text-xl font-bold text-accent-700">
                              ${data.availability.pricing.groupRate}
                            </span>
                          </div>
                          <p className="text-accent-600 text-sm">Per student in group</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-legal-warm-text font-montserrat">Availability information not completed</p>
                  <button 
                    onClick={() => window.location.href = '/onboarding/availability'}
                    className="mt-4 text-accent-600 hover:text-accent-700 font-montserrat font-medium"
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
              className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-legal-lg border border-warm-200/50 p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-baskervville font-bold text-legal-dark-text flex items-center">
                  <Shield className="w-7 h-7 mr-3 text-accent-600" />
                  Verification & Documents
                </h2>
                <button 
                  onClick={() => window.location.href = '/onboarding/verification'}
                  className="text-accent-600 hover:text-accent-700 flex items-center space-x-1 font-montserrat"
                >
                  <Edit3 className="w-4 h-4" />
                  <span className="text-sm">Edit</span>
                </button>
              </div>

              {data.verification ? (
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-legal-dark-text mb-4 font-montserrat">Documents Submitted</h4>
                    <div className="space-y-3">
                      {[
                        { key: 'idDocument', label: 'Government ID', required: true },
                        { key: 'educationCertificate', label: 'Education Certificate', required: true },
                        { key: 'professionalCertification', label: 'Professional Certification', required: false },
                        { key: 'backgroundCheck', label: 'Background Check', required: false }
                      ].map((doc) => (
                        <div key={doc.key} className="flex items-center justify-between bg-legal-bg-secondary/20 rounded-lg p-3">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-accent-600" />
                            <div>
                              <span className="text-legal-dark-text font-medium font-montserrat">{doc.label}</span>
                              {doc.required && <span className="text-red-500 text-xs ml-1">*</span>}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs px-2 py-1 rounded-full font-montserrat ${
                              data.verification.documents?.[doc.key] 
                                ? 'bg-success-100 text-success-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {data.verification.documents?.[doc.key] ? 'Submitted' : 'Missing'}
                            </span>
                            {data.verification.documents?.[doc.key] && (
                              <span className="text-xs text-legal-warm-text">
                                {formatFileSize(data.verification.documents[doc.key].size)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {data.verification.videoIntroduction && (
                      <div className="mt-6">
                        <h5 className="font-semibold text-legal-dark-text mb-3 font-montserrat flex items-center">
                          <Camera className="w-5 h-5 mr-2 text-warm-600" />
                          Video Introduction
                        </h5>
                        <div className="bg-warm-50 rounded-lg p-3 border border-warm-200">
                          <div className="flex items-center justify-between">
                            <span className="text-warm-800 font-medium font-montserrat">
                              {data.verification.videoIntroduction.name}
                            </span>
                            <span className="text-xs text-warm-600">
                              {formatFileSize(data.verification.videoIntroduction.size)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold text-legal-dark-text mb-4 font-montserrat">Verification Status</h4>
                    <div className="space-y-4">
                      <div className="bg-legal-bg-secondary/20 rounded-xl p-4">
                        <h5 className="font-medium text-legal-dark-text mb-3 font-montserrat">Agreements</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-legal-warm-text font-montserrat">Background Check Consent:</span>
                            <span className={`font-medium ${
                              data.verification.additionalInfo?.agreeToBackgroundCheck ? 'text-success-600' : 'text-red-600'
                            }`}>
                              {data.verification.additionalInfo?.agreeToBackgroundCheck ? '✓ Agreed' : '✗ Required'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-legal-warm-text font-montserrat">Terms Agreement:</span>
                            <span className={`font-medium ${
                              data.verification.additionalInfo?.agreeToTerms ? 'text-success-600' : 'text-red-600'
                            }`}>
                              {data.verification.additionalInfo?.agreeToTerms ? '✓ Agreed' : '✗ Required'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {(data.verification.additionalInfo?.linkedinProfile || data.verification.additionalInfo?.personalWebsite) && (
                        <div className="bg-accent-50 rounded-xl p-4 border border-accent-200">
                          <h5 className="font-medium text-accent-800 mb-3 font-montserrat">Professional Links</h5>
                          <div className="space-y-2 text-sm">
                            {data.verification.additionalInfo.linkedinProfile && (
                              <div>
                                <span className="text-accent-700 font-montserrat">LinkedIn: </span>
                                <a href={data.verification.additionalInfo.linkedinProfile} 
                                   target="_blank" rel="noopener noreferrer"
                                   className="text-accent-600 hover:text-accent-800 underline">
                                  View Profile
                                </a>
                              </div>
                            )}
                            {data.verification.additionalInfo.personalWebsite && (
                              <div>
                                <span className="text-accent-700 font-montserrat">Website: </span>
                                <a href={data.verification.additionalInfo.personalWebsite} 
                                   target="_blank" rel="noopener noreferrer"
                                   className="text-accent-600 hover:text-accent-800 underline">
                                  Visit Website
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {data.verification.additionalInfo?.additionalNotes && (
                        <div className="bg-warm-50 rounded-xl p-4 border border-warm-200">
                          <h5 className="font-medium text-warm-800 mb-2 font-montserrat">Additional Notes</h5>
                          <p className="text-warm-700 text-sm font-montserrat leading-relaxed">
                            {data.verification.additionalInfo.additionalNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-legal-warm-text font-montserrat">Verification information not completed</p>
                  <button 
                    onClick={() => window.location.href = '/onboarding/verification'}
                    className="mt-4 text-accent-600 hover:text-accent-700 font-montserrat font-medium"
                  >
                    Complete Verification →
                  </button>
                </div>
              )}
            </motion.div>

            {/* Final Submission Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-r from-accent-700 to-accent-600 rounded-2xl p-8 text-white text-center"
            >
              <div className="max-w-2xl mx-auto">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-baskervville font-bold mb-4">
                  Ready to Submit Your Application?
                </h3>
                
                <p className="text-white/90 font-montserrat mb-8 leading-relaxed">
                  You&apos;ve completed all sections of your mentor application. Once submitted, 
                  our team will review your information and credentials within 24-48 hours.
                </p>

                <div className="grid md:grid-cols-3 gap-4 mb-8 text-left">
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="w-5 h-5" />
                      <span className="font-semibold font-montserrat">Quick Review</span>
                    </div>
                    <p className="text-sm text-white/80 font-montserrat">
                      Most applications reviewed within 24 hours
                    </p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="w-5 h-5" />
                      <span className="font-semibold font-montserrat">Secure Process</span>
                    </div>
                    <p className="text-sm text-white/80 font-montserrat">
                      Your information is encrypted and secure
                    </p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="w-5 h-5" />
                      <span className="font-semibold font-montserrat">Start Earning</span>
                    </div>
                    <p className="text-sm text-white/80 font-montserrat">
                      Begin mentoring immediately after approval
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleFinalSubmission}
                  disabled={isSubmitting}
                  className="bg-white text-accent-700 font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-montserrat flex items-center space-x-2 mx-auto"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-accent-300 border-t-accent-700 rounded-full animate-spin" />
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
          </div>
        </motion.div>
      </div>
    </div>
  )
}