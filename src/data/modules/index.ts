import { COLLEGE_MODULES } from './college';
import { K12_MODULES } from './k12';
import { MATH_K2_MODULES } from './math-k2';
import type { ModuleDef } from './types';

export type { ModuleDef, Representation } from './types';

export const MODULES: readonly ModuleDef[] = [
  ...K12_MODULES,
  ...MATH_K2_MODULES,
  ...COLLEGE_MODULES,
];

const BY_ID = new Map(MODULES.map((m) => [m.id, m]));

/** Module content for a skill id or topic key, if written yet. */
export const getModule = (id: string): ModuleDef | undefined => BY_ID.get(id);
