export type PulseEvent = {
  event_id: string;
  fixture_id: number;
  event_type: string;
  player_id: number;
  player_name: string;
  team: string;
  timestamp: string;
  old_points: number;
  new_points: number;
  point_delta: number;
  snapshot_id: string;
  label: string;
  banner: string;
};

export type StreamMessage = {
  type?: string;
  seq?: number;
  snapshot_id?: string;
  generated_at?: string;
  source_updated_at?: string;
  gw?: number;
  phase?: string;
  is_live?: boolean;
  stale?: boolean;
  events?: PulseEvent[];
  event_history?: PulseEvent[];
  live?: unknown;
};

export function isNewerSnapshot(incomingSeq: number, currentSeq: number) {
  return Number(incomingSeq) > Number(currentSeq);
}

export function shouldApplySnapshot(incoming: { seq?: number; snapshot_id?: string }, current: { seq?: number; snapshot_id?: string }) {
  const incomingSeq = Number(incoming.seq || 0);
  const currentSeq = Number(current.seq || 0);
  if (incomingSeq && currentSeq) return isNewerSnapshot(incomingSeq, currentSeq);
  const a = String(incoming.snapshot_id || "");
  const b = String(current.snapshot_id || "");
  if (!a) return false;
  if (!b) return true;
  return a !== b && a > b;
}

export function fallbackPollMs(isLive: boolean, sseOpen: boolean) {
  if (!isLive) return 180_000;
  return sseOpen ? 60_000 : 15_000;
}

export function duplicateEvent(seen: Set<string>, eventId: string) {
  if (!eventId) return true;
  if (seen.has(eventId)) return true;
  seen.add(eventId);
  return false;
}
