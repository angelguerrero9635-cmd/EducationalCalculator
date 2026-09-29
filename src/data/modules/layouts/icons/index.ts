/** Card icons from round 3 on (R3*, then the Grades 9–12 groups H*), one list per drawing group
 * so the groups merge easily. */
import { R3A_ICONS } from './r3a';
import { R3B_ICONS } from './r3b';
import { R3C_ICONS } from './r3c';
import { R3D_ICONS } from './r3d';
import { R3E_ICONS } from './r3e';
import { R3F_ICONS } from './r3f';
import { R3G_ICONS } from './r3g';
import { R3H_ICONS } from './r3h';
import { R3I_ICONS } from './r3i';
import { R3J_ICONS } from './r3j';
import { HA_ICONS } from './ha';
import { HB_ICONS } from './hb';
import { HC_ICONS } from './hc';
import { HD_ICONS } from './hd';
import { HE_ICONS } from './he';
import { HF_ICONS } from './hf';
import { HG_ICONS } from './hg';
import { HH_ICONS } from './hh';
import { HI_ICONS } from './hi';
import { HJ_ICONS } from './hj';
import { HK_ICONS } from './hk';
import { HL_ICONS } from './hl';

export const ROUND3_ICONS: readonly string[] = [
  ...R3A_ICONS,
  ...R3B_ICONS,
  ...R3C_ICONS,
  ...R3D_ICONS,
  ...R3E_ICONS,
  ...R3F_ICONS,
  ...R3G_ICONS,
  ...R3H_ICONS,
  ...R3I_ICONS,
  ...R3J_ICONS,
  ...HA_ICONS,
  ...HB_ICONS,
  ...HC_ICONS,
  ...HD_ICONS,
  ...HE_ICONS,
  ...HF_ICONS,
  ...HG_ICONS,
  ...HH_ICONS,
  ...HI_ICONS,
  ...HJ_ICONS,
  ...HK_ICONS,
  ...HL_ICONS,
];

export type Round3Icon =
  | (typeof R3A_ICONS)[number]
  | (typeof R3B_ICONS)[number]
  | (typeof R3C_ICONS)[number]
  | (typeof R3D_ICONS)[number]
  | (typeof R3E_ICONS)[number]
  | (typeof R3F_ICONS)[number]
  | (typeof R3G_ICONS)[number]
  | (typeof R3H_ICONS)[number]
  | (typeof R3I_ICONS)[number]
  | (typeof R3J_ICONS)[number]
  | (typeof HA_ICONS)[number]
  | (typeof HB_ICONS)[number]
  | (typeof HC_ICONS)[number]
  | (typeof HD_ICONS)[number]
  | (typeof HE_ICONS)[number]
  | (typeof HF_ICONS)[number]
  | (typeof HG_ICONS)[number]
  | (typeof HH_ICONS)[number]
  | (typeof HI_ICONS)[number]
  | (typeof HJ_ICONS)[number]
  | (typeof HK_ICONS)[number]
  | (typeof HL_ICONS)[number];

export const isRound3Icon = (icon: string): icon is Round3Icon => ROUND3_ICONS.includes(icon);
