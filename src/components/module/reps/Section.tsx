import { type ReactNode } from 'react';
import { Platform, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
  TSpan,
} from 'react-native-svg';

import type { NumOrVar } from '@/data/modules/typesGraphs';
import type { SectionSpec } from '@/data/modules/typesHe1b';
import { subscriptRuns } from '@/engine/subscripts';
import { chart, font, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption } from './common';
import { num } from './CircularSatellite';
import { arrowHead } from './graphKit';
import { CurvedArrow, useReader } from './hs3aKit';
import { Vec, worked } from './hskKit';
import { TopLight, url, usePaintIds } from './paint';
import {
  firstMoment,
  lameHoop,
  plasticAxis,
  propsOf,
  setupSection,
  TIE_DIAMETER,
  widthAt,
  type Part,
  type Sizes,
} from './sectionMath';

type Pt = { x: number; y: number };

/** The sizes each shape is drawn from. */
const SIZE_FIELDS: Record<SectionSpec['shape'], (keyof SectionSpec)[]> = {
  rectangle: ['b', 'h'],
  rc: ['b', 'd'],
  tee: ['bf', 'tf', 'tw', 'hw'],
  wide: ['d', 'bf', 'tf', 'tw'],
  angle: ['b', 'h', 't'],
  circle: ['d'],
  tube: ['d', 'di'],
  hole: ['b', 'h'],
  cylinder: ['r', 't', 'ro'],
  box: ['b', 'h', 't'],
};

/**
 * HC3 (ME-P3, ACC-P6): a cross-section to scale with its centroid, axes and, by option, its
 * stress block, an RC beam's Whitney block and strain line, or a closed cell's shear flow.
 * Steel and aluminum parts are painted as cut metal, concrete with its aggregate and bars;
 * the stress blocks and dimension lines stay flat, C and T in letters as well as color.
 */
export function Section({ spec, calc }: { spec: SectionSpec; calc: Calculator }) {
  const c = usePalette();
  const { rep, v, known } = useReader(calc);
  const paint = usePaintIds('steel', 'light', 'bar', 'concrete');
  const has = (x: NumOrVar | undefined): x is NumOrVar => x !== undefined && known(x);
  const unitOf = (x: NumOrVar | undefined) =>
    typeof x === 'string' ? rep.variable(x).unit : undefined;

  // ── Lengths in one unit, the parts, an RC section's bars ──
  const setup = setupSection(spec, (x) => v(x), unitOf);
  const { lenUnit, len, inch, sizes, barCount, barNo, db, column, hDerived, built, layout } = setup;
  const shape = spec.shape;
  const rc = shape === 'rc';
  const sizeIds = [
    ...SIZE_FIELDS[shape].map((k) => spec[k] as NumOrVar | undefined),
    ...(shape === 'hole' ? [spec.hole?.d, spec.hole?.x, spec.hole?.y] : []),
  ];
  const sizesKnown = sizeIds.every((x) => x === undefined || known(x));
  const props = built ? propsOf(built.parts) : undefined;
  const why = built?.why ?? layout?.why;

  // ── Labels ──
  /** "b = 100 mm", or nothing while the value is "?". */
  const say = (x: NumOrVar | undefined, fallback = '') =>
    x === undefined || !known(x)
      ? undefined
      : typeof x === 'string'
        ? `${rep.variable(x).symbol} = ${rep.value(x)}`
        : `${fallback} = ${num(x)}${lenUnit ? ` ${lenUnit}` : ''}`;
  const valueOf = (x: NumOrVar | undefined) =>
    x === undefined || !known(x) ? undefined : typeof x === 'string' ? rep.value(x) : num(x);

  const side = spec.whitney
    ? 'whitney'
    : spec.stress && !(spec.stress === 'hoop' && !spec.thick && shape !== 'cylinder')
      ? spec.stress
      : undefined;
  const aspect = side === 'whitney' ? 0.86 : side ? 0.8 : 0.78;

  const centroidShown =
    !!props &&
    !!built &&
    !why &&
    shape !== 'cylinder' &&
    !spec.thinWalled &&
    !spec.whitney &&
    (!spec.centroid?.x || known(spec.centroid.x)) &&
    (!spec.centroid?.y || known(spec.centroid.y));
  const axisD = spec.axis && has(spec.axis.d) ? len(spec.axis.d)! : undefined;
  const k = spec.gyration && known(spec.gyration) ? len(spec.gyration) : undefined;

  return (
    <View>
      <Canvas aspect={aspect}>
        {({ w, h }) => {
          if (!built || !props) return null;
          const top = 34;
          const bottom = h - 60;
          // The regions: the section, and beside it the stress block or the strain and stress.
          const sx0 = 36;
          const sx1 = side === 'whitney' ? w * 0.42 : side ? w * 0.52 : w - 20;
          const rightRoom =
            (spec.centroid?.y ? 34 : 0) +
            (axisD !== undefined ? 34 : 0) +
            (spec.parts?.d?.length ?? 0) * 30 +
            (rc && !column && !spec.whitney ? 34 : 0) +
            (shape === 'tube' || shape === 'cylinder' || shape === 'hole' ? 30 : 0) +
            (shape === 'tee' || shape === 'wide' ? 58 : 0) +
            (shape === 'angle' ? 30 : 0);
          const yMin = Math.min(
            0,
            axisD !== undefined ? props.ybar - axisD : 0,
            k !== undefined ? props.ybar - k : 0,
          );
          const yMax = Math.max(built.height, k !== undefined ? props.ybar + k : 0);
          const room = Math.max(40, sx1 - sx0 - rightRoom);
          const s = Math.min(room / built.width, (bottom - top) / (yMax - yMin));
          const ox = sx0 + (room - built.width * s) / 2;
          const X = (x: number) => ox + x * s;
          const Y = (y: number) => bottom - (y - yMin) * s;
          const right = X(built.width);
          let rightLane = right + 12;
          const lane = (gap = 30) => {
            const x = rightLane;
            rightLane += gap;
            return x;
          };

          const metal = !rc;
          const fill = metal ? url(paint.steel) : c.sectionConcrete;
          const outline = outlinePath(shape, sizes, built, X, Y, s);
          const thinWall = (shape === 'box' || shape === 'cylinder') && (sizes.t ?? 0) * s < 3;

          // ── The section ──
          const material = (
            <G>
              {thinWall ? (
                thinWallStroke(shape, sizes, X, Y, s, fill, c.metalDark)
              ) : (
                <>
                  <Path
                    d={outline}
                    fill={fill}
                    fillRule="evenodd"
                    stroke={metal ? c.metalDark : c.sectionConcreteDark}
                    strokeWidth={1.5}
                  />
                  <Path d={outline} fill={url(paint.light)} fillRule="evenodd" />
                </>
              )}
              {rc ? aggregate(built, X, Y, s, c.sectionAggregate) : null}
            </G>
          );

          // ── RC bars and ties ──
          const bars =
            rc && layout && has(spec.bars) ? (
              <G>
                {'r' in layout.tie ? (
                  <Circle
                    cx={X(layout.tie.cx)}
                    cy={Y(layout.tie.cy)}
                    r={(layout.tie.r + (TIE_DIAMETER * inch) / 2) * s}
                    fill="none"
                    stroke={c.sectionRebarDark}
                    strokeWidth={Math.max(1.5, TIE_DIAMETER * inch * s)}
                  />
                ) : (
                  <Rect
                    x={X(layout.tie.x + (TIE_DIAMETER * inch) / 2)}
                    y={Y(layout.tie.y + layout.tie.h - (TIE_DIAMETER * inch) / 2)}
                    width={Math.max(0, (layout.tie.w - TIE_DIAMETER * inch) * s)}
                    height={Math.max(0, (layout.tie.h - TIE_DIAMETER * inch) * s)}
                    rx={Math.max(2, 2 * TIE_DIAMETER * inch * s)}
                    fill="none"
                    stroke={c.sectionRebarDark}
                    strokeWidth={Math.max(1.5, TIE_DIAMETER * inch * s)}
                  />
                )}
                {layout.bars.map((p, i) => (
                  <Circle
                    key={i}
                    cx={X(p.x)}
                    cy={Y(p.y)}
                    r={Math.max(2.5, (db / 2) * s)}
                    fill={url(paint.bar)}
                    stroke={c.sectionRebarDark}
                    strokeWidth={1}
                  />
                ))}
              </G>
            ) : null;

          // ── Dimensions ──
          const dims: ReactNode[] = [];
          const dimBelow = (x1: number, x2: number, label: string | undefined, row = 0) => {
            if (!label) return;
            const y = bottom + 14 + row * 24;
            dims.push(<Dim key={`b${dims.length}`} a={{ x: x1, y }} b={{ x: x2, y }} />);
            dims.push(
              <Lbl
                key={`bl${dims.length}`}
                x={(x1 + x2) / 2}
                y={y + 16}
                text={label}
                w={w}
                color={c.chartInk}
              />,
            );
          };
          const dimAbove = (x1: number, x2: number, label: string | undefined, y: number) => {
            if (!label) return;
            dims.push(<Dim key={`a${dims.length}`} a={{ x: x1, y }} b={{ x: x2, y }} />);
            dims.push(
              <Lbl
                key={`al${dims.length}`}
                x={(x1 + x2) / 2}
                y={y - 6}
                text={label}
                w={w}
                color={c.chartInk}
              />,
            );
          };
          const dimSide = (
            x: number,
            y1: number,
            y2: number,
            label: string | undefined,
            color = c.chartInk,
          ) => {
            if (!label) return;
            dims.push(
              <Dim key={`s${dims.length}`} a={{ x, y: y1 }} b={{ x, y: y2 }} color={color} />,
            );
            dims.push(
              <Lbl
                key={`sl${dims.length}`}
                x={x - 5}
                y={(y1 + y2) / 2}
                text={label}
                color={color}
                rotate
              />,
            );
          };
          const note = (
            x: number,
            y: number,
            label: string | undefined,
            anchor: Anchor = 'start',
          ) => {
            if (!label) return;
            dims.push(
              <Lbl
                key={`n${dims.length}`}
                x={x}
                y={y}
                text={label}
                anchor={anchor}
                w={w}
                color={c.chartInk}
              />,
            );
          };

          const left = X(0);
          const sizeLabel = (x: NumOrVar | undefined, f: string) => say(x, f);
          switch (shape) {
            case 'rectangle':
              dimBelow(left, right, sizeLabel(spec.b, 'b'));
              dimSide(left - 14, Y(0), Y(built.height), sizeLabel(spec.h, 'h'));
              break;
            case 'rc':
              dimBelow(left, right, sizeLabel(spec.b, 'b'));
              if (!hDerived) dimSide(left - 14, Y(0), Y(built.height), sizeLabel(spec.h, 'h'));
              if (!column && sizes.d !== undefined)
                dimSide(
                  spec.whitney ? left - (hDerived ? 14 : 34) : lane(34) + 14,
                  Y(built.height),
                  Y(built.height - sizes.d),
                  sizeLabel(spec.d, 'd'),
                );
              break;
            case 'tee': {
              const { bf = 0, tf = 0, tw = 0, hw = 0 } = sizes;
              dimAbove(X(0), X(bf), sizeLabel(spec.bf, 'b_f'), Y(hw + tf) - 10);
              dimSide(left - 14, Y(0), Y(hw), sizeLabel(spec.hw, 'h_w'));
              note(X(bf) + 6, Y(hw + tf / 2) + 4, sizeLabel(spec.tf, 't_f'));
              note(X(bf / 2 + tw / 2) + 6, Y(hw / 3), sizeLabel(spec.tw, 't_w'));
              rightLane = Math.max(rightLane, right + 70);
              break;
            }
            case 'wide': {
              const { d = 0, bf = 0 } = sizes;
              dimAbove(X(0), X(bf), sizeLabel(spec.bf, 'b_f'), Y(d) - 10);
              dimSide(left - 14, Y(0), Y(d), sizeLabel(spec.d, 'd'));
              // t_f and t_w under the section (b_f is dimensioned above it).
              note((left + right) / 2, bottom + 22, sizeLabel(spec.tf, 't_f'), 'middle');
              note((left + right) / 2, bottom + 40, sizeLabel(spec.tw, 't_w'), 'middle');
              break;
            }
            case 'angle': {
              const { t = 0 } = sizes;
              dimBelow(left, right, sizeLabel(spec.b, 'b'));
              dimSide(left - 14, Y(0), Y(built.height), sizeLabel(spec.h, 'h'));
              note(X(t) + 6, Y(built.height) + 12, sizeLabel(spec.t, 't'));
              break;
            }
            case 'circle':
              dimBelow(left, right, sizeLabel(spec.d, 'd'));
              break;
            case 'tube': {
              const { d = 0, di = 0 } = sizes;
              dimBelow(left, right, sizeLabel(spec.d, 'd'));
              if (di > 0 && has(spec.di)) {
                const y = Y(d / 2 + di / 4);
                dims.push(
                  <Dim key="di" a={{ x: X((d - di) / 2), y }} b={{ x: X((d + di) / 2), y }} />,
                );
                note(right + 8, y + 4, sizeLabel(spec.di, 'd_i'));
                lane(60);
              }
              break;
            }
            case 'hole': {
              const { holeD = 0, holeX = 0, holeY = built.height / 2 } = sizes;
              dimBelow(left, right, sizeLabel(spec.b, 'b'));
              dimSide(left - 14, Y(0), Y(built.height), sizeLabel(spec.h, 'h'));
              dimAbove(X(0), X(holeX), sizeLabel(spec.hole?.x, 'x_h'), Y(built.height) - 10);
              const y = Y(holeY);
              if (has(spec.hole?.d))
                dims.push(
                  <Dim
                    key="hd"
                    a={{ x: X(holeX - holeD / 2), y }}
                    b={{ x: X(holeX + holeD / 2), y }}
                  />,
                );
              note(X(holeX), Y(holeY - holeD / 2) + 16, sizeLabel(spec.hole?.d, 'd'), 'middle');
              break;
            }
            case 'cylinder': {
              const { r = 0, t = 0 } = sizes;
              const cx = r + t;
              if (has(spec.r)) {
                dims.push(
                  <Dim key="r" a={{ x: X(cx), y: Y(cx) }} b={{ x: X(cx + r), y: Y(cx) }} one />,
                );
                note(X(cx + r / 2), Y(cx) + 18, sizeLabel(spec.r, 'r'), 'middle');
              }
              if (spec.ro !== undefined) {
                // A thick wall typed by its radii: r_o down to the lower right.
                if (has(spec.ro)) {
                  const a = -Math.PI / 4;
                  const tip = {
                    x: X(cx + (r + t) * Math.cos(a)),
                    y: Y(cx + (r + t) * Math.sin(a)),
                  };
                  dims.push(<Dim key="ro" a={{ x: X(cx), y: Y(cx) }} b={tip} one />);
                  note(tip.x, tip.y + 16, sizeLabel(spec.ro, 'r_o'), 'middle');
                }
              } else note(right + 6, Y(cx) - 22, sizeLabel(spec.t, 't'));
              break;
            }
            case 'box': {
              const { b = 0, h: hh = 0, t = 0 } = sizes;
              dimBelow(X(t / 2), X(b + t / 2), sizeLabel(spec.b, 'b'));
              dimSide(left - 14, Y(t / 2), Y(hh + t / 2), sizeLabel(spec.h, 'h'));
              note(right + 6, Y((hh + t) / 2) + 4, sizeLabel(spec.t, 't'));
              break;
            }
          }

          // ── Centroid, axes, offsets ──
          const marks: ReactNode[] = [];
          if (centroidShown && props) {
            const C = { x: X(props.xbar), y: Y(props.ybar) };
            marks.push(
              <Line
                key="cx"
                x1={left - 8}
                y1={C.y}
                x2={right + 8}
                y2={C.y}
                stroke={c.chartHighlight}
                strokeWidth={1.5}
                strokeDasharray="8 3 2 3"
              />,
            );
            if (spec.centroid?.x)
              marks.push(
                <Line
                  key="cy"
                  x1={C.x}
                  y1={Y(built.height) - 8}
                  x2={C.x}
                  y2={Y(0) + 8}
                  stroke={c.chartHighlight}
                  strokeWidth={1.5}
                  strokeDasharray="8 3 2 3"
                />,
              );
            marks.push(<CentroidMark key="c" x={C.x} y={C.y} />);
            if (spec.centroid?.y)
              dimSide(lane(34) + 14, Y(0), C.y, say(spec.centroid.y), c.chartHighlight);
            if (spec.centroid?.x) dimBelow(left, C.x, say(spec.centroid.x), 1);
            // Each part's centroid and its offset dᵢ from the section's.
            const solid = built.parts.filter((p) => p.sign > 0);
            spec.parts?.d?.forEach((id, i) => {
              const p = solid[i];
              if (!p || !known(id)) return;
              const py = Y(partCenterY(p));
              marks.push(
                <Circle key={`p${i}`} cx={X(partCenterX(p))} cy={py} r={3} fill={c.chartInk} />,
              );
              marks.push(
                <Line
                  key={`pl${i}`}
                  x1={X(partCenterX(p))}
                  y1={py}
                  x2={rightLane + 6}
                  y2={py}
                  stroke={c.chartMuted}
                  strokeDasharray={chart.dashFine}
                />,
              );
              dimSide(lane(30) + 14, C.y, py, say(id));
            });
            // A parallel axis x′ at d below.
            if (axisD !== undefined) {
              const ay = Y(props.ybar - axisD);
              marks.push(
                <Line
                  key="ax"
                  x1={left - 8}
                  y1={ay}
                  x2={right + 8}
                  y2={ay}
                  stroke={c.chartInk}
                  strokeWidth={1.5}
                  strokeDasharray="8 3 2 3"
                />,
              );
              note(left - 10, ay + 4, 'x′', 'end');
              dimSide(lane(34) + 14, C.y, ay, say(spec.axis!.d));
            }
            if (k !== undefined) {
              for (const sgn of [1, -1]) {
                const ky = Y(props.ybar + sgn * k);
                marks.push(
                  <Line
                    key={`k${sgn}`}
                    x1={left - 4}
                    y1={ky}
                    x2={right + 4}
                    y2={ky}
                    stroke={c.chartMuted}
                    strokeDasharray={chart.dash}
                  />,
                );
              }
              dimSide(lane(34) + 14, C.y, Y(props.ybar + k), say(spec.gyration));
            }
          }

          // ── Steel shear: the web shaded ──
          const web =
            spec.web && shape === 'wide' && known(spec.web) ? (
              <G>
                <Rect
                  x={X((sizes.bf! - sizes.tw!) / 2)}
                  y={Y(sizes.d!)}
                  width={sizes.tw! * s}
                  height={sizes.d! * s}
                  fill={c.sectionShear}
                  opacity={0.55}
                />
                <Lbl
                  x={X(sizes.bf! / 2 + sizes.tw! / 2) + 6}
                  y={Y(sizes.d! / 2) + 4}
                  text={say(spec.web)!}
                  anchor="start"
                  color={c.sectionShear}
                  w={w}
                />
              </G>
            ) : null;

          // ── Thin-walled: A_m shaded and the shear flow round the wall ──
          const flow = spec.thinWalled ? thinWalledFlow() : null;
          function thinWalledFlow() {
            const t = sizes.t ?? 0;
            const color = c.sectionShear;
            const items: ReactNode[] = [];
            let mid: { cx: number; cy: number; r?: number; x0?: number; y0?: number };
            if (shape === 'box') {
              const [x0, x1, y0, y1] = [
                X(t / 2),
                X((sizes.b ?? 0) + t / 2),
                Y(t / 2),
                Y((sizes.h ?? 0) + t / 2),
              ];
              items.push(
                <Rect
                  key="am"
                  x={x0}
                  y={y1}
                  width={x1 - x0}
                  height={y0 - y1}
                  fill={c.sectionEnclosed}
                />,
              );
              mid = { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
              if (has(spec.q)) {
                // Counterclockwise round the cell: along the bottom to the right, up the right…
                const runs: [Pt, Pt][] = [
                  [
                    { x: x0, y: y0 },
                    { x: x1, y: y0 },
                  ],
                  [
                    { x: x1, y: y0 },
                    { x: x1, y: y1 },
                  ],
                  [
                    { x: x1, y: y1 },
                    { x: x0, y: y1 },
                  ],
                  [
                    { x: x0, y: y1 },
                    { x: x0, y: y0 },
                  ],
                ];
                runs.forEach(([a, b], i) => {
                  for (const f of [0.3, 0.7]) {
                    const p = { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
                    const L = Math.hypot(b.x - a.x, b.y - a.y) || 1;
                    const [ux, uy] = [(b.x - a.x) / L, (b.y - a.y) / L];
                    items.push(
                      <Vec
                        key={`q${i}${f}`}
                        x1={p.x - ux * 9}
                        y1={p.y - uy * 9}
                        x2={p.x + ux * 9}
                        y2={p.y + uy * 9}
                        color={color}
                        width={2.5}
                        head={8}
                      />,
                    );
                  }
                });
                note((x0 + x1) / 2, y1 - 10, say(spec.q), 'middle');
              }
            } else {
              const R = ((sizes.d ?? 0) - t) / 2;
              const cx = X((sizes.d ?? 0) / 2);
              const cy = Y((sizes.d ?? 0) / 2);
              items.push(<Circle key="am" cx={cx} cy={cy} r={R * s} fill={c.sectionEnclosed} />);
              mid = { cx, cy };
              if (has(spec.q))
                for (let i = 0; i < 8; i++) {
                  const a = (i * Math.PI) / 4;
                  const p = { x: cx + R * s * Math.cos(a), y: cy - R * s * Math.sin(a) };
                  const [ux, uy] = [-Math.sin(a), -Math.cos(a)];
                  items.push(
                    <Vec
                      key={`q${i}`}
                      x1={p.x - ux * 8}
                      y1={p.y - uy * 8}
                      x2={p.x + ux * 8}
                      y2={p.y + uy * 8}
                      color={color}
                      width={2.5}
                      head={8}
                    />,
                  );
                }
              if (has(spec.q)) note(cx, Y(sizes.d ?? 0) - 10, say(spec.q), 'middle');
            }
            const am = say(spec.area);
            if (am)
              items.push(
                <Lbl key="aml" x={mid.cx} y={mid.cy - 4} text={am} w={w} color={c.chartInk} />,
              );
            const T = say(spec.torque, 'T');
            if (T) {
              items.push(
                <CurvedArrow
                  key="t"
                  cx={mid.cx}
                  cy={mid.cy + 14}
                  r={12}
                  from={-0.6 * Math.PI}
                  to={1.1 * Math.PI}
                  color={c.chartInk}
                  width={2}
                  head={7}
                />,
              );
              items.push(
                <Lbl key="tl" x={mid.cx} y={mid.cy + 44} text={T} w={w} color={c.chartInk} />,
              );
            }
            return <G>{items}</G>;
          }

          // ── Hoop: pressure inside the ring ──
          const pressure =
            shape === 'cylinder' && spec.stress === 'hoop' && has(spec.load) ? (
              <G>
                {Array.from({ length: 8 }, (_, i) => {
                  const a = (i * Math.PI) / 4 + Math.PI / 8;
                  const cx = X((sizes.r ?? 0) + (sizes.t ?? 0));
                  const cy = Y((sizes.r ?? 0) + (sizes.t ?? 0));
                  const R = (sizes.r ?? 0) * s;
                  return (
                    <Vec
                      key={i}
                      x1={cx + R * 0.45 * Math.cos(a)}
                      y1={cy - R * 0.45 * Math.sin(a)}
                      x2={cx + (R - 3) * Math.cos(a)}
                      y2={cy - (R - 3) * Math.sin(a)}
                      color={c.physMinus}
                      width={2}
                      head={7}
                    />
                  );
                })}
                <Lbl
                  x={X((sizes.r ?? 0) + (sizes.t ?? 0))}
                  y={Y((sizes.r ?? 0) + (sizes.t ?? 0)) - 12}
                  text={say(spec.load)!}
                  w={w}
                  color={c.physMinus}
                />
              </G>
            ) : null;

          // ── Torsion: τ along a radius on the section ──
          const twist =
            spec.stress === 'torsion' && has(spec.edge) && (shape === 'circle' || shape === 'tube')
              ? torsionArrows()
              : null;
          function torsionArrows() {
            const R = (sizes.d ?? 0) / 2;
            const ri = (sizes.di ?? 0) / 2;
            const cx = X(R);
            const cy = Y(R);
            const items: ReactNode[] = [];
            for (let i = 1; i <= 4; i++) {
              const r = (R * i) / 4;
              if (r < ri - 1e-12) continue;
              const L = 22 * (r / R);
              for (const sgn of [1, -1]) {
                const y = cy - sgn * r * s;
                items.push(
                  <Vec
                    key={`${i}${sgn}`}
                    x1={cx}
                    y1={y}
                    x2={cx - sgn * L}
                    y2={y}
                    color={c.sectionShear}
                    width={2}
                    head={6}
                  />,
                );
              }
            }
            return <G>{items}</G>;
          }

          // ── The block beside the section ──
          const dx0 = side === 'whitney' ? w * 0.46 : w * 0.58;
          const dx1 = w - 10;
          const blockEl = side ? sideBlock() : null;
          function sideBlock(): ReactNode {
            const yTop = built!.height;
            const ax = (dx0 + dx1) / 2;
            const half = (dx1 - dx0) / 2 - 6;
            const items: ReactNode[] = [];
            const axis = (x: number, y1: number, y2: number) => (
              <Line
                key={`ax${x}`}
                x1={x}
                y1={y1}
                x2={x}
                y2={y2}
                stroke={c.chartInk}
                strokeWidth={1.5}
              />
            );
            const edgeText = say(spec.edge);
            const ybar = props!.ybar;
            switch (side) {
              case 'bending':
              case 'plastic': {
                items.push(axis(ax, Y(yTop) - 6, Y(0) + 6));
                const cTop = yTop - ybar;
                const cBot = ybar;
                const cMax = Math.max(cTop, cBot);
                items.push(
                  <Line
                    key="na"
                    x1={right + 4}
                    y1={Y(ybar)}
                    x2={dx1}
                    y2={Y(ybar)}
                    stroke={c.chartMuted}
                    strokeDasharray={chart.dash}
                  />,
                );
                if (!edgeText) break;
                if (side === 'bending') {
                  const wt = (half * cTop) / cMax;
                  const wb = (half * cBot) / cMax;
                  items.push(
                    <Path
                      key="cb"
                      d={`M ${ax} ${Y(yTop)} L ${ax - wt} ${Y(yTop)} L ${ax} ${Y(ybar)} Z`}
                      fill={c.sectionCompression}
                      fillOpacity={0.28}
                      stroke={c.sectionCompression}
                      strokeWidth={2}
                    />,
                    <Path
                      key="tb"
                      d={`M ${ax} ${Y(0)} L ${ax + wb} ${Y(0)} L ${ax} ${Y(ybar)} Z`}
                      fill={c.sectionTension}
                      fillOpacity={0.28}
                      stroke={c.sectionTension}
                      strokeWidth={2}
                    />,
                  );
                  items.push(
                    <Letter
                      key="C"
                      x={ax - wt / 3}
                      y={Y(yTop - cTop / 3) + 5}
                      text="C"
                      color={c.sectionCompression}
                    />,
                    <Letter
                      key="T"
                      x={ax + wb / 3}
                      y={Y(cBot / 3) + 5}
                      text="T"
                      color={c.sectionTension}
                    />,
                  );
                  const sameBoth = Math.abs(cTop - cBot) < 1e-9 * cMax;
                  if (cTop >= cBot || sameBoth)
                    items.push(
                      <Lbl
                        key="et"
                        x={ax - wt}
                        y={Y(yTop) - 8}
                        text={edgeText}
                        w={w}
                        anchor="middle"
                        color={c.sectionCompression}
                      />,
                    );
                  if (cBot > cTop || sameBoth)
                    items.push(
                      <Lbl
                        key="eb"
                        x={ax + wb}
                        y={Y(0) + 18}
                        text={edgeText}
                        w={w}
                        anchor="middle"
                        color={c.sectionTension}
                      />,
                    );
                } else {
                  const yp = plasticAxis(built!.parts, yTop);
                  items.push(
                    <Rect
                      key="cp"
                      x={ax - half}
                      y={Y(yTop)}
                      width={half}
                      height={Y(yp) - Y(yTop)}
                      fill={c.sectionCompression}
                      fillOpacity={0.28}
                      stroke={c.sectionCompression}
                      strokeWidth={2}
                    />,
                    <Rect
                      key="tp"
                      x={ax}
                      y={Y(yp)}
                      width={half}
                      height={Y(0) - Y(yp)}
                      fill={c.sectionTension}
                      fillOpacity={0.28}
                      stroke={c.sectionTension}
                      strokeWidth={2}
                    />,
                    // The elastic block at first yield, dashed, for comparison.
                    <Path
                      key="el"
                      d={`M ${ax - (half * cTop) / cMax} ${Y(yTop)} L ${ax + (half * cBot) / cMax} ${Y(0)}`}
                      stroke={c.chartInk}
                      strokeDasharray={chart.dash}
                      strokeWidth={1.5}
                    />,
                    <Letter
                      key="C"
                      x={ax - half / 2}
                      y={Y((yTop + yp) / 2) + 5}
                      text="C"
                      color={c.sectionCompression}
                    />,
                    <Letter
                      key="T"
                      x={ax + half / 2}
                      y={Y(yp / 2) + 5}
                      text="T"
                      color={c.sectionTension}
                    />,
                    <Lbl
                      key="et"
                      x={ax - half / 2}
                      y={Y(yTop) - 8}
                      text={edgeText}
                      w={w}
                      color={c.sectionCompression}
                    />,
                    <Lbl
                      key="eb"
                      x={ax + half / 2}
                      y={Y(0) + 18}
                      text={edgeText}
                      w={w}
                      color={c.sectionTension}
                    />,
                  );
                }
                break;
              }
              case 'shear': {
                items.push(axis(dx0 + 10, Y(yTop) - 6, Y(0) + 6));
                if (!edgeText) break;
                const n = 120;
                const pts: { y: number; tau: number }[] = [];
                for (let i = 0; i <= n; i++) {
                  const y = (yTop * i) / n;
                  const bw = widthAt(built!.parts, y);
                  const q = firstMoment(built!.parts, y, ybar);
                  pts.push({ y, tau: bw > 1e-12 ? q / bw : 0 });
                }
                // Sample just inside each change of width too (a flange meeting the web).
                const peak = Math.max(...pts.map((p) => p.tau), 1e-300);
                const W = dx1 - dx0 - 24;
                const d = [
                  `M ${dx0 + 10} ${Y(0)}`,
                  ...pts.map((p) => `L ${dx0 + 10 + (W * p.tau) / peak} ${Y(p.y)}`),
                  `L ${dx0 + 10} ${Y(yTop)} Z`,
                ].join(' ');
                items.push(
                  <Path
                    key="tau"
                    d={d}
                    fill={c.sectionShear}
                    fillOpacity={0.25}
                    stroke={c.sectionShear}
                    strokeWidth={2}
                  />,
                );
                const at = pts.reduce((a, p) => (p.tau > a.tau ? p : a));
                items.push(
                  <Lbl
                    key="tm"
                    x={dx1}
                    y={Y(at.y) - 8}
                    text={edgeText}
                    anchor="end"
                    w={w}
                    color={c.sectionShear}
                  />,
                );
                break;
              }
              case 'torsion': {
                const R = (sizes.d ?? 0) / 2;
                const ri = (sizes.di ?? 0) / 2;
                items.push(axis(ax, Y(2 * R) - 6, Y(0) + 6));
                if (!edgeText) break;
                // τ grows with r: zero at the center, τ_max at the surface, none in the bore.
                const at = (r: number) => (half * r) / R;
                items.push(
                  <Path
                    key="tt"
                    d={`M ${ax} ${Y(2 * R)} L ${ax - at(R)} ${Y(2 * R)} L ${ax - at(ri)} ${Y(R + ri)} L ${ax} ${Y(R + ri)} Z`}
                    fill={c.sectionShear}
                    fillOpacity={0.28}
                    stroke={c.sectionShear}
                    strokeWidth={2}
                  />,
                  <Path
                    key="tb"
                    d={`M ${ax} ${Y(0)} L ${ax + at(R)} ${Y(0)} L ${ax + at(ri)} ${Y(R - ri)} L ${ax} ${Y(R - ri)} Z`}
                    fill={c.sectionShear}
                    fillOpacity={0.28}
                    stroke={c.sectionShear}
                    strokeWidth={2}
                  />,
                  <Line
                    key="th"
                    x1={ax - at(ri)}
                    y1={Y(R + ri)}
                    x2={ax + at(ri)}
                    y2={Y(R - ri)}
                    stroke={c.chartMuted}
                    strokeDasharray={chart.dash}
                  />,
                  <Lbl
                    key="tl"
                    x={ax - at(R)}
                    y={Y(2 * R) - 8}
                    text={edgeText}
                    w={w}
                    color={c.sectionShear}
                  />,
                );
                break;
              }
              case 'hoop': {
                if (spec.thick) {
                  const ri = sizes.r ?? 0;
                  const ro = ri + (sizes.t ?? 0);
                  const [cx0, cx1] = [dx0 + 6, dx1 - 6];
                  const [cy0, cy1] = [Y(yTop) + 16, Y(0) - 14];
                  items.push(
                    <Line
                      key="xa"
                      x1={cx0}
                      y1={cy1}
                      x2={cx1}
                      y2={cy1}
                      stroke={c.chartInk}
                      strokeWidth={1.5}
                    />,
                    <Line
                      key="ya"
                      x1={cx0}
                      y1={cy0}
                      x2={cx0}
                      y2={cy1}
                      stroke={c.chartInk}
                      strokeWidth={1.5}
                    />,
                  );
                  note(cx0, cy1 + 16, 'r_i', 'start');
                  note(cx1, cy1 + 16, 'r_o', 'end');
                  if (!edgeText || !(ro > ri)) break;
                  const peak = lameHoop(1, ri, ro, ri);
                  const sx = (r: number) => cx0 + ((r - ri) / (ro - ri)) * (cx1 - cx0);
                  const sy = (sig: number) => cy1 - (sig / peak) * (cy1 - cy0);
                  const pts = Array.from({ length: 41 }, (_, i) => ri + ((ro - ri) * i) / 40);
                  items.push(
                    <Path
                      key="lame"
                      d={pts
                        .map((r, i) => `${i ? 'L' : 'M'} ${sx(r)} ${sy(lameHoop(1, ri, ro, r))}`)
                        .join(' ')}
                      stroke={c.sectionTension}
                      strokeWidth={2.5}
                      fill="none"
                    />,
                    <Lbl
                      key="lb"
                      x={sx(ri) + 4}
                      y={sy(peak) - 6}
                      text={edgeText}
                      anchor="start"
                      w={w}
                      color={c.sectionTension}
                    />,
                  );
                  // The thin-wall estimate p r_m ÷ t, dashed, as a share of the bore's value.
                  const thin = (ri + ro) / 2 / (ro - ri) / peak;
                  if (has(spec.load))
                    items.push(
                      <Line
                        key="thin"
                        x1={cx0}
                        y1={sy(thin * peak)}
                        x2={cx1}
                        y2={sy(thin * peak)}
                        stroke={c.chartMuted}
                        strokeDasharray={chart.dash}
                      />,
                      <Lbl
                        key="thinl"
                        x={cx1}
                        y={sy(thin * peak) + 16}
                        text="thin-wall pr ÷ t"
                        anchor="end"
                        w={w}
                        color={c.chartMuted}
                      />,
                    );
                  break;
                }
                // A skin element: σ_h round the cylinder, σ_a along it, each as long as its size.
                const cxE = (dx0 + dx1) / 2;
                const cyE = (Y(yTop) + Y(0)) / 2;
                const half2 = 26;
                items.push(
                  <Rect
                    key="el"
                    x={cxE - half2}
                    y={cyE - half2}
                    width={2 * half2}
                    height={2 * half2}
                    fill={c.metal}
                    stroke={c.metalDark}
                    strokeWidth={1.5}
                  />,
                  <Rect
                    key="ell"
                    x={cxE - half2}
                    y={cyE - half2}
                    width={2 * half2}
                    height={2 * half2}
                    fill={url(paint.light)}
                  />,
                );
                const sh = has(spec.edge) ? v(spec.edge!) : undefined;
                const sa = spec.axial && known(spec.axial) ? v(spec.axial) : undefined;
                const big = Math.max(sh ?? 0, sa ?? 0, 1e-300);
                const L = (x: number) => 10 + 30 * (x / big);
                if (sh !== undefined && edgeText) {
                  for (const sgn of [1, -1])
                    items.push(
                      <Vec
                        key={`h${sgn}`}
                        x1={cxE + sgn * half2}
                        y1={cyE}
                        x2={cxE + sgn * (half2 + L(sh))}
                        y2={cyE}
                        color={c.sectionTension}
                        width={3}
                      />,
                    );
                  items.push(
                    <Lbl
                      key="hl"
                      x={cxE}
                      y={cyE + half2 + 18}
                      text={edgeText}
                      w={w}
                      color={c.sectionTension}
                    />,
                  );
                }
                if (sa !== undefined) {
                  for (const sgn of [1, -1])
                    items.push(
                      <Vec
                        key={`a${sgn}`}
                        x1={cxE}
                        y1={cyE + sgn * half2}
                        x2={cxE}
                        y2={cyE + sgn * (half2 + L(sa))}
                        color={c.sectionTension}
                        width={3}
                        dash="6 4"
                      />,
                    );
                  items.push(
                    <Lbl
                      key="al"
                      x={cxE}
                      y={cyE - half2 - L(sa) - 6}
                      text={say(spec.axial)!}
                      w={w}
                      color={c.sectionTension}
                    />,
                  );
                }
                break;
              }
              case 'whitney':
                return whitneyBlock();
            }
            return <G>{items}</G>;
          }

          function whitneyBlock(): ReactNode {
            const H = built!.height;
            const d = sizes.d ?? H;
            const items: ReactNode[] = [];
            // Strain: zero line, 0.003 at the top, ε_t at the bars, crossing zero at c.
            const sx0w = dx0;
            const sx1w = w * 0.7;
            const zx = sx0w + (sx1w - sx0w) * 0.45;
            items.push(
              <Line
                key="sz"
                x1={zx}
                y1={Y(H) - 4}
                x2={zx}
                y2={Y(0) + 4}
                stroke={c.chartInk}
                strokeWidth={1.5}
              />,
              <Line
                key="sd"
                x1={right + 2}
                y1={Y(H - d)}
                x2={dx1}
                y2={Y(H - d)}
                stroke={c.chartMuted}
                strokeDasharray={chart.dashFine}
              />,
            );
            const cv = spec.c && known(spec.c) ? len(spec.c)! : undefined;
            const et = spec.epsT && known(spec.epsT) ? v(spec.epsT) : undefined;
            if (cv !== undefined && cv > 0) {
              const ecu = 0.003;
              const tension = et ?? (ecu * (d - cv)) / cv;
              const kx = Math.min((zx - sx0w - 2) / ecu, (sx1w - zx - 4) / Math.max(tension, 1e-9));
              const topX = zx - ecu * kx;
              const barX = zx + (ecu * (d - cv) * kx) / cv;
              items.push(
                <Path
                  key="sc"
                  d={`M ${zx} ${Y(H)} L ${topX} ${Y(H)} L ${zx} ${Y(H - cv)} Z`}
                  fill={c.sectionCompression}
                  fillOpacity={0.28}
                  stroke={c.sectionCompression}
                  strokeWidth={2}
                />,
                <Lbl
                  key="s3"
                  x={topX}
                  y={Y(H) - 8}
                  text="0.003"
                  anchor="middle"
                  w={w}
                  color={c.sectionCompression}
                />,
                <Line
                  key="nax"
                  x1={left - 4}
                  y1={Y(H - cv)}
                  x2={sx1w}
                  y2={Y(H - cv)}
                  stroke={c.chartHighlight}
                  strokeDasharray="8 3 2 3"
                  strokeWidth={1.5}
                />,
              );
              if (et !== undefined)
                items.push(
                  <Path
                    key="st"
                    d={`M ${zx} ${Y(H - cv)} L ${barX} ${Y(H - d)} L ${zx} ${Y(H - d)} Z`}
                    fill={c.sectionTension}
                    fillOpacity={0.28}
                    stroke={c.sectionTension}
                    strokeWidth={2}
                  />,
                  <Lbl
                    key="sl"
                    x={barX}
                    y={Y(H - d) + 18}
                    text={say(spec.epsT)!}
                    anchor="middle"
                    w={w}
                    color={c.sectionTension}
                  />,
                );
              items.push(
                <Dim
                  key="cd"
                  a={{ x: sx0w + 4, y: Y(H) }}
                  b={{ x: sx0w + 4, y: Y(H - cv) }}
                  color={c.chartHighlight}
                />,
              );
              note(sx0w + 9, (Y(H) + Y(H - cv)) / 2 + 4, 'c', 'start');
            }
            // Stress: the 0.85f′_c block of depth a, C at a ÷ 2 and T at the bars.
            const bx1 = dx1 - 4;
            const bw = Math.min(34, (bx1 - sx1w) * 0.45);
            const bx = bx1 - bw - 22;
            items.push(
              <Line
                key="bz"
                x1={bx + bw}
                y1={Y(H) - 4}
                x2={bx + bw}
                y2={Y(0) + 4}
                stroke={c.chartInk}
                strokeWidth={1.5}
              />,
            );
            const av = spec.a && known(spec.a) ? len(spec.a)! : undefined;
            if (av !== undefined && av > 0) {
              items.push(
                <Rect
                  key="blk"
                  x={bx}
                  y={Y(H)}
                  width={bw}
                  height={av * s}
                  fill={c.sectionCompression}
                  fillOpacity={0.28}
                  stroke={c.sectionCompression}
                  strokeWidth={2}
                />,
                <Lbl
                  key="fc"
                  x={bx + bw / 2}
                  y={Y(H) - 8}
                  text="0.85f′_c"
                  anchor="middle"
                  w={w}
                  color={c.sectionCompression}
                />,
                <Vec
                  key="C"
                  x1={bx + bw + 18}
                  y1={Y(H - av / 2)}
                  x2={bx - 4}
                  y2={Y(H - av / 2)}
                  color={c.sectionCompression}
                  width={2.5}
                />,
                <Letter
                  key="Cl"
                  x={bx + bw + 14}
                  y={Y(H - av / 2) - 6}
                  text="C"
                  color={c.sectionCompression}
                />,
              );
              items.push(
                <Dim
                  key="ad"
                  a={{ x: bx1, y: Y(H) }}
                  b={{ x: bx1, y: Y(H - av) }}
                  color={c.sectionCompression}
                />,
              );
              note(bx1 - 5, (Y(H) + Y(H - av)) / 2 + 4, 'a', 'end');
            }
            if (layout && layout.bars.length)
              items.push(
                <Vec
                  key="T"
                  x1={bx}
                  y1={Y(H - d)}
                  x2={bx + bw + 18}
                  y2={Y(H - d)}
                  color={c.sectionTension}
                  width={2.5}
                />,
                <Letter key="Tl" x={bx + 2} y={Y(H - d) - 6} text="T" color={c.sectionTension} />,
              );
            return <G>{items}</G>;
          }

          return (
            <Svg width={w} height={h}>
              <Defs>
                <LinearGradient id={paint.steel} x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0" stopColor={c.metal} />
                  <Stop offset="0.55" stopColor={c.metal} />
                  <Stop offset="1" stopColor={c.metalDark} />
                </LinearGradient>
                <TopLight id={paint.light} />
                <BarPaint id={paint.bar} />
              </Defs>
              <G opacity={sizesKnown && !why ? 1 : 0.4}>
                {material}
                {web}
                {bars}
                {flow}
                {pressure}
                {twist}
              </G>
              {marks}
              {dims}
              {blockEl}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>{captionLines().join(' · ')}</Caption>
    </View>
  );

  /** Lines under the picture: the worked rule for what is drawn, with its numbers once known. */
  function captionLines(): string[] {
    const out: string[] = [];
    if (!built || !props) return ['Type the sizes to draw the section.'];
    if (why) out.push(`Can’t draw this section to scale: ${why}.`);
    else if (!sizesKnown) out.push('Type every size to draw the section to scale.');
    if (spec.centroid?.y && centroidShown && !why) {
      const Ay = props.area * props.ybar;
      out.push(
        ...worked(
          sizesKnown,
          `ȳ = ΣAy ÷ ΣA = ${num(Ay, 4)} ÷ ${num(props.area, 4)} = ${valueOf(spec.centroid.y)}`,
        ),
      );
    }
    if (spec.centroid?.x && centroidShown && !why) {
      const Ax = props.area * props.xbar;
      out.push(
        ...worked(
          sizesKnown,
          `x̄ = ΣAx ÷ ΣA = ${num(Ax, 4)} ÷ ${num(props.area, 4)} = ${valueOf(spec.centroid.x)}`,
        ),
      );
    }
    if (spec.area && known(spec.area) && !spec.thinWalled && !rc) out.push(say(spec.area)!);
    if (spec.inertia && known(spec.inertia))
      out.push(`${say(spec.inertia)} about the centroidal axis`);
    if (spec.axis?.inertia && known(spec.axis.inertia))
      out.push(
        `About x′: ${rep.variable(spec.axis.inertia).symbol} = Ī + Ad² = ${rep.value(spec.axis.inertia)}`,
      );
    if (spec.polar && known(spec.polar)) out.push(`${say(spec.polar)}, about the center`);
    if (spec.gyration && known(spec.gyration))
      out.push(`k = √(I ÷ A): the area’s spread from the axis`);
    switch (spec.stress) {
      case 'bending':
        out.push(
          'σ = Mc ÷ I: zero at the neutral axis through the centroid, largest at the far edge.',
        );
        break;
      case 'shear':
        out.push('τ = VQ ÷ (It): largest at the neutral axis, zero at the top and bottom.');
        break;
      case 'plastic':
        out.push(
          'Fully plastic: σ_Y everywhere, split where the areas above and below are equal; first yield dashed.',
        );
        break;
      case 'torsion':
        out.push('τ = Tr ÷ J grows from the center to τ_max at the surface.');
        break;
      case 'hoop':
        out.push(
          spec.thick
            ? 'Lamé: the hoop stress is largest at the bore and falls across the wall.'
            : 'Hoop stress σ_h = pr ÷ t round the wall is twice the axial σ_a = pr ÷ (2t).',
        );
        break;
    }
    if (thinNote()) out.push(thinNote()!);
    if (rc && barCount > 0 && (!spec.bars || has(spec.bars))) {
      const steel = spec.steel && known(spec.steel) ? `, ${say(spec.steel)}` : '';
      const each =
        barNo !== undefined && has(spec.barSize)
          ? ` #${Math.round(barNo)}`
          : has(spec.barArea)
            ? ` of ${valueOf(spec.barArea)}`
            : '';
      out.push(`${barCount} bars${each}${steel}.`);
    }
    if (spec.stirrup && known(spec.stirrup)) out.push(`Stirrup, two legs: ${say(spec.stirrup)}.`);
    if (hDerived) out.push('h drawn as d plus half a bar, the stirrup and the cover.');
    if (spec.whitney) {
      // The depths are short beside the section: their values are written here.
      const depths = [say(spec.c), say(spec.a)].filter(Boolean).join(', ');
      if (depths) out.push(depths);
      out.push('a = β₁c, and the strain line crosses zero at c.');
    }
    if (spec.thinWalled) out.push('q = T ÷ (2A_m) is the same all round one closed cell.');
    return out;
  }

  function thinNote(): string | undefined {
    if (!built || (shape !== 'box' && shape !== 'cylinder')) return undefined;
    const t = sizes.t ?? 0;
    const across = shape === 'box' ? Math.min(sizes.b ?? 0, sizes.h ?? 0) : (sizes.r ?? 0);
    // Under about 1% of the section the wall is thinner than a line: drawn thicker, said.
    return t > 0 && t / across < 0.012
      ? `Wall drawn thicker than to scale (${shape === 'box' ? 'b' : 'r'} ÷ t = ${num(across / t)}).`
      : undefined;
  }
}

// ─── Pieces ──────────────────────────────────────────────────────────────────

type Anchor = 'start' | 'middle' | 'end';

const partCenterX = (p: Part) => (p.kind === 'rect' ? p.x + p.w / 2 : p.cx);
const partCenterY = (p: Part) => (p.kind === 'rect' ? p.y + p.h / 2 : p.cy);

/** The section's outline as one path (holes as inner loops, even-odd). */
function outlinePath(
  shape: SectionSpec['shape'],
  z: Sizes,
  built: { width: number; height: number; parts: Part[] },
  X: (x: number) => number,
  Y: (y: number) => number,
  s: number,
): string {
  const poly = (pts: [number, number][]) =>
    `${pts.map(([x, y], i) => `${i ? 'L' : 'M'} ${X(x)} ${Y(y)}`).join(' ')} Z`;
  const circle = (cx: number, cy: number, r: number) =>
    `M ${X(cx) - r * s} ${Y(cy)} a ${r * s} ${r * s} 0 1 0 ${2 * r * s} 0 a ${r * s} ${r * s} 0 1 0 ${-2 * r * s} 0 Z`;
  switch (shape) {
    case 'tee': {
      const { bf = 0, tf = 0, tw = 0, hw = 0 } = z;
      const [a, b] = [(bf - tw) / 2, (bf + tw) / 2];
      return poly([
        [a, 0],
        [b, 0],
        [b, hw],
        [bf, hw],
        [bf, hw + tf],
        [0, hw + tf],
        [0, hw],
        [a, hw],
      ]);
    }
    case 'wide': {
      const { d = 0, bf = 0, tf = 0, tw = 0 } = z;
      const [a, b] = [(bf - tw) / 2, (bf + tw) / 2];
      return poly([
        [0, 0],
        [bf, 0],
        [bf, tf],
        [b, tf],
        [b, d - tf],
        [bf, d - tf],
        [bf, d],
        [0, d],
        [0, d - tf],
        [a, d - tf],
        [a, tf],
        [0, tf],
      ]);
    }
    case 'angle': {
      const { b = 0, h = 0, t = 0 } = z;
      return poly([
        [0, 0],
        [b, 0],
        [b, t],
        [t, t],
        [t, h],
        [0, h],
      ]);
    }
    default:
      return built.parts
        .map((p) =>
          p.kind === 'rect'
            ? poly([
                [p.x, p.y],
                [p.x + p.w, p.y],
                [p.x + p.w, p.y + p.h],
                [p.x, p.y + p.h],
              ])
            : circle(p.cx, p.cy, p.r),
        )
        .join(' ');
  }
}

/** A wall thinner than a line: drawn along its mid-line, 3 px wide. */
function thinWallStroke(
  shape: SectionSpec['shape'],
  z: Sizes,
  X: (x: number) => number,
  Y: (y: number) => number,
  s: number,
  fill: string,
  edge: string,
) {
  const t = z.t ?? 0;
  if (shape === 'box') {
    const [x0, x1, y0, y1] = [X(t / 2), X((z.b ?? 0) + t / 2), Y(t / 2), Y((z.h ?? 0) + t / 2)];
    return (
      <G>
        <Rect
          x={x0}
          y={y1}
          width={x1 - x0}
          height={y0 - y1}
          fill="none"
          stroke={edge}
          strokeWidth={5}
        />
        <Rect
          x={x0}
          y={y1}
          width={x1 - x0}
          height={y0 - y1}
          fill="none"
          stroke={fill}
          strokeWidth={3}
        />
      </G>
    );
  }
  const R = (z.r ?? 0) + t / 2;
  const c = (z.r ?? 0) + t;
  return (
    <G>
      <Circle cx={X(c)} cy={Y(c)} r={R * s} fill="none" stroke={edge} strokeWidth={5} />
      <Circle cx={X(c)} cy={Y(c)} r={R * s} fill="none" stroke={fill} strokeWidth={3} />
    </G>
  );
}

/** Concrete's aggregate: small stones scattered evenly (a fixed pattern), never on the bars. */
function aggregate(
  built: { width: number; height: number },
  X: (x: number) => number,
  Y: (y: number) => number,
  s: number,
  color: string,
) {
  const n = Math.round(Math.min(90, (built.width * built.height * s * s) / 260));
  const golden = 0.6180339887;
  return (
    <G opacity={0.55}>
      {Array.from({ length: n }, (_, i) => {
        const fx = (i * golden) % 1;
        const fy = ((i * 0.7548776662 + 0.31) % 1) * 0.94 + 0.03;
        const r = 1 + ((i * 37) % 7) * 0.25;
        return (
          <Circle
            key={i}
            cx={X(built.width * (0.03 + fx * 0.94))}
            cy={Y(built.height * fy)}
            r={r}
            fill={color}
          />
        );
      })}
    </G>
  );
}

/** A dimension line with end ticks (`one`: a radius, a tick at the far end only). */
function Dim({ a, b, color, one }: { a: Pt; b: Pt; color?: string; one?: boolean }) {
  const c = usePalette();
  const col = color ?? c.chartInk;
  const L = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  const [ux, uy] = [(b.x - a.x) / L, (b.y - a.y) / L];
  const head = Math.min(7, L / 3);
  return (
    <G>
      <Line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={col} strokeWidth={1.2} />
      {one ? null : <Path d={arrowHead(a.x, a.y, -ux, -uy, head)} fill={col} />}
      <Path d={arrowHead(b.x, b.y, ux, uy, head)} fill={col} />
    </G>
  );
}

/** The centroid symbol: a circle with two opposite quarters filled. */
function CentroidMark({ x, y }: { x: number; y: number }) {
  const c = usePalette();
  const r = 7;
  return (
    <G>
      <Circle cx={x} cy={y} r={r} fill={c.card} stroke={c.chartHighlight} strokeWidth={1.8} />
      <Path
        d={`M ${x} ${y} L ${x + r} ${y} A ${r} ${r} 0 0 0 ${x} ${y - r} Z`}
        fill={c.chartHighlight}
      />
      <Path
        d={`M ${x} ${y} L ${x - r} ${y} A ${r} ${r} 0 0 0 ${x} ${y + r} Z`}
        fill={c.chartHighlight}
      />
    </G>
  );
}

/** A big letter in a block: C for compression, T for tension (not color alone). */
function Letter({ x, y, text, color }: { x: number; y: number; text: string; color: string }) {
  return (
    <Lbl x={x} y={y} text={text} color={color} size={chart.emphasis} chip={false} italic={false} />
  );
}

/** A rebar's round, lit from the top left. */
function BarPaint({ id }: { id: string }) {
  const c = usePalette();
  return (
    <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
      <Stop offset="0" stopColor={c.shine} stopOpacity={0.55} />
      <Stop offset="0.35" stopColor={c.sectionRebar} />
      <Stop offset="1" stopColor={c.sectionRebarDark} />
    </LinearGradient>
  );
}

/**
 * A label in college notation: the symbol before " = " in italics with its "_" subscripts
 * lowered, the value and unit upright; on a chip of the card color so it reads over lines.
 * `rotate` turns it to run up a vertical dimension.
 */
function Lbl({
  x,
  y,
  text,
  color,
  anchor = 'middle',
  size = chart.label,
  w,
  rotate,
  chip = true,
  italic = true,
}: {
  x: number;
  y: number;
  text: string;
  color?: string;
  anchor?: Anchor;
  size?: number;
  w?: number;
  rotate?: boolean;
  chip?: boolean;
  italic?: boolean;
}) {
  const c = usePalette();
  const eq = text.indexOf(' = ');
  const symbol = eq >= 0 ? text.slice(0, eq) : '';
  const rest = eq >= 0 ? text.slice(eq) : text;
  const runs = [
    ...subscriptRuns(symbol).map((r) => ({ ...r, it: italic })),
    ...subscriptRuns(rest).map((r) => ({ ...r, it: false })),
  ];
  const width = runs.reduce((n, r) => n + r.s.length * (r.sub ? 0.75 : 1), 0) * size * 0.58;
  let left = anchor === 'start' ? x : anchor === 'end' ? x - width : x - width / 2;
  if (w !== undefined && !rotate) left = Math.min(w - width - 4, Math.max(4, left));
  const drop = size * 0.3;
  const family = font.family ?? (Platform.OS === 'web' ? font.webSystem : undefined);
  const body = (
    <G>
      {chip ? (
        <Rect
          x={left - 3}
          y={y - size + 1}
          width={width + 6}
          height={size + 5}
          rx={3}
          fill={c.card}
          opacity={0.88}
        />
      ) : null}
      <SvgText
        x={left}
        y={y}
        fontFamily={family}
        fontSize={size}
        fontWeight="700"
        fill={color ?? c.chartInk}
      >
        {runs.map((r, i) => (
          <TSpan
            key={i}
            dy={r.sub ? drop : i > 0 && runs[i - 1]!.sub ? -drop : 0}
            fontSize={r.sub ? size * 0.75 : size}
            fontStyle={r.it && /\p{L}/u.test(r.s) ? 'italic' : 'normal'}
          >
            {r.s}
          </TSpan>
        ))}
      </SvgText>
    </G>
  );
  if (!rotate) return body;
  // Up a vertical dimension: centered on (x, y), reading bottom to top, left of the line.
  return <G transform={`rotate(-90 ${x} ${y})`}>{body}</G>;
}
