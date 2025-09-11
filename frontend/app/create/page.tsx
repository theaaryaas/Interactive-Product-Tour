'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Upload, Save, Eye, ArrowLeft, Trash2, Move } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import ScreenRecorder from '../../components/ScreenRecorder'

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

export default function CreateTourPage() {
  const [tourTitle, setTourTitle] = useState('')
  const [tourDescription, setTourDescription] = useState('')
  const [steps, setSteps] = useState<Step[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [pendingAnnotationType, setPendingAnnotationType] = useState<Annotation['type'] | null>(null)
  const [isProcessingRecording, setIsProcessingRecording] = useState(false)
  const [draggedAnnotation, setDraggedAnnotation] = useState<string | null>(null)
  const [resizingAnnotation, setResizingAnnotation] = useState<string | null>(null)
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const addStep = () => {
    const newStep: Step = {
      id: Date.now().toString(),
      title: `Step ${steps.length + 1}`,
      description: '',
      image: '',
      video: '',
      mediaType: 'image',
      annotations: [],
      order: steps.length
    }
    setSteps([...steps, newStep])
    setCurrentStep(steps.length)
  }

  const updateStep = (stepId: string, updates: Partial<Step>) => {
    console.log('=== UPDATE STEP CALLED ===')
    console.log('Step ID:', stepId)
    console.log('Updates:', updates)
    console.log('Current step index:', currentStep)
    console.log('Current step data:', steps[currentStep])
    console.log('All steps before update:', steps)
    
    const newSteps = steps.map(step => {
      if (step.id === stepId) {
        const updatedStep = { ...step, ...updates }
        console.log('Updated step:', updatedStep)
        return updatedStep
      }
      return step
    })
    
    console.log('All steps after update:', newSteps)
    setSteps(newSteps)
    
    // Force a re-render by updating current step data
    setTimeout(() => {
      console.log('Steps after setState:', steps)
    }, 100)
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
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string
        const currentStepData = steps[currentStep]
        if (currentStepData) {
          updateStep(currentStepData.id, { 
            image: imageUrl,
            mediaType: currentStepData.video ? 'both' : 'image'
          })
          console.log('Image uploaded successfully:', imageUrl.substring(0, 50) + '...')
          toast.success('Image uploaded successfully!')
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        alert('Please select a video file')
        return
      }
      
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        alert('Video file is too large. Please select a file smaller than 50MB.')
        return
      }
      
      console.log('Uploading video:', file.name, 'Size:', file.size, 'Type:', file.type)
      
      const reader = new FileReader()
      reader.onload = (e) => {
        const videoUrl = e.target?.result as string
        const currentStepData = steps[currentStep]
        if (currentStepData) {
          updateStep(currentStepData.id, { 
            video: videoUrl,
            mediaType: currentStepData.image ? 'both' : 'video'
          })
          console.log('Video uploaded successfully:', videoUrl.substring(0, 50) + '...')
          console.log('Video URL length:', videoUrl.length)
          toast.success('Video uploaded successfully!')
        }
      }
      reader.onerror = (error) => {
        console.error('Error reading video file:', error)
        toast.error('Error uploading video file')
      }
      reader.readAsDataURL(file)
    }
  }

  const addAnnotation = (type: Annotation['type']) => {
    if (!steps[currentStep]) return

    const newAnnotation: Annotation = {
      id: Date.now().toString(),
      type,
      x: 150,
      y: 150,
      width: type === 'circle' ? 60 : 120,
      height: type === 'circle' ? 60 : 40,
      text: type === 'text' ? 'Click to edit' : '',
      color: type === 'highlight' ? '#fbbf24' : 
             type === 'text' ? '#3b82f6' : 
             type === 'arrow' ? '#10b981' : '#8b5cf6'
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
    setSelectedAnnotation(null)
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete selected annotation with Delete key
      if (e.key === 'Delete' && selectedAnnotation) {
        deleteAnnotation(selectedAnnotation)
        return
      }
      
      // Escape to clear selection or pending annotation
      if (e.key === 'Escape') {
        setSelectedAnnotation(null)
        setPendingAnnotationType(null)
        return
      }
      
      // Number keys for quick annotation selection
      if (e.key >= '1' && e.key <= '4') {
        const annotationTypes = ['highlight', 'text', 'arrow', 'circle']
        const index = parseInt(e.key) - 1
        if (index < annotationTypes.length) {
          setPendingAnnotationType(annotationTypes[index] as Annotation['type'])
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedAnnotation, deleteAnnotation])

  const saveTour = async () => {
    if (!tourTitle.trim()) {
      toast.error('Please enter a tour title')
      return
    }

    if (steps.length === 0) {
      toast.error('Please add at least one step')
      return
    }

    setIsSaving(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/tours', {
        method: 'POST',
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
            video: step.video,
            mediaType: step.mediaType,
            annotations: step.annotations,
            order: step.order
          }))
        })
      })

      if (response.ok) {
        const tour = await response.json()
        localStorage.setItem('lastSavedTourId', tour._id)
        toast.success('Tour saved successfully!')
        
        // Show success message with preview option
        setTimeout(() => {
          toast.success(
            <div className="flex items-center space-x-4">
              <span>Tour saved successfully!</span>
              <button
                onClick={() => router.push(`/tours/${tour._id}/preview`)}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
              >
                Preview Tour
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
              >
                Go to Dashboard
              </button>
            </div>,
            { duration: 5000 }
          )
        }, 1000)
      } else {
        toast.error('Failed to save tour')
      }
    } catch (error) {
      toast.error('Network error')
    } finally {
      setIsSaving(false)
    }
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
              <h1 className="text-xl font-semibold">Create Tour</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="btn-secondary"
              >
                <Eye size={16} className="mr-2" />
                {isPreviewMode ? 'Edit' : 'Preview'}
              </button>
              <div className="flex space-x-2">
                {steps.length > 0 && (
                  <button
                    onClick={() => {
                      // Save tour first, then preview
                      if (tourTitle.trim()) {
                        saveTour().then(() => {
                          // After saving, redirect to preview
                          const tourId = localStorage.getItem('lastSavedTourId')
                          if (tourId) {
                            router.push(`/tours/${tourId}/preview`)
                          }
                        })
                      } else {
                        toast.error('Please enter a tour title first')
                      }
                    }}
                    className="btn-secondary"
                  >
                    <Eye size={16} className="mr-2" />
                    Preview Tour
                  </button>
                )}
                <button
                  onClick={saveTour}
                  disabled={isSaving}
                  className="btn-primary disabled:opacity-50"
                >
                  <Save size={16} className="mr-2" />
                  {isSaving ? 'Saving...' : 'Save Tour'}
                </button>
              </div>
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
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{step.title}</span>
                        {currentStep === index && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Selected
                          </span>
                        )}
                        {(step.image || step.video) && (
                          <div className="flex items-center space-x-1">
                            {step.image && <span className="text-green-600 text-xs">📸</span>}
                            {step.video && <span className="text-blue-600 text-xs">🎥</span>}
                          </div>
                        )}
                      </div>
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
                  {(currentStepData.image || currentStepData.video) ? (
                    <div className="space-y-6">
                      {/* Image Section */}
                      {currentStepData.image && (
                        <div className="relative inline-block">
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                            <h4 className="text-sm font-medium text-green-800 mb-2 flex items-center justify-center">
                              ✅ Image Uploaded Successfully
                              <button
                                onClick={() => updateStep(steps[currentStep].id, { image: '', mediaType: currentStepData.video ? 'video' : 'image' })}
                                className="ml-2 text-red-500 hover:text-red-700 text-xs"
                              >
                                Remove
                              </button>
                            </h4>
                          </div>
                          <img
                            src={currentStepData.image}
                            alt="Step image"
                            className={`max-w-full h-auto mx-auto rounded-lg shadow-lg border-2 transition-all duration-200 ${
                              pendingAnnotationType 
                                ? 'border-blue-400 cursor-crosshair shadow-blue-200 shadow-lg' 
                                : 'border-green-200 cursor-default hover:border-green-300'
                            }`}
                            onClick={(e) => {
                              console.log('=== IMAGE CLICKED ===')
                              const rect = e.currentTarget.getBoundingClientRect()
                              const x = e.clientX - rect.left
                              const y = e.clientY - rect.top
                              console.log('Image clicked at:', x, y)
                              console.log('Current pendingAnnotationType:', pendingAnnotationType)
                              
                              // If there's a pending annotation to add, position it here
                              if (pendingAnnotationType) {
                                console.log('Creating new annotation:', pendingAnnotationType)
                                const newAnnotation: Annotation = {
                                  id: Date.now().toString(),
                                  type: pendingAnnotationType,
                                  x: x - 60, // Center the annotation
                                  y: y - 20,
                                  width: pendingAnnotationType === 'circle' ? 60 : 120,
                                  height: pendingAnnotationType === 'circle' ? 60 : 40,
                                  text: pendingAnnotationType === 'text' ? 'Click to edit' : '',
                                  color: pendingAnnotationType === 'highlight' ? '#fbbf24' : 
                                         pendingAnnotationType === 'text' ? '#3b82f6' : 
                                         pendingAnnotationType === 'arrow' ? '#10b981' : '#8b5cf6'
                                }
                                console.log('New annotation created:', newAnnotation)
                                updateStep(steps[currentStep].id, {
                                  annotations: [...steps[currentStep].annotations, newAnnotation]
                                })
                                setPendingAnnotationType(null)
                                console.log('Annotation added and pendingAnnotationType cleared')
                              } else {
                                console.log('No pending annotation type - click ignored')
                              }
                            }}
                          />
                      {/* Professional Annotations overlay */}
                      {currentStepData.annotations.map((annotation) => (
                        <div
                          key={annotation.id}
                          className={`absolute cursor-move hover:shadow-xl transition-all duration-200 z-10 group ${
                            draggedAnnotation === annotation.id ? 'opacity-70 scale-105' : ''
                          } ${
                            selectedAnnotation === annotation.id ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                          }`}
                          style={{
                            left: annotation.x,
                            top: annotation.y,
                            width: annotation.width,
                            height: annotation.height,
                          }}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedAnnotation(annotation.id)
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setDraggedAnnotation(annotation.id)
                            setSelectedAnnotation(annotation.id)
                            
                            const annotationElement = e.currentTarget
                            const imageElement = annotationElement.parentElement
                            const startX = e.clientX - annotation.x
                            const startY = e.clientY - annotation.y
                            
                            const handleMouseMove = (moveEvent: MouseEvent) => {
                              if (imageElement) {
                                const rect = imageElement.getBoundingClientRect()
                                const newX = moveEvent.clientX - rect.left - startX
                                const newY = moveEvent.clientY - rect.top - startY
                                
                                // Constrain to image bounds
                                const constrainedX = Math.max(0, Math.min(newX, rect.width - annotation.width))
                                const constrainedY = Math.max(0, Math.min(newY, rect.height - annotation.height))
                                
                                updateAnnotation(annotation.id, { x: constrainedX, y: constrainedY })
                              }
                            }
                            
                            const handleMouseUp = () => {
                              setDraggedAnnotation(null)
                              document.removeEventListener('mousemove', handleMouseMove)
                              document.removeEventListener('mouseup', handleMouseUp)
                            }
                            
                            document.addEventListener('mousemove', handleMouseMove)
                            document.addEventListener('mouseup', handleMouseUp)
                          }}
                        >
                          {/* Professional Annotation visual based on type */}
                          {annotation.type === 'highlight' && (
                            <div className="relative w-full h-full">
                              <div 
                                className="w-full h-full bg-yellow-400 bg-opacity-30 border-2 border-yellow-500 rounded-lg shadow-lg backdrop-blur-sm"
                                style={{ backgroundColor: annotation.color + '30' }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-br from-yellow-200/20 to-transparent rounded-lg"></div>
                            </div>
                          )}
                          
                          {annotation.type === 'text' && (
                            <div className="relative w-full h-full">
                              <div className="w-full h-full bg-white bg-opacity-95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-2 flex items-center justify-center">
                                <span className="text-gray-800 text-sm font-medium text-center leading-tight">
                                  {annotation.text || 'Click to edit'}
                                </span>
                              </div>
                              <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-sm"></div>
                            </div>
                          )}
                          
                          {annotation.type === 'arrow' && (
                            <div className="relative w-full h-full flex items-center justify-center">
                              <div className="relative">
                                <svg className="w-8 h-8 text-green-500 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M13.025 1l-2.847 2.828 6.176 6.176h-16.354v3.992h16.354l-6.176 6.176 2.847 2.828 10.975-11z"/>
                                </svg>
                                <div className="absolute inset-0 bg-green-500 bg-opacity-20 rounded-full blur-sm"></div>
                              </div>
                            </div>
                          )}
                          
                          {annotation.type === 'circle' && (
                            <div className="relative w-full h-full flex items-center justify-center">
                              <div 
                                className="w-full h-full border-3 border-purple-500 rounded-full shadow-lg relative"
                                style={{ borderColor: annotation.color }}
                              >
                                <div className="absolute inset-0 bg-purple-500 bg-opacity-10 rounded-full"></div>
                                <div className="absolute inset-2 bg-purple-500 bg-opacity-5 rounded-full"></div>
                              </div>
                            </div>
                          )}

                          {/* Professional Annotation controls */}
                          <div className={`absolute -top-3 -right-3 flex space-x-1 transition-all duration-200 ${
                            selectedAnnotation === annotation.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          }`}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                const newText = prompt('Edit annotation text:', annotation.text)
                                if (newText !== null) {
                                  updateAnnotation(annotation.id, { text: newText })
                                }
                              }}
                              className="w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-blue-600 shadow-lg transition-colors"
                              title="Edit annotation (E)"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                if (confirm('Delete this annotation?')) {
                                  deleteAnnotation(annotation.id)
                                }
                              }}
                              className="w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 shadow-lg transition-colors"
                              title="Delete annotation (Delete)"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                          
                          {/* Resize handles */}
                          {selectedAnnotation === annotation.id && (
                            <>
                              {/* Top-left resize handle */}
                              <div
                                className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-nw-resize"
                                onMouseDown={(e) => {
                                  e.stopPropagation()
                                  setResizingAnnotation(annotation.id)
                                  
                                  const startX = e.clientX
                                  const startY = e.clientY
                                  const startWidth = annotation.width
                                  const startHeight = annotation.height
                                  const startLeft = annotation.x
                                  const startTop = annotation.y
                                  
                                  const handleMouseMove = (moveEvent: MouseEvent) => {
                                    const deltaX = moveEvent.clientX - startX
                                    const deltaY = moveEvent.clientY - startY
                                    
                                    const newWidth = Math.max(20, startWidth - deltaX)
                                    const newHeight = Math.max(20, startHeight - deltaY)
                                    const newX = startLeft + deltaX
                                    const newY = startTop + deltaY
                                    
                                    updateAnnotation(annotation.id, {
                                      width: newWidth,
                                      height: newHeight,
                                      x: Math.max(0, newX),
                                      y: Math.max(0, newY)
                                    })
                                  }
                                  
                                  const handleMouseUp = () => {
                                    setResizingAnnotation(null)
                                    document.removeEventListener('mousemove', handleMouseMove)
                                    document.removeEventListener('mouseup', handleMouseUp)
                                  }
                                  
                                  document.addEventListener('mousemove', handleMouseMove)
                                  document.addEventListener('mouseup', handleMouseUp)
                                }}
                              />
                              
                              {/* Bottom-right resize handle */}
                              <div
                                className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border border-white rounded-full cursor-se-resize"
                                onMouseDown={(e) => {
                                  e.stopPropagation()
                                  setResizingAnnotation(annotation.id)
                                  
                                  const startX = e.clientX
                                  const startY = e.clientY
                                  const startWidth = annotation.width
                                  const startHeight = annotation.height
                                  
                                  const handleMouseMove = (moveEvent: MouseEvent) => {
                                    const deltaX = moveEvent.clientX - startX
                                    const deltaY = moveEvent.clientY - startY
                                    
                                    const newWidth = Math.max(20, startWidth + deltaX)
                                    const newHeight = Math.max(20, startHeight + deltaY)
                                    
                                    updateAnnotation(annotation.id, {
                                      width: newWidth,
                                      height: newHeight
                                    })
                                  }
                                  
                                  const handleMouseUp = () => {
                                    setResizingAnnotation(null)
                                    document.removeEventListener('mousemove', handleMouseMove)
                                    document.removeEventListener('mouseup', handleMouseUp)
                                  }
                                  
                                  document.addEventListener('mousemove', handleMouseMove)
                                  document.addEventListener('mouseup', handleMouseUp)
                                }}
                              />
                            </>
                          )}
                          
                          {/* Drag handle */}
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 bg-gray-600 rounded-full transition-opacity cursor-grab active:cursor-grabbing ${
                            draggedAnnotation === annotation.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          }`}>
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 6h8v2H8V6zm0 4h8v2H8v-2zm0 4h8v2H8v-2z"/>
                              </svg>
                            </div>
                          </div>
                          
                          {/* Drag indicator */}
                          {draggedAnnotation === annotation.id && (
                            <div className="absolute -top-2 -left-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                              </svg>
                            </div>
                          )}
                        </div>
                      ))}
                        </div>
                      )}

                      {/* Video Section */}
                      {currentStepData.video && (
                        <div>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center justify-center">
                              ✅ Video Uploaded Successfully
                              <button
                                onClick={() => updateStep(steps[currentStep].id, { video: '', mediaType: currentStepData.image ? 'image' : 'video' })}
                                className="ml-2 text-red-500 hover:text-red-700 text-xs"
                              >
                                Remove
                              </button>
                            </h4>
                          </div>
                          <div className="relative">
                            <video
                              src={currentStepData.video}
                              controls
                              preload="metadata"
                              className="max-w-full h-auto mx-auto rounded-lg shadow-lg border-2 border-blue-200"
                              style={{ maxHeight: '400px', minHeight: '200px' }}
                              onLoadStart={() => console.log('Video loading started')}
                              onCanPlay={() => console.log('Video can play')}
                              onError={(e) => {
                                console.error('Video load error:', e)
                                toast.error('Error loading video')
                              }}
                            >
                              Your browser does not support the video tag.
                            </video>
                            <div className="mt-2 text-xs text-gray-500 text-center">
                              🎥 Video is ready to play
                            </div>
                            <div className="mt-1 text-xs text-gray-400 text-center">
                              Video URL: {currentStepData.video.substring(0, 50)}...
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-4">Upload media for this step</p>
                      
                      <div className="flex flex-col sm:flex-row gap-3 mb-4">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="btn-primary flex-1 flex items-center justify-center"
                        >
                          <Upload size={16} className="mr-2" />
                          📸 Upload Image
                        </button>
                        
                        <button
                          onClick={() => {
                            const videoInput = document.createElement('input')
                            videoInput.type = 'file'
                            videoInput.accept = 'video/*'
                            videoInput.onchange = handleVideoUpload
                            videoInput.click()
                          }}
                          className="btn-secondary flex-1 flex items-center justify-center"
                        >
                          <Upload size={16} className="mr-2" />
                          🎥 Upload Video
                        </button>
                      </div>
                      
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h5 className="text-sm font-semibold text-blue-900 mb-3">📋 Media Upload Guide:</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-blue-800">
                          <div>
                            <h6 className="font-semibold mb-1">📸 Images:</h6>
                            <ul className="space-y-1">
                              <li>• Screenshots & diagrams</li>
                              <li>• Photos & illustrations</li>
                              <li>• PNG, JPG, GIF formats</li>
                            </ul>
                          </div>
                          <div>
                            <h6 className="font-semibold mb-1">🎥 Videos:</h6>
                            <ul className="space-y-1">
                              <li>• Screen recordings</li>
                              <li>• Demo videos</li>
                              <li>• MP4, WebM formats</li>
                            </ul>
                          </div>
                        </div>
                        <div className="mt-3 p-2 bg-blue-100 rounded text-xs text-blue-900">
                          💡 <strong>Tip:</strong> You can upload both image and video for the same step!
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Debug Info */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs">
                    <h5 className="font-semibold mb-2">Debug Info:</h5>
                    <div>Current Step: {currentStep}</div>
                    <div>Has Image: {currentStepData.image ? 'Yes' : 'No'}</div>
                    <div>Has Video: {currentStepData.video ? 'Yes' : 'No'}</div>
                    <div>Media Type: {currentStepData.mediaType}</div>
                    <div>Step ID: {currentStepData.id}</div>
                    <div>Total Steps: {steps.length}</div>
                    {currentStepData.video && (
                      <div>Video URL Length: {currentStepData.video.length}</div>
                    )}
                    
                    <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded">
                      <strong>Current Step Data:</strong>
                      <pre className="mt-1 text-xs overflow-auto max-h-20">
                        {JSON.stringify(currentStepData, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Professional Annotation Tools */}
                {(currentStepData.image || currentStepData.video) && (
                  <div className="mt-8">
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-1">Annotation Tools</h4>
                          <p className="text-sm text-gray-600">Add interactive annotations to highlight key areas</p>
                        </div>
                        {pendingAnnotationType && (
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                              <span className="text-sm font-medium text-blue-700">
                                {pendingAnnotationType.charAt(0).toUpperCase() + pendingAnnotationType.slice(1)} Mode
                              </span>
                            </div>
                            <button
                              onClick={() => setPendingAnnotationType(null)}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Professional Annotation Buttons */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                        <button
                          onClick={() => setPendingAnnotationType('highlight')}
                          className={`group relative p-4 rounded-xl border-2 transition-all duration-200 ${
                            pendingAnnotationType === 'highlight'
                              ? 'border-yellow-400 bg-yellow-50 shadow-md ring-2 ring-yellow-200'
                              : 'border-gray-200 bg-white hover:border-yellow-300 hover:bg-yellow-50'
                          }`}
                        >
                          <div className="flex flex-col items-center space-y-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              pendingAnnotationType === 'highlight' ? 'bg-yellow-200' : 'bg-gray-100 group-hover:bg-yellow-200'
                            } transition-colors`}>
                              <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </div>
                            <span className={`text-sm font-medium ${
                              pendingAnnotationType === 'highlight' ? 'text-yellow-700' : 'text-gray-700'
                            }`}>
                              Highlight
                            </span>
                            <span className="text-xs text-gray-500">Press 1</span>
                          </div>
                        </button>

                        <button
                          onClick={() => setPendingAnnotationType('text')}
                          className={`group relative p-4 rounded-xl border-2 transition-all duration-200 ${
                            pendingAnnotationType === 'text'
                              ? 'border-blue-400 bg-blue-50 shadow-md ring-2 ring-blue-200'
                              : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          <div className="flex flex-col items-center space-y-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              pendingAnnotationType === 'text' ? 'bg-blue-200' : 'bg-gray-100 group-hover:bg-blue-200'
                            } transition-colors`}>
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                              </svg>
                            </div>
                            <span className={`text-sm font-medium ${
                              pendingAnnotationType === 'text' ? 'text-blue-700' : 'text-gray-700'
                            }`}>
                              Text Note
                            </span>
                            <span className="text-xs text-gray-500">Press 2</span>
                          </div>
                        </button>

                        <button
                          onClick={() => setPendingAnnotationType('arrow')}
                          className={`group relative p-4 rounded-xl border-2 transition-all duration-200 ${
                            pendingAnnotationType === 'arrow'
                              ? 'border-green-400 bg-green-50 shadow-md ring-2 ring-green-200'
                              : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50'
                          }`}
                        >
                          <div className="flex flex-col items-center space-y-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              pendingAnnotationType === 'arrow' ? 'bg-green-200' : 'bg-gray-100 group-hover:bg-green-200'
                            } transition-colors`}>
                              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                              </svg>
                            </div>
                            <span className={`text-sm font-medium ${
                              pendingAnnotationType === 'arrow' ? 'text-green-700' : 'text-gray-700'
                            }`}>
                              Arrow
                            </span>
                            <span className="text-xs text-gray-500">Press 3</span>
                          </div>
                        </button>

                        <button
                          onClick={() => setPendingAnnotationType('circle')}
                          className={`group relative p-4 rounded-xl border-2 transition-all duration-200 ${
                            pendingAnnotationType === 'circle'
                              ? 'border-purple-400 bg-purple-50 shadow-md ring-2 ring-purple-200'
                              : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50'
                          }`}
                        >
                          <div className="flex flex-col items-center space-y-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              pendingAnnotationType === 'circle' ? 'bg-purple-200' : 'bg-gray-100 group-hover:bg-purple-200'
                            } transition-colors`}>
                              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" strokeWidth={2} />
                              </svg>
                            </div>
                            <span className={`text-sm font-medium ${
                              pendingAnnotationType === 'circle' ? 'text-purple-700' : 'text-gray-700'
                            }`}>
                              Circle
                            </span>
                            <span className="text-xs text-gray-500">Press 4</span>
                          </div>
                        </button>
                      </div>

                      {/* Instructions */}
                      {pendingAnnotationType ? (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div>
                              <h5 className="text-sm font-medium text-blue-800 mb-1">
                                {pendingAnnotationType.charAt(0).toUpperCase() + pendingAnnotationType.slice(1)} Mode Active
                              </h5>
                              <p className="text-sm text-blue-700">
                                Click anywhere on the image to place your {pendingAnnotationType}. 
                                You can drag annotations to reposition them after placement.
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              <svg className="w-5 h-5 text-gray-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                            </div>
                            <div className="flex-1">
                              <h5 className="text-sm font-medium text-gray-800 mb-1">How to Add Annotations</h5>
                              <ul className="text-sm text-gray-700 space-y-1">
                                <li>• <strong>Click buttons</strong> or press <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">1-4</kbd> to select annotation type</li>
                                <li>• <strong>Click on image</strong> to place annotation</li>
                                <li>• <strong>Drag annotations</strong> to reposition them</li>
                                <li>• <strong>Click annotations</strong> to select and edit them</li>
                                <li>• <strong>Resize handles</strong> appear when annotation is selected</li>
                                <li>• Press <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Delete</kbd> to remove selected annotation</li>
                                <li>• Press <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Esc</kbd> to clear selection</li>
                              </ul>
                            </div>
                            <div className="flex-shrink-0">
                              <button
                                onClick={() => {
                                  const testAnnotation: Annotation = {
                                    id: Date.now().toString(),
                                    type: 'highlight',
                                    x: 100,
                                    y: 100,
                                    width: 120,
                                    height: 40,
                                    text: 'Test Annotation - Try dragging me!',
                                    color: '#fbbf24'
                                  }
                                  updateStep(steps[currentStep].id, {
                                    annotations: [...steps[currentStep].annotations, testAnnotation]
                                  })
                                  toast.success('Test annotation added! Try dragging it around.')
                                }}
                                className="text-xs bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                Add Test Annotation
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
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

            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">📹 Screen Recording</h4>
              <p className="text-sm text-blue-800">
                Current Step: <strong>Step {currentStep + 1}</strong> - "{steps[currentStep]?.title || 'Untitled'}"
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Recordings will be added to this step automatically
              </p>
              {isProcessingRecording && (
                <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-xs text-yellow-800">
                  ⏳ Processing recording...
                </div>
              )}
              <button
                onClick={() => {
                  const testVideoUrl = 'data:video/mp4;base64,test'
                  const currentStepData = steps[currentStep]
                  console.log('=== TEST ADD VIDEO CLICKED ===')
                  console.log('Current step data:', currentStepData)
                  console.log('Current step index:', currentStep)
                  
                  if (currentStepData) {
                    console.log('Calling updateStep with:', currentStepData.id, { 
                      video: testVideoUrl,
                      mediaType: currentStepData.image ? 'both' : 'video'
                    })
                    updateStep(currentStepData.id, { 
                      video: testVideoUrl,
                      mediaType: currentStepData.image ? 'both' : 'video'
                    })
                    toast.success('Test video added to current step!')
                  } else {
                    console.error('No current step found')
                    toast.error('No current step found')
                  }
                }}
                className="mt-2 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
              >
                Test Add Video
              </button>
            </div>

            <ScreenRecorder 
              onRecordingComplete={(blob) => {
                console.log('Screen recording completed, blob size:', blob.size)
                console.log('Current step:', currentStep)
                console.log('Steps array:', steps)
                
                setIsProcessingRecording(true)
                toast.success('Processing recording...')
                
                // Convert blob to data URL and add to current step
                const reader = new FileReader()
                reader.onload = () => {
                  const dataUrl = reader.result as string
                  const currentStepData = steps[currentStep]
                  console.log('Current step data:', currentStepData)
                  console.log('Data URL length:', dataUrl.length)
                  
                  if (currentStepData) {
                    updateStep(currentStepData.id, { 
                      video: dataUrl,
                      mediaType: currentStepData.image ? 'both' : 'video'
                    })
                    console.log('Updated step with video')
                    toast.success('Screen recording added to current step!')
                  } else {
                    console.error('No current step data found')
                    toast.error('Please select a step first')
                  }
                  setIsProcessingRecording(false)
                }
                reader.onerror = (error) => {
                  console.error('FileReader error:', error)
                  toast.error('Error processing recording')
                  setIsProcessingRecording(false)
                }
                reader.readAsDataURL(blob)
              }}
              onScreenshotComplete={(blob) => {
                // Convert blob to data URL and add to current step
                const reader = new FileReader()
                reader.onload = () => {
                  const dataUrl = reader.result as string
                  const currentStepData = steps[currentStep]
                  if (currentStepData) {
                    updateStep(currentStepData.id, { 
                      image: dataUrl,
                      mediaType: currentStepData.video ? 'both' : 'image'
                    })
                    toast.success('Screenshot added to current step!')
                  } else {
                    toast.error('Please select a step first')
                  }
                }
                reader.readAsDataURL(blob)
              }}
            />
          </div>
  )
}

