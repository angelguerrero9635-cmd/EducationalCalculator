/**
 * `fluidSystem` pipes (HC6): one pipe and its grade lines, with or without a pump (`pipe`),
 * two pipes in parallel (`parallel`), a Hardy Cross loop (`loop`) and a sewer flowing full in
 * section (`full`). Pipes are painted steel or concrete with water in them; the grade lines,
 * arrows and the loop's correction are flat.
 */
import { View } from 'react-native';
import { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type {
  FluidFullSpec,
  FluidLoopSpec,
  FluidParallelSpec,
  FluidPipeSpec,
} from '@/data/modules/typesHe1g';
import { chart, usePalette } from '@/theme';

import { HaloText, textW } from '../layouts/earthKit';
import type { Calculator } from '../useCalculator';
import { Caption } from './common';
import { Arrow, Board, BW, Dimension, niceStep, num, pos, useFluidReader } from './fluidKit';
import { SELF_CLEANING, areaOf, hardyCross, laidSize } from './fluidMath';
import { Deepen, Glass, Metal, Sheen, url, usePaintIds } from './paint';

/** A steel pipe from (x1, y) to (x2, y), `t` thick, water inside. */
function HPipe({
  x1,
  x2,
  y,
  t,
  ids,
}: {
  x1: number;
  x2: number;
  y: number;
  t: number;
  ids: { steel: string; water: string; sheen: string };
}) {
  const c = usePalette();
  return (
    <G>
      <Rect
        x={x1}
        y={y - t / 2 - 3}
        width={x2 - x1}
        height={t + 6}
        fill={url(ids.steel)}
        stroke={c.metalDark}
        strokeWidth={1}
      />
      <Rect x={x1} y={y - t / 2} width={x2 - x1} height={t} fill={url(ids.water)} />
      <Rect x={x1} y={y - t / 2 - 3} width={x2 - x1} height={t + 6} fill={url(ids.sheen)} />
    </G>
  );
}

/** A steel pipe from (x, y1) to (x, y2), `t` thick, water inside. */
function VPipe({
  x,
  y1,
  y2,
  t,
  ids,
}: {
  x: number;
  y1: number;
  y2: number;
  t: number;
  ids: { steel: string; water: string; vsheen: string };
}) {
  const c = usePalette();
  const [a, b] = [Math.min(y1, y2), Math.max(y1, y2)];
  return (
    <G>
      <Rect
        x={x - t / 2 - 3}
        y={a}
        width={t + 6}
        height={b - a}
        fill={url(ids.steel)}
        stroke={c.metalDark}
        strokeWidth={1}
      />
      <Rect x={x - t / 2} y={a} width={t} height={b - a} fill={url(ids.water)} />
      <Rect x={x - t / 2 - 3} y={a} width={t + 6} height={b - a} fill={url(ids.vsheen)} />
    </G>
  );
}

function usePipePaint() {
  const c = usePalette();
  const p = usePaintIds('steel', 'water', 'sheen', 'vsheen', 'glass', 'concrete');
  const defs = (
    <Defs>
      <Metal id={p.steel} light={c.metal} dark={c.metalDark} />
      <Deepen id={p.water} from={c.water} to={c.waterDeep} />
      <Sheen id={p.sheen} vertical />
      <Sheen id={p.vsheen} />
      <Glass id={p.glass} />
      <Deepen id={p.concrete} from={c.fluidConcrete} to={c.fluidConcreteDark} />
    </Defs>
  );
  return { p, defs };
}

// ── pipe ──

export function FluidPipe({ spec, calc }: { spec: FluidPipeSpec; calc: Calculator }) {
  return spec.pump ? <PumpLine spec={spec} calc={calc} /> : <GradeLines spec={spec} calc={calc} />;
}

function GradeLines({ spec, calc }: { spec: FluidPipeSpec; calc: Calculator }) {
  const c = usePalette();
  const r = useFluidReader(calc, spec.g);
  const { p, defs } = usePipePaint();
  const hL = r.si(spec.headLoss);
  const D = r.si(spec.diameter);
  const Q = r.si(spec.flow);
  const V = r.si(spec.speed) ?? (Q !== undefined && pos(D) ? Q / areaOf(D) : undefined);
  const hv = V !== undefined ? (V * V) / (2 * r.g) : undefined;
  const rho = r.si(spec.density);
  const dP = r.si(spec.drop) ?? (pos(hL) && pos(rho) ? rho * r.g * hL : undefined);
  const [x0, x1, yP] = [46, 326, 258];
  const loss = pos(hL) ? hL : 0;
  const vh = hv ?? 0;
  const base = 0.35 * (loss + vh) || 1;
  const eOut = base + vh;
  const eIn = eOut + loss;
  const s = (yP - 12 - 44) / (eIn * 1.06);
  const y = (head: number) => yP - head * s;
  const bar = niceStep(eIn, 3);
  const lines = [r.label(spec.reynolds, 'Re'), r.label(spec.friction, 'f')].filter(
    (x): x is string => !!x,
  );
  // h_L (and ΔP under it) sit in the wedge over the falling energy line, clear of it: their
  // baselines above where the line passes under their left end; where the wedge is too thin,
  // beside the drop's dimension as before.
  const hlText = r.label(spec.headLoss, 'h_L', 'm') ?? '';
  const dpText = dP !== undefined ? (r.label(spec.drop, 'ΔP', 'Pa') ?? `ΔP = ${num(dP)} Pa`) : '';
  const lossLabels = (() => {
    const mid = (y(eIn) + y(eOut)) / 2;
    const wide = Math.max(
      textW(hlText, chart.value, true),
      dpText ? textW(dpText, chart.label) : 0,
    );
    const left = x1 - 40 - wide;
    const under = y(eIn) + ((y(eOut) - y(eIn)) * (left - x0)) / (x1 - x0);
    const hl = under - (dpText ? 22 : 6);
    return hl - chart.value > y(eIn) + 14 ? { hl, dp: under - 6 } : { hl: mid + 4, dp: mid + 20 };
  })();
  return (
    <View>
      <Board
        height={300}
        draw={() => (
          <G>
            {defs}
            {/* Piezometer columns at the two ends rise to the HGL. */}
            {hv !== undefined && pos(hL)
              ? [
                  { x: x0 + 16, top: y(eIn - vh) },
                  { x: x1 - 16, top: y(eOut - vh) },
                ].map((t) => (
                  <G key={t.x}>
                    <Rect
                      x={t.x - 5}
                      y={t.top - 14}
                      width={10}
                      height={yP - t.top + 6}
                      fill={url(p.glass)}
                    />
                    <Rect x={t.x - 4} y={t.top} width={8} height={yP - t.top} fill={url(p.water)} />
                    <Path
                      d={`M ${t.x - 5} ${t.top - 14} V ${yP - 8} M ${t.x + 5} ${t.top - 14} V ${yP - 8}`}
                      stroke={c.glassEdge}
                    />
                  </G>
                ))
              : null}
            <HPipe x1={x0} x2={x1} y={yP} t={12} ids={p} />
            {V !== undefined ? (
              <Arrow
                x1={x0 + 60}
                y1={yP}
                x2={x0 + 110}
                y2={yP}
                color={c.fluidMark}
                width={2}
                head={6}
              />
            ) : null}
            {pos(hL) ? (
              <G>
                {/* The energy line falls by h_L; the hydraulic line runs V²/2g under it. */}
                <Line
                  x1={x0}
                  y1={y(eIn)}
                  x2={x1}
                  y2={y(eIn)}
                  stroke={c.chartMuted}
                  strokeDasharray={chart.dashFine}
                />
                <Line
                  x1={x0}
                  y1={y(eIn)}
                  x2={x1}
                  y2={y(eOut)}
                  stroke={c.fluidEgl}
                  strokeWidth={chart.strokeHeavy}
                />
                <HaloText
                  x={x0 + 40}
                  y={y(eIn) - 8}
                  text="EGL"
                  c={c}
                  size={chart.label}
                  bold
                  fill={c.fluidEgl}
                  anchor="start"
                />
                {hv !== undefined ? (
                  <G>
                    <Line
                      x1={x0}
                      y1={y(eIn - vh)}
                      x2={x1}
                      y2={y(eOut - vh)}
                      stroke={c.fluidHgl}
                      strokeWidth={chart.strokeHeavy}
                      strokeDasharray={chart.dash}
                    />
                    <HaloText
                      x={x0 + 40}
                      y={y(eIn - vh) + 18}
                      text="HGL"
                      c={c}
                      size={chart.label}
                      bold
                      fill={c.fluidHgl}
                      anchor="start"
                    />
                    <Dimension
                      x1={x0 + 100}
                      y1={y(eIn - (loss * 60) / (x1 - x0))}
                      x2={x0 + 100}
                      y2={y(eIn - vh - (loss * 60) / (x1 - x0))}
                      color={c.chartInk}
                    />
                    <HaloText
                      x={x0 + 106}
                      y={y(eIn - vh / 2) + 4}
                      text={`V²/2g = ${num(vh)} m`}
                      c={c}
                      size={chart.label}
                      anchor="start"
                    />
                  </G>
                ) : null}
                <Dimension x1={x1 - 34} y1={y(eIn)} x2={x1 - 34} y2={y(eOut)} color={c.chartInk} />
                <HaloText
                  x={x1 - 40}
                  y={lossLabels.hl}
                  text={hlText}
                  c={c}
                  size={chart.value}
                  bold
                  anchor="end"
                />
                {dpText ? (
                  <HaloText
                    x={x1 - 40}
                    y={lossLabels.dp}
                    text={dpText}
                    c={c}
                    size={chart.label}
                    anchor="end"
                  />
                ) : null}
                {/* A scale for heads. */}
                <Line
                  x1={14}
                  y1={yP}
                  x2={14}
                  y2={yP - bar * s}
                  stroke={c.chartInk}
                  strokeWidth={2}
                />
                <HaloText
                  x={8}
                  y={yP - bar * s - 8}
                  text={`${num(bar)} m`}
                  c={c}
                  size={chart.label}
                  anchor="start"
                />
              </G>
            ) : null}
            {lines.map((t, i) => (
              <HaloText
                key={t}
                x={BW - 6}
                y={16 + 16 * i}
                text={t}
                c={c}
                size={chart.label}
                anchor="end"
              />
            ))}
            <Dimension x1={x0} y1={yP + 20} x2={x1} y2={yP + 20} color={c.chartMuted} />
            <HaloText
              x={(x0 + x1) / 2}
              y={yP + 36}
              text={[
                r.label(spec.length, 'L', 'm'),
                r.label(spec.diameter, 'D', 'm'),
                r.label(spec.speed, 'V', 'm/s'),
              ]
                .filter(Boolean)
                .join(' · ')}
              c={c}
              size={chart.label}
            />
          </G>
        )}
      />
      <Caption>
        {pos(hL)
          ? `The energy grade line falls by h_L = ${num(hL)} m along the pipe${hv !== undefined ? `; the hydraulic grade line runs V² ÷ 2g = ${num(vh)} m under it` : ''}. Heads are to the scale at the left; the pipe’s length is not.${dP !== undefined ? ` ΔP = ρgh_L = ${num(dP)} Pa.` : ''}`
          : 'Type the pipe and its flow to draw the grade lines.'}
      </Caption>
    </View>
  );
}

function PumpLine({ spec, calc }: { spec: FluidPipeSpec; calc: Calculator }) {
  const c = usePalette();
  const r = useFluidReader(calc, spec.g);
  const { p, defs } = usePipePaint();
  const hL = r.si(spec.headLoss);
  const dz = r.si(spec.rise);
  const hp = r.si(spec.pumpHead) ?? (dz !== undefined && hL !== undefined ? dz + hL : undefined);
  const [xa, xp, xb, yP] = [64, 110, 276, 262];
  const share = (xp - xa) / (xb - xa);
  const ok = dz !== undefined && hL !== undefined && hp !== undefined;
  const e1 = ok ? -hL * share : 0;
  const top = ok ? Math.max(dz, e1 + hp, 1e-9) : 1;
  const below = 0.18 * top;
  const s = (yP - 40) / (top * 1.08 + below);
  const y = (e: number) => yP - (e + below) * s;
  return (
    <View>
      <Board
        height={300}
        draw={() => (
          <G>
            {defs}
            {/* The two reservoirs, glass, and the pipe between them along the floor. */}
            {[
              { x: 8, surf: 0 },
              { x: xb, surf: dz ?? top * 0.6 },
            ].map((t) => (
              <G key={t.x}>
                <Rect
                  x={t.x}
                  y={y(t.surf) - 22}
                  width={56}
                  height={yP + 18 - y(t.surf) + 22}
                  fill={url(p.glass)}
                />
                <Rect
                  x={t.x}
                  y={y(t.surf)}
                  width={56}
                  height={yP + 18 - y(t.surf)}
                  fill={url(p.water)}
                />
                <Path
                  d={`M ${t.x} ${y(t.surf) - 22} V ${yP + 18} H ${t.x + 56} V ${y(t.surf) - 22}`}
                  stroke={c.glassEdge}
                  strokeWidth={2}
                  fill="none"
                />
              </G>
            ))}
            <HPipe x1={xa} x2={xb} y={yP} t={10} ids={p} />
            <Circle
              cx={xp}
              cy={yP}
              r={15}
              fill={url(p.steel)}
              stroke={c.metalDark}
              strokeWidth={1.5}
            />
            <Path
              d={`M ${xp - 6} ${yP - 7} L ${xp + 8} ${yP} L ${xp - 6} ${yP + 7} Z`}
              fill={c.metalDark}
            />
            <HaloText x={xp} y={yP + 32} text="Pump" c={c} size={chart.label} />
            {ok ? (
              <G>
                {/* The energy line: losses all along, the pump's lift in one step. */}
                <Path
                  d={`M ${xa} ${y(0)} L ${xp} ${y(e1)} L ${xp} ${y(e1 + hp)} L ${xb} ${y(dz)}`}
                  stroke={c.fluidEgl}
                  strokeWidth={chart.strokeHeavy}
                  fill="none"
                  strokeLinejoin="round"
                />
                <HaloText
                  x={(xp + xb) / 2}
                  y={y(e1 + hp - (hL - hL * share) / 2) + 26}
                  text={`EGL falls h_L = ${r.text(spec.headLoss) ?? ''}`}
                  c={c}
                  size={chart.label}
                  bold
                  fill={c.fluidEgl}
                />
                <Dimension
                  x1={xp + 14}
                  y1={y(e1)}
                  x2={xp + 14}
                  y2={y(e1 + hp)}
                  color={c.chartInk}
                />
                <HaloText
                  x={xp + 20}
                  y={(y(e1) + y(e1 + hp)) / 2 + 4}
                  text={r.label(spec.pumpHead, 'h_p', 'm') ?? ''}
                  c={c}
                  size={chart.value}
                  bold
                  anchor="start"
                />
                <Line
                  x1={8}
                  y1={y(0)}
                  x2={xb - 12}
                  y2={y(0)}
                  stroke={c.chartMuted}
                  strokeDasharray={chart.dash}
                />
                <Dimension x1={xb - 16} y1={y(0)} x2={xb - 16} y2={y(dz)} color={c.chartInk} />
                <HaloText
                  x={xb - 22}
                  y={(y(0) + y(dz)) / 2 + 24}
                  text={r.label(spec.rise, 'Δz', 'm') ?? ''}
                  c={c}
                  size={chart.label}
                  anchor="end"
                />
              </G>
            ) : null}
            {[
              r.label(spec.flow, 'Q', 'm³/s'),
              r.label(spec.efficiency, 'η'),
              r.label(spec.power, 'P', 'W'),
            ]
              .filter((x): x is string => !!x)
              .map((t, i) => (
                <HaloText
                  key={t}
                  x={72}
                  y={16 + 16 * i}
                  text={t}
                  c={c}
                  size={chart.label}
                  anchor="start"
                />
              ))}
          </G>
        )}
      />
      <Caption>
        {ok
          ? `The pump lifts the water Δz = ${num(dz)} m and makes up the losses: h_p = Δz + h_L = ${num(dz)} + ${num(hL)} = ${num(hp)} m. The energy line is to scale (it ends at the upper surface); the pipe is not.`
          : 'Type the rise and the losses to find the pump head.'}
      </Caption>
    </View>
  );
}

// ── parallel ──

export function FluidParallel({ spec, calc }: { spec: FluidParallelSpec; calc: Calculator }) {
  const c = usePalette();
  const r = useFluidReader(calc, spec.g);
  const { p, defs } = usePipePaint();
  const Q = r.si(spec.flow);
  const pipes = spec.pipes.map((b) => ({
    D: r.si(b.diameter),
    L: r.si(b.length),
    Q: r.si(b.flow),
    b,
  }));
  const Dmax = Math.max(...pipes.map((x) => x.D ?? 0)) || 1;
  const [xa, xb, yN] = [62, 278, 130];
  const ys = [62, 198];
  const t = (D: number | undefined) => (pos(D) ? Math.max(5, (24 * D) / Dmax) : 12);
  const sub = ['₁', '₂'];
  return (
    <View>
      <Board
        height={260}
        draw={() => (
          <G>
            {defs}
            <HPipe x1={6} x2={xa} y={yN} t={20} ids={p} />
            <HPipe x1={xb} x2={BW - 6} y={yN} t={20} ids={p} />
            {pipes.map((q, i) => (
              <G key={i}>
                <VPipe x={xa} y1={yN} y2={ys[i]!} t={t(q.D)} ids={p} />
                <VPipe x={xb} y1={yN} y2={ys[i]!} t={t(q.D)} ids={p} />
                <HPipe x1={xa - t(q.D) / 2} x2={xb + t(q.D) / 2} y={ys[i]!} t={t(q.D)} ids={p} />
                {q.Q !== undefined && pos(Q) ? (
                  <Arrow
                    x1={(xa + xb) / 2 - 30}
                    y1={ys[i]!}
                    x2={(xa + xb) / 2 - 30 + Math.max(8, (60 * q.Q) / Q)}
                    y2={ys[i]!}
                    color={c.fluidMark}
                    width={2}
                    head={6}
                  />
                ) : null}
                <HaloText
                  x={(xa + xb) / 2}
                  y={ys[i]! + (i === 0 ? -t(q.D) / 2 - 10 : t(q.D) / 2 + 20)}
                  text={[
                    r.label(q.b.diameter, `D${sub[i]}`, 'm'),
                    r.label(q.b.length, `L${sub[i]}`, 'm'),
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                  c={c}
                  size={chart.label}
                />
                <HaloText
                  x={(xa + xb) / 2}
                  y={ys[i]! + (i === 0 ? -t(q.D) / 2 - 26 : t(q.D) / 2 + 36)}
                  text={r.label(q.b.flow, `Q${sub[i]}`, 'm³/s') ?? ''}
                  c={c}
                  size={chart.label}
                  bold
                />
              </G>
            ))}
            {[xa, xb].map((x, i) => (
              <G key={x}>
                <Circle cx={x} cy={yN} r={7} fill={c.chartInk} />
                <HaloText
                  x={x + (i ? 14 : -14)}
                  y={yN - 14}
                  text={i ? 'B' : 'A'}
                  c={c}
                  size={chart.value}
                  bold
                  anchor={i ? 'start' : 'end'}
                />
              </G>
            ))}
            <Arrow x1={10} y1={yN} x2={46} y2={yN} color={c.fluidMark} width={2} head={6} />
            <Arrow
              x1={xb + 16}
              y1={yN}
              x2={xb + 52}
              y2={yN}
              color={c.fluidMark}
              width={2}
              head={6}
            />
            <HaloText
              x={8}
              y={yN + 32}
              text={r.label(spec.flow, 'Q', 'm³/s') ?? ''}
              c={c}
              size={chart.label}
              anchor="start"
            />
            <HaloText
              x={(xa + xb) / 2}
              y={yN + 5}
              text={
                r.label(spec.headLoss, 'h_f', 'm')
                  ? `${r.label(spec.headLoss, 'h_f', 'm')} on both`
                  : 'Same h_f on both'
              }
              c={c}
              size={chart.value}
              bold
            />
            {spec.hazen !== undefined ? (
              <HaloText
                x={BW - 8}
                y={yN + 32}
                text={r.label(spec.hazen, 'C') ?? ''}
                c={c}
                size={chart.label}
                anchor="end"
              />
            ) : null}
          </G>
        )}
      />
      <Caption>
        {Q !== undefined && pipes.every((q) => q.Q !== undefined)
          ? `The flow splits so both pipes lose the same head from A to B: Q₁ + Q₂ = ${num(pipes[0]!.Q!)} + ${num(pipes[1]!.Q!)} = ${num(Q)} m³/s. Pipe widths are to scale with each other; the lengths are labelled.`
          : 'Type the total flow and both pipes to split the flow.'}
      </Caption>
    </View>
  );
}

// ── loop ──

export function FluidLoop({ spec, calc }: { spec: FluidLoopSpec; calc: Calculator }) {
  const c = usePalette();
  const r = useFluidReader(calc, spec.g);
  const { p, defs } = usePipePaint();
  const pipes = spec.pipes.map((b) => ({ K: r.si(b.constant), Q: r.si(b.flow), b }));
  const all = pipes.every((x) => x.K !== undefined && x.Q !== undefined);
  const hc = all ? hardyCross(pipes as { K: number; Q: number }[]) : undefined;
  const dQ = r.si(spec.correction) ?? hc?.dQ;
  const [L, R, T, B] = [64, 276, 66, 246];
  const sub = ['₁', '₂', '₃', '₄'];
  // Pipes clockwise: top, right, bottom, left; each runs from its start corner to its end.
  const sides = [
    { a: [L, T], b: [R, T], lx: (L + R) / 2, ly: T - 34, anchor: 'middle' as const },
    // The side pipes' labels sit inside the loop on different rows (the left one high, the
    // right one low) so they never run into each other; the ΔQ circle sits between them.
    { a: [R, T], b: [R, B], lx: R - 16, ly: B - 56, anchor: 'end' as const },
    { a: [R, B], b: [L, B], lx: (L + R) / 2, ly: B + 30, anchor: 'middle' as const },
    { a: [L, B], b: [L, T], lx: L + 16, ly: T + 52, anchor: 'start' as const },
  ];
  const turn = dQ !== undefined && dQ < 0 ? -1 : 1;
  const [cx, cy, rr] = [(L + R) / 2, (T + B) / 2 + 4, 18];
  return (
    <View>
      <Board
        height={300}
        draw={() => (
          <G>
            {defs}
            <HPipe x1={L - 8} x2={R + 8} y={T} t={10} ids={p} />
            <HPipe x1={L - 8} x2={R + 8} y={B} t={10} ids={p} />
            <VPipe x={L} y1={T} y2={B} t={10} ids={p} />
            <VPipe x={R} y1={T} y2={B} t={10} ids={p} />
            {[
              [L, T],
              [R, T],
              [R, B],
              [L, B],
            ].map(([x, y]) => (
              <Circle key={`${x}-${y}`} cx={x} cy={y} r={6} fill={c.chartInk} />
            ))}
            <Arrow x1={L - 44} y1={T - 30} x2={L - 8} y2={T - 6} color={c.chartInk} />
            <Arrow x1={R + 8} y1={B + 6} x2={R + 44} y2={B + 30} color={c.chartInk} />
            {sides.map((sd, i) => {
              const q = pipes[i]!;
              const [ax, ay] = sd.a as [number, number];
              const [bx, by] = sd.b as [number, number];
              const [mx, my] = [(ax + bx) / 2, (ay + by) / 2];
              const dir = q.Q !== undefined && q.Q < 0 ? -1 : 1;
              const [ux, uy] = [
                ((bx - ax) / Math.hypot(bx - ax, by - ay)) * dir,
                ((by - ay) / Math.hypot(bx - ax, by - ay)) * dir,
              ];
              const hf = hc?.hf[i];
              const next = hc?.next[i];
              return (
                <G key={i}>
                  {q.Q !== undefined ? (
                    <Arrow
                      x1={mx - ux * 22}
                      y1={my - uy * 22}
                      x2={mx + ux * 22}
                      y2={my + uy * 22}
                      color={c.fluidMark}
                      width={2.5}
                      head={8}
                    />
                  ) : null}
                  <HaloText
                    x={sd.lx}
                    y={sd.ly}
                    text={`${r.text(q.b.flow) !== undefined ? `Q${sub[i]} = ${r.text(q.b.flow)}` : `Q${sub[i]}`}${next !== undefined ? ` → ${num(next, 3)}` : ''}`}
                    c={c}
                    size={chart.label}
                    bold
                    anchor={sd.anchor}
                  />
                  <HaloText
                    x={sd.lx}
                    y={sd.ly + 16}
                    text={`K${sub[i]} = ${r.text(q.b.constant) ?? '?'}${hf !== undefined ? `, h_f = ${num(hf, 3)}` : ''}`}
                    c={c}
                    size={chart.label}
                    anchor={sd.anchor}
                  />
                </G>
              );
            })}
            {/* The correction, turning the way it moves the flows. */}
            {dQ !== undefined ? (
              <G>
                {/* Three quarters round from the top, ending in an arrow going up. */}
                <Path
                  d={`M ${cx} ${cy - rr} A ${rr} ${rr} 0 1 ${turn > 0 ? 1 : 0} ${cx - turn * rr} ${cy}`}
                  stroke={c.chartHighlight}
                  strokeWidth={chart.strokeHeavy}
                  fill="none"
                />
                <Arrow
                  x1={cx - turn * rr}
                  y1={cy + 6}
                  x2={cx - turn * rr}
                  y2={cy - 4}
                  color={c.chartHighlight}
                  head={10}
                />
                <HaloText
                  x={cx}
                  y={cy + 4}
                  text="ΔQ"
                  c={c}
                  size={chart.value}
                  bold
                  fill={c.chartHighlight}
                />
                <HaloText
                  x={cx}
                  y={T + 28}
                  text={r.label(spec.correction, 'ΔQ', 'm³/s') ?? `ΔQ = ${num(dQ, 3)} m³/s`}
                  c={c}
                  size={chart.value}
                  bold
                />
              </G>
            ) : null}
            {hc ? (
              <HaloText
                x={cx}
                y={B - 14}
                text={`Σh_f = ${num(hc.sum, 3)} · Σ(2 h_f ÷ Q) = ${num(hc.slope, 3)}`}
                c={c}
                size={chart.label}
              />
            ) : null}
          </G>
        )}
      />
      <Caption>
        {hc && dQ !== undefined
          ? `Clockwise flows are +. ΔQ = −Σh_f ÷ Σ(2 h_f ÷ Q) = −${num(hc.sum, 3)} ÷ ${num(hc.slope, 3)} = ${num(dQ, 3)} m³/s, added to every pipe’s flow (the arrows show the new direction where one changes sign).`
          : 'Type each pipe’s K and assumed flow to make one correction.'}
      </Caption>
    </View>
  );
}

// ── full ──

export function FluidFull({ spec, calc }: { spec: FluidFullSpec; calc: Calculator }) {
  const c = usePalette();
  const r = useFluidReader(calc, spec.g);
  const { p, defs } = usePipePaint();
  const Q = r.si(spec.flow);
  const S = r.si(spec.slope);
  const D = r.si(spec.diameter);
  const size = r.si(spec.size) ?? (pos(D) ? (laidSize(D, spec.sizes) ?? D) : undefined);
  const V = pos(Q) && pos(size) ? Q / areaOf(size) : undefined;
  const slow = V !== undefined && V < SELF_CLEANING;
  const [cx, cy] = [112, 132];
  const rIn = 84;
  const s = pos(size) ? rIn / size : 0;
  const wall = Math.max(8, rIn / 9);
  const run = 100;
  const drop = 34;
  return (
    <View>
      <Board
        height={290}
        draw={() => (
          <G>
            {defs}
            {/* The pipe laid, in concrete, flowing full. */}
            <Circle
              cx={cx}
              cy={cy}
              r={rIn + wall}
              fill={url(p.concrete)}
              stroke={c.fluidConcreteDark}
              strokeWidth={1.5}
            />
            <Circle cx={cx} cy={cy} r={rIn} fill={url(p.water)} />
            {pos(D) && pos(size) ? (
              <Circle
                cx={cx}
                cy={cy}
                r={D * s}
                fill="none"
                stroke={c.fluidMark}
                strokeWidth={2}
                strokeDasharray={chart.dash}
              />
            ) : null}
            {pos(D) && pos(size) ? (
              <G>
                <Line
                  x1={cx - D * s}
                  y1={cy}
                  x2={cx + D * s}
                  y2={cy}
                  stroke={c.fluidMark}
                  strokeWidth={1.5}
                />
                <HaloText
                  x={cx}
                  y={cy - 8}
                  text={r.label(spec.diameter, 'D', 'm') ?? ''}
                  c={c}
                  size={chart.label}
                  bold
                />
              </G>
            ) : null}
            {pos(size) && (spec.size !== undefined || spec.sizes) ? (
              <HaloText
                x={cx}
                y={cy + rIn + wall + 22}
                text={`Laid: ${r.text(spec.size) ?? `${num(size * 1000)} mm`}`}
                c={c}
                size={chart.value}
                bold
              />
            ) : null}
            {/* A side strip: the pipe running down its slope (drawn steeper). */}
            <G>
              <Path
                d={`M 222 80 L ${222 + run} ${80 + drop}`}
                stroke={url(p.concrete)}
                strokeWidth={18}
                strokeLinecap="butt"
              />
              <Path
                d={`M 222 80 L ${222 + run} ${80 + drop}`}
                stroke={url(p.water)}
                strokeWidth={12}
              />
              <Arrow x1={236} y1={85} x2={290} y2={103} color={c.fluidMark} width={2} head={6} />
              <HaloText
                x={272}
                y={140}
                text={r.label(spec.slope, 'S') ?? ''}
                c={c}
                size={chart.value}
                bold
              />
              <HaloText
                x={272}
                y={156}
                text="(drawn steeper)"
                c={c}
                size={chart.label}
                fill={c.chartMuted}
              />
              <HaloText
                x={272}
                y={190}
                text={r.label(spec.flow, 'Q', 'm³/s') ?? ''}
                c={c}
                size={chart.label}
              />
              <HaloText
                x={272}
                y={206}
                text={r.label(spec.manning, 'n') ?? ''}
                c={c}
                size={chart.label}
              />
              {V !== undefined ? (
                <HaloText
                  x={272}
                  y={230}
                  text={`V = ${num(V, 3)} m/s`}
                  c={c}
                  size={chart.value}
                  bold
                  fill={slow ? c.forceWeight : c.chartInk}
                />
              ) : null}
              {slow ? (
                <HaloText
                  x={272}
                  y={246}
                  text="Too slow: solids settle"
                  c={c}
                  size={chart.label}
                  fill={c.forceWeight}
                />
              ) : null}
            </G>
          </G>
        )}
      />
      <Caption>
        {pos(Q) && pos(S) && pos(D) && V !== undefined
          ? `Full by Manning: D = (3.208Qn ÷ √S)³ᐟ⁸ = ${num(D, 3)} m (dashed), so the next size up is laid. Full, V = Q ÷ A = ${num(V, 3)} m/s${slow ? `, under about ${SELF_CLEANING} m/s: solids would settle` : `, above about ${SELF_CLEANING} m/s, so solids keep moving`}.`
          : 'Type the flow, n and the slope to size the pipe.'}
      </Caption>
    </View>
  );
}
