import { useRef, useState, type ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { EnergyTrackSpec } from '@/data/modules/typesMechanics';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import {
  Canvas,
  Caption,
  ChartText,
  DragHandle,
  niceCeil,
  nowrap,
  useFrozen,
  useRep,
} from './common';
import { Chip } from './graphKit';
import { Ball, FloorShadow, Metal, Sheen, url, usePaintIds } from './paint';
import { pieceOf, trackAt, trackY } from './track';

/** The pendulum's release angle: the bob is let go this far from straight down. */
const SWING = (50 * Math.PI) / 180;

/**
 * A roller coaster car on its track, or a pendulum bob on its string, at `height` above the
 * lowest point, with bars for the potential and kinetic energy and their total. Drag the car
 * along the track or the bob along its swing: the potential energy turns into kinetic energy
 * on the way down, and the total stays the same.
 */
export function EnergyTrack({ spec, calc }: { spec: EnergyTrackSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const paint = usePaintIds('car', 'hub', 'bob', 'rail');
  const g = spec.g ?? 9.8;
  const num = (x: number | string | undefined) =>
    x === undefined ? undefined : typeof x === 'number' ? x : rep.val(x);
  const knownOf = (x: number | string | undefined) =>
    x === undefined || typeof x === 'number' || rep.known(x);
  // Energies and heights in formula units (J, m, kg).
  const h = rep.val(spec.height);
  const pe = rep.val(spec.potential);
  const ke = rep.val(spec.kinetic);
  const mass = num(spec.mass);
  const total = num(spec.total) ?? pe + ke;
  // The release height: given, or the height the total energy would lift the mass to.
  const top = num(spec.top) ?? (mass && mass > 0 ? total / (mass * g) : Math.max(h, 1e-9) * 1.25);
  const scale = useFrozen({
    top: Math.max(top, h, 1e-9),
    energy: niceCeil(Math.max(total, pe + ke, pe, ke, 1e-9)),
  });
  // Where the car is (u along the track) or the bob's side, kept while dragging.
  const [u, setU] = useState<number | undefined>(undefined);
  const [side, setSide] = useState<1 | -1>(-1);
  const start = useRef({ u: 0, angle: 0 });
  const frac = h / scale.value.top;
  const carU =
    u !== undefined && Math.abs(trackY(u) - frac) < 0.02
      ? u
      : trackAt(frac, u === undefined ? 1 : pieceOf(u));
  // Only the typed ones hold: a worked-out E (from m and the top) follows them, and pinning it
  // would make E typed and m worked out from it.
  const pins = [spec.mass, spec.top, spec.total].filter((x): x is string => typeof x === 'string');
  const setHeight = (x: number) =>
    calc.set(
      { ...rep.pinTyped(pins), [spec.height]: rep.snapTo(spec.height, Math.max(0, x)) },
      rep.slide(spec.height),
    );
  const hKnown = rep.known(spec.height);
  const sym = (id: string) => rep.variable(id).symbol;
  const E = (x: number) =>
    `${formatNumber(Math.round(x * 1000) / 1000)} ${rep.unit(spec.potential) ?? 'J'}`;

  return (
    <View>
      <Canvas aspect={0.72}>
        {({ w, h: ch }) => {
          const ground = ch - 26;
          const sceneW = w * 0.66;
          const barsX = sceneW + 10;
          // ── The scene ──
          let scene: ReactNode;
          let handle: { x: number; y: number; onStart: () => void; onMove: (dx: number) => void };
          let marker: { x: number; y: number; base: number };
          if (spec.track === 'coaster') {
            const tx0 = 10;
            const tw = sceneW - 16;
            const tTop = 34;
            const per = (ground - tTop - 8) / scale.value.top; // px per meter
            const X = (uu: number) => tx0 + uu * tw;
            const Y = (uu: number) => ground - 8 - trackY(uu) * scale.value.top * per;
            const pts = Array.from({ length: 81 }, (_, i) => i / 80);
            const d = pts
              .map((uu, i) => `${i ? 'L' : 'M'} ${X(uu).toFixed(1)} ${Y(uu).toFixed(1)}`)
              .join(' ');
            const cx = X(carU);
            const cy = Y(carU);
            const du = 0.01;
            const ang =
              (Math.atan2(Y(carU + du) - Y(carU - du), X(carU + du) - X(carU - du)) * 180) /
              Math.PI;
            const topY = ground - 8 - top * per;
            scene = (
              <G>
                {/* Supports: metal posts down to the ground. */}
                {Array.from({ length: 13 }, (_, i) => (i + 0.5) / 13).map((uu) => (
                  <Line
                    key={uu}
                    x1={X(uu)}
                    y1={Y(uu) + 3}
                    x2={X(uu)}
                    y2={ground}
                    stroke={c.metalDark}
                    strokeWidth={1.5}
                    opacity={0.6}
                  />
                ))}
                <Path
                  d={d}
                  stroke={c.metalDark}
                  strokeWidth={6}
                  fill="none"
                  strokeLinejoin="round"
                />
                <Path d={d} stroke={c.metal} strokeWidth={2.5} fill="none" strokeLinejoin="round" />
                {/* The release height, dashed. */}
                <Line
                  x1={tx0}
                  y1={topY}
                  x2={sceneW}
                  y2={topY}
                  stroke={c.chartMuted}
                  strokeDasharray={chart.dashFine}
                  opacity={knownOf(spec.top) ? 1 : 0.4}
                />
                <ChartText x={X(0.13)} y={topY - 6} fontSize={chart.tiny} fill={c.chartMuted}>
                  {spec.top !== undefined && typeof spec.top === 'string'
                    ? `top: ${rep.label(spec.top)}`
                    : `top: ${formatNumber(Math.round(top * 1000) / 1000)} m`}
                </ChartText>
                {/* The car, tilted with the track, lit from the top left. */}
                <G transform={`translate(${cx} ${cy}) rotate(${ang})`} opacity={hKnown ? 1 : 0.4}>
                  <Rect
                    x={-15}
                    y={-21}
                    width={30}
                    height={14}
                    rx={4}
                    fill={c.blockRed}
                    stroke={c.chartInk}
                    strokeWidth={0.8}
                  />
                  <Rect x={-15} y={-21} width={30} height={14} rx={4} fill={url(paint.car)} />
                  <Rect x={-9} y={-27} width={4} height={7} rx={1.5} fill={c.rubber} />
                  <Circle cx={-9} cy={-6} r={4} fill={c.rubber} />
                  <Circle cx={9} cy={-6} r={4} fill={c.rubber} />
                  <Circle cx={-9} cy={-6} r={1.8} fill={url(paint.hub)} />
                  <Circle cx={9} cy={-6} r={1.8} fill={url(paint.hub)} />
                </G>
              </G>
            );
            marker = { x: cx, y: cy - 4, base: ground - 8 };
            handle = {
              x: cx,
              y: cy - 14,
              onStart: () => {
                start.current.u = carU;
                scale.freeze();
              },
              onMove: (dx) => {
                const next = Math.min(0.99, Math.max(0.1, start.current.u + dx / tw));
                setU(next);
                setHeight(trackY(next) * scale.value.top);
              },
            };
          } else {
            const px = sceneW / 2;
            // As long as the scene's width allows, hung so the lowest point sits on the ground.
            const L = Math.min(ground - 40, (sceneW / 2 - 16) / Math.sin(SWING));
            const r = Math.max(9, L * 0.08);
            const py = ground - 6 - r - L;
            const drop = L * (1 - Math.cos(SWING));
            const per = drop / scale.value.top;
            const low = py + L;
            const cosA = Math.min(1, Math.max(-1, 1 - (h * per) / L));
            const angle = side * Math.acos(cosA);
            const bx = px + L * Math.sin(angle);
            const by = py + L * Math.cos(angle);
            const topA = Math.acos(Math.min(1, Math.max(-1, 1 - (top * per) / L)));
            const arc = (a: number) => `${px + L * Math.sin(a)} ${py + L * Math.cos(a)}`;
            scene = (
              <G>
                {/* The swing's path and the release point, faded. */}
                <Path
                  d={`M ${arc(-topA)} A ${L} ${L} 0 0 0 ${arc(topA)}`}
                  stroke={c.chartGrid}
                  strokeWidth={chart.strokeLight}
                  strokeDasharray={chart.dash}
                  fill="none"
                />
                <Line
                  x1={px}
                  y1={py}
                  x2={px + L * Math.sin(-topA)}
                  y2={py + L * Math.cos(topA)}
                  stroke={c.chartMuted}
                  strokeDasharray={chart.dashFine}
                  opacity={0.6}
                />
                <Circle
                  cx={px + L * Math.sin(-topA)}
                  cy={py + L * Math.cos(topA)}
                  r={r}
                  fill={c.metal}
                  stroke={c.metalDark}
                  strokeDasharray={chart.dashFine}
                  opacity={0.45}
                />
                <Line
                  x1={0}
                  y1={py + L * Math.cos(topA)}
                  x2={sceneW}
                  y2={py + L * Math.cos(topA)}
                  stroke={c.chartMuted}
                  strokeDasharray={chart.dashFine}
                  opacity={knownOf(spec.top) ? 1 : 0.4}
                />
                <Chip
                  x={px}
                  y={py + L * Math.cos(topA) + 14}
                  text={
                    typeof spec.top === 'string'
                      ? `let go: ${rep.label(spec.top)}`
                      : `let go: ${formatNumber(Math.round(top * 1000) / 1000)} m`
                  }
                  w={sceneW}
                  h={ch}
                  size={chart.tiny}
                  color={c.chartMuted}
                  bold={false}
                />
                {/* The lowest point. */}
                <Line x1={0} y1={low + r} x2={sceneW} y2={low + r} stroke={c.chartGrid} />
                {/* The support bar, string and bob. */}
                <Rect
                  x={px - 28}
                  y={py - 8}
                  width={56}
                  height={6}
                  rx={2}
                  fill={c.wood}
                  stroke={c.woodDark}
                />
                <G opacity={hKnown ? 1 : 0.4}>
                  <Line x1={px} y1={py} x2={bx} y2={by} stroke={c.chartInk} strokeWidth={1.2} />
                  <Circle
                    cx={bx}
                    cy={by}
                    r={r}
                    fill={url(paint.bob)}
                    stroke={c.metalDark}
                    strokeWidth={0.8}
                  />
                </G>
                <Circle cx={px} cy={py} r={2.5} fill={c.metalDark} />
              </G>
            );
            marker = { x: bx, y: by + r, base: low + r };
            handle = {
              x: bx,
              y: by,
              onStart: () => {
                start.current.angle = angle;
                scale.freeze();
              },
              onMove: (dx) => {
                const a = Math.max(
                  -SWING * 1.1,
                  Math.min(SWING * 1.1, start.current.angle + dx / L),
                );
                setSide(a >= 0 ? 1 : -1);
                setHeight((L * (1 - Math.cos(a))) / per);
              },
            };
          }
          // ── The energy bars (flat) ──
          const bw = Math.min(28, (w - barsX - 12) / 3 - 8);
          const gap = (w - barsX - 3 * bw) / 3;
          const barTop = 30;
          const bh = (x: number) => (Math.max(0, x) / scale.value.energy) * (ground - barTop);
          const bars = [
            {
              name: 'PE',
              parts: [{ v: pe, color: c.chartSecond }],
              known: rep.known(spec.potential),
              text: rep.value(spec.potential),
            },
            {
              name: 'KE',
              parts: [{ v: ke, color: c.chartHighlight }],
              known: rep.known(spec.kinetic),
              text: rep.value(spec.kinetic),
            },
            {
              name: 'Total',
              parts: [
                { v: pe, color: c.chartSecond },
                { v: ke, color: c.chartHighlight },
              ],
              known: knownOf(spec.total) && rep.known(spec.potential) && rep.known(spec.kinetic),
              text: typeof spec.total === 'string' ? rep.value(spec.total) : E(total),
            },
          ];
          return (
            <>
              <Svg width={w} height={ch}>
                <Defs>
                  <Sheen id={paint.car} vertical />
                  <Metal id={paint.hub} light={c.metal} dark={c.metalDark} />
                  <Ball id={paint.bob} color={c.metal} />
                </Defs>
                {spec.track === 'coaster' ? (
                  <G>
                    <Rect x={0} y={ground} width={sceneW} height={4} fill={c.soil} />
                    <FloorShadow cx={sceneW / 2} cy={ground + 2} rx={sceneW / 2.2} ry={2} />
                  </G>
                ) : null}
                {scene}
                {/* The height above the lowest point. */}
                {marker.base - marker.y > 6 ? (
                  <G opacity={hKnown ? 1 : 0.4}>
                    <Line
                      x1={marker.x}
                      y1={marker.y}
                      x2={marker.x}
                      y2={marker.base}
                      stroke={c.chartInk}
                      strokeDasharray={chart.dashFine}
                    />
                    <Chip
                      x={marker.x + 6}
                      y={(marker.y + marker.base) / 2 + 4}
                      text={rep.label(spec.height)}
                      anchor="start"
                      w={sceneW}
                      h={ch}
                      size={chart.tiny}
                    />
                  </G>
                ) : null}
                <Line
                  x1={barsX - 4}
                  y1={ground}
                  x2={w - 2}
                  y2={ground}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                />
                {bars.map((b, i) => {
                  const x = barsX + gap / 2 + i * (bw + gap);
                  let y = ground;
                  return (
                    <G key={b.name}>
                      {b.name === 'Total' && typeof spec.total !== 'undefined' ? (
                        <Line
                          x1={x - 4}
                          y1={ground - bh(total)}
                          x2={x + bw + 4}
                          y2={ground - bh(total)}
                          stroke={c.chartInk}
                          strokeWidth={chart.stroke}
                          opacity={b.known ? 1 : 0.4}
                        />
                      ) : null}
                      {b.parts.map((p, k) => {
                        const hh = bh(p.v);
                        y -= hh;
                        return (
                          <Rect
                            key={k}
                            x={x}
                            y={y}
                            width={bw}
                            height={hh}
                            fill={p.color}
                            opacity={b.known ? 1 : 0.35}
                          />
                        );
                      })}
                      <ChartText
                        x={x + bw / 2}
                        y={ground + 14}
                        textAnchor="middle"
                        fontSize={chart.small}
                        fontWeight="700"
                      >
                        {b.name}
                      </ChartText>
                      <ChartText
                        x={x + bw / 2}
                        y={Math.min(y, ground - (b.name === 'Total' ? bh(total) : 0)) - 5}
                        textAnchor="middle"
                        fontSize={chart.tiny}
                        fill={c.chartMuted}
                      >
                        {b.known ? b.text.replace(/ J$/, '') : '?'}
                      </ChartText>
                    </G>
                  );
                })}
                <ChartText
                  x={w - 4}
                  y={14}
                  textAnchor="end"
                  fontSize={chart.tiny}
                  fill={c.chartMuted}
                >
                  {`Energy (${rep.unit(spec.potential) ?? 'J'})`}
                </ChartText>
              </Svg>
              {hKnown ? (
                <DragHandle
                  testID="drag-height"
                  x={handle.x}
                  y={handle.y}
                  label={rep.variable(spec.height).name}
                  onStart={handle.onStart}
                  onMove={handle.onMove}
                  onEnd={scale.release}
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>
        {[
          `${sym(spec.potential)} + ${sym(spec.kinetic)} = ${nowrap(rep.value(spec.potential))} + ${nowrap(rep.value(spec.kinetic))} = ${typeof spec.total === 'string' ? rep.value(spec.total) : E(total)}`,
          ...(spec.mass !== undefined
            ? [
                `${sym(spec.potential)} = ${massSym()} × g × ${sym(spec.height)} = ${massText()} × ${g} N/kg × ${rep.value(spec.height)} = ${rep.value(spec.potential)}`,
              ]
            : []),
          ...(spec.mass !== undefined && spec.speed
            ? [
                `${sym(spec.kinetic)} = 1/2 × ${massSym()} × ${sym(spec.speed)}² = 1/2 × ${massText()} × (${rep.value(spec.speed)})² = ${rep.value(spec.kinetic)}`,
              ]
            : []),
          'Going down, potential energy turns into kinetic energy; the total stays the same',
        ].join(' · ')}
      </Caption>
    </View>
  );

  function massSym() {
    return typeof spec.mass === 'string' ? sym(spec.mass) : 'm';
  }

  function massText() {
    return typeof spec.mass === 'string' ? rep.value(spec.mass) : `${spec.mass} kg`;
  }
}
