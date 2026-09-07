import { StyleSheet, View } from "react-native";
import type { HallPayload } from "@/lib/types";
import { newestSeasonFirst } from "@/lib/format";
import { HallCupTitle } from "./HallCupTitle";

export function HallCupHistory({ data }: { data: HallPayload }) {
  const rows = [...(data.cup || [])].sort((a, b) => newestSeasonFirst(a.season, b.season));
  return (
    <View style={styles.list}>
      {rows.map((row) => (
        <HallCupTitle key={row.season} cup={row} season={row.season} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
});
