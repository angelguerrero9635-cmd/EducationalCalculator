import { View } from 'react-native';
import Svg, { Circle, G, Line } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'venn' }>;

export const factorsOf = (n: number) =>
  n < 1 ? [] : Array.from({ length: n }, (_, i) => i + 1).filter((k) => n % k === 0);
/** Prime factors with repeats: 24 → [2, 2, 2, 3]. */
export function primesOf(n: number): number[] {
  const out: number[] = [];
  let m = n;
  for (let p = 2; p * p <= m; p++) {
    while (m % p === 0) {
      out.push(p);
      m /= p;
    }
  }
  if (m > 1) out.push(m);
  return out;
}

/** Member label size and the grid they sit on. */
const FS = chart.value;
const MARGIN = 12;

/**
 * Where `n` members go in a region: points of an even grid that lie inside it (clear of both
 * circles' edges by a margin), the `n` nearest its middle, in reading order. The grid gets
 * finer until they fit.
 */
function spots(
  n: number,
  inside: (x: number, y: number) => boolean,
  box: [number, number, number, number],
  mid: [number, number],
  chars: number,
): [number, number][] {
  if (n === 0) return [];
  const [x0, y0, x1, y1] = box;
  for (const k of [1, 0.9, 0.8, 0.7, 0.6]) {
    const sx = Math.max(chars * FS * 0.62 + 10, 26) * k;
    const sy = 27 * k;
    const pts: [number, number][] = [];
    // The grid is centred on the region's middle, so a few members sit evenly around it.
    for (let y = mid[1] - Math.floor((mid[1] - y0) / sy) * sy; y <= y1; y += sy)
      for (let x = mid[0] - Math.floor((mid[0] - x0) / sx) * sx; x <= x1; x += sx)
        if (inside(x, y)) pts.push([x, y]);
    if (pts.length >= n)
      return pts
        .map((p) => ({ p, d: Math.hypot((p[0] - mid[0]) / sx, (p[1] - mid[1]) / sy) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, n)
        .map((q) => q.p)
        .sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  }
  // Too many for the region: a plain grid around its middle.
  const cols = Math.ceil(Math.sqrt(n));
  return Array.from({ length: n }, (_, i) => [
    mid[0] + ((i % cols) - (cols - 1) / 2) * 24,
    mid[1] + (Math.floor(i / cols) - (Math.ceil(n / cols) - 1) / 2) * 20,
  ]);
}

/**
 * Two overlapping circles, flat, one per number in its own tint (the highlight and the second
 * colour, blending where they overlap), each titled outside ("Factors of 12"). Its factors (or
 * prime factors) sit on an even grid inside, the ones both share in the overlap. The greatest
 * common factor is a filled badge tagged "greatest common factor"; with prime factors the
 * overlap multiplies to the GCF and everything in both circles to the LCM.
 */
export function Venn({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const a = Math.max(1, Math.round(rep.shown(spec.first)));
  const b = Math.max(1, Math.round(rep.shown(spec.second)));
  const known = rep.known(spec.first) && rep.known(spec.second);
  let onlyA: number[];
  let onlyB: number[];
  let both: number[];
  if (spec.list === 'primes') {
    const pb = primesOf(b);
    both = [];
    onlyA = [];
    for (const p of primesOf(a)) {
      const i = pb.indexOf(p);
      if (i >= 0) {
        both.push(p);
        pb.splice(i, 1);
      } else onlyA.push(p);
    }
    onlyB = pb;
  } else {
    const fa = factorsOf(a);
    const fb = factorsOf(b);
    both = fa.filter((x) => fb.includes(x));
    onlyA = fa.filter((x) => !both.includes(x));
    onlyB = fb.filter((x) => !both.includes(x));
  }
  const gcf = spec.list === 'primes' ? both.reduce((x, y) => x * y, 1) : Math.max(...both);
  const badge = spec.list === 'factors' && both.length > 0;
  const title = (n: number) => `${spec.list === 'primes' ? 'Prime factors' : 'Factors'} of ${n}`;
  const TOP = 28;
  const TAG = badge ? 34 : 12;

  return (
    <View>
      <Canvas aspect={(w) => (TOP + 2 * Math.min(w * 0.3, 150) + TAG) / w}>
        {({ w, h }) => {
          const r = Math.min(w * 0.3, 150);
          const d = r * 1.1; // centre to centre
          const cy = TOP + r;
          const cxA = w / 2 - d / 2;
          const cxB = w / 2 + d / 2;
          const inA = (x: number, y: number, m: number) => Math.hypot(x - cxA, y - cy) <= r - m;
          const inB = (x: number, y: number, m: number) => Math.hypot(x - cxB, y - cy) <= r - m;
          const outA = (x: number, y: number) => Math.hypot(x - cxA, y - cy) >= r + MARGIN - 2;
          const outB = (x: number, y: number) => Math.hypot(x - cxB, y - cy) >= r + MARGIN - 2;
          const chars = Math.max(1, ...[...onlyA, ...onlyB, ...both].map((x) => String(x).length));
          const box: [number, number, number, number] = [cxA - r, cy - r, cxB + r, cy + r];
          // The middle of each circle's own part (between its far edge and the other circle).
          const midA = (cxA - r + (cxB - r)) / 2;
          const midB = (cxA + r + (cxB + r)) / 2;
          const ptsA = spots(
            onlyA.length,
            (x, y) => inA(x, y, MARGIN + 4) && outB(x, y),
            box,
            [midA, cy],
            chars,
          );
          const ptsB = spots(
            onlyB.length,
            (x, y) => inB(x, y, MARGIN + 4) && outA(x, y),
            box,
            [midB, cy],
            chars,
          );
          const ptsBoth = spots(
            both.length,
            (x, y) => inA(x, y, MARGIN + 2) && inB(x, y, MARGIN + 2),
            box,
            [w / 2, cy],
            chars,
          );
          const members = [
            ...onlyA.map((x, i) => ({ x, p: ptsA[i]!, shared: false })),
            ...onlyB.map((x, i) => ({ x, p: ptsB[i]!, shared: false })),
            ...both.map((x, i) => ({ x, p: ptsBoth[i]!, shared: true })),
          ];
          const g = members.find((m) => badge && m.shared && m.x === gcf);
          const badgeR = Math.max(14, chars * 4.5 + 6);
          return (
            <Svg width={w} height={h} opacity={known ? 1 : 0.4}>
              <Circle cx={cxA} cy={cy} r={r} fill={c.chartHighlight} fillOpacity={0.14} />
              <Circle cx={cxB} cy={cy} r={r} fill={c.chartSecond} fillOpacity={0.3} />
              <Circle
                cx={cxA}
                cy={cy}
                r={r}
                fill="none"
                stroke={c.chartHighlight}
                strokeWidth={chart.stroke}
              />
              <Circle
                cx={cxB}
                cy={cy}
                r={r}
                fill="none"
                stroke={c.chartSecond}
                strokeWidth={chart.stroke}
              />
              <ChartText
                x={Math.max(4, cxA - r)}
                y={TOP - 10}
                fontSize={chart.value}
                fontWeight="700"
                textAnchor="start"
              >
                {title(a)}
              </ChartText>
              <ChartText
                x={Math.min(w - 4, cxB + r)}
                y={TOP - 10}
                fontSize={chart.value}
                fontWeight="700"
                textAnchor="end"
              >
                {title(b)}
              </ChartText>
              {g ? (
                // The tag under the circles, joined to the badge by a short leader.
                <G>
                  <Line
                    x1={g.p[0]}
                    y1={g.p[1] + badgeR}
                    x2={w / 2}
                    y2={cy + r + 6}
                    stroke={c.chartHighlight}
                    strokeWidth={chart.strokeLight}
                  />
                  <ChartText
                    x={w / 2}
                    y={cy + r + 21}
                    fontSize={chart.value}
                    fontWeight="700"
                    fill={c.chartHighlight}
                    textAnchor="middle"
                  >
                    greatest common factor
                  </ChartText>
                </G>
              ) : null}
              {members.map((m, i) => (
                <G key={i}>
                  {g === m ? (
                    <Circle cx={m.p[0]} cy={m.p[1]} r={badgeR} fill={c.chartHighlight} />
                  ) : null}
                  <ChartText
                    x={m.p[0]}
                    y={m.p[1] + FS * 0.36}
                    fontSize={FS}
                    fontWeight={m.shared ? '700' : '400'}
                    fill={g === m ? c.onChartHighlight : c.chartInk}
                    textAnchor="middle"
                  >
                    {String(m.x)}
                  </ChartText>
                </G>
              ))}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {!known
          ? 'Type two numbers.'
          : spec.list === 'primes'
            ? `Shared primes: ${both.length ? both.join(' × ') : 'none'}, so the GCF is ${gcf}. The LCM multiplies everything in both circles once: ${[...onlyA, ...both, ...onlyB].join(' × ') || '1'}.`
            : `Common factors of ${a} and ${b}: ${both.join(', ')}. The greatest is ${gcf}.`}
      </Caption>
      <Steppers
        calc={calc}
        items={[
          { var: spec.first, steps: [1], pin: [spec.second] },
          { var: spec.second, steps: [1], pin: [spec.first] },
        ]}
      />
    </View>
  );
}
