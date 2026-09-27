/** Round-3 card icons, one list per drawing group so the groups merge easily. */
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
  | (typeof R3J_ICONS)[number];

export const isRound3Icon = (icon: string): icon is Round3Icon => ROUND3_ICONS.includes(icon);
