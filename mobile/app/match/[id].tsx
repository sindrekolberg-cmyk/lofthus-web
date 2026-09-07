import { useCallback } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { api } from "@/lib/api";
import { formatKickoff } from "@/lib/format";
import { colors, radius } from "@/lib/theme";
import { useRemote } from "@/lib/useRemote";
import { Screen } from "@/components/Screen";
import { ErrorState, Loading } from "@/components/State";
import { ClubCrest } from "@/components/home/ClubCrest";

export default function MatchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const id = Number(params.id || 0);
  const loader = useCallback(() => api.match(id), [id]);
  const remote = useRemote(loader);
  const fixture = remote.data?.fixture;
  const live = fixture?.status === "live";

  return (
    <Screen kicker={live ? "Kampen pågår" : "Kamp"} title={fixture ? `${fixture.home} – ${fixture.away}` : "Kamp"} refreshing={remote.refreshing} onRefresh={remote.refresh}>
      {remote.loading && !remote.data ? <Loading /> : null}
      {remote.error && !remote.data ? <ErrorState message={remote.error} /> : null}
      {fixture ? (
        <>
          <View style={styles.scoreboard}>
            <View style={styles.club}>
              <ClubCrest badge={fixture.home_badge} code={fixture.home_code} short={fixture.home} name={fixture.home_name} size={44} />
              <Text style={styles.clubName}>{fixture.home_name || fixture.home}</Text>
            </View>
            <View style={styles.scoreWrap}>
              <Text style={styles.score}>{fixture.home_score ?? "–"} · {fixture.away_score ?? "–"}</Text>
              <Text style={styles.meta}>{live ? (fixture.status_label || "Pågår") : formatKickoff(fixture.kickoff) || fixture.status_label || ""}</Text>
            </View>
            <View style={styles.club}>
              <ClubCrest badge={fixture.away_badge} code={fixture.away_code} short={fixture.away} name={fixture.away_name} size={44} />
              <Text style={styles.clubName}>{fixture.away_name || fixture.away}</Text>
            </View>
          </View>
          {fixture.lofthus_headline ? <Text style={styles.headline}>{fixture.lofthus_headline}</Text> : null}
          {remote.data?.biggest_winner ? (
            <Pressable onPress={() => router.push(`/manager/${remote.data!.biggest_winner!.entry}`)} style={({ pressed }) => [styles.swing, pressed && styles.pressed]}>
              <Text style={styles.swingLabel}>Største vinner i Lofthus</Text>
              <Text style={styles.swingName}>{remote.data.biggest_winner.manager}</Text>
            </Pressable>
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  scoreboard: { flexDirection: "row", alignItems: "center", backgroundColor: colors.peach, borderRadius: radius.sm, padding: 14 },
  club: { flex: 1, alignItems: "center", gap: 8 },
  clubName: { color: colors.ink, fontSize: 12, fontWeight: "700", textAlign: "center" },
  scoreWrap: { alignItems: "center", minWidth: 90 },
  score: { color: colors.ink, fontSize: 22, fontWeight: "900", fontVariant: ["tabular-nums"] },
  meta: { color: colors.muted, fontSize: 11, fontWeight: "800", marginTop: 4 },
  headline: { color: colors.ink, fontFamily: "Georgia", fontSize: 20, marginTop: 16 },
  swing: { marginTop: 16, backgroundColor: colors.panel, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, borderRadius: radius.sm, padding: 12 },
  swingLabel: { color: colors.muted, fontSize: 10, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase" },
  swingName: { color: colors.ink, fontSize: 16, fontWeight: "700", marginTop: 4 },
  pressed: { opacity: 0.58 },
});
