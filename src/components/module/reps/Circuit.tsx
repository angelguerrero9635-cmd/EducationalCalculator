import { useRef } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Defs, G, Path, Rect } from 'react-native-svg';

import type { Representation } from '@/data/modules';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, fitLabel, niceCeil, useRep } from './common';
import { Glass, Metal, Sheen, usePaintIds } from './paint';
import { Battery, Bulb, KnifeSwitch, Meter } from './physicsArt';

type Spec = Extract<Representation, { kind: 'circuit' }>;
/** Pixels of vertical drag per step of the voltage. */
const PX_PER_STEP = 8;

/** A small label on a card-colored chip, so a wire behind it doesn't run through the text. */
function Chip({
  x,
  y,
  text,
  w,
  faded,
  highlight,
}: {
  x: number;
  y: number;
  text: string;
  w: number;
  faded?: boolean;
  highlight?: boolean;
}) {
  const c = usePalette();
  const at = fitLabel(x, text, chart.tiny, w);
  const tw = text.length * chart.tiny * 0.58 + 6;
  return (
    <G opacity={faded ? 0.45 : 1}>
      <Rect x={at.x - tw / 2} y={y - 10} width={tw} height={14} rx={3} fill={c.background} />
      <ChartText
        {...at}
        y={y}
        fontSize={chart.tiny}
        fontWeight="600"
        fill={highlight ? c.chartHighlight : c.chartInk}
      >
        {text}
      </ChartText>
    </G>
  );
}

/**
 * Series and parallel circuits (Grade 8): a battery lights bulbs through copper wires, a knife
 * switch and an ammeter. In series the bulbs share one loop; in parallel each has its own branch
 * across the battery, with its current beside it. Each bulb glows by the power it gets (brighter
 * for more), so a second bulb in series dims both and one in parallel doesn't. Drag the battery
 * up or down to change its voltage; tap the switch to open or close it.
 */
export function Circuit({ spec, calc }: { spec: Spec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('sheen', 'glass', 'metal', 'socket');
  const start = useRef(0);
  const parallel = spec.wiring === 'parallel';

  // The bulbs drawn: each resistance id, or `count` copies of the first.
  const countKnown = !spec.count || rep.known(spec.count);
  const n = spec.count
    ? Math.min(4, Math.max(1, Math.round(rep.val(spec.count))))
    : Math.min(4, spec.bulbs.length);
  const bulbIds = spec.count
    ? Array.from({ length: n }, () => spec.bulbs[0]!)
    : spec.bulbs.slice(0, 4);
  const on = spec.switch ? rep.val(spec.switch) >= 0.5 : true;
  const switchKnown = !spec.switch || rep.known(spec.switch);

  // How brightly each bulb glows: its power over the power it would get alone across the
  // biggest battery, square-rooted so a dim bulb still shows.
  const V = rep.val(spec.voltage);
  const vVar = rep.variable(spec.voltage);
  const vFull = vVar.max ?? 2 * V;
  const Rs = bulbIds.map((id) => Math.max(1e-9, rep.val(id)));
  const sumR = Rs.reduce((a, b) => a + b, 0);
  const powered = on && rep.known(spec.voltage);
  const glow = Rs.map((R) => {
    if (!powered) return 0;
    const P = parallel ? (V * V) / R : (V / sumR) ** 2 * R;
    return Math.min(1, Math.sqrt(P / ((vFull * vFull) / R)));
  });

  // The meter's scale: to the current's largest value, rounded up.
  const iVar = rep.variable(spec.current);
  const iMax = niceCeil(iVar.max ?? 2 * rep.val(spec.current));
  const reading = on && rep.known(spec.current) ? rep.val(spec.current) / iMax : 0;

  const sym = (id: string) => (rep.words ? rep.variable(id).name : rep.variable(id).symbol);
  const unitOf = (id: string) => rep.unit(id);

  return (
    <View>
      <Canvas aspect={(w) => (parallel ? 262 : 232) / w}>
        {({ w, h }) => {
          const bx = 30;
          const right = w - 16;
          const topY = parallel ? 40 : 72;
          const botY = parallel ? 206 : 180;
          const midY = (topY + botY) / 2;
          const batH = 64;
          const batTop = midY - batH / 2;
          const wire = {
            stroke: c.copper,
            strokeWidth: chart.strokeHeavy,
            strokeLinecap: 'round' as const,
            strokeLinejoin: 'round' as const,
            fill: 'none' as const,
          };
          const sw = { x0: 58, x1: 96 };
          const meterX = parallel ? 100 : (bx + right) / 2;
          // Series: the bulbs stand on the top wire. Parallel: one rung each.
          const first = parallel ? 146 : 124;
          const span = (right - 10 - first) / n;
          const bulbX = (i: number) => first + span * (i + 0.5);
          const flow = powered && reading > 0;
          const chevron = (x: number, y: number, dir: 'right' | 'left' | 'down') => {
            const d =
              dir === 'down'
                ? `M ${x - 5} ${y - 3} L ${x} ${y + 3} L ${x + 5} ${y - 3}`
                : dir === 'right'
                  ? `M ${x - 3} ${y - 5} L ${x + 3} ${y} L ${x - 3} ${y + 5}`
                  : `M ${x + 3} ${y - 5} L ${x - 3} ${y} L ${x + 3} ${y + 5}`;
            return (
              <Path
                key={`${x},${y}`}
                d={d}
                stroke={c.chartHighlight}
                strokeWidth={chart.stroke}
                fill="none"
              />
            );
          };
          const rLabel = (i: number) =>
            spec.count ? rep.label(spec.bulbs[0]!) : rep.label(bulbIds[i]!);
          return (
            <>
              <Svg width={w} height={h}>
                <Defs>
                  <Sheen id={ids.sheen} />
                  <Glass id={ids.glass} />
                  <Metal id={ids.metal} light={c.silver} dark={c.silverDark} />
                  <Metal id={ids.socket} light={c.metal} dark={c.metalDark} />
                </Defs>

                {/* Copper wires: up from the battery's +, across the top, down, back along the bottom. */}
                <Path
                  d={`M ${bx} ${batTop - 4} V ${topY} H ${right} V ${botY} H ${bx} V ${batTop + batH}`}
                  {...wire}
                />
                {parallel
                  ? bulbIds.map((_, i) => (
                      // Down to the socket's side, and from its bottom down to the bottom wire.
                      <Path
                        key={`rung${i}`}
                        d={`M ${bulbX(i) - 18} ${topY} V ${midY + 10} H ${bulbX(i) - 6} M ${bulbX(i)} ${midY + 16} V ${botY}`}
                        {...wire}
                      />
                    ))
                  : null}

                <Battery
                  x={bx}
                  top={batTop}
                  height={batH}
                  sheen={ids.sheen}
                  faded={!rep.known(spec.voltage)}
                />
                <ChartText
                  x={bx + 18}
                  y={midY + 4}
                  fontSize={chart.value}
                  fontWeight="700"
                  opacity={rep.known(spec.voltage) ? 1 : 0.45}
                >
                  {rep.label(spec.voltage)}
                </ChartText>

                <KnifeSwitch x0={sw.x0} x1={sw.x1} y={topY} closed={on} faded={!switchKnown} />
                <ChartText
                  x={(sw.x0 + sw.x1) / 2}
                  y={topY + 22}
                  fontSize={chart.tiny}
                  fill={c.chartMuted}
                  textAnchor="middle"
                >
                  {on ? 'closed' : 'open'}
                </ChartText>

                {/* Bulbs: on the top wire in series; halfway down each rung in parallel. */}
                {bulbIds.map((id, i) => {
                  const x = bulbX(i);
                  const y = parallel ? midY + 10 : topY;
                  const label = rLabel(i);
                  // Series labels above the bulbs; four of them take two rows.
                  const ly = parallel ? topY + 22 : topY - 46 - (n === 4 && i % 2 ? 13 : 0);
                  const showLabel = !spec.count || i === 0;
                  return (
                    <G key={i}>
                      <Bulb
                        x={x}
                        y={y}
                        glow={glow[i]!}
                        glass={ids.glass}
                        metal={ids.socket}
                        faded={!rep.known(id) || !countKnown}
                      />
                      {showLabel ? (
                        <Chip x={x} y={ly} text={label} w={w} faded={!rep.known(id)} />
                      ) : null}
                      {parallel && spec.branches?.[i] ? (
                        <Chip
                          x={x}
                          y={botY - 12}
                          text={rep.label(spec.branches[i]!)}
                          w={w}
                          faded={!rep.known(spec.branches[i]!)}
                          highlight
                        />
                      ) : null}
                      {parallel && flow ? chevron(x, midY + 34, 'down') : null}
                    </G>
                  );
                })}
                {spec.count && countKnown ? (
                  <ChartText
                    {...fitLabel(
                      (first + right) / 2,
                      `${rep.named(spec.count)} bulbs`,
                      chart.tiny,
                      w,
                    )}
                    y={parallel ? botY + 34 : topY - 62}
                    fontSize={chart.tiny}
                    fill={c.chartMuted}
                  >
                    {`${rep.named(spec.count)} bulbs`}
                  </ChartText>
                ) : null}

                {/* Current: out of +, round the loop (clockwise). */}
                {flow ? (
                  <>
                    {chevron(parallel ? 124 : 110, topY, 'right')}
                    {parallel ? null : chevron(right, midY, 'down')}
                    {chevron(parallel ? 60 : (bx + meterX) / 2, botY, 'left')}
                  </>
                ) : null}

                <Meter
                  x={meterX}
                  y={botY}
                  reading={reading}
                  max={formatNumber(iMax)}
                  metal={ids.metal}
                  faded={!rep.known(spec.current)}
                />
                <ChartText
                  {...fitLabel(meterX, rep.label(spec.current), chart.value, w)}
                  y={botY + 40}
                  fontSize={chart.value}
                  fontWeight="700"
                  fill={c.chartHighlight}
                  opacity={rep.known(spec.current) ? 1 : 0.45}
                >
                  {rep.label(spec.current)}
                </ChartText>
              </Svg>
              <DragHandle
                testID="drag-voltage"
                x={bx}
                y={midY}
                label={vVar.name}
                onStart={() => {
                  start.current = rep.shown(spec.voltage);
                }}
                onMove={(_, dy) => {
                  const step = vVar.step ?? 0.5;
                  calc.set(
                    {
                      ...rep.pin([
                        ...new Set([...spec.bulbs, ...(spec.count ? [spec.count] : [])]),
                      ]),
                      ...(spec.switch ? rep.pin([spec.switch]) : {}),
                      [spec.voltage]: rep.snapTo(
                        spec.voltage,
                        (start.current - (dy / PX_PER_STEP) * step) * rep.factor(spec.voltage),
                      ),
                    },
                    rep.slide(spec.voltage),
                  );
                }}
              />
              {spec.switch ? (
                <Pressable
                  testID="tap-switch"
                  accessibilityRole="button"
                  accessibilityLabel={on ? 'Open the switch' : 'Close the switch'}
                  onPress={() =>
                    calc.set({
                      ...rep.pin([
                        spec.voltage,
                        ...spec.bulbs,
                        ...(spec.count ? [spec.count] : []),
                      ]),
                      [spec.switch!]: on ? 0 : 1,
                    })
                  }
                  style={{
                    position: 'absolute',
                    left: sw.x0 - 10,
                    top: topY - 34,
                    width: sw.x1 - sw.x0 + 20,
                    height: 44,
                  }}
                />
              ) : null}
            </>
          );
        }}
      </Canvas>
      <Caption>{caption()}</Caption>
    </View>
  );

  /** The current worked with every number: I = V ÷ R per branch, or V ÷ the total resistance. */
  function caption(): string {
    const [Vs, Is] = [sym(spec.voltage), sym(spec.current)];
    const [Vv, Iv] = [rep.value(spec.voltage), rep.value(spec.current)];
    if (!on) return `The switch is open: no current flows. · ${Is} = ${Iv}`;
    const R0 = spec.bulbs[0]!;
    if (!parallel) {
      if (spec.count) {
        return `${Is} = ${Vs} ÷ (${sym(spec.count)} × ${sym(R0)}) = ${Vv} ÷ (${rep.value(spec.count, false)} × ${rep.value(R0)}) = ${Iv}`;
      }
      const syms = bulbIds.map(sym).join(' + ');
      const vals = bulbIds.map((id) => rep.value(id)).join(' + ');
      return n === 1
        ? `${Is} = ${Vs} ÷ ${syms} = ${Vv} ÷ ${vals} = ${Iv}`
        : `${Is} = ${Vs} ÷ (${syms}) = ${Vv} ÷ (${vals}) = ${Iv}`;
    }
    // Parallel: each branch gets the whole voltage.
    const branchValue = (i: number) => {
      const b = spec.branches?.[i];
      if (b) return rep.value(b);
      const R = bulbIds[i]!;
      if (!rep.known(spec.voltage) || !rep.known(R)) return '?';
      const u = unitOf(spec.current);
      return `${formatNumber(rep.val(spec.voltage) / rep.val(R))}${u ? ` ${u}` : ''}`;
    };
    const rule = (r: string) => `Each branch gets the whole battery: ${Is} = ${Vs} ÷ ${r}.`;
    if (spec.count) {
      const each = branchValue(0);
      return `${rule(sym(R0))} · ${Vv} ÷ ${rep.value(R0)} = ${each} · ${Is} = ${rep.value(spec.count, false)} × ${each} = ${Iv}`;
    }
    const branchSym = (i: number) =>
      spec.branches?.[i] ? sym(spec.branches[i]!) : `${Is}${'₁₂₃₄'[i]}`;
    const lines = bulbIds.map(
      (id, i) => `${branchSym(i)}: ${Vv} ÷ ${rep.value(id)} = ${branchValue(i)}`,
    );
    const total = `${Is} = ${bulbIds.map((_, i) => branchValue(i)).join(' + ')} = ${Iv}`;
    return [rule(rep.words ? 'resistance' : 'R'), ...lines, total].join(' · ');
  }
}
