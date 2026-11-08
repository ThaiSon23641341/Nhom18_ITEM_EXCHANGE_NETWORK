import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { Appointment } from '../models/appointmentModel';
import type { Message } from '../models/messageModel';
import {
  getAppointments,
  loadAppointments,
} from '../services/appointments/appointmentService';
import {
  getAppointmentMessages,
  sendAppointmentMessage,
} from '../services/api/messageService';
import { useAuthController } from './useAuthController';
import { useChatController } from './useChatController';

jest.mock('../services/appointments/appointmentService', () => ({
  getAppointments: jest.fn(),
  loadAppointments: jest.fn(),
}));
jest.mock('../services/api/messageService', () => ({
  getAppointmentMessages: jest.fn(),
  sendAppointmentMessage: jest.fn(),
}));
jest.mock('./useAuthController', () => ({
  useAuthController: jest.fn(),
}));

const appointment: Appointment = {
  id: 'appointment-1',
  itemId: 'item-1',
  requesterId: 'requester-1',
  date: '07/11/2026',
  time: '10:00',
  location: 'IUH',
  status: 'confirmed',
  confirmedBy: ['requester-1', 'owner-1'],
  createdAt: '2026-11-06T08:00:00.000Z',
  updatedAt: '2026-11-06T08:05:00.000Z',
};

const initialMessage: Message = {
  id: 'message-1',
  appointmentId: appointment.id,
  senderId: 'requester-1',
  text: 'Xin chào',
  createdAt: '2026-11-06T08:10:00.000Z',
};

describe('useChatController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useAuthController).mockReturnValue({
      user: { id: 'requester-1' },
    } as ReturnType<typeof useAuthController>);
    jest.mocked(loadAppointments).mockResolvedValue([appointment]);
    jest.mocked(getAppointments).mockReturnValue([appointment]);
    jest.mocked(getAppointmentMessages).mockResolvedValue([initialMessage]);
  });

  it('loads a confirmed appointment conversation and sends messages', async () => {
    const sentMessage: Message = {
      id: 'message-2',
      appointmentId: appointment.id,
      senderId: 'requester-1',
      text: '  Tôi đang đến  ',
      createdAt: '2026-11-06T08:11:00.000Z',
    };
    jest.mocked(sendAppointmentMessage).mockResolvedValue({
      ...sentMessage,
      text: 'Tôi đang đến',
    });

    const { result } = await renderHook(() => useChatController(appointment.id));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.appointment).toEqual(appointment);
    expect(result.current.messages).toEqual([initialMessage]);
    expect(result.current.isReadOnly).toBe(false);

    await act(async () => {
      await expect(result.current.send('  Tôi đang đến  ')).resolves.toBe(true);
    });
    expect(sendAppointmentMessage).toHaveBeenCalledWith(appointment.id, 'Tôi đang đến');
    expect(result.current.messages).toEqual([
      initialMessage,
      { ...sentMessage, text: 'Tôi đang đến' },
    ]);
  });

  it('keeps chat read-only and refuses to send until both participants confirm', async () => {
    const pendingAppointment = { ...appointment, status: 'pending' as const, confirmedBy: [] };
    jest.mocked(getAppointments).mockReturnValue([pendingAppointment]);

    const { result } = await renderHook(() => useChatController(appointment.id));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isReadOnly).toBe(true);
    await act(async () => {
      await expect(result.current.send('Không được gửi')).resolves.toBe(false);
    });
    expect(sendAppointmentMessage).not.toHaveBeenCalled();
  });

  it('loads messages sent by the other participant without a manual refresh', async () => {
    jest.useFakeTimers();
    let unmount: (() => void) | undefined;
    try {
      const incomingMessage: Message = {
        id: 'message-2',
        appointmentId: appointment.id,
        senderId: 'owner-1',
        text: 'Mình đang đến.',
        createdAt: '2026-11-06T08:12:00.000Z',
      };
      jest.mocked(getAppointmentMessages)
        .mockResolvedValueOnce([initialMessage])
        .mockResolvedValue([initialMessage, incomingMessage]);

      const hook = await renderHook(() => useChatController(appointment.id));
      unmount = hook.unmount;
      await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
      });

      expect(hook.result.current.messages).toEqual([initialMessage]);
      await act(async () => {
        await jest.advanceTimersByTimeAsync(5000);
      });

      expect(hook.result.current.messages).toEqual([initialMessage, incomingMessage]);
      expect(getAppointmentMessages).toHaveBeenCalledTimes(2);
    } finally {
      unmount?.();
      jest.useRealTimers();
    }
  });
});
