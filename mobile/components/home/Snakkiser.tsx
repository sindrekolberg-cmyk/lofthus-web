import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import type { Story } from "@/lib/types";
import { colors } from "@/lib/theme";

const TAGS: Record<string, { label: string; icon: string }> = {
  captain: { label: "Kaptein", icon: "♟" },
  chip: { label: "Chip", icon: "★" },
  table: { label: "Tabell", icon: "⇅" },
  leader: { label: "Tabell", icon: "⇅" },
  momentum: { label: "Form", icon: "⇗" },
  autosub: { label: "Benk", icon: "↻" },
  bench: { label: "Benk", icon: "↻" },
  differential: { label: "Differensial", icon: "◆" },
  unique: { label: "Unik", icon: "◆" },
  live: { label: "Runden", icon: "●" },
  month: { label: "Måned", icon: "▦" },
};

export function Snakkiser({ stories }: { stories: Story[] }) {
  const rows = stories.slice(0, 5);

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Snakkiser</Text>
      <View style={styles.list}>
        {rows.length ? (
          rows.map((story) => <StoryRow key={story.key} story={story} />)
        ) : (
          <Text style={styles.empty}>Ingen sterke historier akkurat nå.</Text>
        )}
      </View>
    </View>
  );
}

function StoryRow({ story }: { story: Story }) {
  const router = useRouter();
  const tag = TAGS[(story.category || "").toLowerCase()] || { label: "Runden", icon: "●" };
  const body = (
    <>
      <View style={styles.tagWrap}>
        <Text style={styles.icon}>{tag.icon}</Text>
        <Text style={styles.tag}>{tag.label.toUpperCase()}</Text>
      </View>
      <Text style={styles.headline}>{story.headline}</Text>
      {story.meta ? <Text style={styles.meta}>{story.meta}</Text> : null}
    </>
  );
  if (!story.manager_entry) return <View style={styles.row}>{body}</View>;
  return (
    <Pressable
      onPress={() => router.push(`/manager/${story.manager_entry}`)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: { backgroundColor: colors.panel, paddingTop: 8, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  title: { paddingHorizontal: 16, color: colors.ink, fontFamily: "Georgia", fontSize: 22, lineHeight: 26, fontWeight: "700" },
  list: { marginTop: 6, marginHorizontal: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line },
  row: { paddingVertical: 9, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  tagWrap: { flexDirection: "row", alignItems: "center", gap: 5 },
  icon: { color: colors.live, fontSize: 10, fontWeight: "900" },
  tag: { color: colors.live, fontSize: 7.5, fontWeight: "900", letterSpacing: 1.1 },
  headline: { color: colors.ink, fontFamily: "Georgia", fontSize: 15, lineHeight: 19, fontWeight: "700", marginTop: 3 },
  meta: { color: colors.muted, fontSize: 11, lineHeight: 15, marginTop: 2 },
  empty: { color: colors.muted, fontSize: 12, paddingVertical: 10 },
  pressed: { opacity: 0.58 },
});
