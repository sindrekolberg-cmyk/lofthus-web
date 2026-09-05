"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useLofthus } from "@/lib/useLofthus";
import { signed } from "@/lib/format";
import { useSelectedManager } from "@/lib/selected-manager";
import { ApiState, LoadingBlock } from "@/components/ApiState";
import { AnalysisShell } from "@/components/AnalysisShell";
import { ManagerSearch } from "@/components/ManagerSearch";

function RivalInner() {
  const params = useSearchParams();
  const router = useRouter();
  const { entryId, setEntryId } = useSelectedManager();
  const managers = useLofthus("managers", () => api.managers(), { live: false });
  const me = Number(params.get("me") || entryId || 0);
  const rivalParam = Number(params.get("rival") || 0);
  const options = useMemo(() => managers.data?.managers || [], [managers.data]);
  const a = me || options[0]?.entry || 0;
  const b =
    rivalParam && rivalParam !== a
      ? rivalParam
      : options.find((m) => m.entry !== a)?.entry || 0;
  const duel = useLofthus(
    a && b ? ["rival", a, b] : null,
    () => api.rival(a, b),
    { live: true },
  );
  const [depth, setDepth] = useState(false);
  const radar = duel.data;
  const labels = useMemo(
    () => Object.fromEntries(options.map((m) => [m.entry, `${m.manager} · ${m.team}`])),
    [options],
  );

  return (
    <AnalysisShell
      kicker="Live-duell"
      title="Rivalradar"
      intro="Strategisk verktøy mot den du jakter — eller den som jakter deg. Compare er noe annet."
    >
      <div className="mb-6 max-w-sm">
        <ManagerSearch managers={options} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          <span className="font-condensed text-[11px] tracking-[0.14em] text-muted uppercase">
            Deg
          </span>
          <select
            className="mt-1 w-full border border-rule bg-paper px-3 py-2"
            value={a || ""}
            onChange={(e) => {
              const next = Number(e.target.value);
              setEntryId(next);
              router.replace(`/analyse/rivalradar?me=${next}&rival=${b}`);
            }}
          >
            {options.map((m) => (
              <option key={m.entry} value={m.entry}>
                {labels[m.entry]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="font-condensed text-[11px] tracking-[0.14em] text-muted uppercase">
            Rival
          </span>
          <select
            className="mt-1 w-full border border-rule bg-paper px-3 py-2"
            value={b || ""}
            onChange={(e) => {
              const next = Number(e.target.value);
              router.replace(`/analyse/rivalradar?me=${a}&rival=${next}`);
            }}
          >
            {options
              .filter((m) => m.entry !== a)
              .map((m) => (
                <option key={m.entry} value={m.entry}>
                  {labels[m.entry]}
                </option>
              ))}
          </select>
        </label>
      </div>

      {duel.loading && !radar ? <LoadingBlock /> : null}
      {duel.error && !radar ? <ApiState message={duel.error} /> : null}

      {radar ? (
        <>
          <div className="mt-10 grid gap-6 border-t border-ink pt-8 sm:grid-cols-2">
            <div>
              <p className="font-condensed text-[11px] text-muted uppercase">Deg</p>
              <h2 className="font-serif text-3xl">
                <Link href={`/manager/${radar.me.entry}`} className="hover:underline">
                  {radar.me.manager}
                </Link>
              </h2>
              <p className="text-muted">{radar.me.team}</p>
            </div>
            <div className="sm:text-right">
              <p className="font-condensed text-[11px] text-muted uppercase">Rival</p>
              <h2 className="font-serif text-3xl">
                <Link href={`/manager/${radar.rival.entry}`} className="hover:underline">
                  {radar.rival.manager}
                </Link>
              </h2>
              <p className="text-muted">{radar.rival.team}</p>
            </div>
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
            <div>
              <dt className="text-xs text-muted">Total gap</dt>
              <dd className="font-condensed text-3xl">{signed(radar.total_gap)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">GW gap</dt>
              <dd className="font-condensed text-3xl">{signed(radar.gw_gap)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Felles</dt>
              <dd className="font-condensed text-3xl">{radar.common_players}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Igjen</dt>
              <dd className="font-condensed text-3xl">
                {radar.players_remaining.me} / {radar.players_remaining.rival}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-sm text-muted">
            Kapteiner: {radar.captains.me} vs {radar.captains.rival}
            {radar.provisional ? " · tallene er foreløpige" : ""}
          </p>

          <div className="mt-12 grid gap-10 lg:grid-cols-2">
            <section>
              <h3 className="font-condensed text-[12px] tracking-[0.2em] text-[#2f6a32] uppercase">
                Heia på
              </h3>
              <ul className="mt-4 divide-y divide-rule border-y border-rule">
                {radar.cheer_for.length ? (
                  radar.cheer_for.map((e) => (
                    <li key={e.element} className="py-3">
                      <p className="font-serif text-xl">{e.headline}</p>
                      <p className="text-sm text-muted">
                        {e.status_label} · {e.event_points} p · swing {signed(e.live_swing)}
                      </p>
                    </li>
                  ))
                ) : (
                  <li className="py-3 text-sm text-muted">Ingen åpne differensialer igjen.</li>
                )}
              </ul>
            </section>
            <section>
              <h3 className="font-condensed text-[12px] tracking-[0.2em] text-live uppercase">
                Håp på blank
              </h3>
              <ul className="mt-4 divide-y divide-rule border-y border-rule">
                {radar.hope_blank.length ? (
                  radar.hope_blank.map((e) => (
                    <li key={e.element} className="py-3">
                      <p className="font-serif text-xl">{e.headline}</p>
                      <p className="text-sm text-muted">
                        {e.status_label} · {e.event_points} p · swing {signed(e.live_swing)}
                      </p>
                    </li>
                  ))
                ) : (
                  <li className="py-3 text-sm text-muted">Ingen åpne trusler igjen.</li>
                )}
              </ul>
            </section>
          </div>

          <button
            type="button"
            className="mt-10 font-condensed text-[12px] tracking-[0.16em] uppercase text-muted hover:text-ink"
            onClick={() => setDepth((v) => !v)}
          >
            {depth ? "Skjul dybde" : "Vis unike spillere og forslag"}
          </button>

          {depth ? (
            <>
              <h3 className="mt-6 font-serif text-2xl">Unike spillere</h3>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-ink font-condensed text-[11px] tracking-[0.14em] text-muted uppercase">
                      <th className="py-2">Fordel</th>
                      <th className="py-2">Spiller</th>
                      <th className="py-2">Status</th>
                      <th className="py-2 text-right">Swing</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...radar.my_unique, ...radar.rival_unique].map((e) => (
                      <tr key={`${e.element}-${e.multiplier_edge}`} className="border-b border-rule">
                        <td className="py-2">
                          {e.multiplier_edge > 0 ? radar.me.manager : radar.rival.manager}
                        </td>
                        <td className="py-2">{e.player}</td>
                        <td className="py-2">{e.status_label}</td>
                        <td className="py-2 text-right font-condensed">{signed(e.live_swing)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {radar.suggested_rivals?.length ? (
                <p className="mt-6 text-sm text-muted">
                  Foreslåtte rivaler:{" "}
                  {radar.suggested_rivals.map((id) => (
                    <Link
                      key={id}
                      href={`/analyse/rivalradar?me=${a}&rival=${id}`}
                      className="mr-3 hover:underline"
                    >
                      {labels[id] || id}
                    </Link>
                  ))}
                </p>
              ) : null}
            </>
          ) : null}
        </>
      ) : null}
    </AnalysisShell>
  );
}

export default function RivalradarPage() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <RivalInner />
    </Suspense>
  );
}
