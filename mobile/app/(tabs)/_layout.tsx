import { Tabs } from "expo-router";
import { Text } from "react-native";
import { colors } from "@/lib/theme";

const icon = (value: string, active: boolean) => (
  <Text style={{ fontSize: 18, fontWeight: "800", color: active ? colors.live : colors.muted }}>{value}</Text>
);

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.live,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.panel,
          borderTopColor: colors.line,
          borderTopWidth: 0.5,
          height: 82,
          paddingTop: 7,
          paddingBottom: 18,
        },
        tabBarItemStyle: { paddingTop: 2 },
        tabBarLabelStyle: { fontSize: 10, fontWeight: "800", letterSpacing: 0.1 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Forside", tabBarIcon: ({ focused }) => icon("⌂", focused) }} />
      <Tabs.Screen name="liga" options={{ title: "Liga", tabBarIcon: ({ focused }) => icon("≡", focused) }} />
      <Tabs.Screen name="hall-of-fame" options={{ title: "Hall of Fame", tabBarIcon: ({ focused }) => icon("★", focused) }} />
      <Tabs.Screen name="analyse" options={{ title: "Analyse", tabBarIcon: ({ focused }) => icon("⌕", focused) }} />
    </Tabs>
  );
}
