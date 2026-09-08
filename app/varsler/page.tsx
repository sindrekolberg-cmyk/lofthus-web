"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useLofthus } from "@/lib/useLofthus";
import { useSelectedManager } from "@/lib/selected-manager";
import { ApiState, LoadingBlock } from "@/components/ApiState";
import {
  DEFAULT_NOTIFICATION_PREFS,
  NOTIFICATION_LABELS,
  type NotificationCategory,
  type NotificationPrefs,
  postPushSubscription,
  pushPermissionState,
  requestPushPermission,
  type PushPermissionState,
} from "@/lib/notifications";

const PREFS_KEY = "lro-notification-prefs";

function readPrefs(): NotificationPrefs {
  if (typeof window === "undefined") return DEFAULT_NOTIFICATION_PREFS;
  try {
    const raw = window.localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_NOTIFICATION_PREFS;
    return { ...DEFAULT_NOTIFICATION_PREFS, ...(JSON.parse(raw) as Partial<NotificationPrefs>) };
  } catch {
    return DEFAULT_NOTIFICATION_PREFS;
  }
}

function writePrefs(prefs: NotificationPrefs) {
  try {
    window.localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore */
  }
}

export default function VarslerPage() {
  const { entryId, setEntryId } = useSelectedManager();
  const managers = useLofthus("managers", () => api.managers(), { live: false });
  const options = managers.data?.managers || [];
  const selected = options.find((m) => m.entry === entryId);
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_NOTIFICATION_PREFS);
  const [permission, setPermission] = useState<PushPermissionState>("unsupported");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(
    "Live spillerhendelser (mål, assist, rødt) går via Lofthus-appen. Her kan du velge deg selv og be nettleseren om varslingstillatelse.",
  );

  useEffect(() => {
    setPrefs(readPrefs());
    setPermission(pushPermissionState());
  }, []);

  function togglePref(key: NotificationCategory) {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    writePrefs(next);
  }

  async function enableBrowserNotifications() {
    if (!entryId) {
      setStatus("Velg manageren din før du slår på varsler.");
      return;
    }
    setBusy(true);
    try {
      const next = await requestPushPermission();
      setPermission(next);
      if (next !== "granted") {
        setStatus(
          next === "denied"
            ? "Nettleseren har blokkert varsler. Åpne nettleserinnstillingene hvis du vil slå dem på."
            : "Denne nettleseren støtter ikke web-varsler.",
        );
        return;
      }

      if ("Notification" in window) {
        new Notification("Lofthus", {
          body: "Tillatelse er gitt i denne nettleseren. Live spillerhendelser går fortsatt via appen.",
        });
      }

      const registration =
        "serviceWorker" in navigator ? await navigator.serviceWorker.ready.catch(() => null) : null;
      if (!registration?.pushManager) {
        setStatus(
          "Nettleseren tillater varsler, men web-push fra server er ikke satt opp. Live spillerhendelser går i Lofthus-appen på mobilen.",
        );
        return;
      }

      try {
        const subscription = await registration.pushManager.subscribe({ userVisibleOnly: true });
        const result = await postPushSubscription({
          subscription: subscription.toJSON(),
          prefs,
          entry_id: entryId,
        });
        setStatus(
          result.stored
            ? "Abonnementet er lagret."
            : result.message ||
                "Tillatelse er gitt, men varsler er ikke slått på på serveren ennå. Abonnementet ble ikke lagret.",
        );
      } catch {
        setStatus(
          "Nettleseren tillater varsler, men web-push fra server er ikke satt opp ennå. Live spillerhendelser går i Lofthus-appen.",
        );
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex-1 bg-paper">
      <div className="mx-auto max-w-[720px] px-4 py-6 sm:px-6 md:py-12">
        <p className="font-condensed text-xs tracking-[0.22em] text-live uppercase">Lofthus på nett</p>
        <h1 className="mt-3 font-serif text-3xl leading-none sm:text-5xl">Varsler</h1>
        <p className="mt-4 text-base leading-7 text-muted">
          Live varsler når noen på laget ditt scorer, assisterer eller får rødt er bygget for appen (Expo).
          På web kan du velge deg selv, krysse av hva du vil høre om, og be nettleseren om tillatelse.
          Vi later ikke som om det er et Expo-token.
        </p>

        <section className="mt-10">
          <h2 className="font-condensed text-[12px] tracking-[0.16em] text-live uppercase">Hvem er du?</h2>
          {managers.loading && !managers.data ? <LoadingBlock /> : null}
          {managers.error && !managers.data ? <ApiState message={managers.error} /> : null}
          {options.length ? (
            <label className="mt-3 block text-sm">
              <span className="sr-only">Velg manager</span>
              <select
                className="mt-2 w-full border border-rule bg-paper px-3 py-3"
                value={entryId || ""}
                onChange={(e) => setEntryId(Number(e.target.value))}
              >
                <option value="">Finn meg i Lofthus</option>
                {options.map((m) => (
                  <option key={m.entry} value={m.entry}>
                    {m.manager} · {m.team}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {selected ? (
            <div className="mt-4 border border-rule bg-[#f6e4d8] px-4 py-4">
              <p className="font-condensed text-[11px] tracking-[0.16em] text-live uppercase">Valgt manager</p>
              <p className="mt-1 font-serif text-2xl">{selected.manager}</p>
              <p className="text-sm text-muted">{selected.team}</p>
            </div>
          ) : null}
        </section>

        <section className="mt-10">
          <h2 className="font-condensed text-[12px] tracking-[0.16em] uppercase">Hva vil du høre om?</h2>
          <ul className="mt-4 divide-y divide-rule border-y border-rule">
            {(Object.keys(NOTIFICATION_LABELS) as NotificationCategory[]).map((key) => (
              <li key={key} className="flex min-h-14 items-center justify-between gap-3 py-2">
                <label htmlFor={`pref-${key}`} className="text-sm">
                  {NOTIFICATION_LABELS[key]}
                </label>
                <input
                  id={`pref-${key}`}
                  type="checkbox"
                  checked={prefs[key]}
                  onChange={() => togglePref(key)}
                  className="h-5 w-5"
                />
              </li>
            ))}
          </ul>
        </section>

        <button
          type="button"
          disabled={busy || !entryId || permission === "unsupported"}
          onClick={enableBrowserNotifications}
          className="mt-8 min-h-12 border border-ink bg-ink px-5 font-condensed text-[13px] tracking-[0.14em] text-paper uppercase disabled:opacity-40"
        >
          {busy ? "Kobler til …" : "Be om varslingstillatelse"}
        </button>

        <div className="mt-6 border border-rule bg-[#f6e4d8] px-4 py-4">
          <p className="font-condensed text-[11px] tracking-[0.16em] text-live uppercase">Status</p>
          <p className="mt-2 text-sm leading-6">{status}</p>
          <p className="mt-2 text-xs text-muted">
            Nettlesertillatelse:{" "}
            {permission === "unsupported"
              ? "ikke støttet"
              : permission === "granted"
                ? "gitt"
                : permission === "denied"
                  ? "blokkert"
                  : "ikke spurt ennå"}
          </p>
        </div>
      </div>
    </main>
  );
}
