import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { HallPayload, HallRow } from "@/lib/types";
import { newestSeasonFirst } from "@/lib/format";
import { colors, radius } from "@/lib/theme";
import { hallStyles } from "./hallStyles";
import { HallLegends } from "./HallLegends";

export function HallOverview({
  data,
  onSelectManager,
}: {
  data: HallPayload;
  onSelectManager?: (row: HallRow) => void;
}) {
  const winners = [...(data.overall || [])].sort((a, b) => newestSeasonFirst(a.season, b.season));
  const cups = [...(data.cup || [])].sort((a, b) => newestSeasonFirst(a.season, b.season)).slice(0, 5);
  const randomWinners = [...(data.random || [])]
    .filter((row) => row.winner)
    .sort((a, b) => newestSeasonFirst(a.season, b.season));

  return (
    <View>
      <HallLegends rows={data.rows} onSelect={onSelectManager} />

      <Text style={hallStyles.sectionTitle}>Sammenlagtvinnere</Text>
      <View style={styles.list}>
        {winners.map((row) => (
          <View key={row.season} style={hallStyles.row}>
            <Text style={styles.season}>{row.season}</Text>
            <Text style={[hallStyles.ink, styles.winner]} numberOfLines={2}>{row.winner || "Ikke registrert"}</Text>
            <Ionicons name="trophy-outline" size={16} color={colors.gold} />
          </View>
        ))}
      </View>

      <Text style={hallStyles.sectionTitle}>Cupvinnere</Text>
      <View style={styles.list}>
        {cups.length ? cups.map((row) => (
          <View key={row.season} style={hallStyles.row}>
            <Text style={styles.season}>{row.season}</Text>
            <Text style={[hallStyles.ink, styles.winner]} numberOfLines={2}>{row.winner || "Ikke registrert"}</Text>
            <Ionicons name="trophy" size={16} color={colors.bronze} />
          </View>
        )) : <Text style={hallStyles.empty}>Ingen cupfinaler er registrert.</Text>}
      </View>

      {randomWinners.length ? (
        <>
          <Text style={hallStyles.sectionTitle}>Random plassering</Text>
          <View style={styles.randomCard}>
            <View style={styles.randomIcon}>
              <Ionicons name="dice-outline" size={24} color={colors.live} />
            </View>
            <View style={styles.randomCopy}>
              <Text style={styles.randomLabel}>Vinner {randomWinners[0].season}</Text>
              <Text style={styles.randomName}>{randomWinners[0].winner}</Text>
              <Text style={styles.randomMeta}>
                Trukket plassering: {randomWinners[0].placement || "ikke registrert"}
              </Text>
            </View>
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  season: { color: colors.muted, width: 72, fontSize: 12, fontWeight: "800" },
  winner: { flex: 1, paddingRight: 8 },
  randomCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    backgroundColor: colors.peach,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    borderRadius: radius.sm,
  },
  randomIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.panel,
  },
  randomCopy: { flex: 1, minWidth: 0 },
  randomLabel: {
    color: colors.live,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "900",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  randomName: {
    color: colors.ink,
    fontFamily: "Georgia",
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "700",
    marginTop: 2,
  },
  randomMeta: { color: colors.muted, fontSize: 11, lineHeight: 15, marginTop: 4 },
});
