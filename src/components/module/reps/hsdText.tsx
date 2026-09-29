/**
 * Labels in high-school notation for the group D pictures: a lone letter (x, θ, r, the i of
 * 3 + 2i) in italics, words (cos, sin, Re, Im) upright, on an optional card-colored chip so the
 * label reads over grid lines. Flat.
 */
import { Fragment } from 'react';
import { G, Rect, TSpan } from 'react-native-svg';

import { chart, usePalette } from '@/theme';

import { ChartText } from './common';

/** A letter standing alone (not part of a word like "cos"); π stays upright. */
const LETTER = /(?<![A-Za-zα-ω])([A-Za-zα-ορ-ω])(?![A-Za-zα-ω])/g;

/** Splits text into runs, the lone letters marked for italics. */
export function mathRuns(text: string): { text: string; italic: boolean }[] {
  const out: { text: string; italic: boolean }[] = [];
  let at = 0;
  for (const m of text.matchAll(LETTER)) {
    if (m.index! > at) out.push({ text: text.slice(at, m.index), italic: false });
    out.push({ text: m[0], italic: true });
    at = m.index! + m[0].length;
  }
  if (at < text.length) out.push({ text: text.slice(at), italic: false });
  return out;
}

/** Estimated width of a label (as `fitLabel` estimates it). */
export const textWidth = (text: string, size: number) => text.length * size * 0.58;

/** Text with its lone letters in italics. Takes ChartText's props. */
export function MathText({
  text,
  ...props
}: { text: string } & Omit<Parameters<typeof ChartText>[0], 'children'>) {
  return (
    <ChartText {...props}>
      {mathRuns(text).map((r, i) => (
        <Fragment key={i}>
          {r.italic ? (
            <TSpan fontStyle="italic" fontFamily="Georgia, 'Times New Roman', serif">
              {r.text}
            </TSpan>
          ) : (
            <TSpan fontStyle="normal">{r.text}</TSpan>
          )}
        </Fragment>
      ))}
    </ChartText>
  );
}

/**
 * A label on a chip of the card color, kept inside a w × h canvas. `x` is the anchor point
 * (start, middle or end of the text) and `y` its baseline.
 */
export function MathChip({
  x,
  y,
  text,
  w,
  h,
  anchor = 'middle',
  color,
  size = chart.label,
  bold = true,
  opacity = 1,
}: {
  x: number;
  y: number;
  text: string;
  w: number;
  h: number;
  anchor?: 'start' | 'middle' | 'end';
  color?: string;
  size?: number;
  bold?: boolean;
  opacity?: number;
}) {
  const c = usePalette();
  const tw = textWidth(text, size) + 6;
  let left = anchor === 'start' ? x - 3 : anchor === 'end' ? x - tw + 3 : x - tw / 2;
  left = Math.min(w - tw - 1, Math.max(1, left));
  const top = Math.min(h - size - 5, Math.max(1, y - size + 1));
  return (
    <G opacity={opacity}>
      <Rect x={left} y={top} width={tw} height={size + 5} rx={3} fill={c.card} opacity={0.9} />
      <MathText
        text={text}
        x={left + tw / 2}
        y={top + size}
        textAnchor="middle"
        fontSize={size}
        fontWeight={bold ? '700' : '400'}
        fill={color ?? c.chartInk}
      />
    </G>
  );
}

/** The box a chip takes, for keeping labels apart. */
export function chipBox(
  x: number,
  y: number,
  text: string,
  anchor: 'start' | 'middle' | 'end' = 'middle',
  size: number = chart.label,
) {
  const tw = textWidth(text, size) + 6;
  const left = anchor === 'start' ? x - 3 : anchor === 'end' ? x - tw + 3 : x - tw / 2;
  return { left, right: left + tw, top: y - size + 1, bottom: y + 5 };
}
