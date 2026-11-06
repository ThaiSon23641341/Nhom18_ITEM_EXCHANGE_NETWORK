export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed';

export interface Appointment {
  id: string;
  itemId: string;
  requesterId: string;
  date: string;
  time: string;
  scheduledAt?: string;
  location: string;
  note?: string;
  confirmedBy?: string[];
  reminderAt?: string | null;
  reminderMinutes?: number;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
}