import type { ReactNode } from 'react';
import Svg, {
  Circle,
  Ellipse,
  G,
  Line,
  Path,
  Polygon,
  Polyline,
  Rect,
  Text as SvgText,
} from 'react-native-svg';

import type { CardFigure as Spec, CardIcon } from '@/data/modules/layouts';
import { chart } from '@/theme';

/** Height of every card figure; most are square. */
const S = 48;
const M = 6;
/** Side of a polygon drawn with its marks: bigger, so the ticks can be told apart. */
const MARKED = 64;

/** Width a figure is drawn at: square, or wider for bars, dots and lines. */
export function figureWidth(f: Spec): number {
  switch (f.kind) {
    case 'bar':
      return Math.max(S, 16 + (f.length + (f.units === 'offset' ? 2 : 0)) * 8 + 24);
    case 'fractionBars':
      return 96;
    case 'ray':
      return 80;
    case 'dots':
      return Math.max(S, Math.ceil(f.count / 2) * 11 + 10);
    case 'polygon':
      return f.marks ? MARKED : S;
    default:
      return S;
  }
}

/**
 * The drawing on a sort card or a sequence stage, in the text color, with shaded parts in
 * `shade`.
 */
export function CardFigureView({
  figure,
  ink,
  shade,
}: {
  figure: Spec;
  ink: string;
  shade: string;
}) {
  const w = figureWidth(figure);
  const h = figure.kind === 'polygon' && figure.marks ? MARKED : S;
  return (
    <Svg width={w} height={h}>
      <Drawing f={figure} w={w} ink={ink} shade={shade} />
    </Svg>
  );
}

function Drawing({ f, w, ink, shade }: { f: Spec; w: number; ink: string; shade: string }) {
  const line = { stroke: ink, strokeWidth: chart.stroke, strokeLinejoin: 'round' as const };
  switch (f.kind) {
    case 'lines': {
      const t = (f.angle * Math.PI) / 180;
      const L = (S - 2 * M) / 2;
      const along = (cx: number, cy: number, a: number) => (
        <Line
          key={`${cx}${cy}${a}`}
          x1={cx - L * Math.cos(a)}
          y1={cy + L * Math.sin(a)}
          x2={cx + L * Math.cos(a)}
          y2={cy - L * Math.sin(a)}
          {...line}
        />
      );
      if (f.parallel) {
        // Two lines the same way, offset across their direction.
        const ox = 8 * Math.sin(t);
        const oy = 8 * Math.cos(t);
        return (
          <G>
            {along(S / 2 - ox, S / 2 - oy, t)}
            {along(S / 2 + ox, S / 2 + oy, t)}
          </G>
        );
      }
      // One flat line and one at the angle, crossing in the middle.
      return (
        <G>
          {along(S / 2, S / 2, 0)}
          {along(S / 2, S / 2, t)}
        </G>
      );
    }
    case 'letter':
      return (
        <SvgText
          x={S / 2}
          y={S / 2 + 12}
          fontSize={34}
          fontWeight="700"
          fontFamily="sans-serif"
          textAnchor="middle"
          fill={ink}
        >
          {f.text}
        </SvgText>
      );
    case 'polygon':
      return <PolygonFigure f={f} ink={ink} />;
    case 'circle':
      return <Circle cx={S / 2} cy={S / 2} r={S / 2 - M} fill="none" {...line} />;
    case 'heart':
      return (
        <Path
          d={`M ${S / 2} ${S - M} L ${M} ${S / 2 - 4} A 9.5 9.5 0 0 1 ${S / 2} ${S / 2 - 12} A 9.5 9.5 0 0 1 ${S - M} ${S / 2 - 4} Z`}
          fill="none"
          {...line}
        />
      );
    case 'solid':
      return <Solid shape={f.shape} ink={ink} shade={shade} />;
    case 'cut':
      return <Cut f={f} ink={ink} shade={shade} />;
    case 'bar':
      return <Bar f={f} ink={ink} shade={shade} />;
    case 'dots': {
      const cols = Math.ceil(f.count / 2);
      const x0 = (w - (cols - 1) * 11) / 2;
      return (
        <G>
          {Array.from({ length: f.count }, (_, i) => (
            <Circle
              key={i}
              cx={x0 + (i % cols) * 11}
              cy={i < cols ? S / 2 - 7 : S / 2 + 7}
              r={4.5}
              fill={shade}
              stroke={ink}
              strokeWidth={1}
            />
          ))}
        </G>
      );
    }
    case 'icon':
      return <Icon icon={f.icon} ink={ink} shade={shade} />;
    case 'fractionBars': {
      const bw = w - 8;
      const bh = 12;
      const gap = 6;
      const y0 = (S - f.bars.length * bh - (f.bars.length - 1) * gap) / 2;
      return (
        <G>
          {f.bars.map(([n, d], b) => (
            <G key={b}>
              {Array.from({ length: d }, (_, i) => (
                <Rect
                  key={i}
                  x={4 + (i * bw) / d}
                  y={y0 + b * (bh + gap)}
                  width={bw / d}
                  height={bh}
                  fill={i < n ? shade : 'none'}
                  stroke={ink}
                  strokeWidth={1.25}
                />
              ))}
            </G>
          ))}
        </G>
      );
    }
    case 'ray': {
      const y = S / 2;
      const x1 = 10;
      const x2 = w - 10;
      if (f.point) return <Circle cx={w / 2} cy={y} r={4} fill={ink} />;
      const head = (x: number, dir: 1 | -1) => (
        <Path
          d={`M ${x - dir * 8} ${y - 5} L ${x} ${y} L ${x - dir * 8} ${y + 5}`}
          fill="none"
          {...line}
        />
      );
      return (
        <G>
          <Line x1={x1} y1={y} x2={x2} y2={y} {...line} />
          {f.arrows === 2 ? head(x1, -1) : <Circle cx={x1 + 2} cy={y} r={4} fill={ink} />}
          {f.arrows >= 1 ? head(x2, 1) : <Circle cx={x2 - 2} cy={y} r={4} fill={ink} />}
        </G>
      );
    }
  }
}

/**
 * A polygon from corners in a 0–100 box. A curved side bulges out from the middle of the
 * shape; marks are a small square in each square corner and matching ticks on equal sides.
 */
function PolygonFigure({ f, ink }: { f: Extract<Spec, { kind: 'polygon' }>; ink: string }) {
  const size = f.marks ? MARKED : S;
  const k = (size - 2 * M) / 100;
  const pts = f.points.map(([x, y]) => [M + x * k, M + y * k] as [number, number]);
  const line = { stroke: ink, strokeWidth: chart.stroke, strokeLinejoin: 'round' as const };
  if (f.open) {
    return <Polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" {...line} />;
  }
  const n = pts.length;
  const cx = pts.reduce((s, p) => s + p[0], 0) / n;
  const cy = pts.reduce((s, p) => s + p[1], 0) / n;
  const marks: ReactNode[] = [];
  if (f.marks) {
    // Square corners: the two sides meet at 90° (dot product near 0).
    pts.forEach((p, i) => {
      const a = pts[(i + n - 1) % n]!;
      const b = pts[(i + 1) % n]!;
      const u = [a[0] - p[0], a[1] - p[1]];
      const v = [b[0] - p[0], b[1] - p[1]];
      const lu = Math.hypot(u[0]!, u[1]!);
      const lv = Math.hypot(v[0]!, v[1]!);
      if (Math.abs((u[0]! * v[0]! + u[1]! * v[1]!) / (lu * lv)) < 0.03) {
        const q = 5;
        const ux = (u[0]! / lu) * q;
        const uy = (u[1]! / lu) * q;
        const vx = (v[0]! / lv) * q;
        const vy = (v[1]! / lv) * q;
        marks.push(
          <Path
            key={`c${i}`}
            d={`M ${p[0] + ux} ${p[1] + uy} L ${p[0] + ux + vx} ${p[1] + uy + vy} L ${p[0] + vx} ${p[1] + vy}`}
            fill="none"
            stroke={ink}
            strokeWidth={1}
          />,
        );
      }
    });
    // Equal sides: sides of the same length (in the 0–100 box) share a number of ticks.
    const lengths = f.points.map((p, i) => {
      const q = f.points[(i + 1) % n]!;
      return Math.hypot(q[0] - p[0], q[1] - p[1]);
    });
    const groups: number[] = [];
    lengths.forEach((len) => {
      const same = lengths.filter((l) => Math.abs(l - len) < 1.5).length;
      if (same >= 2 && !groups.some((g) => Math.abs(g - len) < 1.5)) groups.push(len);
    });
    lengths.forEach((len, i) => {
      const g = groups.findIndex((x) => Math.abs(x - len) < 1.5);
      if (g < 0 || i === f.curved) return;
      const p = pts[i]!;
      const q = pts[(i + 1) % n]!;
      const mx = (p[0] + q[0]) / 2;
      const my = (p[1] + q[1]) / 2;
      const l = Math.hypot(q[0] - p[0], q[1] - p[1]);
      const tx = (q[0] - p[0]) / l;
      const ty = (q[1] - p[1]) / l;
      for (let t = 0; t <= g; t++) {
        const off = (t - g / 2) * 3;
        marks.push(
          <Line
            key={`t${i}.${t}`}
            x1={mx + tx * off - ty * 4}
            y1={my + ty * off + tx * 4}
            x2={mx + tx * off + ty * 4}
            y2={my + ty * off - tx * 4}
            stroke={ink}
            strokeWidth={1.25}
          />,
        );
      }
    });
  }
  if (f.curved === undefined) {
    return (
      <G>
        <Polygon points={pts.map((p) => p.join(',')).join(' ')} fill="none" {...line} />
        {marks}
      </G>
    );
  }
  // One side as a curve bulging away from the middle of the shape.
  const d = pts
    .map((p, i) => {
      const q = pts[(i + 1) % n]!;
      if (i !== f.curved) return `L ${q[0]} ${q[1]}`;
      const mx = (p[0] + q[0]) / 2;
      const my = (p[1] + q[1]) / 2;
      const ox = mx - cx;
      const oy = my - cy;
      const ol = Math.hypot(ox, oy) || 1;
      const bulge = Math.hypot(q[0] - p[0], q[1] - p[1]) * 0.45;
      return `Q ${mx + (ox / ol) * bulge} ${my + (oy / ol) * bulge} ${q[0]} ${q[1]}`;
    })
    .join(' ');
  return (
    <G>
      <Path d={`M ${pts[0]![0]} ${pts[0]![1]} ${d} Z`} fill="none" {...line} />
      {marks}
    </G>
  );
}

function Solid({
  shape,
  ink,
  shade,
}: {
  shape: Extract<Spec, { kind: 'solid' }>['shape'];
  ink: string;
  shade: string;
}) {
  const line = { stroke: ink, strokeWidth: chart.stroke, strokeLinejoin: 'round' as const };
  const hidden = { stroke: ink, strokeWidth: 1, strokeDasharray: '3 2' };
  switch (shape) {
    case 'sphere':
      return (
        <G>
          <Circle cx={24} cy={24} r={18} fill={shade} fillOpacity={0.25} {...line} />
          <Path d="M 6 24 A 18 6 0 0 0 42 24" fill="none" stroke={ink} strokeWidth={1} />
          <Path d="M 6 24 A 18 6 0 0 1 42 24" fill="none" {...hidden} />
        </G>
      );
    case 'cube':
    case 'box': {
      const fw = shape === 'cube' ? 24 : 32;
      const fh = shape === 'cube' ? 24 : 18;
      const x = 6;
      const y = 42 - fh;
      const dx = 10;
      const dy = 9;
      return (
        <G>
          <Path
            d={`M ${x} ${y} l ${dx} ${-dy} h ${fw} l ${-dx} ${dy} Z`}
            fill={shade}
            fillOpacity={0.15}
            {...line}
          />
          <Path
            d={`M ${x + fw} ${y} l ${dx} ${-dy} v ${fh} l ${-dx} ${dy} Z`}
            fill={shade}
            fillOpacity={0.4}
            {...line}
          />
          <Rect x={x} y={y} width={fw} height={fh} fill="none" {...line} />
        </G>
      );
    }
    case 'cylinder':
      return (
        <G>
          <Path
            d="M 10 12 L 10 38 A 14 5 0 0 0 38 38 L 38 12"
            fill={shade}
            fillOpacity={0.25}
            {...line}
          />
          <Path d="M 10 38 A 14 5 0 0 1 38 38" fill="none" {...hidden} />
          <Ellipse cx={24} cy={12} rx={14} ry={5} fill={shade} fillOpacity={0.15} {...line} />
        </G>
      );
    case 'cone':
      return (
        <G>
          <Path d="M 24 5 L 10 38 A 14 5 0 0 0 38 38 Z" fill={shade} fillOpacity={0.25} {...line} />
          <Path d="M 10 38 A 14 5 0 0 1 38 38" fill="none" {...hidden} />
        </G>
      );
  }
}

/** A shape cut into parts. Unequal parts are sized 1, 2, 3 … so the difference is plain. */
function Cut({ f, ink, shade }: { f: Extract<Spec, { kind: 'cut' }>; ink: string; shade: string }) {
  const line = { stroke: ink, strokeWidth: chart.stroke, strokeLinejoin: 'round' as const };
  const shaded = f.shaded ?? 0;
  const weights = Array.from({ length: f.parts }, (_, i) => (f.equal ? 1 : i + 1));
  const total = weights.reduce((a, b) => a + b, 0);
  const starts = weights.map((_, i) => weights.slice(0, i).reduce((a, b) => a + b, 0) / total);
  const fill = (i: number) => (i < shaded ? shade : 'none');
  if (f.shape === 'circle') {
    const cx = 24;
    const cy = 24;
    const r = 18;
    if (f.parts === 1) return <Circle cx={cx} cy={cy} r={r} fill={fill(0)} {...line} />;
    const at = (t: number) => {
      const a = -Math.PI / 2 + 2 * Math.PI * t;
      return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
    };
    return (
      <G>
        {weights.map((wt, i) => {
          const [x1, y1] = at(starts[i]!);
          const [x2, y2] = at(starts[i]! + wt / total);
          const large = wt / total > 0.5 ? 1 : 0;
          return (
            <Path
              key={i}
              d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`}
              fill={fill(i)}
              {...line}
            />
          );
        })}
      </G>
    );
  }
  const W = f.shape === 'square' ? 36 : 40;
  const H = f.shape === 'square' ? 36 : 24;
  const x0 = (S - W) / 2;
  const y0 = (S - H) / 2;
  if (f.cuts === 'diagonal' && (f.parts === 2 || f.parts === 4)) {
    const c = [x0 + W / 2, y0 + H / 2];
    const corners = [
      [x0, y0],
      [x0 + W, y0],
      [x0 + W, y0 + H],
      [x0, y0 + H],
    ];
    const tris =
      f.parts === 2
        ? [
            [corners[0], corners[1], corners[2]],
            [corners[0], corners[2], corners[3]],
          ]
        : [0, 1, 2, 3].map((i) => [corners[i], corners[(i + 1) % 4], c]);
    return (
      <G>
        {tris.map((t, i) => (
          <Polygon key={i} points={t.map((p) => p!.join(',')).join(' ')} fill={fill(i)} {...line} />
        ))}
      </G>
    );
  }
  if (f.equal && f.parts === 4 && f.shape === 'square') {
    return (
      <G>
        {[0, 1, 2, 3].map((i) => (
          <Rect
            key={i}
            x={x0 + (i % 2) * (W / 2)}
            y={y0 + Math.floor(i / 2) * (H / 2)}
            width={W / 2}
            height={H / 2}
            fill={fill(i)}
            {...line}
          />
        ))}
      </G>
    );
  }
  return (
    <G>
      {weights.map((wt, i) => (
        <Rect
          key={i}
          x={x0 + starts[i]! * W}
          y={y0}
          width={(wt / total) * W}
          height={H}
          fill={fill(i)}
          {...line}
        />
      ))}
    </G>
  );
}

/**
 * A ribbon and the cubes that measure it. Laid right, the cubes start where the ribbon
 * starts and touch end to end; the other ways show a common mistake.
 */
function Bar({ f, ink, shade }: { f: Extract<Spec, { kind: 'bar' }>; ink: string; shade: string }) {
  const u = 8;
  const x0 = 8;
  const start = f.units === 'offset' ? x0 + 2 * u : x0;
  const cubes =
    f.units === undefined
      ? []
      : Array.from({ length: f.length }, (_, i) => {
          const step = f.units === 'gap' ? u + 3 : f.units === 'overlap' ? u * 0.6 : u;
          return x0 + i * step;
        });
  return (
    <G>
      <Rect
        x={start}
        y={f.units ? 10 : 18}
        width={f.length * u}
        height={10}
        rx={3}
        fill={shade}
        stroke={ink}
        strokeWidth={1.25}
      />
      {cubes.map((x, i) => (
        <Rect
          key={i}
          x={x}
          y={26}
          width={u}
          height={u}
          fill="none"
          stroke={ink}
          strokeWidth={1.25}
        />
      ))}
      {f.units ? (
        <Line
          x1={start}
          y1={4}
          x2={start}
          y2={40}
          stroke={ink}
          strokeWidth={1}
          strokeDasharray="2 2"
        />
      ) : null}
    </G>
  );
}

/** Small drawings of everyday things, in outline with one shaded part. */
function Icon({ icon, ink, shade }: { icon: CardIcon; ink: string; shade: string }) {
  const line = {
    stroke: ink,
    strokeWidth: chart.stroke,
    strokeLinejoin: 'round' as const,
    strokeLinecap: 'round' as const,
  };
  switch (icon) {
    case 'sun':
      return (
        <G>
          <Circle cx={24} cy={24} r={9} fill={shade} {...line} />
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i * Math.PI) / 4;
            return (
              <Line
                key={i}
                x1={24 + 13 * Math.cos(a)}
                y1={24 + 13 * Math.sin(a)}
                x2={24 + 19 * Math.cos(a)}
                y2={24 + 19 * Math.sin(a)}
                {...line}
              />
            );
          })}
        </G>
      );
    case 'moon':
      return <Path d="M 30 8 A 16 16 0 1 0 30 40 A 12 16 0 1 1 30 8 Z" fill={shade} {...line} />;
    case 'feather':
      return (
        <G>
          <Path
            d="M 10 40 C 14 20 26 8 40 6 C 38 20 28 34 12 38 Z"
            fill={shade}
            fillOpacity={0.4}
            {...line}
          />
          <Line x1={8} y1={42} x2={34} y2={14} {...line} />
        </G>
      );
    case 'leaf':
      return (
        <G>
          <Path
            d="M 8 40 C 8 18 22 8 40 8 C 40 28 28 40 8 40 Z"
            fill={shade}
            fillOpacity={0.4}
            {...line}
          />
          <Line x1={8} y1={40} x2={32} y2={16} {...line} />
        </G>
      );
    case 'crayon':
      return (
        <G transform="rotate(-30 24 24)">
          <Rect x={8} y={19} width={26} height={10} fill={shade} {...line} />
          <Path d="M 34 19 L 42 24 L 34 29 Z" fill="none" {...line} />
        </G>
      );
    case 'sock':
      return (
        <Path
          d="M 16 6 H 28 V 26 L 38 32 A 6 6 0 0 1 34 42 L 18 38 A 6 6 0 0 1 16 34 Z"
          fill={shade}
          fillOpacity={0.4}
          {...line}
        />
      );
    case 'brick':
      return (
        <G>
          <Rect x={5} y={14} width={38} height={20} fill={shade} fillOpacity={0.5} {...line} />
          <Line x1={5} y1={24} x2={43} y2={24} stroke={ink} strokeWidth={1} />
          <Line x1={24} y1={14} x2={24} y2={24} stroke={ink} strokeWidth={1} />
          <Line x1={14} y1={24} x2={14} y2={34} stroke={ink} strokeWidth={1} />
          <Line x1={34} y1={24} x2={34} y2={34} stroke={ink} strokeWidth={1} />
        </G>
      );
    case 'watermelon':
      return (
        <G>
          <Ellipse cx={24} cy={24} rx={19} ry={14} fill={shade} fillOpacity={0.4} {...line} />
          {[-8, 0, 8].map((dx) => (
            <Path
              key={dx}
              d={`M ${24 + dx} 11 Q ${24 + dx * 1.6} 24 ${24 + dx} 37`}
              fill="none"
              stroke={ink}
              strokeWidth={1}
            />
          ))}
        </G>
      );
    case 'backpack':
      return (
        <G>
          <Path d="M 18 10 A 6 6 0 0 1 30 10" fill="none" {...line} />
          <Rect
            x={11}
            y={10}
            width={26}
            height={32}
            rx={7}
            fill={shade}
            fillOpacity={0.4}
            {...line}
          />
          <Rect
            x={16}
            y={26}
            width={16}
            height={10}
            rx={2}
            fill="none"
            stroke={ink}
            strokeWidth={1.25}
          />
        </G>
      );
    case 'bowling ball':
      return (
        <G>
          <Circle cx={24} cy={24} r={18} fill={shade} {...line} />
          {[
            [19, 16],
            [27, 15],
            [23, 22],
          ].map(([x, y]) => (
            <Circle key={x} cx={x} cy={y} r={2.2} fill={ink} />
          ))}
        </G>
      );
    case 'paper clip':
      return (
        <Path
          d="M 18 40 V 12 A 6 6 0 0 1 30 12 V 34 A 4 4 0 0 1 22 34 V 16"
          fill="none"
          {...line}
        />
      );
    case 'door':
      return (
        <G>
          <Rect x={13} y={4} width={22} height={40} fill={shade} fillOpacity={0.3} {...line} />
          <Circle cx={30} cy={25} r={1.8} fill={ink} />
        </G>
      );
    case 'eraser':
      return (
        <G transform="rotate(-20 24 24)">
          <Rect x={8} y={17} width={32} height={14} rx={3} fill="none" {...line} />
          <Rect x={8} y={17} width={12} height={14} rx={3} fill={shade} {...line} />
        </G>
      );
    case 'bed':
      return (
        <G>
          <Path d="M 6 14 V 40 M 42 26 V 40 M 6 30 H 42" fill="none" {...line} />
          <Rect x={6} y={24} width={36} height={6} fill={shade} fillOpacity={0.5} {...line} />
          <Rect
            x={9}
            y={19}
            width={10}
            height={5}
            rx={2}
            fill="none"
            stroke={ink}
            strokeWidth={1.25}
          />
        </G>
      );
    case 'bus':
      return (
        <G>
          <Rect
            x={4}
            y={12}
            width={40}
            height={22}
            rx={4}
            fill={shade}
            fillOpacity={0.4}
            {...line}
          />
          {[8, 18, 28].map((x) => (
            <Rect
              key={x}
              x={x}
              y={16}
              width={7}
              height={7}
              fill="none"
              stroke={ink}
              strokeWidth={1.25}
            />
          ))}
          <Circle cx={13} cy={36} r={4} fill={ink} />
          <Circle cx={35} cy={36} r={4} fill={ink} />
        </G>
      );
  }
}
