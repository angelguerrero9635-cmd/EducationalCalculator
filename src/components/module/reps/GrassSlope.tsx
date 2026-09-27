import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Defs, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette, type Palette } from '@/theme';

import type { Calculator } from '../useCalculator';
import {
  Canvas,
  Caption,
  ChartText,
  DragHandle,
  fitLabel,
  niceCeil,
  nowrap,
  useRep,
} from './common';
import { GrassTuft } from './nature';
import { FloorShadow, Glass, Sheen, TopLight, url, usePaintIds } from './paint';

type Spec = Extract<Representation, { kind: 'grassSlope' }>;

/**
 * Two trays of soil tilted the same way under a watering can, the second planted with grass.
 * The water runs off the low end into a jar below, and the soil it carried settles at the
 * bottom: as deep as the value. Drag the top of the soil in a jar.
 */
export function GrassSlope({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef(0);
  const items = [spec.bare, spec.grass] as const;
  const ids = usePaintIds('glass', 'can', 'tray', 'soil');
  // The jars' scale: `max`, grown to fit the values (in nice steps), so a jar never overflows.
  const top = Math.max(
    spec.max,
    ...items.map((id) => (rep.known(id) ? niceCeil(rep.shown(id)) : 0)),
  );
  return (
    <View>
      <Canvas aspect={0.82}>
        {({ w, h }) => {
          const slot = w / 2;
          const jarTop = h * 0.56;
          const jarH = h * 0.3;
          const jarW = Math.min(52, slot * 0.34);
          const fill = (x: number) => (Math.min(x, top) / top) * (jarH - 8);
          return (
            <>
              <Svg width={w} height={h}>
                <Defs>
                  <Glass id={ids.glass} />
                  <Sheen id={ids.can} />
                  <TopLight id={ids.tray} />
                  <TopLight id={ids.soil} strength={0.6} />
                </Defs>
                {items.map((id, i) => {
                  const x0 = slot * i;
                  // The tray's top edge, high on the left and low on the right.
                  const a = { x: x0 + 14, y: h * 0.3 };
                  const bx = x0 + slot - jarW / 2 - 12;
                  const b = { x: bx, y: a.y + (bx - a.x) * 0.27 };
                  const depth = 14;
                  const jx = b.x - jarW / 2 + 4;
                  const known = rep.known(id);
                  const soil = known ? fill(rep.shown(id)) : 0;
                  return (
                    <G key={id}>
                      <Can x={x0 + slot * 0.3} y={h * 0.1} c={c} sheen={ids.can} />
                      {/* Drops from the rose onto the tray. */}
                      {Array.from({ length: 7 }, (_, k) => {
                        const dx = x0 + slot * 0.3 + 16 + (k % 4) * 7 + (k > 3 ? 4 : 0);
                        const dy = h * 0.16 + (k > 3 ? 14 : 4) + (k % 2) * 6;
                        return (
                          <Line
                            key={k}
                            x1={dx}
                            y1={dy}
                            x2={dx - 1.5}
                            y2={dy + 6}
                            stroke={c.water}
                            strokeWidth={1.6}
                            strokeLinecap="round"
                          />
                        );
                      })}
                      {/* The tray: soil in a box, tilted. */}
                      <Path
                        d={`M ${a.x} ${a.y} L ${b.x} ${b.y} L ${b.x} ${b.y + depth} L ${a.x} ${a.y + depth} Z`}
                        fill={c.soil}
                      />
                      <Path
                        d={`M ${a.x} ${a.y} L ${b.x} ${b.y} L ${b.x} ${b.y + depth} L ${a.x} ${a.y + depth} Z`}
                        fill={url(ids.soil)}
                      />
                      {i === 0 ? (
                        // Bare soil: little channels the water cut.
                        [0.25, 0.5, 0.75].map((t) => (
                          <Path
                            key={t}
                            d={`M ${a.x + (b.x - a.x) * t - 10} ${a.y + (b.y - a.y) * t + 3} q 6 3 12 1`}
                            stroke={c.soilDark}
                            strokeWidth={1.2}
                            fill="none"
                          />
                        ))
                      ) : (
                        <G>
                          {Array.from({ length: 6 }, (_, k) => {
                            const t = (k + 0.5) / 6;
                            return (
                              <GrassTuft
                                key={k}
                                x={a.x + (b.x - a.x) * t}
                                y={a.y + (b.y - a.y) * t + 1}
                                w={(b.x - a.x) / 6}
                                h={14}
                                c={c}
                                blades={5}
                              />
                            );
                          })}
                        </G>
                      )}
                      <Path
                        d={`M ${a.x} ${a.y - 3} L ${a.x} ${a.y + depth + 3} L ${b.x} ${b.y + depth + 3} L ${b.x} ${b.y + 2}`}
                        stroke={c.metalDark}
                        strokeWidth={chart.stroke}
                        fill="none"
                        strokeLinejoin="round"
                      />
                      {/* The prop under the high end. */}
                      <Rect
                        x={a.x + 4}
                        y={a.y + depth + 3}
                        width={14}
                        height={b.y - a.y}
                        fill={c.wood}
                        stroke={c.woodDark}
                      />
                      <FloorShadow
                        cx={x0 + slot / 2 - 6}
                        cy={b.y + depth + 6}
                        rx={slot * 0.36}
                        ry={3}
                      />
                      {/* Muddy water running off the low end into the jar. */}
                      <Path
                        d={`M ${b.x} ${b.y + depth - 4} q 6 4 5 ${jarTop - b.y - depth + 10}`}
                        stroke={c.water}
                        strokeWidth={3}
                        fill="none"
                        opacity={0.75}
                      />
                      {/* The jar: water with the washed-off soil settled at the bottom. */}
                      <Rect
                        x={jx}
                        y={jarTop + jarH * 0.25}
                        width={jarW}
                        height={jarH * 0.75}
                        fill={c.water}
                        opacity={0.35}
                      />
                      {soil > 0 ? (
                        <G>
                          <Rect
                            x={jx + 1}
                            y={jarTop + jarH - soil - 1}
                            width={jarW - 2}
                            height={soil}
                            fill={c.soil}
                          />
                          <Line
                            x1={jx + 1}
                            y1={jarTop + jarH - soil - 1}
                            x2={jx + jarW - 1}
                            y2={jarTop + jarH - soil - 1}
                            stroke={c.soilDark}
                            strokeWidth={chart.stroke}
                          />
                        </G>
                      ) : null}
                      <Rect
                        x={jx}
                        y={jarTop}
                        width={jarW}
                        height={jarH}
                        rx={5}
                        fill={url(ids.glass)}
                        opacity={0.55}
                        stroke={c.glassEdge}
                        strokeWidth={chart.stroke}
                      />
                      <FloorShadow cx={jx + jarW / 2 + 3} cy={jarTop + jarH + 2} rx={jarW * 0.6} />
                      <ChartText
                        {...fitLabel(jx - 6, rep.value(id), chart.small, w, 'end', 3)}
                        y={jarTop + jarH - soil + 3}
                        fontSize={chart.small}
                        fontWeight="700"
                      >
                        {rep.value(id)}
                      </ChartText>
                      <ChartText
                        {...fitLabel(x0 + slot / 2, rep.tag(id), chart.tiny, w)}
                        y={h - 4}
                        fontSize={chart.tiny}
                        fill={c.chartMuted}
                      >
                        {rep.tag(id)}
                      </ChartText>
                    </G>
                  );
                })}
              </Svg>
              {items.map((id, i) => {
                // The jar's middle (see `jx` above).
                const slotX = (w / 2) * (i + 1) - jarW / 2 - 8;
                const from = rep.known(id) ? rep.shown(id) : top / 2;
                return (
                  <DragHandle
                    key={id}
                    testID={`drag-${id}`}
                    x={slotX}
                    y={jarTop + jarH - fill(from) - 1}
                    label={rep.variable(id).name}
                    onStart={() => (start.current = from)}
                    onMove={(_, dy) =>
                      calc.set(
                        {
                          ...rep.pin(items.filter((x) => x !== id)),
                          [id]: rep.snapTo(
                            id,
                            (start.current - (dy / (jarH - 8)) * top) * rep.factor(id),
                          ),
                        },
                        rep.slide(id),
                      )
                    }
                  />
                );
              })}
            </>
          );
        }}
      </Canvas>
      <Caption>
        {(() => {
          const names = `${rep.named(spec.bare)}. ${rep.named(spec.grass)}`;
          const listed = names.endsWith('?') ? names : `${names}.`;
          if (!spec.difference || !rep.known(spec.bare) || !rep.known(spec.grass)) return listed;
          const [a, b] = [rep.shown(spec.bare), rep.shown(spec.grass)];
          if (a === b) return `${listed} The same soil washed off both.`;
          const more = rep.variable(a > b ? spec.bare : spec.grass).name;
          return `${listed} ${more}: ${nowrap(rep.value(spec.difference))} more washed off.`;
        })()}
      </Caption>
    </View>
  );
}

/** A metal watering can tipped toward the right, its rose over the tray. */
function Can({ x, y, c, sheen }: { x: number; y: number; c: Palette; sheen: string }) {
  return (
    <G transform={`translate(${x} ${y}) rotate(18)`}>
      <Path
        d="M -34 -6 C -44 -18 -30 -26 -24 -14"
        stroke={c.metalDark}
        strokeWidth={3}
        fill="none"
      />
      <Path d="M -4 -2 L 18 -10 L 20 -6 L -2 4 Z" fill={c.metal} stroke={c.metalDark} />
      <Ellipse cx={20} cy={-8} rx={3} ry={6} fill={c.metal} stroke={c.metalDark} />
      <Rect x={-30} y={-14} width={28} height={22} rx={4} fill={c.metal} stroke={c.metalDark} />
      <Rect x={-30} y={-14} width={28} height={22} rx={4} fill={url(sheen)} />
    </G>
  );
}
