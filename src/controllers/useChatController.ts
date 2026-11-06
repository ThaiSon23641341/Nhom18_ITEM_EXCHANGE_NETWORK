import { useCallback, useEffect, useState } from 'react';
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

async function loadConversation(userId: string, appointmentId: string) {
  await loadAppointments(userId);
  const appointment = getAppointments().find((value) => value.id === appointmentId);
  if (!appointment) throw new Error('Không tìm thấy lịch hẹn của bạn.');
  const messages = await getAppointmentMessages(appointmentId);
  return { appointment, messages };
}

export function useChatController(appointmentId: string) {
  const { user } = useAuthController();
  const userId = user?.id;
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasBothConfirmed = Boolean(
    appointment?.confirmedBy?.includes(appointment.requesterId)
    && appointment?.confirmedBy?.some((confirmedUserId) => (
      confirmedUserId !== appointment.requesterId
    )),
  );
  const isReadOnly = !appointment
    || appointment.status !== 'confirmed'
    || !hasBothConfirmed;

  const reload = useCallback(async () => {
    if (!userId || !appointmentId) return;
    setIsLoading(true);
    setError(null);
    try {
      const conversation = await loadConversation(userId, appointmentId);
      setAppointment(conversation.appointment);
      setMessages(conversation.messages);
    } catch (loadError: unknown) {
      setError(loadError instanceof Error ? loadError.message : 'Không thể tải cuộc chat.');
    } finally {
      setIsLoading(false);
    }
  }, [appointmentId, userId]);

  useEffect(() => {
    if (!userId || !appointmentId) return;
    let active = true;
    void loadConversation(userId, appointmentId)
      .then((conversation) => {
        if (!active) return;
        setAppointment(conversation.appointment);
        setMessages(conversation.messages);
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : 'Không thể tải cuộc chat.');
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [appointmentId, userId]);

  const send = useCallback(async (text: string) => {
    const normalizedText = text.trim();
    if (!normalizedText || !appointmentId || !userId || isReadOnly || isSending) return false;
    setIsSending(true);
    setError(null);
    try {
      const message = await sendAppointmentMessage(appointmentId, normalizedText);
      setMessages((current) => [...current, message]);
      return true;
    } catch (sendError: unknown) {
      setError(sendError instanceof Error ? sendError.message : 'Không thể gửi tin nhắn.');
      return false;
    } finally {
      setIsSending(false);
    }
  }, [appointmentId, isReadOnly, isSending, userId]);

  const displayedError = error
    ?? (!userId || !appointmentId ? 'Không tìm thấy lịch hẹn hoặc phiên đăng nhập.' : null);

  return {
    appointment,
    messages,
    isLoading: isLoading && Boolean(userId && appointmentId),
    isSending,
    isReadOnly,
    error: displayedError,
    reload,
    send,
  };
}
