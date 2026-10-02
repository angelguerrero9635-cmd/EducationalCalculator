/**
 * Labels for the college round 2 group A pictures (HC14 complex plane, HC22 Bode): a name in
 * college notation (italic letter, subscript after "_": V_an, ω_c) then upright text (" = 120 V"),
 * on a card-coloured chip; a label placer that tries spots in turn and keeps labels apart and
 * inside the canvas; numbers to four figures.
 */
import { G, Rect, Text as SvgText, TSpan } from 'react-native-svg';
import { Platform } from 'react-native';

import { formatNumber } from '@/engine/format';
import { chart, font, usePalette } from '@/theme';

/** Four significant figures, a − for negatives, never "−0". */
export const nf = (x: number) => {
  const r = Number(x.toPrecision(4));
  return formatNumber(Object.is(r, -0) || Math.abs(r) < 1e-12 ? 0 : r);
};

/** Three significant figures (worked-out readings: −16.1 dB, −81.0°). */
export const nf3 = (x: number) => {
  const r = Number(x.toPrecision(3));
  if (Math.abs(r) < 1e-12) return '0';
  const s = formatNumber(r);
  // Keep the third figure when it is a 0 (−81.0°, 1.50).
  const digits = s.replace(/[^\d]/g, '').replace(/^0+/, '').length;
  if (digits >= 3 || Math.abs(r) >= 100) return s;
  return s.includes('.') ? `${s}${'0'.repeat(3 - digits)}` : `${s}.${'0'.repeat(3 - digits)}`;
};

/** "30 + j40", "10 − j20", "j6", "8" (the imaginary unit written j or i). */
export function rectText(a: number, b: number, unit = 'j'): string {
  const [re, im] = [Number(a.toPrecision(4)), Number(b.toPrecision(4))];
  const imPart = (x: number) => `${unit}${nf(Math.abs(x))}`;
  if (Math.abs(im) < 1e-12) return nf(re);
  if (Math.abs(re) < 1e-12) return `${im < 0 ? '−' : ''}${imPart(im)}`;
  return `${nf(re)} ${im < 0 ? '−' : '+'} ${imPart(im)}`;
}

/** "50∠53.13°" (the angle to two decimals). */
export const polarText = (r: number, deg: number) =>
  `${nf(r)}∠${formatNumber(Number(deg.toFixed(2)) || 0)}°`;

/** A name split for typesetting: an upright prefix (−), the base, its subscript. */
function splitName(name: string) {
  const m = /^([−-]?)([^_]*)(?:_(.+))?$/.exec(name);
  return { pre: m?.[1] ?? '', base: m?.[2] ?? name, sub: m?.[3] ?? '' };
}

/** A label's width in px: name (subscript smaller) and text. */
export function tagWidth(name: string, text: string, size: number = chart.label) {
  const { pre, base, sub } = splitName(name);
  return (
    ([...pre, ...base].length + [...text].length) * size * 0.58 + [...sub].length * size * 0.45
  );
}

export type Box = { l: number; t: number; r: number; b: number };
export type Anchor = 'start' | 'middle' | 'end';

export const boxAt = (x: number, y: number, w: number, anchor: Anchor, size = chart.label): Box => {
  const left = anchor === 'start' ? x : anchor === 'end' ? x - w : x - w / 2;
  return { l: left - 3, t: y - size - 1, r: left + w + 3, b: y + 5 };
};

export const hits = (a: Box, b: Box) => !(a.r < b.l || a.l > b.r || a.b < b.t || a.t > b.b);

/**
 * The first spot (x, y baseline, anchor) whose box is inside the canvas and clear of every box
 * in `taken`; else the first spot inside. The box chosen is added to `taken`.
 */
export function place(
  spots: { x: number; y: number; anchor: Anchor }[],
  width: number,
  taken: Box[],
  w: number,
  h: number,
  size: number = chart.label,
) {
  const inside = (b: Box) => b.l >= 1 && b.r <= w - 1 && b.t >= 1 && b.b <= h - 1;
  const boxes = spots.map((s) => ({ ...s, box: boxAt(s.x, s.y, width, s.anchor, size) }));
  const pick =
    boxes.find((s) => inside(s.box) && taken.every((t) => !hits(s.box, t))) ??
    boxes.find((s) => inside(s.box)) ??
    boxes[0]!;
  // Slid inside the canvas when no spot fits.
  const dx = pick.box.l < 1 ? 1 - pick.box.l : pick.box.r > w - 1 ? w - 1 - pick.box.r : 0;
  const dy = pick.box.t < 1 ? 1 - pick.box.t : pick.box.b > h - 1 ? h - 1 - pick.box.b : 0;
  const box = { l: pick.box.l + dx, r: pick.box.r + dx, t: pick.box.t + dy, b: pick.box.b + dy };
  taken.push(box);
  return { x: pick.x + dx, y: pick.y + dy, anchor: pick.anchor, box };
}

/** Spots around a point (dx, dy away), for `place`: the preferred side first. */
export function spotsAround(x: number, y: number, ux: number, uy: number, gap = 12) {
  const at = (dx: number, dy: number): { x: number; y: number; anchor: Anchor } => ({
    x: x + dx * gap,
    y: y + dy * gap + 4 + (dy > 0.5 ? 6 : 0),
    anchor: dx > 0.3 ? 'start' : dx < -0.3 ? 'end' : 'middle',
  });
  const len = Math.hypot(ux, uy) || 1;
  const [a, b] = [ux / len, uy / len];
  return [
    at(a, b),
    at(a * 0.7 - b * 0.7, b * 0.7 + a * 0.7),
    at(a * 0.7 + b * 0.7, b * 0.7 - a * 0.7),
    at(1, 0),
    at(-1, 0),
    at(0, -1),
    at(0, 1),
    at(1, -1),
    at(-1, -1),
    at(1, 1),
    at(-1, 1),
  ];
}

const family = font.family ?? (Platform.OS === 'web' ? font.webSystem : undefined);

/** The name typeset (italic single letter, subscript) then upright text. */
export function NameRuns({ name, text, size }: { name: string; text: string; size: number }) {
  const { pre, base, sub } = splitName(name);
  const one = /^[A-Za-zα-ωΑ-Ω]$/.test(base);
  const drop = size * 0.3;
  return (
    <>
      {pre ? <TSpan fontStyle="normal">{pre}</TSpan> : null}
      {base ? <TSpan fontStyle={one ? 'italic' : 'normal'}>{base}</TSpan> : null}
      {sub ? (
        <TSpan dy={drop} fontSize={size * 0.75} fontStyle="normal">
          {sub}
        </TSpan>
      ) : null}
      {text ? (
        <TSpan dy={sub ? -drop : 0} fontStyle="normal" fontSize={size}>
          {text}
        </TSpan>
      ) : null}
    </>
  );
}

/** A label on a chip: `x`, `y` and `anchor` as `place` returns them. */
export function Tag({
  x,
  y,
  anchor,
  name = '',
  text = '',
  color,
  size = chart.label,
  bold = true,
  chip = true,
}: {
  x: number;
  y: number;
  anchor: Anchor;
  name?: string;
  text?: string;
  color?: string;
  size?: number;
  bold?: boolean;
  chip?: boolean;
}) {
  const c = usePalette();
  const width = tagWidth(name, text, size);
  const b = boxAt(x, y, width, anchor, size);
  return (
    <G>
      {chip ? (
        <Rect
          x={b.l}
          y={b.t}
          width={b.r - b.l}
          height={b.b - b.t}
          rx={3}
          fill={c.card}
          opacity={0.9}
        />
      ) : null}
      <SvgText
        x={x}
        y={y}
        textAnchor={anchor}
        fontSize={size}
        fontWeight={bold ? '700' : '400'}
        fontFamily={family}
        fill={color ?? c.chartInk}
      >
        <NameRuns name={name} text={text} size={size} />
      </SvgText>
    </G>
  );
}
