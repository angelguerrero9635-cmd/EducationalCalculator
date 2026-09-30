import { router, usePathname } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { usePalette } from '@/theme';

import { Icon, type IconName } from './Icon';
import { MenuButton } from './SideMenu';

/** The header's buttons, right side: Home, Search and the lessons menu. */
export function HeaderActions() {
  const c = usePalette();
  const pathname = usePathname();
  const button = (name: IconName, label: string, path: '/' | '/search') => {
    // The page you're on doesn't need a button to itself.
    if (pathname === path) return null;
    return (
      <Pressable
        testID={`nav-${name}`}
        accessibilityRole="button"
        accessibilityLabel={label}
        // Navigate, not push: going Home returns to the tab instead of stacking another copy.
        onPress={() => router.navigate(path)}
        hitSlop={4}
        style={({ pressed }) => [styles.button, { opacity: pressed ? 0.5 : 1 }]}
      >
        <Icon name={name} color={c.accent} size={22} />
      </Pressable>
    );
  };
  return (
    <View style={styles.row}>
      {button('home', 'Home', '/')}
      {button('search', 'Search', '/search')}
      <MenuButton />
    </View>
  );
}

/** How wide the buttons are at most (three 40 px targets), so a header can balance its title. */
export const HEADER_ACTIONS_WIDTH = 124;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  button: { minWidth: 40, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});
