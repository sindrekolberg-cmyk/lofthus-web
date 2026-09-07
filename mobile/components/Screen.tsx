import type { ReactNode } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/lib/theme";

export function Screen({
  children,
  refreshing = false,
  onRefresh,
  title,
  kicker,
  flush = false,
}: {
  children: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  title?: string;
  kicker?: string;
  flush?: boolean;
}) {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={[styles.content, flush && styles.contentFlush]}
        refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.live} /> : undefined}
      >
        {kicker ? <Text style={[styles.kicker, flush && styles.flushText]}>{kicker}</Text> : null}
        {title ? <Text style={[styles.title, flush && styles.flushText]}>{title}</Text> : null}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  content: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 38 },
  contentFlush: { paddingHorizontal: 0, paddingTop: 0 },
  kicker: { color: colors.live, fontSize: 10, fontWeight: "900", letterSpacing: 1.5, textTransform: "uppercase", marginTop: 4 },
  title: { color: colors.ink, fontFamily: "Georgia", fontSize: 36, lineHeight: 40, fontWeight: "700", letterSpacing: -0.9, marginTop: 5, marginBottom: 18 },
  flushText: { marginHorizontal: 18 },
});
