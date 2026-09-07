import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import type { ManagerRow } from "@/lib/types";
import { colors } from "@/lib/theme";

export function ManagerRows({ rows, limit, compact = false }: { rows: ManagerRow[]; limit?: number; compact?: boolean }) {
  const router = useRouter();
  const shown = typeof limit === "number" ? rows.slice(0, limit) : rows;
  return (
    <View style={styles.wrap}>
      {shown.map((row) => (
        <Pressable
          key={row.entry}
          onPress={() => router.push(`/manager/${row.entry}`)}
          style={({ pressed }) => [styles.row, compact && styles.rowCompact, pressed && styles.pressed]}
        >
          <Text style={[styles.rank, compact && styles.rankCompact]}>{row.rank}</Text>
          <View style={styles.nameWrap}>
            <Text style={[styles.name, compact && styles.nameCompact]} numberOfLines={1}>{row.manager}</Text>
            {!compact ? <Text style={styles.team} numberOfLines={1}>{row.team}</Text> : null}
          </View>
          {!compact ? (
            <View style={styles.gwWrap}>
              <Text style={styles.gw}>{row.gw}</Text>
              <Text style={styles.gwLabel}>GW</Text>
            </View>
          ) : null}
          <View style={styles.scoreWrap}>
            <Text style={[styles.total, compact && styles.totalCompact]}>{row.total}</Text>
            {!compact ? (
              <Text style={[styles.move, row.rank_change > 0 ? styles.up : row.rank_change < 0 ? styles.down : null]}>
                {row.rank_change > 0 ? `+${row.rank_change}` : row.rank_change}
              </Text>
            ) : null}
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 5, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "rgba(23,23,21,0.16)" },
  row: { minHeight: 58, flexDirection: "row", alignItems: "center", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line, gap: 10 },
  rowCompact: { minHeight: 42, borderBottomColor: "rgba(23,23,21,0.16)" },
  pressed: { opacity: 0.52 },
  rank: { width: 28, color: colors.ink, fontSize: 17, fontWeight: "800", fontVariant: ["tabular-nums"] },
  rankCompact: { width: 24, fontSize: 14 },
  nameWrap: { flex: 1 },
  name: { color: colors.ink, fontSize: 15, fontWeight: "700" },
  nameCompact: { fontSize: 14, fontWeight: "500" },
  team: { color: colors.muted, fontSize: 11, marginTop: 2 },
  gwWrap: { alignItems: "flex-end", minWidth: 34 },
  gw: { color: colors.ink, fontSize: 14, fontWeight: "800", fontVariant: ["tabular-nums"] },
  gwLabel: { color: colors.muted, fontSize: 8, fontWeight: "800", letterSpacing: 0.7, marginTop: 1 },
  scoreWrap: { alignItems: "flex-end", minWidth: 40 },
  total: { color: colors.ink, fontSize: 17, fontWeight: "900", fontVariant: ["tabular-nums"] },
  totalCompact: { fontSize: 15 },
  move: { color: colors.muted, fontSize: 11, fontWeight: "800", marginTop: 1 },
  up: { color: colors.green },
  down: { color: colors.live },
});
