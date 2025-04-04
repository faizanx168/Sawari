import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/utils/auth';
import prisma from '@repo/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      console.log('No user session found');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Fetching rides for user:', session.user.id);

    const rides = await prisma.ride.findMany({
      where: {
        driverId: session.user.id,
      },
      include: {
        pickupLocation: true,
        dropoffLocation: true,
        driver: {
          select: {
            name: true,
            email: true,
          },
        },
        car: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Log the rides for debugging
    console.log('Found rides:', rides.length);
    if (rides.length > 0) {
      console.log('First ride:', JSON.stringify(rides[0], null, 2));
    } else {
      console.log('No rides found for user');
    }

    return NextResponse.json(rides);
  } catch (error) {
    console.error('Error fetching user rides:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rides', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}   