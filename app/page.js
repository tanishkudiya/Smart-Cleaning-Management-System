// @ts-nocheck
'use client'
import { useState } from 'react'
import {
  ArrowRight, Leaf, Recycle, Users, Coins,
  MapPin, Clock, AlertCircle, Activity, UserCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AnimatedDustbin } from '@/components/AnimatedDustbin'

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [impactData, setImpactData] = useState({
    wasteCollected: 0,
    reportsSubmitted: 0,
    tokensEarned: 0,
    co2Offset: 0
  });

  const login = () => setLoggedIn(true);

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="text-center mb-20 animate-fadeIn">
        {/* <AnimatedGlobe /> */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 text-gray-800 tracking-tight leading-tight">
          Smart Cleaning <span className="text-blue-600">Waste Management</span> System
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
          Join our community in making waste management more efficient and rewarding!
        </p>
        {!loggedIn ? (
          <Button
            onClick={login}
            className="bg-blue-600 hover:bg-blue-700 text-white text-base sm:text-lg py-4 px-8 sm:py-6 sm:px-10 rounded-full font-medium transition-all duration-300 transform hover:scale-105"
          >
            Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        ) : (
          <Link href="/report">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white text-base sm:text-lg py-4 px-8 sm:py-6 sm:px-10 rounded-full font-medium transition-all duration-300 transform hover:scale-105">
              Report Waste <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        )}
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-10 mb-20 animate-slideInUp">
        <FeatureCard icon={Leaf} title="Eco-Friendly" description="Contribute to a cleaner environment by reporting and collecting waste." />
        <FeatureCard icon={Coins} title="Earn Rewards" description="Get tokens for your contributions to waste management efforts." />
        <FeatureCard icon={Users} title="Community-Driven" description="Be part of a growing community committed to sustainable practices." />
      </section>

      {/* Impact Section */}
      <section className="bg-white/80 backdrop-blur-lg p-6 sm:p-10 rounded-3xl shadow-xl mb-20 animate-fadeIn">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-12 text-center text-gray-800">Our Impact</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <ImpactCard title="Waste Collected" value={`${impactData.wasteCollected} kg`} icon={Recycle} />
          <ImpactCard title="Reports Submitted" value={impactData.reportsSubmitted.toString()} icon={MapPin} />
          <ImpactCard title="Tokens Earned" value={impactData.tokensEarned.toString()} icon={Coins} />
          <ImpactCard title="CO2 Offset" value={`${impactData.co2Offset} kg`} icon={Leaf} />
        </div>
      </section>

      {/* How It Works */}
      <section className="mb-20 animate-slideInUp">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-12 text-center text-gray-800">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 text-center">
          <StepCard icon={MapPin} step="Report Waste" description="Submit complaints or reports about waste problems easily through our platform." />
          <StepCard icon={Activity} step="Real-time Monitoring" description="Track cleaning activities and waste collection progress live on the dashboard." />
          <StepCard icon={UserCheck} step="Efficient Resolution" description="Cleaning staff get assigned tasks, ensuring quick resolution and a cleaner environment." />
        </div>
      </section>

      {/* Features Overview */}
      <section className="bg-gradient-to-r from-blue-100 to-blue-50 p-6 sm:p-10 rounded-3xl shadow-lg mb-20 animate-fadeIn">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-12 text-center text-gray-800">Features Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <FeatureCard icon={AlertCircle} title="Complaint Submission" description="Submit waste-related complaints with photos and details." />
          <FeatureCard icon={Clock} title="Task Scheduling" description="Admins can assign and schedule cleaning tasks efficiently." />
          <FeatureCard icon={Recycle} title="Waste Tracking" description="Monitor waste collected and task status transparently." />
          <FeatureCard icon={Users} title="Staff Dashboard" description="Staff can manage tasks easily from a dedicated interface." />
        </div>
      </section>

      {/* Live Monitoring */}
      <section className="mb-20 text-center animate-fadeIn">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-gray-800">Real-time Monitoring</h2>
        <p className="max-w-3xl mx-auto text-gray-600 mb-10 text-sm sm:text-base">
          Stay updated with the latest cleaning operations and waste collection activities as they happen.
        </p>
        <div className="h-48 sm:h-64 bg-blue-200 rounded-xl shadow-inner flex items-center justify-center text-blue-800 font-semibold text-sm sm:text-lg animate-pulse">
          Live data visualization coming soon...
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-white p-6 sm:p-10 rounded-3xl shadow-lg text-center animate-slideInUp">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 text-gray-800">Our Team & Support</h2>
        <p className="max-w-2xl mx-auto text-gray-600 mb-8 text-sm sm:text-base">
          Our team ensures smooth operations and support for users.
          Join us in creating a smarter, cleaner world!
        </p>
        <Link href="/contact">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 sm:py-4 sm:px-8 rounded-full font-medium transition-all transform hover:scale-105 inline-flex items-center">
            Contact Support <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </section>
    </div>
  )
}

function AnimatedGlobe() {
  return (
    <div className="relative w-24 sm:w-32 h-24 sm:h-32 mx-auto mb-10 animate-fadeIn">
      <div className="absolute inset-0 rounded-full bg-blue-400 opacity-20 animate-ping"></div>
      <div className="absolute inset-2 rounded-full bg-blue-500 opacity-30 animate-pulse"></div>
      <div className="absolute inset-4 rounded-full bg-blue-300 opacity-40 animate-spin-slow"></div>
      <Leaf className="absolute inset-0 m-auto h-12 w-12 sm:h-16 sm:w-16 text-blue-600 animate-pulse" />
    </div>
  )
}

function ImpactCard({ title, value, icon: Icon }) {
  return (
    <div className="p-6 rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-300 text-center">
      <Icon className="h-8 w-8 sm:h-10 sm:w-10 text-blue-500 mb-4 mx-auto" />
      <p className="text-xl sm:text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center">
      <div className="bg-green-100 p-3 sm:p-4 rounded-full mb-4">
        <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
      </div>
      <h3 className="text-lg sm:text-xl font-semibold text-gray-800">{title}</h3>
      <p className="text-gray-600 mt-2 text-sm sm:text-base">{description}</p>
    </div>
  )
}

function StepCard({ icon: Icon, step, description }) {
  return (
    <div className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 text-center">
      <Icon className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-blue-600 mb-4" />
      <h3 className="text-base sm:text-lg font-semibold text-gray-800">{step}</h3>
      <p className="text-gray-600 text-sm sm:text-base">{description}</p>
    </div>
  )
}
