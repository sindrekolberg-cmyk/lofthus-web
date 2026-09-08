import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/lib/theme";
import { useProfile } from "@/lib/profile";

export function HomeHeader() {
  const router = useRouter();
  const { profile } = useProfile();

  return (
    <View style={styles.wrap}>
      <View style={styles.brand}>
        <Text style={styles.logo}>LOFTHUS</Text>
        <Text style={styles.sub} numberOfLines={1}>{profile.leagueName || "ROAD OPEN"}</Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          accessibilityLabel="Min liga og profil"
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => router.push("/profile")}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
        >
          <Ionicons name="person-circle-outline" size={23} color={colors.ink} />
        </Pressable>
        <Pressable
          accessibilityLabel="Varsler"
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => router.push("/notifications")}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
        >
          <Ionicons name="notifications-outline" size={22} color={colors.ink} />
        </Pressable>
      </View>
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
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  brand: { flex: 1, minWidth: 0 },
  logo: { color: colors.ink, fontSize: 27, fontWeight: "900", letterSpacing: 5.4, lineHeight: 29 },
  sub: { color: colors.muted, fontSize: 9, fontWeight: "600", letterSpacing: 1.3, marginTop: 2, textTransform: "uppercase" },
  actions: { flexDirection: "row", gap: 7 },
  iconButton: {
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
