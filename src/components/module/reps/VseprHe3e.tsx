/**
 * `vsepr` modes `expanded` and `complex` (HC72, `typesHe3e.ts`): ball-and-stick molecules from 2
 * to 6 electron domains (lone pairs equatorial in 5, trans in 6) with the hybrid named, and a
 * metal complex with its ligands placed as cis, trans, fac or mer. Atoms in the classroom (CPK)
 * colors, lit like balls; the geometry is in `vseprHe3eMath.ts`.
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, Line, Path } from 'react-native-svg';

import type { VseprComplexSpec, VseprExpandedSpec } from '@/data/modules/typesHe3e';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { atomRadius, subscript } from './chem';
import { Canvas, Caption, ChartText, useRep } from './common';
import { reader } from './graphKit';
import { AtomBall, useAtomPaint } from './MoleculeArt';
import { tilt, type Vec } from './vseprGeo';
import {
  angleBetween,
  complexPlaces,
  expandedDirections,
  expandedShape,
  freeBend,
  isomerFits,
  markedPair,
  isomerPlaces,
} from './vseprHe3eMath';

const RAD = Math.PI / 180;

/** Turned about the upright by `spin` and tipped by `tip`, so no atom hides another. */
const view = (v: Vec, spin: number, tip: number): Vec => {
  const [c0, s0] = [Math.cos(spin * RAD), Math.sin(spin * RAD)];
  return tilt([v[0] * c0 + v[2] * s0, v[1], -v[0] * s0 + v[2] * c0], tip);
};

/** Where a bond leaves a ball of radius r at (cx, cy) toward p (never across its letter). */
const edgeOf = (cx: number, cy: number, r: number) => (p: { x: number; y: number }) => {
  const len = Math.hypot(p.x - cx, p.y - cy) || 1;
  const k = Math.min(r * 0.9, len) / len;
  return { x: cx + (p.x - cx) * k, y: cy + (p.y - cy) * k };
};

/** An arc between two 3-D directions (slerp), at radius r, as an SVG path. */
function arcPath(
  a: Vec,
  b: Vec,
  P: (v: Vec, k: number) => { x: number; y: number },
  r: number,
  up: Vec,
) {
  const theta = Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])));
  const at = (t: number): Vec => {
    if (theta > Math.PI - 1e-6) {
      const s = t * Math.PI;
      return [
        a[0] * Math.cos(s) + up[0] * Math.sin(s),
        a[1] * Math.cos(s) + up[1] * Math.sin(s),
        a[2] * Math.cos(s) + up[2] * Math.sin(s),
      ];
    }
    const [k0, k1] = [
      Math.sin((1 - t) * theta) / Math.sin(theta),
      Math.sin(t * theta) / Math.sin(theta),
    ];
    return [a[0] * k0 + b[0] * k1, a[1] * k0 + b[1] * k1, a[2] * k0 + b[2] * k1];
  };
  const d = Array.from({ length: 25 }, (_, i) => {
    const p = P(at(i / 24), r);
    return `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  }).join(' ');
  return { d, mid: P(at(0.5), r) };
}

export function VseprHe3e({
  spec,
  calc,
}: {
  spec: VseprExpandedSpec | VseprComplexSpec;
  calc: Calculator;
}) {
  if (spec.mode === 'complex') return <Complex spec={spec} calc={calc} />;
  return <Expanded spec={spec} calc={calc} />;
}

// ─── Expanded (2–6 domains) ─────────────────────────────────────────────────

function Expanded({ spec, calc }: { spec: VseprExpandedSpec; calc: Calculator }) {
  const c = usePalette();
  const read = reader(useRep(calc));
  const paint = useAtomPaint();
  const br = read(spec.bonded);
  const lr = read(spec.lone);
  const b = Math.round(br.value);
  const l = Math.round(lr.value);
  const known = br.known && lr.known;
  const shape = known ? expandedShape(b, l) : undefined;
  const height = 300;
  if (!shape)
    return (
      <Caption>
        {known
          ? `${b} bonded atoms and ${l} lone pairs make ${b + l} electron domains; the shapes drawn have 2 to 6, with at least 2 bonds.`
          : 'Type the bonded atoms and lone pairs on the central atom.'}
      </Caption>
    );
  const central = spec.central ?? shape.example.central;
  const outer = spec.outer ?? shape.example.outer;
  const formula = spec.formula
    ? subscript(spec.formula)
    : spec.central
      ? `${central}${outer}${subscript(String(b))}`
      : shape.example.formula;
  const d = b + l;
  const spin = d === 6 ? 30 : d === 5 ? 20 : d === 4 ? 28 : 0;
  const tip = d === 6 ? 26 : d === 5 ? 12 : d === 4 ? 12 : 0;
  const dirs = expandedDirections(b, l);
  const bonds = dirs.bonds.map((v) => view(v, spin, tip));
  const pairs = dirs.lone.map((v) => view(v, spin, tip));

  const art = (w: number): ReactNode => {
    const L = Math.min(92, w * 0.24);
    const cx = w / 2;
    const cy = height / 2 + 14;
    const P = (v: Vec, k = 1) => ({ x: cx + v[0] * L * k, y: cy - v[1] * L * k, z: v[2] });
    const rc = atomRadius(central) * L * 0.55;
    const ro = atomRadius(outer) * L * 0.55;
    const edge = edgeOf(cx, cy, rc);
    const items: { z: number; el: ReactNode }[] = [];
    bonds.forEach((v, i) => {
      const p = P(v);
      items.push({
        z: Math.min(v[2] / 2, v[2]) - 0.01,
        el: (
          <Line
            key={`s${i}`}
            x1={edge(p).x}
            y1={edge(p).y}
            x2={p.x}
            y2={p.y}
            stroke={c.atomBond}
            strokeWidth={5}
            strokeLinecap="round"
          />
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
      const p = P(v, 0.6);
      const ang = Math.atan2(p.y - cy, p.x - cx) / RAD;
      const squash = Math.hypot(v[0], v[1]);
      items.push({
        z: v[2] - 0.02,
        el: (
          <G key={`l${i}`}>
            <Ellipse
              cx={p.x}
              cy={p.y}
              rx={L * 0.34 * Math.max(0.45, squash)}
              ry={L * 0.18}
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
    // The smallest bond angle (the pair nearest the page), a true arc between them.
    const [i0, i1] = markedPair(bonds);
    const bend = view(freeBend(dirs.bonds[i0]!, [...dirs.bonds, ...dirs.lone]), spin, tip);
    const arc = arcPath(bonds[i0]!, bonds[i1]!, P, 0.62, bend);
    const md = Math.hypot(arc.mid.x - cx, arc.mid.y - cy) || 1;
    const lab = {
      x: arc.mid.x + ((arc.mid.x - cx) / md) * 20,
      y: arc.mid.y + ((arc.mid.y - cy) / md) * 20 + 4,
    };
    const drawnAngle = angleBetween(dirs.bonds[i0]!, dirs.bonds[i1]!);
    return (
      <Svg width={w} height={height}>
        <Defs>{paint.defs}</Defs>
        {items
          .filter((it) => it.z < 0)
          .sort((p, q) => p.z - q.z)
          .map((it) => it.el)}
        <Path d={arc.d} fill="none" stroke={c.chartInk} strokeWidth={1.4} />
        {items
          .filter((it) => it.z >= 0)
          .sort((p, q) => p.z - q.z)
          .map((it) => it.el)}
        <ChartText
          x={lab.x}
          y={lab.y}
          fontSize={chart.value}
          fontWeight="700"
          textAnchor="middle"
          halo
        >
          {`${formatNumber(Math.round(drawnAngle * 10) / 10)}°`}
        </ChartText>
        <ChartText x={8} y={18} fontSize={chart.label} fontWeight="700">
          {`${formula}: ${shape.name}`}
        </ChartText>
        <ChartText x={8} y={34} fontSize={chart.label} fill={c.chartMuted}>
          {`${d} domains, ${shape.hybrid}`}
        </ChartText>
      </Svg>
    );
  };

  return (
    <View>
      <Canvas aspect={(w) => height / w}>{({ w }) => art(w)}</Canvas>
      <Caption>
        {[
          `${b} bonded atoms and ${l} lone pair${l === 1 ? '' : 's'}: ${d} electron domains in a ${shape.domains} arrangement, ${shape.hybrid} hybrid orbitals.`,
          `The shape is ${shape.name} (for example ${shape.example.formula}); the domains are ${formatNumber(shape.domainAngle)}° apart at the closest.`,
          d === 5 && l > 0
            ? 'Lone pairs sit equatorial: there they have two neighbors at 90° instead of three.'
            : undefined,
          d === 6 && l === 2
            ? 'The two lone pairs sit trans, 180° apart, leaving a square plane.'
            : undefined,
        ]
          .filter(Boolean)
          .join(' · ')}
      </Caption>
    </View>
  );
}

// ─── Complex ─────────────────────────────────────────────────────────────────

const ISOMER_WORDS = {
  cis: 'cis: the two side by side, 90° apart',
  trans: 'trans: the two opposite, 180° apart',
  fac: 'fac: the three on one face, each pair 90° apart',
  mer: 'mer: the three in a plane through the metal, two of them trans',
};

function Complex({ spec, calc }: { spec: VseprComplexSpec; calc: Calculator }) {
  const c = usePalette();
  const read = reader(useRep(calc));
  const paint = useAtomPaint();
  const cx_ = spec.complex;
  const places = complexPlaces(cx_.geometry);
  const [major, minor] = cx_.ligands;
  const nMinor = minor?.count ?? 0;
  const lit = minor ? isomerPlaces(cx_.geometry, nMinor, cx_.isomer) : [];
  const total = cx_.ligands.reduce((s, x) => s + x.count, 0);
  const fits = !cx_.isomer || isomerFits(cx_.geometry, nMinor, cx_.isomer);
  const cn = spec.coordination === undefined ? undefined : read(spec.coordination);
  const height = 290;
  const spin = cx_.geometry === 'tetrahedral' ? 10 : 30;
  const tip = cx_.geometry === 'squarePlanar' ? 32 : 22;
  const dirs = places.map((v) => view(v, spin, tip));
  const ligandAt = (i: number) => (lit.includes(i) ? minor! : major!);

  const art = (w: number): ReactNode => {
    const L = Math.min(88, w * 0.23);
    const cx = w / 2;
    const cy = height / 2 + 10;
    const P = (v: Vec, k = 1) => ({ x: cx + v[0] * L * k, y: cy - v[1] * L * k });
    const rm = atomRadius(cx_.metal) * L * 0.62;
    const edge = edgeOf(cx, cy, rm);
    const items: { z: number; el: ReactNode }[] = [];
    dirs.slice(0, total).forEach((v, i) => {
      const p = P(v);
      const lg = ligandAt(i);
      const r = atomRadius(lg.donor) * L * 0.5 * (1 + v[2] * 0.12);
      const on = lit.includes(i);
      // The name beyond the ball, along the bond as drawn (above when it points at you).
      const len = Math.hypot(p.x - cx, p.y - cy);
      const [ux, uy] = len > 8 ? [(p.x - cx) / len, (p.y - cy) / len] : [0, -1];
      const reach = r + 8 + (Math.abs(ux) > 0.5 ? subscript(lg.name).length * 3.6 : 6);
      const lp = { x: p.x + ux * reach, y: p.y + uy * reach };
      items.push({
        z: Math.min(v[2] / 2, v[2]) - 0.01,
        el: (
          <Line
            key={`s${i}`}
            x1={edge(p).x}
            y1={edge(p).y}
            x2={p.x}
            y2={p.y}
            stroke={c.atomBond}
            strokeWidth={4}
            strokeLinecap="round"
          />
        ),
      });
      items.push({
        z: v[2],
        el: (
          <G key={`a${i}`}>
            {on ? (
              <Circle
                cx={p.x}
                cy={p.y}
                r={r + 4}
                fill="none"
                stroke={c.complexLit}
                strokeWidth={3}
              />
            ) : null}
            <AtomBall el={lg.donor} cx={p.x} cy={p.y} r={r} ids={paint.ids} symbol={false} />
            <ChartText
              x={lp.x}
              y={lp.y + 4}
              fontSize={chart.label}
              fontWeight="700"
              textAnchor="middle"
              fill={on ? c.chartInk : c.chartMuted}
              halo
            >
              {subscript(lg.name)}
            </ChartText>
          </G>
        ),
      });
    });
    items.push({
      z: 0,
      el: <AtomBall key="m" el={cx_.metal} cx={cx} cy={cy} r={rm} ids={paint.ids} />,
    });
    // The lit pair's angle (the first two lit places).
    const pair: [number, number] | undefined =
      lit.length >= 2 && fits ? [lit[0]!, lit[1]!] : undefined;
    const arc = pair
      ? arcPath(
          dirs[pair[0]]!,
          dirs[pair[1]]!,
          P,
          0.55,
          view(freeBend(places[pair[0]]!, places.slice(0, total)), spin, tip),
        )
      : undefined;
    const ang = pair ? angleBetween(places[pair[0]]!, places[pair[1]]!) : 0;
    const md = arc ? Math.hypot(arc.mid.x - cx, arc.mid.y - cy) || 1 : 1;
    return (
      <Svg width={w} height={height}>
        <Defs>{paint.defs}</Defs>
        <G opacity={fits ? 1 : 0.4}>
          {items
            .filter((it) => it.z < 0)
            .sort((p, q) => p.z - q.z)
            .map((it) => it.el)}
          {arc ? <Path d={arc.d} fill="none" stroke={c.complexLit} strokeWidth={2} /> : null}
          {items
            .filter((it) => it.z >= 0)
            .sort((p, q) => p.z - q.z)
            .map((it) => it.el)}
          {arc ? (
            <ChartText
              x={arc.mid.x + ((arc.mid.x - cx) / md) * 14}
              y={arc.mid.y + ((arc.mid.y - cy) / md) * 14 + 4}
              fontSize={chart.value}
              fontWeight="700"
              textAnchor="middle"
              halo
            >
              {`${formatNumber(Math.round(ang))}°`}
            </ChartText>
          ) : null}
        </G>
        <ChartText x={8} y={18} fontSize={chart.label} fontWeight="700">
          {`${cx_.formula ? subscript(cx_.formula) : cx_.metal}${cx_.isomer ? ` (${cx_.isomer})` : ''}`}
        </ChartText>
        <ChartText x={8} y={34} fontSize={chart.label} fill={c.chartMuted}>
          {cx_.geometry === 'squarePlanar' ? 'square planar' : cx_.geometry}
        </ChartText>
      </Svg>
    );
  };

  return (
    <View>
      <Canvas aspect={(w) => height / w}>{({ w }) => art(w)}</Canvas>
      <Caption>
        {[
          `${cx_.metal} with ${cx_.ligands.map((x) => `${x.count} ${subscript(x.name)}`).join(' and ')}: coordination number ${cn?.known ? cn.text : total}, ${cx_.geometry === 'squarePlanar' ? 'square planar' : cx_.geometry}.`,
          cx_.isomer
            ? fits
              ? `The ${subscript(minor!.name)} ligands (ringed) are ${ISOMER_WORDS[cx_.isomer]}.`
              : `No ${cx_.isomer} isomer here: cis and trans need two of a ligand on a square or an octahedron; fac and mer need three on an octahedron.`
            : undefined,
        ]
          .filter(Boolean)
          .join(' · ')}
      </Caption>
    </View>
  );
}
