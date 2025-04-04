'use client';

import { useRouter } from 'next/navigation';
import { Car, Users, MapPin, Clock, Calendar, Shield, MessageSquare, Bell } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                Share Rides, Save Time
              </h1>
              <p className="mt-5 max-w-xl text-xl text-gray-500">
                Connect with fellow commuters for efficient and reliable carpooling
              </p>
              <div className="mt-8 flex justify-center lg:justify-start">
                <button
                  onClick={() => router.push('/find-rides')}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Find a Ride
                </button>
              </div>
            </div>
            <div className="relative h-[400px] lg:h-[500px]">
              <Image
                src="/images/carpool-illustration.svg"
                alt="People carpooling together"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Current Features */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
              <Car className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Smart Ride Matching</h3>
            <p className="mt-2 text-base text-gray-500">
              Find the perfect ride match based on your route and schedule.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
              <Calendar className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Flexible Scheduling</h3>
            <p className="mt-2 text-base text-gray-500">
              Schedule one-time or recurring rides with ease.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Verified Community</h3>
            <p className="mt-2 text-base text-gray-500">
              Join a community of verified users with detailed profiles.
            </p>
          </div>

          {/* Coming Soon Features */}
          <div className="bg-white p-6 rounded-lg shadow-sm border-2 border-dashed border-blue-200">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-500">
              <Bell className="h-6 w-6" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Real-time Tracking</h3>
            <p className="mt-2 text-base text-gray-500">
              Track your ride in real-time and receive updates.
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
              Communicate with your ride partners directly.
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
              Additional safety features and emergency assistance.
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
                Enter your pickup and dropoff locations to find available rides.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">2. Schedule</h3>
              <p className="mt-2 text-base text-gray-500">
                Choose your preferred date and time, or set up a recurring ride.
              </p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">3. Connect</h3>
              <p className="mt-2 text-base text-gray-500">
                Connect with your ride partner and arrange the details.
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