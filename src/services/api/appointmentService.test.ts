import { createAppointment, getAppointments } from './appointmentService';

jest.mock('../device/notificationService', () => ({
  cancelAppointmentReminder: jest.fn(),
  scheduleAppointmentReminder: jest.fn(),
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

  test('creates and lists a valid appointment for its requester', async () => {
    const scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const date = `${String(scheduledAt.getDate()).padStart(2, '0')}/${String(
      scheduledAt.getMonth() + 1,
    ).padStart(2, '0')}/${scheduledAt.getFullYear()}`;
    const time = [
      String(scheduledAt.getHours()).padStart(2, '0'),
      String(scheduledAt.getMinutes()).padStart(2, '0'),
    ].join(':');
    jest.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(mockJsonResponse({
        id: 'item-001',
        title: 'Textbook',
        description: 'Good condition',
        category: 'Books',
        condition: 'good',
        imageUrl: '',
        status: 'available',
        ownerId: 'user-001',
        createdAt: '2026-10-01T00:00:00.000Z',
        updatedAt: '2026-10-01T00:00:00.000Z',
      }))
      .mockResolvedValueOnce(mockJsonResponse({
        id: 'appointment-001',
        itemId: 'item-001',
        requesterId: 'student-12345678',
        date,
        time,
        location: 'Thư viện IUH',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))
      .mockResolvedValueOnce(mockJsonResponse([{
        id: 'appointment-001',
        itemId: 'item-001',
        requesterId: 'student-12345678',
        date,
        time,
        location: 'Thư viện IUH',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }]));

    const appointment = await createAppointment({
      itemId: 'item-001',
      requesterId: 'student-12345678',
      date,
      time,
    });

    await expect(getAppointments('student-12345678')).resolves.toContainEqual(
      expect.objectContaining({
        id: appointment.id,
        itemId: appointment.itemId,
        requesterId: appointment.requesterId,
        date,
        time,
        location: 'Thư viện IUH',
        status: 'pending',
      }),
    );
  });

  test('rejects attempts to schedule an item owned by the requester', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(mockJsonResponse({
      id: 'item-001',
      title: 'Textbook',
      description: 'Good condition',
      category: 'Books',
      condition: 'good',
      imageUrl: '',
      status: 'available',
      ownerId: 'user-001',
      createdAt: '2026-10-01T00:00:00.000Z',
      updatedAt: '2026-10-01T00:00:00.000Z',
    }));
    const scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const date = `${String(scheduledAt.getDate()).padStart(2, '0')}/${String(
      scheduledAt.getMonth() + 1,
    ).padStart(2, '0')}/${scheduledAt.getFullYear()}`;
    const time = [
      String(scheduledAt.getHours()).padStart(2, '0'),
      String(scheduledAt.getMinutes()).padStart(2, '0'),
    ].join(':');

    await expect(createAppointment({
      itemId: 'item-001',
      requesterId: 'user-001',
      date,
      time,
    })).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });
});
