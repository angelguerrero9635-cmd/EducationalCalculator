import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, Line, Path, Polygon, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { CHANCE_COLORS, PictureButton, chanceColor } from './chance';
import { BoxShadow, Metal, TopLight, url, usePaintIds } from './paint';

type Spec = Extract<Representation, { kind: 'spinner' }>;

/** The most equal sectors a spinner is cut into. */
export const SPINNER_MAX = 24;

/** A point `r` from the middle at `deg` clockwise from straight up. */
const polar = (cx: number, cy: number, r: number, deg: number) => {
  const t = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(t), y: cy + r * Math.sin(t) };
};

/**
 * A classroom spinner: a card with a dial cut into equal sectors, each outcome's sectors
 * together in its color, and a metal arrow on a pin. The event's sectors (`pick`) are
 * outlined. "Spin" turns the arrow to a random place and says where it stopped.
 */
export function Spinner({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('card', 'pin', 'arrow');
  const counts = spec.parts.map((id) =>
    rep.known(id) ? Math.max(0, Math.min(SPINNER_MAX, Math.round(rep.shown(id)))) : 0,
  );
  const total = counts.reduce((s, x) => s + x, 0);
  const sectors = Math.min(SPINNER_MAX, total);
  const known = spec.parts.every(rep.known);
  const pick = spec.pick ?? 0;
  const colors = spec.colors ?? CHANCE_COLORS;
  const names = spec.names ?? colors.map((x) => x);
  const [angle, setAngle] = useState(20);
  const [landed, setLanded] = useState<number | undefined>(undefined);
  const frame = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);
  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    },
    [],
  );
  // Which outcome a pointer angle lands on (sectors run clockwise from the top).
  const outcomeAt = (deg: number) => {
    if (sectors === 0) return undefined;
    const k = Math.floor((((deg % 360) + 360) % 360) / (360 / sectors));
    let s = 0;
    for (let i = 0; i < counts.length; i++) {
      s += counts[i]!;
      if (k < s) return i;
    }
    return undefined;
  };
  const spin = () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    const from = angle;
    const to = from + 720 + Math.random() * 360;
    const t0 = Date.now();
    setLanded(undefined);
    const step = () => {
      const t = Math.min(1, (Date.now() - t0) / 900);
      const now = from + (to - from) * (1 - (1 - t) ** 3);
      setAngle(now);
      if (t < 1) frame.current = requestAnimationFrame(step);
      else {
        frame.current = null;
        setLanded(outcomeAt(to));
      }
    };
    frame.current = requestAnimationFrame(step);
  };

  const pickName = names[pick] ?? `outcome ${pick + 1}`;
  const chanceLine =
    spec.chance && total > 0
      ? `${rep.words ? rep.variable(spec.chance).name : `${rep.variable(spec.chance).symbol}(${pickName})`} = ${counts[pick]}/${total} = ${rep.value(spec.chance)}`
      : total > 0
        ? `${counts[pick]} of ${total} sectors are ${pickName}.`
        : 'Type how many sectors each color has.';

  return (
    <View>
      <Canvas aspect={0.8}>
        {({ w, h }) => {
          const side = Math.min(w - 24, h - 16);
          const x0 = (w - side) / 2;
          const y0 = (h - side) / 2;
          const cx = w / 2;
          const cy = h / 2;
          const R = side / 2 - 16;
          const per = sectors ? 360 / sectors : 360;
          // Each outcome's run of sectors: from its first sector to past its last.
          let s = 0;
          const runs = counts.map((k, i) => {
            const run = { i, from: s * per, to: (s + k) * per, k };
            s += k;
            return run;
          });
          const wedge = (a: number, b: number, r: number) => {
            if (b - a >= 359.999)
              return `M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0`;
            const p = polar(cx, cy, r, a);
            const q = polar(cx, cy, r, b);
            return `M ${cx} ${cy} L ${p.x} ${p.y} A ${r} ${r} 0 ${b - a > 180 ? 1 : 0} 1 ${q.x} ${q.y} Z`;
          };
          const tip = polar(cx, cy, R * 0.86, angle);
          const tail = polar(cx, cy, R * 0.28, angle + 180);
          const left = polar(cx, cy, R * 0.07, angle - 90);
          const right = polar(cx, cy, R * 0.07, angle + 90);
          return (
            <Svg width={w} height={h} opacity={known ? 1 : 0.4}>
              <Defs>
                <TopLight id={ids.card} strength={0.8} />
                <Metal id={ids.pin} light={c.metal} dark={c.metalDark} />
                <Metal id={ids.arrow} light={c.silver} dark={c.silverDark} />
              </Defs>
              {/* The card the dial is printed on. */}
              <BoxShadow x={x0} y={y0} width={side} height={side} r={10} />
              <Rect
                x={x0}
                y={y0}
                width={side}
                height={side}
                rx={10}
                fill={c.paper}
                stroke={c.border}
              />
              <Rect x={x0} y={y0} width={side} height={side} rx={10} fill={url(ids.card)} />
              {runs.map((run) =>
                run.k > 0 ? (
                  <Path
                    key={`r${run.i}`}
                    d={wedge(run.from, run.to, R)}
                    fill={chanceColor(c, colors[run.i] ?? 'red').fill}
                  />
                ) : null,
              )}
              {/* Thin lines between the equal sectors. */}
              {sectors > 1
                ? Array.from({ length: sectors }, (_, k) => {
                    const p = polar(cx, cy, R, k * per);
                    return (
                      <Line
                        key={`l${k}`}
                        x1={cx}
                        y1={cy}
                        x2={p.x}
                        y2={p.y}
                        stroke={c.paper}
                        strokeWidth={1.5}
                      />
                    );
                  })
                : null}
              <Circle
                cx={cx}
                cy={cy}
                r={R}
                fill="none"
                stroke={c.chartInk}
                strokeWidth={chart.stroke}
              />
              {/* The event's sectors, outlined. */}
              {runs[pick] && runs[pick].k > 0 && runs[pick].k < total ? (
                <Path
                  d={wedge(runs[pick].from, runs[pick].to, R)}
                  fill="none"
                  stroke={c.chartInk}
                  strokeWidth={chart.strokeHeavy}
                  strokeLinejoin="round"
                />
              ) : null}
              {runs.map((run) => {
                if (run.k === 0 || run.to - run.from < 28) return null;
                const p = polar(cx, cy, R * 0.62, (run.from + run.to) / 2);
                const ink = chanceColor(c, colors[run.i] ?? 'red').ink;
                return (
                  <G key={`t${run.i}`}>
                    <ChartText
                      x={p.x}
                      y={p.y}
                      fontSize={chart.label}
                      fontWeight="700"
                      fill={ink}
                      textAnchor="middle"
                    >
                      {names[run.i] ?? ''}
                    </ChartText>
                    <ChartText
                      x={p.x}
                      y={p.y + 14}
                      fontSize={chart.small}
                      fill={ink}
                      textAnchor="middle"
                    >
                      {`${run.k} of ${total}`}
                    </ChartText>
                  </G>
                );
              })}
              {/* The metal arrow on its pin. */}
              <Polygon
                points={`${tip.x},${tip.y} ${left.x},${left.y} ${tail.x},${tail.y} ${right.x},${right.y}`}
                fill={url(ids.arrow)}
                stroke={c.metalDark}
                strokeWidth={1}
              />
              <Circle cx={cx} cy={cy} r={R * 0.08} fill={url(ids.pin)} stroke={c.metalDark} />
            </Svg>
          );
        }}
      </Canvas>
      <PictureButton testID="spinner-spin" label="Spin" onPress={spin} />
      <Caption>
        {[
          chanceLine,
          landed !== undefined ? `The arrow stopped on ${names[landed] ?? ''}.` : undefined,
        ]
          .filter(Boolean)
          .join(' · ')}
      </Caption>
    </View>
  );
}
