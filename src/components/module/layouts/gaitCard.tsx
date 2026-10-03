/**
 * HC156 card figure `gait` (GaitCard in typesHe4j.ts), 112 × 76: a stick walker side on, facing
 * right, at one of the gait cycle's six phases. The right leg (lit) is the one the phase names;
 * the left leg is grey. Each leg is drawn from its hip, thigh and shank angles and its foot's
 * tilt; the walker stands on the ground under its lowest foot. Flat.
 */
import { Circle, G, Line, Path } from 'react-native-svg';

import type { GaitPhase } from '@/data/modules/typesHe4j';
import { usePalette } from '@/theme';

export const GAIT_CARD_W = 112;
export const GAIT_CARD_H = 76;

/** A leg's pose: thigh from vertical (forward +), knee bend, foot tilt (toes up +), degrees. */
type Pose = [number, number, number];

/** The lit (right) leg and the other leg at each phase. */
const POSES: Record<GaitPhase, [Pose, Pose]> = {
  heelStrike: [
    [24, 3, 18],
    [-18, 30, -38],
  ],
  footFlat: [
    [18, 16, 0],
    [-20, 35, -45],
  ],
  midstance: [
    [0, 6, 0],
    [12, 58, -12],
  ],
  heelOff: [
    [-14, 6, -18],
    [24, 12, 12],
  ],
  toeOff: [
    [-20, 36, -46],
    [20, 6, 6],
  ],
  midswing: [
    [12, 60, -10],
    [-2, 5, 0],
  ],
};

const THIGH = 20;
const SHANK = 20;
const rad = (d: number) => (d * Math.PI) / 180;

/** The joints of a leg from the hip at the origin: knee, ankle, heel, toe. */
function leg([thigh, knee, tilt]: Pose) {
  const knee_ = [THIGH * Math.sin(rad(thigh)), THIGH * Math.cos(rad(thigh))];
  const s = rad(thigh - knee);
  const ankle = [knee_[0]! + SHANK * Math.sin(s), knee_[1]! + SHANK * Math.cos(s)];
  // The foot: heel 3 px back and 4 down from the ankle, toes 12 ahead, turned by the tilt.
  const turn = ([x, y]: [number, number]) => [
    ankle[0]! + x * Math.cos(rad(tilt)) + y * Math.sin(rad(tilt)),
    ankle[1]! - x * Math.sin(rad(tilt)) + y * Math.cos(rad(tilt)),
  ];
  return { knee: knee_, ankle, heel: turn([-3, 4]), toe: turn([12, 4]) };
}

export function GaitCardView({ phase, ink }: { phase: GaitPhase; ink: string }) {
  const c = usePalette();
  const [lit, other] = POSES[phase].map(leg) as [ReturnType<typeof leg>, ReturnType<typeof leg>];
  const ground = 68;
  const lowest = Math.max(lit.heel[1]!, lit.toe[1]!, other.heel[1]!, other.toe[1]!);
  const hip = [GAIT_CARD_W / 2, ground - lowest];
  const at = (p: number[]) => [hip[0]! + p[0]!, hip[1]! + p[1]!] as const;
  const draw = (l: ReturnType<typeof leg>, color: string, width: number) => {
    const [k, a, h, t] = [at(l.knee), at(l.ankle), at(l.heel), at(l.toe)];
    return (
      <G>
        <Path
          d={`M ${hip[0]} ${hip[1]} L ${k[0]} ${k[1]} L ${a[0]} ${a[1]} L ${h[0]} ${h[1]} L ${t[0]} ${t[1]} L ${a[0]} ${a[1]}`}
          stroke={color}
          strokeWidth={width}
          strokeLinejoin="round"
          strokeLinecap="round"
          fill="none"
        />
        <Circle cx={k[0]} cy={k[1]} r={2} fill={color} />
      </G>
    );
  };
  return (
    <G>
      <Line x1={6} y1={ground} x2={GAIT_CARD_W - 6} y2={ground} stroke={ink} strokeWidth={1.5} />
      {/* The trunk and head above the hip. */}
      <Line
        x1={hip[0]}
        y1={hip[1]}
        x2={hip[0]! + 2}
        y2={hip[1]! - 11}
        stroke={ink}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <Circle
        cx={hip[0]! + 2.5}
        cy={hip[1]! - 14.5}
        r={3.2}
        fill="none"
        stroke={ink}
        strokeWidth={1.8}
      />
      {draw(other, c.chartMuted, 2.5)}
      {draw(lit, c.he4jStance, 3)}
      <Circle cx={hip[0]} cy={hip[1]} r={2.4} fill={ink} />
    </G>
  );
}
