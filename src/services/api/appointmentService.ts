import type { Appointment } from '../../models/appointmentModel';
import {
  createAppointment as createServerAppointment,
  getAppointments as getLoadedAppointments,
  loadAppointments as loadServerAppointments,
  subscribeToAppointments,
} from '../appointments/appointmentService';

export type CreateAppointmentInput = Pick<
  Appointment,
  'itemId' | 'requesterId' | 'date' | 'time' | 'location'
>;

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
  return subscribeToAppointments(listener);
};

const isValidDate = (value: string): boolean => {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return false;
  const parsed = new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
  return parsed.getFullYear() === Number(match[3])
    && parsed.getMonth() === Number(match[2]) - 1
    && parsed.getDate() === Number(match[1]);
};

const isFutureDateTime = (date: string, time: string): boolean => {
  const dateMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(date);
  const timeMatch = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);
  if (!dateMatch || !timeMatch) return false;
  return new Date(
    Number(dateMatch[3]),
    Number(dateMatch[2]) - 1,
    Number(dateMatch[1]),
    Number(timeMatch[1]),
    Number(timeMatch[2]),
  ).getTime() > Date.now();
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
    || !isFutureDateTime(input.date, input.time)
    || !location
    || location.length > 200
  ) {
    throw new AppointmentServiceError('Ngày, giờ hoặc địa điểm hẹn không hợp lệ.', 'BAD_REQUEST');
  }
  try {
    return await createServerAppointment({ ...input, itemId, requesterId, location });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Không thể tạo lịch hẹn.';
    if (message.includes('không còn khả dụng')) {
      throw new AppointmentServiceError(message, 'CONFLICT');
    }
    if (message.includes('Không tìm thấy đồ dùng')) {
      throw new AppointmentServiceError(message, 'NOT_FOUND');
    }
    if (message.includes('chính mình')) {
      throw new AppointmentServiceError(message, 'BAD_REQUEST');
    }
    throw error;
  }
};

export const getAppointments = async (requesterId: string): Promise<Appointment[]> => {
  const normalizedId = requesterId.trim();
  if (!normalizedId) {
    throw new AppointmentServiceError('Cần đăng nhập để xem lịch hẹn.', 'BAD_REQUEST');
  }

  await loadServerAppointments(normalizedId);
  return getLoadedAppointments().map((appointment) => ({ ...appointment }));
};
