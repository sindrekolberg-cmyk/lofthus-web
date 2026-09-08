"use client";

import { useMemo, useState } from "react";
import { api } from "@/lib/api";
import { useLofthus } from "@/lib/useLofthus";
import { useSelectedManager } from "@/lib/selected-manager";
import { leagueOwnership } from "@/lib/format";
import { ApiState, LoadingBlock } from "@/components/ApiState";
import { PlayerImage } from "@/components/PlayerImage";
import type { TransferPick } from "@/lib/types";
import type { WildcardPayload, WildcardPlayer } from "@/lib/wildcard";

type TransferMode = "single" | "wildcard";

const GOALS = [
  { id: "rapid_lofthus", label: "Klatre raskt i Lofthus", line: "Jakt de foran deg." },
  { id: "win_lofthus", label: "Vinne Lofthus", line: "Avstanden til førsteplass styrer tempoet." },
  { id: "defend", label: "Forsvare posisjonen min", line: "Beskytt plassen." },
  { id: "win_month", label: "Vinne måneden", line: "Månedstabellen er feltet." },
  { id: "beat_rival", label: "Slå en bestemt rival", line: "Ett navn." },
  { id: "climb_or", label: "Klatre jevnt på OR", line: "Trygg output over tid." },
  { id: "balanced", label: "Balansert", line: "Kvalitet og litt leverage." },
];

const HORIZONS = [
  { id: 1, label: "Neste runde" },
  { id: 3, label: "Neste 3 runder" },
  { id: 5, label: "Neste 5 runder" },
];

const POSITIONS = [
  { id: "all", label: "Alle" },
  { id: "gk", label: "Keeper" },
  { id: "def", label: "Forsvar" },
  { id: "mid", label: "Midtbane" },
  { id: "fwd", label: "Angrep" },
];

const TARGETS = [
  { id: "", label: "Nærmeste foran" },
  { id: "next_10", label: "De neste 10" },
  { id: "next_20", label: "De neste 20" },
  { id: "top_10", label: "Topp 10" },
  { id: "top_20", label: "Topp 20" },
];

function riskWord(n: number) {
  if (n >= 75) return "Full send";
  if (n <= 30) return "Trygg";
  return "Balansert";
}

function PickCard({ row, kicker }: { row: TransferPick; kicker: string }) {
  return (
    <article className="border border-rule bg-white/50 p-4">
      <p className="font-condensed text-[11px] tracking-[0.16em] text-live uppercase">{kicker}</p>
      <div className="mt-3 flex gap-3">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden bg-ink/5">
          <PlayerImage src={row.image_url} alt={row.player} variant="avatar" fill />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-serif text-2xl leading-none">{row.player}</p>
          <p className="mt-1 text-sm text-muted">
            {row.club} · {row.position} · £{Number(row.price).toFixed(1)}
          </p>
        </div>
        <p className="font-condensed text-xl">{row.strategy_score.toFixed(1)}</p>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div>
          <dt className="text-[11px] tracking-[0.12em] text-muted uppercase">Lofthus</dt>
          <dd>{leagueOwnership(row.league_ownership_pct, row.league_owners, row.league_size)}</dd>
        </div>
        <div>
          <dt className="text-[11px] tracking-[0.12em] text-muted uppercase">Målgruppe</dt>
          <dd>
            {row.target_cohort_owners}/{row.target_cohort_size} eiere
          </dd>
        </div>
        <div>
          <dt className="text-[11px] tracking-[0.12em] text-muted uppercase">Relativ oppside</dt>
          <dd>{row.relative_upside}</dd>
        </div>
        <div>
          <dt className="text-[11px] tracking-[0.12em] text-muted uppercase">Nedsiderisiko</dt>
          <dd>{row.nedsiderisiko}</dd>
        </div>
      </dl>
      <p className="mt-3 text-sm text-muted">
        {row.fixtures?.length ? `Neste: ${row.fixtures.join(" · ")}` : "Kampprogram mangler"}
      </p>
      <p className="mt-1 text-[11px] text-muted">
        Vurdering neste runder: {row.projection_index.toFixed(1)}/10 · Datagrunnlag: {row.datagrunnlag}
      </p>
      <ul className="mt-3 space-y-1 text-sm">
        {(row.why || []).map((line) => (
          <li key={line}>· {line}</li>
        ))}
      </ul>
    </article>
  );
}

function WildcardPlayerRow({ player }: { player: WildcardPlayer }) {
  return (
    <li className="flex justify-between gap-3 border-b border-rule py-3">
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-1.5 font-serif text-lg leading-tight">
          {player.player}
          {player.captain ? (
            <span className="bg-ink px-1.5 py-0.5 font-condensed text-[9px] tracking-[0.12em] text-paper uppercase">C</span>
          ) : null}
          {player.vice_captain ? (
            <span className="bg-ink px-1.5 py-0.5 font-condensed text-[9px] tracking-[0.12em] text-paper uppercase">VC</span>
          ) : null}
          {player.currently_owned ? (
            <span className="bg-black/[0.05] px-1.5 py-0.5 font-condensed text-[9px] tracking-[0.12em] text-muted uppercase">
              Behold
            </span>
          ) : null}
        </p>
        <p className="mt-1 text-sm text-muted">
          {player.club} · {player.position} · £{Number(player.price).toFixed(1)}
        </p>
        <p className="mt-1 text-[11px] text-muted">
          Lofthus {Number(player.league_ownership_pct || 0).toFixed(0)} % · globalt{" "}
          {Number(player.global_ownership_pct || 0).toFixed(0)} % · xGI/90 {Number(player.xgi_per90 || 0).toFixed(2)}
        </p>
      </div>
      <p className="font-condensed text-lg tabular-nums">{Number(player.squad_score || 0).toFixed(1)}</p>
    </li>
  );
}

function WildcardResult({ data }: { data: WildcardPayload }) {
  return (
    <div className="space-y-8 border-t border-ink pt-6">
      <section>
        <p className="font-condensed text-[12px] tracking-[0.16em] uppercase">Wildcard-forslag</p>
        <h2 className="mt-2 font-serif text-3xl leading-none">{data.manager.manager}</h2>
        <dl className="mt-5 grid grid-cols-3 gap-3">
          <div className="border border-rule bg-white/50 p-3">
            <dt className="text-[11px] tracking-[0.12em] text-muted uppercase">Budsjett</dt>
            <dd className="font-condensed text-2xl">£{Number(data.budget.available).toFixed(1)}</dd>
          </div>
          <div className="border border-rule bg-white/50 p-3">
            <dt className="text-[11px] tracking-[0.12em] text-muted uppercase">Brukt</dt>
            <dd className="font-condensed text-2xl">£{Number(data.budget.used).toFixed(1)}</dd>
          </div>
          <div className="border border-rule bg-white/50 p-3">
            <dt className="text-[11px] tracking-[0.12em] text-muted uppercase">Igjen</dt>
            <dd className="font-condensed text-2xl">£{Number(data.budget.remaining).toFixed(1)}</dd>
          </div>
        </dl>
        {!data.budget.exact ? (
          <p className="mt-3 text-sm text-muted">
            Budsjettet er estimert fordi alle salgspriser ikke var tilgjengelige.
          </p>
        ) : null}
        {data.captain ? (
          <p className="mt-4 text-sm text-muted">
            Kaptein: {data.captain.player}
            {data.vice_captain ? ` · Visekaptein: ${data.vice_captain.player}` : ""}
          </p>
        ) : null}
      </section>

      <section>
        <h3 className="font-condensed text-[12px] tracking-[0.16em] uppercase">Førsteellever</h3>
        <ul className="mt-3 border-t border-ink">
          {(data.starting_xi || []).map((player) => (
            <WildcardPlayerRow key={`xi-${player.element}`} player={player} />
          ))}
        </ul>
      </section>

      <section>
        <h3 className="font-condensed text-[12px] tracking-[0.16em] uppercase">Benk</h3>
        <ul className="mt-3 border-t border-ink">
          {(data.bench || []).map((player) => (
            <WildcardPlayerRow key={`bench-${player.element}`} player={player} />
          ))}
        </ul>
      </section>

      <section>
        <h3 className="font-condensed text-[12px] tracking-[0.16em] uppercase">Endringer fra ditt nåværende lag</h3>
        <p className="mt-4 font-condensed text-[11px] tracking-[0.12em] uppercase">Inn ({data.transfers_in?.length || 0})</p>
        <ul className="mt-2 space-y-1 text-sm">
          {(data.transfers_in || []).map((player) => (
            <li key={`in-${player.element}`}>
              + {player.player} · {player.position} · £{Number(player.price).toFixed(1)}
            </li>
          ))}
        </ul>
        <p className="mt-4 font-condensed text-[11px] tracking-[0.12em] uppercase">Ut ({data.transfers_out?.length || 0})</p>
        <ul className="mt-2 space-y-1 text-sm">
          {(data.transfers_out || []).map((player) => (
            <li key={`out-${player.element}`}>
              − {player.player}
              {player.selling_price !== undefined && player.selling_price !== null
                ? ` · £${Number(player.selling_price).toFixed(1)}`
                : ""}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function TransferStrategyBoard() {
  const { entryId, setEntryId } = useSelectedManager();
  const managers = useLofthus("managers", () => api.managers(), { live: false });
  const options = managers.data?.managers || [];
  const [strategy, setStrategy] = useState("rapid_lofthus");
  const [risk, setRisk] = useState(55);
  const [horizon, setHorizon] = useState(3);
  const [target, setTarget] = useState("");
  const [rivalId, setRivalId] = useState(0);
  const [position, setPosition] = useState("all");
  const [mode, setMode] = useState<TransferMode>("single");
  const [wildcard, setWildcard] = useState<WildcardPayload | null>(null);
  const [wildcardError, setWildcardError] = useState("");
  const [wildcardBusy, setWildcardBusy] = useState(false);

  const ready = Boolean(entryId && mode === "single" && (strategy !== "beat_rival" || rivalId));
  const key = ready
    ? ["transfers", entryId, strategy, risk, horizon, target, rivalId, position]
    : null;
  const payload = useLofthus(
    key,
    () =>
      api.analysisTransfers({
        entry_id: entryId,
        strategy,
        risk,
        horizon,
        target,
        rival_id: strategy === "beat_rival" ? rivalId : 0,
        position,
      }),
    { live: false },
  );

  const rivals = useMemo(() => options.filter((m) => m.entry !== entryId), [options, entryId]);
  const data = payload.data;

  function clearWildcard() {
    setWildcard(null);
    setWildcardError("");
  }

  async function runWildcard() {
    if (!entryId) return;
    setWildcardBusy(true);
    setWildcardError("");
    setWildcard(null);
    try {
      setWildcard(await api.analysisWildcard({ entry_id: entryId, strategy, risk, horizon: 5 }));
    } catch (error) {
      setWildcardError(error instanceof Error ? error.message : "Kunne ikke bygge wildcard-forslaget.");
    } finally {
      setWildcardBusy(false);
    }
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-condensed text-[12px] tracking-[0.16em] uppercase">Type råd</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {(
            [
              ["single", "Enkeltbytte"],
              ["wildcard", "Wildcard"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setMode(id);
                clearWildcard();
              }}
              className={`min-h-11 border px-3 font-condensed text-[12px] tracking-[0.12em] uppercase ${
                mode === id ? "border-ink bg-ink text-paper" : "border-rule text-muted hover:border-ink hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-condensed text-[12px] tracking-[0.16em] uppercase">Hva prøver du å oppnå?</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {GOALS.map((goal) => (
            <button
              key={goal.id}
              type="button"
              onClick={() => {
                setStrategy(goal.id);
                clearWildcard();
              }}
              className={`min-h-14 border px-4 py-3 text-left ${
                strategy === goal.id ? "border-ink bg-white" : "border-rule bg-white/40"
              }`}
            >
              <span className="block font-serif text-lg leading-tight">{goal.label}</span>
              <span className="mt-1 block text-sm text-muted">{goal.line}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-8 md:grid-cols-2">
        <div>
          <p className="font-condensed text-[12px] tracking-[0.16em] uppercase">Risikovilje</p>
          <p className="mt-2 font-serif text-2xl">{riskWord(risk)}</p>
          <input
            type="range"
            min={0}
            max={100}
            value={risk}
            onChange={(e) => {
              setRisk(Number(e.target.value));
              clearWildcard();
            }}
            className="mt-4 w-full"
            aria-label="Risikovilje"
          />
          <p className="mt-2 text-sm text-muted">Trygg ——— Balansert ——— Full send</p>
        </div>
        <div>
          <p className="font-condensed text-[12px] tracking-[0.16em] uppercase">Horisont</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {HORIZONS.map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => setHorizon(h.id)}
                className={`min-h-11 border px-3 font-condensed text-[12px] tracking-[0.12em] uppercase ${
                  horizon === h.id ? "border-ink bg-white" : "border-rule"
                }`}
              >
                {h.label}
              </button>
            ))}
          </div>
          {mode === "single" ? (
            <>
              <p className="mt-6 font-condensed text-[12px] tracking-[0.16em] uppercase">Posisjon</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {POSITIONS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPosition(p.id)}
                    className={`min-h-11 border px-3 text-sm ${position === p.id ? "border-ink bg-white" : "border-rule"}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p className="mt-6 text-sm text-muted">
              Wildcard vurderer de neste fem kampene. Datagrunnlaget inkluderer FPL-spillerdata, eierskap og faktisk budsjett.
            </p>
          )}
        </div>
      </section>

      {mode === "single" && strategy !== "climb_or" && strategy !== "beat_rival" ? (
        <label className="block text-sm">
          <span className="font-condensed text-[12px] tracking-[0.16em] uppercase">Målgruppe</span>
          <select
            className="mt-2 w-full max-w-md border border-rule bg-paper px-3 py-2"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          >
            {TARGETS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {mode === "single" && strategy === "beat_rival" ? (
        <label className="block text-sm">
          <span className="font-condensed text-[12px] tracking-[0.16em] uppercase">Rival</span>
          <select
            className="mt-2 w-full max-w-md border border-rule bg-paper px-3 py-2"
            value={rivalId}
            onChange={(e) => setRivalId(Number(e.target.value))}
          >
            <option value={0}>Velg rival</option>
            {rivals.map((m) => (
              <option key={m.entry} value={m.entry}>
                {m.manager} · {m.team}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {!entryId ? (
        <section className="border border-ink bg-white/60 p-5">
          <h2 className="font-serif text-2xl">Velg deg selv</h2>
          <p className="mt-2 text-sm text-muted">Transferstrategi trenger troppen din. Ingen ny innlogging.</p>
          <select
            className="mt-4 w-full max-w-md border border-rule bg-paper px-3 py-2"
            value=""
            onChange={(e) => {
              setEntryId(Number(e.target.value));
              clearWildcard();
            }}
          >
            <option value="">Finn meg i Lofthus</option>
            {options.map((m) => (
              <option key={m.entry} value={m.entry}>
                {m.manager} · {m.team}
              </option>
            ))}
          </select>
        </section>
      ) : (
        <section className="border border-rule p-4">
          <p className="font-condensed text-[11px] tracking-[0.16em] text-muted uppercase">Min Lofthus</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
            <p className="font-serif text-xl">{options.find((m) => m.entry === entryId)?.manager || "Valgt manager"}</p>
            <select
              className="border border-rule bg-paper px-3 py-2 text-sm"
              value={entryId}
              onChange={(e) => {
                setEntryId(Number(e.target.value));
                clearWildcard();
              }}
            >
              {options.map((m) => (
                <option key={m.entry} value={m.entry}>
                  {m.manager}
                </option>
              ))}
            </select>
          </div>
        </section>
      )}

      {mode === "single" && entryId && strategy === "beat_rival" && !rivalId ? (
        <p className="text-sm text-muted">Velg rivalen du skal slå.</p>
      ) : null}

      {mode === "wildcard" && entryId ? (
        <>
          <button
            type="button"
            disabled={wildcardBusy}
            onClick={runWildcard}
            className="min-h-12 border border-ink bg-ink px-5 font-condensed text-[13px] tracking-[0.14em] text-paper uppercase disabled:opacity-40"
          >
            {wildcardBusy ? "Analyserer …" : "Bygg wildcard-lag"}
          </button>
          {wildcardBusy ? <LoadingBlock label="Bygger wildcard-lag. Dette kan ta opptil ett minutt…" /> : null}
          {wildcardError ? <ApiState message={wildcardError} /> : null}
          {wildcard ? <WildcardResult data={wildcard} /> : null}
        </>
      ) : null}

      {mode === "single" && entryId && (strategy !== "beat_rival" || rivalId) ? (
        <>
          {payload.loading && !data ? <LoadingBlock label="Bygger strategi…" /> : null}
          {payload.error && !data ? <ApiState message={payload.error} /> : null}
          {data ? (
            <div className="space-y-10">
              <section className="border-t border-ink pt-6">
                <p className="font-condensed text-[12px] tracking-[0.16em] uppercase">Din strategi</p>
                <h2 className="mt-2 font-serif text-3xl leading-none">{data.strategy.label}</h2>
                <p className="mt-3 text-sm text-muted">
                  Risiko: {riskWord(data.strategy.risk)} · Horisont: {data.strategy.horizon} runder · {data.context.target_cohort.label}
                </p>
                <p className="mt-4 max-w-2xl text-base leading-7">{data.context.summary}</p>
                {(data.warnings || []).map((w) => (
                  <p key={w} className="mt-3 text-sm text-muted">
                    {w}
                  </p>
                ))}
              </section>

              {data.recommendations[0] ? <PickCard row={data.recommendations[0]} kicker="Anbefalt trekk" /> : (
                <p className="text-sm text-muted">Vi har for lite grunnlag til å gi en sterk anbefaling akkurat nå.</p>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                {data.safe[0] ? <PickCard row={data.safe[0]} kicker="Trygt valg" /> : null}
                {data.aggressive[0] ? <PickCard row={data.aggressive[0]} kicker="Aggressivt valg" /> : null}
                {data.differentials[0] ? <PickCard row={data.differentials[0]} kicker="Differensial" /> : null}
              </div>

              {data.sell_candidates.length ? (
                <section>
                  <h3 className="font-condensed text-[12px] tracking-[0.16em] uppercase">Hvem bør ut?</h3>
                  <ul className="mt-3 divide-y divide-rule border-y border-rule">
                    {data.sell_candidates.map((row) => (
                      <li key={row.element} className="flex justify-between gap-3 py-3">
                        <span>
                          <span className="block font-serif text-lg leading-tight">{row.player}</span>
                          <span className="text-sm text-muted">{row.club} · {row.why.join(" · ")}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {data.pairs.length ? (
                <section>
                  <h3 className="font-condensed text-[12px] tracking-[0.16em] uppercase">Ut → inn</h3>
                  <ul className="mt-3 space-y-3">
                    {data.pairs.map((pair) => (
                      <li key={`${pair.out.element}-${pair.inn.element}`} className="border border-rule px-4 py-3">
                        <p className="font-serif text-xl">
                          {pair.out.player} → {pair.inn.player}
                        </p>
                        <p className="mt-1 text-sm text-muted">{pair.budget.label}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {data.why_not.length ? (
                <section>
                  <h3 className="font-condensed text-[12px] tracking-[0.16em] uppercase">Hvorfor ikke?</h3>
                  <ul className="mt-3 space-y-3">
                    {data.why_not.map((row) => (
                      <li key={row.element} className="text-sm leading-6 text-muted">
                        <span className="font-serif text-ink">{row.player}. </span>
                        {row.line}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {data.compare_modes.length ? (
                <section>
                  <h3 className="font-condensed text-[12px] tracking-[0.16em] uppercase">Samme spiller, ulik strategi</h3>
                  <ul className="mt-3 space-y-2 text-sm">
                    {data.compare_modes.map((row) => (
                      <li key={row.element} className="flex flex-wrap justify-between gap-2 border-b border-rule py-2">
                        <span className="font-serif text-lg">{row.player}</span>
                        <span className="text-muted">
                          OR {row.scores.climb_or} · Klatre {row.scores.rapid_lofthus} · Forsvar {row.scores.defend}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
