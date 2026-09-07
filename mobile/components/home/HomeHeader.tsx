import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/lib/theme";

export function HomeHeader() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.logo}>LOFTHUS</Text>
      <Text style={styles.sub}>ROAD OPEN</Text>
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
    justifyContent: "flex-end",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
  logo: { color: colors.ink, fontSize: 27, fontWeight: "900", letterSpacing: 5.4, lineHeight: 29 },
  sub: { color: colors.muted, fontSize: 10, fontWeight: "500", letterSpacing: 4.2, marginTop: 1 },
});
