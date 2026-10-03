/**
 * The `skeletal` card figure (HC2, `typesHe1c.ts`): one line-angle structure on a sort card or
 * a sequence stage, 112 × 76, in the card's text color with the lit group in its shade, chain
 * numbers, and CIP ranks with R or S on a chosen center. Flat.
 */
import { G } from 'react-native-svg';

import { fitLayout, SkeletalView } from '@/components/module/reps/skeletalDraw';
import {
  chainNumbers,
  cipRanks,
  configurationOf,
  layoutMol,
  litAtoms,
  parseSmiles,
} from '@/components/module/reps/skeletalMath';
import { SKELETAL_CARD_H, SKELETAL_CARD_W, type SkeletalCard } from '@/data/modules/typesHe1c';
import { chart, usePalette } from '@/theme';

export function SkeletalCardView({
  f,
  ink,
  shade,
}: {
  f: SkeletalCard;
  ink: string;
  shade: string;
}) {
  const pal = usePalette();
  const mol = parseSmiles(f.smiles);
  if (mol.error) return <G />;
  const lay = layoutMol(mol, { aspect: SKELETAL_CARD_W / SKELETAL_CARD_H, center: f.center });
  const numbers = chainNumbers(mol, f.numbered);
  // Chain numbers and charge rings sit outside the end corners: room for them at the edges.
  const outside = numbers.size > 0 || /[+-]/.test(f.smiles);
  const fit = fitLayout(lay, SKELETAL_CARD_W, SKELETAL_CARD_H, 24, outside ? 15 : 5, chart.label);
  const ranks = f.center !== undefined && f.ranks !== false ? cipRanks(mol, f.center) : undefined;
  const rs = f.center !== undefined && f.rs ? configurationOf(mol, f.center) : undefined;
  return (
    <SkeletalView
      lay={lay}
      x0={SKELETAL_CARD_W / 2}
      y0={SKELETAL_CARD_H / 2}
      {...fit}
      font={chart.label}
      c={{ ...pal, chartInk: ink }}
      lit={shade}
      halo={false}
      marks={{
        lit: litAtoms(mol, f.group),
        numbers,
        ...(f.center !== undefined ? { center: f.center } : {}),
        ...(ranks ? { ranks } : {}),
        ...(rs ? { rs } : {}),
      }}
    />
  );
}
