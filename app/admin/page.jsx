'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminVendorTable from '@/components/AdminVendorTable'
import ComplaintHistoryPage from '@/components/ComplaintHistory'
import { getUserByEmail, getAllVendors, updateVendorStatus } from '@/utils/db/actions'

export default function AdminPage() {
  const [vendors, setVendors] = useState([])
  const [complaints, setComplaints] = useState([]) // Can populate this later
  const [isAuthorized, setIsAuthorized] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const checkAdmin = async () => {
      const email = localStorage.getItem('userEmail')
      if (!email) {
        router.push('/')
        return
      }

      const user = await getUserByEmail(email)
      if (user?.role === 'admin') {
        setIsAuthorized(true)
        fetchVendors()
      } else {
        setIsAuthorized(false)
      }
    }

    const fetchVendors = async () => {
      const result = await getAllVendors()
      setVendors(result || [])
    }

    checkAdmin()
  }, [])

  const handleStatusToggle = async (vendorId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    const success = await updateVendorStatus(vendorId, newStatus)
    if (success) {
      setVendors(prev =>
        prev.map(v =>
          v.id === vendorId ? { ...v, status: newStatus } : v
        )
      )
    }
  }

  if (isAuthorized === null) {
    return <div className="p-4">Checking admin access...</div>
  }

  if (!isAuthorized) {
    return <div className="p-6 text-red-500">Unauthorized access.</div>
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-12">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Vendor Management</h2>
        <AdminVendorTable vendors={vendors} onToggleStatus={handleStatusToggle} />
      </section>

      <section>
        <ComplaintHistoryPage complaints={complaints} />
      </section>
    </div>
  )
}
