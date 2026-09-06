"use client";

import { AnalysisShell } from "@/components/AnalysisShell";
import { ApiState, LoadingBlock } from "@/components/ApiState";
import { PlayerImage } from "@/components/PlayerImage";
import { ownersLabel } from "@/lib/format";
import { api } from "@/lib/api";
import { useLofthus } from "@/lib/useLofthus";

export default function OwnershipPage() {
  const { data, error, loading } = useLofthus(
    "ownership",
    () => api.analysisOwnership(),
    { live: true },
  );
  return (
    <AnalysisShell
      kicker="Feltet"
      title="Eierskap"
      intro="Hvem alle har, og hvem som splittet ligaen denne runden."
    >
      {loading && !data ? <LoadingBlock /> : null}
      {error && !data ? <ApiState message={error} /> : null}
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {(data?.players || []).slice(0, 16).map((p) => (
          <li key={p.element} className="relative aspect-[3/4] overflow-hidden bg-[#d8d1c4]">
            <PlayerImage src={p.image_url} alt={p.player} variant="card" />
            <div className="absolute inset-x-0 bottom-0 bg-ink/80 p-3 text-paper">
              <p className="font-serif text-xl leading-tight">{p.player}</p>
              <p className="font-condensed text-[11px] text-paper/70">
                {Math.round(p.ownership_pct)}% · {ownersLabel(p.ownership_count)}
                {p.captain_count ? ` · ${p.captain_count} C` : ""}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </AnalysisShell>
  );
}
