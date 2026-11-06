import type { Appointment } from '../../models/appointmentModel';
import type { Item } from '../../models/itemModel';
import { getItemById, MockApiError } from '../api/itemService';
import { apiRequest } from '../api/apiClient';
import {
  cancelAppointmentReminder,
  scheduleAppointmentReminder,
} from '../device/notificationService';

export type CreateAppointmentInput = Omit<
  Appointment,
  'id' | 'status' | 'createdAt' | 'updatedAt' | 'location' | 'confirmedBy'
  | 'reminderAt' | 'reminderMinutes'
>;

export function getItemAvailabilityDeadline(item: Item): string | undefined {
  if ('availableUntil' in item && typeof item.availableUntil === 'string') {
    return item.availableUntil;
  }
  return undefined;
}

let appointments: Appointment[] = [];
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());

export function subscribeToAppointments(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getAppointments(): Appointment[] {
  return appointments;
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: Appointment['status'],
): Promise<Appointment> {
  const appointment = appointments.find((candidate) => candidate.id === appointmentId);
  if (!appointment) throw new Error('Không tìm thấy lịch hẹn.');
  if (appointment.status === status && status !== 'confirmed') {
    return { ...appointment };
  }

  const updated = await apiRequest<Appointment>(
    `/appointments/${encodeURIComponent(appointmentId)}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    },
  );
  appointments = appointments.map((candidate) =>
    candidate.id === appointmentId ? updated : candidate,
  );
  notify();
  try {
    if (status === 'cancelled' || status === 'completed') {
      await cancelAppointmentReminder(appointmentId);
    } else if (status === 'confirmed') {
      const item = await getItemById(updated.itemId);
      const result = await scheduleAppointmentReminder(updated, item.title);
      if (!result.scheduled && result.reason !== 'too-soon' && result.reason !== 'web') {
        console.warn('Chưa thể đặt nhắc lịch:', result.reason);
      }
    }
  } catch (error: unknown) {
    console.error('Lịch hẹn đã cập nhật nhưng không đồng bộ được thông báo trên thiết bị:', error);
  }
  return { ...updated };
}

export async function loadAppointments(requesterId: string): Promise<Appointment[]> {
  const loaded = await apiRequest<Appointment[]>(
    `/appointments?userId=${encodeURIComponent(requesterId)}`,
  );
  appointments = loaded;
  notify();
  return appointments;
}

export async function cancelAppointment(appointmentId: string): Promise<Appointment> {
  const appointment = appointments.find((candidate) => candidate.id === appointmentId);
  if (!appointment) {
    throw new Error('Không tìm thấy lịch hẹn.');
  }
  if (appointment.status !== 'pending' && appointment.status !== 'confirmed') {
    throw new Error('Lịch hẹn này không thể hủy.');
  }

  return updateAppointmentStatus(appointment.id, 'cancelled');
}

function parseLocalDate(date: string, time: string): Date | null {
  const dateMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(date);
  const timeMatch = /^(\d{2}):([0-5]\d)$/.exec(time);
  if (!dateMatch || !timeMatch) return null;

  const result = new Date(
    Number(dateMatch[3]),
    Number(dateMatch[2]) - 1,
    Number(dateMatch[1]),
    Number(timeMatch[1]),
    Number(timeMatch[2]),
  );
  if (
    result.getFullYear() !== Number(dateMatch[3])
    || result.getMonth() !== Number(dateMatch[2]) - 1
    || result.getDate() !== Number(dateMatch[1])
    || result.getHours() !== Number(timeMatch[1])
    || result.getMinutes() !== Number(timeMatch[2])
  ) {
    return null;
  }
  return result;
}

export async function createAppointment(input: CreateAppointmentInput): Promise<Appointment> {
  const itemId = input.itemId.trim();
  const requesterId = input.requesterId.trim();
  const scheduledAt = input.scheduledAt
    ? new Date(input.scheduledAt)
    : parseLocalDate(input.date, input.time);

  if (
    !itemId
    || !requesterId
    || !scheduledAt
    || !Number.isFinite(scheduledAt.getTime())
    || scheduledAt.getTime() <= Date.now()
    || (input.note?.length ?? 0) > 500
  ) {
    throw new Error('Ngày hoặc giờ hẹn không hợp lệ.');
  }

  let item;
  try {
    item = await getItemById(itemId);
  } catch (error) {
    if (error instanceof MockApiError) {
      throw new Error('Không tìm thấy đồ dùng.');
    }
    throw error;
  }

  if (item.ownerId === requesterId) {
    throw new Error('Bạn không thể đặt lịch nhận đồ của chính mình.');
  }
  if (item.status !== 'available') {
    throw new Error('Đồ dùng này không còn khả dụng để đặt lịch.');
  }
  const availableUntil = getItemAvailabilityDeadline(item);
  if (availableUntil && scheduledAt.getTime() > Date.parse(availableUntil)) {
    throw new Error('Ngày hẹn vượt quá hạn trao của món đồ.');
  }

  const appointment = await apiRequest<Appointment>('/appointments', {
    method: 'POST',
    body: JSON.stringify({
      ...input,
      itemId,
      requesterId,
      scheduledAt: scheduledAt.toISOString(),
    }),
  });
  appointments = [appointment, ...appointments];
  notify();
  return { ...appointment };
}
