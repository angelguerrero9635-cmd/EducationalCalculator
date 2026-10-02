/**
 * `macromolecules` with `level` (HC115; `typesHe4d.ts`): one polypeptide in four views, two to
 * a row: its sequence (primary), its helix and sheet (secondary), its fold (tertiary) and two
 * chains packed (quaternary); `level` 1–4 lights one, the others faded. Every view draws the
 * same residues, each keeping its colour (helix, strand, loop) and N and C ends. Flat.
 */
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { numReader } from './he3fKit';
import { drawnOf, levelBeads, MAX_DRAWN, roles, type Bead } from './proteinLevelsMath';

type Spec = Extract<Representation, { kind: 'macromolecules' }>;

const TITLES = [
  '1 Primary: sequence',
  '2 Secondary: helix',
  '3 Tertiary: the fold',
  '4 Quaternary: 2 chains',
];

const PANEL_H = 150;

export function ProteinLevels({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const num = numReader(rep);
  const nRaw = num(spec.count);
  const n = nRaw === undefined ? undefined : Math.round(nRaw);
  const lvRaw = num(spec.level);
  const level = lvRaw !== undefined && lvRaw >= 1 && lvRaw <= 4 ? Math.round(lvRaw) : undefined;
  const m = n === undefined ? 0 : drawnOf(n);
  const rs = n === undefined ? [] : roles(m);
  const tally = (r: string) => rs.filter((x) => x === r).length;
  const colorOf = (b: Bead) =>
    b.chain === 1
      ? c.he4dChainB
      : b.role === 'helix'
        ? c.he4dHelix
        : b.role === 'strand'
          ? c.he4dSheet
          : c.chartMuted;

  return (
    <View>
      <Canvas aspect={(w) => (2 * PANEL_H + 8) / w}>
        {({ w }) => {
          const pw = (w - 8) / 2;
          return (
            <Svg width={w} height={2 * PANEL_H + 8}>
              {[1, 2, 3, 4].map((lv) => {
                const px = lv % 2 === 1 ? 0 : pw + 8;
                const py = lv <= 2 ? 0 : PANEL_H + 8;
                const lit = lv === level;
                const ix = px + 8;
                const iy = py + 24;
                const iw = pw - 16;
                const ih = PANEL_H - 32;
                const beads = n === undefined ? [] : levelBeads(lv, n);
                const X = (b: Bead) => ix + b.x * iw;
                const Y = (b: Bead) => iy + b.y * ih;
                const r = Math.max(2.5, Math.min(5, iw / (lv === 1 ? 22 : 40)));
                const chains = [0, 1].map((k) => beads.filter((b) => b.chain === k));
                return (
                  <G key={lv}>
                    <Rect
                      x={px + 1}
                      y={py + 1}
                      width={pw - 2}
                      height={PANEL_H - 2}
                      rx={8}
                      fill={c.card}
                      stroke={lit ? c.chartHighlight : c.chartGrid}
                      strokeWidth={lit ? 2.5 : 1}
                    />
                    <ChartText
                      x={px + 8}
                      y={py + 17}
                      fontWeight={lit ? '700' : '400'}
                      fill={lit ? c.chartHighlight : c.chartMuted}
                    >
                      {TITLES[lv - 1]}
                    </ChartText>
                    <G opacity={level === undefined || lit ? 1 : 0.45}>
                      {chains.map((ch, k) =>
                        ch.length ? (
                          <Path
                            key={`p${k}`}
                            d={`M ${ch.map((b) => `${X(b)} ${Y(b)}`).join(' L ')}`}
                            fill="none"
                            stroke={k === 1 ? c.he4dChainB : c.chartMuted}
                            strokeWidth={1.4}
                            strokeLinejoin="round"
                          />
                        ) : null,
                      )}
                      {/* The sheet's two strands held by hydrogen bonds; the fold's S–S. */}
                      {lv === 2 && m > 6
                        ? beads
                            .map((b, i) => ({ b, i }))
                            .filter(({ b }) => b.role === 'strand' && b.y < 0.5)
                            .map(({ b, i }) => {
                              const partner = beads.find(
                                (q) =>
                                  q.role === 'strand' && q.y > 0.5 && Math.abs(q.x - b.x) < 0.04,
                              );
                              return partner ? (
                                <Line
                                  key={`h${i}`}
                                  x1={X(b)}
                                  y1={Y(b) + r}
                                  x2={X(partner)}
                                  y2={Y(partner) - r}
                                  stroke={c.chartMuted}
                                  strokeWidth={1}
                                  strokeDasharray={chart.dashFine}
                                />
                              ) : null;
                            })
                        : null}
                      {lv === 3 && m > 8 ? (
                        <Line
                          x1={X(beads[2]!)}
                          y1={Y(beads[2]!)}
                          x2={X(beads[m - 3]!)}
                          y2={Y(beads[m - 3]!)}
                          stroke={c.he4dSheet}
                          strokeWidth={2}
                          strokeDasharray={chart.dash}
                        />
                      ) : null}
                      {beads.map((b, i) => (
                        <Circle
                          key={i}
                          cx={X(b)}
                          cy={Y(b)}
                          r={r}
                          fill={colorOf(b)}
                          stroke={c.card}
                          strokeWidth={0.8}
                        />
                      ))}
                      {chains.map((ch, k) =>
                        ch.length && (lv === 1 || lv === 2) ? (
                          <G key={`e${k}`}>
                            <ChartText
                              x={X(ch[0]!) - r - 3}
                              y={Y(ch[0]!) + 4}
                              textAnchor="end"
                              fontWeight="700"
                            >
                              N
                            </ChartText>
                            <ChartText
                              x={X(ch[ch.length - 1]!)}
                              y={Y(ch[ch.length - 1]!) + r + 13}
                              textAnchor="middle"
                              fontWeight="700"
                            >
                              C
                            </ChartText>
                          </G>
                        ) : null,
                      )}
                    </G>
                  </G>
                );
              })}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {n !== undefined
          ? [
              `${formatNumber(n)} residues in every view${n > MAX_DRAWN ? ` (${MAX_DRAWN} drawn)` : ''}: ${tally('helix')} in the helix (pink), ${tally('strand')} in the sheet (gold)${tally('loop') ? ', 1 in the turn' : ''}${n > MAX_DRAWN ? ', as drawn' : ''}.`,
              level !== undefined
                ? [
                    'Primary: the order of amino acids from the N-terminus, joined by peptide bonds.',
                    'Secondary: a helix and a pleated sheet, held by C=O···H–N hydrogen bonds (dotted).',
                    'Tertiary: the whole chain folded, held by side chains and a disulfide bond (dashed).',
                    'Quaternary: two chains (the second teal) packed into one protein.',
                  ][level - 1]
                : 'Type the level, 1 to 4.',
            ].join(' · ')
          : 'Type the number of residues.'}
      </Caption>
    </View>
  );
}
