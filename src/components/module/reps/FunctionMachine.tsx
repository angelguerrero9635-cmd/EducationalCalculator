import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, G, Path, Rect } from 'react-native-svg';

import { Text } from '@/components/Text';
import type { FunctionMachineSpec, RuleStep } from '@/data/modules/typesGraphs';
import { chart, font, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, useRep } from './common';
import { Arrow, coef, reader } from './graphKit';
import { BoxShadow, TopLight, usePaintIds, url } from './paint';

/** One step of a rule on a number (undefined when it divides by 0). */
const apply = (x: number, op: RuleStep['op'], by: number) =>
  op === '+' ? x + by : op === '−' ? x - by : op === '×' ? x * by : by === 0 ? undefined : x / by;

const VERB: Record<RuleStep['op'], string> = {
  '+': 'add',
  '−': 'subtract',
  '×': 'multiply by',
  '÷': 'divide by',
};

/** The rule applied to a number as one expression: (8 + 2) × 3, 8 ÷ 4 + 2. */
const expression = (x: number, steps: { op: RuleStep['op']; by: number }[]) =>
  steps.reduce(
    (e, s, i) => {
      const wrap = (s.op === '×' || s.op === '÷') && i > 0 && /[+−]/.test(e.last);
      const by = s.by < 0 ? `(${coef(s.by)})` : coef(s.by);
      const text = `${wrap ? `(${e.text})` : e.text} ${s.op} ${by}`;
      return { text, last: s.op };
    },
    { text: x < 0 ? `(${coef(x)})` : coef(x), last: '' },
  ).text;

/**
 * An input-output machine: the input card goes in on the left, each step of the rule works
 * on it in turn (the number after each step under it), and the output card comes out on the
 * right. Under it, a table of other inputs and their outputs; tap an input to run it.
 */
export function FunctionMachine({ spec, calc }: { spec: FunctionMachineSpec; calc: Calculator }) {
  const c = usePalette();
  const rep = useRep(calc);
  const read = reader(rep);
  const ids = usePaintIds('light');
  const input = read(spec.input);
  const output = read(spec.output);
  const steps = spec.rule.map((s) => ({ op: s.op, ...read(s.by) }));
  const ruleKnown = steps.every((s) => s.known);
  /** The number after each step, from x (undefined past a division by 0). */
  const run = (x: number) => {
    const out: (number | undefined)[] = [];
    let v: number | undefined = x;
    for (const s of steps) {
      v = v === undefined ? undefined : apply(v, s.op, s.value);
      out.push(v);
    }
    return out;
  };
  const after = input.known && ruleKnown ? run(input.value) : steps.map(() => undefined);
  const xSym = rep.variable(spec.input).symbol;
  const ySym = rep.variable(spec.output).symbol;
  const rule = steps.map((s) => `${VERB[s.op]} ${s.known ? coef(s.value) : '?'}`).join(', then ');
  const table = spec.table ?? [];

  return (
    <View>
      <Canvas aspect={(w) => Math.min(0.5, 150 / w)}>
        {({ w, h }) => {
          const card = { w: Math.min(72, w * 0.19), h: 46 };
          const gap = Math.max(18, w * 0.05);
          const mx = card.w + gap + 4;
          const mw = w - 2 * mx;
          const top = 26;
          const mh = h - top - 16;
          const cy = top + mh / 2;
          const n = Math.max(1, steps.length);
          const pad = 10;
          const pw = (mw - pad * (n + 1)) / n;
          const panelTop = top + 20;
          const panelH = 36;
          const cardAt = (x: number, text: string, label: string, known: boolean) => (
            <G opacity={known ? 1 : 0.45}>
              <BoxShadow x={x} y={cy - card.h / 2} width={card.w} height={card.h} r={6} />
              <Rect
                x={x}
                y={cy - card.h / 2}
                width={card.w}
                height={card.h}
                rx={6}
                fill={c.paper}
                stroke={c.chartMuted}
                strokeWidth={1}
              />
              <ChartText
                x={x + card.w / 2}
                y={cy - card.h / 2 - 7}
                fontSize={chart.small}
                fill={c.chartMuted}
                textAnchor="middle"
              >
                {label}
              </ChartText>
              <ChartText
                x={x + card.w / 2}
                y={cy + 6}
                fontSize={text.length > 6 ? chart.value : chart.emphasis + 3}
                fontWeight="700"
                textAnchor="middle"
              >
                {text}
              </ChartText>
            </G>
          );
          return (
            <Svg width={w} height={h}>
              <Defs>
                <TopLight id={ids.light} strength={1.2} />
              </Defs>
              {/* The machine: a metal box on feet, lit from above, a window per step. */}
              <Path
                d={`M ${mx + 14} ${top + mh} l -6 10 h 18 l -6 -10 Z M ${mx + mw - 14} ${top + mh} l -6 10 h 18 l -6 -10 Z`}
                fill={c.metalDark}
              />
              <BoxShadow x={mx} y={top} width={mw} height={mh} r={12} offset={4} />
              <Rect
                x={mx}
                y={top}
                width={mw}
                height={mh}
                rx={12}
                fill={c.metal}
                stroke={c.metalDark}
                strokeWidth={1.5}
              />
              <Rect x={mx} y={top} width={mw} height={mh} rx={12} fill={url(ids.light)} />
              {[mx + 9, mx + mw - 9].map((bx) => (
                <Circle key={bx} cx={bx} cy={top + 9} r={2.2} fill={c.metalDark} />
              ))}
              <ChartText
                x={mx + mw / 2}
                y={top + 14}
                fontSize={chart.tiny}
                fontWeight="700"
                fill={c.chartInk}
                textAnchor="middle"
                letterSpacing={1}
              >
                RULE
              </ChartText>
              {steps.map((s, i) => {
                const px = mx + pad + i * (pw + pad);
                const v = after[i];
                return (
                  <G key={i}>
                    <Rect
                      x={px}
                      y={panelTop}
                      width={pw}
                      height={panelH}
                      rx={6}
                      fill={c.paper}
                      stroke={c.metalDark}
                      strokeWidth={1}
                    />
                    <ChartText
                      x={px + pw / 2}
                      y={panelTop + panelH / 2 + 6}
                      fontSize={chart.emphasis + 2}
                      fontWeight="700"
                      textAnchor="middle"
                      opacity={s.known ? 1 : 0.45}
                    >
                      {`${s.op} ${s.known ? coef(s.value) : '?'}`}
                    </ChartText>
                    <ChartText
                      x={px + pw / 2}
                      y={panelTop + panelH + 15}
                      fontSize={chart.label}
                      fontWeight="700"
                      fill={c.chartInk}
                      textAnchor="middle"
                    >
                      {v === undefined ? '→ ?' : `→ ${coef(v)}`}
                    </ChartText>
                    {i > 0 ? (
                      <Path
                        d={`M ${px - pad + 2} ${panelTop + panelH / 2 - 4} l 5 4 l -5 4 Z`}
                        fill={c.metalDark}
                      />
                    ) : null}
                  </G>
                );
              })}
              {cardAt(2, input.text, `In: ${xSym}`, input.known)}
              <Arrow
                x1={card.w + 6}
                y1={cy}
                x2={mx - 2}
                y2={cy}
                color={c.chartInk}
                width={chart.stroke}
              />
              <Arrow
                x1={mx + mw + 2}
                y1={cy}
                x2={w - card.w - 6}
                y2={cy}
                color={c.chartInk}
                width={chart.stroke}
              />
              {cardAt(w - card.w - 2, output.text, `Out: ${ySym}`, output.known)}
            </Svg>
          );
        }}
      </Canvas>
      {table.length > 0 ? (
        <View style={styles.table} accessibilityLabel="Input-output table">
          <View style={[styles.col, { borderColor: c.chartGrid, backgroundColor: c.chartSurface }]}>
            <Text style={[styles.cell, styles.head, { color: c.textMuted }]}>{xSym}</Text>
            <Text style={[styles.cell, styles.head, { color: c.textMuted }]}>{ySym}</Text>
          </View>
          {table.map((x) => {
            const y = ruleKnown ? run(x).at(-1) : undefined;
            const current = input.known && input.value === x;
            return (
              <Pressable
                key={x}
                accessibilityRole="button"
                accessibilityLabel={`Put ${coef(x)} in the machine`}
                onPress={() =>
                  calc.set({
                    ...rep.pin(spec.rule.flatMap((s) => (typeof s.by === 'string' ? [s.by] : []))),
                    [spec.input]: x * rep.factor(spec.input),
                  })
                }
                style={[
                  styles.col,
                  { borderColor: current ? c.chartHighlight : c.chartGrid },
                  current ? { borderWidth: 2 } : null,
                ]}
              >
                <Text style={[styles.cell, { color: c.text }]}>{coef(x)}</Text>
                <Text style={[styles.cell, { color: c.text, fontWeight: '700' }]}>
                  {y === undefined ? '?' : coef(y)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
      <Caption>
        {[
          `Rule: ${rule}.`,
          ...(input.known && ruleKnown && after.at(-1) !== undefined
            ? [
                `${expression(
                  input.value,
                  steps.map((s) => ({ op: s.op, by: s.value })),
                )} = ${coef(after.at(-1)!)}`,
                `Input ${xSym} = ${input.text} gives output ${ySym} = ${coef(after.at(-1)!)}.`,
              ]
            : [`Type the input and the rule to run the machine.`]),
          ...(table.length ? ['Tap an input in the table to run it.'] : []),
        ].join(' · ')}
      </Caption>
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 6,
    paddingHorizontal: 8,
  },
  col: {
    borderWidth: StyleSheet.hairlineWidth,
    minWidth: 40,
    alignItems: 'center',
    paddingVertical: 3,
  },
  head: { paddingHorizontal: 6, fontWeight: '600' },
  cell: { fontSize: font.caption + 2, fontVariant: ['tabular-nums'], paddingVertical: 2 },
});
