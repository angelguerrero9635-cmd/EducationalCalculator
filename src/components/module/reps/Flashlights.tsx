import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette, type Palette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, fitLabel, useRep } from './common';
import { BoxShadow, Sheen, url, usePaintIds } from './paint';

type Spec = Extract<Representation, { kind: 'flashlights' }>;

/**
 * The same flashlight twice, seen from the side: `near` from a wall, then `times` as far. Its
 * beam spreads the same way, so the lit circle is `times` as wide. Under them, the two circles
 * face on: the far one covers `times` × `times` squares the size of the near one, one shaded,
 * so each square gets that share of the light.
 */
export function Flashlights({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('body');
  const n = rep.shown(spec.near);
  // A "?" count of times draws 1 (the same distance), faded, never a number not typed.
  const kKnown = rep.known(spec.times);
  const k = Math.max(1, Math.round(rep.shown(spec.times)));
  const farKnown = spec.far ? rep.known(spec.far) : kKnown && rep.known(spec.near);
  const farText = spec.far ? rep.value(spec.far) : `${n * k} ${rep.unit(spec.near) ?? ''}`.trim();
  return (
    <View>
      <Canvas aspect={(w) => (160 + Math.min(190, w * 0.5)) / w}>
        {({ w, h }) => {
          const wall = w - 26;
          const reachFar = wall - 62;
          const px = reachFar / k;
          // The beam's spread: at the far distance it lights 52 px of the wall.
          const spread = 26 / reachFar;
          const rows = [
            { y: 36, dist: px, label: rep.value(spec.near), faded: !rep.known(spec.near) },
            { y: 104, dist: reachFar, label: farText, faded: !farKnown },
          ];
          const top = 156;
          const S = Math.min(150, w * 0.42, h - top - 26);
          const D = S / k;
          const gx = w - S - 24;
          const gy = top + 8;
          return (
            <Svg width={w} height={h}>
              <Defs>
                <Sheen id={ids.body} vertical />
              </Defs>
              {/* The wall, seen edge on. */}
              <Rect x={wall} y={4} width={10} height={132} fill={c.paper} stroke={c.chartGrid} />
              {rows.map((r, i) => {
                const lens = wall - r.dist;
                const half = r.dist * spread;
                return (
                  <G key={i} opacity={r.faded ? 0.45 : 1}>
                    <Path
                      d={`M ${lens} ${r.y - 5} L ${wall} ${r.y - half - 5} L ${wall} ${r.y + half + 5} L ${lens} ${r.y + 5} Z`}
                      fill={c.sunDisk}
                      opacity={0.4}
                    />
                    <Line
                      x1={wall}
                      y1={r.y - half - 5}
                      x2={wall}
                      y2={r.y + half + 5}
                      stroke={c.sunDisk}
                      strokeWidth={5}
                    />
                    <Torch x={lens} y={r.y} c={c} sheen={ids.body} />
                    {/* The distance from the lens to the wall. */}
                    <Line
                      x1={lens}
                      y1={r.y + 24}
                      x2={wall}
                      y2={r.y + 24}
                      stroke={c.chartInk}
                      strokeWidth={chart.strokeLight}
                    />
                    <Line x1={lens} y1={r.y + 19} x2={lens} y2={r.y + 29} stroke={c.chartInk} />
                    <Line x1={wall} y1={r.y + 19} x2={wall} y2={r.y + 29} stroke={c.chartInk} />
                    <ChartText
                      {...fitLabel((lens + wall) / 2, r.label, chart.small, w)}
                      y={r.y + 40}
                      fontSize={chart.small}
                      fontWeight="700"
                    >
                      {r.label}
                    </ChartText>
                  </G>
                );
              })}
              {/* Face on: the near circle fills one square; the far one, times × times squares. */}
              <BoxShadow x={14} y={gy} width={D + 20} height={D + 20} />
              <Rect
                x={14}
                y={gy}
                width={D + 20}
                height={D + 20}
                fill={c.paper}
                stroke={c.chartGrid}
              />
              <Rect x={24} y={gy + 10} width={D} height={D} fill="none" stroke={c.chartGrid} />
              <Circle
                cx={24 + D / 2}
                cy={gy + 10 + D / 2}
                r={D / 2}
                fill={c.sunDisk}
                opacity={0.8}
              />
              <ChartText x={14} y={gy + D + 36} fontSize={chart.tiny} fill={c.chartMuted}>
                near: 1 square
              </ChartText>
              <G opacity={kKnown ? 1 : 0.45}>
                <BoxShadow x={gx - 10} y={gy - 4} width={S + 20} height={S + 8} />
                <Rect
                  x={gx - 10}
                  y={gy - 4}
                  width={S + 20}
                  height={S + 8}
                  fill={c.paper}
                  stroke={c.chartGrid}
                />
                <Circle cx={gx + S / 2} cy={gy + S / 2} r={S / 2} fill={c.sunDisk} opacity={0.8} />
                <Rect x={gx} y={gy} width={D} height={D} fill={c.chartHighlight} opacity={0.55} />
                {Array.from({ length: k + 1 }, (_, j) => (
                  <G key={j}>
                    <Line
                      x1={gx + j * D}
                      y1={gy}
                      x2={gx + j * D}
                      y2={gy + S}
                      stroke={c.chartMuted}
                      strokeWidth={0.8}
                    />
                    <Line
                      x1={gx}
                      y1={gy + j * D}
                      x2={gx + S}
                      y2={gy + j * D}
                      stroke={c.chartMuted}
                      strokeWidth={0.8}
                    />
                  </G>
                ))}
                <ChartText
                  {...fitLabel(gx + S / 2, `far: ${k} × ${k} = ${k * k} squares`, chart.tiny, w)}
                  y={gy + S + 18}
                  fontSize={chart.tiny}
                  fill={c.chartMuted}
                >
                  {kKnown ? `far: ${k} × ${k} = ${k * k} squares` : 'far: ? squares'}
                </ChartText>
              </G>
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {(() => {
          const listed = [spec.near, spec.times, ...(spec.far ? [spec.far] : [])]
            .map((id) => rep.named(id))
            .join(' · ');
          if (!kKnown) return listed.endsWith('?') ? listed : `${listed}.`;
          return (
            `${listed} · The lit circle is ${k} times as wide. ` +
            `It covers ${k} × ${k} = ${k * k} squares, so each square gets 1/${k * k} of the light.`
          );
        })()}
      </Caption>
    </View>
  );
}

/** A metal flashlight pointing right, its lens at (x, y). */
function Torch({ x, y, c, sheen }: { x: number; y: number; c: Palette; sheen: string }) {
  return (
    <G>
      <Rect
        x={x - 40}
        y={y - 5}
        width={26}
        height={10}
        rx={3}
        fill={c.metal}
        stroke={c.metalDark}
      />
      <Path
        d={`M ${x - 14} ${y - 5} L ${x - 4} ${y - 8} L ${x} ${y - 8} L ${x} ${y + 8} L ${x - 4} ${y + 8} L ${x - 14} ${y + 5} Z`}
        fill={c.metal}
        stroke={c.metalDark}
      />
      <Rect x={x - 40} y={y - 5} width={26} height={10} rx={3} fill={url(sheen)} />
      <Rect x={x - 30} y={y - 7} width={6} height={3} rx={1} fill={c.metalDark} />
      <Line x1={x} y1={y - 7} x2={x} y2={y + 7} stroke={c.sunDisk} strokeWidth={2.5} />
    </G>
  );
}
