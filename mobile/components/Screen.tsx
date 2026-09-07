import type { ReactNode } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/lib/theme";

export function Screen({
  children,
  refreshing = false,
  onRefresh,
  title,
  kicker,
}: {
  children: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  title?: string;
  kicker?: string;
}) {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.live} /> : undefined}
      >
        {kicker ? <Text style={styles.kicker}>{kicker}</Text> : null}
        {title ? <Text style={styles.title}>{title}</Text> : null}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  content: { paddingHorizontal: 18, paddingBottom: 36 },
  kicker: { color: colors.live, fontSize: 12, fontWeight: "800", letterSpacing: 1.5, textTransform: "uppercase", marginTop: 8 },
  title: { color: colors.ink, fontSize: 38, lineHeight: 42, fontWeight: "800", letterSpacing: -1.2, marginTop: 6, marginBottom: 16 },
});
