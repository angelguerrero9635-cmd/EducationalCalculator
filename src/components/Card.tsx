import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import type { RouteTarget } from '@/data/selectors';
import { push } from '@/navigation';
import { radius, space, useCardShadow, usePalette } from '@/theme';

export interface CardProps {
  children: ReactNode;
  /** Navigates here on press. */
  route?: RouteTarget;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
}

/** A rounded box on the page (with a soft shadow in light mode). Pressable when it links. */
export function Card({ children, route, onPress, style, testID, accessibilityLabel }: CardProps) {
  const c = usePalette();
  const shadow = useCardShadow();
  const handlePress = onPress ?? (route ? () => push(route) : undefined);
  const base = [styles.card, { backgroundColor: c.card }, shadow];
  if (!handlePress) {
    return (
      <View testID={testID} style={[...base, style]}>
        {children}
      </View>
    );
  }
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={handlePress}
      style={({ pressed }) => [
        ...base,
        style,
        pressed && { transform: [{ scale: 0.98 }], opacity: 0.92 },
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, padding: space.lg },
});
