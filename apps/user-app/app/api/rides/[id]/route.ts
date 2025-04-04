import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/utils/auth';
import prisma from '@repo/db';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await context.params;
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ride = await prisma.ride.findUnique({
      where: {
        id,
      },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            reviewsReceived: {
              select: {
                rating: true,
              },
            },
          },
        },
        pickupLocation: true,
        dropoffLocation: true,
        car: true,
        bookings: {
          select: {
            id: true,
            status: true,
            seats: true,
          },
        },
      },
    });

    if (!ride) {
      return NextResponse.json({ error: 'Ride not found' }, { status: 404 });
    }

    // Calculate driver's average rating
    const ratings = ride.driver.reviewsReceived.map(review => review.rating);
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
      : 0;

    // Add the average rating to the response
    const rideWithRating = {
      ...ride,
      driver: {
        ...ride.driver,
        averageRating,
        totalReviews: ratings.length,
      },
    };

    return NextResponse.json(rideWithRating);
  } catch (error) {
    console.error('Error fetching ride:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ride' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await context.params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const {
      date,
      departureTime,
      returnTime,
      pricePerSeat,
      seatsAvailable,
      pickupLocation,
      dropoffLocation,
    } = await req.json();

    // Validate required fields
    if (!date || !departureTime || !pricePerSeat || !seatsAvailable || !pickupLocation || !dropoffLocation) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if ride exists and belongs to user
    const existingRide = await prisma.ride.findUnique({
      where: {
        id,
        driverId: session.user.id,
      },
    });

    if (!existingRide) {
      return NextResponse.json(
        { error: 'Ride not found' },
        { status: 404 }
      );
    }

    // Update locations
    await prisma.location.update({
      where: { id: existingRide.pickupLocationId },
      data: {
        address: pickupLocation,
      },
    });

    await prisma.location.update({
      where: { id: existingRide.dropoffLocationId },
      data: {
        address: dropoffLocation,
      },
    });

    // Update ride
    const ride = await prisma.ride.update({
      where: { id },
      data: {
        date: date.toString(),
        departureTime,
        returnTime,
        pricePerSeat,
        seatsAvailable,
      },
      include: {
        pickupLocation: true,
        dropoffLocation: true,
      },
    });

    return NextResponse.json(ride);
  } catch (error) {
    console.error('Error updating ride:', error);
    return NextResponse.json(
      { error: 'Failed to update ride' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await context.params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if ride exists and belongs to user
    const ride = await prisma.ride.findUnique({
      where: {
        id,
        driverId: session.user.id,
      },
    });

    if (!ride) {
      return NextResponse.json(
        { error: 'Ride not found' },
        { status: 404 }
      );
    }

    // Delete ride and associated locations
    await prisma.ride.delete({
      where: { id },
    });

    await prisma.location.delete({
      where: { id: ride.pickupLocationId },
    });

    await prisma.location.delete({
      where: { id: ride.dropoffLocationId },
    });

    return NextResponse.json({ message: 'Ride deleted successfully' });
  } catch (error) {
    console.error('Error deleting ride:', error);
    return NextResponse.json(
      { error: 'Failed to delete ride' },
      { status: 500 }
    );
  }
} 