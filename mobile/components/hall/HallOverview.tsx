import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { HallPayload, HallRow } from "@/lib/types";
import { newestSeasonFirst } from "@/lib/format";
import { colors } from "@/lib/theme";
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
    </View>
  );
}

const styles = StyleSheet.create({
  list: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  season: { color: colors.muted, width: 72, fontSize: 12, fontWeight: "800" },
  winner: { flex: 1, paddingRight: 8 },
});
