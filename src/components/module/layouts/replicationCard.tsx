/**
 * H100 `replication` card figure: one stage of DNA replication for a sequence stage, 112 × 76.
 * The old strands are dark and the new ones lit (the highlight), so the last stage shows each
 * copy one old strand and one new: semiconservative. Bases are rungs in the usual trace colors
 * (A green, T red, G yellow, C blue), paired A–T and G–C.
 *
 * - `unzip`: the double helix opened at a fork, helicase (a wedge) at the fork;
 * - `pair`: free nucleotides pairing with each old strand, more waiting between the arms;
 * - `join`: DNA polymerase running along each old strand, the new strand joined behind it;
 * - `copies`: two double helices, each one old strand and one new.
 */
import { Circle, G, Line, Path } from 'react-native-svg';

import type { ReplicationCard as Spec } from '@/data/modules/typesHs2e';
import { usePalette, type Palette } from '@/theme';

export const REPLICATION_W = 112;
export const REPLICATION_H = 76;

const SEQ = 'ATGCCGTAAGCT';
const PAIR: Record<string, string> = { A: 'T', T: 'A', G: 'C', C: 'G' };
const colorOf = (b: string, c: Palette) =>
  b === 'A' ? c.dnaA : b === 'T' ? c.dnaT : b === 'G' ? c.dnaG : c.dnaC;

type P = [number, number];
const lerp = (a: P, b: P, t: number): P => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

export function ReplicationCard({ f, ink }: { f: Spec; ink: string }) {
  const c = usePalette();
  const old = ink;
  const lit = c.chartHighlight;
  /** A ladder from x0 to x1 between rails at y0 (top) and y1, the rails in their colors. */
  const ladder = (x0: number, x1: number, y0: number, y1: number, top: string, bot: string) => {
    const n = Math.floor((x1 - x0) / 7);
    return (
      <G key={`${x0}-${y0}`}>
        {Array.from({ length: n }, (_, k) => {
          const x = x0 + 4 + k * 7;
          const b = SEQ[k % SEQ.length]!;
          const mid = (y0 + y1) / 2;
          return (
            <G key={k}>
              <Line x1={x} y1={y0} x2={x} y2={mid} stroke={colorOf(b, c)} strokeWidth={2.4} />
              <Line
                x1={x}
                y1={mid}
                x2={x}
                y2={y1}
                stroke={colorOf(PAIR[b]!, c)}
                strokeWidth={2.4}
              />
            </G>
          );
        })}
        <Line
          x1={x0}
          y1={y0}
          x2={x1}
          y2={y0}
          stroke={top}
          strokeWidth={2.6}
          strokeLinecap="round"
        />
        <Line
          x1={x0}
          y1={y1}
          x2={x1}
          y2={y1}
          stroke={bot}
          strokeWidth={2.6}
          strokeLinecap="round"
        />
      </G>
    );
  };
  if (f.stage === 'copies')
    return (
      <G>
        {ladder(8, 104, 10, 26, old, lit)}
        {ladder(8, 104, 48, 64, lit, old)}
      </G>
    );
  // The fork: a closed ladder on the left, two arms opening to the right.
  const fork: P = [44, 38];
  const arms: [P, P][] = [
    [fork, [108, 8]],
    [fork, [108, 68]],
  ];
  /** Bases along an arm, as stubs pointing into the fork's middle; `paired` of them met by new ones. */
  const arm = (i: 0 | 1, paired: number, strand: boolean) => {
    const [a, b] = arms[i]!;
    const off = i === 0 ? 1 : -1;
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const [nx, ny] = [(-(b[1] - a[1]) / len) * off, ((b[0] - a[0]) / len) * off];
    const n = 8;
    return (
      <G key={i}>
        {Array.from({ length: n }, (_, k) => {
          const p = lerp(a, b, (k + 1.2) / (n + 1));
          const base = SEQ[(k + (i ? 5 : 0)) % SEQ.length]!;
          const q: P = [p[0] + nx * 6, p[1] + ny * 6];
          const r: P = [p[0] + nx * 12, p[1] + ny * 12];
          const on = k < paired;
          return (
            <G key={k}>
              <Line
                x1={p[0]}
                y1={p[1]}
                x2={q[0]}
                y2={q[1]}
                stroke={colorOf(base, c)}
                strokeWidth={2.4}
              />
              {on ? (
                <Line
                  x1={q[0]}
                  y1={q[1]}
                  x2={r[0]}
                  y2={r[1]}
                  stroke={colorOf(PAIR[base]!, c)}
                  strokeWidth={2.4}
                />
              ) : null}
            </G>
          );
        })}
        {strand ? (
          // The new strand, joined along the paired bases.
          <Line
            x1={lerp(a, b, 1.2 / (n + 1))[0] + nx * 12}
            y1={lerp(a, b, 1.2 / (n + 1))[1] + ny * 12}
            x2={lerp(a, b, (paired + 0.2) / (n + 1))[0] + nx * 12}
            y2={lerp(a, b, (paired + 0.2) / (n + 1))[1] + ny * 12}
            stroke={lit}
            strokeWidth={2.6}
            strokeLinecap="round"
          />
        ) : null}
        <Line
          x1={a[0]}
          y1={a[1]}
          x2={b[0]}
          y2={b[1]}
          stroke={old}
          strokeWidth={2.6}
          strokeLinecap="round"
        />
      </G>
    );
  };
  const paired = f.stage === 'unzip' ? 0 : f.stage === 'pair' ? 4 : 7;
  const strand = f.stage === 'join';
  /** A loose nucleotide waiting to pair: its base and a lit backbone stub. */
  const loose = (x: number, y: number, b: string) => (
    <G key={`${x}${y}`}>
      <Line x1={x} y1={y} x2={x + 5} y2={y} stroke={lit} strokeWidth={2.2} strokeLinecap="round" />
      <Line x1={x + 2.5} y1={y} x2={x + 2.5} y2={y + 5} stroke={colorOf(b, c)} strokeWidth={2.4} />
    </G>
  );
  return (
    <G>
      {ladder(4, 44, 30, 46, old, old)}
      {arm(0, paired, strand)}
      {arm(1, paired, strand)}
      {f.stage === 'unzip' ? (
        // Helicase: a wedge driven into the fork.
        <Path
          d={`M ${fork[0] + 2} ${fork[1]} l 12 -7 a 8 8 0 0 1 0 14 z`}
          fill={c.bioProtein}
          stroke={c.bioProteinEdge}
          strokeWidth={1}
        />
      ) : null}
      {f.stage === 'pair' ? [loose(82, 34, 'A'), loose(94, 40, 'G'), loose(88, 46, 'C')] : null}
      {f.stage === 'join'
        ? // DNA polymerase at the end of each new strand.
          ([0, 1] as const).map((i) => {
            const [a, b] = arms[i]!;
            const p = lerp(a, b, 7.2 / 9);
            return (
              <Circle
                key={i}
                cx={p[0] + (i ? 5 : -5)}
                cy={p[1] + (i ? -8 : 8)}
                r={6}
                fill={c.bioProtein}
                stroke={c.bioProteinEdge}
                strokeWidth={1}
              />
            );
          })
        : null}
    </G>
  );
}
