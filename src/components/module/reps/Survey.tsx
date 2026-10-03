/**
 * HC32 `survey` (SurveySpec in typesHe2i.ts): a traverse in plan, north up, with one course's
 * latitude and departure, the misclosure gap and its compass-rule correction; a closed polygon
 * and its interior angles; differential leveling with a level and rods on painted ground; one
 * long sight over the curved earth; and the terrain, geoid and ellipsoid with h, N and H.
 */
import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import type { NumOrVar } from '@/data/modules/typesGraphs';
import type { SurveySpec } from '@/data/modules/typesHe2i';
import { chart, usePalette, type Palette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Arrow, fmt, HeLabel } from './beamKit';
import { Canvas, Caption, useRep } from './common';
import { useValueLabel } from './he1fKit';
import { TopLight, usePaintIds } from './paint';
import { labelW, useLabels } from './SoilProfile';
import { closureOf, compassCorrection, latDep, levelRun, stations } from './surveyMath';

const BW = 358;
const NAMES = 'ABCDEFGHIJ';

/** The north arrow: a needle with N over it, at (x, y). */
function North({ x, y, c }: { x: number; y: number; c: Palette }) {
  return (
    <G>
      <Polygon
        points={`${x},${y - 16} ${x - 6},${y + 6} ${x},${y + 1} ${x + 6},${y + 6}`}
        fill={c.chartInk}
      />
      <HeLabel x={x} y={y - 20} text="N" chip={false} />
    </G>
  );
}

/** A leveling rod standing on (x, ground) `tall` px high: white with red and dark blocks. */
function Rod({ x, ground, tall, c }: { x: number; ground: number; tall: number; c: Palette }) {
  const w = 8;
  const n = Math.floor(tall / 10);
  return (
    <G>
      <Rect
        x={x - w / 2}
        y={ground - tall}
        width={w}
        height={tall}
        fill={c.card}
        stroke={c.chartInk}
        strokeWidth={1}
      />
      {Array.from({ length: n }, (_, k) =>
        k % 2 ? null : (
          <Rect
            key={k}
            x={x - w / 2}
            y={ground - (k + 1) * 10}
            width={w / 2}
            height={10}
            fill={k % 4 ? c.chartInk : c.surveyRodRed}
          />
        ),
      )}
    </G>
  );
}

/** A level on its tripod: feet on the ground at x, the telescope at y. */
function Level({
  x,
  y,
  ground,
  c,
  paint,
}: {
  x: number;
  y: number;
  ground: number;
  c: Palette;
  paint: string;
}) {
  return (
    <G>
      {[-12, 0, 12].map((d) => (
        <Line key={d} x1={x} y1={y + 6} x2={x + d} y2={ground} stroke={c.wood} strokeWidth={2.2} />
      ))}
      <Rect x={x - 12} y={y - 5} width={24} height={10} rx={3} fill={c.surveyInstrument} />
      <Rect x={x - 12} y={y - 5} width={24} height={10} rx={3} fill={`url(#${paint})`} />
      <Rect
        x={x - 16}
        y={y - 3}
        width={32}
        height={5}
        rx={2}
        fill={c.metal}
        stroke={c.metalDark}
        strokeWidth={0.8}
      />
    </G>
  );
}

export function Survey({ spec, calc }: { spec: SurveySpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const valueLabel = useValueLabel(calc);
  const paint = usePaintIds('light');
  const get = (x: NumOrVar | undefined) =>
    x === undefined ? undefined : typeof x === 'number' ? x : rep.known(x) ? rep.val(x) : undefined;
  /** "lat = 73.88 m": the page's value as shown (nothing while it is "?"), or worked out here. */
  const lab = (x: NumOrVar | undefined, sym: string, v: number | undefined, unit = '') =>
    typeof x === 'string'
      ? valueLabel(x)
      : v === undefined || !Number.isFinite(v)
        ? undefined
        : `${sym} = ${fmt(v)}${unit ? (unit === '°' || unit === '″' ? unit : ` ${unit}`) : ''}`;
  const L = useLabels();
  const body: ReactNode[] = [];
  const lines: { text: string; color?: string }[] = [];
  const caption: string[] = [];
  let BH = 240;

  if (spec.mode === 'traverse') {
    // ── A traverse in plan, north up ──
    const cs = spec.courses.map((k) => ({ azimuth: get(k.azimuth), length: get(k.length) }));
    if (cs.some((k) => k.azimuth === undefined || k.length === undefined || !(k.length > 0))) {
      caption.push('Type each course’s azimuth and length to draw the traverse.');
    } else {
      const courses = cs as { azimuth: number; length: number }[];
      const closed = courses.length > 2;
      const pts = stations(courses, closed);
      const sumLat = get(spec.closure?.sumLat);
      const sumDep = get(spec.closure?.sumDep);
      const P = courses.reduce((s, k) => s + k.length, 0);
      const gap = sumLat !== undefined && sumDep !== undefined && spec.closure;
      // Fit: east right, north up.
      const es = pts.map((p) => p[0]);
      const ns = pts.map((p) => p[1]);
      const [e0, e1, n0, n1] = [Math.min(...es), Math.max(...es), Math.min(...ns), Math.max(...ns)];
      const s = Math.min(230 / Math.max(e1 - e0, 1e-9), 200 / Math.max(n1 - n0, 1e-9));
      const ox = (BW - (e1 - e0) * s) / 2 - e0 * s + 10;
      const top = 64;
      const X = (e: number) => ox + e * s;
      const Y = (n: number) => top + (n1 - n) * s;
      body.push(<North key="north" x={30} y={46} c={c} />);
      // The courses (the last one ends at the measured end when a gap is drawn).
      const k = gap ? 30 / Math.max(Math.hypot(sumLat, sumDep), 1e-12) : 0;
      const end: [number, number] = gap
        ? [X(0) + sumDep * k, Y(0) - sumLat * k]
        : [X(pts[pts.length - 1]![0]), Y(pts[pts.length - 1]![1])];
      courses.forEach((_, i) => {
        const [a, b] = [pts[i]!, pts[i + 1]!];
        const last = i === courses.length - 1;
        body.push(
          <Line
            key={`c${i}`}
            x1={X(a[0])}
            y1={Y(a[1])}
            x2={last ? end[0] : X(b[0])}
            y2={last ? end[1] : Y(b[1])}
            stroke={i === spec.lit ? c.chartHighlight : c.chartInk}
            strokeWidth={i === spec.lit ? 3.2 : 2}
          />,
        );
      });
      // Stations, named outside the figure.
      const [cxm, cym] = [X((e0 + e1) / 2), Y((n0 + n1) / 2)];
      const named = closed ? pts.slice(0, -1) : pts;
      named.forEach((p, i) => {
        const [x, y] = [X(p[0]), Y(p[1])];
        body.push(
          <Circle
            key={`s${i}`}
            cx={x}
            cy={y}
            r={4}
            fill={c.card}
            stroke={c.chartInk}
            strokeWidth={1.6}
          />,
        );
        const d = Math.hypot(x - cxm, y - cym) || 1;
        const [dx, dy] = closed
          ? [(x - cxm) / d, (y - cym) / d]
          : (() => {
              // A single course: each end named beyond the line, away from the other end.
              const [o0, o1] = [pts[0]!, pts[pts.length - 1]!];
              const len = Math.hypot(o1[0] - o0[0], o1[1] - o0[1]) || 1;
              const [ue, un] = [(o1[0] - o0[0]) / len, (o1[1] - o0[1]) / len];
              return i === 0 ? [-ue, un] : [ue, -un];
            })();
        L.place(`n${i}`, [[x + dx * 16, y + dy * 16 + 4]], NAMES[i], c.chartInk, false);
      });
      const detail = spec.lat !== undefined || spec.dep !== undefined;
      if (spec.lit !== undefined && courses[spec.lit] && !detail) {
        const i = spec.lit;
        const [a, b] = [pts[i]!, pts[i + 1]!];
        const [mx, my] = [(X(a[0]) + X(b[0])) / 2, (Y(a[1]) + Y(b[1])) / 2];
        const Lt = lab(spec.courses[i]!.length, 'L', courses[i]!.length, 'm');
        const dd = Math.hypot(mx - cxm, my - cym) || 1;
        if (Lt)
          L.place(
            'L',
            [
              [mx + ((mx - cxm) / dd) * 22, my + ((my - cym) / dd) * 22 + 4],
              [mx - ((mx - cxm) / dd) * 22, my - ((my - cym) / dd) * 22 + 4],
            ],
            Lt,
            c.chartHighlight,
          );
      }
      if (spec.lit !== undefined && courses[spec.lit] && detail) {
        // The lit course: azimuth from north, then its north and east parts.
        const i = spec.lit;
        const course = courses[i]!;
        const [ax, ay] = [X(pts[i]![0]), Y(pts[i]![1])];
        const { lat, dep } = latDep(course.azimuth, course.length);
        const [bx, by] = [ax + dep * s, ay - lat * s];
        body.push(
          <Line
            key="nref"
            x1={ax}
            y1={ay}
            x2={ax}
            y2={ay - 46}
            stroke={c.chartMuted}
            strokeDasharray={chart.dashFine}
          />,
          <Line
            key="latleg"
            x1={ax}
            y1={ay}
            x2={ax}
            y2={by}
            stroke={c.surveyLat}
            strokeWidth={2}
            strokeDasharray={chart.dash}
          />,
          <Line
            key="depleg"
            x1={ax}
            y1={by}
            x2={bx}
            y2={by}
            stroke={c.surveyDep}
            strokeWidth={2}
            strokeDasharray={chart.dash}
          />,
        );
        const R = 26;
        const t = (course.azimuth * Math.PI) / 180;
        const large = course.azimuth % 360 > 180 ? 1 : 0;
        body.push(
          <Path
            key="az"
            d={`M ${ax} ${ay - R} A ${R} ${R} 0 ${large} 1 ${ax + R * Math.sin(t)} ${ay - R * Math.cos(t)}`}
            stroke={c.chartHighlight}
            strokeWidth={1.6}
            fill="none"
          />,
        );
        const azText = lab(spec.courses[i]!.azimuth, 'Az', course.azimuth, '°');
        const mid = t / 2;
        if (azText)
          L.place(
            'azl',
            [
              [ax - labelW(azText) / 2 - 8, ay - 34],
              [ax + labelW(azText) / 2 + 8, ay - 34],
              [ax + 40 * Math.sin(mid), ay - 40 * Math.cos(mid) + 4],
            ],
            azText,
            c.chartHighlight,
          );
        const latText = lab(spec.lat, 'lat', lat, 'm');
        const depText = lab(spec.dep, 'dep', dep, 'm');
        const side = dep >= 0 ? -1 : 1;
        if (latText)
          L.place(
            'lat',
            [[ax + side * (labelW(latText) / 2 + 6), (ay + by) / 2 + 4]],
            latText,
            c.surveyLat,
          );
        if (depText)
          L.place(
            'dep',
            [
              [(ax + bx) / 2, by + (lat >= 0 ? -8 : 18)],
              [(ax + bx) / 2, by + (lat >= 0 ? 18 : -8)],
            ],
            depText,
            c.surveyDep,
          );
        const Lt = lab(spec.courses[i]!.length, 'L', course.length, 'm');
        const [mx, my] = [(ax + bx) / 2, (ay + by) / 2];
        const len = Math.hypot(bx - ax, by - ay) || 1;
        let [nx, ny] = [(by - ay) / len, -(bx - ax) / len];
        // The side of the course away from the latitude leg.
        if (nx * (ax - mx) + ny * ((ay + by) / 2 - my) > 0) [nx, ny] = [-nx, -ny];
        if (Lt)
          L.place(
            'L',
            [
              [mx + nx * 18, my + ny * 18 + 4],
              [mx - nx * 18, my - ny * 18 + 4],
            ],
            Lt,
          );
        if (!gap)
          caption.push(
            `lat = L cos(Az) = ${fmt(course.length)} × cos ${fmt(course.azimuth)}° = ${fmt(lat)} m; dep = L sin(Az) = ${fmt(dep)} m.`,
            `lat² + dep² = L²: north and east are +, south and west −.`,
          );
      }
      if (gap) {
        // The gap: the measured end misses A by Σlat north and Σdep east, drawn ×k.
        const [ax, ay] = [X(0), Y(0)];
        body.push(
          <Line
            key="glat"
            x1={ax}
            y1={ay}
            x2={ax}
            y2={end[1]}
            stroke={c.surveyLat}
            strokeWidth={1.6}
            strokeDasharray={chart.dashFine}
          />,
          <Line
            key="gdep"
            x1={ax}
            y1={end[1]}
            x2={end[0]}
            y2={end[1]}
            stroke={c.surveyDep}
            strokeWidth={1.6}
            strokeDasharray={chart.dashFine}
          />,
          <Line
            key="gap"
            x1={ax}
            y1={ay}
            x2={end[0]}
            y2={end[1]}
            stroke={c.surveyGap}
            strokeWidth={2.4}
          />,
          <Circle key="end" cx={end[0]} cy={end[1]} r={4} fill={c.surveyGap} />,
        );
        const P0 = get(spec.closure!.P) ?? P;
        const cl = closureOf(sumLat, sumDep, P0);
        L.place(
          'e',
          [
            [(ax + end[0]) / 2 + 30, (ay + end[1]) / 2 + 16],
            [(ax + end[0]) / 2 - 30, (ay + end[1]) / 2 - 10],
          ],
          'e',
          c.surveyGap,
        );
        lines.push({
          text: [
            lab(spec.closure!.sumLat, 'Σlat', sumLat, 'm'),
            lab(spec.closure!.sumDep, 'Σdep', sumDep, 'm'),
          ]
            .filter(Boolean)
            .join('   '),
          color: c.chartInk,
        });
        const eText = lab(spec.closure!.e, 'e', cl.e, 'm');
        const pText = lab(spec.closure!.P, 'P', P0, 'm');
        lines.push({ text: [eText, pText].filter(Boolean).join('   '), color: c.surveyGap });
        caption.push(
          `e = √(Σlat² + Σdep²) = √(${fmt(sumLat)}² + ${fmt(sumDep)}²) = ${fmt(cl.e)} m; precision one part in P ÷ e = ${fmt(cl.precision)}.`,
          `The gap is drawn ${fmt(k / s)} times the traverse’s scale.`,
        );
        if (spec.compass && spec.lit !== undefined && courses[spec.lit]) {
          const Lc = courses[spec.lit]!.length;
          const cc = compassCorrection(sumLat, sumDep, Lc, P0);
          lines.push({
            text: [
              lab(spec.compass.cLat, 'c_lat', cc.cLat, 'm'),
              lab(spec.compass.cDep, 'c_dep', cc.cDep, 'm'),
            ]
              .filter(Boolean)
              .join('   '),
            color: c.chartHighlight,
          });
          caption.push(
            `Compass rule: the lit course takes L ÷ P = ${fmt(Lc)} ÷ ${fmt(P0)} of the gap, the other way: c = −Σ × L ÷ P.`,
          );
        }
      }
      BH = top + (n1 - n0) * s + 40;
    }
  } else if (spec.mode === 'angles') {
    // ── A closed traverse of n sides and its interior angles ──
    const n = get(spec.n);
    if (n === undefined || !Number.isInteger(n) || n < 3 || n > 10) {
      caption.push('Type the number of sides (3 to 10) to draw the polygon.');
    } else {
      const [cx, cy, R] = [BW / 2, 140, 96];
      const pts = Array.from({ length: n }, (_, k) => {
        // A little irregular, so it reads as a field traverse, not a regular figure.
        const a = -Math.PI / 2 + (2 * Math.PI * k) / n + 0.12 * Math.sin(k * 2.3);
        const r = R * (1 + 0.08 * Math.cos(k * 1.7));
        return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
      });
      body.push(
        <Polygon
          key="poly"
          points={pts.map((p) => p.join(',')).join(' ')}
          fill={c.surveyField}
          stroke={c.chartInk}
          strokeWidth={2}
        />,
      );
      const corr = get(spec.correction);
      pts.forEach(([x, y], k) => {
        const [px, py] = pts[(k + n - 1) % n]!;
        const [qx, qy] = pts[(k + 1) % n]!;
        const a1 = Math.atan2(py - y, px - x);
        const a2 = Math.atan2(qy - y, qx - x);
        const r = 16;
        // The interior arc from one side to the other, the short way round (inside a convex figure).
        let d = a2 - a1;
        while (d <= -Math.PI) d += 2 * Math.PI;
        while (d > Math.PI) d -= 2 * Math.PI;
        body.push(
          <Path
            key={`arc${k}`}
            d={`M ${x + r * Math.cos(a1)} ${y + r * Math.sin(a1)} A ${r} ${r} 0 0 ${d > 0 ? 1 : 0} ${x + r * Math.cos(a2)} ${y + r * Math.sin(a2)}`}
            stroke={c.chartHighlight}
            strokeWidth={1.6}
            fill="none"
          />,
          <Circle
            key={`v${k}`}
            cx={x}
            cy={y}
            r={3.5}
            fill={c.card}
            stroke={c.chartInk}
            strokeWidth={1.4}
          />,
        );
        const dd = Math.hypot(x - cx, y - cy) || 1;
        L.place(
          `n${k}`,
          [[x + ((x - cx) / dd) * 16, y + ((y - cy) / dd) * 16 + 4]],
          NAMES[k],
          c.chartInk,
          false,
        );
        if (corr !== undefined && typeof spec.correction === 'string') {
          const t = `${corr > 0 ? '+' : ''}${fmt(corr)}″`;
          L.place(
            `c${k}`,
            [[x - ((x - cx) / dd) * 34, y - ((y - cy) / dd) * 34 + 4]],
            t,
            c.chartHighlight,
          );
        }
      });
      const req = (n - 2) * 180;
      const meas = get(spec.measured);
      lines.push(
        {
          text: [lab(spec.measured, 'Σ measured', meas, '°')].filter(Boolean).join(''),
          color: c.chartInk,
        },
        { text: lab(spec.required, 'Σ required', req, '°') ?? '', color: c.chartInk },
        {
          text: [
            lab(
              spec.misclosure,
              'misclosure',
              meas === undefined ? undefined : (meas - req) * 3600,
              '″',
            ),
          ]
            .filter(Boolean)
            .join(''),
          color: c.chartHighlight,
        },
      );
      BH = cy + R + 34;
      caption.push(`Interior angles of ${n} sides add to (n − 2) × 180° = ${req}°.`);
      if (meas !== undefined)
        caption.push(
          `Misclosure ${fmt((meas - req) * 3600)}″, shared equally: ${fmt((-(meas - req) * 3600) / n)}″ to each angle.`,
        );
    }
  } else if (spec.mode === 'level') {
    // ── Differential leveling: two setups ──
    const v = [spec.BM, spec.BS1, spec.FS1, spec.BS2, spec.FS2].map(get);
    if (v.some((x) => x === undefined)) {
      caption.push('Type the benchmark and the four readings to draw the run.');
    } else {
      const [BM, BS1, FS1, BS2, FS2] = v as [number, number, number, number, number];
      const run = levelRun(BM, BS1, FS1, BS2, FS2);
      const inst = 1.5;
      const ground = [BM, run.HI1 - inst, run.TP, run.HI2 - inst, run.B];
      const xs = [38, 112, 186, 252, 322];
      const hi = Math.max(run.HI1, run.HI2) + 0.35;
      const lo = Math.min(...ground) - 0.35;
      const s = Math.min(70, 190 / (hi - lo));
      const top = 34;
      const Y = (e: number) => top + (hi - e) * s;
      const bottom = Y(lo) + 26;
      // The ground, painted.
      const prof = xs.map((x, k) => `${x},${Y(ground[k]!)}`);
      body.push(
        <Path
          key="earth"
          d={`M 4 ${Y(ground[0]!)} L ${prof.join(' L ')} L ${BW - 4} ${Y(ground[4]!)} L ${BW - 4} ${bottom} L 4 ${bottom} Z`}
          fill={c.soil}
        />,
        <Path
          key="grass"
          d={`M 4 ${Y(ground[0]!)} L ${prof.join(' L ')} L ${BW - 4} ${Y(ground[4]!)}`}
          stroke={c.landGrass}
          strokeWidth={3}
          fill="none"
        />,
      );
      // Elevations under the ground at each rod, first: the readings and HIs find room round them.
      const elev: [string, NumOrVar | undefined, number, number][] = [
        ['BM', spec.BM, BM, 0],
        ['TP1', spec.TP, run.TP, 2],
        ['B', spec.B, run.B, 4],
      ];
      for (const [name, id, e, k] of elev) {
        const t = typeof id === 'string' ? valueLabel(id) : `${name} = ${fmt(e)} m`;
        L.place(
          `el${name}`,
          [
            [xs[k]!, Y(e) + 18],
            [xs[k]!, Y(e) + 36],
          ],
          t,
          c.chartInk,
        );
      }
      // Rods, levels and lines of sight.
      const HIs = [run.HI1, run.HI2];
      for (const [k, r] of [
        [0, BM],
        [2, run.TP],
        [4, run.B],
      ] as const) {
        const reach = Math.max(...HIs) - r + 0.3;
        body.push(
          <Rod key={`rod${k}`} x={xs[k]!} ground={Y(r)} tall={Math.max(30, reach * s)} c={c} />,
        );
      }
      [0, 1].forEach((j) => {
        const x = xs[1 + 2 * j]!;
        const y = Y(HIs[j]!);
        const [xa, xb] = [xs[2 * j]!, xs[2 * j + 2]!];
        body.push(
          <Line
            key={`sight${j}`}
            x1={xa}
            x2={xb}
            y1={y}
            y2={y}
            stroke={c.chartHighlight}
            strokeWidth={1.4}
            strokeDasharray={chart.dash}
          />,
          <Level
            key={`lvl${j}`}
            x={x}
            y={y}
            ground={Y(ground[1 + 2 * j]!)}
            c={c}
            paint={paint.light}
          />,
          <Circle key={`bs${j}`} cx={xa} cy={y} r={3} fill={c.chartHighlight} />,
          <Circle key={`fs${j}`} cx={xb} cy={y} r={3} fill={c.chartHighlight} />,
        );
      });
      // The readings beside the rods, inside the setup they belong to.
      const read = (
        key: string,
        x: number,
        y: number,
        text: string | undefined,
        right: boolean,
      ) => {
        if (!text) return;
        const w = labelW(text);
        L.place(
          key,
          [
            [x + (right ? 1 : -1) * (w / 2 + 8), y + 16],
            [x + (right ? 1 : -1) * (w / 2 + 8), y + 36],
            [x + (right ? 1 : -1) * (w / 2 + 8), y - 8],
            [x + (right ? 1 : -1) * (w / 2 + 8), y - 26],
          ],
          text,
        );
      };
      read('bs1', xs[0]!, Y(run.HI1), lab(spec.BS1, 'BS₁', BS1, 'm'), true);
      read('fs1', xs[2]!, Y(run.HI1), lab(spec.FS1, 'FS₁', FS1, 'm'), false);
      read('bs2', xs[2]!, Y(run.HI2), lab(spec.BS2, 'BS₂', BS2, 'm'), true);
      read('fs2', xs[4]!, Y(run.HI2), lab(spec.FS2, 'FS₂', FS2, 'm'), false);
      // Each HI over its level, above the readings.
      [0, 1].forEach((j) => {
        const [x, y] = [xs[1 + 2 * j]!, Y(HIs[j]!)];
        const hiText = lab(j ? spec.HI2 : spec.HI1, j ? 'HI₂' : 'HI₁', HIs[j], 'm');
        L.place(
          `hi${j}`,
          [
            [x, y - 14],
            [x, y - 30],
            [x, y - 46],
          ],
          hiText,
          c.chartHighlight,
        );
      });
      BH = bottom + 4;
      caption.push(
        `HI = elevation + BS; elevation = HI − FS: TP1 = ${fmt(run.HI1)} − ${fmt(FS1)} = ${fmt(run.TP)} m, B = ${fmt(run.HI2)} − ${fmt(FS2)} = ${fmt(run.B)} m.`,
        `Check: ΣBS − ΣFS = ${fmt(BS1 + BS2)} − ${fmt(FS1 + FS2)} = ${fmt(BS1 + BS2 - FS1 - FS2)} m = B − BM.`,
      );
    }
  } else if (spec.mode === 'curvature') {
    // ── One long sight over the curved earth ──
    const [K, h] = [get(spec.K), get(spec.h)];
    const coef = spec.coef ?? 0.0675;
    const [x0, x1, y0] = [40, 318, 96];
    const drop = 62;
    // The earth's surface: a circle's arc through (x0, y0) leaving the level line by `drop` at x1.
    const span = x1 - x0;
    const Rr = (span * span + drop * drop) / (2 * drop);
    const surf = (x: number) => y0 + Rr - Math.sqrt(Rr * Rr - (x - x0) ** 2);
    const path = Array.from({ length: 41 }, (_, k) => {
      const x = 4 + ((BW - 8) * k) / 40;
      return `${k ? 'L' : 'M'} ${x} ${surf(x)}`;
    });
    const ground = Array.from({ length: 41 }, (_, k) => {
      const x = 4 + ((BW - 8) * k) / 40;
      return `L ${x} ${surf(x)}`;
    });
    body.push(
      <Path
        key="earth"
        d={`M 4 ${surf(4)} ${ground.join(' ')} L ${BW - 4} 220 L 4 220 Z`}
        fill={c.soil}
      />,
      <Path key="surf" d={path.join(' ')} stroke={c.landGrass} strokeWidth={3} fill="none" />,
      <Line
        key="levelline"
        x1={x0}
        x2={x1 + 10}
        y1={y0 - 14}
        y2={y0 - 14}
        stroke={c.chartHighlight}
        strokeWidth={1.6}
        strokeDasharray={chart.dash}
      />,
      <Path
        key="refr"
        d={`M ${x0} ${y0 - 14} Q ${(x0 + x1) / 2} ${y0 - 14} ${x1} ${y0 - 14 + drop / 7}`}
        stroke={c.surveyLat}
        strokeWidth={1.4}
        fill="none"
      />,
      <Level key="lvl" x={x0} y={y0 - 14} ground={surf(x0)} c={c} paint={paint.light} />,
      <Rod key="rod" x={x1} ground={surf(x1)} tall={drop + 26} c={c} />,
    );
    // h between the level line and the ground at the rod.
    body.push(
      <Line
        key="hbar"
        x1={x1 + 18}
        x2={x1 + 18}
        y1={y0 - 14}
        y2={surf(x1)}
        stroke={c.surveyGap}
        strokeWidth={1.6}
      />,
      <Line
        key="hb1"
        x1={x1 + 13}
        x2={x1 + 23}
        y1={y0 - 14}
        y2={y0 - 14}
        stroke={c.surveyGap}
        strokeWidth={1.6}
      />,
      <Line
        key="hb2"
        x1={x1 + 13}
        x2={x1 + 23}
        y1={surf(x1)}
        y2={surf(x1)}
        stroke={c.surveyGap}
        strokeWidth={1.6}
      />,
    );
    const hText = lab(spec.h, 'h', h ?? (K === undefined ? undefined : coef * K * K), 'm');
    if (hText)
      L.place(
        'h',
        [[x1 - labelW(hText) / 2 - 4, (y0 - 14 + surf(x1)) / 2 + 10]],
        hText,
        c.surveyGap,
      );
    const KText = lab(spec.K, 'K', K, 'km');
    body.push(
      <Line key="kd" x1={x0} x2={x1} y1={y0 - 40} y2={y0 - 40} stroke={c.chartInk} />,
      <Line key="kd1" x1={x0} x2={x0} y1={y0 - 45} y2={y0 - 35} stroke={c.chartInk} />,
      <Line key="kd2" x1={x1} x2={x1} y1={y0 - 45} y2={y0 - 35} stroke={c.chartInk} />,
    );
    if (KText) L.place('K', [[(x0 + x1) / 2, y0 - 46]], KText, undefined, false);
    L.place('ll', [[(x0 + x1) / 2 + 20, y0 - 20]], 'level line', c.chartHighlight, false);
    L.place('rf', [[(x0 + x1) / 2 + 60, y0 + 8]], 'line of sight (refraction)', c.surveyLat, false);
    BH = 226;
    if (K !== undefined)
      caption.push(
        `h = ${coef}K² = ${coef} × ${fmt(K)}² = ${fmt(coef * K * K)} m: the earth falls away from the level line; refraction bends the sight back a little.`,
      );
    caption.push('The curve and h are drawn far bigger than life.');
  } else {
    // ── Heights: terrain, geoid and ellipsoid ──
    const [h, N] = [get(spec.h), get(spec.N)];
    if (h === undefined || N === undefined) {
      caption.push('Type h and N to draw the three surfaces.');
    } else {
      const H = h - N;
      const hi = Math.max(h, N, 0);
      const lo = Math.min(h, N, 0);
      const s = 170 / Math.max(hi - lo, 1e-9);
      const top = 46;
      const Y = (z: number) => top + (hi - z) * s;
      const xp = 186;
      const bump = (x: number, a: number, f: number, ph: number) =>
        a * Math.sin((x - xp) / f + ph) * (1 - Math.exp(-(((x - xp) / 44) ** 2)));
      const curve = (z0: number, a: number, f: number, ph: number) =>
        Array.from({ length: 61 }, (_, k) => {
          const x = 8 + ((BW - 16) * k) / 60;
          return `${k ? 'L' : 'M'} ${x} ${Y(z0) + bump(x, a, f, ph)}`;
        }).join(' ');
      const terrain = curve(h, 16, 22, 0.6);
      body.push(
        <Path
          key="ground"
          d={`${terrain} L ${BW - 8} ${Y(lo) + 30} L 8 ${Y(lo) + 30} Z`}
          fill={c.soil}
          opacity={0.35}
        />,
        <Path key="terrain" d={terrain} stroke={c.soilDark} strokeWidth={2.6} fill="none" />,
        <Path
          key="geoid"
          d={curve(N, 7, 46, 1.4)}
          stroke={c.surveyGeoid}
          strokeWidth={2.2}
          strokeDasharray={chart.dash}
          fill="none"
        />,
        <Path
          key="ellipsoid"
          d={curve(0, 0, 1, 0)}
          stroke={c.chartInk}
          strokeWidth={1.8}
          fill="none"
        />,
      );
      const bar = (key: string, x: number, z1: number, z2: number, col: string) =>
        Math.abs(Y(z2) - Y(z1)) > 6 ? (
          <Arrow key={key} x1={x} y1={Y(z1)} x2={x} y2={Y(z2)} color={col} width={2.2} head={7} />
        ) : null;
      body.push(
        bar('h', xp - 34, 0, h, c.surveyLat),
        bar('N', xp, 0, N, c.surveyGeoid),
        bar('H', xp + 34, N, h, c.surveyGap),
        <Circle key="pt" cx={xp} cy={Y(h)} r={4.5} fill={c.chartInk} />,
      );
      const ht = lab(spec.h, 'h', h, 'm');
      const nt = lab(spec.N, 'N', N, 'm');
      const Ht = lab(spec.H, 'H', H, 'm');
      if (ht) L.place('hl', [[xp - 40 - labelW(ht) / 2, (Y(0) + Y(h)) / 2 + 4]], ht, c.surveyLat);
      if (nt)
        L.place(
          'nl',
          [
            [xp + 8 + labelW(nt) / 2, (Y(0) + Y(N)) / 2 + 4],
            [xp - 40 - labelW(nt) / 2, (Y(0) + Y(N)) / 2 + 4],
          ],
          nt,
          c.surveyGeoid,
        );
      if (Ht) L.place('Hl', [[xp + 40 + labelW(Ht) / 2, (Y(N) + Y(h)) / 2 + 4]], Ht, c.surveyGap);
      L.place('tn', [[BW - 46, Y(h) - 22]], 'Terrain', c.soilDark, false);
      L.place(
        'gn',
        [
          [BW - 40, Y(N) + (N < 0 ? 18 : -12)],
          [BW - 40, Y(N) + (N < 0 ? -12 : 18)],
        ],
        'Geoid',
        c.surveyGeoid,
        false,
      );
      L.place(
        'en',
        [
          [BW - 50, Y(0) + (N < 0 ? -10 : 18)],
          [BW - 50, Y(0) + (N < 0 ? 18 : -10)],
        ],
        'Ellipsoid',
        c.chartInk,
        false,
      );
      BH = Y(lo) + 30;
      caption.push(
        `H = h − N = ${fmt(h)} − (${fmt(N)}) = ${fmt(H)} m.`,
        N < 0
          ? 'Here the geoid lies below the ellipsoid (N < 0), so H is more than h.'
          : 'Here the geoid lies above the ellipsoid (N > 0), so H is less than h.',
      );
    }
  }

  const below = BH;
  if (lines.some((l) => l.text)) BH += lines.filter((l) => l.text).length * 18 + 6;

  return (
    <View>
      <Canvas aspect={BH / BW}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            <Defs>
              <TopLight id={paint.light} />
            </Defs>
            <G transform={`scale(${w / BW})`}>
              {body}
              {L.els}
              {lines
                .filter((l) => l.text)
                .map((l, i) => (
                  <HeLabel
                    key={`line${i}`}
                    x={BW / 2}
                    y={below + 12 + i * 18}
                    text={l.text}
                    color={l.color}
                    chip={false}
                    w={BW}
                  />
                ))}
            </G>
          </Svg>
        )}
      </Canvas>
      <Caption>{caption.join(' · ')}</Caption>
    </View>
  );
}
