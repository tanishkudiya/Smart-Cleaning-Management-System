'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { getTasksByStaffId } from '@/utils/db/actions' // Backend function

export default function StaffTasksPage() {
  const { staffId } = useParams()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTasks = async () => {
      const data = await getTasksByStaffId(staffId)
      setTasks(data)
      setLoading(false)
    }
    fetchTasks()
  }, [staffId])

  if (loading) return <div>Loading tasks...</div>

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Your Tasks</h1>
      {tasks.length === 0 ? (
        <p>No tasks assigned yet.</p>
      ) : (
        <ul className="space-y-4">
          {tasks.map(task => (
            <li key={task.id} className="border p-4 rounded shadow">
              <p>{task.description}</p>
              <p className="text-sm text-gray-500">Assigned on: {new Date(task.assigned_at).toLocaleString()}</p>
              <p className="text-sm font-semibold">{task.status}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
