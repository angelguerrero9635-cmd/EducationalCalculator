import { MATH_LAYOUTS } from './math';
import { MATH_7_LAYOUTS } from './math7';
import { MATH_8_LAYOUTS } from './math8';
import { SCIENCE_LAYOUTS } from './science';
import { SCIENCE_7_LAYOUTS } from './science7';
import { SCIENCE_8_LAYOUTS } from './science8';
import { MATH_9_LAYOUTS } from './math9';
import { MATH_10_LAYOUTS } from './math10';
import { MATH_11_LAYOUTS } from './math11';
import { MATH_12_LAYOUTS } from './math12';
import { SCIENCE_9_LAYOUTS } from './science9';
import { SCIENCE_10_LAYOUTS } from './science10';
import { SCIENCE_11_LAYOUTS } from './science11';
import { SCIENCE_12_LAYOUTS } from './science12';
import type { LayoutDef } from './types';

export type {
  CardFigure,
  CardIcon,
  ExploreLayout,
  CarbonProcess,
  Figure,
  FoodWebMember,
  LeafCellSubstance,
  LayoutDef,
  MoleculeItem,
  MoonPhase,
  ObserveFigure,
  ObserveLayout,
  OffspringAnimal,
  PedigreePerson,
  PhaseChange,
  Scene,
  SequenceLayout,
  SortHeader,
  SortLayout,
} from './types';

/** Every page laid out as a sort, sequence, exploration or observation. */
export const LAYOUTS: readonly LayoutDef[] = [
  ...MATH_LAYOUTS,
  ...MATH_7_LAYOUTS,
  ...MATH_8_LAYOUTS,
  ...SCIENCE_LAYOUTS,
  ...SCIENCE_7_LAYOUTS,
  ...SCIENCE_8_LAYOUTS,
  ...MATH_9_LAYOUTS,
  ...MATH_10_LAYOUTS,
  ...MATH_11_LAYOUTS,
  ...MATH_12_LAYOUTS,
  ...SCIENCE_9_LAYOUTS,
  ...SCIENCE_10_LAYOUTS,
  ...SCIENCE_11_LAYOUTS,
  ...SCIENCE_12_LAYOUTS,
];

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
