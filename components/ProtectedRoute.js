'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ProtectedRoute({ children, allowedRoles }) {
  const router = useRouter()

  useEffect(() => {
    const email = localStorage.getItem('userEmail')
    const role = localStorage.getItem('userRole')

    if (!email || !allowedRoles.includes(role)) {
      router.replace('/')
    }
  }, [router, allowedRoles])

  return children
}
