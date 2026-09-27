/**
 * Two options on the `scale` picture: `before`, the same kitchen scale read before and after
 * (a fizz lets gas escape: the difference floats away as bubbles), and `hanging`, a spring
 * scale in newtons with washers hanging from its hook.
 */
import { View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, Line, Path, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { Deepen, Glass, Metal, Sheen, TopLight, url, usePaintIds } from './paint';
import { Steppers } from './Steppers';

type Spec = Extract<Representation, { kind: 'scale' }>;

/** A value in its shown unit with the unit ("137 g"), from a number the picture worked out. */
const withUnit = (x: number, unit: string | undefined) =>
  `${formatNumber(x)}${unit ? ` ${unit}` : ''}`;

/**
 * Before and after on the same scale: a cup of vinegar with baking soda beside it, then the
 * cup fizzing with bubbles leaving it. Each dial points at its reading; the bubbles are
 * labelled with the difference, the mass of the gas that escaped.
 */
export function TwoScales({
  spec,
  before,
  calc,
}: {
  spec: Spec;
  before: string;
  calc: Calculator;
}) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('metal', 'light', 'glass', 'liquid');
  const unit = rep.unit(spec.total);
  const known = rep.known(before) && rep.known(spec.total);
  const b = rep.known(before) ? rep.shown(before) : 0;
  const a = rep.known(spec.total) ? rep.shown(spec.total) : 0;
  const gas = Math.round((b - a) * 1e6) / 1e6;
  const max = Math.max(spec.max, b, a);

  const panel = (x0: number, pw: number, h: number, reading: number, after: boolean) => {
    const cx = x0 + pw / 2;
    const panY = h * 0.47;
    const dialY = h * 0.84;
    const r = Math.min(pw * 0.38, h * 0.3);
    const needle = Math.PI * (1 - Math.min(1, reading / max));
    const cupW = Math.min(46, pw * 0.3);
    const cupH = cupW * 1.1;
    const cupX = cx - cupW / 2 - (after ? 0 : cupW * 0.35);
    const cupY = panY - cupH;
    const top = cupY + cupH * 0.3;
    return (
      <G key={after ? 'after' : 'before'}>
        {/* The cup: glass with vinegar in it; after the fizz, bubbles in the liquid. */}
        <Path
          d={`M ${cupX} ${top} L ${cupX + cupW} ${top} L ${cupX + cupW * 0.92} ${panY - 1} L ${cupX + cupW * 0.08} ${panY - 1} Z`}
          fill={url(ids.liquid)}
        />
        <Path
          d={`M ${cupX} ${cupY} L ${cupX + cupW * 0.08} ${panY - 1} L ${cupX + cupW * 0.92} ${panY - 1} L ${cupX + cupW} ${cupY}`}
          fill={url(ids.glass)}
          stroke={c.glassEdge}
          strokeWidth={chart.strokeLight}
          strokeLinejoin="round"
        />
        {after
          ? [0.25, 0.5, 0.72, 0.38, 0.62].map((f, i) => (
              <Circle
                key={`in${i}`}
                cx={cupX + cupW * f}
                cy={top + (cupH * 0.7 * (i + 1)) / 6}
                r={1.8}
                fill="none"
                stroke={c.snow}
                strokeWidth={1}
              />
            ))
          : null}
        {!after ? (
          // Baking soda: a white heap on a little dish beside the cup.
          <G>
            <Path
              d={`M ${cupX + cupW + 4} ${panY - 5} Q ${cupX + cupW + 15} ${panY - 18} ${cupX + cupW + 26} ${panY - 5} Z`}
              fill={c.snow}
              stroke={c.chartMuted}
              strokeWidth={chart.strokeLight}
            />
            <Rect
              x={cupX + cupW + 1}
              y={panY - 5}
              width={28}
              height={4}
              rx={2}
              fill={c.paper}
              stroke={c.chartMuted}
              strokeWidth={chart.strokeLight}
            />
          </G>
        ) : (
          // The gas leaving: bubbles rising out of the cup, labelled with the difference.
          <G>
            {[
              [0.3, 0.35, 3],
              [0.62, 0.55, 2.4],
              [0.45, 0.8, 3.4],
              [0.7, 1.05, 2.6],
              [0.35, 1.25, 2.2],
            ].map(([fx, fy, br], i) => (
              <Circle
                key={`up${i}`}
                cx={cupX + cupW * fx!}
                cy={cupY - cupH * 0.5 * fy!}
                r={br}
                fill="none"
                stroke={c.chartMuted}
                strokeWidth={1.2}
              />
            ))}
            <Path
              d={`M ${cupX + cupW + 6} ${cupY} L ${cupX + cupW + 6} ${cupY - cupH * 0.6}`}
              stroke={c.chartHighlight}
              strokeWidth={chart.stroke}
            />
            <Path
              d={`M ${cupX + cupW + 2} ${cupY - cupH * 0.6 + 5} L ${cupX + cupW + 6} ${cupY - cupH * 0.6} L ${cupX + cupW + 10} ${cupY - cupH * 0.6 + 5}`}
              stroke={c.chartHighlight}
              strokeWidth={chart.stroke}
              fill="none"
            />
            <ChartText
              x={Math.min(x0 + pw - 2, cupX + cupW + 12)}
              y={cupY - cupH * 0.3}
              fontSize={chart.small}
              fontWeight="700"
              fill={c.chartHighlight}
              textAnchor={cupX + cupW + 12 + 50 > x0 + pw ? 'end' : 'start'}
            >
              {known ? `${withUnit(gas, unit)} gas` : '? gas'}
            </ChartText>
          </G>
        )}
        {/* The pan and its post. */}
        <Path
          d={`M ${cx - pw * 0.42} ${panY} L ${cx + pw * 0.42} ${panY} L ${cx + pw * 0.36} ${panY + 10} L ${cx - pw * 0.36} ${panY + 10} Z`}
          fill={url(ids.metal)}
          stroke={c.metalDark}
          strokeWidth={chart.stroke}
          strokeLinejoin="round"
        />
        <Rect
          x={cx - 4}
          y={panY + 10}
          width={8}
          height={Math.max(0, dialY - r - panY - 18)}
          fill={url(ids.metal)}
          stroke={c.metalDark}
        />
        {/* The body and the dial's paper face, 0 on the left, the most on the right. */}
        <Path
          d={`M ${cx - r - 12} ${dialY + 4} A ${r + 12} ${r + 12} 0 0 1 ${cx + r + 12} ${dialY + 4} Z`}
          fill={url(ids.metal)}
          stroke={c.metalDark}
          strokeWidth={chart.stroke}
        />
        <Path
          d={`M ${cx - r - 5} ${dialY} A ${r + 5} ${r + 5} 0 0 1 ${cx + r + 5} ${dialY} Z`}
          fill={c.paper}
          stroke={c.metalDark}
          strokeWidth={1}
        />
        {Array.from({ length: 11 }, (_, i) => {
          const t = Math.PI * (1 - i / 10);
          const k = i % 5 ? 5 : 10;
          return (
            <Line
              key={`k${i}`}
              x1={cx + Math.cos(t) * r}
              y1={dialY - Math.sin(t) * r}
              x2={cx + Math.cos(t) * (r - k)}
              y2={dialY - Math.sin(t) * (r - k)}
              stroke={c.chartInk}
              strokeWidth={chart.strokeLight}
            />
          );
        })}
        {[0, 10].map((i) => (
          <ChartText
            key={`n${i}`}
            x={cx + (i ? 1 : -1) * (r - 10)}
            y={dialY + 14}
            fontSize={chart.tiny}
            fill={c.chartMuted}
            textAnchor="middle"
          >
            {formatNumber((max * i) / 10)}
          </ChartText>
        ))}
        <Line
          x1={cx}
          y1={dialY}
          x2={cx + Math.cos(needle) * (r - 6)}
          y2={dialY - Math.sin(needle) * (r - 6)}
          stroke={c.chartHighlight}
          strokeWidth={chart.strokeHeavy}
          strokeLinecap="round"
        />
        <Circle cx={cx} cy={dialY} r={4} fill={c.chartInk} />
        <ChartText
          x={cx}
          y={14}
          fontSize={chart.label}
          fontWeight="700"
          fill={c.chartMuted}
          textAnchor="middle"
        >
          {after ? 'After the fizz' : 'Before'}
        </ChartText>
        <ChartText
          x={cx}
          y={dialY + 30}
          fontSize={chart.value}
          fontWeight="700"
          textAnchor="middle"
        >
          {rep.value(after ? spec.total : before)}
        </ChartText>
      </G>
    );
  };

  return (
    <View>
      <Canvas aspect={0.78}>
        {({ w, h }) => (
          <Svg width={w} height={h}>
            <Defs>
              <Deepen id={ids.metal} from={c.metal} to={c.metalDark} />
              <TopLight id={ids.light} />
              <Glass id={ids.glass} />
              <Deepen id={ids.liquid} from={c.water} to={c.waterDeep} />
            </Defs>
            {panel(0, w / 2, h - 16, b, false)}
            {panel(w / 2, w / 2, h - 16, a, true)}
          </Svg>
        )}
      </Canvas>
      <Caption>
        {known
          ? `${rep.value(before)} − ${rep.value(spec.total)} = ${withUnit(gas, unit)}. That is the gas that escaped.`
          : 'Type what is in the cup and the mass after.'}
      </Caption>
      <Steppers
        calc={calc}
        items={[
          ...(spec.items ?? []).map((id) => ({
            var: id,
            steps: [1, 10],
            pin: [...(spec.items ?? []).filter((x) => x !== id), spec.total],
          })),
          { var: spec.total, steps: [1], pin: spec.items ?? [] },
        ]}
      />
    </View>
  );
}

/**
 * A spring scale hanging from a bar, reading in newtons: the spring inside stretches down to
 * the pointer, and `count` washers hang from its hook on a loop of wire.
 */
export function SpringScale({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('metal', 'sheen', 'light', 'washer');
  const n = spec.count ? Math.max(0, Math.min(20, Math.round(rep.shown(spec.count)))) : 0;
  const p = rep.known(spec.total) ? Math.max(0, rep.shown(spec.total)) : 0;
  // Past the scale (a heavier stack), the scale reads to the next 10.
  const max = p > spec.max ? Math.ceil(p / 10) * 10 : spec.max;
  const unit = rep.unit(spec.total) ?? 'N';
  // Numbered marks: every tenth of the scale, or every fifth part when the tube is short.
  return (
    <View>
      <Canvas aspect={1}>
        {({ w, h }) => {
          const cx = w * 0.42;
          const barY = 14;
          const bodyTop = barY + 30;
          const bodyW = 34;
          const bodyH = h * 0.5;
          const winTop = bodyTop + 16;
          const winH = bodyH - 30;
          const at = (x: number) => winTop + (Math.min(x, max) / max) * winH;
          const py = at(p);
          const hookY = bodyTop + bodyH + 20;
          const loopY = hookY + 18;
          const wh = Math.max(3.5, Math.min(8, (h - loopY - 16) / Math.max(n, 1)));
          const ww = 36;
          const turns = 9;
          const coil = Array.from({ length: turns * 2 + 1 }, (_, i) => {
            const y = winTop - 8 + ((py - winTop + 8) * i) / (turns * 2);
            return `${i ? 'L' : 'M'} ${cx + (i === 0 || i === turns * 2 ? 0 : i % 2 ? -7 : 7)} ${y}`;
          }).join(' ');
          const every = winH / 10 >= 13 ? 1 : 5;
          return (
            <Svg width={w} height={h}>
              <Defs>
                <Deepen id={ids.metal} from={c.metal} to={c.metalDark} />
                <Sheen id={ids.sheen} />
                <TopLight id={ids.light} />
                <Metal id={ids.washer} light={c.silver} dark={c.silverDark} />
              </Defs>
              {/* The support: a wooden bar with a ring the scale hangs from. */}
              <Rect x={w * 0.12} y={barY - 8} width={w * 0.62} height={10} rx={3} fill={c.wood} />
              <Rect
                x={w * 0.12}
                y={barY - 8}
                width={w * 0.62}
                height={10}
                rx={3}
                fill={url(ids.light)}
              />
              <Circle
                cx={cx}
                cy={barY + 9}
                r={7}
                fill="none"
                stroke={c.metalDark}
                strokeWidth={2.5}
              />
              <Line
                x1={cx}
                y1={barY + 16}
                x2={cx}
                y2={bodyTop}
                stroke={c.metalDark}
                strokeWidth={2.5}
              />
              {/* The tube: clear plastic over the scale, the spring inside. */}
              <Rect
                x={cx - bodyW / 2}
                y={bodyTop}
                width={bodyW}
                height={bodyH}
                rx={8}
                fill={c.plastic}
                stroke={c.chartInk}
                strokeWidth={chart.strokeLight}
              />
              <Rect
                x={cx - bodyW / 2}
                y={bodyTop}
                width={bodyW}
                height={bodyH}
                rx={8}
                fill={url(ids.sheen)}
              />
              <Path
                d={coil}
                fill="none"
                stroke={c.metalDark}
                strokeWidth={1.6}
                strokeLinejoin="round"
              />
              {Array.from({ length: 11 }, (_, i) => {
                const y = winTop + (winH * i) / 10;
                const big = i % 5 === 0;
                return (
                  <G key={i}>
                    <Line
                      x1={cx + bodyW / 2 - (big ? 12 : 7)}
                      y1={y}
                      x2={cx + bodyW / 2}
                      y2={y}
                      stroke={c.chartInk}
                      strokeWidth={chart.strokeLight}
                    />
                    {i % every === 0 ? (
                      <ChartText
                        x={cx + bodyW / 2 + 5}
                        y={y + 4}
                        fontSize={chart.tiny}
                        fill={c.chartMuted}
                      >
                        {formatNumber((max * i) / 10)}
                      </ChartText>
                    ) : null}
                  </G>
                );
              })}
              {/* The pointer, at the pull, and the reading beside it. */}
              <Path
                d={`M ${cx - bodyW / 2 + 2} ${py} L ${cx + bodyW / 2 - 1} ${py}`}
                stroke={c.chartHighlight}
                strokeWidth={chart.strokeHeavy}
                strokeLinecap="round"
              />
              <Line
                x1={cx + bodyW / 2 + 30}
                y1={py}
                x2={cx + bodyW / 2 + 42}
                y2={py}
                stroke={c.chartHighlight}
                strokeWidth={chart.stroke}
              />
              <ChartText x={cx + bodyW / 2 + 46} y={py + 6} fontSize={chart.value} fontWeight="700">
                {rep.known(spec.total) ? withUnit(p, unit) : '?'}
              </ChartText>
              {/* The rod out of the bottom and its hook. */}
              <Line
                x1={cx}
                y1={bodyTop + bodyH}
                x2={cx}
                y2={hookY}
                stroke={c.metalDark}
                strokeWidth={2.5}
              />
              <Path
                d={`M ${cx} ${hookY - 2} L ${cx} ${hookY + 6} A 6 6 0 1 1 ${cx - 6} ${hookY + 12}`}
                fill="none"
                stroke={c.metalDark}
                strokeWidth={2.5}
                strokeLinecap="round"
              />
              {/* A wire loop through the washers, hanging on the hook. */}
              {n > 0 ? (
                <Path
                  d={`M ${cx} ${hookY + 12} L ${cx - 3} ${loopY} L ${cx - 3} ${loopY + n * wh + 4} M ${cx} ${hookY + 12} L ${cx + 3} ${loopY} L ${cx + 3} ${loopY + n * wh + 4}`}
                  fill="none"
                  stroke={c.metalDark}
                  strokeWidth={1.2}
                />
              ) : null}
              {Array.from({ length: n }, (_, i) => {
                const y = loopY + 2 + i * wh;
                return (
                  <G key={`w${i}`}>
                    <Rect
                      x={cx - ww / 2}
                      y={y}
                      width={ww}
                      height={wh - 1}
                      rx={(wh - 1) / 2}
                      fill={url(ids.washer)}
                      stroke={c.silverDark}
                      strokeWidth={0.8}
                    />
                    <Ellipse
                      cx={cx}
                      cy={y + (wh - 1) / 2}
                      rx={4}
                      ry={(wh - 1) / 3}
                      fill={c.shade}
                      opacity={0.5}
                    />
                  </G>
                );
              })}
              {n > 0 ? (
                <ChartText
                  x={cx + ww / 2 + 8}
                  y={loopY + (n * wh) / 2 + 5}
                  fontSize={chart.small}
                  fill={c.chartMuted}
                >
                  {`${n} ${n === 1 ? 'washer' : 'washers'}`}
                </ChartText>
              ) : null}
            </Svg>
          );
        }}
      </Canvas>
      <Caption>
        {spec.each
          ? `${n} ${n === 1 ? 'washer' : 'washers'} × ${rep.value(spec.each)} = ${rep.value(spec.total)}`
          : rep.named(spec.total)}
      </Caption>
      <Steppers
        calc={calc}
        items={
          spec.count && spec.each
            ? [
                { var: spec.count, steps: [1], pin: [spec.each] },
                { var: spec.each, steps: [0.1], pin: [spec.count] },
              ]
            : []
        }
      />
    </View>
  );
}
