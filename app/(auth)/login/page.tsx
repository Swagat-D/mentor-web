'use client'

import { useEffect, useState } from 'react'
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
  CheckCircle,
  Chrome
} from 'lucide-react'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const savedEmail = localStorage.getItem('mentormatch_saved_email')
    const rememberMe = localStorage.getItem('mentormatch_remember_me') === 'true'

    if ( rememberMe && savedEmail) {
      setFormData(prev => ({
        ...prev,
        email: savedEmail,
        rememberMe: true
      }))
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  if (!validateForm()) return

  setIsLoading(true)
  setErrors({})
  
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      if (data.code === 'EMAIL_NOT_VERIFIED') {
        setErrors({ general: 'Please verify your email address. Check your inbox for a verification link.' })
      } else {
        setErrors({ general: data.message || 'Login failed' })
      }
      return
    }

    //Handle rememberMe functionality
    if(formData.rememberMe) {
      localStorage.setItem('mentormatch_saved_email', formData.email)
      localStorage.setItem('mentormatch_remember_me', 'true')
    }else{
      localStorage.removeItem('mentormatch_saved_email')
      localStorage.removeItem('mentormatch_remember_me')
    }

    // Success - redirect based on backend response
    window.location.href = data.data.redirectTo
    
  } catch (error) {
    console.error('Login error:', error)
    setErrors({ general: 'An error occurred. Please try again.' })
  } finally {
    setIsLoading(false)
  }
}

  const handleGoogleLogin = () => {
    // Handle Google OAuth login
    console.log('Google login clicked')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-legal-bg-primary via-warm-100 to-legal-bg-secondary flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
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
              Welcome Back
            </h1>
            <p className="text-legal-warm-text font-montserrat">
              Sign in to continue your mentoring journey
            </p>
          </div>

          {/* Form */}
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

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-legal-warm-text" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl font-montserrat transition-colors ${
                    errors.email 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-legal-border focus:border-accent-500 focus:ring-accent-500'
                  } focus:outline-none focus:ring-2 focus:ring-opacity-50 bg-white`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-sm text-red-600 font-montserrat"
                >
                  {errors.email}
                </motion.p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-legal-warm-text" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl font-montserrat transition-colors ${
                    errors.password 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-legal-border focus:border-accent-500 focus:ring-accent-500'
                  } focus:outline-none focus:ring-2 focus:ring-opacity-50 bg-white`}
                  placeholder="Enter your password"
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
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-sm text-red-600 font-montserrat"
                >
                  {errors.password}
                </motion.p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-accent-600 bg-white border-legal-border rounded focus:ring-accent-500 focus:ring-2"
                />
                <span className="ml-2 text-sm text-legal-warm-text font-montserrat">Remember me</span>
              </label>
              <Link 
                href="/forgot-password" 
                className="text-sm text-accent-600 hover:text-accent-700 font-montserrat font-medium"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-accent-700 to-accent-600 text-white font-semibold py-3 px-6 rounded-xl shadow-legal-lg hover:shadow-legal-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-montserrat flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-legal-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-legal-bg-primary px-4 text-legal-warm-text font-montserrat">Or continue with</span>
              </div>
            </div>

            {/* Google Login */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full bg-white text-legal-dark-text font-semibold py-3 px-6 rounded-xl border border-legal-border shadow-warm hover:shadow-warm-lg transition-all duration-300 hover:scale-105 font-montserrat flex items-center justify-center space-x-3"
            >
              <Chrome className="w-5 h-5" />
              <span>Continue with Google</span>
            </button>

            {/* Sign Up Link */}
            <p className="text-center text-legal-warm-text font-montserrat">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-accent-600 hover:text-accent-700 font-medium">
                Sign up as a mentor
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
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
              <span className="font-montserrat">500+ Active Mentors</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
              <span className="font-montserrat">95% Success Rate</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
              <span className="font-montserrat">$30-150/hour</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
              <span className="font-montserrat">Flexible Schedule</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}