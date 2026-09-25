import { Pressable, StyleSheet } from 'react-native';
import { Text } from '@/components/Text';

import { font, radius, space, usePalette } from '@/theme';

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'link';
  disabled?: boolean;
  testID?: string;
}

export function Button({ label, onPress, variant = 'primary', disabled, testID }: ButtonProps) {
  const c = usePalette();
  const isDisabled = disabled || !onPress;
  const bg =
    variant === 'primary' ? c.accent : variant === 'secondary' ? c.accentSoft : 'transparent';
  const fg = variant === 'primary' ? c.onAccent : c.accent;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      style={({ pressed }) => [
        variant === 'link' ? styles.link : styles.button,
        { backgroundColor: bg, opacity: isDisabled ? 0.4 : pressed ? 0.7 : 1 },
      ]}
    >
      <Text style={[styles.label, { color: fg }, variant === 'link' && styles.linkLabel]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: radius.pill,
    paddingHorizontal: space.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  link: { padding: space.sm, alignItems: 'center' },
  label: { fontSize: font.body, fontWeight: '700' },
  linkLabel: { fontWeight: '400', textDecorationLine: 'underline' },
});
