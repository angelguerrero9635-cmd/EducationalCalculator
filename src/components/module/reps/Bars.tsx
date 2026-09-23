import { useRef } from 'react';
import { StyleSheet, Text } from 'react-native';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { font, space, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, DragHandle, useRep } from './common';

type Spec = Extract<Representation, { kind: 'bars' }>;

export function Bars({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef(0);
  const editable = spec.bars.filter((b) => b.editable).map((b) => b.var);

  return (
    <>
      <Canvas aspect={0.65}>
        {({ w, h }) => {
          const top = 30;
          const bottom = 36;
          const plotH = h - top - bottom;
          const scale = plotH / (spec.max - spec.min);
          const sy = (v: number) =>
            top + (spec.max - Math.min(spec.max, Math.max(spec.min, v))) * scale;
          const slot = (w - 16) / spec.bars.length;
          const barW = Math.min(56, slot * 0.6);
          const cx = (i: number) => 8 + slot * (i + 0.5);
          return (
            <>
              <Svg width={w} height={h}>
                <Line x1={4} y1={sy(0)} x2={w - 4} y2={sy(0)} stroke={c.text} strokeWidth={1.5} />
                {spec.bars.map((b, i) => {
                  const v = rep.val(b.var);
                  const y0 = sy(0);
                  const y1 = sy(v);
                  const known = rep.known(b.var);
                  return (
                    <Rect
                      key={b.var}
                      x={cx(i) - barW / 2}
                      y={Math.min(y0, y1)}
                      width={barW}
                      height={Math.max(1, Math.abs(y1 - y0))}
                      fill={b.editable ? c.placeholder : c.surface}
                      stroke={c.text}
                      strokeDasharray={b.editable ? undefined : '4 3'}
                      opacity={known ? 1 : 0.35}
                    />
                  );
                })}
                {spec.bars.map((b, i) => {
                  const v = rep.val(b.var);
                  const variable = rep.variable(b.var);
                  return [
                    <SvgText
                      key={`v${b.var}`}
                      x={cx(i)}
                      // Editable bars have a drag handle on top; keep the value clear of it.
                      y={v >= 0 ? sy(v) - (b.editable ? 20 : 6) : sy(v) + (b.editable ? 28 : 14)}
                      fontSize={12}
                      fontWeight="600"
                      fill={c.text}
                      textAnchor="middle"
                    >
                      {rep.known(b.var) ? formatNumber(v, variable) : '?'}
                    </SvgText>,
                    <SvgText
                      key={`l${b.var}`}
                      x={cx(i)}
                      y={h - bottom + 16}
                      fontSize={11}
                      fill={c.textMuted}
                      textAnchor="middle"
                    >
                      {variable.symbol}
                    </SvgText>,
                    spec.bars.length <= 5 && (
                      <SvgText
                        key={`n${b.var}`}
                        x={cx(i)}
                        y={h - bottom + 30}
                        fontSize={10}
                        fill={c.textMuted}
                        textAnchor="middle"
                      >
                        {variable.name}
                      </SvgText>
                    ),
                  ];
                })}
              </Svg>
              {spec.bars.map((b, i) =>
                b.editable ? (
                  <DragHandle
                    key={b.var}
                    testID={`drag-${b.var}`}
                    x={cx(i)}
                    y={sy(rep.val(b.var))}
                    label={rep.variable(b.var).name}
                    onStart={() => (start.current = rep.val(b.var))}
                    onMove={(_, dy) =>
                      calc.set({
                        ...rep.pin(editable.filter((id) => id !== b.var)),
                        [b.var]: rep.snapTo(b.var, start.current - dy / scale),
                      })
                    }
                  />
                ) : null,
              )}
            </>
          );
        }}
      </Canvas>
      {spec.total ? (
        <Text style={[styles.caption, { color: c.text }]}>
          {`${rep.variable(spec.total).name}: ${rep.label(spec.total)}`}
        </Text>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  caption: { fontSize: font.body, textAlign: 'center', marginTop: space.sm, fontWeight: '600' },
});
