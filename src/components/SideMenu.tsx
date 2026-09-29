import { usePathname } from 'expo-router';
import { useMemo, useState, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { menuPath, menuTree, routePath, type MenuNode } from '@/data/menu';
import type { RouteTarget } from '@/data/selectors';
import { push } from '@/navigation';
import { font, space, usePalette } from '@/theme';

import { Icon } from './Icon';
import { Text } from './Text';

/**
 * The header's menu button. It opens a side menu that lists every lesson in dropdowns (grade,
 * subject, strand, skill; or division, field, course), opened to the page the student is on.
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
  // Open to the page the student is on.
  const [expanded, setExpanded] = useState(() => new Set(menuPath(here)));
  const nodes = useMemo(() => menuTree(), []);

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

  const row = (node: MenuNode, depth: number): ReactNode => {
    const isOpen = expanded.has(node.key);
    const current = !node.children && !!node.route && here(node.route);
    const pad = { paddingLeft: space.md + depth * space.md };
    if (!node.children) {
      return (
        <Pressable
          key={node.key}
          testID={`menu-${node.key}`}
          accessibilityRole="link"
          accessibilityState={{ selected: current }}
          onPress={() => go(node.route!)}
          style={({ pressed }) => [
            styles.row,
            pad,
            current && { backgroundColor: c.surface },
            { opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <Text style={[styles.leaf, { color: current ? c.accent : c.text }]} numberOfLines={2}>
            {node.label}
          </Text>
        </Pressable>
      );
    }
    return (
      <View key={node.key}>
        <Pressable
          testID={`menu-${node.key}`}
          accessibilityRole="button"
          accessibilityState={{ expanded: isOpen }}
          onPress={() => toggle(node.key)}
          style={({ pressed }) => [styles.row, pad, { opacity: pressed ? 0.6 : 1 }]}
        >
          <View style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}>
            <Icon name="chevron" size={16} color={c.textMuted} />
          </View>
          <Text
            style={[depth === 0 ? styles.top : styles.branch, { color: c.text }]}
            numberOfLines={2}
          >
            {node.label}
          </Text>
        </Pressable>
        {isOpen ? (
          <>
            {node.route
              ? row(
                  { key: `${node.key}#all`, label: `${node.label} overview`, route: node.route },
                  depth + 1,
                )
              : null}
            {node.children.map((child) => row(child, depth + 1))}
          </>
        ) : null}
      </View>
    );
  };

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose} visible>
      <View style={styles.backdropRow}>
        <View
          testID="side-menu"
          accessibilityViewIsModal
          style={[
            styles.panel,
            { backgroundColor: c.background, paddingTop: insets.top, borderRightColor: c.border },
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
          <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + space.lg }}>
            {nodes.map((node) => row(node, 0))}
          </ScrollView>
        </View>
        {/* Tapping outside the panel closes it. */}
        <Pressable
          accessibilityLabel="Close the menu"
          style={[styles.backdrop, { backgroundColor: c.text }]}
          onPress={onClose}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  menuButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  backdropRow: { flex: 1, flexDirection: 'row' },
  backdrop: { flex: 1, opacity: 0.25 },
  panel: { width: '85%', maxWidth: 380, borderRightWidth: StyleSheet.hairlineWidth },
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
  row: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    paddingRight: space.md,
    paddingVertical: space.xs,
  },
  top: { flex: 1, fontSize: font.body + 1, fontWeight: '700' },
  branch: { flex: 1, fontSize: font.body, fontWeight: '600' },
  leaf: { flex: 1, fontSize: font.body, marginLeft: 20 },
});
