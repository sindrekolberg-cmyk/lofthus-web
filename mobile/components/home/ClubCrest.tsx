import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { clubBadge } from "@/lib/format";
import { crestUri, plBadgeUrl } from "@/lib/clubCrests";
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
  const candidates = [badge, crestUri({ code, short }), code ? plBadgeUrl(code) : ""].filter(
    (uri, index, all): uri is string => Boolean(uri) && all.indexOf(uri) === index,
  );
  const [index, setIndex] = useState(0);
  const uri = candidates[index];
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size }}
        resizeMode="contain"
        onError={() => setIndex((current) => current + 1)}
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
