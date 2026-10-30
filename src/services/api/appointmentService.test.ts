import { createAppointment, getAppointments } from './appointmentService';

describe('appointmentService', () => {
  test('creates and lists a valid appointment for its requester', async () => {
    const appointment = await createAppointment({
      itemId: 'item-001',
      requesterId: 'student-12345678',
      date: '2026-11-02',
      time: '14:30',
      location: 'Thư viện IUH',
    });

    await expect(getAppointments('student-12345678')).resolves.toContainEqual(appointment);
  });

  test('rejects attempts to schedule an item owned by the requester', async () => {
    await expect(createAppointment({
      itemId: 'item-001',
      requesterId: 'user-001',
      date: '2026-11-02',
      time: '14:30',
      location: 'Thư viện IUH',
    })).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });
});
