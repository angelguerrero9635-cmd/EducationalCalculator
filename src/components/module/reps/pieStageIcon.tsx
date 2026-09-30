/**
 * H109: a `pieChart` part's cell-cycle stage (`stages`), the `cellDivision` card of that stage
 * drawn small beside the part's name, so the mitotic index's wedges show what each phase looks
 * like. 42 px wide.
 */
import { G } from 'react-native-svg';

import type { PieStage } from '@/data/modules/typesHs3d';
import { usePalette } from '@/theme';

import { DIVISION_W, DivisionCard } from '../layouts/divisionCard';

export const PIE_ICON_W = 42;

export function PieStageIcon({ stage, x, y }: { stage: PieStage; x: number; y: number }) {
  const c = usePalette();
  return (
    <G transform={`translate(${x} ${y}) scale(${PIE_ICON_W / DIVISION_W})`}>
      <DivisionCard f={{ kind: 'cellDivision', stage }} ink={c.chartInk} />
    </G>
  );
}
