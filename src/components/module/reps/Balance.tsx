import { View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, useRep, Caption } from './common';
import { Ball, FloorShadow, Metal, Sheen, TopLight, url, usePaintIds } from './paint';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'balance' }>;

/** Degrees the beam turns per counter of difference, and at most. */
const DEG_PER_COUNTER = 1.6;
const MAX_TILT = 8;
/** A pan's bowl: half its width at the rim, its depth, and the rim's ellipse height. */
const BOWL = 58;
const DEPTH = 20;
const RIM = 7;

/**
 * A classroom pan balance: a metal post on a base, a beam resting on a fulcrum pin, and a deep
 * bowl hanging on chains from each end, holding its values as counters in rows of 5 (rows of
 * 10 smaller ones above 20), one color per value. A pointer on the beam reads a small scale:
 * level, it points at the middle mark, which is what the equal sign means. When the sides
 * differ the beam tips toward the heavier side, by the difference (up to 8°).
 */
export function Balance({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  // K–2 reads the numbers ("6 + 1 = 7"); later grades the letters ("a + b = 7").
  const term = (id: string) => (rep.words ? rep.value(id, false) : rep.variable(id).symbol);
  const count = (id: string) => (rep.known(id) ? Math.max(0, Math.round(rep.shown(id))) : 0);
  const crossed = spec.takeAway ? count(spec.takeAway) : 0;
  const left = spec.left.reduce((s, id) => s + count(id), 0) - crossed;
  const right = spec.right.reduce((s, id) => s + count(id), 0);
  // Positive turns the right end down.
  const tilt = Math.max(-MAX_TILT, Math.min(MAX_TILT, (right - left) * DEG_PER_COUNTER));
  const all = [...spec.left, ...(spec.takeAway ? [spec.takeAway] : []), ...spec.right];
  // Two-color counters: one color per value on a pan.
  const paint = usePaintIds('a', 'b', 'metal', 'post', 'rim', 'bowl', 'base', 'dial');
  const shades = [url(paint.a), url(paint.b)];
  const leftN = spec.left.reduce((s, id) => s + count(id), 0);
  const rightN = spec.right.reduce((s, id) => s + count(id), 0);
  const rowsOf = (n: number) => (n > 20 ? Math.ceil(n / 10) : Math.ceil(n / 5));
  const rowH = (n: number) => (n > 20 ? 10 : 18);
  const stack = Math.max(rowsOf(leftN) * rowH(leftN), rowsOf(rightN) * rowH(rightN), 18);
  const leftTag = `${spec.left.map(term).join(' + ')}${spec.takeAway ? ` − ${term(spec.takeAway)}` : ''}`;
  const rightTag = spec.right.map(term).join(' + ');

  // Heights, top to bottom: the tilt's rise, the beam, the chains over the counters, the bowl,
  // the side tags, the tilt's fall, then the base.
  const chain = stack + 26;
  const rise = 20;
  const pivotY = rise + 12;
  const height = pivotY + chain + DEPTH + 40 + rise + 18;

  return (
    <View>
      <Canvas aspect={(w) => height / w}>
        {({ w, h }) => {
          const cx = w / 2;
          const arm = Math.min(w * 0.34, w / 2 - BOWL - 8);
          const rad = (tilt * Math.PI) / 180;
          const floor = h - 10;
          const end = (side: -1 | 1) => ({
            x: cx + side * arm * Math.cos(rad),
            y: pivotY + side * arm * Math.sin(rad),
          });

          const pan = (side: -1 | 1, ids: string[], key: string, tag: string) => {
            const hook = end(side);
            const x = hook.x;
            const rimY = hook.y + chain;
            const n = ids.reduce((sum, id) => sum + count(id), 0);
            const small = n > 20;
            const per = small ? 10 : 5;
            const dx = small ? 10.5 : 19;
            const dy = rowH(n);
            const r = small ? 4.6 : 7.5;
            let i = 0;
            const dots = ids.flatMap((id, g) =>
              Array.from({ length: count(id) }, () => {
                const k = i++;
                const px = x - (dx * (per - 1)) / 2 + (k % per) * dx;
                const py = rimY - r + 3 - Math.floor(k / per) * dy;
                // The last counters on the left pan are crossed out when some are taken away.
                const out = key === 'L' && k >= n - crossed;
                return (
                  <G key={`${key}${id}${k}`} opacity={out ? 0.6 : 1}>
                    <Circle
                      cx={px}
                      cy={py}
                      r={r}
                      fill={out ? 'transparent' : shades[g % 2]}
                      stroke={c.chartInk}
                      strokeWidth={chart.strokeLight}
                    />
                    {out ? (
                      <Path
                        d={`M ${px - r} ${py - r} L ${px + r} ${py + r} M ${px + r} ${py - r} L ${px - r} ${py + r}`}
                        stroke={c.chartInk}
                        strokeWidth={chart.stroke}
                      />
                    ) : null}
                  </G>
                );
              }),
            );
            const tagW = tag.length * chart.value * 0.58 + 18;
            const tagY = rimY + DEPTH + 10;
            return (
              <G key={key}>
                {/* Two chains from the hook to the rim, behind the counters. */}
                {[-1, 1].map((s) => (
                  <Line
                    key={s}
                    x1={x}
                    y1={hook.y}
                    x2={x + s * (BOWL - 4)}
                    y2={rimY}
                    stroke={c.metalDark}
                    strokeWidth={1.5}
                    strokeDasharray="3 1.5"
                  />
                ))}
                <Circle
                  cx={x}
                  cy={hook.y}
                  r={3.5}
                  fill="none"
                  stroke={c.metalDark}
                  strokeWidth={2}
                />
                {/* The inside of the bowl, seen over the front rim. */}
                <Ellipse cx={x} cy={rimY} rx={BOWL} ry={RIM} fill={c.metalDark} />
                {dots}
                {/* The bowl's front: deep, brushed metal, a bright rim along its lip. */}
                <Path
                  d={`M ${x - BOWL} ${rimY} A ${BOWL} ${RIM} 0 0 0 ${x + BOWL} ${rimY} C ${x + BOWL - 4} ${rimY + DEPTH * 0.9} ${x + BOWL * 0.5} ${rimY + DEPTH} ${x} ${rimY + DEPTH} C ${x - BOWL * 0.5} ${rimY + DEPTH} ${x - BOWL + 4} ${rimY + DEPTH * 0.9} ${x - BOWL} ${rimY} Z`}
                  fill={c.metal}
                  stroke={c.metalDark}
                  strokeWidth={chart.strokeLight}
                />
                <Path
                  d={`M ${x - BOWL} ${rimY} A ${BOWL} ${RIM} 0 0 0 ${x + BOWL} ${rimY} C ${x + BOWL - 4} ${rimY + DEPTH * 0.9} ${x + BOWL * 0.5} ${rimY + DEPTH} ${x} ${rimY + DEPTH} C ${x - BOWL * 0.5} ${rimY + DEPTH} ${x - BOWL + 4} ${rimY + DEPTH * 0.9} ${x - BOWL} ${rimY} Z`}
                  fill={url(paint.bowl)}
                />
                <Path
                  d={`M ${x - BOWL} ${rimY} A ${BOWL} ${RIM} 0 0 0 ${x + BOWL} ${rimY}`}
                  fill="none"
                  stroke={url(paint.rim)}
                  strokeWidth={3}
                />
                {/* The side's number sentence on a tag under the bowl. */}
                <Rect
                  x={x - tagW / 2}
                  y={tagY}
                  width={tagW}
                  height={22}
                  rx={6}
                  fill={c.card}
                  stroke={c.border}
                />
                <ChartText
                  x={x}
                  y={tagY + 15.5}
                  fontSize={chart.value}
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {tag}
                </ChartText>
              </G>
            );
          };

          const postTop = pivotY + 10;
          const dialR = 68;
          return (
            <Svg width={w} height={h}>
              <Defs>
                <Ball id={paint.a} color={c.chartHighlight} />
                <Ball id={paint.b} color={c.chartSecond} />
                <Sheen id={paint.post} />
                <Sheen id={paint.bowl} />
                <Sheen id={paint.rim} />
                <Sheen id={paint.metal} vertical />
                <TopLight id={paint.base} />
                <Metal id={paint.dial} light={c.silver} dark={c.silverDark} />
              </Defs>

              {/* Base on the floor, and the post up to the fulcrum. */}
              <FloorShadow cx={cx + 3} cy={floor} rx={62} ry={4} />
              <Rect x={cx - 56} y={floor - 12} width={112} height={12} rx={4} fill={c.metalDark} />
              <Rect
                x={cx - 56}
                y={floor - 12}
                width={112}
                height={12}
                rx={4}
                fill={url(paint.base)}
              />
              <Rect
                x={cx - 8}
                y={postTop}
                width={16}
                height={floor - 12 - postTop}
                fill={c.metal}
              />
              <Rect
                x={cx - 8}
                y={postTop}
                width={16}
                height={floor - 12 - postTop}
                fill={url(paint.post)}
                stroke={c.metalDark}
                strokeWidth={1}
              />

              {/* The scale the pointer reads: a small dial with a middle mark. */}
              <Rect
                x={cx - 26}
                y={pivotY + dialR - 8}
                width={52}
                height={22}
                rx={5}
                fill={url(paint.dial)}
                stroke={c.metalDark}
                strokeWidth={1}
              />
              {[-8, -4, 0, 4, 8].map((deg) => {
                const a = (deg * Math.PI) / 180;
                const r0 = deg === 0 ? dialR - 1 : dialR + 2;
                return (
                  <Line
                    key={deg}
                    x1={cx - r0 * Math.sin(a)}
                    y1={pivotY + r0 * Math.cos(a)}
                    x2={cx - (dialR + 8) * Math.sin(a)}
                    y2={pivotY + (dialR + 8) * Math.cos(a)}
                    stroke={deg === 0 ? c.chartHighlight : c.chartInk}
                    strokeWidth={deg === 0 ? chart.stroke : chart.strokeLight}
                  />
                );
              })}

              {/* Beam and pointer turn together about the pin. */}
              <G transform={`rotate(${tilt} ${cx} ${pivotY})`}>
                <Path
                  d={`M ${cx} ${pivotY} L ${cx} ${pivotY + dialR - 8}`}
                  stroke={c.chartInk}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
                <Path
                  d={`M ${cx} ${pivotY + dialR - 2} L ${cx - 3.5} ${pivotY + dialR - 10} L ${cx + 3.5} ${pivotY + dialR - 10} Z`}
                  fill={c.chartInk}
                />
                <Rect
                  x={cx - arm - 4}
                  y={pivotY - 5}
                  width={2 * arm + 8}
                  height={10}
                  rx={5}
                  fill={c.metal}
                  stroke={c.metalDark}
                  strokeWidth={1}
                />
                <Rect
                  x={cx - arm - 4}
                  y={pivotY - 5}
                  width={2 * arm + 8}
                  height={10}
                  rx={5}
                  fill={url(paint.metal)}
                />
              </G>
              {/* The fulcrum under the beam, and its pin. */}
              <Path
                d={`M ${cx} ${pivotY} L ${cx - 13} ${postTop + 12} L ${cx + 13} ${postTop + 12} Z`}
                fill={c.metalDark}
              />
              <Circle
                cx={cx}
                cy={pivotY}
                r={5}
                fill={c.metal}
                stroke={c.metalDark}
                strokeWidth={2}
              />

              {pan(-1, spec.left, 'L', leftTag)}
              {pan(1, spec.right, 'R', rightTag)}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {`Left: ${leftTag} = ${left}. Right: ${rightTag} = ${right}. ${
          left === right
            ? 'Level: both sides are the same. The number sentence is true.'
            : `Not level: ${left} on the left, ${right} on the right. The number sentence is false.`
        }`}
      </Caption>
      <Steppers
        calc={calc}
        // The last value is the "missing" one that rebalances the scale; changing it moves the
        // first value instead.
        items={all.map((id) => {
          const free = id === all[all.length - 1] ? all[0] : all[all.length - 1];
          return { var: id, steps: [1], pin: all.filter((x) => x !== id && x !== free) };
        })}
      />
    </View>
  );
}
