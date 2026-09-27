/**
 * Shared pieces for the chance pictures (samples, spinners, dice, trees, marbles): a seeded
 * random order, the named colors a lesson can give its outcomes, and a plain button.
 */
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text';
import { font, radius, space, usePalette, type Palette } from '@/theme';

/**
 * A chance as the student writes it: the count out of all, in lowest terms when that is
 * different, then the value ("6/36 = 1/6 ≈ 0.1667", "3/8 = 0.375").
 */
export function chanceText(k: number, n: number, value: string, x: number): string {
  const g = gcd(k, n) || 1;
  const lowest = g > 1 && k > 0 && n > 0 ? ` = ${k / g}/${n / g}` : '';
  const exact = Math.abs(x * 1e4 - Math.round(x * 1e4)) < 1e-6;
  return `${k}/${n}${lowest} ${exact ? '=' : '≈'} ${value}`;
}
const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

/** A repeatable random sequence in [0, 1) from a seed (mulberry32). */
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 0 … n − 1 in a random order that depends only on the seed. */
export function shuffled(n: number, seed: number): number[] {
  const r = seeded(seed);
  const out = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/** Colors an outcome can be named by (a red sector, a blue marble). */
export type ChanceColor = 'red' | 'blue' | 'green' | 'yellow' | 'orange' | 'purple';
export const CHANCE_COLORS: ChanceColor[] = ['red', 'blue', 'green', 'yellow', 'orange', 'purple'];

/** The theme color for a named color, and the ink that reads on it. */
export function chanceColor(c: Palette, name: ChanceColor): { fill: string; ink: string } {
  switch (name) {
    case 'red':
      return { fill: c.blockRed, ink: c.onBlock };
    case 'blue':
      return { fill: c.blockBlue, ink: c.onBlock };
    case 'green':
      return { fill: c.blockGreen, ink: c.onBlock };
    case 'yellow':
      return { fill: c.sunDisk, ink: c.coinInk };
    case 'orange':
      return { fill: c.orange, ink: c.coinInk };
    case 'purple':
      return { fill: c.purple, ink: c.onBlock };
  }
}

/** A plain button under a picture ("Spin", "Take a new sample"). */
export function PictureButton({
  label,
  onPress,
  testID,
}: {
  label: string;
  onPress: () => void;
  testID: string;
}) {
  const c = usePalette();
  return (
    <View style={styles.row}>
      <Pressable
        testID={testID}
        accessibilityRole="button"
        onPress={onPress}
        style={[styles.button, { borderColor: c.border, backgroundColor: c.card }]}
      >
        <Text style={[styles.text, { color: c.text }]}>{label}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', marginTop: space.xs },
  button: {
    minHeight: 44,
    minWidth: 88,
    paddingHorizontal: space.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.md,
  },
  text: { fontSize: font.body, fontWeight: '600' },
});
