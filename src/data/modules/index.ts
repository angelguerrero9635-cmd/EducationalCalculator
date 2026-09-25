import { COLLEGE_MODULES } from './college';
import { K12_MODULES } from './k12';
import { MATH_K2_MODULES } from './math-k2';
import { MATH_K2_EXTRA_MODULES } from './math-k2-extra';
import { MATH_K2_MORE_MODULES } from './math-k2-more';
import { MATH_3_MODULES } from './math-3';
import { MATH_3_MORE_MODULES } from './math-3-more';
import { MATH_4_MODULES } from './math-4';
import { SCIENCE_3_MODULES } from './science-3';
import { SCIENCE_K2_MODULES } from './science-k2';
import { LAYOUTS, getLayout, type LayoutDef } from './layouts';
import type { ModuleDef } from './types';
import { PROBLEM_TYPE_USES } from './uses';

export type { ModuleDef, Representation } from './types';

export const MODULES: readonly ModuleDef[] = [
  ...K12_MODULES,
  ...MATH_K2_MODULES,
  ...MATH_K2_EXTRA_MODULES,
  ...MATH_K2_MORE_MODULES,
  ...MATH_3_MODULES,
  ...MATH_3_MORE_MODULES,
  ...MATH_4_MODULES,
  ...SCIENCE_K2_MODULES,
  ...SCIENCE_3_MODULES,
  ...COLLEGE_MODULES,
].map((m) => (PROBLEM_TYPE_USES[m.id] ? { ...m, use: PROBLEM_TYPE_USES[m.id] } : m));

const BY_ID = new Map(MODULES.map((m) => [m.id, m]));

/** Module content for a skill id or topic key, if written yet. */
export const getModule = (id: string): ModuleDef | undefined => BY_ID.get(id);

export { getLayout, LAYOUTS, type LayoutDef } from './layouts';
export { layoutSummary } from './layouts';

/** A page of either kind: a calculator module or a layout page. */
export const getPage = (id: string): ModuleDef | LayoutDef | undefined =>
  BY_ID.get(id) ?? getLayout(id);

export {
  gradeBand,
  gradeOf,
  isEarlyGrade,
  isElementary,
  quantityLabel,
  type GradeBand,
} from './grade';

/** The skill or topic a module belongs to (`m.2.money~making-change` → `m.2.money`). */
export const moduleOwner = (moduleId: string) => moduleId.split('~')[0]!;

/** Every module for a skill or topic: the main one (id = the skill id) first. */
export const getModules = (id: string): ModuleDef[] =>
  MODULES.filter((m) => moduleOwner(m.id) === id).sort(
    (a, b) => Number(a.id !== id) - Number(b.id !== id),
  );

/** Every page id for a skill or topic (calculators and layouts), the main one first. */
export const getPageIds = (id: string): string[] =>
  [...MODULES.map((m) => m.id), ...LAYOUTS.map((l) => l.id)]
    .filter((x) => moduleOwner(x) === id)
    .sort((a, b) => Number(a !== id) - Number(b !== id));
