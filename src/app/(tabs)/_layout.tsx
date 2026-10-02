import { BottomTabBar, Tabs } from 'expo-router/js-tabs';
import { View } from 'react-native';
import { Platform, type ColorValue } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { NavBar } from '@/components/NavBar';
import { webData } from '@/components/webData';
import { usePalette } from '@/theme';

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
      // Wide web screens use the sidebar instead of the tab bar (CSS, src/app/+html.tsx).
      tabBar={(props) => (
        <View {...webData({ shell: 'narrow' })}>
          <BottomTabBar {...props} />
        </View>
      )}
      screenOptions={{
        tabBarActiveTintColor: c.accent,
        tabBarInactiveTintColor: c.textMuted,
        tabBarStyle: {
          backgroundColor: c.card,
          borderTopColor: c.border,
          // On the web the bar is 48 px, too short for the icon and its label (the label's
          // bottom was cut off). Native bars size themselves around the safe area.
          ...(Platform.OS === 'web' ? { height: 60 } : {}),
        },
        tabBarLabelStyle: {
          fontSize: 12,
          lineHeight: 16,
          fontWeight: '600',
        },
        // One header for every page (src/components/NavBar.tsx): the logo, Search and the menu.
        header: (props) => <NavBar {...props} />,
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
