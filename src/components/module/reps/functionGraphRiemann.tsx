/**
 * Riemann rectangles on a function graph (H106, `functionGraph` `riemann`): n rectangles of
 * equal width from `from` to `to`, each as tall as the curve at its right edge (or left edge or
 * middle), and their sum. The sum is pure, for the harness too.
 */
import { G, Path, Rect } from 'react-native-svg';

import type { NumOrVar } from '@/data/modules/typesGraphs';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Curve } from './functionGraphMath';
import { isQuadrature, quadratureCaption } from './functionGraphHe3a';
import { QuadratureFill } from './FunctionGraphMarksHe3a';
import { short } from './hsdKit';
import { type Riemann, riemannOf } from './riemann';

type Get = (v: NumOrVar | undefined, fallback: number) => number;

/** The most rectangles drawn one by one; past it they are one stepped outline. */
const DRAWN = 60;

/** The rectangles under (or over) the curve, drawn below it. */
export function RiemannRects({
  r,
  curve,
  get,
  sx,
  sy,
  faded,
}: {
  r: Riemann;
  curve: Curve;
  get: Get;
  sx: (x: number) => number;
  sy: (y: number) => number;
  faded: boolean;
}) {
  const c = usePalette();
  if (isQuadrature(r))
    return <QuadratureFill r={r} f={curve.f} get={get} sx={sx} sy={sy} faded={faded} />; // HC45
  const { n, strips } = riemannOf(r, curve.f, get);
  const ok = strips.filter((q) => Number.isFinite(q.y));
  if (n > DRAWN) {
    // Too many to see apart: the stepped outline, filled.
    let d = '';
    for (const q of ok) {
      d += `M ${sx(q.x)} ${sy(0)} L ${sx(q.x)} ${sy(q.y)} L ${sx(q.x + q.w)} ${sy(q.y)} L ${sx(q.x + q.w)} ${sy(0)} Z `;
    }
    return (
      <Path
        d={d}
        fill={c.chartSecond}
        fillOpacity={0.45}
        stroke={c.fnSecond}
        strokeWidth={0.5}
        opacity={faded ? 0.4 : 1}
      />
    );
  }
  return (
    <G opacity={faded ? 0.4 : 1}>
      {ok.map((q, i) => {
        const [x0, x1] = [sx(q.x), sx(q.x + q.w)];
        const [y0, y1] = [sy(0), sy(q.y)];
        return (
          <Rect
            key={`r${i}`}
            x={Math.min(x0, x1)}
            y={Math.min(y0, y1)}
            width={Math.abs(x1 - x0)}
            height={Math.abs(y1 - y0)}
            fill={c.chartSecond}
            fillOpacity={0.45}
            stroke={c.fnSecond}
            strokeWidth={n > 24 ? 0.75 : chart.strokeLight}
          />
        );
      })}
      {/* The point each height is read at. */}
      {n <= 24
        ? ok.map((q, i) => {
            const at = r.side === 'left' ? 0 : r.side === 'middle' ? 0.5 : 1;
            return (
              <Path
                key={`p${i}`}
                d={`M ${sx(q.x + at * q.w) - 3} ${sy(q.y)} a 3 3 0 1 0 6 0 a 3 3 0 1 0 -6 0`}
                fill={c.fnSecond}
              />
            );
          })
        : null}
    </G>
  );
}

/** The caption's line: how many rectangles, how wide, read where, and what they add to. */
export function riemannCaption(r: Riemann, f: (x: number) => number, get: Get, x: string) {
  if (isQuadrature(r)) return quadratureCaption(r, f, get, x); // HC45
  const { n, a, b, w, sum } = riemannOf(r, f, get);
  const edge = r.side === 'left' ? 'left-edge' : r.side === 'middle' ? 'midpoint' : 'right-edge';
  const s4 = Number(sum.toFixed(4));
  const tail = Number.isFinite(sum)
    ? `their areas add to S ${Math.abs(s4 - sum) < 1e-9 ? '=' : '≈'} ${formatNumber(s4)}`
    : 'some have no height';
  return `${n} ${edge} rectangle${n === 1 ? '' : 's'} of width ${formatNumber(Number(w.toFixed(4)))} from ${x} = ${short(a)} to ${short(b)}: ${tail}`;
}
