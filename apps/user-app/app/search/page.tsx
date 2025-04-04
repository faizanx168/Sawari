'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MapPin, Clock, Users } from 'lucide-react';

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface RideOption {
  id: string;
  name: string;
  duration: string;   
  seats: number;
  type: 'economy' | 'comfort' | 'luxury';
}

export default function SearchPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [origin, setOrigin] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [rideOptions, setRideOptions] = useState<RideOption[]>([]);
  const [selectedRide, setSelectedRide] = useState<RideOption | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize Google Maps
  useEffect(() => {
    const initMap = async () => {
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        version: 'weekly',
        libraries: ['places'],
      });

      try {
        const google = await loader.load();
        const mapInstance = new google.maps.Map(mapRef.current!, {
          center: { lat: 33.7734, lng: 7.2906 }, // Default to New York City
          zoom: 12,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        const directionsRendererInstance = new google.maps.DirectionsRenderer({
          map: mapInstance,
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: '#3B82F6',
            strokeWeight: 5
          }
        });

        setMap(mapInstance);
        setDirectionsRenderer(directionsRendererInstance);

        // Initialize autocomplete for origin and destination inputs
        const originInput = document.getElementById('origin') as HTMLInputElement;
        const destinationInput = document.getElementById('destination') as HTMLInputElement;

        const originAutocomplete = new google.maps.places.Autocomplete(originInput, {
          componentRestrictions: { country: 'PK' }
        });

        const destinationAutocomplete = new google.maps.places.Autocomplete(destinationInput, {
          componentRestrictions: { country: 'PK' }
        });

        // Handle place selection
        originAutocomplete.addListener('place_changed', () => {
          const place = originAutocomplete.getPlace();
          if (place.geometry?.location) {
            const location = place.geometry.location;
            setOrigin({
              lat: location.lat(),
              lng: location.lng(),
              address: place.formatted_address || ''
            });
          }
        });

        destinationAutocomplete.addListener('place_changed', () => {
          const place = destinationAutocomplete.getPlace();
          if (place.geometry?.location) {
            const location = place.geometry.location;
            setDestination({
              lat: location.lat(),
              lng: location.lng(),
              address: place.formatted_address || ''
            });
          }
        });
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    initMap();
  }, []);

  // Update route when origin or destination changes
  useEffect(() => {
    if (map && directionsRenderer && origin && destination) {
      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        {
          origin: { lat: origin.lat, lng: origin.lng },
          destination: { lat: destination.lat, lng: destination.lng },
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === 'OK' && result && result.routes[0]?.legs[0]) {
            directionsRenderer.setDirections(result);
            // Calculate ride options based on duration
            calculateRideOptions(result.routes[0].legs[0]);
          }
        }
      );
    }
  }, [origin, destination, map, directionsRenderer]);

  const calculateRideOptions = (leg: google.maps.DirectionsLeg) => {
    const options: RideOption[] = [
      {
        id: 'economy',
        name: 'Economy',
        duration: leg.duration?.text || '',
        seats: 4,
        type: 'economy',
      },
      {
        id: 'comfort',
        name: 'Comfort',
        duration: leg.duration?.text || '',
        seats: 4,
        type: 'comfort',
      },
      {
        id: 'luxury',
        name: 'Luxury',
        duration: leg.duration?.text || '',
        seats: 3,
        type: 'luxury',
      },
    ];

    setRideOptions(options);
    if (options.length > 0) {
      setSelectedRide(options[0] || null);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      // Here you would typically make an API call to search for available rides
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error searching for rides:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Map Section */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full" />
        
        {/* Search Overlay */}
        <div className="absolute top-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-blue-500" />
              <input
                id="origin"
                type="text"
                placeholder="Pick-up location"
                className="flex-1 p-2 border rounded"
              />
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-red-500" />
              <input
                id="destination"
                type="text"
                placeholder="Drop-off location"
                className="flex-1 p-2 border rounded"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading || !origin || !destination}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Searching...' : 'Search Rides'}
            </button>
          </div>
        </div>
      </div>

      {/* Ride Options Panel */}
      <div className="w-96 bg-white shadow-lg overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Available Rides</h2>
        </div>
        <div className="p-4 space-y-4">
          {rideOptions.map((option) => (
            <div
              key={option.id}
              className={`p-4 border rounded-lg cursor-pointer ${
                selectedRide?.id === option.id ? 'border-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => setSelectedRide(option)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{option.name}</h3>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {option.duration}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {option.seats} seats
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 