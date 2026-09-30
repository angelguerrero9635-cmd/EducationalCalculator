/**
 * The Grades 9–12 round 2 chemistry pictures (group H2D, H101), by mode: effusion through a
 * pinhole (here), isotope abundance, an oxidation-number tally and a mass defect (their own
 * files). One case in `reps/index.tsx` sends the `chemDiagram` kind here.
 */
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { ChemDiagramSpec } from '@/data/modules/typesHs2d';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { extentOf, moleculeOf, subscript, turned } from './chem';
import { escapedSplit, grahamRatio } from './chemHs2d';
import { ChemDiagramHs3e } from './ChemDiagramHs3e';
import { ChemIsotopes } from './ChemIsotopes';
import { ChemMassDefect } from './ChemMassDefect';
import { ChemOxidation } from './ChemOxidation';
import { Canvas, Caption, ChartText, useRep } from './common';
import { reader } from './graphKit';
import { MoleculeArt, useAtomPaint } from './MoleculeArt';
import { Glass, url, usePaintIds } from './paint';

export function ChemDiagram({ spec, calc }: { spec: ChemDiagramSpec; calc: Calculator }) {
  switch (spec.mode) {
    case 'effusion':
      return <Effusion spec={spec} calc={calc} />;
    case 'isotopes':
      return <ChemIsotopes spec={spec} calc={calc} />;
    case 'oxidation':
      return <ChemOxidation spec={spec} calc={calc} />;
    case 'massDefect':
      return <ChemMassDefect spec={spec} calc={calc} />;
    default:
      return <ChemDiagramHs3e spec={spec} calc={calc} />;
  }
}

/** Where the molecules sit in the box (fractions of its width and height) and how they turn. */
const INSIDE: [number, number, number][] = [
  [0.14, 0.2, 20],
  [0.42, 0.14, -35],
  [0.72, 0.24, 60],
  [0.24, 0.5, 150],
  [0.56, 0.46, -120],
  [0.86, 0.56, 100],
  [0.12, 0.82, -60],
  [0.4, 0.78, 30],
  [0.68, 0.86, 200],
  [0.88, 0.2, 250],
  [0.32, 0.32, 80],
  [0.62, 0.66, -150],
];
/** Escaped molecules: fractions of the outside strip, spreading from the pinhole. */
const OUTSIDE: [number, number][] = [
  [0.25, 0.5],
  [0.55, 0.3],
  [0.6, 0.72],
  [0.85, 0.5],
  [0.88, 0.16],
  [0.9, 0.86],
];

type EffusionSpec = Extract<ChemDiagramSpec, { mode: 'effusion' }>;

/**
 * Effusion (part 6): a glass box of two gases mixed, a pinhole in its right wall, and the
 * molecules that got out beside it. A molecule's trail is as long as its speed (∝ 1/√M at one
 * temperature); the escaped ones are in the ratio of the rates. Bars under the box compare the
 * rates: rate₁ ÷ rate₂ = √(M₂ ÷ M₁).
 */
function Effusion({ spec, calc }: { spec: EffusionSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const read = reader(rep);
  const paint = useAtomPaint();
  const glass = usePaintIds('glass');
  const [g1, g2] = spec.gases;
  const [M1, M2] = [read(g1.molarMass), read(g2.molarMass)];
  const known = M1.known && M2.known && M1.value > 0 && M2.value > 0;
  const m1 = M1.value > 0 ? M1.value : 1;
  const m2 = M2.value > 0 ? M2.value : 1;
  const ratio = grahamRatio(m1, m2);
  const rates = [1 / Math.sqrt(m1), 1 / Math.sqrt(m2)];
  const fastest = Math.max(...rates);
  const [out1] = escapedSplit(ratio, OUTSIDE.length);
  const f = [subscript(g1.formula), subscript(g2.formula)];
  const colors = [c.chartHighlight, c.chartSecond];

  return (
    <View>
      <Canvas aspect={(w) => Math.min(0.9, 300 / w)}>
        {({ w, h }) => {
          const barsH = 64;
          const box = { x: 8, y: 8, w: w * 0.64, h: h - barsH - 18 };
          const outside = {
            x: box.x + box.w + 10,
            y: box.y + 10,
            w: w - box.w - 26,
            h: box.h - 20,
          };
          const hole = box.y + box.h / 2;
          const unit = Math.max(
            1,
            ...[g1.formula, g2.formula].map((x) => {
              const [a, b, cc, d] = extentOf(moleculeOf(x));
              return Math.max(cc - a, d - b);
            }),
          );
          const scale = Math.min(16, (box.w * 0.11) / unit);
          const trail = box.w * 0.16;
          const molecule = (
            key: string,
            formula: string,
            x: number,
            y: number,
            turn: number,
            speed: number,
            heading: number,
          ) => {
            const t = (heading * Math.PI) / 180;
            const r = (unit * scale) / 2 + 2;
            const len = (trail * speed) / fastest;
            return (
              <G key={key}>
                <Line
                  x1={x - Math.cos(t) * r}
                  y1={y - Math.sin(t) * r}
                  x2={x - Math.cos(t) * (r + len)}
                  y2={y - Math.sin(t) * (r + len)}
                  stroke={c.chartMuted}
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  opacity={known ? 0.9 : 0.4}
                />
                <MoleculeArt
                  molecule={turned(moleculeOf(formula), turn)}
                  cx={x}
                  cy={y}
                  scale={scale}
                  ids={paint.ids}
                  symbols={false}
                />
              </G>
            );
          };
          const cx = box.x + box.w / 2;
          const cy = box.y + box.h / 2;
          const inside = INSIDE.map(([fx, fy, turn], i) => {
            const k = i % 2;
            const g = spec.gases[k]!;
            const x = box.x + 14 + fx * (box.w - 28);
            const y = box.y + 14 + fy * (box.h - 28);
            // Heading outward from the middle (± a little), so every trail stays in the box.
            const out = (Math.atan2(y - cy, x - cx) * 180) / Math.PI + ((i * 37) % 60) - 30;
            return molecule(`i${i}`, g.formula, x, y, turn, rates[k]!, out);
          });
          const escaped = OUTSIDE.map(([fx, fy], i) => {
            const k = i < out1 ? 0 : 1;
            const x = outside.x + fx * outside.w;
            const y = outside.y + fy * outside.h;
            const heading = (Math.atan2(y - hole, x - (box.x + box.w)) * 180) / Math.PI;
            return molecule(`o${i}`, spec.gases[k]!.formula, x, y, i * 50, rates[k]!, heading);
          });
          // Rate bars: as long as each gas's rate, the faster one full length.
          const barX = 96;
          const barW = w - barX - 60;
          const bars = [0, 1].map((k) => {
            const y = h - barsH + 6 + k * 28;
            const len = (barW * rates[k]!) / fastest;
            return (
              <G key={`b${k}`}>
                <ChartText x={8} y={y + 13} fontSize={chart.label} fontWeight="700">
                  {`${f[k]} (${[M1, M2][k]!.known ? [M1, M2][k]!.text : '?'})`}
                </ChartText>
                <Rect
                  x={barX}
                  y={y}
                  width={known ? len : barW * 0.5}
                  height={18}
                  rx={3}
                  fill={colors[k]}
                  opacity={known ? 1 : 0.3}
                />
                <ChartText
                  x={barX + (known ? len : barW * 0.5) + 6}
                  y={y + 13}
                  fontSize={chart.label}
                  fill={c.chartMuted}
                >
                  {known ? `${formatNumber(Number((rates[k]! / rates[1]!).toPrecision(3)))}×` : '?'}
                </ChartText>
              </G>
            );
          });
          return (
            <Svg width={w} height={h}>
              <Defs>
                {paint.defs}
                <Glass id={glass.glass} />
              </Defs>
              <Rect x={box.x} y={box.y} width={box.w} height={box.h} fill={url(glass.glass)} />
              {inside}
              {/* The walls, open at the pinhole. */}
              <Path
                d={`M ${box.x + box.w} ${hole - 5} L ${box.x + box.w} ${box.y} L ${box.x} ${box.y} L ${box.x} ${box.y + box.h} L ${box.x + box.w} ${box.y + box.h} L ${box.x + box.w} ${hole + 5}`}
                fill="none"
                stroke={c.glassEdge}
                strokeWidth={3}
                strokeLinejoin="round"
              />
              <Circle cx={box.x + box.w} cy={hole} r={2} fill={c.chartInk} />
              {escaped}
              <Rect
                x={box.x + box.w + 4}
                y={box.y + box.h + 1}
                width={52}
                height={15}
                rx={3}
                fill={c.card}
              />
              <Line
                x1={box.x + box.w + 3}
                y1={hole + 6}
                x2={box.x + box.w + 12}
                y2={box.y + box.h + 3}
                stroke={c.chartMuted}
                strokeWidth={1}
              />
              <ChartText
                x={box.x + box.w + 6}
                y={box.y + box.h + 13}
                fontSize={chart.label}
                fill={c.chartMuted}
              >
                pinhole
              </ChartText>
              <ChartText x={8} y={h - barsH - 2} fontSize={chart.label} fill={c.chartMuted}>
                Rate of escape, ∝ 1/√M
              </ChartText>
              {bars}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {known
          ? [
              `rate of ${f[0]} ÷ rate of ${f[1]} = √(${M2.text} ÷ ${M1.text}) = ${formatNumber(Number(ratio.toPrecision(3)))}`,
              ratio >= 1
                ? `The lighter ${f[0]} moves faster and escapes ${formatNumber(Number(ratio.toPrecision(3)))} times as fast as ${f[1]}.`
                : `The lighter ${f[1]} moves faster and escapes ${formatNumber(Number((1 / ratio).toPrecision(3)))} times as fast as ${f[0]}.`,
              'At one temperature every gas has the same average kinetic energy, so lighter molecules move faster.',
            ].join(' · ')
          : 'Type both molar masses to compare how fast the gases escape.'}
      </Caption>
    </View>
  );
}
