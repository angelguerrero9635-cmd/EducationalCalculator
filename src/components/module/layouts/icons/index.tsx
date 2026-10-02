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
import { HA_ICONS } from '@/data/modules/layouts/icons/ha';
import { HB_ICONS } from '@/data/modules/layouts/icons/hb';
import { HC_ICONS } from '@/data/modules/layouts/icons/hc';
import { HD_ICONS } from '@/data/modules/layouts/icons/hd';
import { HE_ICONS } from '@/data/modules/layouts/icons/he';
import { HF_ICONS } from '@/data/modules/layouts/icons/hf';
import { HG_ICONS } from '@/data/modules/layouts/icons/hg';
import { HH_ICONS } from '@/data/modules/layouts/icons/hh';
import { HI_ICONS } from '@/data/modules/layouts/icons/hi';
import { HJ_ICONS } from '@/data/modules/layouts/icons/hj';
import { HK_ICONS } from '@/data/modules/layouts/icons/hk';
import { HL_ICONS } from '@/data/modules/layouts/icons/hl';
import { H2A_ICONS } from '@/data/modules/layouts/icons/h2a';
import { H2B_ICONS } from '@/data/modules/layouts/icons/h2b';
import { H2C_ICONS } from '@/data/modules/layouts/icons/h2c';
import { H2D_ICONS } from '@/data/modules/layouts/icons/h2d';
import { H2E_ICONS } from '@/data/modules/layouts/icons/h2e';
import { H2F_ICONS } from '@/data/modules/layouts/icons/h2f';
import { H2G_ICONS } from '@/data/modules/layouts/icons/h2g';
import { H2H_ICONS } from '@/data/modules/layouts/icons/h2h';
import { H3A_ICONS } from '@/data/modules/layouts/icons/h3a';
import { H3B_ICONS } from '@/data/modules/layouts/icons/h3b';
import { H3C_ICONS } from '@/data/modules/layouts/icons/h3c';
import { H3D_ICONS } from '@/data/modules/layouts/icons/h3d';
import { H3E_ICONS } from '@/data/modules/layouts/icons/h3e';
import { HE3I_ICONS } from '@/data/modules/layouts/icons/he3i';

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
import { HAIcon } from './ha';
import { HBIcon } from './hb';
import { HCIcon } from './hc';
import { HDIcon } from './hd';
import { HEIcon } from './he';
import { HFIcon } from './hf';
import { HGIcon } from './hg';
import { HHIcon } from './hh';
import { HIIcon } from './hi';
import { HJIcon } from './hj';
import { HKIcon } from './hk';
import { HLIcon } from './hl';
import { H2AIcon } from './h2a';
import { H2BIcon } from './h2b';
import { H2CIcon } from './h2c';
import { H2DIcon } from './h2d';
import { H2EIcon } from './h2e';
import { H2FIcon } from './h2f';
import { H2GIcon } from './h2g';
import { H2HIcon } from './h2h';
import { H3AIcon } from './h3a';
import { H3BIcon } from './h3b';
import { H3CIcon } from './h3c';
import { H3DIcon } from './h3d';
import { H3EIcon } from './h3e';
import { He3iIcon } from './he3i';
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
  [HA_ICONS, HAIcon],
  [HB_ICONS, HBIcon],
  [HC_ICONS, HCIcon],
  [HD_ICONS, HDIcon],
  [HE_ICONS, HEIcon],
  [HF_ICONS, HFIcon],
  [HG_ICONS, HGIcon],
  [HH_ICONS, HHIcon],
  [HI_ICONS, HIIcon],
  [HJ_ICONS, HJIcon],
  [HK_ICONS, HKIcon],
  [HL_ICONS, HLIcon],
  [H2A_ICONS, H2AIcon],
  [H2B_ICONS, H2BIcon],
  [H2C_ICONS, H2CIcon],
  [H2D_ICONS, H2DIcon],
  [H2E_ICONS, H2EIcon],
  [H2F_ICONS, H2FIcon],
  [H2G_ICONS, H2GIcon],
  [H2H_ICONS, H2HIcon],
  [H3A_ICONS, H3AIcon],
  [H3B_ICONS, H3BIcon],
  [H3C_ICONS, H3CIcon],
  [H3D_ICONS, H3DIcon],
  [H3E_ICONS, H3EIcon],
  [HE3I_ICONS, He3iIcon],
];

export function Round3Icon({ icon, ink }: IconProps): ReactNode {
  const Draw = GROUPS.find(([names]) => names.includes(icon))?.[1];
  return Draw ? <Draw icon={icon} ink={ink} /> : null;
}
