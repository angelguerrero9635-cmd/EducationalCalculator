import type { ReactElement } from 'react';
import { View } from 'react-native';
import Svg, { Defs, G, Line, Path } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { atomsOf, elementName, elementsIn, extentOf, moleculeOf, subscript } from './chem';
import {
  drawableChain,
  fillFormula,
  hydrocarbon,
  hydrocarbonCounts,
  ionicUnit,
  isIonic,
  isTemplate,
  symbolFormula,
} from './chemHs2d';
import { Canvas, Caption, ChartText, useRep } from './common';
import { reader } from './graphKit';
import { AtomBall, MoleculeArt, useAtomPaint } from './MoleculeArt';

type Spec = Extract<Representation, { kind: 'reaction' }>;

/** Molecules of one term stacked in columns of up to this many. */
const PER_COLUMN = 4;
const PLUS = 16;
const ARROW = 34;
const GAP = 6;
/** Height of a counter row, its ball radius and spacing. */
const ROW = 24;
const DOT = 4.5;
const STEP = 11;

/**
 * A reaction as particles (Grade 7): the molecules of each substance before the arrow and
 * after it, each term labelled with its coefficient (2 H₂ + O₂ → 2 H₂O). Under it, a row per
 * element with its atoms as counters on each side and = when they match: the atoms are
 * rearranged into new substances, none made or lost. An untyped count draws one faded
 * molecule and "?".
 */
export function Reaction({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const read = reader(rep);
  const paint = useAtomPaint();
  const most = spec.most ?? 8;
  const terms = [
    ...spec.reactants.map((t) => ({ ...t, side: 0 })),
    ...spec.products.map((t) => ({ ...t, side: 1 })),
  ].map((t) => {
    const r = read(t.count);
    const n = r.known ? Math.max(0, Math.round(r.value)) : undefined;
    // A formula from values (H101): C{x}H{y} with the page's x and y, faded while one is "?".
    const template = isTemplate(t.formula);
    const filled = template
      ? fillFormula(t.formula, (id) => (rep.known(id) ? rep.val(id) : undefined))
      : t.formula;
    const formula = filled ?? fillFormula(t.formula, () => 1)!;
    const hc = template ? hydrocarbonCounts(formula) : undefined;
    const shape =
      hc && drawableChain(hc.x, hc.y)
        ? hydrocarbon(hc.x, hc.y)
        : spec.ions && isIonic(formula)
          ? ionicUnit(formula)
          : moleculeOf(formula);
    const molar = t.molar ? read(t.molar) : undefined;
    return {
      ...t,
      formula,
      known: filled !== undefined,
      shape,
      n,
      text: r.known ? r.text : '?',
      name: filled ? subscript(filled) : symbolFormula(t.formula, (id) => rep.variable(id).symbol),
      molar: molar ? `${molar.known ? molar.text : '?'} g/mol` : undefined,
    };
  });
  const els = elementsIn(terms.map((t) => t.formula));
  /** Atoms of an element on one side, or undefined while a count is "?". */
  const atomsOn = (side: number, el: string) => {
    const ts = terms.filter((t) => t.side === side);
    if (ts.some((t) => (t.n === undefined || !t.known) && atomsOf(t.formula, el) > 0))
      return undefined;
    return ts.reduce((s, t) => s + atomsOf(t.formula, el) * (t.n ?? 0), 0);
  };
  const label = (t: (typeof terms)[number]) => `${t.text === '1' ? '' : `${t.text} `}${t.name}`;
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
        .map((t) => `${t.text} × ${t.known ? atomsOf(t.formula, el) : '?'}`)
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

  // With `most` (H101), columns grow so a term of many molecules stays about three wide.
  const perColumn = spec.most
    ? Math.max(PER_COLUMN, Math.ceil(Math.max(...terms.map((t) => Math.min(most, t.n ?? 1))) / 3))
    : PER_COLUMN;
  const molarRow = terms.some((t) => t.molar) ? 16 : 0;
  /** Columns and rows of a term's molecules, and its box at bond length s. */
  const box = (t: (typeof terms)[number], s: number) => {
    const k = Math.max(1, Math.min(most, t.n ?? 1));
    const cols = Math.ceil(k / perColumn);
    const perCol = Math.min(k, perColumn);
    const [x0, y0, x1, y1] = extentOf(t.shape);
    const m = { w: (x1 - x0) * s, h: (y1 - y0) * s };
    return {
      k,
      cols,
      perCol,
      mw: m.w + GAP,
      mh: m.h + GAP,
      w: cols * (m.w + GAP),
      h: perCol * (m.h + GAP),
    };
  };
  const seps = (terms.length - 2) * PLUS + ARROW;
  const scaleFor = (w: number) => {
    const units = terms.reduce((s, t) => s + box(t, 1).w - GAP * box(t, 1).cols, 0);
    const gaps = terms.reduce((s, t) => s + GAP * box(t, 1).cols, 0);
    return Math.max(6, Math.min(26, (w - 8 - seps - gaps) / units));
  };
  const counterLines = (n: number | undefined, w: number) =>
    Math.max(1, Math.ceil((n ?? 0) / Math.max(1, Math.floor((w / 2 - 58) / STEP))));
  const layoutH = (w: number) => {
    const s = scaleFor(w);
    const top = Math.max(...terms.map((t) => box(t, s).h)) + 24 + molarRow;
    const counters = rows.reduce(
      (sum, r) => sum + ROW + (Math.max(counterLines(r.b, w), counterLines(r.a, w)) - 1) * STEP,
      0,
    );
    return { s, top, h: top + 26 + counters + 6 };
  };

  return (
    <View>
      <Canvas aspect={(w) => layoutH(w).h / w}>
        {({ w, h }) => {
          const { s, top } = layoutH(w);
          const boxes = terms.map((t) => box(t, s));
          const total = boxes.reduce((sum, b) => sum + b.w, 0) + seps;
          let x = (w - total) / 2;
          const midY = (top - molarRow - 20) / 2 + 2;
          const parts: ReactElement[] = [];
          terms.forEach((t, i) => {
            const b = boxes[i]!;
            if (i > 0) {
              const arrow = terms[i - 1]!.side !== t.side;
              const sw = arrow ? ARROW : PLUS;
              parts.push(
                arrow ? (
                  <G key={`s${i}`}>
                    <Line
                      x1={x + 5}
                      y1={midY}
                      x2={x + sw - 7}
                      y2={midY}
                      stroke={c.chartInk}
                      strokeWidth={chart.stroke}
                    />
                    <Path d={`M ${x + sw - 3} ${midY} l -8 -5 l 0 10 z`} fill={c.chartInk} />
                  </G>
                ) : (
                  <ChartText
                    key={`s${i}`}
                    x={x + sw / 2}
                    y={midY + 6}
                    fontSize={chart.emphasis + 2}
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    +
                  </ChartText>
                ),
              );
              x += sw;
            }
            const y0 = midY - b.h / 2;
            for (let k = 0; k < b.k; k++) {
              const col = Math.floor(k / perColumn);
              const inCol = Math.min(perColumn, b.k - col * perColumn);
              const row = k % perColumn;
              parts.push(
                <MoleculeArt
                  key={`m${i}-${k}`}
                  molecule={t.shape}
                  cx={x + (col + 0.5) * b.mw}
                  cy={y0 + ((b.perCol - inCol) * b.mh) / 2 + (row + 0.5) * b.mh}
                  scale={s}
                  ids={paint.ids}
                  opacity={t.n === undefined || !t.known ? 0.3 : t.n === 0 ? 0.12 : 1}
                  symbols={s >= 14}
                />,
              );
            }
            parts.push(
              <ChartText
                key={`l${i}`}
                x={x + b.w / 2}
                y={top - 6 - molarRow}
                fontSize={chart.value}
                fontWeight="700"
                textAnchor="middle"
                fill={t.n === undefined || !t.known ? c.chartMuted : c.chartInk}
              >
                {label(t)}
              </ChartText>,
            );
            if (t.molar)
              parts.push(
                <ChartText
                  key={`M${i}`}
                  x={x + b.w / 2}
                  y={top - 6}
                  fontSize={chart.label}
                  textAnchor="middle"
                  fill={c.chartMuted}
                >
                  {t.molar}
                </ChartText>,
              );
            x += b.w;
          });
          // Counters: a row per element, before on the left, after on the right.
          const cx = w / 2;
          let y = top + 26;
          const perLine = Math.max(1, Math.floor((w / 2 - 58) / STEP));
          const dots = (n: number | undefined, x0: number, y0: number, el: string) =>
            Array.from({ length: n ?? 0 }, (_, k) => (
              <AtomBall
                key={`${el}${x0}-${k}`}
                el={el}
                cx={x0 + (k % perLine) * STEP}
                cy={y0 + Math.floor(k / perLine) * STEP}
                r={DOT}
                ids={paint.ids}
                symbol={false}
              />
            ));
          const counterRows = rows.map((r) => {
            const y0 = y + ROW / 2;
            const lines = Math.max(counterLines(r.b, w), counterLines(r.a, w));
            y += ROW + (lines - 1) * STEP;
            const same = r.a !== undefined && r.b !== undefined && r.a === r.b;
            return (
              <G key={r.el}>
                <AtomBall el={r.el} cx={12} cy={y0} r={9} ids={paint.ids} />
                {dots(r.b, 30, y0, r.el)}
                <ChartText
                  x={cx - 16}
                  y={y0 + 4.5}
                  fontSize={chart.value}
                  fontWeight="700"
                  textAnchor="end"
                >
                  {r.b === undefined ? '?' : String(r.b)}
                </ChartText>
                <ChartText
                  x={cx}
                  y={y0 + 5}
                  fontSize={chart.emphasis}
                  fontWeight="700"
                  textAnchor="middle"
                  fill={same ? c.chartHighlight : c.chartInk}
                >
                  {r.a === undefined || r.b === undefined ? '?' : same ? '=' : '≠'}
                </ChartText>
                <ChartText x={cx + 16} y={y0 + 4.5} fontSize={chart.value} fontWeight="700">
                  {r.a === undefined ? '?' : String(r.a)}
                </ChartText>
                {dots(r.a, cx + 40, y0, r.el)}
              </G>
            );
          });
          return (
            <Svg width={w} height={h}>
              <Defs>{paint.defs}</Defs>
              {parts}
              <Line
                x1={8}
                y1={top + 4}
                x2={w - 8}
                y2={top + 4}
                stroke={c.chartGrid}
                strokeWidth={1}
              />
              <ChartText x={30} y={top + 20} fontSize={chart.small} fill={c.chartMuted}>
                Before
              </ChartText>
              <ChartText x={cx + 40} y={top + 20} fontSize={chart.small} fill={c.chartMuted}>
                After
              </ChartText>
              {counterRows}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {[
          equation,
          ...terms.flatMap((t) => (t.molar ? [`Molar mass of ${t.name}: ${t.molar}`] : [])),
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
