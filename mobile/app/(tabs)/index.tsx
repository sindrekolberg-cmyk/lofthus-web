import { useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
import { api } from "@/lib/api";
import { colors } from "@/lib/theme";
import { useRemote } from "@/lib/useRemote";
import { Screen } from "@/components/Screen";
import { ErrorState, Loading } from "@/components/State";
import { ManagerRows } from "@/components/ManagerRows";
import { Section } from "@/components/Section";

export default function HomeScreen() {
  const loader = useCallback(() => api.home(), []);
  const remote = useRemote(loader);
  const data = remote.data;

  return (
    <Screen
      kicker={data?.status.round_kicker || (data ? `Runde ${data.status.event_id}` : "Lofthus Road Open")}
      title="Lofthus"
      refreshing={remote.refreshing}
      onRefresh={remote.refresh}
    >
      {remote.loading && !data ? <Loading /> : null}
      {remote.error && !data ? <ErrorState message={remote.error} /> : null}
      {data ? (
        <>
          <View style={[styles.liveCard, data.status.is_live && styles.liveCardActive]}>
            <Text style={[styles.liveLabel, data.status.is_live && styles.liveLabelActive]}>
              {data.status.is_live ? "● LIVE" : data.status.is_finished ? "RUNDE FERDIG" : "NESTE KAMP"}
            </Text>
            <Text style={styles.liveTitle}>{data.pulse.label || data.status.event_status_label || `Runde ${data.status.event_id}`}</Text>
          </View>

          {data.pulse.fixtures?.length ? (
            <Section title="Kamper" compact>
              <View style={styles.fixtures}>
                {data.pulse.fixtures.slice(0, 4).map((fixture) => (
                  <View key={fixture.id} style={styles.fixture}>
                    <Text style={styles.fixtureTeams}>{fixture.home} {fixture.home_score ?? ""} · {fixture.away_score ?? ""} {fixture.away}</Text>
                    <Text style={styles.fixtureMeta}>{fixture.status_label || fixture.status}{fixture.lofthus_headline ? ` · ${fixture.lofthus_headline}` : ""}</Text>
                  </View>
                ))}
              </View>
            </Section>
          ) : null}

          <Section title="Topp 5 sammenlagt">
            <ManagerRows rows={data.top5} limit={5} />
          </Section>

          <Section title={data.month.name || "Måned"}>
            <View style={styles.simpleList}>
              {data.month.table.slice(0, 5).map((row) => (
                <View key={row.entry} style={styles.simpleRow}>
                  <Text style={styles.simpleName}>{row.month_rank}. {row.manager}</Text>
                  <Text style={styles.simpleValue}>{row.month_points}</Text>
                </View>
              ))}
            </View>
          </Section>

          <Section title="Snakkiser">
            <View style={styles.stories}>
              {data.news.length ? data.news.slice(0, 4).map((story) => (
                <View key={story.key} style={styles.story}>
                  <Text style={styles.storyCategory}>{story.category || "Lofthus"}</Text>
                  <Text style={styles.storyHeadline}>{story.headline}</Text>
                  {story.meta ? <Text style={styles.storyMeta}>{story.meta}</Text> : null}
                </View>
              )) : <Text style={styles.empty}>Ingen sterke historier akkurat nå.</Text>}
            </View>
          </Section>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  liveCard: { backgroundColor: colors.dark, borderRadius: 20, padding: 18, marginBottom: 4 },
  liveCardActive: { backgroundColor: colors.live },
  liveLabel: { color: "#D8D2C9", fontSize: 11, fontWeight: "900", letterSpacing: 1.4 },
  liveLabelActive: { color: colors.white },
  liveTitle: { color: colors.white, fontSize: 22, fontWeight: "800", marginTop: 6 },
  fixtures: { gap: 8 },
  fixture: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.panel, borderRadius: 14, padding: 13 },
  fixtureTeams: { color: colors.ink, fontSize: 15, fontWeight: "800" },
  fixtureMeta: { color: colors.muted, fontSize: 12, marginTop: 3 },
  simpleList: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  simpleRow: { minHeight: 48, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  simpleName: { color: colors.ink, fontSize: 15, fontWeight: "650" },
  simpleValue: { color: colors.ink, fontSize: 17, fontWeight: "800", fontVariant: ["tabular-nums"] },
  stories: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  story: { paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  storyCategory: { color: colors.live, fontSize: 10, fontWeight: "900", letterSpacing: 1.1, textTransform: "uppercase" },
  storyHeadline: { color: colors.ink, fontSize: 20, lineHeight: 24, fontWeight: "800", marginTop: 4 },
  storyMeta: { color: colors.muted, fontSize: 13, marginTop: 4 },
  empty: { color: colors.muted, paddingVertical: 14 },
});
