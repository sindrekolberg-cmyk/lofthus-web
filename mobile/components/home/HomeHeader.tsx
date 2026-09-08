import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/lib/theme";

export function HomeHeader() {
  const router = useRouter();

  return (
    <View style={styles.wrap}>
      <View>
        <Text style={styles.logo}>LOFTHUS</Text>
        <Text style={styles.sub}>ROAD OPEN</Text>
      </View>
      <Pressable
        accessibilityLabel="Varsler"
        accessibilityRole="button"
        hitSlop={10}
        onPress={() => router.push("/notifications")}
        style={({ pressed }) => [styles.bell, pressed && styles.pressed]}
      >
        <Ionicons name="notifications-outline" size={22} color={colors.ink} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 78,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: colors.panel,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  logo: { color: colors.ink, fontSize: 27, fontWeight: "900", letterSpacing: 5.4, lineHeight: 29 },
  sub: { color: colors.muted, fontSize: 10, fontWeight: "500", letterSpacing: 4.2, marginTop: 1 },
  bell: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.paper,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.line,
  },
  pressed: { opacity: 0.56 },
});
