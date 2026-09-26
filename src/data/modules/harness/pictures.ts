/**
 * Picture checks: what each representation kind draws must agree with the values (counts
 * whole and in range, parts adding to the whole, a slope matching rise over run …). Add a
 * case here for every new picture kind. Test-only.
 */
import type { VariableDef } from '@/engine/types';

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
      if (p !== undefined && k !== undefined && k > p) out.push(`${k} shaded of ${p} parts`);
      break;
    }
    case 'skipCount': {
      if (typeof rep.count === 'string') count(rep.count, 'skips', 30);
      const s = val(rep.step);
      // Decimal jumps are drawn to the hundredth (SkipCount.tsx).
      if (s !== undefined && s < 0.01) out.push(`skip size ${s} < 0.01 (drawn as 0.01)`);
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
      const t = val(rep.total);
      const parts = rep.coins.map((c) => val(c.var));
      if (t !== undefined && parts.every((x) => x !== undefined)) {
        const sum =
          rep.coins.reduce((s, c, i) => s + c.cents * parts[i]!, 0) / (rep.dollars ? 100 : 1);
        if (Math.abs(sum - t) > 1e-9) out.push(`coins add to ${sum}, total shows ${t}`);
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
    case 'numberLine':
      for (const id of [rep.start, rep.end]) {
        const x = val(id);
        if (x !== undefined && (x < rep.min || x > rep.max)) {
          out.push(`number line point ${id} = ${x} off the line (${rep.min}–${rep.max})`);
        }
      }
      break;
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
      if (a !== undefined && b !== undefined && b >= 1 && Math.ceil(a / b) > 24) {
        out.push(`${a}/${b} needs ${Math.ceil(a / b)} wholes on the line`);
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
      for (const row of rep.rows) {
        const [a, b] = [val(row.num), val(row.den)];
        count(row.num, 'shaded parts');
        // One bar is one whole: more shaded parts than parts can't be drawn (the bar clamps).
        if (a !== undefined && b !== undefined && a > b) out.push(`${a}/${b} shaded on one bar`);
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
        // Up to 4 places on each side fit across a phone (AreaModel.tsx).
        for (const x of [a, b]) {
          if (x !== undefined && placeParts(x).length > 4)
            out.push(`area model factor ${x} has ${placeParts(x).length} parts`);
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
        if (q !== undefined && placeParts(q).length > 4)
          out.push(`area model quotient ${q} has ${placeParts(q).length} parts`);
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
      const [a, b, w] = [val(rep.parts[0]), val(rep.parts[1]), val(rep.whole)];
      for (const [id, x] of [
        [rep.parts[0], a],
        [rep.parts[1], b],
      ] as const) {
        if (x !== undefined && (x < 0 || x > 360)) out.push(`angle ${id} = ${x} is outside a turn`);
      }
      if (a !== undefined && b !== undefined && w !== undefined && Math.abs(a + b - w) > 1e-9) {
        out.push(`angles ${a} + ${b} drawn, whole shows ${w}`);
      }
      break;
    }
    case 'doubleNumberLine': {
      // The bottom reading is the top reading times the smaller units per bigger unit.
      const [t, b, k] = [val(rep.top), val(rep.bottom), val(rep.per)];
      count(rep.top, 'top units');
      if (t !== undefined && b !== undefined && k !== undefined && Math.abs(t * k - b) > 1e-6)
        out.push(`double number line: ${t} × ${k} ≠ ${b}`);
      break;
    }
    case 'coordinatePlane': {
      if (rep.quadrants === 1) {
        for (const id of [rep.x, rep.y, rep.second?.x, rep.second?.y]) {
          const x = id === undefined ? undefined : val(id);
          if (x !== undefined && x < 0) out.push(`${id} = ${x} is off the first quadrant`);
        }
      }
      if (rep.second && rep.slope) {
        const [x1, y1, x2, y2, m] = [rep.x, rep.y, rep.second.x, rep.second.y, rep.slope].map(val);
        if ([x1, y1, x2, y2, m].every((v) => v !== undefined) && x2! !== x1!) {
          const rise = (y2! - y1!) / (x2! - x1!);
          if (Math.abs(rise - m!) > 1e-6) out.push(`slope ${m} drawn, rise over run is ${rise}`);
        }
      }
      break;
    }
    case 'boxPlot': {
      const five = [rep.min, rep.q1, rep.median, rep.q3, rep.max].map(val);
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
      count(rep.length, 'cubes across', rep.max);
      count(rep.width, 'cubes back', rep.max);
      count(rep.height, 'layers', rep.max);
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
    case 'rockLayers':
      count(rep.fossils[0], 'layers', 12);
      count(rep.fossils[1], 'layers', 12);
      break;
    case 'pushes':
      count(rep.right, 'push');
      count(rep.left, 'push');
      break;
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
