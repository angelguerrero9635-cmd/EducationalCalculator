import { router } from 'expo-router';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HEADER_ACTIONS_WIDTH, HeaderActions } from '@/components/HeaderActions';
import { Icon } from '@/components/Icon';
import { useLayoutSize } from '@/components/layoutSize';
import { Logo } from '@/components/Logo';
import { TopBar } from '@/components/shell/TopBar';
import { Text } from '@/components/Text';
import { webData } from '@/components/webData';
import { parentOf, screenTitle, trailOf } from '@/data/selectors';
import { layout, space, type, usePalette } from '@/theme';

/** What a header needs from either navigator (stack or tabs). */
export interface HeaderProps {
  navigation: { canGoBack(): boolean; goBack(): void };
  route: { name: string; params?: object };
  options: { title?: string; presentation?: string };
  /** Stack screens with a page before them; absent on tab roots. */
  back?: { title?: string };
}

/** Tab roots: no back button, the logo alone. */
const TAB_ROOTS = new Set(['index', 'browse', 'search', 'settings']);
/** The back label's longest form before it is shortened. */
const BACK_MAX = 14;

/**
 * The header of every page. Phone and tablet: back (to the parent page, by name), the $U logo
 * in the middle (it goes Home), Search and the lessons menu. Wide screens: the top bar with the
 * page's breadcrumbs and a search field (the sidebar holds the rest). On the web both are in
 * the page and CSS shows the one that fits, so pre-rendered pages are right before they hydrate.
 */
export function NavBar({ navigation, route, options, back }: HeaderProps) {
  const size = useLayoutSize();
  const params = (route.params ?? {}) as Record<string, unknown>;
  const trail = trailOf(route.name, params);
  // A dynamic page with an unknown id is the not-found page: its name matches the pre-rendered
  // 404 page, so the page hydrates without a mismatch.
  const title =
    screenTitle(route.name, params) ??
    (route.name.includes('[') || route.name === '+not-found'
      ? 'Not found'
      : typeof options.title === 'string'
        ? options.title
        : route.name);
  const wide = <TopBar trail={trail} title={title} />;
  const narrow = (
    <PhoneHeader navigation={navigation} route={route} options={options} back={back} />
  );
  if (Platform.OS !== 'web') return size === 'wide' ? wide : narrow;
  return (
    <>
      <View {...webData({ shell: 'narrow' })}>{narrow}</View>
      <View {...webData({ shell: 'wide' })}>{wide}</View>
    </>
  );
}

function PhoneHeader({ navigation, route, options, back }: HeaderProps) {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const modal = options.presentation === 'modal';
  const root = TAB_ROOTS.has(route.name);
  const hasHistory = !!back && navigation.canGoBack();
  const params = (route.params ?? {}) as Record<string, unknown>;
  const parent = parentOf(route.name, params);
  // Back is named for the page it goes to (never this page's own title).
  const label =
    parent.label.length > BACK_MAX ? `${parent.label.slice(0, BACK_MAX - 1)}…` : parent.label;

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
        <View style={styles.side}>
          {root ? null : modal ? (
            <Pressable
              testID="nav-back"
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={goBack}
              hitSlop={8}
              style={({ pressed }) => [styles.back, { opacity: pressed ? 0.5 : 1 }]}
            >
              <Icon name="close" size={22} color={c.text} />
            </Pressable>
          ) : (
            <Pressable
              testID="nav-back"
              accessibilityRole="button"
              accessibilityLabel={`Back to ${parent.label}`}
              onPress={goBack}
              hitSlop={8}
              style={({ pressed }) => [styles.back, { opacity: pressed ? 0.5 : 1 }]}
            >
              <Icon name="chevronLeft" size={22} color={c.accent} />
              <Text style={[type.callout, styles.backLabel, { color: c.accent }]} numberOfLines={1}>
                {label}
              </Text>
            </Pressable>
          )}
        </View>
        <Pressable
          testID="nav-logo"
          accessibilityRole="link"
          accessibilityLabel="One Dollar University, Home"
          onPress={() => router.navigate('/')}
          hitSlop={8}
        >
          <Logo size={52} />
        </Pressable>
        <View style={[styles.side, styles.right]}>{modal ? null : <HeaderActions />}</View>
      </View>
    </View>
  );
}

/** Each side's width, so the logo sits in the middle of the screen. */
const SIDE = 128;

const styles = StyleSheet.create({
  bar: { borderBottomWidth: StyleSheet.hairlineWidth },
  row: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.sm,
  },
  side: { width: SIDE, flexDirection: 'row', alignItems: 'center' },
  right: { justifyContent: 'flex-end', minWidth: HEADER_ACTIONS_WIDTH },
  back: { flexDirection: 'row', alignItems: 'center', minHeight: 44, maxWidth: SIDE, gap: 2 },
  backLabel: { flexShrink: 1, fontWeight: '500' },
});

/** The phone header's height without the safe area (for pages that lay out under it). */
export const HEADER_HEIGHT = 64;
export const TOP_BAR_HEIGHT = layout.topBar;
