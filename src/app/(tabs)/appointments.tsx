/**
 * src/app/(tabs)/appointments.tsx
 *
 * Tab "Lịch hẹn" — màn hình tạm cho D.
 */

import { AppointmentsScreen } from '../../views/screens/AppointmentsScreen';
import { useReminderSyncController } from '../../controllers/useReminderSyncController';
import { useSessionBootstrap } from '../../controllers/useSessionBootstrap';

export default function AppointmentsTab() {
  useSessionBootstrap();
  useReminderSyncController();
  return <AppointmentsScreen />;
}
