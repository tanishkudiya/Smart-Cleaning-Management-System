'use client';

import { useState, useEffect, useCallback } from 'react';
import { getTasksByStaffId, verifyTaskById } from '@/utils/db/actions'; // Make sure you have this backend API to update task status

export default function StaffTasksPage() {
  const [staffId, setStaffId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [verifyingTaskId, setVerifyingTaskId] = useState(null);

  // Load staffId from localStorage once
  useEffect(() => {
    const id = localStorage.getItem('userId');
    if (id) setStaffId(id);
  }, []);

  // Fetch tasks whenever staffId changes
  useEffect(() => {
    if (!staffId) return;

    async function fetchTasks() {
      setLoading(true);
      try {
        const data = await getTasksByStaffId(staffId);
        setTasks(data);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, [staffId]);

  // Verify task - update status on backend and update state locally
  const handleVerifyTask = async (taskId) => {
    if (verifyingTaskId) return; // Prevent multiple clicks
    setVerifyingTaskId(taskId);
    try {
      await verifyTaskById(taskId); // Implement this in your backend utils to mark task completed
      setTasks((prev) =>
        prev.map((task) =>
          task.taskId === taskId ? { ...task, taskStatus: 'completed' } : task
        )
      );
    } catch (err) {
      console.error('Verification failed:', err);
      alert('Could not verify task');
    } finally {
      setVerifyingTaskId(null);
    }
  };

  // Close image preview on ESC key press
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') setPreviewImage(null);
    },
    [setPreviewImage]
  );

  useEffect(() => {
    if (previewImage) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [previewImage, handleKeyDown]);

  if (!staffId)
    return (
      <div className="text-center mt-10">
        Staff ID not found. Please login again.
      </div>
    );

  if (loading)
    return (
      <div className="text-center mt-10">Loading tasks for Staff ID: {staffId}...</div>
    );

  if (tasks.length === 0)
    return (
      <div className="text-center mt-10">No tasks assigned to Staff ID: {staffId}</div>
    );

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Tasks Assigned to Staff</h1>
      <p className="mb-6">Staff ID: {staffId}</p>

      <ul className="space-y-4">
        {tasks.map((task) => (
          <li
            key={task.taskId}
            className="p-4 border rounded hover:shadow bg-gray-50 flex items-start space-x-4"
          >
            {task.imageUrl ? (
              <img
                src={task.imageUrl}
                alt={`Proof image for task ${task.taskId}`}
                className="w-36 h-36 rounded object-cover border flex-shrink-0 cursor-pointer"
                onClick={() => setPreviewImage(task.imageUrl)}
              />
            ) : (
              <div className="w-36 h-36 flex items-center justify-center text-gray-400 italic border rounded flex-shrink-0">
                No image
              </div>
            )}

            <div className="flex flex-col flex-1">
              <div className="font-semibold">🧾 Waste Type: {task.wasteType}</div>
              <div className="text-sm text-gray-500 mt-1">📍 Location: {task.location}</div>
              <div className="text-sm text-gray-500">🧪 Amount: {task.amount}</div>
              <div className="text-xs text-gray-400 mt-1">
                🕒 Assigned At: {new Date(task.assignedAt).toLocaleString()}
              </div>
              <div className="text-xs mt-1">
                <span
                  className={`${
                    task.taskStatus === 'completed'
                      ? 'text-green-600'
                      : 'text-yellow-600'
                  }`}
                >
                  📌 Status: {task.taskStatus}
                </span>
              </div>

              {task.taskStatus === 'assigned' && (
                <button
                  disabled={verifyingTaskId === task.taskId}
                  className={`mt-3 px-4 py-2 rounded text-white transition ${
                    verifyingTaskId === task.taskId
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                  onClick={() => handleVerifyTask(task.taskId)}
                >
                  {verifyingTaskId === task.taskId ? 'Verifying...' : 'Verify'}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* Image preview modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 cursor-pointer"
          role="dialog"
          aria-modal="true"
        >
          <img
            src={previewImage}
            alt="Preview"
            className="max-w-[90vw] max-h-[90vh] rounded shadow-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-5 right-5 text-white text-3xl font-bold"
            aria-label="Close preview"
          >
            &times;
          </button>
        </div>
      )}
    </div>
  );
}
