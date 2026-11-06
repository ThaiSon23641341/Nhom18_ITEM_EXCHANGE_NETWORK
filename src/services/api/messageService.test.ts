import { apiRequest } from './apiClient';
import { getAppointmentMessages, sendAppointmentMessage } from './messageService';

jest.mock('./apiClient', () => ({
  apiRequest: jest.fn(),
}));

describe('messageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads messages for the encoded appointment id', async () => {
    const messages = [{
      id: 'message-1',
      appointmentId: 'appointment/1',
      senderId: 'user-1',
      text: 'Xin chào',
      createdAt: '2026-11-06T09:00:00.000Z',
    }];
    jest.mocked(apiRequest).mockResolvedValue(messages);

    await expect(getAppointmentMessages('appointment/1')).resolves.toEqual(messages);
    expect(apiRequest).toHaveBeenCalledWith('/appointments/appointment%2F1/messages');
  });

  it('sends a message to the appointment endpoint', async () => {
    const message = {
      id: 'message-2',
      appointmentId: 'appointment-1',
      senderId: 'user-1',
      text: 'Đã đến nơi',
      createdAt: '2026-11-06T09:00:00.000Z',
    };
    jest.mocked(apiRequest).mockResolvedValue(message);

    await expect(sendAppointmentMessage('appointment-1', 'Đã đến nơi')).resolves.toEqual(message);
    expect(apiRequest).toHaveBeenCalledWith('/appointments/appointment-1/messages', {
      method: 'POST',
      body: JSON.stringify({ text: 'Đã đến nơi' }),
    });
  });
});
