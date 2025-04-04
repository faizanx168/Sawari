import { NextResponse } from 'next/server'
import prisma from '@repo/db'
import { Prisma, Location, Ride } from '@prisma/client'
import { calculateDistanceSync } from '../../../utils/distance'

function validateCoordinates(lat: string | null, lng: string | null): { latitude: number; longitude: number } | null {
  if (!lat || !lng) return null;
  
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  
  if (isNaN(latitude) || isNaN(longitude)) return null;
  if (latitude < -90 || latitude > 90) return null;
  if (longitude < -180 || longitude > 180) return null;
  
  return { latitude, longitude };
}

// Define the type for a ride with its relations
type RideWithRelations = Ride & {
  pickupLocation: Location;
  dropoffLocation: Location;
  driver: {
    id: string;
    name: string | null;
    image: string | null;
  };
  car: {
    id: string;
    make: string;
    model: string;
    year: number;
    color: string;
    licensePlate: string;
  };
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const seats = parseInt(searchParams.get('seats') || '1')
    const fromLat = searchParams.get('fromLat')
    const fromLng = searchParams.get('fromLng')
    const toLat = searchParams.get('toLat')
    const toLng = searchParams.get('toLng')
    const maxDistance = parseFloat(searchParams.get('maxDistance') || '30')

    console.log('Search parameters:', {
      from,
      to,
      seats,
      fromLat,
      fromLng,
      toLat,
      toLng,
      maxDistance
    })

    // Validate input parameters
    if (seats < 1) {
      return NextResponse.json(
        { message: 'Number of seats must be at least 1' },
        { status: 400 }
      )
    }

    if (maxDistance < 0 || maxDistance > 100) {
      return NextResponse.json(
        { message: 'Maximum distance must be between 0 and 100 miles' },
        { status: 400 }
      )
    }

    // Validate coordinates
    const fromCoords = validateCoordinates(fromLat, fromLng)
    const toCoords = validateCoordinates(toLat, toLng)

    console.log('Validated coordinates:', {
      fromCoords,
      toCoords
    })

    // Base query conditions
    const where: Prisma.RideWhereInput = {
      OR: [
        { status: 'ACTIVE' },
        { status: 'PENDING' }
      ],
      seatsAvailable: { gte: seats },
    }

    console.log('Prisma where clause:', where)

    // Fetch rides with all necessary relations
    const rides = await prisma.ride.findMany({
      where,
      include: {
        pickupLocation: true,
        dropoffLocation: true,
        driver: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        },
        car: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            color: true,
            licensePlate: true
          }
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }) as RideWithRelations[]

    console.log('Found rides before distance filtering:', rides.length)
    console.log('Sample ride data:', rides[0])

    // If no coordinates provided, return all matching rides
    if (!fromCoords) {
      return NextResponse.json(rides)
    }

    // Filter rides based on pickup location distance
    const filteredRides = rides.filter(ride => {
      if (!ride.pickupLocation || !ride.dropoffLocation) {
        console.log('Ride missing location data:', ride.id)
        return false
      }

      // Calculate distance from user's pickup location to ride's pickup location
      const pickupDistance = calculateDistanceSync(
        fromCoords.latitude,
        fromCoords.longitude,
        ride.pickupLocation.latitude,
        ride.pickupLocation.longitude
      )
      // Convert kilometers to miles
      const pickupDistanceMiles = pickupDistance * 0.621371

      console.log('Ride pickup distance:', {
        rideId: ride.id,
        pickupDistanceMiles,
        maxDistance,
        pickupLocation: ride.pickupLocation.address,
        status: ride.status,
        seatsAvailable: ride.seatsAvailable
      })

      // If destination coordinates are provided, also check dropoff distance
      if (toCoords) {
        const dropoffDistance = calculateDistanceSync(
          toCoords.latitude,
          toCoords.longitude,
          ride.dropoffLocation.latitude,
          ride.dropoffLocation.longitude
        )
        // Convert kilometers to miles
        const dropoffDistanceMiles = dropoffDistance * 0.621371

        console.log('Ride dropoff distance:', {
          rideId: ride.id,
          dropoffDistanceMiles,
          maxDistance,
          dropoffLocation: ride.dropoffLocation.address
        })

        // Return true only if both pickup and dropoff are within maxDistance
        return pickupDistanceMiles <= maxDistance && dropoffDistanceMiles <= maxDistance
      }

      // If no destination coordinates, only check pickup distance
      return pickupDistanceMiles <= maxDistance
    })

    console.log('Found rides after distance filtering:', filteredRides.length)

    // Add distance information to each ride
    const ridesWithDistance = filteredRides.map(ride => ({
      ...ride,
      distance: {
        pickup: calculateDistanceSync(
          fromCoords.latitude,
          fromCoords.longitude,
          ride.pickupLocation.latitude,
          ride.pickupLocation.longitude
        ) * 0.621371,
        dropoff: toCoords ? calculateDistanceSync(
          toCoords.latitude,
          toCoords.longitude,
          ride.dropoffLocation.latitude,
          ride.dropoffLocation.longitude
        ) * 0.621371 : null
      }
    }))

    return NextResponse.json(ridesWithDistance)
  } catch (error) {
    console.error('Error searching rides:', error)
    return NextResponse.json(
      { message: 'Failed to search rides' },
      { status: 500 }
    )
  }
} 