/**
 * y = f(x) for every high-school function family (request H01): the curve on a window chosen
 * from the values with nice ticks (π/6 multiples on a trig axis), asymptotes dashed, holes as
 * open circles, piece ends open or closed, and the marks a page asks for (zeros, intercept,
 * vertex with its axis, extrema, domain and range brackets, midline, amplitude, period). A
 * traced point, a second curve (the parent, the inverse with y = x, or g(x) with the crossing),
 * a shaded region and the calculus previews (a limit from both sides, a secant turning into
 * the tangent). Drags move the vertex, points on the curve and a stretch handle. Flat and exact.
 */
import { useRef, type ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { ClipPath, Circle, Defs, G, Line, Path, Rect, TSpan } from 'react-native-svg';

import {
  familyVars,
  type FunctionFamily,
  type FunctionGraphSpec,
  type NumOrVar,
} from '@/data/modules/typesFunctionGraph';
import { formatNumber } from '@/engine/format';
import { chart, usePalette } from '@/theme';

import type { Calculator } from '../useCalculator';
import { Canvas, Caption, ChartText, DragHandle, useFrozen, useRep } from './common';
import {
  buildCurve,
  chooseWindow,
  crossings,
  exactText,
  extremaIn,
  fieldAt,
  numText,
  plain,
  spans,
  tickText,
  ticks,
  zerosIn,
  type Curve,
  type HandleDef,
  type Interval,
  type Tok,
  type Window,
} from './functionGraphMath';
import { SignBand, SignFill, signCaption } from './FunctionSign';
import { reshape, reshapeCaption, reshapeVars } from './functionGraphHs2g';
import { transformCurve, transformText } from './functionGraphHs3b';
import { RiemannRects, riemannCaption } from './functionGraphRiemann';
import { he1eLayer, type He1eLayerProps } from './FunctionGraphMarksHe1e';
import { he2gLayer } from './FunctionGraphMarksHe2g';
import { he2gCaption, he2gWindow, he2gXs, he2gYs } from './functionGraphHe2g';
import { he1eCaption, he1ePanel, he1eXs, he1eYs, repeatCurve } from './functionGraphHe1e';
import { riemannOf, riemannXs } from './riemann';
import { toShownUnits, unitPositionIds } from './functionGraphUnits';
import { usePaintIds, url } from './paint';
import { signOf } from './signBox';

const MINUS = '−';
/** Legend text size and its raised or lowered parts. */
const LEG = 15;
const SUP = 12;
const charW = (size: number) => size * 0.56;
/** A text's width from its letters' widths in the system font. */
const NARROW = new Set([...` ,.;:!|()[]{}'ijlrtf1`]);
const WIDE = new Set([...'mwMW−=+×÷→≤≥∞']);
const widthOf = (text: string, size: number) =>
  [...text].reduce(
    (s, ch) =>
      s +
      size *
        (NARROW.has(ch)
          ? 0.3
          : WIDE.has(ch)
            ? 0.7
            : /[0-9]/.test(ch)
              ? 0.56
              : /[A-Z]/.test(ch)
                ? 0.66
                : 0.53),
    0,
  );

// ─── Text with italic letters ─────────────────────────────────────────────────

/** Single letters in italic (x, f, a), words upright (sin, ln, max). */
function Runs({ text, size }: { text: string; size: number }) {
  const parts = text.split(/([A-Za-z]+)/).filter((p) => p !== '');
  return (
    <>
      {parts.map((p, i) => (
        <TSpan key={i} fontStyle={/^[A-Za-z]$/.test(p) ? 'italic' : 'normal'} fontSize={size}>
          {p}
        </TSpan>
      ))}
    </>
  );
}

const width = widthOf;

/** A case's rule with its comma joined on (one text, so nothing sits between them). */
const withComma = (toks: Tok[]): Tok[] => {
  const last = toks[toks.length - 1];
  return last && 't' in last && !last.sup && !last.sub
    ? [...toks.slice(0, -1), { t: `${last.t},` }]
    : [...toks, { t: ',' }];
};

/** Lays out formula pieces from (x, y) (baseline); returns the drawing and its width. */
function layout(
  toks: Tok[],
  x: number,
  y: number,
  size: number,
  color: string,
  key = 'k',
): { node: ReactNode; w: number; up: number; down: number } {
  const nodes: ReactNode[] = [];
  let cx = x;
  let up = size;
  let down = 4;
  toks.forEach((t, i) => {
    const k = `${key}-${i}`;
    if ('frac' in t) {
      const s = size - 1;
      const top = layout(t.frac[0], 0, 0, s, color, `${k}n`);
      const bot = layout(t.frac[1], 0, 0, s, color, `${k}d`);
      const fw = Math.max(top.w, bot.w) + 6;
      const tx = cx + (fw - top.w) / 2;
      const bx = cx + (fw - bot.w) / 2;
      nodes.push(
        <G key={k}>
          <G transform={`translate(${tx}, ${y - 9})`}>{top.node}</G>
          <Line x1={cx} x2={cx + fw} y1={y - 5} y2={y - 5} stroke={color} strokeWidth={1.2} />
          <G transform={`translate(${bx}, ${y + s + 2})`}>{bot.node}</G>
        </G>,
      );
      up = Math.max(up, 9 + top.up);
      down = Math.max(down, s + 2 + bot.down);
      cx += fw + 2;
    } else if ('root' in t) {
      const body = layout(t.body, 0, 0, size, color, `${k}b`);
      const gw = charW(size) * (t.root === 3 ? 1.5 : 1);
      nodes.push(
        <G key={k}>
          <ChartText x={cx} y={y} fontSize={size} fill={color}>
            {t.root === 3 ? '∛' : '√'}
          </ChartText>
          <Line
            x1={cx + gw + 1}
            x2={cx + gw + body.w + 3}
            y1={y - size + 1}
            y2={y - size + 1}
            stroke={color}
            strokeWidth={1.2}
          />
          <G transform={`translate(${cx + gw + 2}, ${y})`}>{body.node}</G>
        </G>,
      );
      cx += gw + body.w + 5;
    } else if ('cases' in t) {
      const rowH = size + 8;
      const rows = t.cases.length;
      const top = y - ((rows - 1) * rowH) / 2 - size * 0.35;
      const laid = t.cases.map((c, j) => ({
        f: layout(withComma(c.f), 0, 0, size, color, `${k}f${j}`),
        when: layout([{ t: plain(c.when) }], 0, 0, size - 1, color, `${k}w${j}`),
      }));
      const fw = Math.max(...laid.map((l) => l.f.w));
      const bx = cx + 2;
      const h0 = top - size * 0.75;
      const h1 = top + (rows - 1) * rowH + 6;
      const mid = (h0 + h1) / 2;
      nodes.push(
        <G key={k}>
          <Path
            d={`M ${bx + 7} ${h0} Q ${bx + 3} ${h0} ${bx + 3} ${h0 + 6} L ${bx + 3} ${mid - 5} Q ${bx + 3} ${mid} ${bx} ${mid} Q ${bx + 3} ${mid} ${bx + 3} ${mid + 5} L ${bx + 3} ${h1 - 6} Q ${bx + 3} ${h1} ${bx + 7} ${h1}`}
            stroke={color}
            strokeWidth={1.4}
            fill="none"
          />
          {laid.map((l, j) => (
            <G key={j}>
              <G transform={`translate(${bx + 11}, ${top + j * rowH})`}>{l.f.node}</G>
              <G transform={`translate(${bx + 19 + fw}, ${top + j * rowH})`}>{l.when.node}</G>
            </G>
          ))}
        </G>,
      );
      up = Math.max(up, y - h0);
      down = Math.max(down, h1 - y);
      cx += 19 + fw + Math.max(...laid.map((l) => l.when.w));
    } else if (t.sup || t.sub) {
      // A superscript after ")" starts a little right, so the italic letter clears the bracket.
      const prev = toks[i - 1];
      if (t.sup && prev && 't' in prev && !prev.sup && prev.t.endsWith(')')) cx += size * 0.18 + 2;
      nodes.push(
        <ChartText
          key={k}
          x={cx}
          y={y + (t.sup ? -size * 0.45 : size * 0.3)}
          fontSize={SUP}
          fill={color}
        >
          <Runs text={t.t} size={SUP} />
        </ChartText>,
      );
      if (t.sup) up = Math.max(up, size * 0.45 + SUP);
      cx += width(t.t, SUP) + 1;
    } else if (t.t) {
      nodes.push(
        <ChartText key={k} x={cx} y={y} fontSize={size} fill={color}>
          <Runs text={t.t} size={size} />
        </ChartText>,
      );
      cx += width(t.t, size);
    }
  });
  return { node: <G>{nodes}</G>, w: cx - x, up, down };
}

// ─── Labels that keep off each other ──────────────────────────────────────────

interface Box {
  l: number;
  t: number;
  r: number;
  b: number;
}
const overlaps = (a: Box, b: Box) => a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b;

/** Places each label beside its point where it covers the fewest things already there. */
function makePlacer(bounds: Box, obstacles: Box[], points: [number, number][]) {
  const placed: Box[] = [...obstacles];
  return (px: number, py: number, text: string, size = chart.label) => {
    const w = width(text, size) + 6;
    const h = size + 5;
    const tries: [number, number][] = [
      [8, -8 - h],
      [-8 - w, -8 - h],
      [8, 8],
      [-8 - w, 8],
      [-w / 2, -12 - h],
      [-w / 2, 12],
      [12, -h / 2],
      [-12 - w, -h / 2],
    ];
    let best: { box: Box; score: number } | undefined;
    for (const [dx, dy] of tries) {
      const box = { l: px + dx, t: py + dy, r: px + dx + w, b: py + dy + h };
      let score = 0;
      if (box.l < bounds.l || box.r > bounds.r || box.t < bounds.t || box.b > bounds.b)
        score += 100;
      for (const o of placed) if (overlaps(o, box)) score += 10;
      for (const [x, y] of points) if (x > box.l && x < box.r && y > box.t && y < box.b) score += 1;
      if (!best || score < best.score) best = { box, score };
      if (score === 0) break;
    }
    placed.push(best!.box);
    return best!.box;
  };
}

function Chip({
  box,
  text,
  color,
  size = chart.label,
}: {
  box: Box;
  text: string;
  color: string;
  size?: number;
}) {
  const c = usePalette();
  return (
    <G>
      <Rect
        x={box.l}
        y={box.t}
        width={box.r - box.l}
        height={box.b - box.t}
        rx={3}
        fill={c.card}
        opacity={0.9}
      />
      <ChartText x={box.l + 3} y={box.b - 4} fontSize={size} fontWeight="700" fill={color}>
        <Runs text={text} size={size} />
      </ChartText>
    </G>
  );
}

// ─── Words for the caption ─────────────────────────────────────────────────────

/**
 * An exact value, with its decimal after ≈ when it isn't a short decimal; `fmt` writes the
 * decimal (a science page's measurements read to 3 figures: t ≈ 4.39, not 4.3944).
 */
const withApprox = (x: number, text?: string, fmt: (x: number) => string = formatNumber) => {
  const t = text ?? exactText(x);
  const short = Math.abs(x * 1e4 - Math.round(x * 1e4)) < 1e-7;
  if (t && (short || t === formatNumber(x))) return t;
  return t ? `${t} ≈ ${fmt(x)}` : `≈ ${fmt(x)}`;
};

const endText = (v: number, pi: boolean) =>
  v === Infinity ? '∞' : v === -Infinity ? `${MINUS}∞` : numText(v, pi);
const intervalText = (list: Interval[], pi = false) =>
  list.every((i) => i.lo === -Infinity && i.hi === Infinity)
    ? 'all real numbers'
    : list
        .map((i) =>
          i.lo === i.hi
            ? `{${numText(i.lo, pi)}}`
            : `${i.loIn ? '[' : '('}${endText(i.lo, pi)}, ${endText(i.hi, pi)}${i.hiIn ? ']' : ')'}`,
        )
        .join(' ∪ ');

/** "= 3", "= 2√2 ≈ 2.8284" or "≈ 10.5935": a value after its name. */
const eq = (x: number, text?: string, fmt?: (x: number) => string) => {
  const w = withApprox(x, text, fmt);
  return w.startsWith('≈') ? w : `= ${w}`;
};

/** An exact text short enough to read ((2 ± √6)/2); a longer one gives way to the decimal. */
const shortOr = (t?: string) => (t && t.length <= 16 ? t : undefined);

/** A point in the caption: exact, or "≈ (1.5306, 13.4796)". */
const pairText = (x: number, y: number) => {
  const [a, b] = [exactText(x), exactText(y)];
  return a && b && a.length <= 12 && b.length <= 12
    ? `(${a}, ${b})`
    : `≈ (${formatNumber(x)}, ${formatNumber(y)})`;
};

/** A point as a label, when both coordinates are exact. */
const pointText = (x: number, y: number, piX = false, piY = false, xText?: string) => {
  const xs = xText ?? exactText(x, piX);
  const ys = exactText(y, piY);
  return xs && ys ? `(${xs}, ${ys})` : undefined;
};

// ─── The picture ─────────────────────────────────────────────────────────────

export function FunctionGraph({
  spec: given,
  calc,
}: {
  spec: FunctionGraphSpec;
  calc: Calculator;
}) {
  const c = usePalette();
  const rep = useRep(calc);
  const ids = usePaintIds('clip');
  // H106: with `unitsOf`, the family read in formula units and converted to the shown axes.
  const [ux0, uy0] = [given.unitsOf?.x, given.unitsOf?.y];
  const fx = ux0 ? rep.factor(ux0) : 1;
  const fy = uy0 ? rep.factor(uy0) : 1;
  const conv = given.unitsOf
    ? toShownUnits(
        given,
        (v, d) => (v === undefined ? d : typeof v === 'number' ? v : rep.val(v)),
        fx,
        fy,
        { x: ux0 && rep.unit(ux0), y: uy0 && rep.unit(uy0) },
      )
    : undefined;
  const spec = conv?.spec ?? given;
  const xPos = new Set(conv ? unitPositionIds(given) : []);
  const known = (v: NumOrVar | undefined): boolean =>
    v === undefined ||
    typeof v === 'number' ||
    (conv?.source.has(v) ? known(conv.source.get(v)) : rep.known(v));
  const get = (v: NumOrVar | undefined, fallback: number) =>
    v === undefined
      ? fallback
      : typeof v === 'number'
        ? v
        : conv?.value.has(v)
          ? conv.value.get(v)!
          : xPos.has(v)
            ? rep.val(v) / fx
            : rep.shown(v);
  const say = (v: NumOrVar | undefined, fallback: number, pi = false) =>
    known(v) ? numText(get(v, fallback), pi) : '?';
  const xName = spec.input ?? (spec.at ? rep.variable(spec.at.x).symbol : 'x');
  const fName = spec.name ?? 'f';
  /** The output's letter on a context graph (N, h), else y. */
  const dep = spec.axes && spec.name ? spec.name : 'y';
  // H94: |f(x)|, a horizontal factor and a kept domain reshape the family's curve.
  const shaped = reshape(spec, get, say, xName, (f, l) => buildCurve(f, get, say, l));
  const main = repeatCurve(spec, shaped.curve, get, say, xName, (f, l) =>
    buildCurve(f, get, say, l),
  ); // HC10
  const allKnown = [...familyVars(given), ...reshapeVars(given)].every((id) => rep.known(id));
  // H106: g(x) = a·f(x − h) + k beside f, an arrow from f's point to its image.
  const tf = spec.other ? undefined : spec.transform;
  const [tfA, tfH, tfK] = tf ? [get(tf.a, 1), get(tf.h, 0), get(tf.k, 0)] : [1, 0, 0];
  const moved = tf
    ? transformCurve(spec, main, get, tfA, tfH, tfK, xName, !reshapeVars(given).length)
    : undefined;
  const tfP = tf
    ? (() => {
        const x = tf.from !== undefined ? get(tf.from, 0) : (main.key?.x ?? 0);
        const y = main.f(x);
        return Number.isFinite(y) ? { x, y, X: x + tfH, Y: tfA * y + tfK } : undefined;
      })()
    : undefined;
  const other = spec.other ? buildCurve(spec.other, get, say, xName) : moved?.curve;
  // H106: a candidate outside the domain, crossed out on the x-axis.
  const rejX = spec.reject !== undefined && known(spec.reject) ? get(spec.reject, 0) : undefined;
  const gName = spec.other?.name ?? tf?.name ?? 'g';
  const tfText = tf
    ? transformText(fName, xName, say(tf.a, 1), tfH, say(tf.h, 0), tfK, say(tf.k, 0))
    : undefined;
  const parent =
    spec.parent && main.parent
      ? buildCurve(main.parent, get, (v, d) => numText(get(v, d)), xName)
      : undefined;
  const marks = new Set(spec.marks ?? []);
  const atX = spec.at ? get(spec.at.x, 0) : undefined;
  const sec = spec.secant ? { x: get(spec.secant.x, 1), h: get(spec.secant.h, 1) } : undefined;
  const limX = spec.limit ? get(spec.limit.x, 0) : undefined;
  const shade = spec.shade;
  // H90: f(x) (sign) 0, the sign from a sign box.
  const ineq = spec.inequality
    ? signOf(spec.inequality, (id) => (rep.known(id) ? rep.shown(id) : undefined))
    : undefined;
  const shadeRange =
    typeof shade === 'object'
      ? [get(shade.from, 0), get(shade.to, 1)].sort((a, b) => a - b)
      : undefined;

  // The values of interest, found first in a wide provisional window.
  const probe: [number, number] = [-10, 10];
  const keyXs = [
    ...(main.key ? [main.key.x] : []),
    ...main.holes.map((h) => h.x),
    ...main.ends.map((e) => e.x),
    // Both branches beside a vertical asymptote (tan's are close already).
    ...main.vas(-12, 12).flatMap((v) => (main.piX ? [v] : [v - 2.5, v, v + 2.5])),
    ...(main.inflection ? [main.inflection.x, 2 * main.inflection.x] : []),
    ...(atX !== undefined ? [atX] : []),
    ...(sec ? [sec.x, sec.x + sec.h] : []),
    // Room on both sides for the approach arrows and their "x → 3⁻", "x → 3⁺" tags.
    ...(limX !== undefined ? [limX - 3, limX, limX + 3] : []),
    ...(shadeRange ?? []),
    ...riemannXs(spec.riemann, get), // H106
    ...he1eXs(spec, main, other, get), // HC10, HC12
    ...he2gXs(spec, main, get), // HC37, HC38
    ...main.domain
      .flatMap((i) => [i.lo, i.hi])
      .filter((v) => Number.isFinite(v) && Math.abs(v) < 50),
  ];
  const periodic = !!main.piX;
  const lo0 = Math.min(probe[0], ...keyXs.filter(Number.isFinite));
  const hi0 = Math.max(probe[1], ...keyXs.filter(Number.isFinite));
  const zeros0 = periodic ? [] : zerosIn(main, lo0, hi0);
  const ext0 = periodic || main.family === 'quadratic' ? [] : extremaIn(main, lo0, hi0);
  const cross0 = spec.other && other ? crossings(main, other, lo0, hi0) : [];
  const trigSpan = periodic
    ? [
        Math.min(0, get('h' in spec ? spec.h : undefined, 0)),
        Math.max(0, get('h' in spec ? spec.h : undefined, 0)) +
          Math.max(main.period ?? 2 * Math.PI, Math.PI),
      ]
    : [];
  // A power with an odd root (x^(2/3)) is defined for every x: show both sides of its key
  // point, as far left as the values of interest reach right (it was drawn from 0 only).
  const everyX = main.family === 'power' && main.key && main.domain.some((i) => i.lo === -Infinity);
  const mirrored = everyX
    ? keyXs.filter((v) => Math.abs(v) < 60).map((v) => 2 * main.key!.x - v)
    : [];
  const xs = [
    ...keyXs.filter((v) => Math.abs(v) < 60),
    ...mirrored.filter((v) => Math.abs(v) < 60),
    ...zeros0.map((z) => z.x),
    ...ext0.map((e) => e.x),
    ...cross0.map((p) => p.x),
    ...trigSpan,
    ...(tfP ? [tfP.x, tfP.X] : []),
    ...(rejX !== undefined && Math.abs(rejX) < 60 ? [rejX] : []),
  ];
  const ys = [
    ...(main.key ? [main.key.y] : []),
    ...main.holes.map((h) => h.y),
    ...main.ends.map((e) => e.y),
    ...main.has,
    // Room above and below a horizontal asymptote for the branches beside a vertical one.
    ...(main.vas(-12, 12).length && !main.piX ? main.has.flatMap((a) => [a - 3, a + 3]) : []),
    ...ext0.map((e) => e.y),
    ...cross0.map((p) => p.y),
    ...(tfP ? [tfP.y, tfP.Y] : []),
    ...(moved?.curve.key ? [moved.curve.key.y] : []),
    ...(atX !== undefined ? [main.f(atX)] : []),
    ...(spec.riemann ? riemannOf(spec.riemann, main.f, get).strips.map((q) => q.y) : []), // H106
    ...(sec ? [main.f(sec.x), main.f(sec.x + sec.h)] : []),
    ...(limX !== undefined ? [main.side(limX, -1), main.side(limX, 1)] : []),
    ...(main.midline !== undefined && main.amplitude !== undefined
      ? [main.midline - main.amplitude, main.midline + main.amplitude]
      : []),
    ...(main.piY ? main.range!.flatMap((r) => [r.lo, r.hi]) : []),
    ...(main.inflection ? [main.inflection.y] : []),
    // H94: room for the curve before |f(x)| or the cut, drawn dashed.
    ...(shaped.ghost?.key ? [shaped.ghost.key.y] : []),
    ...(main.family === 'linear' ||
    main.family === 'absolute' ||
    main.family === 'exponential' ||
    main.family === 'root' ||
    main.family === 'log'
      ? [main.f(main.key?.x ?? 0) + 2, main.f((main.key?.x ?? 0) + 2)]
      : []),
    // H106: the log sum's plunge to its asymptote, below its zero.
    ...(main.family === 'logSum' ? [-2.5] : []),
    ...he1eYs(spec, main, other, get), // HC10, HC12
    ...he2gYs(spec, main, get), // HC37, HC38
  ].filter((v) => Number.isFinite(v) && Math.abs(v) < 1e6);

  const legend: { toks: Tok[]; name: string; color: string; dash?: string }[] = [
    { toks: main.text, name: `${fName}(${xName}) = `, color: c.chartHighlight },
    ...(other
      ? [
          {
            toks:
              tfText !== undefined
                ? moved?.own
                  ? [{ t: `${tfText} = ${plain(other.text)}` }]
                  : [{ t: tfText }]
                : other.text,
            name: `${gName}(${xName}) = `,
            color: c.fnSecond,
          },
        ]
      : []),
    ...(spec.inverse
      ? [
          {
            toks: shaped.inverse ?? main.inverse ?? [{ t: 'the reflection across y = x' }],
            name: (shaped.inverse ?? main.inverse) ? `${fName}⁻¹(${xName}) = ` : `${fName}⁻¹: `,
            color: c.fnSecond,
            dash: chart.dash,
          },
        ]
      : []),
    ...(parent
      ? [{ toks: parent.text, name: `parent y = `, color: c.chartMuted, dash: chart.dash }]
      : []),
    ...(sec
      ? [
          { toks: [{ t: 'through P and Q' }], name: 'secant: ', color: c.fnSecond },
          {
            toks: [{ t: 'at P, where the secant heads as h → 0' }],
            name: 'tangent: ',
            color: c.chartMuted,
            dash: chart.dash,
          },
        ]
      : []),
  ];
  const rowH = (t: Tok[]) =>
    t.some((k) => 'frac' in k)
      ? 44
      : t.some((k) => 'cases' in k)
        ? (t.find((k) => 'cases' in k) as { cases: unknown[] }).cases.length * (LEG + 8) + 10
        : 26;
  const legendH = legend.reduce((s, l) => s + rowH(l.toks), 0) + 6;
  const named = !!spec.axes;
  const plotAspect = spec.inverse ? 0.92 : 0.78;

  const live = (pw: number, ph: number) =>
    chooseWindow({
      curves: [main, ...(other ? [other] : [])],
      xs,
      ys,
      pw,
      ph,
      fixed: spec.window ?? he2gWindow(spec, get), // HC37: the ε–δ zoom
      xMin: spec.xMin,
      square: !!spec.inverse,
    });
  const frozen = useFrozen<Window | undefined>(undefined);
  // The window last drawn: a drag freezes it, so the scale doesn't grow under the finger and
  // run the point away (a steep curve rescaled y, then x, on every move).
  const drawn = useRef<Window | undefined>(undefined);
  const start = useRef<{ def?: HandleDef; x: number; y: number }>({ x: 0, y: 0 });

  // Values held while a handle moves: every other typed parameter, and the traced x.
  const paramIds = [...familyVars(given), ...(given.other ? familyVars(given.other) : [])].filter(
    (id) => !rep.variable(id).derived,
  );
  const held = (moving: string[]) =>
    rep.pin(
      (
        spec.keep ?? [
          ...paramIds,
          ...(spec.at ? [spec.at.x] : []),
          ...(spec.secant ? [spec.secant.x, spec.secant.h] : []).filter(
            (v): v is string => typeof v === 'string',
          ),
        ]
      )
        // Only typed values are held: holding a worked-out one (X = p + h) made the drag
        // change the typed value behind it (p) instead.
        .filter((id) => !moving.includes(id) && calc.status(id) !== 'derived'),
    );

  const captions: string[] = [];
  captions.push(`${fName}(${xName}) = ${plain(main.text)}`);
  if (other)
    captions.push(
      tfText !== undefined
        ? `${gName}(${xName}) = ${tfText}${moved?.own ? ` = ${plain(other.text)}` : ''}`
        : `${gName}(${xName}) = ${plain(other.text)}`,
    );

  return (
    <View>
      <Canvas
        aspect={(w) => (legendH + (named ? 30 : 12) + 30 + w * plotAspect + he1ePanel(spec, w)) / w}
      >
        {({ w, h }) => {
          const L0 = 34;
          const top = legendH + (named ? 26 : 10);
          const bottom = h - (named ? 40 : 24) - he1ePanel(spec, w); // HC12: the F(x) panel
          const pw0 = w - L0 - 14;
          const win = frozen.value ?? live(pw0, bottom - top);
          drawn.current = win;
          const yLabels = ticks(win.y[0], win.y[1], win.yStep).map((v) => tickText(v, win.piY));
          const L = Math.max(22, Math.max(...yLabels.map((s) => width(s, chart.label))) + 10);
          const R = 14;
          const pw = w - L - R;
          const ph = bottom - top;
          const ux = pw / (win.x[1] - win.x[0]);
          const uy = ph / (win.y[1] - win.y[0]);
          const sx = (x: number) => L + (x - win.x[0]) * ux;
          const sy = (y: number) => top + (win.y[1] - y) * uy;
          const inX = (x: number) => x >= win.x[0] - 1e-9 && x <= win.x[1] + 1e-9;
          const inY = (y: number) => y >= win.y[0] - 1e-9 && y <= win.y[1] + 1e-9;
          const inWin = (x: number, y: number) => inX(x) && inY(y);
          /**
           * The farthest x toward `to` from `from` whose point on the curve stays in the window:
           * the window is frozen while a point is dragged, and a handle that left it would
           * unmount mid-drag and never release the window.
           */
          const reach = (from: number, to: number, snap: (x: number) => number) => {
            // Checked after snapping to the box's step: a point snapped past the edge left too.
            const ok = (x: number) => inWin(snap(x), main.f(snap(x)));
            if (ok(to) || !ok(from)) return snap(to);
            let [a, b] = [from, to];
            for (let i = 0; i < 24; i++) {
              const m = (a + b) / 2;
              if (ok(m)) a = m;
              else b = m;
            }
            return snap(a);
          };
          const [wx0, wx1] = win.x;
          const piX = win.piX;
          const piY = win.piY;

          /** The curve as path data, split at breaks and where it leaves the window far. */
          const pathOf = (cv: Curve, lo = wx0, hi = wx1) => {
            const n = Math.max(240, Math.round(pw * 1.6));
            const yLo = win.y[0] - (win.y[1] - win.y[0]);
            const yHi = win.y[1] + (win.y[1] - win.y[0]);
            let d = '';
            for (const [a, b] of spans(cv, lo, hi)) {
              let pen = false;
              const m = Math.max(8, Math.round((n * (b - a)) / (wx1 - wx0)));
              for (let i = 0; i <= m; i++) {
                const x = a + ((b - a) * i) / m;
                const y = cv.f(x);
                if (!Number.isFinite(y)) {
                  pen = false;
                  continue;
                }
                const yc = Math.max(yLo, Math.min(yHi, y));
                d += `${pen ? 'L' : 'M'} ${sx(x).toFixed(2)} ${sy(yc).toFixed(2)} `;
                pen = yc === y;
              }
            }
            return d;
          };
          /** The reflection across y = x. */
          const inversePath = (cv: Curve) => {
            let d = '';
            const lo = Math.min(wx0, win.y[0]);
            const hi = Math.max(wx1, win.y[1]);
            for (const [a, b] of spans(cv, lo, hi)) {
              let pen = false;
              for (let i = 0; i <= 400; i++) {
                const x = a + ((b - a) * i) / 400;
                const y = cv.f(x);
                if (!Number.isFinite(y) || Math.abs(y) > 1e4) {
                  pen = false;
                  continue;
                }
                d += `${pen ? 'L' : 'M'} ${sx(y).toFixed(2)} ${sy(x).toFixed(2)} `;
                pen = true;
              }
            }
            return d;
          };

          // Features in the window.
          const zeros = marks.has('zeros') ? zerosIn(main, wx0, wx1).filter((z) => inX(z.x)) : [];
          const vertex =
            marks.has('vertex') &&
            main.key &&
            (main.key.what === 'vertex' ||
              main.key.what === 'start' ||
              main.key.what === 'center') &&
            inWin(main.key.x, main.key.y)
              ? main.key
              : undefined;
          const extrema = marks.has('extrema')
            ? extremaIn(main, wx0, wx1).filter(
                (e) => inWin(e.x, e.y) && !(vertex && Math.abs(e.x - vertex.x) < 1e-6),
              )
            : [];
          const y0 = main.f(0);
          const intercept =
            marks.has('intercept') && inX(0) && Number.isFinite(y0) && inY(y0)
              ? { x: 0, y: y0 }
              : undefined;
          const vas = main.vas(wx0, wx1);
          const cross =
            spec.other && other
              ? crossings(main, other, wx0, wx1).filter((p) => inWin(p.x, p.y))
              : [];

          // Handles.
          const handleDefs: { def: HandleDef; ids: Record<string, string> }[] = [];
          if (!spec.fixed && allKnown) {
            for (const def of main.handles) {
              const idsOf: Record<string, string> = {};
              for (const s of def.sets) {
                const key = fieldAt(spec as FunctionFamily, s);
                // H106: a converted field drags back by its factor (none: no handle).
                if (conv && typeof key === 'string' && !conv.scale.has(key)) continue;
                const v = conv && typeof key === 'string' ? conv.source.get(key) : key;
                if (typeof v === 'string' && !rep.variable(v).derived) idsOf[s] = v;
              }
              if (!Object.keys(idsOf).length) continue;
              let placed = def;
              if (def.free) {
                const x = [0.75, 0.6, 0.45, 0.3]
                  .map((t) => Math.round((wx0 + (wx1 - wx0) * t) / win.xStep) * win.xStep)
                  .find((x) => x > def.x + 1e-9 && inY(main.f(x)));
                if (x === undefined) continue;
                placed = { ...def, x, y: main.f(x) };
              }
              if (!inWin(placed.x, placed.y)) continue;
              handleDefs.push({ def: placed, ids: idsOf });
            }
          }
          const handlePx: [number, number][] = [];
          const atPt =
            spec.at && atX !== undefined && Number.isFinite(main.f(atX)) && inWin(atX, main.f(atX))
              ? { x: atX, y: main.f(atX) }
              : undefined;
          if (atPt && !spec.fixed && rep.known(spec.at!.x) && !rep.variable(spec.at!.x).derived)
            handlePx.push([sx(atPt.x), sy(atPt.y)]);
          const secQ =
            sec && !spec.fixed && typeof spec.secant!.h === 'string'
              ? { x: sec.x + sec.h, y: main.f(sec.x + sec.h) }
              : undefined;
          if (secQ && inWin(secQ.x, secQ.y)) handlePx.push([sx(secQ.x), sy(secQ.y)]);
          // A handle within 34 px of another is hidden, but never the one being dragged: it
          // would vanish under the finger (a vertex dragged past the traced point). It goes
          // first, so a handle it passes is the one hidden.
          const held0 = start.current.def?.name;
          const shownHandles = [
            ...handleDefs.filter(({ def }) => def.name === held0),
            ...handleDefs.filter(({ def }) => def.name !== held0),
          ].filter(({ def }) => {
            const p: [number, number] = [sx(def.x), sy(def.y)];
            const near = handlePx.some(([x, y]) => Math.hypot(x - p[0], y - p[1]) < 34);
            if (near && def.name !== held0) return false;
            handlePx.push(p);
            return true;
          });

          // Labels: off the handles, each other and the curve.
          const curvePts: [number, number][] = [];
          for (let i = 0; i <= 120; i++) {
            const x = wx0 + ((wx1 - wx0) * i) / 120;
            const y = main.f(x);
            if (Number.isFinite(y) && inY(y)) curvePts.push([sx(x), sy(y)]);
          }
          const h0 = 'h' in spec ? get(spec.h, 0) : 0;
          const ampX =
            main.period !== undefined ? h0 + main.period / (main.family === 'cos' ? 1 : 4) : 0;
          const amp =
            marks.has('amplitude') &&
            main.amplitude !== undefined &&
            main.midline !== undefined &&
            inX(ampX)
              ? { x: ampX, y0: main.midline, y1: main.f(ampX) }
              : undefined;
          const per =
            marks.has('period') && main.period !== undefined
              ? { x0: h0, x1: h0 + main.period }
              : undefined;

          // Their labels go first, in fixed places: under the period bracket, beside the
          // amplitude bar.
          const chipBox = (x: number, y: number, text: string, anchor: 'middle' | 'start') => {
            const bw = width(text, chart.label) + 6;
            let l = anchor === 'middle' ? x - bw / 2 : x + 6;
            if (anchor === 'start' && l + bw > L + pw - 1) l = x - 6 - bw;
            l = Math.min(L + pw - bw - 1, Math.max(L + 1, l));
            return { l, t: y, r: l + bw, b: y + chart.label + 5 };
          };
          const perText = per ? `period ${numText(main.period!, true)}` : '';
          const perBox =
            per && allKnown
              ? chipBox((sx(per.x0) + sx(per.x1)) / 2, top + 15, perText, 'middle')
              : undefined;
          const ampText = amp ? `amplitude ${numText(main.amplitude!)}` : '';
          const ampBox =
            amp && allKnown
              ? chipBox(sx(amp.x), (sy(amp.y0) + sy(amp.y1)) / 2 - 9, ampText, 'start')
              : undefined;
          // The axis letters, kept clear too.
          const letters: Box[] = [
            ...(inY(0) ? [{ l: L + pw - 12, t: sy(0) - 18, r: L + pw, b: sy(0) - 2 }] : []),
            ...(inX(0) ? [{ l: sx(0) + 4, t: top, r: sx(0) + 16, b: top + 16 }] : []),
          ];
          const place = makePlacer(
            { l: L + 1, t: top + 1, r: L + pw - 1, b: bottom - 1 },
            [
              ...handlePx.map(([x, y]) => ({ l: x - 13, t: y - 13, r: x + 13, b: y + 13 })),
              ...(perBox ? [perBox] : []),
              ...(ampBox ? [ampBox] : []),
              ...letters,
            ],
            curvePts,
          );
          const labels: { box: Box; text: string; color: string }[] = [];
          const said: [number, number][] = [];
          const label = (
            x: number,
            y: number,
            text: string | undefined,
            color: string = c.chartInk,
          ) => {
            if (!text || !allKnown) return;
            if (said.some(([px, py]) => Math.abs(px - x) < 1e-7 && Math.abs(py - y) < 1e-7)) return;
            said.push([x, y]);
            labels.push({ box: place(sx(x), sy(y), text), text, color });
          };
          const dots: { x: number; y: number; color: string; open?: boolean; r?: number }[] = [];
          const dashes: {
            x1: number;
            y1: number;
            x2: number;
            y2: number;
            color: string;
            dash?: string;
          }[] = [];

          // Asymptotes, always drawn; labelled with `asymptotes`.
          for (const v of vas) {
            dashes.push({
              x1: sx(v),
              y1: top,
              x2: sx(v),
              y2: bottom,
              color: c.chartMuted,
              dash: chart.dash,
            });
            if (marks.has('asymptotes') && allKnown)
              labels.push({
                box: place(sx(v), bottom - 26, `${xName} = ${numText(v, piX)}`),
                text: `${xName} = ${numText(v, piX)}`,
                color: c.chartMuted,
              });
          }
          for (const a of main.has) {
            if (!inY(a)) continue;
            dashes.push({
              x1: L,
              y1: sy(a),
              x2: L + pw,
              y2: sy(a),
              color: c.chartMuted,
              dash: chart.dash,
            });
            if (marks.has('asymptotes') && allKnown) {
              const t = `${dep} = ${numText(a, piY)}`;
              labels.push({ box: place(L + pw - 30, sy(a), t), text: t, color: c.chartMuted });
            }
          }
          if (main.slant) {
            const { m, b } = main.slant;
            dashes.push({
              x1: sx(wx0),
              y1: sy(m * wx0 + b),
              x2: sx(wx1),
              y2: sy(m * wx1 + b),
              color: c.chartMuted,
              dash: chart.dash,
            });
            if (marks.has('asymptotes') && allKnown) {
              const t = `y = ${m === 1 ? '' : m === -1 ? MINUS : numText(m)}${xName}${b === 0 ? '' : b < 0 ? ` ${MINUS} ${numText(-b)}` : ` + ${numText(b)}`}`;
              const lx = wx0 + (wx1 - wx0) * 0.12;
              label(lx, m * lx + b, t, c.chartMuted);
            }
          }
          if (vertex) {
            if (vertex.what === 'vertex')
              dashes.push({
                x1: sx(vertex.x),
                y1: top,
                x2: sx(vertex.x),
                y2: bottom,
                color: c.chartHighlight,
                dash: chart.dashFine,
              });
            dots.push({ ...vertex, color: c.chartHighlight });
            label(vertex.x, vertex.y, pointText(vertex.x, vertex.y, piX, piY));
            // The axis's equation, when the vertex is exact (a decimal vertex is in the caption).
            if (vertex.what === 'vertex' && allKnown && exactText(vertex.x)) {
              const t = `${xName} = ${exactText(vertex.x)}`;
              labels.push({
                box: place(sx(vertex.x), top + 10, t),
                text: t,
                color: c.chartHighlight,
              });
            }
          }
          for (const z of zeros) {
            dots.push({ x: z.x, y: 0, color: c.chartInk });
            label(z.x, 0, z.text && z.text.length <= 12 ? `(${z.text}, 0)` : undefined);
          }
          if (intercept) {
            dots.push({ ...intercept, color: c.chartInk });
            label(0, intercept.y, pointText(0, intercept.y, false, piY));
          }
          for (const e of extrema) {
            dots.push({ x: e.x, y: e.y, color: c.chartHighlight });
            label(e.x, e.y, pointText(e.x, e.y, piX, piY) ?? e.kind);
          }
          for (const hh of main.holes)
            if (inWin(hh.x, hh.y)) dots.push({ ...hh, color: c.chartHighlight, open: true });
          for (const e of main.ends)
            if (inWin(e.x, e.y)) dots.push({ ...e, color: c.chartHighlight, open: !e.closed });
          for (const p of cross) {
            // Down to the x-axis, where the solution is read.
            if (inY(0))
              dashes.push({
                x1: sx(p.x),
                y1: sy(p.y),
                x2: sx(p.x),
                y2: sy(0),
                color: c.chartMuted,
                dash: chart.dashFine,
              });
            dots.push({ ...p, color: c.chartInk, r: 5.5 });
            label(p.x, p.y, pointText(p.x, p.y, piX, piY));
          }
          const tfArrow =
            tfP && inWin(tfP.x, tfP.y) && inWin(tfP.X, tfP.Y) && allKnown ? tfP : undefined;
          const rej = rejX !== undefined && inX(rejX) && inY(0) && allKnown ? rejX : undefined;
          if (rej !== undefined) {
            dots.push({ x: rej, y: 0, color: c.chartMuted, open: true, r: 6 });
            label(rej, 0, `${xName} = ${numText(rej)} rejected`, c.chartMuted);
          }
          if (tfArrow) {
            dots.push({ x: tfArrow.x, y: tfArrow.y, color: c.chartHighlight });
            dots.push({ x: tfArrow.X, y: tfArrow.Y, color: c.fnSecond });
            label(tfArrow.x, tfArrow.y, pointText(tfArrow.x, tfArrow.y), c.chartHighlight);
            label(tfArrow.X, tfArrow.Y, pointText(tfArrow.X, tfArrow.Y), c.fnSecond);
          }
          if (
            main.inflection &&
            inWin(main.inflection.x, main.inflection.y) &&
            marks.has('extrema')
          ) {
            dots.push({ ...main.inflection, color: c.chartHighlight });
            label(
              main.inflection.x,
              main.inflection.y,
              pointText(main.inflection.x, main.inflection.y) ?? `half of the limit`,
            );
          }
          // Trig: midline, amplitude and period.
          if (main.midline !== undefined && marks.has('midline') && inY(main.midline)) {
            dashes.push({
              x1: L,
              y1: sy(main.midline),
              x2: L + pw,
              y2: sy(main.midline),
              color: c.chartMuted,
              dash: chart.dashFine,
            });
            // The midline is k: "?" while k is (not the example's k drawn faded).
            const kUnknown = 'k' in spec && say(spec.k as NumOrVar | undefined, 0) === '?';
            const t = `midline y = ${kUnknown ? '?' : numText(main.midline)}`;
            labels.push({
              box: place(L + 4 + width(t, chart.label) / 2, sy(main.midline), t),
              text: t,
              color: c.chartMuted,
            });
          }
          // Traced point.
          if (atPt) {
            const t =
              pointText(atPt.x, atPt.y, piX, piY) ??
              `(${numText(atPt.x, piX)}, ${fName}(${numText(atPt.x, piX)}))`;
            label(atPt.x, atPt.y, rep.known(spec.at!.x) ? t : undefined, c.chartHighlight);
          }
          // HC10, HC12: the families' marks, the repeated dose and the regions.
          const layerProps: He1eLayerProps = {
            spec,
            main,
            other,
            get,
            allKnown,
            c,
            sx,
            sy,
            win,
            L,
            pw,
            top,
            bottom,
            w,
            h,
            xName,
            fName,
            label,
            dots,
            dashes,
            valueOf: (id) => (rep.known(id) ? rep.value(id) : undefined),
          };
          const he1e = he1eLayer(layerProps);
          const he2g = he2gLayer(layerProps); // HC37, HC38
          // Limit: arrows along the curve from both sides.
          const lim =
            limX !== undefined && inX(limX)
              ? (() => {
                  const d = (wx1 - wx0) * 0.14;
                  const left = main.side(limX, -1);
                  const right = main.side(limX, 1);
                  const at = main.f(limX);
                  return { d, left, right, at };
                })()
              : undefined;
          if (lim) {
            if (
              Number.isFinite(lim.left) &&
              inY(lim.left) &&
              !dots.some((p) => Math.abs(p.x - limX!) < 1e-9 && Math.abs(p.y - lim.left) < 1e-9)
            )
              dots.push({
                x: limX!,
                y: lim.left,
                color: c.chartHighlight,
                open: !(Number.isFinite(lim.at) && Math.abs(lim.at - lim.left) < 1e-9),
              });
            if (
              Number.isFinite(lim.right) &&
              inY(lim.right) &&
              Math.abs(lim.right - lim.left) > 1e-9 &&
              !dots.some((p) => Math.abs(p.x - limX!) < 1e-9 && Math.abs(p.y - lim.right) < 1e-9)
            )
              dots.push({
                x: limX!,
                y: lim.right,
                color: c.chartHighlight,
                open: !(Number.isFinite(lim.at) && Math.abs(lim.at - lim.right) < 1e-9),
              });
            if (
              Number.isFinite(lim.at) &&
              inY(lim.at) &&
              Math.abs(lim.at - lim.left) > 1e-9 &&
              Math.abs(lim.at - lim.right) > 1e-9
            )
              dots.push({ x: limX!, y: lim.at, color: c.chartHighlight });
            dashes.push({
              x1: sx(limX!),
              y1: top,
              x2: sx(limX!),
              y2: bottom,
              color: c.chartMuted,
              dash: chart.dashFine,
            });
          }
          // Secant and tangent.
          const secLine = (() => {
            if (!sec) return undefined;
            const p = { x: sec.x, y: main.f(sec.x) };
            const q = { x: sec.x + sec.h, y: main.f(sec.x + sec.h) };
            if (![p.y, q.y].every(Number.isFinite) || sec.h === 0) return undefined;
            const m = (q.y - p.y) / sec.h;
            const e = 1e-6 * Math.max(1, Math.abs(p.x));
            const mt = (main.f(p.x + e) - main.f(p.x - e)) / (2 * e);
            return { p, q, m, mt };
          })();
          if (secLine) {
            label(secLine.p.x, secLine.p.y, 'P', c.chartInk);
            label(secLine.q.x, secLine.q.y, 'Q', c.fnSecond);
          }

          const line = (m: number, b: number) =>
            `M ${sx(wx0)} ${sy(m * wx0 + b)} L ${sx(wx1)} ${sy(m * wx1 + b)}`;
          const opacity = allKnown ? 1 : 0.35;
          const xTicks = ticks(wx0, wx1, win.xStep);
          const yTicks = ticks(win.y[0], win.y[1], win.yStep);
          const axX = inX(0) ? sx(0) : undefined;
          const axY = inY(0) ? sy(0) : undefined;
          // Domain on the x-axis and range on the y-axis, as on a number line: a bar, a filled
          // dot for an end that is in, an open dot for one that isn't, an arrow for no end.
          const bracket = (list: Interval[], along: 'x' | 'y') => {
            const color = along === 'x' ? c.chartHighlight : c.fnSecond;
            return list.map((i, k) => {
              const [lo, hi] = along === 'x' ? win.x : win.y;
              const a = Math.max(lo, i.lo);
              const b = Math.min(hi, i.hi);
              if (a > b) return null;
              const pos = along === 'x' ? (axY ?? bottom) : (axX ?? L);
              const at = (v: number): [number, number] =>
                along === 'x' ? [sx(v), pos] : [pos, sy(v)];
              const [ax1, ay1] = at(a);
              const [bx1, by1] = at(b);
              const end = (
                v: number,
                px: number,
                py: number,
                isIn: boolean,
                open: boolean,
                out: 1 | -1,
              ) => {
                if (open) {
                  // An arrow pointing on past the window.
                  const [dx, dy] = along === 'x' ? [out, 0] : [0, -out];
                  return (
                    <Path
                      d={`M ${px + dx * 4} ${py + dy * 4} L ${px - dx * 6 - dy * 5} ${py - dy * 6 - dx * 5} L ${px - dx * 6 + dy * 5} ${py - dy * 6 + dx * 5} Z`}
                      fill={color}
                    />
                  );
                }
                return (
                  <Circle
                    cx={px}
                    cy={py}
                    r={4.5}
                    fill={isIn ? color : c.card}
                    stroke={color}
                    strokeWidth={chart.stroke}
                  />
                );
              };
              return (
                <G key={`${along}${k}`}>
                  <Line
                    x1={ax1}
                    y1={ay1}
                    x2={bx1}
                    y2={by1}
                    stroke={color}
                    strokeWidth={6}
                    strokeLinecap="butt"
                    opacity={0.45}
                  />
                  {end(a, ax1, ay1, i.loIn, i.lo < lo || i.lo === -Infinity, -1)}
                  {end(b, bx1, by1, i.hiIn, i.hi > hi || i.hi === Infinity, 1)}
                </G>
              );
            });
          };

          return (
            <>
              <Svg width={w} height={h}>
                <Defs>
                  <ClipPath id={ids.clip}>
                    <Rect x={L} y={top} width={pw} height={ph} />
                  </ClipPath>
                </Defs>
                {/* Legend: each curve's formula. */}
                {(() => {
                  let y = 4;
                  return legend.map((l, i) => {
                    const hRow = rowH(l.toks);
                    const base = y + hRow / 2 + 5;
                    y += hRow;
                    const nameW = width(l.name, LEG);
                    const body = layout(l.toks, 30 + nameW, base, LEG, c.chartInk, `l${i}`);
                    return (
                      <G key={`leg${i}`} opacity={i === 0 ? opacity : 1}>
                        <Line
                          x1={4}
                          x2={24}
                          y1={base - 5}
                          y2={base - 5}
                          stroke={l.color}
                          strokeWidth={chart.strokeHeavy}
                          strokeDasharray={l.dash}
                        />
                        <ChartText x={30} y={base} fontSize={LEG}>
                          <Runs text={l.name} size={LEG} />
                        </ChartText>
                        {body.node}
                      </G>
                    );
                  });
                })()}
                {/* Grid and axes. */}
                {xTicks.map((v) => (
                  <Line
                    key={`gx${v}`}
                    x1={sx(v)}
                    x2={sx(v)}
                    y1={top}
                    y2={bottom}
                    stroke={c.chartGrid}
                    strokeWidth={1}
                  />
                ))}
                {yTicks.map((v) => (
                  <Line
                    key={`gy${v}`}
                    x1={L}
                    x2={L + pw}
                    y1={sy(v)}
                    y2={sy(v)}
                    stroke={c.chartGrid}
                    strokeWidth={1}
                  />
                ))}
                <Rect
                  x={L}
                  y={top}
                  width={pw}
                  height={ph}
                  fill="none"
                  stroke={c.chartGrid}
                  strokeWidth={1}
                />
                {axY !== undefined ? (
                  <Line
                    x1={L}
                    x2={L + pw}
                    y1={axY}
                    y2={axY}
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeLight}
                  />
                ) : null}
                {axX !== undefined ? (
                  <Line
                    x1={axX}
                    x2={axX}
                    y1={top}
                    y2={bottom}
                    stroke={c.chartInk}
                    strokeWidth={chart.strokeLight}
                  />
                ) : null}
                {xTicks.map((v, i) => {
                  const t = tickText(v, piX);
                  // Crowded π labels: every other one.
                  if (piX && xTicks.length * 34 > pw && i % 2) return null;
                  // The corner is the lowest y number's: the first x number gives way.
                  if (i === 0 && v !== 0) return null;
                  return (
                    <ChartText
                      key={`nx${v}`}
                      x={sx(v)}
                      y={bottom + 15}
                      fontSize={chart.label}
                      fill={c.chartMuted}
                      textAnchor="middle"
                    >
                      {t}
                    </ChartText>
                  );
                })}
                {yTicks.map((v, i) =>
                  // A handle on the y-axis (a start value at x = 0) would sit on its number:
                  // the number gives way, as the point's own label names the value.
                  handlePx.some(
                    ([hx, hy]) =>
                      hx - L < chart.handle / 2 + 4 && Math.abs(hy - sy(v)) < chart.handle / 2 + 6,
                  ) ? null : (
                    <ChartText
                      key={`ny${v}`}
                      x={L - 5}
                      y={sy(v) + 4}
                      fontSize={chart.label}
                      fill={c.chartMuted}
                      textAnchor="end"
                    >
                      {yLabels[i]}
                    </ChartText>
                  ),
                )}
                {named ? (
                  <>
                    {spec.axes?.x ? (
                      <ChartText
                        x={L + pw}
                        y={bottom + 33}
                        fontSize={chart.label}
                        fontWeight="700"
                        textAnchor="end"
                      >
                        <Runs text={spec.axes.x} size={chart.label} />
                      </ChartText>
                    ) : null}
                    {spec.axes?.y ? (
                      <ChartText
                        x={Math.max(4, L - 20)}
                        y={top - 9}
                        fontSize={chart.label}
                        fontWeight="700"
                      >
                        <Runs text={spec.axes.y} size={chart.label} />
                      </ChartText>
                    ) : null}
                  </>
                ) : (
                  <>
                    {axY !== undefined ? (
                      <ChartText
                        x={L + pw - 10}
                        y={axY - 6}
                        fontSize={chart.value}
                        fontWeight="700"
                        fontStyle="italic"
                      >
                        {xName}
                      </ChartText>
                    ) : null}
                    {axX !== undefined ? (
                      <ChartText
                        x={axX + 6}
                        y={top + 13}
                        fontSize={chart.value}
                        fontWeight="700"
                        fontStyle="italic"
                      >
                        y
                      </ChartText>
                    ) : null}
                  </>
                )}
                <G clipPath={url(ids.clip)}>
                  {ineq && allKnown ? (
                    <SignFill curve={main} sign={ineq} sx={sx} sy={sy} win={win} />
                  ) : null}
                  {/* Shading: an inequality above or below, or between x values. */}
                  {shade ? (
                    <Path
                      d={(() => {
                        if (shadeRange) {
                          const [a, b] = [
                            Math.max(wx0, shadeRange[0]!),
                            Math.min(wx1, shadeRange[1]!),
                          ];
                          if (!(a < b)) return '';
                          let d = `M ${sx(a)} ${sy(0)} `;
                          for (let i = 0; i <= 200; i++) {
                            const x = a + ((b - a) * i) / 200;
                            const y = Math.max(win.y[0] - 1, Math.min(win.y[1] + 1, main.f(x)));
                            d += `L ${sx(x)} ${sy(Number.isFinite(y) ? y : 0)} `;
                          }
                          return `${d}L ${sx(b)} ${sy(0)} Z`;
                        }
                        let d = '';
                        for (const [a, b] of spans(main, wx0, wx1)) {
                          const edge = shade === 'above' ? win.y[1] + 1 : win.y[0] - 1;
                          d += `M ${sx(a)} ${sy(edge)} `;
                          for (let i = 0; i <= 200; i++) {
                            const x = a + ((b - a) * i) / 200;
                            const y = main.f(x);
                            d += `L ${sx(x)} ${sy(Math.max(win.y[0] - 1, Math.min(win.y[1] + 1, Number.isFinite(y) ? y : edge)))} `;
                          }
                          d += `L ${sx(b)} ${sy(edge)} Z `;
                        }
                        return d;
                      })()}
                      fill={c.chartHighlight}
                      opacity={0.16}
                    />
                  ) : null}
                  {spec.riemann ? ( // H106: Riemann rectangles, under the curve
                    <RiemannRects
                      r={spec.riemann}
                      curve={main}
                      get={get}
                      sx={sx}
                      sy={sy}
                      faded={!allKnown}
                    />
                  ) : null}
                  {he1e.under}
                  {he2g.under}
                  {dashes.map((d, i) => (
                    <Line
                      key={`d${i}`}
                      x1={d.x1}
                      y1={d.y1}
                      x2={d.x2}
                      y2={d.y2}
                      stroke={d.color}
                      strokeWidth={chart.strokeLight}
                      strokeDasharray={d.dash}
                    />
                  ))}
                  {shaped.ghost ? (
                    <Path
                      d={pathOf(shaped.ghost)}
                      stroke={c.chartMuted}
                      strokeWidth={chart.stroke}
                      strokeDasharray={chart.dash}
                      fill="none"
                    />
                  ) : null}
                  {parent ? (
                    <Path
                      d={pathOf(parent)}
                      stroke={c.chartMuted}
                      strokeWidth={chart.stroke}
                      strokeDasharray={chart.dash}
                      fill="none"
                    />
                  ) : null}
                  {spec.inverse ? (
                    <>
                      <Path
                        d={line(1, 0)}
                        stroke={c.chartMuted}
                        strokeWidth={chart.strokeLight}
                        strokeDasharray={chart.dashFine}
                        fill="none"
                      />
                      <Path
                        d={inversePath(main)}
                        stroke={c.fnSecond}
                        strokeWidth={chart.strokeHeavy}
                        strokeDasharray={chart.dash}
                        fill="none"
                        opacity={opacity}
                      />
                    </>
                  ) : null}
                  {other ? (
                    <Path
                      d={pathOf(other)}
                      stroke={c.fnSecond}
                      strokeWidth={chart.strokeHeavy}
                      fill="none"
                    />
                  ) : null}
                  <Path
                    d={pathOf(main)}
                    stroke={c.chartHighlight}
                    strokeWidth={chart.strokeHeavy}
                    fill="none"
                    strokeLinejoin="round"
                    opacity={opacity}
                  />
                  {secLine ? (
                    <>
                      <Path
                        d={line(secLine.mt, secLine.p.y - secLine.mt * secLine.p.x)}
                        stroke={c.chartMuted}
                        strokeWidth={chart.stroke}
                        strokeDasharray={chart.dash}
                        fill="none"
                      />
                      <Path
                        d={line(secLine.m, secLine.p.y - secLine.m * secLine.p.x)}
                        stroke={c.fnSecond}
                        strokeWidth={chart.stroke}
                        fill="none"
                      />
                      <Path
                        d={`M ${sx(secLine.p.x)} ${sy(secLine.p.y)} L ${sx(secLine.q.x)} ${sy(secLine.p.y)} L ${sx(secLine.q.x)} ${sy(secLine.q.y)}`}
                        stroke={c.chartMuted}
                        strokeWidth={chart.strokeLight}
                        strokeDasharray={chart.dashFine}
                        fill="none"
                      />
                      <Circle cx={sx(secLine.p.x)} cy={sy(secLine.p.y)} r={4.5} fill={c.chartInk} />
                      <Circle cx={sx(secLine.q.x)} cy={sy(secLine.q.y)} r={4.5} fill={c.fnSecond} />
                    </>
                  ) : null}
                  {tfArrow && Math.hypot(tfArrow.X - tfArrow.x, tfArrow.Y - tfArrow.y) > 1e-9
                    ? (() => {
                        const [x1, y1, x2, y2] = [
                          sx(tfArrow.x),
                          sy(tfArrow.y),
                          sx(tfArrow.X),
                          sy(tfArrow.Y),
                        ];
                        const len = Math.hypot(x2 - x1, y2 - y1);
                        if (len < 20) return null;
                        const [ex, ey] = [(x2 - x1) / len, (y2 - y1) / len];
                        // From the dot's edge to the image's, the head just short of it.
                        const [ax, ay] = [x1 + ex * 7, y1 + ey * 7];
                        const [bx, by] = [x2 - ex * 7, y2 - ey * 7];
                        return (
                          <G>
                            <Line
                              x1={ax}
                              y1={ay}
                              x2={bx - ex * 6}
                              y2={by - ey * 6}
                              stroke={c.chartInk}
                              strokeWidth={chart.stroke}
                              strokeDasharray={chart.dashFine}
                            />
                            <Path
                              d={`M ${bx} ${by} L ${bx - ex * 9 - ey * 5} ${by - ey * 9 + ex * 5} L ${bx - ex * 9 + ey * 5} ${by - ey * 9 - ex * 5} Z`}
                              fill={c.chartInk}
                            />
                          </G>
                        );
                      })()
                    : null}
                  {lim
                    ? ([-1, 1] as const).map((s) => {
                        const x1 = limX! + s * lim.d;
                        const x2 = limX! + s * lim.d * 0.18;
                        const y1 = main.f(x1);
                        const y2 = main.f(x2);
                        if (![y1, y2].every(Number.isFinite)) return null;
                        const [p1, p2] = [
                          [sx(x1), sy(y1) + 12],
                          [sx(x2), sy(y2) + 12],
                        ] as const;
                        const len = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) || 1;
                        const [ux2, uy2] = [(p2[0] - p1[0]) / len, (p2[1] - p1[1]) / len];
                        const color = s < 0 ? c.chartHighlight : c.fnSecond;
                        return (
                          <G key={`lim${s}`}>
                            <Line
                              x1={p1[0]}
                              y1={p1[1]}
                              x2={p2[0] - ux2 * 6}
                              y2={p2[1] - uy2 * 6}
                              stroke={color}
                              strokeWidth={chart.stroke}
                            />
                            <Path
                              d={`M ${p2[0]} ${p2[1]} L ${p2[0] - ux2 * 8 - uy2 * 4.5} ${p2[1] - uy2 * 8 + ux2 * 4.5} L ${p2[0] - ux2 * 8 + uy2 * 4.5} ${p2[1] - uy2 * 8 - ux2 * 4.5} Z`}
                              fill={color}
                            />
                          </G>
                        );
                      })
                    : null}
                  {amp ? (
                    <G>
                      <Line
                        x1={sx(amp.x)}
                        x2={sx(amp.x)}
                        y1={sy(amp.y0)}
                        y2={sy(amp.y1)}
                        stroke={c.fnSecond}
                        strokeWidth={chart.stroke}
                      />
                      <Line
                        x1={sx(amp.x) - 5}
                        x2={sx(amp.x) + 5}
                        y1={sy(amp.y1)}
                        y2={sy(amp.y1)}
                        stroke={c.fnSecond}
                        strokeWidth={chart.stroke}
                      />
                    </G>
                  ) : null}
                  {per ? (
                    <Path
                      d={`M ${sx(per.x0)} ${top + 6} L ${sx(per.x0)} ${top + 14} M ${sx(per.x0)} ${top + 10} L ${sx(per.x1)} ${top + 10} M ${sx(per.x1)} ${top + 6} L ${sx(per.x1)} ${top + 14}`}
                      stroke={c.fnSecond}
                      strokeWidth={chart.stroke}
                      fill="none"
                    />
                  ) : null}
                  {atPt ? (
                    <Path
                      d={`M ${sx(atPt.x)} ${axY ?? bottom} L ${sx(atPt.x)} ${sy(atPt.y)} L ${axX ?? L} ${sy(atPt.y)}`}
                      stroke={c.chartMuted}
                      strokeWidth={chart.strokeLight}
                      strokeDasharray={chart.dashFine}
                      fill="none"
                    />
                  ) : null}
                  {dots.map((p, i) => (
                    <Circle
                      key={`p${i}`}
                      cx={sx(p.x)}
                      cy={sy(p.y)}
                      r={p.r ?? 4.5}
                      fill={p.open ? c.card : p.color}
                      stroke={p.color}
                      strokeWidth={chart.stroke}
                      opacity={opacity}
                    />
                  ))}
                  {rej !== undefined ? (
                    <Path
                      d={`M ${sx(rej) - 4} ${sy(0) - 4} L ${sx(rej) + 4} ${sy(0) + 4} M ${sx(rej) - 4} ${sy(0) + 4} L ${sx(rej) + 4} ${sy(0) - 4}`}
                      stroke={c.chartMuted}
                      strokeWidth={chart.stroke}
                    />
                  ) : null}
                  {atPt ? (
                    <Circle
                      cx={sx(atPt.x)}
                      cy={sy(atPt.y)}
                      r={5}
                      fill={c.chartHighlight}
                      opacity={rep.known(spec.at!.x) ? 1 : 0.35}
                    />
                  ) : null}
                </G>
                {he1e.over}
                {he2g.over}
                {ineq && allKnown ? (
                  <SignBand curve={main} sign={ineq} sx={sx} sy={sy} win={win} />
                ) : null}
                {marks.has('domain') && allKnown ? bracket(main.domain, 'x') : null}
                {marks.has('range') && allKnown && main.range ? bracket(main.range, 'y') : null}
                {perBox ? <Chip box={perBox} text={perText} color={c.fnSecond} /> : null}
                {ampBox ? <Chip box={ampBox} text={ampText} color={c.fnSecond} /> : null}
                {lim && allKnown
                  ? ([-1, 1] as const).map((s) => {
                      const x = limX! + s * lim.d * 0.6;
                      const y = main.f(x);
                      if (!Number.isFinite(y) || !inY(y)) return null;
                      const t = `${xName} → ${numText(limX!, piX)}${s < 0 ? '⁻' : '⁺'}`;
                      return (
                        <Chip
                          key={`limt${s}`}
                          box={place(sx(x), sy(y) + 14, t)}
                          text={t}
                          color={s < 0 ? c.chartHighlight : c.fnSecond}
                        />
                      );
                    })
                  : null}
                {labels.map((l, i) => (
                  <Chip key={`lab${i}`} box={l.box} text={l.text} color={l.color} />
                ))}
              </Svg>
              {atPt &&
              handlePx.length &&
              !spec.fixed &&
              rep.known(spec.at!.x) &&
              !rep.variable(spec.at!.x).derived ? (
                <DragHandle
                  testID="drag-point"
                  x={sx(atPt.x)}
                  // On the point; only one so near a hole (the point the limit is about) that
                  // the knob would cover the open circle steps below the curve.
                  y={
                    sy(atPt.y) +
                    (main.holes.some(
                      (p) =>
                        Math.hypot(sx(p.x) - sx(atPt.x), sy(p.y) - sy(atPt.y)) <
                        chart.handle / 2 + 8,
                    )
                      ? chart.handleTouch * 0.8
                      : 0)
                  }
                  label={`the point on the curve`}
                  onStart={() => {
                    start.current = { x: atPt.x, y: atPt.y };
                    frozen.freezeAt(drawn.current);
                  }}
                  onMove={(dx) => {
                    const id = spec.at!.x;
                    // The window is frozen while dragging: stop at its edge, or the handle
                    // would leave it, unmount mid-drag and never release the window.
                    const k = conv ? fx : rep.factor(id);
                    const xc = reach(
                      start.current.x,
                      start.current.x + dx / ux,
                      (x) => rep.snapTo(id, x * k) / k,
                    );
                    calc.set(
                      {
                        ...held([id]),
                        [id]: rep.snapTo(id, xc * k),
                      },
                      rep.slide(id),
                    );
                  }}
                  onEnd={frozen.release}
                />
              ) : null}
              {secQ && inWin(secQ.x, secQ.y) && typeof spec.secant!.h === 'string' ? (
                <DragHandle
                  testID="drag-secant"
                  x={sx(secQ.x)}
                  y={sy(secQ.y)}
                  label="the second point Q"
                  onStart={() => {
                    start.current = { x: secQ.x, y: secQ.y };
                    frozen.freezeAt(drawn.current);
                  }}
                  onMove={(dx) => {
                    const id = spec.secant!.h as string;
                    const k = conv ? fx : rep.factor(id);
                    const xc = reach(
                      start.current.x,
                      start.current.x + dx / ux,
                      (x) => sec!.x + rep.snapTo(id, (x - sec!.x) * k) / k,
                    );
                    calc.set(
                      {
                        ...held([id]),
                        [id]: rep.snapTo(id, (xc - sec!.x) * k),
                      },
                      rep.slide(id),
                    );
                  }}
                  onEnd={frozen.release}
                />
              ) : null}
              {shownHandles.map(({ def, ids: hIds }) => (
                <DragHandle
                  key={def.name}
                  testID={`drag-${def.name.replace(/^the /, '').replace(/ /g, '-')}`}
                  x={sx(def.x)}
                  y={sy(def.y)}
                  label={def.name}
                  onStart={() => {
                    start.current = { def, x: def.x, y: def.y };
                    frozen.freezeAt(drawn.current);
                  }}
                  onMove={(dx, dy) => {
                    const s = start.current;
                    if (!s.def) return;
                    const X = s.def.axis === 'y' ? s.x : s.x + dx / ux;
                    const Y = s.def.axis === 'x' ? s.y : s.y - dy / uy;
                    if (!inWin(X, Y)) return;
                    const next = s.def.to(X, Y);
                    if (!next) return;
                    const moving = Object.values(hIds);
                    const updates: Record<string, number> = {};
                    for (const [path, v] of Object.entries(next)) {
                      const id = hIds[path];
                      const by = conv?.scale.get(fieldAt(spec as FunctionFamily, path) as string);
                      if (id && Number.isFinite(v))
                        updates[id] = rep.snapTo(id, by ? v / by : v * rep.factor(id));
                    }
                    const first = hIds[s.def.sets.find((p) => hIds[p])!]!;
                    calc.set({ ...held(moving), ...updates }, rep.slide(first));
                  }}
                  onEnd={() => {
                    start.current = { x: 0, y: 0 };
                    frozen.release();
                  }}
                />
              ))}
            </>
          );
        }}
      </Canvas>
      <Caption>{captionOf()}</Caption>
    </View>
  );

  /** The caption: the formula, then each feature marked, in words with exact values. */
  function captionOf() {
    // A science page's model reads its worked-out decimals to 3 figures (N(6) ≈ 691).
    const measured = calc.module.id.startsWith('s.')
      ? (x: number) => formatNumber(Number(x.toPrecision(3)))
      : undefined;
    const lines = [...captions];
    if (!allKnown) return [...lines, 'Type every value to draw the graph.'].join(' · ');
    const pi = !!main.piX;
    const win = [-50, 50] as const;
    if (marks.has('vertex') && main.key) {
      const k = main.key;
      const what = k.what === 'vertex' ? 'Vertex' : k.what === 'start' ? 'Starts at' : 'Center';
      lines.push(
        `${what} ${pairText(k.x, k.y)}${k.what === 'vertex' ? `, axis of symmetry ${xName} ${eq(k.x)}` : ''}`,
      );
    }
    if (marks.has('zeros')) {
      const zs = zerosIn(
        main,
        pi ? Math.min(0, win[0] / 25) : win[0],
        pi ? (main.period ?? 2 * Math.PI) + Math.max(0, 'h' in spec ? get(spec.h, 0) : 0) : win[1],
      ).slice(0, 6);
      lines.push(
        zs.length
          ? `Zero${zs.length > 1 ? 's' : ''}: ${zs.map((z) => `${xName} ${eq(z.x, shortOr(z.text ?? exactText(z.x, pi)))}`).join(', ')}${pi && main.period ? `, repeating every ${numText(main.period, true)}` : ''}`
          : 'No zeros: the graph never meets the x-axis',
      );
      // A tested root that isn't one (synthetic division, R ≠ 0): the other zeros the page
      // works out wait for a root, so their boxes show "?". Say why.
      const tried = spec.at;
      if (
        tried?.y &&
        rep.known(tried.x) &&
        rep.known(tried.y) &&
        Math.abs(rep.shown(tried.y)) > 1e-9 &&
        spec.shows?.zeros?.some((id) => !rep.known(id))
      )
        lines.push(
          `${xName} = ${numText(rep.shown(tried.x))} is not a root (${rep.variable(tried.y).symbol} = ${numText(rep.shown(tried.y))}): no quotient, so no other roots yet`,
        );
    }
    if (marks.has('intercept') && Number.isFinite(main.f(0)))
      lines.push(`y-intercept (0, ${withApprox(main.f(0))})`);
    if (marks.has('extrema') && !main.inflection) {
      const h1 = 'h' in spec ? get(spec.h, 0) : 0;
      // A periodic curve: one period's turning points.
      const es = (
        pi && main.period
          ? extremaIn(main, h1 - 1e-6, h1 + main.period - 1e-6)
          : extremaIn(main, win[0], win[1])
      ).slice(0, 4);
      for (const e of es)
        lines.push(
          `Local ${e.kind === 'max' ? 'maximum' : 'minimum'} at (${withApprox(e.x, exactText(e.x, pi))}, ${withApprox(e.y)})`,
        );
    }
    if (main.inflection && marks.has('extrema'))
      lines.push(
        `Fastest growth at ${xName} ${eq(main.inflection.x, undefined, measured)}, where it reaches half the limit, ${numText(main.inflection.y)}`,
      );
    if (marks.has('asymptotes')) {
      const v = main.vas(win[0], win[1]);
      if (v.length && !pi)
        lines.push(
          `Vertical asymptote${v.length > 1 ? 's' : ''} ${v.map((a) => `${xName} = ${numText(a)}`).join(', ')}`,
        );
      if (pi && v.length) lines.push(`Vertical asymptotes every ${numText(main.period!, true)}`);
      if (main.has.length)
        lines.push(
          `Horizontal asymptote${main.has.length > 1 ? 's' : ''} ${main.has.map((a) => `${dep} = ${numText(a, !!main.piY)}`).join(' and ')}`,
        );
      if (main.slant)
        lines.push(
          `Slant asymptote y = ${numText(main.slant.m)}${xName} + ${numText(main.slant.b)}`
            .replace('+ −', '− ')
            .replace(/^(Slant asymptote y = )1(?=\D)/, '$1'),
        );
      for (const hh of main.holes) lines.push(`Hole at (${numText(hh.x)}, ${withApprox(hh.y)})`);
    }
    if (marks.has('midline') && main.midline !== undefined)
      lines.push(`Midline y = ${numText(main.midline)}`);
    if (marks.has('amplitude') && main.amplitude !== undefined)
      lines.push(`Amplitude ${numText(main.amplitude)}`);
    if (marks.has('period') && main.period !== undefined)
      lines.push(`Period ${withApprox(main.period, numText(main.period, true))}`);
    if (marks.has('domain')) lines.push(`Domain: ${intervalText(main.domain, false)}`);
    if (marks.has('range') && main.range)
      lines.push(`Range: ${intervalText(main.range, !!main.piY)}`);
    if (spec.at && rep.known(spec.at.x) && atX !== undefined) {
      const y = main.f(atX);
      const said = withApprox(y, exactText(y, !!main.piY), measured);
      lines.push(
        Number.isFinite(y)
          ? `${fName}(${numText(atX, pi)}) ${said.startsWith('≈') ? said : `= ${said}`}`
          : `${fName}(${numText(atX, pi)}) has no value: ${numText(atX, pi)} is outside the domain`,
      );
    }
    if (rejX !== undefined)
      lines.push(
        `${xName} = ${numText(rejX)} is rejected: ${Number.isFinite(main.f(rejX)) ? `${fName}(${numText(rejX)}) is not what the equation needs` : `${fName}(${numText(rejX)}) has no value, it is outside the domain`}`,
      );
    if (tfP) {
      const [p, q] = [pointText(tfP.x, tfP.y), pointText(tfP.X, tfP.Y)];
      lines.push(
        p && q
          ? `${p} on ${fName} moves to ${q} on ${gName}: ${xName} + ${numText(tfH)}, then ${numText(tfA)} × y + ${numText(tfK)}`.replace(
              /\+ −/g,
              '− ',
            )
          : `${fName}'s point moves ${numText(tfH)} across and to ${numText(tfA)} × y + ${numText(tfK)}`,
      );
    }
    if (spec.other && other) {
      const cs = crossings(main, other, win[0], win[1]).slice(0, 4);
      lines.push(
        cs.length
          ? `${fName}(${xName}) = ${gName}(${xName}) where the curves cross: ${cs.map((p) => `${xName} ${eq(p.x)}`).join(', ')}`
          : `The curves don't cross: ${fName}(${xName}) = ${gName}(${xName}) has no solution`,
      );
    }
    if (shadeRange) {
      const [a, b] = shadeRange.map((v) => numText(v));
      lines.push(`Shaded: ${a} ≤ ${xName} ≤ ${b}`);
    } else if (shade)
      lines.push(
        `Shaded: the points ${shade} the curve, y ${shade === 'above' ? '>' : '<'} ${fName}(${xName})`,
      );
    if (spec.riemann) lines.push(riemannCaption(spec.riemann, main.f, get, xName)); // H106
    lines.push(...he1eCaption(spec, main, other, get, xName, fName, gName)); // HC10, HC12
    lines.push(...he2gCaption(spec, main, get, xName, fName)); // HC37, HC38
    if (spec.inequality) lines.push(signCaption(main, ineq, fName, xName));
    lines.push(...reshapeCaption(spec, shaped, fName, xName));
    if (spec.inverse) lines.push(`The inverse is the reflection across the line y = ${xName}`);
    if (spec.parent && parent) lines.push(`The parent y = ${plain(parent.text)} is dashed`);
    if (limX !== undefined) {
      const l = main.side(limX, -1);
      const r = main.side(limX, 1);
      const at = main.f(limX);
      const xt = numText(limX, pi);
      const val = (v: number) => (Number.isFinite(v) ? withApprox(v) : v > 0 ? '∞' : `${MINUS}∞`);
      lines.push(
        `As ${xName} → ${xt} from the left, ${fName}(${xName}) → ${val(l)}; from the right, ${fName}(${xName}) → ${val(r)}`,
      );
      lines.push(
        Number.isFinite(l) && Math.abs(l - r) < 1e-9
          ? `So the limit is ${withApprox(l)}${Number.isFinite(at) ? (Math.abs(at - l) < 1e-9 ? `, equal to ${fName}(${xt}): continuous there` : `, but ${fName}(${xt}) = ${withApprox(at)}`) : `, though ${fName}(${xt}) has no value`}`
          : 'The two sides differ, so the limit does not exist there',
      );
    }
    if (sec) {
      const p = main.f(sec.x);
      const q = main.f(sec.x + sec.h);
      if (Number.isFinite(p) && Number.isFinite(q) && sec.h !== 0) {
        const e = 1e-6 * Math.max(1, Math.abs(sec.x));
        const mt = (main.f(sec.x + e) - main.f(sec.x - e)) / (2 * e);
        lines.push(
          `Secant slope (${fName}(${numText(sec.x + sec.h)}) − ${fName}(${numText(sec.x)})) ÷ ${numText(sec.h)} ${eq((q - p) / sec.h)}`,
        );
        lines.push(
          `As h → 0 the secant turns into the tangent at P, slope ${withApprox(Math.round(mt * 1e6) / 1e6)}`,
        );
      }
    }
    return lines.join(' · ');
  }
}
