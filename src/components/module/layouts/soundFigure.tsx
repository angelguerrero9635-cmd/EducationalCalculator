import type { ReactNode } from 'react';
import Svg, { Circle, Defs, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import type { Scene } from '@/data/modules/layouts';
import { font, usePalette, type Palette } from '@/theme';

import { Canvas, ChartText } from '../reps/common';
import { Ball, FloorShadow, Metal, Sheen, TopLight, url, usePaintIds } from '../reps/paint';

/** Bold arcs spreading out from (x, y) toward `dir` (radians): the sound. */
function SoundArcs({ x, y, dir = 0, c }: { x: number; y: number; dir?: number; c: Palette }) {
  return (
    <G>
      {[14, 28, 42].map((rad, i) => {
        const a0 = dir - 0.62;
        const a1 = dir + 0.62;
        return (
          <Path
            key={rad}
            d={`M ${x + rad * Math.cos(a0)} ${y + rad * Math.sin(a0)} A ${rad} ${rad} 0 0 1 ${x + rad * Math.cos(a1)} ${y + rad * Math.sin(a1)}`}
            stroke={c.chartHighlight}
            strokeWidth={3}
            strokeLinecap="round"
            opacity={1 - i * 0.22}
            fill="none"
          />
        );
      })}
    </G>
  );
}

/** Short curved motion lines either side of (x, y), `spread` from it: it is shaking. */
function Shake({ x, y, spread, c }: { x: number; y: number; spread: number; c: Palette }) {
  return (
    <G>
      {[-1, 1].flatMap((side) =>
        [0, 7].map((k) => (
          <Path
            key={`${side}${k}`}
            d={`M ${x + side * (spread + k)} ${y - 12 + k / 2} q ${side * 5} 6 0 12 q ${side * -5} 6 0 12`}
            stroke={c.chartMuted}
            strokeWidth={2}
            strokeLinecap="round"
            fill="none"
          />
        )),
      )}
    </G>
  );
}

/**
 * One sound maker, drawn as the real thing: a rubber band stretched over a wooden box, a
 * child humming with a hand on the throat, a drum with rice on it, a brass bell. Shaking, it
 * has motion lines and bold sound arcs spreading out (the band shows where it swings, the rice
 * jumps, the bell tips); still, there are none. A chip under it says which.
 */
export function Vibration({ vibrate }: { vibrate: NonNullable<Scene['vibrate']> }) {
  const c = usePalette();
  const ids = usePaintIds('wood', 'skin', 'shell', 'brass', 'handle');
  const on = vibrate.shaking;
  return (
    <Canvas aspect={0.64}>
      {({ w, h }) => {
        const base = h - 52;
        let body: ReactNode = null;
        let sound = { x: w * 0.8, y: base / 2, dir: 0 };
        if (vibrate.thing === 'band') {
          const x0 = w * 0.06;
          const x1 = w * 0.76;
          const skew = 22;
          const topY = base - 104;
          const frontY = topY + 40;
          const bandY = topY + 20;
          const bx0 = x0 + skew / 2 + 10;
          const bx1 = x1 + skew / 2 - 10;
          const mid = (bx0 + bx1) / 2;
          const band = (bow: number) =>
            `M ${bx0} ${bandY} Q ${mid} ${bandY + bow * 2} ${bx1} ${bandY}`;
          body = (
            <G>
              <FloorShadow cx={(x0 + x1) / 2 + 6} cy={base} rx={(x1 - x0) / 2 + 6} ry={6} />
              {/* the box: a top face seen from above, then its front */}
              <Path
                d={`M ${x0} ${frontY} L ${x0 + skew} ${topY} L ${x1 + skew} ${topY} L ${x1} ${frontY} Z`}
                fill={c.wood}
                stroke={c.woodDark}
                strokeWidth={1.5}
                strokeLinejoin="round"
              />
              <Rect
                x={x0}
                y={frontY}
                width={x1 - x0}
                height={base - frontY}
                fill={c.wood}
                stroke={c.woodDark}
                strokeWidth={1.5}
              />
              <Rect x={x0} y={frontY} width={x1 - x0} height={base - frontY} fill={url(ids.wood)} />
              <Rect
                x={x0}
                y={frontY}
                width={x1 - x0}
                height={base - frontY}
                fill={c.shade}
                opacity={0.12}
              />
              <Path
                d={`M ${x1} ${frontY} L ${x1 + skew} ${topY} L ${x1 + skew} ${base - 36} L ${x1} ${base} Z`}
                fill={c.woodDark}
                opacity={0.8}
              />
              {/* grain on the front */}
              {[0.3, 0.55, 0.8].map((t) => (
                <Path
                  key={t}
                  d={`M ${x0 + 10} ${frontY + t * (base - frontY)} q ${(x1 - x0) / 3} -4 ${x1 - x0 - 20} 2`}
                  stroke={c.woodDark}
                  strokeOpacity={0.35}
                  fill="none"
                />
              ))}
              {/* the sound hole, dark inside with a lit lower rim */}
              <Ellipse cx={mid} cy={bandY} rx={36} ry={11} fill={c.rubber} />
              <Path
                d={`M ${mid - 36} ${bandY} A 36 11 0 0 0 ${mid + 36} ${bandY}`}
                stroke={c.woodDark}
                strokeWidth={2}
                fill="none"
              />
              {/* the rubber band, over the ends of the box */}
              <Path
                d={`M ${bx0} ${bandY} L ${bx0 - 5} ${frontY + 16} M ${bx1} ${bandY} L ${bx1 - 5} ${frontY + 16}`}
                stroke={c.orange}
                strokeWidth={4}
                strokeLinecap="round"
              />
              {on ? (
                <G opacity={0.3}>
                  <Path d={band(-11)} stroke={c.orange} strokeWidth={4} fill="none" />
                  <Path d={band(11)} stroke={c.orange} strokeWidth={4} fill="none" />
                </G>
              ) : null}
              <Path d={band(0)} stroke={c.orange} strokeWidth={4.5} fill="none" />
              <Path
                d={band(0)}
                stroke={c.shine}
                strokeOpacity={0.5}
                strokeWidth={1.2}
                fill="none"
                transform="translate(0 -1.2)"
              />
            </G>
          );
          sound = { x: x1 + skew + 8, y: topY + 4, dir: -0.35 };
        } else if (vibrate.thing === 'drum') {
          const cx = w * 0.42;
          const rx = Math.min(78, w * 0.22);
          const ry = 18;
          const top = base - 96;
          const bottom = base - ry;
          const rice = [-46, -28, -10, 8, 26, 44];
          body = (
            <G>
              <FloorShadow cx={cx + 6} cy={base - 2} rx={rx + 8} ry={7} />
              <Path
                d={`M ${cx - rx} ${top} L ${cx - rx} ${bottom} A ${rx} ${ry} 0 0 0 ${cx + rx} ${bottom} L ${cx + rx} ${top} Z`}
                fill={c.blockRed}
              />
              <Path
                d={`M ${cx - rx} ${top} L ${cx - rx} ${bottom} A ${rx} ${ry} 0 0 0 ${cx + rx} ${bottom} L ${cx + rx} ${top} Z`}
                fill={url(ids.shell)}
              />
              {/* the cords that hold the head tight */}
              <Path
                d={Array.from({ length: 6 }, (_, i) => {
                  const xa = cx - rx + ((i + 0.5) * 2 * rx) / 6;
                  const xb = xa + rx / 6;
                  return `M ${xa} ${top + 8} L ${xb} ${bottom - 4}`;
                }).join(' ')}
                stroke={c.cupLight}
                strokeWidth={1.5}
                opacity={0.8}
              />
              <Path
                d={`M ${cx - rx} ${bottom - 6} A ${rx} ${ry} 0 0 0 ${cx + rx} ${bottom - 6}`}
                stroke={c.metalDark}
                strokeWidth={5}
                fill="none"
              />
              {/* the head: a skin stretched tight, and its metal rim */}
              <Ellipse cx={cx} cy={top} rx={rx} ry={ry} fill={c.bone} />
              <Ellipse
                cx={cx}
                cy={top}
                rx={rx}
                ry={ry}
                fill="none"
                stroke={c.metalDark}
                strokeWidth={4}
              />
              {rice.map((dx, i) => {
                const jump = on ? 22 + ((i * 7) % 3) * 12 : 0;
                const y = top + ((i % 3) - 1) * 4 - jump;
                return (
                  <G key={dx}>
                    {on ? (
                      <Line
                        x1={cx + dx}
                        y1={y + 7}
                        x2={cx + dx}
                        y2={y + 13}
                        stroke={c.chartMuted}
                        strokeWidth={1.5}
                        strokeLinecap="round"
                      />
                    ) : null}
                    <Ellipse
                      cx={cx + dx}
                      cy={y}
                      rx={4}
                      ry={2.2}
                      fill={c.cupLight}
                      stroke={c.furDark}
                      strokeWidth={0.8}
                      transform={`rotate(${((i * 37) % 60) - 30} ${cx + dx} ${y})`}
                    />
                  </G>
                );
              })}
              {/* a wooden stick, just tapped the head */}
              <Line
                x1={cx - rx - 38}
                y1={top - 48}
                x2={cx - rx * 0.55}
                y2={top - 6}
                stroke={c.wood}
                strokeWidth={6}
                strokeLinecap="round"
              />
              <Circle cx={cx - rx * 0.55} cy={top - 6} r={5} fill={c.woodDark} />
            </G>
          );
          sound = { x: cx + rx + 10, y: top + 10, dir: 0 };
        } else if (vibrate.thing === 'bell') {
          const cx = w * 0.42;
          const lip = base - 20;
          const tip = on ? -14 : 0;
          body = (
            <G>
              <FloorShadow cx={cx + 4} cy={base - 2} rx={50} ry={6} />
              <G transform={`rotate(${tip} ${cx} ${lip - 150})`}>
                {/* the wooden handle */}
                <Rect x={cx - 8} y={lip - 150} width={16} height={46} rx={7} fill={c.woodDark} />
                <Rect
                  x={cx - 8}
                  y={lip - 150}
                  width={16}
                  height={46}
                  rx={7}
                  fill={url(ids.handle)}
                />
                <Rect x={cx - 12} y={lip - 108} width={24} height={8} rx={3} fill={c.brassDark} />
                {/* the brass bell */}
                <Path
                  d={`M ${cx - 16} ${lip - 100} C ${cx - 22} ${lip - 70} ${cx - 34} ${lip - 26} ${cx - 50} ${lip - 4} Q ${cx} ${lip + 10} ${cx + 50} ${lip - 4} C ${cx + 34} ${lip - 26} ${cx + 22} ${lip - 70} ${cx + 16} ${lip - 100} Q ${cx} ${lip - 108} ${cx - 16} ${lip - 100} Z`}
                  fill={url(ids.brass)}
                  stroke={c.brassDark}
                  strokeWidth={1.5}
                />
                <Ellipse cx={cx} cy={lip - 3} rx={49} ry={8} fill={c.brassDark} />
                <Circle cx={cx + (on ? 18 : 0)} cy={lip + 6} r={7} fill={c.metalDark} />
              </G>
            </G>
          );
          sound = { x: cx + 76, y: lip - 64, dir: 0 };
        } else {
          // A child humming, seen from the side, a hand on the throat.
          const hx = w * 0.4;
          const hy = base - 118;
          body = (
            <G>
              {/* shoulders and neck */}
              <Path
                d={`M ${hx - 70} ${base} Q ${hx - 66} ${hy + 72} ${hx - 4} ${hy + 70} Q ${hx + 56} ${hy + 72} ${hx + 60} ${base} Z`}
                fill={c.blockBlue}
              />
              <Rect x={hx - 14} y={hy + 30} width={28} height={44} rx={8} fill={c.skin} />
              {/* the head, facing right */}
              <Circle cx={hx - 4} cy={hy} r={40} fill={url(ids.skin)} />
              <Path
                d={`M ${hx + 32} ${hy - 6} q 12 8 2 16`}
                fill={c.skin}
                stroke={c.skinBrown}
                strokeWidth={1.2}
              />
              <Path
                d={`M ${hx - 44} ${hy + 4} A 40 40 0 0 1 ${hx + 30} ${hy - 26} Q ${hx - 2} ${hy - 30} ${hx - 14} ${hy - 8} Q ${hx - 28} ${hy + 10} ${hx - 44} ${hy + 4} Z`}
                fill={c.furDark}
              />
              <Circle cx={hx + 16} cy={hy - 6} r={3.2} fill={c.animalEye} />
              {/* lips closed in a hum */}
              <Path
                d={`M ${hx + 22} ${hy + 20} q 7 2 12 -1`}
                stroke={c.skinDeep}
                strokeWidth={2.2}
                strokeLinecap="round"
                fill="none"
              />
              {/* the hand on the throat, from the arm below */}
              <Path
                d={`M ${hx + 44} ${base} Q ${hx + 40} ${hy + 76} ${hx + 16} ${hy + 58}`}
                stroke={c.blockBlue}
                strokeWidth={16}
                strokeLinecap="round"
                fill="none"
              />
              {[0, 7, 14].map((dy) => (
                <Rect
                  key={dy}
                  x={hx - 10}
                  y={hy + 40 + dy}
                  width={30}
                  height={6.5}
                  rx={3.2}
                  fill={c.skin}
                  stroke={c.skinBrown}
                  strokeWidth={0.8}
                />
              ))}
              <Rect
                x={hx + 8}
                y={hy + 40}
                width={16}
                height={22}
                rx={6}
                fill={c.skin}
                stroke={c.skinBrown}
                strokeWidth={0.8}
              />
            </G>
          );
          sound = { x: hx + 42, y: hy + 16, dir: 0 };
        }
        const shake =
          vibrate.thing === 'band'
            ? { x: w * 0.41 + 11, y: base - 84, spread: w * 0.35 + 8 }
            : vibrate.thing === 'drum'
              ? { x: w * 0.42, y: base - 50, spread: Math.min(78, w * 0.22) + 10 }
              : vibrate.thing === 'bell'
                ? { x: w * 0.42, y: base - 60, spread: 62 }
                : { x: w * 0.4 + 6, y: base - 64, spread: 30 };
        const chip = on ? 'Shaking → sound' : 'Still → no sound';
        const chipW = chip.length * 8.6 + 24;
        return (
          <Svg width={w} height={h}>
            <Defs>
              <TopLight id={ids.wood} />
              <Sheen id={ids.shell} strength={1.3} />
              <Sheen id={ids.handle} />
              <Metal id={ids.brass} light={c.brass} dark={c.brassDark} />
              <Ball id={ids.skin} color={c.skin} />
            </Defs>
            {body}
            {on ? (
              <G>
                {vibrate.thing === 'band' ? null : (
                  <Shake x={shake.x} y={shake.y} spread={shake.spread} c={c} />
                )}
                <SoundArcs x={sound.x} y={sound.y} dir={sound.dir} c={c} />
              </G>
            ) : null}
            <Rect
              x={w / 2 - chipW / 2}
              y={h - 38}
              width={chipW}
              height={30}
              rx={15}
              fill={on ? c.chartHighlight : c.chartSurface}
              stroke={on ? c.chartHighlight : c.chartGrid}
              strokeWidth={1.5}
            />
            <ChartText
              x={w / 2}
              y={h - 17}
              fontSize={font.body}
              fontWeight="700"
              fill={on ? c.onChartHighlight : c.chartInk}
              textAnchor="middle"
            >
              {chip}
            </ChartText>
          </Svg>
        );
      }}
    </Canvas>
  );
}
