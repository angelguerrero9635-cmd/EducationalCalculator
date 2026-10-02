import { Fragment } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Icon } from '@/components/Icon';
import { Text } from '@/components/Text';
import type { Crumb } from '@/data/selectors';
import { push } from '@/navigation';
import { space, type, usePalette } from '@/theme';

/**
 * Where a page sits: "Browse › Grade 5 › Fractions › Add and subtract…". Each step but the
 * last is a link. One line; on a phone it scrolls sideways rather than wrapping.
 */
export function Breadcrumbs({ trail, scroll = false }: { trail: Crumb[]; scroll?: boolean }) {
  const c = usePalette();
  if (trail.length < 2) return null;
  const items = trail.map((crumb, i) => (
    <Fragment key={i}>
      {i > 0 ? <Icon name="chevron" size={12} color={c.textMuted} /> : null}
      {crumb.target ? (
        <Pressable
          accessibilityRole="link"
          onPress={() => push(crumb.target!)}
          hitSlop={6}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <Text style={[type.footnote, { color: c.textMuted }]} numberOfLines={1}>
            {crumb.label}
          </Text>
        </Pressable>
      ) : (
        <Text
          accessibilityRole="text"
          style={[type.footnote, styles.here, { color: c.text }]}
          numberOfLines={1}
        >
          {crumb.label}
        </Text>
      )}
    </Fragment>
  ));
  return (
    <View role="navigation" aria-label="Breadcrumb">
      {scroll ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {items}
        </ScrollView>
      ) : (
        <View style={[styles.row, styles.clip]}>{items}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  clip: { overflow: 'hidden' },
  here: { fontWeight: '600', flexShrink: 1 },
});
