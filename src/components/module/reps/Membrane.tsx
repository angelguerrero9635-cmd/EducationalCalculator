/**
 * H32 `membrane` (group HG): a patch of cell membrane, the outside above and the cytoplasm
 * below. A phospholipid bilayer (heads facing the water on both sides, tails inside), the
 * particles on each side counted exactly from the values, and the arrow the transport gives:
 * high to low through the bilayer or a channel protein, water through an aquaporin toward more
 * solute, or a pump carrying particles low to high with ATP. Particles crossing now (`moved`)
 * are drawn lit on the arrow. Counts are typed, so the picture has no handles.
 */
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { MembraneSpec } from '@/data/modules/typesHsg';
import { chart, usePalette, type Palette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { MEMBRANE_MAX, MOVED_MAX, flowOf, jitter, shuffled, type Flow } from './membraneMath';
import { Ball, url, usePaintIds } from './paint';

const W = 360;
const H = 300;
/** The outside and inside regions (y from, to) and the bilayer's heads. */
const OUT: [number, number] = [26, 112];
const IN: [number, number] = [184, 270];
const HEAD_TOP = 122;
const HEAD_BOTTOM = 174;
/** Where a protein sits, and the arrow when there is none. */
const PROTEIN_X = 268;
const BILAYER_X = 132;

export function Membrane({ spec, calc }: { spec: MembraneSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('solute', 'lit', 'head');
  const num = (x: string | number | undefined) =>
    x === undefined ? undefined : typeof x === 'number' ? x : rep.val(x);
  const known = (x: string | number | undefined) =>
    x === undefined || typeof x === 'number' || rep.known(x);
  const clamp = (x: number | undefined, max: number) =>
    Math.max(0, Math.min(max, Math.round(x ?? 0)));
  const o = clamp(num(spec.outside), MEMBRANE_MAX);
  const i = clamp(num(spec.inside), MEMBRANE_MAX);
  const bothKnown = known(spec.outside) && known(spec.inside);
  const moved = clamp(num(spec.moved), MOVED_MAX);
  const atp = spec.atp === undefined ? undefined : clamp(num(spec.atp), 12);
  const flow = flowOf(spec.transport, o, i);
  const protein = spec.transport !== 'diffusion';
  const ax = protein ? PROTEIN_X : BILAYER_X;
  const name = spec.particle ?? 'particles';
  const water = spec.transport === 'osmosis';
  // Room kept clear of particles: the arrow's column and the ATP chip under a pump.
  const clear: [number, number, number, number][] = [[ax - 30, 0, ax + 30, H]];
  if (spec.transport === 'active') clear.push([ax - 100, 190, W, 222]);
  const countText = (x: string | number, where: string) =>
    typeof x === 'number' ? `${x} ${where}` : `${rep.label(x)} ${where}`;

  return (
    <>
      <Canvas aspect={H / W}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            <Defs>
              <Ball id={ids.solute} color={c.bioSolute} />
              <Ball id={ids.lit} color={c.chartHighlight} />
              <Ball id={ids.head} color={c.bioHead} />
            </Defs>
            <G transform={`scale(${w / W})`}>
              {/* The water on each side: the outside a little bluer than the cytoplasm. */}
              <Rect x={0} y={0} width={W} height={HEAD_TOP} fill={c.water} opacity={0.12} />
              <Rect
                x={0}
                y={HEAD_BOTTOM}
                width={W}
                height={H - HEAD_BOTTOM}
                fill={c.life}
                opacity={0.14}
              />
              <Bilayer skip={protein ? [ax - 32, ax + 32] : undefined} head={url(ids.head)} c={c} />
              {protein ? <Protein x={ax} transport={spec.transport} c={c} /> : null}
              <Particles
                n={o}
                region={OUT}
                seed={7}
                clear={clear}
                fill={url(ids.solute)}
                faded={!bothKnown}
                c={c}
              />
              <Particles
                n={i}
                region={IN}
                seed={19}
                clear={clear}
                fill={url(ids.solute)}
                faded={!bothKnown}
                c={c}
              />
              <FlowArrow x={ax} flow={flow} water={water} faded={!bothKnown} c={c} />
              {Array.from({ length: moved }, (_, k) => {
                // Two columns beside the arrow, from the membrane toward where they go.
                const side = k % 2 ? 1 : -1;
                const row = Math.floor(k / 2);
                const y = flow === 'out' ? HEAD_BOTTOM - 8 - row * 12 : HEAD_TOP + 8 + row * 12;
                return (
                  <Circle
                    key={k}
                    cx={ax + side * 13}
                    cy={y}
                    r={5}
                    fill={url(ids.lit)}
                    stroke={c.chartInk}
                    strokeWidth={0.8}
                  />
                );
              })}
              {spec.transport === 'active' ? <AtpChip x={ax} n={atp} c={c} /> : null}
              <SideLabel
                y={17}
                left="Outside the cell"
                right={countText(spec.outside, water ? 'solute' : name)}
                c={c}
              />
              <SideLabel
                y={H - 12}
                left="Inside the cell"
                right={countText(spec.inside, water ? 'solute' : name)}
                c={c}
              />
            </G>
          </Svg>
        )}
      </Canvas>
      <Caption>{captionOf(spec, o, i, flow, bothKnown, moved, name, rep)}</Caption>
    </>
  );
}

function captionOf(
  spec: MembraneSpec,
  o: number,
  i: number,
  flow: Flow,
  known: boolean,
  moved: number,
  name: string,
  rep: ReturnType<typeof useRep>,
): string {
  if (!known) return 'Type the counts on each side to see which way they move.';
  const gradient = spec.gradient && rep.known(spec.gradient) ? ` ${rep.named(spec.gradient)}.` : '';
  const crossing = moved ? ` ${moved} crossing now.` : '';
  switch (spec.transport) {
    case 'diffusion':
    case 'facilitated': {
      const how = spec.transport === 'facilitated' ? ' through the channel protein' : '';
      if (flow === 'both')
        return `${o} ${name} on each side: they cross both ways at the same rate${how}, so there is no net movement.${gradient}`;
      return `${o} ${name} outside, ${i} inside: they diffuse ${flow === 'in' ? 'into' : 'out of'} the cell${how}, from high to low concentration.${gradient}${crossing}`;
    }
    case 'osmosis':
      if (flow === 'both')
        return `Solute ${o} outside and ${i} inside: isotonic, so water crosses both ways equally.${gradient}`;
      return `Solute ${o} outside, ${i} inside: the outside is ${flow === 'out' ? 'hypertonic' : 'hypotonic'}, so water moves ${flow === 'out' ? 'out of' : 'into'} the cell through the aquaporin, toward more solute.${gradient}`;
    case 'active': {
      const [from, to] = flow === 'out' ? ['inside', 'outside'] : ['outside', 'inside'];
      const [lo, hi] = flow === 'out' ? [i, o] : [o, i];
      if (flow === 'both')
        return `${o} ${name} on each side: the pump still moves them, using ATP.${crossing}`;
      return `The pump carries ${name} from ${from} (${lo}) to ${to} (${hi}): low to high, against the gradient, so it uses ATP.${gradient}${crossing}`;
    }
  }
}

/** Two rows of phospholipids: round heads facing the water, two tails each pointing in. */
function Bilayer({ skip, head, c }: { skip?: [number, number]; head: string; c: Palette }) {
  const xs = Array.from({ length: 30 }, (_, k) => 6 + k * 12).filter(
    (x) => !skip || x < skip[0] || x > skip[1],
  );
  const tails = (x: number, y0: number, dir: 1 | -1) => (
    <G>
      {[-2.2, 2.2].map((dx) => (
        <Path
          key={dx}
          d={`M ${x + dx} ${y0} q ${dx * 0.6} ${dir * 8} 0 ${dir * 18}`}
          stroke={c.bioTail}
          strokeWidth={2.4}
          strokeLinecap="round"
          fill="none"
        />
      ))}
    </G>
  );
  return (
    <G>
      {xs.map((x) => (
        <G key={x}>
          {tails(x, HEAD_TOP + 4, 1)}
          {tails(x, HEAD_BOTTOM - 4, -1)}
        </G>
      ))}
      {xs.map((x) => (
        <G key={`h${x}`}>
          <Circle cx={x} cy={HEAD_TOP} r={5.5} fill={head} stroke={c.chartInk} strokeWidth={0.6} />
          <Circle
            cx={x}
            cy={HEAD_BOTTOM}
            r={5.5}
            fill={head}
            stroke={c.chartInk}
            strokeWidth={0.6}
          />
        </G>
      ))}
    </G>
  );
}

/** A channel (two halves round a pore), an aquaporin (a narrower pore) or a pump. */
function Protein({
  x,
  transport,
  c,
}: {
  x: number;
  transport: MembraneSpec['transport'];
  c: Palette;
}) {
  const top = HEAD_TOP - 12;
  const bottom = HEAD_BOTTOM + 12;
  const pore = transport === 'osmosis' ? 6 : transport === 'active' ? 0 : 12;
  const half = 20;
  const body = (x0: number, width: number, key: string) => (
    <Rect
      key={key}
      x={x0}
      y={top}
      width={width}
      height={bottom - top}
      rx={width / 2.2}
      fill={c.bioProtein}
      stroke={c.bioProteinEdge}
      strokeWidth={chart.strokeLight}
    />
  );
  if (transport === 'active') {
    // One pump: a body with a pocket that opens to one side, the particle's way through.
    return (
      <G>
        {body(x - 26, 52, 'pump')}
        <Rect
          x={x - 6}
          y={top + 14}
          width={12}
          height={bottom - top - 28}
          rx={6}
          fill={c.card}
          opacity={0.7}
        />
      </G>
    );
  }
  return (
    <G>
      {body(x - pore / 2 - half, half, 'l')}
      {body(x + pore / 2, half, 'r')}
    </G>
  );
}

/** The arrow through the membrane: down (in), up (out) or both ways. Water in blue. */
function FlowArrow({
  x,
  flow,
  water,
  faded,
  c,
}: {
  x: number;
  flow: Flow;
  water: boolean;
  faded: boolean;
  c: Palette;
}) {
  const color = water ? c.waterDeep : c.chartInk;
  const arrow = (x0: number, down: boolean, key: string) => {
    const [a, b] = down ? [OUT[0] + 30, IN[1] - 30] : [IN[1] - 30, OUT[0] + 30];
    const s = down ? 1 : -1;
    return (
      <G key={key}>
        <Line x1={x0} y1={a} x2={x0} y2={b} stroke={c.card} strokeWidth={7} opacity={0.8} />
        <Line x1={x0} y1={a} x2={x0} y2={b} stroke={color} strokeWidth={chart.strokeHeavy} />
        <Path
          d={`M ${x0 - 7} ${b - s * 10} L ${x0} ${b} L ${x0 + 7} ${b - s * 10}`}
          stroke={color}
          strokeWidth={chart.strokeHeavy}
          strokeLinejoin="round"
          strokeLinecap="round"
          fill="none"
        />
      </G>
    );
  };
  return (
    <G opacity={faded ? 0.35 : 1}>
      {flow === 'both'
        ? [arrow(x - 6, true, 'd'), arrow(x + 6, false, 'u')]
        : arrow(x, flow === 'in', 'a')}
      {water ? (
        <ChartText
          x={x - 30}
          y={(OUT[0] + IN[1]) / 2 - 36}
          fontSize={chart.label}
          fontWeight="700"
          textAnchor="end"
          fill={c.waterDeep}
        >
          water
        </ChartText>
      ) : null}
    </G>
  );
}

/** The particles on one side, at fixed places in a grid clear of the arrow. */
function Particles({
  n,
  region,
  seed,
  clear,
  fill,
  faded,
  c,
}: {
  n: number;
  region: [number, number];
  seed: number;
  clear: [number, number, number, number][];
  fill: string;
  faded: boolean;
  c: Palette;
}) {
  const cells: [number, number][] = [];
  for (let r = 0; r < 4; r++)
    for (let k = 0; k < 14; k++) {
      const x = 16 + k * 25;
      const y = region[0] + 11 + r * 21;
      if (clear.some(([x0, y0, x1, y1]) => x > x0 && x < x1 && y > y0 - 8 && y < y1 + 8)) continue;
      cells.push([x, y]);
    }
  const order = shuffled(cells.length, seed);
  return (
    <G opacity={faded ? 0.35 : 1}>
      {order.slice(0, n).map((cell, k) => {
        const [x, y] = cells[cell]!;
        const [jx, jy] = jitter(k, seed);
        return (
          <Circle
            key={k}
            cx={x + jx * 5}
            cy={y + jy * 4}
            r={5}
            fill={fill}
            stroke={c.chartInk}
            strokeWidth={0.6}
          />
        );
      })}
    </G>
  );
}

/** ATP spent at the pump: "2 ATP → 2 ADP + 2 P" on the cytoplasm side. */
function AtpChip({ x, n, c }: { x: number; n: number | undefined; c: Palette }) {
  const k = n === undefined ? '' : `${n} `;
  const text = `${k}ATP → ${k}ADP + ${k}P`;
  const tw = text.length * chart.label * 0.6;
  const cx = Math.min(W - tw / 2 - 12, x - 10);
  return (
    <G>
      <Rect
        x={cx - tw / 2 - 8}
        y={194}
        width={tw + 16}
        height={22}
        rx={11}
        fill={c.bioAtp}
        stroke={c.chartInk}
        strokeWidth={1}
      />
      <ChartText
        x={cx}
        y={209}
        fontSize={chart.label}
        fontWeight="700"
        textAnchor="middle"
        fill={c.bioInk}
      >
        {text}
      </ChartText>
    </G>
  );
}

function SideLabel({ y, left, right, c }: { y: number; left: string; right: string; c: Palette }) {
  return (
    <G>
      <ChartText x={8} y={y} fontSize={chart.label} fontWeight="700" fill={c.chartInk}>
        {left}
      </ChartText>
      <ChartText
        x={W - 8}
        y={y}
        fontSize={chart.value}
        fontWeight="700"
        textAnchor="end"
        fill={c.chartInk}
      >
        {right}
      </ChartText>
    </G>
  );
}
