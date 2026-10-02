/**
 * Shared pieces of group HE2F's college pictures (FreeBodyHe, FreeBodyAircraft, CircularOrbits):
 * a label in college notation (the symbol's single letters italic, `_w` subscripts, the value
 * and unit upright) on a chip, its width, and numbers to 3 or 4 figures with × 10ⁿ.
 */
import { G, Rect, TSpan } from 'react-native-svg';

import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import { ChartText, type useRep } from './common';

/** A number to `digits` (default 4) significant figures, × 10ⁿ when very big or small. */
export const fmt = (x: number, digits = 4) =>
  !Number.isFinite(x)
    ? '?'
    : formatNumber(Number(x.toPrecision(digits)) || 0, {
        scientific: Math.abs(x) >= 1e6 || (x !== 0 && Math.abs(x) < 1e-3),
      });

/** The symbol part and the rest: "N_w = 57.7 N" → ["N_w", " = 57.7 N"]. */
const split = (text: string): [string, string] => {
  const i = text.indexOf(' = ');
  return i < 0 ? [text, ''] : [text.slice(0, i), text.slice(i)];
};

/** Characters drawn, subscripts counted smaller. */
function units(text: string) {
  const [sym, rest] = split(text);
  let n = 0;
  for (const part of sym.split(/(_[A-Za-z0-9]+)/)) {
    n += part.startsWith('_') ? (part.length - 1) * 0.75 : [...part].length;
  }
  return n + [...rest].length;
}

/** A label's width in px at `size`. */
export const tagW = (text: string, size: number = chart.label) => units(text) * size * 0.58;

/**
 * A label: "T₁ = 16.3 N", "N_w = 57.7 N", "N cos θ". Single letters of the symbol (before " = ")
 * italic, words (cos, sin) and the value upright; "_w" a lowered subscript. On a card-colored
 * chip unless `chip` is false; slid inside a canvas `w` wide.
 */
export function Tag({
  x,
  y,
  text,
  color,
  anchor = 'middle',
  size = chart.label,
  chip = true,
  bold = true,
  w,
}: {
  x: number;
  y: number;
  text: string;
  color?: string;
  anchor?: 'start' | 'middle' | 'end';
  size?: number;
  chip?: boolean;
  bold?: boolean;
  w?: number;
}) {
  const c = usePalette();
  const width = tagW(text, size);
  let left = anchor === 'start' ? x : anchor === 'end' ? x - width : x - width / 2;
  if (w !== undefined) left = Math.min(w - width - 4, Math.max(4, left));
  const [sym, rest] = split(text);
  const parts = sym.split(/(_[A-Za-z0-9]+|[A-Za-zα-ωΑ-Ω]+)/).filter((p) => p !== '');
  const drop = size * 0.3;
  const isSub = (i: number) => !!parts[i]?.startsWith('_');
  return (
    <G>
      {chip ? (
        <Rect
          x={left - 3}
          y={y - size + 1}
          width={width + 6}
          height={size + 6}
          rx={3}
          fill={c.card}
          opacity={0.9}
        />
      ) : null}
      <ChartText
        x={left}
        y={y}
        fontSize={size}
        fontWeight={bold ? '700' : '400'}
        fill={color ?? c.chartInk}
      >
        {parts.map((p, i) => {
          const sub = isSub(i);
          const after = isSub(i - 1);
          const body = sub ? p.slice(1) : p;
          return (
            <TSpan
              key={i}
              dy={sub && !after ? drop : !sub && after ? -drop : 0}
              fontSize={sub ? size * 0.75 : size}
              fontStyle={!sub && /^[A-Za-zα-ωΑ-Ω]$/.test(body) ? 'italic' : 'normal'}
            >
              {body}
            </TSpan>
          );
        })}
        {rest ? <TSpan dy={isSub(parts.length - 1) ? -drop : 0}>{rest}</TSpan> : null}
      </ChartText>
    </G>
  );
}

/**
 * Where a force arrow's label goes: past its tip when there is room, else beside the shaft near
 * the tip (toward the arrow's start), so it never sits on the shaft or runs off the canvas.
 */
export function tipLabel(
  from: { x: number; y: number },
  to: { x: number; y: number },
  text: string,
  w: number,
): { x: number; y: number; anchor: 'start' | 'middle' | 'end' } {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const width = tagW(text);
  if (Math.abs(dy) >= Math.abs(dx)) {
    // Mostly vertical: above or below the tip.
    return { x: to.x, y: dy < 0 ? to.y - 7 : to.y + 16, anchor: 'middle' };
  }
  const room = dx < 0 ? to.x - 6 : w - to.x - 6;
  if (room >= width)
    return { x: to.x + (dx < 0 ? -6 : 6), y: to.y + 4, anchor: dx < 0 ? 'end' : 'start' };
  // Above the shaft, starting at the tip and running back along it.
  return {
    x: to.x - (dx / len) * 2,
    y: to.y - 9,
    anchor: dx < 0 ? 'start' : 'end',
  };
}

/**
 * A value's text with its unit: as typed, a worked-out value to 4 figures (the page's box may
 * show more decimals), or the picture's own figure when the page has no box for it.
 */
export function valueText(
  rep: ReturnType<typeof useRep>,
  x: number | string | undefined,
  computed: number,
  unit: string,
) {
  const join = (n: string, u: string | undefined) =>
    !u ? n : ['°', '%'].includes(u) ? `${n}${u}` : `${n} ${u}`;
  if (typeof x === 'string' && rep.known(x)) {
    if (rep.typed(x)) return rep.value(x);
    return join(fmt(rep.shown(x)), rep.unit(x));
  }
  return join(fmt(computed), unit);
}
