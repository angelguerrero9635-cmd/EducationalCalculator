import { router, usePathname } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { Logo } from '@/components/Logo';
import { Text } from '@/components/Text';
import { webData } from '@/components/webData';
import { SITE_NAME } from '@/config/site';
import { myCourseCards } from '@/data/selectors';
import { routePath } from '@/data/menu';
import { push } from '@/navigation';
import { useSelectedLevels } from '@/state';
import { layout, radius, space, type, usePalette } from '@/theme';

const NAV: {
  label: string;
  icon: IconName;
  path: '/' | '/browse' | '/search' | '/settings' | '/paywall';
}[] = [
  { label: 'Home', icon: 'home', path: '/' },
  { label: 'Browse', icon: 'browse', path: '/browse' },
  { label: 'Search', icon: 'search', path: '/search' },
  { label: 'Settings', icon: 'settings', path: '/settings' },
  { label: 'Plans', icon: 'spark', path: '/paywall' },
];
/** The most courses the sidebar lists before "Edit". */
const COURSE_LIMIT = 8;

/**
 * The wide-screen sidebar (web at ≥ 1024 px, iPad landscape): the name and logo, the main
 * sections, and the courses the student picked. It replaces the tab bar and the phone header's
 * menu on wide screens.
 */
export function Sidebar() {
  const c = usePalette();
  const pathname = usePathname();
  const { levels } = useSelectedLevels();
  const courses = useMemo(() => myCourseCards(levels).slice(0, COURSE_LIMIT), [levels]);

  const item = (
    key: string,
    label: string,
    active: boolean,
    onPress: () => void,
    icon?: IconName,
  ) => (
    <Pressable
      key={key}
      accessibilityRole="link"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      {...webData({ hover: 'row' })}
      style={[styles.item, active && { backgroundColor: c.accentSoft }]}
    >
      {icon ? (
        <Icon name={icon} size={20} color={active ? c.accent : c.textMuted} filled={active} />
      ) : null}
      <Text
        style={[type.callout, styles.itemText, { color: active ? c.accent : c.text }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );

  return (
    <View
      {...webData({ shell: 'wide' })}
      style={[styles.bar, { backgroundColor: c.card, borderRightColor: c.border }]}
    >
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`${SITE_NAME}, Home`}
        onPress={() => router.navigate('/')}
        style={styles.brand}
      >
        <Logo size={32} />
        <Text style={[type.title3, styles.name, { color: c.text }]} numberOfLines={2}>
          {SITE_NAME}
        </Text>
      </Pressable>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.group}>
          {NAV.map((n) =>
            item(n.path, n.label, pathname === n.path, () => router.navigate(n.path), n.icon),
          )}
        </View>
        <View style={styles.group}>
          <View style={styles.groupHead}>
            <Text style={[type.overline, { color: c.textMuted }]}>My courses</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/levels')}
              hitSlop={6}
            >
              <Text style={[type.overline, { color: c.accent }]}>
                {courses.length ? 'Edit' : 'Choose'}
              </Text>
            </Pressable>
          </View>
          {courses.length ? (
            courses.map((card) =>
              item(
                card.key,
                card.title,
                decodeURIComponent(pathname) === routePath(card.route),
                () => push(card.route),
              ),
            )
          ) : (
            <Text style={[type.footnote, styles.hint, { color: c.textMuted }]}>
              Pick your grades or college fields to pin them here.
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { width: layout.sidebar, borderRightWidth: StyleSheet.hairlineWidth },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    height: layout.topBar,
    paddingHorizontal: space.lg,
  },
  name: { flex: 1 },
  scroll: { paddingHorizontal: space.md, paddingBottom: space.xl, gap: space.xl },
  group: { gap: 2 },
  groupHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: space.md,
    paddingBottom: space.xs,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    minHeight: 40,
    paddingHorizontal: space.md,
    borderRadius: radius.md,
  },
  itemText: { flex: 1, fontWeight: '500' },
  hint: { paddingHorizontal: space.md },
});
