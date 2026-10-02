import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewProps, type ViewStyle } from 'react-native';

import { layout, space, usePalette } from '@/theme';

import { useGutter } from './layoutSize';
import { Footer } from './shell/Footer';

export type PageWidth = keyof typeof layout.content;

/**
 * A screen's scrolling page: the page background, side gutters by screen width, and the content
 * centred at a readable width (`grid` for tile pages, `read` for lessons, settings and legal
 * text, `narrow` for forms such as onboarding and plans).
 */
export function Page({
  width = 'grid',
  children,
  contentStyle,
  footer = true,
  ...scroll
}: {
  width?: PageWidth;
  /** The web footer under the content (on by default). */
  footer?: boolean;
  children: ReactNode;
  contentStyle?: ViewStyle;
} & Omit<ScrollViewProps, 'children' | 'contentContainerStyle'>) {
  const c = usePalette();
  const gutter = useGutter();
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      {...scroll}
      style={[{ backgroundColor: c.background }, scroll.style]}
      // Lists, headers and grids carry their own 16 px side inset, so the page adds the rest.
      contentContainerStyle={[styles.outer, { paddingHorizontal: gutter - space.lg }]}
    >
      <View style={[styles.inner, { maxWidth: layout.content[width] }, contentStyle]}>
        {children}
      </View>
      {footer ? <Footer /> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  outer: { flexGrow: 1, alignItems: 'center', paddingBottom: space.xxxl },
  inner: { width: '100%' },
});
