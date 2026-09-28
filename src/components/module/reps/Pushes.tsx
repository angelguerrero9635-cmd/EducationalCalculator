import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, fitLabel, useRep, Caption } from './common';
import { Crate, FloorShadow, TopLight, url, usePaintIds } from './paint';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'pushes' }>;

/** Push arrows: 6 px shafts with filled heads. */
const SHAFT = 6;
const HEAD = 13;

/**
 * A thick arrow along y from `from` to `to` (the tip), with a filled head. A push shorter
 * than the head draws just a head that long, so the length is still the push.
 */
function Arrow({ from, to, y, color }: { from: number; to: number; y: number; color: string }) {
  const len = Math.abs(to - from);
  if (len < 1) return null;
  const dir = to > from ? 1 : -1;
  const head = Math.min(HEAD, len);
  const neck = to - dir * head;
  return (
    <G>
      {len > head ? (
        <Line
          x1={from}
          y1={y}
          x2={neck + dir}
          y2={y}
          stroke={color}
          strokeWidth={SHAFT}
          strokeLinecap="butt"
        />
      ) : null}
      <Path d={`M ${to} ${y} L ${neck} ${y - 8} L ${neck} ${y + 8} Z`} fill={color} />
    </G>
  );
}

/**
 * A child leaning into a push, `H` px tall, feet on `ground`, facing `dir` (1 right, −1 left),
 * palms at (hx, hy).
 */
function Pusher({
  hx,
  hy,
  ground,
  H,
  dir,
  shirt,
  skin,
  light,
}: {
  hx: number;
  hy: number;
  ground: number;
  H: number;
  dir: 1 | -1;
  shirt: string;
  skin: string;
  light: string;
}) {
  const c = usePalette();
  const px = (u: number) => hx - dir * u * H;
  const limb = Math.max(4, H * 0.08);
  const hip = { x: px(0.58), y: ground - H * 0.46 };
  const shoulder = { x: px(0.34), y: ground - H * 0.76 };
  const head = { x: px(0.22), y: ground - H * 0.88, r: H * 0.1 };
  const back = { x: px(0.92), y: ground - limb / 2 };
  const knee = { x: px(0.38), y: ground - H * 0.24 };
  const front = { x: px(0.44), y: ground - limb / 2 };
  const elbow = { x: (shoulder.x + hx) / 2 - dir * 2, y: (shoulder.y + hy) / 2 + H * 0.05 };
  return (
    <G>
      <FloorShadow cx={px(0.62)} cy={ground + 1} rx={H * 0.34} ry={3} />
      {/* Legs: the back one straight and pushing off, the front one bent. */}
      <Path
        d={`M ${hip.x} ${hip.y} L ${back.x} ${back.y} M ${hip.x} ${hip.y} L ${knee.x} ${knee.y} L ${front.x} ${front.y}`}
        stroke={c.chartMuted}
        strokeWidth={limb * 1.3}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Shoes. */}
      {[back, front].map((f, i) => (
        <Rect
          key={i}
          x={f.x - (dir > 0 ? 2 : H * 0.14 - 2)}
          y={ground - H * 0.06}
          width={H * 0.14}
          height={H * 0.06}
          rx={H * 0.03}
          fill={c.rubber}
        />
      ))}
      {/* The body, leaning into the push. */}
      <Path
        d={`M ${hip.x} ${hip.y} L ${shoulder.x} ${shoulder.y}`}
        stroke={shirt}
        strokeWidth={H * 0.2}
        strokeLinecap="round"
      />
      <Path
        d={`M ${hip.x} ${hip.y} L ${shoulder.x} ${shoulder.y}`}
        stroke={url(light)}
        strokeWidth={H * 0.2}
        strokeLinecap="round"
      />
      {/* Arms out to the palms at the arrow's tail. */}
      <Path
        d={`M ${shoulder.x} ${shoulder.y} L ${elbow.x} ${elbow.y} L ${hx - dir * limb * 0.6} ${hy}`}
        stroke={shirt}
        strokeWidth={limb}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Circle cx={hx - dir * limb * 0.5} cy={hy} r={limb * 0.7} fill={skin} />
      <Circle cx={head.x} cy={head.y} r={head.r} fill={skin} />
      {/* Hair over the back of the head. */}
      <Path
        d={`M ${head.x - dir * head.r * 0.95} ${head.y + head.r * 0.3} A ${head.r} ${head.r} 0 0 ${dir > 0 ? 1 : 0} ${head.x + dir * head.r * 0.7} ${head.y - head.r * 0.7} Q ${head.x} ${head.y - head.r * 0.2} ${head.x - dir * head.r * 0.95} ${head.y + head.r * 0.3} Z`}
        fill={c.furDark}
      />
    </G>
  );
}

/**
 * A crate on a wooden floor pushed from both sides by two children. Each push arrow's length
 * is its force (one scale for both, set by the bigger push), in its own color with its value
 * over it and its name under the floor. Above the crate, the extra push is an ink arrow on the
 * same scale toward the way the crate moves; when the pushes are equal an "=" says balanced.
 */
export function Pushes({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const paint = usePaintIds('light', 'body', 'floor');
  const rep = useRep(calc);
  const r = rep.known(spec.right) ? Math.max(0, rep.shown(spec.right)) : 0;
  const l = rep.known(spec.left) ? Math.max(0, rep.shown(spec.left)) : 0;
  const both = rep.known(spec.right) && rep.known(spec.left);
  const e = rep.known(spec.extra) ? Math.max(0, rep.shown(spec.extra)) : undefined;
  const rightColor = c.blockBlue;
  const leftColor = c.orange;

  return (
    <View>
      <Canvas aspect={(w) => 176 / w}>
        {({ w, h }) => {
          const cx = w / 2;
          const box = 66;
          const ground = h - 44;
          const y = ground - box / 2;
          const kid = 58;
          // The longest arrow reaches from the crate to just short of the child's room.
          const room = cx - box / 2 - kid * 0.95 - 8;
          const most = Math.max(r, l, e ?? 0);
          const px = (x: number) => (most > 0 ? (x / most) * room : 0);
          const leftTail = cx - box / 2 - px(r);
          const rightTail = cx + box / 2 + px(l);
          // A push's value sits over its arrow; over a short arrow, above the child's head;
          // with no push, beside the crate.
          const valueAt = (tail: number, face: number, push: number, text: string) => {
            const dir = face < cx ? 1 : -1;
            if (Math.abs(face - tail) >= text.length * chart.value * 0.58 + 6)
              return { ...fitLabel((tail + face) / 2, text, chart.value, w), y: y - 12 };
            if (push > 0)
              return {
                ...fitLabel(tail - dir * kid * 0.3, text, chart.value, w),
                y: ground - kid - 6,
              };
            return {
              ...fitLabel(face - dir * 6, text, chart.value, w, dir > 0 ? 'end' : 'start'),
              y: y - 12,
            };
          };
          const rText = rep.value(spec.right);
          const lText = rep.value(spec.left);
          const netY = y - box / 2 - 20;
          const moving = both && e !== undefined && e > 0 && r !== l;
          const netDir = r > l ? 1 : -1;
          const netLabel = rep.named(spec.extra);
          return (
            <Svg width={w} height={h}>
              <Defs>
                <TopLight id={paint.light} />
                <TopLight id={paint.body} strength={0.8} />
                <TopLight id={paint.floor} />
              </Defs>
              {/* A wooden floor: planks with their seams. */}
              <Rect x={8} y={ground} width={w - 16} height={12} rx={2} fill={c.wood} />
              <Rect x={8} y={ground} width={w - 16} height={12} rx={2} fill={url(paint.floor)} />
              {Array.from({ length: Math.floor((w - 16) / 60) }, (_, i) => (
                <Line
                  key={i}
                  x1={8 + 60 * (i + 1) - (i % 2) * 22}
                  y1={ground + 1}
                  x2={8 + 60 * (i + 1) - (i % 2) * 22}
                  y2={ground + 11}
                  stroke={c.woodDark}
                  strokeOpacity={0.6}
                />
              ))}
              <Line
                x1={8}
                y1={ground}
                x2={w - 8}
                y2={ground}
                stroke={c.woodDark}
                strokeWidth={chart.strokeLight}
              />

              <Crate x={cx - box / 2} y={ground - box} size={box} lightId={paint.light} />

              {/* The push to the right comes from the left side; the push to the left from the right. */}
              {r > 0 ? (
                <Pusher
                  hx={leftTail}
                  hy={y}
                  ground={ground}
                  H={kid}
                  dir={1}
                  shirt={rightColor}
                  skin={c.skin}
                  light={paint.body}
                />
              ) : null}
              {l > 0 ? (
                <Pusher
                  hx={rightTail}
                  hy={y}
                  ground={ground}
                  H={kid}
                  dir={-1}
                  shirt={leftColor}
                  skin={c.skinBrown}
                  light={paint.body}
                />
              ) : null}
              <Arrow from={leftTail} to={cx - box / 2} y={y} color={rightColor} />
              <Arrow from={rightTail} to={cx + box / 2} y={y} color={leftColor} />
              <ChartText
                {...valueAt(leftTail, cx - box / 2, r, rText)}
                fontSize={chart.value}
                fontWeight="700"
                fill={rep.known(spec.right) ? c.chartInk : c.chartMuted}
              >
                {rText}
              </ChartText>
              <ChartText
                {...valueAt(rightTail, cx + box / 2, l, lText)}
                fontSize={chart.value}
                fontWeight="700"
                fill={rep.known(spec.left) ? c.chartInk : c.chartMuted}
              >
                {lText}
              </ChartText>

              {/* Names under the floor, one each side. */}
              <ChartText
                {...fitLabel(cx / 2, rep.tag(spec.right), chart.label, w)}
                y={ground + 30}
                fontSize={chart.label}
                fill={c.chartMuted}
              >
                {rep.tag(spec.right)}
              </ChartText>
              <ChartText
                {...fitLabel((3 * cx) / 2, rep.tag(spec.left), chart.label, w)}
                y={ground + 30}
                fontSize={chart.label}
                fill={c.chartMuted}
              >
                {rep.tag(spec.left)}
              </ChartText>

              {/* Above the crate: the extra push on the same scale, or "=" when balanced. */}
              {moving ? (
                <>
                  <Arrow from={cx} to={cx + netDir * px(e!)} y={netY} color={c.chartInk} />
                  <Circle cx={cx} cy={netY} r={4} fill={c.chartInk} />
                  <ChartText
                    {...fitLabel(cx, netLabel, chart.label, w)}
                    y={netY - 14}
                    fontSize={chart.label}
                    fontWeight="700"
                  >
                    {netLabel}
                  </ChartText>
                </>
              ) : both && r === l ? (
                <>
                  <Line
                    x1={cx - 10}
                    y1={netY - 4}
                    x2={cx + 10}
                    y2={netY - 4}
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeHeavy}
                  />
                  <Line
                    x1={cx - 10}
                    y1={netY + 4}
                    x2={cx + 10}
                    y2={netY + 4}
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeHeavy}
                  />
                  <ChartText
                    x={cx}
                    y={netY - 14}
                    fontSize={chart.label}
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    Balanced
                  </ChartText>
                </>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {!both
          ? 'Type both pushes.'
          : r === l
            ? `Balanced: ${rep.value(spec.right)} each way. The box stays still.`
            : `Unbalanced: the box moves ${r > l ? 'right' : 'left'}. ${rep.named(spec.extra)}.`}
      </Caption>
      <Steppers
        calc={calc}
        items={[
          { var: spec.right, steps: [1, 5], pin: [spec.left] },
          { var: spec.left, steps: [1, 5], pin: [spec.right] },
        ]}
      />
    </View>
  );
}
