import { StyleSheet, View } from 'react-native';

import { SITE_NAME } from '@/config/site';
import { usePalette } from '@/theme';

import { Text } from './Text';

/**
 * The $U mark. A placeholder until the designed logo arrives: swap this component's drawing and
 * every header follows.
 */
export function Logo({ size = 28 }: { size?: number }) {
  const c = usePalette();
  return (
    <View
      testID="logo"
      accessibilityRole="image"
      accessibilityLabel={SITE_NAME}
      style={[
        styles.mark,
        {
          height: size,
          minWidth: size * 1.45,
          borderRadius: size * 0.28,
          backgroundColor: c.accent,
        },
      ]}
    >
      <Text
        style={[styles.text, { color: c.onAccent, fontSize: size * 0.56, lineHeight: size * 0.7 }]}
      >
        $U
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  mark: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  text: { fontWeight: '800', letterSpacing: -0.5 },
});
