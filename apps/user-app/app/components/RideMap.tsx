'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Ride } from '../types/ride';
import { Location } from '../types/location';

interface RideMapProps {
  rides: Ride[];
  fromLocation: Location | null;
  toLocation: Location | null;
  selectedRideId: string | null;
  selectedRoute: { origin: Location; destination: Location } | null;
  onRideSelect: (rideId: string) => void;
  maxDistance: number;
}

export default function RideMap({
  rides,
  fromLocation,
  selectedRideId,
  selectedRoute,
  onRideSelect,
  maxDistance
}: RideMapProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const circleRef = useRef<google.maps.Circle | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapDivRef = useRef<HTMLDivElement>(null);

  // Initialize map
  useEffect(() => {
    if (!mapLoaded && mapDivRef.current) {
      const initMap = async () => {
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
          version: 'weekly',
          libraries: ['places']
        });

        try {
          await loader.load();
          const defaultCenter = { lat: 40.7128, lng: -74.0060 }; // New York City
          mapRef.current = new google.maps.Map(mapDivRef.current!, {
            center: defaultCenter,
            zoom: 12,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ]
          });
          setMapLoaded(true);
        } catch (error) {
          console.error('Error loading Google Maps:', error);
        }
      };

      initMap();
    }
  }, [mapLoaded]);

  // Update route display
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    // Clear existing directionsRenderer
    if (directionsRenderer) {
      directionsRenderer.setMap(null);
      setDirectionsRenderer(null);
    }

    if (selectedRoute) {
      // Create new directionsRenderer
      const renderer = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
        preserveViewport: false,
        polylineOptions: {
          strokeColor: '#3B82F6',
          strokeWeight: 4,
          strokeOpacity: 0.8
        }
      });
      renderer.setMap(mapRef.current);
      setDirectionsRenderer(renderer);

      // Calculate and display route
      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        {
          origin: { lat: selectedRoute.origin.latitude, lng: selectedRoute.origin.longitude },
          destination: { lat: selectedRoute.destination.latitude, lng: selectedRoute.destination.longitude },
          travelMode: google.maps.TravelMode.DRIVING
        },
        (result, status) => {
          if (status === 'OK' && result) {
            renderer.setDirections(result);
            
            // Add markers for origin and destination
            const originMarker = new google.maps.Marker({
              position: { lat: selectedRoute.origin.latitude, lng: selectedRoute.origin.longitude },
              map: mapRef.current!,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 12,
                fillColor: '#2563eb',
                fillOpacity: 0.9,
                strokeColor: 'white',
                strokeWeight: 2,
              },
              title: 'Pickup Location'
            });

            const destinationMarker = new google.maps.Marker({
              position: { lat: selectedRoute.destination.latitude, lng: selectedRoute.destination.longitude },
              map: mapRef.current!,
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 12,
                fillColor: '#dc2626',
                fillOpacity: 0.9,
                strokeColor: 'white',
                strokeWeight: 2,
              },
              title: 'Dropoff Location'
            });

            markersRef.current.push(originMarker, destinationMarker);

            // Fit bounds to show the entire route
            const bounds = new google.maps.LatLngBounds();
            bounds.extend({ lat: selectedRoute.origin.latitude, lng: selectedRoute.origin.longitude });
            bounds.extend({ lat: selectedRoute.destination.latitude, lng: selectedRoute.destination.longitude });
            mapRef.current?.fitBounds(bounds);
            // Add some padding by adjusting the zoom level slightly
            if (mapRef.current?.getZoom()) {
              mapRef.current.setZoom(mapRef.current.getZoom()! - 1);
            }
          }
        }
      );
    } else {
      // Reset markers and show all rides
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      rides.forEach(ride => {
        const marker = new google.maps.Marker({
          position: {
            lat: ride.pickupLocation.latitude,
            lng: ride.pickupLocation.longitude
          },
          map: mapRef.current,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: selectedRideId === ride.id ? 12 : 10,
            fillColor: selectedRideId === ride.id ? '#2563eb' : '#60a5fa',
            fillOpacity: 0.9,
            strokeColor: 'white',
            strokeWeight: 2,
          },
          title: `$${ride.pricePerSeat} - ${ride.seatsAvailable} seats`
        });

        marker.addListener('click', () => {
          onRideSelect(ride.id);
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div class="p-2">
              <div class="font-semibold">$${ride.pricePerSeat} per seat</div>
              <div class="text-sm text-gray-600">${ride.seatsAvailable} seats available</div>
              <div class="text-sm text-gray-600">${new Date(ride.departureTime).toLocaleTimeString()}</div>
            </div>
          `
        });

        marker.addListener('mouseover', () => {
          infoWindow.open(mapRef.current, marker);
        });

        marker.addListener('mouseout', () => {
          infoWindow.close();
        });

        markersRef.current.push(marker);
      });

      // Reset map view if fromLocation exists
      if (fromLocation) {
        mapRef.current.setCenter({ lat: fromLocation.latitude, lng: fromLocation.longitude });
        mapRef.current.setZoom(12);
      }
    }

    return () => {
      directionsRenderer?.setMap(null);
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    };
  }, [selectedRoute, mapLoaded, rides, selectedRideId, onRideSelect, fromLocation, directionsRenderer]);

  // Update search radius circle
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !fromLocation) return;

    if (circleRef.current) {
      circleRef.current.setMap(null);
    }

    circleRef.current = new google.maps.Circle({
      map: mapRef.current,
      center: { lat: fromLocation.latitude, lng: fromLocation.longitude },
      radius: maxDistance * 1609.34, // Convert miles to meters
      fillColor: '#3b82f6',
      fillOpacity: 0.1,
      strokeColor: '#2563eb',
      strokeOpacity: 0.8,
      strokeWeight: 2,
    });
  }, [fromLocation, maxDistance, mapLoaded]);

  return <div ref={mapDivRef} id="map" className="w-full h-full rounded-lg" />;
} 