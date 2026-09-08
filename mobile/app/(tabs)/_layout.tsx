import { Tabs } from "expo-router";
import { Text } from "react-native";
import { colors } from "@/lib/theme";

const icon = (value: string, active: boolean) => (
  <Text style={{ fontSize: 20, fontWeight: "900", color: active ? colors.live : colors.ink }}>{value}</Text>
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
          height: 74,
          paddingTop: 6,
          paddingBottom: 14,
        },
        tabBarItemStyle: { paddingTop: 1 },
        tabBarLabelStyle: { fontSize: 8, fontWeight: "800", letterSpacing: 0 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Hjem", tabBarIcon: ({ focused }) => icon("⌂", focused) }} />
      <Tabs.Screen name="intel" options={{ title: "Din liga", tabBarIcon: ({ focused }) => icon("◎", focused) }} />
      <Tabs.Screen name="liga" options={{ title: "Liga", tabBarIcon: ({ focused }) => icon("♜", focused) }} />
      <Tabs.Screen name="analyse" options={{ title: "Analyse", tabBarIcon: ({ focused }) => icon("▥", focused) }} />
      <Tabs.Screen name="hall-of-fame" options={{ title: "Hall of Fame", tabBarIcon: ({ focused }) => icon("★", focused) }} />
    </Tabs>
  );
}
