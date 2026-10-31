import { useCallback, useEffect, useState } from 'react';
import type { Appointment } from '../models/appointmentModel';
import {
  getAppointments,
  subscribeToAppointmentChanges,
} from '../services/api/appointmentService';

export function useAppointmentsController(requesterId: string | undefined) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToAppointmentChanges(() => {
      setLoadError(null);
      setIsLoading(true);
      setReloadCount((count) => count + 1);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    let active = true;
    getAppointments(requesterId ?? '')
      .then((result) => {
        if (active) setAppointments(result);
      })
      .catch(() => {
        if (active) setLoadError('Không thể tải lịch hẹn. Vui lòng thử lại.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [requesterId, reloadCount]);

  const retry = useCallback(() => {
    setLoadError(null);
    setIsLoading(true);
    setReloadCount((count) => count + 1);
  }, []);

  return { appointments, isLoading, loadError, retry };
}
