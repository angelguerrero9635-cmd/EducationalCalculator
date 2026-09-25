import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';

import { font, space, usePalette } from '@/theme';

/** A heading between groups of content: bold text on the page, no band. */
export function SectionHeader({ title }: { title: string }) {
  const c = usePalette();
  return (
    <View style={styles.header}>
      <Text accessibilityRole="header" style={[styles.title, { color: c.text }]}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: space.lg, paddingTop: space.xl, paddingBottom: space.md },
  title: { fontSize: font.body + 2, fontWeight: '800', letterSpacing: -0.2 },
});
