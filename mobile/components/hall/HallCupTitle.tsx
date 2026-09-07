import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { HallCup } from "@/lib/types";
import { colors, radius } from "@/lib/theme";

export function HallCupTitle({ cup, season }: { cup: HallCup; season?: string }) {
  return (
    <View style={styles.block}>
      <View style={styles.header}>
        <Ionicons name="trophy" size={14} color={colors.bronze} />
        <Text style={styles.kicker}>Lofthus Cup</Text>
        {season ? <Text style={styles.season}>{season}</Text> : null}
      </View>
      <Text style={styles.winner} numberOfLines={2}>{cup.winner || "Ikke registrert"}</Text>
      {cup.runner_up ? (
        <Text style={styles.finalist} numberOfLines={2}>Vant finalen mot {cup.runner_up}</Text>
      ) : (
        <Text style={styles.finalist}>Finalist er ikke registrert</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: colors.goldSoft,
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  header: { flexDirection: "row", alignItems: "center", gap: 6 },
  kicker: { color: colors.bronze, fontSize: 10, fontWeight: "900", letterSpacing: 1.4, textTransform: "uppercase" },
  season: { marginLeft: "auto", color: colors.bronze, fontSize: 10, fontWeight: "800", letterSpacing: 0.6 },
  winner: { color: colors.ink, fontFamily: "Georgia", fontSize: 22, lineHeight: 26, fontWeight: "700", marginTop: 8 },
  finalist: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 4 },
});
