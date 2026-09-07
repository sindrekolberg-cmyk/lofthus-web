import { Pressable, StyleSheet, Text, View } from "react-native";
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
  leader: "●",
  month: "●",
};

export function Snakkiser({ stories }: { stories: Story[] }) {
  const rows = stories.slice(0, 5);

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Snakkiser</Text>
      <View style={styles.list}>
        {rows.length ? rows.map((story) => (
          <StoryRow key={story.key} story={story} />
        )) : <Text style={styles.empty}>Ingen sterke historier akkurat nå.</Text>}
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
  section: {
    backgroundColor: colors.panel,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  title: {
    paddingHorizontal: 16,
    color: colors.ink,
    fontFamily: "Georgia",
    fontSize: 22,
    lineHeight: 26,
    fontWeight: "700",
  },
  list: {
    marginHorizontal: 16,
    marginTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
  },
  row: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  icon: {
    width: 18,
    color: colors.live,
    fontSize: 14,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 1,
  },
  copy: { flex: 1, minWidth: 0 },
  headline: {
    color: colors.ink,
    fontFamily: "Georgia",
    fontSize: 14,
    lineHeight: 17,
    fontWeight: "700",
  },
  meta: {
    color: colors.muted,
    fontSize: 10.5,
    lineHeight: 14,
    marginTop: 2,
  },
  empty: { color: colors.muted, fontSize: 12, paddingVertical: 10 },
  pressed: { opacity: 0.58 },
});
