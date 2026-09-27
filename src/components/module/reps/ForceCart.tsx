import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import {
  Canvas,
  Caption,
  ChartText,
  DragHandle,
  fitLabel,
  niceCeil,
  useFrozen,
  useRep,
} from './common';
import { FloorShadow, LitRect, Metal, Sheen, TopLight, url, usePaintIds } from './paint';

type Spec = Extract<Representation, { kind: 'force' }>;

/** Blocks in a layer on the cart, and layers at most. */
const ACROSS = 5;
const LAYERS = 4;

/** A block's side on a canvas w wide. */
const blockSize = (w: number) => Math.min(26, (w * 0.42 - 16) / ACROSS);

/** A straight arrow along y from x1 to x2 with an open head. */
const arrow = (x1: number, y: number, x2: number) => {
  const dir = x2 >= x1 ? 1 : -1;
  const head = Math.min(10, Math.abs(x2 - x1));
  return `M ${x1} ${y} L ${x2} ${y} M ${x2 - dir * head} ${y - 6} L ${x2} ${y} L ${x2 - dir * head} ${y + 6}`;
};

/**
 * A lab cart on a track carrying its mass as metal blocks, pulled by a rope with the force F;
 * the acceleration drawn above it, dashed. Drag the force arrow's tip; F = m × a is worked
 * in the caption.
 */
export function ForceCart({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const paint = usePaintIds('light', 'body', 'hub', 'block');
  const rep = useRep(calc);
  const start = useRef(0);
  const F = rep.val(spec.force);
  const a = rep.val(spec.acceleration);
  const massShown = rep.shown(spec.mass);
  // Blocks in the mass's shown unit: a round size so the mass is at most 10 of them.
  const mf = rep.factor(spec.mass);
  const block =
    spec.block !== undefined ? spec.block / mf : niceCeil(Math.max(massShown, 1e-9) / 10);
  const count = Math.min(ACROSS * LAYERS, massShown / block);
  const whole = Math.floor(count + 1e-9);
  const part = count - whole > 1e-6 ? count - whole : 0;
  const massUnit = rep.unit(spec.mass);
  const blockText = `${formatNumber(block)}${massUnit ? ` ${massUnit}` : ''}`;
  const fit = useFrozen({
    force: Math.max(spec.forceExtent, niceCeil(rep.shown(spec.force))) * rep.factor(spec.force),
    accel:
      Math.max(spec.accelerationExtent, niceCeil(rep.shown(spec.acceleration))) *
      rep.factor(spec.acceleration),
  });
  const layers = Math.max(1, Math.ceil((whole + (part ? 1 : 0)) / ACROSS));

  return (
    <View>
      {/* As tall as the stack of blocks, with room for the acceleration arrow above it. */}
      <Canvas aspect={(w) => (22 + 34 + layers * blockSize(w) + 52) / w}>
        {({ w, h }) => {
          const ground = h - 22;
          const size = blockSize(w);
          const wheel = 9;
          const bodyH = 20;
          const bw = ACROSS * size + 14;
          const bx = 12;
          const bodyTop = ground - 2 * wheel - bodyH + 4;
          const hookX = bx + bw + 8;
          const ropeY = bodyTop + bodyH / 2;
          const fScale = (w - hookX - 18) / fit.value.force;
          const tip = hookX + F * fScale;
          const ay = bodyTop - layers * size - 30;
          const aLen = (a / fit.value.accel) * (w - bx - 24);
          const blocks = Array.from({ length: whole + (part ? 1 : 0) }, (_, i) => ({
            col: i % ACROSS,
            row: Math.floor(i / ACROSS),
            k: i < whole ? 1 : part,
          }));
          const forceLabel = rep.label(spec.force);
          const fLabel = fitLabel(
            (hookX + Math.max(tip, hookX + 60)) / 2,
            forceLabel,
            chart.value,
            w,
          );
          return (
            <>
              <Svg width={w} height={h}>
                <Defs>
                  <TopLight id={paint.light} />
                  <Sheen id={paint.body} vertical />
                  <Metal id={paint.hub} light={c.metal} dark={c.metalDark} />
                  <TopLight id={paint.block} strength={1.4} />
                </Defs>
                {/* The track: a metal rail on the table. */}
                <Rect x={0} y={ground} width={w} height={5} fill={c.metal} />
                <Line x1={0} y1={ground} x2={w} y2={ground} stroke={c.metalDark} />
                <Line x1={0} y1={ground + 5} x2={w} y2={ground + 5} stroke={c.metalDark} />
                <FloorShadow cx={bx + bw / 2 + 3} cy={ground} rx={bw / 2 + 4} ry={3} />
                {/* The cart's body with a hook at the front. */}
                <Rect
                  x={bx}
                  y={bodyTop}
                  width={bw}
                  height={bodyH}
                  rx={4}
                  fill={c.blockBlue}
                  stroke={c.chartInk}
                  strokeWidth={1}
                />
                <Rect x={bx} y={bodyTop} width={bw} height={bodyH} rx={4} fill={url(paint.body)} />
                <Path
                  d={`M ${bx + bw} ${ropeY} L ${hookX} ${ropeY}`}
                  stroke={c.metalDark}
                  strokeWidth={3}
                  strokeLinecap="round"
                />
                <ChartText
                  x={bx + bw / 2}
                  y={bodyTop + bodyH / 2 + 4}
                  textAnchor="middle"
                  fontSize={chart.small}
                  fontWeight="700"
                  fill={c.onBlock}
                  opacity={rep.known(spec.mass) ? 1 : 0.6}
                >
                  {rep.label(spec.mass)}
                </ChartText>
                {[bx + wheel + 6, bx + bw - wheel - 6].map((cx) => (
                  <G key={cx}>
                    <Circle cx={cx} cy={ground - wheel} r={wheel} fill={c.rubber} />
                    <Circle cx={cx} cy={ground - wheel} r={wheel * 0.5} fill={url(paint.hub)} />
                  </G>
                ))}
                {/* The mass as metal blocks, stacked in layers of five. */}
                <G opacity={rep.known(spec.mass) ? 1 : 0.35}>
                  {blocks.map(({ col, row, k }, i) => {
                    const x = bx + 7 + col * size;
                    const bh = (size - 3) * k;
                    const y = bodyTop - row * size - bh - 1;
                    return (
                      <G key={i}>
                        <LitRect
                          lightId={paint.block}
                          x={x + 1}
                          y={y}
                          width={size - 2}
                          height={bh}
                          rx={2}
                          fill={c.metal}
                          stroke={c.metalDark}
                          strokeWidth={1}
                        />
                      </G>
                    );
                  })}
                </G>
                <ChartText
                  x={bx + bw / 2}
                  y={bodyTop - layers * size - 6}
                  textAnchor="middle"
                  fontSize={chart.small}
                  fill={c.chartMuted}
                >
                  {`each block ${blockText}`}
                </ChartText>
                {/* The rope and the pull. */}
                <Path
                  d={arrow(hookX, ropeY, Math.max(tip, hookX + 1))}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeHeavy}
                  fill="none"
                  opacity={rep.known(spec.force) ? 1 : 0.35}
                />
                <ChartText {...fLabel} y={ropeY - 12} fontSize={chart.value} fontWeight="700">
                  {forceLabel}
                </ChartText>
                <Path
                  d={arrow(bx, ay, Math.max(bx + aLen, bx + 1))}
                  stroke={c.chartMuted}
                  strokeWidth={chart.stroke}
                  strokeDasharray={chart.dash}
                  fill="none"
                  opacity={rep.known(spec.acceleration) ? 1 : 0.35}
                />
                <ChartText x={bx} y={ay - 9} fill={c.chartMuted} fontSize={chart.small}>
                  {rep.label(spec.acceleration)}
                </ChartText>
              </Svg>
              <DragHandle
                testID="drag-force"
                x={tip}
                y={ropeY}
                label={rep.variable(spec.force).name}
                onStart={() => {
                  start.current = F;
                  fit.freeze();
                }}
                onEnd={fit.release}
                onMove={(dx) =>
                  calc.set(
                    {
                      ...rep.pin([spec.mass]),
                      [spec.force]: rep.snapTo(spec.force, start.current + dx / fScale),
                    },
                    rep.slide(spec.force),
                  )
                }
              />
            </>
          );
        }}
      </Canvas>
      <Caption>
        {[
          `${sym(spec.force)} = ${sym(spec.mass)} × ${sym(spec.acceleration)} = ${rep.value(spec.mass)} × ${rep.value(spec.acceleration)} = ${rep.value(spec.force)}`,
          rep.known(spec.mass)
            ? `${formatNumber(Math.round(count * 1000) / 1000)} blocks of ${blockText} = ${rep.value(spec.mass)}`
            : '',
          'The same pull on more mass gives less acceleration',
        ]
          .filter(Boolean)
          .join(' · ')}
      </Caption>
    </View>
  );

  function sym(id: string) {
    return rep.variable(id).symbol;
  }
}
