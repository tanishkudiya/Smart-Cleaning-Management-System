"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white to-gray-100 text-gray-800 p-6">
      <div className="flex flex-col items-center text-center animate-fade-in">
        <div className="bg-red-100 p-4 rounded-full mb-6 shadow">
          <AlertTriangle className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-5xl font-bold mb-4">Page Not Found</h1>
        <p className="text-lg text-gray-600 mb-8 max-w-md">
          Oops! The page you are looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition duration-300 shadow"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
