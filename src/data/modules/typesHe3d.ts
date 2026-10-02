/**
 * College pictures, round 3, group D (docs/RENDERINGS_HE.md): the computing and signals
 * pictures. HC48 the `codeTrace` explore figure and the `code` card figure.
 */

// ─── HC48: a code trace (explore) and code cards ─────────────────────────────

/**
 * An explore figure: a short program in MATLAB and Python side by side (stacked when a line is
 * too long for half the width), the line running now lit in both, and under them the variables
 * table as it stands after this scene. Code is drawn in a code font as written: straight quotes,
 * `==`, `~=` and indents kept.
 */
export interface CodeTraceFigure {
  kind: 'codeTrace';
  /** The MATLAB lines, as written (indent with spaces). */
  matlab?: string[];
  /** The Python lines, as written. */
  python?: string[];
  /** The variables table's columns, in order ("x", "n"). */
  vars: string[];
}

/** A `codeTrace` scene: the line lit, the table so far and the loop's test as it reads now. */
export interface CodeTraceScene {
  /** The MATLAB line lit (1-based); none when left out. */
  line?: number;
  /** The Python line lit (default `line`). */
  pyLine?: number;
  /** The table's rows so far, one per pass, each with a value per variable; the last is lit. */
  rows: (number | string)[][];
  /** The test with this pass's numbers in ("32 <= 20") and whether it holds. */
  test?: { text: string; holds: boolean };
}

/**
 * A card figure: a line or a few lines of code in a code font, on a code panel (straight quotes
 * kept). Lines split at "\n". Up to 4 lines of up to 24 characters.
 */
export interface CodeCard {
  kind: 'code';
  code: string;
}

/** The scene field each group D explore figure reads (layouts.test). */
export const HE3D_SCENE_FIELD = { codeTrace: 'trace' } as const;

export type He3dFigure = CodeTraceFigure;
export type He3dCard = CodeCard;

/** A code card's size: 7.2 px a character at 12 px, 16 px a line, a 6 px margin. */
export const CODE_CHAR_W = 7.2;
export const CODE_LINE_H = 16;
export const codeCardSize = (code: string): [number, number] => {
  const lines = code.split('\n');
  const longest = Math.max(...lines.map((l) => l.length));
  return [Math.max(48, Math.ceil(longest * CODE_CHAR_W + 14)), lines.length * CODE_LINE_H + 12];
};
