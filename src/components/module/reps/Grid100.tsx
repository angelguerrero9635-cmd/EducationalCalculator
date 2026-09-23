import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Representation } from '@/data/modules';
import { font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, useRep } from './common';

type Spec = Extract<Representation, { kind: 'grid100' }>;

/** 100 squares = the whole. Tapping square n sets the percent to n. */
export function Grid100({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const shaded = Math.round(rep.val(spec.percent));
  const faded = !rep.known(spec.percent);

  return (
    <View style={{ gap: space.sm }}>
      <Canvas aspect={1}>
        {({ w }) => {
          const size = Math.min(w, 320);
          const cell = size / 10;
          return (
            <View
              style={{ width: size, height: size, alignSelf: 'center', opacity: faded ? 0.35 : 1 }}
            >
              {Array.from({ length: 100 }, (_, i) => (
                <Pressable
                  key={i}
                  testID={`cell-${i + 1}`}
                  accessibilityLabel={`${i + 1} percent`}
                  onPress={() =>
                    calc.set({
                      ...(spec.caption ? rep.pin([spec.caption.whole]) : {}),
                      [spec.percent]: i + 1,
                    })
                  }
                  style={{
                    position: 'absolute',
                    left: (i % 10) * cell,
                    top: Math.floor(i / 10) * cell,
                    width: cell,
                    height: cell,
                    borderWidth: StyleSheet.hairlineWidth,
                    borderColor: c.border,
                    backgroundColor: i < shaded ? c.accent : c.surface,
                  }}
                />
              ))}
            </View>
          );
        }}
      </Canvas>
      <Text style={[styles.caption, { color: c.text }]}>
        {`${rep.label(spec.percent)} → ${shaded} of 100 squares`}
      </Text>
      {spec.caption ? (
        <Text style={[styles.caption, { color: c.textMuted }]}>
          {`${rep.label(spec.caption.part)} out of ${rep.label(spec.caption.whole)}`}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  caption: { fontSize: font.body - 1, textAlign: 'center' },
});
