import prisma  from '@repo/db';

export type NotificationType = 'booking' | 'ride' | 'system' | 'payment';

export interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  action?: {
    label: string;
    href: string;   
  };
}

export async function createNotification({
  userId,
  type,
  message,
}: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        message,
      },
    });

    // Here you could add real-time notification delivery using WebSockets
    // or push notifications using a service like Firebase Cloud Messaging

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

// Helper functions for common notification types
export async function createBookingNotification(
  userId: string,
  bookingId: string,
  message: string
) {
  return createNotification({
    userId,
    type: 'booking',
    title: 'Booking Update',
    message,
    action: {
      label: 'View Booking',
      href: `/my-bookings/${bookingId}`,
    },
  });
}

export async function createRideNotification(
  userId: string,
  rideId: string,
  message: string
) {
  return createNotification({
    userId,
    type: 'ride',
    title: 'Ride Update',
    message,
    action: {
      label: 'View Ride',
      href: `/my-rides/${rideId}`,
    },
  });
}

export async function createPaymentNotification(
  userId: string,
  amount: number,
  message: string
) {
  return createNotification({
    userId,
    type: 'payment',
    title: 'Payment Update',
    message,
    action: {
      label: 'View Payment',
      href: '/payment-history',
    },
  });
}

export async function createSystemNotification(
  userId: string,
  title: string,
  message: string
) {
  return createNotification({
    userId,
    type: 'system',
    title,
    message,
  });
} 