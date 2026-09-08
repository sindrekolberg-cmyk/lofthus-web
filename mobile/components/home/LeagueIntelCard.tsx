import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/lib/theme";

export function LeagueIntelCard() {
  return (
    <View style={styles.wrap}>
      <Link href="/intel" asChild>
        <Pressable accessibilityRole="button" style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
          <View style={styles.copy}>
            <Text style={styles.kicker}>DIN LIGA</Text>
            <Text style={styles.title}>Hva betyr runden for deg?</Text>
            <Text style={styles.body}>Personlig mål, rivaler, prognose, live-utslag og neste trekk.</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.panel, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  card: { minHeight: 104, backgroundColor: colors.ink, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, flexDirection: "row", alignItems: "center", gap: 12 },
  pressed: { opacity: 0.65 },
  copy: { flex: 1 },
  kicker: { color: "#D9A08F", fontSize: 9, fontWeight: "900", letterSpacing: 1.2 },
  title: { color: colors.white, fontFamily: "Georgia", fontSize: 21, lineHeight: 25, fontWeight: "700", marginTop: 5 },
  body: { color: "#CFC9C0", fontSize: 11, lineHeight: 16, marginTop: 4 },
  arrow: { color: colors.white, fontSize: 24 },
});
