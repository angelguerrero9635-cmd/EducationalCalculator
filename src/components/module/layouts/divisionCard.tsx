/**
 * H34 `cellDivision` card figure (group HG): one stage of mitosis or meiosis, for a sequence
 * stage or a sort card, 96 × 76. The chromosomes come from `divisionMath.ts` (counted from 2n):
 * maternal red, paternal blue, sister chromatids side by side joined at the centromere, a swapped
 * tip where homologs crossed over. The spindle runs from the poles (left and right) to the
 * centromeres; the plate is the cell's middle. Flat, like every diagram.
 */
import { Circle, Ellipse, G, Line, Path } from 'react-native-svg';

import type { CellDivisionCard } from '@/data/modules/typesHsg';
import { usePalette, type Palette } from '@/theme';

import { cellsOf, type Chromatid, type Chromosome } from './divisionMath';

export const DIVISION_W = 96;
export const DIVISION_H = 76;
const CY = DIVISION_H / 2;

/** Arm length of pair k (longest first), times the stage's scale. */
const LEN = [12, 9, 6];
const len = (pair: number, scale: number) => (LEN[pair] ?? 6) * scale;

export function DivisionCard({ f, ink }: { f: CellDivisionCard; ink: string }) {
  const c = usePalette();
  const cells = cellsOf(f.stage, f.diploid);
  const kit = { c, ink };
  switch (f.stage) {
    case 'interphase':
      return (
        <G>
          <Cell x={48} y={CY} rx={45} ry={33} kit={kit} />
          <Circle cx={48} cy={CY} r={20} fill={c.card} stroke={c.chartMuted} strokeWidth={1.2} />
          {cells[0]!.map((ch, k) => (
            <Chromatin
              key={k}
              x={k % 2 ? 55 : 40}
              y={CY - 10 + Math.floor(k / 2) * 9}
              ch={ch}
              c={c}
            />
          ))}
          <Circle cx={56} cy={CY + 9} r={3} fill={c.chartMuted} />
          <Centrosome x={48} y={CY - 25} c={c} />
        </G>
      );
    case 'prophase':
    case 'prophase I': {
      const tetrads = f.stage === 'prophase I';
      return (
        <G>
          <Cell x={48} y={CY} rx={45} ry={35} kit={kit} />
          <Circle
            cx={48}
            cy={CY}
            r={26}
            fill="none"
            stroke={c.chartMuted}
            strokeWidth={1.2}
            strokeDasharray="3 3"
          />
          <Centrosome x={12} y={CY} c={c} aster />
          <Centrosome x={84} y={CY} c={c} aster />
          {tetrads
            ? pairsOf(cells[0]!).map(([a, b], k, all) => {
                const y = stack(all.length, 14, CY)[k]!;
                return (
                  <G key={k}>
                    <Dup x={48} y={y - 2.2} ch={a} scale={1.2} c={c} />
                    <Dup x={48} y={y + 2.2} ch={b} scale={1.2} c={c} />
                  </G>
                );
              })
            : cells[0]!.map((ch, k, all) => {
                const rows = Math.ceil(all.length / 2);
                const y = stack(rows, 11, CY)[Math.floor(k / 2)]!;
                return <Dup key={k} x={k % 2 ? 58 : 38} y={y} ch={ch} scale={0.7} c={c} />;
              })}
        </G>
      );
    }
    case 'metaphase':
    case 'metaphase I': {
      const pairsOn = f.stage === 'metaphase I';
      const chs = cells[0]!;
      const items = pairsOn ? pairsOf(chs) : chs.map((ch) => [ch] as const);
      const { ys, s } = column(items.map((it) => it[0]!.pair));
      return (
        <G>
          <Cell x={48} y={CY} rx={46} ry={35} kit={kit} />
          <Plate x={48} c={c} />
          <Centrosome x={6} y={CY} c={c} />
          <Centrosome x={90} y={CY} c={c} />
          {items.map((it, k) => {
            const y = ys[k]!;
            if (it.length === 1) {
              return (
                <G key={k}>
                  <Fiber a={[6, CY]} b={[48, y]} c={c} />
                  <Fiber a={[90, CY]} b={[48, y]} c={c} />
                  <Dup x={48} y={y} ch={it[0]!} scale={s} vertical c={c} />
                </G>
              );
            }
            // A tetrad on the plate: one homolog each side, each pulled by one pole.
            const [l, r] = assorted(it[0]!, it[1]!);
            return (
              <G key={k}>
                <Fiber a={[6, CY]} b={[43, y]} c={c} />
                <Fiber a={[90, CY]} b={[53, y]} c={c} />
                <Dup x={43} y={y} ch={l} scale={s} vertical c={c} />
                <Dup x={53} y={y} ch={r} scale={s} vertical c={c} />
              </G>
            );
          })}
        </G>
      );
    }
    case 'anaphase':
    case 'anaphase I': {
      const dup = f.stage === 'anaphase I';
      return (
        <G>
          <Cell x={48} y={CY} rx={47} ry={32} kit={kit} />
          <Centrosome x={5} y={CY} c={c} />
          <Centrosome x={91} y={CY} c={c} />
          {[0, 1].map((side) => {
            const group = cells[side]!;
            const x = side ? 70 : 26;
            const pole = side ? 91 : 5;
            const fit = column(group.map((ch) => ch.pair));
            const ys = dup ? fit.ys : stack(group.length, 8, CY);
            return (
              <G key={side}>
                {group.map((ch, k) => (
                  <G key={k}>
                    <Fiber a={[pole, CY]} b={[x, ys[k]!]} c={c} />
                    {dup ? (
                      <Dup x={x} y={ys[k]!} ch={ch} scale={fit.s} vertical c={c} />
                    ) : (
                      <Single x={x} y={ys[k]!} ch={ch} dir={side ? -1 : 1} scale={1} c={c} />
                    )}
                  </G>
                ))}
              </G>
            );
          })}
        </G>
      );
    }
    case 'telophase':
    case 'telophase I': {
      const dup = f.stage === 'telophase I';
      return (
        <G>
          <Pinched kit={kit} />
          {[0, 1].map((side) => {
            const x = side ? 71 : 25;
            const group = cells[side]!;
            return (
              <G key={side}>
                {dup ? null : (
                  <Circle
                    cx={x}
                    cy={CY}
                    r={15}
                    fill="none"
                    stroke={c.chartMuted}
                    strokeWidth={1}
                    strokeDasharray="3 2"
                  />
                )}
                <Group group={group} x={x} dup={dup} c={c} />
              </G>
            );
          })}
        </G>
      );
    }
    case 'cytokinesis':
    case 'prophase II':
      return (
        <G>
          {[0, 1].map((side) => {
            const x = side ? 72 : 24;
            return (
              <G key={side}>
                <Cell x={x} y={CY} rx={22} ry={28} kit={kit} />
                {f.stage === 'cytokinesis' ? (
                  <Circle
                    cx={x}
                    cy={CY}
                    r={14}
                    fill={c.card}
                    stroke={c.chartMuted}
                    strokeWidth={1}
                  />
                ) : null}
                <Group group={cells[side]!} x={x} dup={f.stage === 'prophase II'} c={c} />
              </G>
            );
          })}
        </G>
      );
    case 'metaphase II':
      return (
        <G>
          {[0, 1].map((side) => {
            const x = side ? 72 : 24;
            const group = cells[side]!;
            const { ys, s } = column(
              group.map((ch) => ch.pair),
              44,
            );
            return (
              <G key={side}>
                <Cell x={x} y={CY} rx={22} ry={30} kit={kit} />
                <Plate x={x} c={c} short />
                {group.map((ch, k) => (
                  <G key={k}>
                    <Fiber a={[x - 20, CY]} b={[x, ys[k]!]} c={c} />
                    <Fiber a={[x + 20, CY]} b={[x, ys[k]!]} c={c} />
                    <Dup x={x} y={ys[k]!} ch={ch} scale={s} vertical c={c} />
                  </G>
                ))}
              </G>
            );
          })}
        </G>
      );
    case 'anaphase II':
      return (
        <G>
          {[0, 1].map((side) => {
            const x = side ? 72 : 24;
            return (
              <G key={side}>
                <Cell x={x} y={CY} rx={23} ry={26} kit={kit} />
                {[0, 1].map((half) => {
                  const group = cells[side * 2 + half]!;
                  const gx = x + (half ? 14 : -14);
                  const ys = stack(group.length, 8, CY);
                  return group.map((ch, k) => (
                    <G key={`${half}${k}`}>
                      <Fiber a={[x + (half ? 21 : -21), CY]} b={[gx, ys[k]!]} c={c} />
                      <Single x={gx} y={ys[k]!} ch={ch} dir={half ? -1 : 1} scale={0.5} c={c} />
                    </G>
                  ));
                })}
              </G>
            );
          })}
        </G>
      );
    case 'telophase II':
      return (
        <G>
          {cells.map((group, i) => {
            const x = i < 2 ? 24 : 72;
            const y = i % 2 ? 57 : 19;
            const ys = stack(group.length, 7, y);
            return (
              <G key={i}>
                <Cell x={x} y={y} rx={21} ry={17} kit={kit} />
                {group.map((ch, k) => (
                  <Single
                    key={k}
                    x={x - len(ch.pair, 0.8) / 2}
                    y={ys[k]!}
                    ch={ch}
                    dir={1}
                    scale={0.8}
                    c={c}
                  />
                ))}
              </G>
            );
          })}
        </G>
      );
  }
}

/** Centers of `n` items stacked around `cy`, each `size` tall (a number, or one per item). */
function stack(n: number, size: number | number[], cy: number): number[] {
  const sizes = Array.from({ length: n }, (_, k) => (typeof size === 'number' ? size : size[k]!));
  const total = sizes.reduce((s, x) => s + x, 0);
  let y = cy - total / 2;
  return sizes.map((s) => {
    y += s;
    return y - s / 2;
  });
}

/** Upright chromosomes stacked down the plate, shrunk to fit its 62 px: centers and scale. */
function column(pairs: number[], room = 62) {
  const s = Math.min(1, room / pairs.reduce((sum, p) => sum + len(p, 1) * 2 + 3, 0));
  return {
    ys: stack(
      pairs.length,
      pairs.map((p) => len(p, s) * 2 + 3),
      CY,
    ),
    s,
  };
}

/** The chromosomes of a cell as homologous pairs [maternal, paternal]. */
const pairsOf = (chs: Chromosome[]) => {
  const out: [Chromosome, Chromosome][] = [];
  for (const ch of chs) {
    const mate = out.find(([a]) => a.pair === ch.pair);
    if (!mate) out.push([ch, ch]);
    else mate[1] = ch;
  }
  return out;
};

/** Which homolog of a pair lines up on the left (the same assortment as divisionMath). */
const assorted = (m: Chromosome, p: Chromosome): [Chromosome, Chromosome] =>
  m.pair % 2 === 0 ? [m, p] : [p, m];

function Cell({
  x,
  y,
  rx,
  ry,
  kit,
}: {
  x: number;
  y: number;
  rx: number;
  ry: number;
  kit: { c: Palette; ink: string };
}) {
  return (
    <Ellipse
      cx={x}
      cy={y}
      rx={rx}
      ry={ry}
      fill={kit.c.chartSurface}
      stroke={kit.ink}
      strokeWidth={1.3}
      opacity={0.95}
    />
  );
}

/** A cell pinching in two: two lobes, the furrow between them. */
function Pinched({ kit }: { kit: { c: Palette; ink: string } }) {
  const lobes = [25, 71];
  return (
    <G>
      {lobes.map((x) => (
        <Ellipse
          key={x}
          cx={x}
          cy={CY}
          rx={25}
          ry={30}
          fill="none"
          stroke={kit.ink}
          strokeWidth={1.3}
        />
      ))}
      {lobes.map((x) => (
        <Ellipse key={`f${x}`} cx={x} cy={CY} rx={24.3} ry={29.3} fill={kit.c.chartSurface} />
      ))}
    </G>
  );
}

function Plate({ x, c, short }: { x: number; c: Palette; short?: boolean }) {
  const h = short ? 26 : 32;
  return (
    <Line
      x1={x}
      y1={CY - h}
      x2={x}
      y2={CY + h}
      stroke={c.chartMuted}
      strokeWidth={0.8}
      strokeDasharray="2 2"
    />
  );
}

function Fiber({ a, b, c }: { a: [number, number]; b: [number, number]; c: Palette }) {
  return <Line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={c.bioSpindle} strokeWidth={0.8} />;
}

/** A centrosome (a pair of centrioles), with an aster of short rays when the spindle starts. */
function Centrosome({ x, y, c, aster }: { x: number; y: number; c: Palette; aster?: boolean }) {
  return (
    <G>
      {aster
        ? Array.from({ length: 8 }, (_, k) => {
            const t = (k * Math.PI) / 4;
            return (
              <Line
                key={k}
                x1={x + 3 * Math.cos(t)}
                y1={y + 3 * Math.sin(t)}
                x2={x + 7 * Math.cos(t)}
                y2={y + 7 * Math.sin(t)}
                stroke={c.bioSpindle}
                strokeWidth={0.8}
              />
            );
          })
        : null}
      <Circle cx={x} cy={y} r={2} fill={c.chartMuted} />
    </G>
  );
}

const colorOf = (p: 'm' | 'p', c: Palette) => (p === 'm' ? c.bioMaternal : c.bioPaternal);

/** One chromatid as a rod from (x0, y0) to (x1, y1), its last third in the tip's color. */
function Rod({
  x0,
  y0,
  x1,
  y1,
  ch,
  c,
  w = 2.8,
}: {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  ch: Chromatid;
  c: Palette;
  w?: number;
}) {
  const [mx, my] = [x0 + (x1 - x0) * 0.62, y0 + (y1 - y0) * 0.62];
  return (
    <G>
      <Line
        x1={x0}
        y1={y0}
        x2={x1}
        y2={y1}
        stroke={colorOf(ch.parent, c)}
        strokeWidth={w}
        strokeLinecap="round"
      />
      {ch.tip !== ch.parent ? (
        <Line
          x1={mx}
          y1={my}
          x2={x1}
          y2={y1}
          stroke={colorOf(ch.tip, c)}
          strokeWidth={w}
          strokeLinecap="round"
        />
      ) : null}
    </G>
  );
}

/** A duplicated chromosome: two sister chromatids joined at the centromere (x, y). */
function Dup({
  x,
  y,
  ch,
  scale,
  vertical,
  c,
}: {
  x: number;
  y: number;
  ch: Chromosome;
  scale: number;
  vertical?: boolean;
  c: Palette;
}) {
  const L = len(ch.pair, scale);
  return (
    <G>
      {ch.chromatids.map((t, i) => {
        const o = i ? 1.7 : -1.7;
        return vertical ? (
          <G key={i}>
            <Rod x0={x + o} y0={y} x1={x + o * 1.4} y1={y - L} ch={{ ...t, tip: t.parent }} c={c} />
            <Rod x0={x + o} y0={y} x1={x + o * 1.4} y1={y + L} ch={t} c={c} />
          </G>
        ) : (
          <G key={i}>
            <Rod x0={x} y0={y + o} x1={x - L} y1={y + o * 1.4} ch={{ ...t, tip: t.parent }} c={c} />
            <Rod x0={x} y0={y + o} x1={x + L} y1={y + o * 1.4} ch={t} c={c} />
          </G>
        );
      })}
      <Circle cx={x} cy={y} r={1.3} fill={c.chartInk} />
    </G>
  );
}

/** One chromatid pulled by its centromere (at x), its arm trailing in direction `dir`. */
function Single({
  x,
  y,
  ch,
  dir,
  scale,
  c,
}: {
  x: number;
  y: number;
  ch: Chromosome;
  dir: 1 | -1;
  scale: number;
  c: Palette;
}) {
  const L = len(ch.pair, scale) * 1.6;
  return (
    <G>
      <Rod x0={x} y0={y} x1={x + dir * L} y1={y} ch={ch.chromatids[0]!} c={c} w={2.6} />
      <Circle cx={x} cy={y} r={1.2} fill={c.chartInk} />
    </G>
  );
}

/** A cell's chromosomes stacked round its middle: duplicated (X) or single rods. */
function Group({ group, x, dup, c }: { group: Chromosome[]; x: number; dup: boolean; c: Palette }) {
  const ys = stack(group.length, dup ? 9 : 7, CY);
  return (
    <G>
      {group.map((ch, k) =>
        dup ? (
          <Dup key={k} x={x} y={ys[k]!} ch={ch} scale={0.8} c={c} />
        ) : (
          <Single
            key={k}
            x={x - len(ch.pair, 0.6) * 0.8}
            y={ys[k]!}
            ch={ch}
            dir={1}
            scale={0.6}
            c={c}
          />
        ),
      )}
    </G>
  );
}

/** Loose chromatin in interphase: a thin wavy thread in its parent's color. */
function Chromatin({ x, y, ch, c }: { x: number; y: number; ch: Chromosome; c: Palette }) {
  const L = len(ch.pair, 1);
  const d = `M ${x - L / 2} ${y} q ${L / 8} -4 ${L / 4} 0 t ${L / 4} 0 t ${L / 4} 0 t ${L / 4} 0`;
  return (
    <Path
      d={d}
      stroke={colorOf(ch.chromatids[0]!.parent, c)}
      strokeWidth={1.3}
      fill="none"
      strokeLinecap="round"
    />
  );
}
