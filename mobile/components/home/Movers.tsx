import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import type { ManagerRow } from "@/lib/types";
import { colors, radius } from "@/lib/theme";

export function Movers({ climbers, fallers }: { climbers: ManagerRow[]; fallers: ManagerRow[] }) {
  const router = useRouter();
  return (
    <View style={styles.section}>
      <Text style={styles.title}>Største utslag</Text>
      <View style={styles.grid}>
        <View style={[styles.panel, styles.upPanel]}>
          <Text style={[styles.label, styles.up]}>↗ STØRSTE KLATRERE</Text>
          {(climbers || []).slice(0, 3).map((row, index) => (
            <Pressable key={row.entry} onPress={() => router.push(`/manager/${row.entry}`)} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
              <Text style={styles.rank}>{index + 1}</Text>
              <Text style={styles.name} numberOfLines={1}>{row.manager}</Text>
              <Text style={[styles.value, styles.up]}>+{Math.abs(row.rank_change)}</Text>
            </Pressable>
          ))}
        </View>
        <View style={[styles.panel, styles.downPanel]}>
          <Text style={[styles.label, styles.down]}>↓ STØRSTE FALL</Text>
          {(fallers || []).slice(0, 3).map((row, index) => (
            <Pressable key={row.entry} onPress={() => router.push(`/manager/${row.entry}`)} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
              <Text style={styles.rank}>{index + 1}</Text>
              <Text style={styles.name} numberOfLines={1}>{row.manager}</Text>
              <Text style={[styles.value, styles.down]}>-{Math.abs(row.rank_change)}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { backgroundColor: colors.panel, paddingTop: 8, paddingBottom: 10 },
  title: { paddingHorizontal: 16, color: colors.ink, fontFamily: "Georgia", fontSize: 20, lineHeight: 24, fontWeight: "700" },
  grid: { flexDirection: "row", gap: 6, paddingHorizontal: 16, paddingTop: 7 },
  panel: { flex: 1, minWidth: 0, borderRadius: radius.sm, paddingHorizontal: 8, paddingTop: 7, paddingBottom: 5 },
  upPanel: { backgroundColor: colors.upSoft },
  downPanel: { backgroundColor: colors.downSoft },
  label: { fontSize: 7.5, fontWeight: "900", letterSpacing: 0.7, marginBottom: 3 },
  row: { minHeight: 26, flexDirection: "row", alignItems: "center", borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "rgba(23,23,21,0.11)" },
  rank: { width: 12, color: colors.muted, fontSize: 9 },
  name: { flex: 1, minWidth: 0, color: colors.ink, fontSize: 10 },
  value: { fontSize: 10, fontWeight: "900", fontVariant: ["tabular-nums"] },
  up: { color: colors.green },
  down: { color: colors.live },
  pressed: { opacity: 0.58 },
});
