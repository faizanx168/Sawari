// Function to convert degrees to radians
function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Function to calculate distance between two points using Haversine formula
export function calculateDistanceSync(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Function to calculate distance using Google Maps Distance Matrix API
export async function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): Promise<number> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${lat1},${lon1}&destinations=${lat2},${lon2}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();
    
    if (data.status === 'OK' && data.rows[0].elements[0].status === 'OK') {
      // Convert meters to kilometers
      return data.rows[0].elements[0].distance.value / 1000;
    }
    
    // Fallback to Haversine formula if API fails
    return calculateDistanceSync(lat1, lon1, lat2, lon2);
  } catch (error) {
    console.error('Error calculating distance:', error);
    // Fallback to Haversine formula if API fails
    return calculateDistanceSync(lat1, lon1, lat2, lon2);
  }
} 