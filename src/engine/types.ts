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
  /**
   * Show a value that isn't whole as a fraction or mixed number with a denominator up to this
   * (33 1/3 groups, 2 3/8 liters), the way the question asks for it; a value no such fraction
   * hits stays a decimal. Boxes also take "2 3/8" and "3/8" typed.
   */
  fraction?: number;
  /**
   * Show a value that is a whole or short-decimal multiple of π as that multiple (36π, 2.25π),
   * the way circle and volume answers are written; boxes take "36π", "36 pi" or "36*pi".
   * `'fraction'` writes radians as fractions of π (5π/2, π/6, −3π/4) and takes them typed.
   */
  pi?: boolean | 'fraction';
  /** Show the value in scientific notation (4.7 × 10⁵); boxes take "4.7 × 10^5" and "4.7e5". */
  scientific?: boolean;
  /**
   * Show the value to this many significant figures, trailing zeros kept (2.50, 3.0, 0.0450),
   * in scientific notation past 10⁷ or under 10⁻⁴ (1.20 × 10⁻⁵): a measurement's precision.
   */
  sigFigs?: number;
  /**
   * A fraction whose decimal repeats shows its repeating digits and "…" (1/3 → 0.333…,
   * 1/6 → 0.1666…) when the block is at most 6 digits; boxes take the same.
   */
  repeating?: boolean;
  /**
   * Written out in full however big or small (3,800,000,000,000; 0.00083), never switched to
   * scientific notation: the number a scientific-notation lesson starts from.
   */
  full?: boolean;
  /**
   * The only units this value may be shown in (rain in mm, cm or in, never km): the unit menu
   * and the unit systems keep to these.
   */
  units?: string[];
  /** Whole multiples of this number only (e.g. 100 for a hundreds part: 0, 100, 200, …). */
  multipleOf?: number;
  /** Only these values (shown units), when a lesson names them: count by 5s, 10s or 100s. */
  allowed?: number[];
  /**
   * Worked out, never typed: a working value the steps show (the ones with the ten, an
   * estimate's parts). Its box is read-only and the walkthrough never starts from it.
   */
  derived?: boolean;
  /**
   * One of a list of values whose length is itself a value (a data set of 3 to 10 numbers):
   * counted only while `count` is at least `index`. Past the count it is hidden, never asked
   * for, and left out of every relation (the relations read only the first `count` values).
   */
  countedBy?: { count: string; index: number };
  /**
   * One cell of a grid or list read as one thing (a matrix's entries, a fixed data list): the
   * values sharing a group count once toward the page's number of values. Nothing else changes.
   */
  group?: string;
  /**
   * Figure-only: worked out for the picture (a side that places a drawing, BD = s sin(A/2) on a
   * page before trig), never shown as a row, asked for, or written in the steps. It is found
   * through `hidden` relations only.
   */
  hidden?: boolean;
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
  /**
   * A rule that only checks (a remainder is less than the divisor): never solved for a value,
   * only used to reject values that break it once every variable in it is known.
   */
  constraint?: boolean;
  /**
   * Places the drawing only (see VariableDef.hidden): solved like any other, but kept out of
   * the Formulas list, the steps and the check.
   */
  hidden?: boolean;
  /**
   * Variables the display names but the rule doesn't use (the bottom in "3/4 + 2/4 = 5/4"):
   * they can be unknown without holding the rule up.
   */
  shows?: string[];
  /** Display template; `{id}` is replaced by the symbol or the current value. */
  display: string;
  /**
   * The rule in words for Grades 3–5, when names dropped into `display` don't read as a
   * sentence: a template with {id} for each value's name ("The ten at or below {n} is {L}").
   */
  words?: string;
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
  /**
   * The number sentence shown for a step, from the values known so far (the unknown is
   * undefined: print "?"). For a relation whose display would read wrong with signed numbers
   * ("3 − (−5)" is Grade 7): "How far from −5 up to 3? ?".
   */
  sentence?: (v: Values) => string;
  /**
   * Why the rule has no single answer for these values, in words ("The slopes are equal and
   * the intercepts differ: the lines are parallel, so there is no solution."), or undefined
   * when it has one. When the rule can't give its unknown a value, or doesn't hold, and this
   * returns a sentence, the sentence is the reason shown under the box.
   */
  message?: (v: Values) => string | undefined;
}
