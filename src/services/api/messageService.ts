import type { Message } from '../../models/messageModel';
import { apiRequest } from './apiClient';

export async function getAppointmentMessages(appointmentId: string): Promise<Message[]> {
  return apiRequest<Message[]>(
    `/appointments/${encodeURIComponent(appointmentId)}/messages`,
  );
}

export async function sendAppointmentMessage(
  appointmentId: string,
  text: string,
): Promise<Message> {
  return apiRequest<Message>(
    `/appointments/${encodeURIComponent(appointmentId)}/messages`,
    {
      method: 'POST',
      body: JSON.stringify({ text }),
    },
  );
}
