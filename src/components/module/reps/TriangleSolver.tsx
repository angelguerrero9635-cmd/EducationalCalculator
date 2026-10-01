import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { G, Polygon, Line } from 'react-native-svg';

import type { TriNames, TriPart, TriangleSolverSpec } from '@/data/modules/typesHsc';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, fitLabel, useFrozen, useRep } from './common';
import { Arcs, RightMark, Ticks, inside, outside, type Pt } from './geoMarks';
import { TriangleScene } from './TriangleScene';
import { radicalText, solveTriangle, type Criterion, type Tri } from './triangleSolve';

const SIDES = ['a', 'b', 'c'] as const;
const ANGLES = ['A', 'B', 'C'] as const;
const rad = (d: number) => (d * Math.PI) / 180;
const n2 = (x: number) => formatNumber(Number(x.toFixed(2)));

/** The special triangles' angles at A, B, C. */
const SPECIAL = { '45-45-90': [45, 45, 90], '30-60-90': [30, 60, 90] } as const;

/**
 * Vertex positions (math coordinates, y up) with P = order[0] at the origin, Q = order[1] along
 * the x axis and R = order[2] above it.
 */
function place(t: Tri, order: [number, number, number]): Pt[] {
  const s = [t.a, t.b, t.c];
  const g = [t.A, t.B, t.C];
  const [p, q, r] = order;
  const out: Pt[] = [];
  out[p] = [0, 0];
  out[q] = [s[r]!, 0];
  out[r] = [s[q]! * Math.cos(rad(g[p]!)), s[q]! * Math.sin(rad(g[p]!))];
  return out;
}

interface Drawn {
  pts: Pt[];
  names: TriNames;
  /** Dashed: the second triangle SSA allows. */
  dashed?: boolean;
  /** Side and angle labels (undefined: none). */
  sideText: (i: number) => string | undefined;
  angleText: (i: number) => string | undefined;
}

/**
 * A triangle to scale from three of its parts (spec in `typesHsc.ts`): given parts in the
 * highlight, worked-out ones in ink; congruent and similar pairs with matching marks; the
 * two SSA triangles; right-triangle trig with the sides named from θ; the special triangles
 * with exact radicals; or a ramp, ladder or line of sight.
 */
export function TriangleSolver({ spec, calc }: { spec: TriangleSolverSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef(0);
  const names = spec.names ?? ['A', 'B', 'C'];
  const right = !!(spec.trig || spec.special || spec.scene);
  const fixedAngle = (p: TriPart): number | undefined => {
    const i = ANGLES.indexOf(p as 'A');
    if (i < 0) return undefined;
    if (spec.special) return SPECIAL[spec.special][i];
    if (right && p === 'C' && spec.parts.C === undefined) return 90;
    return undefined;
  };
  const id = (p: TriPart) => {
    const x = spec.parts[p];
    return typeof x === 'string' ? x : undefined;
  };
  /** A part's value (sides in formula units, angles in degrees), or undefined for "?". */
  const valueOf = (p: TriPart): number | undefined => {
    const x = spec.parts[p];
    if (typeof x === 'number') return x;
    if (x !== undefined && rep.known(x)) return rep.val(x);
    return fixedAngle(p);
  };
  const isGiven = (p: TriPart) => {
    if (spec.given) return spec.given.includes(p);
    const x = spec.parts[p];
    if (typeof x !== 'string') return false;
    const st = calc.status(x);
    return st === 'given' || st === 'example';
  };
  const parts = [...SIDES, ...ANGLES] as TriPart[];
  const known = Object.fromEntries(
    parts.flatMap((p) => (valueOf(p) === undefined ? [] : [[p, valueOf(p)!]])),
  ) as Partial<Record<TriPart, number>>;
  // Build from the given parts first; a special or right triangle from its fixed angles next.
  const order = [
    ...parts.filter((p) => isGiven(p) && known[p] !== undefined),
    ...parts.filter((p) => fixedAngle(p) !== undefined),
  ];
  const solved = solveTriangle(known, order);
  // Of the triangles the basis allows, those the other known parts agree with.
  const agrees = (t: Tri) =>
    parts.every(
      (p) =>
        known[p] === undefined ||
        Math.abs(t[p] - known[p]!) <= 1e-4 * Math.max(1, Math.abs(known[p]!)),
    );
  const fitting = solved.triangles.filter(agrees);
  const tooFew = Object.keys(known).length < 3 || !SIDES.some((p) => known[p] !== undefined);
  const reason = tooFew
    ? undefined
    : (solved.reason ??
      (fitting.length === 0 ? "The values don't fit one triangle: check each part." : undefined));
  // A right angle at C must be one when the page says so.
  const rightReason =
    right && fitting[0] && Math.abs(fitting[0].C - 90) > 1e-6
      ? `This page needs a right angle at ${names[2]}.`
      : undefined;
  const ok = !tooFew && !reason && !rightReason && fitting.length > 0;
  // Faded shape while parts are missing or don't fit: the example's triangle, without numbers.
  const exampleTri = (() => {
    const ex = Object.fromEntries(
      parts.flatMap((p) => {
        const x = spec.parts[p];
        const v = typeof x === 'number' ? x : x ? calc.module.example[x] : fixedAngle(p);
        return v === undefined ? [] : [[p, typeof x === 'string' ? v * rep.factor(x) : v]];
      }),
    ) as Partial<Record<TriPart, number>>;
    return solveTriangle(ex).triangles[0] ?? { a: 3, b: 4, c: 5, A: 36.87, B: 53.13, C: 90 };
  })();
  const main = ok ? fitting[0]! : exampleTri;
  // SSA with two triangles: the other one, dashed (not in a congruence pair, which draws both).
  const second =
    ok && solved.triangles.length === 2 ? solved.triangles.find((t) => t !== main) : undefined;
  const criterion: Criterion | undefined =
    spec.congruence?.criterion ??
    (solved.criterion === 'SSA' && main.C === 90 && isGiven('c') ? 'HL' : solved.criterion);

  // The part labels: "a = 7 cm", "?" before it is known; numbers only when the figure fits.
  const sym = (p: TriPart) => {
    const x = id(p);
    return x
      ? rep.variable(x).symbol
      : p === p.toUpperCase()
        ? names[ANGLES.indexOf(p as 'A')]!
        : p;
  };
  const exact = (p: TriPart) => {
    const x = id(p);
    if (!x || !rep.known(x)) return undefined;
    return spec.special ? radicalText(rep.shown(x)) : undefined;
  };
  const partText = (p: TriPart): string | undefined => {
    const x = spec.parts[p];
    if (!ok) return x === undefined && fixedAngle(p) === undefined ? undefined : sym(p);
    if (typeof x === 'number')
      return `${sym(p)} = ${formatNumber(x)}${p === p.toUpperCase() ? '°' : ''}`;
    if (x === undefined) {
      const f = fixedAngle(p);
      return f === undefined ? undefined : `${sym(p)} = ${f}°`;
    }
    const e = exact(p);
    if (e) return `${sym(p)} = ${e}`;
    // A worked-out side or angle to 2 decimals, as the caption gives it (93.56°, not 93.5573°).
    if (!rep.words && calc.status(x) === 'derived') {
      const u = rep.unit(x);
      return `${rep.variable(x).symbol} = ${n2(rep.shown(x))}${!u ? '' : u === '°' ? u : ` ${u}`}`;
    }
    return rep.label(x);
  };
  const sideText = (i: number) => partText(SIDES[i]!);
  const angleText = (i: number) => {
    const p = ANGLES[i]!;
    // Right angles show their square; their 90° only when the page asks for it.
    if (ok && Math.abs(main[p] - 90) < 1e-9 && spec.parts[p] === undefined) return undefined;
    return partText(p);
  };

  // What to draw: one triangle, the SSA pair, or two side by side.
  const orderOf = (): [number, number, number] => {
    if (right) return [0, 2, 1];
    if (solved.criterion === 'SSA' || solved.criterion === 'HL') {
      // The given angle's vertex, then the vertex that moves, then the fixed one.
      const at = [0, 1, 2].find((i) => solved.basis.includes(ANGLES[i]!))!;
      const other = [0, 1, 2].find((i) => i !== at && solved.basis.includes(SIDES[i]!))!;
      return [at, other, 3 - at - other];
    }
    return [0, 1, 2];
  };
  const k = spec.similar && rep.known(spec.similar.scale) ? rep.val(spec.similar.scale) : 1;
  const pair = !!spec.congruence || !!spec.similar;
  const scaled = (t: Tri, f: number): Tri => ({ ...t, a: t.a * f, b: t.b * f, c: t.c * f });
  const copyNames = spec.congruence?.names ?? spec.similar?.names ?? ['D', 'E', 'F'];
  const drawn: Drawn[] = [];
  // The copy of a congruent pair is labelled with the matched parts only.
  const inBasis = (p: TriPart) => solved.basis.includes(p) || isGiven(p);
  const first = place(main, orderOf());
  drawn.push({ pts: first, names, sideText, angleText });
  if (second && !pair) {
    const pts = place(second, orderOf());
    drawn.push({
      pts,
      names: names.map((x) => `${x}′`) as TriNames,
      dashed: true,
      sideText: () => undefined,
      angleText: () => undefined,
    });
  }
  if (pair) {
    const copy =
      spec.congruence && criterion === 'SSA' && second
        ? second
        : scaled(main, spec.similar ? k : 1);
    const pts = place(copy, orderOf()).map(([x, y]) => [-x, y] as Pt);
    const simSide = (i: number) => {
      const sid = spec.similar?.sides?.[SIDES[i]!];
      if (!ok) return sid ? rep.variable(sid).symbol : undefined;
      return sid ? rep.label(sid) : undefined;
    };
    drawn.push({
      pts,
      names: copyNames,
      sideText: spec.similar
        ? simSide
        : (i) =>
            ok && inBasis(SIDES[i]!)
              ? sideText(i)?.replace(/^[^=]+=/, `${copyNames[i]!.toLowerCase()} =`)
              : undefined,
      angleText: spec.similar
        ? () => undefined
        : (i) =>
            ok && inBasis(ANGLES[i]!)
              ? angleText(i)?.replace(/^[^=]+=/, `${copyNames[i]} =`)
              : undefined,
    });
  }

  // The marks: given parts matched 1, 2, 3 (sides by ticks, angles by arcs).
  const givenSides = SIDES.filter((p) =>
    ok ? solved.basis.includes(p) || isGiven(p) : isGiven(p),
  );
  const givenAngles = ANGLES.filter((p) =>
    ok ? solved.basis.includes(p) || isGiven(p) : isGiven(p),
  );
  const markSides = spec.similar ? [] : givenSides;
  const markAngles = spec.similar ? [...ANGLES] : givenAngles;

  // Where each triangle sits (math units): side by side for a pair, overlaid for SSA.
  const geo = (() => {
    const shift: Pt[][] = [];
    const xsOf = (pts: Pt[]) => pts.map((p) => p[0]);
    const x0 = Math.min(...xsOf(drawn[0]!.pts));
    const w0 = Math.max(...xsOf(drawn[0]!.pts)) - x0;
    shift.push(drawn[0]!.pts.map(([x, y]) => [x - x0, y] as Pt));
    if (drawn[1] && pair) {
      // The copy under the first, centered, with room for the criterion between them.
      const x1 = Math.min(...xsOf(drawn[1].pts));
      const w1 = Math.max(...xsOf(drawn[1].pts)) - x1;
      const h1 = Math.max(...drawn[1].pts.map((p) => p[1]));
      const h0 = Math.max(...drawn[0]!.pts.map((p) => p[1]));
      const gap = Math.max(0.6 * Math.max(h0, h1), 0.22 * Math.max(w0, w1));
      shift.push(drawn[1].pts.map(([x, y]) => [x - x1 + (w0 - w1) / 2, y - h1 - gap] as Pt));
    } else if (drawn[1]) shift.push(drawn[1].pts.map(([x, y]) => [x - x0, y] as Pt));
    const all = shift.flat();
    const minX = Math.min(...all.map((p) => p[0]));
    const minY = Math.min(...all.map((p) => p[1]), -eyeOf());
    const maxY = Math.max(...all.map((p) => p[1]));
    return {
      shift,
      minX,
      minY,
      maxY,
      bw: Math.max(1e-6, Math.max(...all.map((p) => p[0])) - minX),
      bh: Math.max(1e-6, maxY - minY),
    };
  })();
  const fit = useFrozen({ bw: geo.bw, bh: geo.bh });
  const handle =
    !spec.fixed && ok && !pair && !spec.scene
      ? (() => {
          const [p, q, r] = orderOf();
          const side = SIDES[r]!;
          const sid = id(side);
          return sid && isGiven(side) ? { p, q, sid } : undefined;
        })()
      : undefined;

  const caption = captionOf();

  return (
    <View>
      <Canvas
        aspect={(w) => {
          const L = layout(w);
          return L.h / w;
        }}
      >
        {({ w }) => {
          const L = layout(w);
          const { X, Y, s } = L;
          const op = ok ? 1 : 0.35;
          // Room a scene takes beside a side's label: the brick wall, the ground under the eye.
          const sceneRoom = (i: number) =>
            !ok || !spec.scene
              ? 0
              : spec.scene.kind === 'ladder' && i === 0
                ? 22
                : spec.scene.kind === 'sight' && i === 1
                  ? eyeOf() * s + 4
                  : 0;
          const cen = (pts: Pt[]): Pt => [
            (pts[0]![0] + pts[1]![0] + pts[2]![0]) / 3,
            (pts[0]![1] + pts[1]![1] + pts[2]![1]) / 3,
          ];
          return (
            <>
              <Svg width={w} height={L.h}>
                {spec.scene && ok ? (
                  <TriangleScene
                    kind={spec.scene.kind}
                    pts={L.shift[0]!.map(([x, y]) => [X(x), Y(y)] as Pt)}
                    eye={
                      spec.scene.eye === undefined
                        ? 0
                        : typeof spec.scene.eye === 'number'
                          ? spec.scene.eye * s
                          : rep.known(spec.scene.eye)
                            ? rep.val(spec.scene.eye) * s
                            : 0
                    }
                    width={w}
                  />
                ) : null}
                {drawn.map((d, ti) => {
                  const P = L.shift[ti]!.map(([x, y]) => [X(x), Y(y)] as Pt);
                  // The SSA pair's moved corner (B′), named on the base: side labels keep off.
                  const ghost =
                    !pair && drawn.length > 1
                      ? L.shift[1]!.map(([x, y]) => [X(x), Y(y)] as Pt).filter((g) =>
                          L.shift[0]!.every(([x, y]) => Math.hypot(X(x) - g[0], Y(y) - g[1]) > 1),
                        )
                      : [];
                  const C0 = cen(P);
                  const mirror = ti > 0 && pair;
                  const ink = d.dashed ? c.chartMuted : c.chartInk;
                  // Side i joins the two vertices other than i.
                  const ends = (i: number) => [P[(i + 1) % 3]!, P[(i + 2) % 3]!] as const;
                  const angleAt = (i: number) => [P[i]!, P[(i + 1) % 3]!, P[(i + 2) % 3]!] as const;
                  const isRight = (i: number) =>
                    ok &&
                    Math.abs(
                      (ti > 0 && criterion === 'SSA' && second ? second : main)[ANGLES[i]!] - 90,
                    ) < 1e-6;
                  return (
                    <G key={ti} opacity={op}>
                      <Polygon
                        points={P.map((p) => p.join(',')).join(' ')}
                        fill={spec.scene ? 'none' : c.chartFill}
                        opacity={d.dashed ? 0.2 : 0.45}
                      />
                      {[0, 1, 2].map((i) => {
                        const [p, q] = ends(i);
                        const given = !d.dashed && givenSides.includes(SIDES[i]!) && ok;
                        // The ladder is its own hypotenuse; a line of sight is dashed.
                        const scene = ok ? spec.scene?.kind : undefined;
                        if (scene === 'ladder' && i === 2) return null;
                        const sight = scene === 'sight' && i === 2;
                        return (
                          <Line
                            key={`s${i}`}
                            x1={p[0]}
                            y1={p[1]}
                            x2={q[0]}
                            y2={q[1]}
                            stroke={given ? c.chartHighlight : ink}
                            strokeWidth={given ? chart.strokeHeavy : chart.stroke}
                            strokeDasharray={d.dashed || sight ? chart.dash : undefined}
                            strokeLinecap="round"
                          />
                        );
                      })}
                      {d.dashed
                        ? null
                        : [0, 1, 2].map((i) => {
                            const [v, p, q] = angleAt(i);
                            const marked = markAngles.indexOf(ANGLES[i]!);
                            if (isRight(i))
                              return (
                                <RightMark
                                  key={`r${i}`}
                                  v={v}
                                  p={p}
                                  q={q}
                                  size={Math.min(12, s * 0.15 + 6)}
                                  color={
                                    givenAngles.includes(ANGLES[i]!) ? c.chartHighlight : c.chartInk
                                  }
                                />
                              );
                            if (marked < 0 && !(spec.trig && ANGLES[i] === spec.trig.angle))
                              return null;
                            const count = spec.similar || pair ? marked + 1 : 1;
                            return (
                              <Arcs
                                key={`a${i}`}
                                v={v}
                                p={p}
                                q={q}
                                count={count}
                                r={18}
                                color={c.chartHighlight}
                                fill={c.chartHighlight}
                              />
                            );
                          })}
                      {d.dashed || !pair
                        ? null
                        : markSides.map((sp, j) => {
                            const [p, q] = ends(SIDES.indexOf(sp));
                            return (
                              <Ticks key={`t${sp}`} p={p} q={q} count={j + 1} color={c.chartInk} />
                            );
                          })}
                      {/* Vertex names outside each corner, with the angle when it is a part. */}
                      {[0, 1, 2].map((i) => {
                        const [v, p, q] = angleAt(i);
                        // The SSA pair shares two corners: only the one that moved is named.
                        if (
                          d.dashed &&
                          L.shift[0]!.some(([x, y]) => Math.hypot(X(x) - v[0], Y(y) - v[1]) < 1)
                        )
                          return null;
                        const text = d.angleText(i) ?? d.names[i]!;
                        const labelText = d.dashed
                          ? d.names[i]!
                          : text.startsWith(d.names[i]!)
                            ? text
                            : `${d.names[i]}  ${text}`;
                        // Out along the outside bisector, far enough that the text clears it.
                        const u = inside(v, p, q, -1);
                        const [ux, uy] = [u[0] - v[0], u[1] - v[1]];
                        const tw = labelText.length * chart.label * 0.58;
                        const off = 8 + Math.abs(ux) * (tw / 2) + Math.abs(uy) * 7;
                        // The dragged corner is named under its handle, clear of it.
                        const held = !!handle && ti === 0 && i === handle.q;
                        const out: Pt = held
                          ? [v[0], v[1] + 30]
                          : [v[0] + ux * off, v[1] + uy * off];
                        return (
                          <ChartText
                            key={`v${i}`}
                            {...fitLabel(out[0], labelText, chart.label, w)}
                            y={Math.max(12, Math.min(L.h - 4, out[1] + 4))}
                            fontWeight="700"
                            fill={
                              d.dashed
                                ? c.chartMuted
                                : givenAngles.includes(ANGLES[i]!) && ok
                                  ? c.chartHighlight
                                  : c.chartInk
                            }
                          >
                            {labelText}
                          </ChartText>
                        );
                      })}
                      {[0, 1, 2].map((i) => {
                        const t = d.sideText(i);
                        if (!t) return null;
                        const [p, q] = ends(i);
                        const role = spec.trig && ti === 0 ? roleOf(i) : undefined;
                        const lines = role ? [role, t] : [t];
                        // Outside the side's middle, far enough that the whole block clears it.
                        const n = outside(p, q, C0, 1);
                        // The middle, or a third of the way from either end when B′'s name
                        // is there ("c = 11.98" covered B′).
                        const k = [0.5, 0.3, 0.7].reduce((best, kk) => {
                          const room = (x: number) =>
                            Math.min(
                              60,
                              ...ghost.map((g) =>
                                Math.hypot(
                                  p[0] + (q[0] - p[0]) * x - g[0],
                                  p[1] + (q[1] - p[1]) * x - g[1],
                                ),
                              ),
                            );
                          return room(kk) > room(best) + 1 ? kk : best;
                        }, 0.5);
                        const mid: Pt = [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k];
                        // (The normal from the true middle: `outside` measures from there.)
                        const [nx, ny] = [n[0] - (p[0] + q[0]) / 2, n[1] - (p[1] + q[1]) / 2];
                        const tw = Math.max(...lines.map((x) => x.length)) * chart.label * 0.58;
                        const bh = lines.length * 15;
                        const off =
                          sceneRoom(i) + 5 + Math.abs(nx) * (tw / 2) + Math.abs(ny) * (bh / 2);
                        const cx = mid[0] + nx * off;
                        // Beside an upright side, the block starts below the upper corner,
                        // whose name sits above it (B over "opposite A" on a low ramp).
                        const upright = Math.abs(nx) > 0.9;
                        const top = Math.max(
                          upright ? Math.min(p[1], q[1]) + 6 : 2,
                          Math.min(L.h - bh, mid[1] + ny * off - bh / 2),
                        );
                        return (
                          <G key={`l${i}`}>
                            {lines.map((line, j) => (
                              <ChartText
                                key={j}
                                {...fitLabel(cx, line, chart.label, w)}
                                y={top + 11 + j * 15}
                                fontWeight={line === role ? '400' : '600'}
                                fill={
                                  line === role
                                    ? c.chartMuted
                                    : givenSides.includes(SIDES[i]!) && ok && !mirror
                                      ? c.chartHighlight
                                      : c.chartInk
                                }
                              >
                                {line}
                              </ChartText>
                            ))}
                          </G>
                        );
                      })}
                    </G>
                  );
                })}
                {pair ? (
                  <ChartText
                    x={L.mid[0]}
                    y={L.mid[1]}
                    textAnchor="middle"
                    fontSize={chart.emphasis}
                    fontWeight="700"
                    fill={criterion === 'SSA' ? c.hopBack : c.chartHighlight}
                    opacity={ok ? 1 : 0.4}
                  >
                    {spec.similar ? '∼' : criterion === 'SSA' ? 'SSA ≇' : `${criterion ?? ''} ≅`}
                  </ChartText>
                ) : null}
              </Svg>
              {handle ? (
                <DragHandle
                  testID="drag-side"
                  x={X(L.shift[0]![handle.q]![0])}
                  y={Y(L.shift[0]![handle.q]![1])}
                  label={rep.variable(handle.sid).name}
                  onStart={() => {
                    start.current = rep.val(handle.sid);
                    fit.freeze();
                  }}
                  onEnd={fit.release}
                  onMove={(dx) =>
                    calc.set(
                      {
                        ...rep.pin(
                          spec.keep ??
                            parts
                              .filter((p) => isGiven(p) && id(p) && id(p) !== handle.sid)
                              .map((p) => id(p)!),
                        ),
                        [handle.sid]: rep.snapTo(handle.sid, start.current + dx / s),
                      },
                      rep.slide(handle.sid),
                    )
                  }
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>{caption}</Caption>
    </View>
  );

  /** The scale that fits every triangle in `w`, kept while a handle is dragged. */
  function layout(w: number) {
    const { shift, minX, maxY, bw, bh } = geo;
    const bwFit = Math.max(bw, fit.value.bw);
    const bhFit = Math.max(bh, fit.value.bh);
    const padX = spec.trig ? 70 : 56;
    const padTop = 26;
    const padBottom = spec.trig || handle ? 40 : 26;
    const s = Math.min((w - 2 * padX) / bwFit, (w * 0.95 - padTop - padBottom) / bhFit);
    const h = bhFit * s + padTop + padBottom;
    const left = (w - bwFit * s) / 2;
    const X = (x: number) => left + (x - minX) * s;
    const Y = (y: number) => padTop + (maxY + (bhFit - bh) - y) * s;
    // The criterion sits between the pair: under the first triangle, over its copy.
    const firstLow = Math.min(...shift[0]!.map((p) => p[1]));
    const secondTop = pair ? Math.max(...shift[1]!.map((p) => p[1])) : firstLow;
    const midX =
      (Math.min(...shift[0]!.map((p) => p[0])) + Math.max(...shift[0]!.map((p) => p[0]))) / 2;
    return { X, Y, s, h, shift, mid: [X(midX), Y((firstLow + secondTop) / 2) + 5] as Pt };
  }

  function eyeOf() {
    const e = spec.scene?.eye;
    if (e === undefined) return 0;
    if (typeof e === 'number') return e;
    return rep.known(e) ? rep.val(e) : 0;
  }

  /** Right-triangle trig: side i named from θ (hypotenuse opposite the right angle). */
  function roleOf(i: number): string | undefined {
    if (!spec.trig) return undefined;
    const t = ANGLES.indexOf(spec.trig.angle);
    if (i === 2) return 'hypotenuse';
    return i === t ? `opposite ${sym(spec.trig.angle)}` : `adjacent to ${sym(spec.trig.angle)}`;
  }

  function captionOf(): string {
    if (tooFew) return 'Type three parts of the triangle, one of them a side.';
    if (reason) return `No triangle: ${reason}`;
    if (rightReason) return rightReason;
    const num = (p: TriPart) => {
      const x = id(p);
      return x ? rep.value(x, false) : n2(main[p]);
    };
    const lines: string[] = [];
    if (spec.trig) {
      const t = spec.trig.angle;
      const ti = ANGLES.indexOf(t);
      const opp = SIDES[ti]!;
      const adj = SIDES[ti === 0 ? 1 : 0]!;
      const th = sym(t);
      // One line each on a phone ("opposite/hypotenuse =" pushed "≈ 0.083" onto its own line).
      const ratio = (f: string, top: TriPart, bottom: TriPart, x: number) =>
        `${f} ${th} = ${sym(top)}/${sym(bottom)} = ${num(top)}/${num(bottom)} ≈ ${formatNumber(Number(x.toFixed(4)))}`;
      lines.push(
        ratio('sin', opp, 'c', main[opp] / main.c),
        ratio('cos', adj, 'c', main[adj] / main.c),
        ratio('tan', opp, adj, main[opp] / main[adj]),
      );
      if (spec.scene?.kind === 'sight' && eyeOf() > 0 && spec.scene.eye !== undefined) {
        const e =
          typeof spec.scene.eye === 'string'
            ? rep.value(spec.scene.eye, false)
            : formatNumber(spec.scene.eye);
        lines.push(
          `The top is ${num(opp)} above the eye, so ${n2(main[opp] + eyeOf())} above the ground (${num(opp)} + ${e}).`,
        );
      }
      return lines.join(' · ');
    }
    if (spec.special) {
      const ratio = spec.special === '45-45-90' ? '1 : 1 : √2' : '1 : √3 : 2';
      const text = (p: TriPart) =>
        exact(p) ?? radicalText(main[p] / (id(p) ? rep.factor(id(p)!) : 1)) ?? num(p);
      const approx = SIDES.filter((p) => /√/.test(text(p))).map(
        (p) => `${sym(p)} = ${text(p)} ≈ ${n2(main[p] / (id(p) ? rep.factor(id(p)!) : 1))}`,
      );
      lines.push(
        `${spec.special}: ${sym('a')} : ${sym('b')} : ${sym('c')} = ${ratio}`,
        `${text('a')} : ${text('b')} : ${text('c')}`,
        ...approx,
      );
      return lines.join(' · ');
    }
    if (spec.congruence) {
      const [d, e, f] = copyNames;
      const tri = `△${names.join('')}`;
      const copy = `△${d}${e}${f}`;
      const why: Record<string, string> = {
        SSS: 'three pairs of equal sides',
        SAS: 'two pairs of equal sides and the angles between them',
        ASA: 'two pairs of equal angles and the sides between them',
        AAS: 'two pairs of equal angles and a side not between them',
        HL: 'right triangles with equal hypotenuses and one pair of equal legs',
      };
      if (criterion === 'SSA')
        return second
          ? `SSA is not a congruence test: ${tri} and ${copy} share ${solved.basis.map(sym).join(', ')} but are not congruent.`
          : `SSA is not a congruence test in general; these values fit only one triangle.`;
      return `${tri} ≅ ${copy} by ${criterion}: ${why[criterion ?? 'SSS']}.`;
    }
    if (spec.similar) {
      const [d, e, f] = copyNames;
      lines.push(
        `△${d}${e}${f} ∼ △${names.join('')}: the same angles, every side ${rep.value(spec.similar.scale, false)} times as long.`,
      );
      for (const p of SIDES) {
        const sid = spec.similar.sides?.[p];
        if (sid && rep.known(sid))
          lines.push(
            `Side ${rep.variable(sid).symbol} = ${rep.variable(spec.similar.scale).symbol} × ${sym(p)} = ${rep.value(spec.similar.scale, false)} × ${num(p)} = ${rep.value(sid, false)}`,
          );
      }
      return lines.join(' · ');
    }
    const kind = solved.criterion;
    const how: Record<string, string> = {
      SSS: 'Three sides fix the triangle; the law of cosines gives each angle.',
      SAS: 'Two sides and the angle between them fix the triangle: the law of cosines gives the third side.',
      ASA: 'Two angles and the side between them fix the triangle; the law of sines gives the other sides.',
      AAS: 'Two angles and a side fix the triangle; the law of sines gives the other sides.',
      HL: 'A right angle, the hypotenuse and a leg fix the triangle.',
      SSA: 'Two sides and an angle not between them.',
    };
    lines.push(how[kind ?? 'SSS']!);
    if (second) {
      const moving = SIDES.find((p) => !solved.basis.includes(p))!;
      const Y =
        ANGLES[
          [0, 1, 2].find(
            (i) =>
              i !== ANGLES.indexOf(solved.basis.find((p) => p === p.toUpperCase()) as 'A') &&
              solved.basis.includes(SIDES[i]!),
          )!
        ]!;
      lines.push(
        `Two triangles fit: ${sym(Y)} = ${n2(main[Y])}° or ${n2(second[Y])}°, ${sym(moving)} = ${n2(main[moving])} or ${n2(second[moving])} (dashed).`,
      );
    } else if (kind === 'SSA') lines.push('Only one triangle fits these values.');
    const k2 = main.a / Math.sin(rad(main.A));
    lines.push(
      `Law of sines: ${sym('a')}/sin ${sym('A')} = ${sym('b')}/sin ${sym('B')} = ${sym('c')}/sin ${sym('C')} ≈ ${n2(k2 / (id('a') ? rep.factor(id('a')!) : 1))}`,
    );
    return lines.join(' · ');
  }
}
