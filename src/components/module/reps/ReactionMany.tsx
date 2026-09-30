/**
 * H100 `reaction` with `many: true`: up to 18 molecules a formula (photosynthesis for three
 * glucose is 18 CO₂ + 18 H₂O → 3 C₆H₁₂O₆ + 18 O₂). The reactants sit in a row above and the
 * products below, each term a block of molecules in up to three rows, labelled with its
 * coefficient; glucose is drawn as its 24-atom ring (`GLUCOSE`). Under them a row per element
 * counts its atoms on each side as small counters in groups of five, = when they match. An
 * untyped count draws one faded molecule and "?". Without `many` the Grade 7 picture is drawn
 * (`Reaction.tsx`), unchanged.
 */
import type { ReactElement } from 'react';
import { View } from 'react-native';
import Svg, { Defs, G, Line, Path } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import {
  atomsOf,
  elementName,
  elementsIn,
  extentOf,
  moleculeOf,
  parseFormula,
  subscript,
  type Molecule,
} from './chem';
import { Canvas, Caption, ChartText, useRep } from './common';
import { reader } from './graphKit';
import { GLUCOSE } from './glucose';
import { AtomBall, MoleculeArt, useAtomPaint } from './MoleculeArt';

type Spec = Extract<Representation, { kind: 'reaction' }>;

/** Molecules a formula this picture draws. */
export const MANY_MAX = 18;
const PLUS = 18;
const GAP = 4;
const DOT = 3.2;
const STEP = 8;

/** The drawing for a formula: glucose's ring, or the shared layouts. */
const moleculeFor = (formula: string): Molecule => {
  const key = parseFormula(formula)
    .map(({ el, n }) => `${el}${n}`)
    .join('');
  return key === 'C6H12O6' ? GLUCOSE : moleculeOf(formula);
};

export function ReactionMany({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const read = reader(rep);
  const paint = useAtomPaint();
  const terms = [
    ...spec.reactants.map((t) => ({ ...t, side: 0 })),
    ...spec.products.map((t) => ({ ...t, side: 1 })),
  ].map((t) => {
    const r = read(t.count);
    const n = r.known ? Math.max(0, Math.round(r.value)) : undefined;
    const m = moleculeFor(t.formula);
    const [x0, y0, x1, y1] = extentOf(m);
    // Room for the balls past the outer atoms' centers.
    return { ...t, n, text: r.known ? r.text : '?', m, mw: x1 - x0 + 0.9, mh: y1 - y0 + 0.9 };
  });
  const els = elementsIn(terms.map((t) => t.formula));
  const atomsOn = (side: number, el: string) => {
    const ts = terms.filter((t) => t.side === side);
    if (ts.some((t) => t.n === undefined && atomsOf(t.formula, el) > 0)) return undefined;
    return ts.reduce((s, t) => s + atomsOf(t.formula, el) * (t.n ?? 0), 0);
  };
  const label = (t: (typeof terms)[number]) =>
    `${t.text === '1' ? '' : `${t.text} `}${subscript(t.formula)}`;
  const equation = [0, 1]
    .map((side) =>
      terms
        .filter((t) => t.side === side)
        .map(label)
        .join(' + '),
    )
    .join(' → ');
  const rows = els.map((el) => {
    const [b, a] = [atomsOn(0, el), atomsOn(1, el)];
    const work = (side: number) =>
      terms
        .filter((t) => t.side === side && atomsOf(t.formula, el) > 0)
        .map((t) => `${t.text} × ${atomsOf(t.formula, el)}`)
        .join(' + ');
    return {
      el,
      b,
      a,
      line: `${elementName(el)}: ${work(0)} = ${b ?? '?'} before, ${work(1)} = ${a ?? '?'} after`,
    };
  });
  const known = rows.every((r) => r.a !== undefined && r.b !== undefined);
  const off = rows.filter((r) => r.a !== r.b);

  /** A term's block: columns and rows of molecules (at most three rows). */
  const grid = (t: (typeof terms)[number]) => {
    const k = Math.max(1, Math.min(MANY_MAX, t.n ?? 1));
    // A block about twice as wide as it is tall.
    const cols = Math.max(1, Math.min(k, Math.round(Math.sqrt((2 * k * t.mh) / t.mw))));
    return { k, cols, rows: Math.ceil(k / cols) };
  };
  /** The bond length that fits one side's terms across the width. */
  const scaleFor = (w: number, side: number) => {
    const ts = terms.filter((t) => t.side === side);
    const units = ts.reduce((s, t) => s + grid(t).cols * t.mw, 0);
    const gaps = ts.reduce((s, t) => s + grid(t).cols * GAP, 0) + (ts.length - 1) * PLUS;
    return Math.max(5, Math.min(18, (w - 16 - gaps) / units));
  };
  const blockH = (side: number, s: number) =>
    Math.max(...terms.filter((t) => t.side === side).map((t) => grid(t).rows * (t.mh * s + GAP)));
  const perLine = (w: number) => Math.max(5, 5 * Math.floor((w / 2 - 72) / (STEP * 5 + 4)));
  const lines = (n: number | undefined, w: number) => Math.max(1, Math.ceil((n ?? 0) / perLine(w)));
  const layout = (w: number) => {
    const s = Math.min(scaleFor(w, 0), scaleFor(w, 1));
    const h0 = blockH(0, s);
    // "Before" and "After" each sit on a line of their own above their row.
    const h1 = blockH(1, s);
    const top1 = 18 + h0 + 22 + 34;
    const countersY = top1 + h1 + 22 + 14;
    const counters = rows.reduce(
      (sum, r) => sum + 20 + (Math.max(lines(r.b, w), lines(r.a, w)) - 1) * STEP,
      0,
    );
    return { s, h0, h1, top1, countersY, h: countersY + 14 + counters + 4 };
  };

  return (
    <View>
      <Canvas aspect={(w) => layout(w).h / w}>
        {({ w, h }) => {
          const { s, h0, h1, top1, countersY } = layout(w);
          const parts: ReactElement[] = [];
          const side = (sd: number, y0: number, bh: number) => {
            const ts = terms.filter((t) => t.side === sd);
            const widths = ts.map((t) => grid(t).cols * (t.mw * s + GAP));
            const total = widths.reduce((a, b) => a + b, 0) + (ts.length - 1) * PLUS;
            let x = (w - total) / 2;
            ts.forEach((t, i) => {
              if (i > 0) {
                parts.push(
                  <ChartText
                    key={`p${sd}${i}`}
                    x={x + PLUS / 2}
                    y={y0 + bh / 2 + 6}
                    fontSize={chart.emphasis + 2}
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    +
                  </ChartText>,
                );
                x += PLUS;
              }
              const g = grid(t);
              const cw = t.mw * s + GAP;
              const ch = t.mh * s + GAP;
              for (let k = 0; k < g.k; k++) {
                const col = k % g.cols;
                const row = Math.floor(k / g.cols);
                const inRow = Math.min(g.cols, g.k - row * g.cols);
                parts.push(
                  <MoleculeArt
                    key={`m${sd}${i}-${k}`}
                    molecule={t.m}
                    cx={x + ((g.cols - inRow) / 2 + col + 0.5) * cw}
                    cy={y0 + (bh - g.rows * ch) / 2 + (row + 0.5) * ch}
                    scale={s}
                    ids={paint.ids}
                    opacity={t.n === undefined ? 0.3 : t.n === 0 ? 0.12 : 1}
                    symbols={s >= 14}
                  />,
                );
              }
              parts.push(
                <ChartText
                  key={`l${sd}${i}`}
                  x={x + widths[i]! / 2}
                  y={y0 + bh + 16}
                  fontSize={chart.value}
                  fontWeight="700"
                  textAnchor="middle"
                  fill={t.n === undefined ? c.chartMuted : c.chartInk}
                >
                  {label(t)}
                </ChartText>,
              );
              x += widths[i]!;
            });
          };
          side(0, 20, h0);
          side(1, top1, h1);
          // The arrow between the two rows.
          const ay0 = 20 + h0 + 24;
          const ay1 = top1 - 6;
          const pl = perLine(w);
          let y = countersY + 14;
          const dots = (n: number | undefined, x0: number, y0: number, el: string) =>
            Array.from({ length: n ?? 0 }, (_, k) => {
              const i = k % pl;
              return (
                <AtomBall
                  key={`${el}${x0}-${k}`}
                  el={el}
                  cx={x0 + i * STEP + Math.floor(i / 5) * 4}
                  cy={y0 + Math.floor(k / pl) * STEP}
                  r={DOT}
                  ids={paint.ids}
                  symbol={false}
                />
              );
            });
          const cx = w / 2;
          const counterRows = rows.map((r) => {
            const y0 = y + 6;
            y += 20 + (Math.max(lines(r.b, w), lines(r.a, w)) - 1) * STEP;
            const same = r.a !== undefined && r.b !== undefined && r.a === r.b;
            return (
              <G key={r.el}>
                <AtomBall el={r.el} cx={10} cy={y0} r={8} ids={paint.ids} />
                <ChartText
                  x={cx - 26}
                  y={y0 + 4.5}
                  fontSize={chart.value}
                  fontWeight="700"
                  textAnchor="end"
                >
                  {r.b === undefined ? '?' : String(r.b)}
                </ChartText>
                {dots(r.b, 24, y0, r.el)}
                <ChartText
                  x={cx - 12}
                  y={y0 + 5}
                  fontSize={chart.emphasis}
                  fontWeight="700"
                  textAnchor="middle"
                  fill={same ? c.chartHighlight : c.chartInk}
                >
                  {r.a === undefined || r.b === undefined ? '?' : same ? '=' : '≠'}
                </ChartText>
                <ChartText x={cx + 2} y={y0 + 4.5} fontSize={chart.value} fontWeight="700">
                  {r.a === undefined ? '?' : String(r.a)}
                </ChartText>
                {dots(r.a, cx + 30, y0, r.el)}
              </G>
            );
          });
          return (
            <Svg width={w} height={h}>
              <Defs>{paint.defs}</Defs>
              <ChartText x={8} y={14} fontSize={chart.label} fill={c.chartMuted}>
                Before
              </ChartText>
              <ChartText x={8} y={top1 - 6} fontSize={chart.label} fill={c.chartMuted}>
                After
              </ChartText>
              {parts}
              <Line
                x1={cx}
                y1={ay0}
                x2={cx}
                y2={ay1 - 6}
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
              />
              <Path d={`M ${cx} ${ay1} l -5 -8 l 10 0 z`} fill={c.chartInk} />
              <Line
                x1={8}
                y1={countersY}
                x2={w - 8}
                y2={countersY}
                stroke={c.chartGrid}
                strokeWidth={1}
              />
              {counterRows}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {[
          equation,
          ...rows.map((r) => r.line),
          known
            ? off.length === 0
              ? 'Balanced: the same atoms on both sides, only rearranged.'
              : `Not balanced: ${off
                  .map((r) => `${r.b} ${elementName(r.el).toLowerCase()} before, ${r.a} after`)
                  .join('; ')}.`
            : 'Type every number of particles to count the atoms.',
        ].join(' · ')}
      </Caption>
    </View>
  );
}
