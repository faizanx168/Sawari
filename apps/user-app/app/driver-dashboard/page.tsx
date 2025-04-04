'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {  Clock, Users, MapPin, Navigation, User } from 'lucide-react';

interface Passenger {
  id: string;
  name: string;
  email: string;
  pickupAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  seats: number;
}

interface Ride {
  id: string;
  date: string;
  departureTime: string;
  returnTime: string | null;
  pickupLocation: {
    address: string;
    latitude: number;
    longitude: number;
  };
  dropoffLocation: {
    address: string;
    latitude: number;
    longitude: number;
  };
  passengers: Passenger[];
  totalSeats: number;
  availableSeats: number;
}

export default function DriverDashboard() {
  const { status } = useSession();
  const router = useRouter();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const response = await fetch('/api/rides/driver');
        if (!response.ok) {
          throw new Error('Failed to fetch rides');
        }
        const data = await response.json();
        setRides(data);
      } catch (error) {
        console.error('Error fetching rides:', error);
        setError('Failed to load rides');
      } finally {
        setLoading(false);
      }
    };

    fetchRides();
  }, []);

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">Loading...</div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
          <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center text-red-600">{error}</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Driver Dashboard</h1>

          <div className="grid gap-6">
            {rides.map((ride) => (
              <div key={ride.id} className="bg-white shadow-md rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {new Date(ride.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </h2>
                    <div className="flex items-center space-x-4 mt-1 text-gray-600">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Departure: {ride.departureTime}</span>
                      </div>
                      {ride.returnTime && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Return: {ride.returnTime}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {ride.totalSeats - ride.availableSeats}/{ride.totalSeats} seats filled
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Pickup Location</h3>
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
                      <span className="text-gray-900">{ride.pickupLocation.address}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Dropoff Location</h3>
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
                      <span className="text-gray-900">{ride.dropoffLocation.address}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Passengers to Pick Up</h3>
                  <div className="space-y-4">
                    {ride.passengers.map((passenger) => (
                      <div
                        key={passenger.id}
                        className="flex items-start justify-between bg-gray-50 p-4 rounded-lg"
                      >
                        <div className="flex items-start">
                          <User className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                          <div>
                            <p className="font-medium text-gray-900">{passenger.name}</p>
                            <p className="text-sm text-gray-500">{passenger.email}</p>
                            <div className="flex items-center mt-1 text-sm text-gray-600">
                              <Navigation className="h-4 w-4 mr-1" />
                              <span>{passenger.pickupAddress}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{passenger.seats} seats</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {rides.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No upcoming rides found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 