/**
 * `linkage` (HC84): rigid bodies in plane motion, flat, with their instantaneous centre. A
 * ladder sliding down a wall (the IC where the normals to the two paths meet, each velocity ⟂
 * its ray and ∝ its distance, ω round the IC); a wheel or ball rolling on a slope (v = 0 at the
 * contact, v at the centre, 2v at the top, rim points ⟂ their rays, a down the slope); and a
 * single closed loop of n links with its joints numbered for Gruebler's mobility.
 */
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import type { LinkageSpec } from '@/data/modules/typesHe3i';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { fmt, Hatch, HeLabel } from './beamKit';
import { Canvas, Caption, ChartText } from './common';
import { useHe3iReader } from './he3iKit';
import { CurvedArrow } from './hs3aKit';
import { Vec } from './hskKit';
import { ladderOf, mobility, shapeName } from './linkageMath';
import { Ball, TopLight, url, usePaintIds } from './paint';

const RAD = Math.PI / 180;

export function Linkage({ spec, calc }: { spec: LinkageSpec; calc: Calculator }) {
  const c = usePalette();
  const r = useHe3iReader(calc);
  const ids = usePaintIds('ball', 'light', 'wall');
  const k = r.known;
  const mode = spec.mode;
  const tag = (x: LinkageSpec['length'], sym: string, unit: string) =>
    x === undefined ? '' : r.tag(x, sym, r.v(x), unit);

  // Ladder values (geometry in the page's own length unit; angles in degrees).
  const L = Math.max(1e-9, r.v(spec.length, 5));
  const th = Math.min(89.5, Math.max(0.5, r.v(spec.angle, mode === 'rolling' ? 0 : 60)));
  const vA = r.v(spec.footSpeed, 1);
  const lad = ladderOf(L, th, vA);
  // Rolling.
  const cShape = r.v(spec.shape, 0.5);
  const shape = spec.shape === undefined ? undefined : shapeName(cShape);
  // Mechanism counts.
  const n = Math.round(r.v(spec.links, 4));
  const j1 = Math.round(r.v(spec.full, n));
  const j2 = Math.round(r.v(spec.half, 0));
  const M = mobility(n, j1, j2);
  const single = j1 + j2 === n && n >= 3 && n <= 8;

  const caption = (() => {
    const out: string[] = [];
    if (mode === 'ladder') {
      out.push(
        'The IC is where the normals to the two paths meet: above the foot, level with the top.',
      );
      if (k(spec.omega) && k(spec.footSpeed) && k(spec.length) && k(spec.angle) && spec.omega)
        out.push(
          `${r.symbol(spec.omega, 'ω')} = ${r.symbol(spec.footSpeed, 'v_A')} ÷ (${r.symbol(spec.length, 'L')} sin ${r.symbol(spec.angle, 'θ')}) = ${r.text(spec.omega, lad.omega, 'rad/s')}.`,
        );
      if (k(spec.topSpeed) && spec.topSpeed && k(spec.footSpeed) && k(spec.angle))
        out.push(
          `${r.symbol(spec.topSpeed, 'v_B')} = ${r.symbol(spec.footSpeed, 'v_A')} ÷ tan ${r.symbol(spec.angle, 'θ')} = ${r.text(spec.topSpeed, lad.vB, 'm/s')}, down the wall.`,
        );
    } else if (mode === 'rolling') {
      out.push(
        'Rolling without slipping: the contact is the IC, so v = 0 there, v at the centre and 2v at the top.',
      );
      if (spec.acceleration && k(spec.acceleration) && k(spec.angle) && k(spec.shape))
        out.push(
          `a = g sin θ ÷ (1 + c) = ${r.text(spec.acceleration, r.v(spec.acceleration), 'm/s²')}${shape ? ` for a ${shape}` : ''}.`,
        );
    } else {
      out.push(`Gruebler: M = 3(n − 1) − 2j₁ − j₂ = 3 × ${n - 1} − 2 × ${j1} − ${j2} = ${M}.`);
      out.push(
        M === 0
          ? 'M = 0: a structure, nothing moves.'
          : M < 0
            ? 'M < 0: over-constrained.'
            : `M = ${M}: ${M === 1 ? 'one input drives it' : `${M} inputs drive it`}.`,
      );
      if (!single)
        out.push(
          `A single loop of ${n} links has ${n} joints; this count needs more than one loop, so only the links are drawn.`,
        );
    }
    return out.join(' ');
  })();

  const aspect = mode === 'ladder' ? 0.92 : mode === 'rolling' ? 0.78 : 0.8;
  return (
    <View>
      <Canvas aspect={aspect}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            <Defs>
              <Ball id={ids.ball} color={c.blockBlue} />
              <TopLight id={ids.light} />
            </Defs>
            {mode === 'ladder'
              ? ladder(w, h)
              : mode === 'rolling'
                ? rolling(w, h)
                : mechanism(w, h)}
          </Svg>
        )}
      </Canvas>
      <Caption>{caption}</Caption>
    </View>
  );

  function ladder(w: number, h: number) {
    const wallX = 34;
    const floorY = h - 40;
    const s = Math.min(
      (w - wallX - 90) / Math.max(1e-9, lad.rB),
      (floorY - 44) / Math.max(1e-9, lad.rA),
    );
    const A = { x: wallX + lad.rB * s, y: floorY };
    const B = { x: wallX, y: floorY - lad.rA * s };
    const IC = { x: A.x, y: B.y };
    const Gp = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
    // px of arrow per px of distance from the IC, so v ∝ r (the farther end's arrow is 70 px).
    const vk = 70 / Math.max(A.y - IC.y, IC.x - B.x, 1e-9);
    const speedsOk = k(spec.footSpeed) && k(spec.length) && k(spec.angle);
    const dir = Math.sign(vA) || 1;
    // A velocity ⟂ its ray from the IC, length ∝ distance (counterclockwise on screen).
    const vel = (p: { x: number; y: number }) => {
      const dx = p.x - IC.x;
      const dy = p.y - IC.y;
      return { x: p.x + dir * dy * vk, y: p.y - dir * dx * vk };
    };
    const [vAe, vBe, vGe] = [vel(A), vel(B), vel(Gp)];
    const rail = (x1: number, y1: number, x2: number, y2: number) => {
      const len = Math.hypot(x2 - x1, y2 - y1);
      const ux = (x2 - x1) / len;
      const uy = (y2 - y1) / len;
      return `M ${x1 + uy * 5} ${y1 - ux * 5} L ${x2 + uy * 5} ${y2 - ux * 5} L ${x2 - uy * 5} ${y2 + ux * 5} L ${x1 - uy * 5} ${y1 + ux * 5} Z`;
    };
    return (
      <G>
        {/* The wall (brick) and the floor, hatched. */}
        <Rect
          x={4}
          y={12}
          width={wallX - 4}
          height={floorY - 12}
          fill={c.ladderWall}
          stroke={c.ladderWallDark}
        />
        {Array.from({ length: Math.floor((floorY - 12) / 12) }, (_, i) => (
          <Line
            key={i}
            x1={4}
            y1={12 + (i + 1) * 12}
            x2={wallX}
            y2={12 + (i + 1) * 12}
            stroke={c.ladderWallDark}
            strokeWidth={0.8}
          />
        ))}
        <Line x1={4} y1={floorY} x2={w - 8} y2={floorY} stroke={c.chartInk} strokeWidth={1.5} />
        <Hatch x1={wallX} x2={w - 8} y={floorY} />
        {/* The ladder, wood. */}
        <Path d={rail(A.x, A.y, B.x, B.y)} fill={c.wood} stroke={c.woodDark} />
        <Path d={rail(A.x, A.y, B.x, B.y)} fill={url(ids.light)} />
        <Circle cx={A.x} cy={A.y} r={4} fill={c.chartInk} />
        <Circle cx={B.x} cy={B.y} r={4} fill={c.chartInk} />
        <ChartText x={A.x + 6} y={A.y + 16} fontSize={chart.label} fontWeight="700">
          A
        </ChartText>
        <ChartText x={B.x + 8} y={B.y + 16} fontSize={chart.label} fontWeight="700">
          B
        </ChartText>
        {k(spec.length) ? (
          <HeLabel
            x={A.x + 0.3 * (B.x - A.x) + (A.x - B.x > 80 ? -10 : 10)}
            y={A.y + 0.3 * (B.y - A.y)}
            anchor={A.x - B.x > 80 ? 'end' : 'start'}
            text={tag(spec.length, 'L', 'm')}
            w={w}
            size={chart.label}
          />
        ) : null}
        {k(spec.angle) ? (
          <G>
            <Path
              d={`M ${A.x - 26} ${A.y} A 26 26 0 0 1 ${A.x - 26 * Math.cos(th * RAD)} ${A.y - 26 * Math.sin(th * RAD)}`}
              stroke={c.chartInk}
              fill="none"
            />
            <HeLabel
              x={A.x - B.x > 90 ? A.x - 32 : A.x + 8}
              y={A.x - B.x > 90 ? A.y - 6 : A.y - 32}
              anchor={A.x - B.x > 90 ? 'end' : 'start'}
              text={tag(spec.angle, 'θ', '°')}
              w={w}
              size={chart.label}
              chip={false}
            />
          </G>
        ) : null}
        {/* The IC: normals to the paths of A (vertical) and B (horizontal) meet here. */}
        <Line x1={A.x} y1={A.y} x2={IC.x} y2={IC.y - 14} stroke={c.he3iIc} strokeDasharray="5 4" />
        <Line x1={B.x} y1={B.y} x2={IC.x + 14} y2={IC.y} stroke={c.he3iIc} strokeDasharray="5 4" />
        <Line
          x1={Gp.x}
          y1={Gp.y}
          x2={IC.x}
          y2={IC.y}
          stroke={c.he3iIc}
          strokeDasharray="2 3"
          opacity={0.8}
        />
        <Circle cx={IC.x} cy={IC.y} r={5} fill={c.he3iIc} />
        <ChartText
          x={IC.x + 9}
          y={IC.y + 4}
          fontSize={chart.label}
          fontWeight="700"
          fill={c.he3iIc}
        >
          IC
        </ChartText>
        <HeLabel
          x={IC.x + 6}
          y={(IC.y + A.y) / 2}
          anchor="start"
          text="r_A = L sin θ"
          color={c.he3iIc}
          w={w}
          size={chart.label}
        />
        <HeLabel
          x={(IC.x + B.x) / 2 + 10}
          y={IC.y - 8}
          text="r_B = L cos θ"
          color={c.he3iIc}
          w={w}
          size={chart.label}
        />
        {speedsOk ? (
          <G>
            <CurvedArrow
              cx={IC.x}
              cy={IC.y}
              r={20}
              from={Math.PI * 1.05}
              to={Math.PI * 1.6}
              color={c.he3iOmega}
              width={2}
              head={8}
            />
            {spec.omega && k(spec.omega) ? (
              <HeLabel
                x={IC.x + 12}
                y={IC.y + 42}
                anchor="start"
                text={tag(spec.omega, 'ω', 'rad/s')}
                color={c.he3iOmega}
                w={w}
                size={chart.label}
              />
            ) : null}
            <Vec x1={A.x} y1={A.y - 8} x2={vAe.x} y2={vAe.y - 8} color={c.he3iVelocity} />
            <HeLabel
              x={vAe.x + 4}
              y={A.y - 16}
              anchor="start"
              text={tag(spec.footSpeed, 'v_A', 'm/s')}
              color={c.he3iVelocity}
              w={w}
              size={chart.label}
            />
            <Vec x1={B.x + 8} y1={B.y} x2={vBe.x + 8} y2={vBe.y} color={c.he3iVelocity} />
            {spec.topSpeed && k(spec.topSpeed) ? (
              <HeLabel
                x={B.x + 14}
                y={(B.y + vBe.y) / 2 + 18}
                anchor="start"
                text={tag(spec.topSpeed, 'v_B', 'm/s')}
                color={c.he3iVelocity}
                w={w}
                size={chart.label}
              />
            ) : null}
            <Vec
              x1={Gp.x}
              y1={Gp.y}
              x2={vGe.x}
              y2={vGe.y}
              color={c.he3iVelocity}
              width={2}
              opacity={0.75}
            />
          </G>
        ) : null}
      </G>
    );
  }

  function rolling(w: number, h: number) {
    const tilt = k(spec.angle) ? Math.min(40, th) : th;
    const t = tilt * RAD;
    const run = w - 32;
    const drop = Math.min(h * 0.55, run * Math.tan(t));
    const x0 = 16;
    const y0 = h - 30 - drop;
    const d = { x: Math.cos(t), y: Math.sin(t) }; // down the slope (screen)
    const nrm = { x: Math.sin(t), y: -Math.cos(t) }; // out of the slope
    const R = Math.min(56, h * 0.22);
    const along = (run * 0.42) / Math.cos(t);
    const P = { x: x0 + d.x * along, y: y0 + d.y * along };
    const O = { x: P.x + nrm.x * R, y: P.y + nrm.y * R };
    const vk = 38 / R; // the centre's arrow is 38 px
    const at = (ang: number) => ({ x: O.x + R * Math.sin(ang), y: O.y - R * Math.cos(ang) }); // ang from "up the normal"
    const rot = (p: { x: number; y: number }) => ({ x: -p.y, y: p.x });
    const vel = (q: { x: number; y: number }) => {
      const rr = rot({ x: q.x - P.x, y: q.y - P.y });
      return { x: q.x + rr.x * vk, y: q.y + rr.y * vk };
    };
    const tiltAng = (a: number) => a + t; // rim angles measured from the slope's normal
    const top = at(tiltAng(0));
    const rims = [tiltAng(-Math.PI / 2), tiltAng(Math.PI / 2), tiltAng(-Math.PI / 4)].map(at);
    const pts = [O, top, ...rims];
    const hollow = cShape > 0.9;
    const ball = Math.abs(cShape - 0.4) < 1e-6 || Math.abs(cShape - 2 / 3) < 1e-6;
    const sp = spec.speed && k(spec.speed) ? r.text(spec.speed, r.v(spec.speed), 'm/s') : undefined;
    return (
      <G>
        {/* The slope (or floor), hatched underneath. */}
        <Polygon
          points={`${x0},${y0} ${x0 + run},${y0 + drop} ${x0},${y0 + drop}`}
          fill={c.chartFill}
        />
        <Line x1={x0} y1={y0} x2={x0 + run} y2={y0 + drop} stroke={c.chartInk} strokeWidth={1.5} />
        <Line x1={x0} y1={y0 + drop} x2={x0 + run} y2={y0 + drop} stroke={c.chartMuted} />
        {tilt > 0.6 && k(spec.angle) ? (
          <G>
            <Path
              d={`M ${x0 + run - 40} ${y0 + drop} A 40 40 0 0 1 ${x0 + run - 40 * Math.cos(t)} ${y0 + drop - 40 * Math.sin(t)}`}
              stroke={c.chartInk}
              fill="none"
            />
            <HeLabel
              x={x0 + run - 46}
              y={y0 + drop - 6}
              anchor="end"
              text={tag(spec.angle, 'θ', '°')}
              w={w}
              size={chart.label}
              chip={false}
            />
          </G>
        ) : null}
        {/* The body: a ball, a disk or a hoop. */}
        {ball ? (
          <Circle cx={O.x} cy={O.y} r={R} fill={url(ids.ball)} stroke={c.chartMuted} />
        ) : (
          <G>
            <Circle
              cx={O.x}
              cy={O.y}
              r={R}
              fill={hollow ? 'none' : c.metal}
              stroke={c.metalDark}
              strokeWidth={hollow ? 7 : 1.5}
            />
            {!hollow ? <Circle cx={O.x} cy={O.y} r={R} fill={url(ids.light)} /> : null}
          </G>
        )}
        <Circle cx={O.x} cy={O.y} r={3} fill={c.chartInk} />
        {/* Rays from the IC and each point's velocity ⟂ its ray, ∝ its distance. */}
        {pts.map((q, i) => (
          <Line
            key={`r${i}`}
            x1={P.x}
            y1={P.y}
            x2={q.x}
            y2={q.y}
            stroke={c.he3iIc}
            strokeDasharray="4 3"
            strokeWidth={1.2}
          />
        ))}
        {pts.map((q, i) => {
          const e = vel(q);
          return (
            <Vec
              key={`v${i}`}
              x1={q.x}
              y1={q.y}
              x2={e.x}
              y2={e.y}
              color={c.he3iVelocity}
              width={i < 2 ? 3 : 2}
              opacity={i < 2 ? 1 : 0.7}
            />
          );
        })}
        <Circle cx={P.x} cy={P.y} r={5} fill={c.he3iIc} />
        <HeLabel
          x={P.x - 8}
          y={P.y + 18}
          anchor="end"
          text="IC: v = 0"
          color={c.he3iIc}
          w={w}
          size={chart.label}
        />
        <HeLabel
          x={vel(O).x + 6}
          y={vel(O).y + 14}
          anchor="start"
          text={sp ? `v = ${sp}` : 'v'}
          color={c.he3iVelocity}
          w={w}
          size={chart.label}
        />
        <HeLabel
          x={vel(top).x + 6}
          y={vel(top).y + 4}
          anchor="start"
          text="2v"
          color={c.he3iVelocity}
          w={w}
          size={chart.label}
        />
        {spec.radius !== undefined && k(spec.radius) ? (
          <HeLabel
            x={O.x - R - 6}
            y={O.y - R}
            anchor="end"
            text={tag(spec.radius, 'r', 'm')}
            w={w}
            size={chart.label}
          />
        ) : null}
        {spec.acceleration !== undefined && k(spec.acceleration) ? (
          <G>
            {/* On the uphill side, along the slope. */}
            <Vec
              x1={O.x - d.x * (R + 70) + nrm.x * R * 0.4}
              y1={O.y - d.y * (R + 70) + nrm.y * R * 0.4}
              x2={O.x - d.x * (R + 18) + nrm.x * R * 0.4}
              y2={O.y - d.y * (R + 18) + nrm.y * R * 0.4}
              color={c.forceNet}
              width={2.5}
            />
            <HeLabel
              x={O.x - d.x * (R + 70) + nrm.x * R * 0.4}
              y={O.y - d.y * (R + 70) + nrm.y * R * 0.4 - 10}
              anchor="start"
              text={tag(spec.acceleration, 'a', 'm/s²')}
              color={c.forceNet}
              w={w}
              size={chart.label}
            />
          </G>
        ) : null}
        {spec.shape !== undefined && k(spec.shape) ? (
          <HeLabel
            x={w - 8}
            y={22}
            anchor="end"
            text={`${tag(spec.shape, 'c', '')}${shape ? ` (${shape})` : ''}`}
            w={w}
            size={chart.label}
          />
        ) : null}
      </G>
    );
  }

  function mechanism(w: number, h: number) {
    const count = Math.max(3, Math.min(8, n));
    const yb = h - 40;
    const xL = 54;
    const xR = w - 54;
    // Joints of the loop: two ground pivots, the rest on an arch between them.
    const joints: { x: number; y: number }[] = [];
    const slider = spec.slider && count === 4;
    if (slider) {
      joints.push({ x: xL + 20, y: yb - 40 }); // crank pivot O
      joints.push({ x: xL + 20 + 46, y: yb - 40 - 56 }); // crank pin A
      joints.push({ x: xR - 40, y: yb - 40 }); // slider pin B
    } else {
      const inner = count - 2;
      joints.push({ x: xL, y: yb });
      for (let i = 1; i <= inner; i++) {
        const a = Math.PI - (Math.PI * i) / (inner + 1);
        joints.push({
          x: (xL + xR) / 2 + ((xR - xL) / 2) * Math.cos(a) * 0.92 + (i % 2 ? 8 : -8),
          y: yb - (h - 110) * Math.sin(a) * (0.75 + 0.2 * (i % 2)),
        });
      }
      joints.push({ x: xR, y: yb });
    }
    const halfCount = single ? Math.min(j2, joints.length) : 0;
    const moving = slider
      ? [
          [0, 1],
          [1, 2],
        ]
      : joints.slice(0, -1).map((_, i) => [i, i + 1]);
    let label = 2;
    return (
      <G>
        {/* The ground, link 1: hatched under its pivots (and the slider's rail). */}
        <Line x1={16} y1={yb + 12} x2={w - 16} y2={yb + 12} stroke={c.chartInk} strokeWidth={1.5} />
        <Hatch x1={16} x2={w - 16} y={yb + 12} />
        {slider ? (
          <G>
            <Line
              x1={xR - 110}
              y1={yb - 26}
              x2={w - 16}
              y2={yb - 26}
              stroke={c.chartMuted}
              strokeWidth={1.5}
            />
            <Line
              x1={xR - 110}
              y1={yb - 54}
              x2={w - 16}
              y2={yb - 54}
              stroke={c.chartMuted}
              strokeWidth={1.5}
            />
          </G>
        ) : null}
        {[...(slider ? [joints[0]!] : [joints[0]!, joints[joints.length - 1]!])].map((p, i) => (
          <Polygon
            key={`g${i}`}
            points={`${p.x},${p.y} ${p.x - 11},${yb + 12} ${p.x + 11},${yb + 12}`}
            fill={c.chartFill}
            stroke={c.chartInk}
          />
        ))}
        <G>
          <Circle cx={w / 2} cy={yb + 30} r={9} fill={c.card} stroke={c.chartInk} />
          <ChartText
            x={w / 2}
            y={yb + 34}
            textAnchor="middle"
            fontSize={chart.label}
            fontWeight="700"
          >
            1
          </ChartText>
        </G>
        {/* The moving links, numbered from 2. */}
        {moving.map(([a, b], i) => {
          const p = joints[a!]!;
          const q = joints[b!]!;
          const mx = (p.x + q.x) / 2;
          const my = (p.y + q.y) / 2;
          const len = Math.hypot(q.x - p.x, q.y - p.y);
          const nx = -(q.y - p.y) / len;
          const ny = (q.x - p.x) / len;
          const id = label++;
          return (
            <G key={`l${i}`}>
              <Line
                x1={p.x}
                y1={p.y}
                x2={q.x}
                y2={q.y}
                stroke={c.he3iLink}
                strokeWidth={10}
                strokeLinecap="round"
              />
              <Line
                x1={p.x}
                y1={p.y}
                x2={q.x}
                y2={q.y}
                stroke={c.chartInk}
                strokeWidth={1}
                opacity={0.4}
              />
              <Circle cx={mx + nx * 18} cy={my + ny * 18} r={9} fill={c.card} stroke={c.chartInk} />
              <ChartText
                x={mx + nx * 18}
                y={my + ny * 18 + 4}
                textAnchor="middle"
                fontSize={chart.label}
                fontWeight="700"
              >
                {String(id)}
              </ChartText>
            </G>
          );
        })}
        {slider ? (
          <G>
            <Rect
              x={joints[2]!.x - 22}
              y={yb - 54}
              width={44}
              height={28}
              rx={3}
              fill={c.he3iLink}
              stroke={c.chartInk}
            />
            <Circle cx={joints[2]!.x + 34} cy={yb - 70} r={9} fill={c.card} stroke={c.chartInk} />
            <ChartText
              x={joints[2]!.x + 34}
              y={yb - 66}
              textAnchor="middle"
              fontSize={chart.label}
              fontWeight="700"
            >
              {String(label)}
            </ChartText>
          </G>
        ) : null}
        {/* The joints: pins (full), or pins in slots (half), counted. */}
        {joints.map((p, i) => {
          const half = i >= joints.length - halfCount;
          return (
            <G key={`j${i}`}>
              {half ? (
                <Rect
                  x={p.x - 13}
                  y={p.y - 6}
                  width={26}
                  height={12}
                  rx={6}
                  fill={c.card}
                  stroke={c.chartInk}
                  strokeWidth={1.5}
                />
              ) : null}
              <Circle cx={p.x} cy={p.y} r={5.5} fill={c.card} stroke={c.he3iIc} strokeWidth={2} />
            </G>
          );
        })}
        {slider ? (
          <ChartText
            x={joints[2]!.x}
            y={yb - 8}
            textAnchor="middle"
            fontSize={chart.label}
            fill={c.he3iIc}
          >
            slider (full joint)
          </ChartText>
        ) : null}
        {[
          [spec.links, 'n'],
          [spec.full, 'j_1'],
          [spec.half, 'j_2'],
        ].map(([x, sym], i) =>
          x !== undefined ? (
            <HeLabel
              key={sym as string}
              x={8 + i * 74}
              y={20}
              anchor="start"
              text={tag(x as string, sym as string, '')}
              w={w}
              size={chart.label}
              chip={false}
            />
          ) : null,
        )}
        {spec.mobility !== undefined && k(spec.mobility) ? (
          <HeLabel
            x={8}
            y={38}
            anchor="start"
            text={tag(spec.mobility, 'M', '')}
            color={c.he3iIc}
            w={w}
            size={chart.label}
            chip={false}
          />
        ) : null}
        {!single ? (
          <ChartText
            x={w / 2}
            y={h / 2}
            textAnchor="middle"
            fontSize={chart.label}
            fill={c.chartMuted}
          >
            {`${fmt(n)} links shown; the joints need more than one loop`}
          </ChartText>
        ) : null}
      </G>
    );
  }
}
