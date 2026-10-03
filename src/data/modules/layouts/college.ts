/**
 * Every college layout page, one file per field (`college<Field>.ts`), read by `getLayout` and
 * `getPage` under its topic id (`<courseId>#<i>`) or problem-type id (`…#<i>~<slug>`).
 * `node scripts/promote-demo.mjs` creates a missing field file and adds it here.
 */
import type { LayoutDef } from './types';

import { COLLEGE_MATH_LAYOUTS } from './collegeMath';
import { COLLEGE_PHYSICS_LAYOUTS } from './collegePhysics';
import { COLLEGE_GEOGRAPHY_LAYOUTS } from './collegeGeography';
import { COLLEGE_ELECTRICAL_LAYOUTS } from './collegeElectrical';
import { COLLEGE_CHEMISTRY_LAYOUTS } from './collegeChemistry';

export const COLLEGE_LAYOUTS: LayoutDef[] = [
  ...COLLEGE_MATH_LAYOUTS,
  ...COLLEGE_PHYSICS_LAYOUTS,
  ...COLLEGE_GEOGRAPHY_LAYOUTS,
  ...COLLEGE_ELECTRICAL_LAYOUTS,
  ...COLLEGE_CHEMISTRY_LAYOUTS,
];
