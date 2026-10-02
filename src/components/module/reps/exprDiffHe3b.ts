/**
 * HC46, HC65 (college round 3, group B): expressions of the HC10 grammar (`exprHe1e.ts`) in more
 * than one input, and their exact derivatives. `evalExpr` reads every name from an environment;
 * `diffExpr` differentiates the tree by the rules (sum, product, quotient, power, chain), so a
 * partial derivative is the expression's own, never a difference quotient. Pure.
 */
import { type ExprNode, parseExpr, writeExpr } from './exprHe1e';

const FN: Record<string, (x: number) => number> = {
  exp: Math.exp,
  ln: (x) => (x > 0 ? Math.log(x) : NaN),
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  sqrt: (x) => (x >= 0 ? Math.sqrt(x) : NaN),
  abs: Math.abs,
  u: (x) => (x >= 0 ? 1 : 0),
};

/** The tree's value, every name read from `env` (NaN for a name it lacks). */
export function evalExpr(n: ExprNode, env: Record<string, number>): number {
  switch (n.t) {
    case 'num':
      return n.v;
    case 'name':
      return env[n.name] ?? NaN;
    case 'neg':
      return -evalExpr(n.a, env);
    case 'call':
      return FN[n.fn]!(evalExpr(n.a, env));
    case 'bin': {
      const [a, b] = [evalExpr(n.a, env), evalExpr(n.b, env)];
      switch (n.op) {
        case '+':
          return a + b;
        case '-':
          return a - b;
        case '*':
          return a * b;
        case '/':
          return b === 0 ? NaN : a / b;
        case '^':
          return a < 0 && !Number.isInteger(b) ? NaN : a ** b;
      }
    }
  }
}

const num = (v: number): ExprNode => ({ t: 'num', v });
const isNum = (n: ExprNode, v: number) => n.t === 'num' && n.v === v;
const add = (a: ExprNode, b: ExprNode): ExprNode =>
  isNum(a, 0) ? b : isNum(b, 0) ? a : { t: 'bin', op: '+', a, b };
const subtract = (a: ExprNode, b: ExprNode): ExprNode =>
  isNum(b, 0) ? a : isNum(a, 0) ? neg(b) : { t: 'bin', op: '-', a, b };
const neg = (a: ExprNode): ExprNode =>
  a.t === 'num' ? num(-a.v) : a.t === 'neg' ? a.a : { t: 'neg', a };
const mul = (a: ExprNode, b: ExprNode): ExprNode =>
  isNum(a, 0) || isNum(b, 0)
    ? num(0)
    : isNum(a, 1)
      ? b
      : isNum(b, 1)
        ? a
        : a.t === 'num' && b.t === 'num'
          ? num(a.v * b.v)
          : { t: 'bin', op: '*', a, b };
const div = (a: ExprNode, b: ExprNode): ExprNode =>
  isNum(a, 0) ? num(0) : isNum(b, 1) ? a : { t: 'bin', op: '/', a, b };
const pow = (a: ExprNode, b: ExprNode): ExprNode =>
  isNum(b, 1) ? a : isNum(b, 0) ? num(1) : { t: 'bin', op: '^', a, b };
const call = (fn: Extract<ExprNode, { t: 'call' }>['fn'], a: ExprNode): ExprNode => ({
  t: 'call',
  fn,
  a,
});

/** Whether the tree reads the name `v`. */
export function reads(n: ExprNode, v: string): boolean {
  switch (n.t) {
    case 'num':
      return false;
    case 'name':
      return n.name === v;
    case 'neg':
    case 'call':
      return reads(n.a, v);
    case 'bin':
      return reads(n.a, v) || reads(n.b, v);
  }
}

/** The derivative of the tree by the name `v` (every other name held fixed). */
export function diffExpr(n: ExprNode, v: string): ExprNode {
  if (!reads(n, v)) return num(0);
  switch (n.t) {
    case 'num':
      return num(0);
    case 'name':
      return num(n.name === v ? 1 : 0);
    case 'neg':
      return neg(diffExpr(n.a, v));
    case 'call': {
      const da = diffExpr(n.a, v);
      const a = n.a;
      switch (n.fn) {
        case 'exp':
          return mul(n, da);
        case 'ln':
          return div(da, a);
        case 'sin':
          return mul(call('cos', a), da);
        case 'cos':
          return neg(mul(call('sin', a), da));
        case 'tan':
          return div(da, pow(call('cos', a), num(2)));
        case 'sqrt':
          return div(da, mul(num(2), n));
        case 'abs':
          return mul(da, div(a, n));
        case 'u':
          return num(0);
      }
      return num(0);
    }
    case 'bin': {
      const [a, b] = [n.a, n.b];
      const [da, db] = [diffExpr(a, v), diffExpr(b, v)];
      switch (n.op) {
        case '+':
          return add(da, db);
        case '-':
          return subtract(da, db);
        case '*':
          return add(mul(da, b), mul(a, db));
        case '/':
          return div(subtract(mul(da, b), mul(a, db)), pow(b, num(2)));
        case '^':
          if (!reads(b, v)) {
            // a^b with b fixed: b·a^(b − 1)·a′.
            const lower = b.t === 'num' ? num(b.v - 1) : subtract(b, num(1));
            return mul(mul(b, pow(a, lower)), da);
          }
          // a^b = e^(b ln a): a^b·(b′ ln a + b·a′ ÷ a).
          return mul(n, add(mul(db, call('ln', a)), div(mul(b, da), a)));
      }
    }
  }
}

/** f(x, y) with its exact first and second partials, the other names read from `val`. */
export interface Surface {
  f: (x: number, y: number) => number;
  fx: (x: number, y: number) => number;
  fy: (x: number, y: number) => number;
  fxx: (x: number, y: number) => number;
  fxy: (x: number, y: number) => number;
  fyy: (x: number, y: number) => number;
}

/** The surface of an expression in x and y, or undefined when it doesn't parse. */
export function surfaceOf(src: string, val: (name: string) => number): Surface | undefined {
  let tree: ExprNode;
  try {
    tree = parseExpr(src);
  } catch {
    return undefined;
  }
  const env: Record<string, number> = {};
  const fill = (n: ExprNode) => {
    if (n.t === 'name' && n.name !== 'x' && n.name !== 'y' && !(n.name in env))
      env[n.name] = val(n.name);
    else if (n.t === 'neg' || n.t === 'call') fill(n.a);
    else if (n.t === 'bin') {
      fill(n.a);
      fill(n.b);
    }
  };
  fill(tree);
  const at = (t: ExprNode) => (x: number, y: number) => evalExpr(t, { ...env, x, y });
  const [tx, ty] = [diffExpr(tree, 'x'), diffExpr(tree, 'y')];
  return {
    f: at(tree),
    fx: at(tx),
    fy: at(ty),
    fxx: at(diffExpr(tx, 'x')),
    fxy: at(diffExpr(tx, 'y')),
    fyy: at(diffExpr(ty, 'y')),
  };
}

/** A curve y = f(x) from an expression in x, or undefined when it doesn't parse. */
export function curveOfHe3b(
  src: string,
  val: (name: string) => number,
): ((x: number) => number) | undefined {
  const s = surfaceOf(src, val);
  return s ? (x: number) => s.f(x, 0) : undefined;
}

/**
 * The tree with the names in `env` replaced by their values and the arithmetic that leaves
 * folded (0·x and +0 dropped, 1·x written x), so "a*x^2 + d*x" with a = 1, d = 0 reads x².
 */
export function substituteExpr(n: ExprNode, env: Record<string, number>): ExprNode {
  switch (n.t) {
    case 'num':
      return n;
    case 'name':
      return n.name in env ? num(env[n.name]!) : n;
    case 'neg':
      return neg(substituteExpr(n.a, env));
    case 'call':
      return call(n.fn, substituteExpr(n.a, env));
    case 'bin': {
      const [a, b] = [substituteExpr(n.a, env), substituteExpr(n.b, env)];
      if (a.t === 'num' && b.t === 'num' && n.op !== '^' && n.op !== '/')
        return num(evalExpr({ ...n, a, b }, {}));
      switch (n.op) {
        case '+':
          return add(a, b);
        case '-':
          return subtract(a, b);
        case '*':
          return b.t === 'num' && a.t !== 'num' ? mul(b, a) : mul(a, b);
        case '/':
          return div(a, b);
        case '^':
          return pow(a, b);
      }
    }
  }
}

/** A formula as a caption writes it: the inputs as letters, superscripts as Unicode. */
export function formulaText(src: string, env: Record<string, number>, inputs: string[]): string {
  let tree: ExprNode;
  try {
    tree = substituteExpr(parseExpr(src), env);
  } catch {
    return '?';
  }
  const runs = writeExpr(tree, inputs[0]!, inputs[0]!, (name) => name);
  const SUP: Record<string, string> = {
    '0': '⁰',
    '1': '¹',
    '2': '²',
    '3': '³',
    '4': '⁴',
    '5': '⁵',
    '6': '⁶',
    '7': '⁷',
    '8': '⁸',
    '9': '⁹',
    '−': '⁻',
    '-': '⁻',
    '.': '·',
  };
  return runs
    .map((r) =>
      r.sup
        ? [...r.t].every((ch) => ch in SUP)
          ? [...r.t].map((ch) => SUP[ch]).join('')
          : `^(${r.t})`
        : r.t,
    )
    .join('');
}
