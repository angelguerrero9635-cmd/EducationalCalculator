import Svg, { Circle, Defs, G, Path, Rect } from 'react-native-svg';

import type { Scene } from '@/data/modules/layouts';
import type { PlanetName } from '@/data/modules/typesPhysics8';
import { chart, usePalette } from '@/theme';

import { Canvas, ChartText, fitLabel } from '../reps/common';
import { arrowAt, fieldAt, pathOf, traceLine, type Box, type Pole } from '../reps/fieldLines';
import { TopLight, usePaintIds, url } from '../reps/paint';
import { PLANET_LABEL, Planet, RADIUS_KM, SATURN_RING_KM } from '../reps/planetArt';

/**
 * Explore figures for Grade 8 science: bar magnets with their field lines and compasses, and
 * the planets side by side to scale by size.
 */

/** A bar magnet: its north half painted red, its south half blue, lit from above. */
export function BarMagnet({
  x,
  y,
  width,
  height,
  left,
  light,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  /** The pole at the left end. */
  left: 'N' | 'S';
  /** A TopLight gradient id. */
  light: string;
}) {
  const c = usePalette();
  const right = left === 'N' ? 'S' : 'N';
  const fill = (p: string) => (p === 'N' ? c.poleNorth : c.poleSouth);
  return (
    <G>
      <Rect x={x + 2} y={y + 3} width={width} height={height} rx={3} fill={c.shadow} />
      <Rect x={x} y={y} width={width / 2} height={height} fill={fill(left)} />
      <Rect x={x + width / 2} y={y} width={width / 2} height={height} fill={fill(right)} />
      <Rect x={x} y={y} width={width} height={height} rx={3} fill={url(light)} />
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={3}
        fill="none"
        stroke={c.edgeShade}
        strokeWidth={1}
      />
      {[
        [left, x + width * 0.2],
        [right, x + width * 0.8],
      ].map(([p, px]) => (
        <ChartText
          key={p}
          x={px as number}
          y={y + height / 2 + 5}
          fontSize={chart.emphasis}
          fontWeight="700"
          fill={c.onBlock}
          textAnchor="middle"
        >
          {p}
        </ChartText>
      ))}
    </G>
  );
}

/** A small compass whose needle's red end points along the field. */
function Compass({ x, y, angle }: { x: number; y: number; angle: number }) {
  const c = usePalette();
  const r = 12;
  const [dx, dy] = [Math.cos(angle), Math.sin(angle)];
  const [px, py] = [-dy, dx];
  const n = r - 2;
  return (
    <G>
      <Circle cx={x + 1} cy={y + 2} r={r} fill={c.shadow} />
      <Circle cx={x} cy={y} r={r} fill={c.silver} stroke={c.metalDark} strokeWidth={1.5} />
      <Path
        d={`M ${x + dx * n} ${y + dy * n} L ${x + px * 3} ${y + py * 3} L ${x - px * 3} ${y - py * 3} Z`}
        fill={c.poleNorth}
      />
      <Path
        d={`M ${x - dx * n} ${y - dy * n} L ${x + px * 3} ${y + py * 3} L ${x - px * 3} ${y - py * 3} Z`}
        fill={c.coinInk}
      />
      <Circle cx={x} cy={y} r={1.2} fill={c.coinInk} />
    </G>
  );
}

/** Field lines (with an arrow on each) traced from the north poles; `solids` are the bodies. */
export function FieldLines({
  poles,
  starts,
  box,
  solids,
  view,
  faded,
}: {
  poles: Pole[];
  /** Each line's start near a north pole, and optionally its mirror start near the south pole. */
  starts: [number, number, number?, number?][];
  box: Box;
  solids: Box[];
  /** The part of the picture where arrows can go (a line's arrow sits halfway along what shows). */
  view: Box;
  faded?: boolean;
}) {
  const c = usePalette();
  // Whether a line came back into a magnet (or onto a pole) rather than leaving the picture.
  const reaches = (pts: [number, number][]) => {
    const [x, y] = pts[pts.length - 1]!;
    return (
      solids.some((b) => x >= b.x0 - 1 && x <= b.x1 + 1 && y >= b.y0 - 1 && y <= b.y1 + 1) ||
      poles.some((p) => Math.hypot(x - p.x, y - p.y) < 8)
    );
  };
  // A line that loops out of reach is also traced back from its mirror start at the south pole,
  // so both ends of it show.
  const lines = starts.flatMap(([x, y, mx, my]) => {
    const fwd = traceLine(poles, x, y, box, solids);
    if (reaches(fwd) || mx === undefined || my === undefined) return [fwd];
    const back = traceLine(poles, mx, my, box, solids, 2, 5, 1600, -1).reverse();
    return [fwd, back];
  });
  return (
    <G opacity={faded ? 0.45 : 1}>
      {lines.map((pts, i) => {
        const seen = pts.filter(
          ([x, y]) =>
            x > view.x0 &&
            x < view.x1 &&
            y > view.y0 &&
            y < view.y1 &&
            !solids.some((b) => x > b.x0 - 6 && x < b.x1 + 6 && y > b.y0 - 6 && y < b.y1 + 6),
        );
        const a = arrowAt(seen, 0.5);
        return (
          <G key={i}>
            <Path d={pathOf(pts)} stroke={c.chartMuted} strokeWidth={1.3} fill="none" />
            {a ? (
              <Path
                d="M -4 -3.5 L 3 0 L -4 3.5"
                transform={`translate(${a.x} ${a.y}) rotate(${a.angle})`}
                stroke={c.chartInk}
                strokeWidth={1.6}
                fill="none"
              />
            ) : null}
          </G>
        );
      })}
    </G>
  );
}

/**
 * Where field lines start: just off a north pole at (x, y), `perSide` lines above and below,
 * leaving at 35° to 165° from `toward` (the direction of the magnet's own south pole, in
 * radians). Equal steps of angle give the familiar picture: lines crowd at the poles and the
 * steep ones loop far out.
 */
export function startsFromPole(
  x: number,
  y: number,
  toward: number,
  perSide: number,
  /** The south pole mirroring this one across the picture's middle, for mirror starts. */
  south?: [number, number],
): [number, number, number?, number?][] {
  const out: [number, number, number?, number?][] = [];
  for (let i = 0; i < perSide; i++) {
    const a = ((35 + (130 * i) / Math.max(1, perSide - 1)) * Math.PI) / 180;
    for (const side of [1, -1]) {
      const t = toward + side * a;
      // Mirrored across the middle: from that south pole, as far round the other way.
      const m = Math.PI - t;
      out.push(
        south
          ? [
              x + 3 * Math.cos(t),
              y + 3 * Math.sin(t),
              south[0] + 3 * Math.cos(m),
              south[1] + 3 * Math.sin(m),
            ]
          : [x + 3 * Math.cos(t), y + 3 * Math.sin(t)],
      );
    }
  }
  return out;
}

/**
 * Bar magnets: two facing each other with the poles of the scene (pull together or push apart),
 * or one alone; with `field`, their field lines from N to S and (with `compasses`) compass
 * needles showing the field's direction around them.
 */
export function MagnetsFigure({
  poles,
  field,
}: {
  poles: NonNullable<Scene['poles']>;
  field?: Scene['field'];
}) {
  const c = usePalette();
  const ids = usePaintIds('light');
  const [leftEnd, rightEnd] = poles.split('–') as ['N' | 'S', 'N' | 'S'];
  const attract = leftEnd !== rightEnd;
  const single = !!field?.single;
  const other = (p: 'N' | 'S') => (p === 'N' ? 'S' : 'N');
  return (
    <Canvas aspect={field ? 0.64 : 0.36}>
      {({ w, h }) => {
        const y = field ? h * 0.47 : h / 2;
        const mh = single ? 38 : 34;
        const mw = single ? Math.min(170, w * 0.44) : Math.min(130, w * 0.3);
        const gap = attract ? 18 : 56;
        // Each magnet: its x, width and which pole is at its left end.
        const magnets: { x: number; left: 'N' | 'S' }[] = single
          ? [{ x: w / 2 - mw / 2, left: 'S' }]
          : [
              { x: w / 2 - gap / 2 - mw, left: other(leftEnd) },
              { x: w / 2 + gap / 2, left: rightEnd },
            ];
        // Poles a little in from each end, as in a real bar magnet.
        const inset = mw * 0.12;
        const polesOf: Pole[] = magnets.flatMap((m) => [
          { x: m.x + inset, y, q: m.left === 'N' ? 1 : -1 },
          { x: m.x + mw - inset, y, q: m.left === 'N' ? -1 : 1 },
        ]);
        // Lines may loop out past the picture's edge and come back.
        const box = { x0: -w, y0: -h, x1: 2 * w, y1: 2 * h };
        const solids = magnets.map((m) => ({
          x0: m.x,
          y0: y - mh / 2,
          x1: m.x + mw,
          y1: y + mh / 2,
        }));
        const starts = magnets.flatMap((m) => {
          const nLeft = m.left === 'N';
          const nx = nLeft ? m.x + inset : m.x + mw - inset;
          // Mirrored across the middle of the picture, a north pole lands on a south pole when
          // the magnets pull together (or there is one): lines that loop away come back there.
          const mirror: [number, number] | undefined = single || attract ? [w - nx, y] : undefined;
          return startsFromPole(nx, y, nLeft ? 0 : Math.PI, single ? 6 : 5, mirror);
        });
        const compassAt: [number, number][] = field?.compasses
          ? Array.from({ length: 10 }, (_, i) => {
              const a = (i / 10) * 2 * Math.PI + Math.PI / 10;
              return [w / 2 + (w / 2 - 22) * Math.cos(a), y + (h / 2 - 38) * Math.sin(a)];
            })
          : [];
        const arrow = (from: number, to: number) => (
          <Path
            d={`M ${from} ${y - mh / 2 - 14} L ${to} ${y - mh / 2 - 14} M ${to} ${y - mh / 2 - 14} l ${to > from ? -8 : 8} -5 M ${to} ${y - mh / 2 - 14} l ${to > from ? -8 : 8} 5`}
            stroke={c.chartInk}
            strokeWidth={chart.stroke}
            fill="none"
          />
        );
        const left = magnets[0]!;
        const right = magnets[1];
        return (
          <Svg width={w} height={h}>
            <Defs>
              <TopLight id={ids.light} />
            </Defs>
            {field && field.lines !== false ? (
              <FieldLines
                poles={polesOf}
                starts={starts}
                box={box}
                solids={solids}
                view={{ x0: 4, y0: 4, x1: w - 4, y1: h - 22 }}
              />
            ) : null}
            {magnets.map((m, i) => (
              <BarMagnet
                key={i}
                x={m.x}
                y={y - mh / 2}
                width={mw}
                height={mh}
                left={m.left}
                light={ids.light}
              />
            ))}
            {compassAt.map(([x, cy], i) => {
              const d = fieldAt(polesOf, x, cy);
              return d ? <Compass key={i} x={x} y={cy} angle={Math.atan2(d[1], d[0])} /> : null;
            })}
            {!field && right ? (
              <>
                {attract
                  ? arrow(left.x + mw - 40, left.x + mw - 4)
                  : arrow(left.x + mw - 4, left.x + mw - 40)}
                {attract ? arrow(right.x + 40, right.x + 4) : arrow(right.x + 4, right.x + 40)}
              </>
            ) : null}
            {single ? null : (
              <ChartText x={w / 2} y={h - 6} fontSize={chart.label} textAnchor="middle">
                {attract ? 'pull together' : 'push apart'}
              </ChartText>
            )}
            {single && field && field.lines !== false ? (
              <ChartText
                x={w / 2}
                y={h - 6}
                fontSize={chart.label}
                fill={c.chartMuted}
                textAnchor="middle"
              >
                field lines run from N to S
              </ChartText>
            ) : null}
          </Svg>
        );
      }}
    </Canvas>
  );
}

/** Row by row, left to right, as they go out from the sun (the moon beside Earth). */
const ROWS: PlanetName[][] = [
  ['mercury', 'venus', 'earth', 'moon', 'mars', 'jupiter'],
  ['saturn', 'uranus', 'neptune'],
];

/**
 * The planets (and Earth's moon) side by side, to scale by size, in two rows, with the edge of
 * the sun, drawn to the same scale, along the left. A scene rings the planets it lights and
 * gives each one's width in Earths.
 */
export function PlanetsFigure({ planets }: { planets: NonNullable<Scene['planets']> }) {
  const c = usePalette();
  const lit = new Set(planets.lit ?? []);
  return (
    <Canvas aspect={(w) => (Math.min(w, 520) * 0.75 + 40) / w}>
      {({ w, h }) => {
        const sunW = 16;
        const margin = 8;
        const gap = 14;
        // Pixels per Earth radius: the widest row (Saturn's rings, Uranus, Neptune) fills the width.
        const rowB =
          (2 * SATURN_RING_KM + 2 * RADIUS_KM.uranus + 2 * RADIUS_KM.neptune) / RADIUS_KM.earth;
        // Uranus and Neptune sit far enough apart for their labels.
        const gapUN = 28;
        const R = (w - sunW - 2 * margin - gap - gapUN - 10) / rowB;
        const px = (name: PlanetName | 'sun') => (RADIUS_KM[name] / RADIUS_KM.earth) * R;
        const sunR = px('sun');
        const jupR = px('jupiter');
        const yA = 24 + jupR;
        const yB = yA + jupR + 40 + px('saturn');
        // Row A: the small ones spaced for their labels, then Jupiter.
        const small = 34;
        const x0 = sunW + margin + 16;
        const place: {
          name: PlanetName;
          x: number;
          y: number;
          r: number;
          row: number;
          i: number;
        }[] = [];
        ROWS[0]!.forEach((name, i) => {
          const x = name === 'jupiter' ? x0 + small * 5 + 4 + jupR : x0 + small * i;
          place.push({ name, x, y: yA, r: px(name), row: 0, i });
        });
        const ringR = (SATURN_RING_KM / RADIUS_KM.earth) * R;
        const sx = sunW + margin + ringR;
        const ux = sx + ringR + gap + px('uranus');
        const nx = ux + px('uranus') + gapUN + px('neptune');
        place.push({ name: 'saturn', x: sx, y: yB, r: px('saturn'), row: 1, i: 0 });
        place.push({ name: 'uranus', x: ux, y: yB, r: px('uranus'), row: 1, i: 1 });
        place.push({ name: 'neptune', x: nx, y: yB, r: px('neptune'), row: 1, i: 2 });
        const width = (name: PlanetName) => {
          const k = RADIUS_KM[name] / RADIUS_KM.earth;
          return `${k >= 1 ? k.toFixed(1) : k.toFixed(2)} × Earth`;
        };
        return (
          <Svg width={w} height={h}>
            {/* The sun's edge, to the same scale: its center is far off to the left. */}
            <Circle cx={sunW - sunR} cy={h / 2} r={sunR} fill={c.sunDisk} />
            <Circle
              cx={sunW - sunR}
              cy={h / 2}
              r={sunR}
              fill="none"
              stroke={c.sunRay}
              strokeWidth={3}
            />
            <ChartText x={3} y={h - 6} fontSize={chart.tiny} fill={c.chartMuted}>
              the sun’s edge
            </ChartText>
            {place.map((p) => {
              const on = lit.has(p.name);
              // Small bodies' names take two rows so they don't run together.
              const ly =
                p.row === 0 && p.name !== 'jupiter'
                  ? p.y + 14 + (p.i % 2 ? 13 : 0)
                  : p.y + (p.name === 'saturn' ? p.r * 1.05 : p.r) + 14;
              const name = PLANET_LABEL[p.name];
              return (
                <G key={p.name}>
                  {on ? (
                    <Circle
                      cx={p.x}
                      cy={p.y}
                      r={p.r + 4}
                      fill="none"
                      stroke={c.chartHighlight}
                      strokeWidth={chart.stroke}
                    />
                  ) : null}
                  <Planet name={p.name} x={p.x} y={p.y} r={p.r} />
                  <ChartText
                    {...fitLabel(p.x, name, chart.tiny, w)}
                    y={ly}
                    fontSize={chart.tiny}
                    fontWeight={on ? '700' : '400'}
                    fill={on ? c.chartHighlight : c.chartInk}
                  >
                    {name}
                  </ChartText>
                  {on ? (
                    <ChartText
                      {...fitLabel(p.x, width(p.name), chart.tiny, w)}
                      y={
                        p.row === 0 && p.name !== 'jupiter'
                          ? p.y - 10 - (p.i % 2 ? 13 : 0)
                          : ly + 12
                      }
                      fontSize={chart.tiny}
                      fill={c.chartMuted}
                    >
                      {width(p.name)}
                    </ChartText>
                  ) : null}
                </G>
              );
            })}
          </Svg>
        );
      }}
    </Canvas>
  );
}
