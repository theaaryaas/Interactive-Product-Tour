'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Plus, Upload, Save, Eye, ArrowLeft, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import toast from 'react-hot-toast'
import ScreenRecorder from '../../../../components/ScreenRecorder'

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
  annotations: Annotation[]
  order: number
}

interface Tour {
  _id: string
  title: string
  description: string
  steps: Step[]
  isPublic: boolean
  isPublished: boolean
}

export default function EditTourPage() {
  const [tour, setTour] = useState<Tour | null>(null)
  const [tourTitle, setTourTitle] = useState('')
  const [tourDescription, setTourDescription] = useState('')
  const [steps, setSteps] = useState<Step[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    if (params.id) {
      fetchTour(params.id as string)
    }
  }, [params.id, router])

  const fetchTour = async (tourId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/tours/${tourId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const tourData = await response.json()
        setTour(tourData)
        setTourTitle(tourData.title)
        setTourDescription(tourData.description)
        setSteps(tourData.steps || [])
      } else {
        toast.error('Failed to load tour')
        router.push('/dashboard')
      }
    } catch (error) {
      toast.error('Network error')
      router.push('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const addStep = () => {
    const newStep: Step = {
      id: Date.now().toString(),
      title: `Step ${steps.length + 1}`,
      description: '',
      image: '',
      annotations: [],
      order: steps.length
    }
    setSteps([...steps, newStep])
    setCurrentStep(steps.length)
  }

  const updateStep = (stepId: string, updates: Partial<Step>) => {
    setSteps(steps.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ))
  }

  const deleteStep = (stepId: string) => {
    const newSteps = steps.filter(step => step.id !== stepId)
    setSteps(newSteps)
    if (currentStep >= newSteps.length) {
      setCurrentStep(Math.max(0, newSteps.length - 1))
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string
        updateStep(steps[currentStep]?.id, { image: imageUrl })
      }
      reader.readAsDataURL(file)
    }
  }

  const addAnnotation = (type: Annotation['type']) => {
    if (!steps[currentStep]) return

    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      type,
      x: 100,
      y: 100,
      width: type === 'circle' ? 50 : 100,
      height: type === 'circle' ? 50 : 30,
      text: '',
      color: '#3b82f6'
    }

    updateStep(steps[currentStep].id, {
      annotations: [...steps[currentStep].annotations, newAnnotation]
    })
  }

  const updateAnnotation = (annotationId: string, updates: Partial<Annotation>) => {
    if (!steps[currentStep]) return

    const updatedAnnotations = steps[currentStep].annotations.map(annotation =>
      annotation.id === annotationId ? { ...annotation, ...updates } : annotation
    )

    updateStep(steps[currentStep].id, { annotations: updatedAnnotations })
  }

  const deleteAnnotation = (annotationId: string) => {
    if (!steps[currentStep]) return

    const updatedAnnotations = steps[currentStep].annotations.filter(
      annotation => annotation.id !== annotationId
    )

    updateStep(steps[currentStep].id, { annotations: updatedAnnotations })
  }

  const saveTour = async () => {
    if (!tour) return

    setIsSaving(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/tours/${tour._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: tourTitle,
          description: tourDescription,
          steps: steps.map(step => ({
            title: step.title,
            description: step.description,
            image: step.image,
            annotations: step.annotations,
            order: step.order
          }))
        })
      })

      if (response.ok) {
        toast.success('Tour updated successfully!')
      } else {
        toast.error('Failed to update tour')
      }
    } catch (error) {
      toast.error('Network error')
    } finally {
      setIsSaving(false)
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
          <Link href="/dashboard" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const currentStepData = steps[currentStep]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft size={20} />
              </Link>
              <h1 className="text-xl font-semibold">Edit Tour: {tour.title}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="btn-secondary"
              >
                <Eye size={16} className="mr-2" />
                {isPreviewMode ? 'Edit' : 'Preview'}
              </button>
              <button
                onClick={saveTour}
                disabled={isSaving}
                className="btn-primary disabled:opacity-50"
              >
                <Save size={16} className="mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
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
              <h3 className="text-lg font-semibold mb-4">Tour Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={tourTitle}
                    onChange={(e) => setTourTitle(e.target.value)}
                    className="input-field"
                    placeholder="Enter tour title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={tourDescription}
                    onChange={(e) => setTourDescription(e.target.value)}
                    className="input-field"
                    rows={3}
                    placeholder="Enter tour description"
                  />
                </div>
              </div>
            </div>

            <div className="card p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Steps</h3>
                <button
                  onClick={addStep}
                  className="btn-primary py-2 px-3"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="space-y-2">
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      currentStep === index
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setCurrentStep(index)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{step.title}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteStep(step.id)
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <ScreenRecorder onRecordingComplete={(blob) => {
              const reader = new FileReader()
              reader.onload = () => {
                const dataUrl = reader.result as string
                toast.success('Recording saved! You can now add it to your tour.')
              }
              reader.readAsDataURL(blob)
            }} />
          </div>

          {/* Main Editor */}
          <div className="lg:col-span-3">
            {currentStepData ? (
              <div className="card p-6">
                <div className="mb-6">
                  <input
                    type="text"
                    value={currentStepData.title}
                    onChange={(e) => updateStep(currentStepData.id, { title: e.target.value })}
                    className="text-xl font-semibold bg-transparent border-none outline-none w-full mb-2"
                  />
                  <textarea
                    value={currentStepData.description}
                    onChange={(e) => updateStep(currentStepData.id, { description: e.target.value })}
                    className="w-full bg-transparent border-none outline-none resize-none"
                    rows={2}
                    placeholder="Add a description for this step..."
                  />
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  {currentStepData.image ? (
                    <div className="relative">
                      <img
                        src={currentStepData.image}
                        alt="Step image"
                        className="max-w-full h-auto mx-auto rounded-lg"
                      />
                      {/* Annotations overlay */}
                      {currentStepData.annotations.map((annotation) => (
                        <div
                          key={annotation.id}
                          className="absolute border-2 border-primary-500 bg-primary-500 bg-opacity-20"
                          style={{
                            left: annotation.x,
                            top: annotation.y,
                            width: annotation.width,
                            height: annotation.height,
                          }}
                        >
                          {annotation.text && (
                            <div className="absolute -bottom-8 left-0 bg-white border border-gray-300 rounded px-2 py-1 text-sm">
                              {annotation.text}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-4">Upload an image for this step</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-primary"
                      >
                        <Upload size={16} className="mr-2" />
                        Upload Image
                      </button>
                    </div>
                  )}
                </div>

                {/* Annotation Tools */}
                {currentStepData.image && (
                  <div className="mt-6 flex space-x-2">
                    <button
                      onClick={() => addAnnotation('highlight')}
                      className="btn-secondary"
                    >
                      Add Highlight
                    </button>
                    <button
                      onClick={() => addAnnotation('text')}
                      className="btn-secondary"
                    >
                      Add Text
                    </button>
                    <button
                      onClick={() => addAnnotation('arrow')}
                      className="btn-secondary"
                    >
                      Add Arrow
                    </button>
                    <button
                      onClick={() => addAnnotation('circle')}
                      className="btn-secondary"
                    >
                      Add Circle
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="card p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <Plus size={48} className="mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No steps yet</h3>
                <p className="text-gray-600 mb-4">Add your first step to start building your tour.</p>
                <button onClick={addStep} className="btn-primary">
                  <Plus size={16} className="mr-2" />
                  Add First Step
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
