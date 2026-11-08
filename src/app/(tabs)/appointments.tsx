/**
 * src/app/(tabs)/appointments.tsx
 *
 * Tab "Lịch hẹn" — màn hình tạm cho D.
 */

import { AppointmentsScreen } from '../../views/screens/AppointmentsScreen';
import { useReminderSyncController } from '../../controllers/useReminderSyncController';

export default function AppointmentsTab() {
  useReminderSyncController();
  return <AppointmentsScreen />;
}
