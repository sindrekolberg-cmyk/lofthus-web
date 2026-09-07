import { useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { api } from "@/lib/api";
import { colors } from "@/lib/theme";
import { useRemote } from "@/lib/useRemote";
import { Screen } from "@/components/Screen";
import { ErrorState, Loading } from "@/components/State";
import { Section } from "@/components/Section";

export default function HallScreen() {
  const loader = useCallback(() => api.hallOfFame(), []);
  const remote = useRemote(loader);
  const [query, setQuery] = useState("");
  const matches = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("nb");
    if (!q || !remote.data) return [];
    return remote.data.rows.filter((row) => row.manager.toLocaleLowerCase("nb").includes(q)).slice(0, 6);
  }, [query, remote.data]);

  return (
    <Screen kicker="Historie" title="Hall of Fame">
      {remote.loading && !remote.data ? <Loading /> : null}
      {remote.error && !remote.data ? <ErrorState message={remote.error} /> : null}
      {remote.data ? (
        <>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Søk etter manager"
            placeholderTextColor={colors.muted}
            autoCorrect={false}
            style={styles.search}
          />
          {matches.length ? (
            <View style={styles.matches}>
              {matches.map((row) => (
                <View key={row.manager} style={styles.profile}>
                  <Text style={styles.name}>{row.manager}</Text>
                  <View style={styles.stats}>
                    <Stat label="Sammenlagt" value={row.league_gold} />
                    <Stat label="Cupgull" value={row.cup_gold} />
                    <Stat label="Månedsseiere" value={row.monthly_gold} />
                    <Stat label="Månedspodier" value={row.monthly_gold + row.monthly_silver + row.monthly_bronze} />
                  </View>
                </View>
              ))}
            </View>
          ) : query.trim() ? <Text style={styles.empty}>Ingen manager funnet.</Text> : null}

          <Section title="Sammenlagtvinnere">
            {(remote.data.overall || []).slice().reverse().map((row) => (
              <View key={row.season} style={styles.winnerRow}>
                <Text style={styles.season}>{row.season}</Text>
                <Text style={styles.winner}>{row.winner || "Ikke registrert"}</Text>
              </View>
            ))}
          </Section>
        </>
      ) : null}
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  search: { height: 50, borderWidth: 1, borderColor: colors.line, borderRadius: 14, backgroundColor: colors.panel, color: colors.ink, paddingHorizontal: 15, fontSize: 16 },
  matches: { marginTop: 12, gap: 10 },
  profile: { backgroundColor: colors.dark, borderRadius: 18, padding: 17 },
  name: { color: colors.white, fontSize: 23, fontWeight: "800" },
  stats: { flexDirection: "row", flexWrap: "wrap", marginTop: 16, gap: 8 },
  stat: { width: "47%", borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#4A4741", paddingTop: 10 },
  statValue: { color: colors.white, fontSize: 24, fontWeight: "900" },
  statLabel: { color: "#C9C3B9", fontSize: 11, marginTop: 2 },
  winnerRow: { flexDirection: "row", minHeight: 46, alignItems: "center", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  season: { color: colors.muted, width: 78, fontSize: 13, fontWeight: "700" },
  winner: { color: colors.ink, fontSize: 15, fontWeight: "700" },
  empty: { color: colors.muted, marginTop: 12 },
});
