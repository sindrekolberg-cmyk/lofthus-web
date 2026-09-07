import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/lib/api";
import { colors } from "@/lib/theme";
import { useRemote } from "@/lib/useRemote";
import type { ManagerRow } from "@/lib/types";
import { randomPrizeFor } from "@/lib/randomPrize";
import { Screen } from "@/components/Screen";
import { ErrorState, Loading } from "@/components/State";
import { LeagueHeader, type LeagueSortKey } from "@/components/league/LeagueHeader";
import { LeagueRow } from "@/components/league/LeagueRow";

const defaultDir: Record<LeagueSortKey, "asc" | "desc"> = {
  rank: "asc",
  gw: "desc",
  total: "desc",
  move: "desc",
};

export default function LeagueScreen() {
  const loader = useCallback(() => api.league(), []);
  const remote = useRemote(loader);
  const [mode, setMode] = useState<"total" | "month">("total");
  const [sortKey, setSortKey] = useState<LeagueSortKey>("rank");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  function chooseMode(next: "total" | "month") {
    setMode(next);
    setSortKey("rank");
    setSortDir("asc");
  }

  function toggleSort(key: LeagueSortKey) {
    if (key === sortKey) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir(defaultDir[key]);
  }

  const rows = useMemo(() => {
    const all = [...(remote.data?.table || [])];
    const dir = sortDir === "asc" ? 1 : -1;
    const value = (row: ManagerRow) => (mode === "month" ? row.month_points : row.total);
    const place = (row: ManagerRow) => (mode === "month" ? row.month_rank || row.rank : row.rank);
    return all.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "rank") cmp = place(a) - place(b);
      if (sortKey === "gw") cmp = a.gw - b.gw;
      if (sortKey === "total") cmp = value(a) - value(b);
      if (sortKey === "move") cmp = a.rank_change - b.rank_change;
      if (cmp === 0) cmp = place(a) - place(b) || a.rank - b.rank;
      return cmp * dir;
    });
  }, [remote.data, mode, sortKey, sortDir]);

  const kicker = remote.data?.status.round_kicker || (remote.data?.status.event_id ? `Runde ${remote.data.status.event_id}` : "Liga");
  // Randompremien gjelder sluttplasseringen i totaltabellen, ikke månedstabellen.
  const prize = mode === "total" ? randomPrizeFor(remote.data?.status.season) : null;

  return (
    <Screen kicker={kicker} title="Liga" compactHeader refreshing={remote.refreshing} onRefresh={remote.refresh}>
      <View style={styles.switcher}>
        {(["total", "month"] as const).map((value) => (
          <Pressable key={value} onPress={() => chooseMode(value)} style={({ pressed }) => [styles.button, mode === value && styles.buttonActive, pressed && styles.pressed]}>
            <Text style={[styles.buttonText, mode === value && styles.buttonTextActive]}>
              {value === "total" ? "Totalpoeng" : "Måned"}
            </Text>
          </Pressable>
        ))}
      </View>
      {remote.data?.status.provisional ? <Text style={styles.provisional}>FORELØPIG TABELL · RUNDEN PÅGÅR</Text> : null}
      {prize ? (
        <View style={styles.prizeNote}>
          <Ionicons name="dice-outline" size={12} color={colors.bronze} />
          <Text style={styles.prizeNoteText}>
            Årets randompremie: {prize.rank}. plass gir {prize.amount} kr
          </Text>
        </View>
      ) : null}

      <LeagueHeader
        totalLabel={mode === "total" ? "Total" : "Måned"}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={toggleSort}
      />

      {remote.loading && !remote.data ? <Loading /> : null}
      {remote.error && !remote.data ? <ErrorState message={remote.error} /> : null}
      {remote.data ? (
        <View>
          {rows.map((row) => (
            <LeagueRow
              key={row.entry}
              row={row}
              displayRank={mode === "month" ? row.month_rank || row.rank : row.rank}
              score={mode === "month" ? row.month_points : row.total}
              prize={prize && row.rank === prize.rank ? prize : null}
            />
          ))}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  switcher: { flexDirection: "row", gap: 8, marginBottom: 10 },
  button: { minHeight: 38, justifyContent: "center", borderWidth: 1, borderColor: colors.line, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.panel, borderRadius: 8 },
  buttonActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  buttonText: { color: colors.muted, fontSize: 11, fontWeight: "900", letterSpacing: 1.05, textTransform: "uppercase" },
  buttonTextActive: { color: colors.white },
  pressed: { opacity: 0.58 },
  provisional: { color: colors.live, fontSize: 10, fontWeight: "800", letterSpacing: 0.8, marginBottom: 10 },
  prizeNote: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 10 },
  prizeNoteText: { color: colors.muted, fontSize: 11, fontWeight: "700" },
});
