"use client";

import Link from "next/link";
import { AnalysisShell } from "@/components/AnalysisShell";
import { ApiState, LoadingBlock } from "@/components/ApiState";
import { api } from "@/lib/api";
import { useLofthus } from "@/lib/useLofthus";

export default function OddsPage() {
  const { data, error, loading } = useLofthus("odds", () => api.odds(), { live: true });
  return (
    <AnalysisShell
      kicker="Marked"
      title="Odds"
      intro="Før-sesongprior oppdatert med live tabell. Dette er ikke bettingråd."
    >
      {loading && !data ? <LoadingBlock /> : null}
      {error && !data ? <ApiState message={error} /> : null}
      {data && !data.ready ? (
        <p className="text-sm text-muted">{data.note || "Odds er ikke klare ennå."}</p>
      ) : null}
      {data?.ready ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink font-condensed text-[11px] tracking-[0.14em] text-muted uppercase">
                <th className="py-2">Manager</th>
                <th className="py-2 text-right">Plass</th>
                <th className="py-2 text-right">Sjanse</th>
                <th className="py-2 text-right">Odds</th>
                <th className="py-2">Lesning</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row) => (
                <tr key={row.entry} className="border-b border-rule">
                  <td className="py-2">
                    <Link href={`/manager/${row.entry}`} className="hover:underline">
                      {row.manager}
                    </Link>
                  </td>
                  <td className="py-2 text-right font-condensed">{row.rank}</td>
                  <td className="py-2 text-right font-condensed">{row.win_pct}%</td>
                  <td className="py-2 text-right font-condensed">{row.odds}</td>
                  <td className="py-2 text-muted">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </AnalysisShell>
  );
}
