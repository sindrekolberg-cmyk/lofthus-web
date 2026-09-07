import { useCallback } from "react";
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { api } from "@/lib/api";
import { colors } from "@/lib/theme";
import { useRemote } from "@/lib/useRemote";
import { Screen } from "@/components/Screen";
import { ErrorState, Loading } from "@/components/State";
import { Section } from "@/components/Section";

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
          <View style={styles.hero}>
            <Metric label="Total" value={manager.total} />
            <Metric label="GW" value={manager.gw} />
            <Metric label="Igjen" value={manager.players_remaining || 0} />
          </View>
          <Text style={styles.team}>{manager.team}</Text>
          <Text style={styles.captain}>Kaptein: {manager.captain || "–"}</Text>

          {remote.data?.form?.length ? (
            <Section title="Form">
              {remote.data.form.slice().reverse().map((row) => (
                <View key={row.event} style={styles.formRow}>
                  <Text style={styles.gw}>GW{row.event}{row.is_live ? " · LIVE" : ""}</Text>
                  <Text style={styles.formPoints}>{row.points} p</Text>
                  <Text style={styles.formRank}>{row.league_rank}. sammenlagt</Text>
                </View>
              ))}
            </Section>
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <View style={styles.metric}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.dark, borderRadius: 22, padding: 18, flexDirection: "row", justifyContent: "space-between" },
  metric: { minWidth: 70 },
  metricValue: { color: colors.white, fontSize: 30, fontWeight: "900", fontVariant: ["tabular-nums"] },
  metricLabel: { color: "#C9C3B9", fontSize: 11, fontWeight: "700", marginTop: 2 },
  team: { color: colors.ink, fontSize: 18, fontWeight: "800", marginTop: 16 },
  captain: { color: colors.muted, fontSize: 14, marginTop: 3 },
  formRow: { minHeight: 52, flexDirection: "row", alignItems: "center", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  gw: { width: 90, color: colors.muted, fontSize: 12, fontWeight: "800" },
  formPoints: { flex: 1, color: colors.ink, fontSize: 16, fontWeight: "800" },
  formRank: { color: colors.muted, fontSize: 13 },
});
