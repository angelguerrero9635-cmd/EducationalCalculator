import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { SkatersSpec } from '@/data/modules/typesMechanics';
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
  nowrap,
  useFrozen,
  useRep,
} from './common';
import { Ball, FloorShadow, TopLight, url, usePaintIds } from './paint';

/** A straight arrow along y from x1 to x2 with an open head. */
const arrow = (x1: number, y: number, x2: number) => {
  const dir = x2 >= x1 ? 1 : -1;
  const head = Math.min(9, Math.abs(x2 - x1));
  return `M ${x1} ${y} L ${x2} ${y} M ${x2 - dir * head} ${y - 5} L ${x2} ${y} L ${x2 - dir * head} ${y + 5}`;
};

/**
 * One skater, a simple figure `H` px tall with its skates' wheels on `ground` at x, facing
 * right (`dir` 1) or left (−1), arms reaching out to `hand` (the x where the palms meet).
 */
function Skater({
  x,
  ground,
  H,
  dir,
  hand,
  color,
  name,
  ids,
}: {
  x: number;
  ground: number;
  H: number;
  dir: 1 | -1;
  hand: number;
  color: string;
  name: string;
  ids: { helmet: string; light: string };
}) {
  const c = usePalette();
  const px = (u: number) => x + dir * u * H;
  const py = (v: number) => ground - v * H;
  const limb = Math.max(4, H * 0.07);
  const skates = [-0.07, 0.09].map((u) => px(u));
  const shoulder = { x: px(0.03), y: py(0.78) };
  const handY = py(0.74);
  const elbow = {
    x: (shoulder.x + hand) / 2 - dir * H * 0.02,
    y: (shoulder.y + handY) / 2 + H * 0.05,
  };
  return (
    <G>
      <FloorShadow cx={px(0.02)} cy={ground + 1} rx={H * 0.2} ry={3} />
      {/* Legs in plain trousers, a skate under each. */}
      {skates.map((sx, i) => (
        <G key={i}>
          <Line
            x1={px(i ? 0.03 : -0.02)}
            y1={py(0.5)}
            x2={sx}
            y2={py(0.09)}
            stroke={c.fabric}
            strokeWidth={limb * 1.25}
            strokeLinecap="round"
          />
          <Rect
            x={sx - H * 0.06}
            y={py(0.12)}
            width={H * 0.13}
            height={H * 0.07}
            rx={H * 0.02}
            fill={c.rubber}
          />
          {[-0.04, 0, 0.04].map((u) => (
            <Circle
              key={u}
              cx={sx + dir * u * H + H * 0.005}
              cy={ground - H * 0.022}
              r={H * 0.021}
              fill={c.metal}
              stroke={c.metalDark}
              strokeWidth={0.8}
            />
          ))}
        </G>
      ))}
      {/* The body in a colored top. */}
      <Rect
        x={px(0) - H * 0.1}
        y={py(0.82)}
        width={H * 0.2}
        height={H * 0.34}
        rx={H * 0.06}
        fill={color}
      />
      <Rect
        x={px(0) - H * 0.1}
        y={py(0.82)}
        width={H * 0.2}
        height={H * 0.34}
        rx={H * 0.06}
        fill={url(ids.light)}
      />
      {/* Arms out to the other skater's palms. */}
      <Path
        d={`M ${shoulder.x} ${shoulder.y} L ${elbow.x} ${elbow.y} L ${hand - dir * H * 0.03} ${handY}`}
        stroke={color}
        strokeWidth={limb}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Circle cx={hand - dir * H * 0.025} cy={handY} r={limb * 0.62} fill={c.skin} />
      {/* The head under a helmet with the skater's letter. */}
      <Circle cx={px(0.02)} cy={py(0.9)} r={H * 0.07} fill={c.skin} />
      <Path
        d={`M ${px(0.02) - H * 0.082} ${py(0.905)} A ${H * 0.082} ${H * 0.082} 0 0 1 ${px(0.02) + H * 0.082} ${py(0.905)} Z`}
        fill={url(ids.helmet)}
        stroke={c.chartInk}
        strokeWidth={0.6}
      />
      <ChartText
        x={px(0.02)}
        y={py(0.925)}
        textAnchor="middle"
        fontSize={Math.max(chart.tiny, H * 0.07)}
        fontWeight="700"
        fill={c.onBlock}
      >
        {name}
      </ChartText>
    </G>
  );
}

/**
 * Two skaters palm to palm on smooth ice. The push comes in a pair: the same force on each,
 * the opposite way (arrows from the palms), and each speeds up by the force ÷ its own mass
 * (dashed arrows under the ice). Drag either force arrow's tip.
 */
export function Skaters({ spec, calc }: { spec: SkatersSpec; calc: Calculator }) {
  const c = usePalette();
  const paint = usePaintIds('helmetA', 'helmetB', 'light');
  const rep = useRep(calc);
  const start = useRef(0);
  const [nameA, nameB] = spec.names ?? ['A', 'B'];
  const F = rep.val(spec.force);
  const masses = spec.masses.map((id) => rep.val(id)) as [number, number];
  // Each skater's acceleration: the value, or F ÷ m in formula units (N ÷ kg = m/s²).
  const acc = [0, 1].map((i) =>
    spec.accelerations ? rep.val(spec.accelerations[i]!) : masses[i]! > 0 ? F / masses[i]! : 0,
  );
  const fit = useFrozen({
    force: niceCeil(Math.max(rep.shown(spec.force), 1e-9)) * rep.factor(spec.force),
    accel: niceCeil(Math.max(...acc, 1e-9)),
  });
  const forceKnown = rep.known(spec.force);
  const accKnown = (i: number) =>
    spec.accelerations
      ? rep.known(spec.accelerations[i]!)
      : forceKnown && rep.known(spec.masses[i]!);
  const accText = (i: number) =>
    spec.accelerations
      ? rep.label(spec.accelerations[i]!)
      : accKnown(i)
        ? `${formatNumber(Math.round(acc[i]! * 1000) / 1000)} m/s²`
        : '?';
  const heavier = Math.max(...masses, 1e-9);

  return (
    <View>
      <Canvas aspect={0.68}>
        {({ w, h }) => {
          const cx = w / 2;
          const ground = h - 60;
          const Hmax = Math.min(ground - 58, w * 0.4);
          const H = masses.map((m) => Hmax * (0.78 + 0.22 * Math.sqrt(Math.max(0, m) / heavier)));
          const fScale = (w / 2 - 16) / fit.value.force;
          const fy = 40;
          const fLen = F * fScale;
          const aScale = (w / 2 - 22) / fit.value.accel;
          const ay = ground + 28;
          const labelA = `push on ${nameA}: ${rep.value(spec.force)}`;
          const labelB = `push on ${nameB}: ${rep.value(spec.force)}`;
          return (
            <>
              <Svg width={w} height={h}>
                <Defs>
                  <Ball id={paint.helmetA} color={c.blockBlue} />
                  <Ball id={paint.helmetB} color={c.blockRed} />
                  <TopLight id={paint.light} />
                </Defs>
                {/* Smooth ice. */}
                <Rect x={0} y={ground} width={w} height={10} fill={c.glass} />
                <Line
                  x1={0}
                  y1={ground}
                  x2={w}
                  y2={ground}
                  stroke={c.glassEdge}
                  strokeWidth={chart.strokeLight}
                />
                <Skater
                  x={cx - H[0]! * 0.4}
                  ground={ground}
                  H={H[0]!}
                  dir={1}
                  hand={cx}
                  color={c.blockBlue}
                  name={nameA}
                  ids={{ helmet: paint.helmetA, light: paint.light }}
                />
                <Skater
                  x={cx + H[1]! * 0.4}
                  ground={ground}
                  H={H[1]!}
                  dir={-1}
                  hand={cx}
                  color={c.blockRed}
                  name={nameB}
                  ids={{ helmet: paint.helmetB, light: paint.light }}
                />
                {/* Each mass beside its skater, on the outer side. */}
                {[0, 1].map((i) => (
                  <ChartText
                    key={i}
                    x={i ? cx + H[1]! * 0.56 : cx - H[0]! * 0.56}
                    y={ground - H[i]! * 0.62}
                    textAnchor={i ? 'start' : 'end'}
                    fontSize={chart.small}
                    fontWeight="700"
                    opacity={rep.known(spec.masses[i]!) ? 1 : 0.5}
                  >
                    {rep.value(spec.masses[i]!)}
                  </ChartText>
                ))}
                {/* The pair of forces: equal, opposite, from the palms. */}
                <Line
                  x1={cx}
                  y1={fy - 8}
                  x2={cx}
                  y2={ground - Math.min(...H) * 0.74}
                  stroke={c.chartGrid}
                  strokeDasharray={chart.dashFine}
                />
                <G opacity={forceKnown ? 1 : 0.35}>
                  <Path
                    d={arrow(cx - 2, fy, cx - 2 - Math.max(1, fLen))}
                    stroke={c.blockBlue}
                    strokeWidth={chart.strokeHeavy}
                    fill="none"
                  />
                  <Path
                    d={arrow(cx + 2, fy, cx + 2 + Math.max(1, fLen))}
                    stroke={c.blockRed}
                    strokeWidth={chart.strokeHeavy}
                    fill="none"
                  />
                </G>
                <ChartText
                  {...fitLabel(cx - 6, labelA, chart.small, w, 'end')}
                  y={fy - 12}
                  fontSize={chart.small}
                  fontWeight="700"
                >
                  {labelA}
                </ChartText>
                <ChartText
                  {...fitLabel(cx + 6, labelB, chart.small, w, 'start')}
                  y={fy - 12}
                  fontSize={chart.small}
                  fontWeight="700"
                >
                  {labelB}
                </ChartText>
                {/* Each skater's acceleration, dashed, under the ice. */}
                {[0, 1].map((i) => {
                  const x0 = i ? cx + 6 : cx - 6;
                  const len = Math.max(1, acc[i]! * aScale);
                  const text = accText(i);
                  return (
                    <G key={i} opacity={accKnown(i) ? 1 : 0.35}>
                      <Path
                        d={arrow(x0, ay, i ? x0 + len : x0 - len)}
                        stroke={c.chartMuted}
                        strokeWidth={chart.stroke}
                        strokeDasharray={chart.dash}
                        fill="none"
                      />
                      <ChartText
                        {...fitLabel(x0, text, chart.small, w, i ? 'start' : 'end')}
                        y={ay + 18}
                        fontSize={chart.small}
                        fill={c.chartMuted}
                      >
                        {text}
                      </ChartText>
                    </G>
                  );
                })}
              </Svg>
              {forceKnown
                ? ([-1, 1] as const).map((side) => (
                    <DragHandle
                      key={side}
                      testID={side < 0 ? 'drag-push-a' : 'drag-push-b'}
                      x={cx + side * (2 + fLen)}
                      y={fy}
                      label={rep.variable(spec.force).name}
                      onStart={() => {
                        start.current = F;
                        fit.freeze();
                      }}
                      onEnd={fit.release}
                      onMove={(dx) =>
                        calc.set(
                          {
                            ...rep.pin([...spec.masses]),
                            [spec.force]: rep.snapTo(
                              spec.force,
                              start.current + (side * dx) / fScale,
                            ),
                          },
                          rep.slide(spec.force),
                        )
                      }
                    />
                  ))
                : null}
            </>
          );
        }}
      </Canvas>
      <Caption>
        {[
          `The push on ${nameA} and the push on ${nameB} are both ${nowrap(rep.value(spec.force))}, the opposite way`,
          ...[0, 1].map((i) => {
            const m = spec.masses[i]!;
            const a = spec.accelerations?.[i];
            const aSym = a ? rep.variable(a).symbol : 'a';
            return `${aSym} = ${rep.variable(spec.force).symbol} ÷ ${rep.variable(m).symbol} = ${rep.value(spec.force)} ÷ ${rep.value(m)} = ${a ? rep.value(a) : accText(i)}`;
          }),
          masses[0] === masses[1]
            ? 'The same mass: they speed up the same'
            : `The lighter skater, ${masses[0] < masses[1] ? nameA : nameB}, speeds up more`,
        ].join(' · ')}
      </Caption>
    </View>
  );
}
