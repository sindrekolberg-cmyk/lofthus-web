"use client";

import { AnalysisShell } from "@/components/AnalysisShell";
import { ApiState, LoadingBlock } from "@/components/ApiState";
import { OwnershipTable } from "@/components/OwnershipTable";
import { api } from "@/lib/api";
import { useLofthus } from "@/lib/useLofthus";

export default function OwnershipPage() {
  const { data, error, loading } = useLofthus(
    "ownership",
    () => api.analysisOwnership(),
    { live: true },
  );
  const size = data?.league_size || data?.players?.[0]?.league_size || 0;

  return (
    <AnalysisShell
      kicker="Feltet"
      title="Eierskap"
      intro="Eierandel inne i Lofthus — ikke FPL-eierskap. Prosenten er andelen av nåværende ligamedlemmer som eier spilleren."
    >
      {loading && !data ? <LoadingBlock /> : null}
      {error && !data ? <ApiState message={error} /> : null}
      {data ? <OwnershipTable players={data.players || []} leagueSize={size} /> : null}
    </AnalysisShell>
  );
}
