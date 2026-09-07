import { Tabs } from "expo-router";
import { Text } from "react-native";
import { colors } from "@/lib/theme";

const icon = (value: string, active: boolean) => <Text style={{ fontSize: 20, color: active ? colors.live : colors.muted }}>{value}</Text>;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.live,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.panel, borderTopColor: colors.line, height: 84, paddingTop: 8, paddingBottom: 20 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Forside", tabBarIcon: ({ focused }) => icon("⌂", focused) }} />
      <Tabs.Screen name="liga" options={{ title: "Liga", tabBarIcon: ({ focused }) => icon("≡", focused) }} />
      <Tabs.Screen name="hall-of-fame" options={{ title: "Hall of Fame", tabBarIcon: ({ focused }) => icon("★", focused) }} />
      <Tabs.Screen name="analyse" options={{ title: "Analyse", tabBarIcon: ({ focused }) => icon("⌕", focused) }} />
    </Tabs>
  );
}
