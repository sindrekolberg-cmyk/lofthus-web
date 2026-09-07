import { StyleSheet, Text, View } from "react-native";
import type { HallPayload } from "@/lib/types";
import { groupBySeason } from "@/lib/hall";
import { colors, radius } from "@/lib/theme";
import { hallStyles } from "./hallStyles";

export function HallMonthlyHistory({ data }: { data: HallPayload }) {
  const groups = groupBySeason(data.monthly || []);
  return (
    <View>
      {groups.map((group) => (
        <View key={group.season} style={styles.seasonBlock}>
          <Text style={styles.season}>{group.season}</Text>
          {group.rows.map((row) => (
            <View key={`${row.season}-${row.month}`} style={styles.month}>
              <Text style={styles.monthName}>{row.month}</Text>
              <Line label="Månedsseier" value={row.winner} />
              <Line label="Månedssølv" value={row.runner_up} />
              <Line label="Månedsbronse" value={row.third} />
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

function Line({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.line}>
      <Text style={styles.place}>{label}</Text>
      <Text style={hallStyles.ink}>{value || "Ikke registrert"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  seasonBlock: { marginBottom: 18 },
  season: { color: colors.ink, fontFamily: "Georgia", fontSize: 24, fontWeight: "700", marginBottom: 8 },
  month: { backgroundColor: colors.panel, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, borderRadius: radius.sm, padding: 12, marginBottom: 8 },
  monthName: { color: colors.ink, fontSize: 16, fontWeight: "800", marginBottom: 6 },
  line: { paddingVertical: 6, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  place: { color: colors.muted, fontSize: 10, fontWeight: "800", letterSpacing: 0.7, textTransform: "uppercase", marginBottom: 2 },
});
