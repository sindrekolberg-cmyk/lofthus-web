import { Pressable, StyleSheet, Text, View } from "react-native";
import type { HallRow } from "@/lib/types";
import { legendRanking, meritSummary } from "@/lib/hall";
import { colors, radius } from "@/lib/theme";
import { hallStyles } from "./hallStyles";

export function HallLegends({
  rows,
  onSelect,
}: {
  rows: HallRow[];
  onSelect?: (row: HallRow) => void;
}) {
  const legends = legendRanking(rows, 5);

  return (
    <View>
      <Text style={styles.title}>Topp 5 Lofthus-legender gjennom tidene</Text>
      <Text style={hallStyles.muted}>Rangert etter samlet meritt-poengsum i Hall of Fame.</Text>
      {legends.length ? (
        <View style={styles.list}>
          {legends.map((legend, index) => (
            <Pressable
              key={legend.row.manager}
              disabled={!onSelect}
              onPress={() => onSelect?.(legend.row)}
              style={({ pressed }) => [styles.card, index === 0 && styles.first, pressed && hallStyles.pressed]}
            >
              <Text style={[styles.place, index === 0 && styles.placeFirst]}>{index + 1}</Text>
              <View style={styles.copy}>
                <Text style={styles.name} numberOfLines={2}>{legend.row.manager}</Text>
                <Text style={styles.merits}>{meritSummary(legend.row)}</Text>
              </View>
              <View style={styles.pointsWrap}>
                <Text style={styles.points}>{legend.points}</Text>
                <Text style={hallStyles.label}>poeng</Text>
              </View>
            </Pressable>
          ))}
        </View>
      ) : (
        <Text style={hallStyles.empty}>Ingen meritter er registrert ennå.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.ink, fontFamily: "Georgia", fontSize: 26, lineHeight: 30, fontWeight: "700", marginBottom: 4 },
  list: { marginTop: 10, gap: 6 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 72,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.panel,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    borderRadius: radius.sm,
  },
  first: { backgroundColor: colors.goldSoft, borderColor: colors.gold },
  place: { width: 26, color: colors.muted, fontFamily: "Georgia", fontSize: 24, fontWeight: "700", textAlign: "center" },
  placeFirst: { color: colors.ink },
  copy: { flex: 1, minWidth: 0 },
  name: { color: colors.ink, fontSize: 16, lineHeight: 20, fontWeight: "800" },
  merits: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 3 },
  pointsWrap: { alignItems: "flex-end" },
  points: { color: colors.ink, fontSize: 22, fontWeight: "900", fontVariant: ["tabular-nums"] },
});
