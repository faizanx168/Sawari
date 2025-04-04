import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/utils/auth';
import prisma from '@repo/db';




export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all rides where the user is the driver
    const rides = await prisma.ride.findMany({
      where: {
        driver: {
          email: session.user.email,
        },
        date: {
          gte: new Date().toISOString().split('T')[0], // Only future rides
        },
      },
      include: {
        pickupLocation: true,
        dropoffLocation: true,
        bookings: {
          where: {
            status: 'CONFIRMED',
          },
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Transform the data to include passenger information
    const transformedRides = rides.map((ride) => {
      const totalBookedSeats = ride.bookings.reduce((acc, booking) => acc + (booking.seats || 0), 0);
      const availableSeats = Math.max(0, (ride.seatsAvailable || 0) - totalBookedSeats);

      return {
        id: ride.id,
        date: ride.date,
        departureTime: ride.departureTime,
        returnTime: ride.returnTime,
        pickupLocation: {
          address: ride.pickupLocation?.address || '',
          latitude: ride.pickupLocation?.latitude || 0,
          longitude: ride.pickupLocation?.longitude || 0,
        },
        dropoffLocation: {
          address: ride.dropoffLocation?.address || '',
          latitude: ride.dropoffLocation?.latitude || 0,
          longitude: ride.dropoffLocation?.longitude || 0,
        },
        totalSeats: ride.seatsAvailable || 0,
        availableSeats,
        passengers: ride.bookings.map((booking) => ({
          id: booking.id,
          name: booking.user.name || 'Unknown',
          email: booking.user.email || '',
          pickupAddress: ride.pickupLocation?.address || '',
          pickupLatitude: ride.pickupLocation?.latitude || 0,
          pickupLongitude: ride.pickupLocation?.longitude || 0,
          seats: booking.seats || 0,
        })),
      };
    });

    return NextResponse.json(transformedRides);
  } catch (error) {
    console.error('Error fetching driver rides:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rides' },
      { status: 500 }
    );
  }
} 