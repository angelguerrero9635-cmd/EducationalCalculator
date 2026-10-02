/**
 * Harness checks for the college round 3 group D pictures (docs/RENDERINGS_HE.md): HC48 code
 * traces and code cards. Test-only.
 */
import type { CardFigure, LayoutDef } from '../layouts';
import type { CodeTraceFigure, CodeTraceScene } from '../typesHe3d';

/** "32 <= 20" (or with <, >, >=, ==, ~=, !=) worked out; undefined when it isn't numbers. */
export function testHolds(text: string): boolean | undefined {
  const m = /^\s*(-?\d+(?:\.\d+)?)\s*(<=|>=|==|~=|!=|<|>)\s*(-?\d+(?:\.\d+)?)\s*$/.exec(text);
  if (!m) return undefined;
  const [a, b] = [Number(m[1]), Number(m[3])];
  switch (m[2]) {
    case '<=':
      return a <= b;
    case '>=':
      return a >= b;
    case '<':
      return a < b;
    case '>':
      return a > b;
    case '==':
      return a === b;
    default:
      return a !== b;
  }
}

/** A code trace scene: the lit lines exist and aren't blank, each row fills the table, the test agrees. */
export function codeTraceIssues(f: CodeTraceFigure, s: CodeTraceScene, where: string): string[] {
  const out: string[] = [];
  if (!f.matlab && !f.python) out.push(`codeTrace: no code`);
  const lit = (lines: string[] | undefined, n: number | undefined, lang: string) => {
    if (!lines || n === undefined) return;
    if (!(n >= 1 && n <= lines.length)) out.push(`${where}: ${lang} line ${n} is not in the code`);
    else if (!lines[n - 1]!.trim()) out.push(`${where}: ${lang} line ${n} is blank`);
  };
  lit(f.matlab, s.line, 'MATLAB');
  lit(f.python, s.pyLine ?? s.line, 'Python');
  if (s.rows.length === 0) out.push(`${where}: an empty variables table`);
  s.rows.forEach((r, i) => {
    if (r.length !== f.vars.length) {
      out.push(`${where}: row ${i} has ${r.length} values for ${f.vars.length} variables`);
    }
  });
  if (s.test) {
    const holds = testHolds(s.test.text);
    if (holds !== undefined && holds !== s.test.holds) {
      out.push(`${where}: the test ${s.test.text} is ${holds}, drawn ${s.test.holds}`);
    }
  }
  for (const line of [...(f.matlab ?? []), ...(f.python ?? [])]) {
    if (/[“”‘’]/.test(line)) out.push(`codeTrace: curly quotes in code: ${line}`);
    if (line.length > 40) out.push(`codeTrace: a line longer than 40 characters: ${line}`);
  }
  return out;
}

/** A code card: up to 4 lines of up to 24 characters, straight quotes. */
export function codeCardIssues(f: CardFigure, where: string): string[] {
  if (f.kind !== 'code') return [];
  const out: string[] = [];
  const lines = f.code.split('\n');
  if (lines.length > 4) out.push(`${where}: a code card of ${lines.length} lines`);
  for (const l of lines) {
    if (l.length > 24) out.push(`${where}: a code line of ${l.length} characters: ${l}`);
    if (/[“”‘’]/.test(l)) out.push(`${where}: curly quotes in code: ${l}`);
  }
  return out;
}

/** Group D's layout figures: code traces and code cards. */
export function he3dFigureIssues(l: LayoutDef): string[] {
  const out: string[] = [];
  if (l.kind === 'explore' && l.figure.kind === 'codeTrace') {
    const f = l.figure;
    for (const s of l.scenes) {
      if (s.trace) out.push(...codeTraceIssues(f, s.trace, `${l.id} ${s.label}`));
    }
  }
  if (l.kind === 'sort') {
    for (const card of l.cards)
      if (card.figure) out.push(...codeCardIssues(card.figure, card.label));
    for (const bin of l.bins) if (bin.figure) out.push(...codeCardIssues(bin.figure, bin.label));
  }
  if (l.kind === 'sequence') {
    for (const st of l.stages) if (st.figure) out.push(...codeCardIssues(st.figure, st.label));
  }
  return out;
}
