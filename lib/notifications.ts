export type NotificationCategory =
  | "rank_change"
  | "captain_points"
  | "autosub"
  | "round_finished"
  | "month_table";

export type NotificationPrefs = Record<NotificationCategory, boolean>;

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  rank_change: false,
  captain_points: false,
  autosub: false,
  round_finished: false,
  month_table: false,
};

export const NOTIFICATION_LABELS: Record<NotificationCategory, string> = {
  rank_change: "Min plassering endres",
  captain_points: "Kapteinen min får poeng",
  autosub: "Autosub skjer",
  round_finished: "Runden er ferdig",
  month_table: "Månedstabellen endres",
};

export type PushPermissionState = "unsupported" | "default" | "granted" | "denied";

export function pushPermissionState(): PushPermissionState {
  if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) {
    return "unsupported";
  }
  return Notification.permission as Exclude<PushPermissionState, "unsupported">;
}

/** Never call on first visit. Only after a clear user action. */
export async function requestPushPermission(): Promise<PushPermissionState> {
  const current = pushPermissionState();
  if (current !== "default") return current;
  const next = await Notification.requestPermission();
  return next;
}

export type PushSubscribeBody = {
  subscription: PushSubscriptionJSON;
  prefs: NotificationPrefs;
  entry_id?: number | null;
};

export async function postPushSubscription(body: PushSubscribeBody) {
  const res = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error("Kunne ikke lagre varslingsabonnement");
  }
  return res.json() as Promise<{ ok: boolean; stored: boolean; message?: string }>;
}
