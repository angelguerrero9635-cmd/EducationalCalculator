/**
 * Closed forms read from a relation's display (HE-E18): when the value to find appears once in
 * "{A} = {P} × e^({r} × {t})", each operation round it is undone in turn, last done first
 * (divide by P, take ln of both sides, divide by r), giving t = ln(A ÷ P) ÷ r: a value the
 * solver works out directly instead of by trial, and the step's rearranged line and "how".
 *
 * The display is read as arithmetic with `{id}` for each value: + − × ÷ /, powers (^, ², ⁻¹),
 * √ ∛ ∜, |x|, e, π, ln, log₁₀, log₂, log_b, and sin, cos, tan (read, never undone: an angle has
 * many, which the root finder lists). A display with words or marks it can't read, or with the
 * value more than once (ln(1 + kQ ÷ r) ÷ k for k), gives nothing: that value is found by trial
 * (HE-E14). The solver keeps a closed form's value only where the relation holds.
 */
import type { Values } from './types';

type Fn =
  | 'ln'
  | 'log'
  | 'sqrt'
  | 'cbrt'
  | 'root4'
  | 'abs'
  | 'sin'
  | 'cos'
  | 'tan'
  | 'asin'
  | 'acos'
  | 'atan';

export type Expr =
  | { k: 'num'; value: number; text: string }
  | { k: 'var'; id: string }
  | { k: 'op'; op: '+' | '−' | '×' | '÷'; a: Expr; b: Expr }
  | { k: 'pow'; a: Expr; b: Expr }
  | { k: 'neg'; a: Expr }
  /** `base`: a log's base other than e (10, 2); `text` as written (log₁₀, log₂). */
  | { k: 'fn'; fn: Fn; a: Expr; base?: number; text?: string };

type Tok =
  | { t: 'num'; value: number; text: string }
  | { t: 'var'; id: string }
  | { t: 'op'; v: string }
  | { t: 'fn'; fn: Fn; base?: number; text: string }
  | { t: 'sup'; value: number }
  | { t: '(' }
  | { t: ')' }
  | { t: '|' };

const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const SUB = '₀₁₂₃₄₅₆₇₈₉';

/** The display's tokens, or undefined when it has anything that isn't arithmetic. */
function tokens(text: string): Tok[] | undefined {
  const out: Tok[] = [];
  /** Brace groups ({{r}{t}} in e^{{r}{t}}) close as brackets. */
  let i = 0;
  const s = text;
  while (i < s.length) {
    const rest = s.slice(i);
    const ch = s[i]!;
    if (ch === ' ' || ch === ' ') {
      i++;
      continue;
    }
    const id = /^\{(\w+)\}/.exec(rest);
    if (id) {
      out.push({ t: 'var', id: id[1]! });
      i += id[0].length;
      continue;
    }
    if (ch === '{') {
      out.push({ t: '(' });
      i++;
      continue;
    }
    if (ch === '}') {
      out.push({ t: ')' });
      i++;
      continue;
    }
    const num = /^\d{1,3}(?:,\d{3})+(?:\.\d+)?|^\d+(?:\.\d+)?/.exec(rest);
    if (num) {
      out.push({ t: 'num', value: Number(num[0].replace(/,/g, '')), text: num[0] });
      i += num[0].length;
      continue;
    }
    const sup = /^⁻?[⁰¹²³⁴⁵⁶⁷⁸⁹]+/.exec(rest);
    if (sup) {
      const digits = [...sup[0]].filter((c) => c !== '⁻').map((c) => SUP.indexOf(c));
      out.push({ t: 'sup', value: (sup[0][0] === '⁻' ? -1 : 1) * Number(digits.join('')) });
      i += sup[0].length;
      continue;
    }
    const log = /^(?:ln|log(?:([₀₁₂₃₄₅₆₇₈₉]+)|_(\d+))?)(?![a-zA-Z])/.exec(rest);
    if (log) {
      const base = log[1]
        ? Number([...log[1]].map((c) => SUB.indexOf(c)).join(''))
        : log[2]
          ? Number(log[2])
          : log[0] === 'ln'
            ? undefined
            : 10;
      out.push({ t: 'fn', fn: log[0] === 'ln' ? 'ln' : 'log', base, text: log[0] });
      i += log[0].length;
      continue;
    }
    const trig = /^(?:arc(sin|cos|tan)|(sin|cos|tan)(⁻¹)?)(?![a-zA-Z])/.exec(rest);
    if (trig) {
      const name = trig[1] ?? trig[2]!;
      const inverse = !!trig[1] || !!trig[3];
      out.push({ t: 'fn', fn: (inverse ? `a${name}` : name) as Fn, text: trig[0] });
      i += trig[0].length;
      continue;
    }
    // e, the base of natural logs, alone (never a letter of a word).
    if (ch === 'e' && !/[a-zA-Z]/.test(s[i + 1] ?? '') && !/[a-zA-Z]/.test(s[i - 1] ?? '')) {
      out.push({ t: 'num', value: Math.E, text: 'e' });
      i++;
      continue;
    }
    if (ch === 'π') out.push({ t: 'num', value: Math.PI, text: 'π' });
    else if (ch === '½') out.push({ t: 'num', value: 0.5, text: '½' });
    else if (ch === '√') out.push({ t: 'fn', fn: 'sqrt', text: '√' });
    else if (ch === '∛') out.push({ t: 'fn', fn: 'cbrt', text: '∛' });
    else if (ch === '∜') out.push({ t: 'fn', fn: 'root4', text: '∜' });
    else if (ch === '(' || ch === '[') out.push({ t: '(' });
    else if (ch === ')' || ch === ']') out.push({ t: ')' });
    else if (ch === '|') out.push({ t: '|' });
    else if ('+−-×÷/·*^'.includes(ch))
      out.push({
        t: 'op',
        v: ch === '-' ? '−' : ch === '·' || ch === '*' ? '×' : ch === '/' ? '÷' : ch,
      });
    else return undefined;
    i++;
  }
  return out;
}

/** Parses tokens into an expression; undefined when they don't make one. */
function parse(toks: Tok[]): Expr | undefined {
  let at = 0;
  let failed = false;
  const peek = () => toks[at];
  const fail = (): Expr => {
    failed = true;
    return { k: 'num', value: NaN, text: '?' };
  };
  /** Whether a token can start a factor (for multiplication written side by side: 2{a}). */
  const starts = (t: Tok | undefined) =>
    !!t && (t.t === 'num' || t.t === 'var' || t.t === 'fn' || t.t === '(');
  const atom = (): Expr => {
    const t = toks[at++];
    if (!t) return fail();
    if (t.t === 'num') return { k: 'num', value: t.value, text: t.text };
    if (t.t === 'var') return { k: 'var', id: t.id };
    if (t.t === '(') {
      const e = sum();
      if (peek()?.t !== ')') return fail();
      at++;
      return e;
    }
    if (t.t === '|') {
      const e = sum();
      if (peek()?.t !== '|') return fail();
      at++;
      return { k: 'fn', fn: 'abs', a: e };
    }
    if (t.t === 'fn') {
      // A root or a log of one value may go without brackets (√{a}, log₁₀ {x}); a root takes
      // its value's power with it (√{a}³ is √({a}³)).
      const a =
        peek()?.t === '('
          ? postfix()
          : t.fn === 'sqrt' || t.fn === 'cbrt' || t.fn === 'root4'
            ? postfix()
            : power();
      return {
        k: 'fn',
        fn: t.fn,
        a,
        ...(t.base !== undefined ? { base: t.base } : {}),
        text: t.text,
      };
    }
    return fail();
  };
  /** An atom with its raised powers: {r}², 10⁻⁶. */
  const postfix = (): Expr => {
    let e = atom();
    while (peek()?.t === 'sup') {
      const s = toks[at++] as Extract<Tok, { t: 'sup' }>;
      e = { k: 'pow', a: e, b: { k: 'num', value: s.value, text: String(s.value) } };
    }
    return e;
  };
  const power = (): Expr => {
    const base = postfix();
    const p = peek();
    if (p?.t === 'op' && p.v === '^') {
      at++;
      // (a minus sign in an exponent: e^−{x})
      const n = peek();
      if (n?.t === 'op' && n.v === '−') {
        at++;
        return { k: 'pow', a: base, b: { k: 'neg', a: power() } };
      }
      return { k: 'pow', a: base, b: power() };
    }
    return base;
  };
  const unary = (): Expr => {
    const p = peek();
    if (p?.t === 'op' && p.v === '−') {
      at++;
      return { k: 'neg', a: unary() };
    }
    if (p?.t === 'op' && p.v === '+') {
      at++;
      return unary();
    }
    return power();
  };
  const product = (): Expr => {
    let e = unary();
    for (;;) {
      const p = peek();
      if (p?.t === 'op' && (p.v === '×' || p.v === '÷')) {
        at++;
        e = { k: 'op', op: p.v, a: e, b: unary() };
      } else if (starts(p)) {
        e = { k: 'op', op: '×', a: e, b: power() };
      } else return e;
    }
  };
  const sum = (): Expr => {
    let e = product();
    for (;;) {
      const p = peek();
      if (p?.t === 'op' && (p.v === '+' || p.v === '−')) {
        at++;
        e = { k: 'op', op: p.v, a: e, b: product() };
      } else return e;
    }
  };
  const e = sum();
  return failed || at !== toks.length ? undefined : e;
}

/** An expression read from display text with `{id}` values, or undefined. */
export function readExpr(text: string): Expr | undefined {
  const t = tokens(text);
  return t && parse(t);
}

const count = (e: Expr, id: string): number =>
  e.k === 'var'
    ? Number(e.id === id)
    : e.k === 'num'
      ? 0
      : e.k === 'op' || e.k === 'pow'
        ? count(e.a, id) + count(e.b, id)
        : count(e.a, id);

/** The value of an expression at `values` (NaN where a value is missing or out of domain). */
export function evalExpr(e: Expr, values: Values): number {
  switch (e.k) {
    case 'num':
      return e.value;
    case 'var':
      return values[e.id] ?? NaN;
    case 'neg':
      return -evalExpr(e.a, values);
    case 'pow': {
      const [a, b] = [evalExpr(e.a, values), evalExpr(e.b, values)];
      // A real odd root of a negative number: (−8)^(1/3) is −2.
      if (a < 0 && !Number.isInteger(b)) {
        const n = 1 / b;
        if (
          Number.isInteger(Math.round(n)) &&
          Math.abs(n - Math.round(n)) < 1e-12 &&
          Math.round(n) % 2
        )
          return -((-a) ** b);
      }
      return a ** b;
    }
    case 'op': {
      const [a, b] = [evalExpr(e.a, values), evalExpr(e.b, values)];
      return e.op === '+' ? a + b : e.op === '−' ? a - b : e.op === '×' ? a * b : a / b;
    }
    case 'fn': {
      const a = evalExpr(e.a, values);
      switch (e.fn) {
        case 'ln':
          return Math.log(a);
        case 'log':
          return e.base === 10 ? Math.log10(a) : Math.log(a) / Math.log(e.base ?? Math.E);
        case 'sqrt':
          return Math.sqrt(a);
        case 'cbrt':
          return Math.cbrt(a);
        case 'root4':
          return a < 0 ? NaN : a ** 0.25;
        case 'abs':
          return Math.abs(a);
        default:
          // (angles are read in the units the page writes them: not undone here)
          return NaN;
      }
    }
  }
}

// ── Printing an expression back as a display template ──

const rank = (e: Expr): number =>
  e.k === 'op'
    ? e.op === '+' || e.op === '−'
      ? 1
      : 2
    : e.k === 'neg'
      ? 1.5
      : e.k === 'pow'
        ? 3
        : 4;

const RAISED = (n: number) =>
  `${n < 0 ? '⁻' : ''}${[...String(Math.abs(n))].map((c) => SUP[Number(c)]).join('')}`;

/** An expression as a display template: "ln({A} ÷ {P}) ÷ {r}". */
export function printExpr(e: Expr): string {
  const wrap = (x: Expr, need: boolean) => (need ? `(${printExpr(x)})` : printExpr(x));
  switch (e.k) {
    case 'num':
      return e.value < 0 ? `−${e.text.replace(/^[-−]/, '')}` : e.text;
    case 'var':
      return `{${e.id}}`;
    case 'neg':
      return `−${wrap(e.a, rank(e.a) <= 1.5 || (e.a.k === 'num' && e.a.value < 0))}`;
    case 'op': {
      const r = rank(e);
      const left = wrap(e.a, rank(e.a) < r);
      // (the right side of − or ÷ is bracketed at its own level too: a − (b + c), a ÷ (b × c))
      const right = wrap(
        e.b,
        rank(e.b) < r || (rank(e.b) === r && (e.op === '−' || e.op === '÷')) || e.b.k === 'neg',
      );
      return `${left} ${e.op} ${right}`;
    }
    case 'pow': {
      const base = wrap(
        e.a,
        e.a.k !== 'var' &&
          !(e.a.k === 'num' && e.a.value >= 0 && !/[ /]/.test(e.a.text)) &&
          e.a.k !== 'fn',
      );
      const b = e.b;
      if (b.k === 'num' && Number.isInteger(b.value) && /^-?\d+$/.test(b.text.replace('−', '-')))
        return `${base}${RAISED(b.value)}`;
      if (b.k === 'neg' && b.a.k === 'num' && Number.isInteger(b.a.value))
        return `${base}${RAISED(-b.a.value)}`;
      return `${base}^${wrap(b, b.k !== 'var' && b.k !== 'num')}`;
    }
    case 'fn': {
      const inner = printExpr(e.a);
      const lone = e.a.k === 'var' || (e.a.k === 'num' && e.a.value >= 0);
      if (e.fn === 'abs') return `|${inner}|`;
      if (e.fn === 'sqrt') return lone ? `√${inner}` : `√(${inner})`;
      if (e.fn === 'cbrt') return lone ? `∛${inner}` : `∛(${inner})`;
      if (e.fn === 'root4') return lone ? `∜${inner}` : `∜(${inner})`;
      const name =
        e.fn === 'log' ? (e.text ?? (e.base === 10 ? 'log₁₀' : `log_${e.base}`)) : (e.text ?? e.fn);
      return `${name}(${inner})`;
    }
  }
}

// ── Undoing the operations round one value ──

const num = (value: number, text = String(value)): Expr => ({ k: 'num', value, text });
const E: Expr = { k: 'num', value: Math.E, text: 'e' };
const op = (o: '+' | '−' | '×' | '÷', a: Expr, b: Expr): Expr => ({ k: 'op', op: o, a, b });

/** One way the value comes out: its expression and the moves that got there. */
export interface Isolated {
  /** The rearranged right side as a display template: "ln({A} ÷ {P}) ÷ {r}". */
  expr: string;
  tree: Expr;
  /** Each move in order, in words with `{id}` templates: "divide both sides by {P}". */
  moves: string[];
}

/** An operand as named in a move: a value alone, else in brackets. */
const named = (e: Expr) =>
  e.k === 'var' ||
  (e.k === 'num' && !/ /.test(printExpr(e))) ||
  e.k === 'fn' ||
  (e.k === 'pow' && (e.a.k === 'var' || e.a.k === 'num'))
    ? printExpr(e)
    : `(${printExpr(e)})`;

const isE = (e: Expr) => e.k === 'num' && e.text === 'e';
const constant = (e: Expr): number | undefined => (hasVar(e) ? undefined : evalExpr(e, {}));
const hasVar = (e: Expr): boolean =>
  e.k === 'var'
    ? true
    : e.k === 'num'
      ? false
      : e.k === 'op' || e.k === 'pow'
        ? hasVar(e.a) || hasVar(e.b)
        : hasVar(e.a);

/** The factors of a product: those multiplied (`top`) and those divided by (`bottom`). */
function factors(e: Expr, top: Expr[], bottom: Expr[], flip = false) {
  if (e.k === 'op' && (e.op === '×' || e.op === '÷')) {
    factors(e.a, top, bottom, flip);
    factors(e.b, top, bottom, e.op === '÷' ? !flip : flip);
  } else (flip ? bottom : top).push(e);
}

/** The terms of a sum, each with its sign. */
function addends(e: Expr, minus: boolean, out: { e: Expr; minus: boolean }[]) {
  // (a sum on the right was in brackets, a − (y − b): it stays one term)
  if (e.k === 'op' && (e.op === '+' || e.op === '−')) {
    addends(e.a, minus, out);
    out.push({ e: e.b, minus: e.op === '−' ? !minus : minus });
  } else out.push({ e, minus });
}

/** Factors multiplied back together, in order; undefined for none. */
const product = (fs: Expr[]): Expr | undefined =>
  fs.reduce<Expr | undefined>((acc, f) => (acc === undefined ? f : op('×', acc, f)), undefined);

/**
 * Every way `node = rhs` comes out for `id` (two for an even power or |x|: + and −), or
 * undefined when an operation on the way can't be undone (an angle, the value twice).
 */
function undo(node: Expr, rhs: Expr, id: string, moves: string[]): Isolated[] | undefined {
  if (node.k === 'var') return [{ expr: printExpr(rhs), tree: rhs, moves }];
  const step = (n: Expr, r: Expr, move?: string) => undo(n, r, id, move ? [...moves, move] : moves);
  const stepAll = (n: Expr, r: Expr, more: string[]) => undo(n, r, id, [...moves, ...more]);
  switch (node.k) {
    case 'num':
      return undefined;
    case 'neg':
      return step(node.a, { k: 'neg', a: rhs }, 'change the sign of both sides');
    case 'op': {
      // A whole product or sum is undone in one move: ½ × m × v² = K → m = K ÷ (½ × v²).
      if (node.op === '×' || node.op === '÷') {
        const top: Expr[] = [];
        const bottom: Expr[] = [];
        factors(node, top, bottom);
        const inTop = top.find((f) => count(f, id) > 0);
        const x = inTop ?? bottom.find((f) => count(f, id) > 0)!;
        // (a 1 on top is no factor: 1 ÷ x = r is x = 1 ÷ r)
        const others = (fs: Expr[]) =>
          product(fs.filter((f) => f !== x && !(f.k === 'num' && f.value === 1)));
        const [n, d] = [others(top), others(bottom)];
        if (inTop) {
          // x × n ÷ d = rhs → x = rhs × d ÷ n
          let r = rhs;
          const moves: string[] = [];
          if (d) {
            r = op('×', r, d);
            moves.push(`multiply both sides by ${named(d)}`);
          }
          if (n) {
            r = op('÷', r, n);
            moves.push(`divide both sides by ${named(n)}`);
          }
          return stepAll(x, r, moves);
        }
        // n ÷ (x × d) = rhs → x = n ÷ (rhs × d)
        const under = d ? op('×', rhs, d) : rhs;
        return stepAll(x, n ? op('÷', n, under) : op('÷', num(1), under), [
          n ? `flip both sides over and multiply by ${named(n)}` : 'flip both sides over',
          ...(d ? [`divide both sides by ${named(d)}`] : []),
        ]);
      }
      const terms: { e: Expr; minus: boolean }[] = [];
      addends(node, false, terms);
      const xt = terms.find((t) => count(t.e, id) > 0)!;
      const rest = terms.filter((t) => t !== xt);
      const sum = rest.reduce<Expr | undefined>(
        (acc, t) =>
          acc === undefined
            ? t.minus
              ? { k: 'neg', a: t.e }
              : t.e
            : op(t.minus ? '−' : '+', acc, t.e),
        undefined,
      )!;
      const o = named(sum);
      // x + rest = rhs → x = rhs − rest; −x + rest = rhs → x = rest − rhs
      return xt.minus
        ? step(xt.e, op('−', sum, rhs), `subtract both sides from ${o}`)
        : sum.k === 'neg'
          ? step(xt.e, op('+', rhs, sum.a), `add ${named(sum.a)} to both sides`)
          : step(xt.e, op('−', rhs, sum), `subtract ${o} from both sides`);
    }
    case 'pow': {
      if (count(node.a, id) > 0) {
        // The value in the base: undo the power with a root.
        const p = constant(node.b);
        if (p === 2) {
          const root: Expr = { k: 'fn', fn: 'sqrt', a: rhs };
          return [
            ...(step(node.a, root, 'take the square root of both sides') ?? []),
            ...(step(
              node.a,
              { k: 'neg', a: root },
              'take the square root of both sides (the negative one)',
            ) ?? []),
          ];
        }
        if (p === 3)
          return step(node.a, { k: 'fn', fn: 'cbrt', a: rhs }, 'take the cube root of both sides');
        if (p === 4) {
          const root: Expr = { k: 'fn', fn: 'root4', a: rhs };
          return [
            ...(step(node.a, root, 'take the fourth root of both sides') ?? []),
            ...(step(
              node.a,
              { k: 'neg', a: root },
              'take the fourth root of both sides (the negative one)',
            ) ?? []),
          ];
        }
        if (p === 1 || p === 0) return undefined;
        const inverse: Expr =
          p !== undefined && Number.isInteger(p)
            ? { k: 'pow', a: rhs, b: op('÷', num(1), num(p)) }
            : { k: 'pow', a: rhs, b: op('÷', num(1), node.b) };
        // (x^(1/4) = y is undone by the 4th power, a whole one, written raised)
        const whole = p !== undefined && Number.isInteger(1 / p) ? 1 / p : undefined;
        const r: Expr = whole !== undefined ? { k: 'pow', a: rhs, b: num(whole) } : inverse;
        const even = p !== undefined && Number.isInteger(p) && p % 2 === 0;
        const move =
          whole !== undefined
            ? `raise both sides to the power ${whole}`
            : `raise both sides to the power 1 ÷ ${named(node.b)}`;
        return even
          ? [
              ...(step(node.a, r, move) ?? []),
              ...(step(node.a, { k: 'neg', a: r }, `${move} (the negative root)`) ?? []),
            ]
          : step(node.a, r, move);
      }
      // The value in the exponent: take a log of both sides.
      const base = node.a;
      if (isE(base))
        return step(node.b, { k: 'fn', fn: 'ln', a: rhs, text: 'ln' }, 'take ln of both sides');
      const b = constant(base);
      if (b === 10)
        return step(
          node.b,
          { k: 'fn', fn: 'log', base: 10, a: rhs, text: 'log₁₀' },
          'take log₁₀ of both sides',
        );
      const log = (a: Expr): Expr => ({ k: 'fn', fn: 'log', base: 10, a, text: 'log₁₀' });
      return step(
        node.b,
        op('÷', log(rhs), log(base)),
        `take log₁₀ of both sides and divide by log₁₀ ${named(base)}`,
      );
    }
    case 'fn': {
      switch (node.fn) {
        case 'ln':
          return step(node.a, { k: 'pow', a: E, b: rhs }, 'raise e to each side (undo the ln)');
        case 'log': {
          const b = node.base ?? 10;
          const by = node.text ?? `log_${b}`;
          return step(
            node.a,
            { k: 'pow', a: num(b), b: rhs },
            `raise ${b} to each side (undo the ${by})`,
          );
        }
        case 'sqrt':
          return step(node.a, { k: 'pow', a: rhs, b: num(2) }, 'square both sides');
        case 'cbrt':
          return step(node.a, { k: 'pow', a: rhs, b: num(3) }, 'cube both sides');
        case 'root4':
          return step(
            node.a,
            { k: 'pow', a: rhs, b: num(4) },
            'raise both sides to the fourth power',
          );
        case 'abs':
          return [
            ...(step(node.a, rhs, 'drop the bars (the value inside is the number)') ?? []),
            ...(step(
              node.a,
              { k: 'neg', a: rhs },
              'drop the bars (the value inside is its negative)',
            ) ?? []),
          ];
        default:
          return undefined;
      }
    }
  }
}

const cache = new Map<string, Isolated[] | null>();

/**
 * Each way `id` comes out of `display` on its own (one, or two with ±), or undefined when the
 * display can't be read, has `id` other than once, or an operation round it can't be undone.
 */
export function isolate(display: string, id: string): Isolated[] | undefined {
  const key = `${id}\u0000${display}`;
  const hit = cache.get(key);
  if (hit !== undefined) return hit ?? undefined;
  const found = isolateUncached(display, id);
  cache.set(key, found ?? null);
  return found;
}

function isolateUncached(display: string, id: string): Isolated[] | undefined {
  const sides = display.split('=');
  if (sides.length !== 2 || /[<>≤≥≈≠]/.test(display)) return undefined;
  const [l, r] = sides.map((s) => readExpr(s.trim()));
  if (!l || !r) return undefined;
  const [nl, nr] = [count(l, id), count(r, id)];
  if (nl + nr !== 1) return undefined;
  const [node, rhs] = nl ? [l, r] : [r, l];
  const ways = undo(node, rhs, id, []);
  return ways?.length ? ways : undefined;
}

/**
 * The values `id` takes from a relation's display at `values` (formula units): one per way it
 * comes out that gives a number. Undefined when there is no closed form.
 */
export function closedValues(display: string, id: string, values: Values): number[] | undefined {
  const ways = isolate(display, id);
  if (!ways) return undefined;
  return ways.map((w) => evalExpr(w.tree, values)).filter(Number.isFinite);
}

/** The moves as one sentence: "Divide both sides by {P}, take ln of both sides, then divide by {r}." */
export function movesSentence(moves: readonly string[]): string {
  if (moves.length === 0) return '';
  const list =
    moves.length === 1
      ? moves[0]!
      : `${moves.slice(0, -1).join(', ')}, then ${moves[moves.length - 1]}`;
  return `${list[0]!.toUpperCase()}${list.slice(1)}.`;
}
