'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AddressInput from '../components/AddressInput';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { RecurringPattern } from '../types/ride';
import { hasTimeConflict } from '../utils/time';
import { Ride } from '../types/ride';

interface Location {
  lat: number;
  lng: number;
}

interface GoogleLocation {
  latitude: number;
  longitude: number;
}

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  seats: number;
}

export default function CreateRide() {
  const router = useRouter();
  const { data: session } = useSession();
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [pickupLocation, setPickupLocation] = useState<Location | null>(null);
  const [dropoffLocation, setDropoffLocation] = useState<Location | null>(null);
  const [departureTime, setDepartureTime] = useState('');
  const [returnTime, setReturnTime] = useState('');
  const [pricePerSeat, setPricePerSeat] = useState('');
  const [seatsAvailable, setSeatsAvailable] = useState('');
  const [pickupRadius, setPickupRadius] = useState(1);
  const [dropoffRadius, setDropoffRadius] = useState(1);
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [recurringPattern, setRecurringPattern] = useState<RecurringPattern>('WEEKLY');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedDates, setSelectedDates] = useState<number[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const response = await fetch('/api/cars');
      if (!response.ok) throw new Error('Failed to fetch cars');
      const data = await response.json();
      setCars(data);
    } catch (error) {
      toast.error('Failed to load cars');
      console.error('Error fetching cars:', error);
    }
  };

  const handleLocationChange = (address: string, location: GoogleLocation, type: 'pickup' | 'dropoff') => {
    const newLocation: Location = {
      lat: location.latitude,
      lng: location.longitude,
    };

    if (type === 'pickup') {
      setPickupAddress(address);
      setPickupLocation(newLocation);
    } else {
      setDropoffAddress(address);
      setDropoffLocation(newLocation);
    }
  };

  const handleDayToggle = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleDateToggle = (date: number) => {
    setSelectedDates(prev =>
      prev.includes(date)
        ? prev.filter(d => d !== date)
        : [...prev, date]
    );
  };

  const checkForConflicts = async () => {
    try {
      // Fetch existing rides for the driver
      const response = await fetch(`/api/rides?driverId=${session?.user?.id}`);
      if (!response.ok) throw new Error('Failed to fetch existing rides');
      
      const existingRides: Ride[] = await response.json();
      
      const newRideSlot = {
        startTime: departureTime,
        endTime: returnTime || '23:59',
        recurringPattern,
        recurringDays: recurringPattern === 'WEEKLY' ? selectedDays : undefined,
        recurringDates: recurringPattern === 'MONTHLY' ? selectedDates : undefined,
        startDate,
        endDate: endDate || undefined,
      };
      
      const existingSlots = existingRides.map((ride: Ride) => ({
        startTime: ride.departureTime,
        endTime: ride.returnTime || '23:59',
        recurringPattern: ride.recurringPattern,
        recurringDays: ride.recurringDays,
        recurringDates: ride.recurringDates,
        startDate: ride.startDate,
        endDate: ride.endDate,
      }));
      
      return hasTimeConflict(newRideSlot, existingSlots);
    } catch (error) {
      console.error('Error checking for conflicts:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.id) {
      toast.error('Please sign in to create a ride');
      return;
    }

    if (!pickupLocation || !dropoffLocation) {
      toast.error('Please select valid pickup and dropoff locations');
      return;
    }

    if (!departureTime || !pricePerSeat || !seatsAvailable || !selectedCar) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Check for time conflicts
    const hasConflict = await checkForConflicts();
    if (hasConflict) {
      toast.error('This ride conflicts with an existing ride in your schedule');
      return;
    }

    try {
      const rideData = {
        startDate,
        endDate: endDate || null,
        departureTime,
        returnTime: returnTime || null,
        pricePerSeat,
        seatsAvailable,
        status: 'PENDING',
        recurringPattern,
        recurringDays: recurringPattern === 'WEEKLY' ? selectedDays : [],
        recurringDates: recurringPattern === 'MONTHLY' ? selectedDates : null,
        pickupLocation: {
          address: pickupAddress,
          latitude: pickupLocation.lat,
          longitude: pickupLocation.lng,
        },
        dropoffLocation: {
          address: dropoffAddress,
          latitude: dropoffLocation.lat,
          longitude: dropoffLocation.lng,
        },
        pickupRadius: 1,
        dropoffRadius: 1,
        driverId: session.user.id,
        carId: selectedCar.id,
      };

      const response = await fetch('/api/rides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rideData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create ride');
      }

      toast.success('Ride created successfully');
      router.push('/my-rides');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create ride');
      console.error('Error creating ride:', error);
    }
  };

  const daysOfWeek = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create Recurring Ride</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="car">Select Car</Label>
            <Select value={selectedCar?.id} onValueChange={(value) => setSelectedCar(cars.find(car => car.id === value) || null)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a car" />
              </SelectTrigger>
              <SelectContent className='bg-white text-black overflow-y-auto max-h-[300px]' >
                {cars.map((car) => (
                  <SelectItem key={car.id} value={car.id}>
                    {car.year} {car.make} {car.model} - {car.licensePlate} ({car.seats} seats)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {cars.length === 0 && (
              <p className="text-sm text-red-500 mt-1">
                No cars available. Please add a car first.
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="pickup">Pickup Location</Label>
            <AddressInput
              value={pickupAddress}
              onChange={(address, location) => handleLocationChange(address, location, 'pickup')}
              placeholder="Enter pickup location"
              required
            />
          </div>

          <div>
            <Label htmlFor="dropoff">Dropoff Location</Label>
            <AddressInput
              value={dropoffAddress}
              onChange={(address, location) => handleLocationChange(address, location, 'dropoff')}
              placeholder="Enter dropoff location"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="departureTime">Departure Time</Label>
              <Input
                id="departureTime"
                type="time"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="returnTime">Return Time (Optional)</Label>
            <Input
              id="returnTime"
              type="time"
              value={returnTime}
              onChange={(e) => setReturnTime(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pricePerSeat">Price per Seat ($)</Label>
              <Input
                id="pricePerSeat"
                type="number"
                min="0"
                step="0.01"
                value={pricePerSeat}
                onChange={(e) => setPricePerSeat(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="seatsAvailable">Available Seats</Label>
              <Input
                id="seatsAvailable"
                type="number"
                min="1"
                max="4"
                value={seatsAvailable}
                onChange={(e) => setSeatsAvailable(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pickupRadius">Pickup Radius (miles)</Label>
              <Input
                id="pickupRadius"
                type="number"
                min="1"
                max="10"
                value={pickupRadius}
                onChange={(e) => setPickupRadius(parseFloat(e.target.value))}
                required
              />
            </div>

            <div>
              <Label htmlFor="dropoffRadius">Dropoff Radius (miles)</Label>
              <Input
                id="dropoffRadius"
                type="number"
                min="1"
                max="10"
                value={dropoffRadius}
                onChange={(e) => setDropoffRadius(parseFloat(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Recurring Pattern</h2>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setRecurringPattern('DAILY')}
                className={`px-4 py-2 rounded ${
                  recurringPattern === 'DAILY'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Daily
              </button>
              <button
                type="button"
                onClick={() => setRecurringPattern('WEEKLY')}
                className={`px-4 py-2 rounded ${
                  recurringPattern === 'WEEKLY'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Weekly
              </button>
              <button
                type="button"
                onClick={() => setRecurringPattern('MONTHLY')}
                className={`px-4 py-2 rounded ${
                  recurringPattern === 'MONTHLY'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date (Optional)</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {recurringPattern === 'WEEKLY' && (
            <div className="space-y-4">
              <h3 className="text-md font-medium">Select Days</h3>
              <div className="grid grid-cols-7 gap-2">
                {daysOfWeek.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(day)}
                    className={`p-2 rounded ${
                      selectedDays.includes(day)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {recurringPattern === 'MONTHLY' && (
            <div className="space-y-4">
              <h3 className="text-md font-medium">Select Dates</h3>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
                  <button
                    key={date}
                    type="button"
                    onClick={() => handleDateToggle(date)}
                    className={`p-2 rounded ${
                      selectedDates.includes(date)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {date}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="px-8 py-2">
            Create Ride
          </Button>
        </div>
      </form>
    </div>
  );
}