import { useLocalSearchParams } from 'expo-router';
import { ChatScreen } from '../../../views/screens/ChatScreen';

export default function AppointmentChatRoute() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const appointmentId = typeof id === 'string' ? id : '';
  return <ChatScreen appointmentId={appointmentId} />;
}
