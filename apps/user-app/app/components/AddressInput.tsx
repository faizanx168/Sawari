/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';

interface AddressInputProps {
  value: string;
  onChange: (address: string, location: { latitude: number; longitude: number }) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
}

declare global {
  interface Window {
    google: any;
  }
}

export default function AddressInput({
  value,
  onChange,
  placeholder = 'Enter address',
  required = false,
  error,
}: AddressInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (!inputRef.current) return;

    const initializeAutocomplete = () => {
      if (!window.google?.maps?.places) return;

      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current!, {
        types: ['address'],
        componentRestrictions: { country: 'us' },
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry?.location) {
          const address = place.formatted_address;
          const location = {
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng(),
          };
          setInputValue(address);
          onChange(address, location);
          setIsLoading(false);
        }
      });

      setIsInitialized(true);
    };

    if (window.google?.maps?.places) {
      initializeAutocomplete();
    } else {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeAutocomplete;
      document.head.appendChild(script);

      return () => {
        const scriptElement = document.querySelector(`script[src="${script.src}"]`);
        if (scriptElement) {
          document.head.removeChild(scriptElement);
        }
      };
    }
  }, [onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsLoading(true);
  };

  return (
    <div className="relative">
      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
      <input
        ref={inputRef}
        type="text"
        required={required}
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        className={`pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
          error ? 'border-red-500' : ''
        }`}
      />
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
        </div>
      )}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
} 