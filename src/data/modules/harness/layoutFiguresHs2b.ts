/**
 * Card figure checks for group H2B's geometry cards (H96, `typesHs2b.ts`): every mark means
 * what it says on the drawn figure. Called from `layoutFigureIssues`. Test-only.
 */
import { anglesOf, cornersOf } from '@/components/module/layouts/cardHs2bMath';

import type { CardFigure, LayoutDef } from '../layouts';
import type { TriCorner, TriSide } from '../typesHs2b';

const same = (x: number, y: number) => Math.abs(x - y) <= 1e-6 * Math.max(1, Math.abs(x));

/** Where one card figure breaks its own marks. */
export function hs2bCardIssues(f: CardFigure): string[] {
  const out: string[] = [];
  if (f.kind === 'markedTriangles') {
    if (f.triangles.some((t) => !cornersOf(t))) return ['a triangle whose sides don’t close'];
    const side = (k: number, s: TriSide) => f.triangles[k]![['a', 'b', 'c'].indexOf(s)]!;
    const angle = (k: number, n: TriCorner) => anglesOf(f.triangles[k]!)[n];
    // Equal counts mean equal parts, on both triangles.
    const groups = <T extends string>(marks: Partial<Record<T, number>> | undefined) => {
      const m = new Map<number, T[]>();
      for (const [p, n] of Object.entries(marks ?? {}) as [T, number][])
        m.set(n, [...(m.get(n) ?? []), p]);
      return [...m.values()];
    };
    for (const g of groups<TriSide>(f.ticks)) {
      const ls = g.flatMap((s) => [side(0, s), side(1, s)]);
      if (ls.some((l) => !same(l, ls[0]!))) out.push(`ticks on unequal sides ${ls.join(', ')}`);
    }
    for (const g of groups<TriCorner>(f.arcs)) {
      const as = g.flatMap((n) => [angle(0, n), angle(1, n)]);
      if (as.some((a) => !same(a, as[0]!))) out.push(`arcs on unequal angles ${as.join(', ')}`);
    }
    for (const n of f.right ?? [])
      for (const k of [0, 1])
        if (Math.abs(angle(k, n) - 90) > 1e-4) out.push(`right mark at ${n} on ${angle(k, n)}°`);
  }
  if (f.kind === 'construction') {
    const pts = f.points;
    // Named in 0.5 of a 100 box, or 1° apart: the eye can't tell less.
    const close = (x: number, y: number, tol: number) => Math.abs(x - y) <= tol;
    const d = (a: string, b: string) =>
      Math.hypot(pts[a]![0] - pts[b]![0], pts[a]![1] - pts[b]![1]);
    const ang = (s: string) => {
      const [p, v, q] = [...s].map((n) => pts[n]!);
      const a = Math.atan2(p![1] - v![1], p![0] - v![0]);
      const b = Math.atan2(q![1] - v![1], q![0] - v![0]);
      let x = Math.abs(a - b);
      if (x > Math.PI) x = 2 * Math.PI - x;
      return (x * 180) / Math.PI;
    };
    for (const n of Object.keys(pts))
      if ([...n].length !== 1) out.push(`point "${n}" is not one letter`);
    const ids = new Set<string>();
    const tick = new Map<number, number[]>();
    const arc = new Map<number, number[]>();
    for (const part of f.parts) {
      if (part.id) ids.add(part.id);
      const names = Object.entries(part)
        .filter(([k]) => !['id', 'dashed', 'count', 'span', 'text'].includes(k))
        .flatMap(([, v]) => [...String(v)]);
      const missing = names.filter((n) => !(n in pts));
      if (missing.length) {
        out.push(`a part names points ${missing.join(', ')} that aren't placed`);
        continue;
      }
      if (
        'compass' in part &&
        'from' in part &&
        !close(d(part.compass, part.from), d(part.compass, part.to), 0.5)
      )
        out.push(
          `compass arc about ${part.compass} doesn't reach both ${part.from} and ${part.to}`,
        );
      if ('ticks' in part) {
        const [a, b] = [...part.ticks];
        tick.set(part.count, [...(tick.get(part.count) ?? []), d(a!, b!)]);
      }
      if ('arcs' in part) arc.set(part.count, [...(arc.get(part.count) ?? []), ang(part.arcs)]);
      if ('right' in part && !close(ang(part.right), 90, 1))
        out.push(`right mark on ${ang(part.right)}°`);
    }
    for (const ls of tick.values())
      if (ls.some((l) => !close(l, ls[0]!, 0.5)))
        out.push(`ticks on unequal sides ${ls.join(', ')}`);
    for (const as of arc.values())
      if (as.some((a) => !close(a, as[0]!, 1))) out.push(`arcs on unequal angles ${as.join(', ')}`);
    for (const id of f.lit ?? []) if (!ids.has(id)) out.push(`lit part "${id}" is not drawn`);
  }
  return out;
}

export function hs2bFigureIssues(l: LayoutDef): string[] {
  const figures =
    l.kind === 'sequence'
      ? l.stages.map((s) => ({ label: s.label, f: s.figure }))
      : l.kind === 'sort'
        ? l.cards.map((s) => ({ label: s.label, f: s.figure }))
        : [];
  return figures.flatMap(({ label, f }) =>
    f ? hs2bCardIssues(f).map((x) => `card "${label}": ${x}`) : [],
  );
}
