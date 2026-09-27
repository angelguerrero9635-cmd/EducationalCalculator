/**
 * Round-3 card figures (group H): the moon in a phase, a constellation, a small map, a tiny dot
 * plot, and a cell with one part outlined. Maps, star charts and dot plots are diagrams, so
 * they stay flat; the data they draw is in data/modules/layouts/cardFigureData.ts.
 */
import { ClipPath, Circle, Defs, Ellipse, G, Line, Path, Rect, Text } from 'react-native-svg';

import type { CardFigure } from '@/data/modules/layouts';
import {
  LANDS,
  MAP_REGIONS,
  MAP_VIEWS,
  SEAS,
  starChart,
  viewLon,
} from '@/data/modules/layouts/cardFigureData';
import type { CellPart, MapArea } from '@/data/modules/layouts/types';
import { usePalette } from '@/theme';

import { url, usePaintIds } from '../reps/paint';
import { MoonShape } from './figures';

const S = 48;

/** Widths of the round-3 figures that aren't square. */
export function r3hFigureWidth(f: CardFigure): number | undefined {
  if (f.kind === 'map') return f.area === 'northAmerica' ? 58 : 96;
  if (f.kind === 'dotPlot') return 96;
  if (f.kind === 'cell' && f.highlight) return 64;
  return undefined;
}

export function MoonCard({ f }: { f: Extract<CardFigure, { kind: 'moon' }> }) {
  const c = usePalette();
  return <MoonShape x={S / 2} y={S / 2} r={19} phase={f.phase} c={c} />;
}

/** A constellation fitted into the card, north up and east on the left, as seen looking up. */
export function StarsCard({
  f,
  ink,
  shade,
}: {
  f: Extract<CardFigure, { kind: 'stars' }>;
  ink: string;
  shade: string;
}) {
  const { points, lines } = starChart(f.constellation);
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const k = (S - 12) / Math.max(x1 - x0, y1 - y0);
  const px = (x: number) => S / 2 + (x - (x0 + x1) / 2) * k;
  const py = (y: number) => S / 2 + (y - (y0 + y1) / 2) * k;
  // Brighter stars (smaller magnitudes) are bigger dots.
  const r = (mag: number) => Math.max(0.9, 3.3 - 0.62 * mag);
  return (
    <G>
      {lines.map(([a, b]) => (
        <Line
          key={`${a}-${b}`}
          x1={px(points[a]![0])}
          y1={py(points[a]![1])}
          x2={px(points[b]![0])}
          y2={py(points[b]![1])}
          stroke={shade}
          strokeWidth={1}
          strokeOpacity={0.7}
        />
      ))}
      {points.map(([x, y, mag], i) => (
        <Circle key={i} cx={px(x)} cy={py(y)} r={r(mag)} fill={ink} />
      ))}
    </G>
  );
}

/** Longitude and latitude to the card: the view's box inside a small margin. */
function projection(area: MapArea, w: number) {
  const v = MAP_VIEWS[area];
  const spanX = (v.east - v.west) * v.squeeze;
  const spanY = v.north - v.south;
  const k = Math.min((w - 2) / spanX, (S - 2) / spanY);
  const left = (w - spanX * k) / 2;
  const top = (S - spanY * k) / 2;
  return {
    box: { x: left, y: top, width: spanX * k, height: spanY * k },
    at: (lon: number, lat: number, shift = 0) =>
      [left + (lon + shift - v.west) * v.squeeze * k, top + (v.north - lat) * k] as const,
  };
}

/**
 * A small flat map: sea, land (with the Black and Caspian seas), a shaded region and a pin.
 * World maps wrap round, so land is drawn again a turn east and west and clipped to the box.
 */
export function MapCard({
  f,
  w,
  ink,
  shade,
}: {
  f: Extract<CardFigure, { kind: 'map' }>;
  w: number;
  ink: string;
  shade: string;
}) {
  const c = usePalette();
  const ids = usePaintIds('box', 'land');
  const { box, at } = projection(f.area, w);
  const shifts = f.area === 'northAmerica' ? [0] : [-360, 0, 360];
  const path = (pts: [number, number][], shift: number) =>
    `M ${pts.map(([lon, lat]) => at(lon, lat, shift).join(' ')).join(' L ')} Z`;
  const all = (list: [number, number][][]) =>
    shifts.flatMap((s) => list.map((pts) => path(pts, s))).join(' ');
  const land = all(LANDS);
  const region = f.region ? MAP_REGIONS[f.region] : undefined;
  const regionD = region ? all([region.at]) : '';
  const pin = f.pin ? at(viewLon(f.area, f.pin[0]), f.pin[1]) : undefined;
  return (
    <G>
      <Defs>
        <ClipPath id={ids.box}>
          <Rect {...box} rx={3} />
        </ClipPath>
        <ClipPath id={ids.land}>
          <Path d={land} />
        </ClipPath>
      </Defs>
      <G clipPath={url(ids.box)}>
        <Rect {...box} fill={c.water} fillOpacity={0.28} />
        {region?.sea ? <Path d={regionD} fill={shade} fillOpacity={0.45} /> : null}
        <Path d={land} fill={c.rock3} stroke={ink} strokeWidth={0.4} strokeOpacity={0.55} />
        <Path d={all(SEAS)} fill={c.water} fillOpacity={0.45} />
        {region && !region.sea ? (
          <G clipPath={url(ids.land)}>
            <Path d={regionD} fill={shade} fillOpacity={0.75} />
          </G>
        ) : null}
      </G>
      <Rect {...box} rx={3} fill="none" stroke={ink} strokeWidth={0.75} strokeOpacity={0.5} />
      {pin ? (
        <G>
          <Circle cx={pin[0]} cy={pin[1]} r={3.6} fill={c.card} />
          <Circle cx={pin[0]} cy={pin[1]} r={2.6} fill={shade} />
        </G>
      ) : null}
    </G>
  );
}

/**
 * A tiny dot plot: a line from the smallest value to the largest, with them labelled, and a
 * dot at each value. Dots too close to sit side by side stack up.
 */
export function DotPlotCard({
  f,
  w,
  ink,
  shade,
}: {
  f: Extract<CardFigure, { kind: 'dotPlot' }>;
  w: number;
  ink: string;
  shade: string;
}) {
  const lo = Math.min(...f.values);
  const hi = Math.max(...f.values);
  const r = 3.2;
  const pad = 10;
  const x = (v: number) => pad + ((v - lo) / (hi - lo || 1)) * (w - 2 * pad);
  const axis = 35;
  const placed: { cx: number; level: number }[] = [];
  for (const v of [...f.values].sort((a, b) => a - b)) {
    const cx = x(v);
    let level = 0;
    while (placed.some((p) => p.level === level && Math.abs(p.cx - cx) < 2 * r)) level++;
    placed.push({ cx, level });
  }
  const label = (v: number, anchor: 'start' | 'end') => (
    <Text
      x={x(v) + (anchor === 'start' ? -3 : 3)}
      y={46}
      fontSize={8.5}
      fontFamily="sans-serif"
      textAnchor={anchor}
      fill={ink}
    >
      {String(v)}
    </Text>
  );
  return (
    <G>
      <Line x1={4} y1={axis} x2={w - 4} y2={axis} stroke={ink} strokeWidth={1} />
      {[lo, hi].map((v) => (
        <Line key={v} x1={x(v)} y1={axis} x2={x(v)} y2={axis + 3} stroke={ink} strokeWidth={1} />
      ))}
      {placed.map((p, i) => (
        <Circle
          key={i}
          cx={p.cx}
          cy={axis - r - 1 - p.level * (2 * r + 0.6)}
          r={r}
          fill={shade}
          stroke={ink}
          strokeWidth={0.6}
        />
      ))}
      {label(lo, 'start')}
      {label(hi, 'end')}
    </G>
  );
}

/**
 * A plant cell (box, with its wall) or animal cell (round) with every part drawn and one
 * outlined in the highlight: wall, membrane, cytoplasm, nucleus, chloroplasts, the central
 * vacuole, mitochondria. 64 × 48.
 */
export function CellPartsCard({
  f,
  ink,
  shade,
}: {
  f: Extract<CardFigure, { kind: 'cell' }>;
  ink: string;
  shade: string;
}) {
  const c = usePalette();
  const plant = f.type === 'plant';
  const hl = f.highlight;
  const mark = (part: CellPart, width: number) =>
    hl === part ? { stroke: shade, strokeWidth: width } : { stroke: ink, strokeWidth: 0.8 };
  const cyto = hl === 'cytoplasm' ? shade : plant ? c.life : c.rock6;
  const cytoOpacity = hl === 'cytoplasm' ? 0.4 : 0.5;
  const mito = (x: number, y: number, rot: number) => (
    <G key={`${x}`} transform={`rotate(${rot} ${x} ${y})`}>
      <Ellipse cx={x} cy={y} rx={3.6} ry={2} fill={c.orange} {...mark('mitochondria', 1.6)} />
      <Path
        d={`M ${x - 2.4} ${y} l 0.8 -1 l 0.8 1.6 l 0.8 -1.6 l 0.8 1.6 l 0.8 -1.6 l 0.8 1`}
        fill="none"
        stroke={ink}
        strokeWidth={0.5}
      />
    </G>
  );
  const nucleus = (x: number, y: number, r: number) => (
    <G>
      <Circle cx={x} cy={y} r={r} fill={c.purple} fillOpacity={0.75} {...mark('nucleus', 2)} />
      <Circle cx={x + 0.8} cy={y - 0.6} r={r * 0.35} fill={ink} fillOpacity={0.6} />
    </G>
  );
  if (!plant) {
    return (
      <G>
        <Ellipse
          cx={32}
          cy={24}
          rx={27}
          ry={19}
          fill={cyto}
          fillOpacity={cytoOpacity}
          {...(hl === 'membrane' ? mark('membrane', 2.2) : { stroke: ink, strokeWidth: 1.25 })}
        />
        {nucleus(30, 24, 6.5)}
        {mito(15, 18, -20)}
        {mito(47, 31, 25)}
        {mito(45, 14, 10)}
        {mito(18, 32, 35)}
      </G>
    );
  }
  const chloro = [
    [23, 9, 0],
    [37, 9, 0],
    [55, 19, 90],
    [55, 30, 90],
    [26, 38.7, 0],
    [39, 38.7, 0],
    [9.5, 16, 90],
  ] as const;
  return (
    <G>
      {/* The wall: a stiff band outside the membrane. */}
      <Rect
        x={2.5}
        y={2.5}
        width={59}
        height={43}
        rx={3}
        fill={c.lifeDeep}
        fillOpacity={0.55}
        {...(hl === 'wall' ? mark('wall', 2.4) : { stroke: ink, strokeWidth: 1.25 })}
      />
      <Rect x={6} y={6} width={52} height={36} rx={2} fill={c.card} stroke="none" />
      <Rect
        x={6}
        y={6}
        width={52}
        height={36}
        rx={2}
        fill={cyto}
        fillOpacity={cytoOpacity}
        {...(hl === 'membrane' ? mark('membrane', 1.8) : { stroke: ink, strokeWidth: 0.8 })}
      />
      {/* The central vacuole fills most of the cell. */}
      <Rect
        x={17}
        y={12}
        width={34}
        height={23.5}
        rx={8}
        fill={c.water}
        fillOpacity={0.3}
        {...mark('vacuole', 2)}
      />
      {nucleus(11.5, 29, 4.2)}
      {chloro.map(([x, y, rot]) => (
        <Ellipse
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          rx={3.4}
          ry={1.8}
          transform={`rotate(${rot} ${x} ${y})`}
          fill={c.lifeDeep}
          {...mark('chloroplasts', 1.8)}
        />
      ))}
      {mito(50, 38.7, 0)}
      {mito(12, 37.8, 0)}
    </G>
  );
}
