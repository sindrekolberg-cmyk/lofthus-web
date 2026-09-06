"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { nav } from "@/lib/types";
import { HeaderPulse } from "@/components/HeaderPulse";
import { EventBanner } from "@/components/EventBanner";
import { ManagerSearch } from "@/components/ManagerSearch";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header>
      <div className="sticky top-0 z-50 border-b border-ink/10 bg-paper/95 text-ink backdrop-blur">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="shrink-0" aria-label="Lofthus Road Open">
            <span className="inline-flex h-9 items-center bg-live px-2.5 font-condensed text-[15px] font-semibold tracking-[0.18em] text-paper">
              LOFTHUS
            </span>
          </Link>

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
            aria-expanded={open}
            aria-label={open ? "Lukk meny" : "Åpne meny"}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Meny</span>
            <span className="flex flex-col gap-1.5">
              <span className="block h-px w-5 bg-ink" />
              <span className="block h-px w-5 bg-ink" />
            </span>
          </button>
        </div>

        {open ? (
          <div className="border-t border-rule px-4 py-4 md:hidden">
            <nav aria-label="Mobilmeny">
              <ul className="flex flex-col gap-3">
                {nav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="font-condensed text-sm tracking-[0.14em] uppercase"
                      onClick={() => setOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="mt-4">
              <ManagerSearch onPick={() => setOpen(false)} />
            </div>
          </div>
        ) : null}
      </div>

      <div className="relative h-[88px] overflow-hidden bg-[#2c4aa0] sm:h-[112px] lg:h-[128px]">
        <Image
          src="/header-premier-league.jpg"
          alt="Premier League"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_18%]"
        />
      </div>

      <EventBanner />
      {pathname === "/" ? null : <HeaderPulse />}
    </header>
  );
}
