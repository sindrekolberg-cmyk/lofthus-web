import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/lib/theme";

export function Section({ title, children, compact = false }: { title: string; children: ReactNode; compact?: boolean }) {
  return (
    <View style={[styles.section, compact && styles.compact]}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 26 },
  compact: { marginTop: 18 },
  title: { color: colors.muted, fontSize: 12, fontWeight: "800", letterSpacing: 1.25, textTransform: "uppercase", marginBottom: 9 },
});
