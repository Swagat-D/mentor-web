'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  Star,
  ArrowLeft,
  CheckCircle,
  Users,
  Clock,
  MessageCircle,
  TrendingUp,
  Shield,
  Heart,
  Zap,
  Target,
  Award,
  Lightbulb,
  BookOpen,
  Calendar,
  DollarSign
} from 'lucide-react'

export default function BestPracticesPage() {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState('teaching')

  const categories = [
    { id: 'teaching', label: 'Teaching Excellence', icon: Star, color: 'amber' },
    { id: 'communication', label: 'Communication', icon: MessageCircle, color: 'blue' },
    { id: 'business', label: 'Business Growth', icon: TrendingUp, color: 'green' },
    { id: 'safety', label: 'Safety & Trust', icon: Shield, color: 'purple' }
  ]

  const practices = {
    teaching: [
      {
        title: 'Personalize Your Teaching Approach',
        description: 'Adapt your teaching style to each student\'s learning preferences and pace.',
        tips: [
          'Start with a learning style assessment',
          'Ask students about their preferred learning methods',
          'Adjust your pace based on student comprehension',
          'Use multiple teaching techniques (visual, auditory, kinesthetic)',
          'Regular check-ins to ensure understanding'
        ],
        icon: Target,
        impact: 'Increases student satisfaction by 40%'
      },
      {
        title: 'Prepare Structured Lesson Plans',
        description: 'Well-organized sessions lead to better learning outcomes and student engagement.',
        tips: [
          'Create clear learning objectives for each session',
          'Prepare materials and resources in advance',
          'Include interactive elements and practice problems',
          'Plan time for questions and clarification',
          'End with a summary and next steps'
        ],
        icon: BookOpen,
        impact: 'Improves learning retention by 65%'
      },
      {
        title: 'Use Interactive Teaching Methods',
        description: 'Engage students with hands-on activities and real-world applications.',
        tips: [
          'Use digital whiteboards and screen sharing',
          'Incorporate real-world examples and case studies',
          'Encourage student participation and questions',
          'Use breakout activities and problem-solving exercises',
          'Provide immediate feedback and encouragement'
        ],
        icon: Zap,
        impact: 'Increases engagement by 80%'
      },
      {
        title: 'Track Student Progress',
        description: 'Monitor and document student improvement to adjust teaching strategies.',
        tips: [
          'Keep detailed notes after each session',
          'Set measurable goals with students',
          'Use regular assessments and quizzes',
          'Celebrate milestones and achievements',
          'Share progress reports with students'
        ],
        icon: TrendingUp,
        impact: 'Improves goal achievement by 55%'
      }
    ],
    communication: [
      {
        title: 'Respond Promptly to Messages',
        description: 'Quick responses build trust and show professionalism.',
        tips: [
          'Aim to respond within 2 hours during business hours',
          'Set up automatic out-of-office messages',
          'Use templates for common questions',
          'Be clear about your availability hours',
          'Acknowledge receipt even if you can\'t provide a full response immediately'
        ],
        icon: Clock,
        impact: 'Increases booking rate by 60%'
      },
      {
        title: 'Communicate Clearly and Professionally',
        description: 'Professional communication builds confidence and trust with students.',
        tips: [
          'Use proper grammar and spelling',
          'Be concise but thorough in explanations',
          'Avoid jargon unless you explain it',
          'Use positive and encouraging language',
          'Confirm understanding before moving on'
        ],
        icon: MessageCircle,
        impact: 'Reduces miscommunications by 70%'
      },
      {
        title: 'Set Clear Expectations',
        description: 'Establish boundaries and expectations early to avoid misunderstandings.',
        tips: [
          'Explain your teaching methodology upfront',
          'Clarify session policies (cancellation, lateness, etc.)',
          'Set homework and practice expectations',
          'Discuss communication preferences',
          'Be upfront about what students can expect to achieve'
        ],
        icon: Target,
        impact: 'Improves student satisfaction by 50%'
      },
      {
        title: 'Provide Constructive Feedback',
        description: 'Help students improve with specific, actionable feedback.',
        tips: [
          'Focus on specific areas for improvement',
          'Balance constructive criticism with positive reinforcement',
          'Provide examples and demonstrations',
          'Suggest specific practice exercises',
          'Follow up on previous feedback in subsequent sessions'
        ],
        icon: Lightbulb,
        impact: 'Accelerates learning by 45%'
      }
    ],
    business: [
      {
        title: 'Build Long-term Student Relationships',
        description: 'Focus on student success to create lasting partnerships.',
        tips: [
          'Remember personal details about students',
          'Check in on progress between sessions',
          'Celebrate student achievements',
          'Offer additional resources and support',
          'Be genuinely invested in their success'
        ],
        icon: Heart,
        impact: 'Increases retention by 75%'
      },
      {
        title: 'Optimize Your Schedule',
        description: 'Maximize your earning potential with smart scheduling.',
        tips: [
          'Block similar subjects together for efficiency',
          'Offer package deals for regular students',
          'Use prime time slots for higher rates',
          'Leave buffer time between sessions',
          'Plan for different time zones'
        ],
        icon: Calendar,
        impact: 'Increases earnings by 35%'
      },
      {
        title: 'Continuously Improve Your Skills',
        description: 'Stay current and expand your expertise to attract more students.',
        tips: [
          'Take courses in your subject area',
          'Learn new teaching methodologies',
          'Get feedback from students regularly',
          'Join mentor communities and forums',
          'Attend webinars and workshops'
        ],
        icon: Award,
        impact: 'Increases booking requests by 40%'
      },
      {
        title: 'Price Your Services Strategically',
        description: 'Find the right balance between competitive pricing and fair compensation.',
        tips: [
          'Research market rates for your expertise level',
          'Consider your experience and qualifications',
          'Offer trial sessions at a discount',
          'Adjust rates based on demand and reviews',
          'Be transparent about what\'s included in your rate'
        ],
        icon: DollarSign,
        impact: 'Optimizes income potential by 25%'
      }
    ],
    safety: [
      {
        title: 'Maintain Professional Boundaries',
        description: 'Keep interactions professional and appropriate at all times.',
        tips: [
          'Use the platform\'s messaging system',
          'Avoid sharing personal contact information',
          'Keep conversations focused on learning',
          'Report any inappropriate behavior immediately',
          'Document any concerning interactions'
        ],
        icon: Shield,
        impact: 'Ensures safe learning environment'
      },
      {
        title: 'Verify Student Identity',
        description: 'Ensure you\'re working with legitimate students for safety.',
        tips: [
          'Review student profiles thoroughly',
          'Require video calls for first sessions',
          'Be cautious of requests for personal information',
          'Trust your instincts about suspicious behavior',
          'Use platform\'s verification features'
        ],
        icon: CheckCircle,
        impact: 'Reduces security risks by 90%'
      },
      {
        title: 'Protect Your Privacy',
        description: 'Keep your personal information secure while building trust.',
        tips: [
          'Use platform tools for scheduling and communication',
          'Don\'t share personal phone numbers or addresses',
          'Be selective about social media connections',
          'Use professional email addresses',
          'Keep financial information private'
        ],
        icon: Shield,
        impact: 'Maintains professional security'
      },
      {
        title: 'Handle Difficult Situations',
        description: 'Know how to manage challenging students or situations professionally.',
        tips: [
          'Stay calm and professional in conflicts',
          'Document issues and communication',
          'Use platform support when needed',
          'Set clear boundaries early',
          'Know when to end inappropriate relationships'
        ],
        icon: Users,
        impact: 'Reduces conflicts by 80%'
      }
    ]
  }

  const currentPractices = practices[activeCategory as keyof typeof practices]

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
            <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Star className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="text-4xl font-baskervville font-bold text-legal-dark-text mb-4">
              Best Practices for Mentors
            </h1>
            <p className="text-xl text-legal-warm-text font-montserrat max-w-2xl mx-auto">
              Learn from successful mentors and optimize your teaching approach for better results
            </p>
          </div>
        </motion.div>

        {/* Category Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="flex items-center space-x-1 bg-white/95 backdrop-blur-sm rounded-xl p-1 shadow-legal border border-warm-200/50">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-300 font-montserrat ${
                  activeCategory === category.id
                    ? `bg-${category.color}-100 text-${category.color}-700 shadow-md`
                    : 'text-legal-warm-text hover:text-accent-600 hover:bg-accent-50'
                }`}
              >
                <category.icon className="w-5 h-5" />
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Practices Grid */}
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {currentPractices.map((practice, index) => (
            <motion.div
              key={practice.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white/95 backdrop-blur-sm rounded-xl shadow-legal border border-warm-200/50 p-8 hover:shadow-legal-lg transition-all duration-300"
            >
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-100 to-accent-200 rounded-xl flex items-center justify-center flex-shrink-0">
                  <practice.icon className="w-6 h-6 text-accent-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-baskervville font-bold text-legal-dark-text mb-2">
                    {practice.title}
                  </h3>
                  <p className="text-legal-warm-text font-montserrat">
                    {practice.description}
                  </p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {practice.tips.map((tip, tipIndex) => (
                  <div key={tipIndex} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-success-600 mt-0.5 flex-shrink-0" />
                    <span className="text-legal-dark-text font-montserrat text-sm leading-relaxed">
                      {tip}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-success-50 to-green-50 border border-success-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-success-600" />
                  <span className="text-sm font-medium text-success-800 font-montserrat">
                    Impact: {practice.impact}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Success Stories Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 bg-gradient-to-r from-accent-50 to-warm-50 border border-accent-200 rounded-xl p-8"
        >
          <h3 className="text-2xl font-baskervville font-bold text-accent-800 mb-6 text-center">
            Success Stories from Top Mentors
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/80 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-accent-800 font-montserrat">Sarah M.</p>
                  <p className="text-sm text-accent-700 font-montserrat italic">
                &quot;Using interactive teaching methods and safety practices helped me achieve a 4.9-star 
                rating with over 200 reviews.&quot;
              </p>
            </div>
          </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Action Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          {[
            {
              title: 'Schedule Practice',
              description: 'Apply these tips in your next session',
              icon: Calendar,
              action: () => router.push('/dashboard/calendar'),
              color: 'blue'
            },
            {
              title: 'Update Profile',
              description: 'Optimize your mentor profile',
              icon: Users,
              action: () => router.push('/dashboard/settings'),
              color: 'green'
            },
            {
              title: 'View Analytics',
              description: 'Track your improvement',
              icon: TrendingUp,
              action: () => router.push('/dashboard/analytics'),
              color: 'purple'
            },
            {
              title: 'Join Community',
              description: 'Connect with other mentors',
              icon: MessageCircle,
              action: () => router.push('/help/community'),
              color: 'amber'
            }
          ].map((card) => (
            <motion.div
              key={card.title}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={card.action}
              className="bg-white/95 backdrop-blur-sm rounded-xl shadow-legal border border-warm-200/50 p-6 hover:shadow-legal-lg transition-all duration-300 cursor-pointer group"
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                card.color === 'blue' ? 'bg-blue-100 group-hover:bg-blue-200' :
                card.color === 'green' ? 'bg-green-100 group-hover:bg-green-200' :
                card.color === 'purple' ? 'bg-purple-100 group-hover:bg-purple-200' :
                'bg-amber-100 group-hover:bg-amber-200'
              }`}>
                <card.icon className={`w-6 h-6 ${
                  card.color === 'blue' ? 'text-blue-600' :
                  card.color === 'green' ? 'text-green-600' :
                  card.color === 'purple' ? 'text-purple-600' :
                  'text-amber-600'
                }`} />
              </div>
              <h4 className="text-lg font-semibold text-legal-dark-text font-montserrat mb-2 group-hover:text-accent-600 transition-colors">
                {card.title}
              </h4>
              <p className="text-sm text-legal-warm-text font-montserrat">
                {card.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}