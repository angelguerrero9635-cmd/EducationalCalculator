import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { font, radius, space, usePalette } from '@/theme';

import { ListRow } from './ListRow';
import { Text } from './Text';

export interface DropdownOption<T extends string> {
  value: T;
  label: string;
  /** Optional second line in the menu. */
  detail?: string;
}

export interface DropdownProps<T extends string> {
  /** Shown before the value on the button, e.g. "Units". */
  label?: string;
  /** Title at the top of the menu. */
  title: string;
  value: T;
  options: readonly DropdownOption<T>[];
  onChange: (value: T) => void;
  /** Smaller button, e.g. inside a table row. */
  compact?: boolean;
  testID?: string;
}

/** A button showing the current choice; tapping it opens a menu of options. */
export function Dropdown<T extends string>({
  label,
  title,
  value,
  options,
  onChange,
  compact,
  testID,
}: DropdownProps<T>) {
  const c = usePalette();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);

  return (
    <>
      <Pressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={`${label ?? title}: ${current?.label ?? value}`}
        accessibilityHint="Opens a menu"
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          compact ? styles.compact : styles.button,
          { borderColor: c.border, backgroundColor: pressed ? c.surface : c.background },
        ]}
      >
        <Text style={[compact ? styles.compactText : styles.buttonText]} numberOfLines={1}>
          {label ? <Text style={{ color: c.textMuted }}>{`${label}: `}</Text> : null}
          {current?.label ?? value}
        </Text>
        <Text style={[styles.chevron, { color: c.textMuted }]}>▾</Text>
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          style={[styles.backdrop, { backgroundColor: 'rgba(0,0,0,0.35)' }]}
          accessibilityLabel="Close menu"
          onPress={() => setOpen(false)}
        >
          <Pressable
            // Taps inside the sheet don't close it.
            onPress={() => undefined}
            style={[
              styles.sheet,
              { backgroundColor: c.background, paddingBottom: insets.bottom + space.sm },
            ]}
          >
            <View style={[styles.header, { borderBottomColor: c.border }]}>
              <Text style={styles.title}>{title}</Text>
            </View>
            <ScrollView style={styles.list}>
              {options.map((o) => (
                <ListRow
                  key={o.value}
                  testID={testID ? `${testID}-${o.value}` : undefined}
                  title={o.label}
                  subtitle={o.detail}
                  selected={o.value === value}
                  onPress={() => {
                    setOpen(false);
                    if (o.value !== value) onChange(o.value);
                  }}
                />
              ))}
            </ScrollView>
            <ListRow title="Cancel" accessory="none" onPress={() => setOpen(false)} />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: space.xs,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    minHeight: 40,
  },
  buttonText: { fontSize: font.body },
  compact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: space.sm,
    minHeight: 32,
    minWidth: 56,
    justifyContent: 'center',
  },
  compactText: { fontSize: font.caption + 1 },
  chevron: { fontSize: font.caption },
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: radius.md * 1.5,
    borderTopRightRadius: radius.md * 1.5,
    maxHeight: '75%',
  },
  header: { padding: space.lg, borderBottomWidth: StyleSheet.hairlineWidth },
  title: { fontSize: font.body, fontWeight: '700', textAlign: 'center' },
  list: { flexGrow: 0 },
});
