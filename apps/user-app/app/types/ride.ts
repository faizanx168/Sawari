export type RecurringPattern = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface Ride {
  id: string;
  startDate: string;
  endDate?: string;
  departureTime: string;
  returnTime?: string;
  pricePerSeat: number;
  seatsAvailable: number;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  recurringPattern: RecurringPattern;
  recurringDays: string[];
  recurringDates?: number[];
  pickupRadius?: number;
  dropoffRadius?: number;
  driver: {
    id: string;
    name: string | null;
    image: string | null;
  };
  car: {
    id: string;
    make: string;
    model: string;
    year: number;
    color: string;
    licensePlate: string;
  };
  pickupLocation: {
    id: string;
    address: string;
    latitude: number;
    longitude: number;
  };
  dropoffLocation: {
    id: string;
    address: string;
    latitude: number;
    longitude: number;
  };
  distance?: {
    pickup: number;
    dropoff: number | null;
  };
} 