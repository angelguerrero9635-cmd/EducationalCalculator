/**
 * H100 `geneExpression` explore figure: a stretch of DNA with a gene and the switch in front of
 * it, and whether the gene is read. With a `repressor` the switch is an operator between the
 * promoter and the gene: with no signal the repressor sits on it and blocks RNA polymerase (off);
 * the signal (an inducer, such as lactose) binds the repressor and pulls it off, so the
 * polymerase reads the gene into mRNA (on). With an `activator` the switch is a site in front of
 * the promoter: the activator binds there only with its signal, and helps the polymerase on (on);
 * without it the polymerase does not start (off). `lit` rings one part. Flat, like a diagram.
 */
import { Circle, Ellipse, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import { geneIsOn, type GeneScene } from '@/data/modules/typesHs2e';
import { chart, usePalette } from '@/theme';

import { ChartText } from '../reps/common';
import { BOARD_W, Board, HaloText } from './earthKit';

const H = 230;
const DNA_Y = 150;

export function GeneExpressionFigure({ gene }: { gene: GeneScene }) {
  const c = usePalette();
  const on = geneIsOn(gene);
  const rep = gene.control === 'repressor';
  const signal = !!gene.signal;
  // Regions along the DNA: [from, to, name, part].
  const regions: [number, number, string, GeneScene['lit']][] = rep
    ? [
        [24, 104, 'promoter', 'promoter'],
        [104, 150, 'operator', 'switch'],
        [150, 340, 'gene', 'gene'],
      ]
    : [
        [10, 98, 'activator site', 'switch'],
        [98, 150, 'promoter', 'promoter'],
        [150, 340, 'gene', 'gene'],
      ];
  const promoter = regions.find((r) => r[3] === 'promoter')!;
  const sw = regions.find((r) => r[3] === 'switch')!;
  // RNA polymerase: on the promoter, or on the gene reading it.
  const polX = on ? 188 : (promoter[0] + promoter[1]) / 2;
  const polY = DNA_Y - 20;
  // The switch protein: on its site, or lifted off.
  const bound = rep ? (gene.corepressor ? signal : !signal) : signal; // HC147: trp binds only with Trp
  const swX = (sw[0] + sw[1]) / 2;
  const swY = bound ? DNA_Y - 20 : 74;
  const protein = rep ? c.bioSolute : c.dnaA;
  return (
    <Board height={H}>
      <ChartText
        x={BOARD_W / 2}
        y={20}
        fontSize={chart.emphasis}
        fontWeight="700"
        textAnchor="middle"
        fill={on ? c.chartHighlight : c.chartInk}
      >
        {on ? 'Gene on: RNA polymerase makes mRNA' : 'Gene off: no mRNA is made'}
      </ChartText>
      {/* The DNA: two strands and faint rungs, the regions boxed over it. */}
      {Array.from({ length: 41 }, (_, k) => (
        <Line
          key={k}
          x1={14 + k * 8.2}
          y1={DNA_Y - 6}
          x2={14 + k * 8.2}
          y2={DNA_Y + 6}
          stroke={c.dnaBackbone}
          strokeWidth={1.4}
        />
      ))}
      {[-6, 6].map((d) => (
        <Line
          key={d}
          x1={10}
          y1={DNA_Y + d}
          x2={350}
          y2={DNA_Y + d}
          stroke={c.chartInk}
          strokeWidth={chart.stroke}
          strokeLinecap="round"
        />
      ))}
      {regions.map(([a, b, name, part]) => (
        <G key={name}>
          <Rect
            x={a + 1}
            y={DNA_Y - 9}
            width={b - a - 2}
            height={18}
            rx={4}
            fill={part === 'gene' ? c.dnaG : part === 'promoter' ? c.dnaC : protein}
            fillOpacity={0.35}
            stroke={gene.lit === part ? c.chartHighlight : c.chartMuted}
            strokeWidth={gene.lit === part ? chart.strokeHeavy : 1}
          />
          <ChartText
            x={(a + b) / 2}
            y={DNA_Y + 28}
            fontSize={chart.label}
            fontWeight={gene.lit === part ? '800' : '600'}
            textAnchor="middle"
            fill={gene.lit === part ? c.chartHighlight : c.chartInk}
          >
            {name}
          </ChartText>
        </G>
      ))}
      {/* RNA polymerase. */}
      <Ellipse
        cx={polX}
        cy={polY}
        rx={24}
        ry={15}
        fill={c.bioProtein}
        stroke={gene.lit === 'polymerase' ? c.chartHighlight : c.bioProteinEdge}
        strokeWidth={gene.lit === 'polymerase' ? chart.strokeHeavy : 1.2}
      />
      <ChartText
        x={on ? polX + 28 : polX}
        y={on ? polY + 4 : polY - 22}
        fontSize={chart.label}
        fontWeight="700"
        textAnchor={on ? 'start' : 'middle'}
        fill={c.chartInk}
      >
        RNA polymerase
      </ChartText>
      {on ? (
        // The mRNA peeling off behind the polymerase, and the arrow of reading.
        <G>
          <Path
            d={`M ${polX - 20} ${polY - 6} q -14 -22 6 -34 t 12 -30 t 18 -20`}
            stroke={gene.lit === 'mRNA' ? c.chartHighlight : c.dnaU}
            strokeWidth={gene.lit === 'mRNA' ? 5 : 3.5}
            fill="none"
            strokeLinecap="round"
          />
          <ChartText x={polX + 22} y={62} fontSize={chart.label} fontWeight="700" fill={c.dnaU}>
            mRNA
          </ChartText>
          <Line
            x1={polX + 30}
            y1={DNA_Y + 44}
            x2={320}
            y2={DNA_Y + 44}
            stroke={c.chartHighlight}
            strokeWidth={chart.stroke}
          />
          <Path d={`M 328 ${DNA_Y + 44} l -9 -5 v 10 z`} fill={c.chartHighlight} />
          <HaloText
            x={polX + 30}
            y={DNA_Y + 62}
            text="reading the gene"
            c={c}
            size={chart.label}
            anchor="start"
          />
        </G>
      ) : null}
      {/* The switch protein, with its signal when there is one. */}
      <G>
        <Path
          d={`M ${swX - 18} ${swY + 12} v -14 a 18 14 0 0 1 36 0 v 14 h -10 v -8 h -16 v 8 z`}
          fill={protein}
          stroke={gene.lit === 'protein' ? c.chartHighlight : c.chartInk}
          strokeWidth={gene.lit === 'protein' ? chart.strokeHeavy : 1}
        />
        {signal ? (
          <Polygon
            points={Array.from({ length: 6 }, (_, k) => {
              const t = (k * Math.PI) / 3;
              return `${swX + 7 * Math.cos(t)},${swY - 21 + 7 * Math.sin(t)}`;
            }).join(' ')}
            fill={gene.corepressor ? c.bioAmino : c.bioSugar}
            stroke={
              gene.lit === 'signal'
                ? c.chartHighlight
                : gene.corepressor
                  ? c.bioAminoEdge
                  : c.bioSugarEdge
            }
            strokeWidth={gene.lit === 'signal' ? chart.strokeHeavy : 1.2}
          />
        ) : null}
        <ChartText
          x={swX < 100 || bound ? swX + 22 : swX - 22}
          y={swY + 4}
          fontSize={chart.label}
          fontWeight="700"
          textAnchor={swX < 100 || bound ? 'start' : 'end'}
          fill={c.chartInk}
        >
          {rep ? 'repressor' : 'activator'}
        </ChartText>
        {signal ? (
          <ChartText x={swX + 11} y={swY - 22} fontSize={chart.label} fill={c.chartMuted}>
            {rep ? (gene.corepressor ? 'corepressor (tryptophan)' : 'inducer (lactose)') : 'signal'}
          </ChartText>
        ) : null}
      </G>
      {!on && rep && bound ? (
        // Blocked: a bar across the polymerase's way.
        <G>
          <Circle
            cx={polX + 30}
            cy={polY - 2}
            r={7}
            fill="none"
            stroke={c.chartHighlight}
            strokeWidth={2}
          />
          <Line
            x1={polX + 25}
            y1={polY - 7}
            x2={polX + 35}
            y2={polY + 3}
            stroke={c.chartHighlight}
            strokeWidth={2}
          />
        </G>
      ) : null}
    </Board>
  );
}
