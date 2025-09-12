'use client'

import { useState, useRef } from 'react'
import { Play, Square, Download, Camera } from 'lucide-react'
import toast from 'react-hot-toast'

interface ScreenRecorderProps {
  onRecordingComplete: (blob: Blob) => void
  onScreenshotComplete?: (blob: Blob) => void
}

export default function ScreenRecorder({ onRecordingComplete, onScreenshotComplete }: ScreenRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startRecording = async () => {
    try {
      // Request screen capture
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      })

      streamRef.current = stream
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      })

      const chunks: BlobPart[] = []
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data)
        }
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' })
        console.log('MediaRecorder stopped, blob created:', blob.size, 'bytes')
        setRecordedBlob(blob)
        console.log('Calling onRecordingComplete callback')
        onRecordingComplete(blob)
        toast.success('Recording completed!')
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      toast.success('Recording started!')

      // Handle when user stops sharing screen
      stream.getVideoTracks()[0].onended = () => {
        stopRecording()
      }

    } catch (error) {
      console.error('Error starting recording:', error)
      toast.error('Failed to start recording. Please check permissions.')
    }
  }

  const stopRecording = () => {
    console.log('stopRecording called, isRecording:', isRecording)
    if (mediaRecorderRef.current && isRecording) {
      console.log('Stopping MediaRecorder')
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
    } else {
      console.log('Cannot stop recording - no active recorder or not recording')
    }
  }

  const downloadRecording = () => {
    if (recordedBlob) {
      const url = URL.createObjectURL(recordedBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `screen-recording-${Date.now()}.webm`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const captureScreenshot = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: 'screen' }
      })

      const video = document.createElement('video')
      video.srcObject = stream
      video.play()

      video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(video, 0, 0)
          
          canvas.toBlob((blob) => {
            if (blob) {
              // Call the callback to add screenshot to current step
              if (onScreenshotComplete) {
                onScreenshotComplete(blob)
              }
              
              // Also provide download option
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `screenshot-${Date.now()}.png`
              document.body.appendChild(a)
              a.click()
              document.body.removeChild(a)
              URL.revokeObjectURL(url)
              toast.success('Screenshot captured and added to current step!')
            }
          }, 'image/png')
        }

        // Stop the stream
        stream.getTracks().forEach(track => track.stop())
      }

    } catch (error) {
      console.error('Error capturing screenshot:', error)
      toast.error('Failed to capture screenshot. Please check permissions.')
    }
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold mb-4">Screen Recording</h3>
      
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg font-medium transition-all ${
              isRecording 
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg' 
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {isRecording ? (
              <>
                <Square size={18} className="mr-2" />
                Stop Recording
              </>
            ) : (
              <>
                <Play size={18} className="mr-2" />
                Start Recording
              </>
            )}
          </button>

          <button
            onClick={captureScreenshot}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg transition-all flex items-center justify-center shadow-lg hover:shadow-xl"
          >
            <Camera size={18} className="mr-2" />
            Take Screenshot
          </button>
        </div>

        {recordedBlob && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="mb-3">
              <h4 className="text-sm font-medium text-green-800 mb-2 flex items-center">
                ✅ Recording Completed Successfully
              </h4>
              <p className="text-sm text-green-700 mb-3">
                Size: {Math.round(recordedBlob.size / 1024 / 1024)} MB
              </p>
            </div>
            
            {/* Video Preview */}
            <div className="mb-4">
              <video
                src={URL.createObjectURL(recordedBlob)}
                controls
                className="w-full h-auto rounded-lg shadow-lg border-2 border-green-200"
                style={{ maxHeight: '300px' }}
              >
                Your browser does not support the video tag.
              </video>
              <div className="mt-2 text-xs text-green-600 text-center">
                🎥 Preview of your screen recording
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={downloadRecording}
                className="btn-secondary flex items-center justify-center flex-1"
              >
                <Download size={16} className="mr-2" />
                Download Recording
              </button>
            </div>
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">📋 How to use:</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• <strong>Start Recording:</strong> Captures your entire screen with audio</p>
            <p>• <strong>Take Screenshot:</strong> Quick image capture of your screen</p>
            <p>• <strong>Auto-Add:</strong> Recordings and screenshots are automatically added to the current step</p>
            <p>• <strong>Permissions:</strong> Browser will ask for screen sharing access</p>
            <p>• <strong>Download:</strong> You can also download recordings separately</p>
          </div>
          
          <div className="mt-3 pt-3 border-t border-blue-200">
            <button
              onClick={() => {
                console.log('=== TEST CALLBACK CLICKED ===')
                console.log('Testing callback with fake blob')
                const fakeBlob = new Blob(['test'], { type: 'video/webm' })
                console.log('Fake blob created:', fakeBlob.size, 'bytes')
                console.log('Calling onRecordingComplete...')
                onRecordingComplete(fakeBlob)
                console.log('onRecordingComplete called successfully')
                toast.success('Test callback triggered!')
              }}
              className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
            >
              Test Callback
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

