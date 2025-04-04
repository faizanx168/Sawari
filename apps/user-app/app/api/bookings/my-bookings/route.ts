import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/utils/auth';
import prisma from '@repo/db';
import { BookingStatus } from '@prisma/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all confirmed and completed bookings for the user
    const bookings = await prisma.booking.findMany({
      where: {
        userId: session.user.id,
        status: {
          in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED]
        }
      },
      include: {
        ride: {
          include: {
            driver: {
              select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true
              }
            },
            bookings: {
              where: {
                status: BookingStatus.CONFIRMED,
                userId: {
                  not: session.user.id // Exclude the current user
                }
              },
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    phoneNumber: true
                  }
                }
              }
            },
            pickupLocation: true,
            dropoffLocation: true,
            car: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
} 