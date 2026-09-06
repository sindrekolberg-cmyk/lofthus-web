"use client";

import { useState } from "react";
import { isIosSafari, isStandaloneDisplay } from "@/lib/pwa";

export function InstallHint({ compact = false }: { compact?: boolean }) {
  const [show] = useState(() => typeof window !== "undefined" && !isStandaloneDisplay() && isIosSafari());
  const [open, setOpen] = useState(false);

  if (!show) return null;

  return (
    <div className={compact ? "" : "mt-4"}>
      <button
        type="button"
        className="min-h-11 text-left font-condensed text-[12px] tracking-[0.14em] text-muted uppercase hover:text-ink"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        Legg Lofthus til på Hjem-skjermen
      </button>
      {open ? (
        <p className="mt-1 max-w-sm text-sm leading-6 text-muted">
          I Safari: Del → Legg til på Hjem-skjerm. Da åpnes Lofthus som app, med eget ikon.
        </p>
      ) : null}
    </div>
  );
}
