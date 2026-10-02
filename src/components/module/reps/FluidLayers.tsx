/**
 * `fluidSystem` boundary layers and models (HC6): a flat plate's layer growing along it with two
 * velocity profiles (`plate`), and a prototype beside its model at scale (`model`). The plate,
 * car and hull are painted; the layer edge, profiles and speed arrows are flat.
 */
import { View } from 'react-native';
import { Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { FluidModelSpec, FluidPlateSpec } from '@/data/modules/typesHe1g';
import { chart, usePalette } from '@/theme';

import { HaloText } from '../layouts/earthKit';
import type { Calculator } from '../useCalculator';
import { Caption } from './common';
import { Arrow, Board, BW, Dimension, num, pos, useFluidReader } from './fluidKit';
import { PLATE_LAMINAR_RE, layerAt, modelSpeed, profileAt } from './fluidMath';
import { Deepen, Metal, TopLight, url, usePaintIds } from './paint';

// ── plate ──

export function FluidPlate({ spec, calc }: { spec: FluidPlateSpec; calc: Calculator }) {
  const c = usePalette();
  const r = useFluidReader(calc, spec.g);
  const p = usePaintIds('steel', 'layer');
  const V = r.si(spec.speed);
  const L = r.si(spec.length);
  const nu = r.si(spec.viscosity);
  const turb = !!spec.turbulent;
  const ok = pos(V) && pos(L) && pos(nu);
  const Re = ok ? (V * L) / nu : undefined;
  const dL = r.si(spec.thickness) ?? (ok ? layerAt(L, V, nu, turb) : undefined);
  const wrong = !turb && Re !== undefined && Re >= PLATE_LAMINAR_RE;
  const [x0, x1, yP] = [44, 318, 206];
  const H = 128;
  const sx = ok ? (x1 - x0) / L : 0;
  const sy = ok && pos(dL) ? H / dL : 0;
  const stretch = ok && pos(dL) ? sy / sx : 1;
  const edge = (x: number) => (ok ? layerAt(x, V, nu, turb) * sy : 0);
  const n = 48;
  const curve = Array.from({ length: n + 1 }, (_, i) => {
    const x = (L ?? 1) * (i / n);
    return `${i ? 'L' : 'M'} ${(x0 + x * sx).toFixed(1)} ${(yP - edge(x)).toFixed(1)}`;
  }).join(' ');
  const stations = ok ? [L / 2, L] : [];
  return (
    <View>
      <Board
        height={270}
        draw={() => (
          <G opacity={wrong ? 0.4 : 1}>
            <Defs>
              <Metal id={p.steel} light={c.metal} dark={c.metalDark} />
              <TopLight id={p.layer} />
            </Defs>
            {/* The free stream, V, coming from the left. */}
            {[60, 100, 140, 180].map((y) => (
              <Arrow
                key={y}
                x1={6}
                y1={y}
                x2={34}
                y2={y}
                color={c.fluidStream}
                width={2}
                head={6}
              />
            ))}
            {V !== undefined ? (
              <HaloText
                x={6}
                y={44}
                text={r.label(spec.speed, 'V', 'm/s') ?? ''}
                c={c}
                size={chart.value}
                bold
                anchor="start"
              />
            ) : null}
            {ok ? (
              <G>
                <Path
                  d={`${curve} L ${x1} ${yP} L ${x0} ${yP} Z`}
                  fill={c.chartHighlight}
                  fillOpacity={0.14}
                />
                <Path
                  d={curve}
                  stroke={c.chartHighlight}
                  strokeWidth={chart.strokeHeavy}
                  fill="none"
                />
                {/* Velocity profiles: no slip at the plate, V at the edge. */}
                {stations.map((xs) => {
                  const X = x0 + xs * sx;
                  const h = edge(xs);
                  const w = 52;
                  const pts = Array.from({ length: 25 }, (_, i) => {
                    const e = i / 24;
                    return `${i ? 'L' : 'M'} ${(X - w + w * profileAt(e, turb)).toFixed(1)} ${(yP - e * h).toFixed(1)}`;
                  }).join(' ');
                  return (
                    <G key={xs}>
                      <Line
                        x1={X - w}
                        y1={yP}
                        x2={X - w}
                        y2={yP - h - 10}
                        stroke={c.chartMuted}
                        strokeWidth={1}
                      />
                      {[0.25, 0.5, 0.8].map((e) => (
                        <Arrow
                          key={e}
                          x1={X - w}
                          y1={yP - e * h}
                          x2={X - w + w * profileAt(e, turb)}
                          y2={yP - e * h}
                          color={c.chartInk}
                          width={1.2}
                          head={5}
                        />
                      ))}
                      <Path d={pts} stroke={c.chartInk} strokeWidth={chart.stroke} fill="none" />
                      <Dimension x1={X + 6} y1={yP} x2={X + 6} y2={yP - h} color={c.chartInk} />
                    </G>
                  );
                })}
                <HaloText
                  x={x1 - 2}
                  y={yP - edge(L!) - 10}
                  text={r.label(spec.thickness, 'δ(L)', 'm') ?? `δ(L) = ${num(dL!, 3)} m`}
                  c={c}
                  size={chart.value}
                  bold
                  anchor="end"
                />
                <HaloText
                  x={x0 + (L! / 2) * sx + 10}
                  y={yP - edge(L! / 2) / 2}
                  text={`δ(L/2) = ${num(layerAt(L! / 2, V!, nu!, turb), 3)} m`}
                  c={c}
                  size={chart.label}
                  anchor="start"
                />
              </G>
            ) : null}
            {/* The plate, edge-on. */}
            <Rect
              x={x0}
              y={yP}
              width={x1 - x0}
              height={8}
              rx={2}
              fill={url(p.steel)}
              stroke={c.metalDark}
            />
            <Dimension x1={x0} y1={yP + 22} x2={x1} y2={yP + 22} color={c.chartMuted} />
            <HaloText
              x={(x0 + x1) / 2}
              y={yP + 40}
              text={r.label(spec.length, 'L', 'm') ?? 'L'}
              c={c}
              size={chart.label}
            />
            {Re !== undefined ? (
              <HaloText
                x={BW - 6}
                y={16}
                text={r.label(spec.reynolds, 'Re_L') ?? `Re_L = ${num(Re, 3)}`}
                c={c}
                size={chart.label}
                anchor="end"
              />
            ) : null}
            {ok ? (
              <HaloText
                x={BW - 6}
                y={32}
                text={`${turb ? 'Turbulent' : 'Laminar'} · heights × ${num(stretch, 2)}`}
                c={c}
                size={chart.label}
                anchor="end"
                fill={c.chartMuted}
              />
            ) : null}
          </G>
        )}
      />
      <Caption>
        {wrong
          ? `Re_L = ${num(Re!, 3)} is past 5 × 10⁵: the layer would turn turbulent before the end, so the laminar formula doesn’t hold.`
          : ok && pos(dL)
            ? `Re_L = VL ÷ ν = ${num(Re!, 3)}. ${turb ? `δ = 0.37x ÷ Reₓ⁰·² grows as x⁰·⁸` : `δ = 5x ÷ √Reₓ grows as √x`}: ${num(dL, 3)} m at the end, ${num(layerAt(L / 2, V, nu, turb), 3)} m halfway. Heights are stretched ${num(stretch, 2)} times to be seen.`
            : 'Type the speed, the plate’s length and ν to grow the layer.'}
      </Caption>
    </View>
  );
}

// ── model ──

/** A car's side outline, `len` long, its wheels on y = 0, starting at x = 0. */
const carPath = (len: number) => {
  const h = len * 0.32;
  return `M 0 ${-h * 0.25} C 0 ${-h * 0.55} ${len * 0.06} ${-h * 0.6} ${len * 0.18} ${-h * 0.62} L ${len * 0.32} ${-h} L ${len * 0.68} ${-h} L ${len * 0.86} ${-h * 0.6} C ${len * 0.97} ${-h * 0.55} ${len} ${-h * 0.45} ${len} ${-h * 0.25} L ${len} ${-h * 0.15} L 0 ${-h * 0.15} Z`;
};

/** A ship's hull, `len` long, its waterline at y = 0. */
const hullPath = (len: number) => {
  const h = len * 0.16;
  return `M 0 ${-h * 0.5} L ${len * 0.9} ${-h * 0.5} L ${len} ${-h} L ${len * 0.94} ${h * 0.7} L ${len * 0.12} ${h * 0.7} Q 0 ${h * 0.4} 0 ${-h * 0.5} Z`;
};

export function FluidModel({ spec, calc }: { spec: FluidModelSpec; calc: Calculator }) {
  const c = usePalette();
  const r = useFluidReader(calc, spec.g);
  const p = usePaintIds('paint', 'hull', 'light', 'water');
  const Vp = r.si(spec.protoSpeed);
  const Lp = r.si(spec.protoLength);
  const Lm = r.si(spec.modelLength);
  const nuP = r.si(spec.protoViscosity);
  const nuM = r.si(spec.modelViscosity);
  const ship = (spec.body ?? (spec.rule === 'froude' ? 'ship' : 'car')) === 'ship';
  const ready = pos(Vp) && pos(Lp) && pos(Lm) && (spec.rule === 'froude' || (pos(nuP) && pos(nuM)));
  const Vm =
    r.si(spec.modelSpeed) ?? (ready ? modelSpeed(spec.rule, Vp!, Lp!, Lm!, nuP, nuM) : undefined);
  const big = 190;
  const small = pos(Lp) && pos(Lm) ? Math.max(3, (big * Lm) / Lp) : big / 4;
  const vMax = Math.max(Vp ?? 0, Vm ?? 0) || 1;
  const arrow = (v: number | undefined) => (v !== undefined ? 8 + (110 * v) / vMax : 0);
  const panels = [
    {
      y: 116,
      len: big,
      v: Vp,
      title: 'Prototype',
      l: r.label(spec.protoLength, 'L_p', 'm'),
      s: r.label(spec.protoSpeed, 'V_p', 'm/s'),
    },
    {
      y: 246,
      len: small,
      v: Vm,
      title: pos(Lp) && pos(Lm) ? `Model, 1 : ${num(Lp / Lm, 3)}` : 'Model',
      l: r.label(spec.modelLength, 'L_m', 'm'),
      s: r.label(spec.modelSpeed, 'V_m', 'm/s'),
    },
  ];
  return (
    <View>
      <Board
        height={276}
        draw={() => (
          <G>
            <Defs>
              <Deepen id={p.paint} from={c.fluidPaint} to={c.fluidHull} />
              <Deepen id={p.hull} from={c.fluidHull} to={c.metalDark} />
              <TopLight id={p.light} />
              <Deepen id={p.water} from={c.water} to={c.waterDeep} />
            </Defs>
            {panels.map((pn, i) => {
              const bx = BW - 20 - pn.len;
              return (
                <G key={i}>
                  <HaloText
                    x={8}
                    y={pn.y - 92}
                    text={pn.title}
                    c={c}
                    size={chart.value}
                    bold
                    anchor="start"
                  />
                  {[pn.l, pn.s].filter(Boolean).map((t, k) => (
                    <HaloText
                      key={k}
                      x={8}
                      y={pn.y - 74 + 16 * k}
                      text={t!}
                      c={c}
                      size={chart.label}
                      anchor="start"
                    />
                  ))}
                  {ship ? (
                    <G>
                      <Rect x={6} y={pn.y} width={BW - 12} height={18} fill={url(p.water)} />
                      <Path
                        d={hullPath(pn.len)}
                        transform={`translate(${bx} ${pn.y})`}
                        fill={url(p.hull)}
                        stroke={c.metalDark}
                      />
                      <Line
                        x1={6}
                        y1={pn.y}
                        x2={BW - 6}
                        y2={pn.y}
                        stroke={c.waterTop}
                        strokeWidth={2}
                      />
                    </G>
                  ) : (
                    <G>
                      <Line
                        x1={6}
                        y1={pn.y}
                        x2={BW - 6}
                        y2={pn.y}
                        stroke={c.chartMuted}
                        strokeWidth={2}
                      />
                      <Path
                        d={carPath(pn.len)}
                        transform={`translate(${bx} ${pn.y})`}
                        fill={url(p.paint)}
                        stroke={c.fluidHull}
                      />
                      <Path
                        d={carPath(pn.len)}
                        transform={`translate(${bx} ${pn.y})`}
                        fill={url(p.light)}
                      />
                      {[0.2, 0.8].map((f) => (
                        <Rect
                          key={f}
                          x={bx + pn.len * f - pn.len * 0.07}
                          y={pn.y - pn.len * 0.07}
                          width={pn.len * 0.14}
                          height={pn.len * 0.14}
                          rx={pn.len * 0.07}
                          fill={c.chartInk}
                        />
                      ))}
                    </G>
                  )}
                  {pn.v !== undefined ? (
                    <Arrow
                      x1={bx - 10 - arrow(pn.v)}
                      y1={pn.y - 30}
                      x2={bx - 10}
                      y2={pn.y - 30}
                      color={c.fluidStream}
                      width={chart.strokeHeavy}
                      head={9}
                    />
                  ) : null}
                </G>
              );
            })}
            <Line x1={6} y1={134} x2={BW - 6} y2={134} stroke={c.chartGrid} />
            {spec.rule === 'reynolds' && ready ? (
              <HaloText
                x={BW - 8}
                y={16}
                text={r.label(spec.reynolds, 'Re') ?? `Re = ${num((Vp! * Lp!) / nuP!, 3)}`}
                c={c}
                size={chart.label}
                anchor="end"
              />
            ) : null}
          </G>
        )}
      />
      <Caption>
        {ready && Vm !== undefined
          ? spec.rule === 'reynolds'
            ? `Same Reynolds number: V_m = V_p × (L_p ÷ L_m) × (ν_m ÷ ν_p) = ${num(Vp!)} × ${num(Lp! / Lm!, 3)} × ${num(nuM! / nuP!, 3)} = ${num(Vm)} m/s. The model is drawn ${num(Lm! / Lp!, 3)} the size; the arrows share one speed scale.`
            : `Same Froude number: V_m = V_p × √(L_m ÷ L_p) = ${num(Vp!)} × √(${num(Lm! / Lp!, 3)}) = ${num(Vm)} m/s. The model is drawn ${num(Lm! / Lp!, 3)} the size; the arrows share one speed scale.`
          : 'Type the prototype’s speed and both lengths to scale the model.'}
      </Caption>
    </View>
  );
}
