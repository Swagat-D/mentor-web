/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Upload,
  User,
  Globe,
  MapPin,
  Award,
  ArrowRight,
} from 'lucide-react'
import Image from 'next/image'

export default function OnboardingProfile() {
  const [formData, setFormData] = useState({
  profilePhoto: null as string | null, // Add this
  displayName: '',
  location: '',
  timezone: '',
  languages: [] as string[],
  bio: '',
  achievements: '',
  socialMedia: {
    linkedin: '',
    twitter: '',
    website: ''
  }
})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const timezones = [
    'UTC-12:00 - Baker Island',
    'UTC-11:00 - American Samoa',
    'UTC-10:00 - Hawaii',
    'UTC-09:00 - Alaska',
    'UTC-08:00 - Pacific Time',
    'UTC-07:00 - Mountain Time',
    'UTC-06:00 - Central Time',
    'UTC-05:00 - Eastern Time',
    'UTC-04:00 - Atlantic Time',
    'UTC-03:00 - Argentina',
    'UTC-02:00 - South Georgia',
    'UTC-01:00 - Azores',
    'UTC+00:00 - London',
    'UTC+01:00 - Central Europe',
    'UTC+02:00 - Eastern Europe',
    'UTC+03:00 - Moscow',
    'UTC+04:00 - Dubai',
    'UTC+05:00 - Pakistan',
    'UTC+05:30 - India',
    'UTC+06:00 - Bangladesh',
    'UTC+07:00 - Thailand',
    'UTC+08:00 - Singapore',
    'UTC+09:00 - Japan',
    'UTC+10:00 - Australia East',
    'UTC+11:00 - Solomon Islands',
    'UTC+12:00 - New Zealand'
  ]

  const languageOptions = [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
    'Russian', 'Chinese (Mandarin)', 'Japanese', 'Korean', 'Arabic',
    'Hindi', 'Bengali', 'Urdu', 'Turkish', 'Dutch', 'Swedish',
    'Norwegian', 'Danish', 'Finnish', 'Polish', 'Czech', 'Hungarian'
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as Record<string, string>,
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleLanguageToggle = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (file) {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'profile')

      const response = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        setFormData(prev => ({ ...prev, profilePhoto: result.data.url }))
      } else {
        setErrors(prev => ({ ...prev, profilePhoto: result.message }))
      }
    } catch (error) {
      console.error('Upload error:', error)
      setErrors(prev => ({ ...prev, profilePhoto: 'Upload failed' }))
    }
  }
}

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.displayName) newErrors.displayName = 'Display name is required'
    if (!formData.location) newErrors.location = 'Location is required'
    if (!formData.timezone) newErrors.timezone = 'Timezone is required'
    if (formData.languages.length === 0) newErrors.languages = 'Select at least one language'
    if (!formData.bio || formData.bio.length < 50) newErrors.bio = 'Bio must be at least 50 characters'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  if (!validateForm()) return

  setIsLoading(true)
  
  try {
    const response = await fetch('/api/onboarding/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(formData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message)
    }

    // Save progress and navigate to next step
    localStorage.setItem('onboarding-progress', JSON.stringify(['profile']))
    window.location.href = '/onboarding/expertise'
    
  } catch (error: any) {
    console.error('Profile save error:', error)
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
            Complete Your Profile
          </h1>
          <p className="text-legal-warm-text font-montserrat text-sm sm:text-base">
            Help students get to know you better with a comprehensive profile
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Profile Photo */}
          <div>
            <label className="block text-sm font-medium text-legal-dark-text mb-4 font-montserrat">
              Profile Photo
            </label>
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-legal-bg-secondary rounded-full flex items-center justify-center border-2 border-dashed border-legal-border">
    {formData.profilePhoto ? (
      <Image
        src={formData.profilePhoto} 
        alt="Profile" 
        width={96}
        height={96}
        className="w-full h-full rounded-full object-cover"
      />
    ) : (
      <User className="w-6 h-6 sm:w-8 sm:h-8 text-legal-warm-text" />
    )}
  </div>
  <div className="text-center sm:text-left">
    <label className="bg-white text-accent-700 font-semibold py-2 px-4 rounded-lg border border-accent-200 shadow-warm hover:shadow-warm-lg transition-all duration-300 cursor-pointer inline-flex items-center space-x-2 font-montserrat text-sm">
      <Upload className="w-4 h-4" />
      <span>Upload Photo</span>
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileUpload}
        className="hidden"
      />
    </label>
    <p className="text-xs text-legal-warm-text mt-2 font-montserrat">
      JPG, PNG (max 5MB)
    </p>
  </div>
</div>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
              Display Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-legal-warm-text" />
              <input
                name="displayName"
                type="text"
                value={formData.displayName}
                onChange={handleInputChange}
                className={`w-full pl-10 pr-4 py-3 border rounded-xl font-montserrat transition-colors text-sm sm:text-base ${
                  errors.displayName ? 'border-red-300' : 'border-legal-border'
                } focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white`}
                placeholder="How students will see your name"
              />
            </div>
            {errors.displayName && (
              <p className="mt-1 text-sm text-red-600 font-montserrat">{errors.displayName}</p>
            )}
          </div>

          {/* Location & Timezone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                Location *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-legal-warm-text" />
                <input
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl font-montserrat transition-colors text-sm sm:text-base ${
                    errors.location ? 'border-red-300' : 'border-legal-border'
                  } focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white`}
                  placeholder="City, Country"
                />
              </div>
              {errors.location && (
                <p className="mt-1 text-sm text-red-600 font-montserrat">{errors.location}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                Timezone *
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-legal-warm-text" />
                <select
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl font-montserrat transition-colors text-sm sm:text-base ${
                    errors.timezone ? 'border-red-300' : 'border-legal-border'
                  } focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white`}
                >
                  <option value="">Select your timezone</option>
                  {timezones.map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
              {errors.timezone && (
                <p className="mt-1 text-sm text-red-600 font-montserrat">{errors.timezone}</p>
              )}
            </div>
          </div>

          {/* Languages */}
          <div>
            <label className="block text-sm font-medium text-legal-dark-text mb-4 font-montserrat">
              Languages Spoken * 
              <span className="text-legal-warm-text font-normal">(Select all that apply)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {languageOptions.map(language => (
                <label
                  key={language}
                  className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                    formData.languages.includes(language)
                      ? 'border-accent-500 bg-accent-50'
                      : 'border-legal-border hover:border-accent-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.languages.includes(language)}
                    onChange={() => handleLanguageToggle(language)}
                    className="w-4 h-4 text-accent-600 bg-white border-legal-border rounded focus:ring-accent-500 focus:ring-2"
                  />
                  <span className="text-sm font-montserrat">{language}</span>
                </label>
              ))}
            </div>
            {errors.languages && (
              <p className="mt-2 text-sm text-red-600 font-montserrat">{errors.languages}</p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
              Professional Bio *
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={6}
              className={`w-full px-4 py-3 border rounded-xl font-montserrat transition-colors resize-none text-sm sm:text-base ${
                errors.bio ? 'border-red-300' : 'border-legal-border'
              } focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white`}
              placeholder="Tell students about your teaching philosophy, experience, and what makes you passionate about mentoring..."
            />
            {errors.bio && (
              <p className="mt-1 text-sm text-red-600 font-montserrat">{errors.bio}</p>
            )}
            <div className="mt-2 flex justify-between text-xs text-legal-warm-text font-montserrat">
              <span>Minimum 50 characters</span>
              <span>{formData.bio.length}/1000</span>
            </div>
          </div>

          {/* Achievements */}
          <div>
            <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
              Key Achievements & Awards
              <span className="text-legal-warm-text font-normal"> (Optional)</span>
            </label>
            <div className="relative">
              <Award className="absolute left-3 top-3 w-5 h-5 text-legal-warm-text" />
              <textarea
                name="achievements"
                value={formData.achievements}
                onChange={handleInputChange}
                rows={3}
                className="w-full pl-10 pr-4 py-3 border border-legal-border rounded-xl font-montserrat transition-colors resize-none focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white text-sm sm:text-base"
                placeholder="Notable awards, publications, certifications, or professional achievements..."
              />
            </div>
          </div>

          {/* Social Media */}
          <div>
            <label className="block text-sm font-medium text-legal-dark-text mb-4 font-montserrat">
              Professional Links
              <span className="text-legal-warm-text font-normal"> (Optional)</span>
            </label>
            <div className="space-y-4">
              <input
                name="socialMedia.linkedin"
                type="url"
                value={formData.socialMedia.linkedin}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-legal-border rounded-xl font-montserrat transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white text-sm sm:text-base"
                placeholder="LinkedIn profile URL"
              />
              <input
                name="socialMedia.twitter"
                type="url"
                value={formData.socialMedia.twitter}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-legal-border rounded-xl font-montserrat transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white text-sm sm:text-base"
                placeholder="Twitter profile URL"
              />
              <input
                name="socialMedia.website"
                type="url"
                value={formData.socialMedia.website}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-legal-border rounded-xl font-montserrat transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white text-sm sm:text-base"
                placeholder="Personal/professional website"
              />
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