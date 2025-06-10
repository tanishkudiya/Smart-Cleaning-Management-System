'use client';

import { useEffect, useState } from 'react';
import { getCompletedTasksByUserId } from '@/utils/db/actions';

export default function CompletedTasksPage() {
  const [userId, setUserId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = localStorage.getItem('userId'); // or get from your auth context
    if (id) setUserId(id);
  }, []);

  useEffect(() => {
    if (!userId) return;

    async function fetchTasks() {
      setLoading(true);
      try {
        const data = await getCompletedTasksByUserId(userId);
        setTasks(data);
      } catch (error) {
        console.error('Failed to fetch completed tasks:', error);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, [userId]);

  if (!userId) {
    return <div className="text-center mt-10">User ID not found. Please login again.</div>;
  }

  if (loading) {
    return <div className="text-center mt-10">Loading completed tasks...</div>;
  }

  if (tasks.length === 0) {
    return <div className="text-center mt-10">No completed tasks found for your reports.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Your Completed Tasks</h1>
      <ul className="space-y-4">
        {tasks.map((task) => (
          <li key={task.id} className="p-4 border rounded bg-gray-50">
            <div className="font-semibold">🧾 Waste Type: {task.wasteType}</div>
            <div className="text-sm text-gray-500 mt-1">📍 Location: {task.location}</div>
            <div className="text-sm text-gray-500">🧪 Amount: {task.amount}</div>
            <div className="text-xs text-gray-400 mt-1">
              🕒 Completed At: {new Date(task.updatedAt || task.completedAt).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
