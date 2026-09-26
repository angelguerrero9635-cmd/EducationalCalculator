/**
 * Layout pages (sort, sequence, explore, observe): each belongs to a skill, its parts fit
 * together (every card has a group, every scene fits the figure), and everything a student
 * reads meets the same reading-level and formatting rules as a calculator page.
 */
import { getSkill } from '@/data/selectors';

import { LAYOUTS, gradeOf, moduleOwner } from '..';
import type { Figure, LayoutDef, Scene } from '../layouts';

/** The scene field each explore figure draws from. */
const SCENE_FIELD: Record<Figure['kind'], keyof Scene | undefined> = {
  parts: 'part',
  position: 'position',
  clock: 'time',
  dots: 'dots',
  magnets: 'poles',
  flashes: 'flashes',
  lightPath: 'light',
  particles: 'particles',
  earth: 'earth',
  push: 'push',
  vibration: 'vibrate',
  sky: 'sky',
  static: 'charge',
  timesTable: 'table',
};

/** Longest sentence per grade (as in standards.test.ts). */
function wordLimit(grade: string | undefined): number | undefined {
  if (grade === undefined) return undefined;
  const g = grade === 'K' ? 0 : Number(grade);
  if (g <= 1) return 12;
  if (g <= 3) return 18;
  if (g <= 5) return 22;
  return 30;
}
const FORMAT: [RegExp, string][] = [
  [/\d -\s?\d|\d - \d/, 'hyphen for minus (use −)'],
  [/\d x \d/, 'x for times (use ×)'],
  [/"/, 'straight double quotes (use “ ”)'],
  [/\w'\w/, 'straight apostrophe (use ’)'],
  [/  (?!\S*$)/, 'double space'],
  [/\.\./, 'double period (use …)'],
  [/\s[,.;:]/, 'space before punctuation'],
];
const words = (s: string) => s.split(/\s+/).filter((w) => /[A-Za-z]{2,}|\b[aI]\b/.test(w)).length;
const sentences = (text: string) =>
  text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

/** Everything a student reads on the page. */
function studentText(l: LayoutDef): { where: string; text: string; prose: boolean }[] {
  const out: { where: string; text: string; prose: boolean }[] = [];
  l.assumptions.forEach((a, i) => out.push({ where: `assumption ${i + 1}`, text: a, prose: true }));
  if (l.use) out.push({ where: 'use', text: l.use, prose: true });
  if (l.title) out.push({ where: 'title', text: l.title, prose: false });
  switch (l.kind) {
    case 'sort':
      out.push({ where: 'question', text: l.question, prose: true });
      l.bins.forEach((b) => {
        out.push({ where: `bin ${b.id}`, text: b.label, prose: false });
        out.push({ where: `bin ${b.id} why`, text: b.why, prose: true });
      });
      l.cards.forEach((c) => out.push({ where: `card ${c.label}`, text: c.label, prose: false }));
      break;
    case 'sequence':
      out.push({ where: 'question', text: l.question, prose: true });
      l.stages.forEach((s) => out.push({ where: `stage ${s.label}`, text: s.label, prose: false }));
      break;
    case 'explore':
      l.scenes.forEach((s) => {
        out.push({ where: `scene ${s.label}`, text: s.label, prose: false });
        s.lines.forEach((line, i) =>
          out.push({ where: `scene ${s.label} line ${i + 1}`, text: line, prose: true }),
        );
      });
      if (l.figure.kind === 'parts') {
        l.figure.parts.forEach((p) =>
          out.push({ where: `part ${p.name}`, text: p.job, prose: true }),
        );
      }
      break;
    case 'observe':
      out.push({ where: 'pattern', text: l.pattern(l.initial), prose: true });
      out.push({ where: 'pattern (equal)', text: l.pattern(l.initial.map(() => 10)), prose: true });
      l.columns.forEach((col) => out.push({ where: `column ${col}`, text: col, prose: false }));
      break;
  }
  return out;
}

it('layout ids are unique and never shared with a calculator module', async () => {
  const { MODULES } = await import('..');
  const ids = LAYOUTS.map((l) => l.id);
  expect(new Set(ids).size).toBe(ids.length);
  expect(ids.filter((id) => MODULES.some((m) => m.id === id))).toEqual([]);
});

describe.each(LAYOUTS.map((l) => [l.id, l] as [string, LayoutDef]))('layout %s', (_, l) => {
  it('belongs to a skill, with a title and use line when it is a problem type', () => {
    expect(getSkill(moduleOwner(l.id))).toBeDefined();
    if (l.id.includes('~')) {
      expect(l.title).toBeTruthy();
      expect(l.use).toMatch(/^Use this/);
    } else {
      expect(l.title).toBeUndefined();
    }
    expect(l.assumptions.length).toBeGreaterThanOrEqual(2);
  });

  it('fits together', () => {
    switch (l.kind) {
      case 'sort': {
        const binIds = l.bins.map((b) => b.id);
        expect(new Set(binIds).size).toBe(binIds.length);
        expect(l.bins.length).toBeGreaterThanOrEqual(2);
        for (const card of l.cards) expect(binIds).toContain(card.bin);
        for (const bin of l.bins) expect(l.cards.some((c) => c.bin === bin.id)).toBe(true);
        expect(new Set(l.cards.map((c) => c.label)).size).toBe(l.cards.length);
        break;
      }
      case 'sequence':
        expect(l.stages.length).toBeGreaterThanOrEqual(3);
        expect(new Set(l.stages.map((s) => s.label)).size).toBe(l.stages.length);
        // Every stage has a span, except that the last may be the end point (a frog).
        if (l.totalLabel) {
          expect(l.stages.slice(0, -1).every((s) => s.span !== undefined)).toBe(true);
        }
        break;
      case 'explore':
        expect(l.scenes.length).toBeGreaterThanOrEqual(2);
        for (const s of l.scenes) {
          expect(s.lines.length).toBeGreaterThanOrEqual(1);
          if (l.figure.kind === 'parts') {
            expect(l.figure.parts.map((p) => p.name)).toContain(s.part);
          }
          // Every figure but `parts` reads its scene from one field.
          const field = SCENE_FIELD[l.figure.kind];
          if (field) expect(s[field]).toBeDefined();
          if (s.table) {
            for (const n of [...(s.table.rows ?? []), ...(s.table.columns ?? [])]) {
              expect(n >= 0 && n <= 10).toBe(true);
            }
          }
        }
        break;
      case 'observe':
        expect(l.initial).toHaveLength(l.columns.length);
        for (const x of l.initial) {
          expect(x).toBeGreaterThanOrEqual(0);
          expect(x).toBeLessThanOrEqual(l.max);
          expect(x % l.step).toBe(0);
        }
        break;
    }
  });

  it('reads at the grade level and is formatted the way the copy editor expects', () => {
    const limit = wordLimit(gradeOf(l.id));
    const failures = studentText(l).flatMap(({ where, text, prose }) => {
      const out: string[] = [];
      const bad = FORMAT.find(([re]) => re.test(text));
      if (bad) out.push(`${where}: ${bad[1]} — "${text}"`);
      if (prose && !/[.!?”…]$/.test(text))
        out.push(`${where}: sentence needs a period — "${text}"`);
      // (a time label ends in a.m. or p.m.: that period is part of the abbreviation)
      if (!prose && /\.$/.test(text) && !/\b[ap]\.m\.$/.test(text)) {
        out.push(`${where}: no period on a label — "${text}"`);
      }
      if (prose && limit !== undefined) {
        const long = sentences(text).find((s) => words(s) > limit);
        if (long) out.push(`${where}: ${words(long)} words, limit ${limit} — "${long}"`);
      }
      return out;
    });
    expect(failures).toEqual([]);
  });
});
