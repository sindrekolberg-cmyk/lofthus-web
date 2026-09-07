import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/lib/theme";

export function HomeHeader() {
  return (
    <View style={styles.wrap}>
      <View>
        <Text style={styles.logo}>LOFTHUS</Text>
        <Text style={styles.sub}>ROAD OPEN</Text>
      </View>
      <View style={styles.tagline}>
        <Text style={styles.tag}>MER ENN</Text>
        <Text style={styles.tag}>ET FANTASYSPILL</Text>
        <View style={styles.rule} />
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  logo: { color: colors.ink, fontSize: 27, fontWeight: "900", letterSpacing: 5.4, lineHeight: 29 },
  sub: { color: colors.muted, fontSize: 10, fontWeight: "500", letterSpacing: 4.2, marginTop: 1 },
  tagline: { alignItems: "flex-start", paddingBottom: 1 },
  tag: { color: colors.muted, fontSize: 7, lineHeight: 10, fontWeight: "800", letterSpacing: 1.9 },
  rule: { width: 28, height: 2, backgroundColor: colors.live, marginTop: 5 },
});
