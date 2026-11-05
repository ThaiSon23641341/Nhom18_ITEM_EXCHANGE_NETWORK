import type { Appointment } from '../../models/appointmentModel';
import { getItemById, MockApiError } from './itemService';

export type CreateAppointmentInput = Pick<
  Appointment,
  'itemId' | 'requesterId' | 'date' | 'time' | 'location'
>;

const appointments: Appointment[] = [];
let nextAppointmentId = 1;
const appointmentListeners = new Set<() => void>();

export class AppointmentServiceError extends Error {
  constructor(
    message: string,
    public readonly code: 'BAD_REQUEST' | 'NOT_FOUND' | 'CONFLICT',
  ) {
    super(message);
    this.name = 'AppointmentServiceError';
  }
}

export const subscribeToAppointmentChanges = (listener: () => void): (() => void) => {
  appointmentListeners.add(listener);
  return () => {
    appointmentListeners.delete(listener);
  };
};

const isValidDate = (value: string): boolean => {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return false;
  const parsed = new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
  return parsed.getFullYear() === Number(match[3])
    && parsed.getMonth() === Number(match[2]) - 1
    && parsed.getDate() === Number(match[1]);
};

const parseLocalDateTime = (date: string, time: string): number => {
  const dateMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(date);
  const timeMatch = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);
  if (!dateMatch || !timeMatch) return Number.NaN;
  return new Date(
    Number(dateMatch[3]),
    Number(dateMatch[2]) - 1,
    Number(dateMatch[1]),
    Number(timeMatch[1]),
    Number(timeMatch[2]),
  ).getTime();
};

export const createAppointment = async (
  input: CreateAppointmentInput,
): Promise<Appointment> => {
  const itemId = input.itemId.trim();
  const requesterId = input.requesterId.trim();
  const location = input.location.trim();

  if (
    !itemId
    || !requesterId
    || !isValidDate(input.date)
    || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(input.time)
    || !location
    || location.length > 200
  ) {
    throw new AppointmentServiceError('Ngày, giờ hoặc địa điểm hẹn không hợp lệ.', 'BAD_REQUEST');
  }
  if (parseLocalDateTime(input.date, input.time) <= Date.now()) {
    throw new AppointmentServiceError('Thời gian hẹn phải ở trong tương lai.', 'BAD_REQUEST');
  }

  let item;
  try {
    item = await getItemById(itemId);
  } catch (error) {
    if (error instanceof MockApiError) {
      throw new AppointmentServiceError('Không tìm thấy đồ dùng.', 'NOT_FOUND');
    }
    throw error;
  }

  if (item.ownerId === requesterId) {
    throw new AppointmentServiceError('Bạn không thể đặt lịch nhận đồ của chính mình.', 'BAD_REQUEST');
  }
  if (item.status !== 'available') {
    throw new AppointmentServiceError('Đồ dùng này không còn khả dụng để đặt lịch.', 'CONFLICT');
  }

  const now = new Date().toISOString();
  const appointment: Appointment = {
    ...input,
    itemId,
    requesterId,
    date: input.date,
    time: input.time,
    location,
    id: `appointment-${String(nextAppointmentId++).padStart(4, '0')}`,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };
  appointments.unshift(appointment);
  appointmentListeners.forEach((listener) => listener());
  return { ...appointment };
};

export const getAppointments = async (requesterId: string): Promise<Appointment[]> => {
  const normalizedId = requesterId.trim();
  if (!normalizedId) {
    throw new AppointmentServiceError('Cần đăng nhập để xem lịch hẹn.', 'BAD_REQUEST');
  }

  return appointments
    .filter((appointment) => appointment.requesterId === normalizedId)
    .map((appointment) => ({ ...appointment }));
};
