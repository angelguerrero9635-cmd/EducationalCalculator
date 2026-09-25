/** Values keyed by variable id. */
export type Values = Record<string, number>;

export interface VariableDef {
  id: string;
  /** Short symbol shown in formulas, e.g. "A", "v₀", "ρ". */
  symbol: string;
  /** Plain-language name, e.g. "Area". */
  name: string;
  unit?: string;
  /** Allowed range. Values outside it are rejected (as input) or treated as a conflict (derived). */
  min?: number;
  max?: number;
  /** Snap size used when dragging on a chart or diagram. */
  step?: number;
  /** Whole numbers only. */
  integer?: boolean;
  /** Show at least this many digits, padding with zeros (minutes on a clock: 3:05). */
  digits?: number;
  /** Whole multiples of this number only (e.g. 100 for a hundreds part: 0, 100, 200, …). */
  multipleOf?: number;
  /**
   * Set by the unit context, not by content: how many formula units one shown unit equals, and
   * the shown unit. Ranges and whole-number rules then apply to the shown number.
   */
  unitFactor?: number;
  displayUnit?: string;
}

/**
 * One equation linking some variables. `residual` is zero when the equation holds
 * (write it as left side − right side).
 */
export interface Relation {
  id: string;
  /** Display template; `{id}` is replaced by the symbol or the current value. */
  display: string;
  vars: string[];
  residual: (v: Values) => number;
  /**
   * Exact rearrangements, one per variable where possible. May return several candidates
   * (e.g. ± square roots); the solver picks the valid one closest to the previous value.
   * Variables without a rearrangement are solved numerically within their [min, max].
   */
  solve?: Partial<Record<string, (v: Values) => number | number[] | undefined>>;
  /**
   * The check line as plain arithmetic (e.g. "4 + 4 + 4 = 12" for "12 = 3 rows of 4"), so the
   * step-by-step check really checks. Given the values in the units the steps show.
   */
  check?: (v: Values) => string;
}
