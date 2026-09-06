"use client";

import { useEffect, useState } from "react";

export function OfflineBanner() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  if (online) return null;

  return (
    <div
      role="status"
      className="fixed top-[calc(2.75rem+env(safe-area-inset-top))] right-0 left-0 z-[60] border-b border-live bg-paper px-4 py-2 md:top-14"
    >
      <p className="font-condensed text-[11px] tracking-[0.16em] text-live uppercase">Du er offline</p>
      <p className="text-sm text-muted">Live-data kan ikke oppdateres akkurat nå.</p>
    </div>
  );
}
