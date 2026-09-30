/**
 * The double cone cut by a plane (Grades 9–12 group D, the conics explore figure): two cones
 * tip to tip seen from a little above, a plane through them, and the curve where they meet, in
 * 3D projected flat. A level plane cuts a circle; tilted less steeply than the cone's side, an
 * ellipse; exactly as steep, a parabola; steeper, both cones: a hyperbola.
 */
import Svg, { Ellipse, G, Line, Path } from 'react-native-svg';

import type { ConeCut } from '@/data/modules/layouts/types';
import { chart, usePalette } from '@/theme';

import { Canvas, ChartText } from '../reps/common';

const RAD = Math.PI / 180;
/** The cone's half-angle at the tip. */
const ALPHA = 30 * RAD;
/** Each cone's height (the tip at 0). */
const H = 1;

/** The cutting plane n · p = k for each cut, n = (−sin β, 0, cos β): β is its tilt. */
const PLANES: Record<ConeCut, { tilt: number; k: number }> = {
  circle: { tilt: 0, k: 0.62 },
  ellipse: { tilt: 28, k: 0.5 },
  // As steep as the cone's side: 90° − 30°.
  parabola: { tilt: 60, k: 0.3 },
  hyperbola: { tilt: 82, k: 0.1 },
};

/** A point on the cone: `s` along the side at angle φ round the axis (s < 0 on the lower cone). */
const onCone = (s: number, phi: number) => ({
  x: s * Math.tan(ALPHA) * Math.cos(phi),
  y: s * Math.tan(ALPHA) * Math.sin(phi),
  z: s,
});

export function ConeFigure({ cut }: { cut: ConeCut }) {
  const c = usePalette();
  const { tilt, k } = PLANES[cut];
  const n = { x: -Math.sin(tilt * RAD), z: Math.cos(tilt * RAD) };
  return (
    <Canvas aspect={1.02}>
      {({ w, h }) => {
        const scale = h * 0.36;
        const cx = w * 0.5;
        const cy = h * 0.5;
        // View from 18° above, turned 25° round the axis.
        const [az, el] = [25 * RAD, 18 * RAD];
        const P = (p: { x: number; y: number; z: number }) => {
          const X = p.x * Math.cos(az) - p.y * Math.sin(az);
          const Y = p.x * Math.sin(az) + p.y * Math.cos(az);
          return { x: cx + X * scale, y: cy - (p.z * Math.cos(el) - Y * Math.sin(el)) * scale };
        };
        const path = (pts: { x: number; y: number; z: number }[]) =>
          pts.map((p, i) => `${i ? 'L' : 'M'} ${P(p).x} ${P(p).y}`).join(' ');
        const rimR = H * Math.tan(ALPHA);
        // The curve: along each side line at φ, where it meets the plane (within the cones).
        const segments: { x: number; y: number; z: number }[][] = [];
        let run: { x: number; y: number; z: number }[] = [];
        for (let i = 0; i <= 720; i++) {
          const phi = (i / 2) * RAD;
          const u = onCone(1, phi);
          const d = n.x * u.x + n.z * u.z;
          const s = Math.abs(d) < 1e-9 ? Infinity : k / d;
          if (Math.abs(s) <= H) run.push(onCone(s, phi));
          else if (run.length) {
            segments.push(run);
            run = [];
          }
        }
        if (run.length) segments.push(run);
        // The plane: a rectangle in it, 1.3 wide each way.
        const e1 = { x: Math.cos(tilt * RAD), y: 0, z: Math.sin(tilt * RAD) };
        const o = { x: n.x * k, y: 0, z: n.z * k };
        const corner = (a: number, b: number) => ({ x: o.x + a * e1.x, y: b, z: o.z + a * e1.z });
        // Long enough along its tilt to hold the curve, narrower across.
        const [L, W] = [0.8 + 0.45 * Math.sin(tilt * RAD), 0.8];
        const plane = [corner(-L, -W), corner(L, -W), corner(L, W), corner(-L, W), corner(-L, -W)];
        const top = P({ x: 0, y: 0, z: H });
        const bottom = P({ x: 0, y: 0, z: -H });
        return (
          <Svg width={w} height={h}>
            {/* Two cones, tip to tip. */}
            {[H, -H].map((z) => {
              const r = P({ x: 0, y: 0, z });
              const ry = rimR * Math.sin(el) * scale;
              return (
                <G key={z}>
                  <Path
                    d={`M ${P(onCone(0, 0)).x} ${P(onCone(0, 0)).y} L ${r.x - rimR * scale} ${r.y} A ${rimR * scale} ${ry} 0 0 0 ${r.x + rimR * scale} ${r.y} Z`}
                    fill={c.chartFill}
                    opacity={0.7}
                  />
                  <Ellipse
                    cx={r.x}
                    cy={r.y}
                    rx={rimR * scale}
                    ry={ry}
                    fill={z > 0 ? c.chartSurface : 'none'}
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeLight}
                  />
                  <Line
                    x1={P(onCone(0, 0)).x}
                    y1={P(onCone(0, 0)).y}
                    x2={r.x - rimR * scale}
                    y2={r.y}
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeLight}
                  />
                  <Line
                    x1={P(onCone(0, 0)).x}
                    y1={P(onCone(0, 0)).y}
                    x2={r.x + rimR * scale}
                    y2={r.y}
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeLight}
                  />
                </G>
              );
            })}
            <Line
              x1={top.x}
              y1={top.y - 14}
              x2={bottom.x}
              y2={bottom.y + 14}
              stroke={c.chartMuted}
              strokeWidth={1}
              strokeDasharray={chart.dashFine}
            />
            {/* The cutting plane, see-through. */}
            <Path
              d={path(plane)}
              fill={c.chartHighlight}
              fillOpacity={0.14}
              stroke={c.chartHighlight}
              strokeWidth={1}
              strokeOpacity={0.6}
            />
            {/* Where they meet. */}
            {segments.map((seg, i) => (
              <Path
                key={i}
                d={path(seg)}
                stroke={c.hopBack}
                strokeWidth={chart.strokeHeavy + 0.5}
                fill="none"
                strokeLinejoin="round"
              />
            ))}
            <ChartText
              x={w - 8}
              y={h - 10}
              textAnchor="end"
              fontSize={chart.value}
              fontWeight="700"
              fill={c.hopBack}
            >
              {cut === 'circle'
                ? 'Circle'
                : cut === 'ellipse'
                  ? 'Ellipse'
                  : cut === 'parabola'
                    ? 'Parabola'
                    : 'Hyperbola'}
            </ChartText>
          </Svg>
        );
      }}
    </Canvas>
  );
}
