import { useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { api } from "@/lib/api";
import { colors } from "@/lib/theme";
import { useRemote } from "@/lib/useRemote";
import { Screen } from "@/components/Screen";
import { ErrorState, Loading } from "@/components/State";

export default function HallScreen() {
  const loader = useCallback(() => api.hallOfFame(), []);
  const remote = useRemote(loader);
  const [query, setQuery] = useState("");
  const matches = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("nb");
    if (!q || !remote.data) return [];
    return remote.data.rows.filter((row) => row.manager.toLocaleLowerCase("nb").includes(q)).slice(0, 5);
  }, [query, remote.data]);

  return (
    <Screen kicker="Historie" title="Hall of Fame">
      {remote.loading && !remote.data ? <Loading /> : null}
      {remote.error && !remote.data ? <ErrorState message={remote.error} /> : null}
      {remote.data ? (
        <>
          <Text style={styles.lead}>Hele Lofthus-historien. Finn en manager, eller bla i sammenlagtvinnerne.</Text>
          <Text style={styles.label}>DETALJERT MANAGEROVERSIKT</Text>
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
                    <Stat label="Sammenlagtseier" value={row.league_gold} />
                    <Stat label="Cupgull" value={row.cup_gold} />
                    <Stat label="Månedsseiere" value={row.monthly_gold} />
                    <Stat label="Månedspodier" value={row.monthly_gold + row.monthly_silver + row.monthly_bronze} />
                  </View>
                </View>
              ))}
            </View>
          ) : query.trim() ? <Text style={styles.empty}>Ingen manager funnet.</Text> : null}

          <Text style={styles.sectionTitle}>Sammenlagtvinnere</Text>
          <View style={styles.winners}>
            {(remote.data.overall || []).slice().reverse().map((row) => (
              <View key={row.season} style={styles.winnerRow}>
                <Text style={styles.season}>{row.season}</Text>
                <Text style={styles.winner}>{row.winner || "Ikke registrert"}</Text>
              </View>
            ))}
          </View>
        </>
      ) : null}
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  lead: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: -5, marginBottom: 24 },
  label: { color: colors.muted, fontSize: 9, fontWeight: "900", letterSpacing: 1.3, marginBottom: 7 },
  search: { height: 48, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.panel, color: colors.ink, paddingHorizontal: 14, fontSize: 15 },
  matches: { marginTop: 12, gap: 10 },
  profile: { backgroundColor: colors.peach, borderTopWidth: 1, borderBottomWidth: 1, borderColor: "rgba(23,23,21,0.14)", paddingVertical: 16, paddingHorizontal: 14 },
  name: { color: colors.ink, fontFamily: "Georgia", fontSize: 23, lineHeight: 28, fontWeight: "700" },
  stats: { flexDirection: "row", flexWrap: "wrap", marginTop: 15, gap: 10 },
  stat: { width: "47%", borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "rgba(23,23,21,0.18)", paddingTop: 8 },
  statValue: { color: colors.ink, fontSize: 23, fontWeight: "900", fontVariant: ["tabular-nums"] },
  statLabel: { color: colors.muted, fontSize: 10, lineHeight: 14, marginTop: 1 },
  sectionTitle: { color: colors.ink, fontFamily: "Georgia", fontSize: 27, fontWeight: "700", marginTop: 30, marginBottom: 9 },
  winners: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  winnerRow: { flexDirection: "row", minHeight: 48, alignItems: "center", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  season: { color: colors.muted, width: 80, fontSize: 12, fontWeight: "800" },
  winner: { color: colors.ink, fontSize: 14, fontWeight: "700" },
  empty: { color: colors.muted, marginTop: 10, fontSize: 13 },
});
