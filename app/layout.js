"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/footer";
import Script from "next/script";
import { getUserByEmail } from "@/utils/db/actions";
import { getAvailableRewards } from "@/utils/db/actions";


const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState(0)

   useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      console.log('User ID from localStorage:', userId);
    }
  }, []);

  useEffect(() => {
    const fetchTotalEarnings = async () => {
      try {
        const userEmail = localStorage.getItem('userEmail')
        if (userEmail) {
          const user = await getUserByEmail(userEmail)
          console.log('user from layout', user)

          if (user) {
            const availableRewards = await getAvailableRewards(user.id)
            console.log('availableRewards from layout', availableRewards)
            setTotalEarnings(availableRewards)
          }
        }
      } catch (error) {
        console.error('Error fetching total earnings:', error)
      }
    }

    fetchTotalEarnings()
  }, [])

  return (
    <html lang="en">
      <head><Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
          strategy="beforeInteractive"
        /></head>
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          {/* Header */}
          <Header onMenuClick={() => setSidebarOpen((prev) => !prev)} />

          {/* Content Section */}
          <div className="flex flex-1">
            {/* Sidebar */}
            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}/>

            {/* Main Content + Footer */}
            <div className="flex flex-col flex-1 min-h-screen ml-0 lg:ml-64">
              <main className="flex-1 min-h-screen p-4 lg:p-8">{children}</main>
              <Footer />
            </div>
          </div>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
