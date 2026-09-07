import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { clubBadge } from "@/lib/format";
import { crestUri } from "@/lib/clubCrests";
import { colors } from "@/lib/theme";

export function ClubCrest({
  badge,
  code,
  short,
  name,
  size = 28,
}: {
  badge?: string;
  code?: number;
  short: string;
  name?: string;
  size?: number;
}) {
  const uri = crestUri({ badge, code, short });
  const [failed, setFailed] = useState(false);
  if (uri && !failed) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size }}
        resizeMode="contain"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.fallbackText, { fontSize: size < 26 ? 7 : 8 }]}>{clubBadge(short, name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { backgroundColor: colors.player, borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center" },
  fallbackText: { color: colors.ink, fontWeight: "900" },
});
