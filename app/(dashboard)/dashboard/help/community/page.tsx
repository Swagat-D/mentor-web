/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  Users,
  ArrowLeft,
  MessageSquare,
  TrendingUp,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Reply,
  Plus,
  Search,
  Filter,
  Star,
  Pin,
  Eye,
  Send,
  Hash,
  Award,
  BookOpen,
  HelpCircle,
  Lightbulb,
  Target
} from 'lucide-react'

interface ForumPost {
  id: string
  title: string
  content: string
  author: {
    name: string
    role: 'mentor' | 'student'
    avatar?: string
    rating: number
    joinDate: string
  }
  category: string
  tags: string[]
  replies: number
  likes: number
  views: number
  isPinned: boolean
  createdAt: string
  lastActivity: string
}

export default function CommunityForumPage() {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [showNewPostModal, setShowNewPostModal] = useState(false)

  const categories = [
    { id: 'all', label: 'All Posts', icon: MessageSquare, count: 156 },
    { id: 'teaching-tips', label: 'Teaching Tips', icon: Lightbulb, count: 45 },
    { id: 'success-stories', label: 'Success Stories', icon: Award, count: 23 },
    { id: 'questions', label: 'Q&A', icon: HelpCircle, count: 67 },
    { id: 'resources', label: 'Resources', icon: BookOpen, count: 21 }
  ]

  // Mock forum posts data
  const mockPosts: ForumPost[] = [
    {
      id: '1',
      title: 'How I Increased My Student Retention by 85%',
      content: 'After struggling with student retention in my first few months, I discovered these key strategies that completely transformed my mentoring approach...',
      author: {
        name: 'Sarah Mitchell',
        role: 'mentor',
        rating: 4.9,
        joinDate: '2023-01-15'
      },
      category: 'success-stories',
      tags: ['retention', 'student-success', 'growth'],
      replies: 24,
      likes: 156,
      views: 892,
      isPinned: true,
      createdAt: '2024-12-10T10:30:00Z',
      lastActivity: '2024-12-12T14:20:00Z'
    },
    {
      id: '2',
      title: 'Best Tools for Online Math Tutoring',
      content: 'I\'ve been experimenting with different digital tools for teaching mathematics online. Here are my top recommendations...',
      author: {
        name: 'David Chen',
        role: 'mentor',
        rating: 4.8,
        joinDate: '2023-03-22'
      },
      category: 'teaching-tips',
      tags: ['tools', 'math', 'technology'],
      replies: 18,
      likes: 89,
      views: 456,
      isPinned: false,
      createdAt: '2024-12-11T16:45:00Z',
      lastActivity: '2024-12-12T09:15:00Z'
    },
    {
      id: '3',
      title: 'How to Handle Difficult Students?',
      content: 'I recently had a challenging situation with a student who was consistently disruptive during sessions. Looking for advice on...',
      author: {
        name: 'Maria Rodriguez',
        role: 'mentor',
        rating: 4.7,
        joinDate: '2023-07-08'
      },
      category: 'questions',
      tags: ['student-management', 'advice', 'communication'],
      replies: 31,
      likes: 67,
      views: 723,
      isPinned: false,
      createdAt: '2024-12-11T09:20:00Z',
      lastActivity: '2024-12-12T11:30:00Z'
    },
    {
      id: '4',
      title: 'Free Resources for Science Students',
      content: 'Compiled a list of excellent free resources that I share with my science students. Feel free to use and add your own...',
      author: {
        name: 'Dr. James Wilson',
        role: 'mentor',
        rating: 5.0,
        joinDate: '2022-11-12'
      },
      category: 'resources',
      tags: ['science', 'free-resources', 'students'],
      replies: 12,
      likes: 94,
      views: 378,
      isPinned: false,
      createdAt: '2024-12-10T14:15:00Z',
      lastActivity: '2024-12-11T16:45:00Z'
    },
    {
      id: '5',
      title: 'From 0 to $3000/month in 6 Months',
      content: 'Want to share my journey from joining the platform with zero students to earning $3000+ per month. Here\'s exactly what I did...',
      author: {
        name: 'Alex Thompson',
        role: 'mentor',
        rating: 4.9,
        joinDate: '2023-05-30'
      },
      category: 'success-stories',
      tags: ['earnings', 'growth', 'strategy'],
      replies: 45,
      likes: 234,
      views: 1247,
      isPinned: true,
      createdAt: '2024-12-09T12:00:00Z',
      lastActivity: '2024-12-12T13:22:00Z'
    }
  ]

  useEffect(() => {
    setPosts(mockPosts)
  }, [])

  const filteredPosts = posts.filter(post => {
    const matchesCategory = activeCategory === 'all' || post.category === activeCategory
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
      case 'popular':
        return b.likes - a.likes
      case 'replies':
        return b.replies - a.replies
      case 'views':
        return b.views - a.views
      default:
        return 0
    }
  })

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

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
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-baskervville font-bold text-legal-dark-text mb-4">
              Community Forum
            </h1>
            <p className="text-xl text-legal-warm-text font-montserrat max-w-2xl mx-auto">
              Connect with fellow mentors, share experiences, and learn from the community
            </p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* New Post Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowNewPostModal(true)}
              className="w-full bg-gradient-to-r from-accent-700 to-accent-600 text-white font-semibold py-4 px-6 rounded-xl shadow-legal hover:shadow-legal-lg transition-all duration-300 font-montserrat flex items-center justify-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>New Post</span>
            </motion.button>

            {/* Categories */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-legal border border-warm-200/50 p-6">
              <h3 className="text-lg font-semibold text-legal-dark-text font-montserrat mb-4">
                Categories
              </h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-300 ${
                      activeCategory === category.id
                        ? 'bg-accent-100 text-accent-700 border border-accent-300'
                        : 'hover:bg-legal-bg-secondary/30 text-legal-dark-text'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <category.icon className="w-5 h-5" />
                      <span className="font-montserrat">{category.label}</span>
                    </div>
                    <span className="text-sm bg-legal-bg-secondary text-legal-warm-text px-2 py-1 rounded-full">
                      {category.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Community Stats */}
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-legal border border-warm-200/50 p-6">
              <h3 className="text-lg font-semibold text-legal-dark-text font-montserrat mb-4">
                Community Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-legal-warm-text font-montserrat text-sm">Total Mentors</span>
                  <span className="font-semibold text-legal-dark-text">1,247</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-legal-warm-text font-montserrat text-sm">Active Today</span>
                  <span className="font-semibold text-legal-dark-text">156</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-legal-warm-text font-montserrat text-sm">Total Posts</span>
                  <span className="font-semibold text-legal-dark-text">2,891</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-legal-warm-text font-montserrat text-sm">This Week</span>
                  <span className="font-semibold text-legal-dark-text">47</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search and Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/95 backdrop-blur-sm rounded-xl shadow-legal border border-warm-200/50 p-6"
            >
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-legal-warm-text" />
                  <input
                    type="text"
                    placeholder="Search posts, tags, or content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-legal-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white font-montserrat"
                  />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-3 border border-legal-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 bg-white font-montserrat"
                >
                  <option value="recent">Most Recent</option>
                  <option value="popular">Most Popular</option>
                  <option value="replies">Most Replies</option>
                  <option value="views">Most Views</option>
                </select>
              </div>
            </motion.div>

            {/* Posts List */}
            <div className="space-y-4">
              {sortedPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-white/95 backdrop-blur-sm rounded-xl shadow-legal border border-warm-200/50 p-6 hover:shadow-legal-lg transition-all duration-300"
                >
                  <div className="flex items-start space-x-4">
                    {/* Author Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-br from-accent-100 to-accent-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-accent-600 font-semibold font-montserrat">
                        {post.author.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>

                    <div className="flex-1">
                      {/* Post Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            {post.isPinned && <Pin className="w-4 h-4 text-accent-600" />}
                            <h3 className="text-lg font-semibold text-legal-dark-text font-montserrat hover:text-accent-600 transition-colors cursor-pointer">
                              {post.title}
                            </h3>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-legal-warm-text font-montserrat">
                            <span>{post.author.name}</span>
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-amber-400 fill-current" />
                              <span>{post.author.rating}</span>
                            </div>
                            <span>{formatTimeAgo(post.createdAt)}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              className="bg-accent-100 text-accent-700 px-2 py-1 rounded-full text-xs font-montserrat"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Post Content */}
                      <p className="text-legal-warm-text font-montserrat mb-4 line-clamp-2">
                        {post.content}
                      </p>

                      {/* Post Stats */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                          <button className="flex items-center space-x-2 text-legal-warm-text hover:text-accent-600 transition-colors">
                            <ThumbsUp className="w-4 h-4" />
                            <span className="text-sm font-montserrat">{post.likes}</span>
                          </button>
                          <div className="flex items-center space-x-2 text-legal-warm-text">
                            <Reply className="w-4 h-4" />
                            <span className="text-sm font-montserrat">{post.replies}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-legal-warm-text">
                            <Eye className="w-4 h-4" />
                            <span className="text-sm font-montserrat">{post.views}</span>
                          </div>
                        </div>
                        <span className="text-sm text-legal-warm-text font-montserrat">
                          Last activity {formatTimeAgo(post.lastActivity)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center">
              <button className="bg-white text-accent-600 font-semibold py-3 px-8 rounded-xl border border-accent-200 hover:bg-accent-50 transition-colors font-montserrat">
                Load More Posts
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}