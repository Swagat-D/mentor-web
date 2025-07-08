'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  Scale, 
  ArrowRight,
  AlertCircle,
  Phone,
  Building,
  GraduationCap,
  Briefcase
} from 'lucide-react'

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Step 2: Professional Info
    title: '',
    institution: '',
    expertise: '',
    experience: '',
    bio: '',
    
    // Step 3: Account Setup
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    marketingEmails: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!formData.firstName) newErrors.firstName = 'First name is required'
      if (!formData.lastName) newErrors.lastName = 'Last name is required'
      if (!formData.email) {
        newErrors.email = 'Email is required'
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address'
      }
      if (!formData.phone) newErrors.phone = 'Phone number is required'
    }

    if (step === 2) {
      if (!formData.title) newErrors.title = 'Professional title is required'
      if (!formData.institution) newErrors.institution = 'Institution is required'
      if (!formData.expertise) newErrors.expertise = 'Area of expertise is required'
      if (!formData.experience) newErrors.experience = 'Experience level is required'
      if (!formData.bio) newErrors.bio = 'Bio is required'
    }

    if (step === 3) {
      if (!formData.password) {
        newErrors.password = 'Password is required'
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters'
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = 'Password must contain uppercase, lowercase, and number'
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password'
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
      
      if (!formData.acceptTerms) {
        newErrors.acceptTerms = 'You must accept the terms and conditions'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => prev - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  if (!validateStep(3)) return

  setIsLoading(true)
  setErrors({})
  
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
        role: 'mentor', // Since this is mentor signup
        firstName: formData.firstName,
        lastName: formData.lastName,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      if (data.errors && Array.isArray(data.errors)) {
        setErrors({ general: data.errors.join(', ') })
      } else {
        setErrors({ general: data.message || 'Registration failed' })
      }
      return
    }

    // Success - show message and redirect
    alert('Registration successful! Please check your email to verify your account.')
    window.location.href = '/login'
    
  } catch (error) {
    console.error('Registration error:', error)
    setErrors({ general: 'An error occurred. Please try again.' })
  } finally {
    setIsLoading(false)
  }
}

  const experienceLevels = [
    '0-2 years',
    '3-5 years', 
    '6-10 years',
    '10+ years'
  ]

  const expertiseAreas = [
    'Mathematics',
    'Physics', 
    'Chemistry',
    'Biology',
    'Computer Science',
    'Engineering',
    'Business & Finance',
    'Language Arts',
    'History',
    'Economics',
    'Psychology',
    'Art & Design',
    'Music',
    'Other'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-legal-bg-primary via-warm-100 to-legal-bg-secondary flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-lg"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-700 to-accent-600 rounded-xl flex items-center justify-center shadow-legal">
                <Scale className="text-white font-bold text-lg w-6 h-6" />
              </div>
              <span className="text-2xl font-baskervville font-bold gradient-text">MentorMatch</span>
            </Link>
            
            <h1 className="text-3xl font-baskervville font-bold text-legal-dark-text mb-2">
              Join as a Mentor
            </h1>
            <p className="text-legal-warm-text font-montserrat">
              Share your expertise and start earning while making an impact
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-legal-warm-text font-montserrat">
                Step {currentStep} of 3
              </span>
              <span className="text-sm font-medium text-legal-warm-text font-montserrat">
                {Math.round((currentStep / 3) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-legal-border rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-accent-700 to-accent-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / 3) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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

            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <h3 className="text-xl font-baskervville font-bold text-legal-dark-text mb-2">
                    Basic Information
                  </h3>
                  <p className="text-legal-warm-text font-montserrat text-sm">
                    Let&apos;s start with your basic details
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                      First Name
                    </label>
                    <input
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl font-montserrat transition-colors ${
                        errors.firstName ? 'border-red-300' : 'border-legal-border'
                      } focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white`}
                      placeholder="John"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600 font-montserrat">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                      Last Name
                    </label>
                    <input
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-xl font-montserrat transition-colors ${
                        errors.lastName ? 'border-red-300' : 'border-legal-border'
                      } focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white`}
                      placeholder="Doe"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600 font-montserrat">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-legal-warm-text" />
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl font-montserrat transition-colors ${
                        errors.email ? 'border-red-300' : 'border-legal-border'
                      } focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white`}
                      placeholder="john.doe@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 font-montserrat">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-legal-warm-text" />
                    <input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl font-montserrat transition-colors ${
                        errors.phone ? 'border-red-300' : 'border-legal-border'
                      } focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white`}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600 font-montserrat">{errors.phone}</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 2: Professional Information */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <h3 className="text-xl font-baskervville font-bold text-legal-dark-text mb-2">
                    Professional Information
                  </h3>
                  <p className="text-legal-warm-text font-montserrat text-sm">
                    Tell us about your expertise and background
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                    Professional Title
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-legal-warm-text" />
                    <input
                      name="title"
                      type="text"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl font-montserrat transition-colors ${
                        errors.title ? 'border-red-300' : 'border-legal-border'
                      } focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white`}
                      placeholder="e.g., Professor of Mathematics, Senior Data Scientist"
                    />
                  </div>
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600 font-montserrat">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                    Institution/Company
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-legal-warm-text" />
                    <input
                      name="institution"
                      type="text"
                      value={formData.institution}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl font-montserrat transition-colors ${
                        errors.institution ? 'border-red-300' : 'border-legal-border'
                      } focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white`}
                      placeholder="e.g., Stanford University, Google, Microsoft"
                    />
                  </div>
                  {errors.institution && (
                    <p className="mt-1 text-sm text-red-600 font-montserrat">{errors.institution}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                    Primary Area of Expertise
                  </label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-legal-warm-text" />
                    <select
                      name="expertise"
                      value={formData.expertise}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl font-montserrat transition-colors ${
                        errors.expertise ? 'border-red-300' : 'border-legal-border'
                      } focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white`}
                    >
                      <option value="">Select your expertise area</option>
                      {expertiseAreas.map(area => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                  </div>
                  {errors.expertise && (
                    <p className="mt-1 text-sm text-red-600 font-montserrat">{errors.expertise}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                    Years of Experience
                  </label>
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl font-montserrat transition-colors ${
                      errors.experience ? 'border-red-300' : 'border-legal-border'
                    } focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white`}
                  >
                    <option value="">Select experience level</option>
                    {experienceLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                  {errors.experience && (
                    <p className="mt-1 text-sm text-red-600 font-montserrat">{errors.experience}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                    Professional Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-xl font-montserrat transition-colors resize-none ${
                      errors.bio ? 'border-red-300' : 'border-legal-border'
                    } focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white`}
                    placeholder="Describe your background, teaching philosophy, and what makes you a great mentor (minimum 100 characters)"
                  />
                  {errors.bio && (
                    <p className="mt-1 text-sm text-red-600 font-montserrat">{errors.bio}</p>
                  )}
                  <div className="mt-1 text-xs text-legal-warm-text font-montserrat">
                    {formData.bio.length}/500 characters
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Account Setup */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <h3 className="text-xl font-baskervville font-bold text-legal-dark-text mb-2">
                    Create Your Account
                  </h3>
                  <p className="text-legal-warm-text font-montserrat text-sm">
                    Set up your password and finish registration
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-legal-warm-text" />
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-12 py-3 border rounded-xl font-montserrat transition-colors ${
                        errors.password ? 'border-red-300' : 'border-legal-border'
                      } focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white`}
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-legal-warm-text hover:text-legal-dark-text"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600 font-montserrat">{errors.password}</p>
                  )}
                  <div className="mt-2 text-xs text-legal-warm-text font-montserrat">
                    Password must be 8+ characters with uppercase, lowercase, and number
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-legal-warm-text" />
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-12 py-3 border rounded-xl font-montserrat transition-colors ${
                        errors.confirmPassword ? 'border-red-300' : 'border-legal-border'
                      } focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-legal-warm-text hover:text-legal-dark-text"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 font-montserrat">{errors.confirmPassword}</p>
                  )}
                </div>

                <div className="space-y-4">
                  <label className="flex items-start space-x-3">
                    <input
                      name="acceptTerms"
                      type="checkbox"
                      checked={formData.acceptTerms}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-accent-600 bg-white border-legal-border rounded focus:ring-accent-500 focus:ring-2 mt-0.5"
                    />
                    <span className="text-sm text-legal-warm-text font-montserrat">
                      I agree to the{' '}
                      <Link href="/terms" className="text-accent-600 hover:text-accent-700 font-medium">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-accent-600 hover:text-accent-700 font-medium">
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                  {errors.acceptTerms && (
                    <p className="text-sm text-red-600 font-montserrat">{errors.acceptTerms}</p>
                  )}

                  <label className="flex items-start space-x-3">
                    <input
                      name="marketingEmails"
                      type="checkbox"
                      checked={formData.marketingEmails}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-accent-600 bg-white border-legal-border rounded focus:ring-accent-500 focus:ring-2 mt-0.5"
                    />
                    <span className="text-sm text-legal-warm-text font-montserrat">
                      I&apos;d like to receive updates about new features and mentoring tips
                    </span>
                  </label>
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="bg-white text-legal-dark-text font-semibold py-3 px-6 rounded-xl border border-legal-border shadow-warm hover:shadow-warm-lg transition-all duration-300 font-montserrat"
                >
                  Back
                </button>
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="bg-gradient-to-r from-accent-700 to-accent-600 text-white font-semibold py-3 px-6 rounded-xl shadow-legal-lg hover:shadow-legal-xl transition-all duration-300 hover:scale-105 font-montserrat flex items-center space-x-2 ml-auto"
                >
                  <span>Next</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-accent-700 to-accent-600 text-white font-semibold py-3 px-6 rounded-xl shadow-legal-lg hover:shadow-legal-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-montserrat flex items-center space-x-2 ml-auto"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Sign In Link */}
            <p className="text-center text-legal-warm-text font-montserrat pt-4">
              Already have an account?{' '}
              <Link href="/login" className="text-accent-600 hover:text-accent-700 font-medium">
                Sign in
              </Link>
            </p>
          </form>
        </motion.div>
      </div>

      {/* Right Side - Illustration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-accent-700 to-accent-600 items-center justify-center p-12 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-white rounded-full blur-3xl"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-10 text-white text-center max-w-md"
        >
          <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
            <Scale className="w-16 h-16 text-white" />
          </div>
          
          <h2 className="text-3xl font-baskervville font-bold mb-4">
            Join Our Expert Community
          </h2>
          <p className="text-white/90 font-montserrat text-lg leading-relaxed mb-8">
            Connect with ambitious students worldwide and make a meaningful impact while earning competitive rates.
          </p>

          <div className="grid grid-cols-2 gap-6 text-left">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="font-montserrat">500+ Active Mentors</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="font-montserrat">95% Success Rate</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="font-montserrat">$30-150/hour</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="font-montserrat">Flexible Schedule</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}