import { router, type NativeStackHeaderProps } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/Text';
import { parentOf, screenTitle } from '@/data/selectors';
import { font, space, usePalette } from '@/theme';

/**
 * Navigation bar for every stacked page: a back button and the page's name. Back returns to the
 * previous page; with no history (opened from a link or a reload) it goes one level up instead,
 * e.g. from a skill to its grade.
 */
export function NavBar({ navigation, route, options, back }: NativeStackHeaderProps) {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const modal = options.presentation === 'modal';
  const hasHistory = !!back && navigation.canGoBack();
  const params = (route.params ?? {}) as Record<string, unknown>;
  // The route's own name first (known before the page renders, so it's right in pre-rendered
  // HTML), then the screen's title option.
  const title =
    screenTitle(route.name, params) ??
    (typeof options.title === 'string' ? options.title : route.name);
  const parent = parentOf(route.name, params);
  const backLabel = modal ? 'Close' : hasHistory ? (back?.title ?? parent.label) : parent.label;

  const goBack = () => {
    if (hasHistory) navigation.goBack();
    else router.replace(parent.target as Parameters<typeof router.replace>[0]);
  };

  return (
    <View
      style={[
        styles.bar,
        {
          paddingTop: modal ? 0 : insets.top,
          backgroundColor: c.background,
          borderBottomColor: c.border,
        },
      ]}
    >
      <View style={styles.row}>
        <Pressable
          testID="nav-back"
          accessibilityRole="button"
          accessibilityLabel={modal ? 'Close' : `Back to ${backLabel}`}
          onPress={goBack}
          hitSlop={8}
          style={({ pressed }) => [styles.back, { opacity: pressed ? 0.5 : 1 }]}
        >
          {modal ? null : <Text style={[styles.chevron, { color: c.text }]}>‹</Text>}
          <Text style={[styles.backLabel, { color: c.text }]} numberOfLines={1}>
            {backLabel}
          </Text>
        </Pressable>
        <Text
          accessibilityRole="header"
          style={[styles.title, { color: c.text }]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {/* Balances the back button so the title stays centered. */}
        <View style={styles.side} />
      </View>
    </View>
  );
}

const SIDE = 96;

const styles = StyleSheet.create({
  bar: { borderBottomWidth: StyleSheet.hairlineWidth },
  row: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.sm,
  },
  back: {
    width: SIDE,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  chevron: { fontSize: 30, lineHeight: 32, marginTop: -3 },
  backLabel: { flexShrink: 1, fontSize: font.body },
  title: { flex: 1, textAlign: 'center', fontSize: font.body + 1, fontWeight: '600' },
  side: { width: SIDE },
});
