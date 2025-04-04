import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import prisma  from '@repo/db';

export async function POST(req: Request) {
  try {
    const { email, name, password, phoneNumber, homeAddress, destinationAddress } = await req.json();

    // Validate required fields
    if (!email || !name || !password || !homeAddress || !destinationAddress || !phoneNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user with locations
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        phoneNumber,
          
        homeLocation: {
          create: {
            address: homeAddress,
            latitude: 0, // You'll need to implement geocoding
            longitude: 0,
          }
        },
        destinationLocation: {
          create: {
            address: destinationAddress,
            latitude: 0, // You'll need to implement geocoding
            longitude: 0,
          }
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        phoneNumber: true,
        homeLocation: true,
        destinationLocation: true,
       
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 