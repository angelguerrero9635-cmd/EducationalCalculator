/**
 * An oxidation-number tally (H101 part 8): every atom of a formula in a row as a lit ball, its
 * oxidation number on a tag above it; under each element's atoms a bracket with their sum
 * (4 × (−2) = −8); and the sums added to the charge of the whole particle. An oxidation number
 * not typed yet is "?" on a highlighted tag: the one to find.
 */
import { View } from 'react-native';
import Svg, { Defs, G, Path, Rect } from 'react-native-svg';

import type { ChemDiagramSpec } from '@/data/modules/typesHs2d';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { subscript } from './chem';
import {
  atomsInOrder,
  chargeSuperscript,
  fillFormula,
  signedText,
  symbolFormula,
} from './chemHs2d';
import { Canvas, Caption, ChartText, useRep } from './common';
import { reader } from './graphKit';
import { AtomBall, useAtomPaint } from './MoleculeArt';

type Spec = Extract<ChemDiagramSpec, { mode: 'oxidation' }>;

export function ChemOxidation({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const read = reader(rep);
  const paint = useAtomPaint();
  // A formula may take its subscripts from values ("S{s}O{o}"); faded until they are typed.
  const filled = fillFormula(
    spec.formula,
    (id) => (rep.known(id) ? Math.round(rep.val(id)) : undefined),
    true,
  );
  const formula = filled ?? fillFormula(spec.formula, (id) => Math.round(rep.val(id)), true) ?? '';
  const atoms = atomsInOrder(formula);
  const els = [...new Set(atoms)];
  const nums = Object.fromEntries(
    els.map((el) => {
      const x = spec.numbers[el];
      const r = x === undefined ? undefined : read(x);
      return [el, r?.known ? Math.round(r.value) : undefined];
    }),
  );
  const q = spec.charge === undefined ? { value: 0, known: true } : read(spec.charge);
  const charge = Math.round(q.value);
  const name = `${
    filled !== undefined
      ? subscript(filled)
      : symbolFormula(spec.formula, (id) => rep.variable(id).symbol)
  }${q.known ? chargeSuperscript(charge) : ''}`;
  const groups = els.map((el) => {
    const k = atoms.filter((a) => a === el).length;
    const n = nums[el];
    return { el, k, n, sum: n === undefined ? undefined : n * k };
  });
  const all = groups.every((g) => g.sum !== undefined);
  const total = groups.reduce((s, g) => s + (g.sum ?? 0), 0);
  const paren = (x: number) => (x < 0 ? `(${signedText(x)})` : signedText(x));

  return (
    <View>
      <Canvas aspect={(w) => Math.min(0.6, 184 / w)}>
        {({ w, h }) => {
          const step = Math.min(46, (w - 16) / atoms.length);
          const r = Math.min(16, step * 0.4);
          const x0 = (w - step * atoms.length) / 2;
          const ay = 78;
          const xs = atoms.map((_, i) => x0 + (i + 0.5) * step);
          const parts = atoms.map((el, i) => {
            const n = nums[el];
            const tag = n === undefined ? '?' : signedText(n);
            const tw = Math.max(26, tag.length * 9 + 8);
            return (
              <G key={i}>
                <Rect
                  x={xs[i]! - tw / 2}
                  y={ay - r - 30}
                  width={tw}
                  height={20}
                  rx={5}
                  fill={n === undefined ? c.chartHighlight : c.card}
                  stroke={n === undefined ? c.chartHighlight : c.chartGrid}
                  strokeWidth={1}
                />
                <ChartText
                  x={xs[i]!}
                  y={ay - r - 15}
                  fontSize={chart.value}
                  fontWeight="700"
                  textAnchor="middle"
                  fill={n === undefined ? c.onChartHighlight : c.chartInk}
                >
                  {tag}
                </ChartText>
                <G opacity={filled === undefined ? 0.35 : 1}>
                  <AtomBall el={el} cx={xs[i]!} cy={ay} r={r} ids={paint.ids} />
                </G>
              </G>
            );
          });
          // A bracket under each element's atoms (they are next to each other as written).
          const brackets = groups.map((g) => {
            const idx = atoms.flatMap((a, i) => (a === g.el ? [i] : []));
            const [a, b] = [xs[idx[0]!]! - r, xs[idx[idx.length - 1]!]! + r];
            const y = ay + r + 8;
            const text =
              // One atom reads as its number alone, "?" while unknown (as "+6" once known).
              g.n === undefined
                ? g.k === 1
                  ? '?'
                  : `${g.k} × ? = ?`
                : g.k === 1
                  ? signedText(g.n)
                  : `${g.k} × ${paren(g.n)} = ${signedText(g.sum!)}`;
            return (
              <G key={g.el}>
                <Path
                  d={`M ${a} ${y} l 0 6 L ${b} ${y + 6} l 0 -6`}
                  fill="none"
                  stroke={c.chartMuted}
                  strokeWidth={1.5}
                />
                <ChartText
                  x={(a + b) / 2}
                  y={y + 22}
                  fontSize={chart.label}
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {text}
                </ChartText>
              </G>
            );
          });
          const sumText = `${groups.map((g) => (g.sum === undefined ? '?' : paren(g.sum))).join(' + ')} = ${
            all ? signedText(total) : '?'
          }`;
          return (
            <Svg width={w} height={h}>
              <Defs>{paint.defs}</Defs>
              <ChartText
                x={w / 2}
                y={20}
                fontSize={chart.emphasis + 4}
                fontWeight="700"
                textAnchor="middle"
              >
                {name}
              </ChartText>
              {parts}
              {brackets}
              <ChartText
                x={w / 2}
                y={h - 30}
                fontSize={chart.value}
                fontWeight="700"
                textAnchor="middle"
              >
                {sumText}
              </ChartText>
              <ChartText
                x={w / 2}
                y={h - 10}
                fontSize={chart.label}
                textAnchor="middle"
                fill={all && total === charge ? c.chartHighlight : c.chartMuted}
              >
                {`The charge of ${name}: ${q.known ? signedText(charge) : '?'}`}
              </ChartText>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {[
          `${groups.map((g) => (g.sum === undefined ? (g.k === 1 ? '?' : `${g.k} × ?`) : paren(g.sum))).join(' + ')} = ${q.known ? signedText(charge) : '?'}`,
          'The oxidation numbers of all the atoms add up to the charge of the particle.',
        ].join(' · ')}
      </Caption>
    </View>
  );
}
