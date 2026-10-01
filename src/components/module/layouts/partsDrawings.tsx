/**
 * A `parts` explore figure drawn as the thing itself: a plant (flower, leaves, stem, roots), a
 * bear and a turtle (eyes, ears, fur, claws, shell) or a body (brain, heart, lungs, stomach,
 * bones, skin). Every part the page names is labeled; the scene's part is outlined in the
 * highlight color and its label filled. Tapping a part or its label picks it.
 */
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import { chart } from '@/theme';

import { Canvas, ChartText } from '../reps/common';
import { FloorShadow } from '../reps/paint';
import { ell, useDrawKit, type DrawKit } from './drawKit';
import { drawnPart, type PartsDrawingKind } from './figureMath';
import { FLOWER } from './partsFlower';

/** The drawings are made in a box this wide, then scaled to the screen. */
const W = 320;

interface Region {
  key: string;
  art: (k: DrawKit, lit: boolean) => ReactNode;
  /** The point on the part the label's line goes to. */
  anchor: [number, number];
  /** The label's position; `end` puts the text to the left of it. */
  label: [number, number, 'start' | 'end'];
  /** The part's tap area: x, y, width, height. */
  hit: [number, number, number, number];
}

interface Drawing {
  /** (Exported below as `PartsDrawingDef` for drawings kept in their own files.) */
  height: number;
  /** H109: the drawing's top in its own coordinates (default 0), for a drawing made lower down. */
  top?: number;
  /** Drawn under the parts (ground, soil). */
  back?: (k: DrawKit) => ReactNode;
  regions: Region[];
}

export function PartsDrawing({
  drawing,
  parts,
  highlight,
  alsoLit,
  onPart,
}: {
  drawing: PartsDrawingKind;
  parts: { name: string }[];
  highlight: string | undefined;
  /** More parts lit with `highlight` (a stamen's anther and filament). */
  alsoLit?: string[];
  onPart: (name: string) => void;
}) {
  const def = DRAWINGS[drawing];
  const scaleAt = (w: number) => Math.min(w / W, 1.35);
  return (
    <Canvas aspect={(w) => (def.height * scaleAt(w)) / w}>
      {({ w, h }) => (
        <DrawingView
          def={def}
          w={w}
          h={h}
          k={scaleAt(w)}
          parts={parts}
          highlight={highlight}
          alsoLit={alsoLit}
          onPart={onPart}
        />
      )}
    </Canvas>
  );
}

function DrawingView({
  def,
  w,
  h,
  k,
  parts,
  highlight,
  alsoLit,
  onPart,
}: {
  def: Drawing;
  w: number;
  h: number;
  k: number;
  parts: { name: string }[];
  highlight: string | undefined;
  alsoLit?: string[];
  onPart: (name: string) => void;
}) {
  const kit = useDrawKit(k);
  const { c } = kit;
  const ox = (w - W * k) / 2;
  const lit = highlight === undefined ? undefined : drawnPart(highlight);
  const litKeys = new Set([lit, ...(alsoLit ?? []).map(drawnPart)]);
  const isLit = (key: string) => lit !== undefined && litKeys.has(key);
  const fs = chart.label / k;
  const named = def.regions
    .map((r) => ({ r, part: parts.find((p) => drawnPart(p.name) === r.key) }))
    .filter((x): x is { r: Region; part: { name: string } } => x.part !== undefined);
  return (
    <View style={{ width: w, height: h }}>
      <Svg width={w} height={h}>
        {kit.defs}
        <G transform={`translate(${ox} ${-(def.top ?? 0) * k}) scale(${k})`}>
          {def.back?.(kit)}
          {def.regions.map((r) => (
            <G key={r.key}>{r.art(kit, isLit(r.key))}</G>
          ))}
          {named.map(({ r, part }) => {
            const on = isLit(r.key);
            const [lx, ly, side] = r.label;
            const tw = part.name.length * fs * 0.6;
            const x0 = side === 'end' ? lx - tw : lx;
            return (
              <G key={r.key}>
                <Line
                  x1={side === 'end' ? lx + 3 / k : lx - 3 / k}
                  y1={ly - fs * 0.35}
                  x2={r.anchor[0]}
                  y2={r.anchor[1]}
                  stroke={on ? c.chartHighlight : c.chartMuted}
                  strokeWidth={(on ? chart.stroke : chart.strokeLight) / k}
                />
                <Circle
                  cx={r.anchor[0]}
                  cy={r.anchor[1]}
                  r={2.2 / k}
                  fill={on ? c.chartHighlight : c.chartMuted}
                />
                {on ? (
                  <Rect
                    x={x0 - 5 / k}
                    y={ly - fs - 2 / k}
                    width={tw + 10 / k}
                    height={fs + 8 / k}
                    rx={4 / k}
                    fill={c.chartHighlight}
                  />
                ) : null}
                <ChartText
                  x={lx}
                  y={ly}
                  fontSize={fs}
                  fontWeight={on ? '700' : '600'}
                  textAnchor={side}
                  fill={on ? c.onChartHighlight : c.chartInk}
                >
                  {part.name}
                </ChartText>
              </G>
            );
          })}
        </G>
      </Svg>
      {/* Tap targets: each part, and its label. */}
      {named.flatMap(({ r, part }) => {
        const [lx, ly, side] = r.label;
        const tw = part.name.length * fs * 0.6;
        const boxes: [number, number, number, number][] = [
          r.hit,
          [side === 'end' ? lx - tw - 8 : lx - 8, ly - 30, tw + 16, 40],
        ];
        return boxes.map(([x, y, bw, bh], i) => (
          <Pressable
            key={`${r.key}-${i}`}
            testID={i === 0 ? `part-${part.name}` : undefined}
            accessibilityRole="button"
            accessibilityLabel={part.name}
            accessibilityState={{ selected: r.key === lit }}
            onPress={() => onPart(part.name)}
            style={{
              position: 'absolute',
              left: ox + x * k,
              top: (y - (def.top ?? 0)) * k,
              width: bw * k,
              height: bh * k,
            }}
          />
        ));
      })}
    </View>
  );
}

// ── The plant ─────────────────────────────────────────────────────────────────

const PLANT: Drawing = {
  height: 232,
  back: ({ c, ink }) => (
    <G>
      {/* Soil cut away under the ground, so the roots show. */}
      <Rect x={70} y={150} width={180} height={76} rx={6} fill={c.soil} />
      <Path d="M 70 150 H 250" {...ink(1.5)} stroke={c.soilDark} />
      <Path
        d="M 72 150 q 4 -9 8 0 q 4 -7 8 0 M 226 150 q 4 -9 8 0 q 4 -7 8 0"
        fill={c.life}
        {...ink(1)}
        stroke={c.lifeDeep}
      />
    </G>
  ),
  regions: [
    {
      key: 'roots',
      art: ({ line, c }, lit) =>
        line(
          'M 160 150 C 158 170 162 190 158 214 M 159 162 C 150 170 138 174 126 190 M 161 166 C 172 174 184 182 194 198 M 159 186 C 150 194 144 204 138 216 M 160 192 C 168 198 176 206 182 216 M 140 176 L 128 172 M 180 178 L 192 174',
          c.furLight,
          2.6,
          lit,
        ),
      anchor: [128, 188],
      label: [60, 196, 'end'],
      hit: [110, 152, 100, 72],
    },
    {
      key: 'stem',
      art: ({ line, c }, lit) => line('M 160 152 C 157 124 163 92 160 58', c.lifeDeep, 5, lit),
      anchor: [161, 134],
      label: [232, 138, 'start'],
      hit: [146, 124, 28, 30],
    },
    {
      key: 'leaves',
      art: ({ shape, ink, c }, lit) => (
        <>
          {[
            [
              'M 159 120 C 140 96 116 94 102 101 C 116 118 140 126 159 120 Z',
              'M 157 119 Q 130 107 106 102',
            ],
            [
              'M 161 98 C 180 74 206 72 220 80 C 206 98 180 104 161 98 Z',
              'M 163 97 Q 190 85 216 81',
            ],
            [
              'M 159 80 C 150 64 136 60 126 64 C 134 78 148 84 159 80 Z',
              'M 158 79 Q 143 69 130 65',
            ],
          ].map(([d, vein]) => (
            <G key={d}>
              {shape(d!, c.life, { lit })}
              <Path d={vein} fill="none" {...ink(0.9)} stroke={c.lifeDeep} />
            </G>
          ))}
        </>
      ),
      anchor: [114, 103],
      label: [96, 128, 'end'],
      hit: [100, 58, 124, 64],
    },
    {
      key: 'flower',
      art: ({ shape, c, ring }, lit) => (
        <>
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <G key={a} transform={`rotate(${a} 160 44)`}>
              {shape(ell(160, 30, 7.5, 12), c.petal)}
            </G>
          ))}
          {shape(ell(160, 44, 8, 8), c.sunDisk)}
          {lit ? ring(160, 44, 30) : null}
        </>
      ),
      anchor: [184, 30],
      label: [232, 32, 'start'],
      hit: [128, 10, 64, 66],
    },
  ],
};

// ── A bear and a turtle ─────────────────────────────────────────────────────────

/** The bear is drawn in a 48-unit box (like its card icon), scaled 4 times. */
const BEAR = 4;
const bx = (x: number) => 20 + x * BEAR;
const by = (y: number) => 10 + y * BEAR;
/** The turtle's box, scaled 2 times. */
const TURTLE = 2;
const tx = (x: number) => 222 + x * TURTLE;
const ty = (y: number) => 100 + y * TURTLE;

const BEAR_BODY =
  'M 10 24 C 10 16 15 12.5 21 12.5 C 26 12 30 14 36 16 C 42 18 43.5 26 41.5 31 C 40.5 33 38.5 34 35.5 34 H 15 C 12 34 10 30 10 24 Z';
const BEAR_HEAD =
  'M 13.5 16 C 11.5 13 7 13 5 15 C 3 17 1 19 1.5 21 C 2 23 6 23.5 9 23.5 C 12.5 23.5 14.5 20 13.5 16 Z';
const leg = (x: number) =>
  `M ${x} 28 H ${x + 5.2} V 41 C ${x + 5.2} 42 ${x + 4.2} 42.5 ${x + 2.6} 42.5 C ${x + 1} 42.5 ${x} 42 ${x} 41 Z`;
/** The front paws' claws: three hooks at each toe. */
const CLAWS = [12, 18]
  .flatMap((x) =>
    [0, 1.5, 3].map(
      (j) => `M ${x + 0.4 + j} 41.6 C ${x - 0.6 + j} 42.2 ${x - 1.2 + j} 43 ${x - 1.4 + j} 43.8`,
    ),
  )
  .join(' ');

const ANIMAL: Drawing = {
  height: 214,
  back: ({ c, ink }) => (
    <G>
      <Path d="M 8 180 H 312" {...ink(1.5)} stroke={c.chartGrid} />
      <FloorShadow cx={bx(26)} cy={180} rx={80} ry={5} />
      <FloorShadow cx={tx(25)} cy={180} rx={38} ry={4} />
    </G>
  ),
  regions: [
    {
      key: 'fur',
      art: (kit, lit) => {
        const { shape, c, ink } = kit.at(BEAR);
        return (
          <G transform={`translate(20 10) scale(${BEAR})`}>
            {[12, 18, 30, 35].map((x) => (
              <G key={x}>{shape(leg(x), c.furDark, { w: 1.3, lit })}</G>
            ))}
            {shape(BEAR_BODY, c.furDark, { lit })}
            {shape(BEAR_HEAD, c.furDark, { lit })}
            <Path d={ell(4, 20.6, 2.8, 2.1)} fill={c.fur} />
            <Circle cx={1.9} cy={19.8} r={1.1} fill={c.rubber} />
            {/* Fur: short strokes along the back and sides. */}
            <Path
              d="M 18 15.5 q 1 -1.6 2 0 M 24 14 q 1 -1.6 2 0 M 30 15 q 1 -1.6 2 0 M 36 17.5 q 1 -1.6 2 0 M 16 22 q 1 -1.6 2 0 M 22 20 q 1 -1.6 2 0 M 28 21 q 1 -1.6 2 0 M 34 22.5 q 1 -1.6 2 0 M 20 27 q 1 -1.6 2 0 M 27 27 q 1 -1.6 2 0 M 33 28 q 1 -1.6 2 0"
              fill="none"
              {...ink(1.2)}
              stroke={c.fur}
            />
          </G>
        );
      },
      anchor: [bx(29), by(18)],
      label: [172, 38, 'start'],
      hit: [bx(10), by(12), 34 * BEAR, 22 * BEAR],
    },
    {
      key: 'ears',
      art: (kit, lit) => (
        <G>
          <G transform={`translate(20 10) scale(${BEAR})`}>
            {kit.at(BEAR).shape(ell(10.5, 13, 2.3, 2.3), kit.c.furDark)}
            <Circle cx={10.5} cy={13} r={1.1} fill={kit.c.fur} />
          </G>
          {lit ? kit.ring(bx(10.5), by(13), 14) : null}
        </G>
      ),
      anchor: [bx(11), by(11)],
      label: [96, 26, 'start'],
      hit: [bx(7), by(9), 30, 30],
    },
    {
      key: 'eyes',
      art: ({ eye, c, ring }, lit) => (
        <G>
          <Circle cx={bx(7.8)} cy={by(16.4)} r={1.2 * BEAR} fill={c.snow} />
          {eye(bx(7.8), by(16.4), 0.8 * BEAR)}
          {lit ? ring(bx(7.8), by(16.4), 10) : null}
        </G>
      ),
      anchor: [bx(7), by(15)],
      label: [34, 40, 'end'],
      hit: [bx(4), by(13), 30, 30],
    },
    {
      key: 'claws',
      art: (kit, lit) => (
        <G>
          <G transform={`translate(20 10) scale(${BEAR})`}>
            <Path d={CLAWS} fill="none" {...kit.at(BEAR).ink(4.2)} />
            <Path d={CLAWS} fill="none" {...kit.at(BEAR).ink(2.2)} stroke={kit.c.bone} />
          </G>
          {lit ? (
            <>
              {kit.ring(bx(12.6), by(42.6), 11)}
              {kit.ring(bx(18.6), by(42.6), 11)}
            </>
          ) : null}
        </G>
      ),
      anchor: [bx(19), by(43.5)],
      label: [118, 204, 'start'],
      hit: [bx(9), by(38), 40, 30],
    },
    {
      key: 'shell',
      art: (kit, lit) => {
        const { shape, c, eye, ink } = kit.at(TURTLE);
        return (
          <G transform={`translate(222 100) scale(${TURTLE})`}>
            {shape('M 39 33 L 46 35 L 39 36.5 Z', c.life, { w: 1 })}
            <Rect x={13} y={30} width={6} height={9} rx={3} fill={c.life} {...ink()} />
            <Rect x={31} y={30} width={6} height={9} rx={3} fill={c.life} {...ink()} />
            {shape('M 14 29.5 C 10 25.5 4 24.5 2.5 28.5 C 1.5 32 6 34.5 14 34 Z', c.life)}
            {eye(6, 28.4, 1)}
            {shape('M 9 33 C 10 18 17 12.5 25 12.5 C 33 12.5 40 18 41 33 Z', c.lifeDeep, { lit })}
            <Path
              d="M 20 15.5 L 18 24 L 25 27 L 32 24 L 30 15.5 M 18 24 L 11 30 M 25 27 V 33 M 32 24 L 39 30"
              fill="none"
              stroke={c.chartSecond}
              strokeOpacity={0.75}
              strokeWidth={1.1}
            />
            <Rect x={8} y={31.5} width={34} height={3} rx={1.5} fill={c.chartSecond} {...ink(1)} />
          </G>
        );
      },
      anchor: [tx(26), ty(15)],
      label: [tx(24), 104, 'start'],
      hit: [tx(4), ty(10), 76, 56],
    },
  ],
};

// ── A body ────────────────────────────────────────────────────────────────────

const BODY_SHAPES = {
  head: ell(160, 34, 22, 23),
  neck: 'M 151 52 H 169 V 68 H 151 Z',
  torso: 'M 122 72 Q 160 62 198 72 L 195 152 Q 160 162 125 152 Z',
};
const BODY_LIMBS = 'M 125 80 L 108 150 M 195 80 L 212 150 M 142 150 L 139 228 M 178 150 L 181 228';

const BODY: Drawing = {
  height: 244,
  regions: [
    {
      key: 'skin',
      art: ({ c, ink }, lit) => {
        const edge = lit ? c.chartHighlight : c.chartInk;
        const shapes = Object.values(BODY_SHAPES);
        return (
          <G>
            {/* Outlines first, then the fills over them: one outline round the whole body. */}
            {shapes.map((d) => (
              <Path key={d} d={d} fill={edge} {...ink(lit ? 7 : 3)} stroke={edge} />
            ))}
            <Path d={BODY_LIMBS} fill="none" {...ink(lit ? 23 : 19)} stroke={edge} />
            <Path d={BODY_LIMBS} fill="none" {...ink(16)} stroke={c.skin} />
            {shapes.map((d) => (
              <Path key={d} d={d} fill={c.skin} />
            ))}
            <FloorShadow cx={160} cy={236} rx={40} ry={3} />
          </G>
        );
      },
      anchor: [213, 118],
      label: [232, 84, 'start'],
      hit: [100, 76, 26, 80],
    },
    {
      key: 'bones',
      art: ({ c, ink }, lit) => {
        const bone = (d: string, w: number) => (
          <>
            {lit ? <Path d={d} fill="none" {...ink(w + 7)} stroke={c.chartHighlight} /> : null}
            <Path d={d} fill="none" {...ink(w + 2)} />
            <Path d={d} fill="none" {...ink(w)} stroke={c.bone} />
          </>
        );
        return (
          <G opacity={lit ? 1 : 0.9}>
            {/* The skull, the spine, the ribs, the hips, and the long bones of the arms and legs. */}
            {bone(
              'M 143 36 C 141 18 179 18 177 36 C 176 46 170 50 160 50 C 150 50 144 46 143 36 Z',
              2.4,
            )}
            {bone(
              'M 125 84 L 111 146 M 195 84 L 209 146 M 142 158 L 139 224 M 178 158 L 181 224',
              4,
            )}
            {bone('M 130 74 L 190 74', 3)}
            {bone('M 160 60 V 148', 4)}
            {[0, 1, 2, 3, 4].map((i) => (
              <G key={i}>
                {bone(
                  `M 160 ${82 + i * 9} C ${146 - i} ${80 + i * 9} ${134 - i} ${86 + i * 9} ${136} ${94 + i * 9} M 160 ${82 + i * 9} C ${174 + i} ${80 + i * 9} ${186 + i} ${86 + i * 9} ${184} ${94 + i * 9}`,
                  2,
                )}
              </G>
            ))}
            {bone('M 136 146 Q 160 164 184 146 L 180 156 Q 160 166 140 156 Z', 2.4)}
          </G>
        );
      },
      anchor: [139, 196],
      label: [104, 200, 'end'],
      hit: [128, 170, 60, 60],
    },
    {
      key: 'lungs',
      art: ({ shape, c, ink }, lit) => (
        <G>
          <Path d="M 160 58 V 78 M 160 78 L 151 86 M 160 78 L 169 86" fill="none" {...ink(4)} />
          <Path
            d="M 160 58 V 78 M 160 78 L 151 86 M 160 78 L 169 86"
            fill="none"
            {...ink(2)}
            stroke={c.organ}
          />
          {shape(
            'M 153 84 C 140 80 134 96 134 110 C 134 124 140 128 154 124 C 157 112 157 96 153 84 Z',
            c.organ,
            { lit },
          )}
          {shape(
            'M 167 84 C 180 80 186 96 186 110 C 186 124 180 128 166 124 C 163 112 163 96 167 84 Z',
            c.organ,
            { lit },
          )}
        </G>
      ),
      anchor: [140, 104],
      label: [104, 106, 'end'],
      hit: [132, 80, 24, 46],
    },
    {
      key: 'heart',
      art: ({ shape, c, ring }, lit) => (
        <G>
          {shape(
            'M 166 106 C 162 100 154 102 156 110 C 157 115 163 119 167 122 C 172 118 177 113 177 108 C 177 101 169 100 166 106 Z',
            c.organDeep,
          )}
          {lit ? ring(166, 112, 15) : null}
        </G>
      ),
      anchor: [172, 108],
      label: [232, 116, 'start'],
      hit: [156, 98, 24, 26],
    },
    {
      key: 'stomach',
      art: ({ shape, c }, lit) =>
        shape(
          'M 168 128 C 180 126 186 134 184 142 C 182 150 172 152 164 148 C 160 146 158 142 162 140 C 168 142 174 140 172 134 C 170 131 168 130 168 128 Z',
          c.stomach,
          { lit },
        ),
      anchor: [180, 142],
      label: [232, 150, 'start'],
      hit: [158, 124, 30, 30],
    },
    {
      key: 'brain',
      art: ({ shape, c, ink }, lit) => (
        <G>
          {shape(
            'M 144 32 C 142 18 152 14 160 16 C 170 14 179 20 176 32 C 176 38 170 41 160 40 C 150 41 144 38 144 32 Z',
            c.organ,
            { lit },
          )}
          <Path
            d="M 160 17 V 39 M 149 24 q 4 2 2 6 M 152 34 q 4 -3 6 0 M 170 23 q -4 2 -2 6 M 168 34 q -4 -3 -6 0"
            fill="none"
            {...ink(1)}
            stroke={c.organDeep}
            strokeOpacity={0.6}
          />
        </G>
      ),
      anchor: [148, 26],
      label: [104, 30, 'end'],
      hit: [140, 12, 40, 32],
    },
  ],
};

export type PartsDrawingDef = Drawing;

const DRAWINGS: Record<PartsDrawingKind, Drawing> = {
  plant: PLANT,
  animal: ANIMAL,
  body: BODY,
  flower: FLOWER,
};
