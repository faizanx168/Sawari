import { RecurringPattern } from '../types/ride';

interface TimeSlot {
  startTime: string;
  endTime: string;
  recurringPattern: RecurringPattern;
  recurringDays?: string[];
  recurringDates?: number[];
  startDate: string;
  endDate?: string; 
}

export function hasTimeConflict(
  newSlot: TimeSlot,
  existingSlots: TimeSlot[]
): boolean {
  const newStart = new Date(`${newSlot.startDate}T${newSlot.startTime}`);
  const newEnd = new Date(`${newSlot.startDate}T${newSlot.endTime || '23:59'}`);
  
  // If it's a one-time ride
  if (newSlot.recurringPattern === 'DAILY' && !newSlot.recurringDays?.length) {
    return existingSlots.some(slot => {
      const slotStart = new Date(`${slot.startDate}T${slot.startTime}`);
      const slotEnd = new Date(`${slot.startDate}T${slot.endTime || '23:59'}`);
      return (
        (newStart >= slotStart && newStart < slotEnd) ||
        (newEnd > slotStart && newEnd <= slotEnd) ||
        (newStart <= slotStart && newEnd >= slotEnd)
      );
    });
  }

  // For recurring rides, we need to check all possible occurrences
  return existingSlots.some(slot => {
    const slotStart = new Date(`${slot.startDate}T${slot.startTime}`);
    const slotEnd = new Date(`${slot.startDate}T${slot.endTime || '23:59'}`);
    
    // If either ride is recurring, we need to check for pattern conflicts
    if (slot.recurringPattern !== 'DAILY' || slot.recurringDays?.length) {
      const newOccurrences = generateOccurrences(newSlot);
      const existingOccurrences = generateOccurrences(slot);
      
      return newOccurrences.some(newOcc => 
        existingOccurrences.some(existingOcc => 
          hasOverlap(newOcc.start, newOcc.end, existingOcc.start, existingOcc.end)
        )
      );
    }
    
    return hasOverlap(newStart, newEnd, slotStart, slotEnd);
  });
}

function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeStr.split(':').map(Number);
  if (isNaN(hours as number) || isNaN(minutes as number)) {
    throw new Error(`Invalid time format: ${timeStr}`);
  }
  return { hours: hours as number, minutes: minutes as number };
}

function generateOccurrences(slot: TimeSlot): { start: Date; end: Date }[] {
  const occurrences: { start: Date; end: Date }[] = [];
  const startDate = new Date(slot.startDate);
  const endDate = slot.endDate ? new Date(slot.endDate) : new Date('2100-12-31'); // Far future date if no end date
  
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    const dayOfMonth = currentDate.getDate();
    
    let shouldAdd = false;
    
    switch (slot.recurringPattern) {
      case 'DAILY':
        shouldAdd = true;
        break;
      case 'WEEKLY':
        shouldAdd = slot.recurringDays?.includes(dayOfWeek) || false;
        break;
      case 'MONTHLY':
        shouldAdd = slot.recurringDates?.includes(dayOfMonth) || false;
        break;
    }
    
    if (shouldAdd) {
      const { hours: startHours, minutes: startMinutes } = parseTime(slot.startTime);
      const start = new Date(currentDate);
      start.setHours(startHours);
      start.setMinutes(startMinutes);
      
      const end = new Date(currentDate);
      if (slot.endTime) {
        const { hours: endHours, minutes: endMinutes } = parseTime(slot.endTime);
        end.setHours(endHours);
        end.setMinutes(endMinutes);
      } else {
        end.setHours(23);
        end.setMinutes(59);
      }
      
      occurrences.push({ start, end });
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return occurrences;
}

function hasOverlap(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
  return (
    (start1 >= start2 && start1 < end2) ||
    (end1 > start2 && end1 <= end2) ||
    (start1 <= start2 && end1 >= end2)
  );
} 