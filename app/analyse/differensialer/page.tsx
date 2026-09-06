"use client";

import { AnalysisShell } from "@/components/AnalysisShell";
import { ApiState, LoadingBlock } from "@/components/ApiState";
import { api } from "@/lib/api";
import { useLofthus } from "@/lib/useLofthus";

export default function DifferensialerPage() {
  const { data, error, loading } = useLofthus(
    "diffs",
    () => api.analysisDifferentials(),
    { live: true },
  );
  return (
    <AnalysisShell
      kicker="Skjevt"
      title="Differensialer"
      intro="Lavt eierskap og faktisk avkastning. Spillere som ikke har spilt, telles ikke med."
    >
      {loading && !data ? <LoadingBlock /> : null}
      {error && !data ? <ApiState message={error} /> : null}
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-ink font-condensed text-[11px] tracking-[0.14em] text-muted uppercase">
            <th className="py-2">Spiller</th>
            <th className="py-2">Klubb</th>
            <th className="py-2 text-right">Eid</th>
            <th className="py-2 text-right">GW</th>
            <th className="py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {(data?.players || []).map((p) => (
            <tr key={p.element} className="border-b border-rule">
              <td className="py-2">{p.player}</td>
              <td className="py-2 text-muted">{p.club}</td>
              <td className="py-2 text-right font-condensed">{p.ownership_pct}%</td>
              <td className="py-2 text-right font-condensed">{p.event_points}</td>
              <td className="py-2">{p.fixture_status_label}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!loading && data && !data.players.length ? (
        <p className="mt-4 text-sm text-muted">Ingen relevante differensialer akkurat nå.</p>
      ) : null}
    </AnalysisShell>
  );
}
