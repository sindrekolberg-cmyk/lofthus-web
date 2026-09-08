import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { colors } from "@/lib/theme";

const tools = [
  { href: "/analyse/rivalradar", title: "Rivalradar", copy: "Se hvem som faktisk tjener og taper på forskjellene mellom to lag." },
  { href: "/analyse/transferstrategi", title: "Transferstrategi", copy: "Kjøpsråd tilpasset hvor aggressivt du vil klatre i Lofthus eller OR." },
  { href: "/analyse/kaptein", title: "Kaptein", copy: "Se kapteinsvalg, effektivt eierskap og hvor armbåndet kan flytte ligaen." },
  { href: "/analyse/ownership", title: "Eierskap", copy: "Finn hvem ligaen eier, benker og satser på." },
  { href: "/analyse/differensialer", title: "Differensialer", copy: "Spillere få i Lofthus sitter med, men som faktisk kan gjøre en forskjell." },
  { href: "/analyse/chips", title: "Sjetonger", copy: "Følg Wildcard, Free Hit, Bench Boost og Triple Captain." },
] as const;

export default function AnalyseScreen() {
  return (
    <Screen kicker="Verktøy" title="Analyseverktøy">
      <Text style={styles.lead}>Velg verktøy. Samme Lofthus-data som på web, pakket for mobilen.</Text>
      <View style={styles.list}>
        {tools.map((tool, index) => (
          <Link key={tool.href} href={tool.href} asChild>
            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.row, index === 0 && styles.rowPrimary, pressed && styles.pressed]}
            >
              <View style={styles.numberWrap}>
                <Text style={[styles.number, index === 0 && styles.numberPrimary]}>{String(index + 1).padStart(2, "0")}</Text>
              </View>
              <View style={styles.body}>
                <Text style={[styles.title, index === 0 && styles.titlePrimary]}>{tool.title}</Text>
                <Text style={[styles.copy, index === 0 && styles.copyPrimary]}>{tool.copy}</Text>
              </View>
              <Text style={[styles.arrow, index === 0 && styles.arrowPrimary]}>→</Text>
            </Pressable>
          </Link>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  lead: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: -5, marginBottom: 18 },
  list: { borderTopWidth: 1, borderTopColor: colors.ink },
  row: { minHeight: 96, flexDirection: "row", alignItems: "center", gap: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line, paddingVertical: 14 },
  rowPrimary: { backgroundColor: colors.ink, marginHorizontal: -18, paddingHorizontal: 18, borderBottomColor: colors.ink },
  numberWrap: { width: 28 },
  number: { color: colors.live, fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  numberPrimary: { color: "#E79B87" },
  body: { flex: 1 },
  title: { color: colors.ink, fontFamily: "Georgia", fontSize: 21, lineHeight: 25, fontWeight: "700" },
  titlePrimary: { color: colors.white },
  copy: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 4 },
  copyPrimary: { color: "#CFC9C0" },
  arrow: { color: colors.muted, fontSize: 20 },
  arrowPrimary: { color: colors.white },
  pressed: { opacity: 0.62 },
});
