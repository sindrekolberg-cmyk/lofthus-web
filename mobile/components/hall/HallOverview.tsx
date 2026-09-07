import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { HallTab } from "@/lib/hall";
import { deriveRecords } from "@/lib/hall";
import type { HallPayload } from "@/lib/types";
import { newestSeasonFirst } from "@/lib/format";
import { colors, radius } from "@/lib/theme";
import { hallStyles } from "./hallStyles";

export function HallOverview({ data, onOpen }: { data: HallPayload; onOpen: (tab: HallTab) => void }) {
  const records = deriveRecords(data.rows);
  const winners = [...(data.overall || [])].sort((a, b) => newestSeasonFirst(a.season, b.season));

  return (
    <View>
      <Text style={hallStyles.sectionTitle}>Meritter</Text>
      <View style={styles.meritGrid}>
        {records.map((record) => (
          <View key={record.label} style={styles.meritCard}>
            <Text style={hallStyles.label}>{record.label}</Text>
            {record.managers.length ? (
              <>
                <Text style={styles.meritNames}>{record.managers.join(" · ")}</Text>
                <Text style={styles.meritValue}>{record.value}</Text>
                {record.managers.length > 1 ? <Text style={styles.shared}>Delt rekord</Text> : null}
              </>
            ) : (
              <Text style={hallStyles.empty}>Ikke registrert</Text>
            )}
          </View>
        ))}
      </View>

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

      <Text style={hallStyles.sectionTitle}>Utforsk</Text>
      <View style={styles.quick}>
        <QuickCard icon="calendar-outline" title="Sesong for sesong" copy="Se vinnere og historiske plasseringer" onPress={() => onOpen("seasons")} />
        <QuickCard icon="star-outline" title="Månedsvinnere" copy="Alle månedsgull og podium" onPress={() => onOpen("month")} />
        <QuickCard icon="trophy-outline" title="Cupvinnere" copy="Hele cuphistorikken" onPress={() => onOpen("cup")} />
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
  meritGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  meritCard: { width: "48%", flexGrow: 1, backgroundColor: colors.panel, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, borderRadius: radius.sm, padding: 12, minHeight: 108 },
  meritNames: { color: colors.ink, fontFamily: "Georgia", fontSize: 16, lineHeight: 20, fontWeight: "700", marginTop: 8 },
  meritValue: { color: colors.ink, fontSize: 22, fontWeight: "900", marginTop: 6, fontVariant: ["tabular-nums"] },
  shared: { color: colors.muted, fontSize: 10, fontWeight: "800", letterSpacing: 0.6, textTransform: "uppercase", marginTop: 4 },
  list: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  season: { color: colors.muted, width: 72, fontSize: 12, fontWeight: "800" },
  winner: { flex: 1, paddingRight: 8 },
  quick: { gap: 8 },
  quickCard: { minHeight: 72, flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.panel, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, borderRadius: radius.sm, paddingHorizontal: 12 },
  quickCopy: { flex: 1 },
  quickTitle: { color: colors.ink, fontSize: 15, fontWeight: "800" },
});
