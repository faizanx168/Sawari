import { z } from 'zod';

// User input validation schemas
export const userSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .max(100)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
});

export const rideSchema = z.object({
  pickupLocation: z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string(),
  }),
  dropoffLocation: z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string(),
  }),
  departureTime: z.string().datetime(),
  seatsAvailable: z.number().min(1).max(8),
  pricePerSeat: z.number().min(0),
  recurringDays: z.array(z.number()).optional(),
  recurringEndDate: z.string().datetime().optional(),
});

export const bookingSchema = z.object({
  rideId: z.string().uuid(),
  seats: z.number().min(1),
  message: z.string().max(500).optional(),
});

// Basic string sanitization for middleware
export const sanitizeString = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove < and > characters
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

// Input sanitization for middleware
export const sanitizeObject = <T extends Record<string, unknown>>(obj: T): T => {
  const sanitized = {} as { [K in keyof T]: unknown };
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key as keyof T] = sanitizeString(value);
    } else if (value && typeof value === 'object') {
      sanitized[key as keyof T] = Array.isArray(value)
        ? value.map(item => typeof item === 'string' ? sanitizeString(item) : item)
        : sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key as keyof T] = value;
    }
  }
  
  return sanitized as T;
};

// Security utility functions
export const validateAndSanitizeInput = async <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<T> => {
  try {
    // First validate the structure and types
    const validated = await schema.parseAsync(data);
    
    // Then sanitize any string values if the validated data is an object
    if (validated && typeof validated === 'object') {
      return sanitizeObject(validated as Record<string, unknown>) as T;
    }
    
    return validated;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
};

// Rate limiting helper
export const isRateLimited = (
  requests: number,
  timeWindow: number,
  maxRequests: number
): boolean => {
  return requests >= maxRequests;
};

// Security headers
export const securityHeaders = {
  'Content-Security-Policy': 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "img-src 'self' data: https: blob:; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "connect-src 'self' https://maps.googleapis.com https://api.cloudinary.com; " +
    "frame-src 'self'; " +
    "object-src 'none';",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self), payment=()'
}; 