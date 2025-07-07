'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
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
  Languages
} from 'lucide-react'

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const [showPasswordFields, setShowPasswordFields] = useState(false)

  const [profileData, setProfileData] = useState({
    // Basic Info
    firstName: 'John',
    lastName: 'Doe',
    displayName: 'John Doe',
    email: 'john.doe@mentormatch.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    timezone: 'UTC-08:00 - Pacific Time',
    profilePhoto: null as File | null,
    
    // Professional Info
    title: 'Mathematics Mentor',
    bio: 'Passionate mathematics educator with over 10 years of experience helping students excel in calculus, statistics, and advanced mathematics. I believe in making complex concepts accessible through clear explanations and practical examples.',
    hourlyRate: 75,
    experience: '10+ years',
    education: 'PhD in Mathematics, Stanford University',
    certifications: [
      'Certified Mathematics Teacher',
      'Advanced Statistics Certification'
    ],
    
    // Contact & Social
    website: 'https://johndoe-math.com',
    linkedin: 'https://linkedin.com/in/johndoe',
    twitter: 'https://twitter.com/johndoe',
    
    // Teaching Info
    subjects: ['Advanced Calculus', 'Statistics', 'Linear Algebra', 'Differential Equations'],
    languages: ['English', 'Spanish', 'French'],
    teachingStyles: ['Visual Learning', 'Step-by-step Problem Solving', 'Real-world Applications'],
    specializations: ['Test Prep (SAT, ACT)', 'College Admissions Counseling', 'Advanced/Gifted Students'],
    
    // Availability
    weeklyHours: 25,
    responseTime: '< 2 hours',
    sessionTypes: ['One-on-one', 'Group sessions'],
    
    // Privacy Settings
    profileVisibility: 'public',
    contactVisibility: 'students',
    showEarnings: false,
    showReviews: true,
    emailNotifications: true,
    smsNotifications: false
  })

  const [tempProfileData, setTempProfileData] = useState({ ...profileData })

  const tabs = [
    { id: 'general', label: 'General Info', icon: User },
    { id: 'professional', label: 'Professional', icon: Award },
    { id: 'teaching', label: 'Teaching', icon: BookOpen },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield }
  ]

  const stats = {
    totalSessions: 156,
    totalStudents: 24,
    averageRating: 4.8,
    totalEarnings: 11700,
    joinDate: 'March 2023',
    lastActive: 'Active now'
  }

  const verificationStatus = {
    email: true,
    phone: true,
    identity: true,
    education: false,
    background: true
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleInputChange = (field: string, value: any) => {
    setTempProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleArrayAdd = (field: string, value: string) => {
    if (value.trim()) {
      setTempProfileData(prev => ({
        ...prev,
        [field]: [...(prev[field as keyof typeof prev] as string[]), value.trim()]
      }))
    }
  }

  const handleArrayRemove = (field: string, index: number) => {
    setTempProfileData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).filter((_, i) => i !== index)
    }))
  }

  const handleSave = () => {
    setProfileData({ ...tempProfileData })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setTempProfileData({ ...profileData })
    setIsEditing(false)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setTempProfileData(prev => ({ ...prev, profilePhoto: file }))
    }
  }

  const getVerificationIcon = (verified: boolean) => {
    return verified ? (
      <CheckCircle className="w-4 h-4 text-success-500" />
    ) : (
      <AlertCircle className="w-4 h-4 text-amber-500" />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-legal-lg border border-warm-200/50 p-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center space-x-6 mb-6 lg:mb-0">
            {/* Profile Photo */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-accent-100 to-accent-200 rounded-full flex items-center justify-center">
                {tempProfileData.profilePhoto ? (
                  <Image
                    src={URL.createObjectURL(tempProfileData.profilePhoto)}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-accent-600" />
                )}
              </div>
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-accent-600 text-white p-2 rounded-full cursor-pointer hover:bg-accent-700 transition-colors">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div>
              <h1 className="text-3xl font-baskervville font-bold text-legal-dark-text mb-2">
                {profileData.displayName}
              </h1>
              <p className="text-legal-warm-text font-montserrat mb-1">
                {profileData.title}
              </p>
              <div className="flex items-center space-x-4 text-sm text-legal-warm-text font-montserrat">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{profileData.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {stats.joinDate}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-success-500 rounded-full" />
                  <span>{stats.lastActive}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="bg-white text-legal-warm-text font-semibold py-3 px-6 rounded-xl border border-legal-border hover:bg-legal-bg-secondary/50 transition-colors font-montserrat flex items-center space-x-2"
                >
                  <X className="w-5 h-5" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSave}
                  className="bg-gradient-to-r from-accent-700 to-accent-600 text-white font-semibold py-3 px-6 rounded-xl shadow-legal-lg hover:shadow-legal-xl transition-all duration-300 hover:scale-105 font-montserrat flex items-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>Save Changes</span>
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
      </motion.div>

      {/* Profile Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {[
          { label: 'Sessions', value: stats.totalSessions, icon: BookOpen, color: 'accent' },
          { label: 'Students', value: stats.totalStudents, icon: User, color: 'warm' },
          { label: 'Rating', value: stats.averageRating, icon: Star, color: 'amber', suffix: '/5' },
          { label: 'Earnings', value: `$${stats.totalEarnings.toLocaleString()}`, icon: DollarSign, color: 'success' },
          { label: 'Rate', value: `$${profileData.hourlyRate}`, icon: Clock, color: 'blue', suffix: '/hr' },
          { label: 'Hours/Week', value: profileData.weeklyHours, icon: Calendar, color: 'purple' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="bg-white/95 backdrop-blur-sm rounded-xl shadow-legal border border-warm-200/50 p-4"
          >
            <div className="flex items-center space-x-3 mb-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                stat.color === 'accent' ? 'bg-accent-100 text-accent-600' :
                stat.color === 'warm' ? 'bg-warm-100 text-warm-600' :
                stat.color === 'amber' ? 'bg-amber-100 text-amber-600' :
                stat.color === 'success' ? 'bg-success-100 text-success-600' :
                stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                'bg-purple-100 text-purple-600'
              }`}>
                <stat.icon className="w-4 h-4" />
              </div>
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

      {/* Main Content */}
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-1"
        >
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-legal border border-warm-200/50 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors font-montserrat ${
                    activeTab === tab.id
                      ? 'bg-accent-100 text-accent-700 border border-accent-200'
                      : 'text-legal-warm-text hover:bg-legal-bg-secondary/30'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>

            {/* Verification Status */}
            <div className="mt-6 pt-6 border-t border-legal-border/30">
              <h4 className="text-sm font-semibold text-legal-dark-text font-montserrat mb-4">
                Verification Status
              </h4>
              <div className="space-y-3">
                {[
                  { key: 'email', label: 'Email Address' },
                  { key: 'phone', label: 'Phone Number' },
                  { key: 'identity', label: 'Identity' },
                  { key: 'education', label: 'Education' },
                  { key: 'background', label: 'Background Check' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <span className="text-xs text-legal-warm-text font-montserrat">
                      {item.label}
                    </span>
                    {getVerificationIcon(verificationStatus[item.key as keyof typeof verificationStatus])}
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
          className="lg:col-span-3"
        >
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-legal border border-warm-200/50 p-6">
            {/* General Info Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h3 className="text-xl font-baskervville font-bold text-legal-dark-text">
                  General Information
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                      First Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={tempProfileData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="w-full px-4 py-3 border border-legal-border rounded-xl font-montserrat transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
                      />
                    ) : (
                      <p className="text-legal-dark-text font-montserrat py-3">
                        {profileData.firstName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                      Last Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={tempProfileData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="w-full px-4 py-3 border border-legal-border rounded-xl font-montserrat transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
                      />
                    ) : (
                      <p className="text-legal-dark-text font-montserrat py-3">
                        {profileData.lastName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                      Display Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={tempProfileData.displayName}
                        onChange={(e) => handleInputChange('displayName', e.target.value)}
                        className="w-full px-4 py-3 border border-legal-border rounded-xl font-montserrat transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
                      />
                    ) : (
                      <p className="text-legal-dark-text font-montserrat py-3">
                        {profileData.displayName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                      Email Address
                    </label>
                    <div className="flex items-center space-x-2">
                      <p className="text-legal-dark-text font-montserrat py-3 flex-1">
                        {profileData.email}
                      </p>
                      {verificationStatus.email && (
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
                        value={tempProfileData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-4 py-3 border border-legal-border rounded-xl font-montserrat transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <p className="text-legal-dark-text font-montserrat py-3 flex-1">
                          {profileData.phone}
                        </p>
                        {verificationStatus.phone && (
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
                        value={tempProfileData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="w-full px-4 py-3 border border-legal-border rounded-xl font-montserrat transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
                      />
                    ) : (
                      <p className="text-legal-dark-text font-montserrat py-3">
                        {profileData.location}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      value={tempProfileData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-legal-border rounded-xl font-montserrat transition-colors resize-none focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
                    />
                  ) : (
                    <p className="text-legal-dark-text font-montserrat py-3 leading-relaxed">
                      {profileData.bio}
                    </p>
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
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                      Professional Title
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={tempProfileData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="w-full px-4 py-3 border border-legal-border rounded-xl font-montserrat transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
                      />
                    ) : (
                      <p className="text-legal-dark-text font-montserrat py-3">
                        {profileData.title}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                      Hourly Rate (USD)
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={tempProfileData.hourlyRate}
                        onChange={(e) => handleInputChange('hourlyRate', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border border-legal-border rounded-xl font-montserrat transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
                      />
                    ) : (
                      <p className="text-legal-dark-text font-montserrat py-3">
                        ${profileData.hourlyRate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                      Experience
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={tempProfileData.experience}
                        onChange={(e) => handleInputChange('experience', e.target.value)}
                        className="w-full px-4 py-3 border border-legal-border rounded-xl font-montserrat transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
                      />
                    ) : (
                      <p className="text-legal-dark-text font-montserrat py-3">
                        {profileData.experience}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                      Education
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={tempProfileData.education}
                        onChange={(e) => handleInputChange('education', e.target.value)}
                        className="w-full px-4 py-3 border border-legal-border rounded-xl font-montserrat transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
                      />
                    ) : (
                      <p className="text-legal-dark-text font-montserrat py-3">
                        {profileData.education}
                      </p>
                    )}
                  </div>
                </div>

                {/* Certifications */}
                <div>
                  <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                    Certifications
                  </label>
                  <div className="space-y-2">
                    {tempProfileData.certifications.map((cert, index) => (
                      <div key={index} className="flex items-center justify-between bg-accent-50 border border-accent-200 rounded-lg p-3">
                        <span className="text-accent-700 font-montserrat">{cert}</span>
                        {isEditing && (
                          <button
                            onClick={() => handleArrayRemove('subjects', index)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    {isEditing && (
                      <div className="flex items-center space-x-2 md:col-span-2">
                        <input
                          type="text"
                          placeholder="Add subject"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleArrayAdd('subjects', e.currentTarget.value)
                              e.currentTarget.value = ''
                            }
                          }}
                          className="flex-1 px-4 py-2 border border-legal-border rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
                        />
                        <button
                          onClick={(e) => {
                            const input = e.currentTarget.previousElementSibling as HTMLInputElement
                            handleArrayAdd('subjects', input.value)
                            input.value = ''
                          }}
                          className="bg-warm-100 text-warm-700 p-2 rounded-lg hover:bg-warm-200 transition-colors"
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
                    {tempProfileData.languages.map((language, index) => (
                      <div key={index} className="flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-lg p-2">
                        <Languages className="w-4 h-4 text-blue-600" />
                        <span className="text-blue-700 font-montserrat text-sm">{language}</span>
                        {isEditing && (
                          <button
                            onClick={() => handleArrayRemove('languages', index)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                    {isEditing && (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="Add language"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleArrayAdd('languages', e.currentTarget.value)
                              e.currentTarget.value = ''
                            }
                          }}
                          className="px-3 py-2 border border-legal-border rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
                        />
                        <button
                          onClick={(e) => {
                            const input = e.currentTarget.previousElementSibling as HTMLInputElement
                            handleArrayAdd('languages', input.value)
                            input.value = ''
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
                  <div className="space-y-2">
                    {tempProfileData.teachingStyles.map((style, index) => (
                      <div key={index} className="flex items-center justify-between bg-success-50 border border-success-200 rounded-lg p-3">
                        <span className="text-success-700 font-montserrat">{style}</span>
                        {isEditing && (
                          <button
                            onClick={() => handleArrayRemove('teachingStyles', index)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    {isEditing && (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="Add teaching style"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleArrayAdd('teachingStyles', e.currentTarget.value)
                              e.currentTarget.value = ''
                            }
                          }}
                          className="flex-1 px-4 py-2 border border-legal-border rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
                        />
                        <button
                          onClick={(e) => {
                            const input = e.currentTarget.previousElementSibling as HTMLInputElement
                            handleArrayAdd('teachingStyles', input.value)
                            input.value = ''
                          }}
                          className="bg-success-100 text-success-700 p-2 rounded-lg hover:bg-success-200 transition-colors"
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
                  <div className="space-y-2">
                    {tempProfileData.specializations.map((spec, index) => (
                      <div key={index} className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <span className="text-purple-700 font-montserrat">{spec}</span>
                        {isEditing && (
                          <button
                            onClick={() => handleArrayRemove('specializations', index)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    {isEditing && (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="Add specialization"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleArrayAdd('specializations', e.currentTarget.value)
                              e.currentTarget.value = ''
                            }
                          }}
                          className="flex-1 px-4 py-2 border border-legal-border rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
                        />
                        <button
                          onClick={(e) => {
                            const input = e.currentTarget.previousElementSibling as HTMLInputElement
                            handleArrayAdd('specializations', input.value)
                            input.value = ''
                          }}
                          className="bg-purple-100 text-purple-700 p-2 rounded-lg hover:bg-purple-200 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Availability Info */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                      Weekly Hours Available
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={tempProfileData.weeklyHours}
                        onChange={(e) => handleInputChange('weeklyHours', parseInt(e.target.value))}
                        className="w-full px-4 py-3 border border-legal-border rounded-xl font-montserrat transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
                      />
                    ) : (
                      <p className="text-legal-dark-text font-montserrat py-3">
                        {profileData.weeklyHours} hours
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                      Average Response Time
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={tempProfileData.responseTime}
                        onChange={(e) => handleInputChange('responseTime', e.target.value)}
                        className="w-full px-4 py-3 border border-legal-border rounded-xl font-montserrat transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
                      />
                    ) : (
                      <p className="text-legal-dark-text font-montserrat py-3">
                        {profileData.responseTime}
                      </p>
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
                          checked={tempProfileData.profileVisibility === option.value}
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
                        checked={tempProfileData.emailNotifications}
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
                        checked={tempProfileData.smsNotifications}
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
                        checked={tempProfileData.showReviews}
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
                        checked={tempProfileData.showEarnings}
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
                  
                  {showPasswordFields && (
                    <div className="space-y-4 p-4 bg-legal-bg-secondary/20 rounded-lg border border-legal-border/50">
                      <div>
                        <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                          Current Password
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 border border-legal-border rounded-xl font-montserrat transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                          New Password
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 border border-legal-border rounded-xl font-montserrat transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          className="w-full px-4 py-3 border border-legal-border rounded-xl font-montserrat transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
                        />
                      </div>
                      <button className="bg-accent-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-accent-700 transition-colors font-montserrat">
                        Update Password
                      </button>
                    </div>
                  )}
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