const mockScheduled = new Map<string, {
  identifier: string;
  content: { data: { appointmentId: string }; body?: string };
}>();
const mockScheduleNotificationAsync = jest.fn(async (request: {
  content: { data: { appointmentId: string }; body?: string };
}) => {
  const identifier = `notification-${mockScheduled.size + 1}`;
  mockScheduled.set(identifier, { identifier, content: request.content });
  return identifier;
});

jest.mock('expo-notifications', () => ({
  AndroidImportance: { DEFAULT: 5 },
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(async () => undefined),
  getPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(async () => ({ status: 'granted' })),
  getAllScheduledNotificationsAsync: jest.fn(async () => [...mockScheduled.values()]),
  cancelScheduledNotificationAsync: jest.fn(async (identifier: string) => {
    mockScheduled.delete(identifier);
  }),
  scheduleNotificationAsync: mockScheduleNotificationAsync,
  SchedulableTriggerInputTypes: { DATE: 'date' },
}));

// The service must load after the native module mock is registered.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const notificationService = require('../services/device/notificationService') as typeof import('../services/device/notificationService');
const {
  cancelAppointmentReminder,
  scheduleAppointmentReminder,
} = notificationService;

describe('notificationService', () => {
  beforeEach(() => {
    mockScheduled.clear();
    jest.clearAllMocks();
  });

  it('schedules one reminder for a future appointment', async () => {
    const result = await scheduleAppointmentReminder({
      id: 'appointment-1',
      itemId: 'item-1',
      requesterId: 'user-1',
      date: '30/10/2030',
      time: '15:00',
      scheduledAt: '2030-10-30T08:00:00.000Z',
      location: 'Cổng trường',
      status: 'pending',
      createdAt: '2030-01-01T00:00:00.000Z',
      updatedAt: '2030-01-01T00:00:00.000Z',
    }, 'Balo học tập');

    expect(result.scheduled).toBe(true);
    expect(mockScheduleNotificationAsync).toHaveBeenCalledTimes(1);
    expect(mockScheduleNotificationAsync.mock.calls[0][0].content.body).toContain('Balo học tập');
  });

  it('does not schedule a reminder when the reminder time has passed', async () => {
    const result = await scheduleAppointmentReminder({
      id: 'appointment-2',
      itemId: 'item-2',
      requesterId: 'user-1',
      date: '30/10/2026',
      time: '01:40',
      scheduledAt: '2026-10-29T18:00:00.000Z',
      location: 'Khu A',
      status: 'pending',
      createdAt: '2026-10-29T00:00:00.000Z',
      updatedAt: '2026-10-29T00:00:00.000Z',
    }, 'Sách');

    expect(result).toEqual({ scheduled: false, reason: 'past' });
    expect(mockScheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('cancels the existing reminder for an appointment', async () => {
    await scheduleAppointmentReminder({
      id: 'appointment-3',
      itemId: 'item-3',
      requesterId: 'user-1',
      date: '30/10/2030',
      time: '15:00',
      scheduledAt: '2030-10-30T08:00:00.000Z',
      location: 'Khu A',
      status: 'pending',
      createdAt: '2030-01-01T00:00:00.000Z',
      updatedAt: '2030-01-01T00:00:00.000Z',
    }, 'Sách');
    await cancelAppointmentReminder('appointment-3');

    expect(mockScheduled.size).toBe(0);
  });
});
