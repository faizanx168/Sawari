'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, Users, DollarSign, Repeat, Star, StarHalf } from 'lucide-react';
import { CreateBookingInputType } from '../../types/zod';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import Link from 'next/link';

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
    id: string;
    name: string;
    email: string;
    image: string | null;
    averageRating: number;
    totalReviews: number;
  };
  car: {
    make: string;
    model: string;
    year: number;
    color: string;
    licensePlate: string;
  };
  actualAvailableSeats: number;
  bookings?: Booking[];
}

interface Booking {
  id: string;
  status: string;
  seats: number;
}

export default function BookRide({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState({
    seats: 1,
    isRecurring: false,
    selectedDays: [] as string[],
  });
  const [isBooking, setIsBooking] = useState(false);

  const fetchRide = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { id } = await params;
      console.log('Fetching ride with ID:', id);
      
      const response = await fetch(`/api/rides/${id}`);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Failed to fetch ride');
      }
      
      const data = await response.json();
      console.log('Received ride data:', data);
      
      // Calculate actual available seats by subtracting confirmed bookings
      const confirmedBookings = data.bookings?.filter(
        (booking: Booking) => booking.status === 'CONFIRMED'
      ) || [];
      
      const bookedSeats = confirmedBookings.reduce(
        (total: number, booking: Booking) => total + booking.seats,
        0
      );
      
      setRide({
        ...data,
        actualAvailableSeats: data.seatsAvailable - bookedSeats,
      });
    } catch (err) {
      console.error('Error fetching ride:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch ride');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchRide();
    }
  }, [status, fetchRide]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleDayToggle = (dayId: string) => {
    setBookingData(prev => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(dayId)
        ? prev.selectedDays.filter(d => d !== dayId)
        : [...prev.selectedDays, dayId],
    }));
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ride || !session?.user?.id) return;

    // Check if there are enough seats available
    if (bookingData.seats > ride.actualAvailableSeats) {
      setError(`Only ${ride.actualAvailableSeats} seats available`);
      return;
    }

    try {
      setIsBooking(true);
      setError(null);

      const bookingInput: CreateBookingInputType = {
        userId: session.user.id,
        rideId: ride.id,
        seats: bookingData.seats,
        totalPrice: ride.pricePerSeat * bookingData.seats,
        isRecurring: bookingData.isRecurring,
        recurringDays: bookingData.selectedDays,
      };

      console.log('Creating booking with input:', bookingInput);

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingInput),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create booking');
      }

      const createdBooking = await response.json();
      console.log('Booking created successfully:', createdBooking);

      // Show success message and redirect to my-bookings
      router.push('/my-bookings');
    } catch (error) {
      console.error('Error creating booking:', error);
      setError(error instanceof Error ? error.message : 'Failed to create booking');
    } finally {
      setIsBooking(false);
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

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="fill-yellow-400 text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="fill-yellow-400 text-yellow-400" />);
    }

    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="text-gray-300" />);
    }

    return stars;
  };

  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center">Loading...</div>
          </div>
        </div>
      </>
    );
  }

  if (!ride) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center text-red-600">Ride not found</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Book a Ride</h1>

          <div className="bg-white shadow rounded-lg p-6 mb-8">
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

              <div className="bg-white rounded-lg shadow p-4 mt-4">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={ride.driver.image || undefined} alt={ride.driver.name} />
                    <AvatarFallback>{ride.driver.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">
                          <Link href={`/profile/${ride.driver.id}`} className="hover:text-blue-600">
                            {ride.driver.name}
                          </Link>
                        </h3>
                        <div className="flex items-center mt-1">
                          <div className="flex mr-2">
                            {renderStars(ride.driver.averageRating)}
                          </div>
                          <span className="text-sm text-gray-500">
                            ({ride.driver.totalReviews} reviews)
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        Driving: {ride.car.make} {ride.car.model} ({ride.car.year})
                      </p>
                      <p className="text-sm text-gray-600">
                        Color: {ride.car.color} | License: {ride.car.licensePlate}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center text-gray-500">
                  <Users className="h-5 w-5 mr-1" />
                  <span>{ride.actualAvailableSeats} seats available</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <DollarSign className="h-5 w-5 mr-1" />
                  <span>${ride.pricePerSeat} per seat</span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleBooking} className="bg-white shadow rounded-lg p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Seats
                </label>
                <input
                  type="number"
                  min="1"
                  max={ride.actualAvailableSeats}
                  value={bookingData.seats}
                  onChange={(e) => setBookingData({ ...bookingData, seats: parseInt(e.target.value) })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {ride.actualAvailableSeats === 0 && (
                  <p className="mt-1 text-sm text-red-600">
                    This ride is fully booked
                  </p>
                )}
              </div>

              {ride.isRecurring && (
                <div className="space-y-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bookingData.isRecurring}
                      onChange={(e) => setBookingData({ ...bookingData, isRecurring: e.target.checked })}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">Book as recurring ride</span>
                  </label>

                  {bookingData.isRecurring && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Days
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {ride.recurringDays.map((day) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => handleDayToggle(day)}
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              bookingData.selectedDays.includes(day)
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {formatRecurringDays([day])}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              <div className="text-right">
                <div className="text-lg font-medium text-gray-900 mb-4">
                  Total: ${(ride.pricePerSeat * bookingData.seats).toFixed(2)}
                </div>
                <button
                  type="submit"
                  disabled={isBooking || ride.actualAvailableSeats === 0}
                  className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isBooking ? 'Booking...' : ride.actualAvailableSeats === 0 ? 'Fully Booked' : 'Book Now'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
} 