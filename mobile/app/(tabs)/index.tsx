import { useCallback } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { api } from "@/lib/api";
import { colors } from "@/lib/theme";
import { useRemote } from "@/lib/useRemote";
import { Screen } from "@/components/Screen";
import { ErrorState, Loading } from "@/components/State";
import { ManagerRows } from "@/components/ManagerRows";

export default function HomeScreen() {
  const loader = useCallback(() => api.home(), []);
  const remote = useRemote(loader);
  const data = remote.data;

  return (
    <Screen
      refreshing={remote.refreshing}
      onRefresh={remote.refresh}
      flush
    >
      {remote.loading && !data ? <Loading /> : null}
      {remote.error && !data ? <ErrorState message={remote.error} /> : null}
      {data ? (
        <>
          <View style={styles.statusBand}>
            <Text style={styles.statusKicker}>
              {data.status.is_live ? `● LIVE · RUNDE ${data.status.event_id}` : (data.status.round_kicker || `RUNDE ${data.status.event_id}`)}
            </Text>
            <Text style={styles.brand}>Lofthus Road Open</Text>
          </View>

          {data.pulse.fixtures?.length ? (
            <View style={styles.fixtureBand}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.fixtureRail}>
                {data.pulse.fixtures.slice(0, 6).map((fixture) => (
                  <View key={fixture.id} style={styles.fixture}>
                    <Text style={styles.fixtureTeams} numberOfLines={1}>
                      {fixture.home} {fixture.home_score ?? ""} · {fixture.away_score ?? ""} {fixture.away}
                    </Text>
                    <Text style={styles.fixtureMeta} numberOfLines={2}>
                      {fixture.status_label || fixture.status}
                      {fixture.lofthus_headline ? ` · ${fixture.lofthus_headline}` : ""}
                    </Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          ) : null}

          <View style={styles.controlRoom}>
            <View style={styles.blockHeader}>
              <Text style={styles.eyebrow}>TOPP 5 SAMMENLAGT</Text>
              <Text style={styles.linkLabel}>HELE LIGAEN →</Text>
            </View>
            <ManagerRows rows={data.top5} limit={5} compact />

            <View style={styles.divider} />

            <View style={styles.blockHeader}>
              <Text style={styles.eyebrow}>{(data.month.name || "MÅNED").toUpperCase()}</Text>
              <Text style={styles.linkLabel}>MÅNEDEN →</Text>
            </View>
            <View style={styles.monthList}>
              {data.month.table.slice(0, 5).map((row) => (
                <View key={row.entry} style={styles.monthRow}>
                  <Text style={styles.monthName} numberOfLines={1}>{row.month_rank}. {row.manager}</Text>
                  <Text style={styles.monthPoints}>{row.month_points}</Text>
                </View>
              ))}
            </View>

            <View style={styles.divider} />

            <Text style={styles.eyebrow}>SPILLERNE ALLE SNAKKER OM</Text>
            {data.popular.length ? (
              <View style={styles.talkers}>
                {data.popular.slice(0, 5).map((player) => (
                  <View key={player.element} style={styles.talkerRow}>
                    <View style={styles.playerDot}><Text style={styles.playerInitial}>{player.player.slice(0, 1)}</Text></View>
                    <Text style={styles.talkerName} numberOfLines={1}>{player.player}</Text>
                    <Text style={styles.talkerMeta}>{Math.round(player.ownership_pct)}% · {player.event_points} p</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.empty}>Ingen spillere skiller seg ut akkurat nå.</Text>
            )}
          </View>

          <View style={styles.editorial}>
            <Text style={styles.sectionTitle}>Snakkiser</Text>
            {data.news.length ? (
              <View style={styles.stories}>
                {data.news.slice(0, 5).map((story) => (
                  <View key={story.key} style={styles.story}>
                    <Text style={styles.storyCategory}>{(story.category || "Lofthus").toUpperCase()}</Text>
                    <Text style={styles.storyHeadline}>{story.headline}</Text>
                    {story.meta ? <Text style={styles.storyMeta}>{story.meta}</Text> : null}
                  </View>
                ))}
              </View>
            ) : <Text style={styles.empty}>Ingen sterke historier akkurat nå.</Text>}

            <Text style={[styles.sectionTitle, styles.movesTitle]}>Største utslag</Text>
            <View style={styles.movesGrid}>
              <View style={styles.moveColumn}>
                <Text style={[styles.eyebrow, styles.up]}>STØRSTE KLATRERE</Text>
                {(data.movers?.climbers || []).slice(0, 3).map((row) => (
                  <View key={row.entry} style={styles.moveRow}>
                    <Text style={styles.moveName} numberOfLines={1}>{row.manager}</Text>
                    <Text style={[styles.moveValue, styles.up]}>+{row.rank_change}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.moveColumn}>
                <Text style={[styles.eyebrow, styles.down]}>STØRSTE FALL</Text>
                {(data.movers?.fallers || []).slice(0, 3).map((row) => (
                  <View key={row.entry} style={styles.moveRow}>
                    <Text style={styles.moveName} numberOfLines={1}>{row.manager}</Text>
                    <Text style={[styles.moveValue, styles.down]}>{row.rank_change}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  statusBand: { backgroundColor: colors.peach, paddingHorizontal: 18, paddingTop: 12, paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(23,23,21,0.12)" },
  statusKicker: { color: colors.live, fontSize: 11, fontWeight: "900", letterSpacing: 1.5 },
  brand: { color: colors.ink, fontFamily: "Georgia", fontSize: 31, lineHeight: 35, fontWeight: "700", letterSpacing: -0.8, marginTop: 5 },
  fixtureBand: { backgroundColor: "rgba(255,255,255,0.72)", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  fixtureRail: { paddingHorizontal: 18, paddingVertical: 10, gap: 8 },
  fixture: { width: 210, minHeight: 62, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, backgroundColor: colors.panel, paddingHorizontal: 12, paddingVertical: 9 },
  fixtureTeams: { color: colors.ink, fontSize: 13, fontWeight: "800" },
  fixtureMeta: { color: colors.muted, fontSize: 11, lineHeight: 15, marginTop: 3 },
  controlRoom: { backgroundColor: colors.peach, paddingHorizontal: 18, paddingTop: 18, paddingBottom: 20, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(23,23,21,0.12)" },
  blockHeader: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 12 },
  eyebrow: { color: colors.muted, fontSize: 10, fontWeight: "900", letterSpacing: 1.35 },
  linkLabel: { color: colors.muted, fontSize: 9, fontWeight: "800", letterSpacing: 0.9 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: "rgba(23,23,21,0.14)", marginVertical: 18 },
  monthList: { marginTop: 5, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "rgba(23,23,21,0.15)" },
  monthRow: { minHeight: 42, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(23,23,21,0.15)" },
  monthName: { flex: 1, color: colors.ink, fontSize: 14 },
  monthPoints: { color: colors.ink, fontSize: 15, fontWeight: "800", fontVariant: ["tabular-nums"] },
  talkers: { marginTop: 5, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "rgba(23,23,21,0.15)" },
  talkerRow: { minHeight: 43, flexDirection: "row", alignItems: "center", gap: 9, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(23,23,21,0.15)" },
  playerDot: { width: 28, height: 28, alignItems: "center", justifyContent: "center", backgroundColor: colors.player },
  playerInitial: { color: colors.ink, fontFamily: "Georgia", fontSize: 13, fontWeight: "700" },
  talkerName: { flex: 1, color: colors.ink, fontSize: 14 },
  talkerMeta: { color: colors.muted, fontSize: 11, fontWeight: "700", fontVariant: ["tabular-nums"] },
  editorial: { paddingHorizontal: 18, paddingTop: 24, paddingBottom: 34 },
  sectionTitle: { color: colors.ink, fontFamily: "Georgia", fontSize: 29, lineHeight: 33, fontWeight: "700", letterSpacing: -0.5 },
  stories: { marginTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  story: { paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  storyCategory: { color: colors.live, fontSize: 9, fontWeight: "900", letterSpacing: 1.25 },
  storyHeadline: { color: colors.ink, fontFamily: "Georgia", fontSize: 20, lineHeight: 25, fontWeight: "700", marginTop: 4 },
  storyMeta: { color: colors.muted, fontSize: 12, lineHeight: 17, marginTop: 3 },
  movesTitle: { marginTop: 28 },
  movesGrid: { flexDirection: "row", gap: 18, marginTop: 10 },
  moveColumn: { flex: 1 },
  moveRow: { minHeight: 37, flexDirection: "row", alignItems: "center", gap: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  moveName: { flex: 1, color: colors.ink, fontSize: 12 },
  moveValue: { fontSize: 12, fontWeight: "900", fontVariant: ["tabular-nums"] },
  up: { color: colors.green },
  down: { color: colors.live },
  empty: { color: colors.muted, fontSize: 13, lineHeight: 18, marginTop: 8 },
});
