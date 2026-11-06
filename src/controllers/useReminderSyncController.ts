import { useEffect } from 'react';
import { useAuthController } from './useAuthController';
import { syncAppointmentReminders } from '../services/appointments/reminderSync';

export function useReminderSyncController(): void {
  const { user } = useAuthController();

  useEffect(() => {
    if (!user?.id) return;
    let active = true;
    void syncAppointmentReminders(user.id).catch((error: unknown) => {
      if (active) console.error('Không thể đồng bộ nhắc lịch từ máy chủ:', error);
    });
    return () => {
      active = false;
    };
  }, [user?.id]);
}
