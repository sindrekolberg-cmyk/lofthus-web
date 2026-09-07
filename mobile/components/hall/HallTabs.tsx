import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { HALL_TABS, type HallTab } from "@/lib/hall";
import { colors, radius } from "@/lib/theme";

export function HallTabs({ value, onChange }: { value: HallTab; onChange: (tab: HallTab) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {HALL_TABS.map((tab) => (
        <Pressable
          key={tab.id}
          onPress={() => onChange(tab.id)}
          style={({ pressed }) => [styles.chip, value === tab.id && styles.active, pressed && styles.pressed]}
        >
          <Text style={[styles.label, value === tab.id && styles.activeLabel]}>{tab.label}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingBottom: 4 },
  chip: { minHeight: 36, justifyContent: "center", paddingHorizontal: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.panel, borderRadius: radius.sm },
  active: { backgroundColor: colors.ink, borderColor: colors.ink },
  label: { color: colors.muted, fontSize: 11, fontWeight: "800" },
  activeLabel: { color: colors.white },
  pressed: { opacity: 0.58 },
});
