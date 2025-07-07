'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Star,
  Search,
  MessageSquare,
  ThumbsUp,
  Award,
  Calendar,
  User,
  Eye,
  Reply,
  Flag,
  Download,
  BookOpen,
} from 'lucide-react'

export default function ReviewsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [selectedRating, setSelectedRating] = useState('all')

  const filters = [
    { value: 'all', label: 'All Reviews', count: 47 },
    { value: 'recent', label: 'Recent', count: 8 },
    { value: 'replied', label: 'Replied', count: 32 },
    { value: 'pending', label: 'Pending Reply', count: 15 }
  ]

  const ratingFilters = [
    { value: 'all', label: 'All Ratings' },
    { value: '5', label: '5 Stars' },
    { value: '4', label: '4 Stars' },
    { value: '3', label: '3 Stars' },
    { value: '2', label: '2 Stars' },
    { value: '1', label: '1 Star' }
  ]

  const reviews = [
    {
      id: 1,
      student: {
        name: 'Sarah Johnson',
        email: 'sarah.j@email.com',
        avatar: 'SJ',
        totalSessions: 12
      },
      rating: 5,
      subject: 'Advanced Calculus',
      sessionDate: new Date(2024, 11, 10, 14, 30),
      reviewDate: new Date(2024, 11, 11, 9, 15),
      title: 'Excellent teaching and clear explanations',
      content: 'John is an amazing tutor! He explains complex calculus concepts in a way that\'s easy to understand. His patience and teaching style really helped me grasp integration by parts. I went from struggling with calculus to actually enjoying it. Highly recommend!',
      helpful: 8,
      replied: true,
      reply: 'Thank you so much, Sarah! It was a pleasure working with you. Your dedication and hard work made all the difference. Keep up the great work!',
      replyDate: new Date(2024, 11, 11, 14, 20),
      tags: ['patient', 'clear', 'helpful']
    },
    {
      id: 2,
      student: {
        name: 'Mike Chen',
        email: 'mike.chen@email.com',
        avatar: 'MC',
        totalSessions: 8
      },
      rating: 5,
      subject: 'Statistics',
      sessionDate: new Date(2024, 11, 9, 16, 0),
      reviewDate: new Date(2024, 11, 10, 8, 30),
      title: 'Great statistics tutor',
      content: 'Really helped me understand hypothesis testing and statistical analysis. The examples were practical and relevant to my coursework. John is very knowledgeable and responsive to questions.',
      helpful: 5,
      replied: false,
      tags: ['knowledgeable', 'practical', 'responsive']
    },
    {
      id: 3,
      student: {
        name: 'Emma Davis',
        email: 'emma.davis@email.com',
        avatar: 'ED',
        totalSessions: 15
      },
      rating: 4,
      subject: 'Linear Algebra',
      sessionDate: new Date(2024, 11, 8, 18, 30),
      reviewDate: new Date(2024, 11, 9, 10, 45),
      title: 'Very helpful with matrix operations',
      content: 'Good session on eigenvalues and eigenvectors. The explanations were clear, though I would have liked more practice problems. Overall, very satisfied with the progress made.',
      helpful: 3,
      replied: true,
      reply: 'Thanks Emma! I\'ll make sure to include more practice problems in our next session. Great job on grasping those difficult concepts!',
      replyDate: new Date(2024, 11, 9, 15, 10),
      tags: ['clear', 'helpful']
    },
    {
      id: 4,
      student: {
        name: 'Alex Thompson',
        email: 'alex.t@email.com',
        avatar: 'AT',
        totalSessions: 2
      },
      rating: 5,
      subject: 'Probability Theory',
      sessionDate: new Date(2024, 11, 7, 15, 0),
      reviewDate: new Date(2024, 11, 8, 11, 20),
      title: 'Perfect introduction to probability',
      content: 'As someone new to probability theory, John made the concepts accessible and interesting. The session was well-structured and I feel confident moving forward. Looking forward to more sessions!',
      helpful: 4,
      replied: false,
      tags: ['structured', 'accessible', 'encouraging']
    },
    {
      id: 5,
      student: {
        name: 'Lisa Park',
        email: 'lisa.park@email.com',
        avatar: 'LP',
        totalSessions: 6
      },
      rating: 4,
      subject: 'Differential Equations',
      sessionDate: new Date(2024, 11, 6, 17, 0),
      reviewDate: new Date(2024, 11, 7, 9, 0),
      title: 'Good progress on differential equations',
      content: 'Solid session covering second-order linear equations. John is patient and explains step-by-step. Sometimes the pace could be a bit faster, but overall very good teaching.',
      helpful: 2,
      replied: true,
      reply: 'Thank you for the feedback, Lisa! I\'ll adjust the pace for our future sessions. Your progress has been excellent!',
      replyDate: new Date(2024, 11, 7, 13, 30),
      tags: ['patient', 'detailed']
    },
    {
      id: 6,
      student: {
        name: 'David Wilson',
        email: 'david.w@email.com',
        avatar: 'DW',
        totalSessions: 1
      },
      rating: 3,
      subject: 'Algebra Basics',
      sessionDate: new Date(2024, 11, 5, 16, 30),
      reviewDate: new Date(2024, 11, 6, 14, 15),
      title: 'Decent session but room for improvement',
      content: 'The session was okay. John knows the material well, but I felt like we could have covered more ground. The explanations were correct but could be more engaging.',
      helpful: 1,
      replied: false,
      tags: ['knowledgeable']
    }
  ]

  const overallStats = {
    averageRating: 4.5,
    totalReviews: reviews.length,
    ratingDistribution: {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length
    },
    replyRate: (reviews.filter(r => r.replied).length / reviews.length) * 100,
    helpfulVotes: reviews.reduce((sum, r) => sum + r.helpful, 0)
  }

  const getAvatarColor = (index: number) => {
    const colors = [
      'bg-accent-100 text-accent-700',
      'bg-warm-100 text-warm-700',
      'bg-success-100 text-success-700',
      'bg-blue-100 text-blue-700',
      'bg-purple-100 text-purple-700'
    ]
    return colors[index % colors.length]
  }

  const renderStars = (rating: number, size: string = 'w-4 h-4') => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`${size} ${
          i < rating ? 'text-amber-400 fill-current' : 'text-legal-border'
        }`}
      />
    ))
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.content.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = selectedFilter === 'all' ||
                         (selectedFilter === 'recent' && review.reviewDate > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) ||
                         (selectedFilter === 'replied' && review.replied) ||
                         (selectedFilter === 'pending' && !review.replied)
    
    const matchesRating = selectedRating === 'all' || review.rating === parseInt(selectedRating)
    
    return matchesSearch && matchesFilter && matchesRating
  })

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
          <div className="flex items-center space-x-4 mb-6 lg:mb-0">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-3xl font-baskervville font-bold text-legal-dark-text">
                Reviews & Feedback
              </h1>
              <p className="text-legal-warm-text font-montserrat">
                Manage student reviews and build your reputation
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="bg-white text-accent-600 font-semibold py-3 px-6 rounded-xl border border-accent-200 hover:bg-accent-50 transition-colors font-montserrat flex items-center space-x-2">
              <Download className="w-5 h-5" />
              <span>Export Reviews</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Review Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            title: 'Average Rating',
            value: overallStats.averageRating.toFixed(1),
            icon: Star,
            color: 'amber',
            description: `Based on ${overallStats.totalReviews} reviews`,
            suffix: '/5'
          },
          {
            title: 'Total Reviews',
            value: overallStats.totalReviews,
            icon: MessageSquare,
            color: 'accent',
            description: 'All time reviews received'
          },
          {
            title: 'Reply Rate',
            value: Math.round(overallStats.replyRate),
            icon: Reply,
            color: 'success',
            description: 'Percentage of reviews replied to',
            suffix: '%'
          },
          {
            title: 'Helpful Votes',
            value: overallStats.helpfulVotes,
            icon: ThumbsUp,
            color: 'blue',
            description: 'Total helpful votes received'
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="bg-white/95 backdrop-blur-sm rounded-xl shadow-legal border border-warm-200/50 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                stat.color === 'amber' ? 'bg-amber-100 text-amber-600' :
                stat.color === 'accent' ? 'bg-accent-100 text-accent-600' :
                stat.color === 'success' ? 'bg-success-100 text-success-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                <stat.icon className="w-5 h-5" />
              </div>
              {stat.title === 'Average Rating' && (
                <div className="flex items-center space-x-1">
                  {renderStars(Math.floor(overallStats.averageRating), 'w-3 h-3')}
                </div>
              )}
            </div>
            <div>
              <p className="text-2xl font-bold text-legal-dark-text font-baskervville mb-1">
                {stat.value}{stat.suffix || ''}
              </p>
              <p className="text-sm text-legal-warm-text font-montserrat">
                {stat.title}
              </p>
              <p className="text-xs text-legal-warm-text/70 font-montserrat mt-1">
                {stat.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Rating Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white/95 backdrop-blur-sm rounded-xl shadow-legal border border-warm-200/50 p-6"
      >
        <h3 className="text-xl font-baskervville font-bold text-legal-dark-text mb-6">
          Rating Distribution
        </h3>
        
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = overallStats.ratingDistribution[rating as keyof typeof overallStats.ratingDistribution]
            const percentage = (count / overallStats.totalReviews) * 100
            
            return (
              <div key={rating} className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 w-20">
                  <span className="text-sm font-medium text-legal-dark-text font-montserrat">
                    {rating}
                  </span>
                  <Star className="w-4 h-4 text-amber-400 fill-current" />
                </div>
                <div className="flex-1 bg-legal-border/30 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: (5 - rating) * 0.1 }}
                    className="h-2 bg-amber-400 rounded-full"
                  />
                </div>
                <div className="w-16 text-right">
                  <span className="text-sm text-legal-warm-text font-montserrat">
                    {count} ({Math.round(percentage)}%)
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-white/95 backdrop-blur-sm rounded-xl shadow-legal border border-warm-200/50 p-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-legal-warm-text" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-legal-border rounded-xl font-montserrat transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-3">
            {/* Status Filter */}
            <div className="flex items-center space-x-1 bg-legal-bg-secondary/30 rounded-lg p-1">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setSelectedFilter(filter.value)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors font-montserrat ${
                    selectedFilter === filter.value
                      ? 'bg-white text-accent-600 shadow-sm'
                      : 'text-legal-warm-text hover:text-accent-600'
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>

            {/* Rating Filter */}
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="px-4 py-2 border border-legal-border rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
            >
              {ratingFilters.map((rating) => (
                <option key={rating.value} value={rating.value}>
                  {rating.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Reviews List */}
      <div className="space-y-6">
        {filteredReviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
            className="bg-white/95 backdrop-blur-sm rounded-xl shadow-legal border border-warm-200/50 p-6"
          >
            {/* Review Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold ${getAvatarColor(index)}`}>
                  {review.student.avatar}
                </div>
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <h4 className="text-lg font-semibold text-legal-dark-text font-baskervville">
                      {review.student.name}
                    </h4>
                    <div className="flex items-center space-x-1">
                      {renderStars(review.rating)}
                    </div>
                    <span className="text-sm text-legal-warm-text font-montserrat">
                      {formatDate(review.reviewDate)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-legal-warm-text font-montserrat">
                    <div className="flex items-center space-x-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{review.subject}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{review.student.totalSessions} sessions</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Session: {formatDate(review.sessionDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {!review.replied && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                    Pending Reply
                  </span>
                )}
                <button className="p-1 text-legal-warm-text hover:text-accent-600 transition-colors">
                  <Flag className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Review Content */}
            <div className="mb-4">
              <h5 className="text-md font-semibold text-legal-dark-text font-montserrat mb-2">
                {review.title}
              </h5>
              <p className="text-legal-warm-text font-montserrat leading-relaxed">
                {review.content}
              </p>
              
              {/* Tags */}
              {review.tags && review.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {review.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent-100 text-accent-700"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Review Actions */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <ThumbsUp className="w-4 h-4 text-legal-warm-text" />
                  <span className="text-sm text-legal-warm-text font-montserrat">
                    {review.helpful} helpful
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {!review.replied && (
                  <button className="bg-accent-100 text-accent-700 font-semibold py-2 px-4 rounded-lg hover:bg-accent-200 transition-colors font-montserrat text-sm flex items-center space-x-1">
                    <Reply className="w-4 h-4" />
                    <span>Reply</span>
                  </button>
                )}
                <button className="p-2 text-legal-warm-text hover:text-accent-600 transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Reply Section */}
            {review.replied && review.reply && (
              <div className="bg-accent-50 border border-accent-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-accent-100 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 text-accent-600" />
                  </div>
                  <span className="text-sm font-medium text-accent-700 font-montserrat">
                    Your Reply
                  </span>
                  <span className="text-xs text-accent-600 font-montserrat">
                    {formatDate(review.replyDate!)}
                  </span>
                </div>
                <p className="text-sm text-accent-700 font-montserrat leading-relaxed">
                  {review.reply}
                </p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredReviews.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/95 backdrop-blur-sm rounded-xl shadow-legal border border-warm-200/50 p-12 text-center"
        >
          <div className="w-16 h-16 bg-legal-bg-secondary/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-legal-warm-text" />
          </div>
          <h3 className="text-xl font-semibold text-legal-dark-text font-baskervville mb-2">
            No reviews found
          </h3>
          <p className="text-legal-warm-text font-montserrat mb-6">
            {searchQuery || selectedFilter !== 'all' || selectedRating !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Complete more sessions to start receiving reviews'}
          </p>
        </motion.div>
      )}

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="bg-gradient-to-r from-amber-50 to-accent-50 border border-amber-200 rounded-xl p-6"
      >
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Award className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-amber-800 font-baskervville mb-2">
              Boost Your Review Score
            </h3>
            <div className="space-y-2 text-sm text-amber-700 font-montserrat">
              <p>• Reply to all reviews to show you value student feedback</p>
              <p>• Ask satisfied students to leave reviews after great sessions</p>
              <p>• Continuously improve based on constructive feedback</p>
              <p>• Maintain consistent quality to earn more 5-star reviews</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}