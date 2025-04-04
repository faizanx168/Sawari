import { z } from "zod";

// Enum schemas
export const RideStatusEnum = z.enum(["PENDING", "ACTIVE", "COMPLETED", "CANCELLED"]);
export const RequestStatusEnum = z.enum(["PENDING", "ACCEPTED", "REJECTED", "CANCELLED"]);
export const PaymentStatusEnum = z.enum(["PENDING", "COMPLETED", "FAILED"]);
export const BookingStatusEnum = z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "REJECTED"]);
export const RecurringPatternEnum = z.enum(["DAILY", "WEEKLY", "MONTHLY"]);

// Location schema
export const LocationSchema = z.object({
  id: z.string().cuid(),
  address: z.string(),
  latitude: z.number(),
  longitude: z.number(),
});

// Car schema
export const CarSchema = z.object({
  id: z.string().cuid(),
  make: z.string(),
  model: z.string(),
  year: z.number().int().positive(),
  color: z.string(),
  licensePlate: z.string(),
  seats: z.number().int().positive(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string(),
});

// Car Image schema
export const CarImageSchema = z.object({
  id: z.string().cuid(),
  url: z.string().url(),
  createdAt: z.date(),
  carId: z.string(),
});

// User schema
export const UserSchema = z.object({
  id: z.string().cuid(),
  email: z.string().email(),
  name: z.string().nullable(),
  password: z.string(),
  emailVerified: z.date().nullable(),
  image: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  homeLocationId: z.string().nullable(),
  destinationLocationId: z.string().nullable(),
});

// Ride schema
export const RideSchema = z.object({
  id: z.string().cuid(),
  startDate: z.string(),
  endDate: z.string().nullable(),
  departureTime: z.string(),
  returnTime: z.string().nullable(),
  pricePerSeat: z.number().positive(),
  seatsAvailable: z.number().int().min(0),
  status: RideStatusEnum,
  recurringPattern: RecurringPatternEnum,
  recurringDays: z.array(z.string()),
  recurringDates: z.array(z.number().int().min(1).max(31)).nullable(),
  pickupLocationId: z.string(),
  dropoffLocationId: z.string(),
  pickupRadius: z.number().positive(),
  dropoffRadius: z.number().positive(),
  driverId: z.string(),
  carId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Booking schema
export const BookingSchema = z.object({
  id: z.string().cuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  status: BookingStatusEnum,
  seats: z.number().int().positive(),
  totalPrice: z.number().positive(),
  isRecurring: z.boolean(),
  recurringDays: z.array(z.string()),
  isConfirmed: z.boolean(),
  confirmedAt: z.date().nullable(),
  rideId: z.string(),
  userId: z.string(),
  passengerRideId: z.string().nullable(),
});

// PassengerRide schema
export const PassengerRideSchema = z.object({
  id: z.string().cuid(),
  rideId: z.string(),
  userId: z.string(),
  seatsTaken: z.number().int().positive(),
  pricePaid: z.number().positive(),
});

// Request schema
export const RequestSchema = z.object({
  id: z.string().cuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
  status: RequestStatusEnum,
  message: z.string().nullable(),
  numberOfSeats: z.number().int().positive(),
  rideId: z.string(),
  senderId: z.string(),
  receiverId: z.string(),
});

// Payment schema
export const PaymentSchema = z.object({
  id: z.string().cuid(),
  createdAt: z.date(),
  amount: z.number().positive(),
  status: PaymentStatusEnum,
  passengerRideId: z.string(),
});

// Review schema
export const ReviewSchema = z.object({
  id: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  rideId: z.string(),
  reviewerId: z.string(),
  reviewedId: z.string(),
});

// Input validation schemas
export const CreateRideInput = z.object({
  startDate: z.string(),
  endDate: z.string().nullable(),
  departureTime: z.string(),
  returnTime: z.string().nullable(),
  pricePerSeat: z.number().positive(),
  seatsAvailable: z.number().int().min(0),
  status: RideStatusEnum,
  recurringPattern: RecurringPatternEnum,
  recurringDays: z.array(z.string()),
  recurringDates: z.array(z.number().int().min(1).max(31)).nullable(),
  pickupLocation: z.object({
    address: z.string(),
    latitude: z.number(),
    longitude: z.number(),
  }),
  dropoffLocation: z.object({
    address: z.string(),
    latitude: z.number(),
    longitude: z.number(),
  }),
  pickupRadius: z.number().positive(),
  dropoffRadius: z.number().positive(),
  driverId: z.string(),
  carId: z.string(),
});

export const CreateBookingInput = BookingSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  passengerRideId: true,
  isConfirmed: true,
  confirmedAt: true,
});

export const CreateRequestInput = RequestSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
});

export const CreateCarInput = CarSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
}).extend({
  images: z.array(z.string().url()).optional(),
});

export const CreateCarImageInput = CarImageSchema.omit({
  id: true,
  createdAt: true,
});

export const CreateReviewInput = ReviewSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Response types
export type Location = z.infer<typeof LocationSchema>;
export type User = z.infer<typeof UserSchema>;
export type Car = z.infer<typeof CarSchema>;
export type CarImage = z.infer<typeof CarImageSchema>;
export type Ride = z.infer<typeof RideSchema>;
export type Booking = z.infer<typeof BookingSchema>;
export type PassengerRide = z.infer<typeof PassengerRideSchema>;
export type Request = z.infer<typeof RequestSchema>;
export type Payment = z.infer<typeof PaymentSchema>;
export type Review = z.infer<typeof ReviewSchema>;

// Input types
export type CreateRideInputType = z.infer<typeof CreateRideInput>;
export type CreateBookingInputType = z.infer<typeof CreateBookingInput>;
export type CreateRequestInputType = z.infer<typeof CreateRequestInput>;
export type CreateCarInputType = z.infer<typeof CreateCarInput>;
export type CreateCarImageInputType = z.infer<typeof CreateCarImageInput>;
export type CreateReviewInputType = z.infer<typeof CreateReviewInput>; 