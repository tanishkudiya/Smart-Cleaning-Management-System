"use client";

import React, { useState, useEffect } from "react";
import { User, Mail, BadgeCheck, Save, Camera } from "lucide-react";
import { Button } from "@/components/ui/button"; // Adjust if needed

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "",
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  useEffect(() => {
    // Simulate fetching user data
    const userData = {
      name: "Tanishq Udiya",
      email: "tanishq@example.com",
      role: "staff", // or "user"
    };
    setProfile(userData);
  }, []);

  // Handle photo change and preview
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Handle profile update including photo upload
    console.log("Profile:", profile);
    console.log("Photo:", photo);
    alert("Profile updated successfully!");
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white shadow rounded-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Profile Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo Upload */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Profile Photo</label>
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center text-gray-400">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12" />
              )}
            </div>

            <label
              htmlFor="photo-upload"
              className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Camera size={18} />
              Change Photo
            </label>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Name (readonly) */}
        <div>
          <label htmlFor="name" className="block text-gray-700 font-medium mb-1">
            Full Name
          </label>
          <div className="relative">
            <input
              type="text"
              id="name"
              name="name"
              value={profile.name}
              readOnly
              className="w-full px-4 py-2 pl-10 bg-gray-100 border rounded-md cursor-not-allowed"
            />
            <User className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>

        {/* Email (readonly) */}
        <div>
          <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              id="email"
              name="email"
              value={profile.email}
              readOnly
              className="w-full px-4 py-2 pl-10 bg-gray-100 border rounded-md cursor-not-allowed"
            />
            <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>

        {/* Role (readonly) */}
        <div>
          <label htmlFor="role" className="block text-gray-700 font-medium mb-1">
            Role
          </label>
          <div className="relative">
            <input
              type="text"
              id="role"
              name="role"
              value={profile.role}
              readOnly
              className="w-full px-4 py-2 pl-10 bg-gray-100 border rounded-md cursor-not-allowed"
            />
            <BadgeCheck className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>

        {/* Save Button */}
        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
        >
          <Save size={18} />
          Save Changes
        </Button>
      </form>
    </div>
  );
}
