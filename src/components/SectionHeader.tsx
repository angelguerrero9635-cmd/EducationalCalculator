import { StyleSheet, Text, View } from 'react-native';

import { font, space, usePalette } from '@/theme';

export function SectionHeader({ title }: { title: string }) {
  const c = usePalette();
  return (
    <View style={[styles.header, { backgroundColor: c.surface }]}>
      <Text accessibilityRole="header" style={[styles.title, { color: c.textMuted }]}>
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: space.lg, paddingTop: space.lg, paddingBottom: space.sm },
  title: { fontSize: font.caption + 1, fontWeight: '600', textTransform: 'uppercase' },
});
