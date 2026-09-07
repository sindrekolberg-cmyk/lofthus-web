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
    <Screen kicker="Verktøy" title="Analyse">
      <Text style={styles.lead}>Mobilhuben er koblet på samme analysegrunnlag som web. Neste steg er å gjøre verktøyene fullt native, ett for ett.</Text>
      <View style={styles.list}>
        {tools.map(([title, copy], index) => (
          <View key={title} style={[styles.card, index === 0 && styles.cardPrimary]}>
            <Text style={[styles.title, index === 0 && styles.titlePrimary]}>{title}</Text>
            <Text style={[styles.copy, index === 0 && styles.copyPrimary]}>{copy}</Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  lead: { color: colors.muted, fontSize: 16, lineHeight: 23, marginBottom: 18 },
  list: { gap: 10 },
  card: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.line, borderRadius: 18, padding: 18 },
  cardPrimary: { backgroundColor: colors.dark, borderColor: colors.dark },
  title: { color: colors.ink, fontSize: 21, fontWeight: "800" },
  titlePrimary: { color: colors.white },
  copy: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 5 },
  copyPrimary: { color: "#C9C3B9" },
});
