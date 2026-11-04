import { createAppointment, getAppointments } from './appointmentService';

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
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const date = futureDate.toISOString().slice(0, 10);
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
    const appointment = await createAppointment({
      itemId: 'item-001',
      requesterId: 'student-12345678',
      date,
      time: '14:30',
      location: 'Thư viện IUH',
    });

    await expect(getAppointments('student-12345678')).resolves.toContainEqual(appointment);
  });

  test('rejects attempts to schedule an item owned by the requester', async () => {
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const date = futureDate.toISOString().slice(0, 10);
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
    await expect(createAppointment({
      itemId: 'item-001',
      requesterId: 'user-001',
      date,
      time: '14:30',
      location: 'Thư viện IUH',
    })).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });
});
