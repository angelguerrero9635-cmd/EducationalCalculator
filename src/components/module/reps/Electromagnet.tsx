import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Path, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import { FieldLines, startsFromPole } from '../layouts/figures8';
import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, fitLabel, useRep } from './common';
import { Sheen, usePaintIds, url } from './paint';
import { BatteryFlat } from './physicsArt';

type Spec = Extract<Representation, { kind: 'electromagnet' }>;
/** Pixels of vertical drag per step of the current. */
const PX_PER_STEP = 8;
/** Loops drawn at most; more turns are drawn this many, closer together, and labelled. */
const MAX_DRAWN = 40;

/**
 * An electromagnet (Grade 8): copper wire wound round an iron nail, a battery driving a current
 * through it, and the field lines round the nail, more of them for more turns × current. The
 * nail's point is its north pole (red), its head the south (blue); paper clips hang from the
 * point. Drag the coil's end to wind more turns, the battery for more current.
 */
export function Electromagnet({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('nail', 'battery');
  const start = useRef(0);
  const nVar = rep.variable(spec.turns);
  const iVar = rep.variable(spec.current);
  const N = Math.max(0, Math.round(rep.val(spec.turns)));
  const I = Math.max(0, rep.val(spec.current));
  const known = rep.known(spec.turns) && rep.known(spec.current);
  // Strength as a share of the strongest the values allow: the field lines follow it.
  const most = (nVar.max ?? 2 * N) * (iVar.max ?? 2 * I);
  const share = known && most > 0 ? Math.min(1, (N * I) / most) : 0;
  const perSide = share > 0 ? Math.max(1, Math.round(6 * share)) : 0;
  const clips = spec.clips ? Math.min(24, Math.max(0, Math.round(rep.val(spec.clips)))) : 0;
  const drawn = Math.min(Math.max(N, 1), MAX_DRAWN);

  return (
    <View>
      <Canvas aspect={(w) => 250 / w}>
        {({ w, h }) => {
          const y = 84;
          const headX = 22;
          const tipX = w - 96;
          const cx0 = 62;
          const cx1 = tipX - 34;
          const pitch = (cx1 - cx0) / drawn;
          const wireW = Math.max(1.2, Math.min(2.6, pitch * 0.55));
          const batY = 206;
          const batX = (cx0 + cx1) / 2;
          const nx = tipX + 8;
          const sx = headX + 10;
          const poles = [
            { x: nx, y, q: 1 },
            { x: sx, y, q: -1 },
          ];
          const solids = [{ x0: headX - 2, y0: y - 14, x1: tipX + 18, y1: y + 14 }];
          const starts = perSide ? startsFromPole(nx, y, Math.PI, perSide, [sx, y]) : [];
          const lead = {
            stroke: c.copper,
            strokeWidth: 2.4,
            fill: 'none' as const,
            strokeLinejoin: 'round' as const,
          };
          return (
            <>
              <Svg width={w} height={h}>
                <Defs>
                  <Sheen id={ids.nail} vertical />
                  <Sheen id={ids.battery} vertical />
                </Defs>
                <FieldLines
                  poles={poles}
                  starts={starts}
                  box={{ x0: -w, y0: -h, x1: 2 * w, y1: batY - 30 }}
                  solids={solids}
                  view={{ x0: 4, y0: 4, x1: w - 4, y1: batY - 40 }}
                />
                {/* Leads from the coil's ends down to the battery. */}
                <Path d={`M ${cx0} ${y + 7} V ${batY} H ${batX - 36}`} {...lead} />
                <Path d={`M ${cx1} ${y + 7} V ${batY} H ${batX + 36}`} {...lead} />
                {/* The coil's back halves, behind the nail. */}
                <G opacity={rep.known(spec.turns) ? 1 : 0.45}>
                  {Array.from({ length: drawn }, (_, i) => (
                    <Path
                      key={i}
                      d={`M ${cx0 + i * pitch} ${y + 7} L ${cx0 + (i + 0.5) * pitch} ${y - 7}`}
                      stroke={c.copperDark}
                      strokeWidth={wireW}
                      strokeLinecap="round"
                    />
                  ))}
                </G>
                {/* The iron nail: head, shank and point. */}
                <Rect x={headX} y={y - 13} width={7} height={26} rx={2} fill={c.silver} />
                <Path
                  d={`M ${headX + 7} ${y - 5} H ${tipX} L ${tipX + 18} ${y} L ${tipX} ${y + 5} H ${headX + 7} Z`}
                  fill={c.silver}
                />
                <Rect
                  x={headX}
                  y={y - 13}
                  width={7}
                  height={26}
                  rx={2}
                  fill={url(ids.nail)}
                  stroke={c.silverDark}
                />
                <Path
                  d={`M ${headX + 7} ${y - 5} H ${tipX} L ${tipX + 18} ${y} L ${tipX} ${y + 5} H ${headX + 7} Z`}
                  fill={url(ids.nail)}
                  stroke={c.silverDark}
                />
                {/* The coil's front halves. */}
                <G opacity={rep.known(spec.turns) ? 1 : 0.45}>
                  {Array.from({ length: drawn }, (_, i) => (
                    <Path
                      key={i}
                      d={`M ${cx0 + (i + 0.5) * pitch} ${y - 7} L ${cx0 + (i + 1) * pitch} ${y + 7}`}
                      stroke={c.copper}
                      strokeWidth={wireW}
                      strokeLinecap="round"
                    />
                  ))}
                </G>
                <ChartText
                  {...fitLabel((cx0 + cx1) / 2, turnsText(), chart.value, w)}
                  y={y - 22}
                  fontSize={chart.value}
                  fontWeight="700"
                  opacity={rep.known(spec.turns) ? 1 : 0.45}
                >
                  {turnsText()}
                </ChartText>

                {/* The poles, once a current flows: N at the point, S at the head. */}
                {share > 0 ? (
                  <>
                    <Pole x={tipX + 30} y={y - 16} letter="N" fill={c.poleNorth} />
                    <Pole x={headX + 3} y={y - 26} letter="S" fill={c.poleSouth} />
                  </>
                ) : null}

                {/* Paper clips hanging from the point in chains of up to six. */}
                {Array.from({ length: clips }, (_, k) => {
                  const chain = Math.floor(k / 6);
                  const link = k % 6;
                  const x = tipX + 10 + chain * 13 - (chain ? 0 : 0);
                  const top = y + 4 + link * 13;
                  return (
                    <Rect
                      key={k}
                      x={x - 3.5}
                      y={top}
                      width={7}
                      height={15}
                      rx={3.5}
                      fill="none"
                      stroke={c.silverDark}
                      strokeWidth={1.6}
                      transform={`rotate(${(link % 2 ? 8 : -8) + chain * 6} ${x} ${top})`}
                    />
                  );
                })}
                {spec.clips ? (
                  <ChartText
                    {...fitLabel(tipX + 30, rep.label(spec.clips), chart.small, w)}
                    y={y + 96}
                    fontSize={chart.small}
                    fontWeight="600"
                    opacity={rep.known(spec.clips) ? 1 : 0.45}
                  >
                    {rep.label(spec.clips)}
                  </ChartText>
                ) : null}

                {/* The battery, + on the left. */}
                <BatteryFlat
                  left={batX - 32}
                  y={batY}
                  length={64}
                  sheen={ids.battery}
                  faded={!rep.known(spec.current)}
                />
                <ChartText
                  {...fitLabel(batX, rep.label(spec.current), chart.value, w)}
                  y={batY + 32}
                  fontSize={chart.value}
                  fontWeight="700"
                  fill={c.chartHighlight}
                  opacity={rep.known(spec.current) ? 1 : 0.45}
                >
                  {rep.label(spec.current)}
                </ChartText>
              </Svg>
              <DragHandle
                testID="drag-turns"
                x={cx1}
                y={y}
                label={nVar.name}
                onStart={() => {
                  start.current = rep.shown(spec.turns);
                }}
                onMove={(dx) => {
                  // Across the coil's length sweeps the whole range of turns.
                  const range = (nVar.max ?? 100) - (nVar.min ?? 1);
                  calc.set(
                    {
                      ...rep.pin([spec.current]),
                      [spec.turns]: rep.snapTo(
                        spec.turns,
                        start.current + (dx / (cx1 - cx0)) * range,
                      ),
                    },
                    rep.slide(spec.turns),
                  );
                }}
              />
              <DragHandle
                testID="drag-current"
                x={batX}
                y={batY}
                label={iVar.name}
                onStart={() => {
                  start.current = rep.shown(spec.current);
                }}
                onMove={(_, dy) => {
                  const step = iVar.step ?? 0.1;
                  calc.set(
                    {
                      ...rep.pin([spec.turns]),
                      [spec.current]: rep.snapTo(
                        spec.current,
                        (start.current - (dy / PX_PER_STEP) * step) * rep.factor(spec.current),
                      ),
                    },
                    rep.slide(spec.current),
                  );
                }}
              />
            </>
          );
        }}
      </Canvas>
      <Caption>{caption()}</Caption>
    </View>
  );

  function turnsText() {
    const t = rep.label(spec.turns);
    return N > MAX_DRAWN && rep.known(spec.turns) ? `${t} (${MAX_DRAWN} drawn)` : t;
  }

  /** Strength follows turns × current, worked with every number. */
  function caption(): string {
    const sym = (id: string) => (rep.words ? rep.variable(id).name : rep.variable(id).symbol);
    const [Ns, Is] = [sym(spec.turns), sym(spec.current)];
    const [Nv, Iv] = [rep.value(spec.turns, false), rep.value(spec.current)];
    const rule = 'The strength follows turns × current.';
    const work = spec.strength
      ? `${sym(spec.strength)} = ${Ns} × ${Is} = ${Nv} × ${Iv} = ${rep.value(spec.strength)}`
      : `${Ns} × ${Is} = ${Nv} × ${Iv} = ${known ? formatNumber(N * I) : '?'} amp-turns`;
    const held = spec.clips ? ` · ${rep.named(spec.clips)}` : '';
    return `${rule} · ${work}${held}`;
  }
}

/** A pole's letter in a colored disc. */
function Pole({ x, y, letter, fill }: { x: number; y: number; letter: string; fill: string }) {
  const c = usePalette();
  return (
    <G>
      <Circle cx={x} cy={y} r={10} fill={fill} />
      <ChartText
        x={x}
        y={y + 4.5}
        fontSize={chart.value}
        fontWeight="700"
        fill={c.onBlock}
        textAnchor="middle"
      >
        {letter}
      </ChartText>
    </G>
  );
}
