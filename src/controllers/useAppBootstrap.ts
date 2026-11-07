import { useSessionBootstrap } from './useSessionBootstrap';

// One app-start hook for infrastructure bootstrap.
// The session restore runs before navigation; reminder restoration is added
// by the appointment owner in a follow-up change.
export function useAppBootstrap(): { isRestoring: boolean } {
  const session = useSessionBootstrap();
  return { isRestoring: session.isRestoring };
}
