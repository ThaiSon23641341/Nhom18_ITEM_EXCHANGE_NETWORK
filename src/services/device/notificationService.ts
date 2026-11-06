import * as Notifications from 'expo-notifications';
import { AndroidImportance, type DateTriggerInput } from 'expo-notifications';
import { Platform } from 'react-native';
import type { Appointment } from '../../models/appointmentModel';

const APPOINTMENT_CHANNEL_ID = 'appointment-reminders';

type NotificationPermissionResult = {
  granted: boolean;
  channelId?: string;
};

export type NotificationScheduleResult = {
  scheduled: boolean;
  notificationId?: string;
  reason?: 'web' | 'permission-denied' | 'past' | 'too-soon' | 'unconfirmed' | 'missing-reminder';
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

async function ensurePermission(): Promise<NotificationPermissionResult> {
  if (Platform.OS === 'web') return { granted: false };
  let channelId: string | undefined;
  if (Platform.OS === 'android') {
    try {
      const channel = await Notifications.setNotificationChannelAsync(APPOINTMENT_CHANNEL_ID, {
        name: 'Nhắc lịch nhận đồ',
        importance: AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250],
      });
      if (channel) {
        channelId = APPOINTMENT_CHANNEL_ID;
      } else {
        console.warn('Không tạo được notification channel; sẽ dùng channel mặc định của Android.');
      }
    } catch (error: unknown) {
      console.warn(
        'Không tạo được notification channel; sẽ dùng channel mặc định của Android:',
        error,
      );
    }
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.status === 'granted') return { granted: true, channelId };
  const requested = await Notifications.requestPermissionsAsync();
  return { granted: requested.status === 'granted', channelId };
}

async function findNotificationId(appointmentId: string): Promise<string | undefined> {
  const requests = await Notifications.getAllScheduledNotificationsAsync();
  const request = requests.find(
    (value) => value.content.data?.appointmentId === appointmentId,
  );
  return request?.identifier;
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
  if (appointment.status !== 'confirmed') return { scheduled: false, reason: 'unconfirmed' };
  if (!appointment.reminderAt) return { scheduled: false, reason: 'missing-reminder' };

  const appointmentDate = appointment.scheduledAt
    ? new Date(appointment.scheduledAt)
    : new Date(Number.NaN);
  const reminderDate = new Date(appointment.reminderAt);
  const now = Date.now();
  if (!Number.isFinite(appointmentDate.getTime()) || appointmentDate.getTime() <= now) {
    return { scheduled: false, reason: 'past' };
  }
  if (!Number.isFinite(reminderDate.getTime())) {
    return { scheduled: false, reason: 'missing-reminder' };
  }
  if (reminderDate.getTime() <= now) return { scheduled: false, reason: 'too-soon' };

  const permission = await ensurePermission();
  if (!permission.granted) return { scheduled: false, reason: 'permission-denied' };

  await cancelAppointmentReminder(appointment.id);
  const trigger: DateTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.DATE,
    date: reminderDate,
    ...(permission.channelId ? { channelId: permission.channelId } : {}),
  };
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Nhắc lịch nhận đồ',
      body: `Bạn sắp đến giờ nhận ${itemTitle} lúc ${appointment.time}.`,
      data: { appointmentId: appointment.id },
      sound: 'default',
    },
    trigger,
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
