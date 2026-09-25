import { Tabs } from 'expo-router/js-tabs';
import type { ColorValue } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { font, usePalette } from '@/theme';

/** A tab's icon: outlined, and filled (or bolder) when it is the open tab. */
function tabIcon(name: IconName) {
  function TabIcon({ color, focused }: { color: ColorValue; focused: boolean }) {
    return <Icon name={name} color={String(color)} filled={focused} size={24} />;
  }
  return TabIcon;
}

export default function TabsLayout() {
  const c = usePalette();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: c.accent,
        tabBarInactiveTintColor: c.textMuted,
        tabBarStyle: { backgroundColor: c.card, borderTopColor: c.border },
        tabBarLabelStyle: { fontSize: font.caption - 1, fontWeight: '600' },
        headerStyle: { backgroundColor: c.background },
        headerShadowVisible: false,
        headerTitleStyle: { fontSize: font.body + 1, fontWeight: '700', color: c.text },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: tabIcon('home') }} />
      <Tabs.Screen name="browse" options={{ title: 'Browse', tabBarIcon: tabIcon('browse') }} />
      <Tabs.Screen name="search" options={{ title: 'Search', tabBarIcon: tabIcon('search') }} />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Settings', tabBarIcon: tabIcon('settings') }}
      />
    </Tabs>
  );
}
