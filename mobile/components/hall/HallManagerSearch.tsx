import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { HallRow } from "@/lib/types";
import { colors, radius } from "@/lib/theme";
import { hallStyles } from "./hallStyles";

export function HallManagerSearch({
  query,
  onQuery,
  matches,
  selected,
  onSelect,
  onClear,
  onRandom,
}: {
  query: string;
  onQuery: (value: string) => void;
  matches: HallRow[];
  selected: HallRow | null;
  onSelect: (row: HallRow) => void;
  onClear: () => void;
  onRandom: () => void;
}) {
  return (
    <View>
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={onQuery}
          placeholder="Søk etter manager"
          placeholderTextColor={colors.muted}
          autoCorrect={false}
          autoCapitalize="none"
          style={styles.input}
        />
        {selected || query ? (
          <Pressable onPress={onClear} hitSlop={8} style={({ pressed }) => pressed && hallStyles.pressed}>
            <Ionicons name="close-circle" size={18} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>
      <Pressable onPress={onRandom} style={({ pressed }) => [styles.random, pressed && hallStyles.pressed]}>
        <Text style={styles.randomText}>Tilfeldig manager</Text>
      </Pressable>
      {query.trim() && !selected ? (
        matches.length ? (
          <View style={styles.matches}>
            {matches.map((row) => (
              <Pressable key={row.manager} onPress={() => onSelect(row)} style={({ pressed }) => [styles.match, pressed && hallStyles.pressed]}>
                <Text style={hallStyles.ink}>{row.manager}</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <Text style={hallStyles.empty}>Ingen manager funnet.</Text>
        )
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  searchWrap: { minHeight: 48, flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.panel, borderRadius: radius.sm, paddingHorizontal: 12 },
  input: { flex: 1, color: colors.ink, fontSize: 16, paddingVertical: 10 },
  random: { alignSelf: "flex-start", marginTop: 10, minHeight: 34, justifyContent: "center", paddingHorizontal: 12, borderWidth: 1, borderColor: colors.line, borderRadius: radius.sm, backgroundColor: colors.panel },
  randomText: { color: colors.ink, fontSize: 11, fontWeight: "800", letterSpacing: 0.8, textTransform: "uppercase" },
  matches: { marginTop: 8, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, backgroundColor: colors.panel, borderRadius: radius.sm, overflow: "hidden" },
  match: { minHeight: 44, justifyContent: "center", paddingHorizontal: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
});
