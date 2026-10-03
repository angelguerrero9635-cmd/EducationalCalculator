/**
 * HC177 `plume` (PlumeSpec in typesHe4k.ts): a Gaussian plume in side view. A painted stack, the
 * plume rising to the effective height H and running level downwind, its ±σ_z and ±2σ_z
 * envelopes widening with distance to σ_z at a receptor on the ground, and the vertical
 * profile there (the ground reflects) with its ground value ringed. Heights to scale, distance
 * not. No handles.
 */
import { View } from 'react-native';
import { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { PlumeSpec } from '@/data/modules/typesHe4k';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Caption, ChartText } from './common';
import { Arrow, BW, Board, Dimension } from './fluidKit';
import { plumeGround, plumeProfile, plumeSpread } from './he4kMath';
import { n3, useReader } from './he4kKit';
import { Sheen, url, usePaintIds } from './paint';

const GROUND = 204;
const TOPY = 40;
const SX = 38;
const SW = 14;
const XS = SX + SW / 2;
/** Where the plume has risen to H, and where the receptor stands. */
const XRISE = 112;
const XREC = 262;
const XEND = 338;
const PROFILE = 54;
const H = 238;

export function Plume({ spec, calc }: { spec: PlumeSpec; calc: Calculator }) {
  const c = usePalette();
  const ids = usePaintIds('stack');
  const { get, text, say, label } = useReader(calc);
  const h = get(spec.h);
  const sz = get(spec.sz);
  const sy = get(spec.sy);
  const u = get(spec.u);
  const q = get(spec.q);
  const ok = h !== undefined && sz !== undefined && h > 0 && sz > 0;
  const hs = get(spec.stack) ?? (h !== undefined ? 0.6 * h : 30);
  // No height axis is drawn, so the view need not end on a round number: just above 2σ_z.
  const zMax = 1.05 * (ok ? Math.max(h + 2.2 * sz, 1.2 * h, 1.1 * hs) : 1.2 * hs);
  const zy = (z: number) => GROUND - (Math.max(0, Math.min(zMax, z)) / zMax) * (GROUND - TOPY);
  const C =
    ok && q !== undefined && u !== undefined && sy !== undefined && u > 0 && sy > 0
      ? plumeGround(q, u, sy, sz, h)
      : undefined;
  const hSafe = h ?? 1.6 * hs;
  /** The centreline: up from the stack top to H by XRISE, then level. */
  const centre = (x: number) => {
    const f = Math.min(1, Math.max(0, (x - XS) / (XRISE - XS)));
    return hs + (hSafe - hs) * (1 - (1 - f) ** 2);
  };
  const sigma = (x: number) => (ok ? plumeSpread(sz, (x - XS) / (XREC - XS)) : 0);
  const xs = Array.from({ length: 61 }, (_, i) => XS + ((XEND - XS) * i) / 60);
  const band = (k: number) => {
    const upper = xs.map((x) => `${x.toFixed(1)},${zy(centre(x) + k * sigma(x)).toFixed(1)}`);
    const lower = [...xs]
      .reverse()
      .map((x) => `${x.toFixed(1)},${zy(centre(x) - k * sigma(x)).toFixed(1)}`);
    return `M ${upper.join(' L ')} L ${lower.join(' L ')} Z`;
  };
  const centreLine = `M ${xs.map((x) => `${x.toFixed(1)},${zy(centre(x)).toFixed(1)}`).join(' L ')}`;
  const profMax = ok
    ? Math.max(...Array.from({ length: 101 }, (_, i) => plumeProfile((zMax * i) / 100, h, sz)))
    : 1;
  const profile = ok
    ? `M ${Array.from({ length: 101 }, (_, i) => {
        const z = (zMax * i) / 100;
        return `${(XREC + (PROFILE * plumeProfile(z, h, sz)) / profMax).toFixed(1)},${zy(z).toFixed(1)}`;
      }).join(' L ')}`
    : '';
  const groundX = ok ? XREC + (PROFILE * plumeProfile(0, h, sz)) / profMax : XREC;
  const yH = zy(hSafe);

  const lines: string[] = [];
  if (C !== undefined) {
    const e = Math.exp(-(h! * h!) / (2 * sz! * sz!));
    lines.push(
      `C = Q ÷ (π × u × σ_y × σ_z) × e^(−H² ÷ (2 × σ_z²)) = (${text(spec.q, '', false)} × 10⁶ ÷ (π × ${text(spec.u, '', false)} × ${text(spec.sy, '', false)} × ${text(spec.sz, '', false)})) × ${n3(e)} = ${say(spec.c, C, 'μg/m³')} at ground level on the centreline.`,
    );
  }
  if (ok)
    lines.push(
      `The plume runs level at H = ${text(spec.h)} and spreads as it goes; at the receptor σ_z = ${text(spec.sz)}, and the ground reflects the part that reaches it (the profile's lower bulge). Heights are to scale; distance is not.`,
    );
  else lines.push('Type H and σ_z to draw the plume.');

  return (
    <View>
      <Board
        height={H}
        draw={() => (
          <G>
            <Defs>
              <Sheen id={ids.stack} />
            </Defs>
            {/* Sky and ground. */}
            <Rect x={0} y={TOPY - 14} width={BW} height={GROUND - TOPY + 14} fill={c.he4kSky} />
            <Rect x={0} y={GROUND} width={BW} height={6} fill={c.landGrass} />
            <Rect x={0} y={GROUND + 6} width={BW} height={6} fill={c.soil} />
            {/* The plume: ±2σ_z, ±σ_z, the centreline. */}
            {ok ? (
              <G>
                <Path d={band(2)} fill={c.he4kPlume} opacity={0.2} />
                <Path d={band(1)} fill={c.he4kPlume} opacity={0.32} />
                <Path
                  d={centreLine}
                  fill="none"
                  stroke={c.chartInk}
                  strokeWidth={1.2}
                  strokeDasharray={chart.dash}
                />
              </G>
            ) : null}
            {/* The stack. */}
            <Rect x={SX} y={zy(hs)} width={SW} height={GROUND - zy(hs)} fill={c.thermalBrick} />
            <Rect x={SX} y={zy(hs)} width={SW} height={GROUND - zy(hs)} fill={url(ids.stack)} />
            <Rect x={SX - 2} y={zy(hs) - 3} width={SW + 4} height={4} fill={c.metalDark} />
            {/* H, from the ground. */}
            {ok ? (
              <G>
                <Dimension x1={24} y1={GROUND} x2={24} y2={yH} color={c.chartInk} />
                <ChartText x={4} y={yH - 8} fontWeight="700" halo>
                  {`H = ${text(spec.h)}`}
                </ChartText>
              </G>
            ) : null}
            {/* The receptor, the profile and σ_z there. */}
            <Line
              x1={XREC}
              y1={TOPY - 8}
              x2={XREC}
              y2={GROUND}
              stroke={c.chartMuted}
              strokeWidth={1}
            />
            <Rect
              x={XREC - 5}
              y={GROUND - 10}
              width={10}
              height={10}
              rx={2}
              fill={c.he4kReceptor}
            />
            {ok ? (
              <G>
                <Path d={profile} fill="none" stroke={c.he4kReceptor} strokeWidth={chart.stroke} />
                <Circle
                  cx={groundX}
                  cy={GROUND}
                  r={4.5}
                  fill={c.background}
                  stroke={c.he4kReceptor}
                  strokeWidth={chart.stroke}
                />
                <Dimension
                  x1={XREC - 8}
                  y1={yH}
                  x2={XREC - 8}
                  y2={zy(hSafe + sz!)}
                  color={c.chartInk}
                />
                <ChartText x={XREC - 14} y={(yH + zy(hSafe + sz!)) / 2 + 4} textAnchor="end" halo>
                  {`σ_z = ${text(spec.sz)}`}
                </ChartText>
              </G>
            ) : null}
            {/* Header: wind and emission. */}
            <ChartText x={4} y={16}>
              {u !== undefined ? `Wind u = ${text(spec.u)}` : 'Wind'}
            </ChartText>
            <Arrow
              x1={u !== undefined ? 116 : 46}
              y1={12}
              x2={u !== undefined ? 146 : 76}
              y2={12}
              color={c.chartInk}
            />
            {label('Q', spec.q) ? (
              <ChartText x={BW - 4} y={16} textAnchor="end">
                {label('Q', spec.q)!}
              </ChartText>
            ) : null}
            {/* Footer: distance and the ground value. */}
            <ChartText x={XS} y={GROUND + 28} textAnchor="middle" fill={c.chartMuted}>
              Stack
            </ChartText>
            <ChartText
              x={(XS + XREC) / 2 + 10}
              y={GROUND + 28}
              textAnchor="middle"
              fill={c.chartMuted}
            >
              {spec.x !== undefined && text(spec.x)
                ? `receptor ${text(spec.x)} downwind`
                : 'downwind (not to scale)'}
            </ChartText>
            {C !== undefined ? (
              <ChartText
                x={BW - 4}
                y={GROUND + 28}
                textAnchor="end"
                fontWeight="700"
                fill={c.he4kReceptor}
              >
                {`C = ${say(spec.c, C, 'μg/m³')}`}
              </ChartText>
            ) : null}
          </G>
        )}
      />
      <Caption>{lines.join(' ')}</Caption>
    </View>
  );
}
