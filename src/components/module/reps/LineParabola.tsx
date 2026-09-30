/**
 * H106 (round 3, group B): `lineSystem` with a parabola, the nonlinear system y = ax² + mx + b
 * and y = mx + b (a `lines` entry with `square`). Both curves on the grid, each named in its
 * colour, the parabola's vertex dotted; every crossing (none, one or two) ringed and labelled;
 * inequalities shade above or below each curve, dashed when strict; a test point filled when it
 * is in every shading. Flat and exact; no handles (the values have sliders).
 */
import { View } from 'react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';

import type { LineSystemSpec } from '@/data/modules/typesGraphs';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, useFrozen, useRep } from './common';
import { Chip, extents, fitExtent, GridAxes, makeFrame, pointText, reader } from './graphKit';
import { strict } from './halfPlane';
import { coef, quadAt, quadCrossings, quadEquation, quadHolds, type Quad } from './lineParabola';
import { shadeSaid, shadeSign } from './signBox';

const STRICT_DASH = '10 7';

export function LineParabola({ spec, calc }: { spec: LineSystemSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const read = reader(rep);
  const readId = (id: string) => (rep.known(id) ? rep.shown(id) : undefined);
  const curves = spec.lines.map((l) => {
    const [a, m, b] = [read(l.square ?? 0), read(l.slope), read(l.intercept)];
    const q: Quad = { a: a.value, m: m.value, b: b.value };
    return {
      l,
      q,
      known: a.known && m.known && b.known,
      shade: shadeSign(l.shade, readId),
      said: shadeSaid(l.shade, readId),
      eq: quadEquation(q, { a: a.known, m: m.known, b: b.known }),
    };
  });
  const [p, q] = curves as [(typeof curves)[0], (typeof curves)[0]];
  const known = curves.every((k) => k.known);
  const found = known ? quadCrossings(p.q, q.q) : undefined;
  const cross = Array.isArray(found) ? found : [];
  const same = found === 'same';
  const test = spec.test ? { x: read(spec.test.x), y: read(spec.test.y) } : undefined;
  const testIn =
    test && test.x.known && test.y.known ? { x: test.x.value, y: test.y.value } : undefined;
  const vertices = curves.flatMap((k) =>
    k.q.a !== 0 ? [{ x: -k.q.m / (2 * k.q.a), y: quadAt(k.q, -k.q.m / (2 * k.q.a)) }] : [],
  );
  const base = extents(spec.extent);
  const square = base.x === base.y;
  const xs = [
    ...cross.map((pt) => pt.x),
    ...vertices.map((v) => v.x),
    ...(testIn ? [testIn.x] : []),
  ];
  const ys = [
    ...cross.map((pt) => pt.y),
    ...vertices.map((v) => v.y),
    ...curves.map((k) => k.q.b),
    ...(testIn ? [testIn.y] : []),
  ].filter((v) => Math.abs(v) < 1e5);
  const ext = useFrozen(
    square
      ? { x: fitExtent(base.x, [...xs, ...ys]), y: fitExtent(base.y, [...xs, ...ys]) }
      : { x: fitExtent(base.x, xs), y: fitExtent(base.y, ys) },
  ).value;
  const q1 = spec.quadrants === 1;
  const colors = [c.chartHighlight, c.chartSecond];
  const eqs = curves.map((k) => (k.said ? k.eq.replace(' = ', ` ${k.said} `) : k.eq));
  const names = curves.map((k, i) => k.l.label ?? eqs[i]!);
  const shaded = curves.filter((k) => k.shade);
  const inAll = testIn
    ? shaded.every((k) => quadHolds(k.q, k.shade!, testIn.x, testIn.y))
    : undefined;

  // The caption: the equations, the crossings (substituted into one equation), a tested point.
  const lines: string[] = [...names.map((n, i) => (curves[i]!.l.label ? `${n}: ${eqs[i]}` : n))];
  if (!known) lines.push('Type every coefficient to draw the curves.');
  else if (same)
    lines.push('The two equations are the same curve: every point on it is a solution.');
  else {
    const [A, B, C] = [p.q.a - q.q.a, p.q.m - q.q.m, p.q.b - q.q.b];
    const joined = quadEquation({ a: A, m: B, b: C }, { a: true, m: true, b: true }).replace(
      /^y = /,
      '',
    );
    lines.push(`Set them equal: ${joined} = 0`);
    lines.push(
      cross.length === 0
        ? 'The curves never meet: no real solution.'
        : cross.length === 1
          ? `They meet once, at ${pointText(cross[0]!.x, cross[0]!.y)}${A !== 0 ? ': the line only touches the parabola' : ''}`
          : `They cross twice, at ${pointText(cross[0]!.x, cross[0]!.y)} and ${pointText(cross[1]!.x, cross[1]!.y)}`,
    );
  }
  if (known && shaded.length)
    lines.push(
      shaded.length > 1
        ? 'Where both shadings overlap, both inequalities are true.'
        : `Shaded: the points ${shaded[0]!.shade === '>' || shaded[0]!.shade === '≥' ? 'above' : 'below'} the curve`,
    );
  if (testIn && known && shaded.length)
    lines.push(
      `Test ${pointText(testIn.x, testIn.y)}: ${shaded
        .map(
          (k) =>
            `${coef(testIn.y)} ${k.shade} ${coef(quadAt(k.q, testIn.x))} is ${quadHolds(k.q, k.shade!, testIn.x, testIn.y) ? 'true' : 'false'}`,
        )
        .join(', ')}. ${inAll ? 'It is a solution.' : 'It is not a solution.'}`,
    );

  return (
    <View>
      <Canvas aspect={square ? (q1 ? 0.9 : 1) : 0.8}>
        {({ w, h }) => {
          const f = makeFrame(
            w,
            h,
            [q1 ? 0 : -ext.x, ext.x],
            [q1 ? 0 : -ext.y, ext.y],
            square,
            !!spec.axes,
          );
          const n = Math.max(200, Math.round(w));
          const X = (i: number) => f.x[0] + ((f.x[1] - f.x[0]) * i) / n;
          const pathOf = (k: Quad) => {
            let d = '';
            // Each step clipped to the grid's height, so the curve stops at its edge.
            const [lo, hi] = f.y;
            let last: [number, number] | undefined;
            let pen = false; // the path is at the last segment's end (one path, so dashes run on)
            for (let i = 0; i <= n; i++) {
              const p: [number, number] = [X(i), quadAt(k, X(i))];
              if (last) {
                let [[x0, y0], [x1, y1]] = [last, p];
                const cut = (x: number, y: number, xo: number, yo: number, edge: number) =>
                  [x + ((xo - x) * (edge - y)) / (yo - y), edge] as [number, number];
                const out0 = y0 < lo || y0 > hi;
                const out1 = y1 < lo || y1 > hi;
                if (!(out0 && out1 && (y0 - lo) * (y1 - lo) > 0 && (y0 - hi) * (y1 - hi) > 0)) {
                  if (y0 > hi) [x0, y0] = cut(x0, y0, x1, y1, hi);
                  else if (y0 < lo) [x0, y0] = cut(x0, y0, x1, y1, lo);
                  if (y1 > hi) [x1, y1] = cut(x1, y1, x0, y0, hi);
                  else if (y1 < lo) [x1, y1] = cut(x1, y1, x0, y0, lo);
                  if (!pen || out0) d += `M ${f.sx(x0).toFixed(2)} ${f.sy(y0).toFixed(2)} `;
                  d += `L ${f.sx(x1).toFixed(2)} ${f.sy(y1).toFixed(2)} `;
                  pen = !out1;
                } else pen = false;
              }
              last = p;
            }
            return d;
          };
          // Above (> ≥) or below (< ≤) the curve, inside the grid.
          const regionOf = (k: Quad, up: boolean) => {
            let d = '';
            for (let i = 0; i <= n; i++) {
              const y = Math.max(f.y[0], Math.min(f.y[1], quadAt(k, X(i))));
              d += `${i ? 'L' : 'M'} ${f.sx(X(i)).toFixed(2)} ${f.sy(y).toFixed(2)} `;
            }
            const edge = up ? f.y[1] : f.y[0];
            return `${d}L ${f.sx(f.x[1])} ${f.sy(edge)} L ${f.sx(f.x[0])} ${f.sy(edge)} Z`;
          };
          const inGrid = (x: number, y: number) =>
            x >= f.x[0] && x <= f.x[1] && y >= f.y[0] && y <= f.y[1];
          const shown = cross.filter((pt) => inGrid(pt.x, pt.y));
          return (
            <Svg width={w} height={h}>
              <GridAxes f={f} names={spec.axes} />
              {curves.map((k, i) =>
                k.shade ? (
                  <Path
                    key={`s${i}`}
                    d={regionOf(k.q, k.shade === '>' || k.shade === '≥')}
                    fill={colors[i]}
                    opacity={known ? 0.16 : 0.06}
                  />
                ) : null,
              )}
              {curves.map((k, i) => (
                <Path
                  key={`c${i}`}
                  d={pathOf(k.q)}
                  stroke={colors[i]}
                  strokeWidth={chart.strokeHeavy}
                  strokeDasharray={
                    k.shade && strict(k.shade) ? STRICT_DASH : same && i === 1 ? '10 8' : undefined
                  }
                  fill="none"
                  opacity={k.known ? 1 : 0.35}
                />
              ))}
              {vertices
                .filter((v) => inGrid(v.x, v.y))
                .map((v, i) => (
                  <Circle key={`v${i}`} cx={f.sx(v.x)} cy={f.sy(v.y)} r={4} fill={colors[0]} />
                ))}
              {known && !same
                ? shown.map((pt, i) => {
                    // The left crossing's label goes left, the right one's right.
                    const right = shown.length < 2 || i === 1;
                    return (
                      <G key={`x${i}`}>
                        <Circle
                          cx={f.sx(pt.x)}
                          cy={f.sy(pt.y)}
                          r={8}
                          fill={c.card}
                          stroke={c.chartInk}
                          strokeWidth={chart.stroke}
                        />
                        <Circle cx={f.sx(pt.x)} cy={f.sy(pt.y)} r={3.5} fill={c.chartInk} />
                        <Chip
                          x={f.sx(pt.x) + (right ? 12 : -12)}
                          y={f.sy(pt.y) - 10}
                          text={pointText(pt.x, pt.y)}
                          anchor={right ? 'start' : 'end'}
                          w={w}
                          h={h}
                          size={chart.label}
                        />
                      </G>
                    );
                  })
                : null}
              {testIn ? (
                <G>
                  <Circle
                    cx={f.sx(testIn.x)}
                    cy={f.sy(testIn.y)}
                    r={5.5}
                    fill={inAll ? c.chartInk : c.card}
                    stroke={c.chartInk}
                    strokeWidth={chart.stroke}
                  />
                  <Chip
                    x={f.sx(testIn.x) + 9}
                    y={f.sy(testIn.y) + 20}
                    text={pointText(testIn.x, testIn.y)}
                    anchor="start"
                    w={w}
                    h={h}
                  />
                </G>
              ) : null}
              {names.map((name, i) => (
                <Chip
                  key={`n${i}`}
                  x={f.sx(f.x[0]) + 6}
                  y={f.sy(f.y[1]) + 16 + i * 20}
                  text={name}
                  anchor="start"
                  w={w}
                  h={h}
                  color={colors[i]}
                  size={chart.label}
                />
              ))}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );
}
