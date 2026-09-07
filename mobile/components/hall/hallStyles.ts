import { StyleSheet } from "react-native";
import { colors, radius } from "@/lib/theme";

export const hallStyles = StyleSheet.create({
  lead: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: -2, marginBottom: 16 },
  sectionTitle: { color: colors.ink, fontFamily: "Georgia", fontSize: 26, lineHeight: 30, fontWeight: "700", marginTop: 26, marginBottom: 10 },
  label: { color: colors.muted, fontSize: 9, fontWeight: "900", letterSpacing: 1.2, textTransform: "uppercase" },
  card: { backgroundColor: colors.panel, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, borderRadius: radius.sm, padding: 14 },
  row: { minHeight: 48, flexDirection: "row", alignItems: "center", borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  muted: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  ink: { color: colors.ink, fontSize: 14, fontWeight: "700" },
  serif: { color: colors.ink, fontFamily: "Georgia", fontSize: 20, lineHeight: 24, fontWeight: "700" },
  pressed: { opacity: 0.58 },
  empty: { color: colors.muted, fontSize: 13, marginTop: 8 },
});
