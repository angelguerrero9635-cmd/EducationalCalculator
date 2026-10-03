/**
 * HC132 `electrodeArray` (typesHe4g.ts), a new kind for geophysical imaging: a Wenner survey.
 * Four steel electrodes a apart in a line, current I driven in at C₁ and out at C₂ (an ammeter
 * on the battery's wires), the current's paths through the ground as arcs from C₁ to C₂ and the
 * equipotentials across them (those through P₁ and P₂ lit), a voltmeter reading V across P₁ and
 * P₂, and the ground the survey samples, to about a ÷ 2 deep, shaded. ρ_a = 2πaV ÷ I. Drag C₂
 * to spread the array (the scale holds while dragging).
 */
import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { ElectrodeArraySpec } from '@/data/modules/typesHe4g';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, useFrozen } from './common';
import { fmt, Tag } from './he2fKit';
import { useHe4g } from './he4gKit';
import { wennerOf } from './he4gMath';
import { Deepen, Metal, TopLight, url, usePaintIds } from './paint';

const BW = 360;
const BH = 336;
const CX = 180;
const SURF = 146;
const BOT = 328;
/** Pixels per metre is 80 ÷ a: the electrodes at ±40 and ±120 px. */
const PER_A = 80;

/** Segments of the contour φ = level over the ground (marching squares). */
function contour(phi: (x: number, y: number) => number, level: number, step = 4) {
  let d = '';
  for (let x = 0; x < BW; x += step)
    for (let y = SURF; y < BOT; y += step) {
      const corners: [number, number][] = [
        [x, y],
        [x + step, y],
        [x + step, y + step],
        [x, y + step],
      ];
      const v = corners.map(([a, b]) => phi(a, b) - level);
      const cross: [number, number][] = [];
      for (let i = 0; i < 4; i++) {
        const [a, b] = [v[i]!, v[(i + 1) % 4]!];
        if (a * b < 0 && Number.isFinite(a) && Number.isFinite(b)) {
          const t = a / (a - b);
          const [x0, y0] = corners[i]!;
          const [x1, y1] = corners[(i + 1) % 4]!;
          cross.push([x0 + (x1 - x0) * t, y0 + (y1 - y0) * t]);
        }
      }
      for (let i = 0; i + 1 < cross.length; i += 2)
        d += `M ${cross[i]![0].toFixed(1)} ${cross[i]![1].toFixed(1)} L ${cross[i + 1]![0].toFixed(1)} ${cross[i + 1]![1].toFixed(1)} `;
    }
  return d;
}

/** A meter: a painted case with its reading on a display. */
function Meter({
  x,
  y,
  w,
  text,
  name,
  ids,
}: {
  x: number;
  y: number;
  w: number;
  text: string;
  name: string;
  ids: { metal: string; light: string };
}) {
  const c = usePalette();
  return (
    <G>
      <Rect
        x={x - w / 2}
        y={y}
        width={w}
        height={30}
        rx={5}
        fill={url(ids.metal)}
        stroke={c.chartInk}
        strokeWidth={1}
      />
      <Rect x={x - w / 2} y={y} width={w} height={30} rx={5} fill={url(ids.light)} />
      <Rect x={x - w / 2 + 22} y={y + 5} width={w - 28} height={20} rx={3} fill={c.paper} />
      <ChartText
        x={x - w / 2 + 11}
        y={y + 20}
        fontSize={chart.value}
        fontWeight="800"
        textAnchor="middle"
      >
        {name}
      </ChartText>
      <Tag x={x + 11} y={y + 20} text={text} chip={false} w={BW} />
    </G>
  );
}

export function ElectrodeArray({ spec, calc }: { spec: ElectrodeArraySpec; calc: Calculator }) {
  const c = usePalette();
  const ids = usePaintIds('ground', 'stake', 'metal', 'light');
  const { rep, num, label, setOne, say } = useHe4g(calc);
  const start = useRef(0);
  const a = num(spec.spacing);
  const v = num(spec.voltage);
  const i = num(spec.current);
  const ok = a !== undefined && a > 0;
  const live = ok ? PER_A / a : 1;
  const frame = useFrozen(live);
  const m = frame.value;
  const X = (x: number) => CX + x * m;
  const D = (d: number) => SURF + d * m;
  const aa = a ?? 1;
  const elec = [-1.5, -0.5, 0.5, 1.5].map((f) => X(f * aa));
  const names = ['C₁', 'P₁', 'P₂', 'C₂'];
  const rOk = v !== undefined && i !== undefined && i > 0;
  const res = rOk ? v / i : undefined;
  const rho = ok && rOk ? wennerOf(aa, v, i) : undefined;
  // The current's paths: circles through C₁ and C₂ reaching depth D below the middle.
  const dd = 1.5 * aa;
  const arcs = [0.3, 0.6, 1, 1.5, 2.2].map((f) => {
    const depth = f * dd;
    const c0 = (depth * depth - dd * dd) / (2 * depth);
    const rad = Math.hypot(dd, c0) * m;
    return `M ${elec[0]!.toFixed(1)} ${SURF} A ${rad.toFixed(1)} ${rad.toFixed(1)} 0 ${c0 > 0 ? 1 : 0} 0 ${elec[3]!.toFixed(1)} ${SURF}`;
  });
  // The potential of the pair (in arbitrary units): 1 ÷ r₁ − 1 ÷ r₂, in pixels.
  const phi = (x: number, y: number) =>
    1 / Math.hypot(x - elec[0]!, y - SURF) - 1 / Math.hypot(x - elec[3]!, y - SURF);
  const atP = 1 / (2 * aa * m);
  const levels = [atP * 3.2, atP * 1.7, atP * 0.45, -atP * 0.45, -atP * 1.7, -atP * 3.2];
  const aVar = typeof spec.spacing === 'string' ? spec.spacing : undefined;
  const canDrag = !spec.fixed && ok && aVar !== undefined && rep.typed(aVar);
  const aText = label(spec.spacing, 'a', a, 'm');
  const vText = label(spec.voltage, 'V', v, 'V') ?? 'V = ?';
  const iText = label(spec.current, 'I', i, 'A') ?? 'I = ?';
  const rhoText = rho !== undefined ? label(spec.resistivity, 'ρ_a', rho, 'Ω·m') : undefined;
  const sampled = D(aa / 2);

  const lines: string[] = [];
  if (!ok) lines.push('Type the spacing to lay out the electrodes.');
  else if (!rOk) lines.push('Type the voltage and the current to read the ground.');
  else
    lines.push(
      `R = V ÷ I = ${say(spec.voltage, v)} ÷ ${say(spec.current, i)} = ${say(spec.resistance, res!)} Ω.`,
      `ρₐ = 2πaR = 2 × π × ${say(spec.spacing, aa)} × ${fmt(res!)} = ${say(spec.resistivity, rho!)} Ω·m.`,
      `The survey reads the ground down to about a ÷ 2 = ${fmt(aa / 2)} m; spread the electrodes to look deeper.`,
    );

  return (
    <View>
      <Canvas aspect={BH / BW}>
        {({ w, h }) => {
          const k = w / BW;
          return (
            <>
              <Svg width={w} height={h}>
                <Defs>
                  <Deepen id={ids.ground} from={c.he4gRock} to={c.he4gRockDark} />
                  <Metal id={ids.stake} light={c.metal} dark={c.metalDark} />
                  <Metal id={ids.metal} light={c.metal} dark={c.metalDark} />
                  <TopLight id={ids.light} />
                </Defs>
                <G transform={`scale(${k})`}>
                  <Rect x={0} y={0} width={BW} height={SURF} fill={c.airBand} />
                  <Rect x={0} y={SURF} width={BW} height={BH - SURF} fill={url(ids.ground)} />
                  {ok ? (
                    <G>
                      {/* The ground the survey samples: to about a ÷ 2. */}
                      <Rect
                        x={elec[0]!}
                        y={SURF}
                        width={elec[3]! - elec[0]!}
                        height={Math.min(BOT, sampled) - SURF}
                        fill={c.he4gSampled}
                      />
                      <Path
                        d={arcs.join(' ')}
                        stroke={c.he4gCurrent}
                        strokeWidth={1.6}
                        fill="none"
                      />
                      {levels.map((l) => (
                        <Path
                          key={l}
                          d={contour(phi, l)}
                          stroke={c.he4gOnGround}
                          strokeWidth={1}
                          strokeDasharray={chart.dashFine}
                          fill="none"
                        />
                      ))}
                      {[atP, -atP].map((l) => (
                        <Path
                          key={l}
                          d={contour(phi, l)}
                          stroke={c.he4gEquipotential}
                          strokeWidth={2}
                          strokeDasharray={chart.dash}
                          fill="none"
                        />
                      ))}
                      {sampled < BOT - 14 ? (
                        <Tag
                          x={CX}
                          y={sampled + 18}
                          text={`sampled to about a ÷ 2 = ${fmt(aa / 2)} m`}
                          w={BW}
                        />
                      ) : null}
                    </G>
                  ) : null}
                  <Line x1={0} y1={SURF} x2={BW} y2={SURF} stroke={c.landGrass} strokeWidth={4} />
                  {ok ? (
                    <G>
                      {/* Wires: the battery and ammeter to C₁ and C₂, the voltmeter to P₁, P₂. */}
                      <Path
                        d={`M ${elec[0]} ${SURF - 18} V 25 H ${CX - 62} M ${CX + 62} 25 H ${elec[3]} V ${SURF - 18}`}
                        stroke={c.chartInk}
                        strokeWidth={1.5}
                        fill="none"
                      />
                      <Path
                        d={`M ${elec[1]} ${SURF - 18} V 69 H ${CX - 54} M ${CX + 54} 69 H ${elec[2]} V ${SURF - 18}`}
                        stroke={c.chartInk}
                        strokeWidth={1.5}
                        fill="none"
                      />
                      <Meter x={CX} y={10} w={124} text={iText} name="A" ids={ids} />
                      <Meter x={CX} y={54} w={108} text={vText} name="V" ids={ids} />
                      {elec.map((x, n) => (
                        <G key={names[n]}>
                          <Rect
                            x={x - 3}
                            y={SURF - 18}
                            width={6}
                            height={30}
                            rx={2}
                            fill={url(ids.stake)}
                            stroke={c.chartInk}
                            strokeWidth={0.8}
                          />
                          <Circle cx={x} cy={SURF - 18} r={3.5} fill={c.chartInk} />
                          <ChartText
                            x={x + (n < 2 ? -7 : 7)}
                            y={SURF - 6}
                            fontSize={chart.value}
                            fontWeight="700"
                            textAnchor={n < 2 ? 'end' : 'start'}
                          >
                            {names[n]}
                          </ChartText>
                        </G>
                      ))}
                      {/* The equal spacings. */}
                      {[0, 1, 2].map((n) => (
                        <G key={n}>
                          <Path
                            d={`M ${elec[n]! + 4} ${SURF - 36} V ${SURF - 30} H ${elec[n + 1]! - 4} V ${SURF - 36}`}
                            stroke={c.chartInk}
                            strokeWidth={1.2}
                            fill="none"
                          />
                          {aText ? (
                            <Tag
                              x={(elec[n]! + elec[n + 1]!) / 2}
                              y={SURF - 40}
                              text={n === 1 ? aText : 'a'}
                              w={BW}
                            />
                          ) : null}
                        </G>
                      ))}
                      {rhoText ? (
                        <Tag x={8} y={BH - 10} text={rhoText} anchor="start" w={BW} />
                      ) : null}
                    </G>
                  ) : null}
                  <ChartText
                    x={BW - 6}
                    y={BH - 10}
                    fontSize={chart.label}
                    textAnchor="end"
                    fill={c.he4gOnGround}
                  >
                    current solid, equipotentials dashed
                  </ChartText>
                </G>
              </Svg>
              {canDrag ? (
                <DragHandle
                  x={elec[3]! * k}
                  y={(SURF - 4) * k}
                  label="the spacing"
                  onStart={() => {
                    frame.freeze();
                    start.current = aa;
                  }}
                  onMove={(dx) => {
                    const na = start.current + dx / k / m / 1.5;
                    setOne(aVar!, Math.max(start.current * 0.2, na), [spec.voltage, spec.current]);
                  }}
                  onEnd={frame.release}
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' ')}</Caption>
    </View>
  );
}
