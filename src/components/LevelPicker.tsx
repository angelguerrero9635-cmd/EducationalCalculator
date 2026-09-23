import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';

import { levelGroups, type LevelKey } from '@/data/selectors';
import { font, space, usePalette } from '@/theme';

import { Chip } from './Chip';

const GROUPS = levelGroups();

export interface LevelPickerProps {
  selected: readonly LevelKey[];
  onToggle: (key: LevelKey) => void;
}

/** Multi-select chips for every grade level and Higher Ed field in the taxonomy. */
export function LevelPicker({ selected, onToggle }: LevelPickerProps) {
  const c = usePalette();
  return (
    <View style={styles.container}>
      {GROUPS.map((group) => (
        <View key={group.title} style={styles.group}>
          <Text accessibilityRole="header" style={[styles.title, { color: c.textMuted }]}>
            {group.title}
          </Text>
          <View style={styles.chips}>
            {group.options.map((o) => (
              <Chip
                key={o.key}
                label={o.title}
                selected={selected.includes(o.key)}
                onPress={() => onToggle(o.key)}
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: space.xl },
  group: { gap: space.sm },
  title: { fontSize: font.caption + 1, fontWeight: '600', textTransform: 'uppercase' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
});
