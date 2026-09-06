"use client";

import type { Squad, SquadPlayer } from "@/lib/types";
import { PlayerImage } from "@/components/PlayerImage";
import { fixtureStatusLabel, isPlayerUpcoming } from "@/lib/status";

function Badge({ player, onPitch }: { player: SquadPlayer; onPitch?: boolean }) {
  if (player.is_triple_captain) return <span className="text-live">TC</span>;
  if (player.is_captain) return <span className="text-live">C</span>;
  if (player.is_vice_captain) return <span className={onPitch ? "text-paper/70" : "text-muted"}>VC</span>;
  return null;
}

function Slot({ player, onPitch }: { player: SquadPlayer; onPitch?: boolean }) {
  const unplayed = isPlayerUpcoming(player.fixture_status);
  const nameColor = onPitch ? "text-paper" : "text-ink";
  const metaColor = onPitch ? "text-paper/70" : "text-muted";
  const points = onPitch ? player.gw_contribution : player.event_points;
  return (
    <div className="flex w-[4.35rem] flex-col items-center sm:w-20">
      <div className={`relative h-11 w-11 overflow-hidden rounded-full sm:h-16 sm:w-16 ${onPitch ? "bg-[#1a1a1a]" : "bg-[#d8d1c4]"}`}>
        <PlayerImage src={player.image_url} alt={player.player} variant="squad" objectPosition="center 10%" />
      </div>
      <p className={`mt-1 max-w-full truncate text-center text-[11px] leading-tight ${nameColor}`}>
        {player.player}
      </p>
      <p className={`font-condensed text-[11px] tabular-nums ${metaColor}`}>
        {unplayed ? "–" : points}
        {onPitch && player.multiplier > 1 ? ` ×${player.multiplier}` : ""}
      </p>
      <p className={`font-condensed text-[9px] tracking-wide uppercase ${onPitch ? "text-paper/45" : "text-muted"}`}>
        <Badge player={player} onPitch={onPitch} /> {player.club} · {fixtureStatusLabel(player.fixture_status, player.fixture_status_label)}
      </p>
      {player.autosub_status === "confirmed" ? (
        <p className="mt-0.5 text-center font-condensed text-[9px] leading-tight tracking-wide text-live uppercase">
          AUTO IN
          {player.replaced_player ? ` · inn for ${player.replaced_player}` : ""}
        </p>
      ) : null}
      {player.autosub_status === "pending" ? (
        <p className="mt-0.5 text-center font-condensed text-[9px] tracking-wide text-muted uppercase">
          Kan komme inn
        </p>
      ) : null}
    </div>
  );
}

function Line({ players, onPitch }: { players: SquadPlayer[]; onPitch?: boolean }) {
  if (!players.length) return null;
  return (
    <div className="flex justify-center gap-2 sm:gap-4">
      {players.map((p) => (
        <Slot key={p.element} player={p} onPitch={onPitch} />
      ))}
    </div>
  );
}

export function SquadPitch({ squad }: { squad: Squad }) {
  return (
    <div>
      <div className="relative overflow-hidden bg-[#17331d] px-2 py-5 sm:px-6 sm:py-8">
        <div className="pointer-events-none absolute inset-y-8 left-1/2 w-px bg-white/15" />
        <div className="pointer-events-none absolute left-4 right-4 top-1/2 h-px bg-white/15" />
        <div className="relative flex flex-col gap-4 sm:gap-6">
          <Line players={squad.lines.fwd} onPitch />
          <Line players={squad.lines.mid} onPitch />
          <Line players={squad.lines.def} onPitch />
          <Line players={squad.lines.gk} onPitch />
        </div>
      </div>
      <div className="border border-t-0 border-rule bg-white/50 px-3 py-4 sm:px-6">
        <p className="font-condensed text-[11px] tracking-[0.18em] text-muted uppercase">Benk</p>
        <div className="mt-3 flex justify-center gap-2 overflow-x-auto sm:gap-4">
          {squad.bench.map((p) => (
            <Slot key={p.element} player={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
