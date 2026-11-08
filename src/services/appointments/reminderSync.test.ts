import type { Appointment } from '../../models/appointmentModel';
import { getItemById } from '../api/itemService';
import {
  cancelAppointmentReminder,
  scheduleAppointmentReminder,
} from '../device/notificationService';
import { loadAppointments } from './appointmentService';
import { syncAppointmentReminders } from './reminderSync';

jest.mock('../api/itemService', () => ({
  getItemById: jest.fn(),
}));
jest.mock('../device/notificationService', () => ({
  cancelAppointmentReminder: jest.fn(),
  scheduleAppointmentReminder: jest.fn(),
}));
jest.mock('./appointmentService', () => ({
  loadAppointments: jest.fn(),
}));

const appointment = (
  id: string,
  status: Appointment['status'],
  reminderAt: string | null,
): Appointment => ({
  id,
  itemId: `item-${id}`,
  requesterId: 'user-001',
  date: '30/10/2030',
  time: '15:00',
  scheduledAt: '2030-10-30T08:00:00.000Z',
  reminderAt,
  reminderMinutes: 60,
  location: 'Thư viện IUH',
  confirmedBy: [],
  status,
  createdAt: '2030-01-01T00:00:00.000Z',
  updatedAt: '2030-01-01T00:00:00.000Z',
});

describe('syncAppointmentReminders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rebuilds future confirmed reminders and cancels stale local ones', async () => {
    const confirmed = appointment(
      'confirmed',
      'confirmed',
      new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    );
    const pending = appointment('pending', 'pending', null);
    jest.mocked(loadAppointments).mockResolvedValue([confirmed, pending]);
    jest.mocked(getItemById).mockResolvedValue({
      id: confirmed.itemId,
      title: 'Giáo trình',
      description: '',
      category: 'Sách',
      condition: 'good',
      imageUrl: '',
      status: 'available',
      ownerId: 'user-002',
      createdAt: '2030-01-01T00:00:00.000Z',
      updatedAt: '2030-01-01T00:00:00.000Z',
    });

    await syncAppointmentReminders('user-001');

    expect(loadAppointments).toHaveBeenCalledWith('user-001');
    expect(scheduleAppointmentReminder).toHaveBeenCalledWith(confirmed, 'Giáo trình');
    expect(cancelAppointmentReminder).toHaveBeenCalledWith(pending.id);
  });
});
