'use client'
import { useState, useEffect } from 'react'
import {
  Trash2, MapPin, CheckCircle, Clock, Upload, Loader, Calendar, Weight, Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'react-hot-toast'
import {
  getWasteCollectionTasks,
  updateTaskStatus,
  saveReward,
  saveCollectedWaste,
  getUserByEmail
} from '@/utils/db/actions'
import { GoogleGenerativeAI } from "@google/generative-ai"

const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY

const ITEMS_PER_PAGE = 5

export default function CollectPage() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [hoveredWasteType, setHoveredWasteType] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [user, setUser] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)
  const [verificationImage, setVerificationImage] = useState(null)
  const [verificationStatus, setVerificationStatus] = useState('idle')
  const [verificationResult, setVerificationResult] = useState(null)
  const [reward, setReward] = useState(null)

  useEffect(() => {
    const fetchUserAndTasks = async () => {
      setLoading(true)
      try {
        const userEmail = localStorage.getItem('userEmail')
        if (!userEmail) {
          toast.error('User not logged in. Please log in.')
          setLoading(false)
          return
        }

        const fetchedUser = await getUserByEmail(userEmail)
        if (!fetchedUser) {
          toast.error('User not found. Please log in again.')
          setLoading(false)
          return
        }

        // Check user role
        if (fetchedUser.role !== 'staff') {
          toast.error('Access denied. Only staff can access this page.')
          setLoading(false)
          return
        }

        setUser(fetchedUser)

        const fetchedTasks = await getWasteCollectionTasks()
        setTasks(fetchedTasks)
      } catch (error) {
        console.error('Error fetching user and tasks:', error)
        toast.error('Failed to load user data and tasks. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchUserAndTasks()
  }, [])

  const handleStatusChange = async (taskId, newStatus) => {
    if (!user) {
      toast.error('Please log in to collect waste.')
      return
    }

    try {
      const updatedTask = await updateTaskStatus(taskId, newStatus, user.id)
      if (updatedTask) {
        setTasks(tasks.map(task =>
          task.id === taskId ? { ...task, status: newStatus, collectorId: user.id } : task
        ))
        toast.success('Task status updated successfully')
      } else {
        toast.error('Failed to update task status. Please try again.')
      }
    } catch (error) {
      console.error('Error updating task status:', error)
      toast.error('Failed to update task status. Please try again.')
    }
  }

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setVerificationImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const readFileAsBase64 = (dataUrl) => {
    return dataUrl.split(',')[1]
  }

  const handleVerify = async () => {
    if (!selectedTask || !verificationImage || !user) {
      toast.error('Missing required information for verification.')
      return
    }

    setVerificationStatus('verifying')

    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey)
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

      const base64Data = readFileAsBase64(verificationImage)

      const imageParts = [
        {
          inlineData: {
            data: base64Data,
            mimeType: 'image/jpeg',
          },
        },
      ]

      const prompt = `You are an expert in waste management and recycling. Analyze this image and provide:
1. Confirm if the waste type matches: ${selectedTask.wasteType}
2. Estimate if the quantity matches: ${selectedTask.amount}
3. Your confidence level in this assessment (as a percentage)

Respond in JSON format like this (no markdown formatting):
{
  "wasteTypeMatch": true/false,
  "quantityMatch": true/false,
  "confidence": confidence level as a number between 0 and 1
}`

      const result = await model.generateContent([prompt, ...imageParts])
      const response = await result.response
      const rawText = await response.text()

      const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim()

      try {
        const parsedResult = JSON.parse(cleanText)
        setVerificationResult(parsedResult)
        setVerificationStatus('success')

        if (parsedResult.wasteTypeMatch && parsedResult.quantityMatch && parsedResult.confidence > 0.7) {
          await handleStatusChange(selectedTask.id, 'verified')
          const earnedReward = Math.floor(Math.random() * 50) + 10

          await saveReward(user.id, earnedReward)
          await saveCollectedWaste(selectedTask.id, user.id, parsedResult)

          setReward(earnedReward)
          toast.success(`Verification successful! You earned ${earnedReward} tokens!`, {
            duration: 5000,
            position: 'top-center',
          })
        } else {
          toast.error('Verification failed. The collected waste does not match the reported waste.', {
            duration: 5000,
            position: 'top-center',
          })
        }
      } catch (error) {
        console.error('Failed to parse JSON response:', cleanText)
        setVerificationStatus('failure')
      }
    } catch (error) {
      console.error('Error verifying waste:', error)
      setVerificationStatus('failure')
    }
  }

  const filteredTasks = tasks.filter(task =>
    task.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const pageCount = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE)
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">Waste Collection Tasks</h1>

      <div className="mb-4 flex items-center">
        <Input
          type="text"
          placeholder="Search by area..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mr-2"
        />
        <Button variant="outline" size="icon">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="animate-spin h-8 w-8 text-gray-500" />
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedTasks.map(task => (
              <div key={task.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-medium text-gray-800 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-gray-500" />
                    {task.location}
                  </h2>
                  <StatusBadge status={task.status} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm text-gray-600 mb-3">
                  <div className="flex items-center relative">
                    <Trash2 className="w-4 h-4 mr-2 text-gray-500" />
                    <span
                      onMouseEnter={() => setHoveredWasteType(task.wasteType)}
                      onMouseLeave={() => setHoveredWasteType(null)}
                      className="cursor-pointer"
                    >
                      {task.wasteType.length > 8 ? `${task.wasteType.slice(0, 8)}...` : task.wasteType}
                    </span>
                    {hoveredWasteType === task.wasteType && (
                      <div className="absolute left-0 top-full mt-1 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                        {task.wasteType}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center">
                    <Weight className="w-4 h-4 mr-2 text-gray-500" />
                    {task.amount}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                    {task.date}
                  </div>
                </div>
                <div className="flex justify-end">
                  {task.status === 'pending' && (
                    <Button onClick={() => handleStatusChange(task.id, 'in_progress')} variant="outline" size="sm">
                      Start Collection
                    </Button>
                  )}
                  {task.status === 'in_progress' && task.collectorId === user?.id && (
                    <Button onClick={() => setSelectedTask(task)} variant="outline" size="sm">
                      Complete & Verify
                    </Button>
                  )}
                  {task.status === 'in_progress' && task.collectorId !== user?.id && (
                    <span className="text-yellow-600 text-sm font-medium">In progress by another collector</span>
                  )}
                  {task.status === 'verified' && (
                    <span className="text-green-600 text-sm font-medium">Reward Earned</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-center">
            <Button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="mr-2"
            >
              Previous
            </Button>
            <span className="mx-2 self-center">
              Page {currentPage} of {pageCount}
            </span>
            <Button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageCount))}
              disabled={currentPage === pageCount}
              className="ml-2"
            >
              Next
            </Button>
          </div>
        </>
      )}

      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Verify Collection</h3>
            <p className="mb-4 text-sm text-gray-600">Upload a photo of the collected waste to verify and earn your reward.</p>
            <div className="mb-4">
              <label htmlFor="verification-image" className="block text-sm font-medium text-gray-700 mb-2">
                Upload Image
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="verification-image"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="verification-image"
                        name="verification-image"
                        type="file"
                        className="sr-only"
                        onChange={handleImageUpload}
                        accept="image/*"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>

            {verificationImage && (
              <div className="mb-4">
                <img src={verificationImage} alt="Uploaded verification" className="max-h-64 mx-auto rounded-md" />
              </div>
            )}

            {verificationStatus === 'verifying' && (
              <div className="mb-4 text-center text-gray-600 flex justify-center items-center">
                <Loader className="animate-spin mr-2" /> Verifying...
              </div>
            )}

            {verificationStatus === 'success' && verificationResult && (
              <div className="mb-4 text-green-700 bg-green-100 p-3 rounded">
                Verification successful! Confidence: {(verificationResult.confidence * 100).toFixed(1)}%
              </div>
            )}

            {verificationStatus === 'failure' && (
              <div className="mb-4 text-red-700 bg-red-100 p-3 rounded">
                Verification failed. Please try again.
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setSelectedTask(null)
                setVerificationImage(null)
                setVerificationStatus('idle')
                setVerificationResult(null)
                setReward(null)
              }}>
                Cancel
              </Button>
              <Button
                disabled={!verificationImage || verificationStatus === 'verifying'}
                onClick={handleVerify}
              >
                Verify & Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }) {
  const statusConfig = {
    pending: { color: 'bg-gray-100 text-gray-800', text: 'Pending' },
    in_progress: { color: 'bg-yellow-100 text-yellow-800', text: 'In Progress' },
    verified: { color: 'bg-green-100 text-green-800', text: 'Verified' },
  }

  const config = statusConfig[status] || { color: 'bg-gray-200 text-gray-600', text: status }

  return (
    <span
      className={`px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}
    >
      {config.text}
    </span>
  )
}
