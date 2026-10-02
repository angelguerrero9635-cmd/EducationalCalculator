import { router, usePathname } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { usePalette } from '@/theme';

import { Icon } from './Icon';
import { MenuButton } from './SideMenu';

/** The phone header's buttons, right side: Search and the lessons menu. */
export function HeaderActions() {
  const c = usePalette();
  const pathname = usePathname();
  return (
    <View style={styles.row}>
      {/* The page you're on doesn't need a button to itself. */}
      {pathname === '/search' ? null : (
        <Pressable
          testID="nav-search"
          accessibilityRole="button"
          accessibilityLabel="Search"
          onPress={() => router.navigate('/search')}
          hitSlop={4}
          style={({ pressed }) => [styles.button, { opacity: pressed ? 0.5 : 1 }]}
        >
          <Icon name="search" color={c.text} size={22} />
        </Pressable>
      )}
      <MenuButton />
    </View>
  );
}

/** How wide the buttons are at most (two 44 px targets), so the header can centre the logo. */
export const HEADER_ACTIONS_WIDTH = 96;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  button: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
