import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Defs, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import type { SimpleMachineSpec } from '@/data/modules/typesHsk';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, DragHandle, useFrozen, useRep } from './common';
import { machineOf } from './hskMath';
import { formulaOnly, sig, SubLabel, Vec } from './hskKit';
import { Metal, TopLight, url, usePaintIds } from './paint';

/**
 * A simple machine (H63): a lever on a fulcrum, a block and tackle, or a ramp, the load's
 * weight and the effort as arrows on one scale, the arms, strands or ramp sides labelled, and
 * the mechanical advantage. Drag the fulcrum (lever), or the effort end of the ramp.
 */
export function SimpleMachine({ spec, calc }: { spec: SimpleMachineSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('light', 'metal', 'wood');
  const drag = useRef(0);
  const si = (x: number | string | undefined, d = 0) =>
    x === undefined ? d : typeof x === 'number' ? x : rep.val(x);
  const known = (x: number | string | undefined) => typeof x !== 'string' || rep.known(x);
  const load = Math.max(0, si(spec.load));
  const Le = Math.max(0, si(spec.effortArm, 1));
  const Ll = Math.max(0, si(spec.loadArm, 1));
  const n = Math.max(1, Math.min(6, Math.round(si(spec.strands, 1))));
  const L = Math.max(0, si(spec.length, 1));
  const hR = Math.max(0, si(spec.height, 1));
  const effPct = si(spec.efficiency, 100);
  const { ima, effort } = machineOf({
    machine: spec.machine,
    load,
    effortArm: Le,
    loadArm: Ll,
    strands: n,
    length: L,
    height: hR,
    efficiency: effPct,
  });
  const inputs =
    spec.machine === 'lever'
      ? [spec.effortArm, spec.loadArm]
      : spec.machine === 'pulley'
        ? [spec.strands]
        : [spec.length, spec.height];
  const all = [spec.load, spec.efficiency, ...inputs].every(known);
  const force = useFrozen(Math.max(1e-9, load, effort));
  // A "?" box reads "?" on the picture too, not the example's number drawn faded behind it.
  const say = (x: number | string | undefined, value: number) => (known(x) ? sig(value) : '?');
  const effortText = all ? sig(effort) : '?';
  const lines = all ? captionLines() : formulaOnly(captionLines());

  return (
    <View>
      <Canvas
        aspect={
          spec.machine === 'pulley'
            ? 0.95
            : spec.machine === 'incline'
              ? Math.min(0.72, Math.max(0.5, 0.36 + (0.8 * hR) / Math.max(1e-9, L)))
              : 0.72
        }
      >
        {({ w, h }) => (
          <>
            <Svg width={w} height={h}>
              <Defs>
                <TopLight id={ids.light} />
                <Metal id={ids.metal} light={c.metal} dark={c.metalDark} />
              </Defs>
              <G opacity={all ? 1 : 0.45}>
                {spec.machine === 'lever'
                  ? lever(w, h)
                  : spec.machine === 'pulley'
                    ? pulley(w, h)
                    : ramp(w, h)}
              </G>
            </Svg>
            {handle(w, h)}
          </>
        )}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );

  /** Arrow length in px for a force, on one scale (the bigger of load and effort is 90 px). */
  function px(F: number) {
    return (90 * F) / force.value;
  }

  function crate(x: number, y: number, s: number, label: string) {
    return (
      <G>
        <Rect
          x={x}
          y={y}
          width={s}
          height={s}
          rx={3}
          fill={c.wood}
          stroke={c.woodDark}
          strokeWidth={1.5}
        />
        <Line
          x1={x + 4}
          y1={y + s - 4}
          x2={x + s - 4}
          y2={y + 4}
          stroke={c.woodDark}
          strokeOpacity={0.45}
          strokeWidth={3}
        />
        <Rect x={x} y={y} width={s} height={s} rx={3} fill={url(ids.light)} />
        <SubLabel x={x + s / 2} y={y + s / 2 + 5} text={label} size={chart.label} />
      </G>
    );
  }

  function leverGeo(w: number, h: number) {
    const total = Le + Ll || 1;
    const span = w * 0.8;
    const x0 = w * 0.1;
    const fx = x0 + (span * Ll) / total;
    return { x0, x1: x0 + span, fx, beamY: h * 0.5 };
  }

  function lever(w: number, h: number) {
    const { x0, x1, fx, beamY } = leverGeo(w, h);
    const s = 34;
    return (
      <G>
        <Polygon
          points={`${fx},${beamY + 5} ${fx - 20},${beamY + 44} ${fx + 20},${beamY + 44}`}
          fill={url(ids.metal)}
          stroke={c.metalDark}
        />
        <Line x1={0} y1={beamY + 44} x2={w} y2={beamY + 44} stroke={c.chartInk} strokeWidth={1.5} />
        <Rect
          x={x0 - 6}
          y={beamY - 3}
          width={x1 - x0 + 12}
          height={8}
          rx={2}
          fill={c.wood}
          stroke={c.woodDark}
        />
        {crate(x0 - s / 2, beamY - 3 - s, s, `${say(spec.load, load)} N`)}
        <Vec x1={x0} y1={beamY + 6} x2={x0} y2={beamY + 6 + px(load)} color={c.forceWeight} />
        <SubLabel
          x={x0 + 6}
          y={beamY + 6 + px(load)}
          text={`load ${say(spec.load, load)} N`}
          anchor="start"
          color={c.forceWeight}
          w={w}
        />
        <Vec x1={x1} y1={beamY - 8 - px(effort)} x2={x1} y2={beamY - 4} color={c.forceApplied} />
        <SubLabel
          x={x1 - 6}
          y={beamY - 14 - px(effort)}
          text={`effort ${effortText} N`}
          anchor="end"
          color={c.forceApplied}
          w={w}
        />
        {/* The arms, from the fulcrum to each force. */}
        {[
          [x0, fx, `load arm ${say(spec.loadArm, Ll)} m`],
          [fx, x1, `effort arm ${say(spec.effortArm, Le)} m`],
        ].map(([a, b, t]) => (
          <G key={t as string}>
            <Line
              x1={a as number}
              y1={beamY + 60}
              x2={b as number}
              y2={beamY + 60}
              stroke={c.chartMuted}
            />
            <Line
              x1={a as number}
              y1={beamY + 54}
              x2={a as number}
              y2={beamY + 66}
              stroke={c.chartMuted}
            />
            <Line
              x1={b as number}
              y1={beamY + 54}
              x2={b as number}
              y2={beamY + 66}
              stroke={c.chartMuted}
            />
            <SubLabel
              x={((a as number) + (b as number)) / 2}
              y={beamY + 80}
              text={t as string}
              bold={false}
              w={w}
            />
          </G>
        ))}
      </G>
    );
  }

  function pulley(w: number, h: number) {
    const cx = w * 0.42;
    const topY = 46;
    const botY = h * 0.56;
    const R = 14;
    const gap = 16;
    const xs = Array.from({ length: n }, (_, i) => cx - ((n - 1) * gap) / 2 + i * gap);
    const s = 40;
    const effX = n === 1 ? cx + R : xs[n - 1]! + gap;
    const fixedOnly = n === 1;
    return (
      <G>
        <Rect
          x={cx - 90}
          y={8}
          width={180}
          height={12}
          rx={2}
          fill={c.metal}
          stroke={c.metalDark}
        />
        <Line x1={cx} y1={20} x2={cx} y2={topY - R} stroke={c.metalDark} strokeWidth={3} />
        {/* The sheaves: top block (fixed) and, past one strand, the moving block. */}
        <Rect
          x={xs[0]! - R}
          y={topY - R}
          width={xs[n - 1]! - xs[0]! + (fixedOnly ? 2 * R : 2 * R + gap)}
          height={2 * R}
          rx={R}
          fill={url(ids.metal)}
          stroke={c.metalDark}
        />
        {!fixedOnly ? (
          <Rect
            x={xs[0]! - R}
            y={botY - R}
            width={xs[n - 1]! - xs[0]! + 2 * R}
            height={2 * R}
            rx={R}
            fill={url(ids.metal)}
            stroke={c.metalDark}
          />
        ) : null}
        {/* Supporting strands, each counted. */}
        {(fixedOnly ? [cx - R] : xs).map((x, i) => (
          <Line
            key={i}
            x1={x}
            y1={topY}
            x2={x}
            y2={fixedOnly ? botY : botY}
            stroke={c.woodDark}
            strokeWidth={2}
          />
        ))}
        {(fixedOnly ? [cx - R] : xs).map((x, i) => (
          <SubLabel
            key={`n${i}`}
            x={x}
            y={(topY + botY) / 2 + (i % 2 ? 14 : 0)}
            text={`${i + 1}`}
            size={chart.label}
            w={w}
          />
        ))}
        {/* The free end, pulled down: the effort. */}
        <Line x1={effX} y1={topY} x2={effX} y2={botY + 30} stroke={c.woodDark} strokeWidth={2} />
        <Vec
          x1={effX}
          y1={botY + 30}
          x2={effX}
          y2={botY + 30 + px(effort)}
          color={c.forceApplied}
        />
        <SubLabel
          x={effX + 8}
          y={botY + 34 + px(effort) / 2}
          text={`effort ${effortText} N`}
          anchor="start"
          color={c.forceApplied}
          w={w}
        />
        <Line
          x1={cx}
          y1={botY + R}
          x2={cx}
          y2={botY + R + 10}
          stroke={c.metalDark}
          strokeWidth={3}
        />
        {crate(cx - s / 2 - (fixedOnly ? R : 0), botY + R + 10, s, `${say(spec.load, load)} N`)}
        <Vec
          x1={cx - (fixedOnly ? R : 0) - s / 2 - 12}
          y1={botY + R + 10 + s / 2}
          x2={cx - (fixedOnly ? R : 0) - s / 2 - 12}
          y2={botY + R + 10 + s / 2 + px(load)}
          color={c.forceWeight}
        />
        <SubLabel
          x={cx - (fixedOnly ? R : 0) - s / 2 - 18}
          y={botY + R + 10 + s / 2 + px(load)}
          text={`load ${say(spec.load, load)} N`}
          anchor="end"
          color={c.forceWeight}
          w={w}
        />
        <SubLabel
          x={w - 8}
          y={topY + 8}
          text={`${n} supporting ${n === 1 ? 'strand' : 'strands'}`}
          anchor="end"
          w={w}
        />
      </G>
    );
  }

  function rampGeo(w: number, h: number) {
    const ground = h * 0.7;
    const run = Math.sqrt(Math.max(0, L * L - hR * hR));
    const k = Math.min((w * 0.8) / Math.max(run, 1e-9), (ground - 40) / Math.max(hR, 1e-9));
    const x0 = w * 0.08;
    return { ground, run, k, x0, x1: x0 + run * k, top: ground - hR * k };
  }

  function ramp(w: number, h: number) {
    const { ground, x0, x1, top } = rampGeo(w, h);
    const ok = L > hR && hR > 0;
    const ang = Math.atan2(ground - top, x1 - x0);
    const s = 30;
    const t = 0.45;
    const bx = x0 + (x1 - x0) * t;
    const by = ground - (ground - top) * t;
    const u = { x: Math.cos(ang), y: -Math.sin(ang) };
    const nrm = { x: -Math.sin(ang), y: -Math.cos(ang) };
    const C = { x: bx + nrm.x * (s / 2), y: by + nrm.y * (s / 2) };
    return (
      <G opacity={ok ? 1 : 0.4}>
        <Line x1={0} y1={ground} x2={w} y2={ground} stroke={c.chartInk} strokeWidth={1.5} />
        <Polygon
          points={`${x0},${ground} ${x1},${ground} ${x1},${top}`}
          fill={c.wood}
          stroke={c.woodDark}
          strokeWidth={1.5}
        />
        <Polygon points={`${x0},${ground} ${x1},${ground} ${x1},${top}`} fill={url(ids.light)} />
        <G rotation={(-ang * 180) / Math.PI} origin={`${C.x}, ${C.y}`}>
          {crate(C.x - s / 2, C.y - s / 2, s, '')}
        </G>
        <Vec
          x1={C.x - u.x * 70 - nrm.x * 0}
          y1={C.y - u.y * 70}
          x2={C.x - u.x * (s / 2 + 2)}
          y2={C.y - u.y * (s / 2 + 2)}
          color={c.forceApplied}
        />
        <SubLabel
          x={C.x - u.x * 74}
          y={C.y - u.y * 74 - 14}
          text={`effort ${effortText} N`}
          color={c.forceApplied}
          w={w}
        />
        <Vec
          x1={C.x}
          y1={C.y}
          x2={C.x}
          y2={C.y + Math.min(px(load), h - 8 - C.y)}
          color={c.forceWeight}
        />
        <SubLabel
          x={C.x + 8}
          y={C.y + Math.min(px(load), h - 8 - C.y) - 2}
          text={`load ${say(spec.load, load)} N`}
          anchor="start"
          color={c.forceWeight}
          w={w}
        />
        <SubLabel
          x={x0 + (x1 - x0) * 0.8 + nrm.x * 18}
          y={ground - (ground - top) * 0.8 + nrm.y * 18}
          text={`length ${say(spec.length, L)} m`}
          anchor="end"
          w={w}
        />
        <SubLabel
          x={x1 + 6}
          y={(ground + top) / 2}
          text={`height ${say(spec.height, hR)} m`}
          anchor="end"
          w={w}
        />
        <Path
          d={`M ${x1 - 12} ${ground} L ${x1 - 12} ${ground - 12} L ${x1} ${ground - 12}`}
          stroke={c.chartInk}
          fill="none"
        />
      </G>
    );
  }

  function handle(w: number, h: number) {
    if (spec.fixed) return null;
    if (
      spec.machine === 'lever' &&
      typeof spec.loadArm === 'string' &&
      typeof spec.effortArm === 'string'
    ) {
      const [la, ea] = [spec.loadArm, spec.effortArm];
      if (!rep.known(la) || !rep.known(ea)) return null;
      const { fx, beamY, x0, x1 } = leverGeo(w, h);
      return (
        <DragHandle
          testID="drag-fulcrum"
          x={fx}
          y={beamY + 30}
          label="Fulcrum"
          onStart={() => {
            drag.current = fx;
          }}
          onMove={(dx) => {
            const total = Le + Ll;
            const f = Math.min(0.95, Math.max(0.05, (drag.current + dx - x0) / (x1 - x0)));
            const newLl = rep.snapTo(la, total * f);
            calc.set(
              {
                ...rep.pin([spec.load].filter((x): x is string => typeof x === 'string')),
                [la]: newLl,
                [ea]: rep.snapTo(ea, total - newLl),
              },
              rep.slide(la),
            );
          }}
        />
      );
    }
    return null;
  }

  function captionLines(): string[] {
    const e = effPct / 100;
    const imaLine =
      spec.machine === 'lever'
        ? `Ideal MA = effort arm/load arm = ${sig(Le)}/${sig(Ll)} = ${sig(ima)}`
        : spec.machine === 'pulley'
          ? `Ideal MA = supporting strands = ${n}`
          : `Ideal MA = length/height = ${sig(L)}/${sig(hR)} = ${sig(ima)}`;
    if (spec.machine === 'incline' && !(L > hR && hR > 0))
      return [
        `A ramp ${sig(L)} m long can’t rise ${sig(hR)} m: the length must be more than the height.`,
      ];
    const out = [
      imaLine,
      e === 1
        ? `Effort = load/MA = ${sig(load)}/${sig(ima)} = ${sig(effort)} N`
        : `Effort = load/(MA × efficiency) = ${sig(load)}/(${sig(ima)} × ${formatNumber(e)}) = ${sig(effort)} N`,
      spec.machine === 'lever'
        ? 'Balanced when effort × effort arm = load × load arm.'
        : spec.machine === 'pulley'
          ? `Pull ${n} m of rope to lift the load 1 m: less force, more distance.`
          : `Push ${sig(ima)} m along the ramp for each 1 m of height: less force, more distance.`,
    ];
    return out;
  }
}
