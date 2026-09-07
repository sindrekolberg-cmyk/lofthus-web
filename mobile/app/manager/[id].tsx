import { useCallback } from "react";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { api } from "@/lib/api";
import { colors } from "@/lib/theme";
import { useRemote } from "@/lib/useRemote";
import { Screen } from "@/components/Screen";
import { ErrorState, Loading } from "@/components/State";

export default function ManagerScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = Number(params.id || 0);
  const loader = useCallback(() => api.manager(id), [id]);
  const remote = useRemote(loader);
  const manager = remote.data?.manager;

  return (
    <Screen
      kicker={manager ? `${manager.rank}. sammenlagt` : "Manager"}
      title={manager?.manager || "Manager"}
      refreshing={remote.refreshing}
      onRefresh={remote.refresh}
    >
      {remote.loading && !remote.data ? <Loading /> : null}
      {remote.error && !remote.data ? <ErrorState message={remote.error} /> : null}
      {manager ? (
        <>
          <View style={styles.summary}>
            <Metric label="TOTAL" value={manager.total} />
            <Metric label="GW" value={manager.gw} />
            <Metric label="IGJEN" value={manager.players_remaining || 0} />
          </View>

          <View style={styles.identity}>
            <Text style={styles.team}>{manager.team}</Text>
            <Text style={styles.captain}>Kaptein · {manager.captain || "–"}</Text>
          </View>

          {remote.data?.form?.length ? (
            <>
              <Text style={styles.sectionTitle}>Form</Text>
              <View style={styles.formList}>
                {remote.data.form.slice().reverse().map((row) => (
                  <View key={row.event} style={styles.formRow}>
                    <View style={styles.formGwWrap}>
                      <Text style={styles.gw}>GW{row.event}</Text>
                      {row.is_live ? <Text style={styles.live}>LIVE</Text> : null}
                    </View>
                    <View style={styles.formScoreWrap}>
                      <Text style={styles.formPoints}>{row.points}</Text>
                      <Text style={styles.formPointsLabel}>poeng</Text>
                    </View>
                    <View style={styles.rankWrap}>
                      <Text style={styles.formRank}>{row.league_rank}. sammenlagt</Text>
                      {row.round_rank ? <Text style={styles.roundRank}>{row.round_rank}. best i runden</Text> : null}
                    </View>
                  </View>
                ))}
              </View>
            </>
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summary: { backgroundColor: colors.peach, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "rgba(23,23,21,0.14)", paddingVertical: 16, paddingHorizontal: 14, flexDirection: "row", justifyContent: "space-between" },
  metric: { minWidth: 72 },
  metricValue: { color: colors.ink, fontSize: 31, lineHeight: 34, fontWeight: "900", fontVariant: ["tabular-nums"] },
  metricLabel: { color: colors.muted, fontSize: 9, fontWeight: "900", letterSpacing: 1.05, marginTop: 3 },
  identity: { paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  team: { color: colors.ink, fontFamily: "Georgia", fontSize: 20, fontWeight: "700" },
  captain: { color: colors.muted, fontSize: 12, marginTop: 4 },
  sectionTitle: { color: colors.ink, fontFamily: "Georgia", fontSize: 27, fontWeight: "700", marginTop: 27, marginBottom: 9 },
  formList: { borderTopWidth: 1, borderTopColor: colors.ink },
  formRow: { minHeight: 64, flexDirection: "row", alignItems: "center", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line, gap: 10 },
  formGwWrap: { width: 58 },
  gw: { color: colors.muted, fontSize: 11, fontWeight: "900", letterSpacing: 0.6 },
  live: { color: colors.live, fontSize: 8, fontWeight: "900", letterSpacing: 0.9, marginTop: 2 },
  formScoreWrap: { width: 52 },
  formPoints: { color: colors.ink, fontSize: 20, lineHeight: 21, fontWeight: "900", fontVariant: ["tabular-nums"] },
  formPointsLabel: { color: colors.muted, fontSize: 9, marginTop: 1 },
  rankWrap: { flex: 1, alignItems: "flex-end" },
  formRank: { color: colors.ink, fontSize: 12, fontWeight: "700" },
  roundRank: { color: colors.muted, fontSize: 10, marginTop: 2 },
});
