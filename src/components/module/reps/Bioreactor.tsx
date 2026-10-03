/**
 * HC164 `bioreactor` (BioreactorSpec in typesHe4k.ts): a stirred glass vessel, painted, its
 * sparger bubbling gas into the medium, cells as dots by their density, and a dissolved-oxygen
 * gauge from 0 to C∗ filled to the steady C = C∗ − qX ÷ k_La. No handles.
 */
import { View } from 'react-native';
import { Circle, Defs, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import type { BioreactorSpec } from '@/data/modules/typesHe4k';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Caption, ChartText, fitLabel } from './common';
import { BW, Board } from './fluidKit';
import { cellsPerDot, halton, uptake } from './he4kMath';
import { n3, useReader } from './he4kKit';
import { Glass, Sheen, TopLight, url, usePaintIds } from './paint';

const V = { x0: 40, x1: 190, y0: 34, y1: 206, r: 18 };
const LEVEL = 64;
const G0 = { x: 226, w: 20, y0: 54, y1: 196 };
const H = 252;
const POINTS = halton(160);

/** "10⁵" for a power of ten. */
const tenTo = (x: number) => {
  const e = Math.round(Math.log10(x));
  if (e === 0) return '1';
  return `10${[...String(e)].map((d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]).join('')}`;
};

export function Bioreactor({ spec, calc }: { spec: BioreactorSpec; calc: Calculator }) {
  const c = usePalette();
  const ids = usePaintIds('glass', 'medium', 'metal');
  const { get, text, say } = useReader(calc);
  const cStar = get(spec.cStar);
  const kla = get(spec.kla);
  const q = get(spec.q);
  const x = get(spec.x);
  const our = q !== undefined && x !== undefined ? uptake(q, x) : undefined;
  const C =
    cStar !== undefined && kla !== undefined && kla > 0 && our !== undefined
      ? cStar - our / kla
      : undefined;
  const starved = C !== undefined && C <= 0;
  const xMax =
    cStar !== undefined && kla !== undefined && q !== undefined && q > 0
      ? (kla * cStar) / (q * 1e-6)
      : undefined;
  const unit = x !== undefined && x > 0 ? cellsPerDot(x) : undefined;
  const dots = unit === undefined ? 0 : Math.round(x! / unit);
  const share = C === undefined || cStar === undefined || cStar <= 0 ? undefined : C / cStar;
  const gh = G0.y1 - G0.y0;
  const yC = share === undefined ? undefined : G0.y1 - gh * Math.max(0, Math.min(1, share));

  const lines: string[] = [];
  if (our !== undefined)
    lines.push(
      `OUR = qX = ${text(spec.q, '', false)} × ${text(spec.x, '', false)} × 10⁻⁶ = ${say(spec.our, our, 'mM/h')}.`,
    );
  if (C !== undefined && !starved)
    lines.push(
      `Supply equals uptake: C = C∗ − OUR ÷ k_La = ${text(spec.cStar, '', false)} − ${n3(our!)} ÷ ${text(spec.kla, '', false)} = ${say(spec.c, C, 'mM')}.`,
    );
  if (starved)
    lines.push(
      `C = C∗ − OUR ÷ k_La = ${n3(C)} mM is below 0: the cells use oxygen faster than k_La·C∗ can supply it, so the gauge is empty and X must stay below X_max.`,
    );
  if (xMax !== undefined) lines.push(`X_max = k_La·C∗ ÷ q = ${say(spec.xMax, xMax, 'cells/mL')}.`);
  if (C === undefined) lines.push('Type C∗, k_La, q and X to fill the gauge.');

  const cells = POINTS.slice(0, dots).map(([u, v]) => ({
    x: V.x0 + 8 + u * (V.x1 - V.x0 - 16),
    y: LEVEL + 8 + v * (V.y1 - LEVEL - 18),
  }));
  const bubbles = POINTS.slice(120, 138).map(([u, v], i) => ({
    x: 88 + u * 54,
    y: 72 + v * 118,
    r: 2.4 + (i % 3) * 0.9,
  }));
  const vessel = `M ${V.x0} ${V.y0} L ${V.x0} ${V.y1 - V.r} Q ${V.x0} ${V.y1} ${V.x0 + V.r} ${V.y1} L ${V.x1 - V.r} ${V.y1} Q ${V.x1} ${V.y1} ${V.x1} ${V.y1 - V.r} L ${V.x1} ${V.y0}`;
  const medium = `M ${V.x0} ${LEVEL} L ${V.x0} ${V.y1 - V.r} Q ${V.x0} ${V.y1} ${V.x0 + V.r} ${V.y1} L ${V.x1 - V.r} ${V.y1} Q ${V.x1} ${V.y1} ${V.x1} ${V.y1 - V.r} L ${V.x1} ${LEVEL} Z`;
  const cStarLabel = cStar === undefined ? undefined : `C∗ = ${text(spec.cStar)}`;
  const cLabel = C === undefined ? undefined : `C = ${starved ? '0 mM' : say(spec.c, C, 'mM')}`;
  const cLabelY = yC === undefined ? 0 : Math.max(G0.y0 + 20, Math.min(G0.y1 - 14, yC + 4));
  const xLabel = x === undefined ? undefined : `X = ${text(spec.x)}`;
  const dotLabel = unit === undefined ? undefined : `each dot: ${tenTo(unit)} cells/mL`;
  const ourLabel = our === undefined ? undefined : `OUR = ${say(spec.our, our, 'mM/h')}`;

  return (
    <View>
      <Board
        height={H}
        draw={() => (
          <G>
            <Defs>
              <Glass id={ids.glass} />
              <TopLight id={ids.medium} />
              <Sheen id={ids.metal} />
            </Defs>
            {/* The medium, the cells and the bubbles, behind the glass. */}
            <Path d={medium} fill={c.he4kMedium} opacity={0.85} />
            <Path d={medium} fill={url(ids.medium)} />
            {cells.map((p, i) => (
              <Circle key={`c${i}`} cx={p.x} cy={p.y} r={2.6} fill={c.he4kCellDot} />
            ))}
            {bubbles.map((b, i) => (
              <Circle
                key={`b${i}`}
                cx={b.x}
                cy={b.y}
                r={b.r}
                fill={c.glassShine}
                fillOpacity={0.5}
                stroke={c.he4kOxygen}
                strokeWidth={1}
              />
            ))}
            {/* Impeller on its shaft. */}
            <Line x1={128} y1={30} x2={128} y2={150} stroke={c.metalDark} strokeWidth={3} />
            <Rect x={108} y={146} width={40} height={8} rx={2} fill={c.metal} />
            <Rect x={108} y={146} width={40} height={8} rx={2} fill={url(ids.metal)} />
            {/* Gas line down the wall to the sparger ring. */}
            <Path
              d={`M 58 6 L 58 196 L 90 196`}
              fill="none"
              stroke={c.metalDark}
              strokeWidth={4}
              strokeLinejoin="round"
            />
            <Ellipse
              cx={115}
              cy={196}
              rx={26}
              ry={5}
              fill="none"
              stroke={c.metalDark}
              strokeWidth={4}
            />
            {/* Glass wall and lid. */}
            <Path d={medium} fill={url(ids.glass)} opacity={0.35} />
            <Path d={vessel} fill="none" stroke={c.glassEdge} strokeWidth={3} />
            <Path d={vessel} fill="none" stroke={c.chartInk} strokeWidth={1} />
            <Line
              x1={V.x0}
              y1={LEVEL}
              x2={V.x1}
              y2={LEVEL}
              stroke={c.he4kCellDot}
              strokeWidth={1}
            />
            <Rect
              x={V.x0 - 6}
              y={V.y0 - 8}
              width={V.x1 - V.x0 + 12}
              height={10}
              rx={2}
              fill={c.metal}
            />
            <Rect
              x={V.x0 - 6}
              y={V.y0 - 8}
              width={V.x1 - V.x0 + 12}
              height={10}
              rx={2}
              fill={url(ids.metal)}
            />
            <ChartText x={64} y={16}>
              {kla !== undefined ? `Gas in: k_La = ${text(spec.kla)}` : 'Gas in'}
            </ChartText>
            {/* The dissolved-oxygen gauge. */}
            <ChartText x={G0.x + G0.w / 2} y={G0.y0 - 14} textAnchor="middle" fontWeight="700">
              Dissolved O₂
            </ChartText>
            <Rect
              x={G0.x}
              y={G0.y0}
              width={G0.w}
              height={gh}
              fill={c.background}
              stroke={c.chartInk}
              strokeWidth={1}
            />
            {yC !== undefined ? (
              <Rect x={G0.x} y={yC} width={G0.w} height={G0.y1 - yC} fill={c.he4kOxygen} />
            ) : null}
            <Line x1={G0.x + G0.w} y1={G0.y0} x2={G0.x + G0.w + 4} y2={G0.y0} stroke={c.chartInk} />
            <Line x1={G0.x + G0.w} y1={G0.y1} x2={G0.x + G0.w + 4} y2={G0.y1} stroke={c.chartInk} />
            {cStarLabel ? (
              <ChartText x={G0.x + G0.w + 6} y={G0.y0 + 4}>
                {cStarLabel}
              </ChartText>
            ) : null}
            <ChartText x={G0.x + G0.w + 6} y={G0.y1 + 4} fill={c.chartMuted}>
              0
            </ChartText>
            {cLabel && yC !== undefined ? (
              <G>
                <Line
                  x1={G0.x - 4}
                  y1={yC}
                  x2={G0.x + G0.w + 4}
                  y2={yC}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                />
                <ChartText
                  {...fitLabel(G0.x + G0.w + 6, cLabel, chart.label, BW, 'start')}
                  y={cLabelY}
                  fontWeight="700"
                  fill={starved ? c.danger : c.he4kOxygen}
                >
                  {cLabel}
                </ChartText>
              </G>
            ) : null}
            {/* Cells and uptake. */}
            {xLabel ? (
              <ChartText x={(V.x0 + V.x1) / 2} y={H - 26} textAnchor="middle" fontWeight="700">
                {xLabel}
              </ChartText>
            ) : null}
            {dotLabel ? (
              <ChartText x={(V.x0 + V.x1) / 2} y={H - 8} textAnchor="middle" fill={c.chartMuted}>
                {dotLabel}
              </ChartText>
            ) : null}
            {ourLabel ? (
              <ChartText x={BW - 4} y={H - 26} textAnchor="end">
                {ourLabel}
              </ChartText>
            ) : null}
          </G>
        )}
      />
      <Caption>{lines.join(' ')}</Caption>
    </View>
  );
}
