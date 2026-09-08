import "@/lib/notifications";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors } from "@/lib/theme";
import { ProfileProvider } from "@/lib/profile";

export default function RootLayout() {
  return (
    <ProfileProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.paper },
          headerTintColor: colors.ink,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.paper },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ title: "Min liga", headerBackTitle: "Tilbake" }} />
        <Stack.Screen name="notifications" options={{ title: "Varsler", headerBackTitle: "Tilbake" }} />
        <Stack.Screen name="manager/[id]" options={{ title: "Manager", headerBackTitle: "Tilbake" }} />
        <Stack.Screen name="player/[id]" options={{ title: "Spiller", headerBackTitle: "Tilbake" }} />
        <Stack.Screen name="match/[id]" options={{ title: "Kamp", headerBackTitle: "Tilbake" }} />
      </Stack>
    </ProfileProvider>
  );
}
