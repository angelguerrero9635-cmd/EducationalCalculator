import { COLLEGE_MODULES } from './college';
import { MATH_K_MODULES } from './math/k';
import { MATH_1_MODULES } from './math/1';
import { MATH_2_MODULES } from './math/2';
import { MATH_3_MODULES } from './math/3';
import { MATH_4_MODULES } from './math/4';
import { SCIENCE_K_MODULES } from './science/k';
import { SCIENCE_1_MODULES } from './science/1';
import { SCIENCE_2_MODULES } from './science/2';
import { SCIENCE_3_MODULES } from './science/3';
import { MATH_5_MODULES } from './math/5';
import { PILOT_MODULES } from './pilots';
import { GALLERY_MODULES } from './gallery';
import { LAYOUTS, getLayout, type LayoutDef } from './layouts';
import type { ModuleDef } from './types';

export type { ModuleDef, Representation } from './types';

export const MODULES: readonly ModuleDef[] = [
  ...MATH_K_MODULES,
  ...MATH_1_MODULES,
  ...MATH_2_MODULES,
  ...MATH_3_MODULES,
  ...MATH_4_MODULES,
  ...SCIENCE_K_MODULES,
  ...SCIENCE_1_MODULES,
  ...SCIENCE_2_MODULES,
  ...SCIENCE_3_MODULES,
  ...MATH_5_MODULES,
  ...PILOT_MODULES,
  ...COLLEGE_MODULES,
];

const BY_ID = new Map(MODULES.map((m) => [m.id, m]));
const GALLERY_BY_ID = new Map(GALLERY_MODULES.map((m) => [m.id, m]));

/** Module content for a skill id or topic key, if written yet (and the gallery's demos). */
export const getModule = (id: string): ModuleDef | undefined =>
  BY_ID.get(id) ?? GALLERY_BY_ID.get(id);

/** Every module the tests and the harness run over: the lessons and the gallery's demos. */
export const TESTED_MODULES: readonly ModuleDef[] = [...MODULES, ...GALLERY_MODULES];
export { GALLERY_MODULES };

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
