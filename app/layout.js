"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true); // default true on large screens

  // Optional: sync sidebarOpen state with screen size (so it opens by default on large screens)
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    }

    handleResize(); // initialize on mount
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    console.log("Sidebar Open:", sidebarOpen);
  }, [sidebarOpen]);

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header onMenuClick={() => setSidebarOpen((prev) => !prev)} />

          <div className="flex flex-1 relative">
            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

            <main className="flex-1 p-4 lg:p-8 ml-0 lg:ml-64 transition-all duration-300">
              {children}
            </main>

          </div>
        </div>
        <Toaster />
      </body>
    </html>
  );

}
