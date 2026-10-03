/**
 * `fluidSystem` flow (HC6): a venturi meter (`venturi`), a pitot-static tube (`pitot`) and a
 * jet on a fixed vane (`jet`). The tubes are glass with water, the probe, nozzle and vane
 * steel; the control volume is dashed and the forces flat arrows.
 */
import { useRef } from 'react';
import { View } from 'react-native';
import { Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { FluidJetSpec, FluidPitotSpec, FluidVenturiSpec } from '@/data/modules/typesHe1g';
import { chart, usePalette } from '@/theme';

import { HaloText } from '../layouts/earthKit';
import type { Calculator } from '../useCalculator';
import { Caption, DragHandle, useFrozen } from './common';
import { Arrow, Board, BW, Dimension, fluidPaint, num, pos, useFluidReader } from './fluidKit';
import { areaOf, jetForce } from './fluidMath';
import { Deepen, Glass, Metal, Sheen, url, usePaintIds } from './paint';

const ids = (...xs: (string | number | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');

// ── venturi ──

export function FluidVenturi({ spec, calc }: { spec: FluidVenturiSpec; calc: Calculator }) {
  const c = usePalette();
  const r = useFluidReader(calc, spec.g);
  const p = usePaintIds('glass', 'sheen', 'liquid', 'col');
  const paint = fluidPaint(c, spec.fluid);
  const D1 = r.si(spec.inlet);
  const D2 = r.si(spec.throat);
  const rho = r.si(spec.density);
  const dP = r.si(spec.difference);
  const V1 =
    r.si(spec.speed1) ??
    (pos(D1) && pos(D2) && r.si(spec.speed2) !== undefined
      ? r.si(spec.speed2)! * (D2 / D1) ** 2
      : undefined);
  const V2 =
    r.si(spec.speed2) ?? (pos(D1) && pos(D2) && V1 !== undefined ? V1 * (D1 / D2) ** 2 : undefined);
  const Q = r.si(spec.flow) ?? (pos(D1) && V1 !== undefined ? areaOf(D1) * V1 : undefined);
  const narrower = !(pos(D1) && pos(D2)) || D2 < D1;
  const dh = dP !== undefined && pos(rho) ? dP / (rho * r.g) : undefined;
  const frame = useFrozen(pos(dh) ? dh : 1);
  const s = 118 / frame.value;
  const drag = useRef({ D2: 0 });
  const axis = 232;
  const W1 = 58;
  const W2 = pos(D1) && pos(D2) ? Math.min(W1, (W1 * D2) / D1) : W1 * 0.6;
  const xs = { in0: 12, in1: 108, th0: 156, th1: 206, out1: 296, end: 328 };
  const half1 = W1 / 2;
  const half2 = W2 / 2;
  const outline = (inset: number) =>
    `M ${xs.in0} ${axis - half1 + inset} H ${xs.in1} L ${xs.th0} ${axis - half2 + inset} H ${xs.th1} L ${xs.out1} ${axis - half1 + inset} H ${xs.end} V ${axis + half1 - inset} H ${xs.out1} L ${xs.th1} ${axis + half2 - inset} H ${xs.th0} L ${xs.in1} ${axis + half1 - inset} H ${xs.in0} Z`;
  const col1 = 60;
  const col2 = (xs.th0 + xs.th1) / 2;
  const throatTop = axis - half1 - 30;
  const top2 = throatTop;
  const top1 = pos(dh) ? throatTop - dh * s : undefined;
  const throatId = typeof spec.throat === 'string' ? spec.throat : undefined;
  const canDrag = !spec.fixed && !!throatId && pos(D1) && pos(D2);
  const vMax = Math.max(V1 ?? 0, V2 ?? 0) || 1;
  return (
    <View>
      <Board
        height={300}
        draw={() => (
          <G opacity={narrower ? 1 : 0.4}>
            <Defs>
              <Glass id={p.glass} />
              <Sheen id={p.sheen} vertical />
              <Deepen id={p.liquid} from={paint.top} to={paint.deep} />
              <Sheen id={p.col} />
            </Defs>
            {/* The piezometer columns: glass up from each section, water to its head. */}
            {[
              { x: col1, top: top1, y0: axis - half1 },
              { x: col2, top: top2, y0: axis - half2 },
            ].map((t, i) => (
              <G key={i}>
                <Rect x={t.x - 6} y={20} width={12} height={t.y0 - 20} fill={url(p.glass)} />
                {t.top !== undefined ? (
                  <Rect
                    x={t.x - 6}
                    y={t.top}
                    width={12}
                    height={t.y0 - t.top}
                    fill={url(p.liquid)}
                  />
                ) : null}
                <Rect x={t.x - 6} y={20} width={12} height={t.y0 - 20} fill={url(p.col)} />
                <Path
                  d={`M ${t.x - 6} 20 V ${t.y0} M ${t.x + 6} 20 V ${t.y0}`}
                  stroke={c.glassEdge}
                  strokeWidth={1.5}
                />
              </G>
            ))}
            {/* The tube: water inside the glass, narrowing to the throat. */}
            <Path d={outline(0)} fill={url(p.glass)} />
            <Path d={outline(3)} fill={url(p.liquid)} />
            <Path
              d={outline(0)}
              fill={url(p.sheen)}
              stroke={c.glassEdge}
              strokeWidth={chart.strokeHeavy}
              strokeLinejoin="round"
            />
            {V1 !== undefined ? (
              <G>
                <Arrow
                  x1={28}
                  y1={axis}
                  x2={28 + 66 * (V1 / vMax)}
                  y2={axis}
                  color={c.fluidMark}
                  width={chart.strokeHeavy}
                />
                <HaloText
                  x={30}
                  y={axis + half1 + 30}
                  text={r.label(spec.speed1, 'V₁', 'm/s') ?? ''}
                  c={c}
                  size={chart.label}
                  anchor="start"
                />
              </G>
            ) : null}
            {V2 !== undefined ? (
              <G>
                <Arrow
                  x1={xs.th0 + 2}
                  y1={axis}
                  x2={xs.th0 + 2 + 46 * (V2 / vMax)}
                  y2={axis}
                  color={c.fluidMark}
                  width={chart.strokeHeavy}
                />
                <HaloText
                  x={col2}
                  y={axis + half1 + 30}
                  text={r.label(spec.speed2, 'V₂', 'm/s') ?? ''}
                  c={c}
                  size={chart.label}
                />
              </G>
            ) : null}
            <HaloText
              x={col1}
              y={axis + half1 + 14}
              text={r.label(spec.inlet, 'D₁', 'm') ?? ''}
              c={c}
              size={chart.label}
            />
            <HaloText
              x={col2}
              y={axis + half1 + 14}
              text={r.label(spec.throat, 'D₂', 'm') ?? ''}
              c={c}
              size={chart.label}
            />
            {Q !== undefined ? (
              <HaloText
                x={BW - 8}
                y={axis - half1 - 10}
                text={r.label(spec.flow, 'Q', 'm³/s') ?? ''}
                c={c}
                size={chart.label}
                bold
                anchor="end"
              />
            ) : null}
            {/* The heads differ by Δh = ΔP ÷ ρg (to the metre scale). */}
            {top1 !== undefined && pos(dh) ? (
              <G>
                <Line
                  x1={col1 - 10}
                  y1={top1}
                  x2={col2 + 30}
                  y2={top1}
                  stroke={c.chartMuted}
                  strokeDasharray={chart.dash}
                />
                <Line
                  x1={col2 - 10}
                  y1={top2}
                  x2={col2 + 30}
                  y2={top2}
                  stroke={c.chartMuted}
                  strokeDasharray={chart.dash}
                />
                <Dimension x1={col2 + 26} y1={top1} x2={col2 + 26} y2={top2} color={c.chartInk} />
                <HaloText
                  x={col2 + 34}
                  y={(top1 + top2) / 2 - 3}
                  text={`Δh = ${num(dh)} m`}
                  c={c}
                  size={chart.value}
                  bold
                  anchor="start"
                />
                <HaloText
                  x={col2 + 34}
                  y={(top1 + top2) / 2 + 13}
                  text={r.label(spec.difference, 'ΔP', 'Pa') ?? ''}
                  c={c}
                  size={chart.label}
                  anchor="start"
                />
              </G>
            ) : null}
          </G>
        )}
        handles={(k) =>
          canDrag ? (
            <DragHandle
              testID="drag-throat"
              x={col2 * k + 22 * k}
              y={(axis - half2) * k}
              label={r.rep.variable(throatId!).name}
              onStart={() => {
                drag.current = { D2: D2! };
                frame.freeze();
              }}
              onEnd={frame.release}
              onMove={(_, dy) => {
                const px = Math.max(4, (W1 * drag.current.D2) / D1! - (2 * dy) / k);
                calc.set(
                  {
                    ...(spec.keep
                      ? r.rep.pin(spec.keep)
                      : r.rep.pinTyped(ids(spec.inlet, spec.density, spec.difference))),
                    [throatId!]: r.fromSi(throatId!, (px / W1) * D1!),
                  },
                  r.rep.slide(throatId!),
                );
              }}
            />
          ) : null
        }
      />
      <Caption>
        {!narrower
          ? 'The throat must be narrower than the inlet: there the water speeds up and its pressure falls.'
          : V1 !== undefined &&
              V2 !== undefined &&
              pos(D1) &&
              pos(D2) &&
              pos(rho) &&
              dP !== undefined
            ? `A₁V₁ = A₂V₂, so V₂ = V₁(D₁ ÷ D₂)² = ${num(V1)} × ${num((D1 / D2) ** 2)} = ${num(V2)} m/s. ΔP = ½ρ(V₂² − V₁²) = ½ × ${num(rho)} × (${num(V2)}² − ${num(V1)}²) = ${num(dP)} Pa. Q = A₁V₁ = ${num(Q ?? NaN)} m³/s.`
            : 'Type both diameters, the density and the pressure difference to find the flow.'}
      </Caption>
    </View>
  );
}

// ── pitot ──

export function FluidPitot({ spec, calc }: { spec: FluidPitotSpec; calc: Calculator }) {
  const c = usePalette();
  const r = useFluidReader(calc, spec.g);
  const p = usePaintIds('steel', 'stream', 'glass', 'gauge', 'col');
  const paint = fluidPaint(c, spec.fluid ?? 'air');
  const gaugePaint = fluidPaint(c, spec.gaugeFluid ?? 'water');
  const V = r.si(spec.speed);
  const dP = r.si(spec.difference);
  const rho = r.si(spec.density);
  const rhoM = r.si(spec.gaugeDensity);
  const h =
    dP !== undefined && pos(rhoM) && pos(rho) && rhoM > rho ? dP / ((rhoM - rho) * r.g) : undefined;
  const axis = 150;
  const [top, bottom] = [70, 230];
  const nose = 92;
  const stem = 214;
  const gx = [266, 314];
  const base = 268;
  const s = pos(h) ? 120 / h : 0;
  const yLevelL = pos(h) ? 200 + (h * s) / 2 : 200;
  const yLevelR = pos(h) ? 200 - (h * s) / 2 : 200;
  const air = (spec.fluid ?? 'air') === 'air';
  return (
    <View>
      <Board
        height={300}
        draw={() => (
          <G>
            <Defs>
              <Metal id={p.steel} light={c.metal} dark={c.metalDark} />
              <Deepen id={p.stream} from={paint.top} to={paint.deep} />
              <Glass id={p.glass} />
              <Deepen id={p.gauge} from={gaugePaint.top} to={gaugePaint.deep} />
              <Sheen id={p.col} />
            </Defs>
            {/* The stream, flowing right; streamlines part round the nose. */}
            <Rect
              x={6}
              y={top}
              width={240}
              height={bottom - top}
              rx={6}
              fill={url(p.stream)}
              stroke={air ? c.fluidStream : 'none'}
              strokeDasharray={air ? chart.dashFine : undefined}
            />
            {[-56, -34, -14, 14, 34, 56].map((dy) => {
              const bend = Math.abs(dy) < 20 ? Math.sign(dy) * 10 : 0;
              return (
                <Path
                  key={dy}
                  d={`M 14 ${axis + dy} H ${nose - 34} Q ${nose - 10} ${axis + dy} ${nose} ${axis + dy + bend} H 238`}
                  stroke={c.fluidStream}
                  strokeWidth={1.5}
                  fill="none"
                />
              );
            })}
            {/* The probe: steel, its nose facing the stream, its stem rising out. */}
            <Path
              d={`M ${nose} ${axis - 7} H ${stem + 7} V 18 H ${stem - 7} V ${axis + 7} H ${nose} A 7 7 0 0 1 ${nose} ${axis - 7} Z`}
              fill={url(p.steel)}
              stroke={c.metalDark}
              strokeWidth={1.5}
            />
            <Rect x={nose - 9} y={axis - 3} width={5} height={6} rx={2} fill={c.chartInk} />
            {[132, 150].map((x) => (
              <G key={x}>
                <Rect x={x} y={axis - 8} width={4} height={3} fill={c.chartInk} />
                <Rect x={x} y={axis + 5} width={4} height={3} fill={c.chartInk} />
              </G>
            ))}
            <HaloText
              x={nose - 6}
              y={axis + 30}
              text="Stagnation P₀"
              c={c}
              size={chart.label}
              anchor="middle"
            />
            <HaloText
              x={142}
              y={axis - 18}
              text="Static P"
              c={c}
              size={chart.label}
              anchor="middle"
            />
            {V !== undefined ? (
              <G>
                <Arrow
                  x1={14}
                  y1={top + 18}
                  x2={74}
                  y2={top + 18}
                  color={c.chartInk}
                  width={chart.strokeHeavy}
                />
                <HaloText
                  x={14}
                  y={top - 8}
                  text={r.label(spec.speed, 'V', 'm/s') ?? ''}
                  c={c}
                  size={chart.value}
                  bold
                  anchor="start"
                />
              </G>
            ) : null}
            <HaloText
              x={14}
              y={bottom + 18}
              text={r.label(spec.density, 'ρ', 'kg/m³') ?? ''}
              c={c}
              size={chart.label}
              anchor="start"
            />
            {/* The two pressures to a gauge: a U-tube when the page names its fluid. */}
            {rhoM !== undefined ? (
              <G>
                <Path
                  d={`M ${stem - 3} 18 V 10 H ${gx[0]} V 120 M ${stem + 3} 22 H ${gx[1]} V 120`}
                  stroke={c.metalDark}
                  strokeWidth={2}
                  fill="none"
                />
                <Rect x={gx[0]! - 6} y={110} width={12} height={base - 110} fill={url(p.glass)} />
                <Rect x={gx[1]! - 6} y={110} width={12} height={base - 110} fill={url(p.glass)} />
                <Rect
                  x={gx[0]! - 6}
                  y={base - 6}
                  width={gx[1]! - gx[0]! + 12}
                  height={12}
                  rx={6}
                  fill={url(p.glass)}
                />
                {pos(h) ? (
                  <G fill={url(p.gauge)}>
                    <Rect x={gx[0]! - 5} y={yLevelL} width={10} height={base - yLevelL} />
                    <Rect x={gx[1]! - 5} y={yLevelR} width={10} height={base - yLevelR} />
                    <Rect
                      x={gx[0]! - 5}
                      y={base - 5}
                      width={gx[1]! - gx[0]! + 10}
                      height={10}
                      rx={5}
                    />
                  </G>
                ) : null}
                <Rect x={gx[0]! - 6} y={110} width={12} height={base - 110} fill={url(p.col)} />
                <Rect x={gx[1]! - 6} y={110} width={12} height={base - 110} fill={url(p.col)} />
                {pos(h) ? (
                  <G>
                    <Dimension
                      x1={gx[1]! + 14}
                      y1={yLevelL}
                      x2={gx[1]! + 14}
                      y2={yLevelR}
                      color={c.chartInk}
                    />
                    <HaloText
                      x={gx[1]! + 8}
                      y={yLevelR - 12}
                      text={`h = ${num(h)} m`}
                      c={c}
                      size={chart.label}
                      bold
                      anchor="end"
                    />
                  </G>
                ) : null}
                <HaloText
                  x={(gx[0]! + gx[1]!) / 2}
                  y={base + 24}
                  text={r.label(spec.gaugeDensity, 'ρ_m', 'kg/m³') ?? ''}
                  c={c}
                  size={chart.label}
                />
              </G>
            ) : null}
            {dP !== undefined ? (
              <HaloText
                x={BW - 6}
                y={14}
                text={r.label(spec.difference, 'P₀ − P', 'Pa') ?? ''}
                c={c}
                size={chart.value}
                bold
                anchor="end"
              />
            ) : null}
          </G>
        )}
      />
      <Caption>
        {V !== undefined && dP !== undefined && pos(rho)
          ? `The stream stops at the nose: P₀ − P = ½ρV², so V = √(2ΔP ÷ ρ) = √(2 × ${num(dP)} ÷ ${num(rho)}) = ${num(V)} m/s.${
              pos(h) && pos(rhoM) ? ` The gauge reads h = ΔP ÷ ((ρ_m − ρ)g) = ${num(h)} m.` : ''
            }`
          : 'Type the pressure difference and the density to find the speed.'}
      </Caption>
    </View>
  );
}

// ── jet ──

export function FluidJet({ spec, calc }: { spec: FluidJetSpec; calc: Calculator }) {
  const c = usePalette();
  const r = useFluidReader(calc, spec.g);
  const p = usePaintIds('steel', 'water', 'vane');
  const V = r.si(spec.speed);
  const th = r.si(spec.angle);
  const A = r.si(spec.area);
  const rho = r.si(spec.density);
  const mdot = r.si(spec.massFlow) ?? (pos(rho) && pos(V) && pos(A) ? rho * V * A : undefined);
  const F = mdot !== undefined && pos(V) && th !== undefined ? jetForce(mdot, V, th) : undefined;
  const Fx = r.si(spec.forceX) ?? F?.Fx;
  const Fy = r.si(spec.forceY) ?? F?.Fy;
  const drag = useRef({ x: 0, y: 0 });
  const yJ = 220;
  const xv = 150;
  const R = 40;
  const C = { x: xv, y: yJ - R };
  const t = ((th ?? 90) * Math.PI) / 180;
  const at = (rad: number, phi: number) => ({
    x: C.x + rad * Math.sin(phi),
    y: C.y + rad * Math.cos(phi),
  });
  const end = at(R, t);
  const out = { x: end.x + 74 * Math.cos(t), y: end.y - 74 * Math.sin(t) };
  const arc = (rad: number, a0: number, a1: number) => {
    const n = 24;
    return Array.from({ length: n + 1 }, (_, i) => {
      const q = at(rad, a0 + ((a1 - a0) * i) / n);
      return `${i ? 'L' : 'M'} ${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
    }).join(' ');
  };
  const fScale = mdot !== undefined && pos(V) ? 72 / (2 * mdot * V) : 0;
  const mid = at(R + 12, t / 2);
  const angleId = typeof spec.angle === 'string' ? spec.angle : undefined;
  const canDrag = !spec.fixed && !!angleId && th !== undefined;
  return (
    <View>
      <Board
        height={300}
        draw={() => (
          <G>
            <Defs>
              <Metal id={p.steel} light={c.metal} dark={c.metalDark} />
              <Deepen id={p.water} from={c.water} to={c.waterDeep} />
            </Defs>
            {/* The control volume round the vane, dashed. */}
            <Rect
              x={xv - 34}
              y={yJ - 2 * R - 46}
              width={2 * R + 78}
              height={2 * R + 82}
              fill="none"
              stroke={c.chartMuted}
              strokeWidth={1.5}
              strokeDasharray={chart.dash}
            />
            <HaloText
              x={xv + R + 42}
              y={yJ + 52}
              text="Control volume"
              c={c}
              size={chart.label}
              anchor="end"
              fill={c.chartMuted}
            />
            {/* The nozzle, and the jet: in along x, round the vane, out at θ. */}
            <Path
              d={`M 8 ${yJ - 16} L 46 ${yJ - 9} V ${yJ + 9} L 8 ${yJ + 16} Z`}
              fill={url(p.steel)}
              stroke={c.metalDark}
              strokeWidth={1.5}
            />
            <Path
              d={`M 46 ${yJ} H ${xv} ${th !== undefined ? arc(R, 0, t).replace(/^M/, 'L') : ''} ${th !== undefined ? `L ${out.x} ${out.y}` : ''}`}
              stroke={url(p.water)}
              strokeWidth={12}
              fill="none"
              strokeLinejoin="round"
            />
            {th !== undefined ? (
              <G>
                <Path
                  d={arc(R + 10, -0.12, t + 0.12)}
                  stroke={url(p.steel)}
                  strokeWidth={8}
                  fill="none"
                  strokeLinecap="round"
                />
                <Path
                  d={arc(R + 10, -0.12, t + 0.12)}
                  stroke={c.metalDark}
                  strokeWidth={1}
                  fill="none"
                />
                <Arrow
                  x1={end.x + 30 * Math.cos(t)}
                  y1={end.y - 30 * Math.sin(t)}
                  x2={end.x + 62 * Math.cos(t)}
                  y2={end.y - 62 * Math.sin(t)}
                  color={c.fluidMark}
                  width={2}
                  head={7}
                />
                <HaloText
                  x={out.x + (Math.cos(t) >= 0 ? 6 : -6)}
                  y={out.y - 6}
                  text={r.label(spec.angle, 'θ', '°') ?? ''}
                  c={c}
                  size={chart.value}
                  bold
                  anchor={Math.cos(t) >= 0 ? 'start' : 'end'}
                />
              </G>
            ) : null}
            <Arrow x1={60} y1={yJ} x2={100} y2={yJ} color={c.fluidMark} width={2} head={7} />
            <HaloText
              x={10}
              y={yJ + 36}
              text={r.label(spec.speed, 'V', 'm/s') ?? ''}
              c={c}
              size={chart.label}
              anchor="start"
            />
            {A !== undefined ? (
              <HaloText
                x={10}
                y={yJ + 52}
                text={r.label(spec.area, 'A', 'm²') ?? ''}
                c={c}
                size={chart.label}
                anchor="start"
              />
            ) : null}
            {mdot !== undefined ? (
              <HaloText
                x={10}
                y={yJ - 26}
                text={r.label(spec.massFlow, 'ṁ', 'kg/s') ?? `ṁ = ${num(mdot)} kg/s`}
                c={c}
                size={chart.label}
                anchor="start"
              />
            ) : null}
            {/* The force of the jet on the vane: downstream, and against the turn. */}
            {Fx !== undefined && Fy !== undefined && th !== undefined ? (
              <G>
                <Arrow
                  x1={mid.x}
                  y1={mid.y}
                  x2={mid.x + Fx * fScale}
                  y2={mid.y}
                  color={c.forceApplied}
                  width={chart.strokeHeavy}
                  head={10}
                />
                <Arrow
                  x1={mid.x}
                  y1={mid.y}
                  x2={mid.x}
                  y2={mid.y + Fy * fScale}
                  color={c.forceWeight}
                  width={chart.strokeHeavy}
                  head={10}
                />
                <HaloText
                  x={mid.x + Fx * fScale + 4}
                  y={mid.y - 8}
                  text={r.label(spec.forceX, 'Fₓ', 'N') ?? ''}
                  c={c}
                  size={chart.label}
                  bold
                  anchor={mid.x + Fx * fScale > BW - 90 ? 'end' : 'start'}
                />
                <HaloText
                  x={mid.x + 6}
                  y={Math.min(292, mid.y + Fy * fScale + 14)}
                  text={r.label(spec.forceY, 'F_y', 'N') ?? ''}
                  c={c}
                  size={chart.label}
                  bold
                  anchor="start"
                />
              </G>
            ) : null}
          </G>
        )}
        handles={(k) =>
          canDrag ? (
            <DragHandle
              testID="drag-angle"
              x={at(R + 10, t).x * k}
              y={at(R + 10, t).y * k}
              label={r.rep.variable(angleId!).name}
              onStart={() => {
                drag.current = at(R + 10, t);
              }}
              onMove={(dx, dy) => {
                const x = drag.current.x + dx / k - C.x;
                const y = drag.current.y + dy / k - C.y;
                const deg = Math.min(180, Math.max(1, (Math.atan2(x, y) * 180) / Math.PI));
                calc.set(
                  {
                    ...(spec.keep
                      ? r.rep.pin(spec.keep)
                      : r.rep.pinTyped(ids(spec.speed, spec.area, spec.density))),
                    [angleId!]: r.fromSi(angleId!, deg < 0 ? deg + 360 : deg),
                  },
                  r.rep.slide(angleId!),
                );
              }}
            />
          ) : null
        }
      />
      <Caption>
        {mdot !== undefined && pos(V) && th !== undefined && F
          ? `${pos(rho) && pos(A) ? `ṁ = ρVA = ${num(rho)} × ${num(V)} × ${num(A)} = ${num(mdot)} kg/s. ` : ''}Fₓ = ṁV(1 − cos θ) = ${num(mdot)} × ${num(V)} × (1 − cos ${num(th)}°) = ${num(F.Fx)} N. F_y = ṁV sin θ = ${num(F.Fy)} N, against the turn.`
          : 'Type the jet’s speed, area and the turning angle to find the force.'}
      </Caption>
    </View>
  );
}
