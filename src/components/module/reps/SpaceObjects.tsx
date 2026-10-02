/**
 * HC47 (college round 3, group B): objects in the `vectorDiagram` `space` scene — a plane through
 * a point square to n with a point dropped to it, a line r(t) = P₀ + tv meeting a plane, a helix
 * with its velocity, a sphere with its outward normals, a circle with its direction and a cap.
 * Each vector is drawn from its object's anchor. Same camera and turn handle as `VectorSpace`
 * (spaceKitHe3b). Flat; every number from the page, a "?" draws nothing for its part.
 */
import { type ReactElement } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G, Line, Path } from 'react-native-svg';

import type { NumOrVar } from '@/data/modules/typesGraphs';
import type { Triple } from '@/data/modules/typesHe3b';
import type { VectorDiagramSpec } from '@/data/modules/typesHsd';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, useRep } from './common';
import { Arrow } from './graphKit';
import {
  axesPlan,
  labeler,
  linePath,
  polyPath,
  SpaceAxes,
  TurnTrack,
  useSpaceTurn,
} from './spaceKitHe3b';
import {
  circleCirculation,
  helixAt,
  lineAt,
  lineMeets,
  planeBasis,
  planeDrop,
  planeEquation,
  sphereFlux,
} from './spaceObjectsMathHe3b';
import { add3, len3, scale3, sub3, type V3 } from './vectorSpace';

const say = (x: number) =>
  Math.abs(x) < 1e-9 ? '0' : String(Number(x.toPrecision(4))).replace('-', '−');
const par = (x: number) => (x < 0 ? `(${say(x)})` : say(x));
const pt3 = (p: V3) => `(${p.map(say).join(', ')})`;
const vec3 = (p: V3) => `⟨${p.map(say).join(', ')}⟩`;
const TILT = 22;

/** A square patch of the plane square to n, centred on `center`, `h` from center to side. */
function patch(center: V3, n: V3, h: number): V3[] {
  const [e1, e2] = planeBasis(n);
  return [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ].map(([i, j]) => add3(center, add3(scale3(e1, i! * h), scale3(e2, j! * h))));
}

export function SpaceObjects({ spec, calc }: { spec: VectorDiagramSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const turn = useSpaceTurn(32);
  const s = spec.space!;
  const num = (v: NumOrVar | undefined) =>
    v === undefined ? 0 : typeof v === 'number' ? v : rep.val(v);
  const known = (v: NumOrVar | undefined) =>
    v === undefined || typeof v === 'number' || rep.known(v);
  const tri = (t: Triple | undefined): V3 | undefined =>
    t && t.every(known) ? [num(t[0]), num(t[1]), num(t[2])] : undefined;
  const vecs = spec.vectors.map((v) => ({
    name: v.name,
    p: [num(v.x), num(v.y), num(v.z)] as V3,
    known: known(v.x) && known(v.y) && known(v.z),
  }));
  const first = vecs[0];
  const lines: string[] = [];
  const pts: V3[] = [[0, 0, 0]];

  // The plane and the drop from Q.
  const plane = s.plane && first?.known ? tri(s.plane.point) : undefined;
  const planeQ = s.plane ? tri(s.plane.q) : undefined;
  const pd = plane ? planeDrop(first!.p, plane, planeQ) : undefined;
  if (s.plane) {
    if (!plane || !pd) lines.push(`The plane: ?`);
    else {
      const n = first!.p;
      lines.push(
        `${first!.name} = ${vec3(n)} through P₀${pt3(plane)}: d = ${n.map((a, i) => `${say(a)} × ${par(plane[i]!)}`).join(' + ')} = ${say(pd.d)}, so ${planeEquation(n, pd.d, say)}.`,
      );
      if (s.plane.q) {
        if (!planeQ || pd.distance === undefined) lines.push('Q: ?');
        else
          lines.push(
            `Q${pt3(planeQ)} drops along ${first!.name} to F${pt3(pd.foot!)}: D = |${n.map((a, i) => `${say(a)} × ${par(planeQ[i]!)}`).join(' + ')} − ${par(pd.d)}| ÷ ${say(len3(n))} = ${say(pd.distance)}.`,
          );
      }
    }
  }

  // The line and where it meets a plane.
  const L = s.line;
  const lp = L && first?.known ? tri(L.point) : undefined;
  const lt = L && known(L.t) ? num(L.t) : undefined;
  const meetN = L?.meets ? tri(L.meets.normal) : undefined;
  const meetD = L?.meets && known(L.meets.d) ? num(L.meets.d) : undefined;
  if (L) {
    if (!lp) lines.push('The line: ?');
    else {
      lines.push(`r(t) = ${pt3(lp)} + t${vec3(first!.p)}.`);
      if (L.meets && meetN && meetD !== undefined) {
        const tm = lineMeets(lp, first!.p, meetN, meetD);
        const n0 = meetN[0] * lp[0] + meetN[1] * lp[1] + meetN[2] * lp[2];
        const nv = meetN[0] * first!.p[0] + meetN[1] * first!.p[1] + meetN[2] * first!.p[2];
        lines.push(
          tm === undefined
            ? `The line runs parallel to ${planeEquation(meetN, meetD, say)}: they never meet.`
            : `On ${planeEquation(meetN, meetD, say)}: ${say(n0)} + ${par(nv)}t = ${say(meetD)}, so t = ${say(tm)}.`,
        );
      }
      if (lt !== undefined) lines.push(`r(${say(lt)}) = ${pt3(lineAt(lp, first!.p, lt))}.`);
    }
  }

  // The helix.
  const H = s.curve?.helix;
  const ha = H && known(H.a) && known(H.c) ? { a: num(H.a), c: num(H.c) } : undefined;
  const ht = s.curve && known(s.curve.t) ? num(s.curve.t) : undefined;
  const hT = s.curve
    ? s.curve.T === undefined
      ? 2 * Math.PI
      : known(s.curve.T)
        ? num(s.curve.T)
        : undefined
    : undefined;
  if (s.curve) {
    if (!ha || hT === undefined) lines.push('The helix: ?');
    else {
      const h = helixAt(ha.a, ha.c, ht ?? 0);
      lines.push(`r(t) = ⟨${say(ha.a)} cos t, ${say(ha.a)} sin t, ${say(ha.c)}t⟩.`);
      if (ht !== undefined)
        lines.push(`At t = ${say(ht)}: r = ${pt3(h.r)} and v = r′(t) = ${vec3(h.v)}.`);
      lines.push(
        `Speed √(${par(ha.a)}² + ${par(ha.c)}²) = ${say(h.speed)} at every t, so from 0 to ${say(hT)} the length is ${say(h.speed * hT)}.`,
        `κ = ${say(Math.abs(ha.a))} ÷ (${par(ha.a)}² + ${par(ha.c)}²) = ${say(h.curvature)}.`,
      );
    }
  }

  // The sphere.
  const sr = s.sphere && known(s.sphere.r) ? num(s.sphere.r) : undefined;
  const sk = s.sphere?.k !== undefined && known(s.sphere.k) ? num(s.sphere.k) : undefined;
  if (s.sphere) {
    if (sr === undefined || !(sr > 0)) lines.push('The sphere: ?');
    else if (s.sphere.k !== undefined) {
      if (sk === undefined) lines.push('F = ?');
      else {
        const f = sphereFlux(sk, sr);
        lines.push(
          `On the sphere of radius ${say(sr)}, n = ⟨x, y, z⟩ ÷ ${say(sr)}, so F·n = ${say(sk)} × ${say(sr)} = ${say(f.fn)} everywhere.`,
          `Φ = ${say(f.fn)} × 4π × ${say(sr)}² = ${say(f.flux)}.`,
        );
      }
    } else lines.push(`A sphere of radius ${say(sr)}, its normals pointing out.`);
  }

  // The circle and its cap.
  const cr = s.circle && known(s.circle.r) ? num(s.circle.r) : undefined;
  const cz = s.circle && known(s.circle.z) ? num(s.circle.z) : undefined;
  const ck = s.circle?.k !== undefined && known(s.circle.k) ? num(s.circle.k) : undefined;
  if (s.circle) {
    if (cr === undefined || !(cr > 0) || cz === undefined) lines.push('The circle: ?');
    else {
      lines.push(
        `The circle of radius ${say(cr)} at z = ${say(cz)} runs counterclockwise seen from above.`,
      );
      if (s.circle.k !== undefined) {
        if (ck === undefined) lines.push('F = ?');
        else {
          const g = circleCirculation(ck, cr);
          lines.push(
            `curl F = ⟨0, 0, ${say(g.curl)}⟩, so any cap with this edge has flux ${say(g.curl)} × π × ${say(cr)}² = ${say(g.circulation)} = ∮ F·dr.`,
          );
        }
      }
    }
  }

  // The patches drawn for the planes, held in the fit (so they are never cut off).
  const planePatch =
    plane && pd && first
      ? (() => {
          const center = pd.foot ? scale3(add3(plane, pd.foot), 0.5) : plane;
          const spread = pd.foot ? len3(sub3(pd.foot, plane)) / 2 : 0;
          const h = Math.max(spread * 1.15, 0.6 * len3(first.p), 1);
          return { center, corners: patch(center, first.p, h) };
        })()
      : undefined;
  const meetPatch =
    lp && first && meetN && meetD !== undefined && lt !== undefined && len3(meetN) > 0
      ? (() => {
          // Centred on the plane point nearest r(t).
          const at = lineAt(lp, first.p, lt);
          const off =
            (meetN[0] * at[0] + meetN[1] * at[1] + meetN[2] * at[2] - meetD) / len3(meetN) ** 2;
          const center = sub3(at, scale3(meetN, off));
          return { center, corners: patch(center, meetN, Math.max(0.7 * len3(first.p), 1)) };
        })()
      : undefined;

  // Points the fit holds.
  if (planePatch) pts.push(...planePatch.corners);
  if (meetPatch) pts.push(...meetPatch.corners);
  if (plane) pts.push(plane, add3(plane, first!.p));
  if (planeQ) pts.push(planeQ);
  if (lp && first) {
    const t0 = Math.min(0, lt ?? 0) - 0.5;
    const t1 = Math.max(1, lt ?? 0) + 0.5;
    pts.push(lineAt(lp, first.p, t0), lineAt(lp, first.p, t1), add3(lp, first.p));
  }
  if (ha && hT !== undefined) {
    pts.push([ha.a, ha.a, 0], [-ha.a, -ha.a, ha.c * hT]);
    if (ht !== undefined) {
      const h = helixAt(ha.a, ha.c, ht);
      pts.push(add3(h.r, first?.known && len3(first.p) > 0 ? first.p : h.v));
    }
  }
  if (sr !== undefined && sr > 0)
    pts.push(
      [sr * 1.45, sr * 1.45, sr * 1.45],
      [-sr, -sr, -sr],
      ...(first?.known ? [add3([0, 0, sr], first.p)] : []),
    );
  if (cr !== undefined && cz !== undefined && cr > 0) {
    pts.push([cr, cr, cz], [-cr, -cr, cz]);
    if (s.circle?.cap === 'dome' || s.circle?.cap === 'both') pts.push([0, 0, cz + cr]);
    if (first?.known) pts.push(add3([0, 0, cz], first.p));
  }
  const plan = axesPlan(pts);

  return (
    <View>
      <Canvas aspect={0.95}>{({ w: W, h: Hc }) => draw(W, Hc)}</Canvas>
      <Caption>{lines.map((l) => l.replace(/\+ −/g, '− ')).join(' · ')}</Caption>
    </View>
  );

  function draw(W: number, Hc: number) {
    const cam = turn.camera(W, Hc, plan.all);
    const { P } = cam;
    const lab = labeler(W, Hc);
    lab.block({ left: W - 56, right: W, top: Hc - 40, bottom: Hc });
    const a = (cam.turn * Math.PI) / 180;
    const e = (TILT * Math.PI) / 180;
    const toward: V3 = [Math.cos(e) * Math.cos(a), Math.cos(e) * Math.sin(a), Math.sin(e)];
    const seg = (p: V3, q: V3, color: string, width: number, dash?: string, key?: string) => {
      const [m, n] = [P(p), P(q)];
      return (
        <Line
          key={key}
          x1={m.x}
          y1={m.y}
          x2={n.x}
          y2={n.y}
          stroke={color}
          strokeWidth={width}
          strokeDasharray={dash}
        />
      );
    };
    const arrow = (
      from: V3,
      to: V3,
      color: string,
      key: string,
      width: number = chart.strokeHeavy,
    ) => (
      <Arrow
        key={key}
        x1={P(from).x}
        y1={P(from).y}
        x2={P(to).x}
        y2={P(to).y}
        color={color}
        width={width}
      />
    );
    const dot = (p: V3, color: string, key: string, r = 5) => {
      const q = P(p);
      lab.block({ left: q.x - r - 1, right: q.x + r + 1, top: q.y - r - 1, bottom: q.y + r + 1 });
      return (
        <Circle key={key} cx={q.x} cy={q.y} r={r} fill={color} stroke={c.card} strokeWidth={1.5} />
      );
    };
    const away = (p: V3, from: V3) => ({ x: P(p).x - P(from).x, y: P(p).y - P(from).y });
    const back: ReactElement[] = [];
    const front: ReactElement[] = [];
    const labels: ReactElement[] = [];

    // The plane: a patch round P₀ (and F), n from P₀, Q dropped to F.
    if (plane && pd && first) {
      const foot = pd.foot;
      const { center, corners } = planePatch!;
      back.push(
        <Path
          key="pl"
          d={polyPath(corners.map(P))}
          fill={c.planeFill}
          fillOpacity={0.2}
          stroke={c.planeFill}
          strokeWidth={1.2}
        />,
      );
      labels.push(
        lab.label(
          P(corners[2]!),
          away(corners[2]!, center),
          planeEquation(first.p, pd.d, say),
          c.planeFill,
          'peq',
        ),
      );
      front.push(
        arrow(plane, add3(plane, first.p), c.chartHighlight, 'n'),
        dot(plane, c.chartHighlight, 'p0'),
      );
      labels.push(
        lab.label(
          P(add3(plane, first.p)),
          away(add3(plane, first.p), plane),
          first.name,
          c.chartHighlight,
          'nn',
        ),
        lab.label(P(plane), { x: -1, y: 0.4 }, `P₀${pt3(plane)}`, c.chartHighlight, 'lp0'),
      );
      if (planeQ && foot && pd.distance !== undefined) {
        const u = scale3(first.p, 1 / len3(first.p));
        const t = scale3(sub3(plane, foot), 1 / (len3(sub3(plane, foot)) || 1));
        const sq = plan.step * 0.25;
        const m1 = add3(foot, scale3(u, Math.sign(pd.off ?? 1) * sq));
        const corner = [m1, add3(m1, scale3(t, sq)), add3(foot, scale3(t, sq))];
        front.push(
          seg(planeQ, foot, c.hopBack, chart.stroke, chart.dash, 'drop'),
          <Path
            key="sq"
            d={linePath(corner.map(P))}
            stroke={c.chartInk}
            strokeWidth={1}
            fill="none"
          />,
          dot(planeQ, c.hopBack, 'q'),
          dot(foot, c.vectorResultant, 'f', 4),
        );
        const mid = scale3(add3(planeQ, foot), 0.5);
        const dq = away(planeQ, foot);
        labels.push(
          lab.label(P(planeQ), away(planeQ, foot), `Q${pt3(planeQ)}`, c.hopBack, 'lq'),
          lab.label(P(foot), { x: -dq.x, y: -dq.y }, 'F', c.vectorResultant, 'lf'),
          lab.label(P(mid), { x: dq.y, y: -dq.x }, `D = ${say(pd.distance)}`, c.hopBack, 'ld'),
        );
      }
    }

    // The line, v from P₀, the point at t, and the plane it meets.
    if (L && lp && first) {
      const t0 = Math.min(0, lt ?? 0) - 0.5;
      const t1 = Math.max(1, lt ?? 0) + 0.5;
      if (meetPatch && meetN && meetD !== undefined) {
        const { center: c0, corners } = meetPatch;
        back.push(
          <Path
            key="mp"
            d={polyPath(corners.map(P))}
            fill={c.planeFill}
            fillOpacity={0.2}
            stroke={c.planeFill}
            strokeWidth={1.2}
          />,
        );
        labels.push(
          lab.label(
            P(corners[2]!),
            away(corners[2]!, c0),
            planeEquation(meetN, meetD, say),
            c.planeFill,
            'meq',
          ),
        );
      }
      front.push(
        seg(
          lineAt(lp, first.p, t0),
          lineAt(lp, first.p, t1),
          c.vectorResultant,
          chart.stroke,
          undefined,
          'ln',
        ),
        arrow(lp, add3(lp, first.p), c.chartHighlight, 'v'),
        dot(lp, c.chartHighlight, 'lp'),
      );
      labels.push(
        lab.label(
          P(add3(lp, first.p)),
          away(add3(lp, first.p), lp),
          first.name,
          c.chartHighlight,
          'lv',
        ),
        lab.label(P(lp), { x: -1, y: 0.5 }, `P₀${pt3(lp)}`, c.chartHighlight, 'llp'),
      );
      if (lt !== undefined) {
        const at = lineAt(lp, first.p, lt);
        front.push(dot(at, c.vectorResultant, 'lt'));
        labels.push(
          lab.label(
            P(at),
            { x: 1, y: -0.5 },
            `r(${say(lt)}) = ${pt3(at)}`,
            c.vectorResultant,
            'llt',
          ),
        );
      }
    }

    // The helix: the half behind its axis faint, the point at t and its velocity.
    if (ha && hT !== undefined && hT > 0) {
      const N = Math.max(60, Math.ceil(hT * 16));
      const ps = Array.from({ length: N + 1 }, (_, i) => helixAt(ha.a, ha.c, (hT * i) / N).r);
      for (let i = 0; i < N; i++) {
        const mid = scale3(add3(ps[i]!, ps[i + 1]!), 0.5);
        const behind = mid[0] * toward[0] + mid[1] * toward[1] < 0;
        (behind ? back : front).push(
          seg(
            ps[i]!,
            ps[i + 1]!,
            c.vectorResultant,
            behind ? 1.2 : chart.stroke + 0.5,
            undefined,
            `h${i}`,
          ),
        );
      }
      if (ht !== undefined) {
        const h = helixAt(ha.a, ha.c, ht);
        const v = first?.known && len3(first.p) > 0 ? first.p : undefined;
        if (v) {
          front.push(arrow(h.r, add3(h.r, v), c.chartHighlight, 'hv'));
          labels.push(
            lab.label(
              P(add3(h.r, v)),
              away(add3(h.r, v), h.r),
              first!.name,
              c.chartHighlight,
              'lhv',
            ),
          );
        }
        front.push(dot(h.r, c.vectorResultant, 'hp'));
        labels.push(
          lab.label(P(h.r), { x: -1, y: 0.3 }, `r(${say(ht)})`, c.vectorResultant, 'lhp'),
        );
      }
    }

    // The sphere: its outline, equator and a meridian, normals at eight points.
    if (sr !== undefined && sr > 0) {
      const t = scale3(toward, 1 / len3(toward));
      const [e1, e2] = planeBasis(t);
      const ring = (f: (th: number) => V3, n = 72) =>
        Array.from({ length: n + 1 }, (_, i) => f((2 * Math.PI * i) / n));
      const outline = ring((th) =>
        add3(scale3(e1, sr * Math.cos(th)), scale3(e2, sr * Math.sin(th))),
      );
      back.push(
        <Path
          key="sph"
          d={polyPath(outline.map(P))}
          fill={c.surfaceFill}
          fillOpacity={0.16}
          stroke={c.surfaceFill}
          strokeWidth={1.5}
        />,
      );
      const circ = (f: (th: number) => V3, key: string) => {
        const r = ring(f);
        for (let i = 0; i < r.length - 1; i++) {
          const behind = r[i]![0] * t[0] + r[i]![1] * t[1] + r[i]![2] * t[2] < 0;
          (behind ? back : front).push(
            seg(
              r[i]!,
              r[i + 1]!,
              c.surfaceFill,
              1,
              behind ? chart.dashFine : undefined,
              `${key}${i}`,
            ),
          );
        }
      };
      circ((th) => [sr * Math.cos(th), sr * Math.sin(th), 0], 'eq');
      circ((th) => [sr * Math.cos(th), 0, sr * Math.sin(th)], 'mer');
      if (s.sphere?.normals !== false) {
        const dirs: V3[] = [
          [1, 0, 0],
          [-1, 0, 0],
          [0, 1, 0],
          [0, -1, 0],
          [0, 0, -1],
          [Math.SQRT1_2, Math.SQRT1_2, 0],
          [0.5, -0.5, Math.SQRT1_2],
          [-0.5, 0.5, Math.SQRT1_2],
        ];
        dirs.forEach((d, i) => {
          const p = scale3(d, sr);
          const behind = d[0] * t[0] + d[1] * t[1] + d[2] * t[2] < 0;
          (behind ? back : front).push(
            <G key={`nr${i}`} opacity={behind ? 0.4 : 1}>
              {arrow(p, scale3(d, sr * 1.4), c.chartMuted, `na${i}`, chart.strokeLight)}
            </G>,
          );
        });
        const n0 = scale3([Math.SQRT1_2, Math.SQRT1_2, 0], sr * 1.4);
        labels.push(lab.label(P(n0), away(n0, [0, 0, 0]), 'n', c.chartMuted, 'lnr'));
      }
      const top: V3 = [0, 0, sr];
      if (first?.known && len3(first.p) > 0) {
        front.push(arrow(top, add3(top, first.p), c.chartHighlight, 'sf'));
        labels.push(
          lab.label(P(add3(top, first.p)), { x: 1, y: -1 }, first.name, c.chartHighlight, 'lsf'),
        );
      }
      front.push(dot(top, c.chartHighlight, 'stop', 4));
      labels.push(lab.label(P([sr, 0, 0]), { x: 1, y: 1 }, `R = ${say(sr)}`, c.surfaceFill, 'lsr'));
    }

    // The circle: its cap(s), the direction round it, F along it, curl F from its center.
    if (cr !== undefined && cz !== undefined && cr > 0 && s.circle) {
      const cap = s.circle.cap;
      const ring = Array.from({ length: 73 }, (_, i) => {
        const th = (2 * Math.PI * i) / 72;
        return [cr * Math.cos(th), cr * Math.sin(th), cz] as V3;
      });
      if (cap === 'disk' || cap === 'both')
        back.push(
          <Path
            key="disk"
            d={polyPath(ring.map(P))}
            fill={c.planeFill}
            fillOpacity={0.18}
            stroke="none"
          />,
        );
      if (cap === 'dome' || cap === 'both') {
        const quads: { d: string; depth: number }[] = [];
        const at = (th: number, ph: number): V3 => [
          cr * Math.cos(ph) * Math.cos(th),
          cr * Math.cos(ph) * Math.sin(th),
          cz + cr * Math.sin(ph),
        ];
        const [nt, np] = [16, 5];
        for (let i = 0; i < nt; i++)
          for (let j = 0; j < np; j++) {
            const [t0, t1] = [(2 * Math.PI * i) / nt, (2 * Math.PI * (i + 1)) / nt];
            const [p0, p1] = [(Math.PI / 2) * (j / np), (Math.PI / 2) * ((j + 1) / np)];
            const q = [at(t0, p0), at(t1, p0), at(t1, p1), at(t0, p1)];
            const m = scale3(add3(q[0]!, q[2]!), 0.5);
            quads.push({ d: polyPath(q.map(P)), depth: cam.depth(m) });
          }
        quads.sort((p, q) => p.depth - q.depth);
        quads.forEach((q, i) =>
          back.push(
            <Path
              key={`dm${i}`}
              d={q.d}
              fill={c.surfaceFill}
              fillOpacity={0.1}
              stroke={c.surfaceMesh}
              strokeOpacity={0.3}
              strokeWidth={0.6}
            />,
          ),
        );
      }
      for (let i = 0; i < 72; i++) {
        const behind = ring[i]![0] * toward[0] + ring[i]![1] * toward[1] < 0;
        (behind ? back : front).push(
          seg(
            ring[i]!,
            ring[i + 1]!,
            c.vectorResultant,
            behind ? 1.5 : chart.strokeHeavy,
            undefined,
            `cr${i}`,
          ),
        );
      }
      // F = k⟨−y, x, 0⟩ at eight points, drawn to one scale (half the radius for the largest).
      const k = ck ?? 0;
      for (let i = 0; i < 8; i++) {
        const th = (2 * Math.PI * i) / 8 + Math.PI / 8;
        const p: V3 = [cr * Math.cos(th), cr * Math.sin(th), cz];
        const dir: V3 = [-Math.sin(th), Math.cos(th), 0];
        const len = ck === undefined ? cr * 0.3 : Math.sign(k) * cr * 0.45;
        if (Math.abs(len) < 1e-9) continue;
        const behind = p[0] * toward[0] + p[1] * toward[1] < 0;
        (behind ? back : front).push(
          <G key={`cf${i}`} opacity={behind ? 0.45 : 1}>
            {arrow(p, add3(p, scale3(dir, len)), c.hopBack, `ca${i}`, chart.stroke)}
          </G>,
        );
      }
      const lead = [cr * Math.cos(Math.PI / 8), cr * Math.sin(Math.PI / 8), cz] as V3;
      labels.push(
        lab.label(P(lead), away(lead, [0, 0, cz]), ck === undefined ? 'C' : 'F', c.hopBack, 'lcf'),
        lab.label(P([-cr, 0, cz]), { x: -1, y: 0.5 }, `R = ${say(cr)}`, c.vectorResultant, 'lcr'),
      );
      const center: V3 = [0, 0, cz];
      if (first?.known && len3(first.p) > 0) {
        front.push(arrow(center, add3(center, first.p), c.chartHighlight, 'curl'));
        labels.push(
          lab.label(
            P(add3(center, first.p)),
            { x: 1, y: -1 },
            first.name,
            c.chartHighlight,
            'lcurl',
          ),
        );
      }
    }

    return (
      <>
        <Svg width={W} height={Hc}>
          <SpaceAxes plan={plan} cam={cam} lab={lab} />
          {back}
          {front}
          {labels}
          <TurnTrack W={W} H={Hc} />
        </Svg>
        {turn.handle(W, Hc)}
      </>
    );
  }
}
