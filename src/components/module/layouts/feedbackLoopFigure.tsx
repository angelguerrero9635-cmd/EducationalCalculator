import { Circle, G, Path, Rect } from 'react-native-svg';

import type { LoopScene } from '@/data/modules/typesHsh';
import { chart, usePalette } from '@/theme';

import { ChartText } from '../reps/common';
import { Board, BOARD_W, HaloText, textW } from './earthKit';

const TEXT = chart.value;
const ROLE = chart.label;
const BOX_X = 14;
const BOX_W = 286;
const GAP = 22;
const LINE = 17;

/** Words wrapped to lines that fit `width` px at `size`. */
export function wrapWords(text: string, width: number, size: number): string[] {
  const lines: string[] = [];
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const last = lines[lines.length - 1];
    if (last !== undefined && textW(`${last} ${word}`, size) <= width) {
      lines[lines.length - 1] = `${last} ${word}`;
    } else lines.push(word);
  }
  return lines;
}

/**
 * A feedback loop, flat: the steps as boxes top to bottom with arrows down (stimulus, sensor,
 * control center, effector, response, as the scene names them), then the arrow from the response
 * back up to the start, marked − for negative feedback (the response works against the change,
 * holding a set point) or + for positive feedback (the response adds to the change). The scene's
 * step lit fills in the highlight. The words are all the scene's.
 */
export function FeedbackLoopFigure({ loop }: { loop: LoopScene }) {
  const c = usePalette();
  const inner = BOX_W - 24;
  const boxes = loop.steps.map((s) => {
    const lines = wrapWords(s.text, inner, TEXT);
    const h = 14 + (s.role ? LINE : 0) + lines.length * LINE;
    return { ...s, lines, h };
  });
  const ys: number[] = [];
  let y = 10;
  for (const b of boxes) {
    ys.push(y);
    y += b.h + GAP;
  }
  const bottom = y - GAP;
  const height = bottom + 12;
  const negative = loop.sign === 'negative';
  const loopX = BOX_X + BOX_W + 30;
  const firstMid = boxes.length ? ys[0]! + boxes[0]!.h / 2 : 0;
  const lastMid = boxes.length ? ys[boxes.length - 1]! + boxes[boxes.length - 1]!.h / 2 : 0;
  const midY = (firstMid + lastMid) / 2;
  const back = loop.back ? wrapWords(loop.back, 60, ROLE) : [];
  const ink = negative ? c.chartHighlight : c.hopBack;

  return (
    <Board height={Math.max(height, 120)}>
      {boxes.map((b, i) => {
        const on = loop.lit === i;
        const top = ys[i]!;
        return (
          <G key={i}>
            <Rect
              x={BOX_X}
              y={top}
              width={BOX_W}
              height={b.h}
              rx={10}
              fill={on ? c.chartHighlight : c.card}
              stroke={on ? c.chartHighlight : c.chartGrid}
              strokeWidth={chart.strokeLight}
            />
            {b.role ? (
              <ChartText
                x={BOX_X + 12}
                y={top + 7 + ROLE}
                fontSize={ROLE}
                fontWeight="700"
                fill={on ? c.onChartHighlight : c.chartMuted}
              >
                {b.role.toUpperCase()}
              </ChartText>
            ) : null}
            {b.lines.map((line, k) => (
              <ChartText
                key={k}
                x={BOX_X + 12}
                y={top + 7 + (b.role ? LINE : 0) + (k + 1) * LINE - 3}
                fontSize={TEXT}
                fontWeight={on ? '700' : '500'}
                fill={on ? c.onChartHighlight : c.chartInk}
              >
                {line}
              </ChartText>
            ))}
            {i < boxes.length - 1 ? (
              <G>
                <Path
                  d={`M ${BOX_X + BOX_W / 2} ${top + b.h + 3} V ${top + b.h + GAP - 3}`}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                />
                <Path
                  d={`M ${BOX_X + BOX_W / 2 - 5} ${top + b.h + GAP - 9} L ${BOX_X + BOX_W / 2} ${top + b.h + GAP - 3} L ${BOX_X + BOX_W / 2 + 5} ${top + b.h + GAP - 9}`}
                  stroke={c.chartInk}
                  strokeWidth={chart.stroke}
                  fill="none"
                  strokeLinejoin="round"
                />
              </G>
            ) : null}
          </G>
        );
      })}
      {boxes.length > 1 ? (
        <G>
          {/* The way back: from the response round to the start. */}
          <Path
            d={`M ${BOX_X + BOX_W + 2} ${lastMid} H ${loopX - 10} Q ${loopX} ${lastMid} ${loopX} ${lastMid - 10} V ${firstMid + 10} Q ${loopX} ${firstMid} ${loopX - 10} ${firstMid} H ${BOX_X + BOX_W + 4}`}
            stroke={ink}
            strokeWidth={chart.strokeHeavy}
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d={`M ${BOX_X + BOX_W + 12} ${firstMid - 6} L ${BOX_X + BOX_W + 4} ${firstMid} L ${BOX_X + BOX_W + 12} ${firstMid + 6}`}
            stroke={ink}
            strokeWidth={chart.strokeHeavy}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Circle cx={loopX} cy={midY} r={14} fill={ink} />
          <ChartText
            x={loopX}
            y={midY + 7}
            fontSize={22}
            fontWeight="700"
            textAnchor="middle"
            fill={c.onChartHighlight}
          >
            {negative ? '−' : '+'}
          </ChartText>
          {back.map((line, k) => (
            <HaloText
              key={k}
              x={Math.min(loopX, BOARD_W - 34)}
              y={midY + 32 + k * 16}
              text={line}
              c={c}
              size={ROLE}
              bold
              fill={ink}
            />
          ))}
        </G>
      ) : null}
    </Board>
  );
}
