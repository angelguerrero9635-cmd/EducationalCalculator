/**
 * H31 `macromolecules` explore figure (HS group G): monomers joining into a polymer by
 * dehydration synthesis, one water molecule given off per new bond, or the polymer split by
 * hydrolysis. Glucose rings (the ring oxygen at the back right, as in a Haworth ring) join
 * C1–O–C4 into starch; amino acids join carboxyl to amine (peptide bonds) and the chain folds;
 * nucleotides join a sugar's 3′ OH to the next phosphate, so the strand runs from a free
 * phosphate to a free OH; glycerol takes three fatty acids by ester bonds (a fat, not a polymer).
 * Flat, like every structure diagram; the groups that join are lit in the monomers, the new bonds
 * in the polymer, and the water molecules are counted exactly.
 */
import type { ReactNode } from 'react';
import { Circle, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import { watersOf, type MacroScene } from '@/data/modules/typesHsg';
import { formatNumber } from '@/engine/format';
import { chart, usePalette, type Palette } from '@/theme';

import { ChartText } from '../reps/common';
import { BOARD_W, Board, CurveArrow, HaloText } from './earthKit';

/** Monomer and polymer names, by kind and chain length. */
const NAMES: Record<MacroScene['kind'], { mono: (n: string) => string; poly: string[] }> = {
  carbohydrate: {
    mono: (n) => `${n} glucose molecules (monosaccharides)`,
    poly: ['Maltose, a disaccharide', 'Part of a starch chain (a polysaccharide)'],
  },
  protein: {
    mono: (n) => `${n} amino acids`,
    poly: ['A dipeptide', 'A polypeptide chain, folded into a protein'],
  },
  nucleicAcid: {
    mono: (n) => `${n} nucleotides`,
    poly: ['Two nucleotides joined', 'Part of a DNA strand (a nucleic acid)'],
  },
  lipid: {
    mono: () => 'Glycerol and 3 fatty acids',
    poly: ['A fat (a triglyceride), not a polymer'],
  },
};

/** Height of a monomer row and a polymer row, and where each is drawn from its top, by kind. */
const ROW: Record<MacroScene['kind'], { mono: [number, number]; poly: [number, number] }> = {
  carbohydrate: { mono: [44, 22], poly: [74, 20] },
  protein: { mono: [54, 26], poly: [84, 34] },
  nucleicAcid: { mono: [70, 38], poly: [100, 40] },
  lipid: { mono: [112, 58], poly: [112, 58] },
};

const ARROW_H = 76;
const TITLE = 26;

/**
 * `total` (H100, the calculator picture): the monomers a value holds. Past 4 the figure draws the
 * first two and the last with "…" between them, and writes the count and the water given off;
 * `faded` draws a count not typed yet ("?"). Without them the explore figure is as it was.
 */
export function MacroFigure({
  macro,
  total,
  faded,
}: {
  macro: MacroScene;
  total?: number;
  faded?: boolean;
}) {
  const c = usePalette();
  const kind = macro.kind;
  const lipid = kind === 'lipid';
  // A long chain draws its first two units and its last, "…" between.
  const n = lipid ? 3 : (total ?? 0) > 4 ? 3 : Math.min(4, Math.max(2, total ?? macro.count ?? 3));
  const count = lipid || total === undefined ? n : total;
  const elide = !lipid && count > 4;
  const waters = lipid || total === undefined ? watersOf(macro) : Math.max(0, total - 1);
  const split = !!macro.split;
  const { mono, poly } = ROW[kind];
  const [[hTop, cTop], [hBottom, cBottom]] = split ? [poly, mono] : [mono, poly];
  const yTop = TITLE + 8;
  const yArrow = yTop + hTop + 4;
  const yBottomTitle = yArrow + ARROW_H + 10;
  const yBottom = yBottomTitle + TITLE - 8;
  const height = yBottom + hBottom + 10;
  const monoTitle = NAMES[kind].mono(faded ? '?' : formatNumber(count));
  const polyTitle = NAMES[kind].poly[count === 2 || lipid ? 0 : 1]!;
  const monomers = (y: number) => (
    <Monomers kind={kind} n={n} y={y} lit={!split} elide={elide} c={c} />
  );
  const polymer = (y: number) => (
    <Polymer kind={kind} n={n} y={y} fold={!split} elide={elide} c={c} />
  );
  return (
    <Board height={height}>
      <G opacity={faded ? 0.35 : 1}>
        <Title y={TITLE - 6} text={split ? polyTitle : monoTitle} c={c} />
        {split ? polymer(yTop + cTop) : monomers(yTop + cTop)}
        <ArrowStage y={yArrow} split={split} waters={waters} faded={faded} c={c} />
        <Title y={yBottomTitle + 4} text={split ? monoTitle : polyTitle} c={c} />
        {split ? monomers(yBottom + cBottom) : polymer(yBottom + cBottom)}
      </G>
    </Board>
  );
}

/** Extra room where a long chain is elided ("…" before the last unit). */
const ELIDE = 26;
/** x of unit i: `pitch` apart from `x0`, the last pushed on past the "…" when elided. */
const spread = (n: number, x0: number, pitch: number, elide: boolean) =>
  Array.from({ length: n }, (_, i) => x0 + i * pitch + (elide && i === n - 1 ? ELIDE : 0));

/** The "…" of an elided chain, centered at x. */
function Dots({ x, y, c }: { x: number; y: number; c: Palette }) {
  return (
    <ChartText
      x={x}
      y={y}
      fontSize={chart.emphasis + 2}
      fontWeight="800"
      textAnchor="middle"
      fill={c.chartInk}
    >
      …
    </ChartText>
  );
}

function Title({ y, text, c }: { y: number; text: string; c: Palette }) {
  return (
    <ChartText
      x={BOARD_W / 2}
      y={y}
      fontSize={chart.emphasis}
      fontWeight="700"
      textAnchor="middle"
      fill={c.chartInk}
    >
      {text}
    </ChartText>
  );
}

/** The reaction arrow, its name, and the water molecules given off (or taken in), counted. */
function ArrowStage({
  y,
  split,
  waters,
  faded,
  c,
}: {
  y: number;
  split: boolean;
  waters: number;
  faded?: boolean;
  c: Palette;
}) {
  const x = 48;
  const words = `${faded ? '?' : formatNumber(waters)} H₂O ${split ? 'added' : 'given off'}`;
  const wx = 70 + words.length * chart.value * 0.58 + 22;
  // Past 4 the first three are drawn, then "…" (the count is written).
  const drawn = waters > 4 ? 3 : waters;
  return (
    <G>
      <CurveArrow a={[x, y + 6]} b={[x, y + ARROW_H - 6]} c={c} color={c.chartInk} halo={false} />
      <ChartText x={70} y={y + 26} fontSize={chart.value} fontWeight="700" fill={c.chartInk}>
        {split ? 'Hydrolysis: water breaks each bond' : 'Dehydration synthesis: a bond forms'}
      </ChartText>
      <ChartText x={70} y={y + 54} fontSize={chart.value} fill={c.chartInk}>
        {words}
      </ChartText>
      {Array.from({ length: drawn }, (_, i) => (
        <Water key={i} x={wx + i * 26} y={y + 48} c={c} />
      ))}
      {drawn < waters ? <Dots x={wx + drawn * 26 + 2} y={y + 54} c={c} /> : null}
    </G>
  );
}

/** A water molecule, ball and stick: oxygen red, two hydrogens white at 104.5°. */
function Water({ x, y, c }: { x: number; y: number; c: Palette }) {
  const a = (52.25 * Math.PI) / 180;
  const h = [-1, 1].map((s) => [x + s * 9 * Math.sin(a), y + 9 * Math.cos(a)] as const);
  return (
    <G>
      {h.map(([hx, hy], i) => (
        <Line key={i} x1={x} y1={y} x2={hx} y2={hy} stroke={c.atomBond} strokeWidth={2} />
      ))}
      {h.map(([hx, hy], i) => (
        <Circle
          key={`h${i}`}
          cx={hx}
          cy={hy}
          r={4}
          fill={c.atomH}
          stroke={c.chartMuted}
          strokeWidth={1}
        />
      ))}
      <Circle cx={x} cy={y} r={6.5} fill={c.atomO} stroke={c.chartMuted} strokeWidth={1} />
    </G>
  );
}

/** Text for a group of atoms; lit (the highlight) when it joins in the reaction. */
function Group({
  x,
  y,
  text,
  anchor,
  lit,
  c,
}: {
  x: number;
  y: number;
  text: string;
  anchor: 'start' | 'middle' | 'end';
  lit?: boolean;
  c: Palette;
}) {
  return (
    <ChartText
      x={x}
      y={y + 4.5}
      fontSize={chart.label}
      fontWeight={lit ? '800' : '600'}
      textAnchor={anchor}
      fill={lit ? c.chartHighlight : c.chartInk}
    >
      {text}
    </ChartText>
  );
}

/** A labelled atom disc (the ring O, a bridge O, a C). */
function Atom({
  x,
  y,
  text,
  ring,
  c,
  r = 7.5,
}: {
  x: number;
  y: number;
  text: string;
  ring: string;
  c: Palette;
  r?: number;
}) {
  return (
    <G>
      <Circle cx={x} cy={y} r={r} fill={c.card} stroke={ring} strokeWidth={chart.strokeLight} />
      <ChartText x={x} y={y + 4.2} fontSize={chart.label} fontWeight="700" textAnchor="middle">
        {text}
      </ChartText>
    </G>
  );
}

// ─── Glucose ─────────────────────────────────────────────────────────────────

const RING = 14;
const hexPoints = (cx: number, cy: number) =>
  Array.from({ length: 6 }, (_, k) => {
    const t = (k * Math.PI) / 3;
    return `${cx + RING * Math.cos(t)},${cy - RING * Math.sin(t)}`;
  }).join(' ');

function GlucoseRing({ cx, cy, c }: { cx: number; cy: number; c: Palette }) {
  const ox = cx + RING * Math.cos(Math.PI / 3);
  const oy = cy - RING * Math.sin(Math.PI / 3);
  return (
    <G>
      <Polygon
        points={hexPoints(cx, cy)}
        fill={c.bioSugar}
        stroke={c.bioSugarEdge}
        strokeWidth={chart.stroke}
      />
      <Atom x={ox} y={oy} text="O" ring={c.atomO} c={c} r={6.5} />
    </G>
  );
}

// ─── Amino acids ─────────────────────────────────────────────────────────────

/** A different side chain on each amino acid. */
const sideColors = (c: Palette) => [c.chartSecond, c.bioSolute, c.dnaA, c.bioPhosphate];

function AminoAcid({ cx, cy, i, c }: { cx: number; cy: number; i: number; c: Palette }) {
  const r = sideColors(c)[i % 4]!;
  return (
    <G>
      <Line x1={cx} y1={cy} x2={cx} y2={cy - 22} stroke={c.chartInk} strokeWidth={chart.stroke} />
      <Circle cx={cx} cy={cy - 24} r={9} fill={r} stroke={c.chartInk} strokeWidth={1} />
      <ChartText
        x={cx}
        y={cy - 19.8}
        fontSize={chart.label}
        fontWeight="700"
        textAnchor="middle"
        fill={c.bioInk}
      >
        R
      </ChartText>
      <Circle
        cx={cx}
        cy={cy}
        r={10}
        fill={c.bioAmino}
        stroke={c.bioAminoEdge}
        strokeWidth={chart.strokeLight}
      />
      <ChartText
        x={cx}
        y={cy + 4.2}
        fontSize={chart.label}
        fontWeight="700"
        textAnchor="middle"
        fill={c.bioInk}
      >
        C
      </ChartText>
    </G>
  );
}

/** A folded chain: a helix coil and a turn back, beads on it. */
function Folded({ x, y, c }: { x: number; y: number; c: Palette }) {
  const pts: [number, number][] = [];
  for (let k = 0; k <= 40; k++) {
    const t = k / 40;
    pts.push([x + t * 56 + 9 * Math.cos(t * 6 * Math.PI), y - 12 + 11 * Math.sin(t * 6 * Math.PI)]);
  }
  const d =
    `M ${pts.map(([a, b]) => `${a.toFixed(1)} ${b.toFixed(1)}`).join(' L ')}` +
    ` C ${x + 90} ${y - 10} ${x + 92} ${y + 26} ${x + 50} ${y + 22} S ${x - 4} ${y + 30} ${x + 6} ${y + 12}`;
  return (
    <G>
      <Path
        d={d}
        stroke={c.bioAminoEdge}
        strokeWidth={chart.strokeHeavy}
        fill="none"
        strokeLinecap="round"
      />
      {[0.1, 0.35, 0.6, 0.85].map((t, i) => {
        const p = pts[Math.round(t * 40)]!;
        return (
          <Circle
            key={i}
            cx={p[0]}
            cy={p[1]}
            r={4}
            fill={sideColors(c)[i]!}
            stroke={c.chartInk}
            strokeWidth={1}
          />
        );
      })}
    </G>
  );
}

// ─── Nucleotides ─────────────────────────────────────────────────────────────

const BASES = ['A', 'T', 'G', 'C'] as const;
const baseColor = (b: string, c: Palette) =>
  b === 'A' ? c.dnaA : b === 'T' ? c.dnaT : b === 'G' ? c.dnaG : c.dnaC;

const pentagon = (cx: number, cy: number, r = 11) =>
  Array.from({ length: 5 }, (_, k) => {
    const t = -Math.PI / 2 + (k * 2 * Math.PI) / 5;
    return `${cx + r * Math.cos(t)},${cy + r * Math.sin(t)}`;
  }).join(' ');

/** Phosphate (left, up), sugar, and the base hanging below. */
function Nucleotide({
  cx,
  cy,
  base,
  phosphate = true,
  c,
}: {
  cx: number;
  cy: number;
  base: string;
  phosphate?: boolean;
  c: Palette;
}) {
  return (
    <G>
      <Line x1={cx} y1={cy} x2={cx} y2={cy + 20} stroke={c.chartInk} strokeWidth={chart.stroke} />
      <Rect
        x={cx - 10}
        y={cy + 18}
        width={20}
        height={20}
        rx={3}
        fill={baseColor(base, c)}
        stroke={c.chartInk}
        strokeWidth={1}
      />
      <ChartText
        x={cx}
        y={cy + 32.5}
        fontSize={chart.label}
        fontWeight="800"
        textAnchor="middle"
        fill={c.bioInk}
      >
        {base}
      </ChartText>
      <Polygon
        points={pentagon(cx, cy)}
        fill={c.bioSugar}
        stroke={c.bioSugarEdge}
        strokeWidth={chart.strokeLight}
      />
      {phosphate ? (
        <G>
          <Line
            x1={cx - 9}
            y1={cy - 4}
            x2={cx - 20}
            y2={cy - 14}
            stroke={c.chartInk}
            strokeWidth={chart.stroke}
          />
          <Circle
            cx={cx - 22}
            cy={cy - 16}
            r={9}
            fill={c.bioPhosphate}
            stroke={c.chartInk}
            strokeWidth={1}
          />
          <ChartText
            x={cx - 22}
            y={cy - 11.8}
            fontSize={chart.label}
            fontWeight="800"
            textAnchor="middle"
            fill={c.bioInk}
          >
            P
          </ChartText>
        </G>
      ) : null}
    </G>
  );
}

// ─── Glycerol and fatty acids ────────────────────────────────────────────────

const ZIG = 8;
function Tail({ x, y, c }: { x: number; y: number; c: Palette }) {
  const d = `M ${x} ${y} ${Array.from(
    { length: ZIG },
    (_, k) => `L ${x + (k + 1) * 11} ${y + (k % 2 ? 0 : 6)}`,
  ).join(' ')}`;
  return (
    <G>
      <Path
        d={d}
        stroke={c.bioFatty}
        strokeWidth={6}
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d={d}
        stroke={c.chartInk}
        strokeWidth={1.2}
        strokeLinejoin="round"
        fill="none"
        opacity={0.6}
      />
    </G>
  );
}

function Glycerol({ x, y, c }: { x: number; y: number; c: Palette }) {
  return (
    <G>
      <Rect
        x={x - 12}
        y={y - 48}
        width={24}
        height={96}
        rx={8}
        fill={c.bioGlycerol}
        stroke={c.chartInk}
        strokeWidth={1}
      />
      {[-34, 0, 34].map((d) => (
        <ChartText
          key={d}
          x={x}
          y={y + d + 4.2}
          fontSize={chart.label}
          fontWeight="700"
          textAnchor="middle"
          fill={c.bioInk}
        >
          C
        </ChartText>
      ))}
    </G>
  );
}

/** The carboxyl carbon of a fatty acid, its double-bonded O above. */
function Carboxyl({ x, y, c }: { x: number; y: number; c: Palette }) {
  return (
    <G>
      <Line
        x1={x - 1.6}
        y1={y - 7}
        x2={x - 1.6}
        y2={y - 12}
        stroke={c.chartInk}
        strokeWidth={1.2}
      />
      <Line
        x1={x + 1.6}
        y1={y - 7}
        x2={x + 1.6}
        y2={y - 12}
        stroke={c.chartInk}
        strokeWidth={1.2}
      />
      <ChartText
        x={x}
        y={y - 13}
        fontSize={chart.label}
        fontWeight="700"
        textAnchor="middle"
        fill={c.atomO}
      >
        O
      </ChartText>
      <Circle cx={x} cy={y} r={7} fill={c.bioFatty} stroke={c.chartInk} strokeWidth={1} />
      <ChartText
        x={x}
        y={y + 4.2}
        fontSize={chart.label}
        fontWeight="700"
        textAnchor="middle"
        fill={c.bioInk}
      >
        C
      </ChartText>
    </G>
  );
}

// ─── Rows ────────────────────────────────────────────────────────────────────

/** The monomers side by side; `lit`: the groups that will join, in the highlight. */
function Monomers({
  kind,
  n,
  y,
  lit,
  elide = false,
  c,
}: {
  kind: MacroScene['kind'];
  n: number;
  y: number;
  lit: boolean;
  elide?: boolean;
  c: Palette;
}): ReactNode {
  const slot = (BOARD_W - 20 - (elide ? ELIDE : 0)) / n;
  const xs = spread(n, 10 + slot / 2, slot, elide);
  const dots = elide ? <Dots x={(xs[n - 2]! + xs[n - 1]!) / 2} y={y + 6} c={c} /> : null;
  const joins = (i: number, side: 'left' | 'right') => lit && (side === 'left' ? i > 0 : i < n - 1);
  // Each monomer on its own card: separate molecules until they join.
  const card = (x: number, top: number, bottom: number) => (
    <Rect
      x={x - slot / 2 + 3}
      y={top}
      width={slot - 6}
      height={bottom - top}
      rx={8}
      fill={c.chartSurface}
      stroke={c.chartGrid}
      strokeWidth={1}
    />
  );
  switch (kind) {
    case 'carbohydrate':
      return (
        <G>
          {dots}
          {xs.map((x, i) => (
            <G key={i}>
              {card(x, y - 21, y + 21)}
              <GlucoseRing cx={x} cy={y} c={c} />
              <Group x={x - RING - 2} y={y} text="HO" anchor="end" lit={joins(i, 'left')} c={c} />
              <Group
                x={x + RING + 2}
                y={y}
                text="OH"
                anchor="start"
                lit={joins(i, 'right')}
                c={c}
              />
            </G>
          ))}
        </G>
      );
    case 'protein':
      return (
        <G>
          {dots}
          {xs.map((x, i) => (
            <G key={i}>
              {card(x, y - 25, y + 26)}
              <AminoAcid cx={x - 4} cy={y + 12} i={i} c={c} />
              <Group x={x - 16} y={y + 12} text="H₂N" anchor="end" lit={joins(i, 'left')} c={c} />
              <Group
                x={x + 8}
                y={y + 12}
                text="COOH"
                anchor="start"
                lit={joins(i, 'right')}
                c={c}
              />
            </G>
          ))}
        </G>
      );
    case 'nucleicAcid':
      return (
        <G>
          {dots}
          {xs.map((x, i) => (
            <G key={i}>
              {card(x, y - 36, y + 34)}
              <Nucleotide cx={x + 6} cy={y - 8} base={BASES[i % 4]!} c={c} />
              <Group x={x + 18} y={y - 8} text="OH" anchor="start" lit={joins(i, 'right')} c={c} />
              {joins(i, 'left') ? (
                <Circle
                  cx={x - 16}
                  cy={y - 24}
                  r={12}
                  fill="none"
                  stroke={c.chartHighlight}
                  strokeWidth={chart.stroke}
                />
              ) : null}
            </G>
          ))}
        </G>
      );
    case 'lipid':
      return (
        <G>
          <Glycerol x={46} y={y} c={c} />
          {[-34, 0, 34].map((d) => (
            <G key={d}>
              <Group x={60} y={y + d} text="OH" anchor="start" lit={lit} c={c} />
              <Group x={150} y={y + d} text="HO" anchor="end" lit={lit} c={c} />
              <Carboxyl x={160} y={y + d} c={c} />
              <Tail x={167} y={y + d - 3} c={c} />
            </G>
          ))}
        </G>
      );
  }
}

/** The polymer (or the fat), its new bonds lit. */
function Polymer({
  kind,
  n,
  y,
  fold,
  elide = false,
  c,
}: {
  kind: MacroScene['kind'];
  n: number;
  y: number;
  fold: boolean;
  elide?: boolean;
  c: Palette;
}): ReactNode {
  const bond = { stroke: c.chartHighlight, strokeWidth: chart.strokeHeavy };
  const gap = elide ? ELIDE : 0;
  /** The last link of an elided chain: short stubs either side of "…". */
  const elided = (i: number) => elide && i === n - 2;
  switch (kind) {
    case 'carbohydrate': {
      const pitch = 58;
      const span = (n - 1) * pitch + gap;
      const x0 = BOARD_W / 2 - span / 2;
      const xs = spread(n, x0, pitch, elide);
      return (
        <G>
          {xs.slice(1).map((x, i) => {
            const a = xs[i]! + RING;
            const b = x - RING;
            if (elided(i))
              return (
                <G key={i}>
                  <Line x1={a} y1={y} x2={a + 8} y2={y} {...bond} />
                  <Line x1={b - 8} y1={y} x2={b} y2={y} {...bond} />
                  <Dots x={(a + b) / 2} y={y + 5} c={c} />
                </G>
              );
            return (
              <G key={i}>
                <Line x1={a} y1={y} x2={b} y2={y} {...bond} />
                <Atom x={(a + b) / 2} y={y} text="O" ring={c.chartHighlight} c={c} />
              </G>
            );
          })}
          {xs.map((x, i) => (
            <GlucoseRing key={i} cx={x} cy={y} c={c} />
          ))}
          <Group x={xs[0]! - RING - 2} y={y} text="HO" anchor="end" c={c} />
          <Group x={xs[n - 1]! + RING + 2} y={y} text="OH" anchor="start" c={c} />
          <BondLabel x={(xs[0]! + xs[1]!) / 2} y={y + 12} text="glycosidic bond" c={c} />
        </G>
      );
    }
    case 'protein': {
      const pitch = 52;
      const span = (n - 1) * pitch + gap;
      const x0 = fold ? 40 : BOARD_W / 2 - span / 2;
      const xs = spread(n, x0, pitch, elide);
      const cy = y + 6;
      return (
        <G>
          {xs.slice(1).map((x, i) =>
            elided(i) ? (
              <G key={i}>
                <Line x1={xs[i]! + 10} y1={cy} x2={xs[i]! + 16} y2={cy} {...bond} />
                <Line x1={x - 16} y1={cy} x2={x - 10} y2={cy} {...bond} />
                <Dots x={(xs[i]! + x) / 2} y={cy + 5} c={c} />
              </G>
            ) : (
              <Line key={i} x1={xs[i]! + 10} y1={cy} x2={x - 10} y2={cy} {...bond} />
            ),
          )}
          {xs.map((x, i) => (
            <AminoAcid key={i} cx={x} cy={cy} i={i} c={c} />
          ))}
          <Group x={xs[0]! - 12} y={cy} text="H₂N" anchor="end" c={c} />
          <Group x={xs[n - 1]! + 12} y={cy} text="COOH" anchor="start" c={c} />
          <BondLabel x={(xs[0]! + xs[1]!) / 2} y={cy + 10} text="peptide bond" c={c} />
          {fold ? (
            <G>
              <Path
                d={`M ${xs[n - 1]! + 50} ${cy} h 22`}
                stroke={c.chartMuted}
                strokeWidth={chart.strokeLight}
              />
              <Path
                d={`M ${xs[n - 1]! + 67} ${cy - 4} l 5 4 l -5 4`}
                stroke={c.chartMuted}
                strokeWidth={chart.strokeLight}
                fill="none"
              />
              <Folded x={xs[n - 1]! + 84} y={cy} c={c} />
              <ChartText
                x={xs[n - 1]! + 124}
                y={cy + 38}
                fontSize={chart.label}
                textAnchor="middle"
                fill={c.chartMuted}
              >
                folds
              </ChartText>
            </G>
          ) : null}
        </G>
      );
    }
    case 'nucleicAcid': {
      const pitch = 60;
      const span = (n - 1) * pitch + gap;
      const x0 = BOARD_W / 2 - span / 2 + 6;
      const xs = spread(n, x0, pitch, elide);
      const cy = y - 8;
      return (
        <G>
          {xs.slice(1).map((x, i) =>
            elided(i) ? (
              <G key={i}>
                <Line x1={xs[i]! + 10} y1={cy - 3} x2={xs[i]! + 18} y2={cy - 5} {...bond} />
                <Line x1={x - 38} y1={cy - 12} x2={x - 30} y2={cy - 14} {...bond} />
                <Dots x={(xs[i]! + x - 20) / 2} y={cy - 2} c={c} />
              </G>
            ) : (
              <Line key={i} x1={xs[i]! + 10} y1={cy - 3} x2={x - 30} y2={cy - 14} {...bond} />
            ),
          )}
          {xs.map((x, i) => (
            <Nucleotide key={i} cx={x} cy={cy} base={BASES[i % 4]!} c={c} />
          ))}
          <Group x={xs[n - 1]! + 12} y={cy} text="OH" anchor="start" c={c} />
          <ChartText
            x={xs[0]! - 34}
            y={cy - 12}
            fontSize={chart.label}
            fontWeight="700"
            textAnchor="end"
            fill={c.chartMuted}
          >
            5′
          </ChartText>
          <ChartText
            x={xs[n - 1]! + 14}
            y={cy + 18}
            fontSize={chart.label}
            fontWeight="700"
            fill={c.chartMuted}
          >
            3′
          </ChartText>
          <BondLabel
            x={(xs[0]! + xs[1]! - 20) / 2}
            y={cy + 42}
            text="sugar–phosphate bond"
            c={c}
            from={cy - 6}
          />
        </G>
      );
    }
    case 'lipid':
      return (
        <G>
          <Glycerol x={70} y={y} c={c} />
          {[-34, 0, 34].map((d) => (
            <G key={d}>
              <Line x1={82} y1={y + d} x2={124} y2={y + d} {...bond} />
              <Atom x={102} y={y + d} text="O" ring={c.chartHighlight} c={c} />
              <Carboxyl x={132} y={y + d} c={c} />
              <Tail x={139} y={y + d - 3} c={c} />
            </G>
          ))}
          <ChartText
            x={244}
            y={y + 4}
            fontSize={chart.label}
            fontWeight="700"
            fill={c.chartHighlight}
          >
            3 ester bonds
          </ChartText>
        </G>
      );
  }
}

/** A bond's name under it, with a short tick up to the bond. */
function BondLabel({
  x,
  y,
  text,
  c,
  from,
}: {
  x: number;
  y: number;
  text: string;
  c: Palette;
  from?: number;
}) {
  return (
    <G>
      <Line
        x1={x}
        y1={from ?? y - 4}
        x2={x}
        y2={y + 6}
        stroke={c.chartHighlight}
        strokeWidth={1.2}
        strokeDasharray={chart.dashFine}
      />
      <HaloText
        x={x}
        y={y + 20}
        text={text}
        c={c}
        size={chart.label}
        fill={c.chartHighlight}
        bold
      />
    </G>
  );
}
