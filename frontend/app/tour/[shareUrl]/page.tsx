'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Play, Pause, Eye, Heart, Share2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import toast from 'react-hot-toast'
import api from '@/lib/api'

interface Annotation {
  id: string
  type: 'highlight' | 'text' | 'arrow' | 'circle'
  x: number
  y: number
  width: number
  height: number
  text: string
  color: string
}

interface Step {
  id: string
  title: string
  description: string
  image: string
  video: string
  mediaType: 'image' | 'video' | 'both'
  annotations: Annotation[]
  order: number
}

interface Tour {
  _id: string
  title: string
  description: string
  steps: Step[]
  author: {
    name: string
    email: string
  }
  views: number
  likes: number
  createdAt: string
}

export default function PublicTourPage() {
  const [tour, setTour] = useState<Tour | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    if (params.shareUrl) {
      fetchTour(params.shareUrl as string)
    }
  }, [params.shareUrl])

  const fetchTour = async (shareUrl: string) => {
    try {
      const response = await fetch(api.tourByShareUrl(shareUrl))

      if (response.ok) {
        const tourData = await response.json()
        setTour(tourData)
      } else {
        toast.error('Tour not found')
        router.push('/')
      }
    } catch (error) {
      toast.error('Network error')
      router.push('/')
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => {
    if (tour && currentStep < tour.steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const shareTour = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: tour?.title,
          text: tour?.description,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!tour) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Tour not found</h2>
          <Link href="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  const currentStepData = tour.steps[currentStep]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-xl font-semibold">{tour.title}</h1>
                <p className="text-sm text-gray-600">by {tour.author.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={shareTour}
                className="btn-secondary flex items-center"
              >
                <Share2 size={16} className="mr-2" />
                Share
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Tour Info</h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Eye size={16} className="mr-2" />
                  {tour.views} views
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Heart size={16} className="mr-2" />
                  {tour.likes} likes
                </div>
                <div className="text-sm text-gray-600">
                  Created {new Date(tour.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">Steps</h3>
              <div className="space-y-2">
                {tour.steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      currentStep === index
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setCurrentStep(index)}
                  >
                    <span className="font-medium">{step.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {currentStepData ? (
              <div className="card p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">{currentStepData.title}</h2>
                  <p className="text-gray-600">{currentStepData.description}</p>
                </div>

                <div className="space-y-6 mb-6">
                  {/* Image Section */}
                  {currentStepData.image && (
                    <div className="relative">
                      <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        📸 Image
                      </h4>
                      <div className="relative">
                        <img
                          src={currentStepData.image}
                          alt={currentStepData.title}
                          className="w-full h-auto rounded-lg shadow-lg"
                        />
                        
                        {/* Annotations overlay */}
                        {currentStepData.annotations.map((annotation) => (
                          <motion.div
                            key={annotation.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                            className="absolute border-2 border-primary-500 bg-primary-500 bg-opacity-20"
                            style={{
                              left: annotation.x,
                              top: annotation.y,
                              width: annotation.width,
                              height: annotation.height,
                            }}
                          >
                            {annotation.text && (
                              <div className="absolute -bottom-8 left-0 bg-white border border-gray-300 rounded px-2 py-1 text-sm shadow-lg">
                                {annotation.text}
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Video Section */}
                  {currentStepData.video && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                        🎥 Video
                      </h4>
                      <video
                        src={currentStepData.video}
                        controls
                        preload="metadata"
                        className="w-full h-auto rounded-lg shadow-lg"
                        style={{ maxHeight: '500px', minHeight: '300px' }}
                        onLoadStart={() => console.log('Public video loading started')}
                        onCanPlay={() => console.log('Public video can play')}
                        onError={(e) => {
                          console.error('Public video load error:', e)
                        }}
                      >
                        Your browser does not support the video tag.
                      </video>
                      <div className="mt-2 text-sm text-gray-600 text-center">
                        🎥 Click play to watch the video
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation Controls */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <ArrowLeft size={16} className="mr-2" />
                    Previous
                  </button>

                  <div className="flex items-center space-x-4">
                    <button
                      onClick={togglePlay}
                      className="btn-primary flex items-center"
                    >
                      {isPlaying ? (
                        <>
                          <Pause size={16} className="mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play size={16} className="mr-2" />
                          Play
                        </>
                      )}
                    </button>
                  </div>

                  <button
                    onClick={nextStep}
                    disabled={currentStep === tour.steps.length - 1}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    Next
                    <ArrowRight size={16} className="ml-2" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Step {currentStep + 1} of {tour.steps.length}</span>
                    <span>{Math.round(((currentStep + 1) / tour.steps.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentStep + 1) / tour.steps.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card p-12 text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No steps available</h3>
                <p className="text-gray-600">This tour doesn't have any steps yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

