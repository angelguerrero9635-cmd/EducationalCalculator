/**
 * The right triangle of a trig page as a real thing (TriangleSolver's `scene`): A at the
 * bottom left, the right angle C at the bottom right, B above C. A wooden ramp, a wooden
 * ladder against a brick wall, or the line of sight from an eye to a treetop.
 */
import { Circle, Defs, G, Line, Polygon, Rect } from 'react-native-svg';

import { chart, usePalette } from '@/theme';

import { Ball, FloorShadow, TopLight, url, usePaintIds } from './paint';
import type { Pt } from './geoMarks';

export function TriangleScene({
  kind,
  pts,
  eye,
  width,
}: {
  kind: 'ramp' | 'ladder' | 'sight';
  /** A, B, C in canvas pixels. */
  pts: Pt[];
  /** The eye's height above the ground in pixels (sight). */
  eye: number;
  width: number;
}) {
  const c = usePalette();
  const ids = usePaintIds('light', 'leaf', 'wall');
  const [A, B, C] = pts as [Pt, Pt, Pt];
  const ground = C[1] + (kind === 'sight' ? eye : 0);
  const groundLine = (
    <Line
      x1={kind === 'sight' ? A[0] - 6 : Math.max(0, A[0] - 30)}
      y1={ground}
      x2={Math.min(width, C[0] + 40)}
      y2={ground}
      stroke={c.soilDark}
      strokeWidth={chart.stroke}
    />
  );
  if (kind === 'ramp')
    return (
      <G>
        <Defs>
          <TopLight id={ids.light} />
        </Defs>
        <FloorShadow cx={(A[0] + C[0]) / 2 + 4} cy={ground + 2} rx={(C[0] - A[0]) / 2 + 6} ry={3} />
        <Polygon points={[A, B, C].map((p) => p.join(',')).join(' ')} fill={c.wood} />
        <Polygon points={[A, B, C].map((p) => p.join(',')).join(' ')} fill={url(ids.light)} />
        {groundLine}
      </G>
    );
  if (kind === 'ladder') {
    const len = Math.hypot(B[0] - A[0], B[1] - A[1]) || 1;
    const [ux, uy] = [(B[0] - A[0]) / len, (B[1] - A[1]) / len];
    const [nx, ny] = [-uy * 5, ux * 5];
    const rungs = Math.max(2, Math.floor(len / 16));
    const wallTop = Math.max(4, B[1] - 16);
    return (
      <G>
        <Defs>
          <TopLight id={ids.wall} />
        </Defs>
        <Rect x={C[0]} y={wallTop} width={20} height={ground - wallTop} fill={c.ladderWall} />
        {Array.from({ length: Math.floor((ground - wallTop) / 8) }, (_, i) => (
          <Line
            key={`b${i}`}
            x1={C[0]}
            y1={ground - (i + 1) * 8}
            x2={C[0] + 20}
            y2={ground - (i + 1) * 8}
            stroke={c.ladderWallDark}
            strokeWidth={1}
          />
        ))}
        <Rect x={C[0]} y={wallTop} width={20} height={ground - wallTop} fill={url(ids.wall)} />
        {Array.from({ length: rungs }, (_, i) => {
          const t = ((i + 0.5) / rungs) * len;
          const x = A[0] + ux * t;
          const y = A[1] + uy * t;
          return (
            <Line
              key={`r${i}`}
              x1={x - nx}
              y1={y - ny}
              x2={x + nx}
              y2={y + ny}
              stroke={c.woodDark}
              strokeWidth={2}
            />
          );
        })}
        {[-1, 1].map((sgn) => (
          <Line
            key={`rail${sgn}`}
            x1={A[0] + sgn * nx}
            y1={A[1] + sgn * ny}
            x2={B[0] + sgn * nx}
            y2={B[1] + sgn * ny}
            stroke={c.wood}
            strokeWidth={3}
            strokeLinecap="round"
          />
        ))}
        {groundLine}
      </G>
    );
  }
  // A line of sight: a tree whose top is B, an eye at A `eye` above the ground.
  const R = Math.max(10, Math.min(38, (ground - B[1]) * 0.28));
  const personH = ground - A[1];
  const head = Math.max(3, Math.min(7, personH / 7));
  return (
    <G>
      <Defs>
        <Ball id={ids.leaf} color={c.life} />
      </Defs>
      <FloorShadow cx={C[0] + 4} cy={ground + 1} rx={R * 0.9} ry={3} />
      <Rect x={C[0] - 4} y={B[1] + R} width={8} height={ground - B[1] - R} fill={c.bark} />
      <Circle cx={C[0]} cy={B[1] + R} r={R} fill={url(ids.leaf)} />
      {personH > 16 ? (
        <G>
          <Line
            x1={A[0]}
            y1={A[1] + head}
            x2={A[0]}
            y2={ground - personH * 0.45}
            stroke={c.fabric}
            strokeWidth={Math.max(4, head * 1.3)}
            strokeLinecap="round"
          />
          <Line
            x1={A[0] - 2}
            y1={ground - personH * 0.45}
            x2={A[0] - 4}
            y2={ground}
            stroke={c.fabric}
            strokeWidth={3}
          />
          <Line
            x1={A[0] + 2}
            y1={ground - personH * 0.45}
            x2={A[0] + 4}
            y2={ground}
            stroke={c.fabric}
            strokeWidth={3}
          />
          <Circle cx={A[0]} cy={A[1]} r={head} fill={c.skin} />
        </G>
      ) : null}
      {groundLine}
    </G>
  );
}
