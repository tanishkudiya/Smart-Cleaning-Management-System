'use client'

import { useEffect, useState } from 'react'

// Dummy task data for simulation
const DUMMY_TASKS = [
  {
    id: 'task-1',
    staffEmail: 'staff1@example.com',
    description: 'Clean entrance of Block A',
    deadline: '2025-06-10',
    status: 'pending',
  },
  {
    id: 'task-2',
    staffEmail: 'staff1@example.com',
    description: 'Sanitize washroom near Block C',
    deadline: '2025-06-11',
    status: 'pending',
  },
  {
    id: 'task-3',
    staffEmail: 'staff2@example.com',
    description: 'Inspect cafeteria cleanliness',
    deadline: '2025-06-12',
    status: 'pending',
  },
]

// Simulated Web3Auth function
const mockWeb3Auth = {
  async getUserInfo() {
    return {
      email: 'staff1@example.com', // Simulate a logged-in staff
    }
  },
}

export default function StaffPage() {
  const [userId, setUserId] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  // Simulate user login
  useEffect(() => {
    async function fetchUserInfo() {
      const userInfo = await mockWeb3Auth.getUserInfo()
      if (userInfo?.email) {
        setUserId(userInfo.email)
      }
    }
    fetchUserInfo()
  }, [])

  // Load dummy tasks
  useEffect(() => {
    if (!userId) return
    const filteredTasks = DUMMY_TASKS.filter(task => task.staffEmail === userId)
    setTasks(filteredTasks)
    setLoading(false)
  }, [userId])

  const handleComplete = (taskId) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, status: 'completed' } : task
      )
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Your Assigned Tasks</h1>

      {loading ? (
        <p>Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p>No tasks assigned yet.</p>
      ) : (
        <ul className="space-y-4">
          {tasks.map(task => (
            <li
              key={task.id}
              className="border p-4 rounded shadow flex flex-col md:flex-row justify-between items-start md:items-center"
            >
              <div>
                <p className="font-semibold">Description: {task.description}</p>
                <p className="text-gray-600">Deadline: {task.deadline}</p>
                <p className={`mt-1 text-sm ${task.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                  Status: {task.status}
                </p>
              </div>

              {task.status !== 'completed' && (
                <button
                  onClick={() => handleComplete(task.id)}
                  className="mt-3 md:mt-0 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Mark as Completed
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
