import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, useRep, Caption } from './common';
import { Ball, Deepen, FloorShadow, url, usePaintIds } from './paint';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'balance' }>;

/**
 * A pan balance: each pan holds its values as groups of counters. It is level when both sides
 * are the same amount, which is what the equal sign means.
 */
export function Balance({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  // K–2 reads the numbers ("6 + 1 = 7"); later grades the letters ("a + b = 7").
  const term = (id: string) => (rep.words ? rep.value(id, false) : rep.variable(id).symbol);
  const count = (id: string) => (rep.known(id) ? Math.max(0, Math.round(rep.shown(id))) : 0);
  const crossed = spec.takeAway ? count(spec.takeAway) : 0;
  const left = spec.left.reduce((s, id) => s + count(id), 0) - crossed;
  const right = spec.right.reduce((s, id) => s + count(id), 0);
  const tilt = Math.max(-1, Math.min(1, (right - left) / 6)) * 14;
  const all = [...spec.left, ...(spec.takeAway ? [spec.takeAway] : []), ...spec.right];
  // Two-color counters: one color per value on a pan.
  const paint = usePaintIds('a', 'b', 'metal');
  const shades = [url(paint.a), url(paint.b)];
  // Rows of counters on the fuller pan (5 per row, or 10 smaller ones above 20).
  const most = Math.max(
    spec.left.reduce((s, id) => s + count(id), 0),
    spec.right.reduce((s, id) => s + count(id), 0),
  );
  const stackRoom = most > 20 ? Math.ceil(most / 10) * 10 : Math.ceil(most / 5) * 18;

  return (
    <View>
      <Canvas aspect={(w) => (stackRoom + 150) / w}>
        {({ w, h }) => {
          const cx = w / 2;
          // Room above the beam for the tallest stack and the tilt.
          const pivot = stackRoom + 30;
          // Keep each pan (about 112 px wide) inside the canvas.
          const arm = Math.min(w * 0.38, w / 2 - 62);
          const ly = pivot - tilt;
          const ry = pivot + tilt;
          const pan = (x: number, y: number, ids: string[], key: string) => {
            // Counters stacked in rows above the pan, one shade per value: rows of 5, or rows
            // of 10 smaller counters when there are more than 20 (up to 40 per pan).
            const n = ids.reduce((sum, id) => sum + count(id), 0);
            const small = n > 20;
            const per = small ? 10 : 5;
            const dx = small ? 10.5 : 20;
            const dy = small ? 10 : 18;
            let i = 0;
            const dots = ids.flatMap((id, g) =>
              Array.from({ length: count(id) }, () => {
                const k = i++;
                const cx = x - (dx * (per - 1)) / 2 + (k % per) * dx;
                const cy = y + (small ? 38 : 34) - Math.floor(k / per) * dy;
                const r = small ? 4.6 : 7.5;
                // The last counters on the left pan are crossed out when some are taken away.
                const out = key === 'L' && k >= n - crossed;
                return (
                  <G key={`${key}${id}${k}`} opacity={out ? 0.6 : 1}>
                    <Circle
                      cx={cx}
                      cy={cy}
                      r={r}
                      fill={out ? 'transparent' : shades[g % 2]}
                      stroke={c.chartInk}
                      strokeWidth={chart.strokeLight}
                    />
                    {out ? (
                      <Path
                        d={`M ${cx - r} ${cy - r} L ${cx + r} ${cy + r} M ${cx + r} ${cy - r} L ${cx - r} ${cy + r}`}
                        stroke={c.chartInk}
                        strokeWidth={chart.stroke}
                      />
                    ) : null}
                  </G>
                );
              }),
            );
            return [
              <Line key={`${key}s1`} x1={x - 52} y1={y + 46} x2={x} y2={y} stroke={c.metalDark} />,
              <Line key={`${key}s2`} x1={x + 52} y1={y + 46} x2={x} y2={y} stroke={c.metalDark} />,
              // A shallow metal dish.
              <Path
                key={`${key}p`}
                d={`M ${x - 58} ${y + 45} L ${x + 58} ${y + 45} Q ${x + 50} ${y + 56} ${x + 36} ${y + 56} L ${x - 36} ${y + 56} Q ${x - 50} ${y + 56} ${x - 58} ${y + 45} Z`}
                fill={url(paint.metal)}
                stroke={c.metalDark}
                strokeWidth={chart.strokeLight}
              />,
              ...dots,
            ];
          };
          return (
            <Svg width={w} height={h}>
              <Defs>
                <Ball id={paint.a} color={c.chartHighlight} />
                <Ball id={paint.b} color={c.chartSecond} />
                <Deepen id={paint.metal} from={c.metal} to={c.metalDark} />
              </Defs>
              <FloorShadow cx={cx} cy={h - 6} rx={46} ry={4} />
              <Polygon
                points={`${cx},${pivot} ${cx - 26},${h - 8} ${cx + 26},${h - 8}`}
                fill={url(paint.metal)}
                stroke={c.metalDark}
                strokeLinejoin="round"
              />
              <Rect x={cx - 40} y={h - 12} width={80} height={6} rx={3} fill={c.metalDark} />
              <Line
                x1={cx - arm}
                y1={ly}
                x2={cx + arm}
                y2={ry}
                stroke={c.metalDark}
                strokeWidth={chart.strokeHeavy + 2}
                strokeLinecap="round"
              />
              <Line
                x1={cx - arm}
                y1={ly - 1}
                x2={cx + arm}
                y2={ry - 1}
                stroke={c.metal}
                strokeWidth={1.5}
                strokeLinecap="round"
              />
              <Circle cx={cx} cy={pivot} r={6} fill={c.chartInk} stroke={c.metal} strokeWidth={2} />
              {pan(cx - arm, ly, spec.left, 'L')}
              {pan(cx + arm, ry, spec.right, 'R')}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {`Left: ${spec.left.map(term).join(' + ')}${spec.takeAway ? ` − ${term(spec.takeAway)}` : ''} = ${left}. Right: ${spec.right.map(term).join(' + ')} = ${right}. ${
          left === right
            ? 'Level: both sides are the same. The number sentence is true.'
            : `Not level: ${left} on the left, ${right} on the right. The number sentence is false.`
        }`}
      </Caption>
      <Steppers
        calc={calc}
        // The last value is the "missing" one that rebalances the scale; changing it moves the
        // first value instead.
        items={all.map((id) => {
          const free = id === all[all.length - 1] ? all[0] : all[all.length - 1];
          return { var: id, steps: [1], pin: all.filter((x) => x !== id && x !== free) };
        })}
      />
    </View>
  );
}
