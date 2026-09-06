import Link from "next/link";
import type { ReactNode } from "react";

export function AnalysisShell({
  kicker,
  title,
  intro,
  children,
}: {
  kicker: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <main className="flex-1 bg-paper">
      <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6">
        <Link
          href="/analyse"
          className="font-condensed text-[12px] tracking-[0.16em] uppercase text-muted hover:text-ink"
        >
          ← Verktøy
        </Link>
        <p className="mt-6 font-condensed text-xs tracking-[0.22em] text-live uppercase">{kicker}</p>
        <h1 className="mt-2 font-serif text-4xl leading-none sm:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted">{intro}</p>
        <div className="mt-10">{children}</div>
      </div>
    </main>
  );
}
