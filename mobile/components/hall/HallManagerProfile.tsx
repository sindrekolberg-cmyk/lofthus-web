import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { HallPayload, HallRow } from "@/lib/types";
import { firstSeasonLine, managerCups, managerMonths, managerSeasons } from "@/lib/hall";
import { historicalPoints, monthPodiums } from "@/lib/hof-points";
import { formatPlace } from "@/lib/format";
import { colors, radius } from "@/lib/theme";
import { hallStyles } from "./hallStyles";

export function HallManagerProfile({ data, row }: { data: HallPayload; row: HallRow }) {
  const seasons = managerSeasons(data, row.manager);
  const months = managerMonths(data, row.manager);
  const cups = managerCups(data, row.manager);
  const podiums = monthPodiums(row);
  const summary = [
    row.league_gold ? `${row.league_gold} sammenlagtseier${row.league_gold === 1 ? "" : "e"}` : null,
    row.monthly_gold ? `${row.monthly_gold} månedsseier${row.monthly_gold === 1 ? "" : "e"}` : null,
    podiums ? `${podiums} månedspodier` : null,
  ].filter(Boolean).join(" · ");

  return (
    <View style={styles.profile}>
      <Text style={styles.name}>{row.manager}</Text>
      {summary ? <Text style={hallStyles.muted}>{summary}</Text> : null}
      <Text style={styles.first}>{firstSeasonLine(data, row.manager, row)}</Text>

      <View style={styles.stats}>
        <Stat icon="trophy" label="Sammenlagtseire" value={row.league_gold} />
        <Stat icon="trophy-outline" label="Cupgull" value={row.cup_gold} />
        <Stat icon="star" label="Månedsseiere" value={row.monthly_gold} />
        <Stat icon="stats-chart-outline" label="Månedspodier" value={podiums} />
      </View>
      <View style={styles.points}>
        <Text style={hallStyles.label}>Totalt antall poeng</Text>
        <Text style={styles.pointsValue}>{historicalPoints(row)}</Text>
      </View>

      <Text style={hallStyles.sectionTitle}>Sesong for sesong</Text>
      {seasons.length ? seasons.map((item) => (
        <View key={item.season} style={hallStyles.row}>
          <Text style={styles.season}>{item.season}</Text>
          <Text style={hallStyles.ink}>{item.place === 1 ? `🏆 ${formatPlace(item.place)}` : formatPlace(item.place)}</Text>
        </View>
      )) : <Text style={hallStyles.empty}>Ingen sammenlagtplassering er registrert.</Text>}

      <Text style={hallStyles.sectionTitle}>Månedsmeritter</Text>
      {months.length ? months.map((item) => (
        <View key={`${item.season}-${item.month}-${item.label}`} style={hallStyles.row}>
          <Text style={styles.month}>{item.month} {item.season}</Text>
          <Text style={hallStyles.ink}>{item.label}</Text>
        </View>
      )) : <Text style={hallStyles.empty}>Ingen månedsmeritter er registrert.</Text>}

      <Text style={hallStyles.sectionTitle}>Cuphistorikk</Text>
      {cups.length ? cups.map((item) => (
        <View key={`${item.season}-${item.role}`} style={hallStyles.row}>
          <Text style={styles.season}>{item.season}</Text>
          <Text style={hallStyles.ink}>{item.role}</Text>
        </View>
      )) : <Text style={hallStyles.empty}>Ingen cupgull registrert</Text>}
    </View>
  );
}

function Stat({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={16} color={colors.live} />
      <Text style={hallStyles.label}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  profile: { marginTop: 16, backgroundColor: colors.peach, borderRadius: radius.sm, padding: 16, borderWidth: StyleSheet.hairlineWidth, borderColor: "rgba(23,23,21,0.12)" },
  name: { color: colors.ink, fontFamily: "Georgia", fontSize: 28, lineHeight: 32, fontWeight: "700" },
  first: { color: colors.muted, fontSize: 13, marginTop: 8 },
  stats: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16 },
  stat: { width: "48%", flexGrow: 1, backgroundColor: colors.panel, borderRadius: radius.sm, padding: 10, minHeight: 84 },
  statValue: { color: colors.ink, fontSize: 24, fontWeight: "900", marginTop: 6, fontVariant: ["tabular-nums"] },
  points: { marginTop: 10, backgroundColor: colors.panel, borderRadius: radius.sm, padding: 12 },
  pointsValue: { color: colors.ink, fontSize: 28, fontWeight: "900", marginTop: 4, fontVariant: ["tabular-nums"] },
  season: { color: colors.muted, width: 80, fontSize: 13, fontWeight: "800" },
  month: { flex: 1, color: colors.muted, fontSize: 13, fontWeight: "700" },
});
