import { getItemById } from '../api/itemService';
import { loadAppointments } from './appointmentService';
import {
  cancelAppointmentReminder,
  scheduleAppointmentReminder,
} from '../device/notificationService';

export async function syncAppointmentReminders(userId: string): Promise<void> {
  const appointments = await loadAppointments(userId);
  await Promise.all(appointments.map(async (appointment) => {
    const reminderAt = appointment.reminderAt ? Date.parse(appointment.reminderAt) : Number.NaN;
    if (
      appointment.status !== 'confirmed'
      || !Number.isFinite(reminderAt)
      || reminderAt <= Date.now()
    ) {
      await cancelAppointmentReminder(appointment.id);
      return;
    }

    const item = await getItemById(appointment.itemId);
    await scheduleAppointmentReminder(appointment, item.title);
  }));
}
