/**
 * The limiting reactant (H49, `reaction` with `limiting`): the balanced equation, then the
 * particles on hand before (each reactant counted, the one that runs out marked limiting), and
 * after: the products made by as many whole runs as the scarcest reactant allows, and the
 * leftover particles of the other reactant ringed. Every particle is drawn.
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { subscript } from './chem';
import { Canvas, Caption, ChartText, useRep } from './common';
import { reader } from './graphKit';
import { MAX_PARTICLES, balanced, limitingOutcome } from './limiting';
import { MoleculeArt, fitScale, useAtomPaint } from './MoleculeArt';

type Spec = Extract<Representation, { kind: 'reaction' }>;

const LABEL_W = 96;
const CELL = 30;
const HEAD = 26;

interface Row {
  formula: string;
  n: number;
  label: string;
  tag?: string;
  ring?: boolean;
}

export function ReactionLimiting({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const read = reader(rep);
  const paint = useAtomPaint();
  const lim = spec.limiting!;
  const coefs = spec.reactants.map((t) => Math.max(1, Math.round(read(t.count).value)));
  const pcoefs = spec.products.map((t) => Math.max(1, Math.round(read(t.count).value)));
  const am = lim.amounts.map((a) => read(a));
  const amounts = am.map((a) => Math.max(0, Math.min(MAX_PARTICLES, Math.round(a.value))));
  const known = am.every((a) => a.known);
  const ok = balanced(
    spec.reactants.map((t, i) => ({ formula: t.formula, n: coefs[i]! })),
    spec.products.map((t, i) => ({ formula: t.formula, n: pcoefs[i]! })),
  );
  const out = limitingOutcome(coefs, amounts, pcoefs);
  const term = (f: string, n: number) => `${n === 1 ? '' : `${n} `}${subscript(f)}`;
  const equation = `${spec.reactants.map((t, i) => term(t.formula, coefs[i]!)).join(' + ')} → ${spec.products.map((t, i) => term(t.formula, pcoefs[i]!)).join(' + ')}`;
  const limitingNames = spec.reactants
    .filter((_, i) => out.limiting[i])
    .map((t) => subscript(t.formula));

  const before: Row[] = spec.reactants.map((t, i) => ({
    formula: t.formula,
    n: amounts[i]!,
    label: `${amounts[i]} ${subscript(t.formula)}`,
    tag: out.limiting[i] && out.limiting.some((x) => !x) ? 'limiting' : undefined,
  }));
  const after: Row[] = [
    ...spec.products.map((t, i) => ({
      formula: t.formula,
      n: Math.min(MAX_PARTICLES, out.made[i]!),
      label: `${out.made[i]} ${subscript(t.formula)}`,
    })),
    ...spec.reactants
      .map((t, i) => ({ t, i }))
      .filter(({ i }) => out.left[i]! > 0)
      .map(({ t, i }) => ({
        formula: t.formula,
        n: out.left[i]!,
        label: `${out.left[i]} ${subscript(t.formula)}`,
        tag: 'left over',
        ring: true,
      })),
  ];

  const layout = (w: number) => {
    const perRow = Math.max(1, Math.floor((w - LABEL_W - 8) / CELL));
    const rowH = (r: Row) => Math.max(1, Math.ceil(r.n / perRow)) * CELL + 6;
    const hBefore = before.reduce((s, r) => s + rowH(r), 0);
    const hAfter = Math.max(
      CELL,
      after.reduce((s, r) => s + rowH(r), 0),
    );
    return { perRow, rowH, hBefore, hAfter, h: 30 + HEAD + hBefore + 30 + HEAD + hAfter + 8 };
  };

  const art = (w: number, h: number): ReactNode => {
    const { perRow, rowH, hBefore } = layout(w);
    const parts: ReactNode[] = [];
    const drawRows = (rows: Row[], top: number, key: string) => {
      let y = top;
      rows.forEach((r, k) => {
        const s = fitScale(r.formula, CELL - 5, CELL - 5);
        parts.push(
          <G key={`${key}${k}`}>
            <ChartText
              x={8}
              y={y + CELL / 2 + (r.tag ? 0 : 5)}
              fontSize={chart.value}
              fontWeight="700"
            >
              {r.label}
            </ChartText>
            {r.tag ? (
              <ChartText
                x={8}
                y={y + CELL / 2 + 14}
                fontSize={chart.label}
                fontWeight="700"
                fill={r.ring ? c.chartInk : c.chartHighlight}
              >
                {r.tag}
              </ChartText>
            ) : null}
            {Array.from({ length: r.n }, (_, j) => {
              const cx = LABEL_W + (j % perRow) * CELL + CELL / 2;
              const cy = y + Math.floor(j / perRow) * CELL + CELL / 2;
              return (
                <G key={j}>
                  {r.ring ? (
                    <Circle
                      cx={cx}
                      cy={cy}
                      r={CELL / 2 - 1}
                      fill="none"
                      stroke={c.chartSecond}
                      strokeWidth={2.2}
                    />
                  ) : null}
                  <MoleculeArt
                    formula={r.formula}
                    cx={cx}
                    cy={cy}
                    scale={s}
                    ids={paint.ids}
                    symbols={false}
                  />
                </G>
              );
            })}
          </G>,
        );
        y += rowH(r);
      });
    };
    const y1 = 30;
    const y2 = y1 + HEAD + hBefore + 30;
    drawRows(before, y1 + HEAD, 'b');
    drawRows(after, y2 + HEAD, 'a');
    return (
      <Svg width={w} height={h}>
        <Defs>{paint.defs}</Defs>
        <ChartText x={w / 2} y={18} fontSize={chart.emphasis} fontWeight="700" textAnchor="middle">
          {equation}
        </ChartText>
        {[
          { y: y1, text: 'Before' },
          { y: y2, text: `After ${out.runs} run${out.runs === 1 ? '' : 's'} of the reaction` },
        ].map((s) => (
          <G key={s.text}>
            <Rect x={4} y={s.y} width={w - 8} height={HEAD - 4} rx={4} fill={c.chartSurface} />
            <ChartText
              x={10}
              y={s.y + 16}
              fontSize={chart.label}
              fontWeight="700"
              fill={c.chartMuted}
            >
              {s.text}
            </ChartText>
          </G>
        ))}
        <Line
          x1={w / 2}
          y1={y2 - 26}
          x2={w / 2}
          y2={y2 - 8}
          stroke={c.chartInk}
          strokeWidth={chart.stroke}
        />
        <Path d={`M ${w / 2} ${y2 - 2} l -6 -9 l 12 0 z`} fill={c.chartInk} />
        <G opacity={known && ok ? 1 : 0.35}>{parts}</G>
      </Svg>
    );
  };

  return (
    <View>
      <Canvas aspect={(w) => layout(w).h / w}>{({ w, h }) => art(w, h)}</Canvas>
      <Caption>
        {!ok
          ? `${equation} is not balanced: balance it before finding the limiting reactant.`
          : known
            ? [
                `${spec.reactants.map((t, i) => `${amounts[i]} ÷ ${coefs[i]} = ${Number((amounts[i]! / coefs[i]!).toFixed(2))} runs of ${subscript(t.formula)}`).join('; ')}.`,
                out.limiting.every(Boolean)
                  ? `Both run out together: the reaction runs ${out.runs} times with nothing left over.`
                  : `${limitingNames.join(' and ')} runs out first (the limiting reactant): ${out.runs} whole runs.`,
                `Made: ${spec.products.map((t, i) => `${out.made[i]} ${subscript(t.formula)} (${pcoefs[i]} × ${out.runs})`).join(' and ')}.`,
                out.left.some((x) => x > 0)
                  ? `Left over (ringed): ${spec.reactants
                      .map((t, i) => ({ t, i }))
                      .filter(({ i }) => out.left[i]! > 0)
                      .map(
                        ({ t, i }) =>
                          `${amounts[i]} − ${coefs[i]} × ${out.runs} = ${out.left[i]} ${subscript(t.formula)}`,
                      )
                      .join(', ')}.`
                  : undefined,
              ]
                .filter(Boolean)
                .join(' · ')
            : 'Type how many particles of each reactant there are.'}
      </Caption>
    </View>
  );
}
