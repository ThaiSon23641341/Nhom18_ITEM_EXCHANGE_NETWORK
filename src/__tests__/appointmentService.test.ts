import {
  createAppointment,
  getAppointments,
} from '../services/appointments/appointmentService';

describe('appointmentService', () => {
  it('creates a pending appointment locally and preserves the optional note', async () => {
    const scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const scheduledDate = new Date(scheduledAt);
    const date = `${String(scheduledDate.getDate()).padStart(2, '0')}/${String(
      scheduledDate.getMonth() + 1,
    ).padStart(2, '0')}/${scheduledDate.getFullYear()}`;
    const time = `${String(scheduledDate.getHours()).padStart(2, '0')}:${String(
      scheduledDate.getMinutes(),
    ).padStart(2, '0')}`;

    const appointment = await createAppointment({
      itemId: 'item-002',
      requesterId: 'user-test',
      date,
      time,
      scheduledAt,
      location: 'Sảnh thư viện IUH',
      note: 'Tôi sẽ đến sau giờ học.',
    });

    expect(appointment.status).toBe('pending');
    expect(appointment.note).toBe('Tôi sẽ đến sau giờ học.');
    expect(getAppointments()).toContainEqual(appointment);
  });
});
