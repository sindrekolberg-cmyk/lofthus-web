import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import type { PopularPlayer } from "@/lib/types";
import { playerThumb } from "@/lib/clubCrests";
import { colors, radius } from "@/lib/theme";

export function TalkersRail({ players }: { players: PopularPlayer[] }) {
  const shown = players.slice(0, 8);
  if (!shown.length) return null;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.fire}>🔥</Text>
        <Text style={styles.title}>Spillerne alle snakker om</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
        {shown.map((player) => {
          const uri = playerThumb(player.image_url);
          return (
            <View key={player.element} style={styles.card}>
              {uri ? (
                <Image source={{ uri }} style={styles.image} resizeMode="cover" />
              ) : (
                <View style={styles.fallback}><Text style={styles.initial}>{player.player.slice(0, 1)}</Text></View>
              )}
              <View style={styles.copy}>
                <Text style={styles.name} numberOfLines={2}>{player.player}</Text>
                <Text style={styles.own}>{Math.round(player.ownership_pct)}% eierandel</Text>
                <Text style={[styles.pts, player.event_points < 0 && styles.down]}>{player.event_points > 0 ? "+" : ""}{player.event_points}</Text>
                <Text style={styles.round}>siste runde</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { backgroundColor: colors.panel, paddingTop: 8, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  header: { paddingHorizontal: 16, flexDirection: "row", alignItems: "center", gap: 6 },
  fire: { fontSize: 14 },
  title: { color: colors.ink, fontFamily: "Georgia", fontSize: 20, lineHeight: 24, fontWeight: "700" },
  rail: { paddingHorizontal: 16, paddingTop: 7, gap: 6 },
  card: { width: 132, minHeight: 86, backgroundColor: colors.white, borderRadius: radius.sm, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, overflow: "hidden", flexDirection: "row" },
  image: { width: 48, alignSelf: "stretch", backgroundColor: colors.player },
  fallback: { width: 48, alignSelf: "stretch", backgroundColor: colors.player, alignItems: "center", justifyContent: "center" },
  initial: { color: colors.ink, fontFamily: "Georgia", fontSize: 22, fontWeight: "700" },
  copy: { flex: 1, paddingHorizontal: 7, paddingVertical: 6 },
  name: { color: colors.ink, fontSize: 12, lineHeight: 14, fontWeight: "800" },
  own: { color: colors.muted, fontSize: 9, lineHeight: 12, marginTop: 3 },
  pts: { color: colors.green, fontSize: 15, lineHeight: 17, fontWeight: "900", marginTop: 4, fontVariant: ["tabular-nums"] },
  down: { color: colors.live },
  round: { color: colors.muted, fontSize: 8 },
});
