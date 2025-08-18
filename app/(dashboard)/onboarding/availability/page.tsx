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
  Calendar,
  Clock,
  Plus,
  X,
  Info
} from 'lucide-react'

interface TimeSlot {
  id: string
  startTime: string
  endTime: string
}

interface DaySchedule {
  isAvailable: boolean
  timeSlots: TimeSlot[]
}

interface WeeklySchedule {
  monday: DaySchedule
  tuesday: DaySchedule
  wednesday: DaySchedule
  thursday: DaySchedule
  friday: DaySchedule
  saturday: DaySchedule
  sunday: DaySchedule
}

export default function OnboardingAvailability() {
  const [pricing, setPricing] = useState({
    hourlyRateINR: ''
  })

  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>({
    monday: { isAvailable: false, timeSlots: [] },
    tuesday: { isAvailable: false, timeSlots: [] },
    wednesday: { isAvailable: false, timeSlots: [] },
    thursday: { isAvailable: false, timeSlots: [] },
    friday: { isAvailable: false, timeSlots: [] },
    saturday: { isAvailable: false, timeSlots: [] },
    sunday: { isAvailable: false, timeSlots: [] }
  })

  const [sessionDurations] = useState<number[]>([60]) // Fixed to 60 minutes
  const [timezone, setTimezone] = useState('Asia/Kolkata')

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const daysOfWeek = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ]

  const timezones = [
    'Asia/Kolkata',
    'Asia/Dubai',
    'Europe/London',
    'America/New_York',
    'America/Los_Angeles',
    'Australia/Sydney'
  ]

  const generateTimeOptions = () => {
    const times = []
    for (let hour = 0; hour < 24; hour++) {
      for (const minute of [0, 30]) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })
        times.push({ value: timeString, label: displayTime })
      }
    }
    return times
  }

  const timeOptions = generateTimeOptions()

  const handlePricingChange = (value: string) => {
    setPricing({ hourlyRateINR: value })
    if (errors.hourlyRateINR) {
      setErrors(prev => ({ ...prev, hourlyRateINR: '' }))
    }
  }

  const toggleDayAvailability = (day: keyof WeeklySchedule) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        isAvailable: !prev[day].isAvailable,
        timeSlots: !prev[day].isAvailable ? [] : prev[day].timeSlots
      }
    }))
  }

  const addTimeSlot = (day: keyof WeeklySchedule) => {
    const newSlot: TimeSlot = {
      id: `${day}-${Date.now()}`,
      startTime: '09:00',
      endTime: '10:00'
    }

    setWeeklySchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: [...prev[day].timeSlots, newSlot]
      }
    }))
  }

  const removeTimeSlot = (day: keyof WeeklySchedule, slotId: string) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: prev[day].timeSlots.filter(slot => slot.id !== slotId)
      }
    }))
  }

  const updateTimeSlot = (day: keyof WeeklySchedule, slotId: string, field: 'startTime' | 'endTime', value: string) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        timeSlots: prev[day].timeSlots.map(slot =>
          slot.id === slotId ? { ...slot, [field]: value } : slot
        )
      }
    }))
  }

  const addSessionDuration = () => {
    // Not needed anymore - fixed to 60 minutes
  }

  const removeSessionDuration = (duration: number) => {
    // Not needed anymore - fixed to 60 minutes
  }

  const updateSessionDuration = (oldDuration: number, newDuration: number) => {
    // Not needed anymore - fixed to 60 minutes
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

    // Validate availability
    const hasAvailability = Object.values(weeklySchedule).some(day => 
      day.isAvailable && day.timeSlots.length > 0
    )

    if (!hasAvailability) {
      newErrors.availability = 'Please set availability for at least one day'
    }

    // Validate time slots
    Object.entries(weeklySchedule).forEach(([dayKey, day]) => {
      if (day.isAvailable) {
        day.timeSlots.forEach((slot: TimeSlot) => {
          if (slot.startTime >= slot.endTime) {
            newErrors[`${dayKey}-${slot.id}`] = 'Start time must be before end time'
          }
        })
      }
    })

    // Validate session durations (always 60 minutes, so always valid)
    // No validation needed for fixed duration

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
          weeklySchedule,
          sessionDurations: [60], // Fixed 60-minute sessions
          timezone
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
            Configure your hourly rate and weekly schedule for mentoring sessions
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
                    <div>60 minutes: ₹{parseInt(pricing.hourlyRateINR)}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Session Duration Info */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4 sm:p-6">
            <h3 className="text-xl font-baskervville font-bold text-legal-dark-text mb-4 flex items-center">
              <Clock className="w-6 h-6 mr-2 text-purple-600" />
              Session Duration
            </h3>
            
            <div className="bg-white border border-purple-200 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-purple-700 font-baskervville">60 Minutes</h4>
                  <p className="text-sm text-purple-600 font-montserrat">Standard mentoring session duration</p>
                </div>
              </div>
              
              {pricing.hourlyRateINR && (
                <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg text-center">
                  <p className="text-sm text-purple-600 font-montserrat">
                    Session Price: <span className="font-bold text-purple-700">₹{parseInt(pricing.hourlyRateINR)}</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Weekly Schedule */}
          <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-300 rounded-2xl p-6 sm:p-8 shadow-lg">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-baskervville font-bold text-green-800 mb-2">
                Weekly Availability
              </h3>
              <p className="text-green-600 font-montserrat">
                Set your available days and time slots for mentoring sessions
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-green-200">
                <label className="block text-sm font-medium text-green-800 font-montserrat">
                  Your Timezone:
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="px-4 py-2 border-2 border-green-300 rounded-xl font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-md transition-all"
                >
                  {timezones.map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {daysOfWeek.map(({ key, label }) => (
                  <motion.div 
                    key={key} 
                    className="group relative"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: daysOfWeek.findIndex(d => d.key === key) * 0.1 }}
                  >
                    <div className={`relative bg-white/90 backdrop-blur-sm border-2 rounded-2xl p-5 transition-all duration-300 ${
                      weeklySchedule[key as keyof WeeklySchedule].isAvailable 
                        ? 'border-green-400 shadow-lg shadow-green-200/50 bg-gradient-to-br from-white to-green-50' 
                        : 'border-gray-200 hover:border-green-300 hover:shadow-md'
                    }`}>
                      
                      {/* Day Header */}
                      <div className="flex items-center justify-between mb-4">
                        <label className="flex items-center space-x-3 cursor-pointer group-hover:scale-105 transition-transform">
                          <input
                            type="checkbox"
                            checked={weeklySchedule[key as keyof WeeklySchedule].isAvailable}
                            onChange={() => toggleDayAvailability(key as keyof WeeklySchedule)}
                            className="w-5 h-5 text-green-600 bg-white border-2 border-green-300 rounded-lg focus:ring-green-500 focus:ring-2 transition-all"
                          />
                          <span className={`font-bold font-baskervville text-lg transition-colors ${
                            weeklySchedule[key as keyof WeeklySchedule].isAvailable 
                              ? 'text-green-700' 
                              : 'text-gray-600'
                          }`}>
                            {label}
                          </span>
                        </label>
                        
                        {weeklySchedule[key as keyof WeeklySchedule].isAvailable && (
                          <button
                            type="button"
                            onClick={() => addTimeSlot(key as keyof WeeklySchedule)}
                            className="flex items-center space-x-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg text-sm font-montserrat"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add Time</span>
                          </button>
                        )}
                      </div>

                      {/* Time Slots */}
                      {weeklySchedule[key as keyof WeeklySchedule].isAvailable && (
                        <motion.div 
                          className="space-y-3"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ duration: 0.3 }}
                        >
                          {weeklySchedule[key as keyof WeeklySchedule].timeSlots.length === 0 ? (
                            <div className="text-center py-6 text-green-600 font-montserrat text-sm">
                              Click &quot;Add Time&quot; to set your availability
                            </div>
                          ) : (
                            weeklySchedule[key as keyof WeeklySchedule].timeSlots.map((slot, index) => (
                              <motion.div 
                                key={slot.id} 
                                className="flex items-center space-x-3 bg-gradient-to-r from-green-100 to-emerald-100 p-3 rounded-xl border border-green-200"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                              >
                                <select
                                  value={slot.startTime}
                                  onChange={(e) => updateTimeSlot(key as keyof WeeklySchedule, slot.id, 'startTime', e.target.value)}
                                  className="flex-1 px-3 py-2 border border-green-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white font-montserrat shadow-sm"
                                >
                                  {timeOptions.map(time => (
                                    <option key={time.value} value={time.value}>{time.label}</option>
                                  ))}
                                </select>
                                
                                <div className="flex items-center space-x-1 text-green-600 font-montserrat text-sm">
                                  <span>to</span>
                                </div>
                                
                                <select
                                  value={slot.endTime}
                                  onChange={(e) => updateTimeSlot(key as keyof WeeklySchedule, slot.id, 'endTime', e.target.value)}
                                  className="flex-1 px-3 py-2 border border-green-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white font-montserrat shadow-sm"
                                >
                                  {timeOptions.map(time => (
                                    <option key={time.value} value={time.value}>{time.label}</option>
                                  ))}
                                </select>
                                
                                <button
                                  type="button"
                                  onClick={() => removeTimeSlot(key as keyof WeeklySchedule, slot.id)}
                                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </motion.div>
                            ))
                          )}
                          
                          {errors[`${key}-${weeklySchedule[key as keyof WeeklySchedule].timeSlots[0]?.id}`] && (
                            <p className="text-sm text-red-600 font-montserrat bg-red-50 p-2 rounded-lg">
                              {errors[`${key}-${weeklySchedule[key as keyof WeeklySchedule].timeSlots[0]?.id}`]}
                            </p>
                          )}
                        </motion.div>
                      )}

                      {/* Available indicator */}
                      {weeklySchedule[key as keyof WeeklySchedule].isAvailable && weeklySchedule[key as keyof WeeklySchedule].timeSlots.length > 0 && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {errors.availability && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-center space-x-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-700 font-montserrat text-sm">{errors.availability}</p>
                </motion.div>
              )}

              {/* Summary */}
              {Object.values(weeklySchedule).some(day => day.isAvailable && day.timeSlots.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white text-center shadow-lg"
                >
                  <h4 className="font-bold font-baskervville text-lg mb-2">Availability Summary</h4>
                  <p className="font-montserrat text-green-100">
                    You&apos;re available {Object.values(weeklySchedule).filter(day => day.isAvailable && day.timeSlots.length > 0).length} days per week
                    with {Object.values(weeklySchedule).reduce((total, day) => total + day.timeSlots.length, 0)} time slots
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Booking Preferences - REMOVED */}

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
                  <span>Continue to Verification</span>
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