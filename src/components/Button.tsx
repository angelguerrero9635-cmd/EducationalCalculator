import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import { motion, radius, space, type, usePalette } from '@/theme';

import { Icon, type IconName } from './Icon';

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  /** primary: filled accent; secondary: soft accent; link: a quiet text button (no underline). */
  variant?: 'primary' | 'secondary' | 'link';
  /** regular 48 px, small 40 px. */
  size?: 'regular' | 'small';
  icon?: IconName;
  disabled?: boolean;
  testID?: string;
  accessibilityLabel?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'regular',
  icon,
  disabled,
  testID,
  accessibilityLabel,
}: ButtonProps) {
  const c = usePalette();
  const isDisabled = disabled || !onPress;
  const bg = isDisabled
    ? variant === 'link'
      ? 'transparent'
      : c.disabledBg
    : variant === 'primary'
      ? c.accent
      : variant === 'secondary'
        ? c.accentSoft
        : 'transparent';
  const fg = isDisabled ? c.textMuted : variant === 'primary' ? c.onAccent : c.accent;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: isDisabled }}
      style={({ pressed }) => [
        styles.button,
        { minHeight: size === 'small' ? 40 : 48, backgroundColor: bg },
        variant === 'link' && styles.link,
        pressed && !isDisabled && { transform: [{ scale: motion.pressScale }], opacity: 0.9 },
      ]}
    >
      <View style={styles.row}>
        {icon ? <Icon name={icon} size={20} color={fg} /> : null}
        <Text style={[size === 'small' ? styles.labelSmall : styles.label, { color: fg }]}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.md,
    paddingHorizontal: space.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  link: { paddingHorizontal: space.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  label: { ...type.body, fontWeight: '600' },
  labelSmall: { ...type.callout, fontWeight: '600' },
});
