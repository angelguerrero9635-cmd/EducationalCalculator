/**
 * H99: the words for a t curve on `normalCurve` (`t: { df }`): what the solid and the dashed
 * curves are, and how close the t curve is to the normal.
 */
import { formatNumber } from '@/engine/format';

import { invT } from './statMath';

/** "t curve, df = 9 (solid), over the normal (dashed): …; t⋆ = 2.262 for 95%, not 1.96." */
export function tCurveWords(df: number): string {
  const star = formatNumber(Number(invT(0.975, df).toFixed(3)));
  return `t curve with df = ${formatNumber(df)} (solid) over the normal (dashed): ${
    df >= 30 ? 'nearly the same' : 'lower in the middle, heavier in the tails'
  }; t⋆ = ${star} for 95%, where z⋆ = 1.96.`;
}
