import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { colors } from "@/lib/theme";

const tools = [
  {
    href: "/analyse/transferstrategi",
    title: "Transferstrategi",
    copy: "Kjøpsråd basert på mål, risiko, fem kommende kamper, spillerdata, eierskap og posisjonen din i ligaen.",
  },
  {
    href: "/analyse/rivalradar",
    title: "Rivalradar",
    copy: "Sammenlign to managere og se hvilke spillere som skaper utslag mellom lagene.",
  },
  {
    href: "/analyse/ownership",
    title: "Eierskap",
    copy: "Sammenlign Lofthus med globalt FPL-eierskap og finn ligaens mest interessante differensialer.",
  },
  {
    href: "/analyse/kaptein",
    title: "Kaptein",
    copy: "Kapteinsvalg, effektivt eierskap og mulig utslag i ligaen.",
  },
] as const;

export default function AnalyseScreen() {
  return (
    <Screen kicker="Verktøy" title="Analyse">
      <Text style={styles.lead}>Analyseverktøy for beslutninger i ligaen.</Text>
      <View style={styles.list}>
        {tools.map((tool, index) => (
          <Link key={tool.href} href={tool.href} asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Åpne ${tool.title}`}
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