"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

type Tab = { id: string; label: string };

export function QueryTabs({
  param,
  tabs,
  fallback,
}: {
  param: string;
  tabs: Tab[];
  fallback: string;
}) {
  const search = useSearchParams();
  const pathname = usePathname();
  const current = search.get(param) || fallback;

  return (
    <div className="mt-8 flex flex-nowrap gap-2 overflow-x-auto border-b border-ink pb-0">
      {tabs.map((tab) => {
        const active = current === tab.id;
        const next = new URLSearchParams(search.toString());
        next.set(param, tab.id);
        const href = `${pathname}?${next.toString()}`;
        return (
          <Link
            key={tab.id}
            href={href}
            className={`-mb-px min-h-11 shrink-0 border-b-2 px-3 pb-3 pt-2 font-condensed text-[13px] tracking-[0.12em] uppercase whitespace-nowrap ${
              active ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"
            }`}
            aria-current={active ? "page" : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
