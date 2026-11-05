import { createAppointment, getAppointments } from './appointmentService';

const mockJsonResponse = (body: unknown): Response =>
  ({
    ok: true,
    status: 200,
    text: async () => JSON.stringify(body),
  }) as Response;

const futureDate = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

describe('appointmentService', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  test('creates and lists a valid appointment for its requester', async () => {
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
      date: futureDate(),
      time: '14:30',
      location: 'Thư viện IUH',
    });

    await expect(getAppointments('student-12345678')).resolves.toContainEqual(appointment);
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
    await expect(createAppointment({
      itemId: 'item-001',
      requesterId: 'user-001',
      date: futureDate(),
      time: '14:30',
      location: 'Thư viện IUH',
    })).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });
});
