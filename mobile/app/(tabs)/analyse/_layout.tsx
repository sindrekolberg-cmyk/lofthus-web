import { Stack } from "expo-router";
import { colors } from "@/lib/theme";

export default function AnalyseLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.paper },
        headerTintColor: colors.ink,
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.paper },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[tool]" options={{ title: "Analyse", headerBackTitle: "Tilbake" }} />
    </Stack>
  );
}
