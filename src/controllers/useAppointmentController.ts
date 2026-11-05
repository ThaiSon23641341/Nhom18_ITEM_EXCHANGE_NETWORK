import { useCallback, useSyncExternalStore } from 'react';
import { useFocusEffect } from 'expo-router';
import type { Appointment } from '../models/appointmentModel';
import {
  cancelAppointment,
  createAppointment,
  getAppointments,
  loadAppointments,
  subscribeToAppointments,
  type CreateAppointmentInput,
  updateAppointmentStatus,
} from '../services/appointments';
import { useAuthController } from './useAuthController';

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
  cancel: (appointmentId: string) => Promise<Appointment>;
  updateStatus: (appointmentId: string, status: Appointment['status']) => Promise<Appointment>;
}

export function useAppointmentController(): AppointmentController {
  const { user } = useAuthController();
  const userId = user?.id;
  const appointments = useSyncExternalStore(
    subscribeToAppointments,
    getAppointments,
    getAppointments,
  );
  const create = useCallback((input: CreateAppointmentInput) => createAppointment(input), []);
  useFocusEffect(
    useCallback(() => {
      if (!userId) return undefined;
      void loadAppointments(userId).catch((error: unknown) => {
        console.warn('Không thể tải lịch hẹn:', error);
      });
      return undefined;
    }, [userId]),
  );

  const updateStatus = useCallback(
    (appointmentId: string, status: Appointment['status']) =>
      updateAppointmentStatus(appointmentId, status),
    [],
  );
  return { appointments, create, cancel: cancelAppointment, updateStatus };
}
