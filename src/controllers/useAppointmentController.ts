import { useCallback, useSyncExternalStore } from 'react';
import type { Appointment } from '../models/appointmentModel';
import {
  createAppointment,
  getAppointments,
  subscribeToAppointments,
  type CreateAppointmentInput,
} from '../services/appointments';

export function combineAppointmentDate(date: string, time: string): Date | null {
  const dateMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(date);
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(time);
  if (!dateMatch || !timeMatch) return null;

  const result = new Date(
    Number(dateMatch[3]),
    Number(dateMatch[2]) - 1,
    Number(dateMatch[1]),
    Number(timeMatch[1]),
    Number(timeMatch[2]),
  );
  const isValid =
    result.getFullYear() === Number(dateMatch[3]) &&
    result.getMonth() === Number(dateMatch[2]) - 1 &&
    result.getDate() === Number(dateMatch[1]) &&
    result.getHours() === Number(timeMatch[1]) &&
    result.getMinutes() === Number(timeMatch[2]);

  return isValid ? result : null;
}

export function isAppointmentDateInFuture(date: Date): boolean {
  return date.getTime() >= Date.now();
}

export interface AppointmentController {
  appointments: Appointment[];
  create: (input: CreateAppointmentInput) => Promise<Appointment>;
}

export function useAppointmentController(): AppointmentController {
  const appointments = useSyncExternalStore(
    subscribeToAppointments,
    getAppointments,
    getAppointments,
  );
  const create = useCallback((input: CreateAppointmentInput) => createAppointment(input), []);

  return { appointments, create };
}
