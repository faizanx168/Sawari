/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import Image from 'next/image';
import ConfirmationDialog from '../components/ConfirmationDialog';
  
interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  seats: number;
  images: { id: string; url: string }[];
}

export default function MyCars() {
  const router = useRouter();
  const { data: session } = useSession();
  const [cars, setCars] = useState<Car[]>([]);
  const [isAddingCar, setIsAddingCar] = useState(false);
  const [isDeletingCar, setIsDeletingCar] = useState<string | null>(null);
  const [carToDelete, setCarToDelete] = useState<string | null>(null);
  const [newCar, setNewCar] = useState({
    make: '',
    model: '',
    year: '',
    color: '',
    licensePlate: '',
    seats: '',
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Placeholder image for when car images fail to load
  const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 800 600'%3E%3Crect fill='%23f3f4f6' width='800' height='600'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='24' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ECar Image%3C/text%3E%3C/svg%3E";

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const response = await fetch('/api/cars');
      if (!response.ok) throw new Error('Failed to fetch cars');
      const data = await response.json();
      setCars(data);
    } catch (error) {
      toast.error('Failed to load cars');
      console.error('Error fetching cars:', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      // Validate file types
      const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
      if (invalidFiles.length > 0) {
        toast.error('Please select only image files');
        return;
      }

      // Validate file sizes (5MB limit)
      const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        toast.error('Image files must be less than 5MB');
        return;
      }

      setSelectedImages(files);
    }
  };

  const uploadImages = async (carId: string) => {
    if (selectedImages.length === 0) {
      console.log('No images selected for upload');
      return;
    }

    console.log('Starting image upload process for car:', carId);
    console.log('Number of images to upload:', selectedImages.length);
    console.log('Cloudinary config:', {
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
    });

    const uploadPromises = selectedImages.map(async (file) => {
      console.log('Processing file:', file.name);
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
      if (!uploadPreset) {
        console.error('Cloudinary upload preset is missing');
        throw new Error('Cloudinary upload preset is not configured');
      }
      formData.append('upload_preset', uploadPreset);

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      if (!cloudName) {
        console.error('Cloudinary cloud name is missing');
        throw new Error('Cloudinary cloud name is not configured');
      }

      try {
        console.log('Uploading to Cloudinary...');
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Cloudinary upload failed:', errorData);
          throw new Error(errorData.error?.message || 'Failed to upload image to Cloudinary');
        }

        const data = await response.json();
        console.log('Cloudinary upload successful:', data.secure_url);

        console.log('Saving image URL to database...');
        const dbResponse = await fetch(`/api/cars/${carId}/images`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: data.secure_url }),
        });

        if (!dbResponse.ok) {
          const errorData = await dbResponse.json();
          console.error('Database save failed:', errorData);
          throw new Error(errorData.error || 'Failed to save image URL to database');
        }
        console.log('Image URL saved to database successfully');
      } catch (error) {
        console.error('Error in upload process:', error);
        throw error;
      }
    });

    try {
      await Promise.all(uploadPromises);
      console.log('All images uploaded successfully');
      toast.success('Images uploaded successfully');
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload one or more images');
      throw new Error('Failed to upload one or more images');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate file types and sizes before uploading
      for (const file of selectedImages) {
        if (!file.type.startsWith('image/')) {
          throw new Error(`File "${file.name}" is not an image`);
        }
        // 5MB limit
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File "${file.name}" exceeds 5MB size limit`);
        }
      }

      const response = await fetch('/api/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newCar,
          year: parseInt(newCar.year),
          seats: parseInt(newCar.seats),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create car');
      }

      const car = await response.json();

      if (selectedImages.length > 0) {
        try {
          await uploadImages(car.id);
        } catch (uploadError) {
          // If image upload fails, we'll show the error but keep the car
          toast.error(uploadError instanceof Error ? uploadError.message : 'Failed to upload images');
          console.error('Error uploading images:', uploadError);
        }
      }

      toast.success('Car added successfully');
      setIsAddingCar(false);
      setNewCar({
        make: '',
        model: '',
        year: '',
        color: '',
        licensePlate: '',
        seats: '',
      });
      setSelectedImages([]);
      fetchCars();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add car');
      console.error('Error adding car:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteImage = async (carId: string, imageId: string) => {
    try {
      const response = await fetch(`/api/cars/${carId}/images?imageId=${imageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete image');
      toast.success('Image deleted successfully');
      fetchCars();
    } catch (error) {
      toast.error('Failed to delete image');
      console.error('Error deleting image:', error);
    }
  };

  const handleDeleteCar = async (carId: string) => {
    try {
      setIsDeletingCar(carId);
      const response = await fetch(`/api/cars/${carId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete car');
      }

      toast.success('Car deleted successfully');
      fetchCars();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete car');
      console.error('Error deleting car:', error);
    } finally {
      setIsDeletingCar(null);
    }
  };

  return (
    <>
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Cars</h1>
        <Button onClick={() => setIsAddingCar(true)}>Add New Car</Button>
      </div>

      {isAddingCar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Add New Car</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="make">Make</Label>
                <Input
                  id="make"
                  value={newCar.make}
                  onChange={(e) => setNewCar({ ...newCar, make: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={newCar.model}
                  onChange={(e) => setNewCar({ ...newCar, model: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={newCar.year}
                  onChange={(e) => setNewCar({ ...newCar, year: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={newCar.color}
                  onChange={(e) => setNewCar({ ...newCar, color: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="licensePlate">License Plate</Label>
                <Input
                  id="licensePlate"
                  value={newCar.licensePlate}
                  onChange={(e) => setNewCar({ ...newCar, licensePlate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="seats">Number of Seats</Label>
                <Input
                  id="seats"
                  type="number"
                  value={newCar.seats}
                  onChange={(e) => setNewCar({ ...newCar, seats: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="images">Car Images</Label>
                <Input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddingCar(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Adding...' : 'Add Car'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map((car) => (
          <div key={car.id} className="border rounded-lg p-4">
            <div className="aspect-video relative mb-4">
              {car.images && car.images.length > 0 && car.images[0] ? (
                <Image
                  src={car.images[0].url}
                  alt={`${car.make} ${car.model}`}
                  fill
                  className="object-cover rounded-md"
                  onError={(e) => {
                    console.error('Error loading image:', e);
                    // Fallback to a placeholder if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.src = placeholderImage;
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
            </div>
            <h3 className="text-lg font-semibold">
              {car.year} {car.make} {car.model}
            </h3>
            <p className="text-gray-600">Color: {car.color}</p>
            <p className="text-gray-600">License Plate: {car.licensePlate}</p>
            <p className="text-gray-600">Seats: {car.seats}</p>
            {car.images && car.images.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Images</h4>
                <div className="grid grid-cols-2 gap-2">
                  {car.images.map((image) => (
                    <div key={image.id} className="relative aspect-video">
                      <Image
                        src={image.url}
                        alt="Car"
                        fill
                        className="object-cover rounded-md"
                        onError={(e) => {
                          console.error('Error loading image:', e);
                          // Fallback to a placeholder if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.src = placeholderImage;
                        }}
                      />
                      <button
                        onClick={() => handleDeleteImage(car.id, image.id)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                className="bg-red-500 text-white hover:bg-red-600"
                onClick={() => setCarToDelete(car.id)}
                disabled={isDeletingCar === car.id}
              >
                {isDeletingCar === car.id ? 'Deleting...' : 'Delete Car'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Dialog for Car Deletion */}
      <ConfirmationDialog
        isOpen={!!carToDelete}
        onClose={() => setCarToDelete(null)}
        onConfirm={() => carToDelete && handleDeleteCar(carToDelete)}
        title="Delete Car"
        message="Are you sure you want to delete this car? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
    </>
  );
} 