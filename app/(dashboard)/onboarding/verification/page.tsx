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
  Camera,
  Award,
  GraduationCap,
  ArrowRight,
  X,
  Eye
} from 'lucide-react'

interface UploadedFile {
  name: string
  size: number
  type: string
  url: string
  file: File
}

export default function OnboardingVerification() {
  const [documents, setDocuments] = useState({
    idDocument: null as UploadedFile | null,
    educationCertificate: null as UploadedFile | null,
    professionalCertification: null as UploadedFile | null,
    backgroundCheck: null as UploadedFile | null
  })

  const [videoIntroduction, setVideoIntroduction] = useState<UploadedFile | null>(null)
  const [additionalInfo, setAdditionalInfo] = useState({
    linkedinProfile: '',
    personalWebsite: '',
    additionalNotes: '',
    agreeToBackgroundCheck: false,
    agreeToTerms: false
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showPopup, setShowPopup] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const documentTypes = [
    {
      key: 'idDocument',
      title: 'Government ID',
      description: 'Driver\'s license, passport, or national ID card',
      icon: Shield,
      required: true,
      maxSize: '5MB',
      acceptedFormats: 'JPG, PNG, PDF'
    },
    {
      key: 'educationCertificate',
      title: 'Education Certificate',
      description: 'Degree, diploma, or relevant educational qualification',
      icon: GraduationCap,
      required: true,
      maxSize: '10MB',
      acceptedFormats: 'JPG, PNG, PDF'
    },
    {
      key: 'professionalCertification',
      title: 'Professional Certification',
      description: 'Teaching certificate, professional license, or industry certification',
      icon: Award,
      required: false,
      maxSize: '10MB',
      acceptedFormats: 'JPG, PNG, PDF'
    },
    {
      key: 'backgroundCheck',
      title: 'Background Check',
      description: 'Recent background check or criminal record check',
      icon: FileText,
      required: false,
      maxSize: '10MB',
      acceptedFormats: 'PDF'
    }
  ]

  const handleDocumentUpload = async (documentKey: string, file: File) => {
    // Validate file size and type first
    const docType = documentTypes.find(dt => dt.key === documentKey)
    const maxSizes: Record<string, number> = {
      idDocument: 5 * 1024 * 1024, // 5MB
      educationCertificate: 10 * 1024 * 1024, // 10MB
      professionalCertification: 10 * 1024 * 1024,
      backgroundCheck: 10 * 1024 * 1024
    }

    const maxSize = maxSizes[documentKey] || 5 * 1024 * 1024

    if (file.size > maxSize) {
      setErrors(prev => ({
        ...prev,
        [documentKey]: `File size must be less than ${maxSize / (1024 * 1024)}MB`
      }))
      return
    }

    // Validate file type
    const allowedTypes = documentKey === 'backgroundCheck' 
      ? ['application/pdf']
      : ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']

    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        [documentKey]: `Invalid file type. Allowed: ${docType?.acceptedFormats}`
      }))
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'document')

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

        setDocuments(prev => ({ ...prev, [documentKey]: uploadedFile }))
        
        // Clear error
        if (errors[documentKey]) {
          setErrors(prev => ({ ...prev, [documentKey]: '' }))
        }
      } else {
        setErrors(prev => ({ ...prev, [documentKey]: result.message }))
      }
    } catch (error) {
      console.error('Upload error:', error)
      setErrors(prev => ({ ...prev, [documentKey]: 'Upload failed' }))
    }
  }

  const handleVideoUpload = async (file: File) => {
    const maxSize = 50 * 1024 * 1024 // 50MB

    if (file.size > maxSize) {
      setErrors(prev => ({
        ...prev,
        videoIntroduction: 'Video file must be less than 50MB'
      }))
      return
    }

    // Validate video file types
    const allowedVideoTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/wmv', 'video/quicktime']
    if (!allowedVideoTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        videoIntroduction: 'Invalid video format. Allowed: MP4, MOV, AVI, WMV'
      }))
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'document')

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

        setVideoIntroduction(uploadedFile)
        
        if (errors.videoIntroduction) {
          setErrors(prev => ({ ...prev, videoIntroduction: '' }))
        }
      } else {
        setErrors(prev => ({ ...prev, videoIntroduction: result.message }))
      }
    } catch (error) {
      console.error('Video upload error:', error)
      setErrors(prev => ({ ...prev, videoIntroduction: 'Video upload failed' }))
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setAdditionalInfo(prev => ({ ...prev, [field]: value }))
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const removeDocument = (documentKey: string) => {
    setDocuments(prev => ({ ...prev, [documentKey]: null }))
  }

  const removeVideo = () => {
    setVideoIntroduction(null)
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
    const skipDocuments = process.env.SKIP_VERIFICATION === 'true';
    if (!skipDocuments) {
    // Check required documents
    if (!documents.idDocument) {
      newErrors.idDocument = 'Government ID is required'
    }
    if (!documents.educationCertificate) {
      newErrors.educationCertificate = 'Education certificate is required'
    }
  }

    // Check required agreements
    if (!additionalInfo.agreeToBackgroundCheck) {
      newErrors.agreeToBackgroundCheck = 'You must agree to the background check'
    }
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
    const skipDocuments = process.env.SKIP_VERIFICATION === 'true';
    let documentsData: any = {};
    
    if (skipDocuments) {
      // Create mock documents for development
      documentsData = {
        idDocument: {
          name: 'mock_government_id.pdf',
          size: 1024000,
          type: 'application/pdf',
          url: '/mock/government_id.pdf',
        },
        educationCertificate: {
          name: 'mock_education_certificate.pdf',
          size: 2048000,
          type: 'application/pdf',
          url: '/mock/education_certificate.pdf',
        }
      };
    } else {
      // Use actual uploaded documents
      Object.entries(documents).forEach(([key, file]) => {
        if (file) {
          documentsData[key] = {
            name: file.name,
            size: file.size,
            type: file.type,
            url: `https://your-s3-bucket.s3.amazonaws.com/documents/${file.name}`,
          }
        }
      });
    }

    const response = await fetch('/api/onboarding/verification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        documents: documentsData,
        videoIntroduction: videoIntroduction ? {
          name: videoIntroduction.name,
          size: videoIntroduction.size,
          type: videoIntroduction.type,
          url: `https://your-s3-bucket.s3.amazonaws.com/videos/${videoIntroduction.name}`,
        } : undefined,
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
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-baskervville font-bold text-legal-dark-text mb-2">
              Verification & Documents
            </h1>
            <p className="text-legal-warm-text font-montserrat text-sm sm:text-base">
              Upload required documents to verify your credentials and complete your application
            </p>
          </div>

          {/* Add this right after the header div and before the form */}
{process.env.SKIP_VERIFICATION === 'true' && (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center space-x-3 mb-6"
  >
    <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
    <div>
      <h4 className="font-semibold text-blue-800 font-montserrat text-sm">Development Mode</h4>
      <p className="text-blue-700 font-montserrat text-xs">
        Document uploads are optional. You can proceed by just agreeing to the terms below.
      </p>
    </div>
  </motion.div>
)}

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

            {/* Document Upload Section */}
            <div>
              <h3 className="text-xl font-baskervville font-bold text-legal-dark-text mb-6">
                Required Documents
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {documentTypes.map((docType, index) => (
                  <motion.div
                    key={docType.key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`border-2 border-dashed rounded-xl p-4 sm:p-6 transition-colors ${
                      documents[docType.key as keyof typeof documents]
                        ? 'border-success-300 bg-success-50'
                        : errors[docType.key]
                        ? 'border-red-300 bg-red-50'
                        : 'border-legal-border hover:border-accent-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${
                        documents[docType.key as keyof typeof documents]
                          ? 'bg-success-100'
                          : 'bg-legal-bg-secondary'
                      }`}>
                        <docType.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${
                          documents[docType.key as keyof typeof documents]
                            ? 'text-success-600'
                            : 'text-legal-warm-text'
                        }`} />
                      </div>

                      <h4 className="font-semibold text-legal-dark-text font-baskervville mb-2 text-sm sm:text-base">
                        {docType.title}
                        {docType.required && <span className="text-red-500 ml-1">*</span>}
                      </h4>
                      
                      <p className="text-xs sm:text-sm text-legal-warm-text font-montserrat mb-4">
                        {docType.description}
                      </p>

                      {documents[docType.key as keyof typeof documents] ? (
                        <div className="space-y-3">
                          <div className="bg-white rounded-lg p-3 border border-success-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2 min-w-0 flex-1">
                                <FileText className="w-4 h-4 text-success-600 flex-shrink-0" />
                                <span className="text-sm font-medium text-success-700 truncate">
                                  {documents[docType.key as keyof typeof documents]!.name}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeDocument(docType.key)}
                                className="text-red-500 hover:text-red-700 text-xs sm:text-sm ml-2 flex-shrink-0"
                              >
                                Remove
                              </button>
                            </div>
                            <p className="text-xs text-success-600 mt-1">
                              {formatFileSize(documents[docType.key as keyof typeof documents]!.size)}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="bg-white text-accent-700 font-semibold py-2 px-4 rounded-lg border border-accent-200 shadow-warm hover:shadow-warm-lg transition-all duration-300 cursor-pointer inline-flex items-center space-x-2 font-montserrat text-sm">
                            <Upload className="w-4 h-4" />
                            <span>Upload File</span>
                            <input 
                              type="file" 
                              accept={docType.key === 'backgroundCheck' ? '.pdf' : '.jpg,.jpeg,.png,.pdf'}
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleDocumentUpload(docType.key, file)
                              }}
                              className="hidden"
                            />
                          </label>
                          
                          <div className="mt-3 text-xs text-legal-warm-text font-montserrat">
                            <p>Max size: {docType.maxSize}</p>
                            <p>Formats: {docType.acceptedFormats}</p>
                          </div>
                        </div>
                      )}

                      {errors[docType.key] && (
                        <p className="mt-2 text-sm text-red-600 font-montserrat">
                          {errors[docType.key]}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Video Introduction */}
            <div>
              <h3 className="text-xl font-baskervville font-bold text-legal-dark-text mb-4">
                Video Introduction
                <span className="text-legal-warm-text font-normal font-montserrat text-sm sm:text-base ml-2">(Optional but recommended)</span>
              </h3>
              <p className="text-legal-warm-text font-montserrat mb-6 text-sm sm:text-base">
                Record a 1-2 minute video introducing yourself to potential students. This helps build trust and showcases your personality.
              </p>

              <div className={`border-2 border-dashed rounded-xl p-6 sm:p-8 transition-colors ${
                videoIntroduction
                  ? 'border-success-300 bg-success-50'
                  : 'border-legal-border hover:border-accent-300'
              }`}>
                <div className="text-center">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center mx-auto mb-4 ${
                    videoIntroduction ? 'bg-success-100' : 'bg-legal-bg-secondary'
                  }`}>
                    <Camera className={`w-6 h-6 sm:w-8 sm:h-8 ${
                      videoIntroduction ? 'text-success-600' : 'text-legal-warm-text'
                    }`} />
                  </div>

                  {videoIntroduction ? (
                    <div className="space-y-3">
                      <div className="bg-white rounded-lg p-4 border border-success-200 max-w-md mx-auto">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 min-w-0 flex-1">
                            <Camera className="w-5 h-5 text-success-600 flex-shrink-0" />
                            <span className="text-sm font-medium text-success-700 truncate">
                              {videoIntroduction.name}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={removeVideo}
                            className="text-red-500 hover:text-red-700 text-sm ml-2 flex-shrink-0"
                          >
                            Remove
                          </button>
                        </div>
                        <p className="text-xs text-success-600 mt-1">
                          {formatFileSize(videoIntroduction.size)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="font-semibold text-legal-dark-text font-baskervville mb-2 text-sm sm:text-base">
                        Upload Video Introduction
                      </h4>
                      <p className="text-xs sm:text-sm text-legal-warm-text font-montserrat mb-6">
                        Introduce yourself, your teaching style, and what makes you a great mentor
                      </p>

                      <label className="bg-white text-accent-700 font-semibold py-3 px-4 sm:px-6 rounded-lg border border-accent-200 shadow-warm hover:shadow-warm-lg transition-all duration-300 cursor-pointer inline-flex items-center space-x-2 font-montserrat text-sm">
                        <Camera className="w-5 h-5" />
                        <span>Upload Video</span>
                        <input 
                          type="file" 
                          accept=".mp4,.mov,.avi,.wmv"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleVideoUpload(file)
                          }}
                          className="hidden"
                        />
                      </label>
                      
                      <div className="mt-4 text-xs text-legal-warm-text font-montserrat">
                        <p>Max size: 50MB</p>
                        <p>Formats: MP4, MOV, AVI, WMV</p>
                        <p>Duration: 1-2 minutes recommended</p>
                      </div>
                    </div>
                  )}

                  {errors.videoIntroduction && (
                    <p className="mt-2 text-sm text-red-600 font-montserrat">
                      {errors.videoIntroduction}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h3 className="text-xl font-baskervville font-bold text-legal-dark-text mb-6">
                Additional Information
              </h3>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                      LinkedIn Profile
                      <span className="text-legal-warm-text font-normal"> (Optional)</span>
                    </label>
                    <input
                      type="url"
                      value={additionalInfo.linkedinProfile}
                      onChange={(e) => handleInputChange('linkedinProfile', e.target.value)}
                      className="w-full px-4 py-3 border border-legal-border rounded-xl font-montserrat transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white text-sm sm:text-base"
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                      Personal Website
                      <span className="text-legal-warm-text font-normal"> (Optional)</span>
                    </label>
                    <input
                      type="url"
                      value={additionalInfo.personalWebsite}
                      onChange={(e) => handleInputChange('personalWebsite', e.target.value)}
                      className="w-full px-4 py-3 border border-legal-border rounded-xl font-montserrat transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white text-sm sm:text-base"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                    Additional Notes
                    <span className="text-legal-warm-text font-normal"> (Optional)</span>
                  </label>
                  <textarea
                    value={additionalInfo.additionalNotes}
                    onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-legal-border rounded-xl font-montserrat transition-colors resize-none focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white text-sm sm:text-base"
                    placeholder="Any additional information you'd like to share about your qualifications, experience, or teaching approach..."
                  />
                </div>
              </div>
            </div>

            {/* Agreements */}
            <div className="bg-legal-bg-secondary/20 border border-legal-border/50 rounded-xl p-4 sm:p-6">
              <h4 className="font-semibold text-legal-dark-text font-baskervville mb-6">
                Verification Agreements
              </h4>

              <div className="space-y-4">
                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={additionalInfo.agreeToBackgroundCheck}
                    onChange={(e) => handleInputChange('agreeToBackgroundCheck', e.target.checked)}
                    className="w-5 h-5 text-accent-600 bg-white border-legal-border rounded focus:ring-accent-500 focus:ring-2 mt-0.5 flex-shrink-0"
                  />
                  <div>
                    <span className="font-medium text-legal-dark-text font-montserrat text-sm sm:text-base">
                      I agree to undergo a background check *
                    </span>
                    <p className="text-xs sm:text-sm text-legal-warm-text font-montserrat mt-1">
                      By checking this box, you consent to MentorMatch conducting a background check 
                      to verify your identity and ensure student safety.
                    </p>
                  </div>
                </label>
                {errors.agreeToBackgroundCheck && (
                  <p className="ml-6 sm:ml-8 text-sm text-red-600 font-montserrat">{errors.agreeToBackgroundCheck}</p>
                )}

                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={additionalInfo.agreeToTerms}
                    onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                    className="w-5 h-5 text-accent-600 bg-white border-legal-border rounded focus:ring-accent-500 focus:ring-2 mt-0.5 flex-shrink-0"
                  />
                  <div>
                    <span className="font-medium text-legal-dark-text font-montserrat text-sm sm:text-base">
                      I agree to the Mentor Terms and Conditions *
                    </span>
                    <p className="text-xs sm:text-sm text-legal-warm-text font-montserrat mt-1">
                      I have read and agree to the{' '}
                      <a href="/mentor-terms" className="text-accent-600 hover:text-accent-700 underline">
                        Mentor Terms and Conditions
                      </a>{' '}
                      and{' '}
                      <a href="/code-of-conduct" className="text-accent-600 hover:text-accent-700 underline">
                        Code of Conduct
                      </a>.
                    </p>
                  </div>
                </label>
                {errors.agreeToTerms && (
                  <p className="ml-6 sm:ml-8 text-sm text-red-600 font-montserrat">{errors.agreeToTerms}</p>
                )}
              </div>
            </div>

            {/* Verification Process Info */}
            <div className="bg-accent-50 border border-accent-200 rounded-xl p-4 sm:p-6">
              <h4 className="font-semibold text-accent-700 font-baskervville mb-4 flex items-center text-sm sm:text-base">
                <Shield className="w-5 h-5 mr-2" />
                Verification Process
              </h4>
              <div className="space-y-3 text-xs sm:text-sm font-montserrat text-accent-600">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-accent-500 mt-0.5 flex-shrink-0" />
                  <span>All documents are reviewed by our verification team within 24-48 hours</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-accent-500 mt-0.5 flex-shrink-0" />
                  <span>Your personal information is encrypted and stored securely</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-accent-500 mt-0.5 flex-shrink-0" />
                  <span>Background checks are conducted by certified third-party providers</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-accent-500 mt-0.5 flex-shrink-0" />
                  <span>You&apos;ll receive email notifications about your verification status</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center sm:justify-end pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto bg-gradient-to-r from-accent-700 to-accent-600 text-white font-semibold py-3 px-6 sm:px-8 rounded-xl shadow-legal-lg hover:shadow-legal-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-montserrat flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Submit Application</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-6"
          >
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-accent-600" />
              </div>
              
              <h3 className="text-xl sm:text-2xl font-baskervville font-bold text-legal-dark-text mb-2">
                Application Ready!
              </h3>
              
              <p className="text-legal-warm-text font-montserrat mb-6 text-sm sm:text-base">
                Your verification documents have been uploaded successfully. 
                You can review your complete application or submit it directly.
              </p>

              <div className="space-y-3">
                <button
                  onClick={handleReviewApplication}
                  className="w-full bg-white text-accent-700 font-semibold py-3 px-4 sm:px-6 rounded-xl border border-accent-200 shadow-warm hover:shadow-warm-lg transition-all duration-300 font-montserrat flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <Eye className="w-5 h-5" />
                  <span>Review Application</span>
                </button>

                <button
                  onClick={handleFinalSubmission}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-accent-700 to-accent-600 text-white font-semibold py-3 px-4 sm:px-6 rounded-xl shadow-legal-lg hover:shadow-legal-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-montserrat flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Final Submission</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={() => setShowPopup(false)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 text-legal-warm-text hover:text-legal-dark-text transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}