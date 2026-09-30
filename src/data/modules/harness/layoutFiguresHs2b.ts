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
