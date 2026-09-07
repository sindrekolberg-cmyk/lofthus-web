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
    if (mode === "month") return all.sort((a, b) => b.month_points - a.month_points || a.rank - b.rank).map((row, index) => ({ ...row, rank: index + 1, total: row.month_points } as ManagerRow));
    return all.sort((a, b) => a.rank - b.rank);
  }, [remote.data, mode]);

  return (
    <Screen kicker={remote.data?.status.round_kicker || "Tabell"} title="Liga" refreshing={remote.refreshing} onRefresh={remote.refresh}>
      <View style={styles.switcher}>
        {(["total", "month"] as const).map((value) => (
          <Pressable key={value} onPress={() => setMode(value)} style={[styles.button, mode === value && styles.buttonActive]}>
            <Text style={[styles.buttonText, mode === value && styles.buttonTextActive]}>{value === "total" ? "Totalpoeng" : "Måned"}</Text>
          </Pressable>
        ))}
      </View>
      {remote.loading && !remote.data ? <Loading /> : null}
      {remote.error && !remote.data ? <ErrorState message={remote.error} /> : null}
      {remote.data ? <ManagerRows rows={rows} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  switcher: { flexDirection: "row", gap: 8, marginBottom: 16 },
  button: { borderWidth: 1, borderColor: colors.line, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10 },
  buttonActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  buttonText: { color: colors.muted, fontSize: 13, fontWeight: "800" },
  buttonTextActive: { color: colors.white },
});
