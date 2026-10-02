/**
 * `fluidSystem` statics (HC6): pressure at a depth (`tank`), a differential manometer
 * (`manometer`), a submerged gate (`gate`) and a floating body (`buoyancy`). Water in glass,
 * a steel gate, a wooden or ice block; the pressure bars and prisms are flat.
 */
import { useRef } from 'react';
import { View } from 'react-native';
import { Defs, G, Line, Path, Rect } from 'react-native-svg';

import type {
  FluidBuoyancySpec,
  FluidGateSpec,
  FluidManometerSpec,
  FluidTankSpec,
} from '@/data/modules/typesHe1g';
import { chart, usePalette } from '@/theme';

import { HaloText } from '../layouts/earthKit';
import type { Calculator } from '../useCalculator';
import { Caption, DragHandle, useFrozen } from './common';
import {
  Arrow,
  Board,
  BW,
  Dimension,
  fluidPaint,
  niceStep,
  num,
  pos,
  useFluidReader,
  type FluidReader,
} from './fluidKit';
import { gateOf } from './fluidMath';
import { Deepen, Glass, Metal, Sheen, TopLight, url, usePaintIds } from './paint';

const ids = (...xs: (string | number | undefined)[]) =>
  xs.filter((x): x is string => typeof x === 'string');

/** The values a drag pins: the page's `keep`, or the typed values it doesn't move. */
const pinsOf = (r: FluidReader, keep: string[] | undefined, inputs: string[]) =>
  keep ? r.rep.pin(keep) : r.rep.pinTyped(inputs);

/** A ruler of depth ticks down from `y0` at `s` px per metre, labels at the left of `x`. */
function DepthTicks({
  x,
  y0,
  s,
  to,
  c,
}: {
  x: number;
  y0: number;
  s: number;
  to: number;
  c: ReturnType<typeof usePalette>;
}) {
  const step = niceStep(to, 4);
  const marks = Array.from({ length: Math.floor(to / step + 1e-9) + 1 }, (_, i) => i * step);
  return (
    <G>
      <Line x1={x} y1={y0} x2={x} y2={y0 + to * s} stroke={c.chartMuted} strokeWidth={1} />
      {marks.map((m) => (
        <G key={m}>
          <Line x1={x - 5} y1={y0 + m * s} x2={x} y2={y0 + m * s} stroke={c.chartMuted} />
          <HaloText
            x={x - 7}
            y={y0 + m * s + 4}
            text={num(m)}
            c={c}
            size={chart.label}
            anchor="end"
            fill={c.chartMuted}
          />
        </G>
      ))}
    </G>
  );
}

// ── tank ──

export function FluidTank({ spec, calc }: { spec: FluidTankSpec; calc: Calculator }) {
  const c = usePalette();
  const r = useFluidReader(calc, spec.g);
  const p = usePaintIds('glass', 'sheen', 'liquid', 'top');
  const paint = fluidPaint(c, spec.fluid);
  const h = r.si(spec.depth);
  const rho = r.si(spec.density);
  const atm = r.si(spec.atm);
  const gauge = r.si(spec.gauge) ?? (pos(h) && pos(rho) ? rho * r.g * h : undefined);
  const abs =
    r.si(spec.absolute) ?? (gauge !== undefined && atm !== undefined ? atm + gauge : undefined);
  const frame = useFrozen(pos(h) ? h * 1.25 : 1);
  const span = frame.value;
  const drag = useRef({ h: 0 });
  const [top, bottom] = [64, 274];
  const s = (bottom - top) / span;
  const [x0, x1] = [56, 190];
  const yP = pos(h) ? top + h * s : undefined;
  const cx = (x0 + x1) / 2;
  // The pressure bar: 0 at the floor, P_abs (or P_gauge) at the top of its room.
  const pMax = Math.max(abs ?? 0, gauge ?? 0, atm ?? 0) * 1.08 || 1;
  const ps = (bottom - top) / pMax;
  const bx = 212;
  const depthId = typeof spec.depth === 'string' ? spec.depth : undefined;
  const canDrag = !spec.fixed && !!depthId && pos(h);
  const parts: { from: number; to: number; fill: string; sym?: string; val?: string }[] = [];
  if (atm !== undefined)
    parts.push({ from: 0, to: atm, fill: c.chartFill, sym: 'P_atm', val: r.text(spec.atm) });
  if (gauge !== undefined) {
    const base = atm ?? 0;
    parts.push({
      from: base,
      to: base + gauge,
      fill: c.chartHighlight,
      sym: 'P_gauge = ρgh',
      val: r.text(spec.gauge) ?? `${num(gauge / 1000)} kPa`,
    });
  }
  return (
    <View>
      <Board
        height={300}
        draw={() => (
          <G>
            <Defs>
              <Glass id={p.glass} />
              <Sheen id={p.sheen} />
              <Deepen id={p.liquid} from={paint.top} to={paint.deep} />
              <TopLight id={p.top} />
            </Defs>
            {/* The tank: glass walls, the liquid to just past the point. */}
            <Rect
              x={x0}
              y={top - 26}
              width={x1 - x0}
              height={bottom - top + 26}
              fill={url(p.glass)}
            />
            <Rect x={x0} y={top} width={x1 - x0} height={bottom - top} fill={url(p.liquid)} />
            <Rect x={x0} y={top} width={x1 - x0} height={bottom - top} fill={url(p.top)} />
            <Line x1={x0} y1={top} x2={x1} y2={top} stroke={c.waterTop} strokeWidth={3} />
            <Rect
              x={x0}
              y={top - 26}
              width={x1 - x0}
              height={bottom - top + 26}
              fill={url(p.sheen)}
            />
            <Path
              d={`M ${x0} ${top - 26} V ${bottom} H ${x1} V ${top - 26}`}
              stroke={c.glassEdge}
              strokeWidth={chart.strokeHeavy}
              fill="none"
            />
            <HaloText x={cx} y={top - 8} text="Surface" c={c} size={chart.label} />
            {pos(h) ? <DepthTicks x={x0 - 6} y0={top} s={s} to={span} c={c} /> : null}
            {pos(h) ? (
              <HaloText x={x0 - 6} y={top - 30} text="m" c={c} size={chart.label} anchor="end" />
            ) : null}
            {yP !== undefined ? (
              <G>
                <Dimension x1={cx + 30} y1={top} x2={cx + 30} y2={yP} color={c.fluidMark} />
                {/* Pressure pushes on the point from every side. */}
                {[0, 90, 180, 270].map((a) => {
                  const t = (a * Math.PI) / 180;
                  return (
                    <Arrow
                      key={a}
                      x1={cx + Math.cos(t) * 22}
                      y1={yP + Math.sin(t) * 22}
                      x2={cx + Math.cos(t) * 8}
                      y2={yP + Math.sin(t) * 8}
                      color={c.fluidMark}
                      head={6}
                    />
                  );
                })}
                <Rect
                  x={cx - 5}
                  y={yP - 5}
                  width={10}
                  height={10}
                  rx={5}
                  fill={c.chartHighlight}
                  stroke={c.fluidMark}
                  strokeWidth={2}
                />
                <HaloText
                  x={cx + 36}
                  y={top + (yP - top) / 2 + 5}
                  text={r.label(spec.depth, 'h', 'm') ?? ''}
                  c={c}
                  size={chart.value}
                  bold
                  anchor="start"
                />
              </G>
            ) : null}
            {/* P_atm and P_gauge stacked: P_abs. */}
            {parts.map((q) => (
              <G key={q.sym}>
                <Rect
                  x={bx}
                  y={bottom - q.to * ps}
                  width={26}
                  height={(q.to - q.from) * ps}
                  fill={q.fill}
                  stroke={c.chartInk}
                  strokeWidth={1}
                />
                <HaloText
                  x={bx + 32}
                  y={bottom - ((q.from + q.to) / 2) * ps - 2}
                  text={q.sym ?? ''}
                  c={c}
                  size={chart.label}
                  anchor="start"
                />
                {q.val ? (
                  <HaloText
                    x={bx + 32}
                    y={bottom - ((q.from + q.to) / 2) * ps + 14}
                    text={q.val}
                    c={c}
                    size={chart.label}
                    bold
                    anchor="start"
                  />
                ) : null}
              </G>
            ))}
            {abs !== undefined && atm !== undefined ? (
              <G>
                <Line
                  x1={bx - 4}
                  y1={bottom - abs * ps}
                  x2={bx + 30}
                  y2={bottom - abs * ps}
                  stroke={c.chartInk}
                  strokeWidth={2}
                />
                <HaloText
                  x={bx + 13}
                  y={bottom - abs * ps - 8}
                  text={`P_abs = ${r.text(spec.absolute) ?? `${num(abs / 1000)} kPa`}`}
                  c={c}
                  size={chart.label}
                  bold
                />
              </G>
            ) : null}
            <Line
              x1={bx - 4}
              y1={bottom}
              x2={BW - 6}
              y2={bottom}
              stroke={c.chartInk}
              strokeWidth={1}
            />
          </G>
        )}
        handles={(k) =>
          canDrag && yP !== undefined ? (
            <DragHandle
              testID="drag-depth"
              x={cx * k}
              y={yP * k}
              label={r.rep.variable(depthId!).name}
              onStart={() => {
                drag.current = { h: h! };
                frame.freeze();
              }}
              onEnd={frame.release}
              onMove={(_, dy) =>
                calc.set(
                  {
                    ...pinsOf(r, spec.keep, ids(spec.density, spec.atm, spec.g)),
                    [depthId!]: r.fromSi(depthId!, Math.max(0, drag.current.h + dy / k / s)),
                  },
                  r.rep.slide(depthId!),
                )
              }
            />
          ) : null
        }
      />
      <Caption>
        {pos(h) && pos(rho) && gauge !== undefined
          ? `P_gauge = ρgh = ${num(rho)} × ${num(r.g)} × ${num(h)} = ${num(gauge)} Pa.${
              atm !== undefined && abs !== undefined
                ? ` P_abs = P_atm + P_gauge = ${num(atm / 1000)} + ${num(gauge / 1000)} = ${num(abs / 1000)} kPa.`
                : ''
            }`
          : 'Type the depth and the density to find the pressure there.'}
      </Caption>
    </View>
  );
}

// ── manometer ──

export function FluidManometer({ spec, calc }: { spec: FluidManometerSpec; calc: Calculator }) {
  const c = usePalette();
  const r = useFluidReader(calc, spec.g);
  const p = usePaintIds('glass', 'sheen', 'pipe', 'pipeSheen', 'liquid', 'gauge');
  const paint = fluidPaint(c, spec.fluid);
  const gaugePaint = fluidPaint(c, spec.gaugeFluid ?? 'mercury');
  const h = r.si(spec.reading);
  const rho = r.si(spec.density);
  const rhoM = r.si(spec.gaugeDensity);
  const dP =
    r.si(spec.difference) ?? (pos(h) && pos(rho) && pos(rhoM) ? (rhoM - rho) * r.g * h : undefined);
  const heavier = !(pos(rho) && pos(rhoM)) || rhoM > rho;
  const frame = useFrozen(pos(h) ? h : 0.1);
  const s = Math.min(1200, 120 / frame.value);
  const drag = useRef({ h: 0 });
  const [xA, xB] = [116, 226];
  const [pipeTop, pipeBot] = [34, 66];
  const base = 290;
  const yL = 236;
  const yR = pos(h) ? yL - h * s : yL;
  const readingId = typeof spec.reading === 'string' ? spec.reading : undefined;
  const canDrag = !spec.fixed && !!readingId && pos(h) && heavier;
  const tube = 14;
  // The U-tube's inside: the two legs and the bend.
  const leg = (x: number, y0: number, y1: number) => (
    <Rect x={x - tube / 2} y={y0} width={tube} height={Math.max(0, y1 - y0)} />
  );
  const u = (fillTop: number, fillTopR: number, fill: string) => (
    <G fill={fill}>
      {leg(xA, fillTop, base - 20)}
      {leg(xB, fillTopR, base - 20)}
      <Path
        d={`M ${xA - tube / 2} ${base - 20} A ${(xB - xA) / 2 + tube / 2} 26 0 0 0 ${xB + tube / 2} ${base - 20} L ${xB - tube / 2} ${base - 20} A ${(xB - xA) / 2 - tube / 2} 14 0 0 1 ${xA + tube / 2} ${base - 20} Z`}
      />
    </G>
  );
  return (
    <View>
      <Board
        height={318}
        draw={() => (
          <G opacity={heavier ? 1 : 0.4}>
            <Defs>
              <Glass id={p.glass} />
              <Sheen id={p.sheen} />
              <Sheen id={p.pipeSheen} vertical />
              <Metal id={p.pipe} light={c.metal} dark={c.metalDark} />
              <Deepen id={p.liquid} from={paint.top} to={paint.deep} />
              <Deepen id={p.gauge} from={gaugePaint.top} to={gaugePaint.deep} />
            </Defs>
            {/* The pipe, flowing left to right, with the fluid in it. */}
            <Rect
              x={14}
              y={pipeTop - 6}
              width={BW - 28}
              height={pipeBot - pipeTop + 12}
              rx={4}
              fill={c.metal}
              stroke={c.metalDark}
            />
            <Rect
              x={14}
              y={pipeTop}
              width={BW - 28}
              height={pipeBot - pipeTop}
              fill={url(p.liquid)}
            />
            <Rect
              x={14}
              y={pipeTop - 6}
              width={BW - 28}
              height={pipeBot - pipeTop + 12}
              fill={url(p.pipeSheen)}
            />
            <Arrow
              x1={30}
              y1={(pipeTop + pipeBot) / 2}
              x2={78}
              y2={(pipeTop + pipeBot) / 2}
              color={c.fluidMark}
            />
            {/* The taps and the glass U-tube: the pipe's fluid down to the gauge fluid. */}
            {u(pipeBot, pipeBot, url(p.glass))}
            {u(pipeBot, pipeBot, url(p.liquid))}
            {u(yL, yR, url(p.gauge))}
            <Line
              x1={xA - tube / 2}
              y1={yL}
              x2={xA + tube / 2}
              y2={yL}
              stroke={c.chartInk}
              strokeWidth={1.5}
            />
            <Line
              x1={xB - tube / 2}
              y1={yR}
              x2={xB + tube / 2}
              y2={yR}
              stroke={c.chartInk}
              strokeWidth={1.5}
            />
            {u(pipeBot, pipeBot, url(p.sheen))}
            <HaloText
              x={xA - 14}
              y={pipeBot + 22}
              text="A"
              c={c}
              size={chart.value}
              bold
              anchor="end"
            />
            <HaloText
              x={xB + 14}
              y={pipeBot + 22}
              text="B"
              c={c}
              size={chart.value}
              bold
              anchor="start"
            />
            {/* The reading h between the two levels, and a level line across. */}
            <Line
              x1={xA - 30}
              y1={yL}
              x2={xB + 30}
              y2={yL}
              stroke={c.chartMuted}
              strokeDasharray={chart.dash}
            />
            {pos(h) ? (
              <G>
                <Dimension x1={xB + 26} y1={yL} x2={xB + 26} y2={yR} color={c.chartInk} />
                <HaloText
                  x={xB + 34}
                  y={(yL + yR) / 2 + 5}
                  text={r.label(spec.reading, 'h', 'm') ?? ''}
                  c={c}
                  size={chart.value}
                  bold
                  anchor="start"
                />
              </G>
            ) : null}
            <HaloText
              x={(xA + xB) / 2}
              y={base + 18}
              text={r.label(spec.gaugeDensity, 'ρ_m', 'kg/m³') ?? 'ρ_m'}
              c={c}
              size={chart.label}
            />
            <HaloText
              x={BW - 20}
              y={pipeTop - 12}
              text={r.label(spec.density, 'ρ', 'kg/m³') ?? 'ρ'}
              c={c}
              size={chart.label}
              anchor="end"
            />
            {dP !== undefined ? (
              <HaloText
                x={20}
                y={pipeTop - 12}
                text={`P_A − P_B = ${r.text(spec.difference) ?? `${num(dP)} Pa`}`}
                c={c}
                size={chart.value}
                bold
                anchor="start"
              />
            ) : null}
          </G>
        )}
        handles={(k) =>
          canDrag ? (
            <DragHandle
              testID="drag-reading"
              x={xB * k}
              y={yR * k}
              label={r.rep.variable(readingId!).name}
              onStart={() => {
                drag.current = { h: h! };
                frame.freeze();
              }}
              onEnd={frame.release}
              onMove={(_, dy) =>
                calc.set(
                  {
                    ...pinsOf(r, spec.keep, ids(spec.density, spec.gaugeDensity)),
                    [readingId!]: r.fromSi(readingId!, Math.max(0, drag.current.h - dy / k / s)),
                  },
                  r.rep.slide(readingId!),
                )
              }
            />
          ) : null
        }
      />
      <Caption>
        {!heavier
          ? 'The gauge fluid must be heavier than the fluid in the pipe, or it would rise into it.'
          : pos(h) && pos(rho) && pos(rhoM) && dP !== undefined
            ? `ΔP = (ρ_m − ρ)gh = (${num(rhoM)} − ${num(rho)}) × ${num(r.g)} × ${num(h)} = ${num(dP)} Pa. The level under the higher pressure (A) is pushed down.`
            : 'Type the reading and both densities to find the pressure difference.'}
      </Caption>
    </View>
  );
}

// ── gate ──

export function FluidGate({ spec, calc }: { spec: FluidGateSpec; calc: Calculator }) {
  const c = usePalette();
  const r = useFluidReader(calc, spec.g);
  const p = usePaintIds('liquid', 'top', 'steel', 'wall');
  const b = r.si(spec.width);
  const H = r.si(spec.height);
  const d = r.si(spec.top);
  const rho = r.si(spec.density);
  const geo = pos(H) && d !== undefined && d >= 0 ? gateOf(rho ?? 1, r.g, b ?? 1, H, d) : undefined;
  const frame = useFrozen(geo ? (d! + H!) * 1.18 : 1);
  const span = frame.value;
  const drag = useRef({ d: 0 });
  const [surf, floor] = [52, 282];
  const s = (floor - surf) / span;
  const wall = 206;
  const y = (depth: number) => surf + depth * s;
  const prism = 118 / Math.max(span, 1e-9);
  const topId = typeof spec.top === 'string' ? spec.top : undefined;
  const canDrag = !spec.fixed && !!topId && !!geo;
  const F = r.si(spec.force) ?? (geo && pos(rho) && pos(b) ? geo.F : undefined);
  return (
    <View>
      <Board
        height={318}
        draw={() => (
          <G>
            <Defs>
              <Deepen id={p.liquid} from={c.water} to={c.waterDeep} />
              <TopLight id={p.top} />
              <Metal id={p.steel} light={c.metal} dark={c.metalDark} />
              <Deepen id={p.wall} from={c.fluidConcrete} to={c.fluidConcreteDark} />
            </Defs>
            {/* The reservoir, side view, and its wall. */}
            <Rect x={8} y={surf} width={wall - 8} height={floor - surf} fill={url(p.liquid)} />
            <Line x1={8} y1={surf} x2={wall} y2={surf} stroke={c.waterTop} strokeWidth={3} />
            <Rect x={wall} y={surf - 22} width={16} height={floor - surf + 22} fill={url(p.wall)} />
            <Rect x={8} y={floor} width={wall + 8} height={10} fill={url(p.wall)} />
            <HaloText x={20} y={surf - 8} text="Surface" c={c} size={chart.label} anchor="start" />
            {geo ? (
              <G>
                {/* The gate in the wall, steel. */}
                <Rect
                  x={wall}
                  y={y(d!)}
                  width={16}
                  height={H! * s}
                  fill={url(p.steel)}
                  stroke={c.metalDark}
                />
                <Rect x={wall} y={y(d!)} width={16} height={H! * s} fill={url(p.top)} />
                {/* The pressure prism: ρg × depth across the gate. */}
                <Path
                  d={`M ${wall} ${y(d!)} L ${wall - d! * prism} ${y(d!)} L ${wall - (d! + H!) * prism} ${y(d! + H!)} L ${wall} ${y(d! + H!)} Z`}
                  fill={c.chartHighlight}
                  fillOpacity={0.28}
                  stroke={c.fluidMark}
                  strokeWidth={1.5}
                />
                {[0.15, 0.4, 0.65, 0.9].map((t) => {
                  const dep = d! + t * H!;
                  return (
                    <Arrow
                      key={t}
                      x1={wall - dep * prism}
                      y1={y(dep)}
                      x2={wall - 2}
                      y2={y(dep)}
                      color={c.fluidMark}
                      width={1.5}
                      head={6}
                    />
                  );
                })}
                {/* The centroid, and F at the center of pressure (lower). */}
                <Line
                  x1={wall + 16}
                  y1={y(geo.hc)}
                  x2={wall + 40}
                  y2={y(geo.hc)}
                  stroke={c.chartMuted}
                  strokeDasharray={chart.dashFine}
                />
                <Line
                  x1={wall - 8}
                  y1={y(geo.ycp)}
                  x2={wall + 40}
                  y2={y(geo.ycp)}
                  stroke={c.chartInk}
                  strokeDasharray={chart.dash}
                />
                {F !== undefined ? (
                  <G>
                    <Arrow
                      x1={wall - 70}
                      y1={y(geo.ycp)}
                      x2={wall - 1}
                      y2={y(geo.ycp)}
                      color={c.forceApplied}
                      width={chart.strokeHeavy}
                      head={11}
                    />
                    <HaloText
                      x={wall - 72}
                      y={y(geo.ycp) - 10}
                      text={r.label(spec.force, 'F', 'N') ?? `F = ${num(F)} N`}
                      c={c}
                      size={chart.value}
                      bold
                      anchor="end"
                    />
                  </G>
                ) : null}
                {/* Depths at the right of the wall. */}
                <Dimension x1={wall + 26} y1={surf} x2={wall + 26} y2={y(d!)} color={c.chartInk} />
                <Dimension
                  x1={wall + 52}
                  y1={y(d!)}
                  x2={wall + 52}
                  y2={y(d! + H!)}
                  color={c.chartInk}
                />
                <HaloText
                  x={wall + 30}
                  y={Math.max(surf + 14, (surf + y(d!)) / 2 + 5)}
                  text={r.label(spec.top, 'd', 'm') ?? ''}
                  c={c}
                  size={chart.label}
                  anchor="start"
                />
                <HaloText
                  x={wall + 58}
                  y={y(d!) + 16}
                  text={r.label(spec.height, 'H', 'm') ?? ''}
                  c={c}
                  size={chart.label}
                  anchor="start"
                />
                <HaloText
                  x={wall + 46}
                  y={y(geo.hc) + 4}
                  text={r.label(spec.centroid, 'h_c', 'm') ?? 'h_c'}
                  c={c}
                  size={chart.label}
                  anchor="start"
                />
                <HaloText
                  x={wall + 46}
                  y={y(geo.ycp) + 18}
                  text={r.label(spec.center, 'y_cp', 'm') ?? 'y_cp'}
                  c={c}
                  size={chart.label}
                  bold
                  anchor="start"
                />
              </G>
            ) : null}
            <HaloText
              x={wall / 2}
              y={floor + 30}
              text={`${r.label(spec.width, 'b', 'm') ?? 'b'} (into the page)`}
              c={c}
              size={chart.label}
            />
          </G>
        )}
        handles={(k) =>
          canDrag ? (
            <DragHandle
              testID="drag-top"
              x={(wall + 8) * k}
              y={y(d! + H! / 2) * k}
              label={r.rep.variable(topId!).name}
              onStart={() => {
                drag.current = { d: d! };
                frame.freeze();
              }}
              onEnd={frame.release}
              onMove={(_, dy) =>
                calc.set(
                  {
                    ...pinsOf(r, spec.keep, ids(spec.width, spec.height, spec.density)),
                    [topId!]: r.fromSi(topId!, Math.max(0, drag.current.d + dy / k / s)),
                  },
                  r.rep.slide(topId!),
                )
              }
            />
          ) : null
        }
      />
      <Caption>
        {geo && pos(rho) && pos(b) && F !== undefined
          ? `h_c = d + H ÷ 2 = ${num(d!)} + ${num(H!)} ÷ 2 = ${num(geo.hc)} m. F = ρgh_cbH = ${num(rho)} × ${num(r.g)} × ${num(geo.hc)} × ${num(b)} × ${num(H!)} = ${num(F)} N. y_cp = h_c + H² ÷ (12h_c) = ${num(geo.ycp)} m, below the centroid.`
          : 'Type the gate’s size, its depth and the density to find the force.'}
      </Caption>
    </View>
  );
}

// ── buoyancy ──

export function FluidBuoyancy({ spec, calc }: { spec: FluidBuoyancySpec; calc: Calculator }) {
  const c = usePalette();
  const r = useFluidReader(calc, spec.g);
  const p = usePaintIds('glass', 'sheen', 'liquid', 'top', 'body');
  const paint = fluidPaint(c, spec.fluid);
  const V = r.si(spec.volume);
  const rhoB = r.si(spec.bodyDensity);
  const rho = r.si(spec.density);
  const share = pos(rhoB) && pos(rho) ? rhoB / rho : undefined;
  const sinks = share !== undefined && share >= 1;
  const Vsub =
    r.si(spec.submerged) ?? (pos(V) && share !== undefined ? V * Math.min(1, share) : undefined);
  const FB = r.si(spec.buoyant) ?? (Vsub !== undefined && pos(rho) ? rho * r.g * Vsub : undefined);
  const [x0, x1, surf, floor] = [70, 270, 118, 270];
  const side = 92;
  const bx = (x0 + x1) / 2 - side / 2;
  const under = share === undefined ? 0.5 : Math.min(1, share);
  const by = sinks ? floor - side : surf - side * (1 - under);
  const bodyFill = spec.body === 'ice' ? c.fluidIce : c.wood;
  const bodyEdge = spec.body === 'ice' ? c.glassEdge : c.woodDark;
  const arrow = 62;
  const shareText =
    r.text(spec.share) ?? (share !== undefined && !sinks ? `${num(share * 100, 3)}%` : undefined);
  return (
    <View>
      <Board
        height={300}
        draw={() => (
          <G opacity={sinks ? 0.45 : 1}>
            <Defs>
              <Glass id={p.glass} />
              <Sheen id={p.sheen} />
              <Deepen id={p.liquid} from={paint.top} to={paint.deep} />
              <TopLight id={p.top} />
              <Deepen id={p.body} from={bodyFill} to={bodyEdge} />
            </Defs>
            <Rect
              x={x0}
              y={surf - 50}
              width={x1 - x0}
              height={floor - surf + 50}
              fill={url(p.glass)}
            />
            <Rect x={x0} y={surf} width={x1 - x0} height={floor - surf} fill={url(p.liquid)} />
            <Line x1={x0} y1={surf} x2={x1} y2={surf} stroke={c.waterTop} strokeWidth={3} />
            {/* The block; its part under the surface seen through the water. */}
            {pos(V) ? (
              <G>
                <Rect
                  x={bx}
                  y={by}
                  width={side}
                  height={side}
                  fill={url(p.body)}
                  stroke={bodyEdge}
                  strokeWidth={1.5}
                />
                <Rect x={bx} y={by} width={side} height={side} fill={url(p.top)} />
                <Rect
                  x={bx}
                  y={Math.max(by, surf)}
                  width={side}
                  height={by + side - Math.max(by, surf)}
                  fill={paint.deep}
                  fillOpacity={0.35}
                />
                <Rect
                  x={bx}
                  y={Math.max(by, surf)}
                  width={side}
                  height={by + side - Math.max(by, surf)}
                  fill="none"
                  stroke={c.chartHighlight}
                  strokeWidth={2}
                  strokeDasharray={chart.dash}
                />
              </G>
            ) : null}
            <Rect
              x={x0}
              y={surf - 50}
              width={x1 - x0}
              height={floor - surf + 50}
              fill={url(p.sheen)}
            />
            <Path
              d={`M ${x0} ${surf - 50} V ${floor} H ${x1} V ${surf - 50}`}
              stroke={c.glassEdge}
              strokeWidth={chart.strokeHeavy}
              fill="none"
            />
            {/* F_B up from the submerged part's middle; the weight down from the block's. */}
            {pos(V) && FB !== undefined ? (
              <G>
                <Arrow
                  x1={bx + side / 2 + 14}
                  y1={Math.max(by, surf) + (by + side - Math.max(by, surf)) / 2}
                  x2={bx + side / 2 + 14}
                  y2={by - arrow + 30}
                  color={c.forceNormal}
                  width={chart.strokeHeavy}
                  head={10}
                />
                <HaloText
                  x={bx + side / 2 + 22}
                  y={by - arrow + 34}
                  text={r.label(spec.buoyant, 'F_B', 'N') ?? `F_B = ${num(FB)} N`}
                  c={c}
                  size={chart.value}
                  bold
                  anchor="start"
                />
                {!sinks ? (
                  <G>
                    <Arrow
                      x1={bx + side / 2 - 14}
                      y1={by + side / 2}
                      x2={bx + side / 2 - 14}
                      y2={by + side / 2 + arrow}
                      color={c.forceWeight}
                      width={chart.strokeHeavy}
                      head={10}
                    />
                    <HaloText
                      x={bx + side / 2 - 22}
                      y={by + side / 2 + arrow + 4}
                      text={`W = ${num(FB)} N`}
                      c={c}
                      size={chart.value}
                      bold
                      anchor="end"
                    />
                  </G>
                ) : null}
              </G>
            ) : null}
            {pos(V) && shareText && !sinks ? (
              <G>
                <Dimension
                  x1={bx + side + 14}
                  y1={surf}
                  x2={bx + side + 14}
                  y2={by + side}
                  color={c.chartInk}
                />
                <HaloText
                  x={bx + side + 20}
                  y={(surf + by + side) / 2 + 5}
                  text={`${shareText} under`}
                  c={c}
                  size={chart.label}
                  bold
                  anchor="start"
                />
              </G>
            ) : null}
            <HaloText
              x={x0 + 8}
              y={floor + 22}
              text={r.label(spec.volume, 'V', 'm³') ?? ''}
              c={c}
              size={chart.label}
              anchor="start"
            />
            <HaloText
              x={x1 - 8}
              y={floor + 22}
              text={r.label(spec.bodyDensity, 'ρ_body', 'kg/m³') ?? ''}
              c={c}
              size={chart.label}
              anchor="end"
            />
          </G>
        )}
      />
      <Caption>
        {sinks
          ? 'The body is denser than the fluid, so it sinks: F_B = ρgV is less than its weight.'
          : share !== undefined && Vsub !== undefined && FB !== undefined
            ? `Floating: V_sub ÷ V = ρ_body ÷ ρ = ${num(rhoB!)} ÷ ${num(rho!)} = ${num(share, 3)}. F_B = ρgV_sub = ${num(rho!)} × ${num(r.g)} × ${num(Vsub)} = ${num(FB)} N, the block’s weight.`
            : 'Type the volume and both densities to float the block.'}
      </Caption>
    </View>
  );
}
