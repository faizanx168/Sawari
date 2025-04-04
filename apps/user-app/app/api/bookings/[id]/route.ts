import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/utils/auth';
import prisma from '@repo/db';
import { BookingStatusEnum } from '../../../types/zod';

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
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

    const { id } = await context.params;

    // Get the booking
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        ride: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if the user owns this booking
    if (booking.userId !== user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own bookings' },
        { status: 403 }
      );
    }

    // Check if the booking is already completed or cancelled
    if (
      booking.status === BookingStatusEnum.enum.COMPLETED ||
      booking.status === BookingStatusEnum.enum.CANCELLED
    ) {
      return NextResponse.json(
        { error: 'Cannot delete a completed or cancelled booking' },
        { status: 400 }
      );
    }

    // Delete the booking
    await prisma.booking.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { error: 'Failed to delete booking' },
      { status: 500 }
    );
  }
} 