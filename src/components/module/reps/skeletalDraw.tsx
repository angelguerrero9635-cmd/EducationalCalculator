/**
 * Draws a laid-out skeletal structure (HC2, `skeletalMath.ts`) into an SVG group: bonds as
 * lines (the second line of a ring's double bond inside the ring), wedges and dashes,
 * heteroatoms with their H, charges, a lit group's band, chain numbers, CIP ranks with R or S,
 * and the IHD's ring and π marks. Flat, in theme colors; shared by the picture and the card.
 */
import type { ReactNode } from 'react';
import { Circle, G, Line, Polygon } from 'react-native-svg';

import type { Palette } from '@/theme';

import { ChartText } from './common';
import { atomLabel, labelWidth, neighbors, type P, type SkLayout } from './skeletalMath';

export { fitLayout } from './skeletalMath';

const chargeText = (q: number) =>
  q === 0 ? '' : `${Math.abs(q) > 1 ? Math.abs(q) : ''}${q > 0 ? '+' : '−'}`;

export interface SkeletalMarks {
  /** Atoms of the lit group (its bonds are those between two of them). */
  lit?: Set<number>;
  /** Chain numbers by atom. */
  numbers?: Map<number, number>;
  /** CIP ranks round `center`, by neighbor (−1 is the drawn H). */
  ranks?: Map<number, number>;
  center?: number;
  /** R or S, written beside the center. */
  rs?: 'R' | 'S';
  /** Each ring marked with a dotted circle and its number. */
  rings?: boolean;
  /** Each π bond marked "π" ("2π" on a triple bond), or "+H₂" for hydrogenation. */
  pi?: 'pi' | 'h2';
}

/** An element's letter color: O, N, S and the halogens their own, the rest in ink. */
export function elementColor(c: Palette, el: string): string {
  if (el === 'O') return c.skeletalO;
  if (el === 'N') return c.skeletalN;
  if (el === 'S') return c.skeletalS;
  if (['F', 'Cl', 'Br', 'I'].includes(el)) return c.skeletalHalogen;
  return c.chartInk;
}

/** Whether an atom is written as letters (every non-carbon, and a carbon with no bonds). */
const labelled = (lay: SkLayout, a: number) => atomLabel(lay, a) !== undefined;

export function SkeletalView({
  lay,
  x0,
  y0,
  scale,
  cx,
  cy,
  font,
  c,
  marks = {},
  mirror = false,
  lit,
  halo = true,
}: {
  lay: SkLayout;
  /** Where the layout's centre (cx, cy) is drawn. */
  x0: number;
  y0: number;
  scale: number;
  cx: number;
  cy: number;
  font: number;
  c: Palette;
  marks?: SkeletalMarks;
  /** Drawn left for right: the mirror image (its enantiomer, wedges kept). */
  mirror?: boolean;
  /** Labels on a halo of the page color (off on cards, whose color varies). */
  halo?: boolean;
  /** The lit band's color (default the theme's). */
  lit?: string;
}) {
  const m = lay.mol;
  const sx = mirror ? -1 : 1;
  const px = (p: P): P => [x0 + sx * (p[0] - cx) * scale, y0 - (p[1] - cy) * scale];
  const pts = lay.pos.map(px);
  const ink = c.chartInk;
  const sw = Math.max(1.3, scale / 22);
  const gap = font * 0.62;
  const parts: ReactNode[] = [];
  const bandColor = lit ?? c.skeletalLit;
  const unit = (a: P, b: P): P => {
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    return [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
  };
  /** A bond's ends, pulled back from written atoms. */
  const ends = (a: number, b: number): [P, P] => {
    const [pa, pb] = [pts[a]!, pts[b]!];
    const u = unit(pa, pb);
    const ga = labelled(lay, a) ? gap : 0;
    const gb = labelled(lay, b) ? gap : 0;
    return [
      [pa[0] + u[0] * ga, pa[1] + u[1] * ga],
      [pb[0] - u[0] * gb, pb[1] - u[1] * gb],
    ];
  };
  const ringCenterOf = (a: number, b: number): P | undefined => {
    const r = lay.rings
      .filter((x) => x.includes(a) && x.includes(b))
      .sort((p, q) => p.length - q.length)[0];
    if (!r) return undefined;
    const ps = r.map((x) => pts[x]!);
    return [
      ps.reduce((s, p) => s + p[0], 0) / ps.length,
      ps.reduce((s, p) => s + p[1], 0) / ps.length,
    ];
  };

  // The lit group's band, under everything (one see-through layer, so overlaps don't darken).
  if (marks.lit?.size) {
    const band: ReactNode[] = [];
    for (const b of m.bonds)
      if (marks.lit.has(b.a) && marks.lit.has(b.b))
        band.push(
          <Line
            key={`band${b.a}-${b.b}`}
            x1={pts[b.a]![0]}
            y1={pts[b.a]![1]}
            x2={pts[b.b]![0]}
            y2={pts[b.b]![1]}
            stroke={bandColor}
            strokeWidth={Math.max(10, scale * 0.42)}
            strokeLinecap="round"
          />,
        );
    for (const a of marks.lit)
      band.push(
        <Circle
          key={`bandA${a}`}
          cx={pts[a]![0]}
          cy={pts[a]![1]}
          r={Math.max(6, scale * 0.24)}
          fill={bandColor}
        />,
      );
    parts.push(
      <G key="band" opacity={0.45}>
        {band}
      </G>,
    );
  }

  // Ring marks.
  if (marks.rings)
    lay.rings.forEach((r, k) => {
      const ps = r.map((x) => pts[x]!);
      const mx = ps.reduce((s, p) => s + p[0], 0) / ps.length;
      const my = ps.reduce((s, p) => s + p[1], 0) / ps.length;
      const inner =
        Math.min(...ps.map((p) => Math.hypot(p[0] - mx, p[1] - my))) * Math.cos(Math.PI / r.length);
      const rr = Math.max(8, inner * 0.62);
      parts.push(
        <G key={`ring${k}`}>
          <Circle
            cx={mx}
            cy={my}
            r={rr}
            fill="none"
            stroke={c.chartMuted}
            strokeWidth={1.2}
            strokeDasharray="3 3"
          />
          <ChartText
            x={mx}
            y={my + font * 0.36}
            fontSize={font}
            textAnchor="middle"
            fill={c.chartMuted}
            fontWeight="700"
          >
            {String(k + 1)}
          </ChartText>
        </G>,
      );
    });

  // Bonds.
  m.bonds.forEach((b, k) => {
    const [p1, p2] = ends(b.a, b.b);
    const st = lay.stereo.find((s) => s.bond === k);
    const key = `b${k}`;
    if (st) {
      const from = st.from === b.a ? p1 : p2;
      const to = st.from === b.a ? p2 : p1;
      const u = unit(from, to);
      const nrm: P = [-u[1], u[0]];
      const wide = Math.max(3, scale * 0.13);
      if (st.z === 1) {
        parts.push(
          <Polygon
            key={key}
            points={[
              from,
              [to[0] + nrm[0] * wide, to[1] + nrm[1] * wide],
              [to[0] - nrm[0] * wide, to[1] - nrm[1] * wide],
            ]
              .map((p) => p.join(','))
              .join(' ')}
            fill={ink}
          />,
        );
      } else {
        const len = Math.hypot(to[0] - from[0], to[1] - from[1]);
        const n = Math.max(4, Math.round(len / 4));
        parts.push(
          <G key={key}>
            {Array.from({ length: n }, (_, i) => {
              const t = (i + 1) / n;
              const q: P = [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t];
              const wv = wide * t;
              return (
                <Line
                  key={i}
                  x1={q[0] + nrm[0] * wv}
                  y1={q[1] + nrm[1] * wv}
                  x2={q[0] - nrm[0] * wv}
                  y2={q[1] - nrm[1] * wv}
                  stroke={ink}
                  strokeWidth={1.2}
                />
              );
            })}
          </G>,
        );
      }
      return;
    }
    const line = (a: P, z: P, kk: string) => (
      <Line
        key={kk}
        x1={a[0]}
        y1={a[1]}
        x2={z[0]}
        y2={z[1]}
        stroke={ink}
        strokeWidth={sw}
        strokeLinecap="round"
      />
    );
    const u = unit(p1, p2);
    const nrm: P = [-u[1], u[0]];
    const off = Math.max(3, scale * 0.16);
    if (b.order === 1) {
      parts.push(line(p1, p2, key));
      return;
    }
    if (b.order === 3) {
      parts.push(
        <G key={key}>
          {[-1, 0, 1].map((s) =>
            line(
              [p1[0] + nrm[0] * off * 0.8 * s, p1[1] + nrm[1] * off * 0.8 * s],
              [p2[0] + nrm[0] * off * 0.8 * s, p2[1] + nrm[1] * off * 0.8 * s],
              `${key}${s}`,
            ),
          )}
        </G>,
      );
      return;
    }
    // A double bond: inside its ring, toward its other neighbors, or centred at an end.
    const rc = ringCenterOf(b.a, b.b);
    const ends1 = neighbors(m, b.a).length === 1 || neighbors(m, b.b).length === 1;
    let side = 0;
    if (rc) side = (rc[0] - p1[0]) * nrm[0] + (rc[1] - p1[1]) * nrm[1] > 0 ? 1 : -1;
    else if (!ends1) {
      const others = [...neighbors(m, b.a), ...neighbors(m, b.b)].filter(
        (x) => x !== b.a && x !== b.b,
      );
      const s = others.reduce(
        (t, x) => t + ((pts[x]![0] - p1[0]) * nrm[0] + (pts[x]![1] - p1[1]) * nrm[1]),
        0,
      );
      side = s >= 0 ? 1 : -1;
    }
    if (side === 0) {
      parts.push(
        <G key={key}>
          {[-0.5, 0.5].map((s) =>
            line(
              [p1[0] + nrm[0] * off * s, p1[1] + nrm[1] * off * s],
              [p2[0] + nrm[0] * off * s, p2[1] + nrm[1] * off * s],
              `${key}${s}`,
            ),
          )}
        </G>,
      );
      return;
    }
    const len = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
    const trim = Math.min(len * 0.15, scale * 0.18);
    const ta = labelled(lay, b.a) ? 0 : trim;
    const tb = labelled(lay, b.b) ? 0 : trim;
    parts.push(
      <G key={key}>
        {line(p1, p2, `${key}a`)}
        {line(
          [p1[0] + nrm[0] * off * side + u[0] * ta, p1[1] + nrm[1] * off * side + u[1] * ta],
          [p2[0] + nrm[0] * off * side - u[0] * tb, p2[1] + nrm[1] * off * side - u[1] * tb],
          `${key}b`,
        )}
      </G>,
    );
  });

  // H drawn at stereocenters.
  for (const h of lay.hs) {
    const pa = pts[h.atom]!;
    const ph = px(h.at);
    const u = unit(pa, ph);
    const to: P = [ph[0] - u[0] * gap, ph[1] - u[1] * gap];
    const nrm: P = [-u[1], u[0]];
    const wide = Math.max(3, scale * 0.13);
    parts.push(
      h.z === 1 ? (
        <Polygon
          key={`h${h.atom}`}
          points={[
            pa,
            [to[0] + nrm[0] * wide, to[1] + nrm[1] * wide],
            [to[0] - nrm[0] * wide, to[1] - nrm[1] * wide],
          ]
            .map((p) => p.join(','))
            .join(' ')}
          fill={ink}
        />
      ) : (
        <G key={`h${h.atom}`}>
          {Array.from({ length: 5 }, (_, i) => {
            const t = (i + 1) / 5;
            const q: P = [pa[0] + (to[0] - pa[0]) * t, pa[1] + (to[1] - pa[1]) * t];
            return (
              <Line
                key={i}
                x1={q[0] + nrm[0] * wide * t}
                y1={q[1] + nrm[1] * wide * t}
                x2={q[0] - nrm[0] * wide * t}
                y2={q[1] - nrm[1] * wide * t}
                stroke={ink}
                strokeWidth={1.2}
              />
            );
          })}
        </G>
      ),
    );
    parts.push(
      <ChartText
        key={`ht${h.atom}`}
        x={ph[0]}
        y={ph[1] + font * 0.36}
        fontSize={font}
        textAnchor="middle"
        fill={ink}
      >
        H
      </ChartText>,
    );
  }

  // π marks.
  if (marks.pi)
    m.bonds.forEach((b, k) => {
      if (b.order === 1) return;
      const [pa, pb] = [pts[b.a]!, pts[b.b]!];
      const mid: P = [(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2];
      const u = unit(pa, pb);
      let nrm: P = [-u[1], u[0]];
      const rc = ringCenterOf(b.a, b.b);
      // Outside the ring, or away from the bond's other neighbors.
      const toward =
        rc ??
        (() => {
          const others = [...neighbors(m, b.a), ...neighbors(m, b.b)].filter(
            (x) => x !== b.a && x !== b.b,
          );
          if (!others.length) return undefined;
          return [
            others.reduce((s, x) => s + pts[x]![0], 0) / others.length,
            others.reduce((s, x) => s + pts[x]![1], 0) / others.length,
          ] as P;
        })();
      if (toward && (toward[0] - mid[0]) * nrm[0] + (toward[1] - mid[1]) * nrm[1] > 0)
        nrm = [-nrm[0], -nrm[1]];
      const n = b.order - 1;
      const text = marks.pi === 'h2' ? `+${n > 1 ? n : ''}H₂` : `${n > 1 ? n : ''}π`;
      const d = font * 1.1;
      parts.push(
        <ChartText
          key={`pi${k}`}
          x={mid[0] + nrm[0] * d}
          y={mid[1] + nrm[1] * d + font * 0.36}
          fontSize={font}
          fontWeight="700"
          textAnchor="middle"
          fill={c.chartHighlight}
          halo={halo}
        >
          {text}
        </ChartText>,
      );
    });

  // Atom letters.
  m.atoms.forEach((at, a) => {
    const p = pts[a]!;
    const q = chargeText(at.charge);
    if (!labelled(lay, a)) {
      if (!q) return;
      // A carbon ion: its charge in a ring beside the corner, away from its bonds.
      const nb = neighbors(m, a);
      const vx = nb.reduce((s, o) => s + (pts[o]![0] - p[0]), 0);
      const vy = nb.reduce((s, o) => s + (pts[o]![1] - p[1]), 0);
      const l = Math.hypot(vx, vy) || 1;
      const d = font * 0.95;
      const [qx, qy] = [p[0] - (vx / l) * d, p[1] - (vy / l) * d];
      parts.push(
        <G key={`q${a}`}>
          <Circle cx={qx} cy={qy} r={font * 0.55} fill="none" stroke={ink} strokeWidth={1.1} />
          <ChartText
            x={qx}
            y={qy + font * 0.34}
            fontSize={font}
            textAnchor="middle"
            fill={ink}
            fontWeight="700"
          >
            {q}
          </ChartText>
        </G>,
      );
      return;
    }
    const label = atomLabel(lay, a, mirror)!;
    const hLeft = label.hLeft;
    const color = elementColor(c, at.el);
    const bold = marks.lit?.has(a) ? '700' : '600';
    const ew = labelWidth(at.el, font);
    parts.push(
      <ChartText
        key={`a${a}`}
        x={hLeft ? p[0] + ew / 2 : p[0] - ew / 2}
        y={p[1] + font * 0.36}
        fontSize={font}
        fontWeight={bold}
        textAnchor={hLeft ? 'end' : 'start'}
        fill={color}
        halo={halo}
      >
        {label.text}
      </ChartText>,
    );
  });

  // Chain numbers, outside each corner.
  marks.numbers?.forEach((n, a) => {
    const p = pts[a]!;
    const nb = neighbors(m, a);
    let vx = nb.reduce((s, o) => s + (pts[o]![0] - p[0]) / scale, 0);
    let vy = nb.reduce((s, o) => s + (pts[o]![1] - p[1]) / scale, 0);
    if (Math.hypot(vx, vy) < 0.2) [vx, vy] = [0, 1];
    const l = Math.hypot(vx, vy);
    const d = font * 0.95;
    parts.push(
      <ChartText
        key={`n${a}`}
        x={p[0] - (vx / l) * d}
        y={p[1] - (vy / l) * d + font * 0.36}
        fontSize={font}
        fontWeight="700"
        textAnchor="middle"
        fill={c.chartHighlight}
        halo={halo}
      >
        {String(n)}
      </ChartText>,
    );
  });

  // CIP ranks round the center, and R or S.
  if (marks.center !== undefined) {
    const a0 = marks.center;
    const p0 = pts[a0]!;
    const hDrawn = lay.hs.find((x) => x.atom === a0);
    // What a rank badge must keep clear of: the atoms (written ones as a letter-sized disc),
    // the drawn H's, every bond, and the badges already placed.
    const r = font * 0.62;
    const hPts = lay.hs.map((x) => ({ p: px(x.at), from: pts[x.atom]! }));
    const discs: { p: P; rad: number }[] = [
      ...pts.map((p, a) => ({ p, rad: labelled(lay, a) ? font * 0.85 : 1 })),
      ...hPts.map((x) => ({ p: x.p, rad: font * 0.6 })),
    ];
    const segs: [P, P][] = [
      ...m.bonds.map((b): [P, P] => [pts[b.a]!, pts[b.b]!]),
      ...hPts.map((x): [P, P] => [x.from, x.p]),
    ];
    const toSeg = (q: P, [a, z]: [P, P]) => {
      const [dx, dy] = [z[0] - a[0], z[1] - a[1]];
      const l2 = dx * dx + dy * dy || 1;
      const t = Math.max(0, Math.min(1, ((q[0] - a[0]) * dx + (q[1] - a[1]) * dy) / l2));
      return Math.hypot(q[0] - a[0] - t * dx, q[1] - a[1] - t * dy);
    };
    const placed: P[] = [];
    const clearance = (q: P) =>
      Math.min(
        ...discs.map((d) => Math.hypot(d.p[0] - q[0], d.p[1] - q[1]) - d.rad),
        ...segs.map((sg) => toSeg(q, sg)),
        ...placed.map((b) => Math.hypot(b[0] - q[0], b[1] - q[1]) - r),
      ) - r;
    marks.ranks?.forEach((rank, o) => {
      const target = o === -1 ? (hDrawn ? px(hDrawn.at) : undefined) : pts[o];
      if (!target) return;
      const u = unit(p0, target);
      const len = Math.hypot(target[0] - p0[0], target[1] - p0[1]);
      // Beside the bond, past its middle, on the side with more room; where a small drawing
      // leaves no room there, further along the bond or further out, whichever is clearest.
      const options: P[] = [];
      for (const t of [0.62, 0.5, 0.78])
        for (const off of [r + 4, r + 8])
          for (const sd of [1, -1])
            options.push([
              p0[0] + u[0] * len * t - u[1] * sd * off,
              p0[1] + u[1] * len * t + u[0] * sd * off,
            ]);
      let at = options[0]!;
      let best = -Infinity;
      options.forEach((q, i) => {
        // Clear first; then the roomier side; then the first (nearest the bond's middle).
        const cl = clearance(q);
        const score = Math.min(cl, 3) + Math.min(cl, 12) * 0.02 - i * 0.01;
        if (score > best) [best, at] = [score, q];
      });
      placed.push(at);
      parts.push(
        <G key={`rank${o}`}>
          <Circle cx={at[0]} cy={at[1]} r={r} fill={c.chartHighlight} />
          <ChartText
            x={at[0]}
            y={at[1] + font * 0.34}
            fontSize={font}
            fontWeight="700"
            textAnchor="middle"
            fill={c.onChartHighlight}
          >
            {String(rank)}
          </ChartText>
        </G>,
      );
    });
    if (marks.rs) {
      // In the widest gap round the center.
      const dirs = neighbors(m, a0)
        .map((o) => pts[o]!)
        .concat(hDrawn ? [px(hDrawn.at)] : [])
        .map((q) => Math.atan2(q[1] - p0[1], q[0] - p0[0]))
        .map((d) => (d + 2 * Math.PI) % (2 * Math.PI))
        .sort((x, y) => x - y);
      let gs = 0;
      let gw = 0;
      dirs.forEach((d, k) => {
        const nx = k + 1 < dirs.length ? dirs[k + 1]! : dirs[0]! + 2 * Math.PI;
        if (nx - d > gw) [gs, gw] = [d, nx - d];
      });
      const ang = gs + gw / 2;
      const d = font * 1.5;
      parts.push(
        <ChartText
          key="rs"
          x={p0[0] + Math.cos(ang) * d}
          y={p0[1] + Math.sin(ang) * d + font * 0.36}
          fontSize={font + 1}
          fontWeight="700"
          textAnchor="middle"
          fill={c.chartHighlight}
          halo={halo}
        >
          {`(${marks.rs})`}
        </ChartText>,
      );
    }
  }
  return <G>{parts}</G>;
}
