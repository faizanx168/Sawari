'use client';

import { Car, Users, MapPin, Clock, Calendar, Shield, MessageSquare, Bell, Target, Heart, Globe } from 'lucide-react';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">About Sawari</h1>
      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                About Sawari
              </h1>
              <p className="mt-5 max-w-xl text-xl text-gray-500">
                Connecting commuters for efficient and reliable carpooling
              </p>
            </div>
            <div className="relative h-[300px] lg:h-[400px]">
              <Image
                src="/images/community-illustration.svg"
                alt="Community of commuters"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center justify-center mb-6">
            <Target className="h-12 w-12 text-blue-500" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-6">
            Our Mission
          </h2>
          <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto">
            At Sawari, we are committed to revolutionizing urban transportation by creating a sustainable, 
            community-driven carpooling platform that reduces traffic congestion, lowers carbon emissions, 
            and makes commuting more affordable and enjoyable for everyone.
          </p>
        </div>
      </div>

      {/* Values Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
          Our Values
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
              <Heart className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Community First</h3>
            <p className="text-base text-gray-500">
              We believe in building a trusted community where members can connect, share rides, and build meaningful relationships.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
              <Globe className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Environmental Responsibility</h3>
            <p className="text-base text-gray-500">
              We are committed to reducing carbon emissions and promoting sustainable transportation solutions.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Safety & Trust</h3>
            <p className="text-base text-gray-500">
              We prioritize the safety and security of our community members through verified profiles and robust safety features.
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
          Our Features
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Current Features */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
              <Car className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Smart Ride Matching</h3>
            <p className="mt-2 text-base text-gray-500">
              Our advanced algorithm matches you with the perfect ride based on your route, schedule, and preferences.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
              <Calendar className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Flexible Scheduling</h3>
            <p className="mt-2 text-base text-gray-500">
              Schedule one-time or recurring rides with ease. Perfect for daily commutes and regular trips.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Verified Community</h3>
            <p className="mt-2 text-base text-gray-500">
              Join a community of verified users with detailed profiles and ratings for a safe and reliable experience.
            </p>
          </div>

          {/* Coming Soon Features */}
          <div className="bg-white p-6 rounded-lg shadow-sm border-2 border-dashed border-blue-200">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-500">
              <Bell className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Real-time Tracking</h3>
            <p className="mt-2 text-base text-gray-500">
              Track your ride in real-time and receive updates on arrival times and route changes.
            </p>
            <span className="mt-2 inline-block px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full">
              Coming Soon
            </span>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border-2 border-dashed border-blue-200">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-500">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">In-app Messaging</h3>
            <p className="mt-2 text-base text-gray-500">
              Communicate with your ride partners directly through our secure messaging system.
            </p>
            <span className="mt-2 inline-block px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full">
              Coming Soon
            </span>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border-2 border-dashed border-blue-200">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-500">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Enhanced Safety</h3>
            <p className="mt-2 text-base text-gray-500">
              Additional safety features including emergency assistance and ride verification.
            </p>
            <span className="mt-2 inline-block px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full">
              Coming Soon
            </span>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">1. Find a Ride</h3>
              <p className="mt-2 text-base text-gray-500">
                Enter your pickup and dropoff locations to find available rides that match your route.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">2. Schedule</h3>
              <p className="mt-2 text-base text-gray-500">
                Choose your preferred date and time, or set up a recurring ride for regular commutes.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">3. Connect</h3>
              <p className="mt-2 text-base text-gray-500">
                Connect with your ride partner, confirm details, and enjoy your journey together.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Note about Payments */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">About Payments</h3>
          <p className="text-base text-gray-600">
            Currently, Sawari focuses on connecting riders and drivers. Payment arrangements are made directly between users. 
            We&apos;re working on implementing secure in-app payment features in the future to make the experience even more convenient.
          </p>
        </div>
      </div>
    </div>
  );
} 