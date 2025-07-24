'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Star,
  Search,
  MessageSquare,
  ThumbsUp,
  Award,
  Calendar,
  User,
  Reply,
  Download,
  BookOpen,
  Loader2,
  Send,
} from 'lucide-react'

interface Review {
  id: string;
  student: {
    name: string;
    email: string;
    avatar: string;
    totalSessions: number;
  };
  rating: number;
  subject: string;
  sessionDate: string;
  reviewDate: string;
  title: string;
  content: string;
  helpful: number;
  replied: boolean;
  reply?: string;
  replyDate?: string;
  tags: string[];
}

interface ReviewsData {
  reviews: Review[];
  overallStats: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: {
      5: number;
      4: number;
      3: number;
      2: number;
      1: number;
    };
    replyRate: number;
    helpfulVotes: number;
  };
  filterCounts: {
    all: number;
    recent: number;
    replied: number;
    pending: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function ReviewsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [selectedRating, setSelectedRating] = useState('all')
  const [reviewsData, setReviewsData] = useState<ReviewsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [submittingReply, setSubmittingReply] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const ratingFilters = [
    { value: 'all', label: 'All Ratings' },
    { value: '5', label: '5 Stars' },
    { value: '4', label: '4 Stars' },
    { value: '3', label: '3 Stars' },
    { value: '2', label: '2 Stars' },
    { value: '1', label: '1 Star' }
  ]

  useEffect(() => {
    fetchReviewsData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFilter, selectedRating, searchQuery, currentPage])

  const fetchReviewsData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        filter: selectedFilter,
        rating: selectedRating,
        search: searchQuery,
        page: currentPage.toString(),
        limit: '10'
      })

      const response = await fetch(`/api/reviews?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setReviewsData(result.data)
      } else {
        console.error('Failed to fetch reviews data:', result.message)
      }
    } catch (error) {
      console.error('Error fetching reviews data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim()) return

    try {
      setSubmittingReply(true)
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, reply: replyText })
      })

      const result = await response.json()
      if (result.success) {
        setReplyingTo(null)
        setReplyText('')
        fetchReviewsData() // Refresh the data
      } else {
        console.error('Failed to reply:', result.message)
      }
    } catch (error) {
      console.error('Error submitting reply:', error)
    } finally {
      setSubmittingReply(false)
    }
  }

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      setExporting(true)
      const response = await fetch('/api/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format })
      })

      if (format === 'csv') {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `reviews-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const result = await response.json()
        if (result.success) {
          const dataStr = JSON.stringify(result.data, null, 2)
          const dataBlob = new Blob([dataStr], { type: 'application/json' })
          const url = window.URL.createObjectURL(dataBlob)
          const a = document.createElement('a')
          a.href = url
          a.download = result.filename
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
        }
      }
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setExporting(false)
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading && !reviewsData) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="w-8 h-8 animate-spin text-accent-600" />
      </div>
    )
  }

  if (!reviewsData) {
    return (
      <div className="text-center py-12">
        <p className="text-legal-warm-text">Failed to load reviews data</p>
      </div>
    )
  }

  const filters = [
    { value: 'all', label: 'All Reviews', count: reviewsData.filterCounts.all },
    { value: 'recent', label: 'Recent', count: reviewsData.filterCounts.recent },
    { value: 'replied', label: 'Replied', count: reviewsData.filterCounts.replied },
    { value: 'pending', label: 'Pending Reply', count: reviewsData.filterCounts.pending }
  ]

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
            <button 
              onClick={() => handleExport('csv')}
              disabled={exporting}
              className="bg-white text-accent-600 font-semibold py-3 px-6 rounded-xl border border-accent-200 hover:bg-accent-50 transition-colors font-montserrat flex items-center space-x-2 disabled:opacity-50"
            >
              {exporting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
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
            value: reviewsData.overallStats.averageRating.toFixed(1),
            icon: Star,
            color: 'amber',
            description: `Based on ${reviewsData.overallStats.totalReviews} reviews`,
            suffix: '/5'
          },
          {
            title: 'Total Reviews',
            value: reviewsData.overallStats.totalReviews,
            icon: MessageSquare,
            color: 'accent',
            description: 'All time reviews received'
          },
          {
            title: 'Reply Rate',
            value: Math.round(reviewsData.overallStats.replyRate),
            icon: Reply,
            color: 'success',
            description: 'Percentage of reviews replied to',
            suffix: '%'
          },
          {
            title: 'Helpful Votes',
            value: reviewsData.overallStats.helpfulVotes,
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
                  {renderStars(Math.floor(reviewsData.overallStats.averageRating), 'w-3 h-3')}
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
            const count = reviewsData.overallStats.ratingDistribution[rating as keyof typeof reviewsData.overallStats.ratingDistribution]
            const percentage = reviewsData.overallStats.totalReviews > 0 
              ? (count / reviewsData.overallStats.totalReviews) * 100 
              : 0
            
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
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-accent-600" />
          </div>
        )}

        {!loading && reviewsData.reviews.map((review, index) => (
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
                  <button 
                    onClick={() => setReplyingTo(review.id)}
                    className="bg-accent-100 text-accent-700 font-semibold py-2 px-4 rounded-lg hover:bg-accent-200 transition-colors font-montserrat text-sm flex items-center space-x-1"
                  >
                    <Reply className="w-4 h-4" />
                    <span>Reply</span>
                  </button>
                )}
              </div>
            </div>

            {/* Reply Section */}
            {review.replied && review.reply && (
              <div className="bg-accent-50 border border-accent-200 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-accent-100 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 text-accent-600" />
                  </div>
                  <span className="text-sm font-medium text-accent-700 font-montserrat">
                    Your Reply
                  </span>
                  <span className="text-xs text-accent-600 font-montserrat">
                    {review.replyDate && formatDate(review.replyDate)}
                  </span>
                </div>
                <p className="text-sm text-accent-700 font-montserrat leading-relaxed">
                  {review.reply}
                </p>
              </div>
            )}

            {/* Reply Form */}
            {replyingTo === review.id && (
              <div className="bg-legal-bg-secondary/20 border border-legal-border rounded-lg p-4">
                <div className="mb-3">
                  <label className="block text-sm font-medium text-legal-dark-text font-montserrat mb-2">
                    Your Reply
                  </label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write your reply..."
                    rows={3}
                    className="w-full px-3 py-2 border border-legal-border rounded-lg font-montserrat text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white"
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleReply(review.id)}
                    disabled={submittingReply || !replyText.trim()}
                    className="bg-accent-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-accent-700 transition-colors font-montserrat text-sm flex items-center space-x-1 disabled:opacity-50"
                  >
                    {submittingReply ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>Send Reply</span>
                  </button>
                  <button
                    onClick={() => {
                      setReplyingTo(null)
                      setReplyText('')
                    }}
                    className="bg-legal-bg-secondary text-legal-dark-text font-semibold py-2 px-4 rounded-lg hover:bg-legal-border transition-colors font-montserrat text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {reviewsData.pagination.pages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center space-x-2"
        >
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border border-legal-border rounded-lg font-montserrat text-sm disabled:opacity-50 hover:bg-legal-bg-secondary transition-colors"
          >
            Previous
          </button>
          
          <div className="flex space-x-1">
            {Array.from({ length: reviewsData.pagination.pages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded-lg font-montserrat text-sm transition-colors ${
                  currentPage === page
                    ? 'bg-accent-600 text-white'
                    : 'border border-legal-border hover:bg-legal-bg-secondary'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(reviewsData.pagination.pages, prev + 1))}
            disabled={currentPage === reviewsData.pagination.pages}
            className="px-4 py-2 border border-legal-border rounded-lg font-montserrat text-sm disabled:opacity-50 hover:bg-legal-bg-secondary transition-colors"
          >
            Next
          </button>
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && reviewsData.reviews.length === 0 && (
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

      {/* Export Options */}
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
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-amber-800 font-baskervville mb-2">
              Boost Your Review Score
            </h3>
            <div className="space-y-2 text-sm text-amber-700 font-montserrat mb-4">
              <p>• Reply to all reviews to show you value student feedback</p>
              <p>• Ask satisfied students to leave reviews after great sessions</p>
              <p>• Continuously improve based on constructive feedback</p>
              <p>• Maintain consistent quality to earn more 5-star reviews</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => handleExport('csv')}
                disabled={exporting}
                className="bg-white text-amber-700 font-semibold py-2 px-4 rounded-lg border border-amber-200 hover:bg-amber-50 transition-colors font-montserrat text-sm disabled:opacity-50"
              >
                Export as CSV
              </button>
              <button
                onClick={() => handleExport('json')}
                disabled={exporting}
                className="bg-amber-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-amber-700 transition-colors font-montserrat text-sm disabled:opacity-50"
              >
                Export as JSON
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}