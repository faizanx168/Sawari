'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Users, Loader2, Crosshair, Clock, Calendar, Navigation } from 'lucide-react';
import { Ride } from '../types/ride';
import AddressInput from '../components/AddressInput';
import { calculateDistanceSync } from '../utils/distance';
import { toast } from 'sonner';
import RideMap from '../components/RideMap';

interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

interface DistanceMatrixResponse {
  rows: {
    elements: {
      distance: { text: string };
      duration: { text: string };
    }[];
  }[];
}

export default function FindRides() {
  const router = useRouter();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    from: '',
    to: '',
    seats: 1,
    maxDistance: 10,
    fromLocation: null as Location | null,
    toLocation: null as Location | null,
    departureDate: null as Date | null,
    departureTime: ''
  });
  const [sortBy, setSortBy] = useState<'price' | 'distance' | 'departure'>('departure');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedRideId, setSelectedRideId] = useState<string | null>(null);
  const [estimatedDuration, setEstimatedDuration] = useState<string>('');
  const [estimatedDistance, setEstimatedDistance] = useState<string>('');
  const [selectedRoute, setSelectedRoute] = useState<{ origin: Location; destination: Location } | null>(null);

  const fetchRides = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      
      if (searchFilters.from) params.append('from', searchFilters.from);
      if (searchFilters.to) params.append('to', searchFilters.to);
      if (searchFilters.seats > 1) params.append('seats', searchFilters.seats.toString());
      if (searchFilters.maxDistance) params.append('maxDistance', searchFilters.maxDistance.toString());
      if (searchFilters.departureDate) {
        const dateStr = searchFilters.departureDate.toISOString().split('T')[0];
        if (dateStr) {
          params.append('date', dateStr);
        }
      }
      if (searchFilters.departureTime) {
        params.append('time', searchFilters.departureTime);
      }
      
      if (searchFilters.fromLocation) {
        params.append('fromLat', searchFilters.fromLocation.latitude.toString());
        params.append('fromLng', searchFilters.fromLocation.longitude.toString());
      }
      
      if (searchFilters.toLocation) {
        params.append('toLat', searchFilters.toLocation.latitude.toString());
        params.append('toLng', searchFilters.toLocation.longitude.toString());
      }

      const response = await fetch(`/api/rides/search?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch rides');
      }

      // Filter rides based on recurring pattern
      const filteredRides = data.filter((ride: Ride) => {
        if (!searchFilters.departureDate) return true;
        
        const dateStr = searchFilters.departureDate.toISOString().split('T')[0];
        if (!dateStr) return true;
        
        const selectedDateTime = new Date(`${dateStr}T${searchFilters.departureTime}`);
        
        switch (ride.recurringPattern) {
          case 'DAILY':
            return true;
          case 'WEEKLY': {
            const dayOfWeek = selectedDateTime.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
            return ride.recurringDays?.includes(dayOfWeek);
          }
          case 'MONTHLY': {
            const dayOfMonth = selectedDateTime.getDate();
            return ride.recurringDates?.includes(dayOfMonth);
          }
          default:
            return true;
        }
      });

      setRides(filteredRides);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching rides');
      setRides([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: 'price' | 'distance' | 'departure') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const sortRides = (ridesToSort: Ride[]) => {
    return [...ridesToSort].sort((a, b) => {
      if (sortBy === 'price') {
        return sortOrder === 'asc' 
          ? a.pricePerSeat - b.pricePerSeat 
          : b.pricePerSeat - a.pricePerSeat;
      } else if (sortBy === 'distance' && searchFilters.fromLocation) {
        const distA = calculateDistanceSync(
          searchFilters.fromLocation.latitude,
          searchFilters.fromLocation.longitude,
          a.pickupLocation.latitude,
          a.pickupLocation.longitude
        );
        const distB = calculateDistanceSync(
          searchFilters.fromLocation.latitude,
          searchFilters.fromLocation.longitude,
          b.pickupLocation.latitude,
          b.pickupLocation.longitude
        );
        return sortOrder === 'asc' ? distA - distB : distB - distA;
      } else if (sortBy === 'departure') {
        const timeA = new Date(a.departureTime).getTime();
        const timeB = new Date(b.departureTime).getTime();
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
      }
      return 0;
    });
  };

  const clearFilters = () => {
    setSearchFilters({
      from: '',
      to: '',
      seats: 1,
      maxDistance: 10,
      fromLocation: null,
      toLocation: null,
      departureDate: null,
      departureTime: ''
    });
    setRides([]);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchFilters.from && !searchFilters.to) {
      setError('Please enter at least one location');
      return;
    }
    fetchRides();
  };

  const getCurrentLocation = () => {
    setGettingLocation(true);
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Use Google Maps Geocoding API to get the address
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
          );
          
          const data = await response.json();
          
          if (data.status === 'OK' && data.results[0]) {
            const address = data.results[0].formatted_address;
            setSearchFilters(prev => ({
              ...prev,
              from: address,
              fromLocation: { latitude, longitude, address }
            }));
          } else {
            throw new Error('Failed to get address from coordinates');
          }
        } catch (error) {
          toast.error('Failed to get your current location address');
          console.error('Error getting location:', error);
        } finally {
          setGettingLocation(false);
        }
      },
      (error) => {
        toast.error('Failed to get your location. Please check your browser settings.');
        console.error('Error getting location:', error);
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  };

  const handleViewRoute = (ride: Ride) => {
    if (selectedRideId === ride.id && selectedRoute) {
      setSelectedRoute(null);
      setSelectedRideId(null);
    } else {
      setSelectedRoute({
        origin: ride.pickupLocation,
        destination: ride.dropoffLocation
      });
      setSelectedRideId(ride.id);
    }
  };

  const handleBookRide = (rideId: string) => {
    router.push(`/book-ride/${rideId}`);
  };

  const sortedRides = sortRides(rides);

  useEffect(() => {
    if (searchFilters.fromLocation && searchFilters.toLocation) {
      const service = new window.google.maps.DistanceMatrixService();
      service.getDistanceMatrix(
        {
          origins: [{ lat: searchFilters.fromLocation.latitude, lng: searchFilters.fromLocation.longitude }],
          destinations: [{ lat: searchFilters.toLocation.latitude, lng: searchFilters.toLocation.longitude }],
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (response: DistanceMatrixResponse | null, status: string) => {
          if (status === 'OK' && response?.rows?.[0]?.elements?.[0]) {
            const element = response.rows[0].elements[0];
            const duration = element.duration?.text;
            const distance = element.distance?.text;
            if (duration && distance) {
              setEstimatedDuration(duration);
              setEstimatedDistance(distance);
            }
          }
        }
      );
    }
  }, [searchFilters.fromLocation, searchFilters.toLocation]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading rides...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Map Section */}
      <div className="flex-1 relative">
        <RideMap
          rides={rides}
          fromLocation={searchFilters.fromLocation}
          toLocation={searchFilters.toLocation}
          selectedRideId={selectedRideId}
          selectedRoute={selectedRoute}
          onRideSelect={setSelectedRideId}
          maxDistance={searchFilters.maxDistance}
        />
        
        {/* Search Panel */}
        <div className="absolute top-4 left-4 right-4 max-w-xl mx-auto bg-white rounded-lg shadow-lg">
          <div className="p-4">
            <div className="space-y-4">
              {/* Pickup Location */}
              <div className="flex items-center space-x-2">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <AddressInput
                    value={searchFilters.from}
                    onChange={(address, location) => setSearchFilters(prev => ({ 
                      ...prev, 
                      from: address,
                      fromLocation: location ? { ...location, address } : null 
                    }))}
                    placeholder="Enter pickup location"
                  />
                </div>
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={gettingLocation}
                  className="p-2 hover:bg-gray-100 rounded-full"
                  title="Use current location"
                >
                  {gettingLocation ? (
                    <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                  ) : (
                    <Crosshair className="h-5 w-5 text-blue-500" />
                  )}
                </button>
              </div>

              {/* Dropoff Location */}
              <div className="flex items-center space-x-2">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <AddressInput
                    value={searchFilters.to}
                    onChange={(address, location) => setSearchFilters(prev => ({ 
                      ...prev, 
                      to: address,
                      toLocation: location ? { ...location, address } : null 
                    }))}
                    placeholder="Enter destination"
                  />
                </div>
              </div>

              {/* Trip Details */}
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-gray-500" />
                  <input
                    type="number"
                    value={searchFilters.seats}
                    onChange={(e) => setSearchFilters(prev => ({ 
                      ...prev, 
                      seats: Math.max(1, parseInt(e.target.value) || 1) 
                    }))}
                    min="1"
                    className="w-20 p-2 border rounded"
                    placeholder="Seats"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <input
                    type="date"
                    value={searchFilters.departureDate ? searchFilters.departureDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => setSearchFilters(prev => ({
                      ...prev,
                      departureDate: e.target.value ? new Date(e.target.value) : null
                    }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="p-2 border rounded"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <input
                    type="time"
                    value={searchFilters.departureTime}
                    onChange={(e) => setSearchFilters(prev => ({
                      ...prev,
                      departureTime: e.target.value
                    }))}
                    className="p-2 border rounded"
                  />
                </div>
              </div>

              {/* Distance Filter */}
              {searchFilters.fromLocation && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Navigation className="h-5 w-5 text-gray-500 mr-2" />
                      <span className="text-sm font-medium text-gray-700">Search Radius</span>
                    </div>
                    <span className="text-sm text-gray-600">{searchFilters.maxDistance} miles</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={searchFilters.maxDistance}
                    onChange={(e) => setSearchFilters(prev => ({ 
                      ...prev, 
                      maxDistance: parseInt(e.target.value) 
                    }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 mile</span>
                    <span>10 miles</span>
                  </div>
                </div>
              )}

              {/* Route Info */}
              {estimatedDuration && estimatedDistance && (
                <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{estimatedDuration}</span>
                  </div>
                  <div className="flex items-center">
                    <Navigation className="h-4 w-4 mr-1" />
                    <span>{estimatedDistance}</span>
                  </div>
                </div>
              )}

              {/* Search Button */}
              <button
                onClick={handleSubmit}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Find Available Rides
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Panel */}
      <div className="w-96 bg-white shadow-lg overflow-y-auto">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Available Rides</h2>
            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => handleSort(e.target.value as 'price' | 'distance' | 'departure')}
                className="text-sm border rounded-md p-1"
              >
                <option value="departure">Departure Time</option>
                <option value="price">Price</option>
                {searchFilters.fromLocation && <option value="distance">Distance</option>}
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-1 hover:bg-gray-100 rounded"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        <div className="p-4">
          {error ? (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          ) : rides.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No rides found matching your criteria.</p>
              <button
                onClick={clearFilters}
                className="mt-4 text-blue-600 hover:text-blue-800"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedRides.map((ride) => (
                <div
                  key={ride.id}
                  className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedRideId === ride.id ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedRideId(ride.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">${ride.pricePerSeat}</h3>
                      <p className="text-sm text-gray-500">per seat</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewRoute(ride);
                        }}
                        className="px-3 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
                      >
                        {selectedRideId === ride.id && selectedRoute ? 'Hide Route' : 'View Route'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookRide(ride.id);
                        }}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        <span>{ride.seatsAvailable} seats available</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{new Date(ride.departureTime).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    {/* Show recurring pattern info */}
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>
                          {ride.recurringPattern === 'DAILY' && 'Daily'}
                          {ride.recurringPattern === 'WEEKLY' && 
                            `Weekly on ${ride.recurringDays?.join(', ')}`}
                          {ride.recurringPattern === 'MONTHLY' && 
                            `Monthly on ${ride.recurringDates?.join(', ')}`}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {ride.startDate && `From ${new Date(ride.startDate).toLocaleDateString()}`}
                        {ride.endDate && ` to ${new Date(ride.endDate).toLocaleDateString()}`}
                      </div>
                    </div>

                    {searchFilters.fromLocation && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>
                          {(calculateDistanceSync(
                            searchFilters.fromLocation.latitude,
                            searchFilters.fromLocation.longitude,
                            ride.pickupLocation.latitude,
                            ride.pickupLocation.longitude
                          ) * 0.621371).toFixed(1)} miles away
                        </span>
                      </div>
                    )}

                    <div className="pt-2 border-t mt-2">
                      <div className="flex items-center mb-1">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-2">
                          <MapPin className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm text-gray-600">
                          {ride.pickupLocation.address}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center mr-2">
                          <MapPin className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm text-gray-600">
                          {ride.dropoffLocation.address}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 