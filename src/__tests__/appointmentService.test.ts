import {
  createAppointment,
  getAppointments,
} from '../services/appointments/appointmentService';

describe('appointmentService', () => {
  it('creates a pending appointment and preserves the optional note', async () => {
    const fetchMock = jest.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          data: {
            id: 'appointment-api-001',
            itemId: 'item-test',
            requesterId: 'user-test',
            date: '2026-10-30',
            time: '09:00',
            location: 'Sảnh thư viện IUH',
            note: 'Tôi sẽ đến sau giờ học.',
            status: 'pending',
            createdAt: '2026-10-29T17:00:00.000Z',
            updatedAt: '2026-10-29T17:00:00.000Z',
          },
        }),
        { status: 201 },
      ),
    );

    const appointment = await createAppointment({
      itemId: 'item-test',
      requesterId: 'user-test',
      date: '30/10/2026',
      time: '09:00',
      location: 'Sảnh thư viện IUH',
      note: 'Tôi sẽ đến sau giờ học.',
    });

    expect(appointment.status).toBe('pending');
    expect(appointment.note).toBe('Tôi sẽ đến sau giờ học.');
    expect(getAppointments()).toContainEqual(appointment);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/appointments'),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"date":"2026-10-30"'),
      }),
    );
    fetchMock.mockRestore();
  });
});
