/**
 * HC57 `organelleEnergy` `detail` (college, round 3 group G): a pathway step by step. Each row
 * is one step: its number, its enzyme, what it turns into what (with the carbons), and what it
 * makes or uses on the right; the tally of ATP, GTP, NADH, FADH₂ and CO₂ is added under the
 * rows. `step` lights one row, fades the ones after it and tallies to it. Glycolysis counts per
 * glucose (steps 6–10 twice), the citric acid cycle per acetyl-CoA, the electron transport chain
 * per pair of electrons with the H⁺ pumped. Flat.
 */
import { Circle, G, Rect } from 'react-native-svg';

import {
  PATHWAYS,
  PROTONS_PER_ATP,
  YIELD_NAMES,
  pathwayTally,
  type PathwayName,
  type StepYield,
} from '@/data/modules/typesHe3g';
import type { EnergyScene } from '@/data/modules/typesHsg';
import { chart, usePalette } from '@/theme';

import { ChartText } from '../reps/common';
import { BOARD_W, Board } from './earthKit';

const TITLES: Record<PathwayName, string> = {
  glycolysis: 'Glycolysis, per glucose (cytoplasm)',
  krebs: 'Citric acid cycle, per acetyl-CoA (matrix)',
  etc: 'Electron transport, per electron pair (cristae)',
};

const ROW = 30;
const TOP = 30;

/** "+2 NADH  +1 CO₂": a step's yields, made (+) or used (−). */
export function yieldText(y: StepYield): string {
  return (Object.keys(YIELD_NAMES) as (keyof StepYield)[])
    .filter((k) => k !== 'H2O' && y[k])
    .map((k) => `${y[k]! > 0 ? '+' : '−'}${Math.abs(y[k]!)} ${YIELD_NAMES[k]}`)
    .join('  ');
}

/** The tally under the rows ("+2 ATP, +2 NADH"), H₂O left out. */
function tallyText(name: PathwayName, upTo?: number): string {
  const t = pathwayTally(name, upTo);
  const parts = (['ATP', 'GTP', 'NADH', 'FADH2', 'CO2'] as const)
    .filter((k) => t[k] !== 0)
    .map((k) => `${t[k] > 0 ? '+' : '−'}${Math.abs(t[k])} ${YIELD_NAMES[k]}`);
  return parts.length ? parts.join(', ') : 'nothing yet';
}

export function PathwayDetail({ energy }: { energy: EnergyScene }) {
  const c = usePalette();
  const name = energy.detail!;
  const steps = PATHWAYS[name];
  const lit = energy.step;
  const footer =
    name === 'etc'
      ? [
          `Per NADH: 4 + 4 + 2 = 10 H⁺ out, 10 ÷ ${PROTONS_PER_ATP} = 2.5 ATP`,
          `Per FADH₂ (in at Complex II): 4 + 2 = 6 H⁺, 6 ÷ ${PROTONS_PER_ATP} = 1.5 ATP`,
        ]
      : [
          lit !== undefined && lit < steps.length
            ? `So far (steps 1–${lit}): ${tallyText(name, lit)}`
            : `${name === 'glycolysis' ? 'Net per glucose' : 'Per turn'}: ${tallyText(name)}`,
          name === 'glycolysis'
            ? 'Steps 6–10 run twice: aldolase splits one 6C sugar into two 3C.'
            : 'Two turns per glucose (two acetyl-CoA).',
        ];
  const H = TOP + steps.length * ROW + 12 + footer.length * 18;
  return (
    <Board height={H}>
      <ChartText x={8} y={18} fontSize={chart.value} fontWeight="700">
        {TITLES[name]}
      </ChartText>
      {steps.map((s, i) => {
        const y = TOP + i * ROW;
        const on = lit === i + 1;
        const later = lit !== undefined && i + 1 > lit;
        const line2 =
          name === 'etc'
            ? (s.note ?? '')
            : `${s.from.map((x) => x.short).join(' + ')} → ${s.to.map((x) => x.short).join(' + ')}  (${s.from.reduce((a, x) => a + x.carbons, 0)}C)${name === 'glycolysis' && i >= 5 ? '  ×2' : ''}`;
        const right =
          name === 'etc'
            ? s.protons !== undefined
              ? `${s.protons} H⁺ out`
              : ''
            : yieldText(s.yields);
        return (
          <G key={i} opacity={later ? 0.35 : 1}>
            {on ? (
              <Rect
                x={2}
                y={y - 1}
                width={BOARD_W - 4}
                height={ROW - 2}
                rx={6}
                fill={c.chartHighlight}
                opacity={0.14}
                stroke={c.chartHighlight}
                strokeWidth={1.5}
              />
            ) : i % 2 ? (
              <Rect
                x={2}
                y={y - 1}
                width={BOARD_W - 4}
                height={ROW - 2}
                rx={6}
                fill={c.chartFill}
                opacity={0.5}
              />
            ) : null}
            <Circle
              cx={15}
              cy={y + 13}
              r={9}
              fill={on ? c.chartHighlight : c.card}
              stroke={c.chartInk}
              strokeWidth={1}
            />
            <ChartText
              x={15}
              y={y + 17}
              textAnchor="middle"
              fontSize={chart.label}
              fontWeight="700"
              fill={on ? c.card : c.chartInk}
            >
              {String(i + 1)}
            </ChartText>
            <ChartText x={30} y={y + 11} fontSize={chart.label} fontWeight="700">
              {s.enzyme}
            </ChartText>
            <ChartText x={30} y={y + 25} fontSize={chart.label} fill={c.chartMuted}>
              {line2}
            </ChartText>
            {right ? (
              <ChartText
                x={BOARD_W - 8}
                y={y + 18}
                textAnchor="end"
                fontSize={chart.label}
                fontWeight="700"
                fill={(s.yields.ATP ?? 0) < 0 ? c.hopBack : c.chartInk}
              >
                {right}
              </ChartText>
            ) : null}
          </G>
        );
      })}
      {footer.map((t, k) => (
        <ChartText
          key={k}
          x={8}
          y={TOP + steps.length * ROW + 14 + k * 18}
          fontSize={chart.label}
          fontWeight={k === 0 ? '700' : '400'}
          fill={k === 0 ? c.chartHighlight : c.chartMuted}
        >
          {t}
        </ChartText>
      ))}
    </Board>
  );
}
