/**
 * Picture checks: what each representation kind draws must agree with the values (counts
 * whole and in range, parts adding to the whole, a slope matching rise over run …). Add a
 * case here for every new picture kind. Test-only.
 */
import type { VariableDef } from '@/engine/types';

import { diceCount } from '@/components/module/reps/dice';
import { toFraction } from '@/components/module/reps/exact';
import { outline } from '@/components/module/reps/scaleOutline';
import {
  areaOf,
  planeOf,
  reachOf,
  sectionOf,
  solidOf,
  volumeOf,
} from '@/components/module/reps/section';

import { placeParts } from '../helpers';
import type { ModuleDef, Representation } from '../types';

export function repIssues(
  rep: Representation,
  shown: (id: string) => number | undefined,
  byId: Map<string, VariableDef>,
): string[] {
  const out: string[] = [];
  const val = (x: string | number) => (typeof x === 'number' ? x : shown(x));
  const count = (id: string | number, what: string, max?: number) => {
    const x = val(id);
    if (x === undefined) return;
    if (x < 0) out.push(`${what} ${id} is negative (${x})`);
    if (Math.abs(x - Math.round(x)) > 1e-9) out.push(`${what} ${id} is not whole (${x})`);
    if (max !== undefined && x > max) out.push(`${what} ${id} = ${x} exceeds the drawing's ${max}`);
  };
  /**
   * A value a picture writes exactly (a quotient, a share): whole, a decimal ending within 4
   * places, or a fraction with a bottom to 16 (33 1/3). Anything else prints a long decimal.
   */
  const exact = (x: number | undefined, what: string) => {
    if (x === undefined || Math.abs(x * 1e4 - Math.round(x * 1e4)) < 1e-6) return;
    if (!toFraction(x)) out.push(`${what} ${x} is neither a short decimal nor a fraction`);
  };
  const medianOf = (s: number[]) =>
    s.length % 2 ? s[(s.length - 1) / 2]! : (s[s.length / 2 - 1]! + s[s.length / 2]!) / 2;
  /** The first `count` values in order (DotPlot/BoxPlot draw only those), once all are known. */
  const firstValues = (data?: string[], n?: string) => {
    if (!data || !n) return undefined;
    count(n, 'values drawn', data.length);
    const k = val(n);
    if (k === undefined) return undefined;
    if (k < 1) out.push(`${k} values drawn`);
    const xs = data.slice(0, k).map(val);
    if (k < 1 || xs.some((x) => x === undefined)) return undefined;
    return (xs as number[]).sort((a, b) => a - b);
  };
  switch (rep.kind) {
    case 'tenFrame': {
      const cap = 10 * (rep.frames ?? 1);
      count(rep.first, 'ten-frame', cap);
      count(rep.second, 'ten-frame', cap);
      count(rep.total, 'ten-frame', cap);
      const [a, b, c] = [val(rep.first), val(rep.second), val(rep.total)];
      if (a !== undefined && b !== undefined && a + b > cap) {
        out.push(`ten-frame counters ${a} + ${b} overflow ${cap} cells`);
      }
      if (a !== undefined && b !== undefined && c !== undefined && a + b !== c) {
        out.push(`ten-frame groups ${a} + ${b} don't make the total ${c}`);
      }
      break;
    }
    case 'hundredChart': {
      const n = val(rep.value);
      if (n !== undefined && (n < 1 || n > rep.max)) {
        out.push(
          `${n === 0 ? '~' : ''}hundred chart value ${n} is not a cell (1–${rep.max}); nothing is highlighted`,
        );
      }
      for (const id of rep.marks ?? []) {
        const x = val(id);
        // Marks past the end are listed in the caption ("past the chart"); below 1 is lost.
        if (x !== undefined && x < 1) {
          out.push(
            `${x === 0 ? '~' : ''}hundred chart mark ${id} = ${x} is off the chart (1–${rep.max})`,
          );
        }
      }
      break;
    }
    case 'compareRows': {
      const max = Math.max(10, byId.get(rep.a)?.max ?? 10, byId.get(rep.b)?.max ?? 10);
      count(rep.a, 'row', max);
      count(rep.b, 'row', max);
      const [a, b, d] = [val(rep.a), val(rep.b), rep.difference ? val(rep.difference) : undefined];
      if (a !== undefined && b !== undefined && d !== undefined && Math.abs(a - b) !== d) {
        out.push(`rows ${a}, ${b} don't show difference ${d}`);
      }
      break;
    }
    case 'rectilinear': {
      if (!rep.right === !rep.cut) out.push('rectilinear needs a right part or a cut, not both');
      if (rep.cut) {
        const [bw, bh, cw, ch] = [
          rep.left.width,
          rep.left.height,
          rep.cut.width,
          rep.cut.height,
        ].map(val);
        if (bw !== undefined && cw !== undefined && cw >= bw)
          out.push(`cut ${cw} wide is not inside the ${bw} wide rectangle`);
        if (bh !== undefined && ch !== undefined && ch >= bh)
          out.push(`cut ${ch} tall is not inside the ${bh} tall rectangle`);
      }
      break;
    }
    case 'polygon': {
      if (rep.sideValues) {
        if (rep.sideValues.length < 3 || rep.sideValues.length > 6)
          out.push(`polygon with ${rep.sideValues.length} labeled sides`);
        rep.sideValues.forEach((id) => {
          const x = val(id);
          if (x !== undefined && x <= 0) out.push(`side ${id} = ${x}`);
        });
        break;
      }
      if (!rep.sides) break;
      const s = val(rep.sides);
      // 0 sides draws a circle.
      if (s !== undefined && s !== 0 && (s < 3 || s !== Math.round(s)))
        out.push(`polygon with ${s} sides`);
      break;
    }
    case 'balance': {
      const ids = [...rep.left, ...rep.right, ...(rep.takeAway ? [rep.takeAway] : [])];
      for (const id of ids) count(id, 'balance counters');
      for (const pan of [rep.left, rep.right]) {
        const total = pan.reduce((s, id) => s + (val(id) ?? 0), 0);
        // Rows of 5, or rows of 10 smaller counters above 20: at most 40 fit a pan.
        if (total > 40) out.push(`balance pan holds ${total} counters (5+ rows of 10)`);
      }
      // Taken-away counters are crossed out of the left pan's own counters (Balance.tsx).
      const k = rep.takeAway ? val(rep.takeAway) : undefined;
      const left = rep.left.map(val);
      if (k !== undefined && left.every((x) => x !== undefined)) {
        const sum = left.reduce((s, x) => s! + x!, 0)!;
        if (k > sum) out.push(`balance crosses out ${k} of only ${sum} counters`);
      }
      break;
    }
    case 'hanger': {
      // Blocks and weights are whole things on a tray: up to 8 blocks and 40 weights a side
      // (Hanger.tsx packs them in rows); an unknown below 0 can't hang.
      for (const s of [rep.left, rep.right]) {
        if (s.x !== undefined) count(s.x, 'hanger blocks', 8);
        if (s.units !== undefined) count(s.units, 'hanger weights', 40);
      }
      const x = val(rep.unknown);
      if (x !== undefined && x < 0) out.push(`hanger block weighs ${x} (below 0)`);
      const [xl, ul, xr, ur] = [rep.left.x, rep.left.units, rep.right.x, rep.right.units].map(
        (v) => (v === undefined ? 0 : val(v)),
      );
      if (
        x !== undefined &&
        [xl, ul, xr, ur].every((v) => v !== undefined) &&
        Math.abs(xl! * x + ul! - (xr! * x + ur!)) > 1e-6 * Math.max(1, ur! + xr! * x)
      )
        out.push(`~hanger is not level: ${xl! * x + ul!} against ${xr! * x + ur!}`);
      break;
    }
    case 'circle': {
      // Wedges come in an even count, 4–24 (CircleParts.tsx rounds to one).
      if (rep.wedges !== undefined) {
        count(rep.wedges, 'wedges', 24);
        const n = val(rep.wedges);
        if (n !== undefined && (n < 4 || n % 2 !== 0)) out.push(`${n} wedges (even, 4–24)`);
      }
      const [r, d, C, A] = [rep.radius, rep.diameter, rep.circumference, rep.area].map((id) =>
        id ? val(id) : undefined,
      );
      const off = (a: number, b: number) => Math.abs(a - b) > 1e-6 * Math.max(1, Math.abs(b));
      if (r !== undefined && r < 0) out.push(`radius ${r} is negative`);
      if (r !== undefined && d !== undefined && off(d, 2 * r))
        out.push(`diameter ${d} is not 2 × ${r}`);
      if (r !== undefined && C !== undefined && off(C, 2 * Math.PI * r))
        out.push(`circumference ${C} is not 2π × ${r}`);
      if (r !== undefined && A !== undefined && off(A, Math.PI * r * r))
        out.push(`area ${A} is not π × ${r}²`);
      break;
    }
    case 'scaleCopy': {
      // Whole squares for the original; both figures side by side fit about 30 squares.
      count(rep.width, 'original width', 12);
      count(rep.height, 'original height', 12);
      const [W, H, k] = [rep.width, rep.height, rep.factor].map(val);
      if (k !== undefined && k <= 0) out.push(`scale factor ${k} is not positive`);
      if (W === undefined || H === undefined || k === undefined || k <= 0) break;
      if (W + W * k > 26 || Math.max(H, H * k) > 24)
        out.push(`scaled copy (${W} × ${H}, factor ${k}) is past the grid`);
      const near = (a: number, b: number) => Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(b));
      const cw = rep.copyWidth ? val(rep.copyWidth) : undefined;
      const ch = rep.copyHeight ? val(rep.copyHeight) : undefined;
      if (cw !== undefined && !near(cw, W * k)) out.push(`copy width ${cw} is not ${k} × ${W}`);
      if (ch !== undefined && !near(ch, H * k)) out.push(`copy height ${ch} is not ${k} × ${H}`);
      if (rep.area) {
        // The original's area is the outline's squares; the copy's is k × k times it.
        const pts = outline(rep.shape, W, H);
        const squares =
          Math.abs(
            pts.reduce((s, [x, y], i) => {
              const [x2, y2] = pts[(i + 1) % pts.length]!;
              return s + x * y2 - x2 * y;
            }, 0),
          ) / 2;
        const [a0, a1] = rep.area.map(val);
        if (a0 !== undefined && !near(a0, squares))
          out.push(`original area ${a0}, the outline covers ${squares} squares`);
        if (a0 !== undefined && a1 !== undefined && !near(a1, a0 * k * k))
          out.push(`copy area ${a1} is not ${k} × ${k} × ${a0}`);
      }
      break;
    }
    case 'baseTen':
      for (const id of [...rep.groups, ...(rep.total ? [rep.total] : [])])
        count(id, 'blocks', 1000);
      break;
    case 'unitTiles': {
      count(rep.count, 'units');
      count(rep.total, 'small units');
      const [n, s, t] = [
        val(rep.count),
        typeof rep.size === 'number' ? rep.size : val(rep.size),
        val(rep.total),
      ];
      if (s !== undefined && s < 1) out.push(`unit size ${s} < 1`);
      if (n !== undefined && s !== undefined && t !== undefined && n * s !== t) {
        out.push(`tiles ${n} × ${s} ≠ ${t}`);
      }
      break;
    }
    case 'clock': {
      const h = val(rep.hour);
      const m = val(rep.minute);
      if (h !== undefined && (h < 1 || h > 12 || h !== Math.round(h))) out.push(`clock hour ${h}`);
      if (m !== undefined && (m < 0 || m >= 60)) out.push(`clock minute ${m} out of 0–59`);
      if (m !== undefined && m % rep.minuteStep !== 0) {
        out.push(`clock minute ${m} is not a multiple of the hand's ${rep.minuteStep}-minute snap`);
      }
      break;
    }
    case 'partition': {
      const p = val(rep.parts);
      const k = val(rep.shaded);
      count(rep.shaded, 'shaded parts');
      if (p !== undefined && p < 1) out.push(`partition with ${p} parts`);
      // A set is drawn in rows of up to 8, three rows at most (Partition.tsx).
      if (rep.shape === 'set' && p !== undefined && p > 24) out.push(`a set of ${p} objects`);
      if (p !== undefined && k !== undefined && k > p) out.push(`${k} shaded of ${p} parts`);
      break;
    }
    case 'skipCount': {
      if (typeof rep.count === 'string') count(rep.count, 'skips', 30);
      const s = val(rep.step);
      // Decimal jumps are drawn to the hundredth (SkipCount.tsx).
      if (s !== undefined && s < 0.01) out.push(`skip size ${s} < 0.01 (drawn as 0.01)`);
      // Without a count, the jumps are the total ÷ the jump, the last one part of a jump.
      const t = val(rep.total);
      if (rep.count === undefined && !rep.second && t !== undefined && s !== undefined && s > 0) {
        exact(t / s, 'jumps');
      }
      break;
    }
    case 'pairs':
      count(rep.value, 'objects', rep.max);
      break;
    case 'hops': {
      // The line stretches to fit every stop (Hops.tsx), so a stop past min–max is still drawn;
      // but a story can't have fewer than 0 things part way, and a stop past the lesson's range
      // ("every amount stays within 100") stretches the line.
      const start = val(rep.start);
      const hops = rep.hops.map((h) => val(h.var));
      if (start === undefined || hops.some((x) => x === undefined)) break;
      let at = start;
      rep.hops.forEach((h, i) => {
        const sign = typeof h.sign === 'number' ? h.sign : (val(h.sign) ?? 1) < 0 ? -1 : 1;
        if (typeof h.sign === 'string' && ![1, -1].includes(val(h.sign) ?? 1)) {
          out.push(`hop switch ${h.sign} = ${val(h.sign)} is not 1 or −1`);
        }
        at += sign * hops[i]!;
        if (at < 0) out.push(`hops go below 0 part way (stop ${i + 1} = ${at})`);
        else if (i < rep.hops.length - 1 && (at < rep.min || at > rep.max)) {
          out.push(`hops stop ${i + 1} = ${at} is past the line's ${rep.min}–${rep.max}`);
        }
      });
      const e = val(rep.end);
      if (e !== undefined && e !== at) out.push(`hops land on ${at}, not the end ${e}`);
      break;
    }
    case 'numberBond': {
      // Dots in rows of 5 inside each part's circle: two rows fit (NumberBond.tsx).
      const [a, b] = rep.parts;
      count(a, 'number bond part', 10);
      count(b, 'number bond part', 10);
      count(rep.whole, 'number bond whole');
      const [x, y, w] = [val(a), val(b), val(rep.whole)];
      if (x !== undefined && y !== undefined && w !== undefined && x + y !== w) {
        out.push(`number bond parts ${x} + ${y} don't make the whole ${w}`);
      }
      break;
    }
    case 'patternBlocks': {
      const ids = [rep.trapezoids, rep.rhombuses, rep.triangles];
      for (const id of ids) count(id, 'pattern blocks');
      const [z, r, t] = ids.map(val);
      if (z !== undefined && r !== undefined && t !== undefined && 3 * z + 2 * r + t !== 6) {
        out.push(`pattern blocks cover ${3 * z + 2 * r + t} of the hexagon's 6 triangles`);
      }
      if (z !== undefined && r !== undefined && 3 * z + 2 * r > 6) {
        out.push(`pattern blocks overflow the hexagon (${3 * z + 2 * r} triangles)`);
      }
      break;
    }
    case 'lineUp': {
      // One child per cell, sized for the count's maximum (LineUp.tsx).
      count(rep.count, 'children in line', byId.get(rep.count)?.max ?? 10);
      count(rep.before, 'children in front');
      count(rep.after, 'children behind');
      const [n, p, f, b] = [rep.count, rep.position, rep.before, rep.after].map(val);
      if (n !== undefined && p !== undefined && (p < 1 || p > n)) {
        out.push(`picked child ${p} is not in a line of ${n}`);
      }
      if (p !== undefined && f !== undefined && f !== p - 1) {
        out.push(`child ${p} has ${p - 1} in front, not ${f}`);
      }
      if (n !== undefined && p !== undefined && b !== undefined && b !== n - p) {
        out.push(`child ${p} of ${n} has ${n - p} behind, not ${b}`);
      }
      break;
    }
    case 'equalGroups': {
      // Each group is an 88 px circle; past 16 the dots shrink to fit up to 100 (EqualGroups.tsx).
      count(rep.groups, 'groups', 12);
      count(
        rep.each,
        rep.unit === 10 ? 'ten-rods in a group' : 'dots in a group',
        rep.unit === 10 ? 10 : 100,
      );
      const [g, k, n] = [val(rep.groups), val(rep.each), val(rep.total)];
      // Ten-rods: the total is the tens (g × k) or the number itself (g × k × 10).
      const ok = (x: number) => x === g! * k! || (rep.unit === 10 && x === g! * k! * 10);
      if (g !== undefined && k !== undefined && n !== undefined && !ok(n)) {
        out.push(`${g} groups of ${k} drawn, total shows ${n}`);
      }
      break;
    }
    case 'prism': {
      // Prism.tsx draws at least 3 sides and names 3–6.
      const n = val(rep.sides);
      if (n === undefined) break;
      if (n < 3 || n !== Math.round(n)) out.push(`prism with a ${n}-sided base`);
      const [F, E, V] = [rep.faces, rep.edges, rep.corners].map(val);
      if (F !== undefined && F !== n + 2) out.push(`prism with ${n} sides drawn, ${F} faces shown`);
      if (E !== undefined && E !== 3 * n) out.push(`prism with ${n} sides drawn, ${E} edges shown`);
      if (V !== undefined && V !== 2 * n) {
        out.push(`prism with ${n} sides drawn, ${V} corners shown`);
      }
      break;
    }
    case 'array':
      // Past `max` the array is drawn cut off and the caption says so (DotArray.tsx).
      count(rep.rows, 'array rows');
      count(rep.columns, 'array columns');
      break;
    case 'ruler': {
      for (const id of rep.lengths) {
        const x = val(id);
        if (x !== undefined && x < 0) out.push(`ruler length ${id} negative`);
      }
      // A broken ruler: the object starts at `from` and ends at `to` = from + its length.
      const [a, L, b] = [rep.from, rep.lengths[0], rep.to].map((id) =>
        id === undefined ? undefined : val(id),
      );
      if (rep.from && a !== undefined && a < 0) out.push(`ruler start mark ${a} is before 0`);
      if (a !== undefined && L !== undefined && b !== undefined && a + L !== b) {
        out.push(`ruler object from ${a} of length ${L} doesn't end at ${b}`);
      }
      // Marks per unit read from a value: halves or quarters only.
      if (typeof rep.marks === 'string') {
        const m = val(rep.marks);
        if (m !== undefined && m !== 2 && m !== 4) out.push(`ruler marks per unit ${m}`);
      }
      break;
    }
    case 'coins': {
      for (const c of rep.coins) count(c.var, 'coins', 20);
      // Coins.tsx draws US coins and $1, $5, $10 and $20 bills (bills beside coins).
      for (const c of rep.coins)
        if (![1, 5, 10, 25, 100, 500, 1000, 2000].includes(c.cents))
          out.push(`coins draws ${c.cents}¢, not a US coin or bill`);
      const t = val(rep.total);
      const parts = rep.coins.map((c) => val(c.var));
      if (t !== undefined && parts.every((x) => x !== undefined)) {
        const sum =
          rep.coins.reduce((s, c, i) => s + c.cents * parts[i]!, 0) / (rep.dollars ? 100 : 1);
        if (Math.abs(sum - t) > 1e-9) out.push(`coins add to ${sum}, total shows ${t}`);
      }
      break;
    }
    case 'linePlot': {
      // LinePlot.tsx draws at most 10 X's a column, from a whole-number start.
      for (const p of rep.points) count(p.var, 'X marks', 10);
      if (rep.start) count(rep.start, 'line plot start');
      if (rep.marks !== undefined) {
        if (!rep.start) out.push('line plot marks need a start');
        const d = val(rep.marks);
        if (d !== undefined && ![1, 2, 4, 8].includes(d))
          out.push(`line plot marked every 1/${d}, not halves, quarters or eighths`);
      }
      break;
    }
    case 'cubeTrains':
      for (const id of new Set(rep.rows.flat(2))) count(id, 'cubes', 40);
      break;
    case 'pictureGraph':
      // With a key, a column can end in half a picture (PictureGraph.tsx): count halves.
      for (const c of rep.columns) {
        const x = val(c.var);
        if (rep.key && x !== undefined) {
          if (Math.abs(x * 2 - Math.round(x * 2)) > 1e-9)
            out.push(`pictures ${c.var} = ${x} is not a whole or half picture`);
          if (x < 0 || x > rep.max) out.push(`pictures ${c.var} = ${x} past 0–${rep.max}`);
        } else count(c.var, 'pictures', rep.max);
      }
      break;
    case 'numberLine': {
      // A `from` line runs `span` ticks of `every` from its start (NumberLine.tsx).
      const every = rep.every === undefined ? (rep.tick ?? 1) : val(rep.every);
      const lo = rep.from === undefined ? rep.min : val(rep.from);
      if (every !== undefined && every <= 0) out.push(`number line ticks every ${every}`);
      if (lo === undefined || every === undefined) break;
      const hi = rep.from === undefined ? rep.max : lo + (rep.span ?? 10) * every;
      for (const id of [rep.start, rep.end]) {
        const x = val(id);
        if (x !== undefined && (x < lo - 1e-9 || x > hi + 1e-9)) {
          out.push(`number line point ${id} = ${x} off the line (${lo}–${hi})`);
        }
      }
      break;
    }
    // Grade 3 pictures.
    case 'rounding': {
      const [n, lo, hi, r] = [rep.value, rep.lower, rep.upper, rep.rounded].map(val);
      const to = typeof rep.to === 'number' ? rep.to : val(rep.to);
      for (const [id, x] of [
        [rep.lower, lo],
        [rep.upper, hi],
        [rep.rounded, r],
      ] as const) {
        if (x !== undefined && to !== undefined && Math.abs(x / to - Math.round(x / to)) > 1e-9)
          out.push(`${id} = ${x} is not a ${to}`);
      }
      if (n !== undefined && lo !== undefined && hi !== undefined && !(lo <= n && n <= hi)) {
        out.push(`number ${n} is not between ${lo} and ${hi}`);
      }
      if (r !== undefined && lo !== undefined && hi !== undefined && r !== lo && r !== hi) {
        out.push(`rounded ${r} is neither ${lo} nor ${hi}`);
      }
      break;
    }
    case 'fractionLine': {
      const [a, b] = [val(rep.numerator), val(rep.denominator)];
      count(rep.numerator, 'parts counted');
      if (b !== undefined && b < 1) out.push(`${b} parts in a whole`);
      // The line stretches to the fraction (FractionLine.tsx); more than 24 wholes won't fit.
      // With `from`, it shows only the wholes between the two points.
      const f = rep.from === undefined ? undefined : val(rep.from);
      if (rep.from !== undefined) count(rep.from, 'jump start in parts');
      const span =
        a === undefined || b === undefined || b < 1
          ? 0
          : rep.from === undefined
            ? Math.ceil(a / b)
            : Math.max(Math.ceil(Math.max(a, f ?? a) / b) - Math.floor(Math.min(a, f ?? a) / b), 1);
      if (span > 24 && a !== undefined && b !== undefined) {
        out.push(`${a}/${b} needs ${span} wholes on the line`);
      }
      if (rep.second) {
        count(rep.second.numerator, 'second line parts counted');
        const d = val(rep.second.denominator);
        if (d !== undefined && d < 1) out.push(`${d} parts in a whole on the second line`);
      }
      // Decimal labels read tenths: the parts in a whole must be 10 or 100.
      if (rep.decimal && b !== undefined && b !== 10 && b !== 100) {
        out.push(`decimal line with ${b} parts in a whole`);
      }
      break;
    }
    case 'fractionBars':
      if (rep.wholes !== undefined && (rep.wholes < 1 || rep.wholes > 6)) {
        out.push(`fraction bars laid out ${rep.wholes} wholes wide (1–6)`);
      }
      for (const row of rep.rows) {
        const [a, b] = [val(row.num), val(row.den)];
        count(row.num, 'shaded parts');
        // A row draws as many whole bars as the fraction needs, up to 6 (FractionBars.tsx).
        if (a !== undefined && b !== undefined && b >= 1 && Math.ceil(a / b) > 6) {
          out.push(`${a}/${b} needs ${Math.ceil(a / b)} whole bars; a row holds 6`);
        }
        if (b !== undefined && b < 1) out.push(`${b} parts in a whole bar`);
      }
      break;
    case 'timeline': {
      const [sh, sm, d, eh, em] = [
        rep.startHour,
        rep.startMinute,
        rep.minutes,
        rep.endHour,
        rep.endMinute,
      ].map(val);
      for (const h of [sh, eh]) if (h !== undefined && (h < 1 || h > 12)) out.push(`hour ${h}`);
      for (const m of [sm, em]) if (m !== undefined && (m < 0 || m > 59)) out.push(`minute ${m}`);
      if ([sh, sm, d, eh, em].every((x) => x !== undefined)) {
        const at = (h: number, m: number) => (h % 12) * 60 + m;
        if ((at(sh!, sm!) + d!) % 720 !== at(eh!, em!)) {
          out.push(`${sh}:${sm} + ${d} minutes is not ${eh}:${em}`);
        }
      }
      break;
    }
    case 'scale': {
      const t = val(rep.total);
      if (t !== undefined && t > rep.max) out.push(`total ${t} past the dial's ${rep.max}`);
      if (rep.count) count(rep.count, 'items on the scale', 10);
      break;
    }
    case 'beaker': {
      const t = val(rep.total);
      if (t !== undefined && t > rep.max) out.push(`total ${t} L past the jug's ${rep.max} L`);
      if (rep.mixed) for (const id of [...rep.parts, rep.total]) exact(val(id), `amount ${id}`);
      break;
    }
    case 'thermometers':
      for (const id of rep.items) {
        const x = val(id);
        if (x !== undefined && (x < -40 || x > 250)) out.push(`temperature ${id} = ${x}`);
      }
      break;
    case 'areaModel': {
      if ('factors' in rep) {
        const [a, b, t] = [val(rep.factors[0]), val(rep.factors[1]), val(rep.total)];
        if (a !== undefined && b !== undefined && t !== undefined && Math.abs(a * b - t) > 1e-6)
          out.push(`area model ${a} × ${b} drawn, total shows ${t}`);
        // Up to 4 places on each side fit across a phone (AreaModel.tsx keeps the rest in the last).
        for (const x of [a, b]) {
          if (x !== undefined && placeParts(x, 4).length > 4)
            out.push(`area model factor ${x} has ${placeParts(x, 4).length} parts`);
        }
        break;
      }
      if ('divide' in rep) {
        const d = rep.divide;
        const [n, s, q, r] = [d.dividend, d.divisor, d.quotient, d.remainder].map((id) =>
          id ? val(id) : undefined,
        );
        if (
          n !== undefined &&
          s !== undefined &&
          q !== undefined &&
          Math.abs(s * q + (r ?? 0) - n) > 1e-9
        )
          out.push(`area model ${s} × ${q} + ${r ?? 0} is not ${n}`);
        if (q !== undefined && placeParts(q, 4).length > 4)
          out.push(`area model quotient ${q} has ${placeParts(q, 4).length} parts`);
        break;
      }
      // Every box's product is its top part times its side part, and the boxes add to the total.
      const tops = rep.top.map(val);
      const sides = rep.side.map(val);
      let sum = 0;
      rep.parts.forEach((row, j) =>
        row.forEach((id, i) => {
          const x = val(id);
          if (x === undefined || tops[i] === undefined || sides[j] === undefined) return;
          sum += x;
          if (Math.abs(x - tops[i]! * sides[j]!) > 1e-9) {
            out.push(`area model box ${id} = ${x}, not ${tops[i]} × ${sides[j]}`);
          }
        }),
      );
      const total = val(rep.total);
      const allKnown = [...rep.parts.flat(), ...rep.top, ...rep.side].every(
        (id) => val(id) !== undefined,
      );
      if (total !== undefined && allKnown && Math.abs(sum - total) > 1e-9) {
        out.push(`area model boxes add to ${sum}, total shows ${total}`);
      }
      break;
    }
    case 'angles': {
      // Both parts fit in a turn, and they make the whole.
      const [a, b, w] = [
        val(rep.parts[0]),
        val(rep.parts[1]),
        typeof rep.whole === 'number' ? rep.whole : val(rep.whole),
      ];
      for (const [id, x] of [
        [rep.parts[0], a],
        [rep.parts[1], b],
      ] as const) {
        if (x !== undefined && (x < 0 || x > 360)) out.push(`angle ${id} = ${x} is outside a turn`);
      }
      if (a !== undefined && b !== undefined && w !== undefined && Math.abs(a + b - w) > 1e-9) {
        out.push(`angles ${a} + ${b} drawn, whole shows ${w}`);
      }
      // Crossing lines: a straight line, and each vertical angle equals the part across from it.
      if (rep.cross) {
        if (rep.whole !== 180) out.push(`crossing lines need a straight whole, not ${rep.whole}`);
        for (const [v, p] of [
          [rep.cross.first, a],
          [rep.cross.second, b],
        ] as const) {
          const x = v ? val(v) : undefined;
          if (x !== undefined && p !== undefined && Math.abs(x - p) > 1e-9)
            out.push(`vertical angle ${v} = ${x}, across from ${p}`);
        }
      }
      break;
    }
    case 'doubleNumberLine': {
      // The bottom reading is the top reading times the smaller units per bigger unit.
      const [t, b] = [val(rep.top), val(rep.bottom)];
      // The top reading can be a decimal (2.5 m): it sits between two ticks.
      if (t !== undefined && t < 0) out.push(`top units ${rep.top} below 0 (${t})`);
      // With both readings known the picture spaces the lines from them, so the rate may be
      // shown in other units (mph over km and hours); the readings must agree in sign.
      if (t !== undefined && b !== undefined && t > 0 && b < 0)
        out.push(`double number line bottom ${b} below 0`);
      break;
    }
    case 'coordinatePlane': {
      // Plotting draws its path from 0 across then up, in the first quadrant only.
      if (rep.plot && rep.quadrants !== 1) out.push('plotting a point is in the first quadrant');
      if (rep.plot && rep.second) out.push('plotting places one point, not two');
      if (rep.quadrants === 1) {
        for (const id of [rep.x, rep.y, rep.second?.x, rep.second?.y]) {
          const x = id === undefined ? undefined : val(id);
          if (x !== undefined && x < 0) out.push(`${id} = ${x} is off the first quadrant`);
        }
      }
      // Legs: the drawn distance is the hypotenuse of the legs across and up.
      if (rep.legs && (!rep.segment || !rep.second))
        out.push('legs need a segment to a second point');
      if (rep.legs && rep.second && rep.distance) {
        const [x1, y1, x2, y2, d] = [rep.x, rep.y, rep.second.x, rep.second.y, rep.distance].map(
          val,
        );
        if ([x1, y1, x2, y2, d].every((v) => v !== undefined)) {
          const h = Math.hypot(x2! - x1!, y2! - y1!);
          if (Math.abs(h - d!) > 1e-6 * (1 + h))
            out.push(`distance ${d} drawn, the legs make ${h}`);
        }
      }
      if (rep.second && rep.slope) {
        const [x1, y1, x2, y2, m] = [rep.x, rep.y, rep.second.x, rep.second.y, rep.slope].map(val);
        if ([x1, y1, x2, y2, m].every((v) => v !== undefined) && x2! !== x1!) {
          const rise = (y2! - y1!) / (x2! - x1!);
          if (Math.abs(rise - m!) > 1e-6) out.push(`slope ${m} drawn, rise over run is ${rise}`);
        }
      }
      // Labelled legs (Grade 8 slope) must be the points' own rise and run.
      if ((rep.rise || rep.run) && !rep.second) out.push('rise and run need a second point');
      if (rep.second) {
        const [x1, y1, x2, y2] = [rep.x, rep.y, rep.second.x, rep.second.y].map(val);
        const [rise, run] = [rep.rise, rep.run].map((id) => (id ? val(id) : undefined));
        if (
          y1 !== undefined &&
          y2 !== undefined &&
          rise !== undefined &&
          Math.abs(y2 - y1 - rise) > 1e-9
        )
          out.push(`rise ${rise} labelled, the points rise ${y2 - y1}`);
        if (
          x1 !== undefined &&
          x2 !== undefined &&
          run !== undefined &&
          Math.abs(x2 - x1 - run) > 1e-9
        )
          out.push(`run ${run} labelled, the points run ${x2 - x1}`);
      }
      break;
    }
    case 'boxPlot': {
      const five = [rep.min, rep.q1, rep.median, rep.q3, rep.max].map(val);
      // With `data`, the plot's least, median and greatest are the first n values' own.
      const sorted = firstValues(rep.data, rep.count);
      if (sorted) {
        const own = [sorted[0]!, medianOf(sorted), sorted[sorted.length - 1]!];
        [five[0], five[2], five[4]].forEach((x, i) => {
          if (x !== undefined && Math.abs(x - own[i]!) > 1e-9)
            out.push(`box plot of ${sorted.join(', ')} draws ${x} for ${own[i]}`);
        });
      }
      for (let i = 1; i < five.length; i++) {
        const a = five[i - 1];
        const b = five[i];
        if (a !== undefined && b !== undefined && b < a - 1e-9)
          out.push(`box plot out of order: ${a} then ${b}`);
      }
      break;
    }
    case 'pieChart': {
      const parts = rep.parts.map(val);
      const whole = rep.total ? val(rep.total) : 100;
      for (const [i, x] of parts.entries()) {
        if (x !== undefined && x < 0) out.push(`pie part ${rep.parts[i]} is negative (${x})`);
      }
      if (whole !== undefined && parts.every((x) => x !== undefined)) {
        const sum = parts.reduce((a, b) => a! + b!, 0)!;
        if (sum > whole + 1e-6) out.push(`pie parts add to ${sum}, more than the whole ${whole}`);
      }
      break;
    }
    case 'fractionArea': {
      for (const f of [rep.first, rep.second, rep.product].filter((x) => !!x)) {
        const n = val(f!.num);
        const d = val(f!.den);
        count(f!.num, 'top');
        if (d !== undefined && d < 1) out.push(`bottom ${f!.den} = ${d}`);
        if (n !== undefined && d !== undefined && n > d)
          out.push(`${n}/${d} is more than one whole`);
      }
      break;
    }
    case 'unitCubes': {
      const [l, w, h, v] = [rep.length, rep.width, rep.height, rep.volume].map(val);
      // Cubes of edge 1/k: each side holds a whole number of them.
      const k = rep.cube ?? 1;
      for (const [id, what] of [
        [rep.length, 'cubes across'],
        [rep.width, 'cubes back'],
        [rep.height, 'layers'],
      ] as const) {
        const x = val(id);
        if (x === undefined) continue;
        if (x < 0) out.push(`${what} ${id} is negative (${x})`);
        if (Math.abs(x * k - Math.round(x * k)) > 1e-9)
          out.push(`${what} ${id} is not whole cubes (${x})`);
        // With `scale` a bigger box is drawn to scale (ScaledBox), not in cubes.
        if (x * k > rep.max && !(rep.scale && k === 1 && !rep.second))
          out.push(`${what} ${id} = ${x} exceeds the drawing's ${rep.max}`);
        if (rep.scale && x <= 0) out.push(`${what} ${id} = ${x}: a box to scale needs a size`);
      }
      if ([l, w, h, v].every((x) => x !== undefined) && Math.abs(l! * w! * h! - v!) > 1e-9)
        out.push(`${l} × ${w} × ${h} cubes drawn, volume shows ${v}`);
      if (rep.second) {
        const b = rep.second;
        const [l2, w2, h2, v2] = [b.length, b.width, b.height, b.volume].map(val);
        if (
          [l2, w2, h2, v2].every((x) => x !== undefined) &&
          Math.abs(l2! * w2! * h2! - v2!) > 1e-9
        )
          out.push(`second box ${l2} × ${w2} × ${h2} drawn, volume shows ${v2}`);
        const t = rep.total ? val(rep.total) : undefined;
        if (t !== undefined && v !== undefined && v2 !== undefined && Math.abs(v + v2 - t) > 1e-9)
          out.push(`boxes ${v} + ${v2} drawn, total shows ${t}`);
        if (l !== undefined && l2 !== undefined && l + l2 > rep.max)
          out.push(`two boxes ${l + l2} cubes across, past ${rep.max}`);
      }
      break;
    }
    case 'placeValueChart': {
      const x = val(rep.value);
      if (x !== undefined && x < 0) out.push(`place-value chart of a negative number ${x}`);
      // Seven whole places (millions) are drawn (PlaceValueChart.tsx).
      for (const id of [rep.value, rep.from, rep.compare]) {
        const n = id ? val(id) : undefined;
        if (n !== undefined && n >= 1e7) out.push(`place-value chart of ${n}: past the millions`);
      }
      const lit = rep.highlight ? val(rep.highlight) : undefined;
      if (lit !== undefined && Math.abs(Math.log10(lit) - Math.round(Math.log10(lit))) > 1e-9)
        out.push(`highlighted place ${lit} is not a place value`);
      const before = rep.from ? val(rep.from) : undefined;
      if (x !== undefined && before !== undefined && before > 0) {
        const k = Math.log10(x / before);
        if (Math.abs(k - Math.round(k)) > 1e-9)
          out.push(`${before} to ${x} is not × or ÷ a power of 10`);
      }
      break;
    }
    case 'factorTree':
      count(rep.value, 'number');
      break;
    case 'tape': {
      if ('equation' in rep) {
        // p boxes of x, then q (TapeEquation.tsx): whole groups, positive boxes, the total.
        const { times, unknown, plus, total, grouped } = rep.equation;
        count(times, 'tape boxes', 12);
        const [p, x, q, r] = [times, unknown, plus, total].map(val);
        if (x !== undefined && q !== undefined && (x <= 0 || (grouped && x + q <= 0)))
          out.push(`tape box ${grouped ? x + q : x} is not positive`);
        if (p === undefined || x === undefined || q === undefined || r === undefined) break;
        const made = grouped ? p * (x + q) : p * x + q;
        if (Math.abs(made - r) > 1e-6 * Math.max(1, Math.abs(r)))
          out.push(`tape: ${p} boxes of ${x} and ${q} make ${made}, not ${r}`);
        break;
      }
      if ('mixed' in rep && rep.mixed) {
        const ids = 'compare' in rep ? [...rep.compare, rep.difference] : rep.parts;
        for (const id of ids) exact(val(id), `tape value ${id}`);
      }
      if ('ratio' in rep) {
        // Ratio boxes: whole counts, each bar's amount its boxes times the unit.
        count(rep.ratio[0], 'ratio boxes', 40);
        count(rep.ratio[1], 'ratio boxes', 40);
        const [p, q, u] = [val(rep.ratio[0]), val(rep.ratio[1]), val(rep.unit)];
        for (const [n, id] of [
          [p, rep.amounts?.[0]],
          [q, rep.amounts?.[1]],
        ] as const) {
          const x = id ? val(id) : undefined;
          if (
            n !== undefined &&
            u !== undefined &&
            x !== undefined &&
            Math.abs(n * u - x) > 1e-6 * Math.max(1, x)
          )
            out.push(`tape: ${n} boxes of ${u} shows ${x}`);
        }
        break;
      }
      if (!('compare' in rep) || !rep.times) break;
      const [a, b, k] = [val(rep.compare[0]), val(rep.compare[1]), val(rep.times)];
      if (
        a !== undefined &&
        b !== undefined &&
        k !== undefined &&
        Math.abs(Math.max(a, b) - k * Math.min(a, b)) > 1e-9
      )
        out.push(`tape: ${Math.max(a, b)} is not ${k} copies of ${Math.min(a, b)}`);
      break;
    }
    case 'grid100': {
      // A percent like 38.7 shades the nearest square (Grid100.tsx rounds): check the range.
      const shaded = val(rep.percent);
      if (shaded !== undefined && (shaded < 0 || shaded > 100)) {
        out.push(`squares shaded ${rep.percent} out of 0–100 (${shaded})`);
      }
      if (rep.second) count(rep.second, 'squares shaded', 100);
      // Whole grids shrink the row: up to 3 fit beside the tapped grid (Grid100.tsx).
      if (rep.wholes) count(rep.wholes, 'whole grids', 3);
      break;
    }
    case 'factorPairs': {
      // The 1-row rectangle is drawn to the width: past 100 squares a square is under 3 px.
      count(rep.value, 'number', 100);
      const [n, a, b] = [rep.value, rep.first, rep.second].map((id) => (id ? val(id) : undefined));
      if (n !== undefined && n < 1) out.push(`factor pairs of ${n}`);
      if (n !== undefined && a !== undefined && b !== undefined && a * b !== n)
        out.push(`pair ${a} × ${b} is not ${n}`);
      break;
    }
    case 'shareWholes':
      // Bars are drawn for 1–12 wholes, cut into 1–12 parts (ShareWholes.tsx).
      count(rep.wholes, 'wholes', 12);
      count(rep.people, 'people', 12);
      break;
    case 'protractor': {
      const a = val(rep.angle);
      if (a !== undefined && (a < 0 || a > 180)) out.push(`protractor angle ${a} is off the scale`);
      const o = rep.other ? val(rep.other) : undefined;
      if (a !== undefined && o !== undefined && Math.abs(a + o - 180) > 1e-9)
        out.push(`protractor scales ${a} and ${o} don't add to 180`);
      if (rep.arms) {
        const [f, s] = [rep.arms.first, rep.arms.second].map(val);
        for (const x of [f, s])
          if (x !== undefined && (x < 0 || x > 180))
            out.push(`protractor arm at ${x} is off the scale`);
        if (
          f !== undefined &&
          s !== undefined &&
          a !== undefined &&
          Math.abs(Math.abs(s - f) - a) > 1e-9
        )
          out.push(`protractor arms at ${f} and ${s} show the angle ${a}`);
      }
      break;
    }
    case 'wave': {
      if (typeof rep.extent === 'string') count(rep.extent, 'waves drawn', 12);
      const [A, L] = [rep.amplitude ? val(rep.amplitude) : undefined, val(rep.wavelength)];
      if (A !== undefined && A < 0) out.push(`negative amplitude ${A}`);
      if (L !== undefined && L <= 0) out.push(`wavelength ${L} is not positive`);
      break;
    }
    case 'punnettSquare': {
      const [p, q, d] = [rep.first, rep.second, rep.dominant].map(val);
      for (const [id, x] of [
        [rep.first, p],
        [rep.second, q],
      ] as const) {
        if (x !== undefined && (x < 0 || x > 2 || !Number.isInteger(x)))
          out.push(`parent ${id} has ${x} dominant alleles`);
      }
      if (p !== undefined && q !== undefined && d !== undefined && 4 - (2 - p) * (2 - q) !== d)
        out.push(`Punnett square shows ${4 - (2 - p) * (2 - q)} of 4 with the trait, not ${d}`);
      break;
    }
    case 'integerLine': {
      const [a, o, abs, b, d] = [rep.value, rep.opposite, rep.absolute, rep.second, rep.change].map(
        (id) => (id ? val(id) : undefined),
      );
      if (a !== undefined && o !== undefined && Math.abs(o + a) > 1e-9)
        out.push(`opposite of ${a} shows ${o}`);
      if (a !== undefined && abs !== undefined && Math.abs(abs - Math.abs(a)) > 1e-9)
        out.push(`absolute value of ${a} shows ${abs}`);
      if (
        a !== undefined &&
        b !== undefined &&
        d !== undefined &&
        Math.abs(Math.abs(b - a) - d) > 1e-9
      )
        out.push(`jump from ${a} to ${b} shows ${d}`);
      if (rep.inequality) {
        const { sign } = rep.inequality;
        if (!['<', '≤', '>', '≥'].includes(sign)) {
          const s = val(sign);
          if (s !== undefined && ![1, 2, 3, 4].includes(s))
            out.push(`inequality sign ${sign} = ${s} is not 1–4 (<, ≤, >, ≥)`);
        }
        if (rep.vertical) out.push('inequality lines are drawn across, not vertical');
        if (rep.inequality.twoStep) {
          // The bound drawn is the written inequality solved: (total − plus) ÷ times.
          const { times, plus, total } = rep.inequality.twoStep;
          const [p, q, r] = [times, plus, total].map(val);
          if (p === 0) out.push('two-step inequality with 0 blocks of x');
          if (a !== undefined && p && q !== undefined && r !== undefined) {
            const bound = (r - q) / p;
            if (Math.abs(bound - a) > 1e-6 * Math.max(1, Math.abs(a)))
              out.push(`two-step inequality solves to ${bound}, the line shows ${a}`);
          }
        }
      }
      if (rep.jump) {
        const [by, r] = [rep.jump.by, rep.jump.result].map(val);
        if (a !== undefined && by !== undefined && r !== undefined) {
          const lands = rep.jump.op === '−' ? a - by : a + by;
          if (Math.abs(lands - r) > 1e-9 * Math.max(1, Math.abs(r)))
            out.push(
              `jump from ${a} by ${rep.jump.op ?? '+'}${by} lands on ${lands}, result shows ${r}`,
            );
        }
        if (rep.vertical) out.push('signed jumps are drawn across, not vertical');
        if (rep.inequality) out.push('a line shows a jump or an inequality, not both');
      }
      break;
    }
    case 'percentBar': {
      const [p, part, whole] = [rep.percent, rep.part, rep.whole].map(val);
      if (p !== undefined && p < 0 && !rep.change) out.push(`percent ${p} below 0`);
      if (
        p !== undefined &&
        part !== undefined &&
        whole !== undefined &&
        Math.abs((p / 100) * whole - part) > 1e-6 * Math.max(1, part)
      )
        out.push(`bar shades ${p}% of ${whole}, part shows ${part}`);
      if (rep.change) {
        const t = val(rep.change.total);
        const up = rep.change.direction;
        if (whole !== undefined && part !== undefined && t !== undefined) {
          if (Math.abs(Math.abs(t - whole) - Math.abs(part)) > 1e-6 * Math.max(1, whole))
            out.push(`new amount ${t} is not ${whole} changed by ${part}`);
          if ((up === 'up' && t < whole) || (up === 'down' && t > whole))
            out.push(`new amount ${t} goes the wrong way from ${whole} (${up})`);
        }
        if (up === 'down' && p !== undefined && Math.abs(p) > 100)
          out.push(`a ${Math.abs(p)}% decrease takes more than the whole`);
      }
      break;
    }
    case 'ratioTable': {
      const [p, q, k, x, y] = [rep.first, rep.second, rep.times, ...rep.amounts].map(val);
      if (
        p !== undefined &&
        k !== undefined &&
        x !== undefined &&
        Math.abs(p * k - x) > 1e-6 * Math.max(1, x)
      )
        out.push(`row ${k} × ${p} shows ${x}`);
      if (
        q !== undefined &&
        k !== undefined &&
        y !== undefined &&
        Math.abs(q * k - y) > 1e-6 * Math.max(1, y)
      )
        out.push(`row ${k} × ${q} shows ${y}`);
      break;
    }
    case 'zeroPairs': {
      const [a, b, r] = [rep.first, rep.second, rep.result].map(val);
      for (const [id, x] of [
        [rep.first, a],
        [rep.second, b],
      ] as const) {
        if (x === undefined) continue;
        if (!Number.isInteger(x)) out.push(`counters for ${id} = ${x}, not a whole number`);
        if (Math.abs(x) > 20) out.push(`${Math.abs(x)} counters for ${id} (20 fit)`);
      }
      if (a !== undefined && b !== undefined && r !== undefined) {
        const want = rep.op === '−' ? a - b : a + b;
        if (Math.abs(want - r) > 1e-9) out.push(`counters leave ${want}, result shows ${r}`);
      }
      break;
    }
    case 'signTable': {
      const [a, b, r] = [rep.first, rep.second, rep.result].map(val);
      if (a !== undefined && b !== undefined && r !== undefined) {
        const want = rep.op === '÷' ? (b === 0 ? undefined : a / b) : a * b;
        if (want === undefined) out.push('sign table divides by 0');
        else if (Math.abs(want - r) > 1e-6 * Math.max(1, Math.abs(r)))
          out.push(`${a} ${rep.op ?? '×'} ${b} is ${want}, result shows ${r}`);
        // The outlined cell's sign is the answer's sign.
        if (a !== 0 && b !== 0 && r !== 0 && a * b > 0 !== r > 0)
          out.push(`sign table says ${a * b > 0 ? '+' : '−'}, result ${r}`);
      }
      break;
    }
    case 'fractionFit': {
      for (const id of [rep.dividend.num, rep.dividend.den, rep.divisor.num, rep.divisor.den])
        count(id, 'fraction part');
      const [a, b, p, q] = [
        rep.dividend.num,
        rep.dividend.den,
        rep.divisor.num,
        rep.divisor.den,
      ].map(val);
      if (b === 0 || q === 0) out.push('a fraction with denominator 0');
      // Past 40 groups FractionFit draws one labelled bar; past 144 the lesson stops.
      if (a !== undefined && b && p !== undefined && q && p > 0 && a / b / (p / q) > 144)
        out.push(`more than 144 groups (${a / b / (p / q)})`);
      break;
    }
    case 'venn':
      count(rep.first, 'Venn number', 1000);
      count(rep.second, 'Venn number', 1000);
      break;
    case 'baseHeight': {
      const [b, h, t, A] = [rep.base, rep.height, rep.top, rep.area].map((id) =>
        id ? val(id) : undefined,
      );
      const area =
        b === undefined || h === undefined
          ? undefined
          : rep.shape === 'parallelogram'
            ? b * h
            : rep.shape === 'triangle'
              ? 0.5 * b * h
              : rep.shape === 'trapezoid'
                ? t === undefined
                  ? undefined
                  : 0.5 * (b + t) * h
                : t === undefined
                  ? undefined
                  : b * h + 0.5 * b * t;
      if (area !== undefined && A !== undefined && Math.abs(area - A) > 1e-6 * Math.max(1, A))
        out.push(`${rep.shape} ${b} by ${h} has area ${area}, shows ${A}`);
      break;
    }
    case 'net': {
      const [L, W, H, sl, T] = [rep.length, rep.width, rep.height, rep.slant, rep.total].map(
        (id) => (id ? val(id) : undefined),
      );
      const w = W ?? L;
      const h = H ?? L;
      if (rep.solid === 'triangularPrism') {
        if (W === undefined || H === undefined || sl === undefined || L === undefined) break;
        // The third side closes the triangle (within 2%, for a side rounded to a whole number).
        const side = rep.triangle === 'isosceles' ? Math.hypot(W / 2, H) : Math.hypot(W, H);
        if (Math.abs(side - sl) > 0.02 * side)
          out.push(`triangle ${W} by ${H} has a side of ${side}, shows ${sl}`);
        const sides = rep.triangle === 'isosceles' ? W + 2 * sl : W + H + sl;
        const all = W * H + L * sides;
        if (T !== undefined && Math.abs(all - T) > 1e-6 * Math.max(1, T))
          out.push(`net faces add to ${all}, total shows ${T}`);
        break;
      }
      const total =
        L === undefined
          ? undefined
          : rep.solid === 'squarePyramid'
            ? sl === undefined
              ? undefined
              : L * L + 2 * L * sl
            : w === undefined || h === undefined
              ? undefined
              : 2 * (L * w + L * h + w * h);
      if (total !== undefined && T !== undefined && Math.abs(total - T) > 1e-6 * Math.max(1, T))
        out.push(`net faces add to ${total}, total shows ${T}`);
      break;
    }
    case 'crossSection': {
      const [l, w0, h, at, A, V] = [
        rep.length,
        rep.width,
        rep.height,
        rep.at,
        rep.area,
        rep.volume,
      ].map((id) => {
        // In formula units: the lengths, the area and the volume agree whatever is shown.
        const x = id ? val(id) : undefined;
        return x === undefined ? undefined : x * (byId.get(id!)?.unitFactor ?? 1);
      });
      const w = rep.width ? w0 : l;
      if (l === undefined || w === undefined || h === undefined) break;
      if (l <= 0 || w <= 0 || h <= 0) {
        out.push(`solid ${l} by ${w} by ${h} has a side of 0 or less`);
        break;
      }
      const cut = rep.cut ?? 'base';
      const reach = reachOf(rep.solid, cut, w, h);
      // The picture parks the plane at the middle while `at` is "?".
      if (rep.at && at === undefined) break;
      const where = at ?? reach / 2;
      if (cut !== 'diagonal' && (where < 0 || where > reach))
        out.push(`plane at ${where} is off the solid (0 to ${reach})`);
      const section = sectionOf(
        solidOf(rep.solid, l, w, h, rep.triangle === 'isosceles'),
        planeOf(rep.solid, cut, where, l, w),
      );
      const area = areaOf(section);
      // Shown values are rounded to 9 places: a length of 0.000001 km is only roughly
      // itself, so the check leaves out lengths too small to read and allows the rounding.
      const readable = [rep.length, rep.width, rep.height]
        .filter((id): id is string => !!id)
        .every((id) => (val(id) ?? 1) >= 1e-3);
      const off = (x: number, y: number, id: string) =>
        readable && Math.abs(x - y) > 1e-4 * Math.abs(y) + 1e-9 * (byId.get(id)?.unitFactor ?? 1);
      if (A !== undefined && off(area, A, rep.area!))
        out.push(`cut drawn with area ${area}, shows ${A}`);
      const vol = volumeOf(rep.solid, l, w, h);
      if (V !== undefined && off(vol, V, rep.volume!))
        out.push(`solid drawn with volume ${vol}, shows ${V}`);
      break;
    }
    case 'treeDiagram': {
      // Up to 6 outcomes a stage (TREE_MAX in TreeDiagram.tsx).
      count(rep.first, 'first-stage outcomes', 6);
      count(rep.second, 'second-stage outcomes', 6);
      const [a, b, n, P] = [rep.first, rep.second, rep.total, rep.chance].map((id) =>
        id ? val(id) : undefined,
      );
      for (const x of [a, b]) if (x !== undefined && x < 1) out.push(`a stage with ${x} outcomes`);
      if (a !== undefined && b !== undefined && n !== undefined && a * b !== n)
        out.push(`${a} × ${b} branches drawn, total shows ${n}`);
      if (a !== undefined && b !== undefined && P !== undefined && Math.abs(1 / (a * b) - P) > 1e-6)
        out.push(`one of ${a * b} paths drawn, chance shows ${P}`);
      if (rep.path && a !== undefined && b !== undefined && (rep.path[0] >= a || rep.path[1] >= b))
        out.push(`path ${rep.path.join(', ')} is not a branch of ${a} × ${b}`);
      break;
    }
    case 'diceGrid': {
      const t = val(rep.target);
      if (t === undefined) break;
      const n = diceCount(rep.event ?? 'sum', rep.compare ?? '=', t);
      const [k, P] = [rep.count, rep.chance].map((id) => (id ? val(id) : undefined));
      if (k !== undefined && k !== n) out.push(`${n} pairs shaded, count shows ${k}`);
      if (P !== undefined && Math.abs(n / 36 - P) > 1e-6)
        out.push(`${n} of 36 pairs shaded, chance shows ${P}`);
      break;
    }
    case 'spinner':
    case 'marbles': {
      // Equal sectors (SPINNER_MAX in Spinner.tsx) or marbles (MARBLES_MAX in Marbles.tsx),
      // one color per outcome.
      const cap = rep.kind === 'spinner' ? 24 : 40;
      const what = rep.kind === 'spinner' ? 'sectors' : 'marbles';
      rep.parts.forEach((id) => count(id, what, cap));
      const xs = rep.parts.map(val);
      if (rep.colors && rep.colors.length < rep.parts.length)
        out.push('a spinner outcome has no color');
      if (rep.names && rep.names.length < rep.parts.length)
        out.push('a spinner outcome has no name');
      if ((rep.pick ?? 0) >= rep.parts.length)
        out.push(`spinner pick ${rep.pick} is not an outcome`);
      if (xs.some((x) => x === undefined)) break;
      const total = (xs as number[]).reduce((s, x) => s + x, 0);
      if (total > cap) out.push(`${total} ${what}, more than the picture's ${cap}`);
      const T = rep.total ? val(rep.total) : undefined;
      if (T !== undefined && T !== total) out.push(`${what} add to ${total}, total shows ${T}`);
      const P = rep.chance ? val(rep.chance) : undefined;
      if (P !== undefined && total > 0 && Math.abs(xs[rep.pick ?? 0]! / total - P) > 1e-6)
        out.push(`${xs[rep.pick ?? 0]} of ${total} ${what} drawn, chance shows ${P}`);
      break;
    }
    case 'sample': {
      // One dot per member (SAMPLE_MAX in Sample.tsx); the sample fits in the population.
      count(rep.population, 'population', 400);
      count(rep.size, 'sample');
      count(rep.found, 'found in the sample');
      if (rep.trait) count(rep.trait, 'population with the trait');
      const [N, n, k, T, E] = [rep.population, rep.size, rep.found, rep.trait, rep.estimate].map(
        (id) => (id ? val(id) : undefined),
      );
      if (N !== undefined && n !== undefined && n > N) out.push(`sample of ${n} from ${N}`);
      if (n !== undefined && k !== undefined && k > n) out.push(`${k} found in a sample of ${n}`);
      if (T !== undefined && N !== undefined && T > N) out.push(`${T} with the trait of ${N}`);
      if (T !== undefined && k !== undefined && k > T)
        out.push(`${k} found in the sample, only ${T} in the population`);
      if (T !== undefined && N !== undefined && n !== undefined && k !== undefined && n - k > N - T)
        out.push(`${n - k} without the trait in the sample, only ${N - T} in the population`);
      // The estimate scales the sample up; a lesson may round it to a whole number.
      if (N !== undefined && n !== undefined && k !== undefined && E !== undefined && n > 0) {
        const e = (N * k) / n;
        if (Math.abs(e - E) > 0.5 + 1e-9)
          out.push(`estimate ${k} ÷ ${n} × ${N} = ${e}, shows ${E}`);
      }
      break;
    }
    case 'dotPlot': {
      const sorted = firstValues(rep.data, rep.count);
      const md = rep.median ? val(rep.median) : undefined;
      if (sorted && md !== undefined && Math.abs(medianOf(sorted) - md) > 1e-9)
        out.push(`median of ${sorted.join(', ')} is ${medianOf(sorted)}, shows ${md}`);
      const data = rep.data.map(val).filter((x): x is number => x !== undefined);
      const m = rep.mean ? val(rep.mean) : undefined;
      if (m !== undefined && data.length === rep.data.length) {
        const mean = data.reduce((s, x) => s + x, 0) / data.length;
        if (Math.abs(mean - m) > 1e-6 * Math.max(1, Math.abs(m)))
          out.push(`dots balance at ${mean}, mean shows ${m}`);
      }
      if (rep.second) {
        // The second sample's center, and the gap between the two centers.
        const xs = rep.second.data.map(val);
        const known = xs.every((x) => x !== undefined) ? (xs as number[]) : undefined;
        const m2 = rep.second.mean ? val(rep.second.mean) : undefined;
        const md2 = rep.second.median ? val(rep.second.median) : undefined;
        if (known && m2 !== undefined) {
          const mean2 = known.reduce((s, x) => s + x, 0) / known.length;
          if (Math.abs(mean2 - m2) > 1e-6 * Math.max(1, Math.abs(m2)))
            out.push(`second sample balances at ${mean2}, mean shows ${m2}`);
        }
        if (known && md2 !== undefined) {
          const md = medianOf([...known].sort((a, b) => a - b));
          if (Math.abs(md - md2) > 1e-9) out.push(`second sample's median is ${md}, shows ${md2}`);
        }
        const c1 = rep.mean ? m : rep.median ? val(rep.median) : undefined;
        const c2 = rep.second.mean ? m2 : md2;
        const d = rep.difference ? val(rep.difference) : undefined;
        if (
          c1 !== undefined &&
          c2 !== undefined &&
          d !== undefined &&
          Math.abs(Math.abs(c1 - c2) - d) > 1e-6
        )
          out.push(`centers ${c1} and ${c2} drawn, difference shows ${d}`);
      }
      break;
    }
    case 'fieldOfView': {
      count(rep.across, 'cells across');
      const [f, n, s] = [rep.field, rep.across, rep.size].map((id) => (id ? val(id) : undefined));
      if (
        f !== undefined &&
        n !== undefined &&
        s !== undefined &&
        Math.abs(n * s - f) > 1e-6 * Math.max(1, f)
      )
        out.push(`${n} cells of ${s} don't fill ${f}`);
      break;
    }
    case 'gradCylinder': {
      const [a, b, v] = [rep.before, rep.after, rep.volume].map((id) => (id ? val(id) : undefined));
      if (a !== undefined && a < 0) out.push(`level before ${a} below 0`);
      if (a !== undefined && b !== undefined && b < a)
        out.push(`level after ${b} below before ${a}`);
      if (
        a !== undefined &&
        b !== undefined &&
        v !== undefined &&
        Math.abs(b - a - v) > 1e-6 * Math.max(1, v)
      )
        out.push(`rise ${b - a} shows volume ${v}`);
      break;
    }
    case 'grassSlope': {
      const [a, b, d] = [rep.bare, rep.grass, rep.difference].map((id) =>
        id ? val(id) : undefined,
      );
      // The jars' scale grows to fit (GrassSlope.tsx); soil can't be less than none.
      for (const x of [a, b])
        if (x !== undefined && x < 0) out.push(`washed-off soil ${x} below 0`);
      if (
        a !== undefined &&
        b !== undefined &&
        d !== undefined &&
        Math.abs(Math.abs(a - b) - d) > 1e-9
      )
        out.push(`jars ${a} and ${b} don't differ by ${d}`);
      break;
    }
    case 'flashlights': {
      const [n, k, f] = [rep.near, rep.times, rep.far].map((id) => (id ? val(id) : undefined));
      // Up to 10 × 10 squares fit the face-on grid.
      count(rep.times, 'times as far', 10);
      if (k !== undefined && k < 1) out.push(`times as far ${k} is under 1`);
      if (n !== undefined && k !== undefined && f !== undefined && Math.abs(n * k - f) > 1e-6 * f)
        out.push(`${n} × ${k} drawn, farther flashlight shows ${f}`);
      break;
    }
    case 'leafCount': {
      count(rep.items[0], 'leaves', 40);
      count(rep.items[1], 'leaves', 40);
      const [a, b, d] = [...rep.items, rep.difference].map((id) => (id ? val(id) : undefined));
      if (a !== undefined && b !== undefined && d !== undefined && Math.abs(a - b) !== d)
        out.push(`plants with ${a} and ${b} leaves don't differ by ${d}`);
      break;
    }
    case 'factorRows': {
      const [p, q, r] = [rep.first, rep.second, rep.result].map(val);
      // Each row wraps at 12 tiles; past two lines a row is too long to count by eye.
      count(rep.first, 'factors', 12);
      count(rep.second, 'factors', 12);
      if (p !== undefined && q !== undefined) {
        const want = rep.rule === 'product' ? p + q : rep.rule === 'quotient' ? p - q : p * q;
        if (r !== undefined && r !== want) out.push(`${rep.rule} of ${p} and ${q} shows ${r}`);
        if (rep.rule === 'power' && p * q > 24) out.push(`${q} rows of ${p} is past 24 factors`);
      }
      break;
    }
    case 'equationBalance': {
      // Whole x-blocks and counters (balloons when negative), as many as a pan holds.
      const [k1, n1, k2, n2] = [...rep.left, ...rep.right].map(val);
      for (const k of [k1, k2])
        if (k !== undefined && (k !== Math.round(k) || Math.abs(k) > 10))
          out.push(`${k} x-blocks on a pan (whole, up to 10)`);
      for (const n of [n1, n2])
        if (n !== undefined && (n !== Math.round(n) || Math.abs(n) > 15))
          out.push(`${n} unit counters on a pan (whole, up to 15)`);
      break;
    }
    case 'powerScale': {
      const [x, a, e] = [rep.number, rep.mantissa, rep.exponent].map(val);
      // (The sampled values are rounded to 9 decimals, so a tiny number can read as 0.)
      if (x !== undefined && x < 0) out.push(`number ${x} has no place on a powers-of-ten ruler`);
      if (a !== undefined && (a < 1 || a >= 10)) out.push(`mantissa ${a} is not from 1 up to 10`);
      if (e !== undefined && e !== Math.round(e)) out.push(`exponent ${e} is not whole`);
      if (
        x !== undefined &&
        a !== undefined &&
        e !== undefined &&
        Math.abs(a * 10 ** e - x) > Math.max(1e-9, 1e-9 * x)
      )
        out.push(`${a} × 10^${e} drawn, the number shows ${x}`);
      break;
    }
    case 'rootSquare': {
      const [a, sd] = [val(rep.area), val(rep.side)];
      if (a !== undefined && a < 0) out.push(`square of area ${a}`);
      // The grid grows to the side; past 12 the unit squares are too small to read.
      if (a !== undefined && a > 144) out.push(`square of area ${a} is past a 12 × 12 grid`);
      if (a !== undefined && a >= 0 && sd !== undefined && Math.abs(sd - Math.sqrt(a)) > 0.006)
        out.push(`side ${sd} squared is ${sd * sd}, the area shows ${a}`);
      for (const m of rep.marks ?? []) if (m.at < 0) out.push(`mark ${m.label} below 0`);
      break;
    }
    case 'rockLayers':
      count(rep.fossils[0], 'layers', 12);
      count(rep.fossils[1], 'layers', 12);
      break;
    case 'pushes':
      count(rep.right, 'push');
      count(rep.left, 'push');
      break;
    case 'plot': {
      if (rep.table && rep.table.length > 8) out.push(`table of ${rep.table.length} rows (8 fit)`);
      if (!rep.unitRate) break;
      if (!rep.params.includes(rep.unitRate))
        out.push(`unit rate ${rep.unitRate} is not one of the graph's params`);
      // y = kx: the point and (1, k) lie on one line through 0.
      const [x, y, k] = [rep.x.var, rep.y.var, rep.unitRate].map(val);
      if (
        x !== undefined &&
        y !== undefined &&
        k !== undefined &&
        Math.abs(y - k * x) > 1e-6 * Math.max(1, Math.abs(y))
      )
        out.push(`(${x}, ${y}) is not on y = ${k}x`);
      break;
    }
    case 'scatter': {
      // Every point is on the axes; clusters and the outlier name points that exist.
      const on = (v: number, a: { min: number; max: number }) => v >= a.min && v <= a.max;
      rep.points.forEach(([x, y], i) => {
        if (!on(x, rep.x) || !on(y, rep.y)) out.push(`point ${i} (${x}, ${y}) is off the axes`);
      });
      const named = [...(rep.clusters ?? []).flatMap((c) => c.points), rep.outlier ?? 0];
      for (const i of named) if (!rep.points[i]) out.push(`there is no point ${i}`);
      // The prediction sits on the line (compared when none of the four has a unit).
      if (rep.at) {
        const ids4 = [rep.slope, rep.intercept, rep.at.x, rep.at.y];
        const [m, b, x, y] = ids4.map(val);
        if (
          ids4.every((id) => !byId.get(id)?.unit) &&
          [m, b, x, y].every((v) => v !== undefined) &&
          Math.abs(m! * x! + b! - y!) > 1e-6 * (1 + Math.abs(y!))
        )
          out.push(`prediction ${y} is off the line (${m! * x! + b!})`);
      }
      break;
    }
    case 'curvedSolid': {
      // A cylinder or cone needs its height; a sphere has none. Only a cone or a sphere is
      // poured into a cylinder.
      if ((rep.shape === 'sphere') === !!rep.height)
        out.push(`a ${rep.shape} ${rep.height ? 'has no' : 'needs a'} height`);
      if (rep.compare && rep.shape === 'cylinder') out.push('a cylinder is compared with itself');
      const [r, h] = [rep.radius, rep.height].map((id) => (id ? val(id) : undefined));
      if (r !== undefined && r < 0) out.push(`radius ${r} is negative`);
      if (h !== undefined && h < 0) out.push(`height ${h} is negative`);
      // The caption works V from the radius and height drawn (in the radius's unit), so a
      // volume shown in another unit (L) is not compared here; the relation holds it.
      break;
    }
    case 'rightTriangle': {
      // The three squares must fit together: a² + b² = c².
      const [a, b, c] = [rep.a, rep.b, rep.c].map(val);
      if (a !== undefined && b !== undefined && c !== undefined) {
        if (Math.abs(a * a + b * b - c * c) > 1e-6 * (1 + c * c))
          out.push(`squares ${a}² + ${b}² don't make ${c}²`);
      }
      break;
    }
    case 'quadrilateral': {
      const r = val(rep.rightAngles);
      if (r !== undefined && r !== 0 && r !== 4) out.push(`${r} right angles`);
      break;
    }
    default:
      break;
  }
  return out;
}

/**
 * Every value in the number sentences can be found in the picture: drawn by the representation
 * (any variable id its spec names) or labeled under it (`pictureLabels`).
 */
export function pictureCoverage(m: ModuleDef): string[] {
  const ids = new Set(m.variables.map((v) => v.id));
  const drawn = new Set<string>();
  const walk = (x: unknown) => {
    if (typeof x === 'string' && ids.has(x)) drawn.add(x);
    else if (Array.isArray(x)) x.forEach(walk);
    else if (x && typeof x === 'object') {
      for (const [k, y] of Object.entries(x)) if (k !== 'kind' && k !== 'icon') walk(y);
    }
  };
  walk(m.representation);
  const out: string[] = [];
  for (const id of m.pictureLabels ?? []) {
    if (!ids.has(id)) out.push(`pictureLabels names ${id}, which is not a variable`);
    else if (drawn.has(id))
      out.push(`pictureLabels repeats ${id}, which the picture already shows`);
  }
  const labeled = new Set(m.pictureLabels ?? []);
  const missing = m.variables.filter((v) => !drawn.has(v.id) && !labeled.has(v.id));
  const lone = new Set(m.standalone?.vars ?? []);
  for (const v of missing) {
    if (!lone.has(v.id)) out.push(`${v.id} (${v.name}) is neither drawn nor in pictureLabels`);
  }
  return out;
}
