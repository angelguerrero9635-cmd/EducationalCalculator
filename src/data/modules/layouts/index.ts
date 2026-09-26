import { MATH_LAYOUTS } from './math';
import { SCIENCE_LAYOUTS } from './science';
import type { LayoutDef } from './types';

export type {
  CardFigure,
  CardIcon,
  ExploreLayout,
  Figure,
  LayoutDef,
  ObserveLayout,
  Scene,
  SequenceLayout,
  SortLayout,
} from './types';

/** Every page laid out as a sort, sequence, exploration or observation. */
export const LAYOUTS: readonly LayoutDef[] = [...MATH_LAYOUTS, ...SCIENCE_LAYOUTS];

const BY_ID = new Map(LAYOUTS.map((l) => [l.id, l]));

/** The layout page for a skill id or problem-type id, if it has one. */
export const getLayout = (id: string): LayoutDef | undefined => BY_ID.get(id);

/** What the page offers, for search and page descriptions. */
export const layoutSummary = (l: LayoutDef): string =>
  l.kind === 'sort'
    ? `Sort ${l.cards.length} cards into ${l.bins.length} groups.`
    : l.kind === 'sequence'
      ? `Put ${l.stages.length} stages in order.`
      : l.kind === 'explore'
        ? `A picture with ${l.scenes.length} scenes to explore.`
        : `A table and chart of ${l.columns.length} ${l.rowLabel.toLowerCase()} readings.`;
