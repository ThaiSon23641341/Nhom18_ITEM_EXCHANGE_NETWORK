import type { Appointment } from '../../models/appointmentModel';
import { getItemById, MockApiError, updateItem } from '../api/itemService';

export type CreateAppointmentInput = Omit<
  Appointment,
  'id' | 'status' | 'createdAt' | 'updatedAt'
>;

let appointments: Appointment[] = [];
const listeners = new Set<() => void>();
let nextAppointmentId = 1;

const notify = () => listeners.forEach((listener) => listener());

export function subscribeToAppointments(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getAppointments(): Appointment[] {
  return appointments;
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
  const location = input.location.trim();
  const scheduledAt = input.scheduledAt
    ? new Date(input.scheduledAt)
    : parseLocalDate(input.date, input.time);

  if (
    !itemId
    || !requesterId
    || !scheduledAt
    || !Number.isFinite(scheduledAt.getTime())
    || scheduledAt.getTime() <= Date.now()
    || !location
    || location.length > 200
    || (input.note?.length ?? 0) > 500
  ) {
    throw new Error('Ngày, giờ hoặc địa điểm hẹn không hợp lệ.');
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

  const now = new Date().toISOString();
  const appointment: Appointment = {
    ...input,
    itemId,
    requesterId,
    location,
    id: `appointment-${String(nextAppointmentId++).padStart(4, '0')}`,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };
  await updateItem(itemId, { status: 'reserved' });
  appointments = [appointment, ...appointments];
  notify();
  return { ...appointment };
}
