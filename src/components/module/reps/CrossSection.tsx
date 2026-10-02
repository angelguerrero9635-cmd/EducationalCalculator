import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Defs, G, Line, Polygon } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, fitLabel, useRep } from './common';
import { quotientText } from './exact';
import { worked } from './hskKit';
import { TopLight, url, usePaintIds } from './paint';
import {
  areaOf,
  edgesOf,
  outward,
  planeOf,
  reachOf,
  sectionName,
  sectionOf,
  sidesOf,
  solidOf,
  type P3,
} from './section';
import { Steppers } from './Steppers';
import { CrossSectionRound } from './CrossSectionRound';

type Spec = Extract<Representation, { kind: 'crossSection' }>;

/** Receding edges (the width, front to back) go up and to the right, shortened. */
const DEPTH = { x: 0.5 * Math.cos(0.6), y: 0.5 * Math.sin(0.6) };
/** Faces seen from the front, right and above (their outward normals point this way). */
const VIEW: P3 = [DEPTH.x, -1, DEPTH.y];

/**
 * A clear plastic solid (a box, a triangular prism standing on its triangle, or a pyramid) cut
 * by a flat plane, the cut face shaded. `cut: 'base'` slides the plane up the height,
 * parallel to the base (a prism's cut is the base again; a pyramid's shrinks toward the
 * apex); `'side'` slides it back across the width, parallel to the front; `'diagonal'` stands
 * it on the base's diagonal. Drag the plane's corner to move it.
 */
export function CrossSection({ spec, calc }: { spec: Spec; calc: Calculator }) {
  // Grades 9–12: a cylinder or a cone (CrossSectionRound.tsx).
  if (spec.solid === 'cylinder' || spec.solid === 'cone')
    return <CrossSectionRound spec={spec} calc={calc} />;
  return <CrossSectionFlat spec={spec as FlatSpec} calc={calc} />;
}

type FlatSpec = Spec & { solid: 'box' | 'triangularPrism' | 'pyramid' };

function CrossSectionFlat({ spec, calc }: { spec: FlatSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('light');
  const start = useRef({ at: 0, scale: 1 });
  const cut = spec.cut ?? 'base';
  // Geometry in formula units (every length in one unit); labels in the length's shown unit.
  const l = Math.max(0.01, rep.val(spec.length));
  const w = spec.width ? Math.max(0.01, rep.val(spec.width)) : l;
  const h = Math.max(0.01, rep.val(spec.height));
  const reach = reachOf(spec.solid, cut, w, h);
  const at = spec.at ? Math.min(reach, Math.max(0, rep.val(spec.at))) : reach / 2;
  const f = rep.factor(spec.length);
  const n = (x: number, power = 1) => quotientText(Number((x / f ** power).toFixed(9)));
  const known = [spec.length, spec.width, spec.height, spec.at].every((id) => !id || rep.known(id));
  const solid = solidOf(spec.solid, l, w, h, spec.triangle === 'isosceles');
  const plane = planeOf(spec.solid, cut, at, l, w);
  const section = sectionOf(solid, plane);
  const area = areaOf(section);
  const name = sectionName(section);
  const unit = rep.unit(spec.length);
  const sq = unit ? ` ${unit}²` : '';
  const sym = (id: string) => (rep.words ? rep.variable(id).name : rep.variable(id).symbol);

  // The plane as a sheet a little bigger than the solid: flat (the plane moves up), upright
  // facing us (it moves back), or upright on the diagonal.
  const m = 0.22 * Math.max(l, w, h);
  const top = Math.max(...solid.corners.map((q) => q[2]));
  const deep = Math.max(...solid.corners.map((q) => q[1]));
  const flat = plane.n[2] !== 0;
  const facing = plane.n[1] !== 0 && plane.n[0] === 0;
  const sheet: P3[] = flat
    ? [
        [-m, -m, at],
        [l + m, -m, at],
        [l + m, deep + m, at],
        [-m, deep + m, at],
      ]
    : facing
      ? [
          [-m, at, -m * 0.6],
          [l + m, at, -m * 0.6],
          [l + m, at, top + m * 0.6],
          [-m, at, top + m * 0.6],
        ]
      : (() => {
          const d = Math.hypot(l, w);
          const [ux, uy] = [l / d, w / d];
          const [a, b] = [-m * 0.6, d + m * 0.6];
          return [
            [ux * a, uy * a, -m * 0.6],
            [ux * b, uy * b, -m * 0.6],
            [ux * b, uy * b, top + m * 0.6],
            [ux * a, uy * a, top + m * 0.6],
          ] as P3[];
        })();

  const faces = solid.faces.map((_, fi) => {
    const o = outward(solid, fi);
    return o[0] * VIEW[0] + o[1] * VIEW[1] + o[2] * VIEW[2] > 1e-9;
  });
  const edges = edgesOf(solid).map((e) => ({ ...e, seen: e.faces.some((f) => faces[f]) }));

  // What the cut is, with its sides when it is a rectangle, and the solid's volume.
  const sides = sidesOf(section);
  const rect = name === 'rectangle' || name === 'square';
  const areaLabel = spec.area ? `${sym(spec.area)} = ` : '';
  // A "?" dimension: the cut is named, never worked with the example's numbers behind the "?".
  const cutLine =
    section.length === 0
      ? 'The plane only touches the solid here.'
      : !known
        ? `The cut is a ${name}${areaLabel ? `: ${areaLabel}?` : ''}.`
        : `The cut is a ${name}: ${areaLabel}${rect ? `${n(sides[0]!)} × ${n(sides[1]!)} = ` : ''}${n(area, 2)}${sq}.`;
  const prism = spec.solid !== 'pyramid';
  const note =
    cut === 'base'
      ? prism
        ? 'Every cut parallel to the base is the same shape as the base.'
        : 'Cuts parallel to the base shrink toward the top.'
      : undefined;
  const volumeLine = spec.volume
    ? worked(
        known,
        prism && cut === 'base' && spec.area
          ? `${sym(spec.volume)} = ${sym(spec.area)} × ${sym(spec.height)} = ${n(area, 2)} × ${n(h)} = ${rep.value(spec.volume)}`
          : `${sym(spec.volume)} = ${spec.solid === 'box' ? '' : spec.solid === 'pyramid' ? '1/3 × ' : '1/2 × '}${n(l)} × ${n(w)} × ${n(h)} = ${rep.value(spec.volume)}`,
      )[0]
    : undefined;

  return (
    <View>
      <Canvas aspect={0.78}>
        {({ w: cw, h: ch }) => {
          // Fit the solid and its sheet: project, then scale into the canvas.
          const raw = (p: P3) => ({ x: p[0] + DEPTH.x * p[1], y: -p[2] - DEPTH.y * p[1] });
          const all = [...solid.corners, ...sheet].map(raw);
          const [x0, x1] = [Math.min(...all.map((p) => p.x)), Math.max(...all.map((p) => p.x))];
          const [y0, y1] = [Math.min(...all.map((p) => p.y)), Math.max(...all.map((p) => p.y))];
          const pad = 26;
          const k = Math.min((cw - 2 * pad) / (x1 - x0 || 1), (ch - 2 * pad) / (y1 - y0 || 1));
          const ox = (cw - (x1 - x0) * k) / 2 - x0 * k;
          const oy = (ch - (y1 - y0) * k) / 2 - y0 * k;
          const P = (p: P3) => {
            const r = raw(p);
            return { x: ox + r.x * k, y: oy + r.y * k };
          };
          const pts = (ps: P3[]) =>
            ps
              .map(P)
              .map((q) => `${q.x},${q.y}`)
              .join(' ');
          // The handle on the sheet's front right corner (the plane's top right, upright).
          const corner = P(flat ? sheet[1]! : sheet[2]!);
          // Screen pixels per unit the plane moves: straight up, or back along the width.
          const along = flat ? { x: 0, y: -k } : { x: DEPTH.x * k, y: -DEPTH.y * k };
          const sectionMid = section.length
            ? P(
                section
                  .reduce<P3>((s, p) => [s[0] + p[0], s[1] + p[1], s[2] + p[2]], [0, 0, 0])
                  .map((x) => x / section.length) as P3,
              )
            : undefined;
          const label = section.length ? (known ? `${n(area, 2)}${sq}` : '?') : '';
          // A cut too small for its label has it outside, to its left.
          const onCut = section.map(P);
          const minX = Math.min(...onCut.map((q) => q.x));
          const small =
            Math.max(...onCut.map((q) => q.x)) - minX < label.length * chart.value * 0.6 + 8 ||
            Math.max(...onCut.map((q) => q.y)) - Math.min(...onCut.map((q) => q.y)) < 18;
          return (
            <>
              <Svg width={cw} height={ch} opacity={known ? 1 : 0.4}>
                <Defs>
                  <TopLight id={ids.light} strength={0.8} />
                </Defs>
                {/* Hidden edges show through the clear solid, dashed. */}
                {edges
                  .filter((e) => !e.seen)
                  .map((e) => {
                    const [a, b] = [P(solid.corners[e.a]!), P(solid.corners[e.b]!)];
                    return (
                      <Line
                        key={`h${e.a}-${e.b}`}
                        x1={a.x}
                        y1={a.y}
                        x2={b.x}
                        y2={b.y}
                        stroke={c.glassEdge}
                        strokeWidth={chart.strokeLight}
                        strokeDasharray={chart.dash}
                      />
                    );
                  })}
                {/* The cutting plane: a thin sheet reaching past the solid. */}
                <Polygon
                  points={pts(sheet)}
                  fill={c.chartSecond}
                  fillOpacity={0.16}
                  stroke={c.chartSecond}
                  strokeWidth={chart.strokeLight}
                />
                {/* The solid's faces we see, in clear plastic lit from above. */}
                {solid.faces.map((f, fi) =>
                  faces[fi] ? (
                    <G key={`f${fi}`}>
                      <Polygon
                        points={pts(f.map((i) => solid.corners[i]!))}
                        fill={c.glass}
                        fillOpacity={0.55}
                      />
                      <Polygon
                        points={pts(f.map((i) => solid.corners[i]!))}
                        fill={url(ids.light)}
                      />
                    </G>
                  ) : null,
                )}
                {/* The cut face. */}
                {section.length ? (
                  <Polygon
                    points={pts(section)}
                    fill={c.chartHighlight}
                    fillOpacity={0.5}
                    stroke={c.chartHighlight}
                    strokeWidth={chart.stroke}
                    strokeLinejoin="round"
                  />
                ) : null}
                {edges
                  .filter((e) => e.seen)
                  .map((e) => {
                    const [a, b] = [P(solid.corners[e.a]!), P(solid.corners[e.b]!)];
                    return (
                      <Line
                        key={`e${e.a}-${e.b}`}
                        x1={a.x}
                        y1={a.y}
                        x2={b.x}
                        y2={b.y}
                        stroke={c.chartInk}
                        strokeWidth={chart.stroke}
                        strokeLinecap="round"
                      />
                    );
                  })}
                {sectionMid ? (
                  <ChartText
                    {...(small
                      ? fitLabel(minX - 6, label, chart.value, cw, 'end', 6)
                      : fitLabel(sectionMid.x, label, chart.value, cw))}
                    y={sectionMid.y + 4}
                    fontSize={chart.value}
                    fontWeight="700"
                  >
                    {label}
                  </ChartText>
                ) : null}
              </Svg>
              {spec.at ? (
                <DragHandle
                  testID={`drag-${spec.at}`}
                  x={corner.x}
                  y={corner.y}
                  label={rep.variable(spec.at).name}
                  onStart={() => {
                    start.current = { at, scale: along.x ** 2 + along.y ** 2 };
                  }}
                  onMove={(dx, dy) => {
                    // The drag's part along the way the plane moves, in units.
                    const moved = (dx * along.x + dy * along.y) / start.current.scale;
                    const next = Math.min(reach, Math.max(0, start.current.at + moved));
                    calc.set(
                      {
                        ...rep.pin(
                          [spec.length, spec.width, spec.height].filter((x): x is string => !!x),
                        ),
                        [spec.at!]: rep.snapTo(spec.at!, next * rep.factor(spec.at!)),
                      },
                      rep.slide(spec.at!),
                    );
                  }}
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>{[cutLine, note, volumeLine].filter(Boolean).join(' · ')}</Caption>
      <Steppers
        calc={calc}
        items={[spec.length, spec.width, spec.height]
          .filter((id): id is string => !!id)
          .map((id, _, all) => ({ var: id, steps: [1], pin: all.filter((x) => x !== id) }))}
      />
    </View>
  );
}
