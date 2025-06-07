'use client'

import React, { useState } from 'react'
import { User, Lock, Globe, Camera, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ProfileSettingsPage() {
  const [settings, setSettings] = useState({
    username: '',
    password: '',
    language: 'English',
    profilePicture: '',
  })

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target

    if (type === 'file') {
      // For file input, save the file object or URL (for demo, just name)
      setSettings((prev) => ({
        ...prev,
        [name]: files[0] ? URL.createObjectURL(files[0]) : '',
      }))
    } else {
      setSettings((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Profile Settings:', settings)
    alert('Profile settings saved!')
  }

  return (
    <div className="max-w-xl mx-auto p-8 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">
        Profile Settings
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Username */}
        <div>
          <label htmlFor="username" className="block mb-1 font-medium text-gray-700">
            Username
          </label>
          <div className="relative">
            <input
              type="text"
              id="username"
              name="username"
              value={settings.username}
              onChange={handleInputChange}
              placeholder="Choose a username"
              required
              className="w-full px-4 py-2 pl-10 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <User className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block mb-1 font-medium text-gray-700">
            Password
          </label>
          <div className="relative">
            <input
              type="password"
              id="password"
              name="password"
              value={settings.password}
              onChange={handleInputChange}
              placeholder="Enter a secure password"
              required
              className="w-full px-4 py-2 pl-10 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>

        {/* Language */}
        <div>
          <label htmlFor="language" className="block mb-1 font-medium text-gray-700">
            Preferred Language
          </label>
          <div className="relative">
            <select
              id="language"
              name="language"
              value={settings.language}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
            </select>
            <Globe className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>

        {/* Profile Picture */}
        <div>
          <label htmlFor="profilePicture" className="block mb-1 font-medium text-gray-700">
            Profile Picture
          </label>
          <input
            type="file"
            id="profilePicture"
            name="profilePicture"
            accept="image/*"
            onChange={handleInputChange}
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
          {settings.profilePicture && (
            <img
              src={settings.profilePicture}
              alt="Profile Preview"
              className="mt-4 w-32 h-32 object-cover rounded-full border"
            />
          )}
        </div>

        {/* Save Button */}
        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
        >
          <Save size={18} />
          Save Profile
        </Button>
      </form>
    </div>
  )
}
