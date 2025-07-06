'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Scale, CheckCircle } from 'lucide-react'

const onboardingSteps = [
  {
    id: 'profile',
    title: 'Complete Profile',
    description: 'Basic information and bio',
    href: '/onboarding/profile'
  },
  {
    id: 'expertise',
    title: 'Areas of Expertise',
    description: 'Subjects and skills',
    href: '/onboarding/expertise'
  },
  {
    id: 'availability',
    title: 'Set Availability',
    description: 'Schedule and rates',
    href: '/onboarding/availability'
  },
  {
    id: 'verification',
    title: 'Verification',
    description: 'Credentials and documents',
    href: '/onboarding/verification'
  }
]

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [completedSteps, setCompletedSteps] = useState<string[]>([])

  const getCurrentStepIndex = () => {
    const currentStep = onboardingSteps.find(step => pathname.includes(step.id))
    return currentStep ? onboardingSteps.indexOf(currentStep) : 0
  }

  const currentStepIndex = getCurrentStepIndex()

  useEffect(() => {
    // In a real app, fetch completed steps from API/localStorage
    const stored = localStorage.getItem('onboarding-progress')
    if (stored) {
      setCompletedSteps(JSON.parse(stored))
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-legal-bg-primary via-warm-100 to-legal-bg-secondary">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-legal-border/30 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-700 to-accent-600 rounded-xl flex items-center justify-center shadow-legal">
                <Scale className="text-white font-bold text-lg w-6 h-6" />
              </div>
              <span className="text-2xl font-baskervville font-bold gradient-text">MentorMatch</span>
            </Link>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-legal-warm-text font-montserrat">
                Step {currentStepIndex + 1} of {onboardingSteps.length}
              </span>
              <div className="w-32 bg-legal-border rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-accent-700 to-accent-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStepIndex + 1) / onboardingSteps.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Fixed Sidebar Navigation */}
        <div className="w-80 bg-white/95 backdrop-blur-sm border-r border-legal-border/30 flex flex-col">
          <div className="p-8 border-b border-legal-border/20">
            <h2 className="text-2xl font-baskervville font-bold text-legal-dark-text mb-2">
              Welcome to MentorMatch
            </h2>
            <p className="text-legal-warm-text font-montserrat">
              Let&apos;s get you set up to start mentoring students
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            <nav className="space-y-4">
              {onboardingSteps.map((step, index) => {
                const isCompleted = completedSteps.includes(step.id)
                const isCurrent = pathname.includes(step.id)
                const isAccessible = index <= currentStepIndex || isCompleted

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={isAccessible ? step.href : '#'}
                      className={`block p-4 rounded-xl transition-all duration-300 ${
                        isCurrent
                          ? 'bg-gradient-to-r from-accent-700 to-accent-600 text-white shadow-legal-lg'
                          : isCompleted
                          ? 'bg-success-50 border border-success-200 text-success-700 hover:bg-success-100'
                          : isAccessible
                          ? 'border border-legal-border hover:bg-legal-bg-secondary text-legal-dark-text'
                          : 'border border-legal-border/30 text-legal-warm-text/50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCurrent
                            ? 'bg-white/20'
                            : isCompleted
                            ? 'bg-success-500'
                            : isAccessible
                            ? 'bg-accent-100'
                            : 'bg-legal-border/30'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-white" />
                          ) : (
                            <span className={`text-sm font-bold ${
                              isCurrent ? 'text-white' : isAccessible ? 'text-accent-600' : 'text-legal-warm-text/50'
                            }`}>
                              {index + 1}
                            </span>
                          )}
                        </div>
                        <div>
                          <h3 className={`font-semibold font-baskervville ${
                            isCurrent ? 'text-white' : ''
                          }`}>
                            {step.title}
                          </h3>
                          <p className={`text-sm font-montserrat ${
                            isCurrent 
                              ? 'text-white/80' 
                              : isCompleted
                              ? 'text-success-600'
                              : isAccessible
                              ? 'text-legal-warm-text'
                              : 'text-legal-warm-text/50'
                          }`}>
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </nav>
          </div>

          <div className="p-6 border-t border-legal-border/20">
            <div className="p-4 bg-accent-50 border border-accent-200 rounded-xl">
              <h4 className="font-semibold text-accent-700 font-baskervville mb-2">
                Need Help?
              </h4>
              <p className="text-sm text-accent-600 font-montserrat mb-3">
                Our team is here to help you get started successfully.
              </p>
              <Link
                href="/support"
                className="text-sm text-accent-600 hover:text-accent-700 font-medium font-montserrat underline"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>

        {/* Scrollable Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto"
            >
              {children}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}