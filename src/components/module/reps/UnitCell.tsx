/**
 * HC16 `unitCell`: a cubic cell in perspective with its atoms (shrunk spheres, painted) counted
 * to Z by where they sit, the touching line lit with a and r (full-size atoms on the front face
 * where they touch there), a lattice plane (hkl) shaded with the next one, its intercepts and d,
 * and Bragg's law on rows of atoms d apart (UnitCellSpec in typesHe2b.ts).
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { NumOrVar } from '@/data/modules/typesGraphs';
import type { UnitCellSpec } from '@/data/modules/typesHe2b';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { Arrow, LH, r4, useValueLabel } from './he1fKit';
import { Ball, url, usePaintIds } from './paint';
import { LENGTH_M } from './potentialWellMath';
import {
  braggOrder,
  cellAtoms,
  cellZ,
  edgeFromRadius,
  LATTICES,
  latticeOfZ,
  planePolygon,
  SHARE,
  spacing,
  TOUCH,
  type Lattice,
  type Site,
} from './unitCellMath';

const BW = 356;
/** The front face's side, and the depth axis drawn up and to the right. */
const S = 148;
const DX = 0.44 * S * Math.cos(Math.PI / 6);
const DY = 0.44 * S * Math.sin(Math.PI / 6);
const X0 = 30;

const NAMES: Record<Lattice, string> = {
  sc: 'Simple cubic',
  bcc: 'Body-centred cubic',
  fcc: 'Face-centred cubic',
  rocksalt: 'Rock salt',
  cesiumChloride: 'Caesium chloride',
  zincBlende: 'Zinc blende',
};
/** r ÷ a when no radius is given: the touching value (ions: a typical anion). */
const DEFAULT_RATIO: Record<Lattice, [number, number]> = {
  sc: [0.5, 0],
  bcc: [Math.sqrt(3) / 4, 0],
  fcc: [Math.SQRT2 / 4, 0],
  rocksalt: [0.32, 0.18],
  cesiumChloride: [0.44, 0.42],
  zincBlende: [0.33, 0.11],
};
const SHARE_TEXT: Record<Site, string> = { corner: '⅛', edge: '¼', face: '½', body: '1' };
const SITE_WORD: Record<Site, string> = {
  corner: 'corners',
  edge: 'edges',
  face: 'faces',
  body: 'inside',
};
const TOUCH_TEXT: Record<Lattice, string> = {
  sc: 'along an edge: 2r = a',
  bcc: 'along the body diagonal: 4r = √3a',
  fcc: 'along a face diagonal: 4r = √2a',
  rocksalt: 'along an edge: 2(r₊ + r₋) = a',
  cesiumChloride: 'along the body diagonal: 2(r₊ + r₋) = √3a',
  zincBlende: 'along ¼ body diagonal: 4(r₊ + r₋) = √3a',
};

/** A pie showing the share of an atom in the cell. */
function SharePie({
  x,
  y,
  share,
  color,
  ink,
}: {
  x: number;
  y: number;
  share: number;
  color: string;
  ink: string;
}) {
  const r = 6;
  if (share >= 1) return <Circle cx={x} cy={y} r={r} fill={color} stroke={ink} strokeWidth={0.8} />;
  const a = 2 * Math.PI * share;
  const d = `M ${x} ${y} L ${x} ${y - r} A ${r} ${r} 0 ${share > 0.5 ? 1 : 0} 1 ${x + r * Math.sin(a)} ${y - r * Math.cos(a)} Z`;
  return (
    <G>
      <Circle
        cx={x}
        cy={y}
        r={r}
        fill="none"
        stroke={ink}
        strokeWidth={0.8}
        strokeDasharray="2 2"
      />
      <Path d={d} fill={color} stroke={ink} strokeWidth={0.8} />
    </G>
  );
}

/** Cubic unit cells, planes and Bragg's law (UnitCellSpec). */
export function UnitCell({ spec, calc }: { spec: UnitCellSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const valueLabel = useValueLabel(calc);
  const paint = usePaintIds('a0', 'a1', 'clip', 'bragg');
  const get = (x: NumOrVar | undefined) =>
    x === undefined ? undefined : typeof x === 'number' ? x : rep.known(x) ? rep.val(x) : undefined;
  const unitOf = (x: NumOrVar | undefined) => (typeof x === 'string' ? rep.unit(x) : undefined);
  const lab = (x: NumOrVar | undefined) => (typeof x === 'string' ? valueLabel(x) : undefined);
  const moreLines = (spec.more ?? []).map((id) => valueLabel(id)).filter((t): t is string => !!t);

  const lattice: Lattice | undefined = (LATTICES as string[]).includes(spec.lattice)
    ? (spec.lattice as Lattice)
    : (() => {
        const z = get(spec.lattice);
        return z === undefined ? undefined : latticeOfZ(z);
      })();
  const ionic = lattice === 'rocksalt' || lattice === 'cesiumChloride' || lattice === 'zincBlende';
  const colors = ionic ? [c.cellAnion, c.cellCation] : [c.cellMetal, c.cellCation];
  const names = [spec.names?.[0] ?? (ionic ? 'anion' : 'atom'), spec.names?.[1] ?? 'cation'];

  // r ÷ a for the drawing: from the values when they are known (one length unit), else typical.
  const toM = (x: NumOrVar | undefined) => LENGTH_M[unitOf(x) ?? ''] ?? 1;
  const r0 = get(spec.radius);
  const r1 = get(spec.cation);
  const a0 = get(spec.edge);
  const aM =
    a0 !== undefined
      ? a0 * toM(spec.edge)
      : lattice && r0 !== undefined
        ? edgeFromRadius(lattice, r0 * toM(spec.radius), (r1 ?? 0) * toM(spec.cation))
        : undefined;
  const ratio: [number, number] = lattice
    ? [
        r0 !== undefined && aM ? (r0 * toM(spec.radius)) / aM : DEFAULT_RATIO[lattice][0],
        r1 !== undefined && aM ? (r1 * toM(spec.cation)) / aM : DEFAULT_RATIO[lattice][1],
      ]
    : [0, 0];

  const hkl = spec.planes
    ? ([get(spec.planes.h), get(spec.planes.k), get(spec.planes.l)] as const)
    : undefined;
  const hklOk =
    hkl !== undefined &&
    hkl.every((x) => x !== undefined && Number.isInteger(x) && x >= 0) &&
    hkl.some((x) => x! > 0);

  const showCell = !spec.braggOnly;
  const parts: ReactNode[] = [];
  const captions: string[] = [];
  const rows: { t: string; bold?: boolean }[] = [];
  let y = 8;

  if (showCell) {
    const top = y + 18;
    const Y0 = top + DY + S;
    const P = (p: readonly number[]): [number, number] => [
      X0 + S * p[0]! + DX * p[2]!,
      Y0 - S * p[1]! - DY * p[2]!,
    ];
    const corners = [0, 1].flatMap((x) => [0, 1].flatMap((yy) => [0, 1].map((z) => [x, yy, z])));
    const edges: [number[], number[]][] = [];
    for (const a of corners)
      for (const b of corners)
        if (a.reduce((s, v, i) => s + Math.abs(v - b[i]!), 0) === 1 && a.join() < b.join())
          edges.push([a, b]);
    const hidden = (e: [number[], number[]]) => e.some((p) => p.join() === '0,0,1');
    const line = (a: readonly number[], b: readonly number[]) => {
      const [p, q] = [P(a), P(b)];
      return { x1: p[0], y1: p[1], x2: q[0], y2: q[1] };
    };
    const atoms = lattice ? cellAtoms(lattice) : [];
    const order = [...atoms].sort((p, q) => q.p[2] - p.p[2] || p.p[1] - q.p[1]);
    const dim = spec.planes !== undefined;
    const touch = lattice && spec.touching ? TOUCH[lattice] : undefined;
    const touchEnd: Record<string, number[]> = {
      edge: [1, 0, 0],
      face: [1, 1, 0],
      body: lattice === 'zincBlende' ? [0.25, 0.25, 0.25] : [1, 1, 1],
    };

    // The touching line's radii, from its start: the atoms it passes, full size.
    const ticks = (() => {
      if (!touch || !lattice) return [];
      const [ra, rc] = ratio;
      const L =
        touch === 'edge'
          ? 1
          : touch === 'face'
            ? Math.SQRT2
            : lattice === 'zincBlende'
              ? Math.sqrt(3) / 4
              : Math.sqrt(3);
      const seq =
        lattice === 'sc'
          ? [ra, ra]
          : lattice === 'bcc'
            ? [ra, ra, ra, ra]
            : lattice === 'fcc'
              ? [ra, ra, ra, ra]
              : lattice === 'zincBlende'
                ? [ra, rc]
                : [ra, rc, rc, ra];
      let acc = 0;
      return seq.slice(0, -1).map((r) => (acc += r) / L);
    })();

    // Front-face atoms drawn full size where they touch on that face (sc, fcc, rock salt).
    const fullFront =
      touch && lattice && touch !== 'body'
        ? atoms.filter((a) => a.p[2] === 0 && (touch === 'edge' ? a.p[1] === 0 : true))
        : [];

    parts.push(
      <G key="cell">
        <Defs>
          <ClipPath id={paint.clip}>
            <Rect x={X0} y={Y0 - S} width={S} height={S} />
          </ClipPath>
        </Defs>
        {lattice ? (
          <ChartText x={8} y={y + 8} fontSize={chart.label} fontWeight="bold">
            {`${NAMES[lattice]}${spec.names?.length ? ` (${spec.names.filter(Boolean).join(', ')})` : ''}`}
          </ChartText>
        ) : null}
        {edges.filter(hidden).map(([a, b]) => (
          <Line
            key={a.join() + b.join()}
            {...line(a, b)}
            stroke={c.chartMuted}
            strokeWidth={1.2}
            strokeDasharray={chart.dashFine}
          />
        ))}
        {/* The plane (hkl) and the next one. */}
        {hklOk
          ? [2, 1].map((m) => {
              const poly = planePolygon(hkl![0]!, hkl![1]!, hkl![2]!, m);
              if (poly.length < 3) return null;
              const d = poly.map((p, i) => `${i ? 'L' : 'M'} ${P(p).join(' ')}`).join(' ') + ' Z';
              return (
                <Path
                  key={m}
                  d={d}
                  fill={c.cellPlane}
                  opacity={m === 1 ? 0.55 : 0.28}
                  stroke={c.cellPlane}
                  strokeWidth={1.4}
                  strokeDasharray={m === 1 ? undefined : chart.dash}
                />
              );
            })
          : null}
        {edges
          .filter((e) => !hidden(e))
          .map(([a, b]) => (
            <Line key={a.join() + b.join()} {...line(a, b)} stroke={c.chartInk} strokeWidth={1.4} />
          ))}
        {/* Full-size atoms on the front face, clipped to the cell: they touch along the lit line. */}
        <G clipPath={url(paint.clip)}>
          {fullFront.map((a) => {
            const [x, yy] = P(a.p);
            return (
              <Circle
                key={a.p.join()}
                cx={x}
                cy={yy}
                r={ratio[a.species] * S}
                fill={colors[a.species]}
                opacity={0.16}
                stroke={colors[a.species]}
                strokeWidth={1}
              />
            );
          })}
        </G>
        {order.map((a) => {
          const [x, yy] = P(a.p);
          const r = Math.max(4, 0.34 * ratio[a.species] * S);
          return (
            <Circle
              key={a.p.join()}
              cx={x}
              cy={yy}
              r={r}
              fill={url(a.species ? paint.a1 : paint.a0)}
              stroke={c.chartInk}
              strokeWidth={0.6}
              opacity={dim ? 0.6 : 1}
            />
          );
        })}
        {touch ? (
          <G>
            <Line {...line([0, 0, 0], touchEnd[touch]!)} stroke={c.cellTouch} strokeWidth={3} />
            {ticks.map((t) => {
              const e = touchEnd[touch]!;
              const [x, yy] = P(e.map((v) => v * t));
              return (
                <Circle
                  key={t}
                  cx={x}
                  cy={yy}
                  r={2.6}
                  fill={c.background}
                  stroke={c.cellTouch}
                  strokeWidth={1.4}
                />
              );
            })}
          </G>
        ) : null}
        {/* Axes from the origin; intercepts a ÷ h and the spacing d. */}
        {hklOk || spec.planes ? (
          <G>
            {(
              [
                [[1.12, 0, 0], 'x'],
                [[0, 1.1, 0], 'y'],
                [[0, 0, 1.18], 'z'],
              ] as const
            ).map(([p, t]) => {
              const [x, yy] = P(p);
              return (
                <ChartText
                  key={t}
                  x={x}
                  y={yy + 4}
                  textAnchor="middle"
                  fontSize={chart.label}
                  fontStyle="italic"
                  fill={c.chartMuted}
                >
                  {t}
                </ChartText>
              );
            })}
          </G>
        ) : null}
        {hklOk
          ? (() => {
              const [h, k, l] = hkl! as readonly number[];
              const n2 = h! * h! + k! * k! + l! * l!;
              const foot = [h! / n2, k! / n2, l! / n2];
              const [fx, fy] = P(foot);
              const [ox, oy] = P([0, 0, 0]);
              const marks: ReactNode[] = [];
              const idx = [h!, k!, l!];
              const letters = ['h', 'k', 'l'];
              idx.forEach((v, i) => {
                if (v === 0) return;
                const p = [0, 0, 0];
                p[i] = 1 / v;
                const [x, yy] = P(p);
                const text = v === 1 ? 'a' : `a ÷ ${v}`;
                const off =
                  i === 0 ? [0, 16, 'middle'] : i === 1 ? [8, 4, 'start'] : [-8, -4, 'end'];
                marks.push(
                  <G key={letters[i]}>
                    <Circle
                      cx={x}
                      cy={yy}
                      r={3}
                      fill={c.cellPlane}
                      stroke={c.chartInk}
                      strokeWidth={1}
                    />
                    <ChartText
                      x={x + (off[0] as number)}
                      y={yy + (off[1] as number)}
                      textAnchor={off[2] as 'middle' | 'start' | 'end'}
                      fontSize={chart.label}
                      halo
                    >
                      {text}
                    </ChartText>
                  </G>,
                );
              });
              return (
                <G>
                  {marks}
                  {Math.hypot(fx - ox, fy - oy) > 14 ? (
                    <Arrow x1={ox} y1={oy} x2={fx} y2={fy} color={c.chartInk} width={1.6} />
                  ) : null}
                  <ChartText
                    x={idx.filter((v) => v > 0).length === 1 ? (ox + fx) / 2 : fx + 8}
                    y={idx.filter((v) => v > 0).length === 1 ? (oy + fy) / 2 - 8 : fy + 12}
                    textAnchor={idx.filter((v) => v > 0).length === 1 ? 'middle' : 'start'}
                    fontSize={chart.label}
                    fontStyle="italic"
                    fontWeight="bold"
                    halo
                  >
                    d
                  </ChartText>
                </G>
              );
            })()
          : null}
      </G>,
    );

    // The count column beside the cell: each species' sites and shares, summed to Z.
    if (lattice && !dim) {
      const col: ReactNode[] = [];
      let cy = top + 6;
      const cx = X0 + S + DX + 18;
      ([0, 1] as const).forEach((sp) => {
        const mine = atoms.filter((a) => a.species === sp);
        if (!mine.length) return;
        if (ionic) {
          col.push(
            <ChartText
              key={`h${sp}`}
              x={cx}
              y={cy + 4}
              fontSize={chart.label}
              fontWeight="bold"
              fill={colors[sp]}
            >
              {names[sp]}
            </ChartText>,
          );
          cy += 17;
        }
        (['corner', 'edge', 'face', 'body'] as Site[]).forEach((site) => {
          const n = mine.filter((a) => a.site === site).length;
          if (!n) return;
          col.push(
            <G key={`${sp}${site}`}>
              <SharePie
                x={cx + 6}
                y={cy}
                share={SHARE[site]}
                color={colors[sp]!}
                ink={c.chartInk}
              />
              <ChartText x={cx + 17} y={cy + 4} fontSize={chart.label}>
                {`${n} ${SITE_WORD[site]} × ${SHARE_TEXT[site]}`}
              </ChartText>
            </G>,
          );
          cy += 17;
        });
        col.push(
          <ChartText key={`z${sp}`} x={cx} y={cy + 4} fontSize={chart.label} fontWeight="bold">
            {`= ${r4(cellZ(lattice, sp))}`}
          </ChartText>,
        );
        cy += 22;
      });
      parts.push(<G key="count">{col}</G>);
    }
    y = Y0 + (hklOk ? 22 : 8);

    if (lattice) {
      const z = cellZ(lattice);
      const zText = ionic
        ? `${z} formula unit${z === 1 ? '' : 's'}`
        : `${z} atom${z === 1 ? '' : 's'}`;
      if (!dim)
        captions.push(
          `Atoms on corners count ⅛, on edges ¼, on faces ½ and inside 1: Z = ${zText} per cell.`,
        );
      if (touch) {
        captions.push(`They touch ${TOUCH_TEXT[lattice]}.`);
        rows.push({
          t: `Touch ${TOUCH_TEXT[lattice]}`,
          bold: true,
        });
      }
    } else captions.push('Pick the structure to fill the cell.');
    if (spec.planes) {
      if (hklOk) {
        const [h, k, l] = hkl as readonly number[];
        const a = get(spec.edge);
        const d = a === undefined ? undefined : spacing(a, h!, k!, l!);
        rows.push({
          t: `(${h}${k}${l}) plane, the next one dashed${d !== undefined ? ` · d = ${r4(d)} ${unitOf(spec.edge) ?? ''}` : ''}`.trim(),
          bold: true,
        });
        captions.push(
          `The (${h}${k}${l}) plane cuts the axes at a ÷ h, a ÷ k and a ÷ l (never, for a 0); the next plane is d = a ÷ √(h² + k² + l²) farther on.`,
        );
      } else captions.push('Type whole indices h, k and l, not all 0, to shade the plane.');
    }
  }

  // ── Bragg's law on rows of atoms ──
  if (spec.bragg) {
    const b = spec.bragg;
    const d = get(b.spacing);
    const lam = get(b.wavelength);
    const tt = get(b.twoTheta);
    const theta = get(b.angle) ?? (tt === undefined ? undefined : tt / 2);
    const n = get(b.order);
    const lamInD =
      d !== undefined && lam !== undefined && d > 0
        ? (lam * toM(b.wavelength)) / (d * toM(b.spacing))
        : undefined;
    const top = y + (showCell ? 4 : 6);
    const dpx = showCell ? 40 : 46;
    const ya = top + (showCell ? 56 : 64);
    const xa = 168;
    const planes = [0, 1, 2].map((i) => ya + i * dpx);
    const th = theta !== undefined && theta > 0 && theta < 90 ? (theta * Math.PI) / 180 : undefined;
    const u = th === undefined ? undefined : [Math.cos(th), Math.sin(th)];
    const L = th === undefined ? 0 : Math.min(130, 58 / Math.sin(th));
    const B = [xa, ya + dpx];
    const P1 = u
      ? [B[0]! - dpx * Math.sin(th!) * u[0]!, B[1]! - dpx * Math.sin(th!) * u[1]!]
      : undefined;
    const P2 = u
      ? [B[0]! + dpx * Math.sin(th!) * u[0]!, B[1]! - dpx * Math.sin(th!) * u[1]!]
      : undefined;
    const order =
      d !== undefined && th !== undefined && lam !== undefined && lamInD
        ? braggOrder(1, theta!, lamInD)
        : undefined;
    const whole =
      order !== undefined &&
      Math.abs(order - Math.round(order)) <= 1e-3 * Math.max(1, order) &&
      Math.round(order) >= 1;
    parts.push(
      <G key="bragg">
        <Defs>
          <Ball id={paint.bragg} color={c.cellMetal} />
        </Defs>
        {planes.map((py) => (
          <G key={py}>
            <Line x1={10} x2={BW - 24} y1={py} y2={py} stroke={c.chartMuted} strokeWidth={1} />
            {Array.from({ length: 13 }, (_, i) => xa - 6 * 26 + i * 26).map((x) => (
              <Circle
                key={x}
                cx={x}
                cy={py}
                r={5.5}
                fill={url(paint.bragg)}
                stroke={c.chartInk}
                strokeWidth={0.5}
              />
            ))}
          </G>
        ))}
        {/* d between the first two planes, at the right. */}
        <Line
          x1={BW - 14}
          x2={BW - 14}
          y1={planes[0]}
          y2={planes[1]}
          stroke={c.chartInk}
          strokeWidth={1.2}
        />
        {[planes[0]!, planes[1]!].map((py) => (
          <Line
            key={py}
            x1={BW - 19}
            x2={BW - 9}
            y1={py}
            y2={py}
            stroke={c.chartInk}
            strokeWidth={1.2}
          />
        ))}
        <ChartText
          x={BW - 20}
          y={(planes[0]! + planes[1]!) / 2 + 4}
          textAnchor="end"
          fontSize={chart.label}
          fontStyle="italic"
          fontWeight="bold"
          halo
        >
          d
        </ChartText>
        {/* λ to scale against d. */}
        {lamInD !== undefined && lamInD * dpx < 200 ? (
          <G>
            <Line
              x1={12}
              x2={12 + lamInD * dpx}
              y1={top + 8}
              y2={top + 8}
              stroke={c.cellRay}
              strokeWidth={2}
            />
            {[12, 12 + lamInD * dpx].map((x) => (
              <Line
                key={x}
                x1={x}
                x2={x}
                y1={top + 3}
                y2={top + 13}
                stroke={c.cellRay}
                strokeWidth={1.4}
              />
            ))}
            <ChartText x={16 + lamInD * dpx} y={top + 12} fontSize={chart.label} fontStyle="italic">
              λ
            </ChartText>
          </G>
        ) : null}
        {u && P1 && P2 ? (
          <G>
            {[0, 1].map((i) => {
              const [hx, hy] = [xa, ya + i * dpx];
              return (
                <G key={i}>
                  <Arrow
                    x1={hx - L * u[0]!}
                    y1={hy - L * u[1]!}
                    x2={hx}
                    y2={hy}
                    color={c.cellRay}
                    width={1.8}
                  />
                  <Arrow
                    x1={hx}
                    y1={hy}
                    x2={hx + L * u[0]!}
                    y2={hy - L * u[1]!}
                    color={c.cellRay}
                    width={1.8}
                  />
                </G>
              );
            })}
            {/* Wavefronts in and out, and the extra path 2d sin θ lit. */}
            <Line
              x1={xa}
              y1={ya}
              x2={P1[0]}
              y2={P1[1]}
              stroke={c.chartInk}
              strokeWidth={1}
              strokeDasharray={chart.dashFine}
            />
            <Line
              x1={xa}
              y1={ya}
              x2={P2[0]}
              y2={P2[1]}
              stroke={c.chartInk}
              strokeWidth={1}
              strokeDasharray={chart.dashFine}
            />
            <Path
              d={`M ${P1[0]} ${P1[1]} L ${B[0]} ${B[1]} L ${P2[0]} ${P2[1]}`}
              stroke={c.cellTouch}
              strokeWidth={4}
              fill="none"
              strokeLinecap="round"
            />
            <Path
              d={`M ${xa - 24} ${ya} A 24 24 0 0 1 ${xa - 24 * u[0]!} ${ya - 24 * u[1]!}`}
              stroke={c.chartInk}
              strokeWidth={1.2}
              fill="none"
            />
            <ChartText
              x={xa - 30 - 6 * Math.cos(th! / 2)}
              y={ya - 8 * Math.sin(th! / 2) - 2}
              textAnchor="end"
              fontSize={chart.label}
              fontStyle="italic"
              halo
            >
              θ
            </ChartText>
            <ChartText
              x={P2[0]! + 10}
              y={B[1]! + 22}
              fontSize={chart.label}
              fontWeight="bold"
              fill={c.cellTouch}
              halo
            >
              2d sin θ
            </ChartText>
          </G>
        ) : null}
      </G>,
    );
    y = planes[2]! + 14;
    if (d !== undefined && th !== undefined) {
      const path = 2 * d * Math.sin(th);
      const unit = unitOf(b.spacing) ?? '';
      rows.push({
        t: `2d sin θ = ${r4(path)} ${unit}${order !== undefined ? ` = ${r4(order)}λ` : ''}${
          order !== undefined ? (whole ? ': in phase' : ': out of phase') : ''
        }`,
        bold: true,
      });
    }
    rows.push({
      t: [lab(b.spacing), lab(b.angle), lab(b.twoTheta), lab(b.wavelength), lab(b.order)]
        .filter(Boolean)
        .join(' · '),
    });
    captions.push(
      n !== undefined && whole && Math.round(order!) !== n
        ? `The path is ${Math.round(order!)} wavelengths, not n = ${n}.`
        : 'The wave off the next plane travels 2d sin θ farther: a whole number of wavelengths, nλ = 2d sin θ, and the two add.',
    );
  }

  // Values under the picture.
  const vals = [
    lab(spec.edge),
    lab(spec.radius),
    lab(spec.cation),
    lab(spec.atoms),
    lab(spec.molar),
    lab(spec.density),
    lab(spec.packing),
  ].filter((t): t is string => !!t);
  const valueRows: string[] = [];
  for (const v of vals) {
    const last = valueRows[valueRows.length - 1];
    if (last !== undefined && (last.length + v.length + 3) * 6.8 < BW - 16)
      valueRows[valueRows.length - 1] = `${last} · ${v}`;
    else valueRows.push(v);
  }
  /** Rows wrapped at their " · " joins to the canvas width. */
  const wrap = (r: { t: string; bold?: boolean }) => {
    const out: { t: string; bold?: boolean }[] = [];
    for (const part of r.t.split(' · ')) {
      const last = out[out.length - 1];
      if (last && (last.t.length + part.length + 3) * 6.8 < BW - 16) last.t = `${last.t} · ${part}`;
      else out.push({ t: part, bold: r.bold });
    }
    return out;
  };
  const allRows = [
    ...rows.filter((r) => r.t),
    ...valueRows.map((t) => ({ t, bold: false })),
    ...moreLines.map((t) => ({ t, bold: false })),
  ].flatMap(wrap);
  const rowsTop = y + 14;
  const BH = rowsTop + allRows.length * LH;

  return (
    <View>
      <Canvas aspect={BH / BW}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            <Defs>
              <Ball id={paint.a0} color={colors[0]!} />
              <Ball id={paint.a1} color={colors[1]!} />
            </Defs>
            <G transform={`scale(${w / BW})`}>
              {parts}
              {allRows.map((r, k) => (
                <ChartText
                  key={r.t}
                  x={8}
                  y={rowsTop + k * LH}
                  fontSize={chart.label}
                  fontWeight={r.bold ? 'bold' : undefined}
                  fill={r.bold ? c.chartInk : c.chartMuted}
                >
                  {r.t}
                </ChartText>
              ))}
            </G>
          </Svg>
        )}
      </Canvas>
      <Caption>{captions.join(' ')}</Caption>
    </View>
  );
}
