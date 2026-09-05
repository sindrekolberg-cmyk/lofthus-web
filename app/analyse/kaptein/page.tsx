"use client";

import { AnalysisShell } from "@/components/AnalysisShell";
import { ApiState, LoadingBlock } from "@/components/ApiState";
import { api } from "@/lib/api";
import { useLofthus } from "@/lib/useLofthus";

export default function KapteinPage() {
  const { data, error, loading } = useLofthus("captain", () => api.analysisCaptain(), {
    live: true,
  });
  return (
    <AnalysisShell
      kicker="Armbindet"
      title="Kaptein"
      intro="Hvem bar C-en i Lofthus denne runden — og hvem fikk betalt."
    >
      {loading && !data ? <LoadingBlock /> : null}
      {error && !data ? <ApiState message={error} /> : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink font-condensed text-[11px] tracking-[0.14em] text-muted uppercase">
              <th className="py-2">Spiller</th>
              <th className="py-2 text-right">C</th>
              <th className="py-2 text-right">TC</th>
              <th className="py-2 text-right">Poeng</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {(data?.players || []).slice(0, 25).map((p) => (
              <tr key={p.element} className="border-b border-rule">
                <td className="py-2">{p.player}</td>
                <td className="py-2 text-right font-condensed">{p.captain_count}</td>
                <td className="py-2 text-right font-condensed">{p.triple_captain_count}</td>
                <td className="py-2 text-right font-condensed">
                  {p.fixture_status === "not_started" ? "ikke spilt" : p.event_points}
                </td>
                <td className="py-2">{p.fixture_status_label}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AnalysisShell>
  );
}
