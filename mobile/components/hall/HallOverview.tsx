import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { HallTab } from "@/lib/hall";
import type { HallPayload, HallRow } from "@/lib/types";
import { newestSeasonFirst } from "@/lib/format";
import { colors, radius } from "@/lib/theme";
import { hallStyles } from "./hallStyles";
import { HallLegends } from "./HallLegends";

export function HallOverview({
  data,
  onOpen,
  onSelectManager,
}: {
  data: HallPayload;
  onOpen: (tab: HallTab) => void;
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

      <Text style={hallStyles.sectionTitle}>Utforsk</Text>
      <View style={styles.quick}>
        <QuickCard icon="calendar-outline" title="Sesong for sesong" copy="Vinnere og historiske plasseringer" onPress={() => onOpen("seasons")} />
        <QuickCard icon="star-outline" title="Månedsvinnere" copy="Alle månedsgull og podier" onPress={() => onOpen("month")} />
        <QuickCard icon="trophy-outline" title="Cuphistorikk" copy="Hele cuphistorikken" onPress={() => onOpen("cup")} />
        <QuickCard icon="dice-outline" title="Random plassering" copy="Trekk en tilfeldig historisk plassering" onPress={() => onOpen("random")} />
      </View>
    </View>
  );
}

function QuickCard({
  icon,
  title,
  copy,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  copy: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.quickCard, pressed && hallStyles.pressed]}>
      <Ionicons name={icon} size={20} color={colors.live} />
      <View style={styles.quickCopy}>
        <Text style={styles.quickTitle}>{title}</Text>
        <Text style={hallStyles.muted}>{copy}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  list: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  season: { color: colors.muted, width: 72, fontSize: 12, fontWeight: "800" },
  winner: { flex: 1, paddingRight: 8 },
  quick: { gap: 8 },
  quickCard: { minHeight: 72, flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.panel, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, borderRadius: radius.sm, paddingHorizontal: 12 },
  quickCopy: { flex: 1 },
  quickTitle: { color: colors.ink, fontSize: 15, fontWeight: "800" },
});
