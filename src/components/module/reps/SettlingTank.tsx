/**
 * HC176 `settlingTank` (SettlingTankSpec in typesHe4k.ts): an ideal rectangular settling basin
 * in side view, concrete walls and water painted, length and depth to scale (the depth stretched
 * by a written whole factor when the basin is too shallow to read). A particle enters at the
 * surface and falls at v_s while the flow carries it; the critical v₀ path is dashed; the band
 * of the inlet whose particles settle is shaded. No handles.
 */
import { View } from 'react-native';
import { Circle, Defs, G, Line, Rect } from 'react-native-svg';

import type { SettlingTankSpec } from '@/data/modules/typesHe4k';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Caption, ChartText, fitLabel } from './common';
import { Arrow, BW, Board, Dimension } from './fluidKit';
import { depthStretch, settlingPath } from './he4kMath';
import { n3, useReader } from './he4kKit';
import { Deepen, TopLight, url, usePaintIds } from './paint';

const X0 = 24;
const TOP = 52;
const WALL = 8;

export function SettlingTank({ spec, calc }: { spec: SettlingTankSpec; calc: Calculator }) {
  const c = usePalette();
  const ids = usePaintIds('water', 'wall');
  const { get, text, say, label } = useReader(calc);
  const L = get(spec.length);
  const W = get(spec.width);
  const D = get(spec.depth);
  const Q = get(spec.q);
  const vs = get(spec.vs);
  const okBasin = L !== undefined && D !== undefined && L > 0 && D > 0;
  // Length across up to 260 px, the depth up to 120 px.
  const stretch = okBasin ? depthStretch(L, D, 260) : 1;
  const lenPx = okBasin ? Math.min(260, (120 * L) / (D * stretch)) : 260;
  const sx = okBasin ? lenPx / L : 1;
  const depPx = okBasin ? D * stretch * sx : 80;
  const X1 = X0 + lenPx;
  const BOT = TOP + depPx;
  // The footer sits under the length; the board ends just below it.
  const H = BOT + WALL + 56;
  const path =
    okBasin && W !== undefined && Q !== undefined && vs !== undefined && W > 0 && Q > 0 && vs > 0
      ? settlingPath(L, W, D, Q, vs)
      : undefined;
  const v0 =
    path?.v0 ?? (Q !== undefined && L !== undefined && W !== undefined ? Q / (L * W) : undefined);
  const t =
    okBasin && W !== undefined && Q !== undefined && Q > 0 ? (L * W * D) / Q / 3600 : undefined;

  const lines: string[] = [];
  if (v0 !== undefined)
    lines.push(
      `v₀ = Q ÷ (LW) = ${text(spec.q, '', false)} ÷ (${text(spec.length, '', false)} × ${text(spec.width, '', false)}) = ${say(spec.v0, v0, 'm/s')}${t !== undefined ? `; detention t = LWD ÷ Q = ${say(spec.t, t, 'h')}` : ''}.`,
    );
  if (path)
    lines.push(
      path.lands
        ? `v_s ≥ v₀: even a particle entering at the surface lands ${n3(path.reach)} m from the inlet, inside the basin, so all of them settle (100%).`
        : `v_s < v₀: a particle entering at the surface reaches the outlet still ${n3(D! - path.exitDepth)} m above the floor; those entering in the lowest v_s ÷ v₀ = ${say(spec.removal, 100 * path.removal, '%')} of the depth settle.`,
    );
  else lines.push('Type Q, the basin and v_s to send a particle through.');
  if (stretch > 1) lines.push(`The depth is drawn ${stretch} times its scale.`);

  const removedTop = path ? BOT - depPx * path.removal : BOT;
  const endX = path ? X0 + Math.min(path.reach, L!) * sx : X0;
  const endY = path ? TOP + (path.lands ? depPx : path.exitDepth * stretch * sx) : TOP;

  return (
    <View>
      <Board
        height={H}
        draw={() => (
          <G>
            <Defs>
              <Deepen id={ids.water} from={c.water} to={c.waterDeep} />
              <TopLight id={ids.wall} />
            </Defs>
            {/* Concrete walls and floor, then the water. */}
            <Rect
              x={X0 - WALL}
              y={TOP - 8}
              width={lenPx + 2 * WALL}
              height={depPx + 8 + WALL}
              fill={c.fluidConcrete}
              stroke={c.fluidConcreteDark}
              strokeWidth={1}
            />
            <Rect
              x={X0 - WALL}
              y={TOP - 8}
              width={lenPx + 2 * WALL}
              height={depPx + 8 + WALL}
              fill={url(ids.wall)}
            />
            <Rect x={X0} y={TOP - 8} width={lenPx} height={8} fill={c.background} />
            <Rect
              x={X0}
              y={TOP}
              width={lenPx}
              height={depPx}
              fill={url(ids.water)}
              opacity={0.75}
            />
            <Rect x={X0} y={BOT - 4} width={lenPx} height={4} fill={c.he4kRemoved} />
            {/* Inflow over the inlet wall, outflow over the weir. */}
            <Arrow x1={2} y1={TOP + 4} x2={X0 + 14} y2={TOP + 4} color={c.waterDeep} />
            <Arrow
              x1={X1 - 4}
              y1={TOP - 3}
              x2={Math.min(BW - 2, X1 + 30)}
              y2={TOP - 3}
              color={c.waterDeep}
            />
            {/* The band whose particles settle, at the inlet. */}
            {path ? (
              <Rect
                x={X0}
                y={removedTop}
                width={7}
                height={BOT - removedTop}
                fill={c.he4kRemoved}
                stroke={c.chartInk}
                strokeWidth={0.8}
              />
            ) : null}
            {/* The critical particle (v₀): surface to the far corner. */}
            {okBasin && v0 !== undefined ? (
              <Line
                x1={X0}
                y1={TOP}
                x2={X1}
                y2={BOT}
                stroke={c.chartInk}
                strokeWidth={1.2}
                strokeDasharray={chart.dash}
              />
            ) : null}
            {path && !path.lands ? (
              <Line
                x1={X0}
                y1={removedTop}
                x2={X1}
                y2={BOT}
                stroke={c.he4kParticle}
                strokeWidth={1.2}
                strokeDasharray={chart.dashFine}
              />
            ) : null}
            {path ? (
              <G>
                <Arrow
                  x1={X0}
                  y1={TOP}
                  x2={endX}
                  y2={endY}
                  color={c.he4kParticle}
                  width={chart.stroke}
                />
                <Circle
                  cx={X0 + 3}
                  cy={TOP + 2}
                  r={3.5}
                  fill={c.he4kParticle}
                  stroke={c.chartInk}
                  strokeWidth={0.8}
                />
              </G>
            ) : null}
            {/* Depth and length. */}
            {okBasin ? (
              <G>
                <Dimension
                  x1={X1 + WALL + 6}
                  y1={TOP}
                  x2={X1 + WALL + 6}
                  y2={BOT}
                  color={c.chartInk}
                />
                <ChartText x={X1 + WALL + 12} y={(TOP + BOT) / 2 + 4}>
                  {text(spec.depth) ?? ''}
                </ChartText>
                <Dimension
                  x1={X0}
                  y1={BOT + WALL + 10}
                  x2={X1}
                  y2={BOT + WALL + 10}
                  color={c.chartInk}
                />
                <ChartText x={(X0 + X1) / 2} y={BOT + WALL + 26} textAnchor="middle">
                  {label('L', spec.length) ?? ''}
                </ChartText>
              </G>
            ) : null}
            {/* Header: flow and the two speeds. */}
            {label('Q', spec.q) ? (
              <ChartText x={4} y={16}>
                {label('Q', spec.q)!}
              </ChartText>
            ) : null}
            {v0 !== undefined ? (
              <ChartText x={BW - 4} y={16} textAnchor="end">
                {`v₀ = ${say(spec.v0, v0, 'm/s')}`}
              </ChartText>
            ) : null}
            {vs !== undefined ? (
              <ChartText x={BW - 4} y={34} textAnchor="end" fill={c.he4kParticle} fontWeight="700">
                {`v_s = ${text(spec.vs)}`}
              </ChartText>
            ) : null}
            {/* Footer: removal; width and the stretch. */}
            {path ? (
              <ChartText x={4} y={H - 8} fontWeight="700" fill={c.he4kRemoved}>
                {`Removed: ${say(spec.removal, 100 * path.removal, '%')}`}
              </ChartText>
            ) : null}
            <ChartText
              {...fitLabel(
                BW - 4,
                footRight(label('W', spec.width), stretch),
                chart.label,
                BW,
                'end',
              )}
              y={H - 8}
              fill={c.chartMuted}
            >
              {footRight(label('W', spec.width), stretch)}
            </ChartText>
          </G>
        )}
      />
      <Caption>{lines.join(' ')}</Caption>
    </View>
  );
}

const footRight = (w: string | undefined, stretch: number) =>
  [w ? `${w} into the page` : '', stretch > 1 ? `depth ×${stretch}` : '']
    .filter(Boolean)
    .join(' · ');
