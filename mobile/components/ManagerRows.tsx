import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import type { ManagerRow } from "@/lib/types";
import { colors } from "@/lib/theme";

export function ManagerRows({ rows, limit }: { rows: ManagerRow[]; limit?: number }) {
  const router = useRouter();
  const shown = typeof limit === "number" ? rows.slice(0, limit) : rows;
  return (
    <View style={styles.wrap}>
      {shown.map((row) => (
        <Pressable key={row.entry} onPress={() => router.push(`/manager/${row.entry}`)} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
          <Text style={styles.rank}>{row.rank}</Text>
          <View style={styles.nameWrap}>
            <Text style={styles.name} numberOfLines={1}>{row.manager}</Text>
            <Text style={styles.team} numberOfLines={1}>{row.team}</Text>
          </View>
          <View style={styles.scoreWrap}>
            <Text style={styles.total}>{row.total}</Text>
            <Text style={[styles.move, row.rank_change > 0 ? styles.up : row.rank_change < 0 ? styles.down : null]}>
              {row.rank_change > 0 ? `+${row.rank_change}` : row.rank_change}
            </Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  row: { minHeight: 60, flexDirection: "row", alignItems: "center", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line, gap: 12 },
  pressed: { opacity: 0.55 },
  rank: { width: 28, color: colors.ink, fontSize: 18, fontWeight: "800", fontVariant: ["tabular-nums"] },
  nameWrap: { flex: 1 },
  name: { color: colors.ink, fontSize: 16, fontWeight: "700" },
  team: { color: colors.muted, fontSize: 12, marginTop: 2 },
  scoreWrap: { alignItems: "flex-end" },
  total: { color: colors.ink, fontSize: 18, fontWeight: "800", fontVariant: ["tabular-nums"] },
  move: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  up: { color: colors.green },
  down: { color: colors.live },
});
