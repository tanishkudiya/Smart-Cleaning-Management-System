'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  getAllStaff,
  getUserByEmail,
  getVendorByUserId,
  createStaff,
  deleteStaff,
  getPendingComplaints,
  assignTaskToStaff
} from '@/utils/db/actions'

export default function VendorPage() {
  const [staffList, setStaffList] = useState([])
  const [pendingComplaints, setPendingComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [vendor, setVendor] = useState(null)
  const [newStaff, setNewStaff] = useState({ name: '', email: '', phone: '' })
  const [selectedStaffId, setSelectedStaffId] = useState('')
  const [selectedComplaintId, setSelectedComplaintId] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [modalComplaint, setModalComplaint] = useState(null)
  const router = useRouter()

  const handleAssignTask = async () => {
    if (!selectedStaffId || !selectedComplaintId) {
      alert('Please select both staff and complaint')
      return
    }

    try {
      await assignTaskToStaff({
        staffId: selectedStaffId,
        reportId: selectedComplaintId,
        vendorId: vendor.id,
      })

      setSuccessMessage('Task assigned successfully!')
      setPendingComplaints(prev =>
        prev.filter(c => c.id !== selectedComplaintId)
      )

      setSelectedComplaintId('')
      setSelectedStaffId('')
    } catch (error) {
      console.error(error)
      alert('Failed to assign task')
    }
  }

  useEffect(() => {
    async function fetchVendorData() {
      const email = localStorage.getItem('userEmail')
      if (!email) return router.push('/')

      const user = await getUserByEmail(email)
      if (!user || user.role !== 'vendor') return router.push('/')

      const vendorData = await getVendorByUserId(user.id)
      if (!vendorData || vendorData.status !== 'active') return router.push('/')

      setVendor(vendorData)

      const allStaff = await getAllStaff()
      const staffForVendor = allStaff.filter(s => s.vendor_id === vendorData.id)
      setStaffList(staffForVendor)

      const unassignedComplaints = await getPendingComplaints()
      setPendingComplaints(unassignedComplaints)

      setLoading(false)
    }

    fetchVendorData()
  }, [router])

  const handleStaffSubmit = async e => {
    e.preventDefault()
    if (staffList.some(s => s.email === newStaff.email)) {
      alert('Staff with this email already exists.')
      return
    }

    const createdStaff = {
      ...newStaff,
      role: 'staff',
      vendor_id: vendor.id,
    }

    try {
      const result = await createStaff(createdStaff)
      setStaffList(prev => [
        ...prev,
        { ...createdStaff, id: result.id, created_at: new Date().toISOString() },
      ])
      setNewStaff({ name: '', email: '', phone: '' })
      alert('Staff onboarded successfully')
    } catch (err) {
      console.error(err)
      alert('Failed to onboard staff')
    }
  }

  const handleDeleteStaff = async id => {
    try {
      await deleteStaff(id)
      setStaffList(prev => prev.filter(s => s.id !== id))
      alert('Staff deleted successfully')
    } catch (err) {
      console.error(err)
      alert('Failed to delete staff')
    }
  }

  if (loading) return <div className="p-6">Loading vendor dashboard...</div>

  return (
    <div className="flex justify-center px-4 py-6">
      <div className="w-full max-w-6xl">
        <h1 className="text-3xl font-bold mb-6 text-center">Manage Your Staff & Tasks</h1>

        {/* Add Staff */}
        <section className="bg-white p-6 border rounded shadow mb-8">
          <h2 className="text-2xl font-semibold mb-4">Add New Staff</h2>
          <form onSubmit={handleStaffSubmit} className="space-y-4">
            {['name', 'email', 'phone'].map(field => (
              <input
                key={field}
                type={field === 'email' ? 'email' : 'text'}
                placeholder={`Staff ${field.charAt(0).toUpperCase() + field.slice(1)}`}
                value={newStaff[field]}
                onChange={e => setNewStaff(prev => ({ ...prev, [field]: e.target.value }))}
                className="w-full border px-3 py-2 rounded"
                required
              />
            ))}
            <button
              type="submit"
              className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700"
            >
              Add Staff
            </button>
          </form>
        </section>

        {/* Assign Task */}
        <section className="bg-white p-6 border rounded shadow mb-8">
          <h2 className="text-2xl font-semibold mb-4">Assign Complaint to Staff</h2>

          {successMessage && <p className="text-green-600 mb-4">{successMessage}</p>}

          {staffList.length === 0 || pendingComplaints.length === 0 ? (
            <p className="text-gray-500">
              {staffList.length === 0
                ? 'No staff available to assign complaints.'
                : 'No pending complaints to assign.'}
            </p>
          ) : (
            <div className="flex flex-col lg:flex-row lg:space-x-4 gap-y-3 items-start">
              <div className="w-full lg:w-1/2">
                <label className="block mb-1 font-medium">Select Staff</label>
                <select
                  value={selectedStaffId}
                  onChange={e => setSelectedStaffId(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value="">Select Staff</option>
                  {staffList.map(staff => (
                    <option key={staff.id} value={staff.id}>
                      {staff.name} ({staff.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full lg:w-1/2">
                <label className="block mb-1 font-medium">Select Complaint</label>
                <select
                  value={selectedComplaintId}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    setSelectedComplaintId(selectedId);
                    const found = pendingComplaints.find(c => c.id === selectedId);
                    setModalComplaint(found);
                  }}
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value="">Select Complaint</option>
                  {pendingComplaints.map(complaint => (
                    <option key={complaint.id} value={complaint.id}>
                      {`ID: ${complaint.id.slice(0, 8)}... | ${complaint.amount} kg`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleAssignTask}
                  className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
                >
                  Assign
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Staff List */}
        <section className="overflow-x-auto">
          <h2 className="text-2xl font-semibold mb-4">Your Staff</h2>
          {staffList.length === 0 ? (
            <p className="text-gray-500">No staff found.</p>
          ) : (
            <table className="w-full min-w-[800px] text-left border rounded overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border">Staff ID</th>
                  <th className="px-4 py-2 border">Name</th>
                  <th className="px-4 py-2 border">Email</th>
                  <th className="px-4 py-2 border">Phone</th>
                  <th className="px-4 py-2 border">Joined</th>
                  <th className="px-4 py-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staffList.map(staff => (
                  <tr key={staff.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 border">
                      {staff.id ? staff.id.slice(-6) : '-'}
                    </td>
                    <td className="px-4 py-2 border">{staff.name}</td>
                    <td className="px-4 py-2 border">{staff.email}</td>
                    <td className="px-4 py-2 border">{staff.phone || '-'}</td>
                    <td className="px-4 py-2 border">
                      {staff.created_at
                        ? new Date(staff.created_at).toLocaleString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          })
                        : '-'}
                    </td>
                    <td className="px-4 py-2 border">
                      <button
                        onClick={() => handleDeleteStaff(staff.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Complaint Modal */}
        {modalComplaint && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded max-w-md w-full mx-4 shadow-lg relative">
              <button
                onClick={() => setModalComplaint(null)}
                className="absolute top-2 right-3 text-gray-500 hover:text-black"
              >
                ✖
              </button>
              <h3 className="text-xl font-semibold mb-3">Complaint Details</h3>
              <p><strong>ID:</strong> {modalComplaint.id}</p>
              <p><strong>Weight:</strong> {modalComplaint.amount}</p>
              <p><strong>Location:</strong> {modalComplaint.location}</p>

              {modalComplaint.image_url ? (
                <img
                  src={modalComplaint.image_url}
                  alt="Complaint Image"
                  className="w-full h-60 object-cover rounded border mt-2"
                />
              ) : (
                <p className="text-gray-500 mt-2">No image available</p>
              )}

              <button
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => setModalComplaint(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
