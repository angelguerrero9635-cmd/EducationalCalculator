/**
 * HC57 `pathwayStep` card figure (college, round 3 group G), 112 × 76, for the stages of a
 * glycolysis or citric acid cycle sequence: the step's molecules as carbon chains (one dot per
 * carbon, phosphates as small orange dots on the chain, CoA as a tag at its end), an arrow to
 * what it makes (an aldolase split draws two 3C chains), and under them what the step makes
 * (+) or uses (−): ATP, GTP, NADH, FADH₂, CO₂. Flat.
 */
import { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import {
  PATHWAYS,
  PATHWAY_CARD_W,
  YIELD_NAMES,
  type Metabolite,
  type PathwayStepCard,
  type StepYield,
} from '@/data/modules/typesHe3g';
import { chart, usePalette } from '@/theme';

const DOT = 7;

/** One molecule's chain, centered on (cx, y). */
function Chain({ m, cx, y, ink }: { m: Metabolite; cx: number; y: number; ink: string }) {
  const c = usePalette();
  const w = (m.carbons - 1) * DOT + (m.coa ? 9 : 0);
  const x0 = cx - w / 2;
  const xs = Array.from({ length: m.carbons }, (_, i) => x0 + i * DOT);
  // Phosphates sit on the end carbons (the last one first) unless the molecule says where.
  const pAt = m.on
    ? m.on.map((i) => xs[i]!)
    : m.phosphates === 2
      ? [xs[0]!, xs[xs.length - 1]!]
      : m.phosphates === 1
        ? [xs[xs.length - 1]!]
        : [];
  return (
    <G>
      <Line
        x1={xs[0]!}
        y1={y}
        x2={xs[xs.length - 1]! + (m.coa ? 6 : 0)}
        y2={y}
        stroke={ink}
        strokeWidth={1.4}
      />
      {pAt.map((x, i) => (
        <G key={`p${i}`}>
          <Line x1={x} y1={y} x2={x} y2={y - 7} stroke={ink} strokeWidth={1.2} />
          <Circle cx={x} cy={y - 9} r={3.2} fill={c.bioPhosphate} stroke={ink} strokeWidth={0.8} />
        </G>
      ))}
      {xs.map((x, i) => (
        <Circle key={i} cx={x} cy={y} r={2.8} fill={ink} />
      ))}
      {m.coa ? (
        <Rect
          x={xs[xs.length - 1]! + 4}
          y={y - 3.5}
          width={8}
          height={7}
          rx={1.5}
          fill={c.bioAmino}
          stroke={ink}
          strokeWidth={0.8}
        />
      ) : null}
    </G>
  );
}

/** Molecules stacked in a column centered on cx. */
function Column({ ms, cx, ink }: { ms: Metabolite[]; cx: number; ink: string }) {
  const ys = ms.length === 1 ? [26] : [18, 38];
  return (
    <G>
      {ms.map((m, i) => (
        <Chain key={i} m={m} cx={cx} y={ys[i]!} ink={ink} />
      ))}
    </G>
  );
}

export function PathwayCard({ f, ink }: { f: PathwayStepCard; ink: string }) {
  const c = usePalette();
  const s = PATHWAYS[f.pathway][f.step - 1];
  if (!s) return null;
  const chips = (Object.keys(YIELD_NAMES) as (keyof StepYield)[])
    .filter((k) => k !== 'H2O' && s.yields[k])
    .map((k) => ({
      k,
      text: `${s.yields[k]! > 0 ? '+' : '−'}${Math.abs(s.yields[k]!) === 1 ? '' : `${Math.abs(s.yields[k]!)} `}${YIELD_NAMES[k]}`,
    }));
  const widths = chips.map((x) => x.text.length * chart.label * 0.66 + 8);
  const total = widths.reduce((a, b) => a + b, 0) + (chips.length - 1) * 4;
  let x = (PATHWAY_CARD_W - total) / 2;
  return (
    <G>
      <Column ms={s.from} cx={26} ink={ink} />
      <Line x1={50} y1={28} x2={60} y2={28} stroke={ink} strokeWidth={1.6} />
      <Path d="M 64 28 L 58 24.5 L 58 31.5 Z" fill={ink} />
      <Column ms={s.to} cx={88} ink={ink} />
      {chips.map((ch, i) => {
        const w = widths[i]!;
        const left = x;
        x += w + 4;
        const atp = ch.k === 'ATP' || ch.k === 'GTP';
        return (
          <G key={ch.k}>
            <Rect
              x={left}
              y={54}
              width={w}
              height={18}
              rx={9}
              fill={atp ? c.bioAtp : c.card}
              stroke={ink}
              strokeWidth={s.yields[ch.k]! < 0 ? 1.2 : 0.8}
              strokeDasharray={s.yields[ch.k]! < 0 ? '3 2' : undefined}
            />
            <SvgText
              x={left + w / 2}
              y={67}
              textAnchor="middle"
              fontSize={chart.label}
              fontWeight="700"
              fill={atp ? c.bioInk : ink}
            >
              {ch.text}
            </SvgText>
          </G>
        );
      })}
    </G>
  );
}
