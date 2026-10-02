import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import type { FreeBodySpec } from '@/data/modules/typesHsk';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, DragHandle, useFrozen, useRep } from './common';
import { freeBodyOf, G_EARTH, type Force } from './hskMath';
import { formulaOnly, RAD, sig, SubLabel, Vec } from './hskKit';
import { FreeBodyWork } from './freeBodyWork';
import { BoxShadow, TopLight, url, usePaintIds } from './paint';

const [BW, BH] = [62, 46];

/** A signed number in brackets for substituting: (−9.8). */
const par = (s: string) => (s.startsWith('−') ? `(${s})` : s);

/**
 * A free-body diagram (H60): a wooden block on a floor, on an incline or hanging from a rope,
 * each force an arrow from its center as long as its size, the incline's weight components
 * dashed, and the net force beside it. Drag the applied force's or rope's tip, or the ramp's top.
 */
export function FreeBody({ spec, calc }: { spec: FreeBodySpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('light', 'ramp');
  const drag = useRef({ x: 0, y: 0, v: 0 });
  const g = spec.g ?? G_EARTH;
  const si = (x: number | string | undefined) =>
    x === undefined ? 0 : typeof x === 'number' ? x : rep.val(x);
  const known = (x: number | string | undefined) => typeof x !== 'string' || rep.known(x);
  const m = Math.max(0, rep.val(spec.mass));
  const theta = spec.support === 'incline' ? si(spec.incline) : 0;
  const dir = spec.moving === 'right' || spec.moving === 'up' ? 1 : spec.moving ? -1 : undefined;
  const fb = freeBodyOf({
    support: spec.support,
    m,
    g,
    theta,
    F: Math.max(0, si(spec.applied)),
    phi: si(spec.appliedAngle),
    T: Math.max(0, si(spec.tension)),
    psi: si(spec.tensionAngle),
    f: Math.max(0, si(spec.friction)),
    moving: dir,
  });
  // Net force counted + the way the block slides (negative: slowing down).
  const along = (q: { x: number; y: number }) =>
    spec.support === 'incline' ? q.x * Math.cos(theta * RAD) + q.y * Math.sin(theta * RAD) : q.x;
  const netSigned = dir ? dir * along(fb.net) : fb.netSize;
  const all = [spec.mass, spec.incline, spec.applied, spec.tension, spec.friction].every(known);
  const big = Math.max(1e-9, ...fb.forces.map((q) => Math.hypot(q.fx, q.fy)), fb.netSize);
  const scaleLive = useFrozen(big);

  const color: Record<Force['key'], string> = {
    weight: c.forceWeight,
    normal: c.forceNormal,
    friction: c.forceFriction,
    tension: c.forceTension,
    applied: c.forceApplied,
  };
  // A "?" box reads "?" on the picture too, not the example's number drawn faded behind it.
  const q = (ok: boolean, text: string) => (ok ? text : '?');
  const mOk = known(spec.mass);
  const nameOf: Record<Force['key'], string> = {
    weight: `W ${q(mOk, sig(fb.W))} N`,
    normal: `F_N ${q(all, sig(fb.N))} N`,
    friction: `${fb.isStatic ? 'f_s' : 'f'} ${q(all, sig(fb.fUsed))} N`,
    tension: `T ${q(known(spec.tension), sig(si(spec.tension)))} N`,
    applied: `F ${q(known(spec.applied), sig(si(spec.applied)))} N`,
  };
  // H102: a floor block moved d to the right, and the pull's part along it.
  const moved = spec.support === 'floor' && spec.displacement !== undefined;
  const pullF = si(spec.applied) ? si(spec.applied) : si(spec.tension);
  const pullA = si(spec.applied) ? si(spec.appliedAngle) : si(spec.tensionAngle);
  const pullAlong = pullF * Math.cos(pullA * RAD);
  const dist = si(spec.displacement);
  const worked = moved ? [...captionLines(), ...workLines()] : captionLines();
  const lines = all && (!moved || known(spec.displacement)) ? worked : formulaOnly(worked);

  return (
    <View>
      <Canvas aspect={spec.support === 'hanging' ? 0.9 : 0.8}>
        {({ w, h }) => {
          // The block's center and how the surface runs.
          const floorY = h * (spec.support === 'incline' ? 0.84 : 0.66);
          const th = theta * RAD;
          let C = { x: w * 0.4, y: floorY - BH / 2 };
          let ramp: { x0: number; x1: number; top: number } | undefined;
          if (spec.support === 'incline') {
            // The ramp as tall as fits, placed so the block (half way up) sits left of center.
            const tan = Math.max(0.05, Math.tan(th));
            const rise = Math.min(floorY - 20, (w - 28) * tan);
            const x0 = Math.max(10, Math.min(w - 10 - rise / tan, w * 0.44 - rise / 2 / tan));
            const x1 = x0 + rise / tan;
            ramp = { x0, x1, top: floorY - rise };
            const sx = x0 + (x1 - x0) * 0.5;
            const sy = floorY - (sx - x0) * Math.tan(th);
            C = { x: sx - Math.sin(th) * (BH / 2), y: sy - Math.cos(th) * (BH / 2) };
          } else if (spec.support === 'hanging') {
            C = { x: w * 0.4, y: h * 0.5 };
          }
          // One scale for every arrow: the biggest force fits the room around the block.
          // One scale for every arrow: the longest is 130 px at most, and each fits the canvas
          // with room for its label.
          const reach = (ux: number, uy: number) => {
            const tx = ux > 1e-9 ? (w - 10 - C.x) / ux : ux < -1e-9 ? (10 - C.x) / ux : Infinity;
            const ty = uy > 1e-9 ? (h - 10 - C.y) / uy : uy < -1e-9 ? (10 - C.y) / uy : Infinity;
            return Math.min(tx, ty) - 24;
          };
          const k = Math.max(
            0.05 / scaleLive.value,
            Math.min(
              130 / scaleLive.value,
              ...fb.forces.map((q) => {
                const n = Math.hypot(q.fx, q.fy);
                return n > 1e-9 ? reach(q.fx / n, -q.fy / n) / n : Infinity;
              }),
            ),
          );
          const end = (q: { fx: number; fy: number }) => ({ x: C.x + q.fx * k, y: C.y - q.fy * k });
          const netStart = { x: w * 0.84, y: spec.support === 'incline' ? h * 0.2 : h * 0.3 };
          const W = fb.W;
          const along = {
            fx: -W * Math.sin(th) * Math.cos(th),
            fy: -W * Math.sin(th) * Math.sin(th),
          };
          const into = {
            fx: W * Math.cos(th) * Math.sin(th),
            fy: -W * Math.cos(th) * Math.cos(th),
          };
          const handleForce = fb.forces.find(
            (q) =>
              (q.key === 'applied' && typeof spec.applied === 'string') ||
              (q.key === 'tension' && typeof spec.tension === 'string'),
          );
          const handleId =
            handleForce?.key === 'applied'
              ? (spec.applied as string)
              : handleForce?.key === 'tension'
                ? (spec.tension as string)
                : undefined;
          return (
            <>
              <Svg width={w} height={h}>
                <Defs>
                  <TopLight id={ids.light} />
                  <TopLight id={ids.ramp} strength={0.6} />
                </Defs>
                {/* The support: floor, ramp or ceiling beam. */}
                {spec.support !== 'hanging' ? (
                  <G>
                    <Rect x={0} y={floorY} width={w} height={h - floorY} fill={c.chartSurface} />
                    <Line
                      x1={0}
                      y1={floorY}
                      x2={w}
                      y2={floorY}
                      stroke={c.chartInk}
                      strokeWidth={1.5}
                    />
                  </G>
                ) : (
                  <G>
                    <Rect
                      x={C.x - 60}
                      y={6}
                      width={120}
                      height={12}
                      rx={2}
                      fill={c.metal}
                      stroke={c.metalDark}
                    />
                    <Line
                      x1={C.x}
                      y1={18}
                      x2={C.x}
                      y2={C.y - BH / 2}
                      stroke={c.woodDark}
                      strokeWidth={3}
                    />
                  </G>
                )}
                {ramp ? (
                  <G>
                    <Polygon
                      points={`${ramp.x0},${floorY} ${ramp.x1},${floorY} ${ramp.x1},${ramp.top}`}
                      fill={c.wood}
                      stroke={c.woodDark}
                      strokeWidth={1.5}
                    />
                    <Polygon
                      points={`${ramp.x0},${floorY} ${ramp.x1},${floorY} ${ramp.x1},${ramp.top}`}
                      fill={url(ids.ramp)}
                    />
                    <Path
                      d={`M ${ramp.x0 + 34} ${floorY} A 34 34 0 0 0 ${ramp.x0 + 34 * Math.cos(th)} ${floorY - 34 * Math.sin(th)}`}
                      stroke={c.chartInk}
                      fill="none"
                    />
                    <SubLabel
                      x={ramp.x0 + 30}
                      y={floorY + 17}
                      text={`θ = ${q(known(spec.incline), formatNumber(Number(theta.toFixed(1))))}°`}
                      anchor="start"
                      chip={false}
                    />
                  </G>
                ) : null}
                {/* A rope for a pull on the floor. */}
                {spec.support === 'floor' && fb.forces.some((q) => q.key === 'tension') ? (
                  <Line
                    x1={C.x + BW / 2}
                    y1={C.y}
                    x2={C.x + BW / 2 + 200 * Math.cos(si(spec.tensionAngle) * RAD)}
                    y2={C.y - 200 * Math.sin(si(spec.tensionAngle) * RAD)}
                    stroke={c.woodDark}
                    strokeWidth={3}
                    opacity={0.55}
                  />
                ) : null}
                {/* The block, turned to lie on the slope. */}
                <G rotation={-theta} origin={`${C.x}, ${C.y}`}>
                  <BoxShadow
                    x={C.x - BW / 2}
                    y={C.y - BH / 2}
                    width={BW}
                    height={BH}
                    r={3}
                    offset={2}
                  />
                  <Rect
                    x={C.x - BW / 2}
                    y={C.y - BH / 2}
                    width={BW}
                    height={BH}
                    rx={3}
                    fill={c.wood}
                    stroke={c.woodDark}
                    strokeWidth={1.5}
                  />
                  <Line
                    x1={C.x - BW / 2 + 4}
                    y1={C.y - 6}
                    x2={C.x + BW / 2 - 4}
                    y2={C.y - 6}
                    stroke={c.woodDark}
                    strokeOpacity={0.4}
                  />
                  <Line
                    x1={C.x - BW / 2 + 4}
                    y1={C.y + 9}
                    x2={C.x + BW / 2 - 4}
                    y2={C.y + 9}
                    stroke={c.woodDark}
                    strokeOpacity={0.4}
                  />
                  <Rect
                    x={C.x - BW / 2}
                    y={C.y - BH / 2}
                    width={BW}
                    height={BH}
                    rx={3}
                    fill={url(ids.light)}
                  />
                </G>
                {/* The weight's components on an incline, dashed, with θ between F_g and mg cos θ. */}
                {ramp && theta > 0.5 ? (
                  <G opacity={all ? 1 : 0.4}>
                    <Vec
                      x1={C.x}
                      y1={C.y}
                      x2={end(along).x}
                      y2={end(along).y}
                      color={c.forceWeight}
                      width={2}
                      dash={chart.dashFine}
                      head={8}
                    />
                    <Vec
                      x1={C.x}
                      y1={C.y}
                      x2={end(into).x}
                      y2={end(into).y}
                      color={c.forceWeight}
                      width={2}
                      dash={chart.dashFine}
                      head={8}
                    />
                    <Path
                      d={`M ${C.x} ${C.y + 26} A 26 26 0 0 0 ${C.x + 26 * Math.sin(th)} ${C.y + 26 * Math.cos(th)}`}
                      stroke={c.chartInk}
                      fill="none"
                    />
                    <SubLabel
                      x={end(along).x - 6}
                      y={end(along).y + 16}
                      text={`W sin θ ${q(mOk && known(spec.incline), sig(W * Math.sin(th)))}`}
                      anchor="end"
                      color={c.forceWeight}
                      size={chart.label}
                      w={w}
                    />
                    <SubLabel
                      x={end(into).x + 8}
                      y={end(into).y + 4}
                      text={`W cos θ ${q(mOk && known(spec.incline), sig(W * Math.cos(th)))}`}
                      anchor="start"
                      color={c.forceWeight}
                      size={chart.label}
                      w={w}
                    />
                  </G>
                ) : null}
                {fb.forces.map((q) => {
                  const e = end(q);
                  const len = Math.hypot(e.x - C.x, e.y - C.y);
                  const ux = len ? (e.x - C.x) / len : 0;
                  const uy = len ? (e.y - C.y) / len : 0;
                  const dragged = q.key === handleForce?.key && !spec.fixed;
                  const lx = e.x + ux * (dragged ? 26 : 10);
                  const ly = e.y + uy * (dragged ? 26 : 14) + 4;
                  return (
                    <G key={q.key} opacity={all ? 1 : 0.4}>
                      <Vec x1={C.x} y1={C.y} x2={e.x} y2={e.y} color={color[q.key]} />
                      <SubLabel
                        x={lx}
                        y={Math.min(h - 6, Math.max(16, ly))}
                        text={nameOf[q.key]}
                        anchor={Math.abs(ux) < 0.3 ? 'start' : ux > 0 ? 'start' : 'end'}
                        color={color[q.key]}
                        w={w}
                      />
                    </G>
                  );
                })}
                {moved ? (
                  <FreeBodyWork
                    C={C}
                    along={pullAlong * k}
                    floorY={floorY}
                    w={w}
                    text={`F cos θ ${q(all, sig(pullAlong))} N`}
                    d={`d = ${q(known(spec.displacement), sig(dist))} m`}
                    faded={!all || !known(spec.displacement)}
                  />
                ) : null}
                <Circle cx={C.x} cy={C.y} r={3.5} fill={c.chartInk} />
                {/* The net force, beside the block. */}
                <G opacity={all ? 1 : 0.4}>
                  {fb.netSize > 1e-9 ? (
                    <Vec
                      x1={netStart.x - (fb.net.x * k) / 2}
                      y1={netStart.y + (fb.net.y * k) / 2}
                      x2={netStart.x + (fb.net.x * k) / 2}
                      y2={netStart.y - (fb.net.y * k) / 2}
                      color={c.forceNet}
                      width={4}
                    />
                  ) : null}
                  <SubLabel
                    x={netStart.x}
                    y={netStart.y + Math.max(24, (Math.abs(fb.net.y) * k) / 2 + 20)}
                    text={
                      !all
                        ? 'F_net ? N'
                        : fb.netSize > 1e-9
                          ? `F_net ${sig(Math.abs(fb.netSize))} N`
                          : 'F_net = 0'
                    }
                    color={c.forceNet}
                    w={w}
                  />
                </G>
              </Svg>
              {!spec.fixed && handleForce && handleId && rep.known(handleId) ? (
                <DragHandle
                  testID="drag-force"
                  x={end(handleForce).x}
                  y={end(handleForce).y}
                  label={rep.variable(handleId).name}
                  onStart={() => {
                    const e = end(handleForce);
                    drag.current = { x: e.x - C.x, y: e.y - C.y, v: rep.val(handleId) };
                    scaleLive.freeze();
                  }}
                  onEnd={scaleLive.release}
                  onMove={(dx, dy) => {
                    const d = drag.current;
                    const len = Math.hypot(d.x, d.y) || 1;
                    // Along the arrow: its length in newtons.
                    const along2 = (d.x * dx + d.y * dy) / len;
                    // A typed μ is the surface's: it holds, and the friction (μN) follows the
                    // normal force; otherwise the friction holds.
                    const holdMu =
                      typeof spec.mu === 'string' &&
                      rep.known(spec.mu) &&
                      calc.status(spec.mu) !== 'derived';
                    calc.set(
                      {
                        ...rep.pin(
                          [
                            spec.mass,
                            spec.incline,
                            holdMu ? spec.mu : spec.friction,
                            spec.appliedAngle,
                            spec.tensionAngle,
                          ].filter((x): x is string => typeof x === 'string'),
                        ),
                        // At least one step: a pull dragged to 0 has no arrow, and its handle
                        // went with it mid-drag.
                        [handleId]: rep.snapTo(
                          handleId,
                          Math.max(rep.slide(handleId)?.slide.step ?? 0.01, d.v + along2 / k),
                        ),
                      },
                      rep.slide(handleId),
                    );
                  }}
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>{lines.join(' · ')}</Caption>
    </View>
  );

  /** H102: the work the pull does over the displacement. */
  function workLines(): string[] {
    const phi = formatNumber(Number(pullA.toFixed(2)));
    return [
      `Work done by the pull: W = Fd cos θ = ${sig(pullF)} × ${sig(dist)} × cos ${phi}° = ${sig(pullF * dist * Math.cos(pullA * RAD))} J`,
      'Only the part of the pull along the motion does work; the weight and the normal force are at right angles to it and do none.',
    ];
  }

  function captionLines(): string[] {
    const v = (id: string | number | undefined, x: number) =>
      typeof id === 'string' ? (rep.known(id) ? par(rep.value(id, false)) : '?') : par(sig(x));
    const mT = v(spec.mass, m);
    const out = [`F_g = m × g = ${mT} × ${formatNumber(g)} = ${sig(fb.W)} N`];
    const F = si(spec.applied);
    const T = si(spec.tension);
    const mu = spec.mu ? `μ = ${v(spec.mu, 0)}` : '';
    const fLine = (Nt: string) =>
      spec.mu
        ? `f = μF_N = ${v(spec.mu, 0)} × ${Nt} = ${sig(si(spec.friction))} N`
        : `f = ${sig(si(spec.friction))} N`;
    if (spec.support === 'hanging') {
      out.push(`F_net = F_T − F_g = ${v(spec.tension, T)} − ${sig(fb.W)} = ${sig(fb.net.y)} N`);
    } else if (spec.support === 'floor') {
      const phi = F ? si(spec.appliedAngle) : si(spec.tensionAngle);
      const P = F || T;
      const pName = F ? 'F' : 'F_T';
      if (phi)
        out.push(
          `F_N = F_g − ${pName} sin ${formatNumber(phi)}° = ${sig(fb.W)} − ${sig(P)} × ${sig(Math.sin(phi * RAD))} = ${sig(fb.N)} N`,
        );
      else out.push(`F_N = F_g = ${sig(fb.N)} N: nothing else pushes up or down.`);
      if (spec.friction) out.push(fLine(sig(fb.N)));
      if (fb.isStatic)
        out.push(
          `The pull, ${sig(Math.abs(fb.driving))} N, is less than the most friction can hold (${sig(si(spec.friction))} N): static friction matches it and the block stays put.`,
        );
      else {
        const pull = phi ? `${pName} cos ${formatNumber(phi)}°` : pName;
        const sign = dir === -1 ? -1 : 1;
        out.push(
          `F_net = ${sign < 0 ? `f − ${pull}` : `${pull} − f`} = ${sign < 0 ? `${sig(fb.fUsed)} − ${sig(fb.driving)}` : `${sig(fb.driving)} − ${sig(fb.fUsed)}`} = ${sig(netSigned)} N`,
        );
      }
    } else {
      const tt = formatNumber(Number(theta.toFixed(2)));
      out.push(
        `Down the slope: F_g sin θ = ${sig(fb.W)} × sin ${tt}° = ${sig(fb.W * Math.sin(theta * RAD))} N`,
        `F_N = F_g cos θ = ${sig(fb.W)} × cos ${tt}° = ${sig(fb.N)} N`,
      );
      if (spec.friction) out.push(fLine(sig(fb.N)));
      if (fb.isStatic)
        out.push(
          `Friction can hold up to ${sig(si(spec.friction))} N, more than the ${sig(Math.abs(fb.driving))} N pulling along the slope: the block stays put.`,
        );
      else {
        const down = fb.W * Math.sin(theta * RAD);
        const upPull = F + T;
        // Counted + the way it slides (down the slope unless it is moving up).
        const up = dir === 1 || (!dir && fb.driving > 0);
        const parts = up
          ? `${sig(upPull)} − ${sig(down)} − ${sig(fb.fUsed)}`
          : upPull
            ? `${sig(down)} − ${sig(upPull)} − ${sig(fb.fUsed)}`
            : `${sig(down)} − ${sig(fb.fUsed)}`;
        const net = dir ? netSigned : fb.netSize;
        out.push(
          `F_net = ${up ? 'F − F_g sin θ − f' : upPull ? 'F_g sin θ − F − f' : 'F_g sin θ − f'} = ${parts} = ${sig(net)} N ${up ? 'up' : 'down'} the slope`,
        );
      }
    }
    if (mu && !out.some((l) => l.includes('μ'))) out.push(mu);
    const netA = spec.support === 'hanging' ? fb.net.y : dir ? netSigned : fb.netSize;
    out.push(`a = F_net/m = ${par(sig(netA))}/${mT} = ${sig(m ? netA / m : 0)} m/s²`);
    if (dir && netSigned < -1e-9)
      out.push('The net force is against the motion: the block slows down.');
    // Captions are plain text: the subscripted symbols become words.
    const words: [RegExp, string][] = [
      [/F_net/g, 'Net force'],
      [/F_g/g, 'Weight'],
      [/F_N/g, 'Normal force'],
      [/F_T/g, 'Tension'],
      [/μNormal force/g, 'μ × normal force'],
    ];
    return out.map((l) => words.reduce((t, [re, x]) => t.replace(re, x), l));
  }
}
