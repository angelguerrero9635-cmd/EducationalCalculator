/**
 * Marks the equation input draws around its boxes, sized to what they hold: brackets and bars
 * that stretch to a tall group (a fraction in brackets, a matrix), and the radical sign with its
 * bar over the box or group. Used by `EquationInput` (InputsSection.tsx).
 */
import { useState, type ReactNode } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Text } from '@/components/Text';
import { font, usePalette } from '@/theme';

export type FenceKind = '(' | ')' | '[' | ']' | '|';

const WIDTH: Record<FenceKind, number> = { '(': 10, ')': 10, '[': 9, ']': 9, '|': 6 };

/** One bracket or bar, `height` tall. */
function Fence({ kind, height, color }: { kind: FenceKind; height: number; color: string }) {
  const w = WIDTH[kind];
  const h = Math.max(height, 20);
  const d = {
    '(': `M ${w - 2} 2 Q 0 ${h / 2} ${w - 2} ${h - 2}`,
    ')': `M 2 2 Q ${w} ${h / 2} 2 ${h - 2}`,
    '[': `M ${w - 1} 1 H 2 V ${h - 1} H ${w - 1}`,
    ']': `M 1 1 H ${w - 2} V ${h - 1} H 1`,
    '|': `M ${w / 2} 1 V ${h - 1}`,
  }[kind];
  return (
    <Svg width={w} height={h}>
      <Path d={d} stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" />
    </Svg>
  );
}

/** `children` between two fences that grow with them: (1/2), [a b; c d], |a b; c d|. */
export function Fenced({
  open,
  close,
  children,
}: {
  open: FenceKind;
  close: FenceKind;
  children: ReactNode;
}) {
  const c = usePalette();
  const [height, setHeight] = useState(44);
  const onLayout = (e: LayoutChangeEvent) => setHeight(Math.round(e.nativeEvent.layout.height));
  return (
    <View style={styles.fenced}>
      <Fence kind={open} height={height} color={c.text} />
      <View onLayout={onLayout} style={styles.inside}>
        {children}
      </View>
      <Fence kind={close} height={height} color={c.text} />
    </View>
  );
}

/**
 * A radical: the sign's hook and a bar over `children` (a box or a group), with a small `index`
 * (3 for a cube root) in the hook's crook.
 */
export function Radical({ index, children }: { index?: string; children: ReactNode }) {
  const c = usePalette();
  const [height, setHeight] = useState(44);
  const onLayout = (e: LayoutChangeEvent) => setHeight(Math.round(e.nativeEvent.layout.height));
  const h = height;
  const w = 16;
  return (
    <View style={styles.radical}>
      <View>
        <Svg width={w} height={h}>
          <Path
            d={`M 1 ${h * 0.62} L 4 ${h * 0.56} L 8 ${h - 2} L ${w - 1} 1 L ${w} 1`}
            stroke={c.text}
            strokeWidth={2}
            fill="none"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </Svg>
        {index ? (
          <Text style={[styles.index, { color: c.text, top: h * 0.56 - 18 }]}>{index}</Text>
        ) : null}
      </View>
      <View onLayout={onLayout} style={[styles.under, { borderTopColor: c.text }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fenced: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  inside: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  radical: { flexDirection: 'row', alignItems: 'flex-end' },
  // The bar: the top border, 2 px like the hook, 4 px above the box.
  under: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderTopWidth: 2,
    paddingTop: 4,
    paddingHorizontal: 2,
  },
  index: { position: 'absolute', left: -2, fontSize: font.caption, fontWeight: '700' },
});
