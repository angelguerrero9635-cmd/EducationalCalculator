/**
 * H90: the one-variable inequality f(x) (sign) 0 on `functionGraph`, its sign from a sign box.
 * Where the curve is above the x-axis (>, ≥) or below it (<, ≤) is shaded between the curve and
 * the axis, and those x values are drawn on the axis as a thick band, with closed circles at
 * the zeros for ≤ and ≥ (they make f(x) = 0, taken in) and open ones for < and > (left out).
 */
import { G, Circle, Line, Path } from 'react-native-svg';

import { chart, usePalette } from '@/theme';

import { numText, zerosIn, type Curve } from './functionGraphMath';
import type { SignCode } from './signBox';

/** One stretch of solutions: lo to hi (±Infinity when unbounded), each end in or out. */
export interface SignPiece {
  lo: number;
  hi: number;
  loIn: boolean;
  hiIn: boolean;
}

/** The solutions of f(x) (sign) 0 between lo and hi (past them counted as unbounded). */
export function signPieces(c: Curve, sign: SignCode, lo = -60, hi = 60) {
  const zeros = zerosIn(c, lo, hi);
  const texts = new Map<number, string>();
  for (const z of zeros) texts.set(z.x, z.text ?? numText(z.x));
  const cuts = [
    ...zeros.map((z) => ({ x: z.x, zero: true })),
    ...c
      .breaks(lo, hi)
      .filter((b) => b > lo && b < hi)
      .map((x) => ({ x, zero: false })),
  ]
    .sort((a, b) => a.x - b.x)
    .filter((q, i, all) => i === 0 || q.x - all[i - 1]!.x > 1e-9);
  const zeroIn = sign === '≤' || sign === '≥' || sign === '=';
  const want = (v: number) =>
    Number.isFinite(v) &&
    (sign === '<' || sign === '≤'
      ? v < 0
      : sign === '>' || sign === '≥'
        ? v > 0
        : sign === '≠'
          ? v !== 0
          : false);
  const edges = [lo, ...cuts.map((q) => q.x), hi];
  const inGap = edges.slice(1).map((b, i) => want(c.f((edges[i]! + b) / 2)));
  const pieces: SignPiece[] = [];
  let open: SignPiece | undefined;
  inGap.forEach((inside, i) => {
    const left = i === 0 ? undefined : cuts[i - 1]!;
    const leftIn = !!left && left.zero && zeroIn;
    if (inside) {
      if (open && leftIn) return; // continues through a zero it takes in
      if (open) pieces.push({ ...open, hi: left!.x, hiIn: false });
      open = { lo: left ? left.x : -Infinity, hi: Infinity, loIn: leftIn, hiIn: false };
    } else {
      if (open) {
        pieces.push({ ...open, hi: left!.x, hiIn: leftIn });
        open = undefined;
      } else if (leftIn && !(i > 0 && inGap[i - 1]))
        pieces.push({ lo: left!.x, hi: left!.x, loIn: true, hiIn: true });
    }
  });
  if (open) pieces.push(open);
  return { pieces, texts, zeros: zeros.map((z) => z.x) };
}

/** "−2 < x < 4", "x ≤ −1 or x ≥ 3", "every x", "no solution". */
export function piecesText(pieces: SignPiece[], texts: Map<number, string>, x: string) {
  const n = (v: number) => texts.get(v) ?? numText(v);
  if (pieces.length === 0) return 'no solution';
  return pieces
    .map((p) =>
      p.lo === -Infinity && p.hi === Infinity
        ? `every ${x}`
        : p.lo === p.hi
          ? `${x} = ${n(p.lo)}`
          : p.lo === -Infinity
            ? `${x} ${p.hiIn ? '≤' : '<'} ${n(p.hi)}`
            : p.hi === Infinity
              ? `${x} ${p.loIn ? '≥' : '>'} ${n(p.lo)}`
              : `${n(p.lo)} ${p.loIn ? '≤' : '<'} ${x} ${p.hiIn ? '≤' : '<'} ${n(p.hi)}`,
    )
    .join(' or ');
}

/** The caption line for f(x) (sign) 0. */
export function signCaption(c: Curve, sign: SignCode | undefined, f: string, x: string): string {
  if (!sign) return `Choose the sign in ${f}(${x}) ? 0 to shade its solutions`;
  const { pieces, texts, zeros } = signPieces(c, sign);
  const where =
    sign === '=' || sign === '≠'
      ? sign === '='
        ? 'where the curve meets the x-axis'
        : 'wherever the curve is off the x-axis'
      : `where the curve is ${sign === '<' || sign === '≤' ? 'below' : 'above'} the x-axis${sign === '≤' || sign === '≥' ? ' or on it' : ''}`;
  const ends = !zeros.length
    ? ''
    : sign === '≤' || sign === '≥' || sign === '='
      ? '. Closed circles: the zeros make it 0, taken in'
      : '. Open circles: the zeros make it 0, left out';
  return `${f}(${x}) ${sign} 0 ${where}: ${piecesText(pieces, texts, x)}${ends}`;
}

interface DrawProps {
  curve: Curve;
  sign: SignCode;
  sx: (x: number) => number;
  sy: (y: number) => number;
  win: { x: [number, number]; y: [number, number] };
}

/** The shading between the curve and the axis (drawn under the curve). */
export function SignFill({ curve, sign, sx, sy, win }: DrawProps) {
  const c = usePalette();
  const { pieces } = signPieces(curve, sign);
  const [wx0, wx1] = win.x;
  let d = '';
  for (const p of pieces) {
    const [a, b] = [Math.max(wx0, p.lo), Math.min(wx1, p.hi)];
    if (!(a < b)) continue;
    d += `M ${sx(a)} ${sy(0)} `;
    for (let i = 0; i <= 200; i++) {
      const x = a + ((b - a) * i) / 200;
      const y = Math.max(win.y[0] - 1, Math.min(win.y[1] + 1, curve.f(x)));
      d += `L ${sx(x)} ${sy(Number.isFinite(y) ? y : 0)} `;
    }
    d += `L ${sx(b)} ${sy(0)} Z `;
  }
  return d ? <Path d={d} fill={c.chartHighlight} opacity={0.16} /> : null;
}

/** The solutions on the x-axis: a thick band, arrows where it runs on, circles at the ends. */
export function SignBand({ curve, sign, sx, sy, win }: DrawProps) {
  const c = usePalette();
  if (win.y[0] > 0 || win.y[1] < 0) return null;
  const { pieces, zeros } = signPieces(curve, sign);
  const [wx0, wx1] = win.x;
  const y0 = sy(0);
  const band = chart.strokeHeavy + 2;
  const zeroIn = sign === '≤' || sign === '≥' || sign === '=';
  const inX = (x: number) => x >= wx0 - 1e-9 && x <= wx1 + 1e-9;
  return (
    <G>
      {pieces.map((p, i) => {
        const [a, b] = [Math.max(wx0, p.lo), Math.min(wx1, p.hi)];
        if (!(a < b)) return null;
        const [L, R] = [sx(a), sx(b)];
        return (
          <G key={`b${i}`}>
            <Line
              x1={p.lo < wx0 ? L + 8 : L}
              y1={y0}
              x2={p.hi > wx1 ? R - 8 : R}
              y2={y0}
              stroke={c.chartHighlight}
              strokeWidth={band}
            />
            {p.lo < wx0 ? (
              <Path d={`M ${L} ${y0} l 12 -7 l 0 14 z`} fill={c.chartHighlight} />
            ) : null}
            {p.hi > wx1 ? (
              <Path d={`M ${R} ${y0} l -12 -7 l 0 14 z`} fill={c.chartHighlight} />
            ) : null}
          </G>
        );
      })}
      {zeros.filter(inX).map((z) => (
        <Circle
          key={`z${z}`}
          cx={sx(z)}
          cy={y0}
          r={6.5}
          fill={zeroIn ? c.chartHighlight : c.card}
          stroke={c.chartHighlight}
          strokeWidth={chart.stroke + 0.5}
        />
      ))}
    </G>
  );
}
