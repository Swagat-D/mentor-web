'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  BookOpen,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  User,
  Calendar,
  CreditCard,
  Users,
  Video,
  Star,
  Clock,
  Shield,
  PlayCircle,
  ExternalLink
} from 'lucide-react'

export default function GettingStartedPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const steps = [
    {
      id: 0,
      title: 'Complete Your Profile',
      description: 'Set up your mentor profile with photo, bio, and expertise',
      icon: User,
      content: {
        overview: 'Your profile is the first thing students see. Make it compelling!',
        tasks: [
          'Upload a professional profile photo',
          'Write a compelling bio (150-300 words)',
          'Add your expertise areas',
          'Set your hourly rate',
          'Add your qualifications and experience'
        ],
        tips: [
          'Use a high-quality, professional headshot',
          'Highlight your unique teaching style',
          'Include specific achievements and certifications',
          'Mention your availability and response time'
        ],
        action: 'Complete Profile',
        link: '/dashboard/settings'
      }
    },
    {
      id: 1,
      title: 'Set Your Availability',
      description: 'Configure your weekly schedule and preferred time slots',
      icon: Calendar,
      content: {
        overview: 'Students need to know when you\'re available for sessions.',
        tasks: [
          'Set your weekly availability hours',
          'Configure your timezone',
          'Set buffer time between sessions',
          'Block out unavailable dates',
          'Connect your Google Calendar (optional)'
        ],
        tips: [
          'Be realistic about your availability',
          'Consider different time zones for international students',
          'Leave 15-30 minutes between sessions',
          'Update your availability regularly'
        ],
        action: 'Set Availability',
        link: '/dashboard/calendar'
      }
    },
    {
      id: 2,
      title: 'Payment Setup',
      description: 'Configure your payment methods and banking information',
      icon: CreditCard,
      content: {
        overview: 'Set up secure payment processing to receive your earnings.',
        tasks: [
          'Add your bank account details',
          'Verify your identity',
          'Set up tax information',
          'Configure payout preferences',
          'Review fee structure'
        ],
        tips: [
          'Use a business bank account if possible',
          'Keep your payment info updated',
          'Understand the fee structure',
          'Set up automatic payouts for convenience'
        ],
        action: 'Setup Payments',
        link: '/dashboard/earnings'
      }
    },
    {
      id: 3,
      title: 'Find Your First Student',
      description: 'Learn how to connect with students and get your first booking',
      icon: Users,
      content: {
        overview: 'Start building your student base and reputation on the platform.',
        tasks: [
          'Browse available students',
          'Send introduction messages',
          'Respond to student inquiries promptly',
          'Offer a trial session at a discount',
          'Be active and responsive'
        ],
        tips: [
          'Respond to messages within 2 hours',
          'Personalize your introduction messages',
          'Be flexible with scheduling for first-time students',
          'Showcase your teaching methodology'
        ],
        action: 'Find Students',
        link: '/dashboard/students'
      }
    },
    {
      id: 4,
      title: 'Conduct Your First Session',
      description: 'Best practices for delivering excellent tutoring sessions',
      icon: Video,
      content: {
        overview: 'Make a great first impression with professional, effective sessions.',
        tasks: [
          'Test your video/audio setup',
          'Prepare session materials',
          'Start and end sessions on time',
          'Use interactive teaching methods',
          'Follow up after the session'
        ],
        tips: [
          'Always test your tech before sessions',
          'Have backup plans for technical issues',
          'Use screen sharing and digital whiteboards',
          'End sessions with clear next steps'
        ],
        action: 'Schedule Session',
        link: '/dashboard/calendar'
      }
    },
    {
      id: 5,
      title: 'Build Your Reputation',
      description: 'Strategies to earn positive reviews and grow your business',
      icon: Star,
      content: {
        overview: 'Focus on delivering value to build long-term student relationships.',
        tasks: [
          'Ask for feedback after sessions',
          'Continuously improve your teaching',
          'Maintain consistent quality',
          'Build long-term relationships',
          'Track your progress and metrics'
        ],
        tips: [
          'Always ask students how you can improve',
          'Follow up between sessions',
          'Celebrate student achievements',
          'Stay updated with your subject area'
        ],
        action: 'View Analytics',
        link: '/dashboard/analytics'
      }
    }
  ]

  const handleCompleteStep = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId])
    }
  }

  const handleNavigateToAction = (link: string) => {
    router.push(link)
  }

  const progressPercentage = (completedSteps.length / steps.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-legal-bg-primary via-white to-legal-bg-secondary">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-legal-warm-text hover:text-accent-600 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-montserrat">Back to Help & Support</span>
          </button>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-100 to-accent-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-8 h-8 text-accent-600" />
            </div>
            <h1 className="text-4xl font-baskervville font-bold text-legal-dark-text mb-4">
              Getting Started as a Mentor
            </h1>
            <p className="text-xl text-legal-warm-text font-montserrat max-w-2xl mx-auto">
              Follow this step-by-step guide to set up your mentor profile and start earning
            </p>
          </div>

          {/* Progress Bar */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-legal border border-warm-200/50 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-legal-dark-text font-montserrat">
                Your Progress
              </h3>
              <span className="text-sm text-legal-warm-text font-montserrat">
                {completedSteps.length} of {steps.length} completed
              </span>
            </div>
            <div className="w-full bg-legal-border/30 rounded-full h-3 mb-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.8 }}
                className="bg-gradient-to-r from-accent-600 to-accent-500 h-3 rounded-full"
              />
            </div>
            <p className="text-sm text-legal-warm-text font-montserrat">
              Complete all steps to optimize your mentor profile and start earning
            </p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Steps Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-legal border border-warm-200/50 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-legal-dark-text font-montserrat mb-4">
                Setup Steps
              </h3>
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setCurrentStep(index)}
                    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                      currentStep === index
                        ? 'bg-accent-100 border border-accent-300'
                        : 'hover:bg-legal-bg-secondary/30'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      completedSteps.includes(step.id)
                        ? 'bg-success-100 text-success-600'
                        : currentStep === index
                        ? 'bg-accent-600 text-white'
                        : 'bg-legal-bg-secondary text-legal-warm-text'
                    }`}>
                      {completedSteps.includes(step.id) ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <step.icon className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium font-montserrat ${
                        currentStep === index ? 'text-accent-700' : 'text-legal-dark-text'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-legal-warm-text font-montserrat">
                        Step {index + 1} of {steps.length}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="lg:col-span-2">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white/95 backdrop-blur-sm rounded-xl shadow-legal border border-warm-200/50 p-8"
            >
              <div className="flex items-center space-x-4 mb-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  completedSteps.includes(steps[currentStep].id)
                    ? 'bg-success-100 text-success-600'
                    : 'bg-accent-100 text-accent-600'
                }`}>
                  {completedSteps.includes(steps[currentStep].id) ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    (() => {
                      const Icon = steps[currentStep].icon;
                      return <Icon className="w-6 h-6" />;
                    })()
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-baskervville font-bold text-legal-dark-text">
                    {steps[currentStep].title}
                  </h2>
                  <p className="text-legal-warm-text font-montserrat">
                    {steps[currentStep].description}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Overview */}
                <div>
                  <h3 className="text-lg font-semibold text-legal-dark-text font-montserrat mb-3">
                    Overview
                  </h3>
                  <p className="text-legal-warm-text font-montserrat">
                    {steps[currentStep].content.overview}
                  </p>
                </div>

                {/* Tasks */}
                <div>
                  <h3 className="text-lg font-semibold text-legal-dark-text font-montserrat mb-3">
                    What You Need to Do
                  </h3>
                  <div className="space-y-2">
                    {steps[currentStep].content.tasks.map((task, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-legal-bg-secondary/20 rounded-lg">
                        <div className="w-5 h-5 rounded-full bg-accent-100 flex items-center justify-center mt-0.5">
                          <span className="text-xs font-medium text-accent-600">{index + 1}</span>
                        </div>
                        <span className="text-legal-dark-text font-montserrat">{task}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tips */}
                <div>
                  <h3 className="text-lg font-semibold text-legal-dark-text font-montserrat mb-3">
                    Pro Tips
                  </h3>
                  <div className="space-y-2">
                    {steps[currentStep].content.tips.map((tip, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <Star className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span className="text-amber-800 font-montserrat text-sm">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-6 border-t border-legal-border/30">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                      disabled={currentStep === 0}
                      className="flex items-center space-x-2 px-4 py-2 text-legal-warm-text border border-legal-border rounded-lg hover:bg-legal-bg-secondary/30 transition-colors font-montserrat disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>
                    
                    <button
                      onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                      disabled={currentStep === steps.length - 1}
                      className="flex items-center space-x-2 px-4 py-2 text-legal-warm-text border border-legal-border rounded-lg hover:bg-legal-bg-secondary/30 transition-colors font-montserrat disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>Next</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center space-x-3">
                    {!completedSteps.includes(steps[currentStep].id) && (
                      <button
                        onClick={() => handleCompleteStep(steps[currentStep].id)}
                        className="flex items-center space-x-2 px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 transition-colors font-montserrat"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Mark Complete</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleNavigateToAction(steps[currentStep].content.link)}
                      className="flex items-center space-x-2 px-6 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors font-montserrat"
                    >
                      <span>{steps[currentStep].content.action}</span>
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Resources */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 bg-gradient-to-r from-accent-50 to-warm-50 border border-accent-200 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-accent-800 font-baskervville mb-4">
                Quick Resources
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-white/80 rounded-lg">
                  <PlayCircle className="w-8 h-8 text-accent-600" />
                  <div>
                    <p className="font-medium text-accent-800 font-montserrat text-sm">Video Tutorial</p>
                    <p className="text-xs text-accent-600 font-montserrat">5-min setup guide</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-white/80 rounded-lg">
                  <Clock className="w-8 h-8 text-accent-600" />
                  <div>
                    <p className="font-medium text-accent-800 font-montserrat text-sm">Live Onboarding</p>
                    <p className="text-xs text-accent-600 font-montserrat">Book a call</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-white/80 rounded-lg">
                  <Shield className="w-8 h-8 text-accent-600" />
                  <div>
                    <p className="font-medium text-accent-800 font-montserrat text-sm">Safety Guide</p>
                    <p className="text-xs text-accent-600 font-montserrat">Best practices</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Completion Celebration */}
        {completedSteps.length === steps.length && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-warm-200/50 p-8 max-w-md w-full text-center">
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-success-600" />
              </div>
              <h3 className="text-2xl font-baskervville font-bold text-legal-dark-text mb-4">
                Congratulations! 🎉
              </h3>
              <p className="text-legal-warm-text font-montserrat mb-6">
                You&apos;ve completed all the setup steps. You&apos;re now ready to start mentoring and earning on our platform!
              </p>
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="bg-accent-600 text-white px-6 py-3 rounded-lg hover:bg-accent-700 transition-colors font-montserrat"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => setCompletedSteps([])}
                  className="text-legal-warm-text border border-legal-border px-6 py-3 rounded-lg hover:bg-legal-bg-secondary/30 transition-colors font-montserrat"
                >
                  Review Steps
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}