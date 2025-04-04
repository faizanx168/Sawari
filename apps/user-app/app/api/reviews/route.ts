import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/utils/auth';
import prisma from '@repo/db';
import { z } from 'zod';

const CreateReviewSchema = z.object({
  reviewedId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(1),
  rideId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const validatedData = CreateReviewSchema.parse(data);

    // Get reviewer's ID
    const reviewer = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!reviewer) {
      return NextResponse.json({ error: 'Reviewer not found' }, { status: 404 });
    }

    // Check if the reviewed user exists
    const reviewed = await prisma.user.findUnique({
      where: { id: validatedData.reviewedId },
    });

    if (!reviewed) {
      return NextResponse.json({ error: 'Reviewed user not found' }, { status: 404 });
    }

    // Check if the reviewer has already reviewed this user
    const existingReview = await prisma.review.findFirst({
      where: {
        reviewerId: reviewer.id,
        reviewedId: validatedData.reviewedId,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this user' },
        { status: 400 }
      );
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        rating: validatedData.rating,
        comment: validatedData.comment,
        reviewerId: reviewer.id,
        reviewedId: validatedData.reviewedId,
        rideId: validatedData.rideId || '',
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create review' },
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
    const rideId = searchParams.get('rideId');
    const userId = searchParams.get('userId');

    const where: {
      rideId?: string;
      reviewedId?: string;
    } = {};

    if (rideId) {
      where.rideId = rideId;
    }

    if (userId) {
      where.reviewedId = userId;
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        reviewer: {
          select: {
            name: true,
            email: true,
          },
        },
        reviewed: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
} 