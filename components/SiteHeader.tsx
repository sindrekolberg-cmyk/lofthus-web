"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { nav } from "@/lib/types";
import { api } from "@/lib/api";
import { useLofthus } from "@/lib/useLofthus";
import { HeaderPulse } from "@/components/HeaderPulse";
import { EventBanner } from "@/components/EventBanner";
import { ManagerSearch } from "@/components/ManagerSearch";
import { InstallHint } from "@/components/InstallHint";

export function SiteHeader() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const status = useLofthus("status", () => api.status(), { live: true });
  const kicker = status.data?.round_kicker;
  const live = Boolean(status.data?.is_live);

  return (
    <header>
      <div
        className="sticky top-0 z-50 border-b border-ink/10 bg-paper/95 text-ink backdrop-blur"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto flex h-11 max-w-[1400px] items-center justify-between gap-3 px-4 md:h-[72px] sm:px-6">
          <Link href="/" className="shrink-0" aria-label="Lofthus Road Open">
            <span className="inline-flex h-8 items-center bg-live px-2 font-condensed text-[13px] font-semibold tracking-[0.18em] text-paper md:hidden">
              LOFTHUS
            </span>
            <span className="hidden md:flex flex-col justify-center leading-none">
              <span className="font-condensed text-[22px] font-semibold tracking-[0.18em]">LOFTHUS</span>
              <span className="mt-1 font-condensed text-[11px] tracking-[0.28em] text-muted">ROAD OPEN</span>
            </span>
          </Link>

          <p className="min-w-0 flex-1 truncate font-condensed text-[11px] tracking-[0.12em] text-muted uppercase md:hidden">
            {live ? (
              <span className="inline-flex items-center gap-1.5 text-live">
                <span className="live-dot h-1.5 w-1.5 rounded-full bg-live" aria-hidden />
                {kicker || "Live"}
              </span>
            ) : (
              kicker || ""
            )}
          </p>

          <nav className="hidden items-center gap-5 lg:gap-10 md:flex" aria-label="Hovedmeny">
            {nav.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative font-condensed text-[15px] tracking-[0.16em] uppercase transition-colors ${
                    active ? "text-ink" : "text-ink/40 hover:text-ink"
                  }`}
                >
                  {item.label}
                  {active ? (
                    <span className="absolute inset-x-0 -bottom-2 h-px bg-live" aria-hidden />
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/varsler"
              className="flex h-11 w-11 items-center justify-center text-ink"
              aria-label="Varsler"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M6 9a6 6 0 1 1 12 0c0 4 2 5.5 2 5.5H4S6 13 6 9Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
                <path d="M10 18.5a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </Link>
            <div className="w-[12rem] lg:w-[16rem]">
              <ManagerSearch compact />
            </div>
          </div>

          <div className="flex items-center md:hidden">
            <Link
              href="/varsler"
              className="flex h-11 w-11 items-center justify-center"
              aria-label="Varsler"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M6 9a6 6 0 1 1 12 0c0 4 2 5.5 2 5.5H4S6 13 6 9Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
                <path d="M10 18.5a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </Link>
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center"
              aria-expanded={searchOpen}
              aria-label={searchOpen ? "Lukk søk" : "Finn meg"}
              onClick={() => setSearchOpen((v) => !v)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.7" />
                <path d="M16 16.5 20 20.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {searchOpen ? (
          <div className="border-t border-rule px-4 py-3 md:hidden">
            <ManagerSearch onPick={() => setSearchOpen(false)} />
            <InstallHint compact />
          </div>
        ) : null}
      </div>

      <div className="relative hidden h-[64px] overflow-hidden bg-[#2c4aa0] md:block lg:h-[72px]">
        <Image
          src="/header-premier-league.jpg"
          alt="Premier League"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_32%]"
        />
      </div>

      {pathname === "/" ? null : (
        <EventBanner
          gw={status.data?.event_id}
          footballLive={live}
          finished={Boolean(status.data?.is_finished)}
        />
      )}
      {pathname === "/" || pathname.startsWith("/liga") ? null : <HeaderPulse />}
    </header>
  );
}
