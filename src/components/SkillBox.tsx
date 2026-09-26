import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import type { TopicIconName } from '@/data/icons';
import { font, radius, space, usePalette, useTone } from '@/theme';

import { TopicIcon } from './TopicIcon';

/**
 * A skill on a topic page: a bordered box with the skill's title at the top and its lessons
 * (the main lesson, then each problem type) as rectangles in rows inside it.
 */
export function SkillBox({
  title,
  icon,
  tone,
  children,
  testID,
}: {
  title: string;
  icon?: TopicIconName;
  tone: number;
  children: ReactNode;
  testID?: string;
}) {
  const c = usePalette();
  const t = useTone(tone);
  return (
    <View testID={testID} style={[styles.box, { borderColor: c.border }]}>
      <View style={styles.head}>
        {icon ? (
          <View style={[styles.badge, { backgroundColor: t.bg }]}>
            <TopicIcon name={icon} color={t.fg} size={18} />
          </View>
        ) : null}
        <Text accessibilityRole="header" style={[styles.title, { color: c.text }]}>
          {title}
        </Text>
      </View>
      <View style={styles.rows}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    marginHorizontal: space.lg,
    marginBottom: space.lg,
    padding: space.md,
    borderWidth: 1.5,
    borderRadius: radius.lg,
    gap: space.md,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  badge: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { flex: 1, fontSize: font.body + 1, fontWeight: '800', letterSpacing: -0.2 },
  rows: { gap: space.sm },
});
