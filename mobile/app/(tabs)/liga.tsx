import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { api } from "@/lib/api";
import { colors } from "@/lib/theme";
import { useRemote } from "@/lib/useRemote";
import type { ManagerRow } from "@/lib/types";
import { Screen } from "@/components/Screen";
import { ErrorState, Loading } from "@/components/State";
import { ManagerRows } from "@/components/ManagerRows";

export default function LeagueScreen() {
  const loader = useCallback(() => api.league(), []);
  const remote = useRemote(loader);
  const [mode, setMode] = useState<"total" | "month">("total");
  const rows = useMemo(() => {
    const all = [...(remote.data?.table || [])];
    if (mode === "month") {
      return all
        .sort((a, b) => b.month_points - a.month_points || a.rank - b.rank)
        .map((row, index) => ({ ...row, rank: index + 1, total: row.month_points } as ManagerRow));
    }
    return all.sort((a, b) => a.rank - b.rank);
  }, [remote.data, mode]);

  return (
    <Screen kicker={remote.data?.status.round_kicker || "Tabell"} title="Liga" refreshing={remote.refreshing} onRefresh={remote.refresh}>
      <View style={styles.switcher}>
        {(["total", "month"] as const).map((value) => (
          <Pressable key={value} onPress={() => setMode(value)} style={[styles.button, mode === value && styles.buttonActive]}>
            <Text style={[styles.buttonText, mode === value && styles.buttonTextActive]}>
              {value === "total" ? "Totalpoeng" : "Måned"}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.tableHeader}>
        <Text style={[styles.headerText, styles.headerPlace]}>PLASS</Text>
        <Text style={[styles.headerText, styles.headerManager]}>MANAGER</Text>
        <Text style={[styles.headerText, styles.headerRight]}>GW</Text>
        <Text style={[styles.headerText, styles.headerRight]}>{mode === "total" ? "TOTAL" : "MÅNED"}</Text>
      </View>

      {remote.loading && !remote.data ? <Loading /> : null}
      {remote.error && !remote.data ? <ErrorState message={remote.error} /> : null}
      {remote.data ? <ManagerRows rows={rows} /> : null}
      {remote.data?.status.provisional ? (
        <Text style={styles.note}>Plasseringene er foreløpige så lenge runden ikke er ferdig.</Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  switcher: { flexDirection: "row", gap: 8, marginBottom: 20 },
  button: { minHeight: 42, justifyContent: "center", borderWidth: 1, borderColor: colors.line, paddingHorizontal: 15, paddingVertical: 9, backgroundColor: colors.panel },
  buttonActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  buttonText: { color: colors.muted, fontSize: 11, fontWeight: "900", letterSpacing: 1.05, textTransform: "uppercase" },
  buttonTextActive: { color: colors.white },
  tableHeader: { minHeight: 34, flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: colors.ink },
  headerText: { color: colors.muted, fontSize: 9, fontWeight: "900", letterSpacing: 1.1 },
  headerPlace: { width: 38 },
  headerManager: { flex: 1 },
  headerRight: { width: 44, textAlign: "right" },
  note: { color: colors.muted, fontSize: 10, lineHeight: 15, fontWeight: "700", letterSpacing: 0.65, textTransform: "uppercase", marginTop: 12 },
});
