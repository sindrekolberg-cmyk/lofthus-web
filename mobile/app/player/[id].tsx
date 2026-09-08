import { useCallback, useMemo } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { ErrorState, Loading } from "@/components/State";
import { api } from "@/lib/api";
import { colors, radius, space } from "@/lib/theme";
import { useRemote } from "@/lib/useRemote";

export default function PlayerOwnershipScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const element = Number(id || 0);
  const loader = useCallback(() => api.analysisOwnership(), []);
  const remote = useRemote(loader, element > 0);
  const player = useMemo(
    () => (remote.data?.players || []).find((row) => Number(row.element) === element),
    [remote.data, element],
  );

  return (
    <Screen
      kicker="Eierskap"
      title={player?.player || "Spiller"}
      refreshing={remote.refreshing}
      onRefresh={remote.refresh}
    >
      {remote.loading && !remote.data ? <Loading label="Henter eierskap …" /> : null}
      {remote.error && !remote.data ? <ErrorState message={remote.error} /> : null}
      {remote.data && !player ? <ErrorState message="Fant ikke spilleren i den aktive ligaoversikten." /> : null}

      {player ? (
        <>
          <View style={styles.summary}>
            <Text style={styles.club}>{player.club || ""}</Text>
            <View style={styles.stats}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{Number(player.ownership_pct || 0).toFixed(0)} %</Text>
                <Text style={styles.statLabel}>Lofthus</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{Number(player.global_ownership_pct || 0).toFixed(0)} %</Text>
                <Text style={styles.statLabel}>Globalt</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{player.event_points}</Text>
                <Text style={styles.statLabel}>GW-poeng</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>EIES AV {player.ownership_count} I LIGAEN</Text>
          <View style={styles.list}>
            {(player.owners || []).map((owner) => (
              <Pressable
                key={owner.entry}
                accessibilityRole="button"
                accessibilityLabel={`Åpne ${owner.manager}`}
                onPress={() => router.push(`/manager/${owner.entry}`)}
                style={({ pressed }) => [styles.ownerRow, pressed && styles.pressed]}
              >
                <View style={styles.ownerCopy}>
                  <Text style={styles.ownerName}>{owner.manager}</Text>
                  <Text style={styles.ownerTeam}>{owner.team}</Text>
                </View>
                <View style={styles.tags}>
                  {owner.is_triple_captain ? <Text style={styles.tag}>TC</Text> : owner.is_captain ? <Text style={styles.tag}>C</Text> : null}
                  {owner.on_bench ? <Text style={styles.benchTag}>BENK</Text> : null}
                </View>
                <Text style={styles.arrow}>→</Text>
              </Pressable>
            ))}
            {!(player.owners || []).length ? <Text style={styles.empty}>Ingen i ligaen eier spilleren.</Text> : null}
          </View>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: { backgroundColor: colors.panel, borderRadius: radius.lg, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, padding: space.lg, marginBottom: 22 },
  club: { color: colors.muted, fontSize: 12, fontWeight: "700", marginBottom: 12 },
  stats: { flexDirection: "row", gap: 8 },
  stat: { flex: 1, backgroundColor: colors.paper, borderRadius: radius.md, padding: 10 },
  statValue: { color: colors.ink, fontSize: 20, fontWeight: "900", fontVariant: ["tabular-nums"] },
  statLabel: { color: colors.muted, fontSize: 9, marginTop: 2, textTransform: "uppercase" },
  sectionTitle: { color: colors.live, fontSize: 10, fontWeight: "900", letterSpacing: 1.1, marginBottom: 8 },
  list: { borderTopWidth: 1, borderTopColor: colors.ink },
  ownerRow: { minHeight: 64, flexDirection: "row", alignItems: "center", gap: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line, paddingVertical: 10 },
  pressed: { opacity: 0.62 },
  ownerCopy: { flex: 1 },
  ownerName: { color: colors.ink, fontFamily: "Georgia", fontSize: 17, fontWeight: "700" },
  ownerTeam: { color: colors.muted, fontSize: 10, marginTop: 2 },
  tags: { flexDirection: "row", gap: 5 },
  tag: { color: colors.white, backgroundColor: colors.ink, fontSize: 9, fontWeight: "900", overflow: "hidden", borderRadius: 9, paddingHorizontal: 6, paddingVertical: 3 },
  benchTag: { color: colors.muted, backgroundColor: colors.panel, fontSize: 8, fontWeight: "900", overflow: "hidden", borderRadius: 9, paddingHorizontal: 6, paddingVertical: 3 },
  arrow: { color: colors.muted, fontSize: 18 },
  empty: { color: colors.muted, fontSize: 13, paddingVertical: 16 },
});