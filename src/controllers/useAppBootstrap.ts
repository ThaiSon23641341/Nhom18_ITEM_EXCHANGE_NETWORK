import { useSessionBootstrap } from './useSessionBootstrap';
import { useReminderSyncController } from './useReminderSyncController';

export function useAppBootstrap(): { isRestoring: boolean } {
  const session = useSessionBootstrap();
  useReminderSyncController();
  return { isRestoring: session.isRestoring };
}
