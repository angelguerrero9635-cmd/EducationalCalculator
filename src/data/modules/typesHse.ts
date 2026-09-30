/**
 * Picture specs for the Grades 9–12 data and probability options of group HE (H20–H22), kept
 * apart from `types.ts` so its union only names them. A `NumOrVar` is a fixed number or the id
 * of a variable that holds it.
 */
import type { TreeChancesHs2g, VennCounts } from './typesHs2g';
import type { NumOrVar } from './typesGraphs';
import type { VennChancesHs3b } from './typesHs3b';

/**
 * H20: a two-way frequency table (`table` with `twoWay`): the counts by row and column
 * category, with row, column and grand totals. `lit` lights a cell (row and col), a whole
 * row (row only) or a whole column (col only), and its relative frequency is worked out of
 * the grand total ('total', the default), of its row ('row') or of its column ('col'): a
 * conditional frequency. `bar` draws a segmented bar for each row (or column), split by the
 * other categories, in percents. For chi-square, `expected` puts each cell's expected count
 * under its observed one: 'independence' (row total × column total ÷ grand total) or given
 * counts (goodness of fit), and `chiSquare` is the statistic's value.
 */
export interface TwoWaySpec {
  /** Row and column category names. */
  rows: string[];
  cols: string[];
  /** The counts, one per cell, row by row. */
  cells: NumOrVar[][];
  /** Totals drawn (default true). */
  totals?: boolean;
  lit?: { row?: number; col?: number };
  of?: 'total' | 'row' | 'col';
  /** The lit relative frequency's value, when the module works it out (checked). */
  frequency?: string;
  bar?: 'rows' | 'cols';
  expected?: 'independence' | NumOrVar[][];
  chiSquare?: string;
}

/**
 * H21: a probability tree (`treeDiagram` with `chances`): each first-stage branch has its own
 * probability, and each second-stage branch its conditional probability given the first,
 * written P(B | A). `names` name the outcomes of each stage; `path` (a first and a second
 * index) is lit and `chance` is its probability, the product along the path. `total` is the
 * probability of one second-stage outcome (`totalOf`, an index) over every path.
 */
export interface TreeChances extends TreeChancesHs2g {
  first: NumOrVar[];
  second: NumOrVar[][];
  names: [string[], string[]];
  stages?: [string, string];
  path?: [number, number];
  chance?: string;
  totalOf?: number;
  total?: string;
}

/**
 * H22: a Venn diagram of probabilities (`venn` with `chances`): P(A), P(B) and P(A and B) as
 * values, the four regions labelled with their own probabilities. `shade` lights 'and'
 * (A ∩ B), 'or' (A ∪ B), 'notA' (the complement of A), 'aOnly' or 'neither'. With `exclusive`,
 * A and B draw apart (P(A and B) is 0). `result` is the shaded probability's value (checked).
 */
export interface VennChances extends VennCounts, VennChancesHs3b {
  a: NumOrVar;
  b: NumOrVar;
  both: NumOrVar;
  names?: [string, string];
  shade?: 'and' | 'or' | 'notA' | 'aOnly' | 'neither';
  exclusive?: boolean;
  result?: string;
}
