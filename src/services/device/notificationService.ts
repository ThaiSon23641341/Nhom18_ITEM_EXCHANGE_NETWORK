import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { Appointment } from '../../models/appointmentModel';

export const APPOINTMENT_REMINDER_MINUTES = 1;
const APPOINTMENT_CHANNEL_ID = 'appointment-reminders';

export type NotificationScheduleResult = {
  scheduled: boolean;
  notificationId?: string;
  reason?: 'web' | 'permission-denied' | 'past' | 'too-soon';
};

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

async function ensurePermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(APPOINTMENT_CHANNEL_ID, {
      name: 'Nhắc lịch nhận đồ',
      importance: 5,
      vibrationPattern: [0, 250, 250],
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.status === 'granted') return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.status === 'granted';
}

async function findNotificationId(appointmentId: string): Promise<string | undefined> {
  const requests = await Notifications.getAllScheduledNotificationsAsync();
  const request = requests.find(
    (value) => value.content.data?.appointmentId === appointmentId,
  );
  return request?.identifier;
}

function getAppointmentDate(appointment: Appointment): Date {
  if (appointment.scheduledAt) return new Date(appointment.scheduledAt);
  const dateMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(appointment.date);
  if (dateMatch) {
    return new Date(
      Number(dateMatch[3]),
      Number(dateMatch[2]) - 1,
      Number(dateMatch[1]),
      Number(appointment.time.slice(0, 2)),
      Number(appointment.time.slice(3, 5)),
    );
  }
  return new Date(Number.NaN);
}

export async function getAppointmentReminderId(
  appointmentId: string,
): Promise<string | undefined> {
  if (Platform.OS === 'web') return undefined;
  return findNotificationId(appointmentId);
}

export async function cancelAppointmentReminder(appointmentId: string): Promise<void> {
  if (Platform.OS === 'web') return;
  const identifier = await getAppointmentReminderId(appointmentId);
  if (identifier) await Notifications.cancelScheduledNotificationAsync(identifier);
}

export async function scheduleAppointmentReminder(
  appointment: Appointment,
  itemTitle: string,
): Promise<NotificationScheduleResult> {
  if (Platform.OS === 'web') return { scheduled: false, reason: 'web' };
  if (appointment.status === 'cancelled' || appointment.status === 'completed') {
    return { scheduled: false, reason: 'past' };
  }

  const appointmentDate = getAppointmentDate(appointment);
  const reminderDate = new Date(
    appointmentDate.getTime() - APPOINTMENT_REMINDER_MINUTES * 60 * 1000,
  );
  const now = Date.now();
  if (!Number.isFinite(appointmentDate.getTime()) || appointmentDate.getTime() <= now) {
    return { scheduled: false, reason: 'past' };
  }
  if (reminderDate.getTime() <= now) return { scheduled: false, reason: 'too-soon' };

  const granted = await ensurePermission();
  if (!granted) return { scheduled: false, reason: 'permission-denied' };

  await cancelAppointmentReminder(appointment.id);
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Nhắc lịch nhận đồ',
      body: `Bạn sắp đến giờ nhận ${itemTitle} lúc ${appointment.time}.`,
      data: { appointmentId: appointment.id },
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminderDate,
      channelId: APPOINTMENT_CHANNEL_ID,
    },
  });
  return { scheduled: true, notificationId };
}

export async function updateAppointmentReminder(
  appointment: Appointment,
  itemTitle: string,
): Promise<NotificationScheduleResult> {
  await cancelAppointmentReminder(appointment.id);
  return scheduleAppointmentReminder(appointment, itemTitle);
}

export async function cancelAppointmentReminderForAppointment(
  appointment: Appointment,
): Promise<void> {
  await cancelAppointmentReminder(appointment.id);
}
