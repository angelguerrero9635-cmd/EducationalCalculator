import { COLLEGE_MODULES } from './college';
import { K12_MODULES } from './k12';
import { MATH_K2_MODULES } from './math-k2';
import { MATH_K2_EXTRA_MODULES } from './math-k2-extra';
import type { ModuleDef } from './types';

export type { ModuleDef, Representation } from './types';

export const MODULES: readonly ModuleDef[] = [
  ...K12_MODULES,
  ...MATH_K2_MODULES,
  ...MATH_K2_EXTRA_MODULES,
  ...COLLEGE_MODULES,
];

const BY_ID = new Map(MODULES.map((m) => [m.id, m]));

/** Module content for a skill id or topic key, if written yet. */
export const getModule = (id: string): ModuleDef | undefined => BY_ID.get(id);

/** The skill or topic a module belongs to (`m.2.money~making-change` → `m.2.money`). */
export const moduleOwner = (moduleId: string) => moduleId.split('~')[0]!;

/** Every module for a skill or topic: the main one (id = the skill id) first. */
export const getModules = (id: string): ModuleDef[] =>
  MODULES.filter((m) => moduleOwner(m.id) === id).sort(
    (a, b) => Number(a.id !== id) - Number(b.id !== id),
  );
