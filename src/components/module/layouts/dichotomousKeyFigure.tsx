/**
 * H100 `dichotomousKey` explore figure: a branching yes-or-no key drawn as a tree down the
 * page, each question in a box and its two answers under it, indented one step ("Yes" first,
 * then "No"), each leading to the next question or to a name at the end. A scene's `specimen`
 * traces one name's path from the first question, the answers taken lit and the name filled;
 * `step` rings one question. Flat, like every tree.
 */
import { G, Line, Rect } from 'react-native-svg';

import { keyPath, keyRows, type KeyScene, type KeyStep } from '@/data/modules/typesHs2e';
import { chart, usePalette } from '@/theme';

import { ChartText } from '../reps/common';
import { BOARD_W, Board, textW } from './earthKit';

const LINE = 15;
/** Each answer's word starts 18 px in from its question's box; its box 28 px after that. */
const INDENT = 46;
const ANSWER = 28;
const FONT = chart.label;

/** Splits text into lines of at most `per` characters, at spaces. */
function wrap(text: string, per: number) {
  const lines: string[] = [];
  for (const word of text.split(' ')) {
    const last = lines[lines.length - 1];
    if (last !== undefined && `${last} ${word}`.length <= per)
      lines[lines.length - 1] = `${last} ${word}`;
    else lines.push(word);
  }
  return lines;
}

export function DichotomousKeyFigure({ steps, scene }: { steps: KeyStep[]; scene: KeyScene }) {
  const c = usePalette();
  const path = scene.specimen ? (keyPath(steps, scene.specimen) ?? []) : [];
  const onPath = (q: number) => path.some(([k]) => k === q);
  const taken = (q: number, a: 'Yes' | 'No') =>
    path.some(([k, ans]) => k === q && ans === a.toLowerCase());
  const rows = keyRows(steps).map((r) => {
    const x = 8 + r.depth * INDENT;
    const text = typeof r.node === 'number' ? (steps[r.node]?.question ?? '') : r.node;
    const per = Math.max(10, Math.floor((BOARD_W - x - 20) / (FONT * 0.6)));
    const lines = wrap(text, per);
    return { ...r, x, lines, h: 10 + lines.length * LINE };
  });
  // Each row starts below the ones before it.
  const tops = rows.map((_, i) => rows.slice(0, i).reduce((s, r) => s + r.h + 8, 8));
  const placed = rows.map((r, i) => ({ ...r, top: tops[i]! }));
  const H = rows.reduce((s, r) => s + r.h + 8, 8) + 4;
  const boxOf = (r: (typeof placed)[number]) => ({
    x: r.x,
    y: r.top,
    w: Math.max(...r.lines.map((l) => textW(l, FONT, true))) + 16,
    h: r.h,
  });
  return (
    <Board height={H}>
      {/* Connectors: down from the question's box, across to each answer. */}
      {placed.map((r, i) => {
        if (r.parent === undefined) return null;
        const p = placed.find((q) => q.node === r.parent)!;
        const px = boxOf(p).x + 10;
        const cy = r.top + r.h / 2;
        const lit = taken(r.parent, r.answer!);
        const stroke = lit ? c.chartHighlight : c.chartMuted;
        const sw = lit ? chart.strokeHeavy : chart.strokeLight;
        return (
          <G key={`e${i}`}>
            <Line x1={px} y1={p.top + p.h} x2={px} y2={cy} stroke={stroke} strokeWidth={sw} />
            <Line x1={px} y1={cy} x2={r.x - ANSWER - 2} y2={cy} stroke={stroke} strokeWidth={sw} />
          </G>
        );
      })}
      {placed.map((r, i) => {
        const b = boxOf(r);
        const question = typeof r.node === 'number';
        const lit = question ? onPath(r.node as number) : r.node === scene.specimen;
        const ringed = question && scene.step === r.node;
        return (
          <G key={`n${i}`}>
            {r.answer ? (
              <ChartText
                x={r.x - ANSWER}
                y={r.top + r.h / 2 + 4}
                fontSize={FONT}
                fontWeight="700"
                fill={
                  r.parent !== undefined && taken(r.parent, r.answer)
                    ? c.chartHighlight
                    : c.chartMuted
                }
              >
                {r.answer}
              </ChartText>
            ) : null}
            <Rect
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              rx={question ? 5 : b.h / 2}
              fill={!question && lit ? c.chartHighlight : question ? c.card : c.chartFill}
              stroke={ringed || lit ? c.chartHighlight : c.chartMuted}
              strokeWidth={ringed ? chart.strokeHeavy : lit ? chart.stroke : 1}
            />
            {r.lines.map((line, k) => (
              <ChartText
                key={k}
                x={b.x + 8}
                y={b.y + 5 + (k + 1) * LINE - 3}
                fontSize={FONT}
                fontWeight={question ? '600' : '700'}
                fill={!question && lit ? c.onChartHighlight : c.chartInk}
              >
                {line}
              </ChartText>
            ))}
          </G>
        );
      })}
    </Board>
  );
}
