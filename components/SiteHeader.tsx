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
        <div className="mx-auto flex h-11 max-w-[1400px] items-center justify-between gap-3 px-4 md:h-14 sm:px-6">
          <Link href="/" className="shrink-0" aria-label="Lofthus Road Open">
            <span className="inline-flex h-8 items-center bg-live px-2 font-condensed text-[13px] font-semibold tracking-[0.18em] text-paper md:h-9 md:px-2.5 md:text-[15px]">
              LOFTHUS
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

          <nav className="hidden items-center gap-7 md:flex" aria-label="Hovedmeny">
            {nav.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`font-condensed text-[13px] tracking-[0.14em] uppercase transition-colors ${
                    active ? "text-ink" : "text-ink/45 hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden min-w-[14rem] md:block">
            <ManagerSearch compact />
          </div>

          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center md:hidden"
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

        {searchOpen ? (
          <div className="border-t border-rule px-4 py-3 md:hidden">
            <ManagerSearch onPick={() => setSearchOpen(false)} />
            <InstallHint compact />
          </div>
        ) : null}
      </div>

      <div className="relative hidden h-[88px] overflow-hidden bg-[#2c4aa0] md:block sm:h-[112px] lg:h-[128px]">
        <Image
          src="/header-premier-league.jpg"
          alt="Premier League"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_18%]"
        />
      </div>

      <div className={pathname === "/" ? "hidden md:block" : undefined}>
        <EventBanner />
      </div>
      {pathname === "/" ? null : <HeaderPulse />}
    </header>
  );
}
