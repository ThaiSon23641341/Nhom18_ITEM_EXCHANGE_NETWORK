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
  completionConfirmedBy?: string[];
  cancelledBy?: string;
  cancellationReason?: string;
  cancellationPenalized?: boolean;
  cancellationPenaltyCount?: number;
  cancellationPenaltyPoints?: number;
  reminderAt?: string | null;
  reminderMinutes?: number;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
}