/**
 * Picture checks: what each representation kind draws must agree with the values (counts
 * whole and in range, parts adding to the whole, a slope matching rise over run …). Add a
 * case here for every new picture kind. Test-only.
 */
import type { VariableDef } from '@/engine/types';

import { diceCount } from '@/components/module/reps/dice';
import { hopArcs } from '@/components/module/reps/hopArcs';
import { timeJumps } from '@/components/module/reps/timeJumps';
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
import { imageOf } from '@/components/module/reps/transform';
import { chemIssues } from './chemPictures';

import { placeParts } from '../helpers';
import { physics8Issues } from './picturesPhysics8';
import { functionGraphIssues } from './picturesFunctionGraph';
import { hscIssues } from './picturesHsc';
import { hsbIssues } from './picturesHsb';
import { hsdIssues } from './picturesHsd';
import {
  boxPlotIssues,
  dotPlotSdIssues,
  scatterIssues,
  treeChanceIssues,
  twoWayIssues,
  vennChanceIssues,
} from './picturesHse';
import {
  circleSectorIssues,
  curvedSolidHsfIssues,
  factorRootIssues,
  roundSectionIssues,
  planeGeometryIssues,
  scaleCopyHsfIssues,
  transformationHsfIssues,
} from './picturesHsf';
import { hsgIssues, punnettHsIssues } from './picturesHsg';
import * as hsk from './picturesHsk';
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
      // Take from ten: the crossed-out counters come out of the full ten (TenFrame.tsx).
      if (rep.crossOut) {
        count(rep.crossOut, 'crossed-out counters', 10);
        const k = val(rep.crossOut);
        if (k !== undefined && a !== undefined && k > Math.min(10, a))
          out.push(`ten-frame crosses out ${k} of a ten holding ${a}`);
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
      // A 1,000 chart draws only the hundred holding the value: counting by tens stays in it.
      const t = rep.tens ? val(rep.tens.count) : undefined;
      if (
        rep.max === 1000 &&
        n !== undefined &&
        t !== undefined &&
        n + 10 * t > Math.ceil(n / 100) * 100
      ) {
        out.push(`counting ${t} tens from ${n} leaves the hundred drawn`);
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
      // Equal sides: each labeled with the length, the perimeter under it is sides × length.
      if (rep.side) {
        const [len, p] = [val(rep.side), rep.around ? val(rep.around) : undefined];
        if (len !== undefined && len <= 0) out.push(`side ${rep.side} = ${len}`);
        if (s !== undefined && len !== undefined && p !== undefined && Math.abs(s * len - p) > 1e-9)
          out.push(`${s} sides of ${len} labeled, perimeter shows ${p}`);
      }
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
      out.push(...circleSectorIssues(rep, val));
      break;
    }
    case 'scaleCopy': {
      // Grades 9–12: a dilation from a center, or the side-splitter (picturesHsf.ts).
      if (rep.center || rep.splitter) {
        out.push(...scaleCopyHsfIssues(rep, val));
        break;
      }
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
    case 'baseTen': {
      for (const id of [...rep.groups, ...(rep.total ? [rep.total] : [])])
        count(id, 'blocks', 1000);
      // Take away: crossed out of the one group's blocks, so it can't be more than the group.
      if (rep.takeAway) {
        count(rep.takeAway, 'blocks taken away', 1000);
        if (rep.groups.length !== 1) out.push('baseTen takeAway needs exactly one group');
        const [a, b] = [val(rep.groups[0]!), val(rep.takeAway)];
        if (a !== undefined && b !== undefined && b > a)
          out.push(`~baseTen takes ${b} away from only ${a} (drawn without cross-outs)`);
      }
      break;
    }
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
      // With `group`, jumps to 999 are drawn in tens and hundreds (SkipCount.tsx).
      if (typeof rep.count === 'string') count(rep.count, 'skips', rep.group ? 999 : 30);
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
    case 'dotSet':
      // Scattered counters have 20 fixed spots (DotSet.tsx); past them they would overlap.
      count(rep.count, 'counters', 20);
      break;
    case 'coinRow': {
      // True-size coins five to a row, each with its running total under it (CoinRow.tsx).
      count(rep.count, 'coins', byId.get(rep.count)?.max ?? 10);
      const [v, k, t] = [val(rep.value), val(rep.count), val(rep.total)];
      if (v !== undefined && ![1, 5, 10, 25].includes(v))
        out.push(`coin value ${v}¢ is not a coin`);
      if (v !== undefined && k !== undefined && t !== undefined && v * k !== t)
        out.push(`${k} coins of ${v}¢ don't make the last running total ${t}¢`);
      break;
    }
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
      // Each hop is drawn one arc per ten (per tick) plus the rest: the arcs chain from the
      // start to the end, none longer than a tick, at most a hundred of them.
      const signs = rep.hops.map((h) =>
        typeof h.sign === 'number' ? h.sign : (val(h.sign) ?? 1) < 0 ? -1 : 1,
      );
      const stops = hops.reduce<number[]>((s, x, i) => [...s, s[i]! + signs[i]! * x!], [start]);
      const arcs = hopArcs(stops, signs, rep.tick ?? 10);
      if (arcs.length > 100) out.push(`hops drawn as ${arcs.length} arcs`);
      arcs.forEach((a, k) => {
        const from = k === 0 ? start : arcs[k - 1]!.to;
        if (Math.abs(a.from - from) > 1e-9 || Math.abs(a.to - a.from) > (rep.tick ?? 10) + 1e-9)
          out.push(`hop arc ${k + 1} (${a.from} to ${a.to}) doesn't chain one tick at a time`);
      });
      const last = arcs.length ? arcs[arcs.length - 1]!.to : start;
      if (Math.abs(last - at) > 1e-9) out.push(`hop arcs end at ${last}, not ${at}`);
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
      // With bundles, past 12 groups go in rows of ten small circles, up to 9 rows.
      count(rep.groups, 'groups', rep.bundles ? 90 : 12);
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
      // A split: the top braces label `first` and columns − first, so first fits the columns.
      if (rep.split) {
        const [f, k] = [val(rep.split.first), val(rep.columns)];
        if (f !== undefined && k !== undefined && (f < 0 || f > k))
          out.push(`array split at ${f} of ${k} columns`);
      }
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
      // LinePlot.tsx draws at most 10 X's a column, from a whole start (or 1/startParts).
      for (const p of rep.points) count(p.var, 'X marks', 10);
      if (rep.start && rep.startParts === undefined) count(rep.start, 'line plot start');
      else if (rep.start) {
        // A fractional start is drawn to the nearest 1/startParts.
        const s = val(rep.start);
        if (
          s !== undefined &&
          (s < 0 || Math.abs(s * rep.startParts! - Math.round(s * rep.startParts!)) > 1e-9)
        )
          out.push(`line plot start ${s} is not a whole number of 1/${rep.startParts}`);
        if (rep.marks === undefined) out.push('line plot startParts needs marks');
      }
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
      // Half pictures are worth half the key: without a key there is nothing to halve.
      if (rep.half && !rep.key) out.push('picture graph with half pictures has no key');
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
      // A line counted by ticks: whole ticks, one jump each, from the start to the point.
      if (rep.count !== undefined && rep.from !== undefined) {
        count(rep.count, 'ticks counted', rep.span ?? 10);
        const [k, a, n] = [val(rep.count), val(rep.start), val(rep.end)];
        if (
          k !== undefined &&
          a !== undefined &&
          n !== undefined &&
          Math.abs(a + k * every - n) > 1e-9
        )
          out.push(`${k} ticks of ${every} from ${a} land on ${a + k * every}, the point is ${n}`);
      }
      break;
    }
    // Grade 3 pictures.
    case 'rounding': {
      const [n, lo, hi, r] = [rep.value, rep.lower, rep.upper, rep.rounded].map((x) =>
        x === undefined ? undefined : val(x),
      );
      const to = typeof rep.to === 'number' ? rep.to : val(rep.to);
      // Each line's arrow goes to the nearer end, halfway rounding up (Rounding.tsx).
      const drawn = (x: number | undefined) =>
        x === undefined || to === undefined || to <= 0
          ? undefined
          : Math.floor(x / to + 0.5 + 1e-9) * to;
      const lines = [[n, r, rep.rounded] as const];
      if (rep.second) {
        const [n2, r2] = [val(rep.second.value), val(rep.second.rounded)];
        lines.push([n2, r2, rep.second.rounded] as const);
        const e = rep.second.estimate ? val(rep.second.estimate) : undefined;
        const [d1, d2] = [drawn(n), drawn(n2)];
        if (e !== undefined && d1 !== undefined && d2 !== undefined) {
          const made = rep.second.minus ? d1 - d2 : d1 + d2;
          if (Math.abs(made - e) > 1e-9) out.push(`rounded lines make ${made}, estimate is ${e}`);
        }
      }
      for (const [x, rx, id] of lines) {
        const d = drawn(x);
        if (d !== undefined && rx !== undefined && Math.abs(d - rx) > 1e-9)
          out.push(`the arrow goes to ${d}, ${id} is ${rx}`);
      }
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
      if (span > 24 && rep.startWhole === undefined && a !== undefined && b !== undefined) {
        out.push(`${a}/${b} needs ${span} wholes on the line`);
      }
      // `startWhole`: the line runs from that whole (or the point's) to start + wholes.
      if (rep.startWhole !== undefined) {
        count(rep.startWhole, 'line start whole');
        const s = val(rep.startWhole);
        const p = a !== undefined && b !== undefined && b >= 1 ? a / b : undefined;
        const from = Math.min(s ?? Infinity, p === undefined ? Infinity : Math.floor(p));
        const to = Math.max((s ?? 0) + rep.wholes, p === undefined ? 0 : Math.ceil(p));
        if (Number.isFinite(from) && to - from > 24) {
          out.push(`line from ${from} to ${to} needs more than 24 wholes`);
        }
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
        // The jumps (Timeline.tsx) chain from one end to the other and add up to the minutes;
        // forward they land on the hour after the first, backward on the hour before.
        for (const back of [false, true]) {
          const jumps = timeJumps(sm!, d!, em!, back);
          let pos = back ? d! : 0;
          for (const j of jumps) {
            if (j.from !== pos || j.minutes <= 0) out.push(`time jumps don't chain (${back})`);
            pos = j.to;
          }
          if (d! > 0 && pos !== (back ? 0 : d)) out.push(`time jumps end at ${pos}, not the end`);
          if (jumps.length > 1 && (back ? em! - jumps[0]!.minutes : sm! + jumps[0]!.minutes) % 60)
            out.push(`the first time jump doesn't land on an hour (${back})`);
        }
      }
      break;
    }
    case 'scale': {
      const t = val(rep.total);
      // A spring scale reads on past its `max` to the next 10 (ScaleOptions.tsx).
      if (t !== undefined && t > rep.max && !rep.hanging)
        out.push(`total ${t} past the dial's ${rep.max}`);
      // A spring scale hangs up to 20 washers (ScaleOptions.tsx); a kitchen scale 10 bags.
      if (rep.count) count(rep.count, 'items on the scale', rep.hanging ? 20 : 10);
      if (rep.hanging && rep.count && rep.each) {
        const [n, e] = [val(rep.count), val(rep.each)];
        if (n !== undefined && e !== undefined && t !== undefined && Math.abs(n * e - t) > 1e-6)
          out.push(`${n} of ${e} on the scale, it reads ${t}`);
      }
      if (rep.hanging && !(rep.count && rep.each)) out.push('a spring scale needs count and each');
      // Before and after: the difference is the gas that left, so the first reads at least as much.
      const b = rep.before ? val(rep.before) : undefined;
      if (b !== undefined && b > rep.max) out.push(`before ${b} past the dial's ${rep.max}`);
      if (b !== undefined && t !== undefined && b < t)
        out.push(`before ${b} is less than after ${t}: nothing escaped`);
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
      // A triangle: the three angles make 180°, each inside it (the whole is the exterior angle).
      if (rep.triangle) {
        const c = val(rep.triangle.third);
        if (a !== undefined && b !== undefined && c !== undefined) {
          if (Math.abs(a + b + c - 180) > 1e-9) out.push(`triangle angles ${a}, ${b}, ${c} drawn`);
          if (Math.min(a, b, c) <= 0) out.push(`a triangle angle of ${Math.min(a, b, c)}°`);
        }
      }
      if (rep.parallel && rep.whole !== 180)
        out.push(`parallel lines need a straight whole, not ${rep.whole}`);
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
      out.push(...planeGeometryIssues(rep, val));
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
      out.push(...boxPlotIssues(rep, val));
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
      // A group's name and amount are drawn beside its wedges: they must add to it.
      if (rep.group) {
        const g = val(rep.group.id);
        const gs = rep.group.parts.map(val);
        if (rep.group.parts.some((p) => !rep.parts.includes(p)))
          out.push(`pie group has a part that isn't in the pie`);
        if (g !== undefined && gs.every((x) => x !== undefined)) {
          const s = gs.reduce((a, b) => a! + b!, 0)!;
          if (Math.abs(s - g) > 1e-6) out.push(`pie group parts add to ${s}, not ${g}`);
        }
      }
      break;
    }
    case 'fractionArea': {
      for (const f of [rep.first, rep.second, rep.product].filter((x) => !!x)) {
        const n = val(f!.num);
        const d = val(f!.den);
        count(f!.num, 'top');
        if (d !== undefined && d < 1) out.push(`bottom ${f!.den} = ${d}`);
        if (n === undefined || d === undefined || d < 1) continue;
        // With `wholes`, a fraction past one is a block of unit squares (FractionArea.tsx).
        if (!rep.wholes) {
          if (n > d) out.push(`${n}/${d} is more than one whole`);
        } else if (f !== rep.product && Math.ceil(n / d) > rep.wholes)
          out.push(`${n}/${d} needs ${Math.ceil(n / d)} unit squares, past ${rep.wholes}`);
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
      // Adding: the sum's row is the two rows added, place by place (PlaceValueChart.tsx).
      if (rep.plus && rep.total) {
        const [a, b, t] = [rep.value, rep.plus, rep.total].map(val);
        if (a !== undefined && b !== undefined && t !== undefined && Math.abs(a + b - t) > 1e-6)
          out.push(`place-value rows ${a} + ${b} drawn, the sum row shows ${t}`);
      }
      const x = val(rep.value);
      if (x !== undefined && x < 0) out.push(`place-value chart of a negative number ${x}`);
      // Seven whole places (millions) are drawn, twelve in periods (PlaceValueChart.tsx).
      const top = rep.periods ? 1e12 : 1e7;
      for (const id of [rep.value, rep.from, rep.compare, rep.plus, rep.total]) {
        const n = id ? val(id) : undefined;
        if (n !== undefined && n >= top) out.push(`place-value chart of ${n}: past ${top} places`);
        if (rep.periods && n !== undefined && Math.abs(n - Math.round(n)) > 1e-9)
          out.push(`periods chart of ${n}: whole numbers only`);
      }
      if (rep.periods && rep.decimals) out.push('periods chart with decimal places');
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
      out.push(...factorRootIssues(rep, val));
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
        for (const id of rep.ratio) count(id, 'ratio boxes', 40);
        if (rep.amounts && rep.amounts.length !== rep.ratio.length)
          out.push(`tape: ${rep.ratio.length} bars with ${rep.amounts.length} amounts`);
        const u = val(rep.unit);
        // Three bars bracket the total: it is all the boxes times the unit.
        const all = rep.ratio.map(val);
        const t = rep.total ? val(rep.total) : undefined;
        if (
          rep.ratio.length === 3 &&
          u !== undefined &&
          t !== undefined &&
          all.every((x) => x !== undefined)
        ) {
          const made = all.reduce((s, x) => s! + x!, 0)! * u;
          if (Math.abs(made - t) > 1e-6 * Math.max(1, t))
            out.push(`tape: ${made} in the boxes, total shows ${t}`);
        }
        for (const [n, id] of rep.ratio.map((r, j) => [val(r), rep.amounts?.[j]] as const)) {
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
      // Tenths × tenths: columns and rows of one grid, the overlap the product (Grid100.tsx);
      // a factor of 1 or more, or past tenths, draws the area model, so any product fits.
      if (rep.product) {
        const [a, b, p] = [...rep.product, rep.percent].map(val);
        if (a !== undefined && b !== undefined && p !== undefined && Math.abs(a * b - p) > 1e-6)
          out.push(`grid ${a} × ${b} shaded, product shows ${p}`);
        for (const [id, x] of rep.product.map((id) => [id, val(id)] as const))
          if (x !== undefined && x < 0) out.push(`factor ${id} = ${x} below 0`);
        break;
      }
      // A percent like 38.7 shades the nearest square (Grid100.tsx rounds): check the range.
      // `past100` adds a full grid per 100 (one stack past 3 grids, up to 99 of them); `exact`
      // shades tenths of a square, so the percent must be in tenths.
      const shaded = val(rep.percent);
      const most = rep.past100 ? 10000 : 100;
      if (shaded !== undefined && (shaded < 0 || shaded > most)) {
        out.push(`squares shaded ${rep.percent} out of 0–${most} (${shaded})`);
      }
      if (
        rep.exact &&
        shaded !== undefined &&
        Math.abs(shaded * 10 - Math.round(shaded * 10)) > 1e-6
      )
        out.push(`squares shaded ${rep.percent} = ${shaded} is not in tenths of a square`);
      if (rep.second) count(rep.second, 'squares shaded', 100);
      // Whole grids shrink the row: up to 3 fit beside the tapped grid (Grid100.tsx); with
      // `stack` more are one stack with its count, to 99.
      if (rep.wholes) count(rep.wholes, 'whole grids', rep.stack ? 99 : 3);
      break;
    }
    case 'factorPairs': {
      // The 1-row rectangle is drawn to the width; past 100 (to 200) they are thin bars to scale.
      count(rep.value, 'number', 200);
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
      out.push(...hsk.waveHsIssues(rep, (id) => hsk.mapSi(val(id), byId.get(id)?.unitFactor)));
      if (typeof rep.extent === 'string') count(rep.extent, 'waves drawn', 12);
      const [A, L] = [rep.amplitude ? val(rep.amplitude) : undefined, val(rep.wavelength)];
      if (A !== undefined && A < 0) out.push(`negative amplitude ${A}`);
      if (L !== undefined && L <= 0) out.push(`wavelength ${L} is not positive`);
      break;
    }
    case 'punnettSquare': {
      if (rep.inheritance) {
        out.push(...punnettHsIssues(rep, (id) => val(id)));
        break;
      }
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
        // The jump is a distance, or a signed change (a drop of 10 is −10).
        Math.abs(Math.abs(b - a) - d) > 1e-9 &&
        Math.abs(b - a - d) > 1e-9
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
      if (rep.compound) {
        // H17: two bounds, the lower first; |x − c| (sign) d has its bounds at c ∓ d.
        const { center, radius } = rep.compound;
        if (!rep.second) out.push('a compound inequality needs its second bound');
        if (rep.vertical || rep.inequality || rep.jump)
          out.push('a compound inequality is drawn across, alone');
        if (!center !== !radius) out.push('a distance needs both its center and its radius');
        const [c, r] = [center, radius].map((x) => (x ? val(x) : undefined));
        if (c !== undefined && r !== undefined) {
          if (a !== undefined && Math.abs(a - (c - r)) > 1e-6 * Math.max(1, Math.abs(a)))
            out.push(`|x − ${c}| with radius ${r} has its lower bound at ${c - r}, not ${a}`);
          if (b !== undefined && Math.abs(b - (c + r)) > 1e-6 * Math.max(1, Math.abs(b)))
            out.push(`|x − ${c}| with radius ${r} has its upper bound at ${c + r}, not ${b}`);
        }
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
      if ('chances' in rep) {
        out.push(...vennChanceIssues(rep.chances, val));
        break;
      }
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
        // The labelled sides close a triangle (the drawing follows the base and height, so a
        // Grade 7 page need not type sides that fit the Pythagorean theorem exactly). Within
        // 2 %, as the Grade 6 page rounds its third side: a sliver of a triangle is not open.
        const closes =
          rep.triangle === 'isosceles'
            ? sl > H * 0.98 && sl > W / 2
            : sl > Math.max(W, H) * 0.98 && sl < (W + H) * 1.02;
        if (!closes) out.push(`sides ${W}, ${H} and ${sl} don't close the triangle`);
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
      // Grades 9–12: a cylinder or a cone (picturesHsf.ts).
      if (rep.solid === 'cylinder' || rep.solid === 'cone') {
        out.push(...roundSectionIssues(rep, val));
        break;
      }
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
      if ('chances' in rep) {
        out.push(...treeChanceIssues(rep.chances, val));
        break;
      }
      // Up to 6 outcomes a stage (TREE_MAX in TreeDiagram.tsx).
      count(rep.first, 'first-stage outcomes', 6);
      count(rep.second, 'second-stage outcomes', 6);
      if (rep.third) count(rep.third, 'third-stage outcomes', 6);
      const stages = [rep.first, rep.second, ...(rep.third ? [rep.third] : [])].map((id) =>
        val(id),
      );
      const [n, P] = [rep.total, rep.chance].map((id) => (id ? val(id) : undefined));
      for (const x of stages) if (x !== undefined && x < 1) out.push(`a stage with ${x} outcomes`);
      if (stages.every((x) => x !== undefined)) {
        const all = stages.reduce((p, x) => p! * x!, 1)!;
        const shown = stages.join(' × ');
        if (n !== undefined && all !== n) out.push(`${shown} branches drawn, total shows ${n}`);
        if (P !== undefined && Math.abs(1 / all - P) > 1e-6)
          out.push(`one of ${all} paths drawn, chance shows ${P}`);
        if (rep.path && rep.path.some((i, s) => i >= stages[s]!))
          out.push(`path ${rep.path.join(', ')} is not a branch of ${shown}`);
      }
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
    case 'energyPyramid': {
      // Up to 5 tiers (PYRAMID_MAX in EnergyPyramid.tsx), each the share of the one below.
      if (rep.levels.length < 2 || rep.levels.length > 5)
        out.push(`${rep.levels.length} pyramid levels (2 to 5 are drawn)`);
      if (rep.names && rep.names.length < rep.levels.length)
        out.push('a pyramid level has no name');
      const xs = rep.levels.map(val);
      xs.forEach((x, i) => {
        if (x !== undefined && x < 0) out.push(`level ${i + 1} energy ${x} is negative`);
      });
      const p = val(rep.percent ?? 10);
      if (p !== undefined && (p <= 0 || p > 100)) out.push(`${p}% passed up is not a share`);
      if (p === undefined) break;
      xs.slice(1).forEach((x, i) => {
        const below = xs[i];
        if (x === undefined || below === undefined) return;
        const want = (below * p) / 100;
        if (Math.abs(x - want) > 1e-6 * Math.max(1, Math.abs(want)))
          out.push(`level ${i + 2} shows ${x}, ${p}% of ${below} is ${want}`);
      });
      break;
    }
    case 'generations': {
      // 2 to 8 bars (GENERATIONS_MAX in Generations.tsx) of 2 or 3 varieties each.
      const g = rep.counts.length;
      if (g < 2 || g > 8) out.push(`${g} generations (2 to 8 are drawn)`);
      const k = (rep.counts[0]?.length ?? 0) + (rep.total ? 1 : 0);
      if (k < 2 || k > 3 || rep.counts.some((row) => row.length + (rep.total ? 1 : 0) !== k))
        out.push('each generation needs the same 2 or 3 varieties');
      if (rep.total) {
        const total = val(rep.total);
        rep.counts.forEach((row, g) => {
          const sum = row.reduce((s, id) => s + (val(id) ?? 0), 0);
          if (total !== undefined && sum > total + 1e-9)
            out.push(`generation ${g + 1} counts ${sum} of ${total}`);
        });
      }
      if (rep.colors && rep.colors.length < k) out.push('a variety has no color');
      if (rep.names && rep.names.length < k) out.push('a variety has no name');
      if ((rep.follow ?? 0) >= k) out.push(`followed variety ${rep.follow} is not a variety`);
      rep.counts.flat().forEach((id) => count(id, 'beetles'));
      break;
    }
    case 'sample': {
      // One dot per member (SAMPLE_MAX in Sample.tsx); the sample fits in the population.
      count(rep.population, 'population', 1000);
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
      out.push(...dotPlotSdIssues(rep, val));
      const sorted = firstValues(rep.data, rep.count);
      const md = rep.median ? val(rep.median) : undefined;
      if (sorted && md !== undefined && Math.abs(medianOf(sorted) - md) > 1e-9)
        out.push(`median of ${sorted.join(', ')} is ${medianOf(sorted)}, shows ${md}`);
      const n = rep.count ? val(rep.count) : undefined;
      const ids = rep.data.slice(0, n ?? rep.data.length);
      const data = ids.map(val).filter((x): x is number => x !== undefined);
      const m = rep.mean ? val(rep.mean) : undefined;
      if (m !== undefined && data.length === ids.length) {
        const mean = data.reduce((s, x) => s + x, 0) / data.length;
        if (Math.abs(mean - m) > 1e-6 * Math.max(1, Math.abs(m)))
          out.push(`dots balance at ${mean}, mean shows ${m}`);
      }
      if (rep.second) {
        // The second sample's center, and the gap between the two centers.
        const xs = rep.second.data.slice(0, n ?? rep.second.data.length).map(val);
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
        // (past 15 the counters are tens and ones)
        if (n !== undefined && (n !== Math.round(n) || Math.abs(n) > 100))
          out.push(`${n} unit counters on a pan (whole, up to 100)`);
      break;
    }
    case 'powerScale': {
      const [x, a, e] = [rep.number, rep.mantissa, rep.exponent].map(val);
      if (x !== undefined && x < 0) out.push(`number ${x} has no place on a powers-of-ten ruler`);
      const q = rep.second ? val(rep.second) : undefined;
      if (q !== undefined && q <= 0) out.push(`second number ${q} has no place on the ruler`);
      if (a !== undefined && (a < 1 || a >= 10)) out.push(`mantissa ${a} is not from 1 up to 10`);
      if (e !== undefined && e !== Math.round(e)) out.push(`exponent ${e} is not whole`);
      if (
        x !== undefined &&
        a !== undefined &&
        e !== undefined &&
        // (the mantissa is read to 4 significant figures, as the ruler shows it)
        Math.abs(a * 10 ** e - x) > Math.max(1e-9, 5e-4 * x)
      )
        out.push(`${a} × 10^${e} drawn, the number shows ${x}`);
      // Log mode: the log is the exponent plus the mantissa's log.
      const lg = rep.log ? val(rep.log) : undefined;
      if (lg !== undefined && x !== undefined && x > 0 && Math.abs(lg - Math.log10(x)) > 5e-4)
        out.push(`log ${lg} shown, log₁₀ ${x} is ${Math.log10(x)}`);
      break;
    }
    case 'rootSquare': {
      const [a, sd] = [val(rep.area), val(rep.side)];
      const root = (x: number) => (rep.solid === 'cube' ? Math.cbrt(x) : Math.sqrt(x));
      if (rep.between && a !== undefined && a >= 0) {
        const [lo, hi] = rep.between.map(val);
        if (lo !== undefined && lo !== Math.floor(root(a) + 1e-9))
          out.push(`root of ${a} is not at or above ${lo}`);
        if (hi !== undefined && hi !== Math.ceil(root(a) - 1e-9))
          out.push(`root of ${a} is not at or below ${hi}`);
      }
      if (rep.solid === 'cube') {
        // The line runs to the edge; past 20 the whole numbers crowd.
        if (a !== undefined && (a < 0 || a > 8000)) out.push(`cube of volume ${a}`);
        if (a !== undefined && a >= 0 && sd !== undefined && Math.abs(sd - root(a)) > 0.006)
          out.push(`edge ${sd} cubed is ${sd ** 3}, the volume shows ${a}`);
        break;
      }
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
          ids4.every((id) => typeof id === 'number' || !byId.get(id)?.unit) &&
          [m, b, x, y].every((v) => v !== undefined) &&
          Math.abs(m! * x! + b! - y!) > 1e-6 * (1 + Math.abs(y!))
        )
          out.push(`prediction ${y} is off the line (${m! * x! + b!})`);
      }
      out.push(...scatterIssues(rep, val));
      break;
    }
    case 'curvedSolid': {
      // A cylinder or cone needs its height; a sphere has none. Only a cone or a sphere is
      // poured into a cylinder.
      if ((rep.shape === 'sphere') === !!rep.height)
        out.push(`a ${rep.shape} ${rep.height ? 'has no' : 'needs a'} height`);
      if (rep.compare && rep.shape === 'cylinder') out.push('a cylinder is compared with itself');
      out.push(...curvedSolidHsfIssues(rep, val));
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
    case 'functionGraph':
      out.push(...functionGraphIssues(rep, val));
      break;
    case 'linearFunction': {
      const [m, b] = [val(rep.slope), val(rep.intercept)];
      const [x, y] = rep.point ? [val(rep.point.x), val(rep.point.y)] : [];
      if ([m, b, x, y].every((v) => v !== undefined) && rep.point) {
        if (Math.abs(m! * x! + b! - y!) > 1e-6 * Math.max(1, Math.abs(y!)))
          out.push(`point (${x}, ${y}) is not on y = ${m}x + ${b}`);
      }
      break;
    }
    case 'transformation': {
      if (rep.figure.length < 2 || rep.figure.length > 6)
        out.push(`figure with ${rep.figure.length} corners (2 to 6 are labelled A–F)`);
      const num = (x: string | number | undefined, d: number) => (x === undefined ? d : val(x));
      const mirror = rep.move === 'reflect' ? rep.mirror : undefined;
      const line =
        mirror && typeof mirror === 'object' ? val('x' in mirror ? mirror.x : mirror.y) : undefined;
      const center = 'center' in rep && rep.center ? rep.center : undefined;
      const move = {
        right: rep.move === 'translate' ? num(rep.right, 0) : 0,
        up: rep.move === 'translate' ? num(rep.up, 0) : 0,
        angle: rep.move === 'rotate' ? num(rep.angle, 0) : 0,
        factor: rep.move === 'dilate' ? num(rep.factor, 1) : 1,
        cx: num(center?.[0], 0),
        cy: num(center?.[1], 0),
      };
      if (move.factor !== undefined && move.factor <= 0)
        out.push(`dilation by scale factor ${move.factor}`);
      out.push(...transformationHsfIssues(rep, val));
      const a = rep.figure[0] && [val(rep.figure[0][0]), val(rep.figure[0][1])];
      const [ix, iy] = rep.image ? [val(rep.image.x), val(rep.image.y)] : [];
      const all = [...Object.values(move), a?.[0], a?.[1], ix, iy];
      if (
        !rep.image ||
        all.some((x) => x === undefined) ||
        (mirror && typeof mirror === 'object' && line === undefined)
      )
        break;
      const [ex, ey] = imageOf([a![0]!, a![1]!], rep.move, {
        right: move.right!,
        up: move.up!,
        mirror,
        line,
        angle: move.angle!,
        factor: move.factor!,
        center: [move.cx!, move.cy!],
      });
      if (Math.abs(ex - ix!) > 1e-6 || Math.abs(ey - iy!) > 1e-6)
        out.push(`image (${ix}, ${iy}) is not where the move takes A (${ex}, ${ey})`);
      break;
    }
    case 'mapping': {
      // The diagram has a row per different input and output; more than 8 don't fit.
      if (rep.pairs.length < 1 || rep.pairs.length > 8)
        out.push(`mapping with ${rep.pairs.length} pairs (1 to 8 fit)`);
      for (const p of rep.pairs) {
        const [x, y] = [val(p.x), val(p.y)];
        if ((x !== undefined && !Number.isFinite(x)) || (y !== undefined && !Number.isFinite(y)))
          out.push(`mapping pair (${x}, ${y}) is not a number`);
      }
      break;
    }
    case 'functionMachine': {
      let x = val(rep.input);
      for (const s of rep.rule) {
        const by = val(s.by);
        if (x === undefined || by === undefined) {
          x = undefined;
          break;
        }
        if (s.op === '÷' && by === 0) out.push('function rule divides by 0');
        x = s.op === '+' ? x + by : s.op === '−' ? x - by : s.op === '×' ? x * by : x / by;
      }
      const y = val(rep.output);
      if (x !== undefined && y !== undefined && Math.abs(x - y) > 1e-6 * Math.max(1, Math.abs(y)))
        out.push(`machine gives ${x}, output shows ${y}`);
      if (rep.rule.length < 1 || rep.rule.length > 3)
        out.push(`function machine with ${rep.rule.length} steps (1 to 3 fit)`);
      break;
    }
    case 'molecules':
    case 'reaction':
    case 'heatingCurve':
    case 'periodicTable':
      // Chemistry pictures draw fixed numbers in formula units (a time in hours still meets
      // spans in minutes), so they read every value in formula units.
      out.push(
        ...chemIssues(rep, (x) => {
          const y = val(x);
          return typeof x === 'number' || y === undefined ? y : y * (byId.get(x)?.unitFactor ?? 1);
        }),
      );
      break;
    case 'lineSystem': {
      const [m1, b1, m2, b2] = rep.lines.flatMap((l) => [val(l.slope), val(l.intercept)]);
      // Elimination (H16): the sum a·x + b·y = c is k₁ × (y − m₁x = b₁) + k₂ × (y − m₂x = b₂).
      const [sa, sb, sc] = rep.sum ? [val(rep.sum.x), val(rep.sum.y), val(rep.sum.c)] : [];
      if (
        [m1, b1, m2, b2, sa, sb, sc].every((v) => v !== undefined) &&
        m1 !== m2 &&
        !(sa === 0 && sb === 0)
      ) {
        const k2 = (sa! + sb! * m1!) / (m1! - m2!);
        const k1 = sb! - k2;
        if (Math.abs(k1 * b1! + k2 * b2! - sc!) > 1e-6 * Math.max(1, Math.abs(sc!)))
          out.push(`sum line ${sa}x + ${sb}y = ${sc} is not a sum of the two equations`);
      }
      const [x, y] = rep.solution ? [val(rep.solution.x), val(rep.solution.y)] : [];
      if ([m1, b1, m2, b2].some((v) => v === undefined) || x === undefined || y === undefined)
        break;
      if (m1 === m2) out.push(`lines with the same slope ${m1} drawn with a solution (${x}, ${y})`);
      else if (
        Math.abs(m1! * x + b1! - y) > 1e-6 * Math.max(1, Math.abs(y)) ||
        Math.abs(m2! * x + b2! - y) > 1e-6 * Math.max(1, Math.abs(y))
      )
        out.push(`solution (${x}, ${y}) is not where the lines cross`);
      break;
    }
    case 'force': {
      // F = m × a in formula units (N, kg, m/s²); a cart carries at most 20 blocks.
      const f = (id: string) => {
        const x = val(id);
        return x === undefined ? undefined : x * (byId.get(id)?.unitFactor ?? 1);
      };
      const [F, m, a] = [f(rep.force), f(rep.mass), f(rep.acceleration)];
      const units = [rep.force, rep.mass, rep.acceleration].map((id) => byId.get(id)?.unit);
      if (
        F !== undefined &&
        m !== undefined &&
        a !== undefined &&
        units.join() === 'N,kg,m/s²' &&
        Math.abs(F - m * a) > 1e-4 * Math.max(1, Math.abs(F))
      )
        out.push(`force ${F} is not mass × acceleration (${m * a})`);
      // The block is in the mass's formula unit.
      if (rep.object === 'cart' && rep.block !== undefined && m !== undefined) {
        if (rep.block <= 0) out.push(`cart blocks of ${rep.block}`);
        else if (m / rep.block > 20 + 1e-6)
          out.push(`${m / rep.block} blocks on the cart (20 fit)`);
      }
      break;
    }
    case 'skaters': {
      // Each skater's acceleration is the shared push ÷ its own mass (N ÷ kg = m/s²).
      const f = (id: string) => {
        const x = val(id);
        return x === undefined ? undefined : x * (byId.get(id)?.unitFactor ?? 1);
      };
      const F = f(rep.force);
      if (F !== undefined && F < 0) out.push(`push ${F} is below 0`);
      rep.masses.forEach((id, i) => {
        const m = f(id);
        if (m !== undefined && m <= 0) out.push(`skater ${i + 1} has mass ${m}`);
        const a = rep.accelerations ? f(rep.accelerations[i]!) : undefined;
        const units = [rep.force, id, rep.accelerations?.[i]].map((x) => x && byId.get(x)?.unit);
        if (
          F !== undefined &&
          m !== undefined &&
          m > 0 &&
          a !== undefined &&
          units.join() === 'N,kg,m/s²' &&
          Math.abs(a - F / m) > 1e-4 * Math.max(1, Math.abs(a))
        )
          out.push(`skater ${i + 1} speeds up by ${a}, not push ÷ mass (${F / m})`);
      });
      break;
    }
    case 'energyTrack': {
      // In formula units (J, kg, m, m/s): PE + KE = total, PE = m × g × h, total = m × g ×
      // top, KE = 1/2 × m × v²; the height is from 0 to the top.
      const f = (id: string | number | undefined) => {
        if (id === undefined || typeof id === 'number') return id;
        const x = val(id);
        return x === undefined ? undefined : x * (byId.get(id)?.unitFactor ?? 1);
      };
      out.push(...hsk.energySpringIssues(rep, (id) => f(id)));
      const g = rep.g ?? 9.8;
      const [h, pe, ke, total, top, m, v] = [
        rep.height,
        rep.potential,
        rep.kinetic,
        rep.total,
        rep.top,
        rep.mass,
        rep.speed,
      ].map(f);
      const near = (x: number, y: number) => Math.abs(x - y) <= 1e-4 * Math.max(1, Math.abs(y));
      const unitsOk = [rep.potential, rep.kinetic, rep.total, rep.height, rep.top, rep.mass].every(
        (id) => typeof id !== 'string' || ['J', 'm', 'kg', ''].includes(byId.get(id)?.unit ?? ''),
      );
      for (const [x, what] of [
        [h, 'height'],
        [pe, 'potential energy'],
        [ke, 'kinetic energy'],
      ] as const)
        if (x !== undefined && x < -1e-9) out.push(`${what} ${x} is below 0`);
      if (h !== undefined && top !== undefined && h > top + 1e-6 * Math.max(1, top))
        out.push(`height ${h} is above the top ${top}`);
      if (unitsOk) {
        if (pe !== undefined && ke !== undefined && total !== undefined && !near(pe + ke, total))
          out.push(`PE + KE = ${pe + ke}, not the total ${total}`);
        if (m !== undefined && h !== undefined && pe !== undefined && !near(pe, m * g * h))
          out.push(`PE ${pe} is not m × g × h (${m * g * h})`);
        if (
          m !== undefined &&
          top !== undefined &&
          total !== undefined &&
          !near(total, m * g * top)
        )
          out.push(`total ${total} is not m × g × top (${m * g * top})`);
        if (m !== undefined && v !== undefined && ke !== undefined && !near(ke, (m * v * v) / 2))
          out.push(`KE ${ke} is not 1/2 × m × v² (${(m * v * v) / 2})`);
      }
      break;
    }
    case 'motionGraph': {
      // In formula units (the picture works in them): the line's end is the start plus slope ×
      // time when the module's units agree (m, s, m/s, m/s²); the time and the trip's
      // positions (or speeds) never go below 0.
      const unit = (id: string | number | undefined) =>
        typeof id === 'string' ? (byId.get(id)?.unit ?? '') : '';
      const fv = (id: string | number | undefined) => {
        const x = id === undefined ? 0 : val(id);
        return x === undefined || typeof id !== 'string' ? x : x * (byId.get(id)?.unitFactor ?? 1);
      };
      const slopeId = rep.graph === 'distance' ? rep.speed : rep.acceleration;
      const endId = rep.graph === 'distance' ? rep.distance : rep.speed;
      const [t, start, m, end] = [fv(rep.time), fv(rep.start), fv(slopeId), fv(endId)];
      const [tu, eu, mu] = [unit(rep.time), unit(endId), unit(slopeId)];
      const agree =
        rep.graph === 'distance' ? mu === `${eu}/${tu}` : mu === `${eu}²` && eu.endsWith(`/${tu}`);
      // Shown values are rounded to 9 places, so a time in hours is only roughly itself.
      const near = (x: number, y: number) => Math.abs(x - y) <= 1e-4 * Math.max(1, Math.abs(y));
      if (t !== undefined && t < 0) out.push(`motion graph time ${t} is negative`);
      if ([t, start, m, end].every((x) => x !== undefined) && agree) {
        const want = start! + m! * t!;
        if (!near(end!, want))
          out.push(`motion graph ends at ${end}, not start + slope × time = ${want}`);
      }
      if (rep.graph === 'speed') {
        out.push(...hsk.motionKinematicsIssues(rep, (id) => fv(id)));
        for (const v of rep.kinematics ? [] : [start, end])
          if (v !== undefined && v < 0) out.push(`speed ${v} is below 0 on a speed-time graph`);
        const d = rep.distance ? fv(rep.distance) : undefined;
        if (d !== undefined && [t, start, end].every((x) => x !== undefined)) {
          const area = ((start! + end!) / 2) * t!;
          if (agree && unit(rep.distance) === eu.split('/')[0] && !near(d, area))
            out.push(`distance ${d} is not the area under the line (${area})`);
        }
      } else if (rep.then) {
        if (rep.then.length > 5) out.push(`${rep.then.length} legs after the first (5 fit)`);
        let x = end;
        for (const leg of rep.then) {
          if (leg.time <= 0) out.push(`a leg lasts ${leg.time}`);
          if (x === undefined) break;
          x += leg.speed * leg.time;
          if (x < -1e-9) out.push(`the trip goes below 0 (${x})`);
        }
      }
      break;
    }
    case 'spectrum':
    case 'circuit':
    case 'electromagnet':
    case 'orbit':
      out.push(...physics8Issues(rep, (id) => val(id)));
      break;
    case 'triangleSolver':
    case 'markedFigure':
    case 'circleTheorems':
      out.push(...hscIssues(rep, (id) => val(id)));
      break;
    case 'normalCurve':
    case 'histogram':
    case 'pascalTriangle':
    case 'termsChart':
      out.push(...hsbIssues(rep, (id) => val(id)));
      break;
    case 'unitCircle':
    case 'algebraTiles':
    case 'vectorDiagram':
    case 'complexPlane':
    case 'polarGrid':
    case 'conicGraph':
    case 'matrixGrid':
      out.push(...hsdIssues(rep, (id) => val(id)));
      break;
    case 'membrane':
    case 'dnaStrand':
      out.push(...hsgIssues(rep, (id) => val(id)));
      break;
    case 'projectile':
    case 'charges':
    case 'rayDiagram':
    case 'heatEngine':
    case 'simpleMachine':
    case 'collision':
    case 'circularMotion':
    case 'freeBody':
      out.push(...hsk.hskIssues(rep, (id) => val(id), byId));
      break;
    case 'table':
      if ('twoWay' in rep) {
        out.push(...twoWayIssues(rep.twoWay, val));
        break;
      }
      if (rep.rowNames && Array.isArray(rep.rows) && rep.rowNames.length !== rep.rows.length)
        out.push(`${rep.rowNames.length} row names for ${rep.rows.length} rows`);
      break;
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
