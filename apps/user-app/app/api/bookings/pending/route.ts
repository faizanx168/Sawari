import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/utils/auth';
import prisma from '@repo/db';
import { BookingStatusEnum } from '../../../types/zod';


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

    // Get all rides where the user is the driver
    const rides = await prisma.ride.findMany({
      where: {
        driverId: user.id,
      },
      include: {
        bookings: {
          where: {
            status: BookingStatusEnum.enum.PENDING,
          },
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phoneNumber: true,
              },
            },
            passengerRide: true,
          },
        },
        pickupLocation: true,
        dropoffLocation: true,
      },
    });

    // Flatten the bookings array
    const pendingBookings = rides.flatMap(ride => 
      ride.bookings.map(booking => ({
        ...booking,
        ride: {
          ...ride,
          bookings: undefined, // Remove the bookings array to avoid circular reference
        },
      }))
    );

    return NextResponse.json(pendingBookings);
  } catch (error: unknown) {
    console.error('Error fetching pending bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending bookings' },
      { status: 500 }
    );
  }
} 