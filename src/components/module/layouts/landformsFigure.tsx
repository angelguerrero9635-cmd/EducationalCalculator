import type { ReactNode } from 'react';
import { Circle, Defs, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import type { LandformKind } from '@/data/modules/typesHsl';
import { chart, usePalette, type Palette } from '@/theme';

import { Ball, Deepen, TopLight, url, usePaintIds } from '../reps/paint';
import { Board, BOARD_W, CurveArrow, HaloText } from './earthKit';

const H = 260;
const GROUND = 186;

type Pt = [number, number];

/** A repeatable "random" number in [0, 1) for grains and dots. */
const rnd = (i: number, k: number) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const pathOf = (pts: Pt[], close = true) =>
  `M ${pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L ')}${close ? ' Z' : ''}`;

/** Samples y = f(x) from x0 to x1. */
const sample = (f: (x: number) => number, x0: number, x1: number, n = 60): Pt[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const x = x0 + ((x1 - x0) * i) / n;
    return [x, f(x)];
  });

/** Keeps the part of a polygon on the side of line a→b where `side(p) >= 0` (one clip edge). */
function clip(poly: Pt[], a: Pt, b: Pt, keepLeft: boolean): Pt[] {
  const s = (p: Pt) => {
    const v = (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
    return keepLeft ? -v : v;
  };
  const out: Pt[] = [];
  poly.forEach((p, i) => {
    const q = poly[(i + 1) % poly.length]!;
    const sp = s(p);
    const sq = s(q);
    if (sp >= 0) out.push(p);
    if (sp >= 0 !== sq >= 0) {
      const t = sp / (sp - sq);
      out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]);
    }
  });
  return out;
}

/**
 * Landforms for Earth science (H73), one per scene, flat labels over painted ground: the three
 * volcano types in cross-section (a broad shield of runny basalt, a steep composite cone of lava
 * and ash layers, a small cinder cone), folds and the three faults with their stress arrows, a
 * river's V-shaped valley and a glacier's U-shaped one, a meandering river seen from above, an
 * aquifer under the water table, and a sand dune with its gentle windward side and steep slip
 * face (about 33°, the angle of repose).
 */
export function LandformsFigure({ kind }: { kind: LandformKind }) {
  const c = usePalette();
  const ids = usePaintIds('light', 'ash', 'cloud', 'water', 'ice', 'lava', 'ground');
  const defs = (
    <Defs>
      <TopLight id={ids.light} strength={0.8} />
      <Ball id={ids.cloud} color={c.landAsh} />
      <Deepen id={ids.water} from={c.water} to={c.waterDeep} />
      <Deepen id={ids.lava} from={c.landLavaGlow} to={c.landMagma} />
      <Deepen id={ids.ground} from={c.rock4} to={c.rock5} />
    </Defs>
  );
  return (
    <Board height={H}>
      {defs}
      {draw(kind, c, ids)}
    </Board>
  );
}

type Ids = Record<'light' | 'ash' | 'cloud' | 'water' | 'ice' | 'lava' | 'ground', string>;

/** Label with a halo, 12–13 px. */
const label = (
  c: Palette,
  x: number,
  y: number,
  text: string,
  anchor: 'start' | 'middle' | 'end' = 'middle',
  bold = false,
) => (
  <HaloText
    key={`${text}${x}`}
    x={x}
    y={y}
    text={text}
    c={c}
    size={chart.label}
    anchor={anchor}
    bold={bold}
  />
);

/** A thin leader line from a label to the part it names. */
const leader = (c: Palette, a: Pt, b: Pt) => (
  <Line
    key={`${a}${b}`}
    x1={a[0]}
    y1={a[1]}
    x2={b[0]}
    y2={b[1]}
    stroke={c.chartInk}
    strokeWidth={1}
  />
);

/** Crust under a cross-section, from the ground line down. */
const crust = (c: Palette, ids: Ids, top = GROUND) => (
  <G>
    <Rect x={0} y={top} width={BOARD_W} height={H - top} fill={url(ids.ground)} />
    <Path d={`M 0 ${top} H ${BOARD_W}`} stroke={c.landGrass} strokeWidth={3} />
  </G>
);

/** A magma chamber and the pipe up to (x, top). */
const chamber = (c: Palette, ids: Ids, x: number, top: number, rx: number) => (
  <G>
    <Path
      d={`M ${x - 4} ${top} L ${x - 5} 222 L ${x + 5} 222 L ${x + 4} ${top} Z`}
      fill={url(ids.lava)}
    />
    <Ellipse
      cx={x}
      cy={230}
      rx={rx}
      ry={16}
      fill={url(ids.lava)}
      stroke={c.landMagma}
      strokeWidth={1}
    />
  </G>
);

function draw(kind: LandformKind, c: Palette, ids: Ids): ReactNode {
  const mid = 180;
  switch (kind) {
    case 'shield': {
      // A broad dome: slopes of only a few degrees, built of thin runny basalt flows.
      const half = 160;
      const top = 116;
      const f = (x: number) => GROUND - (GROUND - top) * (1 - Math.abs((x - mid) / half) ** 1.5);
      const profile = sample(f, mid - half, mid + half, 80);
      const caldera: Pt[] = profile.map(([x, y]) => [x, Math.abs(x - mid) < 14 ? y + 5 : y]);
      return (
        <G>
          {crust(c, ids)}
          {chamber(c, ids, mid, top + 5, 60)}
          <Path d={pathOf(caldera)} fill={c.landBasalt} />
          {/* Thin lava-flow layers, one under another. */}
          {[10, 20, 30, 40].map((d) => (
            <Path
              key={d}
              d={pathOf(
                sample((x) => f(x) + d, mid - half + d * 2.5, mid + half - d * 2.5, 60),
                false,
              )}
              stroke={c.shade}
              strokeOpacity={0.35}
              fill="none"
            />
          ))}
          <Path d={pathOf(caldera)} fill={url(ids.light)} />
          <Path
            d={`M ${mid - 4} ${top + 5} L ${mid - 4} ${GROUND} L ${mid + 4} ${GROUND} L ${mid + 4} ${top + 5} Z`}
            fill={url(ids.lava)}
          />
          {/* Runny lava flowing far down both flanks. */}
          {[-1, 1].map((s) => (
            <Path
              key={s}
              d={pathOf(
                sample((x) => f(x) - 1.5, mid + s * 14, mid + s * 128, 30),
                false,
              )}
              stroke={c.landLava}
              strokeWidth={4}
              strokeLinecap="round"
              fill="none"
            />
          ))}
          {label(c, 60, 118, 'gentle slopes')}
          {leader(c, [60, 124], [72, 158])}
          {label(c, 300, 118, 'runny basalt lava')}
          {leader(c, [290, 124], [272, 160])}
          {label(c, mid, 100, 'summit crater')}
          {label(c, mid + 72, 252, 'magma chamber', 'start')}
        </G>
      );
    }
    case 'composite': {
      // A tall, steep cone, concave up: layers of lava and ash from explosive eruptions.
      const half = 130;
      const top = 62;
      const f = (d: number) => top + (GROUND - top) * (Math.abs(d) / half) ** 0.62;
      const crater = 12;
      const cone = (k: number): Pt[] => {
        const pts = sample(
          (x) => Math.max(f(x - mid), top + 4) + k * 13,
          mid - half,
          mid + half,
          90,
        );
        return pts.map(([x, y]) => [
          x,
          Math.abs(x - mid) < crater ? Math.max(y, top + 10 + k * 13) : y,
        ]);
      };
      return (
        <G>
          {crust(c, ids)}
          {chamber(c, ids, mid, top + 10, 48)}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => {
            const pts = cone(k).filter(([, y]) => y <= GROUND);
            if (pts.length < 3) return null;
            return (
              <Path
                key={k}
                d={pathOf([...pts, [pts[pts.length - 1]![0], GROUND], [pts[0]![0], GROUND]])}
                fill={k % 2 ? c.landAsh : c.landBasalt}
              />
            );
          })}
          <Path
            d={pathOf([...cone(0), [mid + half, GROUND], [mid - half, GROUND]])}
            fill={url(ids.light)}
            stroke={c.chartInk}
            strokeWidth={0.8}
          />
          {/* The central vent and a side vent. */}
          <Path
            d={`M ${mid - 3} ${top + 10} L ${mid - 3} ${GROUND} L ${mid + 3} ${GROUND} L ${mid + 3} ${top + 10} Z`}
            fill={url(ids.lava)}
          />
          <Path
            d={`M ${mid} 150 Q ${mid + 30} 140 ${mid + 52} 118`}
            stroke={c.landLava}
            strokeWidth={4}
            fill="none"
          />
          {/* An ash cloud billowing from the crater. */}
          {(
            [
              [mid, 42, 16],
              [mid - 16, 30, 13],
              [mid + 16, 28, 14],
              [mid - 4, 16, 14],
              [mid + 24, 12, 11],
            ] as [number, number, number][]
          ).map(([x, y, r]) => (
            <Circle key={`${x}${y}`} cx={x} cy={y} r={r} fill={url(ids.cloud)} />
          ))}
          {label(c, mid + 60, 30, 'ash cloud', 'start')}
          {label(c, 6, 110, 'layers of lava and ash', 'start')}
          {leader(c, [60, 116], [112, 150])}
          {label(c, 300, 150, 'side vent')}
          {leader(c, [290, 142], [mid + 52, 120])}
          {label(c, mid + 60, 252, 'magma chamber', 'start')}
        </G>
      );
    }
    case 'cinderCone': {
      // A small cone of loose cinders at the angle of repose (about 33°), a bowl crater on top.
      const half = 124;
      const lip = 26;
      // The sides at the angle of repose, 33°.
      const h = (half - lip) * Math.tan((33 * Math.PI) / 180);
      const cone: Pt[] = [
        [mid - half, GROUND],
        [mid - lip, GROUND - h],
        [mid - lip * 0.5, GROUND - h + 10],
        [mid + lip * 0.5, GROUND - h + 10],
        [mid + lip, GROUND - h],
        [mid + half, GROUND],
      ];
      const dots = Array.from({ length: 150 }, (_, i) => {
        const x = mid - half + rnd(i, 1) * half * 2;
        const top = GROUND - h * (1 - Math.abs(x - mid) / half) + 3;
        const y = top + rnd(i, 2) * (GROUND - top - 2);
        return y > top && y < GROUND ? (
          <Circle key={i} cx={x} cy={y} r={1.3} fill={c.shade} opacity={0.35} />
        ) : null;
      });
      return (
        <G>
          {crust(c, ids)}
          <Path d={pathOf(cone)} fill={c.landCinder} />
          {dots}
          <Path d={pathOf(cone)} fill={url(ids.light)} stroke={c.chartInk} strokeWidth={0.8} />
          {/* Lava leaking out at the base and running across the ground. */}
          <Path
            d={`M ${mid + half - 16} ${GROUND - 2} C ${mid + half + 16} ${GROUND - 4} ${mid + half + 36} ${GROUND + 2} ${mid + half + 52} ${GROUND - 1}`}
            stroke={c.landLava}
            strokeWidth={6}
            strokeLinecap="round"
            fill="none"
          />
          {/* The 33° slope marked. */}
          <Path
            d={`M ${mid - half + 38} ${GROUND} A 38 38 0 0 0 ${mid - half + 38 * Math.cos(0.576)} ${GROUND - 38 * Math.sin(0.576)}`}
            stroke={c.chartHighlight}
            strokeWidth={chart.stroke}
            fill="none"
          />
          {label(c, mid - half + 52, GROUND - 8, '33°', 'start', true)}
          {label(c, 6, 96, 'steep sides of loose cinders', 'start')}
          {leader(c, [60, 102], [100, 150])}
          {label(c, 250, 116, 'bowl-shaped crater', 'start')}
          {leader(c, [252, 110], [mid + 14, GROUND - h + 8])}
          {label(c, 356, 168, 'lava from the base', 'end')}
          {label(c, mid, 226, 'a cinder cone is small: often under 300 m high')}
        </G>
      );
    }
    case 'folds': {
      // Layers squeezed into an arch (anticline) and a trough (syncline).
      const layers = [c.rock1, c.rock2, c.rock3, c.rock4, c.rock5];
      const x0 = 44;
      const x1 = 316;
      const wave = (x: number) => 26 * Math.cos(((x - 112) / 204) * 2 * Math.PI);
      const band = (k: number, x: number) => 70 + k * 30 - wave(x);
      return (
        <G>
          {layers.map((col, k) => (
            <Path
              key={k}
              d={pathOf([
                ...sample((x) => band(k, x), x0, x1),
                ...sample((x) => band(k + 1, x), x0, x1).reverse(),
              ])}
              fill={col}
              stroke={c.chartInk}
              strokeWidth={0.8}
            />
          ))}
          <Path
            d={pathOf([
              ...sample((x) => band(0, x), x0, x1),
              [x1, band(5, x1)],
              ...sample((x) => band(5, x), x0, x1).reverse(),
            ])}
            fill={url(ids.light)}
          />
          {/* Squeezed from both sides. */}
          <CurveArrow a={[4, 130]} b={[38, 130]} c={c} />
          <CurveArrow a={[356, 130]} b={[322, 130]} c={c} />
          {label(c, 20, 112, 'squeeze', 'start', true)}
          {label(c, 112, 34, 'anticline (arch)', 'middle', true)}
          {label(c, 214, 232, 'syncline (trough)', 'middle', true)}
          {label(c, 112, 250, 'oldest rock in the core')}
          {leader(c, [112, 240], [112, 178])}
        </G>
      );
    }
    case 'normalFault':
    case 'reverseFault': {
      // Two blocks of layered rock on a fault dipping left; the hanging wall (left, above the
      // fault) slips down when pulled apart (normal) or up when squeezed (reverse).
      const normal = kind === 'normalFault';
      const off = normal ? 26 : -26;
      const top = 96;
      const bottom = 236;
      const x0 = 34;
      const x1 = 326;
      const fa: Pt = [214, top - 40];
      const fb: Pt = [146, bottom + 10];
      const layers = [c.rock1, c.rock2, c.rock3, c.rock4, c.rock5, c.rock6];
      const block = (hanging: boolean) => {
        const shift = hanging ? off : 0;
        return layers.map((col, k) => {
          const y0 = Math.max(top + shift, top + k * 26 + shift);
          const y1 = top + (k + 1) * 26 + shift;
          let poly: Pt[] = [
            [x0, y0],
            [x1, y0],
            [x1, y1],
            [x0, y1],
          ];
          poly = clip(poly, fa, fb, !hanging);
          poly = clip(poly, [0, bottom], [BOARD_W, bottom], true);
          if (poly.length < 3) return null;
          return (
            <Path
              key={`${hanging}${k}`}
              d={pathOf(poly)}
              fill={col}
              stroke={c.chartInk}
              strokeWidth={0.7}
            />
          );
        });
      };
      const tAt = (y: number) => (y - fa[1]) / (fb[1] - fa[1]);
      const fx = (y: number) => fa[0] + (fb[0] - fa[0]) * tAt(y);
      const hw = normal ? top + off : top + off;
      return (
        <G>
          {block(false)}
          {block(true)}
          {/* The fault plane. */}
          <Path
            d={`M ${fx(Math.min(top, hw) - 4)} ${Math.min(top, hw) - 4} L ${fx(bottom)} ${bottom}`}
            stroke={c.chartHighlight}
            strokeWidth={chart.strokeHeavy}
          />
          {/* Half arrows: which way each side moved along the fault. */}
          <CurveArrow
            a={[fx(160) - 18, normal ? 146 : 184]}
            b={[fx(160) - 18 - 12, normal ? 176 : 150]}
            c={c}
          />
          <CurveArrow
            a={[fx(160) + 16, normal ? 182 : 150]}
            b={[fx(160) + 16 + 12, normal ? 152 : 184]}
            c={c}
          />
          {/* The stress: pulled apart, or squeezed. */}
          {normal ? (
            <G>
              <CurveArrow a={[40, 40]} b={[4, 40]} c={c} />
              <CurveArrow a={[320, 40]} b={[356, 40]} c={c} />
              {label(c, 180, 30, 'pulled apart (tension)', 'middle', true)}
            </G>
          ) : (
            <G>
              <CurveArrow a={[4, 40]} b={[40, 40]} c={c} />
              <CurveArrow a={[356, 40]} b={[320, 40]} c={c} />
              {label(c, 180, 30, 'squeezed (compression)', 'middle', true)}
            </G>
          )}
          {label(c, 80, normal ? 110 : 62, 'hanging wall', 'middle')}
          {label(c, 280, 86, 'footwall', 'middle')}
          {label(c, fx(bottom) + 8, 252, 'fault', 'start', true)}
        </G>
      );
    }
    case 'strikeSlip': {
      // Seen from above: two blocks slide past each other; a stream across the fault is offset.
      const fx = (y: number) => 172 + (y - 30) * 0.08;
      return (
        <G>
          <Rect x={20} y={30} width={320} height={200} rx={6} fill={c.landGrass} />
          <Rect x={20} y={30} width={320} height={200} rx={6} fill={url(ids.light)} />
          <Path
            d={`M ${fx(30)} 30 L ${fx(230)} 230`}
            stroke={c.chartHighlight}
            strokeWidth={chart.strokeHeavy}
          />
          {/* The stream, offset where it crosses. */}
          <Path
            d={`M 20 118 C 70 110 120 128 ${fx(122)} 122 L ${fx(122)} 154`}
            stroke={c.water}
            strokeWidth={7}
            fill="none"
            strokeLinejoin="round"
          />
          <Path
            d={`M ${fx(154)} 154 C 230 160 290 146 340 152`}
            stroke={c.water}
            strokeWidth={7}
            fill="none"
          />
          {/* A fence, offset the same amount. */}
          <Path
            d={`M 60 70 L ${fx(70) - 2} 70 M ${fx(102) + 2} 102 L 330 102`}
            stroke={c.woodDark}
            strokeWidth={2.5}
            strokeDasharray="8 3"
          />
          <CurveArrow a={[96, 214]} b={[96, 172]} c={c} />
          <CurveArrow a={[260, 180]} b={[260, 222]} c={c} />
          {label(c, fx(30) + 8, 22, 'fault (seen from above)', 'start', true)}
          {label(c, 96, 250, 'this block moves one way', 'middle')}
          {label(c, 262, 250, 'this one the other way', 'middle')}
          {label(c, 250, 132, 'stream offset', 'middle')}
        </G>
      );
    }
    case 'vValley': {
      // A river cutting down makes a narrow V; its sides wear back as it cuts.
      const surf = 72;
      const floor = 192;
      const v = (x: number) =>
        x < 90 || x > 270 ? surf : floor - (floor - surf) * (Math.abs(x - mid) / 90) ** 0.85;
      const layers = [c.rock1, c.rock3, c.rock2, c.rock4, c.rock5];
      return (
        <G>
          {layers.map((col, k) => {
            const y0 = surf + k * 38;
            const y1 = y0 + 38;
            const pts = sample((x) => Math.min(Math.max(v(x), y0), y1), 0, BOARD_W, 120);
            return <Path key={k} d={pathOf([...pts, [BOARD_W, y1], [0, y1]])} fill={col} />;
          })}
          <Path
            d={pathOf([...sample(v, 0, BOARD_W, 120), [BOARD_W, H], [0, H]])}
            fill={url(ids.light)}
          />
          <Path
            d={pathOf(sample(v, 0, BOARD_W, 120), false)}
            stroke={c.chartInk}
            strokeWidth={1.2}
            fill="none"
          />
          <Path
            d={`M 0 ${surf} H 90 M 270 ${surf} H ${BOARD_W}`}
            stroke={c.landGrass}
            strokeWidth={4}
          />
          <Path
            d={`M ${mid - 12} ${floor - 6} Q ${mid} ${floor + 4} ${mid + 12} ${floor - 6} Z`}
            fill={url(ids.water)}
          />
          <CurveArrow a={[mid, 120]} b={[mid, 168]} c={c} />
          {label(c, mid, 106, 'the river cuts down', 'middle', true)}
          {label(c, 60, 50, 'steep sides', 'middle')}
          {leader(c, [70, 56], [110, 104])}
          {label(c, 300, 50, 'narrow V', 'middle', true)}
        </G>
      );
    }
    case 'uValley': {
      // A glacier widens and deepens a valley into a U: steep walls, a broad flat floor.
      const surf = 62;
      const floor = 196;
      const u = (x: number) => {
        const d = Math.abs(x - mid);
        if (d > 140) return surf;
        if (d < 60) return floor;
        return floor - (floor - surf) * ((d - 60) / 80) ** 2.2;
      };
      return (
        <G>
          <Path d={pathOf([...sample(u, 0, BOARD_W, 140), [BOARD_W, H], [0, H]])} fill={c.rock2} />
          <Path
            d={pathOf([...sample(u, 0, BOARD_W, 140), [BOARD_W, H], [0, H]])}
            fill={url(ids.light)}
          />
          {/* Where the ice once reached, dashed. */}
          <Path
            d={pathOf([...sample((x) => Math.max(u(x), 82), 52, 308, 100)])}
            fill={c.ice}
            fillOpacity={0.55}
            stroke={c.glassEdge}
            strokeDasharray={chart.dash}
          />
          <Path
            d={pathOf(sample(u, 0, BOARD_W, 140), false)}
            stroke={c.chartInk}
            strokeWidth={1.2}
            fill="none"
          />
          <Path
            d={`M 0 ${surf} H 40 M 320 ${surf} H ${BOARD_W}`}
            stroke={c.landGrass}
            strokeWidth={4}
          />
          <Path
            d={`M ${mid - 10} ${floor - 3} Q ${mid} ${floor + 3} ${mid + 10} ${floor - 3} Z`}
            fill={url(ids.water)}
          />
          {label(c, mid, 110, 'the glacier that carved it', 'middle')}
          {label(c, mid, 226, 'broad flat floor', 'middle', true)}
          {label(c, 50, 42, 'steep walls', 'middle')}
          {leader(c, [56, 48], [74, 110])}
          {label(c, 300, 42, 'wide U', 'middle', true)}
        </G>
      );
    }
    case 'meander': {
      // Seen from above: the river swings in loops; fast water cuts the outer bank, slow water
      // drops sand on the inner bend; a loop cut off becomes an oxbow lake.
      const river =
        'M 0 70 C 60 70 70 190 130 190 C 190 190 190 70 250 70 C 300 70 320 150 360 150';
      return (
        <G>
          <Rect x={0} y={0} width={BOARD_W} height={H - 22} fill={c.landGrass} />
          <Rect x={0} y={0} width={BOARD_W} height={H - 22} fill={url(ids.light)} />
          {/* Point bars: sand on the inside of each bend. */}
          <Path
            d="M 108 176 Q 130 150 152 176 Q 130 168 108 176 Z"
            fill={c.landSand}
            stroke={c.chartInk}
            strokeWidth={0.6}
          />
          <Path
            d="M 228 84 Q 250 110 272 84 Q 250 92 228 84 Z"
            fill={c.landSand}
            stroke={c.chartInk}
            strokeWidth={0.6}
          />
          <Path d={river} stroke={c.water} strokeWidth={14} fill="none" />
          <Path d={river} stroke={c.waterTop} strokeWidth={3} fill="none" opacity={0.6} />
          {/* Cut banks: the outside of each bend, worn back. */}
          <Path d="M 100 204 Q 130 212 160 204" stroke={c.soilDark} strokeWidth={3} fill="none" />
          <Path d="M 220 56 Q 250 48 280 56" stroke={c.soilDark} strokeWidth={3} fill="none" />
          {/* An oxbow lake, a loop the river left behind. */}
          <Path
            d="M 22 214 C 4 176 60 150 56 204"
            stroke={c.water}
            strokeWidth={9}
            strokeLinecap="round"
            fill="none"
          />
          <CurveArrow a={[176, 136]} b={[190, 104]} c={c} width={2} />
          {label(c, 130, 230, 'cut bank: erosion', 'middle', true)}
          {label(c, 250, 42, 'cut bank', 'middle', true)}
          {label(c, 130, 150, 'point bar: sand dropped', 'middle')}
          {label(c, 4, 232, 'oxbow lake', 'start')}
          {label(c, 300, 216, 'seen from above', 'middle')}
        </G>
      );
    }
    case 'aquifer': {
      // Water soaks down through the unsaturated zone to the water table; below it the sand and
      // gravel are saturated (the aquifer), resting on clay that water can't pass.
      const surface = (x: number) => 64 + x * 0.05 + (x > 240 ? Math.min((x - 240) * 1.2, 72) : 0);
      const table = (x: number) => 118 + x * 0.06;
      const lakeTop = table(300);
      // Where the dipping land meets the lake's level.
      const lakeFrom = (lakeTop - 64 + 288) / 1.25;
      const clayTop = 186;
      return (
        <G>
          <Rect x={0} y={0} width={BOARD_W} height={H} fill={c.card} />
          {/* Unsaturated zone. */}
          <Path
            d={pathOf([...sample(surface, 0, BOARD_W), ...sample(table, 0, BOARD_W).reverse()])}
            fill={c.landSand}
          />
          {/* Saturated zone: the aquifer. */}
          <Path
            d={pathOf([...sample(table, 0, BOARD_W), [BOARD_W, clayTop], [0, clayTop]])}
            fill={c.landSand}
          />
          <Path
            d={pathOf([...sample(table, 0, BOARD_W), [BOARD_W, clayTop], [0, clayTop]])}
            fill={c.water}
            fillOpacity={0.45}
          />
          {Array.from({ length: 120 }, (_, i) => {
            const x = rnd(i, 3) * BOARD_W;
            const y = surface(x) + 3 + rnd(i, 4) * (clayTop - surface(x) - 6);
            return <Circle key={i} cx={x} cy={y} r={1.4} fill={c.soilDark} opacity={0.4} />;
          })}
          {/* The lake where the land dips below the water table. */}
          <Path
            d={pathOf([...sample(surface, lakeFrom, BOARD_W), [BOARD_W, lakeTop]])}
            fill={url(ids.water)}
          />
          <Path
            d={pathOf(sample(surface, 0, BOARD_W), false)}
            stroke={c.landGrass}
            strokeWidth={4}
            fill="none"
          />
          {/* Clay, then bedrock. */}
          <Rect x={0} y={clayTop} width={BOARD_W} height={30} fill={c.landClay} />
          <Rect x={0} y={clayTop + 30} width={BOARD_W} height={H - clayTop - 30} fill={c.rock5} />
          <Path
            d={pathOf(sample(table, 0, BOARD_W), false)}
            stroke={c.waterDeep}
            strokeWidth={2}
            strokeDasharray={chart.dash}
            fill="none"
          />
          <Path d={`M 150 ${table(150) - 12} l 6 8 l 6 -8 Z`} fill={c.waterDeep} />
          {/* A well reaching below the water table, its water at the table's level. */}
          <Rect
            x={86}
            y={surface(90) - 22}
            width={10}
            height={160 - surface(90) + 22}
            fill={c.metal}
            stroke={c.chartInk}
            strokeWidth={0.8}
          />
          <Rect x={88} y={table(90)} width={6} height={160 - table(90)} fill={c.water} />
          <Rect x={78} y={surface(90) - 30} width={26} height={9} rx={2} fill={c.metalDark} />
          {/* Rain soaking in. */}
          {[30, 124, 176].map((x) => (
            <CurveArrow
              key={x}
              a={[x, 20]}
              b={[x, surface(x) + 28]}
              c={c}
              color={c.waterDeep}
              width={1.6}
              halo={false}
            />
          ))}
          <CurveArrow a={[180, 158]} b={[250, 162]} c={c} width={2} />
          {label(c, 260, 22, 'rain soaks in', 'middle')}
          {label(c, 200, 100, 'unsaturated zone', 'start')}
          {label(c, 20, table(20) - 6, 'water table', 'start', true)}
          {label(c, 180, 178, 'aquifer: saturated sand and gravel', 'middle', true)}
          {label(c, 180, clayTop + 20, 'clay: water can’t pass', 'middle')}
          {label(c, 60, 250, 'well', 'middle')}
          {leader(c, [70, 242], [88, 170])}
        </G>
      );
    }
    case 'dunes': {
      // Wind rolls and bounces sand up the gentle windward side; at the crest it slides down the
      // steep slip face at the angle of repose (about 33°), so the dune creeps downwind.
      const crest: Pt = [236, GROUND - 60];
      const toe = crest[0] + 60 / Math.tan((33 * Math.PI) / 180);
      const dune: Pt[] = [
        [16, GROUND],
        [120, GROUND - 26],
        [200, GROUND - 52],
        crest,
        [toe, GROUND],
      ];
      return (
        <G>
          <Rect x={0} y={GROUND} width={BOARD_W} height={H - GROUND} fill={c.landSand} />
          <Path d={pathOf(dune)} fill={c.landSand} stroke={c.chartInk} strokeWidth={1} />
          <Path d={pathOf(dune)} fill={url(ids.light)} />
          <Rect
            x={0}
            y={GROUND}
            width={BOARD_W}
            height={H - GROUND}
            fill={c.shade}
            opacity={0.08}
          />
          {/* Grains bouncing up the windward side. */}
          {[60, 104, 148, 190].map((x, i) => {
            const y = GROUND - ((x - 16) / (crest[0] - 16)) * 60;
            return (
              <G key={x}>
                <Path
                  d={`M ${x} ${y} q 10 -${14 + i * 2} 20 -6`}
                  stroke={c.chartMuted}
                  strokeDasharray="2 2"
                  fill="none"
                />
                <Circle cx={x + 20} cy={y - 6} r={2} fill={c.soilDark} />
              </G>
            );
          })}
          {/* Sand sliding down the slip face. */}
          {[0.3, 0.55, 0.8].map((t) => (
            <Path
              key={t}
              d={`M ${crest[0] + (toe - crest[0]) * t - 6} ${crest[1] + 60 * t - 10} l 8 11`}
              stroke={c.soilDark}
              strokeWidth={1.5}
            />
          ))}
          <Path
            d={`M ${toe - 40} ${GROUND} A 40 40 0 0 1 ${toe - 40 * Math.cos(0.576)} ${GROUND - 40 * Math.sin(0.576)}`}
            stroke={c.chartHighlight}
            strokeWidth={chart.stroke}
            fill="none"
          />
          {label(c, toe - 46, GROUND - 8, '33°', 'end', true)}
          <CurveArrow a={[20, 60]} b={[110, 60]} c={c} />
          {label(c, 64, 46, 'wind', 'middle', true)}
          {label(c, 110, 214, 'gentle windward side', 'middle')}
          {label(c, 300, 214, 'steep slip face', 'middle')}
          {label(c, crest[0], crest[1] - 12, 'crest', 'middle', true)}
          {label(c, 180, 246, 'the dune moves downwind', 'middle')}
        </G>
      );
    }
  }
}
