'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, Users, DollarSign, Repeat, Trash2 } from 'lucide-react';

interface Ride {
  id: string;
  date: string;
  departureTime: string;
  returnTime: string | null;
  pricePerSeat: number;
  seatsAvailable: number;
  status: string;
  isRecurring: boolean;
  recurringDays: string[];
  pickupLocation: {
    address: string;
  };
  dropoffLocation: {
    address: string;
  };
  driver: {
    name: string;
    email: string;
  };
}

export default function MyRides() {
  const { status } = useSession();
  const router = useRouter();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchRides();
    }
  }, [status]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const fetchRides = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching rides...');
      const response = await fetch('/api/rides/my-rides');
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Failed to fetch rides');
      }
      
      const data = await response.json();
      console.log('Received rides data:', data);
      setRides(data);
    } catch (error) {
      console.error('Error fetching rides:', error);
      setError(error instanceof Error ? error.message : 'Failed to load rides');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRide = async (rideId: string) => {
    if (!confirm('Are you sure you want to delete this ride?')) {
      return;
    }

    try {
      const response = await fetch(`/api/rides/${rideId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete ride');
      }

      setRides(rides.filter(ride => ride.id !== rideId));
    } catch (error) {
      console.error('Error deleting ride:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete ride');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatRecurringDays = (days: string[]) => {
    const dayLabels: { [key: string]: string } = {
      monday: 'Mon',
      tuesday: 'Tue',
      wednesday: 'Wed',
      thursday: 'Thu',
      friday: 'Fri',
      saturday: 'Sat',
      sunday: 'Sun',
    };
    return days.map(day => dayLabels[day] || day).join(', ');
  };

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

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Rides</h1>
            <button
              onClick={() => router.push('/create-ride')}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Offer a Ride
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative mb-6" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {rides.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">You haven&apos;t offered any rides yet.</p>
              <button
                onClick={() => router.push('/create-ride')}
                className="mt-4 text-blue-600 hover:text-blue-800"
              >
                Offer your first ride
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {rides.map((ride) => (
                <div
                  key={ride.id}
                  className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center text-gray-500">
                          <Calendar className="h-5 w-5 mr-1" />
                          <span>{formatDate(ride.date)}</span>
                        </div>
                        <div className="flex items-center text-gray-500">
                          <Clock className="h-5 w-5 mr-1" />
                          <span>{ride.departureTime}</span>
                          {ride.returnTime && (
                            <>
                              <span className="mx-1">→</span>
                              <span>{ride.returnTime}</span>
                            </>
                          )}
                        </div>
                        {ride.isRecurring && (
                          <div className="flex items-center text-blue-600">
                            <Repeat className="h-5 w-5 mr-1" />
                            <span>{formatRecurringDays(ride.recurringDays)}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex items-center text-gray-500">
                          <MapPin className="h-5 w-5 mr-1" />
                          <span>{ride.pickupLocation.address}</span>
                        </div>
                        <span className="text-gray-400">→</span>
                        <div className="flex items-center text-gray-500">
                          <MapPin className="h-5 w-5 mr-1" />
                          <span>{ride.dropoffLocation.address}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex items-center text-gray-500">
                          <Users className="h-5 w-5 mr-1" />
                          <span>{ride.seatsAvailable} seats available</span>
                        </div>
                        <div className="flex items-center text-gray-500">
                          <DollarSign className="h-5 w-5 mr-1" />
                          <span>${ride.pricePerSeat} per seat</span>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          ride.status === 'SCHEDULED' ? 'bg-green-100 text-green-800' :
                          ride.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {ride.status}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteRide(ride.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete ride"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}