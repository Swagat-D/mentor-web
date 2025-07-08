/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Shield,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'

export default function VerifyOTPPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams.get('email')
  const type = searchParams.get('type') || 'signup' // 'signup' or 'reset'
  
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      router.push('/login')
    }
  }, [email, router])

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return // Only allow digits
    
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1) // Only take the last digit
    setOtp(newOtp)
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
    
    // Clear error when user starts typing
    if (error) setError('')
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('')
    const newOtp = [...otp]
    
    pastedData.forEach((digit, index) => {
      if (/^\d$/.test(digit) && index < 6) {
        newOtp[index] = digit
      }
    })
    
    setOtp(newOtp)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        // Redirect to OTP verification page
        window.location.href = `/verify-otp?email=${encodeURIComponent(email ?? '')}&type=reset`
      } else {
        setError(data.message)
      }
    } catch (error) {
      console.log(error)
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return

    setIsResending(true)
    setError('')

    try {
      const endpoint = type === 'reset' ? '/api/auth/forgot-password' : '/api/auth/resend-otp'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to resend OTP')
      }

      setResendCooldown(60) // 60 seconds cooldown
      setOtp(['', '', '', '', '', '']) // Clear current OTP
    } catch (error: any) {
      setError(error.message || 'Failed to resend OTP')
    } finally {
      setIsResending(false)
    }
  }

  if (!email) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-legal-bg-primary via-warm-100 to-legal-bg-secondary flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-legal-lg border border-warm-200/50 p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-accent-100 to-accent-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-accent-600" />
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-baskervville font-bold text-legal-dark-text mb-2">
              Verify OTP
            </h1>
            <p className="text-legal-warm-text font-montserrat text-sm sm:text-base">
              We&apos;ve sent a 6-digit code to
            </p>
            <p className="text-accent-600 font-medium font-montserrat text-sm sm:text-base">
              {email}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input */}
            <div>
              <label className="block text-sm font-medium text-legal-dark-text mb-4 font-montserrat text-center">
                Enter 6-digit verification code
              </label>
              <div className="flex justify-center space-x-2 sm:space-x-3" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold border border-legal-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500 bg-white"
                    maxLength={1}
                    autoComplete="off"
                  />
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3"
              >
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="text-red-700 font-montserrat text-sm">{error}</span>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || otp.join('').length !== 6}
              className="w-full bg-gradient-to-r from-accent-700 to-accent-600 text-white font-semibold py-3 px-6 rounded-xl shadow-legal-lg hover:shadow-legal-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-montserrat flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Verify OTP</span>
                </>
              )}
            </button>

            {/* Resend OTP */}
            <div className="text-center">
              <p className="text-legal-warm-text font-montserrat text-sm mb-2">
                Didn&apos;t receive the code?
              </p>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={isResending || resendCooldown > 0}
                className="text-accent-600 hover:text-accent-700 font-medium font-montserrat text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mx-auto"
              >
                {isResending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : resendCooldown > 0 ? (
                  <span>Resend in {resendCooldown}s</span>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>Resend OTP</span>
                  </>
                )}
              </button>
            </div>

            {/* Back to Login */}
            <div className="text-center pt-4">
              <Link
                href="/login"
                className="inline-flex items-center text-legal-warm-text hover:text-accent-600 font-montserrat text-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}