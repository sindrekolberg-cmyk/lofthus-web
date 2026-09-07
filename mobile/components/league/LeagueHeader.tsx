import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/lib/theme";

export type LeagueSortKey = "rank" | "gw" | "total" | "move";

export function LeagueHeader({
  totalLabel,
  sortKey,
  sortDir,
  onSort,
}: {
  totalLabel: string;
  sortKey: LeagueSortKey;
  sortDir: "asc" | "desc";
  onSort: (key: LeagueSortKey) => void;
}) {
  return (
    <View style={styles.row}>
      <HeaderCell label="Plass" width={42} active={sortKey === "rank"} dir={sortDir} onPress={() => onSort("rank")} />
      <Text style={[styles.label, styles.manager]}>MANAGER</Text>
      <HeaderCell label="GW" width={40} align="right" active={sortKey === "gw"} dir={sortDir} onPress={() => onSort("gw")} />
      <HeaderCell label={totalLabel} width={52} align="right" active={sortKey === "total"} dir={sortDir} onPress={() => onSort("total")} />
      <HeaderCell label="+/-" width={44} align="right" active={sortKey === "move"} dir={sortDir} onPress={() => onSort("move")} />
    </View>
  );
}

function HeaderCell({
  label,
  width,
  align = "left",
  active,
  dir,
  onPress,
}: {
  label: string;
  width: number;
  align?: "left" | "right";
  active: boolean;
  dir: "asc" | "desc";
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ width }, pressed && styles.pressed]}>
      <Text style={[styles.label, align === "right" && styles.right, active && styles.active]}>
        {label.toUpperCase()}
        {active ? (dir === "asc" ? " ↑" : " ↓") : ""}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 28, flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: colors.ink },
  label: { color: colors.muted, fontSize: 9, fontWeight: "900", letterSpacing: 1.05 },
  manager: { flex: 1 },
  right: { textAlign: "right" },
  active: { color: colors.ink },
  pressed: { opacity: 0.55 },
});
