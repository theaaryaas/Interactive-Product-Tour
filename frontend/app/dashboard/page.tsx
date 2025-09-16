'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Eye, Edit, Trash2, Share2, BarChart3, Users, Zap } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import api from '@/lib/api'

interface Tour {
  _id: string
  title: string
  description: string
  thumbnail?: string
  isPublic: boolean
  isPublished: boolean
  views: number
  likes: number
  createdAt: string
}

interface DashboardData {
  recentTours: Tour[]
  stats: {
    totalTours: number
    publishedTours: number
    totalViews: number
  }
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    fetchDashboardData()
  }, [router])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(api.dashboard, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      } else {
        toast.error('Failed to load dashboard data')
      }
    } catch (error) {
      toast.error('Network error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteTour = async (tourId: string) => {
    if (!confirm('Are you sure you want to delete this tour?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(api.tourById(tourId), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast.success('Tour deleted successfully')
        fetchDashboardData()
      } else {
        toast.error('Failed to delete tour')
      }
    } catch (error) {
      toast.error('Network error')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-primary-600">ProductTour</h1>
              <nav className="hidden md:flex space-x-6">
                <Link href="/dashboard" className="text-primary-600 font-medium">Dashboard</Link>
                <Link href="/tours" className="text-gray-600 hover:text-gray-900">My Tours</Link>
                <Link href="/create" className="text-gray-600 hover:text-gray-900">Create Tour</Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={handleLogout} className="text-gray-600 hover:text-gray-900">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h2>
          <p className="text-gray-600">Here's what's happening with your tours.</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6"
          >
            <div className="flex items-center">
              <div className="bg-primary-100 p-3 rounded-lg">
                <BarChart3 className="text-primary-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tours</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData?.stats.totalTours || 0}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <Zap className="text-green-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData?.stats.publishedTours || 0}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-6"
          >
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Eye className="text-blue-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData?.stats.totalViews || 0}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/create" className="btn-primary inline-flex items-center">
              <Plus size={20} className="mr-2" />
              Create New Tour
            </Link>
            <Link href="/tours" className="btn-secondary inline-flex items-center">
              <Eye size={20} className="mr-2" />
              View All Tours
            </Link>
          </div>
        </motion.div>

        {/* Recent Tours */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Tours</h3>
          
          {dashboardData?.recentTours.length === 0 ? (
            <div className="card p-8 text-center">
              <div className="text-gray-400 mb-4">
                <BarChart3 size={48} className="mx-auto" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">No tours yet</h4>
              <p className="text-gray-600 mb-4">Create your first interactive product tour to get started.</p>
              <Link href="/create" className="btn-primary inline-flex items-center">
                <Plus size={20} className="mr-2" />
                Create Your First Tour
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboardData?.recentTours.map((tour, index) => (
                <motion.div
                  key={tour._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="card p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{tour.title}</h4>
                    <p className="text-gray-600 text-sm line-clamp-2">{tour.description}</p>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-2">
                      <span>{tour.views} views</span>
                      <span className="text-blue-600">📸🎥</span>
                    </div>
                    <span>{tour.isPublished ? 'Published' : 'Draft'}</span>
                  </div>

                  <div className="flex space-x-2">
                    <Link
                      href={`/tours/${tour._id}/preview`}
                      className="flex-1 btn-primary text-center py-2"
                    >
                      <Eye size={16} className="inline mr-1" />
                      Preview
                    </Link>
                    <Link
                      href={`/tours/${tour._id}/edit`}
                      className="flex-1 btn-secondary text-center py-2"
                    >
                      <Edit size={16} className="inline mr-1" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteTour(tour._id)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

