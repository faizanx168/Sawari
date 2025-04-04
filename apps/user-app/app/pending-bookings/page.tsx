'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Check, X, Clock, MapPin, Users, DollarSign, Calendar } from 'lucide-react';
    
interface PendingBooking {
  id: string;
  status: string;
  seats: number;
  totalPrice: number;
  isRecurring: boolean;
  recurringDays: string[];
  createdAt: string;
  ride: {
    id: string;
    date: string;
    departureTime: string;
    returnTime: string | null;
    pricePerSeat: number;
    seatsAvailable: number;
    pickupLocation: {
      address: string;
    };
    dropoffLocation: {
      address: string;
    };
    isRecurring: boolean;
    recurringDays: string[];
  };
  user: {
    name: string;
    email: string;
    phoneNumber: string;
  };
}

export default function PendingBookings() {
  const { status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState<PendingBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchPendingBookings();
    }
  }, [status, router]);

  const fetchPendingBookings = async () => {
    try {
      const response = await fetch('/api/bookings/pending');
      if (!response.ok) {
        throw new Error('Failed to fetch pending bookings');
      }
      const data = await response.json();
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pending bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingAction = async (bookingId: string, action: 'confirm' | 'reject') => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          action,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} booking`);
      }

      // Refresh the bookings list
      fetchPendingBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} booking`);
    }
  };

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
          <div className="flex items-center justify-center min-h-screen">
          <div className="text-red-500">{error}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Pending Bookings</h1>
        
        {bookings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No pending bookings found</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">
                      Booking from {booking.user.name}
                    </h2>
                    <p className="text-gray-600">{booking.user.email}</p>
                    <p className="text-gray-600">{booking.user.phoneNumber}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBookingAction(booking.id, 'confirm')}
                      className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Confirm
                    </button>
                    <button
                      onClick={() => handleBookingAction(booking.id, 'reject')}
                      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <span>
                      {format(new Date(booking.ride.date), 'PPP')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <span>
                      {booking.ride.departureTime}
                      {booking.ride.returnTime && ` - ${booking.ride.returnTime}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <span>{booking.ride.pickupLocation.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <span>{booking.ride.dropoffLocation.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-gray-500" />
                    <span>{booking.seats} seats</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-gray-500" />
                    <span>${booking.totalPrice}</span>
                  </div>
                </div>

                {booking.isRecurring && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">
                      Recurring on: {booking.recurringDays.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
} 