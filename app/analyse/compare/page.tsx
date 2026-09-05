"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useLofthus } from "@/lib/useLofthus";
import { signed } from "@/lib/format";
import { ApiState, LoadingBlock } from "@/components/ApiState";
import { AnalysisShell } from "@/components/AnalysisShell";

function CompareInner() {
  const params = useSearchParams();
  const router = useRouter();
  const managers = useLofthus("managers", () => api.managers(), { live: false });
  const options = managers.data?.managers || [];
  const a = Number(params.get("a") || options[0]?.entry || 0);
  const b = Number(params.get("b") || options[1]?.entry || 0);
  const cmp = useLofthus(a && b ? ["compare", a, b] : null, () => api.compare(a, b), {
    live: true,
  });
  const data = cmp.data;

  return (
    <AnalysisShell
      kicker="Side om side"
      title="Compare"
      intro="Bred sammenligning av to managere. Rivalradar er live-duellen."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {(["a", "b"] as const).map((key) => (
          <label key={key} className="text-sm">
            <span className="font-condensed text-[11px] tracking-[0.14em] text-muted uppercase">
              Manager {key.toUpperCase()}
            </span>
            <select
              className="mt-1 w-full border border-rule bg-paper px-3 py-2"
              value={key === "a" ? a : b}
              onChange={(e) => {
                const next = Number(e.target.value);
                const qs =
                  key === "a" ? `a=${next}&b=${b}` : `a=${a}&b=${next}`;
                router.replace(`/analyse/compare?${qs}`);
              }}
            >
              {options.map((m) => (
                <option key={m.entry} value={m.entry}>
                  {m.manager} · {m.team}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      {cmp.loading && !data ? <LoadingBlock /> : null}
      {cmp.error && !data ? <ApiState message={cmp.error} /> : null}

      {data ? (
        <>
          <dl className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
            <div>
              <dt className="text-xs text-muted">Total gap</dt>
              <dd className="font-condensed text-3xl">{signed(data.total_gap)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">GW gap</dt>
              <dd className="font-condensed text-3xl">{signed(data.gw_gap)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Squad overlap</dt>
              <dd className="font-condensed text-3xl">{data.overlap}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Unike</dt>
              <dd className="font-condensed text-3xl">
                {data.unique.a} / {data.unique.b}
              </dd>
            </div>
          </dl>
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            {[data.a, data.b].map((m, i) => (
              <section key={m.entry}>
                <h2 className="font-serif text-3xl">
                  <Link href={`/manager/${m.entry}`} className="hover:underline">
                    {m.manager}
                  </Link>
                </h2>
                <p className="text-muted">{m.team}</p>
                <ul className="mt-4 text-sm leading-7">
                  <li>Plass {m.rank}</li>
                  <li>Total {m.total}</li>
                  <li>GW {m.gw}</li>
                  <li>Kaptein {i === 0 ? data.captains.a : data.captains.b}</li>
                  <li>Chip {(i === 0 ? data.chips.a : data.chips.b) || "ingen"}</li>
                </ul>
                <p className="mt-4 font-condensed text-[11px] tracking-[0.14em] text-muted uppercase">
                  Form
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(i === 0 ? data.form_a : data.form_b).map((row) => (
                    <span key={row.event} className="border border-rule px-2 py-1 font-condensed">
                      GW{row.event} {row.points}
                    </span>
                  ))}
                </div>
              </section>
            ))}
          </div>
          <p className="mt-8 text-sm text-muted">
            <Link href={`/analyse/rivalradar?me=${data.a.entry}&rival=${data.b.entry}`}>
              Åpne samme par i Rivalradar →
            </Link>
          </p>
        </>
      ) : null}
    </AnalysisShell>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <CompareInner />
    </Suspense>
  );
}
