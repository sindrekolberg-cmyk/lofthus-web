import { StyleSheet, Text, View } from "react-native";
import type { HallPayload } from "@/lib/types";
import { newestSeasonFirst } from "@/lib/format";
import { colors, radius } from "@/lib/theme";
import { hallStyles } from "./hallStyles";

export function HallSeasonHistory({ data }: { data: HallPayload }) {
  const seasons = [...(data.overall || [])].sort((a, b) => newestSeasonFirst(a.season, b.season));
  return (
    <View>
      {seasons.map((row) => {
        const cup = data.cup.find((item) => item.season === row.season);
        const months = data.monthly.filter((item) => item.season === row.season && item.winner);
        return (
          <View key={row.season} style={styles.card}>
            <Text style={styles.season}>{row.season}</Text>
            <Podium label="Vinner" value={row.winner} mark="1" />
            <Podium label="Andreplass" value={row.runner_up} mark="2" />
            <Podium label="Tredjeplass" value={row.third_place} mark="3" />
            {cup?.winner ? <Text style={styles.extra}>Cupvinner · {cup.winner}{cup.runner_up ? `  ·  Finale mot ${cup.runner_up}` : ""}</Text> : null}
            {months.length ? <Text style={styles.extra}>Månedsseiere · {months.map((item) => item.month).join(", ")}</Text> : null}
          </View>
        );
      })}
    </View>
  );
}

function Podium({ label, value, mark }: { label: string; value?: string; mark: string }) {
  return (
    <View style={styles.podium}>
      <Text style={styles.mark}>{mark}</Text>
      <View style={{ flex: 1 }}>
        <Text style={hallStyles.label}>{label}</Text>
        <Text style={hallStyles.ink}>{value || "Ikke registrert"}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.panel, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, borderRadius: radius.sm, padding: 14, marginBottom: 10 },
  season: { color: colors.ink, fontFamily: "Georgia", fontSize: 24, fontWeight: "700", marginBottom: 10 },
  podium: { flexDirection: "row", gap: 10, alignItems: "flex-start", paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  mark: { width: 18, color: colors.live, fontFamily: "Georgia", fontSize: 18, fontWeight: "700" },
  extra: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 8 },
});
