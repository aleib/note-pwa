import { useOnlineStatus } from "../hooks/useOnlineStatus";

export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  return isOnline ? null : (
    <div className="border-b border-amber-400/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-200">
      Offline: you can browse existing items, but recording/transcription may not work.
    </div>
  );
}


