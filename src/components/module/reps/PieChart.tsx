import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { Text } from '@/components/Text';
import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, font, space, usePalette, useTone } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'pieChart' }>;

/** One wedge of the pie, from angle a0 to a1 (degrees, clockwise from the top). */
function Wedge({
  cx,
  cy,
  r,
  a0,
  a1,
  fill,
  stroke,
}: {
  cx: number;
  cy: number;
  r: number;
  a0: number;
  a1: number;
  fill: string;
  stroke: string;
}) {
  const toXY = (deg: number) => {
    const t = ((deg - 90) * Math.PI) / 180;
    return [cx + r * Math.cos(t), cy + r * Math.sin(t)] as const;
  };
  if (a1 - a0 >= 359.99) return <Circle cx={cx} cy={cy} r={r} fill={fill} stroke={stroke} />;
  const [x0, y0] = toXY(a0);
  const [x1, y1] = toXY(a1);
  const large = a1 - a0 > 180 ? 1 : 0;
  return (
    <Path
      d={`M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`}
      fill={fill}
      stroke={stroke}
      strokeWidth={chart.strokeLight}
    />
  );
}

/** A wedge's fill from the palette's tones, so each part has its own colour. */
function ToneWedge(props: { tone: number } & Omit<Parameters<typeof Wedge>[0], 'fill'>) {
  const t = useTone(props.tone);
  return <Wedge {...props} fill={t.bg} />;
}

/** Minimum wedge (degrees) that holds its own label; thinner ones are named in the key. */
const LABEL_MIN = 12;

/** A key entry for a wedge too thin to label: its colour, name and value. */
function KeyItem({ tone, text }: { tone: number; text: string }) {
  const c = usePalette();
  const t = useTone(tone);
  return (
    <View style={styles.keyItem}>
      <View style={[styles.swatch, { backgroundColor: t.bg, borderColor: c.chartInk }]} />
      <Text style={[styles.keyText, { color: c.text }]}>{text}</Text>
    </View>
  );
}

/**
 * A pie chart: each part is a wedge sized by its share of the whole (percents, or counts
 * with a total). The sliders change the parts.
 */
export function PieChart({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const parts = spec.parts.map((id) => Math.max(0, rep.shown(id)));
  const total = spec.total ? Math.max(0, rep.shown(spec.total)) : 100;
  const known = spec.parts.every(rep.known) && (!spec.total || rep.known(spec.total));
  const sum = parts.reduce((a, b) => a + b, 0);
  const whole = Math.max(total, sum) || 1;
  const unit = spec.total ? '' : '%';

  return (
    <View>
      <Canvas aspect={0.62}>
        {({ w, h }) => {
          const r = Math.min(w, h) / 2 - 16;
          const cx = w / 2;
          const cy = h / 2;
          let a = 0;
          const wedges = parts.map((v, i) => {
            const a0 = a;
            a += (v / whole) * 360;
            return { a0, a1: a, i };
          });
          return (
            <Svg width={w} height={h} opacity={known ? 1 : 0.4}>
              <Circle cx={cx} cy={cy} r={r} fill={c.chartSurface} stroke={c.chartInk} />
              {wedges.map(({ a0, a1, i }) =>
                a1 > a0 ? (
                  <ToneWedge
                    key={i}
                    tone={i}
                    cx={cx}
                    cy={cy}
                    r={r}
                    a0={a0}
                    a1={a1}
                    stroke={c.chartInk}
                  />
                ) : null,
              )}
              {wedges.map(({ a0, a1, i }) => {
                if (a1 - a0 < LABEL_MIN) return null;
                const mid = ((a0 + a1) / 2 - 90) * (Math.PI / 180);
                const rr = r * 0.62;
                return (
                  <ChartText
                    key={`l${i}`}
                    x={cx + rr * Math.cos(mid)}
                    y={cy + rr * Math.sin(mid) + 4}
                    fontSize={chart.small}
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    {`${rep.variable(spec.parts[i]!).name}: ${formatNumber(parts[i]!)}${unit}`}
                  </ChartText>
                );
              })}
            </Svg>
          );
        }}
      </Canvas>
      {/* Wedges too thin to hold a label are named here, with their colour. */}
      <View style={styles.key}>
        {parts.map((v, i) =>
          v > 0 && (v / whole) * 360 < LABEL_MIN ? (
            <KeyItem
              key={i}
              tone={i}
              text={`${rep.variable(spec.parts[i]!).name}: ${formatNumber(v)}${unit}`}
            />
          ) : null,
        )}
      </View>
      <Caption>
        {known
          ? spec.total
            ? `${spec.parts.map((id) => rep.value(id, false)).join(' + ')} = ${formatNumber(sum)} of ${formatNumber(total)}.`
            : `${spec.parts.map((id) => `${rep.value(id, false)}%`).join(' + ')} = ${formatNumber(sum)}% of the whole.`
          : 'Type each part to draw the pie.'}
      </Caption>
      <Steppers
        calc={calc}
        items={spec.parts.map((id) => ({
          var: id,
          steps: [1, 5],
          pin: [...spec.parts.filter((x) => x !== id), ...(spec.total ? [spec.total] : [])],
        }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  key: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    columnGap: space.md,
    rowGap: space.xs,
  },
  keyItem: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  swatch: { width: 12, height: 12, borderRadius: 2, borderWidth: StyleSheet.hairlineWidth },
  keyText: { fontSize: font.caption + 1, fontWeight: '600' },
});
