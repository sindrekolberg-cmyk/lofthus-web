"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useLofthus } from "@/lib/useLofthus";
import { useSelectedManager } from "@/lib/selected-manager";
import type { ManagerOption } from "@/lib/types";

type Props = {
  managers?: ManagerOption[];
  compact?: boolean;
  onPick?: () => void;
};

export function ManagerSearch({ managers, compact, onPick }: Props) {
  const router = useRouter();
  const { setEntryId } = useSelectedManager();
  const fetched = useLofthus(
    managers ? null : "managers-search",
    () => api.managers(),
    { live: false },
  );
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const hits = useMemo(() => {
    const list = managers || fetched.data?.managers || [];
    const needle = q.trim().toLowerCase();
    if (!needle) return list.slice(0, 6);
    return list
      .filter((m) => {
        const blob = `${m.manager} ${m.team} ${m.entry}`.toLowerCase();
        return blob.includes(needle);
      })
      .slice(0, 8);
  }, [managers, fetched.data, q]);

  function choose(m: ManagerOption) {
    setEntryId(m.entry);
    setQ("");
    setOpen(false);
    onPick?.();
    router.push(`/manager/${m.entry}`);
  }

  return (
    <div className="relative">
      <label className="sr-only" htmlFor={compact ? "mgr-search-c" : "mgr-search"}>
        Finn meg
      </label>
      <input
        id={compact ? "mgr-search-c" : "mgr-search"}
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 180);
        }}
        placeholder="Finn meg…"
        className={`w-full border border-rule bg-white/70 px-3 text-sm outline-none placeholder:text-muted focus:border-ink ${
          compact ? "h-11 md:h-9" : "h-11"
        }`}
      />
      {open && hits.length ? (
        <ul className="absolute z-40 mt-1 max-h-72 w-full overflow-auto border border-rule bg-paper shadow-sm">
          {hits.map((m) => (
            <li key={m.entry}>
              <button
                type="button"
                className="flex min-h-11 w-full items-baseline justify-between gap-3 px-3 py-2.5 text-left hover:bg-black/[0.04]"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => choose(m)}
              >
                <span>
                  <span className="block text-sm">{m.manager}</span>
                  <span className="block text-xs text-muted">{m.team}</span>
                </span>
                <span className="font-condensed text-xs text-muted">
                  {m.rank ? `${m.rank}.` : ""}
                </span>
              </button>
            </li>
          ))}
          <li className="border-t border-rule px-3 py-2 text-xs text-muted">
            <Link href="/liga" onClick={() => setOpen(false)}>
              Se hele tabellen
            </Link>
          </li>
        </ul>
      ) : null}
    </div>
  );
}
