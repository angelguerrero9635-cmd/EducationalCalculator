/**
 * Layout pages (sort, sequence, explore, observe): each belongs to a skill, its parts fit
 * together (every card has a group, every scene fits the figure), and everything a student
 * reads meets the same reading-level and formatting rules as a calculator page.
 */
import { getProblemType, getSkill, problemTypes, topicOf } from '@/data/selectors';

import { LAYOUTS, getLayout, getPage, gradeOf, moduleOwner } from '..';
import { COLLEGE_LAYOUTS } from '../layouts';
import type { Figure, LayoutDef, Scene } from '../layouts';
import { isStandIn, pages } from '../harness/scope';
import { HSL_SCENE_FIELD } from '../typesHsl';
import { HS2F_SCENE_FIELD } from '../typesHs2f';
import { HS3C_SCENE_FIELD } from '../typesHs3c';
import { HS3D_SCENE_FIELD } from '../typesHs3d';
import { HE3D_SCENE_FIELD } from '../typesHe3d';
import { HE4D_SCENE_FIELD } from '../typesHe4d';
import { HE4M_SCENE_FIELD } from '../typesHe4m';

/** The scene field each explore figure draws from. */
const SCENE_FIELD: Record<Figure['kind'], keyof Scene | undefined> = {
  ...HSL_SCENE_FIELD,
  ...HS2F_SCENE_FIELD,
  ...HS3C_SCENE_FIELD,
  ...HS3D_SCENE_FIELD,
  ...HE3D_SCENE_FIELD,
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
  cell: 'cell',
  bodySystems: 'body',
  waterCycle: 'water',
  front: 'front',
  plates: 'plates',
  continents: 'continents',
  rockCycle: 'rock',
  foodWeb: 'web',
  leafCell: 'leafCell',
  carbonCycle: 'carbon',
  pedigree: 'family',
  molecules: 'molecules',
  ...HE4D_SCENE_FIELD, // HC113
  ...HE4M_SCENE_FIELD, // HC173
  phases: 'phase',
  periodicTable: 'elements',
  planets: 'planets',
  studyDesign: 'study',
  doubleCone: 'cone',
  macromolecules: 'macro',
  organelleEnergy: 'energy',
  cladogram: 'clade',
  nitrogenCycle: 'nitrogen',
  feedbackLoop: 'loop',
  immuneStages: 'immune',
  electrochemicalCell: 'galvanic',
  geneExpression: 'gene',
  dichotomousKey: 'key',
};

/**
 * Longest sentence per grade (as in standards.test.ts); a college page (`he.…`) reads at the
 * Grade 12 limit, 35 words (HE-E3).
 */
function wordLimit(id: string): number | undefined {
  if (id.startsWith('he.')) return 35;
  const grade = gradeOf(id);
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
/** A chemical formula or ion (H₂O, O₂, Fe³⁺, (2R,3S)-…): one word (HE-E25). */
const FORMULA = /^(?=.*[₀-₉⁺⁻])[([]?(?:[A-Z][a-z]?[₀-₉]*)+[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]*[)\]]?[.,;:]?$/;
const words = (s: string) =>
  s.split(/\s+/).filter((w) => /[A-Za-z]{2,}|\b[aI]\b/.test(w) || FORMULA.test(w)).length;
const sentences = (text: string) =>
  text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

/** Everything a student reads on the page. */
function studentText(
  l: LayoutDef,
): { where: string; text: string; prose: boolean; code?: boolean }[] {
  const out: { where: string; text: string; prose: boolean; code?: boolean }[] = [];
  l.assumptions.forEach((a, i) => out.push({ where: `assumption ${i + 1}`, text: a, prose: true }));
  if (l.use) out.push({ where: 'use', text: l.use, prose: true });
  if (l.title) out.push({ where: 'title', text: l.title, prose: false });
  switch (l.kind) {
    case 'sort':
      out.push({ where: 'question', text: l.question, prose: true });
      if (l.intro) out.push({ where: 'intro', text: l.intro, prose: true });
      l.bins.forEach((b) => {
        out.push({ where: `bin ${b.id}`, text: b.label, prose: false });
        out.push({ where: `bin ${b.id} why`, text: b.why, prose: true });
      });
      // (code cards, HE-E25, are code as written: straight quotes, no copy-editing)
      l.cards.forEach((c) =>
        out.push({ where: `card ${c.label}`, text: c.label, prose: false, code: l.code }),
      );
      break;
    case 'sequence':
      out.push({ where: 'question', text: l.question, prose: true });
      l.stages.forEach((s) =>
        out.push({ where: `stage ${s.label}`, text: s.label, prose: false, code: l.code }),
      );
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
      out.push({ where: 'pattern', text: l.pattern(l.initial, l.second?.initial), prose: true });
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

it('college layouts are read under their topic ids (HE-E2)', () => {
  expect(COLLEGE_LAYOUTS.length).toBeGreaterThan(0);
  for (const l of COLLEGE_LAYOUTS) {
    // A topic (`<courseId>#<i>`) or its problem type (`…#<i>~<slug>`), in LAYOUTS.
    expect(l.id).toMatch(/^he\.[\w-]+\.[\w-]+#\d+(~[\w-]+)?$/);
    expect(LAYOUTS).toContain(l);
    expect(getLayout(l.id)).toBe(l);
    expect(getPage(l.id)).toBe(l);
    if (l.id.includes('~')) {
      expect(getProblemType(l.id)?.topic?.key).toBe(moduleOwner(l.id));
      expect(problemTypes(moduleOwner(l.id)).map((t) => t.id)).toContain(l.id);
    }
  }
});

describe.each(pages(LAYOUTS))('layout %s', (id, l) => {
  if (isStandIn(id)) return void it.skip('no pages in scope', () => {});
  it('belongs to a skill or course topic, with a title and use line when it is a problem type', () => {
    expect(getSkill(moduleOwner(l.id)) ?? topicOf(moduleOwner(l.id))).toBeDefined();
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
        // Kindergarten children mostly cannot read yet: every math card is drawn.
        if (l.id.startsWith('m.K.')) expect(l.cards.filter((c) => !c.figure)).toEqual([]);
        break;
      }
      case 'sequence':
        expect(l.stages.length).toBeGreaterThanOrEqual(3);
        expect(new Set(l.stages.map((s) => s.label)).size).toBe(l.stages.length);
        // Every stage has a span, except that the last may be the end point (a frog).
        if (l.totalLabel) {
          expect(l.stages.slice(0, -1).every((s) => s.span !== undefined)).toBe(true);
        }
        // Signed spans (HE-E25) are whole changes with a net: every stage has one.
        if (l.signed) {
          expect(l.stages.every((s) => s.span !== undefined)).toBe(true);
          expect(l.totalLabel).toBeDefined();
        }
        break;
      case 'explore':
        expect(l.scenes.length).toBeGreaterThanOrEqual(2);
        for (const s of l.scenes) {
          expect(s.lines.length).toBeGreaterThanOrEqual(1);
          if (l.figure.kind === 'parts') {
            expect(l.figure.parts.map((p) => p.name)).toContain(s.part);
            for (const also of s.alsoLit ?? []) {
              expect(l.figure.parts.map((p) => p.name)).toContain(also);
            }
          }
          // Every figure but `parts` reads its scene from one field.
          const field = SCENE_FIELD[l.figure.kind];
          if (field) expect(s[field]).toBeDefined();
          if (s.table) {
            // Rows, columns and a turn-around pair's two factors are the table's 0–10.
            const all = [
              ...(s.table.rows ?? []),
              ...(s.table.columns ?? []),
              ...(s.table.pair ?? []),
            ];
            for (const n of all) {
              expect(Number.isInteger(n) && n >= 0 && n <= 10).toBe(true);
            }
          }
        }
        break;
      case 'observe':
        expect(l.initial).toHaveLength(l.columns.length);
        if (l.second) expect(l.second.initial).toHaveLength(l.columns.length);
        // Each row on its own range (H109: a second row's own scale, values below 0).
        for (const [xs, lo, hi, step] of [
          [l.initial, l.min ?? 0, l.max, l.step] as const,
          ...(l.second
            ? [
                [
                  l.second.initial,
                  l.second.min ?? l.min ?? 0,
                  l.second.max ?? l.max,
                  l.second.step ?? l.step,
                ] as const,
              ]
            : []),
        ]) {
          for (const x of xs) {
            expect(x).toBeGreaterThanOrEqual(lo);
            expect(x).toBeLessThanOrEqual(hi);
            expect(Math.abs(x % step)).toBe(0);
          }
        }
        break;
    }
  });

  it('reads at the grade level and is formatted the way the copy editor expects', () => {
    const limit = wordLimit(l.id);
    const failures = studentText(l).flatMap(({ where, text, prose, code }) => {
      const out: string[] = [];
      if (code) return out;
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
