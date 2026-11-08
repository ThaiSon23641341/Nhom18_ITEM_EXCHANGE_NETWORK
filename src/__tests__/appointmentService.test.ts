import {
  createAppointment,
  getAppointments,
  loadAppointments,
  updateAppointmentStatus,
} from '../services/appointments/appointmentService';

jest.mock('../services/device/notificationService', () => ({
  cancelAppointmentReminder: jest.fn(),
  scheduleAppointmentReminder: jest.fn().mockResolvedValue({
    scheduled: false,
    reason: 'web',
  }),
}));

const mockJsonResponse = (body: unknown): Response =>
  ({
    ok: true,
    status: 200,
    text: async () => JSON.stringify(body),
  }) as Response;

describe('appointmentService', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('creates a pending appointment locally and preserves the optional note', async () => {
    const item = {
      id: 'item-002',
      title: 'Textbook',
      description: 'Good condition',
      category: 'Books',
      condition: 'good',
      imageUrl: '',
      status: 'available',
      ownerId: 'user-001',
      createdAt: '2026-10-01T00:00:00.000Z',
      updatedAt: '2026-10-01T00:00:00.000Z',
    };
    const scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const scheduledDate = new Date(scheduledAt);
    const date = `${String(scheduledDate.getDate()).padStart(2, '0')}/${String(
      scheduledDate.getMonth() + 1,
    ).padStart(2, '0')}/${scheduledDate.getFullYear()}`;
    const time = `${String(scheduledDate.getHours()).padStart(2, '0')}:${String(
      scheduledDate.getMinutes(),
    ).padStart(2, '0')}`;
    jest.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJsonResponse(item))
      .mockResolvedValueOnce(mockJsonResponse({
        id: 'appointment-test',
        itemId: 'item-002',
        requesterId: 'user-test',
        date,
        time,
        scheduledAt,
        note: 'Tôi sẽ đến sau giờ học.',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

    const appointment = await createAppointment({
      itemId: 'item-002',
      requesterId: 'user-test',
      date,
      time,
      scheduledAt,
      note: 'Tôi sẽ đến sau giờ học.',
    });

    expect(appointment.status).toBe('pending');
    expect(appointment.note).toBe('Tôi sẽ đến sau giờ học.');
    expect(getAppointments()).toContainEqual(appointment);
  });

  it('sends a second confirmation when the appointment is already confirmed', async () => {
    const appointment = {
      id: 'appointment-test',
      itemId: 'item-002',
      requesterId: 'requester-001',
      date: '07/11/2026',
      time: '10:00',
      scheduledAt: '2026-11-07T03:00:00.000Z',
      location: 'IUH',
      status: 'confirmed',
      confirmedBy: ['requester-001'],
      createdAt: '2026-11-06T08:00:00.000Z',
      updatedAt: '2026-11-06T08:00:00.000Z',
    };
    const item = {
      id: 'item-002',
      title: 'Textbook',
    };
    const updatedAppointment = {
      ...appointment,
      confirmedBy: ['requester-001', 'owner-001'],
      updatedAt: '2026-11-06T08:05:00.000Z',
    };
    const fetchMock = jest.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJsonResponse([appointment]))
      .mockResolvedValueOnce(mockJsonResponse(updatedAppointment))
      .mockResolvedValueOnce(mockJsonResponse(item));

    await loadAppointments('owner-001');
    const result = await updateAppointmentStatus('appointment-test', 'confirmed');

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('/appointments/appointment-test/status'),
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ status: 'confirmed' }),
      }),
    );
    expect(result.confirmedBy).toEqual(['requester-001', 'owner-001']);
    expect(getAppointments()[0].confirmedBy).toEqual(['requester-001', 'owner-001']);
  });
});
