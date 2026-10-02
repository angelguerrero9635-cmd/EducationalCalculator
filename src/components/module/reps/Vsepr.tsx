/**
 * Molecular shape (H48): a ball-and-stick molecule shaped by its bonded atoms and lone pairs
 * (VSEPR), the lone pairs as lobes, the bond angle marked on two bonds that lie in the page,
 * and with `polar` the bond dipoles and the net dipole; or water molecules joined by dotted
 * hydrogen bonds. Atoms in the classroom (CPK) colors, lit like balls.
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, Line, Path } from 'react-native-svg';

import type { VseprSpec } from '@/data/modules/typesHsi';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { atomRadius, subscript } from './chem';
import { Canvas, Caption, ChartText, useRep } from './common';
import { reader } from './graphKit';
import { AtomBall, useAtomPaint } from './MoleculeArt';
import { VseprHe3e } from './VseprHe3e';
import {
  directions,
  electronegativity,
  hydrogenBonds,
  netDipole,
  shapeOf,
  tilt,
  type Vec,
} from './vseprGeo';

const RAD = Math.PI / 180;

export function Vsepr({ spec, calc }: { spec: VseprSpec; calc: Calculator }) {
  if (spec.mode === 'hbonds') return <HydrogenBonds spec={spec} calc={calc} />;
  if (spec.mode === 'expanded' || spec.mode === 'complex')
    return <VseprHe3e spec={spec} calc={calc} />; // HC72
  return <Shape spec={spec} calc={calc} />;
}

/** An arrow from (x1, y1) to (x2, y2) with a crossed tail (the + end of a dipole). */
function DipoleArrow({
  x1,
  y1,
  x2,
  y2,
  color,
  width = 2,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width?: number;
}) {
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const [ux, uy] = [(x2 - x1) / len, (y2 - y1) / len];
  const [nx, ny] = [-uy, ux];
  const head = 7 + width;
  return (
    <G>
      <Line
        x1={x1}
        y1={y1}
        x2={x2 - ux * head * 0.8}
        y2={y2 - uy * head * 0.8}
        stroke={color}
        strokeWidth={width}
      />
      <Path
        d={`M ${x2} ${y2} L ${x2 - ux * head + nx * head * 0.45} ${y2 - uy * head + ny * head * 0.45} L ${x2 - ux * head - nx * head * 0.45} ${y2 - uy * head - ny * head * 0.45} Z`}
        fill={color}
      />
      <Line
        x1={x1 + ux * 5 + nx * 5}
        y1={y1 + uy * 5 + ny * 5}
        x2={x1 + ux * 5 - nx * 5}
        y2={y1 + uy * 5 - ny * 5}
        stroke={color}
        strokeWidth={width}
      />
    </G>
  );
}

// ─── Shape ───────────────────────────────────────────────────────────────────

function Shape({ spec, calc }: { spec: Extract<VseprSpec, { mode?: 'shape' }>; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const read = reader(rep);
  const paint = useAtomPaint();
  const br = read(spec.bonded);
  const lr = read(spec.lone);
  const b = Math.round(br.value);
  const l = Math.round(lr.value);
  const shape = shapeOf(b, l);
  const known = br.known && lr.known;
  if (!shape)
    return (
      <Caption>
        {`${b} bonded atoms and ${l} lone pairs make ${b + l} electron domains; the shapes drawn have 2 to 4.`}
      </Caption>
    );
  const { central, outer, order, formula } = shape.example;
  // Four domains are turned a little about the upright and tipped, so no atom hides another.
  const turn = b + l === 4 ? 12 : 0;
  const spin = b + l === 4 ? 28 : 0;
  const view = (v: Vec, deg = spin): Vec => {
    const [c0, s0] = [Math.cos((deg * Math.PI) / 180), Math.sin((deg * Math.PI) / 180)];
    return [v[0] * c0 + v[2] * s0, v[1], -v[0] * s0 + v[2] * c0];
  };
  const dirs = directions(b, l);
  const bonds = dirs.bonds.map((v) => tilt(view(v), turn));
  const pairs = dirs.lone.map((v) => tilt(view(v), turn));
  const net = tilt(view(netDipole(b, l, central, outer)), turn);
  const netSize = Math.hypot(...netDipole(b, l, central, outer));
  const dEN = electronegativity(outer) - electronegativity(central);

  const art = (w: number, h: number): ReactNode => {
    const L = Math.min(96, w * 0.26);
    const cx = w / 2;
    const cy = h / 2 + 4;
    const P = (v: Vec, k = 1) => ({ x: cx + v[0] * L * k, y: cy - v[1] * L * k, z: v[2] });
    const rc = atomRadius(central) * L * 0.62;
    const ro = atomRadius(outer) * L * 0.62;
    const items: { z: number; el: ReactNode }[] = [];
    bonds.forEach((v, i) => {
      const p = P(v);
      const offs = order === 1 ? [0] : [-3.2, 3.2];
      const [nx, ny] = [v[1], v[0]];
      const ln = Math.hypot(nx, ny) || 1;
      items.push({
        z: v[2] / 2 - 0.01,
        el: (
          <G key={`s${i}`}>
            {offs.map((o, k) => (
              <Line
                key={k}
                x1={cx + (nx / ln) * o}
                y1={cy + (ny / ln) * o}
                x2={p.x + (nx / ln) * o}
                y2={p.y + (ny / ln) * o}
                stroke={c.atomBond}
                strokeWidth={order === 1 ? 5 : 3.2}
                strokeLinecap="round"
              />
            ))}
          </G>
        ),
      });
      items.push({
        z: v[2],
        el: (
          <AtomBall
            key={`a${i}`}
            el={outer}
            cx={p.x}
            cy={p.y}
            r={ro * (1 + v[2] * 0.12)}
            ids={paint.ids}
          />
        ),
      });
    });
    pairs.forEach((v, i) => {
      const p = P(v, 0.62);
      const ang = Math.atan2(p.y - cy, p.x - cx) / RAD;
      const squash = Math.hypot(v[0], v[1]);
      items.push({
        z: v[2] - 0.02,
        el: (
          <G key={`l${i}`}>
            <Ellipse
              cx={p.x}
              cy={p.y}
              rx={L * 0.36 * Math.max(0.45, squash)}
              ry={L * 0.19}
              fill={c.chartMuted}
              opacity={0.22}
              stroke={c.chartMuted}
              strokeOpacity={0.5}
              transform={`rotate(${ang} ${p.x} ${p.y})`}
            />
            {[-1, 1].map((k) => (
              <Circle
                key={k}
                cx={p.x + Math.cos((ang + 90) * RAD) * 4 * k}
                cy={p.y + Math.sin((ang + 90) * RAD) * 4 * k}
                r={2.6}
                fill={c.chartInk}
              />
            ))}
          </G>
        ),
      });
    });
    items.push({
      z: 0,
      el: <AtomBall key="c" el={central} cx={cx} cy={cy} r={rc} ids={paint.ids} />,
    });
    // The angle between the first two bonds: a true arc between them in 3-D, seen in the view.
    const v0 = bonds[0]!;
    const v1 = bonds[1]!;
    const ar = 0.5;
    const theta = Math.acos(
      Math.max(-1, Math.min(1, v0[0] * v1[0] + v0[1] * v1[1] + v0[2] * v1[2])),
    );
    // Straight molecules bend the arc over the top (through the page's up direction).
    const upV: Vec = tilt(view([0, 1, 0], 0), turn);
    const arcAt = (t: number): Vec => {
      if (theta > Math.PI - 1e-6) {
        const a = t * Math.PI;
        return [
          v0[0] * Math.cos(a) + upV[0] * Math.sin(a),
          v0[1] * Math.cos(a) + upV[1] * Math.sin(a),
          v0[2] * Math.cos(a) + upV[2] * Math.sin(a),
        ];
      }
      const [k0, k1] = [
        Math.sin((1 - t) * theta) / Math.sin(theta),
        Math.sin(t * theta) / Math.sin(theta),
      ];
      return [v0[0] * k0 + v1[0] * k1, v0[1] * k0 + v1[1] * k1, v0[2] * k0 + v1[2] * k1];
    };
    const arc = Array.from({ length: 25 }, (_, i) => {
      const p = P(arcAt(i / 24), ar);
      return `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
    }).join(' ');
    const midP = P(arcAt(0.5), ar);
    const md = Math.hypot(midP.x - cx, midP.y - cy) || 1;
    const lab = {
      x: midP.x + ((midP.x - cx) / md) * 18,
      y: midP.y + ((midP.y - cy) / md) * 18 + 4,
    };
    const dip = spec.polar
      ? bonds.map((v, i) => {
          const p = P(v);
          const [ux, uy] = [p.x - cx, p.y - cy];
          const ln = Math.hypot(ux, uy) || 1;
          const [nx, ny] = [(-uy / ln) * 12, (ux / ln) * 12];
          const s = { x: cx + ux * 0.25 + nx, y: cy + uy * 0.25 + ny };
          const e = { x: cx + ux * 0.8 + nx, y: cy + uy * 0.8 + ny };
          return dEN >= 0 ? (
            <DipoleArrow key={`d${i}`} x1={s.x} y1={s.y} x2={e.x} y2={e.y} color={c.dipole} />
          ) : (
            <DipoleArrow key={`d${i}`} x1={e.x} y1={e.y} x2={s.x} y2={s.y} color={c.dipole} />
          );
        })
      : null;
    const netLen = Math.hypot(net[0], net[1]);
    const netArrow =
      spec.polar && netSize > 1e-6 && netLen > 1e-6
        ? (() => {
            const [ux, uy] = [net[0] / netLen, -net[1] / netLen];
            // Beside the molecule, parallel to the net dipole.
            const [ox, oy] = [-uy * L * 1.45, ux * L * 1.45];
            const side = ox >= 0 ? 1 : -1;
            const start = { x: cx + side * ox - ux * L * 0.55, y: cy + side * oy - uy * L * 0.55 };
            const end = { x: cx + side * ox + ux * L * 0.55, y: cy + side * oy + uy * L * 0.55 };
            return (
              <G>
                <DipoleArrow
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  color={c.chartHighlight}
                  width={3.5}
                />
                <ChartText
                  x={Math.min(w - 36, Math.max(36, end.x + ux * 16))}
                  y={end.y + uy * 16 + 4}
                  fontSize={chart.label}
                  fontWeight="700"
                  textAnchor="middle"
                  fill={c.chartHighlight}
                >
                  net dipole
                </ChartText>
              </G>
            );
          })()
        : null;
    return (
      <Svg width={w} height={h}>
        <Defs>{paint.defs}</Defs>
        <G opacity={known ? 1 : 0.4}>
          {items
            .filter((it) => it.z < 0)
            .sort((p, q) => p.z - q.z)
            .map((it) => it.el)}
          <Path d={arc} fill="none" stroke={c.chartInk} strokeWidth={1.4} />
          {items
            .filter((it) => it.z >= 0)
            .sort((p, q) => p.z - q.z)
            .map((it) => it.el)}
          {dip}
          {netArrow}
          <ChartText
            x={lab.x}
            y={lab.y}
            fontSize={chart.value}
            fontWeight="700"
            textAnchor="middle"
          >
            {`${formatNumber(shape.angle)}°`}
          </ChartText>
        </G>
        <ChartText x={8} y={18} fontSize={chart.label} fill={c.chartMuted}>
          {`${subscript(formula)}: ${shape.name}`}
        </ChartText>
      </Svg>
    );
  };

  return (
    <View>
      <Canvas aspect={(w) => Math.min(300, w * 0.8) / w}>{({ w, h }) => art(w, h)}</Canvas>
      <Caption>
        {[
          `${b} bonded atoms and ${l} lone pair${l === 1 ? '' : 's'}: ${b + l} electron domains spread out as ${shape.domains === 'linear' ? 'a line' : `a ${shape.domains} arrangement`}.`,
          `The shape is ${shape.name}, bond angle ${formatNumber(shape.angle)}° (for example ${subscript(formula)})${l > 0 && b + l > 2 ? '; lone pairs push the bonds a little closer' : ''}.`,
          spec.polar
            ? netSize > 1e-6
              ? `The bond dipoles (crossed arrows, toward the more electronegative atom) add up: the molecule is polar.`
              : `The bond dipoles are equal and spread evenly around the central atom, so they cancel: the molecule is nonpolar.`
            : undefined,
        ]
          .filter(Boolean)
          .join(' · ')}
      </Caption>
    </View>
  );
}

// ─── Hydrogen bonds ──────────────────────────────────────────────────────────

const HALF = 52.25;

function HydrogenBonds({
  spec,
  calc,
}: {
  spec: Extract<VseprSpec, { mode: 'hbonds' }>;
  calc: Calculator;
}) {
  const c = usePalette();
  const rep = useRep(calc);
  const read = reader(rep);
  const paint = useAtomPaint();
  const nr = read(spec.molecules);
  const n = Math.max(1, Math.min(5, Math.round(nr.value)));
  const k = hydrogenBonds(n);

  const art = (w: number, h: number): ReactNode => {
    const L = Math.min(44, (w - 20) / 7.2);
    const P = { x: w / 2, y: h / 2 + 4 };
    const dir = (deg: number) => ({ x: Math.cos(deg * RAD), y: Math.sin(deg * RAD) });
    const at = (o: { x: number; y: number }, deg: number, d: number) => ({
      x: o.x + dir(deg).x * d,
      y: o.y + dir(deg).y * d,
    });
    // Each molecule: its O and the screen angle its two H's straddle.
    const mols: { o: { x: number; y: number }; bis: number }[] = [{ o: P, bis: 90 }];
    const hbonds: { from: { x: number; y: number }; to: { x: number; y: number } }[] = [];
    const slots = [
      { kind: 'accept', a: 90 + HALF },
      { kind: 'donate', a: 215 },
      { kind: 'accept', a: 90 - HALF },
      { kind: 'donate', a: 325 },
    ];
    slots.slice(0, n - 1).forEach((s) => {
      const o = at(P, s.a, 2.9 * L);
      if (s.kind === 'accept') {
        // The central molecule's H points at this O; its own H's point away.
        mols.push({ o, bis: s.a });
        hbonds.push({ from: at(P, s.a, L), to: o });
      } else {
        // This molecule's first H points back at the central O.
        const bis = s.a + 180 - HALF;
        mols.push({ o, bis });
        hbonds.push({ from: at(o, bis + HALF, L), to: P });
      }
    });
    const rO = atomRadius('O') * L * 0.95;
    const rH = atomRadius('H') * L * 0.95;
    return (
      <Svg width={w} height={h}>
        <Defs>{paint.defs}</Defs>
        <G opacity={nr.known ? 1 : 0.4}>
          {hbonds.map((b, i) => {
            const len = Math.hypot(b.to.x - b.from.x, b.to.y - b.from.y);
            const [ux, uy] = [(b.to.x - b.from.x) / len, (b.to.y - b.from.y) / len];
            return (
              <Line
                key={`hb${i}`}
                x1={b.from.x + ux * (rH + 2)}
                y1={b.from.y + uy * (rH + 2)}
                x2={b.to.x - ux * (rO + 2)}
                y2={b.to.y - uy * (rO + 2)}
                stroke={c.chartHighlight}
                strokeWidth={2.4}
                strokeDasharray="2 5"
                strokeLinecap="round"
              />
            );
          })}
          {mols.map((m, i) => {
            const hs = [at(m.o, m.bis + HALF, L), at(m.o, m.bis - HALF, L)];
            return (
              <G key={`m${i}`}>
                {hs.map((p, j) => (
                  <Line
                    key={j}
                    x1={m.o.x}
                    y1={m.o.y}
                    x2={p.x}
                    y2={p.y}
                    stroke={c.atomBond}
                    strokeWidth={4}
                    strokeLinecap="round"
                  />
                ))}
                <AtomBall el="O" cx={m.o.x} cy={m.o.y} r={rO} ids={paint.ids} />
                {hs.map((p, j) => (
                  <AtomBall
                    key={`h${j}`}
                    el="H"
                    cx={p.x}
                    cy={p.y}
                    r={rH}
                    ids={paint.ids}
                    symbol={false}
                  />
                ))}
              </G>
            );
          })}
          {/* Partial charges on the middle molecule. */}
          <ChartText
            x={P.x}
            y={P.y - rO - 6}
            fontSize={chart.label}
            fontWeight="700"
            textAnchor="middle"
            fill={c.chartInk}
          >
            δ−
          </ChartText>
          {[90 + HALF, 90 - HALF].map((a) => {
            const p = at(P, a, L + rH + 9);
            return (
              <ChartText
                key={a}
                x={p.x}
                y={p.y + 4}
                fontSize={chart.label}
                fontWeight="700"
                textAnchor="middle"
                fill={c.chartInk}
              >
                δ+
              </ChartText>
            );
          })}
        </G>
      </Svg>
    );
  };

  return (
    <View>
      <Canvas aspect={(w) => Math.min(w * 0.85, 320) / w}>{({ w, h }) => art(w, h)}</Canvas>
      <Caption>
        {nr.known
          ? [
              `${n} water molecules, ${k} hydrogen bond${k === 1 ? '' : 's'} (dotted).`,
              'Each is the attraction between a partly positive H (δ+) on one molecule and a lone pair on the partly negative O (δ−) of another.',
              'One water molecule can hold 4: two through its H atoms and two through its lone pairs.',
            ].join(' · ')
          : 'Type the number of molecules.'}
      </Caption>
    </View>
  );
}
