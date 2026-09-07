import { StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { colors } from "@/lib/theme";

const tools = [
  ["Rivalradar", "Se hvem som faktisk tjener og taper på forskjellene mellom to lag."],
  ["Transferstrategi", "Kjøpsråd tilpasset hvor aggressivt du vil klatre i Lofthus eller OR."],
  ["Kaptein", "Se kapteinsvalg, effektivt eierskap og hvor armbåndet kan flytte ligaen."],
  ["Eierskap", "Finn hvem ligaen eier, benker og satser på."],
  ["Differensialer", "Spillere få i Lofthus sitter med, men som faktisk kan gjøre en forskjell."],
  ["Sjetonger", "Følg Wildcard, Free Hit, Bench Boost og Triple Captain."],
];

export default function AnalyseScreen() {
  return (
    <Screen kicker="Verktøy" title="Analyseverktøy">
      <Text style={styles.lead}>Velg verktøy. Samme Lofthus-data som på web, pakket for mobilen.</Text>
      <View style={styles.list}>
        {tools.map(([title, copy], index) => (
          <View key={title} style={[styles.row, index === 0 && styles.rowPrimary]}>
            <View style={styles.numberWrap}>
              <Text style={[styles.number, index === 0 && styles.numberPrimary]}>{String(index + 1).padStart(2, "0")}</Text>
            </View>
            <View style={styles.body}>
              <Text style={[styles.title, index === 0 && styles.titlePrimary]}>{title}</Text>
              <Text style={[styles.copy, index === 0 && styles.copyPrimary]}>{copy}</Text>
            </View>
            <Text style={[styles.arrow, index === 0 && styles.arrowPrimary]}>→</Text>
          </View>
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
});
