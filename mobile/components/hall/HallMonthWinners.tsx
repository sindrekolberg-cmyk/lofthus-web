import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import type { HallMonthly } from "@/lib/types";
import { colors } from "@/lib/theme";
import { hallStyles } from "./hallStyles";

export function HallMonthWinners({ months }: { months: HallMonthly[] }) {
  const { width } = useWindowDimensions();
  const rows = months.filter((row) => (row.winner || "").trim());
  const twoColumns = width >= 380 && rows.length > 3;

  if (!rows.length) return null;

  return (
    <View style={styles.block}>
      <Text style={hallStyles.label}>Månedsvinnere</Text>
      <View style={styles.grid}>
        {rows.map((row) => (
          <View key={`${row.season}-${row.month}`} style={[styles.item, twoColumns && styles.itemHalf]}>
            <Text style={styles.month}>{row.month}</Text>
            <Text style={styles.winner} numberOfLines={2}>{row.winner}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { marginTop: 12, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  grid: { flexDirection: "row", flexWrap: "wrap", marginTop: 8, rowGap: 10, columnGap: 10 },
  item: { width: "100%" },
  itemHalf: { width: "47%" },
  month: { color: colors.muted, fontSize: 9, fontWeight: "900", letterSpacing: 1.1, textTransform: "uppercase" },
  winner: { color: colors.ink, fontSize: 13, lineHeight: 18, fontWeight: "700", marginTop: 2 },
});
