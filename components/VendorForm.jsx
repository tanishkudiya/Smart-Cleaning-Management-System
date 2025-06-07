'use client'
import { useState, useEffect } from 'react'

export default function VendorForm({ onSubmit, initialData }) {
  const [form, setForm] = useState({ name: '', company: '', status: 'active' })

  useEffect(() => {
    if (initialData) setForm(initialData)
  }, [initialData])

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name || !form.company) return alert('Fill all fields')
    onSubmit(form)
    setForm({ name: '', company: '', status: 'active' })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-1 font-medium">Name</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Company</label>
        <input
          name="company"
          value={form.company}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Status</label>
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        {initialData ? 'Update Vendor' : 'Add Vendor'}
      </button>
    </form>
  )
}
