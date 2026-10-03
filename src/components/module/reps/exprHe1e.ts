/**
 * HC10 (college round 1, group E): the expression grammar of `functionGraph` `family: 'expr'`.
 * A small recursive-descent parser (never `eval`): numbers, names (variable ids and the input),
 * + − × ÷ ^ (also * / - and the minus sign), brackets, π, and the calls exp, ln, sin, cos, tan,
 * sqrt, abs and u (the unit step, 1 from 0 on). Anything else is a parse error. Pure, so the
 * picture and the harness read the same tree.
 */

const SUPER_DIGITS = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];

export const EXPR_FUNCS = ['exp', 'ln', 'sin', 'cos', 'tan', 'sqrt', 'abs', 'u'] as const;
export type ExprFunc = (typeof EXPR_FUNCS)[number];

export type ExprNode =
  | { t: 'num'; v: number }
  | { t: 'name'; name: string }
  | { t: 'neg'; a: ExprNode }
  | { t: 'bin'; op: '+' | '-' | '*' | '/' | '^'; a: ExprNode; b: ExprNode }
  | { t: 'call'; fn: ExprFunc; a: ExprNode };

type Token =
  | { k: 'num'; v: number }
  | { k: 'name'; v: string }
  | { k: 'op'; v: '+' | '-' | '*' | '/' | '^' | '(' | ')' };

const OPS: Record<string, '+' | '-' | '*' | '/' | '^' | '(' | ')'> = {
  '+': '+',
  '-': '-',
  '−': '-',
  '*': '*',
  '×': '*',
  '·': '*',
  '/': '/',
  '÷': '/',
  '^': '^',
  '(': '(',
  ')': ')',
};

function tokenize(s: string): Token[] {
  const out: Token[] = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i]!;
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    const num = /^(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(s.slice(i));
    if (num) {
      out.push({ k: 'num', v: Number(num[0]) });
      i += num[0].length;
      continue;
    }
    const name = /^([A-Za-z_][A-Za-z0-9_]*|π)/.exec(s.slice(i));
    if (name) {
      out.push({ k: 'name', v: name[0] });
      i += name[0].length;
      continue;
    }
    const op = OPS[ch];
    if (!op) throw new Error(`"${ch}" is not in the grammar`);
    out.push({ k: 'op', v: op });
    i++;
  }
  return out;
}

/** The tree of an expression; throws on anything outside the grammar. */
export function parseExpr(src: string): ExprNode {
  const toks = tokenize(src);
  let i = 0;
  const peek = () => toks[i];
  const isOp = (v: string) => {
    const t = peek();
    return t?.k === 'op' && t.v === v;
  };
  const expect = (v: string) => {
    if (!isOp(v)) throw new Error(`expected "${v}"`);
    i++;
  };
  function sum(): ExprNode {
    let a = product();
    while (isOp('+') || isOp('-')) {
      const op = (toks[i++] as { v: '+' | '-' }).v;
      a = { t: 'bin', op, a, b: product() };
    }
    return a;
  }
  function product(): ExprNode {
    let a = unary();
    while (isOp('*') || isOp('/')) {
      const op = (toks[i++] as { v: '*' | '/' }).v;
      a = { t: 'bin', op, a, b: unary() };
    }
    return a;
  }
  function unary(): ExprNode {
    if (isOp('-')) {
      i++;
      return { t: 'neg', a: unary() };
    }
    if (isOp('+')) {
      i++;
      return unary();
    }
    return power();
  }
  function power(): ExprNode {
    const a = atom();
    if (isOp('^')) {
      i++;
      return { t: 'bin', op: '^', a, b: unary() };
    }
    return a;
  }
  function atom(): ExprNode {
    const t = peek();
    if (!t) throw new Error('the expression ends too soon');
    if (t.k === 'num') {
      i++;
      return { t: 'num', v: t.v };
    }
    if (t.k === 'name') {
      i++;
      if (t.v === 'pi' || t.v === 'π') return { t: 'num', v: Math.PI };
      if ((EXPR_FUNCS as readonly string[]).includes(t.v) && isOp('(')) {
        i++;
        const a = sum();
        expect(')');
        return { t: 'call', fn: t.v as ExprFunc, a };
      }
      if (isOp('(')) throw new Error(`"${t.v}(" is not a function in the grammar`);
      return { t: 'name', name: t.v };
    }
    if (t.v === '(') {
      i++;
      const a = sum();
      expect(')');
      return a;
    }
    throw new Error(`unexpected "${t.v}"`);
  }
  const tree = sum();
  if (i < toks.length) throw new Error('extra text after the expression');
  return tree;
}

/** The names a tree reads (variable ids and the input). */
export function namesOf(n: ExprNode, out: string[] = []): string[] {
  if (n.t === 'name') {
    if (!out.includes(n.name)) out.push(n.name);
  } else if (n.t === 'neg' || n.t === 'call') namesOf(n.a, out);
  else if (n.t === 'bin') {
    namesOf(n.a, out);
    namesOf(n.b, out);
  }
  return out;
}

const FN: Record<ExprFunc, (x: number) => number> = {
  exp: Math.exp,
  ln: (x) => (x > 0 ? Math.log(x) : NaN),
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  sqrt: (x) => (x >= 0 ? Math.sqrt(x) : NaN),
  abs: Math.abs,
  u: (x) => (x >= 0 ? 1 : 0),
};

/** The tree as a function of the input, the other names read through `val`. */
export function compileExpr(
  n: ExprNode,
  input: string,
  val: (name: string) => number,
): (x: number) => number {
  switch (n.t) {
    case 'num':
      return () => n.v;
    case 'name': {
      if (n.name === input) return (x) => x;
      const v = val(n.name);
      return () => v;
    }
    case 'neg': {
      const a = compileExpr(n.a, input, val);
      return (x) => -a(x);
    }
    case 'call': {
      const a = compileExpr(n.a, input, val);
      const f = FN[n.fn];
      return (x) => f(a(x));
    }
    case 'bin': {
      const a = compileExpr(n.a, input, val);
      const b = compileExpr(n.b, input, val);
      switch (n.op) {
        case '+':
          return (x) => a(x) + b(x);
        case '-':
          return (x) => a(x) - b(x);
        case '*':
          return (x) => a(x) * b(x);
        case '/':
          return (x) => {
            const d = b(x);
            return d === 0 ? NaN : a(x) / d;
          };
        case '^':
          return (x) => {
            const [p, q] = [a(x), b(x)];
            // A negative base takes a whole power only (no complex values).
            return p < 0 && !Number.isInteger(q) ? NaN : p ** q;
          };
      }
    }
  }
}

/** The inside of every unit step u(…) and every bottom of a ÷ (where the curve may jump). */
export function jumpsOf(n: ExprNode, out: ExprNode[] = []): ExprNode[] {
  if (n.t === 'call') {
    if (n.fn === 'u' || n.fn === 'tan') out.push(n.fn === 'tan' ? n : n.a);
    jumpsOf(n.a, out);
  } else if (n.t === 'neg') jumpsOf(n.a, out);
  else if (n.t === 'bin') {
    if (n.op === '/') out.push(n.b);
    jumpsOf(n.a, out);
    jumpsOf(n.b, out);
  }
  return out;
}

const MINUS = '−';

/**
 * The tree written as the formula reads, the names replaced by `say(name)` (a value, or "?"),
 * the input by its letter: "x·e^(2x)", "√(4 − x²)", "u(t − 2)". `sup(base, exponent)` marks a
 * raised exponent; a nested one is written with ^.
 */
export function writeExpr(
  n: ExprNode,
  input: string,
  letter: string,
  say: (name: string) => string,
): { t: string; sup?: boolean }[] {
  const out: { t: string; sup?: boolean }[] = [];
  const push = (t: string, sup = false) => {
    const last = out[out.length - 1];
    if (last && !!last.sup === sup) last.t += t;
    else out.push({ t, ...(sup ? { sup: true } : {}) });
  };
  /** Precedence: 1 sum, 2 product, 3 unary, 4 power, 5 atom. */
  const prec = (m: ExprNode): number =>
    m.t === 'bin'
      ? m.op === '+' || m.op === '-'
        ? 1
        : m.op === '^'
          ? 4
          : 2
      : m.t === 'neg'
        ? 3
        : 5;
  const flat = (m: ExprNode): string => text(m, true);
  /** A tree as text; `inSup` writes powers with ^ (no raised text inside raised text). */
  function text(m: ExprNode, inSup: boolean): string {
    const parts: string[] = [];
    walk(m, inSup, (t) => parts.push(t));
    return parts.join('');
  }
  const numSaid = (v: number) => {
    if (Math.abs(v - Math.PI) < 1e-15) return 'π';
    const s = String(Number(v.toPrecision(10)));
    return s.replace('-', MINUS);
  };
  /** A name as written; a negative value in brackets where it follows something. */
  const nameSaid = (name: string) => (name === input ? letter : say(name));
  function walk(m: ExprNode, inSup: boolean, emit: (t: string, sup?: boolean) => void) {
    const wrap = (c: ExprNode, need: boolean) => {
      if (need) emit('(');
      walk(c, inSup, emit);
      if (need) emit(')');
    };
    switch (m.t) {
      case 'num':
        emit(numSaid(m.v));
        return;
      case 'name':
        emit(nameSaid(m.name));
        return;
      case 'neg':
        emit(MINUS);
        wrap(m.a, prec(m.a) <= 2 || text(m.a, inSup).startsWith(MINUS));
        return;
      case 'call': {
        if (m.fn === 'exp') {
          if (inSup) {
            emit('e^(');
            walk(m.a, true, emit);
            emit(')');
          } else {
            emit('e');
            emit(flat(m.a), true);
          }
          return;
        }
        if (m.fn === 'abs') {
          emit('|');
          walk(m.a, inSup, emit);
          emit('|');
          return;
        }
        const head = m.fn === 'sqrt' ? '√' : m.fn;
        emit(`${head}(`);
        walk(m.a, inSup, emit);
        emit(')');
        return;
      }
      case 'bin': {
        const p = prec(m);
        if (m.op === '^') {
          const base = prec(m.a) <= 4 || (m.a.t === 'name' && nameSaid(m.a.name).startsWith(MINUS));
          if (inSup) {
            wrap(m.a, base);
            // A whole-number power inside raised text reads x², not x^(2).
            if (m.b.t === 'num' && Number.isInteger(m.b.v) && m.b.v >= 0) {
              emit([...String(m.b.v)].map((d) => SUPER_DIGITS[Number(d)]).join(''));
              return;
            }
            emit('^(');
            walk(m.b, true, emit);
            emit(')');
          } else {
            wrap(m.a, base);
            emit(flat(m.b), true);
          }
          return;
        }
        if (m.op === '+' || m.op === '-') {
          walk(m.a, inSup, emit);
          // "x + −3" reads "x − 3"; "x − −3" reads "x + 3".
          const right = text(m.b, inSup);
          const rightWrapped = m.op === '-' && prec(m.b) <= 1;
          if (!rightWrapped && right.startsWith(MINUS)) {
            emit(m.op === '+' ? ` ${MINUS} ` : ' + ');
            const parts: string[] = [];
            walk(m.b, inSup, (t, s) => parts.push(s ? `\u0000${t}` : t));
            // Drop the leading minus of the right side.
            replay(parts, emit, true);
          } else {
            emit(m.op === '+' ? ' + ' : ` ${MINUS} `);
            wrap(m.b, rightWrapped);
          }
          return;
        }
        if (m.op === '/') {
          wrap(m.a, prec(m.a) < p);
          emit('/');
          wrap(m.b, prec(m.b) <= p || text(m.b, inSup).startsWith(MINUS));
          return;
        }
        // A product: "2x", "3(x + 1)", "x·e^(…)", "2·3".
        const left = text(m.a, inSup);
        const leftNum = m.a.t === 'num' || (m.a.t === 'name' && m.a.name !== input);
        const rightText = text(m.b, inSup);
        const rightLetter = /^[A-Za-zα-ωπ(√|]/.test(rightText) && !/^\d/.test(rightText);
        const rightWrap =
          (prec(m.b) <= p && !(m.b.t === 'bin' && m.b.op === '*')) || rightText.startsWith(MINUS);
        // "2x", "3(x + 1)", and the input before a bracket, "x(x² + 1)³", "x(x + 1)".
        const plainJoin =
          (leftNum && rightLetter && /[\d?]$/.test(left)) ||
          (m.a.t === 'name' &&
            m.a.name === input &&
            (rightText.startsWith('(') || (rightWrap && !rightText.startsWith(MINUS))));
        wrap(m.a, prec(m.a) < p);
        if (!plainJoin) emit('·');
        wrap(m.b, rightWrap);
        return;
      }
    }
  }
  /** Emits recorded parts, raised ones marked with a leading NUL, dropping a first minus. */
  function replay(parts: string[], emit: (t: string, sup?: boolean) => void, dropMinus: boolean) {
    let dropped = !dropMinus;
    for (const p of parts) {
      const sup = p.startsWith('\u0000');
      let t = sup ? p.slice(1) : p;
      if (!dropped && t.startsWith(MINUS)) {
        t = t.slice(1);
        dropped = true;
      }
      if (t) emit(t, sup);
    }
  }
  walk(n, false, push);
  return out;
}
