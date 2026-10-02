import { useRef } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, Line, Path, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, ChartText, DragHandle, nowrap, useRep, Caption } from './common';
import { SunDisk } from './nature';
import { Ball, BoxShadow, FloorShadow, Glass, Sheen, url, usePaintIds } from './paint';

type Spec = Extract<Representation, { kind: 'thermometers' }>;

/** One thermometer per value, side by side, numbered every 10 degrees. Drag the top of the liquid. */
export function Thermometers({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const start = useRef(0);
  const shown = spec.items.map((id) => (rep.known(id) ? rep.shown(id) : undefined));
  // The scale grows to fit the values, in whole tens.
  const lo = Math.min(
    spec.min,
    ...shown.map((x) => (x === undefined ? spec.min : Math.floor(x / 10) * 10)),
  );
  const hi = Math.max(
    spec.max,
    ...shown.map((x) => (x === undefined ? spec.max : Math.ceil(x / 10) * 10)),
  );
  const unit = rep.unit(spec.items[0]!) ?? '';
  const ids = usePaintIds('glass', 'sheen', 'bulb', 'sun', 'cup');
  const cups = spec.cups;

  return (
    <View>
      <Canvas aspect={cups ? 0.8 : 0.7}>
        {({ w, h }) => {
          const top = 22;
          // Leaves room under the bulb for the name label.
          const bottom = h - (cups ? 72 : 40);
          const py = (x: number) => bottom - ((x - lo) / (hi - lo)) * (bottom - top);
          const slot = w / spec.items.length;
          const tube = 18;
          // A tick every 10; a number every 10, 20, 50 or 100, whichever leaves 14 px between.
          const per10 = ((bottom - top) * 10) / (hi - lo);
          const every = [10, 20, 50, 100].find((e) => (per10 * e) / 10 >= 14) ?? 100;
          return (
            <>
              <Svg width={w} height={h}>
                <Defs>
                  <Glass id={ids.glass} />
                  <Sheen id={ids.sheen} />
                  <Ball id={ids.bulb} color={c.mercury} />
                  <Sheen id={ids.cup} />
                  <Ball id={ids.sun} color={c.sunDisk} />
                </Defs>
                {cups ? <SunDisk x={22} y={22} r={10} ball={ids.sun} c={c} /> : null}
                {spec.items.map((id, i) => {
                  const cx = slot * i + slot / 2 + 10;
                  const x = shown[i];
                  // The board the thermometer is mounted on, wide enough for its numbers.
                  const bx = cx - tube / 2 - 40;
                  const bw = tube + 52;
                  return [
                    <BoxShadow
                      key={`s${id}`}
                      x={bx}
                      y={top - 14}
                      width={bw}
                      height={bottom - top + 40}
                      r={10}
                    />,
                    <Rect
                      key={`p${id}`}
                      x={bx}
                      y={top - 14}
                      width={bw}
                      height={bottom - top + 40}
                      rx={10}
                      fill={c.paper}
                      stroke={c.chartGrid}
                    />,
                    <Rect
                      key={`t${id}`}
                      x={cx - tube / 2}
                      y={top - 6}
                      width={tube}
                      height={bottom - top + 6}
                      rx={tube / 2}
                      fill={url(ids.glass)}
                      stroke={c.glassEdge}
                      strokeWidth={chart.stroke}
                    />,
                    x === undefined ? null : (
                      <Rect
                        key={`f${id}`}
                        x={cx - tube / 2 + 5}
                        y={py(x)}
                        width={tube - 10}
                        height={bottom - py(x) + 6}
                        rx={(tube - 10) / 2}
                        fill={c.mercury}
                      />
                    ),
                    x === undefined ? null : (
                      <Rect
                        key={`h${id}`}
                        x={cx - tube / 2 + 5}
                        y={py(x)}
                        width={tube - 10}
                        height={bottom - py(x) + 6}
                        fill={url(ids.sheen)}
                      />
                    ),
                    <Circle
                      key={`b${id}`}
                      cx={cx}
                      cy={bottom + 12}
                      r={13}
                      fill={x === undefined ? url(ids.glass) : url(ids.bulb)}
                      stroke={c.glassEdge}
                      strokeWidth={chart.stroke}
                    />,
                    cups?.[i] ? (
                      <Cup
                        key={`c${id}`}
                        cx={cx}
                        top={bottom + 8}
                        dark={cups[i] === 'dark'}
                        sheen={ids.cup}
                      />
                    ) : null,
                    ...[
                      // A ten next to an extra mark (30 by 32) gives way to the mark.
                      ...Array.from({ length: (hi - lo) / 10 + 1 }, (_, k) => lo + k * 10).filter(
                        (v) => !(spec.marks ?? []).some((m) => m !== v && Math.abs(m - v) < 5),
                      ),
                      ...(spec.marks ?? []).filter((v) => v > lo && v < hi && v % 10 !== 0),
                    ].map((v, k) => {
                      const mark = v % 10 !== 0;
                      return [
                        <Line
                          key={`m${id}${k}`}
                          x1={cx - tube / 2 - 8}
                          y1={py(v)}
                          x2={cx - tube / 2}
                          y2={py(v)}
                          stroke={c.chartInk}
                          strokeWidth={mark ? chart.stroke : chart.strokeLight}
                        />,
                        // A number never prints on top of a bold mark (40 next to 32).
                        mark ||
                        ((v - lo) % every === 0 &&
                          !(spec.marks ?? []).some(
                            (m) => m !== v && Math.abs(py(m) - py(v)) < 12,
                          )) ? (
                          <ChartText
                            key={`l${id}${k}`}
                            x={cx - tube / 2 - 12}
                            y={py(v) + 4}
                            fontSize={chart.tiny}
                            fill={mark ? c.chartInk : c.chartMuted}
                            fontWeight={mark ? '700' : undefined}
                            textAnchor="end"
                          >
                            {String(v).replace(/^-/, '\u2212')}
                          </ChartText>
                        ) : null,
                      ];
                    }),
                    x === undefined ? null : (
                      <ChartText
                        key={`v${id}`}
                        x={cx + tube / 2 + 8}
                        y={py(x) + 4}
                        fontSize={chart.small}
                        fontWeight="700"
                      >
                        {rep.value(id)}
                      </ChartText>
                    ),
                    <ChartText
                      key={`n${id}`}
                      x={cx}
                      y={h - 2}
                      fontSize={chart.tiny}
                      fill={c.chartMuted}
                      textAnchor="middle"
                    >
                      {rep.tag(id)}
                    </ChartText>,
                  ];
                })}
              </Svg>
              {spec.items.map((id, i) => {
                // A "?" thermometer's handle waits next to the other one (or at the bottom).
                // A "?" thermometer's handle waits beside the other reading, or halfway up (not at
                // the bottom, where it would read as the lowest temperature).
                const from =
                  shown[i] ?? shown.find((x, k) => k !== i && x !== undefined) ?? (lo + hi) / 2;
                return (
                  <DragHandle
                    key={`d${id}`}
                    testID={`drag-${id}`}
                    x={slot * i + slot / 2 + 10}
                    y={py(from)}
                    label={rep.variable(id).name}
                    onStart={() => (start.current = from)}
                    onMove={(_, dy) =>
                      calc.set(
                        {
                          // The other typed readings hold still; one worked out from them (a mix) follows.
                          ...rep.pinTyped(spec.items.filter((x) => x !== id)),
                          [id]: rep.snapTo(
                            id,
                            (start.current - (dy / (bottom - top)) * (hi - lo)) * rep.factor(id),
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
          const listed = spec.items.map((id) => rep.named(id)).join(' · ');
          // No full stop after a "?" ("Temperature now: ?").
          const names = listed.endsWith('?') ? listed : `${listed}.`;
          const [a, b] = shown;
          if (!spec.difference || a === undefined || b === undefined) return names;
          // Say which one is warmer, so a shade warmer than the sun reads as what it is.
          if (a === b) return `${names} Both the same.`;
          const warmer = rep.variable(spec.items[a > b ? 0 : 1]!).name;
          const cooler = rep.variable(spec.items[a > b ? 1 : 0]!).name.toLowerCase();
          return `${names} ${warmer} is ${nowrap(rep.value(spec.difference))} warmer than ${cooler}.`;
        })()}
      </Caption>
      {unit ? null : null}
    </View>
  );
}

/** A cup of water the thermometer stands in, dark or light, lit from the top left. */
function Cup({ cx, top, dark, sheen }: { cx: number; top: number; dark: boolean; sheen: string }) {
  const c = usePalette();
  const wTop = 27;
  const wBot = 21;
  const hgt = 42;
  const body = `M ${cx - wTop} ${top} L ${cx + wTop} ${top} L ${cx + wBot} ${top + hgt} L ${cx - wBot} ${top + hgt} Z`;
  return (
    <>
      <FloorShadow cx={cx + 4} cy={top + hgt + 1} rx={wTop} />
      <Path d={body} fill={dark ? c.cupDark : c.cupLight} stroke={c.chartMuted} />
      <Path d={body} fill={url(sheen)} />
      {/* The water inside, seen over the rim. */}
      <Ellipse cx={cx} cy={top} rx={wTop} ry={4} fill={c.water} stroke={c.chartMuted} />
    </>
  );
}
