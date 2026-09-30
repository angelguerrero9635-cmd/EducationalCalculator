import { usePathname } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { menuGroupOf, menuGroups, routePath, type MenuGroup, type MenuRow } from '@/data/menu';
import type { RouteTarget } from '@/data/selectors';
import { push } from '@/navigation';
import { font, space, usePalette } from '@/theme';

import { Icon } from './Icon';
import { Text } from './Text';

/**
 * The header's menu button, at the right of every header. It opens a side menu from the same
 * side: a dropdown for each grade and each college division, holding indented rows of its
 * lessons. The dropdown with the open page starts open.
 */
export function MenuButton() {
  const c = usePalette();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable
        testID="nav-menu"
        accessibilityRole="button"
        accessibilityLabel="Menu: all lessons"
        onPress={() => setOpen(true)}
        hitSlop={8}
        style={({ pressed }) => [styles.menuButton, { opacity: pressed ? 0.5 : 1 }]}
      >
        <Icon name="menu" color={c.accent} />
      </Pressable>
      {open ? <SideMenu onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function SideMenu({ onClose }: { onClose: () => void }) {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const pathname = decodeURIComponent(usePathname());
  const here = (route: RouteTarget) => routePath(route) === pathname;
  const groups = useMemo(() => menuGroups(), []);
  // Open to the grade (or division) of the page the student is on.
  const [expanded, setExpanded] = useState(() => {
    const key = menuGroupOf(here);
    return new Set(key ? [key] : []);
  });

  // Scroll to the open page: its dropdown's place, the rows' place in it, and the row's.
  const scroller = useRef<ScrollView>(null);
  const place = useRef({ group: 0, rows: 0, row: -1 });
  const [laidOut, setLaidOut] = useState(false);
  const openGroup = useMemo(() => menuGroupOf(here), [pathname]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const { group, rows, row } = place.current;
    if (laidOut && row >= 0)
      scroller.current?.scrollTo({ y: Math.max(0, group + rows + row - 120), animated: false });
  }, [laidOut]);

  const toggle = (key: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  const go = (route: RouteTarget) => {
    onClose();
    push(route);
  };

  const row = (r: MenuRow) => {
    const indent = { paddingLeft: space.lg + r.depth * space.lg };
    if (!r.route) {
      // A heading: a strand or a field.
      return (
        <View key={r.key} style={[styles.heading, indent]}>
          <Text style={[styles.headingText, { color: c.textMuted }]} numberOfLines={2}>
            {r.label}
          </Text>
        </View>
      );
    }
    const current = here(r.route);
    return (
      <Pressable
        key={r.key}
        onLayout={
          current
            ? (e) => {
                place.current.row = e.nativeEvent.layout.y;
                setLaidOut(true);
              }
            : undefined
        }
        testID={`menu-${r.key}`}
        accessibilityRole="link"
        accessibilityState={{ selected: current }}
        onPress={() => go(r.route!)}
        style={({ pressed }) => [
          styles.row,
          indent,
          current && { backgroundColor: c.surface },
          { opacity: pressed ? 0.6 : 1 },
        ]}
      >
        <Text
          style={[
            r.depth === 0 ? styles.subject : styles.lesson,
            { color: current ? c.accent : c.text },
          ]}
          numberOfLines={2}
        >
          {r.label}
        </Text>
      </Pressable>
    );
  };

  const group = (g: MenuGroup) => {
    const isOpen = expanded.has(g.key);
    return (
      <View
        key={g.key}
        onLayout={
          g.key === openGroup ? (e) => (place.current.group = e.nativeEvent.layout.y) : undefined
        }
      >
        {g.section ? (
          <Text style={[styles.section, { color: c.textMuted, borderTopColor: c.border }]}>
            {g.section}
          </Text>
        ) : null}
        <Pressable
          testID={`menu-${g.key}`}
          accessibilityRole="button"
          accessibilityState={{ expanded: isOpen }}
          onPress={() => toggle(g.key)}
          style={({ pressed }) => [
            styles.dropdown,
            { borderBottomColor: c.border, opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <Text style={[styles.dropdownText, { color: c.text }]}>{g.label}</Text>
          <View style={{ transform: [{ rotate: isOpen ? '-90deg' : '90deg' }] }}>
            <Icon name="chevron" size={18} color={c.textMuted} />
          </View>
        </Pressable>
        {isOpen ? (
          <View
            style={styles.rows}
            onLayout={
              g.key === openGroup ? (e) => (place.current.rows = e.nativeEvent.layout.y) : undefined
            }
          >
            {g.rows.map(row)}
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose} visible>
      <View style={styles.backdropRow}>
        {/* Tapping outside the panel closes it. */}
        <Pressable
          accessibilityLabel="Close the menu"
          style={[styles.backdrop, { backgroundColor: c.text }]}
          onPress={onClose}
        />
        <View
          testID="side-menu"
          accessibilityViewIsModal
          style={[
            styles.panel,
            { backgroundColor: c.background, paddingTop: insets.top, borderLeftColor: c.border },
          ]}
        >
          <View style={[styles.head, { borderBottomColor: c.border }]}>
            <Text accessibilityRole="header" style={[styles.title, { color: c.text }]}>
              Lessons
            </Text>
            <Pressable
              testID="menu-close"
              accessibilityRole="button"
              accessibilityLabel="Close the menu"
              onPress={onClose}
              hitSlop={8}
              style={styles.menuButton}
            >
              <Icon name="close" color={c.accent} />
            </Pressable>
          </View>
          <ScrollView
            ref={scroller}
            contentContainerStyle={{ paddingBottom: insets.bottom + space.lg }}
          >
            {groups.map(group)}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  menuButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  backdropRow: { flex: 1, flexDirection: 'row' },
  backdrop: { flex: 1, opacity: 0.25 },
  panel: { width: '85%', maxWidth: 380, borderLeftWidth: StyleSheet.hairlineWidth },
  head: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: space.lg,
    paddingRight: space.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: font.body + 3, fontWeight: '700' },
  section: {
    fontSize: font.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: space.lg,
    paddingTop: space.lg,
    paddingBottom: space.xs,
  },
  dropdown: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dropdownText: { flex: 1, fontSize: font.body + 1, fontWeight: '700' },
  rows: { paddingVertical: space.xs },
  heading: { paddingTop: space.sm, paddingBottom: 2, paddingRight: space.md },
  headingText: { fontSize: font.caption, fontWeight: '700' },
  row: { minHeight: 40, justifyContent: 'center', paddingRight: space.md, paddingVertical: 6 },
  subject: { fontSize: font.body, fontWeight: '700' },
  lesson: { fontSize: font.body },
});
