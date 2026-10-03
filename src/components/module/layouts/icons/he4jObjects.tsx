/**
 * College card icons, round 4, group J (HC158), 48 × 48: implants and scanners, painted in their
 * materials with the paint helpers. Implants: a titanium hip stem, a cobalt-chrome femoral head,
 * a steel bone screw, a polyethylene cup liner, PMMA bone cement in its bowl, a violet PLGA
 * suture on a curved needle, an alumina femoral head and a stem with its hydroxyapatite coat.
 * Scanners: an X-ray tube, a CT ring, an MRI bore, an ultrasound probe, a PET ring, a SPECT
 * camera and an OCT probe. Drawn from He4jIcon (he4j.tsx); names in data/.../icons/he4j.ts.
 */
import type { ReactNode } from 'react';
import { Circle, ClipPath, Defs, Ellipse, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import { usePalette } from '@/theme';

import { Ball, Glass, Metal, Sheen, url, usePaintIds } from '../../reps/paint';
import type { IconProps } from './types';

/** A hip stem: neck up and to the right, the body tapering down. */
const STEM =
  'M 21 15 Q 21 10 26 9 L 32 6 Q 34 5 35 7 L 37 10 Q 37.5 12 35.5 13 L 31 15 Q 29.5 22 28.5 28 L 26 43 Q 24.5 46 22.5 43.5 L 19.5 28 Q 18.5 20 21 15 Z';

/** A donut (a scanner's gantry) round (x, y), radii `r` and `hole`, for the even-odd rule. */
const donut = (x: number, y: number, r: number, hole: number) =>
  `M ${x - r} ${y} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0 Z M ${x - hole} ${y} a ${hole} ${hole} 0 1 0 ${2 * hole} 0 a ${hole} ${hole} 0 1 0 ${-2 * hole} 0 Z`;

export function He4jObjectIcon({ icon, ink }: IconProps): ReactNode {
  const c = usePalette();
  const ids = usePaintIds('ti', 'steel', 'chrome', 'ceramic', 'glass', 'sheen', 'brass', 'clip');
  const defs = (
    <Defs>
      <Metal id={ids.ti} light={c.he4jTitanium} dark={c.silverDark} />
      <Metal id={ids.steel} light={c.silver} dark={c.silverDark} />
      <Metal id={ids.chrome} light={c.paper} dark={c.silverDark} />
      <Ball id={ids.ceramic} color={c.he4jCeramic} />
      <Glass id={ids.glass} />
      <Sheen id={ids.sheen} />
      <Metal id={ids.brass} light={c.brass} dark={c.brassDark} />
      <ClipPath id={ids.clip}>
        <Path d={STEM} />
      </ClipPath>
    </Defs>
  );
  const stem = (coated: boolean) => (
    <G>
      <Path d={STEM} fill={url(ids.ti)} stroke={c.silverDark} strokeWidth={0.8} />
      <Path d={STEM} fill={url(ids.sheen)} />
      {coated ? (
        <G clipPath={url(ids.clip)}>
          <Rect x={14} y={12} width={24} height={14} fill={c.he4jApatite} />
          {Array.from({ length: 30 }, (_, i) => (
            <Circle
              key={i}
              cx={17 + ((i * 7) % 20)}
              cy={13 + ((i * 5) % 13)}
              r={0.8}
              fill={c.brassDark}
              fillOpacity={0.5}
            />
          ))}
        </G>
      ) : null}
      {/* The neck's taper, where the head goes on. */}
      <Path
        d="M 31.5 7 L 35.5 4.5 L 39 9.5 L 35 12.5 Z"
        fill={url(ids.steel)}
        stroke={c.silverDark}
        strokeWidth={0.6}
      />
    </G>
  );
  const head = (fill: string, mirror: boolean) => (
    <G>
      <Circle cx={24} cy={22} r={16} fill={fill} stroke={c.silverDark} strokeWidth={0.8} />
      {mirror ? (
        <Ellipse
          cx={18}
          cy={14}
          rx={5}
          ry={3}
          fill={c.paper}
          fillOpacity={0.8}
          transform="rotate(-30 18 14)"
        />
      ) : null}
      {/* The flat underside with the taper bore. */}
      <Ellipse cx={24} cy={35} rx={10.5} ry={3} fill={c.silverDark} />
      <Ellipse cx={24} cy={35} rx={4} ry={1.3} fill={ink} />
    </G>
  );
  const body = (() => {
    switch (icon) {
      // ── Implants ──
      case 'titanium hip stem':
        return stem(false);
      case 'hydroxyapatite-coated stem':
        return stem(true);
      case 'CoCrMo femoral head':
        return head(url(ids.chrome), true);
      case 'alumina femoral head':
        return head(url(ids.ceramic), false);
      case 'steel bone screw': {
        // The thread: teeth above and below the core, the last ones shorter into the tip.
        const top: string[] = [];
        const bottom: string[] = [];
        for (let x = 12; x <= 38; x += 4) {
          const d = x > 34 ? 3 : 5;
          top.push(`${x},21 ${x + 2},${21 - d}`);
          bottom.unshift(`${x + 2},${27 + d} ${x},27`);
        }
        return (
          <G>
            <Polygon
              points={`${top.join(' ')} 40,21 46,24 40,27 ${bottom.join(' ')}`}
              fill={url(ids.steel)}
              stroke={c.silverDark}
              strokeWidth={0.6}
            />
            <Rect
              x={4}
              y={13}
              width={8}
              height={22}
              rx={2.5}
              fill={url(ids.steel)}
              stroke={c.silverDark}
              strokeWidth={0.8}
            />
            <Line x1={8} y1={16} x2={8} y2={32} stroke={c.silverDark} strokeWidth={1.6} />
          </G>
        );
      }
      case 'polyethylene cup liner':
        return (
          <G>
            <Path
              d="M 6 18 A 18 18 0 0 0 42 18 Z"
              fill={c.he4jPoly}
              stroke={c.silverDark}
              strokeWidth={0.8}
            />
            <Path d="M 6 18 A 18 18 0 0 0 42 18 Z" fill={url(ids.sheen)} />
            <Ellipse
              cx={24}
              cy={18}
              rx={18}
              ry={5}
              fill={c.he4jPoly}
              stroke={c.silverDark}
              strokeWidth={0.8}
            />
            <Ellipse cx={24} cy={18.5} rx={13.5} ry={3.4} fill={c.silver} />
          </G>
        );
      case 'PMMA bone cement':
        return (
          <G>
            {/* The spatula, behind the dough. */}
            <Line
              x1={30}
              y1={17}
              x2={44}
              y2={4}
              stroke={c.silverDark}
              strokeWidth={2.4}
              strokeLinecap="round"
            />
            <Path
              d="M 11 23 Q 15 12 23 14 Q 33 10 37 23 Z"
              fill={c.he4jCement}
              stroke={c.silverDark}
              strokeWidth={0.6}
            />
            <Path
              d="M 7 23 Q 8 41 24 41 Q 40 41 41 23 Z"
              fill={url(ids.steel)}
              stroke={c.silverDark}
              strokeWidth={0.8}
            />
            <Ellipse
              cx={24}
              cy={23}
              rx={17}
              ry={3.5}
              fill="none"
              stroke={c.silverDark}
              strokeWidth={1}
            />
          </G>
        );
      case 'PLGA suture':
        return (
          <G>
            <Path
              d="M 10 30 C 3 36 7 45 15 42 S 29 37 33 45"
              stroke={c.he4jSuture}
              strokeWidth={1.8}
              fill="none"
              strokeLinecap="round"
            />
            <Path
              d="M 10 30 A 15 15 0 0 1 39 25"
              stroke={c.silverDark}
              strokeWidth={2.6}
              fill="none"
              strokeLinecap="round"
            />
            <Path d="M 11 28 A 14 14 0 0 1 37 23" stroke={c.silver} strokeWidth={0.8} fill="none" />
          </G>
        );

      // ── Scanners ──
      case 'X-ray tube':
        return (
          <G>
            <Polygon points="31,22 16,46 42,46" fill={c.he4jBeam} />
            <Ellipse
              cx={24}
              cy={15}
              rx={21}
              ry={10}
              fill={url(ids.glass)}
              stroke={c.silverDark}
              strokeWidth={1}
            />
            <Rect x={6} y={12} width={6} height={6} rx={1} fill={c.silverDark} />
            <Line
              x1={12}
              y1={15}
              x2={29}
              y2={15}
              stroke={c.he4jCurve}
              strokeWidth={1}
              strokeDasharray="2 1.5"
            />
            <Ellipse
              cx={33}
              cy={15}
              rx={2.6}
              ry={7}
              fill={url(ids.brass)}
              transform="rotate(-20 33 15)"
            />
            <Line x1={36} y1={15} x2={44} y2={15} stroke={c.silverDark} strokeWidth={2} />
          </G>
        );
      case 'CT scanner':
        return (
          <G>
            <Rect x={1} y={28} width={46} height={4} rx={1} fill={c.silverDark} />
            <Polygon points="24,13 17,30 31,30" fill={c.he4jBeam} />
            <Path
              d={donut(24, 22, 19, 9)}
              fill={c.he4jScanner}
              fillRule="evenodd"
              stroke={c.silverDark}
              strokeWidth={1}
            />
            <Path d={donut(24, 22, 19, 9)} fill={url(ids.sheen)} fillRule="evenodd" />
            <Rect x={21} y={11} width={6} height={2.5} fill={c.silverDark} />
          </G>
        );
      case 'MRI scanner':
        return (
          <G>
            <Rect x={1} y={28} width={46} height={4} rx={1} fill={c.silverDark} />
            <Path
              d="M 4 6 H 44 V 42 H 4 Z M 12 23 a 12 12 0 1 0 24 0 a 12 12 0 1 0 -24 0 Z"
              fill={c.he4jScanner}
              fillRule="evenodd"
              stroke={c.silverDark}
              strokeWidth={1}
            />
            <Circle cx={24} cy={23} r={12} fill="none" stroke={c.he4jCurve} strokeWidth={2} />
            <Circle cx={24} cy={23} r={8.5} fill="none" stroke={c.silver} strokeWidth={1} />
          </G>
        );
      case 'ultrasound probe':
        return (
          <G>
            <Path d="M 19 27 L 29 27 L 42 46 L 6 46 Z" fill={c.he4jBeam} />
            <Path
              d="M 12 38 Q 24 42 36 38 M 9 44 Q 24 48 39 44"
              stroke={c.he4jCurve}
              strokeWidth={1}
              fill="none"
            />
            <Path d="M 24 4 Q 28 -1 40 3" stroke={c.chartMuted} strokeWidth={2} fill="none" />
            <Path
              d="M 19 4 Q 24 2 29 4 L 31 20 Q 31 24 28 25 L 20 25 Q 17 24 17 20 Z"
              fill={c.he4jScanner}
              stroke={c.silverDark}
              strokeWidth={0.8}
            />
            <Path
              d="M 19 4 Q 24 2 29 4 L 31 20 Q 31 24 28 25 L 20 25 Q 17 24 17 20 Z"
              fill={url(ids.sheen)}
            />
            <Rect x={18.5} y={24.5} width={11} height={3} rx={1} fill={c.silverDark} />
          </G>
        );
      case 'PET scanner': {
        const blocks = Array.from({ length: 16 }, (_, k) => (k * 360) / 16);
        const lit = [2, 10];
        const at = (deg: number, r: number) => [
          24 + r * Math.cos((deg * Math.PI) / 180),
          24 + r * Math.sin((deg * Math.PI) / 180),
        ];
        const [ax, ay] = at(blocks[lit[0]!]!, 15);
        const [bx, by] = at(blocks[lit[1]!]!, 15);
        return (
          <G>
            <Ellipse cx={24} cy={24} rx={10} ry={8} fill={c.skin} fillOpacity={0.55} />
            {blocks.map((deg, k) => {
              const [x, y] = at(deg, 18);
              return (
                <Rect
                  key={k}
                  x={x! - 2.8}
                  y={y! - 1.8}
                  width={5.6}
                  height={3.6}
                  fill={lit.includes(k) ? c.he4jGamma : c.he4jScanner}
                  stroke={c.silverDark}
                  strokeWidth={0.5}
                  transform={`rotate(${deg + 90} ${x} ${y})`}
                />
              );
            })}
            <Line x1={ax} y1={ay} x2={bx} y2={by} stroke={c.he4jGamma} strokeWidth={1.2} />
            <Circle cx={(ax! + bx!) / 2} cy={(ay! + by!) / 2} r={2} fill={c.he4jGamma} />
          </G>
        );
      }
      case 'SPECT camera':
        return (
          <G>
            <Ellipse cx={24} cy={24} rx={14} ry={7} fill={c.skin} fillOpacity={0.6} />
            {[4, 36].map((y) => (
              <G key={y}>
                <Rect
                  x={7}
                  y={y}
                  width={34}
                  height={8}
                  rx={1.5}
                  fill={c.he4jScanner}
                  stroke={c.silverDark}
                  strokeWidth={0.8}
                />
                <Path
                  d={Array.from(
                    { length: 9 },
                    (_, i) => `M ${9 + i * 3.75} ${y === 4 ? 12 : 36} v ${y === 4 ? 2.5 : -2.5}`,
                  ).join(' ')}
                  stroke={c.silverDark}
                  strokeWidth={0.8}
                />
              </G>
            ))}
            <Line x1={29} y1={24} x2={29} y2={14.5} stroke={c.he4jGamma} strokeWidth={1.2} />
            <Circle cx={29} cy={24} r={2} fill={c.he4jGamma} />
          </G>
        );
      case 'OCT probe':
        return (
          <G>
            <Rect x={4} y={31} width={40} height={15} rx={3} fill={c.he4jEosin} />
            <Rect x={4} y={35} width={40} height={5} fill={c.he4jMuscle} fillOpacity={0.6} />
            <Line x1={22} y1={22} x2={25} y2={37} stroke={c.he4jFroude} strokeWidth={1.4} />
            <Line
              x1={6}
              y1={4}
              x2={20}
              y2={20}
              stroke={c.he4jScanner}
              strokeWidth={6}
              strokeLinecap="round"
            />
            <Line
              x1={18}
              y1={18}
              x2={22}
              y2={22.5}
              stroke={c.silverDark}
              strokeWidth={3}
              strokeLinecap="round"
            />
            {/* The A-scan: reflectivity down the depth. */}
            <Path
              d="M 36 6 L 36 9 L 41 10 L 36 11 L 36 15 L 43 16 L 36 17 L 36 22 L 39 23 L 36 24 L 36 27"
              stroke={c.he4jCurve}
              strokeWidth={1}
              fill="none"
            />
          </G>
        );
      default:
        return null;
    }
  })();
  return body ? (
    <G>
      {defs}
      {body}
    </G>
  ) : null;
}
