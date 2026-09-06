"use client";

import Link from "next/link";
import { AnalysisShell } from "@/components/AnalysisShell";
import { ApiState, LoadingBlock } from "@/components/ApiState";
import { api } from "@/lib/api";
import { useLofthus } from "@/lib/useLofthus";

export default function ChipsPage() {
  const { data, error, loading } = useLofthus("chips", () => api.analysisChips(), {
    live: true,
  });
  return (
    <AnalysisShell
      kicker="Timing"
      title="Sjetonger"
      intro="Wildcard, benkboost og de som fortsatt venter."
    >
      {loading && !data ? <LoadingBlock /> : null}
      {error && !data ? <ApiState message={error} /> : null}
      <ul className="divide-y divide-rule border-y border-rule">
        {(data?.chips || []).length ? (
          (data?.chips || []).map((c) => (
            <li key={`${c.entry}-${c.chip}`} className="flex justify-between py-3">
              <Link href={`/manager/${c.entry}`} className="hover:underline">
                {c.manager}
              </Link>
              <span className="font-condensed">{c.chip}</span>
            </li>
          ))
        ) : (
          <li className="py-3 text-sm text-muted">Ingen aktive chips denne runden.</li>
        )}
      </ul>
    </AnalysisShell>
  );
}
