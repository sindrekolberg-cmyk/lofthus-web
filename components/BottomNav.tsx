"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { bottomNav } from "@/lib/types";

function Icon({ id, active }: { id: string; active: boolean }) {
  const stroke = active ? "#121212" : "#6d665a";
  const common = {
    fill: "none",
    stroke,
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (id === "/") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden {...common}>
        <path d="M4 11.5 12 4l8 7.5V20H4z" />
        <path d="M10 20v-6h4v6" />
      </svg>
    );
  }
  if (id === "/liga") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden {...common}>
        <path d="M5 6h14M5 12h14M5 18h9" />
      </svg>
    );
  }
  if (id === "/analyse") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden {...common}>
        <path d="M5 19V9M12 19V5M19 19v-7" />
      </svg>
    );
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden {...common}>
      <path d="M7 20v-3l5-11 5 11v3H7z" />
      <path d="M9 14h6" />
    </svg>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="App-meny"
      className="fixed right-0 bottom-0 left-0 z-50 border-t border-ink/10 bg-paper/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-[1400px] grid-cols-4">
        {bottomNav.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 px-1 ${
                  active ? "text-ink" : "text-muted"
                }`}
              >
                <Icon id={item.href} active={active} />
                <span className="font-condensed text-[10px] tracking-[0.08em] uppercase">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
