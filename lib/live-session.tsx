"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useSWRConfig } from "swr";
import { getApiBase } from "@/lib/api";
import { duplicateEvent, shouldApplySnapshot, type PulseEvent, type StreamMessage } from "@/lib/live-protocol";

type Transport = "sse" | "polling" | "connecting";

type LiveSession = {
  transport: Transport;
  sseOpen: boolean;
  events: PulseEvent[];
  banner: PulseEvent | null;
  stale: boolean;
  seq: number;
};

const LiveSessionContext = createContext<LiveSession>({
  transport: "connecting",
  sseOpen: false,
  events: [],
  banner: null,
  stale: false,
  seq: 0,
});

export function useLiveSession() {
  return useContext(LiveSessionContext);
}

export function LiveSessionProvider({ children }: { children: ReactNode }) {
  const { mutate } = useSWRConfig();
  const [transport, setTransport] = useState<Transport>("connecting");
  const [sseOpen, setSseOpen] = useState(false);
  const [events, setEvents] = useState<PulseEvent[]>([]);
  const [banner, setBanner] = useState<PulseEvent | null>(null);
  const [stale, setStale] = useState(false);
  const seqRef = useRef(0);
  const seenRef = useRef(new Set<string>());
  const snapshotRef = useRef("");

  useEffect(() => {
    const base = getApiBase();
    if (!base || typeof window === "undefined" || typeof EventSource === "undefined") {
      setTransport("polling");
      return;
    }
    let source: EventSource | null = null;
    let stopped = false;
    let retry = 0;

    const apply = (payload: StreamMessage) => {
      if (!shouldApplySnapshot({ seq: payload.seq, snapshot_id: payload.snapshot_id }, { seq: seqRef.current, snapshot_id: snapshotRef.current })) {
        return;
      }
      seqRef.current = Number(payload.seq || seqRef.current);
      snapshotRef.current = String(payload.snapshot_id || snapshotRef.current);
      setStale(Boolean(payload.stale));
      const fresh = (payload.events || []).filter((event) => !duplicateEvent(seenRef.current, event.event_id));
      if (fresh.length) {
        setEvents((prev) => [...fresh, ...prev].slice(0, 12));
        setBanner(fresh[0]);
      }
      if (payload.live) {
        mutate("live", payload.live, { revalidate: false });
      }
      mutate("home");
      mutate("league");
      mutate("month");
      mutate(
        (key) => Array.isArray(key) && (key[0] === "rival" || key[0] === "match" || key[0] === "compare"),
        undefined,
        { revalidate: true },
      );
    };

    const connect = () => {
      if (stopped) return;
      setTransport("connecting");
      source = new EventSource(`${base}/api/stream`);
      source.addEventListener("hello", (ev) => {
        retry = 0;
        setSseOpen(true);
        setTransport("sse");
        try {
          const body = JSON.parse((ev as MessageEvent).data) as StreamMessage;
          seqRef.current = Number(body.seq || 0);
          snapshotRef.current = String(body.snapshot_id || "");
        } catch {
          /* ignore */
        }
      });
      source.addEventListener("snapshot_updated", (ev) => {
        retry = 0;
        setSseOpen(true);
        setTransport("sse");
        try {
          apply(JSON.parse((ev as MessageEvent).data) as StreamMessage);
        } catch {
          /* ignore */
        }
      });
      source.onerror = () => {
        setSseOpen(false);
        setTransport("polling");
        source?.close();
        const wait = Math.min(15_000, 1200 * 2 ** retry);
        retry += 1;
        window.setTimeout(connect, wait);
      };
    };

    connect();
    return () => {
      stopped = true;
      source?.close();
    };
  }, [mutate]);

  useEffect(() => {
    if (!banner) return;
    const t = window.setTimeout(() => setBanner(null), 4200);
    return () => window.clearTimeout(t);
  }, [banner]);

  const value = useMemo(
    () => ({ transport, sseOpen, events, banner, stale, seq: seqRef.current }),
    [transport, sseOpen, events, banner, stale],
  );

  return <LiveSessionContext.Provider value={value}>{children}</LiveSessionContext.Provider>;
}
