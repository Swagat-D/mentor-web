/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Clock,
  DollarSign,
  Target,
  ArrowRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface TimeSlot {
  day: string
  available: boolean
  startTime: string
  endTime: string
}

export default function OnboardingAvailability() {
  const [weeklySchedule, setWeeklySchedule] = useState<TimeSlot[]>([
    { day: 'Monday', available: false, startTime: '09:00', endTime: '17:00' },
    { day: 'Tuesday', available: false, startTime: '09:00', endTime: '17:00' },
    { day: 'Wednesday', available: false, startTime: '09:00', endTime: '17:00' },
    { day: 'Thursday', available: false, startTime: '09:00', endTime: '17:00' },
    { day: 'Friday', available: false, startTime: '09:00', endTime: '17:00' },
    { day: 'Saturday', available: false, startTime: '09:00', endTime: '17:00' },
    { day: 'Sunday', available: false, startTime: '09:00', endTime: '17:00' }
  ])

  const [pricing, setPricing] = useState({
    hourlyRate: '',
    packageDiscounts: false,
    groupSessions: false,
    groupRate: '',
    trialSession: false,
    trialRate: ''
  })

  const [preferences, setPreferences] = useState({
    sessionLength: '',
    advanceBooking: '',
    maxStudentsPerWeek: '',
    preferredSessionType: '',
    cancellationPolicy: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const timeOptions: string[] = []
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      timeOptions.push(time)
    }
  }

  const sessionLengthOptions = [
    '30 minutes',
    '45 minutes', 
    '60 minutes',
    '90 minutes',
    '120 minutes'
  ]

  const advanceBookingOptions = [
    'Same day',
    '1 day in advance',
    '2 days in advance',
    '3 days in advance',
    '1 week in advance'
  ]

  const sessionTypeOptions = [
    'One-on-one sessions',
    'Group sessions (2-4 students)',
    'Both individual and group',
    'Large group sessions (5+ students)'
  ]

  const cancellationOptions = [
    'Flexible - No penalty',
    '2 hours notice required',
    '24 hours notice required',
    '48 hours notice required'
  ]

  const updateSchedule = (index: number, field: keyof TimeSlot, value: string | boolean) => {
    setWeeklySchedule(prev => prev.map((slot, i) => 
      i === index ? { ...slot, [field]: value } : slot
    ))
  }

  const handlePricingChange = (field: string, value: string | boolean) => {
    setPricing(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handlePreferencesChange = (field: string, value: string) => {
    setPreferences(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Check if at least one day is available
    const availableDays = weeklySchedule.filter(slot => slot.available)
    if (availableDays.length === 0) {
      newErrors.schedule = 'Please select at least one day when you\'re available'
    }

    // Validate time slots
    availableDays.forEach((slot, index) => {
      if (slot.startTime >= slot.endTime) {
        newErrors[`time_${index}`] = 'Start time must be before end time'
      }
    })

    // Validate pricing
    if (!pricing.hourlyRate) {
      newErrors.hourlyRate = 'Hourly rate is required'
    } else if (parseInt(pricing.hourlyRate) < 10 || parseInt(pricing.hourlyRate) > 200) {
      newErrors.hourlyRate = 'Hourly rate must be between $10 and $200'
    }

    if (pricing.groupSessions && !pricing.groupRate) {
      newErrors.groupRate = 'Group session rate is required'
    }

    if (pricing.trialSession && !pricing.trialRate) {
      newErrors.trialRate = 'Trial session rate is required'
    }

    // Validate preferences
    if (!preferences.sessionLength) newErrors.sessionLength = 'Session length is required'
    if (!preferences.advanceBooking) newErrors.advanceBooking = 'Advance booking preference is required'
    if (!preferences.maxStudentsPerWeek) newErrors.maxStudentsPerWeek = 'Maximum students per week is required'
    if (!preferences.preferredSessionType) newErrors.preferredSessionType = 'Preferred session type is required'
    if (!preferences.cancellationPolicy) newErrors.cancellationPolicy = 'Cancellation policy is required'

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
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        weeklySchedule,
        pricing,
        preferences,
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

  const totalWeeklyHours = weeklySchedule.reduce((total, slot) => {
    if (!slot.available) return total
    const start = new Date(`2000-01-01T${slot.startTime}:00`)
    const end = new Date(`2000-01-01T${slot.endTime}:00`)
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    return total + hours
  }, 0)

  const estimatedWeeklyEarnings = totalWeeklyHours * (parseInt(pricing.hourlyRate) || 0)

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
            Set Your Availability & Rates
          </h1>
          <p className="text-legal-warm-text font-montserrat text-sm sm:text-base">
            Configure your schedule, pricing, and session preferences
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

          {/* Weekly Schedule */}
          <div>
            <h3 className="text-xl font-baskervville font-bold text-legal-dark-text mb-4">
              Weekly Availability
            </h3>
            <p className="text-legal-warm-text font-montserrat mb-6 text-sm sm:text-base">
              Set your general availability for each day of the week
            </p>

            <div className="space-y-4">
              {weeklySchedule.map((slot, index) => (
                <motion.div
                  key={slot.day}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`border rounded-xl p-4 transition-colors ${
                    slot.available 
                      ? 'border-accent-300 bg-accent-50/50' 
                      : 'border-legal-border bg-white'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={slot.available}
                        onChange={(e) => updateSchedule(index, 'available', e.target.checked)}
                        className="w-5 h-5 text-accent-600 bg-white border-legal-border rounded focus:ring-accent-500 focus:ring-2"
                      />
                      <span className="font-semibold text-legal-dark-text font-montserrat min-w-[80px]">
                        {slot.day}
                      </span>
                    </label>

                    {slot.available && (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-legal-warm-text" />
                          <select
                            value={slot.startTime}
                            onChange={(e) => updateSchedule(index, 'startTime', e.target.value)}
                            className="px-3 py-2 border border-legal-border rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                          >
                            {timeOptions.map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                          <span className="text-legal-warm-text text-sm">to</span>
                          <select
                            value={slot.endTime}
                            onChange={(e) => updateSchedule(index, 'endTime', e.target.value)}
                            className="px-3 py-2 border border-legal-border rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                          >
                            {timeOptions.map(time => (
                              <option key={time} value={time}>{time}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
            {errors.schedule && (
              <p className="mt-2 text-sm text-red-600 font-montserrat">{errors.schedule}</p>
            )}
          </div>

          {/* Pricing Section */}
          <div>
            <h3 className="text-xl font-baskervville font-bold text-legal-dark-text mb-4">
              Pricing & Rates
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                  Hourly Rate (USD) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-legal-warm-text" />
                  <input
                    type="number"
                    min="10"
                    max="200"
                    value={pricing.hourlyRate}
                    onChange={(e) => handlePricingChange('hourlyRate', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl font-montserrat transition-colors text-sm sm:text-base ${
                      errors.hourlyRate ? 'border-red-300' : 'border-legal-border'
                    } focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white`}
                    placeholder="50"
                  />
                </div>
                {errors.hourlyRate && (
                  <p className="mt-1 text-sm text-red-600 font-montserrat">{errors.hourlyRate}</p>
                )}
                <p className="mt-1 text-xs text-legal-warm-text font-montserrat">
                  Range: $10 - $200 per hour
                </p>
              </div>

              <div className="space-y-4">
                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={pricing.trialSession}
                    onChange={(e) => handlePricingChange('trialSession', e.target.checked)}
                    className="w-5 h-5 text-accent-600 bg-white border-legal-border rounded focus:ring-accent-500 focus:ring-2 mt-0.5 flex-shrink-0"
                  />
                  <div>
                    <span className="font-medium text-legal-dark-text font-montserrat">
                      Offer trial sessions
                    </span>
                    <p className="text-sm text-legal-warm-text font-montserrat">
                      Discounted first session to attract new students
                    </p>
                  </div>
                </label>

                {pricing.trialSession && (
                  <div>
                    <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                      Trial Session Rate (USD) *
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-legal-warm-text" />
                      <input
                        type="number"
                        min="5"
                        value={pricing.trialRate}
                        onChange={(e) => handlePricingChange('trialRate', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl font-montserrat transition-colors text-sm sm:text-base ${
                          errors.trialRate ? 'border-red-300' : 'border-legal-border'
                        } focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white`}
                        placeholder="25"
                      />
                    </div>
                    {errors.trialRate && (
                      <p className="mt-1 text-sm text-red-600 font-montserrat">{errors.trialRate}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={pricing.groupSessions}
                  onChange={(e) => handlePricingChange('groupSessions', e.target.checked)}
                  className="w-5 h-5 text-accent-600 bg-white border-legal-border rounded focus:ring-accent-500 focus:ring-2 mt-0.5 flex-shrink-0"
                />
                <div>
                  <span className="font-medium text-legal-dark-text font-montserrat">
                    Offer group sessions
                  </span>
                  <p className="text-sm text-legal-warm-text font-montserrat">
                    Teach multiple students in one session
                  </p>
                </div>
              </label>

              {pricing.groupSessions && (
                <div className="ml-6 sm:ml-8">
                  <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                    Group Session Rate per Student (USD) *
                  </label>
                  <div className="relative max-w-xs">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-legal-warm-text" />
                    <input
                      type="number"
                      min="5"
                      value={pricing.groupRate}
                      onChange={(e) => handlePricingChange('groupRate', e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl font-montserrat transition-colors text-sm sm:text-base ${
                        errors.groupRate ? 'border-red-300' : 'border-legal-border'
                      } focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white`}
                      placeholder="30"
                    />
                  </div>
                  {errors.groupRate && (
                    <p className="mt-1 text-sm text-red-600 font-montserrat">{errors.groupRate}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Session Preferences */}
          <div>
            <h3 className="text-xl font-baskervville font-bold text-legal-dark-text mb-4">
              Session Preferences
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                  Default Session Length *
                </label>
                <select
                  value={preferences.sessionLength}
                  onChange={(e) => handlePreferencesChange('sessionLength', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl font-montserrat transition-colors text-sm sm:text-base ${
                    errors.sessionLength ? 'border-red-300' : 'border-legal-border'
                  } focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white`}
                >
                  <option value="">Select duration</option>
                  {sessionLengthOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {errors.sessionLength && (
                  <p className="mt-1 text-sm text-red-600 font-montserrat">{errors.sessionLength}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                  Advance Booking Required *
                </label>
                <select
                  value={preferences.advanceBooking}
                  onChange={(e) => handlePreferencesChange('advanceBooking', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl font-montserrat transition-colors text-sm sm:text-base ${
                    errors.advanceBooking ? 'border-red-300' : 'border-legal-border'
                  } focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white`}
                >
                  <option value="">Select timing</option>
                  {advanceBookingOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {errors.advanceBooking && (
                  <p className="mt-1 text-sm text-red-600 font-montserrat">{errors.advanceBooking}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                  Max Students per Week *
                </label>
                <div className="relative">
                  <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-legal-warm-text" />
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={preferences.maxStudentsPerWeek}
                    onChange={(e) => handlePreferencesChange('maxStudentsPerWeek', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl font-montserrat transition-colors text-sm sm:text-base ${
                      errors.maxStudentsPerWeek ? 'border-red-300' : 'border-legal-border'
                    } focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white`}
                    placeholder="10"
                  />
                </div>
                {errors.maxStudentsPerWeek && (
                  <p className="mt-1 text-sm text-red-600 font-montserrat">{errors.maxStudentsPerWeek}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                  Preferred Session Type *
                </label>
                <select
                  value={preferences.preferredSessionType}
                  onChange={(e) => handlePreferencesChange('preferredSessionType', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl font-montserrat transition-colors text-sm sm:text-base ${
                    errors.preferredSessionType ? 'border-red-300' : 'border-legal-border'
                  } focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white`}
                >
                  <option value="">Select type</option>
                  {sessionTypeOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {errors.preferredSessionType && (
                  <p className="mt-1 text-sm text-red-600 font-montserrat">{errors.preferredSessionType}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                  Cancellation Policy *
                </label>
                <select
                  value={preferences.cancellationPolicy}
                  onChange={(e) => handlePreferencesChange('cancellationPolicy', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl font-montserrat transition-colors text-sm sm:text-base ${
                    errors.cancellationPolicy ? 'border-red-300' : 'border-legal-border'
                  } focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white`}
                >
                  <option value="">Select policy</option>
                  {cancellationOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {errors.cancellationPolicy && (
                  <p className="mt-1 text-sm text-red-600 font-montserrat">{errors.cancellationPolicy}</p>
                )}
              </div>
            </div>
          </div>

          {/* Earnings Summary */}
          {totalWeeklyHours > 0 && pricing.hourlyRate && (
            <div className="bg-success-50 border border-success-200 rounded-xl p-4 sm:p-6">
              <h4 className="font-semibold text-success-700 font-baskervville mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Estimated Weekly Earnings
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm font-montserrat">
                <div className="text-center sm:text-left">
                  <span className="font-medium text-success-700 block">Available Hours:</span>
                  <div className="text-success-600 text-lg font-bold">{totalWeeklyHours} hours/week</div>
                </div>
                <div className="text-center sm:text-left">
                  <span className="font-medium text-success-700 block">Hourly Rate:</span>
                  <div className="text-success-600 text-lg font-bold">${pricing.hourlyRate}/hour</div>
                </div>
                <div className="text-center sm:text-left">
                  <span className="font-medium text-success-700 block">Potential Earnings:</span>
                  <div className="text-success-600 text-lg font-bold">${estimatedWeeklyEarnings.toLocaleString()}/week</div>
                </div>
              </div>
              <p className="text-xs text-success-600 mt-3">
                * Actual earnings depend on student demand and booking frequency
              </p>
            </div>
          )}

          {/* Additional Settings */}
          <div className="bg-legal-bg-secondary/20 border border-legal-border/50 rounded-xl p-4 sm:p-6">
            <h4 className="font-semibold text-legal-dark-text font-baskervville mb-4">
              Additional Information
            </h4>
            <div className="space-y-4 text-sm font-montserrat text-legal-warm-text">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-accent-500 mt-0.5 flex-shrink-0" />
                <span>You can always update your availability and rates later from your dashboard</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-accent-500 mt-0.5 flex-shrink-0" />
                <span>Students will see your availability in their local timezone</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-accent-500 mt-0.5 flex-shrink-0" />
                <span>You&apos;ll receive notifications for new booking requests and schedule changes</span>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-accent-500 mt-0.5 flex-shrink-0" />
                <span>Payment is processed automatically after each completed session</span>
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
                  <span>Continue</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}