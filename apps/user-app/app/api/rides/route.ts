import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/utils/auth';
import prisma from '@repo/db';
import { CreateRideInput, CreateRideInputType } from '../../types/zod';
import { ZodError } from 'zod';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // Validate input data
    const validatedData = CreateRideInput.parse(data) as CreateRideInputType;

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create pickup and dropoff locations
    const [pickupLocationRecord, dropoffLocationRecord] = await Promise.all([
      prisma.location.create({
        data: {
          address: validatedData.pickupLocation.address,
          latitude: validatedData.pickupLocation.latitude,
          longitude: validatedData.pickupLocation.longitude,
        },
      }),
      prisma.location.create({
        data: {
          address: validatedData.dropoffLocation.address,
          latitude: validatedData.dropoffLocation.latitude,
          longitude: validatedData.dropoffLocation.longitude,
        },
      }),
    ]);

    // Create the ride
    const ride = await prisma.ride.create({
      data: {
        date: validatedData.startDate, 
        departureTime: validatedData.departureTime,
        returnTime: validatedData.returnTime,
        pricePerSeat: validatedData.pricePerSeat,
        seatsAvailable: validatedData.seatsAvailable,
        isRecurring: validatedData.recurringDates ? true : false,
        recurringDays: validatedData.recurringDays,
        pickupLocationId: pickupLocationRecord.id,
        dropoffLocationId: dropoffLocationRecord.id,
        pickupRadius: validatedData.pickupRadius,
        dropoffRadius: validatedData.dropoffRadius,
        driverId: user.id,
        carId: validatedData.carId,
        status: 'PENDING',
      },
      include: {
        pickupLocation: true,
        dropoffLocation: true,
        car: true,
        driver: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(ride);
  } catch (error) {
    console.error('Error creating ride:', error);
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create ride' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const where: {
      status: 'ACTIVE';
      seatsAvailable: { gt: number };
      date?: string;
      pickupLocation?: { address: { contains: string; mode: 'insensitive' } };
      dropoffLocation?: { address: { contains: string; mode: 'insensitive' } };
    } = {
      status: 'ACTIVE',
      seatsAvailable: {
        gt: 0,
      },
    };

    if (date) {
      where.date = date.toString();
    }

    if (from) {
      where.pickupLocation = {
        address: {
          contains: from,
          mode: 'insensitive',
        },
      };
    }

    if (to) {
      where.dropoffLocation = {
        address: {
          contains: to,
          mode: 'insensitive',
        },
      };
    }

    const rides = await prisma.ride.findMany({
      where,
      include: {
        pickupLocation: true,
        dropoffLocation: true,
        car: true,
        driver: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    return NextResponse.json(rides);
  } catch (error) {
    console.error('Error fetching rides:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rides' },
      { status: 500 }
    );
  }
} 