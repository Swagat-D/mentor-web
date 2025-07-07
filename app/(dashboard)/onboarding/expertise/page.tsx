'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus,
  X,
  GraduationCap,
  BookOpen,
  Star,
  ArrowRight,
  CheckCircle
} from 'lucide-react'

interface Subject {
  name: string
  level: string
  experience: string
}

export default function OnboardingExpertise() {
  const [subjects, setSubjects] = useState<Subject[]>([
    { name: '', level: '', experience: '' }
  ])
  const [teachingStyles, setTeachingStyles] = useState<string[]>([])
  const [specializations, setSpecializations] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const subjectOptions = [
    'Mathematics', 'Algebra', 'Geometry', 'Calculus', 'Statistics', 'Linear Algebra',
    'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Programming',
    'Data Science', 'Machine Learning', 'Web Development', 'Software Engineering',
    'Business', 'Finance', 'Accounting', 'Economics', 'Marketing',
    'English', 'Writing', 'Literature', 'History', 'Philosophy',
    'Psychology', 'Sociology', 'Political Science', 'Art', 'Music',
    'Engineering', 'Mechanical Engineering', 'Electrical Engineering',
    'Civil Engineering', 'Chemical Engineering', 'Other'
  ]

  const levelOptions = [
    'Elementary School',
    'Middle School', 
    'High School',
    'College/University',
    'Graduate Level',
    'Professional/Adult Learning'
  ]

  const experienceOptions = [
    'Less than 1 year',
    '1-2 years',
    '3-5 years',
    '6-10 years',
    'More than 10 years'
  ]

  const teachingStyleOptions = [
    'Visual Learning (diagrams, charts, visual aids)',
    'Hands-on/Practical Learning',
    'Step-by-step Problem Solving',
    'Conceptual Understanding',
    'Exam/Test Preparation',
    'Project-based Learning',
    'Interactive Discussions',
    'Real-world Applications',
    'Homework Help & Support',
    'Research Guidance'
  ]

  const specializationOptions = [
    'Test Prep (SAT, ACT, GRE, GMAT)',
    'College Admissions Counseling',
    'Career Guidance',
    'Research Paper Writing',
    'Presentation Skills',
    'Study Skills & Time Management',
    'Special Needs Students',
    'English as Second Language (ESL)',
    'Advanced/Gifted Students',
    'Struggling Students',
    'Group Learning Sessions',
    'Corporate Training'
  ]

  const addSubject = () => {
    setSubjects([...subjects, { name: '', level: '', experience: '' }])
  }

  const removeSubject = (index: number) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter((_, i) => i !== index))
    }
  }

  const updateSubject = (index: number, field: keyof Subject, value: string) => {
    const updated = subjects.map((subject, i) => 
      i === index ? { ...subject, [field]: value } : subject
    )
    setSubjects(updated)
    
    // Clear errors
    if (errors[`subject_${index}_${field}`]) {
      setErrors(prev => ({ ...prev, [`subject_${index}_${field}`]: '' }))
    }
  }

  const toggleTeachingStyle = (style: string) => {
    setTeachingStyles(prev => 
      prev.includes(style) 
        ? prev.filter(s => s !== style)
        : [...prev, style]
    )
  }

  const toggleSpecialization = (specialization: string) => {
    setSpecializations(prev => 
      prev.includes(specialization) 
        ? prev.filter(s => s !== specialization)
        : [...prev, specialization]
    )
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validate subjects
    subjects.forEach((subject, index) => {
      if (!subject.name) {
        newErrors[`subject_${index}_name`] = 'Subject is required'
      }
      if (!subject.level) {
        newErrors[`subject_${index}_level`] = 'Level is required'
      }
      if (!subject.experience) {
        newErrors[`subject_${index}_experience`] = 'Experience is required'
      }
    })

    if (teachingStyles.length === 0) {
      newErrors.teachingStyles = 'Select at least one teaching style'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Save progress
      const currentProgress = JSON.parse(localStorage.getItem('onboarding-progress') || '[]')
      localStorage.setItem('onboarding-progress', JSON.stringify([...currentProgress, 'expertise']))
      
      // Navigate to next step
      window.location.href = '/onboarding/availability'
      
    } catch (error) {
      console.log(error)
      setErrors({ general: 'Something went wrong. Please try again.' })
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
            Areas of Expertise
          </h1>
          <p className="text-legal-warm-text font-montserrat text-sm sm:text-base">
            Define your subject expertise and teaching preferences to help us match you with the right students
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Subjects Section */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
              <h3 className="text-xl font-baskervville font-bold text-legal-dark-text">
                Subject Expertise
              </h3>
              <button
                type="button"
                onClick={addSubject}
                className="bg-accent-100 text-accent-700 font-semibold py-2 px-4 rounded-lg border border-accent-200 hover:bg-accent-200 transition-colors font-montserrat flex items-center justify-center space-x-2 w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Add Subject</span>
              </button>
            </div>

            <div className="space-y-6">
              {subjects.map((subject, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-legal-bg-secondary/30 rounded-xl p-4 sm:p-6 border border-legal-border/50"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-legal-dark-text font-baskervville">
                      Subject {index + 1}
                    </h4>
                    {subjects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSubject(index)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                        Subject *
                      </label>
                      <div className="relative">
                        <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-legal-warm-text" />
                        <select
                          value={subject.name}
                          onChange={(e) => updateSubject(index, 'name', e.target.value)}
                          className={`w-full pl-10 pr-4 py-3 border rounded-xl font-montserrat transition-colors text-sm sm:text-base ${
                            errors[`subject_${index}_name`] ? 'border-red-300' : 'border-legal-border'
                          } focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white`}
                        >
                          <option value="">Select subject</option>
                          {subjectOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                      {errors[`subject_${index}_name`] && (
                        <p className="mt-1 text-sm text-red-600 font-montserrat">
                          {errors[`subject_${index}_name`]}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                        Level *
                      </label>
                      <div className="relative">
                        <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-legal-warm-text" />
                        <select
                          value={subject.level}
                          onChange={(e) => updateSubject(index, 'level', e.target.value)}
                          className={`w-full pl-10 pr-4 py-3 border rounded-xl font-montserrat transition-colors text-sm sm:text-base ${
                            errors[`subject_${index}_level`] ? 'border-red-300' : 'border-legal-border'
                          } focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white`}
                        >
                          <option value="">Select level</option>
                          {levelOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                      {errors[`subject_${index}_level`] && (
                        <p className="mt-1 text-sm text-red-600 font-montserrat">
                          {errors[`subject_${index}_level`]}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-legal-dark-text mb-2 font-montserrat">
                        Experience *
                      </label>
                      <div className="relative">
                        <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-legal-warm-text" />
                        <select
                          value={subject.experience}
                          onChange={(e) => updateSubject(index, 'experience', e.target.value)}
                          className={`w-full pl-10 pr-4 py-3 border rounded-xl font-montserrat transition-colors text-sm sm:text-base ${
                            errors[`subject_${index}_experience`] ? 'border-red-300' : 'border-legal-border'
                          } focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white`}
                        >
                          <option value="">Select experience</option>
                          {experienceOptions.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                      {errors[`subject_${index}_experience`] && (
                        <p className="mt-1 text-sm text-red-600 font-montserrat">
                          {errors[`subject_${index}_experience`]}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Teaching Styles */}
          <div>
            <h3 className="text-xl font-baskervville font-bold text-legal-dark-text mb-4">
              Teaching Styles & Methods *
            </h3>
            <p className="text-legal-warm-text font-montserrat mb-6 text-sm sm:text-base">
              Select all teaching approaches you&apos;re comfortable with
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {teachingStyleOptions.map(style => (
                <label
                  key={style}
                  className={`flex items-center space-x-3 p-3 sm:p-4 rounded-xl border cursor-pointer transition-colors ${
                    teachingStyles.includes(style)
                      ? 'border-accent-500 bg-accent-50'
                      : 'border-legal-border hover:border-accent-300 hover:bg-legal-bg-secondary/20'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={teachingStyles.includes(style)}
                    onChange={() => toggleTeachingStyle(style)}
                    className="w-5 h-5 text-accent-600 bg-white border-legal-border rounded focus:ring-accent-500 focus:ring-2 flex-shrink-0"
                  />
                  <span className="font-montserrat text-sm">{style}</span>
                </label>
              ))}
            </div>
            {errors.teachingStyles && (
              <p className="mt-2 text-sm text-red-600 font-montserrat">{errors.teachingStyles}</p>
            )}
          </div>

          {/* Specializations */}
          <div>
            <h3 className="text-xl font-baskervville font-bold text-legal-dark-text mb-4">
              Special Areas & Services
              <span className="text-legal-warm-text font-normal font-montserrat"> (Optional)</span>
            </h3>
            <p className="text-legal-warm-text font-montserrat mb-6 text-sm sm:text-base">
              Additional services or specialized areas you can help with
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {specializationOptions.map(specialization => (
                <label
                  key={specialization}
                  className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    specializations.includes(specialization)
                      ? 'border-accent-500 bg-accent-50'
                      : 'border-legal-border hover:border-accent-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={specializations.includes(specialization)}
                    onChange={() => toggleSpecialization(specialization)}
                    className="w-4 h-4 text-accent-600 bg-white border-legal-border rounded focus:ring-accent-500 focus:ring-2 flex-shrink-0"
                  />
                  <span className="font-montserrat text-sm">{specialization}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Summary Section */}
          <div className="bg-accent-50 border border-accent-200 rounded-xl p-4 sm:p-6">
            <h4 className="font-semibold text-accent-700 font-baskervville mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Expertise Summary
            </h4>
            <div className="space-y-3 text-sm font-montserrat">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-medium text-accent-700 mb-1 sm:mb-0 sm:mr-2">Subjects:</span>
                <span className="text-accent-600">
                  {subjects.filter(s => s.name).map(s => s.name).join(', ') || 'None selected'}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-medium text-accent-700 mb-1 sm:mb-0 sm:mr-2">Teaching Styles:</span>
                <span className="text-accent-600">
                  {teachingStyles.length > 0 ? `${teachingStyles.length} selected` : 'None selected'}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <span className="font-medium text-accent-700 mb-1 sm:mb-0 sm:mr-2">Specializations:</span>
                <span className="text-accent-600">
                  {specializations.length > 0 ? `${specializations.length} selected` : 'None selected'}
                </span>
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