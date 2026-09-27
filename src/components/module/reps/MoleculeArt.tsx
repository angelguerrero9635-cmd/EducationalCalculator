/**
 * Ball-and-stick molecules for the chemistry pictures: lit balls in the classroom (CPK)
 * colors joined by grey sticks, one stick per bond (two for a double bond). The geometry is
 * in `chem.ts`; this draws it at any size inside a picture's Svg.
 */
import type { ReactElement } from 'react';
import { Circle, G, Line, RadialGradient, Stop } from 'react-native-svg';

import { usePalette, type Palette } from '@/theme';

import {
  ATOM_COLORS,
  atomColor,
  atomRadius,
  extentOf,
  lightAtom,
  moleculeOf,
  type AtomColor,
  type Molecule,
} from './chem';
import { ChartText } from './common';
import { Ball, usePaintIds, url } from './paint';

export type AtomIds = Record<AtomColor, string>;

/** One lit-ball gradient per atom color, for a picture's Defs. */
export function useAtomPaint(): { ids: AtomIds; defs: ReactElement } {
  const c = usePalette();
  const ids = usePaintIds(...ATOM_COLORS);
  const defs = (
    <G>
      {ATOM_COLORS.map((k) =>
        k === 'atomH' ? (
          // White balls take a grey edge, or they vanish on a white card.
          <RadialGradient key={k} id={ids[k]} cx="0.4" cy="0.35" r="0.7" fx="0.32" fy="0.28">
            <Stop offset="0" stopColor={c.shine} />
            <Stop offset="0.55" stopColor={c.atomH} />
            <Stop offset="1" stopColor={c.atomBond} />
          </RadialGradient>
        ) : (
          <Ball key={k} id={ids[k]} color={c[k]} />
        ),
      )}
    </G>
  );
  return { ids, defs };
}

/** Width and height of a molecule drawn with bonds `scale` px long. */
export function moleculeSize(formula: string, scale: number) {
  const [x0, y0, x1, y1] = extentOf(moleculeOf(formula));
  return { w: (x1 - x0) * scale, h: (y1 - y0) * scale };
}

/** The bond length (px) that fits a molecule inside a w × h box. */
export function fitScale(formula: string, w: number, h: number) {
  const [x0, y0, x1, y1] = extentOf(moleculeOf(formula));
  return Math.min(w / Math.max(0.6, x1 - x0), h / Math.max(0.6, y1 - y0));
}

/** One ball: lit, outlined, its symbol on it when there is room. */
export function AtomBall({
  el,
  cx,
  cy,
  r,
  ids,
  symbol = true,
}: {
  el: string;
  cx: number;
  cy: number;
  r: number;
  ids: AtomIds;
  symbol?: boolean;
}) {
  const c = usePalette();
  const fs = Math.min(13, r * (el.length > 1 ? 0.95 : 1.15));
  return (
    <G>
      <Circle
        cx={cx}
        cy={cy}
        r={r}
        fill={url(ids[atomColor(el)])}
        stroke={c.shade}
        strokeOpacity={0.45}
        strokeWidth={Math.max(0.6, Math.min(1.2, r / 8))}
      />
      {symbol && r >= 6.5 ? (
        <ChartText
          x={cx}
          y={cy + fs * 0.36}
          fontSize={fs}
          fontWeight="700"
          textAnchor="middle"
          fill={lightAtom(el) ? c.atomInk : c.onAtom}
        >
          {el}
        </ChartText>
      ) : null}
    </G>
  );
}

/** The sticks of one bond, as parallel lines: one, two or three. */
function Bond({
  x1,
  y1,
  x2,
  y2,
  order,
  scale,
  c,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  order: number;
  scale: number;
  c: Palette;
}) {
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const [nx, ny] = [-(y2 - y1) / len, (x2 - x1) / len];
  const gap = scale * (order === 3 ? 0.15 : 0.19);
  const width = Math.max(1.2, scale * (order === 1 ? 0.16 : 0.11));
  const offsets = order === 1 ? [0] : order === 2 ? [-0.5, 0.5] : [-1, 0, 1];
  return (
    <G>
      {offsets.map((k) => (
        <G key={k}>
          <Line
            x1={x1 + nx * gap * k}
            y1={y1 + ny * gap * k}
            x2={x2 + nx * gap * k}
            y2={y2 + ny * gap * k}
            stroke={c.atomBond}
            strokeWidth={width}
            strokeLinecap="round"
          />
          {/* A thin shine along the top edge: the stick is round. */}
          <Line
            x1={x1 + nx * gap * k - width * 0.18}
            y1={y1 + ny * gap * k - width * 0.22}
            x2={x2 + nx * gap * k - width * 0.18}
            y2={y2 + ny * gap * k - width * 0.22}
            stroke={c.shine}
            strokeOpacity={0.35 * c.sheen}
            strokeWidth={width * 0.3}
            strokeLinecap="round"
          />
        </G>
      ))}
    </G>
  );
}

/**
 * A molecule centered at (cx, cy), bonds `scale` px long. `faded` draws it as a placeholder
 * (a value not typed yet); `symbols: false` leaves the letters off small balls.
 */
export function MoleculeArt({
  formula,
  molecule,
  cx,
  cy,
  scale,
  ids,
  opacity = 1,
  symbols = true,
}: {
  formula?: string;
  molecule?: Molecule;
  cx: number;
  cy: number;
  scale: number;
  ids: AtomIds;
  opacity?: number;
  symbols?: boolean;
}) {
  const c = usePalette();
  const m = molecule ?? moleculeOf(formula ?? '');
  const [x0, y0, x1, y1] = extentOf(m);
  // Centered on the middle of the balls' box, not on the first atom.
  const ox = cx - ((x0 + x1) / 2) * scale;
  const oy = cy - ((y0 + y1) / 2) * scale;
  const px = (x: number) => ox + x * scale;
  const py = (y: number) => oy + y * scale;
  const order = m.atoms.map((a, i) => ({ a, i })).sort((p, q) => p.a.z - q.a.z);
  return (
    <G opacity={opacity}>
      {m.bonds.map(([i, j, k]) => (
        <Bond
          key={`b${i}-${j}`}
          x1={px(m.atoms[i]!.x)}
          y1={py(m.atoms[i]!.y)}
          x2={px(m.atoms[j]!.x)}
          y2={py(m.atoms[j]!.y)}
          order={k}
          scale={scale}
          c={c}
        />
      ))}
      {order.map(({ a, i }) => (
        <AtomBall
          key={`a${i}`}
          el={a.el}
          cx={px(a.x)}
          cy={py(a.y)}
          // Atoms behind are drawn a little smaller.
          r={atomRadius(a.el) * scale * (a.z < 0 ? 0.9 : 1)}
          ids={ids}
          symbol={symbols}
        />
      ))}
    </G>
  );
}
