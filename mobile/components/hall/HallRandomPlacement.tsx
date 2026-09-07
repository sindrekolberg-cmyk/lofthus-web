import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { HallRandom } from "@/lib/types";
import { documentedPlacements } from "@/lib/hall";
import { colors, radius } from "@/lib/theme";
import { hallStyles } from "./hallStyles";

function pick(rows: HallRandom[], avoid?: HallRandom) {
  if (!rows.length) return null;
  if (rows.length === 1) return rows[0];
  const pool = avoid ? rows.filter((row) => row !== avoid) : rows;
  return pool[Math.floor(Math.random() * pool.length)] || rows[0];
}

export function HallRandomPlacement({ random }: { random?: HallRandom[] }) {
  const pool = useMemo(() => documentedPlacements(random), [random]);
  const [current, setCurrent] = useState<HallRandom | null>(() => pick(pool));

  if (!pool.length) {
    return (
      <View style={styles.card}>
        <Text style={hallStyles.serif}>Historisk plassering</Text>
        <Text style={[hallStyles.muted, styles.copy]}>
          Funksjonen er utilgjengelig inntil mer komplette historiske plasseringer er registrert. Vi viser bare dokumenterte plasseringer, ikke gjettede tabeller.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Ionicons name="dice-outline" size={22} color={colors.live} />
      <Text style={styles.place}>{current?.placement}</Text>
      <Text style={hallStyles.serif}>{current?.winner}</Text>
      <Text style={hallStyles.muted}>{current?.season}</Text>
      <Pressable onPress={() => setCurrent(pick(pool, current || undefined))} style={({ pressed }) => [styles.button, pressed && hallStyles.pressed]}>
        <Text style={styles.buttonText}>Generer ny plassering</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.panel, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.line, borderRadius: radius.sm, padding: 18, minHeight: 180 },
  copy: { marginTop: 10 },
  place: { color: colors.ink, fontFamily: "Georgia", fontSize: 34, lineHeight: 38, fontWeight: "700", marginTop: 10, marginBottom: 8 },
  button: { marginTop: 18, alignSelf: "flex-start", minHeight: 42, justifyContent: "center", paddingHorizontal: 14, backgroundColor: colors.ink, borderRadius: radius.sm },
  buttonText: { color: colors.white, fontSize: 11, fontWeight: "900", letterSpacing: 1, textTransform: "uppercase" },
});
