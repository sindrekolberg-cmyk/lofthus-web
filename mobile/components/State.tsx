import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors } from "@/lib/theme";

export function Loading({ label = "Henter Lofthus …" }: { label?: string }) {
  return <View style={styles.row}><ActivityIndicator color={colors.live} /><Text style={styles.text}>{label}</Text></View>;
}

export function ErrorState({ message }: { message: string }) {
  return <View style={styles.error}><Text style={styles.errorTitle}>Dataene tok en pause</Text><Text style={styles.text}>{message}</Text></View>;
}

const styles = StyleSheet.create({
  row: { paddingVertical: 30, flexDirection: "row", gap: 10, alignItems: "center" },
  text: { color: colors.muted, fontSize: 14 },
  error: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.panel, padding: 16, borderRadius: 14, marginVertical: 16 },
  errorTitle: { color: colors.ink, fontSize: 16, fontWeight: "700", marginBottom: 4 },
});
