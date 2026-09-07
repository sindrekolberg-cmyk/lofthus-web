import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import type { Fixture } from "@/lib/types";
import { formatKickoff } from "@/lib/format";
import { colors } from "@/lib/theme";
import { ClubCrest } from "./ClubCrest";

export function FixtureRail({ fixtures }: { fixtures: Fixture[] }) {
  const router = useRouter();
  const shown = fixtures.filter((row) => row.id && row.home && row.away).slice(0, 6);
  if (!shown.length) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Neste kamper</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
        {shown.map((fixture, index) => (
          <Pressable
            key={fixture.id}
            onPress={() => router.push(`/match/${fixture.id}`)}
            style={({ pressed }) => [styles.card, index === 0 && styles.first, pressed && styles.pressed]}
          >
            <View style={styles.inner}>
              <View style={styles.topline}>
                {fixture.status === "live" ? <View style={styles.liveDot} /> : null}
                <Text style={styles.when}>{when(fixture)}</Text>
              </View>
              <View style={styles.teams}>
                <ClubCrest badge={fixture.home_badge} code={fixture.home_code} short={fixture.home} name={fixture.home_name} size={26} />
                <Text style={styles.score}>{dash(fixture.home_score)}</Text>
                <Text style={styles.mid}>·</Text>
                <Text style={styles.score}>{dash(fixture.away_score)}</Text>
                <ClubCrest badge={fixture.away_badge} code={fixture.away_code} short={fixture.away} name={fixture.away_name} size={26} />
              </View>
              <Text style={styles.names} numberOfLines={1}>
                {fixture.home} – {fixture.away}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function when(fixture: Fixture) {
  if (fixture.status === "live") return (fixture.status_label || "Pågår").toUpperCase();
  if (fixture.status === "finished") return (fixture.status_label || "Ferdig").toUpperCase();
  return formatKickoff(fixture.kickoff) || (fixture.status_label || "Neste").toUpperCase();
}

function dash(value?: number | null) {
  return value == null ? "–" : String(value);
}

const styles = StyleSheet.create({
  section: { backgroundColor: colors.peach, paddingTop: 8, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  title: { paddingHorizontal: 16, color: colors.ink, fontFamily: "Georgia", fontSize: 22, lineHeight: 26, fontWeight: "700" },
  rail: { paddingHorizontal: 16, paddingTop: 8, paddingRight: 20 },
  card: {
    width: 168,
    marginRight: 8,
    backgroundColor: colors.panel,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
    transform: [{ skewX: "-7deg" }],
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  first: { borderLeftWidth: 3, borderLeftColor: colors.live },
  inner: { minHeight: 78, paddingHorizontal: 11, paddingVertical: 8, transform: [{ skewX: "7deg" }] },
  topline: { flexDirection: "row", alignItems: "center", gap: 5 },
  liveDot: { width: 6, height: 6, borderRadius: 6, backgroundColor: colors.live },
  when: { color: colors.ink, fontSize: 8, fontWeight: "900", letterSpacing: 1.05 },
  teams: { marginTop: 8, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  score: { color: colors.ink, fontSize: 13, fontWeight: "800", fontVariant: ["tabular-nums"] },
  mid: { color: colors.ink, fontSize: 13, fontWeight: "800" },
  names: { marginTop: 6, textAlign: "center", color: colors.ink, fontSize: 11, fontWeight: "700" },
  pressed: { opacity: 0.58 },
});
