/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/context/AuthContext'
import { 
  User,
  Edit,
  Camera,
  MapPin,
  Calendar,
  Award,
  Star,
  BookOpen,
  Clock,
  DollarSign,
  Save,
  X,
  Plus,
  Trash2,
  Shield,
  CheckCircle,
  AlertCircle,
  Languages,
  Loader,
  Eye,
  EyeOff,
  Globe,
  Linkedin,
  Twitter,
  RefreshCw,
} from 'lucide-react'
import Image from 'next/image'

interface UserProfile {
  _id: string
  firstName: string
  lastName: string
  displayName: string
  email: string
  phone?: string
  location?: string
  timezone?: string
  profilePhoto?: string
  
  // Professional Info
  title: string
  bio: string
  hourlyRate: number
  experience: string
  education: string
  certifications: string[]
  
  // Contact & Social
  website?: string
  linkedin?: string
  twitter?: string
  
  // Teaching Info
  subjects: string[]
  languages: string[]
  teachingStyles: string[]
  specializations: string[]
  
  // Availability
  weeklyHours: number
  responseTime: string
  sessionTypes: string[]
  
  // Privacy Settings
  profileVisibility: 'public' | 'students' | 'private'
  contactVisibility: 'public' | 'students' | 'private'
  showEarnings: boolean
  showReviews: boolean
  emailNotifications: boolean
  smsNotifications: boolean
  
  // Verification
  isVerified: boolean
  verificationStatus: {
    email: boolean
    phone: boolean
    identity: boolean
    education: boolean
    background: boolean
  }
  
  // Metadata
  role: string
  createdAt: string
  updatedAt: string
}

interface ProfileStats {
  totalSessions: number
  totalStudents: number
  averageRating: number
  totalEarnings: number
  joinDate: string
  lastActive: string
}

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  errors?: Record<string, string>
}

export default function ProfilePage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [showPasswordFields, setShowPasswordFields] = useState(false)
  const [profileData, setProfileData] = useState<UserProfile | null>(null)
  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null)
  const [tempProfileData, setTempProfileData] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Form states for password change
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const tabs = [
    { id: 'general', label: 'General', icon: User },
    { id: 'professional', label: 'Professional', icon: Award },
    { id: 'teaching', label: 'Teaching', icon: BookOpen },
    { id: 'privacy', label: 'Privacy', icon: Shield }
  ]

  useEffect(() => {
    fetchProfileData()
    fetchProfileStats()
  }, [])

  const fetchProfileData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/user/profile', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })

      if (response.ok) {
        const data: ApiResponse<UserProfile> = await response.json()
        if (data.success) {
          setProfileData(data.data)
          setTempProfileData(data.data)
        } else {
          setErrors({ general: data.message || 'Failed to load profile' })
        }
      } else {
        setErrors({ general: 'Failed to load profile data' })
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      setErrors({ general: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const fetchProfileStats = async () => {
    try {
      const response = await fetch('/api/user/profile/stats', {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })

      if (response.ok) {
        const data: ApiResponse<ProfileStats> = await response.json()
        if (data.success) {
          setProfileStats(data.data)
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile stats:', error)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    if (!tempProfileData) return
    
    setTempProfileData(prev => ({
      ...prev!,
      [field]: value
    }))
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleArrayAdd = (field: string, value: string) => {
    if (!value.trim() || !tempProfileData) return
    
    const currentArray = tempProfileData[field as keyof UserProfile] as string[]
    if (currentArray.includes(value.trim())) return
    
    setTempProfileData(prev => ({
      ...prev!,
      [field]: [...currentArray, value.trim()]
    }))
  }

  const handleArrayRemove = (field: string, index: number) => {
    if (!tempProfileData) return
    
    const currentArray = tempProfileData[field as keyof UserProfile] as string[]
    setTempProfileData(prev => ({
      ...prev!,
      [field]: currentArray.filter((_, i) => i !== index)
    }))
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setErrors({ photo: 'File size must be less than 5MB' })
      return
    }

    if (!file.type.startsWith('image/')) {
      setErrors({ photo: 'Please select a valid image file' })
      return
    }

    setUploadingPhoto(true)
    setErrors({ photo: '' })

    try {
      const formData = new FormData()
      formData.append('profilePhoto', file)

      const response = await fetch('/api/user/profile/photo', {
        method: 'POST',
        credentials: 'include',
        body: formData
      })

      const data: ApiResponse<{ profilePhoto: string }> = await response.json()

      if (response.ok && data.success) {
        const updatedProfileData = {
          ...tempProfileData!,
          profilePhoto: data.data.profilePhoto
        }
        setTempProfileData(updatedProfileData)
        setProfileData(updatedProfileData)
      } else {
        setErrors({ photo: data.message || 'Failed to upload photo' })
      }
    } catch (error) {
      console.error('Photo upload error:', error)
      setErrors({ photo: 'Failed to upload photo. Please try again.' })
    } finally {
      setUploadingPhoto(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!tempProfileData) return false

    // General validation
    if (!tempProfileData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }
    if (!tempProfileData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }
    if (!tempProfileData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(tempProfileData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Professional validation
    if (!tempProfileData.title.trim()) {
      newErrors.title = 'Professional title is required'
    }
    if (!tempProfileData.bio.trim()) {
      newErrors.bio = 'Bio is required'
    }
    if (tempProfileData.hourlyRate < 10 || tempProfileData.hourlyRate > 1000) {
      newErrors.hourlyRate = 'Hourly rate must be between $10 and $1000'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setSaving(true)
    setErrors({})

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(tempProfileData)
      })

      const data: ApiResponse<UserProfile> = await response.json()

      if (response.ok && data.success) {
        setProfileData(data.data)
        setTempProfileData(data.data)
        setIsEditing(false)
        // Show success message
        setErrors({ success: 'Profile updated successfully!' })
        setTimeout(() => setErrors({}), 3000)
      } else {
        setErrors(data.errors || { general: data.message || 'Failed to save profile' })
      }
    } catch (error) {
      console.error('Save error:', error)
      setErrors({ general: 'Failed to save changes. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setTempProfileData(profileData)
    setIsEditing(false)
    setErrors({})
  }

  const handlePasswordChange = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setErrors({ password: 'All password fields are required' })
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrors({ password: 'New passwords do not match' })
      return
    }

    if (passwordForm.newPassword.length < 8) {
      setErrors({ password: 'New password must be at least 8 characters long' })
      return
    }

    setSaving(true)
    setErrors({})

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      })

      const data: ApiResponse<object> = await response.json()

      if (response.ok && data.success) {
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setShowPasswordFields(false)
        setErrors({ success: 'Password changed successfully!' })
        setTimeout(() => setErrors({}), 3000)
      } else {
        setErrors({ password: data.message || 'Failed to change password' })
      }
    } catch (error) {
      console.error('Password change error:', error)
      setErrors({ password: 'Failed to change password. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const getVerificationIcon = (verified: boolean) => {
    return verified ? (
      <CheckCircle className="w-4 h-4 text-success-500" />
    ) : (
      <AlertCircle className="w-4 h-4 text-amber-500" />
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-accent-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-baskervville font-bold text-legal-dark-text mb-2">
            Loading Profile
          </h2>
          <p className="text-legal-warm-text font-montserrat">
            Fetching your profile data...
          </p>
        </div>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-baskervville font-bold text-legal-dark-text mb-2">
            Failed to Load Profile
          </h2>
          <p className="text-legal-warm-text font-montserrat mb-6">
            {errors.general || 'Unable to load your profile data'}
          </p>
          <button
            onClick={fetchProfileData}
            className="bg-accent-600 text-white font-semibold py-3 px-6 rounded-xl shadow-legal hover:shadow-legal-lg transition-all duration-300 font-montserrat"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      <AnimatePresence>
        {(errors.success || errors.general) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-xl border ${
              errors.success 
                ? 'bg-success-50 border-success-200 text-success-700' 
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              {errors.success ? (
                <CheckCircle className="w-5 h-5 text-success-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              <span className="font-montserrat text-sm">
                {errors.success || errors.general}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-legal-lg border border-warm-200/50 p-8"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-6">
            {/* Profile Photo */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-accent-100 to-accent-200 rounded-full flex items-center justify-center relative overflow-hidden">
                {profileData.profilePhoto ? (
                  <Image
                    src={profileData.profilePhoto}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-accent-600" />
                )}
                {uploadingPhoto && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
              </div>
              {isEditing && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="absolute bottom-0 right-0 bg-accent-600 text-white p-2 rounded-full cursor-pointer hover:bg-accent-700 transition-colors disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>

            {/* Profile Info */}
            <div>
              <h1 className="text-3xl font-baskervville font-bold text-legal-dark-text mb-2">
                {profileData.displayName}
              </h1>
              <p className="text-legal-warm-text font-montserrat mb-2">
                {profileData.title}
              </p>
              <div className="flex items-center space-x-4 text-sm text-legal-warm-text font-montserrat">
                {profileData.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{profileData.location}</span>
                  </div>
                )}
                {profileStats && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {profileStats.joinDate}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${profileStats?.lastActive === 'Active now' ? 'bg-success-500' : 'bg-amber-500'}`} />
                  <span>{profileStats?.lastActive || 'Recently active'}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="bg-white text-legal-warm-text font-semibold py-3 px-6 rounded-xl border border-legal-border hover:bg-legal-bg-secondary/50 transition-colors font-montserrat flex items-center space-x-2 disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-gradient-to-r from-accent-700 to-accent-600 text-white font-semibold py-3 px-6 rounded-xl shadow-legal-lg hover:shadow-legal-xl transition-all duration-300 hover:scale-105 font-montserrat flex items-center space-x-2 disabled:opacity-50 disabled:hover:scale-100"
                >
                  {saving ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-gradient-to-r from-accent-700 to-accent-600 text-white font-semibold py-3 px-6 rounded-xl shadow-legal-lg hover:shadow-legal-xl transition-all duration-300 hover:scale-105 font-montserrat flex items-center space-x-2"
              >
                <Edit className="w-5 h-5" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* Profile Stats */}
        <div className="grid grid-cols-6 gap-6">
          {[
            { label: 'Sessions', value: profileStats?.totalSessions || 0, icon: BookOpen, color: 'accent' },
            { label: 'Students', value: profileStats?.totalStudents || 0, icon: User, color: 'warm' },
            { label: 'Rating', value: profileStats?.averageRating || 0, icon: Star, color: 'amber', suffix: '/5' },
            { label: 'Earnings', value: `$${(profileStats?.totalEarnings || 0).toLocaleString()}`, icon: DollarSign, color: 'success' },
            { label: 'Rate', value: `$${profileData.hourlyRate}`, icon: Clock, color: 'blue', suffix: '/hr' },
            { label: 'Hours/Week', value: profileData.weeklyHours, icon: Calendar, color: 'purple' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white/50 backdrop-blur-sm rounded-xl border border-warm-200/50 p-4 text-center"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2 ${
                stat.color === 'accent' ? 'bg-accent-100 text-accent-600' :
                stat.color === 'warm' ? 'bg-warm-100 text-warm-600' :
                stat.color === 'amber' ? 'bg-amber-100 text-amber-600' :
                stat.color === 'success' ? 'bg-success-100 text-success-600' :
                stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                'bg-purple-100 text-purple-600'
              }`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <p className="text-lg font-bold text-legal-dark-text font-baskervville">
                {stat.value}{stat.suffix || ''}
              </p>
              <p className="text-xs text-legal-warm-text font-montserrat">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="grid grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="col-span-1"
        >
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-legal border border-warm-200/50 p-6">
            <nav className="space-y-2 mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors font-montserrat ${
                    activeTab === tab.id
                      ? 'bg-accent-100 text-accent-700 border border-accent-200'
                      : 'text-legal-warm-text hover:text-accent-600 hover:bg-accent-50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>

            {/* Verification Status */}
            <div className="pt-6 border-t border-legal-border/30">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-legal-dark-text font-montserrat">
                  Verification
                </h4>
                <button 
                  onClick={fetchProfileData}
                  className="text-accent-600 hover:text-accent-700 transition-colors"
                  title="Refresh verification status"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                {[
                  { key: 'email', label: 'Email' },
                  { key: 'phone', label: 'Phone' },
                  { key: 'identity', label: 'Identity' },
                  { key: 'education', label: 'Education' },
                  { key: 'background', label: 'Background' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <span className="text-xs text-legal-warm-text font-montserrat">
                      {item.label}
                    </span>
                    {getVerificationIcon(profileData.verificationStatus?.[item.key as keyof typeof profileData.verificationStatus] || false)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content Area */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="col-span-3"
        >
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-legal border border-warm-200/50 p-6">
            {/* General Info Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h3 className="text-xl font-baskervville font-bold text-legal-dark-text">
                  General Information
                </h3>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                      First Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={tempProfileData?.firstName || ''}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl font-montserrat transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white ${
                          errors.firstName ? 'border-red-300' : 'border-legal-border'
                        }`}
                      />
                    ) : (
                      <div className="w-full px-4 py-3 bg-legal-bg-secondary/20 rounded-xl text-legal-dark-text font-montserrat">
                        {profileData.firstName}
                      </div>
                    )}
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600 font-montserrat">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                      Last Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={tempProfileData?.lastName || ''}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl font-montserrat transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white ${
                          errors.lastName ? 'border-red-300' : 'border-legal-border'
                        }`}
                      />
                    ) : (
                      <div className="w-full px-4 py-3 bg-legal-bg-secondary/20 rounded-xl text-legal-dark-text font-montserrat">
                        {profileData.lastName}
                      </div>
                    )}
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600 font-montserrat">{errors.lastName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                      Display Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={tempProfileData?.displayName || ''}
                        onChange={(e) => handleInputChange('displayName', e.target.value)}
                        className="w-full px-4 py-3 border border-legal-border rounded-xl font-montserrat transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
                      />
                    ) : (
                      <div className="w-full px-4 py-3 bg-legal-bg-secondary/20 rounded-xl text-legal-dark-text font-montserrat">
                        {profileData.displayName}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                      Email Address
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 px-4 py-3 bg-legal-bg-secondary/20 rounded-xl text-legal-dark-text font-montserrat">
                        {profileData.email}
                      </div>
                      {profileData.verificationStatus?.email && (
                        <CheckCircle className="w-5 h-5 text-success-500" />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={tempProfileData?.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-4 py-3 border border-legal-border rounded-xl font-montserrat transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 px-4 py-3 bg-legal-bg-secondary/20 rounded-xl text-legal-dark-text font-montserrat">
                          {profileData.phone || 'Not provided'}
                        </div>
                        {profileData.verificationStatus?.phone && (
                          <CheckCircle className="w-5 h-5 text-success-500" />
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                      Location
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={tempProfileData?.location || ''}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="w-full px-4 py-3 border border-legal-border rounded-xl font-montserrat transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
                        placeholder="City, Country"
                      />
                    ) : (
                      <div className="w-full px-4 py-3 bg-legal-bg-secondary/20 rounded-xl text-legal-dark-text font-montserrat">
                        {profileData.location || 'Not provided'}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      value={tempProfileData?.bio || ''}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={4}
                      className={`w-full px-4 py-3 border rounded-xl font-montserrat transition-colors resize-none focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white ${
                        errors.bio ? 'border-red-300' : 'border-legal-border'
                      }`}
                      placeholder="Tell students about yourself..."
                    />
                  ) : (
                    <div className="w-full px-4 py-3 bg-legal-bg-secondary/20 rounded-xl text-legal-dark-text font-montserrat leading-relaxed min-h-[100px]">
                      {profileData.bio}
                    </div>
                  )}
                  {errors.bio && (
                    <p className="mt-1 text-sm text-red-600 font-montserrat">{errors.bio}</p>
                  )}
                </div>
              </div>
            )}

            {/* Professional Tab */}
            {activeTab === 'professional' && (
              <div className="space-y-6">
                <h3 className="text-xl font-baskervville font-bold text-legal-dark-text">
                  Professional Information
                </h3>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                      Professional Title
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={tempProfileData?.title || ''}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-xl font-montserrat transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white ${
                          errors.title ? 'border-red-300' : 'border-legal-border'
                        }`}
                        placeholder="e.g., Mathematics Mentor"
                      />
                    ) : (
                      <div className="w-full px-4 py-3 bg-legal-bg-secondary/20 rounded-xl text-legal-dark-text font-montserrat">
                        {profileData.title}
                      </div>
                    )}
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600 font-montserrat">{errors.title}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                      Hourly Rate (USD)
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        min="10"
                        max="1000"
                        value={tempProfileData?.hourlyRate || ''}
                        onChange={(e) => handleInputChange('hourlyRate', parseInt(e.target.value) || 0)}
                        className={`w-full px-4 py-3 border rounded-xl font-montserrat transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white ${
                          errors.hourlyRate ? 'border-red-300' : 'border-legal-border'
                        }`}
                      />
                    ) : (
                      <div className="w-full px-4 py-3 bg-legal-bg-secondary/20 rounded-xl text-legal-dark-text font-montserrat">
                        ${profileData.hourlyRate}
                      </div>
                    )}
                    {errors.hourlyRate && (
                      <p className="mt-1 text-sm text-red-600 font-montserrat">{errors.hourlyRate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                      Experience
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={tempProfileData?.experience || ''}
                        onChange={(e) => handleInputChange('experience', e.target.value)}
                        className="w-full px-4 py-3 border border-legal-border rounded-xl font-montserrat transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
                        placeholder="e.g., 5+ years"
                      />
                    ) : (
                      <div className="w-full px-4 py-3 bg-legal-bg-secondary/20 rounded-xl text-legal-dark-text font-montserrat">
                        {profileData.experience}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                      Education
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={tempProfileData?.education || ''}
                        onChange={(e) => handleInputChange('education', e.target.value)}
                        className="w-full px-4 py-3 border border-legal-border rounded-xl font-montserrat transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
                        placeholder="e.g., PhD in Mathematics, Stanford University"
                      />
                    ) : (
                      <div className="w-full px-4 py-3 bg-legal-bg-secondary/20 rounded-xl text-legal-dark-text font-montserrat">
                        {profileData.education}
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                      Website
                    </label>
                    {isEditing ? (
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-legal-warm-text" />
                        <input
                          type="url"
                          value={tempProfileData?.website || ''}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-legal-border rounded-xl font-montserrat transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
                          placeholder="https://yourwebsite.com"
                        />
                      </div>
                    ) : (
                      <div className="w-full px-4 py-3 bg-legal-bg-secondary/20 rounded-xl text-legal-dark-text font-montserrat">
                        {profileData.website ? (
                          <a 
                            href={profileData.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-accent-600 hover:text-accent-700 underline"
                          >
                            {profileData.website}
                          </a>
                        ) : (
                          'Not provided'
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                      LinkedIn
                    </label>
                    {isEditing ? (
                      <div className="relative">
                        <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-legal-warm-text" />
                        <input
                          type="url"
                          value={tempProfileData?.linkedin || ''}
                          onChange={(e) => handleInputChange('linkedin', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-legal-border rounded-xl font-montserrat transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
                          placeholder="https://linkedin.com/in/username"
                        />
                      </div>
                    ) : (
                      <div className="w-full px-4 py-3 bg-legal-bg-secondary/20 rounded-xl text-legal-dark-text font-montserrat">
                        {profileData.linkedin ? (
                          <a 
                            href={profileData.linkedin} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-accent-600 hover:text-accent-700 underline"
                          >
                            LinkedIn Profile
                          </a>
                        ) : (
                          'Not provided'
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                      Twitter
                    </label>
                    {isEditing ? (
                      <div className="relative">
                        <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-legal-warm-text" />
                        <input
                          type="url"
                          value={tempProfileData?.twitter || ''}
                          onChange={(e) => handleInputChange('twitter', e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-legal-border rounded-xl font-montserrat transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
                          placeholder="https://twitter.com/username"
                        />
                      </div>
                    ) : (
                      <div className="w-full px-4 py-3 bg-legal-bg-secondary/20 rounded-xl text-legal-dark-text font-montserrat">
                        {profileData.twitter ? (
                          <a 
                            href={profileData.twitter} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-accent-600 hover:text-accent-700 underline"
                          >
                            Twitter Profile
                          </a>
                        ) : (
                          'Not provided'
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Teaching Tab - Replace the subjects section with this */}
{activeTab === 'teaching' && (
  <div className="space-y-6">
    <h3 className="text-xl font-baskervville font-bold text-legal-dark-text">
      Teaching Information
    </h3>

    {/* Subjects */}
    <div>
      <label className="block text-sm font-medium text-legal-dark-text mb-4 font-montserrat">
        Subjects I Teach
      </label>
      <div className="space-y-2">
        {(tempProfileData?.subjects || []).map((subject, index) => {
          
          const subjectName = typeof subject === 'string' 
  ? subject 
  : (subject as { name?: string })?.name || 'Unknown Subject';

const subjectLevel = typeof subject === 'object' && subject 
  ? (subject as { level?: string })?.level || ''
  : '';

const subjectExperience = typeof subject === 'object' && subject 
  ? (subject as { experience?: string })?.experience || ''
  : '';
          
          return (
            <div key={index} className="flex items-center justify-between bg-accent-50 border border-accent-200 rounded-lg p-3">
              <div className="flex-1">
                <span className="text-accent-700 font-montserrat font-medium">{subjectName}</span>
                {subjectLevel && (
                  <span className="text-xs text-accent-600 font-montserrat ml-2">({subjectLevel})</span>
                )}
                {subjectExperience && (
                  <div className="text-xs text-accent-600 font-montserrat mt-1">{subjectExperience}</div>
                )}
              </div>
              {isEditing && (
                <button
                  onClick={() => handleArrayRemove('subjects', index)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}
        {isEditing && (
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Add subject (e.g., Advanced Calculus)"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const value = e.currentTarget.value.trim();
                  if (value) {
                    // Add as simple string for now, can be enhanced later to support objects
                    handleArrayAdd('subjects', value);
                    e.currentTarget.value = '';
                  }
                }
              }}
              className="flex-1 px-4 py-2 border border-legal-border rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
            />
            <button
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                const value = input.value.trim();
                if (value) {
                  handleArrayAdd('subjects', value);
                  input.value = '';
                }
              }}
              className="bg-accent-100 text-accent-700 p-2 rounded-lg hover:bg-accent-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>

    {/* Languages */}
    <div>
      <label className="block text-sm font-medium text-legal-dark-text mb-4 font-montserrat">
        Languages I Speak
      </label>
      <div className="flex flex-wrap gap-2">
        {(tempProfileData?.languages || []).map((language, index) => {
          // Ensure language is a string
          const languageName = typeof language === 'string' ? language : String(language);
          
          return (
            <div key={index} className="flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-lg p-2">
              <Languages className="w-4 h-4 text-blue-600" />
              <span className="text-blue-700 font-montserrat text-sm">{languageName}</span>
              {isEditing && (
                <button
                  onClick={() => handleArrayRemove('languages', index)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
        {isEditing && (
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Add language"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const value = e.currentTarget.value.trim();
                  if (value) {
                    handleArrayAdd('languages', value);
                    e.currentTarget.value = '';
                  }
                }
              }}
              className="px-3 py-2 border border-legal-border rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
            />
            <button
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                const value = input.value.trim();
                if (value) {
                  handleArrayAdd('languages', value);
                  input.value = '';
                }
              }}
              className="bg-blue-100 text-blue-700 p-2 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>

    {/* Teaching Styles */}
    <div>
      <label className="block text-sm font-medium text-legal-dark-text mb-4 font-montserrat">
        Teaching Styles
      </label>
      <div className="flex flex-wrap gap-2">
        {(tempProfileData?.teachingStyles || []).map((style, index) => {
          // Ensure style is a string
          const styleName = typeof style === 'string' ? style : String(style);
          
          return (
            <div key={index} className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg p-2">
              <span className="text-green-700 font-montserrat text-sm">{styleName}</span>
              {isEditing && (
                <button
                  onClick={() => handleArrayRemove('teachingStyles', index)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
        {isEditing && (
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Add teaching style"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const value = e.currentTarget.value.trim();
                  if (value) {
                    handleArrayAdd('teachingStyles', value);
                    e.currentTarget.value = '';
                  }
                }
              }}
              className="px-3 py-2 border border-legal-border rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
            />
            <button
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                const value = input.value.trim();
                if (value) {
                  handleArrayAdd('teachingStyles', value);
                  input.value = '';
                }
              }}
              className="bg-green-100 text-green-700 p-2 rounded-lg hover:bg-green-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>

    {/* Specializations */}
    <div>
      <label className="block text-sm font-medium text-legal-dark-text mb-4 font-montserrat">
        Specializations
      </label>
      <div className="flex flex-wrap gap-2">
        {(tempProfileData?.specializations || []).map((specialization, index) => {
          // Ensure specialization is a string
          const specializationName = typeof specialization === 'string' ? specialization : String(specialization);
          
          return (
            <div key={index} className="flex items-center space-x-2 bg-purple-50 border border-purple-200 rounded-lg p-2">
              <span className="text-purple-700 font-montserrat text-sm">{specializationName}</span>
              {isEditing && (
                <button
                  onClick={() => handleArrayRemove('specializations', index)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
        {isEditing && (
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Add specialization"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const value = e.currentTarget.value.trim();
                  if (value) {
                    handleArrayAdd('specializations', value);
                    e.currentTarget.value = '';
                  }
                }
              }}
              className="px-3 py-2 border border-legal-border rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
            />
            <button
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                const value = input.value.trim();
                if (value) {
                  handleArrayAdd('specializations', value);
                  input.value = '';
                }
              }}
              className="bg-purple-100 text-purple-700 p-2 rounded-lg hover:bg-purple-200 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>

    {/* Availability */}
    <div className="grid grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
          Weekly Hours Available
        </label>
        {isEditing ? (
          <input
            type="number"
            min="1"
            max="168"
            value={tempProfileData?.weeklyHours || ''}
            onChange={(e) => handleInputChange('weeklyHours', parseInt(e.target.value) || 0)}
            className="w-full px-4 py-3 border border-legal-border rounded-xl font-montserrat transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
          />
        ) : (
          <div className="w-full px-4 py-3 bg-legal-bg-secondary/20 rounded-xl text-legal-dark-text font-montserrat">
            {profileData.weeklyHours} hours
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
          Average Response Time
        </label>
        {isEditing ? (
          <input
            type="text"
            value={tempProfileData?.responseTime || ''}
            onChange={(e) => handleInputChange('responseTime', e.target.value)}
            className="w-full px-4 py-3 border border-legal-border rounded-xl font-montserrat transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
            placeholder="e.g., < 2 hours"
          />
        ) : (
          <div className="w-full px-4 py-3 bg-legal-bg-secondary/20 rounded-xl text-legal-dark-text font-montserrat">
            {profileData.responseTime}
          </div>
        )}
      </div>
    </div>
  </div>
)}
            {/* Privacy & Security Tab */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <h3 className="text-xl font-baskervville font-bold text-legal-dark-text">
                  Privacy & Security Settings
                </h3>
                
                {/* Profile Visibility */}
                <div>
                  <label className="block text-sm font-medium text-legal-dark-text mb-4 font-montserrat">
                    Profile Visibility
                  </label>
                  <div className="space-y-3">
                    {[
                      { value: 'public', label: 'Public - Visible to everyone', desc: 'Your profile appears in search results' },
                      { value: 'students', label: 'Students Only - Visible to matched students', desc: 'Only students you\'re matched with can see your profile' },
                      { value: 'private', label: 'Private - Not visible in searches', desc: 'Your profile won\'t appear in public searches' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-start space-x-3 p-3 border border-legal-border rounded-lg cursor-pointer hover:bg-legal-bg-secondary/20 transition-colors">
                        <input
                          type="radio"
                          name="profileVisibility"
                          value={option.value}
                          checked={tempProfileData?.profileVisibility === option.value}
                          onChange={(e) => handleInputChange('profileVisibility', e.target.value)}
                          disabled={!isEditing}
                          className="mt-1 w-4 h-4 text-accent-600 border-legal-border focus:ring-accent-500"
                        />
                        <div>
                          <p className="font-medium text-legal-dark-text font-montserrat">{option.label}</p>
                          <p className="text-sm text-legal-warm-text font-montserrat">{option.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Notification Settings */}
                <div>
                  <label className="block text-sm font-medium text-legal-dark-text mb-4 font-montserrat">
                    Notification Preferences
                  </label>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 border border-legal-border rounded-lg">
                      <div>
                        <p className="font-medium text-legal-dark-text font-montserrat">Email Notifications</p>
                        <p className="text-sm text-legal-warm-text font-montserrat">Receive updates via email</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={tempProfileData?.emailNotifications || false}
                        onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                        disabled={!isEditing}
                        className="w-4 h-4 text-accent-600 border-legal-border rounded focus:ring-accent-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 border border-legal-border rounded-lg">
                      <div>
                        <p className="font-medium text-legal-dark-text font-montserrat">SMS Notifications</p>
                        <p className="text-sm text-legal-warm-text font-montserrat">Receive text message alerts</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={tempProfileData?.smsNotifications || false}
                        onChange={(e) => handleInputChange('smsNotifications', e.target.checked)}
                        disabled={!isEditing}
                        className="w-4 h-4 text-accent-600 border-legal-border rounded focus:ring-accent-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 border border-legal-border rounded-lg">
                      <div>
                        <p className="font-medium text-legal-dark-text font-montserrat">Show Reviews</p>
                        <p className="text-sm text-legal-warm-text font-montserrat">Display reviews on your public profile</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={tempProfileData?.showReviews || false}
                        onChange={(e) => handleInputChange('showReviews', e.target.checked)}
                        disabled={!isEditing}
                        className="w-4 h-4 text-accent-600 border-legal-border rounded focus:ring-accent-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 border border-legal-border rounded-lg">
                      <div>
                        <p className="font-medium text-legal-dark-text font-montserrat">Show Earnings</p>
                        <p className="text-sm text-legal-warm-text font-montserrat">Display earnings stats on your profile</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={tempProfileData?.showEarnings || false}
                        onChange={(e) => handleInputChange('showEarnings', e.target.checked)}
                        disabled={!isEditing}
                        className="w-4 h-4 text-accent-600 border-legal-border rounded focus:ring-accent-500"
                      />
                    </label>
                  </div>
                </div>

                {/* Password Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-legal-dark-text font-montserrat">
                      Password & Security
                    </label>
                    <button
                      onClick={() => setShowPasswordFields(!showPasswordFields)}
                      className="text-sm text-accent-600 hover:text-accent-700 font-medium font-montserrat"
                    >
                      Change Password
                    </button>
                  </div>
                  
                  <AnimatePresence>
                    {showPasswordFields && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 p-4 bg-legal-bg-secondary/20 rounded-lg border border-legal-border/50"
                      >
                        <div>
                          <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                            Current Password
                          </label>
                          <div className="relative">
                            <input
                              type={showCurrentPassword ? 'text' : 'password'}
                              value={passwordForm.currentPassword}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                              className="w-full px-4 py-3 pr-12 border border-legal-border rounded-xl font-montserrat transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-legal-warm-text hover:text-legal-dark-text"
                            >
                              {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                            New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showNewPassword ? 'text' : 'password'}
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                              className="w-full px-4 py-3 pr-12 border border-legal-border rounded-xl font-montserrat transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-legal-warm-text hover:text-legal-dark-text"
                            >
                              {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                              className="w-full px-4 py-3 pr-12 border border-legal-border rounded-xl font-montserrat transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-legal-warm-text hover:text-legal-dark-text"
                            >
                              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                        
                        {errors.password && (
                          <p className="text-sm text-red-600 font-montserrat">{errors.password}</p>
                        )}
                        
                        <button 
                          onClick={handlePasswordChange}
                          disabled={saving}
                          className="bg-accent-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-accent-700 transition-colors font-montserrat disabled:opacity-50 flex items-center space-x-2"
                        >
                          {saving ? (
                            <>
                              <Loader className="w-4 h-4 animate-spin" />
                              <span>Updating...</span>
                            </>
                          ) : (
                            <span>Update Password</span>
                          )}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Two-Factor Authentication */}
                <div className="p-4 bg-success-50 border border-success-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-success-800 font-montserrat">Two-Factor Authentication</h4>
                      <p className="text-sm text-success-700 font-montserrat">Add an extra layer of security to your account</p>
                    </div>
                    <button className="bg-success-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-success-700 transition-colors font-montserrat text-sm">
                      Enable 2FA
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}