/**
 * College Geography layout pages (sort, sequence, explore, observe) of every course whose home
 * field is `geography`, keyed by course topic (`<courseId>#<i>`, or `<courseId>#<i>~<slug>` for a
 * problem type), in taxonomy order. The calculators are in `../college/geography.ts`. Data only.
 */
import type { LayoutDef } from './types';

export const COLLEGE_GEOGRAPHY_LAYOUTS: LayoutDef[] = [
  // ── Human Geography → Population and migration ──
  {
    kind: 'sequence',
    id: 'he.geography.human-geography#0~transition',
    title: 'Stages of the demographic transition',
    use: 'Use this for “Which stage of the demographic transition is this country in, and what comes next?”',
    assumptions: [
      'The model follows birth and death rates as a country industrializes; the gap between them is the natural increase.',
      'Deaths fall first, so the population grows fastest while births are still high.',
      'It describes what happened in Europe; a country can stall in a stage, and migration is left out.',
    ],
    question: 'Put the stages of the demographic transition in order.',
    stages: [
      // In order: stages 1–5 (the labels don't number them, so the order is the student's).
      { label: 'High births and high deaths, slow growth' },
      { label: 'Deaths fall with better food, clean water and medicine; fast growth' },
      { label: 'Births fall with cities, schooling and women’s work; growth slows' },
      { label: 'Low births and low deaths, slow growth again' },
      { label: 'Births below deaths, the population declines' },
    ],
  },
];
