'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Eye, Edit, Trash2, Share2, Calendar, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

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
  author: {
    name: string
    email: string
  }
}

export default function ToursPage() {
  const [tours, setTours] = useState<Tour[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    fetchTours()
  }, [router])

  const fetchTours = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/tours', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setTours(data.tours)
      } else {
        toast.error('Failed to load tours')
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
      const response = await fetch(`http://localhost:5000/api/tours/${tourId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        toast.success('Tour deleted successfully')
        fetchTours()
      } else {
        toast.error('Failed to delete tour')
      }
    } catch (error) {
      toast.error('Network error')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
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
              <Link href="/dashboard" className="text-primary-600 hover:text-primary-700">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">My Tours</h1>
            </div>
            <Link href="/create" className="btn-primary">
              <Plus size={16} className="mr-2" />
              Create New Tour
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {tours.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-12 text-center"
          >
            <div className="text-gray-400 mb-4">
              <BarChart3 size={48} className="mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tours yet</h3>
            <p className="text-gray-600 mb-6">Create your first interactive product tour to get started.</p>
            <Link href="/create" className="btn-primary inline-flex items-center">
              <Plus size={20} className="mr-2" />
              Create Your First Tour
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.map((tour, index) => (
              <motion.div
                key={tour._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card p-6 hover:shadow-lg transition-shadow"
              >
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {tour.title}
                    </h3>
                    <div className="flex space-x-1">
                      {tour.isPublic && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                          Public
                        </span>
                      )}
                      {tour.isPublished && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          Published
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                    {tour.description || 'No description provided'}
                  </p>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <Eye size={14} className="mr-1" />
                      {tour.views}
                    </span>
                    <span className="flex items-center">
                      <Calendar size={14} className="mr-1" />
                      {formatDate(tour.createdAt)}
                    </span>
                    <span className="text-blue-600">📸🎥</span>
                  </div>
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
      </div>
    </div>
  )
}

