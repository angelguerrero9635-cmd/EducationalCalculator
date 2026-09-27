/** Draws a round-3 card icon with the group that names it. */
import type { ComponentType, ReactNode } from 'react';

import { R3A_ICONS } from '@/data/modules/layouts/icons/r3a';
import { R3B_ICONS } from '@/data/modules/layouts/icons/r3b';
import { R3C_ICONS } from '@/data/modules/layouts/icons/r3c';
import { R3D_ICONS } from '@/data/modules/layouts/icons/r3d';
import { R3E_ICONS } from '@/data/modules/layouts/icons/r3e';
import { R3F_ICONS } from '@/data/modules/layouts/icons/r3f';
import { R3G_ICONS } from '@/data/modules/layouts/icons/r3g';
import { R3H_ICONS } from '@/data/modules/layouts/icons/r3h';
import { R3I_ICONS } from '@/data/modules/layouts/icons/r3i';
import { R3J_ICONS } from '@/data/modules/layouts/icons/r3j';

import { R3AIcon } from './r3a';
import { R3BIcon } from './r3b';
import { R3CIcon } from './r3c';
import { R3DIcon } from './r3d';
import { R3EIcon } from './r3e';
import { R3FIcon } from './r3f';
import { R3GIcon } from './r3g';
import { R3HIcon } from './r3h';
import { R3IIcon } from './r3i';
import { R3JIcon } from './r3j';
import type { IconProps } from './types';

const GROUPS: [readonly string[], ComponentType<IconProps>][] = [
  [R3A_ICONS, R3AIcon],
  [R3B_ICONS, R3BIcon],
  [R3C_ICONS, R3CIcon],
  [R3D_ICONS, R3DIcon],
  [R3E_ICONS, R3EIcon],
  [R3F_ICONS, R3FIcon],
  [R3G_ICONS, R3GIcon],
  [R3H_ICONS, R3HIcon],
  [R3I_ICONS, R3IIcon],
  [R3J_ICONS, R3JIcon],
];

export function Round3Icon({ icon, ink }: IconProps): ReactNode {
  const Draw = GROUPS.find(([names]) => names.includes(icon))?.[1];
  return Draw ? <Draw icon={icon} ink={ink} /> : null;
}
