/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Upload,
  FileText,
  Shield,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  X,
  Eye,
  User,
  Globe
} from 'lucide-react'

interface UploadedFile {
  name: string
  size: number
  type: string
  url: string
  file: File
}

export default function OnboardingVerification() {
  const [resume, setResume] = useState<UploadedFile | null>(null)
  const [additionalInfo, setAdditionalInfo] = useState({
    linkedinProfile: '',
    personalWebsite: '',
    additionalNotes: '',
    agreeToTerms: false
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleResumeUpload = async (file: File) => {
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (file.size > maxSize) {
      setErrors(prev => ({
        ...prev,
        resume: 'Resume file must be less than 10MB'
      }))
      return
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        resume: 'Invalid file type. Please upload PDF or Word document'
      }))
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'resume')

      const response = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        const uploadedFile: UploadedFile = {
          name: file.name,
          size: file.size,
          type: file.type,
          url: result.data.url,
          file: file,
        }

        setResume(uploadedFile)
        
        // Clear error
        if (errors.resume) {
          setErrors(prev => ({ ...prev, resume: '' }))
        }
      } else {
        setErrors(prev => ({ ...prev, resume: result.message }))
      }
    } catch (error) {
      console.error('Upload error:', error)
      setErrors(prev => ({ ...prev, resume: 'Upload failed' }))
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setAdditionalInfo(prev => ({ ...prev, [field]: value }))
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const removeResume = () => {
    setResume(null)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Check required agreements
    if (!additionalInfo.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    
    try {
      const response = await fetch('/api/onboarding/verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          resume: resume ? {
            name: resume.name,
            size: resume.size,
            type: resume.type,
            url: resume.url,
          } : null,
          additionalInfo,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message)
      }

      // Save progress and show popup
      const currentProgress = JSON.parse(localStorage.getItem('onboarding-progress') || '[]')
      localStorage.setItem('onboarding-progress', JSON.stringify([...currentProgress, 'verification']))
      setShowPopup(true)
      
    } catch (error: any) {
      console.error('Verification save error:', error)
      setErrors({ general: error.message || 'Something went wrong. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFinalSubmission = async () => {
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/onboarding/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message)
      }

      // Clear onboarding data
      localStorage.removeItem('onboarding-progress')
      localStorage.removeItem('onboarding-profile')
      localStorage.removeItem('onboarding-expertise')
      localStorage.removeItem('onboarding-availability')
      localStorage.removeItem('onboarding-verification')
      
      // Show success message
      alert('Application submitted successfully! Our team will review it within 24-48 hours.')
      
      // Redirect to dashboard
      window.location.href = '/dashboard'
      
    } catch (error: any) {
      console.error('Submission failed:', error)
      alert(`Submission failed: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReviewApplication = () => {
    // Redirect to review page
    window.location.href = '/onboarding/review'
  }

  return (
    <>
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-legal-lg border border-warm-200/50 p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-6 sm:mb-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-100 to-accent-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-accent-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-baskervville font-bold text-legal-dark-text mb-2">
              Final Step: Verification
            </h1>
            <p className="text-legal-warm-text font-montserrat text-sm sm:text-base max-w-2xl mx-auto">
              Almost there! Complete your profile with optional resume upload and additional information
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

            {/* Resume Upload Section */}
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-300 rounded-2xl p-6 sm:p-8">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-baskervville font-bold text-blue-800 mb-2">
                  Upload Your Resume
                </h3>
                <p className="text-blue-600 font-montserrat text-sm">
                  Optional but recommended - Help students learn about your background
                </p>
              </div>

              <div className={`border-2 border-dashed rounded-xl p-6 sm:p-8 transition-all duration-300 ${
                resume
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-blue-300 hover:border-blue-400 hover:bg-blue-50/50'
              }`}>
                <div className="text-center">
                  {resume ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-4"
                    >
                      <div className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm max-w-md mx-auto">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3 min-w-0 flex-1">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-blue-700 truncate">
                                {resume.name}
                              </p>
                              <p className="text-xs text-blue-600">
                                {formatFileSize(resume.size)}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={removeResume}
                            className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-all ml-2"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex justify-center space-x-3">
                        <label className="bg-blue-100 text-blue-700 font-semibold py-2 px-4 rounded-lg hover:bg-blue-200 transition-colors cursor-pointer inline-flex items-center space-x-2 font-montserrat text-sm">
                          <Upload className="w-4 h-4" />
                          <span>Replace Resume</span>
                          <input 
                            type="file" 
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleResumeUpload(file)
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </motion.div>
                  ) : (
                    <div>
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-6 h-6 text-blue-600" />
                      </div>
                      
                      <h4 className="font-semibold text-blue-800 font-baskervville mb-2 text-sm sm:text-base">
                        Upload Your Resume
                      </h4>
                      <p className="text-xs sm:text-sm text-blue-600 font-montserrat mb-6">
                        Share your professional background to build trust with students
                      </p>

                      <label className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer inline-flex items-center space-x-2 font-montserrat text-sm">
                        <Upload className="w-5 h-5" />
                        <span>Choose Resume File</span>
                        <input 
                          type="file" 
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleResumeUpload(file)
                          }}
                          className="hidden"
                        />
                      </label>
                      
                      <div className="mt-4 text-xs text-blue-600 font-montserrat">
                        <p>Supported formats: PDF, DOC, DOCX</p>
                        <p>Maximum size: 10MB</p>
                      </div>
                    </div>
                  )}

                  {errors.resume && (
                    <p className="mt-4 text-sm text-red-600 font-montserrat bg-red-50 p-2 rounded-lg">
                      {errors.resume}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-300 rounded-2xl p-6 sm:p-8">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-baskervville font-bold text-green-800 mb-2">
                  Additional Information
                </h3>
                <p className="text-green-600 font-montserrat text-sm">
                  Help students connect with you through your professional profiles
                </p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex text-sm font-medium text-green-800 font-montserrat items-center">
                      <Globe className="w-4 h-4 mr-2" />
                      LinkedIn Profile
                      <span className="text-green-600 font-normal ml-1">(Optional)</span>
                    </label>
                    <input
                      type="url"
                      value={additionalInfo.linkedinProfile}
                      onChange={(e) => handleInputChange('linkedinProfile', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-green-300 rounded-xl font-montserrat transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-sm sm:text-base"
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex text-sm font-medium text-green-800 font-montserrat items-center">
                      <Globe className="w-4 h-4 mr-2" />
                      Personal Website
                      <span className="text-green-600 font-normal ml-1">(Optional)</span>
                    </label>
                    <input
                      type="url"
                      value={additionalInfo.personalWebsite}
                      onChange={(e) => handleInputChange('personalWebsite', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-green-300 rounded-xl font-montserrat transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-sm sm:text-base"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-green-800 font-montserrat">
                    Additional Notes
                    <span className="text-green-600 font-normal ml-1">(Optional)</span>
                  </label>
                  <textarea
                    value={additionalInfo.additionalNotes}
                    onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-green-300 rounded-xl font-montserrat transition-all resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-sm sm:text-base"
                    placeholder="Share anything else you'd like students to know about your teaching approach, experience, or specializations..."
                  />
                </div>
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-6 sm:p-8">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-baskervville font-bold text-amber-800 mb-2">
                  Terms & Conditions
                </h3>
                <p className="text-amber-600 font-montserrat text-sm">
                  Please review and accept our mentoring guidelines
                </p>
              </div>

              <div className="bg-white/70 backdrop-blur-sm border border-amber-200 rounded-xl p-6">
                <label className="flex items-start space-x-4 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={additionalInfo.agreeToTerms}
                    onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                    className="w-5 h-5 text-amber-600 bg-white border-2 border-amber-300 rounded-lg focus:ring-amber-500 focus:ring-2 mt-1 flex-shrink-0 transition-all"
                  />
                  <div>
                    <span className="font-medium text-amber-800 font-montserrat text-sm sm:text-base group-hover:text-amber-900 transition-colors">
                      I agree to the Mentor Terms and Conditions *
                    </span>
                    <p className="text-xs sm:text-sm text-amber-700 font-montserrat mt-2 leading-relaxed">
                      By checking this box, I confirm that I have read and agree to the{' '}
                      <a href="/mentor-terms" className="text-amber-600 hover:text-amber-800 underline font-medium">
                        Mentor Terms and Conditions
                      </a>{' '}
                      and{' '}
                      <a href="/code-of-conduct" className="text-amber-600 hover:text-amber-800 underline font-medium">
                        Code of Conduct
                      </a>. I understand my responsibilities as a mentor on this platform.
                    </p>
                  </div>
                </label>
                {errors.agreeToTerms && (
                  <p className="ml-9 mt-2 text-sm text-red-600 font-montserrat bg-red-50 p-2 rounded-lg">
                    {errors.agreeToTerms}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto bg-gradient-to-r from-accent-700 to-accent-600 text-white font-semibold py-4 px-8 sm:px-12 rounded-xl shadow-legal-lg hover:shadow-legal-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-montserrat flex items-center justify-center space-x-2 text-lg"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Complete Application</span>
                    <ArrowRight className="w-6 h-6" />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Success Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              
              <h3 className="text-2xl font-baskervville font-bold text-legal-dark-text mb-3">
                🎉 Application Complete!
              </h3>
              
              <p className="text-legal-warm-text font-montserrat mb-8 leading-relaxed">
                Congratulations! You&apos;ve successfully completed your mentor application. 
                You can review your complete application or submit it directly for approval.
              </p>

              <div className="space-y-3">
                <button
                  onClick={handleReviewApplication}
                  className="w-full bg-white text-accent-700 font-semibold py-3 px-6 rounded-xl border-2 border-accent-200 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 font-montserrat flex items-center justify-center space-x-2"
                >
                  <Eye className="w-5 h-5" />
                  <span>Review Application</span>
                </button>

                <button
                  onClick={handleFinalSubmission}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-accent-700 to-accent-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-montserrat flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit for Review</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={() => setShowPopup(false)}
                className="absolute top-4 right-4 text-legal-warm-text hover:text-legal-dark-text transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}