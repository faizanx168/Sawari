import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json(
      { error: 'Latitude and longitude are required' },
      { status: 400 }
    );
  }

  try {
    // Use OpenStreetMap's Nominatim service for reverse geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'Sawari/1.0', // Required by Nominatim's terms of service
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch address');
    }

    const data = await response.json();

    if (!data.display_name) {
      throw new Error('No address found for these coordinates');
    }

    // Format the address in a more readable way
    const address = data.display_name
      .split(',')
      .map((part: string) => part.trim())
      .filter(Boolean)
      .join(', ');

    return NextResponse.json({
      address,
      location: {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      },
    });
  } catch (error) {
    console.error('Geocoding error:', error);
    return NextResponse.json(
      { error: 'Failed to get address from coordinates' },
      { status: 500 }
    );
  }
} 