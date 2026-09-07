import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import type { ManagerRow } from "@/lib/types";
import { formatMovement } from "@/lib/format";
import { colors } from "@/lib/theme";

export function LeagueRow({ row, displayRank, score }: { row: ManagerRow; displayRank: number; score: number }) {
  const router = useRouter();
  const move = formatMovement(row.rank_change);
  const medal = displayRank === 1 ? colors.goldSoft : displayRank === 2 ? colors.silverSoft : displayRank === 3 ? colors.bronzeSoft : undefined;
  const medalInk = displayRank === 1 ? colors.gold : displayRank === 2 ? colors.silver : displayRank === 3 ? colors.bronze : colors.ink;
  const teamLine = row.captain ? `${row.team} · C: ${row.captain}` : row.team;

  return (
    <Pressable onPress={() => router.push(`/manager/${row.entry}`)} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={[styles.rankWrap, medal ? { backgroundColor: medal } : null]}>
        <Text style={[styles.rank, { color: medalInk }]}>{displayRank}</Text>
      </View>
      <View style={styles.nameWrap}>
        <Text style={styles.name} numberOfLines={1}>{row.manager}</Text>
        <Text style={styles.team} numberOfLines={1}>{teamLine}</Text>
      </View>
      <View style={styles.gwWrap}>
        <Text style={styles.gw}>{row.gw}</Text>
        <Text style={styles.gwLabel}>GW</Text>
      </View>
      <Text style={styles.total}>{score}</Text>
      <Text style={[styles.move, { color: move.color }]}>{move.text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 58, flexDirection: "row", alignItems: "center", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line, gap: 8 },
  pressed: { opacity: 0.55, backgroundColor: colors.peach },
  rankWrap: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  rank: { fontSize: 15, fontWeight: "800", fontVariant: ["tabular-nums"] },
  nameWrap: { flex: 1, minWidth: 0 },
  name: { color: colors.ink, fontSize: 14, fontWeight: "700" },
  team: { color: colors.muted, fontSize: 11, marginTop: 2 },
  gwWrap: { width: 40, alignItems: "flex-end" },
  gw: { color: colors.ink, fontSize: 15, fontWeight: "800", fontVariant: ["tabular-nums"] },
  gwLabel: { color: colors.muted, fontSize: 8, fontWeight: "800", letterSpacing: 0.7, marginTop: 1 },
  total: { width: 52, textAlign: "right", color: colors.ink, fontSize: 17, fontWeight: "900", fontVariant: ["tabular-nums"] },
  move: { width: 44, textAlign: "right", fontSize: 11, fontWeight: "800", fontVariant: ["tabular-nums"] },
});
