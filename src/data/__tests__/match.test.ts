// @ts-nocheck
/**
 * The problem matcher: unit checks on the features it reads, and an accuracy check against
 * the released questions in research/questions (reference only, read here, never shipped):
 * the right skill should be among the top three pages for most questions.
 */
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

import { matchProblem, numberFeatures, tokenize } from '@/data/match';
import { moduleOwner } from '@/data/modules';

describe('number features', () => {
  it('reads decimals, fractions, percents, money, negatives and units', () => {
    const f = numberFeatures(
      'Find 0.7 × 0.4. Then 3/4 of $12.50 at 25% off, from −5 °C, in 30 inches.',
    );
    expect(f.decimals).toBe(true);
    expect(f.fractions).toBe(true);
    expect(f.percent).toBe(true);
    expect(f.money).toBe(true);
    expect(f.negatives).toBe(true);
    expect(f.units.has('length')).toBe(true);
    expect(f.units.has('temperature')).toBe(true);
    expect(f.max).toBe(30);
  });

  it('stems lightly and drops stop words', () => {
    expect(tokenize('The boxes were adding cubes')).toEqual(['box', 'add', 'cube']);
  });
});

describe('matching', () => {
  it.each([
    ['17 fish and 9 fish. How many more fish?', 'm.1.add-sub-20'],
    ['Which is greater: 425,900 or 452,000?', 'm.4.place-value-million'],
    ['What is the value of 0.7 × 0.4?', 'm.5.decimal-operations'],
    ['A rug is 3/4 yard by 2/3 yard. What is its area?', 'm.5.multiply-fractions'],
    ['Write 3/5 as a decimal and a percent.', 'm.6.percent'],
    ['The water rose from 50 mL to 62 mL. What is the object’s density?', 's.6.density'],
    ['How many inches are in 2.5 feet?', 'm.5.convert-units'],
  ])('%s → %s', (problem, skill) => {
    const top = matchProblem(problem, 3).map((r) => moduleOwner(r.id));
    expect(top).toContain(skill);
  });

  it('returns nothing for empty or meaningless text', () => {
    expect(matchProblem('')).toEqual([]);
    expect(matchProblem('the and of')).toEqual([]);
  });
});

describe('released questions (research/questions)', () => {
  const root = join(__dirname, '..', '..', '..', 'research', 'questions');
  const records: { skillId: string; alsoSkills?: string[]; question: string; id: string }[] = [];
  for (const subject of ['math', 'science']) {
    let files: string[] = [];
    try {
      files = readdirSync(join(root, subject)).filter((f) => f.endsWith('.jsonl'));
    } catch {
      files = [];
    }
    for (const f of files)
      for (const line of readFileSync(join(root, subject, f), 'utf8').split('\n'))
        if (line.trim()) records.push(JSON.parse(line));
  }
  const usable = records.filter((r) => /^[ms]\.(K|[1-6])\./.test(r.skillId));

  it('puts the right skill in the top three for most questions', () => {
    if (usable.length === 0) return;
    let top1 = 0;
    let top3 = 0;
    const misses: string[] = [];
    for (const r of usable) {
      const want = new Set([r.skillId, ...(r.alsoSkills ?? [])]);
      const got = matchProblem(r.question, 3).map((m) => m.owner.id);
      if (got[0] && want.has(got[0])) top1++;
      if (got.some((g) => want.has(g))) top3++;
      else misses.push(`${r.id} (${r.skillId}) → ${got.join(', ') || 'nothing'}`);
    }
    const p = (n: number) => `${((100 * n) / usable.length).toFixed(1)}%`;
    console.log(
      `matcher: ${usable.length} released K–6 questions, top-1 ${p(top1)}, top-3 ${p(top3)}\n` +
        misses.slice(0, 25).join('\n'),
    );
    expect(top3 / usable.length).toBeGreaterThan(0.65);
  });
});
