import { View } from 'react-native';
import Svg, { Defs, G, Line, Path, Rect } from 'react-native-svg';

import { chart, usePalette } from '@/theme';

import { Canvas, ChartText, fitLabel } from '../reps/common';
import { SunDisk } from '../reps/nature';
import { Ball, FloorShadow, LitRect, Sheen, TopLight, url, usePaintIds } from '../reps/paint';

/**
 * A meter stick standing on the ground at noon and its shadow, to scale with the reading: the
 * sun sits on the line from the shadow's tip over the stick's top, so a shorter shadow puts
 * the sun higher. Drawn above an observe page's chart for the column tapped last.
 */
export function ShadowStick({
  stick,
  shadow,
  max,
  unit,
  column,
}: {
  stick: number;
  shadow: number;
  max: number;
  unit: string;
  column: string;
}) {
  const c = usePalette();
  const ids = usePaintIds('sun', 'wood', 'light');
  return (
    <View>
      <Canvas aspect={0.52}>
        {({ w, h }) => {
          const ground = h - 40;
          const x0 = Math.round(w * 0.3);
          const px = Math.min((w - x0 - 20) / Math.max(max, 1), (ground - 46) / stick);
          const H = stick * px;
          const L = shadow * px;
          const top = { x: x0, y: ground - H };
          // From the stick's top, away from the shadow's tip, until the sun reaches the edge.
          const len = Math.hypot(L, H) || 1;
          const dx = -L / len;
          const dy = -H / len;
          const t = Math.min(dx < 0 ? (top.x - 24) / -dx : Infinity, (top.y - 22) / -dy);
          const sun = { x: top.x + dx * t, y: top.y + dy * t };
          const tick = [10, 20, 25, 50].find((k) => k * px >= 6) ?? 50;
          const shadowText = `${shadow} ${unit}`;
          const shadowLabel = fitLabel(x0 + L / 2, shadowText, chart.small, w);
          return (
            <Svg width={w} height={h}>
              <Defs>
                <Ball id={ids.sun} color={c.sunDisk} />
                <Sheen id={ids.wood} />
                <TopLight id={ids.light} />
              </Defs>
              {/* The sun's ray over the stick's top to the shadow's tip. */}
              <Line
                x1={sun.x}
                y1={sun.y}
                x2={x0 + L}
                y2={ground}
                stroke={c.chartMuted}
                strokeWidth={chart.strokeLight}
                strokeDasharray={chart.dash}
              />
              <SunDisk x={sun.x} y={sun.y} r={12} ball={ids.sun} c={c} />
              {/* The ground, and the shadow lying on it. */}
              <LitRect x={0} y={ground} width={w} height={12} fill={c.life} lightId={ids.light} />
              <Rect x={0} y={ground + 12} width={w} height={4} fill={c.soil} />
              {L > 0 ? (
                <Path
                  d={`M ${x0} ${ground - 2} L ${x0 + L} ${ground + 1} L ${x0} ${ground + 5} Z`}
                  fill={c.shade}
                  opacity={0.45}
                />
              ) : (
                <FloorShadow cx={x0} cy={ground + 2} rx={6} ry={2} />
              )}
              {/* The meter stick: wood with a mark every 10. */}
              <Rect x={x0 - 3} y={top.y} width={6} height={H} fill={c.wood} stroke={c.woodDark} />
              <Rect x={x0 - 3} y={top.y} width={6} height={H} fill={url(ids.wood)} />
              {Array.from({ length: Math.floor(stick / tick) + 1 }, (_, k) => (
                <Line
                  key={k}
                  x1={x0 - 3}
                  y1={ground - k * tick * px}
                  x2={x0 + (k % 5 === 0 ? 3 : 0)}
                  y2={ground - k * tick * px}
                  stroke={c.woodDark}
                  strokeWidth={1}
                />
              ))}
              <ChartText x={x0 - 10} y={ground - H / 2 + 4} fontSize={chart.small} textAnchor="end">
                {`${stick} ${unit}`}
              </ChartText>
              {/* The shadow's length, measured under the ground. */}
              <G>
                <Line
                  x1={x0}
                  y1={ground + 22}
                  x2={x0 + L}
                  y2={ground + 22}
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeLight}
                />
                <Line x1={x0} y1={ground + 18} x2={x0} y2={ground + 26} stroke={c.chartInk} />
                <Line
                  x1={x0 + L}
                  y1={ground + 18}
                  x2={x0 + L}
                  y2={ground + 26}
                  stroke={c.chartInk}
                />
                <ChartText
                  x={shadowLabel.x}
                  y={ground + 37}
                  fontSize={chart.small}
                  fontWeight="700"
                  textAnchor={shadowLabel.textAnchor}
                >
                  {shadowText}
                </ChartText>
              </G>
              <ChartText x={w - 6} y={16} fontSize={chart.label} fontWeight="700" textAnchor="end">
                {`${column}, noon`}
              </ChartText>
            </Svg>
          );
        }}
      </Canvas>
    </View>
  );
}
