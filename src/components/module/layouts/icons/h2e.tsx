/**
 * Grades 9–12 round 2 card icons (group H2E), 48 × 48 like every card icon, drawn in their
 * materials with the helpers in reps/paint.tsx. The names are listed in
 * data/modules/layouts/icons/h2e.ts.
 *
 * Membrane transport (H100): a patch of bilayer (heads out, tails in; the outside above) and
 * how each kind crosses it: small molecules slipping between the phospholipids (simple
 * diffusion), ions through a channel protein, glucose held in a carrier protein, water through
 * an aquaporin, ions pumped up from the side with fewer by a pump spending ATP, and particles
 * wrapped in a vesicle of membrane (bulk transport).
 *
 * Blood types (H104): a red blood cell with its markers: A (green wedges), B (orange knobs), both
 * (AB) or none (O).
 *
 * Body systems (H104): a brain and spinal cord with nerves; a gland (the thyroid) sending
 * hormone into a vessel; a heart with an artery and a vein; lungs on the windpipe; kidneys with
 * their ureters and the bladder; a stomach and the coiled intestine.
 */
import type { ReactNode } from 'react';
import { Circle, Defs, Ellipse, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import { usePalette, type Palette } from '@/theme';

import { Ball, url, usePaintIds } from '../../reps/paint';
import type { IconProps } from './types';

export function H2EIcon({ icon, ink }: IconProps): ReactNode {
  const c = usePalette();
  const ids = usePaintIds('cell', 'protein', 'organ', 'heart', 'kidney', 'stomach', 'gland');
  const defs = (
    <Defs>
      <Ball id={ids.cell} color={c.bloodCell} />
      <Ball id={ids.protein} color={c.bioProtein} />
      <Ball id={ids.organ} color={c.organ} />
      <Ball id={ids.heart} color={c.organDeep} />
      <Ball id={ids.kidney} color={c.h2eKidney} />
      <Ball id={ids.stomach} color={c.stomach} />
      <Ball id={ids.gland} color={c.h2eGland} />
    </Defs>
  );
  const body = draw(icon, c, ink, ids);
  return body ? (
    <G>
      {defs}
      {body}
    </G>
  ) : null;
}

type Ids = Record<'cell' | 'protein' | 'organ' | 'heart' | 'kidney' | 'stomach' | 'gland', string>;

function draw(icon: string, c: Palette, ink: string, ids: Ids): ReactNode {
  switch (icon) {
    case 'simple diffusion':
      return (
        <G>
          <Bilayer c={c} />
          {dots(
            [
              [8, 5],
              [18, 9],
              [30, 4],
              [40, 9],
              [13, 13],
              [35, 13],
            ],
            c.bioSolute,
          )}
          {dots([[22, 42]], c.bioSolute)}
          <Circle cx={26} cy={24} r={2.2} fill={c.bioSolute} />
          <Arrow x={33} y1={17} y2={32} color={ink} />
        </G>
      );
    case 'channel protein':
      return (
        <G>
          <Bilayer c={c} gap={[18, 30]} />
          <Rect
            x={16}
            y={14}
            width={5}
            height={20}
            rx={2.5}
            fill={url(ids.protein)}
            stroke={c.bioProteinEdge}
            strokeWidth={0.8}
          />
          <Rect
            x={27}
            y={14}
            width={5}
            height={20}
            rx={2.5}
            fill={url(ids.protein)}
            stroke={c.bioProteinEdge}
            strokeWidth={0.8}
          />
          {dots(
            [
              [8, 6],
              [16, 9],
              [32, 5],
              [41, 9],
              [24, 7],
            ],
            c.dnaC,
          )}
          <Circle cx={24} cy={24} r={2.2} fill={c.dnaC} />
          {dots([[30, 42]], c.dnaC)}
          <Arrow x={39} y1={17} y2={32} color={ink} />
        </G>
      );
    case 'carrier protein':
      return (
        <G>
          <Bilayer c={c} gap={[15, 33]} />
          {/* The carrier: a body with a pocket open to the outside, glucose in it. */}
          <Path
            d="M 15 12 Q 15 10 17 10 L 21 10 L 21 18 Q 24 21 27 18 L 27 10 L 31 10 Q 33 10 33 12 L 33 34 Q 33 37 30 37 L 18 37 Q 15 37 15 34 Z"
            fill={url(ids.protein)}
            stroke={c.bioProteinEdge}
            strokeWidth={0.8}
          />
          <Hexagon x={24} y={14} r={3.4} c={c} />
          <Hexagon x={8} y={6} r={3} c={c} />
          <Hexagon x={40} y={7} r={3} c={c} />
          <Path
            d="M 37 18 q 5 6 0 13"
            stroke={ink}
            strokeWidth={1.3}
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d="M 34.6 29 l 2.4 2.4 l 1.2 -3.2"
            stroke={ink}
            strokeWidth={1.3}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </G>
      );
    case 'aquaporin':
      return (
        <G>
          <Bilayer c={c} gap={[18, 30]} />
          <Rect
            x={16}
            y={14}
            width={5}
            height={20}
            rx={2.5}
            fill={url(ids.protein)}
            stroke={c.bioProteinEdge}
            strokeWidth={0.8}
          />
          <Rect
            x={27}
            y={14}
            width={5}
            height={20}
            rx={2.5}
            fill={url(ids.protein)}
            stroke={c.bioProteinEdge}
            strokeWidth={0.8}
          />
          <Water x={9} y={7} c={c} />
          <Water x={38} y={6} c={c} />
          <Water x={24} y={23} c={c} />
          <Water x={30} y={42} c={c} />
          <Arrow x={42} y1={17} y2={32} color={c.waterDeep} />
        </G>
      );
    case 'protein pump':
      return (
        <G>
          <Bilayer c={c} gap={[15, 33]} />
          <Rect
            x={15}
            y={11}
            width={18}
            height={26}
            rx={6}
            fill={url(ids.protein)}
            stroke={c.bioProteinEdge}
            strokeWidth={0.8}
          />
          {dots(
            [
              [6, 4],
              [14, 7],
              [34, 5],
              [42, 8],
              [6, 10],
              [42, 3],
            ],
            c.dnaT,
          )}
          {dots([[12, 42]], c.dnaT)}
          <Circle cx={24} cy={27} r={2.2} fill={c.dnaT} />
          {/* ATP at the pump's foot: the energy it spends. */}
          <Polygon
            points="24,39 26,42.5 30,43 27,45.5 28,48 24,46.5 20,48 21,45.5 18,43 22,42.5"
            fill={c.bioAtp}
            stroke={c.bioInk}
            strokeWidth={0.5}
          />
          <Arrow x={39} y1={33} y2={16} color={ink} />
        </G>
      );
    case 'vesicle transport':
      return (
        <G>
          {/* The membrane folding in round a vesicle as it pinches off. */}
          <Path
            d="M 0 16 L 14 16 Q 16 16 16 19 Q 16 34 24 34 Q 32 34 32 19 Q 32 16 34 16 L 48 16"
            stroke={c.bioHead}
            strokeWidth={3.5}
            fill="none"
          />
          <Path
            d="M 0 22 L 9 22 Q 10 22 10 25 Q 10 40 24 40 Q 38 40 38 25 Q 38 22 39 22 L 48 22"
            stroke={c.bioHead}
            strokeWidth={3.5}
            fill="none"
          />
          <Path
            d="M 0 19 L 12 19 Q 13 19 13 22 Q 13 37 24 37 Q 35 37 35 22 Q 35 19 36 19 L 48 19"
            stroke={c.bioTail}
            strokeWidth={2.6}
            fill="none"
          />
          {dots(
            [
              [20, 22],
              [27, 25],
              [23, 29],
              [28, 19],
            ],
            c.bioSolute,
          )}
          {dots(
            [
              [6, 6],
              [40, 8],
            ],
            c.bioSolute,
          )}
        </G>
      );
    case 'blood type A':
    case 'blood type B':
    case 'blood type AB':
    case 'blood type O': {
      const t = icon.slice('blood type '.length);
      const n = 10;
      return (
        <G>
          <Circle
            cx={24}
            cy={24}
            r={15}
            fill={url(ids.cell)}
            stroke={c.bloodCellDeep}
            strokeWidth={1}
          />
          <Circle cx={24} cy={24} r={6.5} fill={c.shine} opacity={0.25} />
          {Array.from({ length: n }, (_, k) => {
            const a = (k * 2 * Math.PI) / n - Math.PI / 2;
            const kind = t === 'AB' ? (k % 2 ? 'B' : 'A') : t;
            if (kind === 'O') return null;
            const [x, y] = [24 + 18.5 * Math.cos(a), 24 + 18.5 * Math.sin(a)];
            const [bx, by] = [24 + 15 * Math.cos(a), 24 + 15 * Math.sin(a)];
            return (
              <G key={k}>
                <Line x1={bx} y1={by} x2={x} y2={y} stroke={c.bloodCellDeep} strokeWidth={1} />
                {kind === 'A' ? (
                  <Polygon
                    points={[0, 2.1, 4.2]
                      .map((d) => {
                        const u = a + d - 2.1;
                        return `${x + 3.2 * Math.cos(u)},${y + 3.2 * Math.sin(u)}`;
                      })
                      .join(' ')}
                    fill={c.h2eAntigenA}
                    stroke={ink}
                    strokeWidth={0.5}
                  />
                ) : (
                  <Circle
                    cx={x}
                    cy={y}
                    r={2.6}
                    fill={c.h2eAntigenB}
                    stroke={ink}
                    strokeWidth={0.5}
                  />
                )}
              </G>
            );
          })}
        </G>
      );
    }
    case 'nervous system':
      return (
        <G>
          <Path d="M 24 22 L 24 46" stroke={c.h2eNerve} strokeWidth={3} strokeLinecap="round" />
          {[
            [30, 14, 38],
            [36, 18, 42],
          ].map(([y, x1, x2]) => (
            <G key={y}>
              <Path
                d={`M 24 ${y} Q ${(24 + x1!) / 2} ${y! + 2} ${x1} ${y! + 8}`}
                stroke={c.h2eNerve}
                strokeWidth={1.6}
                fill="none"
                strokeLinecap="round"
              />
              <Path
                d={`M 24 ${y} Q ${(24 + x2!) / 2} ${y! + 2} ${x2} ${y! + 8}`}
                stroke={c.h2eNerve}
                strokeWidth={1.6}
                fill="none"
                strokeLinecap="round"
              />
            </G>
          ))}
          <Ellipse
            cx={24}
            cy={13}
            rx={16}
            ry={11}
            fill={url(ids.organ)}
            stroke={c.organDeep}
            strokeWidth={1}
          />
          {/* Folds and the cleft between the halves. */}
          <Path d="M 24 3 L 24 23" stroke={c.organDeep} strokeWidth={0.9} />
          <Path
            d="M 12 10 q 3 -3 6 0 t 4 0 M 27 9 q 3 -3 6 0 t 4 1 M 13 16 q 3 3 6 0 M 28 16 q 3 3 7 0"
            stroke={c.organDeep}
            strokeWidth={0.8}
            fill="none"
          />
        </G>
      );
    case 'endocrine system':
      return (
        <G>
          {/* A blood vessel along the bottom, the gland above sending hormone into it. */}
          <Rect x={2} y={34} width={44} height={9} rx={4.5} fill={c.bloodCell} opacity={0.85} />
          <Path
            d="M 24 20 Q 16 6 8 12 Q 4 20 12 26 Q 19 28 24 22 Q 29 28 36 26 Q 44 20 40 12 Q 32 6 24 20 Z"
            fill={url(ids.gland)}
            stroke={ink}
            strokeWidth={0.8}
          />
          {dots(
            [
              [22, 30],
              [27, 31],
              [20, 38],
              [30, 38],
              [36, 39],
            ],
            c.bioAtp,
            1.8,
          )}
          <Path d="M 24 25 L 24 32" stroke={ink} strokeWidth={1.1} />
          <Path d="M 22 30 l 2 2.4 l 2 -2.4" stroke={ink} strokeWidth={1.1} fill="none" />
        </G>
      );
    case 'heart and blood vessels':
      return (
        <G>
          {/* The vena cava coming in (blue) and the aorta arching out (red) over the heart. */}
          <Path d="M 16 20 L 16 2" stroke={c.h2eVein} strokeWidth={4.5} strokeLinecap="round" />
          <Path
            d="M 26 18 C 25 4 40 2 40 12 L 40 16"
            stroke={c.bloodCell}
            strokeWidth={5}
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d="M 24 46 C 8 36 4 28 6 20 C 8 12 19 11 24 18 C 29 11 40 12 42 20 C 44 28 40 36 24 46 Z"
            fill={url(ids.heart)}
            stroke={ink}
            strokeWidth={0.8}
          />
          <Path
            d="M 20 22 Q 22 32 30 39"
            stroke={c.shade}
            strokeWidth={0.9}
            fill="none"
            opacity={0.45}
          />
        </G>
      );
    case 'respiratory system':
      return (
        <G>
          <Path
            d="M 24 1 L 24 15 M 24 15 L 17 21 M 24 15 L 31 21"
            stroke={c.bone}
            strokeWidth={3.4}
            strokeLinecap="round"
          />
          <Path
            d="M 24 1 L 24 15 M 24 15 L 17 21 M 24 15 L 31 21"
            stroke={ink}
            strokeWidth={0.6}
            strokeLinecap="round"
            opacity={0.5}
          />
          <Path
            d="M 20 12 Q 5 12 3 32 Q 2 46 12 46 Q 21 46 21 38 L 21 17 Z"
            fill={url(ids.organ)}
            stroke={c.organDeep}
            strokeWidth={1}
          />
          <Path
            d="M 28 12 Q 43 12 45 32 Q 46 46 36 46 Q 27 46 27 38 L 27 17 Z"
            fill={url(ids.organ)}
            stroke={c.organDeep}
            strokeWidth={1}
          />
          {/* Bronchi branching inside each lung. */}
          <Path
            d="M 17 21 L 13 28 M 15 25 L 10 26 M 31 21 L 35 28 M 33 25 L 38 26"
            stroke={c.organDeep}
            strokeWidth={1}
            strokeLinecap="round"
            opacity={0.7}
          />
        </G>
      );
    case 'excretory system':
      return (
        <G>
          <Path
            d="M 14 22 Q 16 32 21 38 M 34 22 Q 32 32 27 38"
            stroke={c.h2eGland}
            strokeWidth={1.8}
            fill="none"
          />
          {[14, 34].map((x) => (
            <Path
              key={x}
              d={
                x < 24
                  ? `M ${x} 5 Q ${x - 11} 5 ${x - 10} 15 Q ${x - 9} 25 ${x} 24 Q ${x + 5} 23 ${x + 3} 15 Q ${x + 5} 7 ${x} 5 Z`
                  : `M ${x} 5 Q ${x + 11} 5 ${x + 10} 15 Q ${x + 9} 25 ${x} 24 Q ${x - 5} 23 ${x - 3} 15 Q ${x - 5} 7 ${x} 5 Z`
              }
              fill={url(ids.kidney)}
              stroke={ink}
              strokeWidth={0.8}
            />
          ))}
          <Ellipse
            cx={24}
            cy={41}
            rx={7}
            ry={5.5}
            fill={c.h2eGland}
            opacity={0.85}
            stroke={ink}
            strokeWidth={0.8}
          />
        </G>
      );
    case 'digestive system':
      return (
        <G>
          {/* The small intestine coiled below the stomach. */}
          <Path
            d="M 14 34 q 4 -5 8 0 t 8 0 t 8 0 M 14 40 q 4 -5 8 0 t 8 0 t 8 0"
            stroke={c.organ}
            strokeWidth={4}
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d="M 14 34 q 4 -5 8 0 t 8 0 t 8 0 M 14 40 q 4 -5 8 0 t 8 0 t 8 0"
            stroke={c.organDeep}
            strokeWidth={0.7}
            fill="none"
            opacity={0.6}
          />
          <Path
            d="M 20 2 L 20 8 Q 8 10 10 20 Q 13 30 26 27 Q 38 24 34 13 Q 31 7 24 9 L 24 2"
            fill={url(ids.stomach)}
            stroke={ink}
            strokeWidth={0.8}
          />
        </G>
      );
  }
  return null;
}

/** Small particles at the given places. */
const dots = (pts: number[][], fill: string, r = 1.9) =>
  pts.map(([x, y]) => <Circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill={fill} />);

/** A patch of bilayer across the icon, heads out and tails in; `gap` leaves room for a protein. */
function Bilayer({ c, gap }: { c: Palette; gap?: [number, number] }) {
  const xs = Array.from({ length: 9 }, (_, k) => 2.7 + k * 5.3).filter(
    (x) => !gap || x < gap[0] - 1 || x > gap[1] + 1,
  );
  return (
    <G>
      {xs.map((x) => (
        <G key={x}>
          <Line x1={x - 0.8} y1={19} x2={x - 0.8} y2={29} stroke={c.bioTail} strokeWidth={1.1} />
          <Line x1={x + 0.8} y1={19} x2={x + 0.8} y2={29} stroke={c.bioTail} strokeWidth={1.1} />
          <Circle cx={x} cy={17} r={2.5} fill={c.bioHead} />
          <Circle cx={x} cy={31} r={2.5} fill={c.bioHead} />
        </G>
      ))}
    </G>
  );
}

function Arrow({ x, y1, y2, color }: { x: number; y1: number; y2: number; color: string }) {
  const d = y2 > y1 ? 1 : -1;
  return (
    <G>
      <Line x1={x} y1={y1} x2={x} y2={y2} stroke={color} strokeWidth={1.4} strokeLinecap="round" />
      <Path
        d={`M ${x - 2.6} ${y2 - 3 * d} L ${x} ${y2} L ${x + 2.6} ${y2 - 3 * d}`}
        stroke={color}
        strokeWidth={1.4}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </G>
  );
}

function Hexagon({ x, y, r, c }: { x: number; y: number; r: number; c: Palette }) {
  return (
    <Polygon
      points={Array.from({ length: 6 }, (_, k) => {
        const t = (k * Math.PI) / 3;
        return `${x + r * Math.cos(t)},${y + r * Math.sin(t)}`;
      }).join(' ')}
      fill={c.bioSugar}
      stroke={c.bioSugarEdge}
      strokeWidth={0.7}
    />
  );
}

/** A water molecule: a red oxygen and two white hydrogens. */
function Water({ x, y, c }: { x: number; y: number; c: Palette }) {
  return (
    <G>
      <Circle
        cx={x - 2.6}
        cy={y + 1.8}
        r={1.5}
        fill={c.atomH}
        stroke={c.chartMuted}
        strokeWidth={0.4}
      />
      <Circle
        cx={x + 2.6}
        cy={y + 1.8}
        r={1.5}
        fill={c.atomH}
        stroke={c.chartMuted}
        strokeWidth={0.4}
      />
      <Circle cx={x} cy={y} r={2.3} fill={c.atomO} />
    </G>
  );
}
