import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/utils/auth';
import prisma from '@repo/db';
import { BookingStatusEnum } from '../../types/zod';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { rideId, seats, totalPrice, isRecurring, recurringDays } = body;

    // Validate input
    if (!rideId || !seats || !totalPrice) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user has already booked this ride
    const existingBooking = await prisma.booking.findFirst({
      where: {
        userId: user.id,
        rideId: rideId,
        status: {
          in: [BookingStatusEnum.enum.PENDING, BookingStatusEnum.enum.CONFIRMED]
        }
      }
    });

    if (existingBooking) {
      return NextResponse.json(
        { error: 'You have already booked this ride' },
        { status: 400 }
      );
    }

    // Check if ride exists and has available seats
    const ride = await prisma.ride.findUnique({
      where: { id: rideId },
      include: {
        bookings: {
          where: {
            status: BookingStatusEnum.enum.CONFIRMED,
          },
        },
      },
    });

    if (!ride) {
      return NextResponse.json({ error: 'Ride not found' }, { status: 404 });
    }

    // Calculate total booked seats
    const totalBookedSeats = ride.bookings.reduce(
      (sum, booking) => sum + booking.seats,
      0
    );

    if (totalBookedSeats + seats > ride.seatsAvailable) {
      return NextResponse.json(
        { error: 'Not enough seats available' },
        { status: 400 }
      );
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        rideId,
        userId: user.id,
        seats,
        totalPrice,
        status: BookingStatusEnum.enum.PENDING,
        isRecurring,
        recurringDays,
      },
      include: {
        ride: {
          include: {
            driver: true,
            pickupLocation: true,
            dropoffLocation: true,
          },
        },
      },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        userId: user.id,
      },
      include: {
        ride: {
          include: {
            driver: true,
            pickupLocation: true,
            dropoffLocation: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// New endpoint for confirming bookings
export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId, action } = body;

    if (!bookingId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        ride: {
          include: {
            bookings: {
              where: {
                status: BookingStatusEnum.enum.CONFIRMED,
              },
            },
          },
        },
        passengerRide: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Verify the user is the driver of the ride
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || booking.ride.driverId !== user.id) {
      return NextResponse.json(
        { error: 'Only the driver can confirm or reject bookings' },
        { status: 403 }
      );
    }

    // If confirming, check if there are enough seats available
    if (action === 'confirm') {
      // Calculate total booked seats (excluding this booking)
      const totalBookedSeats = booking.ride.bookings.reduce(
        (sum, existingBooking) => sum + existingBooking.seats,
        0
      );

      // Check if confirming this booking would exceed available seats
      if (totalBookedSeats + booking.seats > booking.ride.seatsAvailable) {
        return NextResponse.json(
          { error: 'Not enough seats available to confirm this booking' },
          { status: 400 }
        );
      }
    }

    // Update booking status based on action
    const updateData = {
      status: action === 'confirm' ? BookingStatusEnum.enum.CONFIRMED : BookingStatusEnum.enum.CANCELLED,
      ...(action === 'confirm' && {
        isConfirmed: true,
        confirmedAt: new Date(),
      }),
    };

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: updateData,
      include: {
        ride: {
          include: {
            pickupLocation: true,
            dropoffLocation: true,
            driver: true,
          },
        },
        passengerRide: true,
      },
    });

    return NextResponse.json(updatedBooking);
  } catch (error: unknown) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
} 