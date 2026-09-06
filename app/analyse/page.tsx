import Link from "next/link";
import { analysisEntries } from "@/lib/types";

export default function AnalyseHubPage() {
  return (
    <main className="flex-1 bg-paper">
      <div className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6 md:py-16">
        <p className="font-condensed text-xs tracking-[0.22em] text-muted uppercase">Verktøy</p>
        <h1 className="mt-3 font-serif text-3xl leading-none sm:text-5xl">Analyseverktøy</h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-muted">
          Ett verktøy om gangen.
        </p>
        <ul className="mt-14 grid gap-4 sm:grid-cols-2">
          {analysisEntries.map((entry) => (
            <li key={entry.href}>
              <Link
                href={entry.href}
                className="block h-full border border-rule bg-white/40 p-6 transition-colors hover:border-ink"
              >
                <p className="font-condensed text-[11px] tracking-[0.18em] text-muted uppercase">
                  {entry.kicker}
                </p>
                <p className="mt-3 font-serif text-2xl leading-none sm:text-3xl">{entry.title}</p>
                <p className="mt-3 text-sm leading-6 text-muted">{entry.line}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
