import { useCallback, useMemo, useState } from "react";
import { useRouter } from "expo-router";
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

type LeagueMode = "total" | "month" | "tip";

export default function LeagueScreen() {
  const router = useRouter();
  const loader = useCallback(() => api.league(), []);
  const oddsLoader = useCallback(() => api.odds(), []);
  const remote = useRemote(loader);
  const oddsRemote = useRemote(oddsLoader);
  const [mode, setMode] = useState<LeagueMode>("total");
  const [sortKey, setSortKey] = useState<LeagueSortKey>("rank");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  function chooseMode(next: LeagueMode) {
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

  const preseasonRows = useMemo(() => {
    const teams = new Map((remote.data?.table || []).map((row) => [row.entry, row.team]));
    return [...(oddsRemote.data?.rows || [])]
      .filter((row) => Number(row.preseason_odds) > 0)
      .sort((a, b) => Number(a.preseason_odds) - Number(b.preseason_odds) || a.manager.localeCompare(b.manager))
      .map((row, index) => ({
        ...row,
        tipRank: index + 1,
        team: teams.get(row.entry) || "",
      }));
  }, [oddsRemote.data, remote.data]);

  const roundKicker = remote.data?.status.round_kicker || (remote.data?.status.event_id ? `Runde ${remote.data.status.event_id}` : "Liga");
  const kicker = mode === "tip" ? "Før sesongstart" : roundKicker;
  // Randompremien gjelder sluttplasseringen i totaltabellen, ikke månedstabellen eller tabelltipset.
  const prize = mode === "total" ? randomPrizeFor(remote.data?.status.season) : null;

  async function refreshAll() {
    await Promise.all([remote.refresh(), oddsRemote.refresh()]);
  }

  return (
    <Screen kicker={kicker} title="Liga" compactHeader refreshing={remote.refreshing || oddsRemote.refreshing} onRefresh={refreshAll}>
      <View style={styles.switcher}>
        {(["total", "month", "tip"] as const).map((value) => (
          <Pressable key={value} onPress={() => chooseMode(value)} style={({ pressed }) => [styles.button, mode === value && styles.buttonActive, pressed && styles.pressed]}>
            <Text style={[styles.buttonText, mode === value && styles.buttonTextActive]}>
              {value === "total" ? "Totalpoeng" : value === "month" ? "Måned" : "Tabelltipset"}
            </Text>
          </Pressable>
        ))}
      </View>

      {mode !== "tip" && remote.data?.status.provisional ? <Text style={styles.provisional}>FORELØPIG TABELL · RUNDEN PÅGÅR</Text> : null}
      {prize ? (
        <View style={styles.prizeNote}>
          <Ionicons name="dice-outline" size={12} color={colors.bronze} />
          <Text style={styles.prizeNoteText}>
            Årets randompremie: {prize.rank}. plass gir {prize.amount} kr
          </Text>
        </View>
      ) : null}

      {mode === "tip" ? (
        <>
          <View style={styles.tipNote}>
            <Text style={styles.tipKicker}>HJERNENS TIPS FØR GW1</Text>
            <Text style={styles.tipCopy}>Fryst før sesongstart. Ingen september-fasitskriving her.</Text>
          </View>

          <View style={styles.tipHeader}>
            <Text style={styles.tipHeaderRank}>#</Text>
            <Text style={styles.tipHeaderManager}>Manager</Text>
            <Text style={styles.tipHeaderOdds}>Odds</Text>
          </View>

          {oddsRemote.loading && !oddsRemote.data ? <Loading label="Henter tabelltipset …" /> : null}
          {oddsRemote.error && !oddsRemote.data ? <ErrorState message={oddsRemote.error} /> : null}
          {oddsRemote.data && !oddsRemote.data.ready ? <ErrorState message={oddsRemote.data.note || "Tabelltipset er ikke klart."} /> : null}
          {oddsRemote.data?.ready ? (
            <View style={styles.tipTable}>
              {preseasonRows.map((row) => (
                <Pressable
                  key={row.entry}
                  onPress={() => router.push(`/manager/${row.entry}`)}
                  style={({ pressed }) => [styles.tipRow, pressed && styles.pressed]}
                >
                  <Text style={styles.tipRank}>{row.tipRank}</Text>
                  <View style={styles.tipManagerWrap}>
                    <Text style={styles.tipManager}>{row.manager}</Text>
                    {row.team ? <Text style={styles.tipTeam}>{row.team}</Text> : null}
                  </View>
                  <Text style={styles.tipOdds}>{Number(row.preseason_odds).toFixed(2)}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </>
      ) : (
        <>
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
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  switcher: { flexDirection: "row", gap: 6, marginBottom: 10 },
  button: { flex: 1, minHeight: 38, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: colors.line, paddingHorizontal: 7, paddingVertical: 8, backgroundColor: colors.panel, borderRadius: 8 },
  buttonActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  buttonText: { color: colors.muted, fontSize: 10, fontWeight: "900", letterSpacing: 0.7, textTransform: "uppercase", textAlign: "center" },
  buttonTextActive: { color: colors.white },
  pressed: { opacity: 0.58 },
  provisional: { color: colors.live, fontSize: 10, fontWeight: "800", letterSpacing: 0.8, marginBottom: 10 },
  prizeNote: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 10 },
  prizeNoteText: { color: colors.muted, fontSize: 11, fontWeight: "700" },
  tipNote: { borderTopWidth: 1, borderTopColor: colors.ink, paddingTop: 14, paddingBottom: 16 },
  tipKicker: { color: colors.live, fontSize: 10, fontWeight: "900", letterSpacing: 1.1 },
  tipCopy: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 4 },
  tipHeader: { minHeight: 34, flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: colors.ink },
  tipHeaderRank: { width: 34, color: colors.muted, fontSize: 10, fontWeight: "900", textTransform: "uppercase" },
  tipHeaderManager: { flex: 1, color: colors.muted, fontSize: 10, fontWeight: "900", textTransform: "uppercase", letterSpacing: 0.8 },
  tipHeaderOdds: { width: 58, color: colors.muted, fontSize: 10, fontWeight: "900", textTransform: "uppercase", textAlign: "right", letterSpacing: 0.8 },
  tipTable: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  tipRow: { minHeight: 62, flexDirection: "row", alignItems: "center", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  tipRank: { width: 34, color: colors.live, fontSize: 15, fontWeight: "900" },
  tipManagerWrap: { flex: 1, paddingRight: 8 },
  tipManager: { color: colors.ink, fontFamily: "Georgia", fontSize: 17, fontWeight: "700" },
  tipTeam: { color: colors.muted, fontSize: 10, marginTop: 2 },
  tipOdds: { width: 58, color: colors.ink, fontSize: 13, fontWeight: "800", textAlign: "right", fontVariant: ["tabular-nums"] },
});