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
  const router = useRouter()

  // Load Vendor Info + Staff + Unassigned Complaints
  useEffect(() => {
    async function fetchVendorData() {
      const email = localStorage.getItem('userEmail')
      if (!email) {
        router.push('/')
        return
      }

      const user = await getUserByEmail(email)
      if (!user || user.role !== 'vendor') {
        router.push('/')
        return
      }

      const vendorData = await getVendorByUserId(user.id)
      if (!vendorData || vendorData.status !== 'active') {
        router.push('/')
        return
      }

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

  // Add New Staff
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

  // Delete Staff
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
            <div className="flex space-x-4 items-center flex-wrap gap-y-2">
              <select
                value={selectedStaffId}
                onChange={e => setSelectedStaffId(e.target.value)}
                className="border px-3 py-2 rounded"
              >
                <option value="">Select Staff</option>
                {staffList.map(staff => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name} ({staff.email})
                  </option>
                ))}
              </select>
              <select
                value={selectedComplaintId}
                onChange={e => setSelectedComplaintId(e.target.value)}
                className="border px-3 py-2 rounded"
              >
                <option value="">Select Complaint</option>
                {pendingComplaints.map(complaint => (
                  <option key={complaint.id} value={complaint.id}>
                    {complaint.amount} - {complaint.location}
                  </option>
                ))}
              </select>

              <button
                // onClick={handleAssignTask}
                className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
              >
                Assign
              </button>
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
                    <td className="px-4 py-2 border">{staff.name}</td>
                    <td className="px-4 py-2 border">{staff.email}</td>
                    <td className="px-4 py-2 border">{staff.phone || '-'}</td>
                    <td className="px-4 py-2 border">
                      {staff.created_at
                        ? new Date(staff.created_at).toLocaleString()
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
      </div>
    </div>
  )
}
