import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { HallRow } from "@/lib/types";
import { legendMerits, legendRanking } from "@/lib/hall";
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
      <Text style={hallStyles.muted}>Rangert etter ligatitler, deretter cupgull og resten av medaljehyllen.</Text>
      {legends.length ? (
        <View style={styles.list}>
          {legends.map((row, index) => (
            <Pressable
              key={row.manager}
              disabled={!onSelect}
              onPress={() => onSelect?.(row)}
              style={({ pressed }) => [styles.card, index === 0 && styles.first, pressed && hallStyles.pressed]}
            >
              <Text style={[styles.place, index === 0 && styles.placeFirst]}>{index + 1}</Text>
              <View style={styles.copy}>
                <Text style={styles.name} numberOfLines={2}>{row.manager}</Text>
                <View style={styles.merits}>
                  {legendMerits(row).map((item) => (
                    <View key={item.key} style={[styles.merit, item.key === "cup" && styles.cupMerit]}>
                      {item.key === "cup" ? <Ionicons name="trophy" size={11} color={colors.bronze} /> : null}
                      <Text style={[styles.meritText, item.key === "cup" && styles.cupMeritText]}>
                        {item.value} {item.label}
                      </Text>
                    </View>
                  ))}
                </View>
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
  merits: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 6 },
  merit: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4, backgroundColor: colors.silverSoft },
  meritText: { color: colors.muted, fontSize: 10, fontWeight: "800", letterSpacing: 0.3 },
  cupMerit: { backgroundColor: colors.bronzeSoft, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.bronze },
  cupMeritText: { color: colors.ink },
});
