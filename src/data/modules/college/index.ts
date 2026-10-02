/**
 * Every college calculator module, one file per field (`college/<field>.ts`, the field a
 * course's id or taxonomy entry names first: `he.engineering.circuits-1` is `electrical`).
 * `pnpm new-module he.<field>.<course>#<i>[~slug]` creates a missing field file and adds it
 * here. Layout pages are in `../layouts/college<Field>.ts`.
 */
import type { ModuleDef } from '../types';

import { COLLEGE_MATH_MODULES } from './math';
import { COLLEGE_PHYSICS_MODULES } from './physics';
import { COLLEGE_GEOGRAPHY_MODULES } from './geography';
import { COLLEGE_ELECTRICAL_MODULES } from './electrical';

export const COLLEGE_MODULES: ModuleDef[] = [
  ...COLLEGE_MATH_MODULES,
  ...COLLEGE_PHYSICS_MODULES,
  ...COLLEGE_GEOGRAPHY_MODULES,
  ...COLLEGE_ELECTRICAL_MODULES,
];
