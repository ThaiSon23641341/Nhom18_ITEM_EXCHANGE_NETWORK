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
  location: string;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
}