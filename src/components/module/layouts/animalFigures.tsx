/**
 * Animals drawn in their fur and feathers for layout figures: a deer, a cat and a penguin, each
 * in a 48-unit box (like the card icons) scaled to size. `AnimalGroup` draws an explore `dots`
 * scene as animals (a deer alone, a herd with the young in the middle, a penguin huddle);
 * `OffspringFigure` draws a sort's parents and young side by side (`header: { kind:
 * 'offspring' }`).
 */
import { View } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import type { OffspringAnimal } from '@/data/modules/layouts';
import { chart } from '@/theme';

import { Canvas, ChartText } from '../reps/common';
import { FloorShadow } from '../reps/paint';
import { ell, useDrawKit, type DrawKit } from './drawKit';

/** Where an animal stands: its feet's middle at (x, y), `size` px for its 48-unit box. */
interface Place {
  x: number;
  y: number;
  size: number;
  /** Facing right instead of left. */
  flip?: boolean;
}

/** A group scaled so the 48-unit box is `size` px, its ground line at y. */
function Placed({ at, children }: { at: Place; children: React.ReactNode }) {
  const s = at.size / 48;
  const flip = at.flip ? -1 : 1;
  return (
    <G transform={`translate(${at.x} ${at.y}) scale(${s * flip} ${s}) translate(-24 -43)`}>
      {children}
    </G>
  );
}

/** A deer standing, facing left: a doe, a buck with antlers or a fawn with white spots. */
export function Deer({
  kit,
  at,
  fur,
  antlers,
  spots,
}: {
  kit: DrawKit;
  at: Place;
  fur?: string;
  antlers?: boolean;
  spots?: boolean;
}) {
  const k = kit.at(at.size / 48);
  const { c, shape, ink } = k;
  const coat = fur ?? c.fur;
  return (
    <Placed at={at}>
      {antlers ? (
        <>
          <Path
            d="M 13 8 L 10.5 1 M 11.6 4 L 7.5 2.5 M 10.9 2 L 12.5 -1 M 16 8 L 19 0.5 M 17.6 4 L 21.5 3.5 M 18.4 2 L 17.5 -1.5"
            fill="none"
            {...ink(3.6)}
          />
          <Path
            d="M 13 8 L 10.5 1 M 11.6 4 L 7.5 2.5 M 10.9 2 L 12.5 -1 M 16 8 L 19 0.5 M 17.6 4 L 21.5 3.5 M 18.4 2 L 17.5 -1.5"
            fill="none"
            {...ink(1.8)}
            stroke={c.furLight}
          />
        </>
      ) : null}
      {/* The far legs a shade darker, then the near ones, with dark hooves. */}
      {[17, 34, 15, 32].map((x, i) => (
        <G key={i} opacity={i < 2 ? 0.8 : 1}>
          <Rect x={x} y={26} width={2.6} height={16} rx={0.8} fill={coat} {...ink(1)} />
          <Rect x={x - 0.2} y={40.4} width={3} height={2.4} rx={0.6} fill={c.rubber} />
        </G>
      ))}
      {shape(
        'M 14 22 C 14 18 17 16 21 16 H 35 C 39 16 41 19 40 24 C 39 28 36 29 34 29 H 18 C 15 29 14 26 14 22 Z',
        coat,
      )}
      {/* The pale belly and the white tail. */}
      <Path d="M 19 27.6 H 34 C 32 29 20 29 19 27.6 Z" fill={c.furLight} />
      {shape(ell(40, 19.5, 2, 3), c.snow, { w: 1 })}
      {spots
        ? [
            [22, 19],
            [26, 18.4],
            [30, 18.6],
            [34, 19.2],
            [24, 22],
            [28, 21.6],
            [32, 22.2],
            [36, 21.8],
          ].map(([x, y]) => <Circle key={`${x}-${y}`} cx={x} cy={y} r={0.9} fill={c.snow} />)
        : null}
      {shape('M 16.5 21 L 12 9.5 L 17.5 8.5 L 22 18 Z', coat, { w: 1 })}
      {/* Two big ears. */}
      <G transform="rotate(-40 12.5 6.5)">{shape(ell(12.5, 6.5, 1.5, 3.2), coat, { w: 1 })}</G>
      <G transform="rotate(40 18 6)">{shape(ell(18, 6, 1.6, 3.3), coat, { w: 1 })}</G>
      {shape(
        'M 10 7 C 13 5.5 17.5 7 17.5 10 C 17.5 13 13 13 10 14 L 5 15 C 3 15 3 12 5 11 Z',
        coat,
      )}
      <Circle cx={4.3} cy={13} r={1} fill={c.rubber} />
      {k.eye(12, 9.5, 0.9)}
    </Placed>
  );
}

/** A cat standing, facing left, tail up: orange with darker stripes, or gray. */
export function Cat({
  kit,
  at,
  fur,
  nosePatch,
}: {
  kit: DrawKit;
  at: Place;
  fur: string;
  nosePatch?: boolean;
}) {
  const k = kit.at(at.size / 48);
  const { c, shape, ink, line } = k;
  return (
    <Placed at={at}>
      {line('M 40 24 C 46 21 47 12 43 8', fur, 2.8)}
      {[20, 37, 17, 34].map((x, i) => (
        <G key={i} opacity={i < 2 ? 0.8 : 1}>
          <Rect x={x} y={27} width={3} height={15.6} rx={1.3} fill={fur} {...ink(1)} />
        </G>
      ))}
      {shape(
        'M 14 25 C 14 20 19 18 25 18 H 35 C 40 18 42 21 41 26 C 40 30 37 31 34 31 H 19 C 16 31 14 29 14 25 Z',
        fur,
      )}
      {/* Stripes across the back. */}
      <Path
        d="M 23 18.3 q 1.2 3 0 5.5 M 28 18.1 q 1.2 3 0 5.5 M 33 18.1 q 1.2 3 0 5.5 M 37.5 18.8 q 1 2.6 0 4.8"
        fill="none"
        stroke={c.shade}
        strokeOpacity={0.22}
        strokeWidth={1.2}
        strokeLinecap="round"
      />
      {/* Pointy ears, then the head. */}
      {shape('M 6 13 L 5.5 4 L 11.5 9.5 Z', fur, { w: 1 })}
      {shape('M 12.5 9 L 16.5 3.5 L 18.5 11 Z', fur, { w: 1 })}
      <Path d="M 6.8 10.5 L 6.6 6.5 L 9.6 9.5 Z M 14 9 L 16.2 5.8 L 17.2 10 Z" fill={c.rock6} />
      {shape(ell(12, 15.5, 7.6, 6.8), fur)}
      {nosePatch ? <Path d={ell(6.4, 17.8, 3.8, 3)} fill={c.snow} /> : null}
      {k.eye(9.2, 14, 1.1)}
      <Path d="M 4.4 16.6 L 6 16.4 L 5.1 17.8 Z" fill={c.rock6} {...ink(0.6)} />
      <Path
        d="M 5 19 L -1.5 17.5 M 5 19.8 L -1.5 21 M 6.5 19.6 L 0.5 23"
        fill="none"
        {...ink(0.7)}
      />
    </Placed>
  );
}

/** An emperor penguin standing, seen from the front. */
export function Penguin({ kit, at }: { kit: DrawKit; at: Place }) {
  const k = kit.at(at.size / 48);
  const { c, shape } = k;
  return (
    <Placed at={at}>
      <Ellipse cx={19.5} cy={42.6} rx={3.2} ry={1.4} fill={c.orange} />
      <Ellipse cx={28.5} cy={42.6} rx={3.2} ry={1.4} fill={c.orange} />
      <G transform="rotate(14 13 28)">{shape(ell(13, 28, 3, 10), c.rubber, { w: 1 })}</G>
      <G transform="rotate(-14 35 28)">{shape(ell(35, 28, 3, 10), c.rubber, { w: 1 })}</G>
      {shape(ell(24, 25, 11, 17.5), c.rubber)}
      <Path d={ell(24, 29, 7.8, 12.5)} fill={c.snow} />
      <Ellipse cx={17.4} cy={16} rx={1.8} ry={3} fill={c.sunDisk} />
      <Ellipse cx={30.6} cy={16} rx={1.8} ry={3} fill={c.sunDisk} />
      <Circle cx={21} cy={13.5} r={1.1} fill={c.snow} />
      <Circle cx={27} cy={13.5} r={1.1} fill={c.snow} />
      <Path d="M 22.4 16.5 L 24 20.5 L 25.6 16.5 Z" fill={c.orange} />
    </Placed>
  );
}

/**
 * A `dots` scene drawn as animals: deer (one alone, or a herd with the young in the middle,
 * the grown deer round them facing out) or penguins packed in a huddle.
 */
export function AnimalGroup({
  animal,
  groups,
  each,
}: {
  animal: 'deer' | 'penguin';
  groups: number;
  each: number;
}) {
  const n = Math.max(1, Math.min(60, groups * each));
  return (
    <Canvas aspect={0.5}>{({ w, h }) => <GroupView animal={animal} n={n} w={w} h={h} />}</Canvas>
  );
}

function GroupView({
  animal,
  n,
  w,
  h,
}: {
  animal: 'deer' | 'penguin';
  n: number;
  w: number;
  h: number;
}) {
  const kit = useDrawKit();
  const { c } = kit;
  const cx = w / 2;
  const cy = h * 0.56;
  if (animal === 'penguin') {
    // Rows from the back: widest in the middle, so the huddle is a round heap.
    const rows: number[] = [];
    const pattern = [4, 6, 7, 7, 6];
    let left = n;
    for (let i = 0; left > 0; i++) {
      const k = Math.min(left, pattern[i % pattern.length]!);
      rows.push(k);
      left -= k;
    }
    const size = n === 1 ? 80 : Math.min(48, (h * 0.8) / (rows.length * 0.42 + 0.6));
    const dx = size * 0.46;
    const dy = size * 0.3;
    const y0 = cy + size * 0.4 - ((rows.length - 1) * dy) / 2;
    return (
      <Svg width={w} height={h}>
        {kit.defs}
        <Ellipse
          cx={cx}
          cy={h - 14}
          rx={w * 0.44}
          ry={12}
          fill={c.snow}
          {...kit.ink(1)}
          stroke={c.glassEdge}
        />
        {/* The cold wind round the outside. */}
        {n > 1
          ? [-1, 1].map((side) => (
              <Path
                key={side}
                d={`M ${cx + side * (w * 0.46)} ${h * 0.3} q ${-side * 14} 6 ${-side * 24} 2 M ${cx + side * (w * 0.47)} ${h * 0.46} q ${-side * 14} 6 ${-side * 26} 2`}
                fill="none"
                stroke={c.chartMuted}
                strokeWidth={chart.strokeLight}
                strokeLinecap="round"
              />
            ))
          : null}
        {rows.map((count, r) =>
          Array.from({ length: count }, (_, i) => (
            <Penguin
              key={`${r}-${i}`}
              kit={kit}
              at={{
                x: cx + (i - (count - 1) / 2) * dx + (r % 2 ? dx * 0.12 : 0),
                y: n === 1 ? h - 14 : y0 + r * dy + size * 0.5,
                size,
              }}
            />
          )),
        )}
      </Svg>
    );
  }
  // Deer: the young in an inner ring, the grown deer round them facing out.
  const young = n > 4 ? Math.min(4, Math.round(n / 3)) : 0;
  const spots: { x: number; y: number; young: boolean }[] = [];
  if (n === 1) spots.push({ x: cx, y: h * 0.86, young: false });
  else {
    for (let i = 0; i < young; i++) {
      const a = (2 * Math.PI * i) / young + 0.3;
      spots.push({ x: cx + 26 * Math.cos(a), y: cy + 10 * Math.sin(a) + 10, young: true });
    }
    const adults = n - young;
    for (let i = 0; i < adults; i++) {
      const a = (2 * Math.PI * i) / adults;
      spots.push({
        x: cx + Math.min(w * 0.36, 140) * Math.cos(a),
        y: cy + h * 0.3 * Math.sin(a) + 10,
        young: false,
      });
    }
  }
  spots.sort((p, q) => p.y - q.y);
  const size = n === 1 ? 120 : 54;
  return (
    <Svg width={w} height={h}>
      {kit.defs}
      <Ellipse
        cx={cx}
        cy={n === 1 ? h * 0.86 : cy + 12}
        rx={w * 0.46}
        ry={n === 1 ? 10 : h * 0.4}
        fill={c.life}
        opacity={0.35}
      />
      {spots.map((p, i) => (
        <G key={i}>
          <FloorShadow cx={p.x} cy={p.y} rx={size * (p.young ? 0.2 : 0.3)} ry={2} />
          <Deer
            kit={kit}
            at={{ x: p.x, y: p.y, size: p.young ? size * 0.62 : size, flip: p.x > cx + 1 }}
            spots={p.young}
          />
        </G>
      ))}
    </Svg>
  );
}

const WIDTH_UNITS = 50;

/** A sort's parents and young side by side on the ground, each named under it. */
export function OffspringFigure({ animals }: { animals: OffspringAnimal[] }) {
  const units = animals.reduce((sum, a) => sum + WIDTH_UNITS * (a.young ? 0.66 : 1), 0);
  const scaleAt = (w: number) => Math.min(2.4, (w - 24 - 14 * animals.length) / units);
  return (
    <Canvas aspect={(w) => (48 * scaleAt(w) + 30) / w}>
      {({ w, h }) => <OffspringView animals={animals} w={w} h={h} s={scaleAt(w)} units={units} />}
    </Canvas>
  );
}

function OffspringView({
  animals,
  w,
  h,
  s,
  units,
}: {
  animals: OffspringAnimal[];
  w: number;
  h: number;
  s: number;
  units: number;
}) {
  const kit = useDrawKit();
  const { c } = kit;
  const ground = h - 26;
  const gap = (w - units * s) / (animals.length + 1);
  // Each animal's middle, left to right with equal gaps.
  const spans = animals.map((a) => WIDTH_UNITS * (a.young ? 0.66 : 1) * s);
  const mids = spans.map(
    (span, i) => gap * (i + 1) + spans.slice(0, i).reduce((t, x) => t + x, 0) + span / 2,
  );
  const furOf = (a: OffspringAnimal) =>
    a.fur === 'orange'
      ? c.orange
      : a.fur === 'gray'
        ? c.furGrey
        : a.fur === 'brown'
          ? c.fur
          : a.animal === 'cat'
            ? c.orange
            : c.fur;
  return (
    <View>
      <Svg width={w} height={h}>
        {kit.defs}
        <Path d={`M 8 ${ground} H ${w - 8}`} {...kit.ink(1.5)} stroke={c.chartGrid} />
        {animals.map((a, i) => {
          const mid = mids[i]!;
          const at = { x: mid, y: ground, size: 48 * (a.young ? 0.66 : 1) * s };
          return (
            <G key={i}>
              <FloorShadow cx={mid + at.size * 0.1} cy={ground} rx={at.size * 0.36} ry={3} />
              {a.animal === 'cat' ? (
                <Cat kit={kit} at={at} fur={furOf(a)} nosePatch={a.nosePatch} />
              ) : (
                <Deer kit={kit} at={at} fur={furOf(a)} antlers={a.antlers} spots={a.spots} />
              )}
              <ChartText
                x={mid}
                y={ground + 18}
                fontSize={chart.label}
                fontWeight="700"
                textAnchor="middle"
              >
                {a.label}
              </ChartText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
}
