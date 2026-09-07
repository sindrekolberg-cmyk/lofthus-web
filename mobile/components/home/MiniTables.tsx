import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import type { ManagerRow } from "@/lib/types";
import { formatMovement } from "@/lib/format";
import { colors, radius } from "@/lib/theme";

export function MiniTables({
  top5,
  monthName,
  monthRows,
}: {
  top5: ManagerRow[];
  monthName: string;
  monthRows: ManagerRow[];
}) {
  const router = useRouter();
  return (
    <View style={styles.section}>
      <View style={styles.grid}>
        <TableCard
          icon="♛"
          title="Topp 5"
          action="SE LIGAEN →"
          rows={top5.slice(0, 5)}
          value={(row) => row.total}
          rank={(row) => row.rank}
          move
          onHeader={() => router.push("/liga")}
          onRow={(row) => router.push(`/manager/${row.entry}`)}
        />
        <TableCard
          icon="▦"
          title={monthName || "Måned"}
          action="SE MÅNEDEN →"
          rows={monthRows.slice(0, 5)}
          value={(row) => row.month_points}
          rank={(row) => row.month_rank || row.rank}
          onHeader={() => router.push("/liga")}
          onRow={(row) => router.push(`/manager/${row.entry}`)}
        />
      </View>
    </View>
  );
}

function TableCard({
  icon,
  title,
  action,
  rows,
  value,
  rank,
  move = false,
  onHeader,
  onRow,
}: {
  icon: string;
  title: string;
  action: string;
  rows: ManagerRow[];
  value: (row: ManagerRow) => number;
  rank: (row: ManagerRow) => number;
  move?: boolean;
  onHeader: () => void;
  onRow: (row: ManagerRow) => void;
}) {
  return (
    <View style={styles.card}>
      <Pressable onPress={onHeader} style={({ pressed }) => [styles.header, pressed && styles.pressed]}>
        <View style={styles.titleWrap}>
          <Text style={styles.icon}>{icon}</Text>
          <Text style={styles.title} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.7}>{title}</Text>
        </View>
        <Text style={styles.action}>{action}</Text>
      </Pressable>
      <View style={styles.cols}>
        <Text style={styles.colRank}>#</Text>
        <Text style={styles.colName}>MANAGER</Text>
        <Text style={styles.colVal}>POENG</Text>
        {move ? <Text style={styles.colMove}>+/-</Text> : null}
      </View>
      {rows.map((row) => {
        const movement = formatMovement(row.rank_change);
        return (
          <Pressable key={row.entry} onPress={() => onRow(row)} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
            <Text style={styles.rank}>{rank(row)}</Text>
            <Text style={styles.name} numberOfLines={2}>{row.manager}</Text>
            <Text style={styles.value}>{value(row)}</Text>
            {move ? <Text style={[styles.move, { color: movement.color }]}>{movement.text.replace(" ▲", "").replace(" ▼", "")}</Text> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { backgroundColor: colors.peach, paddingHorizontal: 8, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  grid: { flexDirection: "row", gap: 6 },
  card: { flex: 1, minWidth: 0, backgroundColor: colors.panel, paddingHorizontal: 7, paddingTop: 7, paddingBottom: 4, borderRadius: radius.sm, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line },
  header: { minHeight: 28, gap: 2 },
  titleWrap: { minWidth: 0, flexDirection: "row", alignItems: "flex-start", gap: 4 },
  icon: { color: colors.live, fontSize: 12, fontWeight: "900", marginTop: 2 },
  title: { color: colors.ink, fontFamily: "Georgia", fontSize: 16, lineHeight: 18, fontWeight: "700", flex: 1 },
  action: { color: colors.live, fontSize: 6.2, fontWeight: "900", letterSpacing: 0.5 },
  cols: { minHeight: 16, flexDirection: "row", alignItems: "center", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  colRank: { width: 14, color: colors.muted, fontSize: 6.5, fontWeight: "900" },
  colName: { flex: 1, color: colors.muted, fontSize: 6.5, fontWeight: "900", letterSpacing: 0.5 },
  colVal: { width: 32, textAlign: "right", color: colors.muted, fontSize: 6.5, fontWeight: "900" },
  colMove: { width: 24, textAlign: "right", color: colors.muted, fontSize: 6.5, fontWeight: "900" },
  row: { minHeight: 28, flexDirection: "row", alignItems: "center", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  rank: { width: 14, color: colors.ink, fontSize: 10, fontVariant: ["tabular-nums"] },
  name: { flex: 1, minWidth: 0, color: colors.ink, fontSize: 10, lineHeight: 12, fontWeight: "600", paddingRight: 2 },
  value: { width: 32, textAlign: "right", color: colors.ink, fontSize: 10, fontWeight: "800", fontVariant: ["tabular-nums"] },
  move: { width: 24, textAlign: "right", fontSize: 9, fontWeight: "800", fontVariant: ["tabular-nums"] },
  pressed: { opacity: 0.58 },
});
