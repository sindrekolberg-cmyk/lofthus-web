import Link from "next/link";
import { InstallHint } from "@/components/InstallHint";

export function SiteFooter() {
  return (
    <footer className="mt-auto hidden border-t border-rule bg-ink text-paper/70 md:block">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-4 py-8 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <p className="font-condensed text-sm tracking-[0.18em] text-paper">
            LOFTHUS ROAD OPEN
          </p>
          <p className="mt-1 max-w-md text-sm leading-relaxed">
            Miniligaen som skal føles som et mesterskap.
          </p>
          <div className="text-paper/80">
            <InstallHint />
          </div>
        </div>
        <p className="text-xs tracking-wide">
          <Link href="/" className="text-paper/90 hover:text-paper">
            Forside
          </Link>
          {" · "}
          <Link href="/liga" className="text-paper/90 hover:text-paper">
            Liga
          </Link>
          {" · "}
          <Link href="/hall-of-fame" className="text-paper/90 hover:text-paper">
            Hall of Fame
          </Link>
          {" · "}
          <Link href="/analyse" className="text-paper/90 hover:text-paper">
            Analyseverktøy
          </Link>
        </p>
      </div>
    </footer>
  );
}
