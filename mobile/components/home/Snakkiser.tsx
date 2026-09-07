import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useRouter } from "expo-router";
import type { Story } from "@/lib/types";
import { colors } from "@/lib/theme";

const ICONS: Record<string, string> = {
  captain: "♟",
  kaptein: "♟",
  chip: "★",
  autosub: "↻",
  bench: "↻",
  benk: "↻",
  differential: "◆",
  unique: "◆",
  live: "●",
  ownership: "●",
};

export function Snakkiser({ stories }: { stories: Story[] }) {
  const { width } = useWindowDimensions();
  const sideQuote = width >= 370;
  const rows = stories.slice(0, 4);

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Snakkiser</Text>
      <View style={[styles.grid, !sideQuote && styles.gridStack]}>
        <View style={styles.list}>
          {rows.length ? rows.map((story) => (
            <StoryRow key={story.key} story={story} />
          )) : <Text style={styles.empty}>Ingen sterke historier akkurat nå.</Text>}
        </View>
        <View style={[styles.quote, sideQuote ? styles.quoteSide : styles.quoteBelow]}>
          <Text style={styles.quoteText}>“Samme galskap hver runde. Det er derfor vi elsker dette.”</Text>
          <View style={styles.quoteRule} />
          <Text style={styles.brand}>LOFTHUS</Text>
          <Text style={styles.brandSub}>ROAD OPEN</Text>
        </View>
      </View>
    </View>
  );
}

function StoryRow({ story }: { story: Story }) {
  const router = useRouter();
  const icon = ICONS[(story.category || "").toLowerCase()] || "●";
  const body = (
    <>
      <Text style={styles.icon}>{icon}</Text>
      <View style={styles.copy}>
        <Text style={styles.headline}>{story.headline}</Text>
        {story.meta ? <Text style={styles.meta}>{story.meta}</Text> : null}
      </View>
    </>
  );
  if (!story.manager_entry) return <View style={styles.row}>{body}</View>;
  return (
    <Pressable onPress={() => router.push(`/manager/${story.manager_entry}`)} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: { backgroundColor: colors.panel, paddingTop: 8, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  title: { paddingHorizontal: 16, color: colors.ink, fontFamily: "Georgia", fontSize: 22, lineHeight: 26, fontWeight: "700" },
  grid: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingTop: 6 },
  gridStack: { flexDirection: "column" },
  list: { flex: 1.55, minWidth: 0, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  row: { minHeight: 42, flexDirection: "row", alignItems: "flex-start", gap: 6, paddingVertical: 7, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  icon: { width: 16, color: colors.live, fontSize: 13, fontWeight: "900", textAlign: "center", marginTop: 1 },
  copy: { flex: 1, minWidth: 0 },
  headline: { color: colors.ink, fontFamily: "Georgia", fontSize: 13, lineHeight: 16, fontWeight: "700" },
  meta: { color: colors.muted, fontSize: 10, lineHeight: 13, marginTop: 2 },
  quote: { backgroundColor: colors.peach, paddingHorizontal: 10, paddingVertical: 10, justifyContent: "center" },
  quoteSide: { flex: 0.72, minWidth: 108 },
  quoteBelow: { minHeight: 72 },
  quoteText: { color: colors.ink, fontFamily: "Georgia", fontStyle: "italic", fontSize: 12, lineHeight: 16 },
  quoteRule: { width: 28, height: 2, backgroundColor: colors.live, marginTop: 10, marginBottom: 6 },
  brand: { color: colors.ink, fontSize: 8, fontWeight: "900", letterSpacing: 2 },
  brandSub: { color: colors.muted, fontSize: 6, fontWeight: "700", letterSpacing: 1.4, marginTop: 1 },
  empty: { color: colors.muted, fontSize: 12, paddingVertical: 10 },
  pressed: { opacity: 0.58 },
});
