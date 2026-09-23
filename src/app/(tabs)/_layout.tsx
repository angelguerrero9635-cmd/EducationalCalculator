import { Tabs } from 'expo-router/js-tabs';
import { View, type ColorValue } from 'react-native';

import { usePalette } from '@/theme';

/** Wireframe tab icon: an outlined square in the tab's tint color. */
function TabIcon({ color, focused }: { color: ColorValue; focused: boolean }) {
  return (
    <View
      style={{
        width: 22,
        height: 22,
        borderRadius: 5,
        borderWidth: 1.5,
        borderColor: color,
        backgroundColor: focused ? color : 'transparent',
      }}
    />
  );
}

export default function TabsLayout() {
  const c = usePalette();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: c.text,
        tabBarInactiveTintColor: c.textMuted,
        tabBarIcon: TabIcon,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="browse" options={{ title: 'Browse' }} />
      <Tabs.Screen name="search" options={{ title: 'Search' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
