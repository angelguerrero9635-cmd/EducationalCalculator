/**
 * Shared parts of the college round 3 group F chemistry pictures (HC56, HC58, HC71, HC73): a
 * reader that never hands a "?" value over as a number, ion charges as superscripts, and the
 * painted glass beaker of a cell.
 */
import { G, Path, Rect } from 'react-native-svg';

import type { NumOrVar } from '@/data/modules/typesGraphs';
import { chart, usePalette } from '@/theme';

import { url } from './paint';

type Rep = {
  known: (id: string) => boolean;
  val: (id: string) => number;
  value: (id: string, withUnit?: boolean) => string;
  variable: (id: string) => { unit?: string };
};

/** A value read in its formula unit, `scale`d (× 1000 for kJ/mol into J/mol), or undefined while "?". */
export function numReader(rep: Rep) {
  return (x: NumOrVar | undefined, scale: (unit: string | undefined) => number = () => 1) => {
    if (x === undefined) return undefined;
    if (typeof x === 'number') return x;
    return rep.known(x) ? rep.val(x) * scale(rep.variable(x).unit) : undefined;
  };
}

const RAISE: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
};
/** A metal's ion of charge z: Cu²⁺, Ag⁺; z unknown → "ion". */
export const ionOf = (metal: string, z: number | undefined) =>
  z === undefined || !(z >= 1) || !Number.isInteger(z)
    ? `${metal} ion`
    : `${metal}${z === 1 ? '' : [...String(z)].map((d) => RAISE[d] ?? d).join('')}⁺`;

/** A signed number with a true minus. */
export const minus = (s: string) => s.replace(/^-/, '−');

/** Small deterministic jitter (0 … 1) for dot positions. */
export const jitter = (i: number, k: number) => {
  const s = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return s - Math.floor(s);
};

/**
 * A glass beaker of solution from `top` to `bottom`, `bw` wide around `cx`, filled up to
 * `level` (the liquid deepening toward the bottom, tinted when `tint` is set).
 */
export function Beaker({
  cx,
  bw,
  top,
  bottom,
  level,
  ids,
  tint,
}: {
  cx: number;
  bw: number;
  top: number;
  bottom: number;
  level: number;
  ids: { glass: string; water: string; sheen: string };
  tint?: string;
}) {
  const x = cx - bw / 2;
  return (
    <G>
      <Rect x={x} y={top} width={bw} height={bottom - top} fill={url(ids.glass)} />
      <Rect
        x={x}
        y={level}
        width={bw}
        height={bottom - level}
        fill={url(ids.water)}
        opacity={tint ? 0.35 : 0.5}
      />
      {tint ? (
        <Rect x={x} y={level} width={bw} height={bottom - level} fill={tint} opacity={0.55} />
      ) : null}
      <Rect x={x} y={top} width={bw} height={bottom - top} fill={url(ids.sheen)} />
    </G>
  );
}

/** The beaker's rim and walls, drawn over what stands in it. */
export function BeakerWall({
  cx,
  bw,
  top,
  bottom,
}: {
  cx: number;
  bw: number;
  top: number;
  bottom: number;
}) {
  const c = usePalette();
  const [l, r] = [cx - bw / 2, cx + bw / 2];
  return (
    <Path
      d={`M ${l - 5} ${top - 4} Q ${l} ${top} ${l} ${top + 5} L ${l} ${bottom - 4} Q ${l} ${bottom} ${l + 4} ${bottom} L ${r - 4} ${bottom} Q ${r} ${bottom} ${r} ${bottom - 4} L ${r} ${top}`}
      stroke={c.glassEdge}
      strokeWidth={chart.strokeHeavy}
      fill="none"
      strokeLinejoin="round"
    />
  );
}

/** Each metal's own color (copper, zinc, the rest silvery). */
export const metalFill = (m: string, c: ReturnType<typeof usePalette>) =>
  m === 'Cu' ? c.copper : m === 'Zn' ? c.zinc : m === 'Pb' || m === 'Fe' ? c.metalDark : c.silver;
