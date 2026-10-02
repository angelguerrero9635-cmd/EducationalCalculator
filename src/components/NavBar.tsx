import { router, type NativeStackHeaderProps } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HEADER_ACTIONS_WIDTH, HeaderActions } from '@/components/HeaderActions';
import { Logo } from '@/components/Logo';
import { Text } from '@/components/Text';
import { parentOf, screenTitle } from '@/data/selectors';
import { font, space, usePalette } from '@/theme';

/** Lesson pages: their title is the first thing on the page, so the bar doesn't repeat it. */
const UNTITLED = new Set(['skill/[id]', 'course/[id]/topic/[index]', 'gallery/[id]']);

/**
 * Navigation bar for every stacked page: a back button, the $U logo in the middle with the page's
 * name under it (not on lesson pages), and Home, Search and the lessons menu. Back returns to the previous page; with no history (opened from a link or a
 * reload) it goes one level up instead, e.g. from a skill to its grade.
 */
export function NavBar({ navigation, route, options, back }: NativeStackHeaderProps) {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const modal = options.presentation === 'modal';
  const hasHistory = !!back && navigation.canGoBack();
  const params = (route.params ?? {}) as Record<string, unknown>;
  // The route's own name first (known before the page renders, so it's right in pre-rendered
  // HTML), then the screen's title option.
  const untitled = UNTITLED.has(route.name);
  const title =
    screenTitle(route.name, params) ??
    (typeof options.title === 'string' ? options.title : route.name);
  const parent = parentOf(route.name, params);
  // A route group's name ("(tabs)") is not a page name: the page before is a tab.
  const backTitle = back?.title && !back.title.startsWith('(') ? back.title : 'Back';
  const backLabel = modal ? 'Close' : hasHistory ? backTitle : parent.label;

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
          {modal ? null : <Text style={[styles.chevron, { color: c.accent }]}>‹</Text>}
          <Text style={[styles.backLabel, { color: c.accent }]} numberOfLines={1}>
            {backLabel}
          </Text>
        </Pressable>
        <View style={styles.middle}>
          <Logo size={untitled ? 28 : 22} />
          {untitled ? null : (
            <Text
              accessibilityRole="header"
              style={[styles.title, { color: c.textMuted }]}
              numberOfLines={1}
            >
              {title}
            </Text>
          )}
        </View>
        {/* Home, Search and the lessons menu. */}
        <View style={styles.side}>{modal ? null : <HeaderActions />}</View>
      </View>
    </View>
  );
}

/** Both sides are as wide as the buttons on the right, so the logo sits in the middle. */
const SIDE = HEADER_ACTIONS_WIDTH;

const styles = StyleSheet.create({
  bar: { borderBottomWidth: StyleSheet.hairlineWidth },
  row: {
    minHeight: 52,
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
  backLabel: { flexShrink: 1, fontSize: font.body, fontWeight: '500' },
  middle: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 1, paddingVertical: 4 },
  title: { maxWidth: '100%', textAlign: 'center', fontSize: font.caption, fontWeight: '600' },
  side: { width: SIDE, alignItems: 'flex-end' },
});
