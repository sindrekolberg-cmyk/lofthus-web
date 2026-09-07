import { StyleSheet, Text, View } from "react-native";
import type { HallPayload } from "@/lib/types";
import { newestSeasonFirst } from "@/lib/format";
import { colors, radius } from "@/lib/theme";
import { hallStyles } from "./hallStyles";

export function HallCupHistory({ data }: { data: HallPayload }) {
  const rows = [...(data.cup || [])].sort((a, b) => newestSeasonFirst(a.season, b.season));
  return (
    <View>
      {rows.map((row) => (
        <View key={row.season} style={styles.card}>
          <Text style={styles.season}>{row.season}</Text>
          <Text style={hallStyles.label}>Cupvinner</Text>
          <Text style={hallStyles.serif}>{row.winner || "Ikke registrert"}</Text>
          {row.runner_up ? (
            <>
              <Text style={[hallStyles.label, styles.gap]}>Finalist</Text>
              <Text style={hallStyles.ink}>{row.runner_up}</Text>
            </>
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.panel, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, borderRadius: radius.sm, padding: 14, marginBottom: 10 },
  season: { color: colors.muted, fontSize: 12, fontWeight: "800", marginBottom: 8 },
  gap: { marginTop: 12 },
});
