import { useCallback, useEffect, useRef, useState } from 'react';
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

const MESSAGE_POLL_INTERVAL_MS = 5000;

async function loadConversation(userId: string, appointmentId: string) {
  await loadAppointments(userId);
  const appointment = getAppointments().find((value) => value.id === appointmentId);
  if (!appointment) throw new Error('Không tìm thấy lịch hẹn của bạn.');
  const messages = await getAppointmentMessages(appointmentId);
  return { appointment, messages };
}

function mergeMessages(current: Message[], incoming: Message[]): Message[] {
  const messagesById = new Map(current.map((message) => [message.id, message]));
  incoming.forEach((message) => messagesById.set(message.id, message));
  return [...messagesById.values()].sort((left, right) =>
    left.createdAt.localeCompare(right.createdAt),
  );
}

export function useChatController(appointmentId: string) {
  const { user } = useAuthController();
  const userId = user?.id;
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refreshInFlight = useRef(false);

  const hasBothConfirmed = Boolean(
    appointment?.confirmedBy?.includes(appointment.requesterId)
    && appointment?.confirmedBy?.some((confirmedUserId) => (
      confirmedUserId !== appointment.requesterId
    )),
  );
  const isReadOnly = !appointment
    || appointment.status !== 'confirmed'
    || !hasBothConfirmed;

  const refresh = useCallback(async (showLoading: boolean) => {
    if (!userId || !appointmentId || refreshInFlight.current) return;
    refreshInFlight.current = true;
    if (showLoading) setIsLoading(true);
    setError(null);
    try {
      const conversation = await loadConversation(userId, appointmentId);
      setAppointment(conversation.appointment);
      setMessages((current) => mergeMessages(current, conversation.messages));
    } catch (loadError: unknown) {
      setError(loadError instanceof Error ? loadError.message : 'Không thể tải cuộc chat.');
    } finally {
      refreshInFlight.current = false;
      if (showLoading) setIsLoading(false);
    }
  }, [appointmentId, userId]);

  const reload = useCallback(() => refresh(true), [refresh]);

  useEffect(() => {
    if (!userId || !appointmentId) return;
    let active = true;
    void Promise.resolve().then(() => {
      if (active) void refresh(true);
    });
    const intervalId = setInterval(() => {
      if (active) void refresh(false);
    }, MESSAGE_POLL_INTERVAL_MS);
    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [appointmentId, refresh, userId]);

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
