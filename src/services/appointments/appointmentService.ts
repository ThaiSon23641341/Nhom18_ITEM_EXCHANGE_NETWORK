import type { Appointment } from '../../models/appointmentModel';
import { updateItem } from '../api/itemService';

export type CreateAppointmentInput = Omit<Appointment, 'id' | 'status' | 'createdAt' | 'updatedAt'>;

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';
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

function toApiDate(value: string): string {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : value;
}

export async function createAppointment(input: CreateAppointmentInput): Promise<Appointment> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemId: input.itemId,
        requesterId: input.requesterId,
        date: toApiDate(input.date),
        time: input.time,
        location: input.location,
        note: input.note,
        scheduledAt: input.scheduledAt,
      }),
    });
  } catch (error: unknown) {
    console.warn('Không thể kết nối API tạo lịch hẹn:', error);
    throw new Error(
      'Không thể kết nối máy chủ. Hãy khởi động backend và kiểm tra EXPO_PUBLIC_API_URL.',
    );
  }

  const payload: unknown = await response.json();
  if (!response.ok || !isAppointmentResponse(payload)) {
    const message = getApiErrorMessage(payload);
    throw new Error(message);
  }

  const appointment = payload.data;
  appointments = [appointment, ...appointments];
  try {
    await updateItem(input.itemId, { status: 'reserved' });
  } catch (error: unknown) {
    console.warn('Không thể đồng bộ trạng thái món đồ trên giao diện:', error);
  }
  notify();
  return appointment;
}

function isAppointmentResponse(value: unknown): value is { data: Appointment } {
  if (typeof value !== 'object' || value === null || !('data' in value)) return false;
  const data = value.data;
  return typeof data === 'object' && data !== null && 'id' in data && 'status' in data;
}

function getApiErrorMessage(value: unknown): string {
  if (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    typeof value.error === 'object' &&
    value.error !== null &&
    'message' in value.error &&
    typeof value.error.message === 'string'
  ) {
    return value.error.message;
  }
  return 'Không thể tạo lịch hẹn. Vui lòng thử lại.';
}
