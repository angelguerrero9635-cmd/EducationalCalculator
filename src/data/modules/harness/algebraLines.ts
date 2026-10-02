/**
 * Reading linear algebra and complex lines back (HE-E16, HE-E17): a step line that chains
 * equal values ("[[2, 1], [3, 4]] × ⟨5, −1⟩ = ⟨2 × 5 + 1 × (−1), …⟩ = ⟨9, 11⟩",
 * "(30 + j40) ÷ (1 − j2) = … = −10 + j20", "10∠30° × 2∠45° = (10 × 2)∠(30° + 45°) = 20∠75°")
 * must hold side by side, once display rounding is allowed for. Values are numbers, complex
 * numbers (i or j, r∠θ in degrees), vectors ⟨…⟩, matrices [[…], […]] (a bar for an augmented
 * one), λ as a free variable (a characteristic polynomial is checked at sample points), I as
 * the identity, ± as both signs. Row operations ("R₂ → R₂ − 2R₁: [[…]]") are checked against
 * the matrix before them. A side that names anything else (A, v, x) is not read. Test-only.
 */
import {
  cAbs,
  cAdd,
  cConj,
  cDiv,
  cMul,
  complex,
  cPowInt,
  cSqrt,
  cSub,
  fromPolar,
  type Complex,
} from '@/engine/complex';

type Val =
  | { t: 's'; z: Complex }
  | { t: 'v'; xs: Complex[] }
  | { t: 'm'; m: Complex[][]; bar?: number }
  /** c times the identity, its size taken from what it meets. */
  | { t: 'I'; c: Complex };

interface Env {
  lambda?: Complex;
  pm: 1 | -1;
  degrees: boolean;
}

type Node = (env: Env) => Val | undefined;

// ── Tokens ──

type Tok = { k: 'num'; x: number } | { k: 'id'; s: string } | { k: 'op'; s: string };

const SUPERS = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const FUNCS = new Set([
  'det',
  'tr',
  'sqrt',
  'cos',
  'sin',
  'tan',
  'atan',
  'asin',
  'acos',
  'Re',
  'Im',
  'conj',
  'abs',
  'arg',
]);

function tokenize(text: string): Tok[] | undefined {
  const out: Tok[] = [];
  let i = 0;
  const s = text;
  while (i < s.length) {
    const ch = s[i]!;
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    const num = /^(?:\d+(?:,\d{3})*(?:\.\d+)?|\.\d+)(?:e[-+]?\d+)?/.exec(s.slice(i));
    if (num && /\d|\./.test(ch)) {
      out.push({ k: 'num', x: Number(num[0].replace(/,/g, '')) });
      i += num[0].length;
      continue;
    }
    // An inverse trig function: tan⁻¹(…), arctan(…).
    const inv = /^(?:(sin|cos|tan)⁻¹|arc(sin|cos|tan))/.exec(s.slice(i));
    if (inv) {
      out.push({ k: 'id', s: `a${inv[1] ?? inv[2]}` });
      i += inv[0].length;
      continue;
    }
    const word = /^[A-Za-zλπθ]+[₀-₉]*/.exec(s.slice(i));
    if (word) {
      const w = word[0];
      // A name with a subscript (λ₁, R₂, D₁) is a name, never a number.
      if (FUNCS.has(w) || /^(?:[ijIλπ]|ln)$/.test(w)) out.push({ k: 'id', s: w });
      else if (/^[ij]{2,}$/.test(w) || /^[ij]+$/.test(w)) return undefined;
      else out.push({ k: 'id', s: w });
      i += w.length;
      continue;
    }
    if (s.startsWith('⁻¹', i)) {
      out.push({ k: 'op', s: '⁻¹' });
      i += 2;
      continue;
    }
    if (s.startsWith('[[', i) || s.startsWith(']]', i)) {
      out.push({ k: 'op', s: ch }, { k: 'op', s: ch });
      i += 2;
      continue;
    }
    if (SUPERS.includes(ch) || ch === '⁻') {
      let j = i;
      let t = '';
      while (j < s.length && (SUPERS.includes(s[j]!) || s[j] === '⁻')) {
        t += s[j] === '⁻' ? '-' : String(SUPERS.indexOf(s[j]!));
        j++;
      }
      out.push({ k: 'op', s: `^${t}` });
      i = j;
      continue;
    }
    if ('+-−×*·÷/^()[]⟨⟩,|;∠°±∓√ᵀ'.includes(ch)) {
      out.push({ k: 'op', s: ch === '−' ? '-' : ch });
      i++;
      continue;
    }
    return undefined;
  }
  return out;
}

// ── Values ──

const S = (z: Complex): Val => ({ t: 's', z });
const zero = complex(0);
const realOf = (v: Val | undefined) =>
  v?.t === 's' && Math.abs(v.z.im) < 1e-12 * Math.max(1, Math.abs(v.z.re)) ? v.z.re : undefined;

const square = (m: Complex[][]) => m.length === m[0]!.length;
const eye = (n: number, c: Complex) =>
  Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? c : zero)));
const sameShape = (a: Complex[][], b: Complex[][]) =>
  a.length === b.length && a.every((r, i) => r.length === b[i]!.length);

function cDet(m: Complex[][]): Complex {
  const n = m.length;
  if (n === 1) return m[0]![0]!;
  if (n === 2) return cSub(cMul(m[0]![0]!, m[1]![1]!), cMul(m[0]![1]!, m[1]![0]!));
  let d = zero;
  for (let j = 0; j < n; j++) {
    const minor = m.slice(1).map((r) => r.filter((_, c) => c !== j));
    const term = cMul(m[0]![j]!, cDet(minor));
    d = j % 2 ? cSub(d, term) : cAdd(d, term);
  }
  return d;
}

function cInverse(m: Complex[][]): Complex[][] | undefined {
  const n = m.length;
  const a = m.map((r, i) => [...r, ...eye(n, complex(1))[i]!]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (cAbs(a[r]![c]!) > cAbs(a[p]![c]!)) p = r;
    if (cAbs(a[p]![c]!) < 1e-12) return undefined;
    [a[p], a[c]] = [a[c]!, a[p]!];
    const piv = a[c]![c]!;
    a[c] = a[c]!.map((x) => cDiv(x, piv)!);
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const k = a[r]![c]!;
      a[r] = a[r]!.map((x, j) => cSub(x, cMul(k, a[c]![j]!)));
    }
  }
  return a.map((r) => r.slice(n));
}

const matMul = (a: Complex[][], b: Complex[][]) =>
  a.map((r) => b[0]!.map((_, j) => r.reduce((s, x, k) => cAdd(s, cMul(x, b[k]![j]!)), zero)));

function add(a: Val, b: Val, k: 1 | -1): Val | undefined {
  const f = (x: Complex, y: Complex) => (k > 0 ? cAdd(x, y) : cSub(x, y));
  if (a.t === 's' && b.t === 's') return S(f(a.z, b.z));
  if (a.t === 'v' && b.t === 'v' && a.xs.length === b.xs.length)
    return { t: 'v', xs: a.xs.map((x, i) => f(x, b.xs[i]!)) };
  if (a.t === 'm' && b.t === 'm' && sameShape(a.m, b.m))
    return { t: 'm', m: a.m.map((r, i) => r.map((x, j) => f(x, b.m[i]![j]!))) };
  if (a.t === 'm' && b.t === 'I' && square(a.m))
    return add(a, { t: 'm', m: eye(a.m.length, b.c) }, k);
  if (a.t === 'I' && b.t === 'm' && square(b.m))
    return add({ t: 'm', m: eye(b.m.length, a.c) }, b, k);
  if (a.t === 'I' && b.t === 'I') return { t: 'I', c: f(a.c, b.c) };
  return undefined;
}

function scale(c: Complex, v: Val): Val {
  if (v.t === 's') return S(cMul(c, v.z));
  if (v.t === 'v') return { t: 'v', xs: v.xs.map((x) => cMul(c, x)) };
  if (v.t === 'm') return { t: 'm', m: v.m.map((r) => r.map((x) => cMul(c, x))), bar: v.bar };
  return { t: 'I', c: cMul(c, v.c) };
}

function mul(a: Val, b: Val, op: string): Val | undefined {
  if (a.t === 's') return scale(a.z, b);
  if (b.t === 's') return scale(b.z, a);
  if (a.t === 'I') return scale(a.c, b);
  if (b.t === 'I') return scale(b.c, a);
  if (a.t === 'v' && b.t === 'v' && a.xs.length === b.xs.length) {
    if (op === '·') return S(a.xs.reduce((s, x, i) => cAdd(s, cMul(x, b.xs[i]!)), zero));
    if (op === '×' && a.xs.length === 3) {
      const [u, w] = [a.xs, b.xs];
      const c = (p: number, q: number) => cSub(cMul(u[p]!, w[q]!), cMul(u[q]!, w[p]!));
      return { t: 'v', xs: [c(1, 2), c(2, 0), c(0, 1)] };
    }
    return undefined;
  }
  if (a.t === 'm' && b.t === 'v' && a.m[0]!.length === b.xs.length)
    return { t: 'v', xs: a.m.map((r) => r.reduce((s, x, k) => cAdd(s, cMul(x, b.xs[k]!)), zero)) };
  if (a.t === 'm' && b.t === 'm' && a.m[0]!.length === b.m.length)
    return { t: 'm', m: matMul(a.m, b.m) };
  return undefined;
}

function power(a: Val, e: Val): Val | undefined {
  const n = realOf(e);
  if (a.t === 's') {
    if (n !== undefined && Number.isInteger(n)) {
      const p = cPowInt(a.z, n);
      return p && S(p);
    }
    if (e.t === 's' && Math.abs(a.z.im) < 1e-12 && a.z.re > 0 && Math.abs(e.z.im) < 1e-12)
      return S(complex(a.z.re ** e.z.re));
    return undefined;
  }
  if (a.t === 'm' && square(a.m) && n !== undefined && Number.isInteger(n)) {
    if (n === -1) {
      const inv = cInverse(a.m);
      return inv && { t: 'm', m: inv };
    }
    if (n < 0) return undefined;
    let p = eye(a.m.length, complex(1));
    for (let k = 0; k < n; k++) p = matMul(p, a.m);
    return { t: 'm', m: p };
  }
  return undefined;
}

const D = Math.PI / 180;

function call(f: string, a: Val, env: Env): Val | undefined {
  const x = realOf(a);
  const u = env.degrees ? D : 1;
  switch (f) {
    case 'det':
      return a.t === 'm' && square(a.m) ? S(cDet(a.m)) : undefined;
    case 'tr':
      return a.t === 'm' && square(a.m)
        ? S(a.m.reduce((s, r, i) => cAdd(s, r[i]!), zero))
        : undefined;
    case 'sqrt':
      return a.t === 's' ? S(cSqrt(a.z)) : undefined;
    case 'abs':
      if (a.t === 's') return S(complex(cAbs(a.z)));
      if (a.t === 'v') return S(complex(Math.hypot(...a.xs.map(cAbs))));
      return a.t === 'm' && square(a.m) ? S(cDet(a.m)) : undefined;
    case 'Re':
      return a.t === 's' ? S(complex(a.z.re)) : undefined;
    case 'Im':
      return a.t === 's' ? S(complex(a.z.im)) : undefined;
    case 'conj':
      return a.t === 's' ? S(cConj(a.z)) : undefined;
    case 'arg':
      return a.t === 's' ? S(complex(Math.atan2(a.z.im, a.z.re) / u)) : undefined;
    case 'cos':
      return x === undefined ? undefined : S(complex(Math.cos(x * u)));
    case 'sin':
      return x === undefined ? undefined : S(complex(Math.sin(x * u)));
    case 'tan':
      return x === undefined ? undefined : S(complex(Math.tan(x * u)));
    case 'atan':
      return x === undefined ? undefined : S(complex(Math.atan(x) / u));
    case 'asin':
      return x === undefined ? undefined : S(complex(Math.asin(x) / u));
    case 'acos':
      return x === undefined ? undefined : S(complex(Math.acos(x) / u));
    default:
      return undefined;
  }
}

// ── Parser ──

class Parser {
  i = 0;
  units = new Set<string>();
  constructor(private toks: Tok[]) {}
  peek(o = 0) {
    return this.toks[this.i + o];
  }
  isOp(s: string, o = 0) {
    const t = this.peek(o);
    return t?.k === 'op' && t.s === s;
  }
  eat(s: string) {
    if (!this.isOp(s)) return false;
    this.i++;
    return true;
  }
  done() {
    return this.i >= this.toks.length;
  }

  expr(): Node | undefined {
    let left = this.unaryTerm();
    while (left) {
      const t = this.peek();
      if (t?.k !== 'op' || !['+', '-', '±', '∓'].includes(t.s)) break;
      this.i++;
      const right = this.term();
      if (!right) return undefined;
      const l = left;
      left = (env) => {
        const [a, b] = [l(env), right(env)];
        if (!a || !b) return undefined;
        const k = t.s === '+' ? 1 : t.s === '-' ? -1 : t.s === '±' ? env.pm : -env.pm;
        return add(a, b, k as 1 | -1);
      };
    }
    return left;
  }

  /** A term, which may open with a sign. */
  unaryTerm(): Node | undefined {
    const t = this.peek();
    if (t?.k === 'op' && ['-', '+', '±', '∓'].includes(t.s)) {
      this.i++;
      const inner = this.term();
      if (!inner) return undefined;
      return (env) => {
        const v = inner(env);
        if (!v) return undefined;
        const k = t.s === '+' ? 1 : t.s === '-' ? -1 : t.s === '±' ? env.pm : -env.pm;
        return scale(complex(k), v);
      };
    }
    return this.term();
  }

  startsPrimary(o = 0) {
    const t = this.peek(o);
    if (!t) return false;
    if (t.k === 'num' || t.k === 'id') return true;
    return ['(', '[', '⟨', '√'].includes(t.s);
  }

  term(): Node | undefined {
    let left = this.factor();
    while (left) {
      const t = this.peek();
      let op: string;
      if (t?.k === 'op' && ['×', '*', '·', '÷', '/'].includes(t.s)) {
        // A conjugate star: "(3 + j4)* = 3 − j4".
        if (t.s === '*' && (this.done() || this.i + 1 >= this.toks.length || this.isOp(')', 1)))
          break;
        op = t.s;
        this.i++;
      } else if (this.startsPrimary()) op = 'implicit';
      else break;
      const right = this.factor();
      if (!right) return undefined;
      const l = left;
      left = (env) => {
        const [a, b] = [l(env), right(env)];
        if (!a || !b) return undefined;
        if (op === '÷' || op === '/') {
          const d = b.t === 's' ? b.z : undefined;
          if (!d) return undefined;
          const r = cDiv(complex(1), d);
          return r && scale(r, a);
        }
        return mul(a, b, op === '*' || op === 'implicit' ? '·*' : op);
      };
    }
    return left;
  }

  /** A signed factor after × or ÷ (3 × −2 is read too). */
  factor(): Node | undefined {
    if (this.isOp('-') || this.isOp('±')) {
      const s = (this.peek() as { s: string }).s;
      this.i++;
      const inner = this.factor();
      return (
        inner &&
        ((env) => {
          const v = inner(env);
          return v && scale(complex(s === '-' ? -1 : env.pm), v);
        })
      );
    }
    let base = this.postfix();
    if (!base) return undefined;
    if (this.eat('^')) {
      const e = this.factor();
      if (!e) return undefined;
      const b = base;
      base = (env) => {
        const [x, y] = [b(env), e(env)];
        return x && y ? power(x, y) : undefined;
      };
    }
    return base;
  }

  postfix(): Node | undefined {
    let node = this.primary();
    while (node) {
      const t = this.peek();
      if (t?.k !== 'op') break;
      const n = node;
      if (t.s.startsWith('^') && t.s.length > 1) {
        this.i++;
        const e = Number(t.s.slice(1));
        node = (env) => {
          const v = n(env);
          return v && power(v, S(complex(e)));
        };
      } else if (t.s === '⁻¹') {
        this.i++;
        node = (env) => {
          const v = n(env);
          return v && power(v, S(complex(-1)));
        };
      } else if (t.s === 'ᵀ') {
        this.i++;
        node = (env) => {
          const v = n(env);
          if (v?.t !== 'm') return v?.t === 'v' ? v : undefined;
          return { t: 'm', m: v.m[0]!.map((_, j) => v.m.map((r) => r[j]!)) };
        };
      } else if (t.s === '°') {
        this.i++;
      } else if (t.s === '*' && (this.i + 1 >= this.toks.length || this.isOp(')', 1))) {
        this.i++;
        node = (env) => {
          const v = n(env);
          return v?.t === 's' ? S(cConj(v.z)) : undefined;
        };
      } else if (t.s === '∠') {
        this.i++;
        let sign = 1;
        if (this.eat('-')) sign = -1;
        const angle = this.postfix();
        if (!angle) return undefined;
        node = (env) => {
          const r = realOf(n(env));
          const a = realOf(angle(env));
          return r === undefined || a === undefined ? undefined : S(fromPolar(r, sign * a));
        };
      } else break;
    }
    return node;
  }

  primary(): Node | undefined {
    const t = this.peek();
    if (!t) return undefined;
    if (t.k === 'num') {
      this.i++;
      return () => S(complex(t.x));
    }
    if (t.k === 'id') {
      this.i++;
      const w = t.s;
      if (w === 'i' || w === 'j') {
        this.units.add(w);
        return () => S(complex(0, 1));
      }
      if (w === 'π') return () => S(complex(Math.PI));
      if (w === 'λ') return (env) => (env.lambda ? S(env.lambda) : undefined);
      if (w === 'I') return () => ({ t: 'I', c: complex(1) });
      if (FUNCS.has(w)) {
        // det [[…]], cos 36.87°, sqrt(…): the argument is the next factor.
        // (a bare argument may carry a sign: cos −131°)
        const arg = this.isOp('(') ? this.postfix() : this.factor();
        if (!arg) return undefined;
        return (env) => {
          const a = arg(env);
          return a && call(w, a, env);
        };
      }
      return undefined;
    }
    // The angle of a complex value, in degrees: ∠(8 + j6).
    if (t.s === '∠') {
      this.i++;
      const arg = this.postfix();
      if (!arg) return undefined;
      return (env) => {
        const a = arg(env);
        return a?.t === 's' ? S(complex((Math.atan2(a.z.im, a.z.re) * 180) / Math.PI)) : undefined;
      };
    }
    if (t.s === '√') {
      this.i++;
      const arg = this.postfix();
      if (!arg) return undefined;
      return (env) => {
        const a = arg(env);
        return a && call('sqrt', a, env);
      };
    }
    if (t.s === '(') {
      this.i++;
      const e = this.expr();
      if (!e || !this.eat(')')) return undefined;
      return e;
    }
    if (t.s === '|') {
      this.i++;
      const e = this.expr();
      if (!e || !this.eat('|')) return undefined;
      return (env) => {
        const a = e(env);
        return a && call('abs', a, env);
      };
    }
    if (t.s === '⟨') {
      this.i++;
      const items: Node[] = [];
      do {
        const e = this.expr();
        if (!e) return undefined;
        items.push(e);
      } while (this.eat(','));
      if (!this.eat('⟩')) return undefined;
      return (env) => {
        const xs = items.map((f) => f(env));
        return xs.every((x) => x?.t === 's')
          ? { t: 'v', xs: xs.map((x) => (x as { z: Complex }).z) }
          : undefined;
      };
    }
    if (t.s === '[' && this.isOp('[', 1)) return this.matrix();
    return undefined;
  }

  /** [[a, b | c], [d, e | f]] or [[a, b; c, d]]. */
  matrix(): Node | undefined {
    this.i++;
    const rows: Node[][] = [];
    let bar: number | undefined;
    const row = (): boolean => {
      const items: Node[] = [];
      for (;;) {
        const e = this.expr();
        if (!e) return false;
        items.push(e);
        if (this.eat(',')) continue;
        if (this.eat('|')) {
          if (bar !== undefined && bar !== items.length) return false;
          bar = items.length;
          continue;
        }
        break;
      }
      rows.push(items);
      return true;
    };
    if (this.eat('[')) {
      do {
        if (!row() || !this.eat(']')) return undefined;
      } while (this.eat(',') && this.eat('['));
    } else return undefined;
    if (!this.eat(']')) return undefined;
    if (rows.some((r) => r.length !== rows[0]!.length)) return undefined;
    return (env) => {
      const m = rows.map((r) => r.map((f) => f(env)));
      if (!m.every((r) => r.every((x) => x?.t === 's'))) return undefined;
      return { t: 'm', m: m.map((r) => r.map((x) => (x as { z: Complex }).z)), bar };
    };
  }
}

/** A side of a line as a node, or undefined when it names something unknown. */
function parseSide(text: string): { node: Node; units: Set<string>; lambda: boolean } | undefined {
  const toks = tokenize(text);
  if (!toks?.length) return undefined;
  const p = new Parser(toks);
  const node = p.expr();
  if (!node || !p.done()) return undefined;
  // i and j both as units: unit vectors (3i + 4j), not a complex number.
  if (p.units.size > 1) return undefined;
  const lambda = toks.some((t) => t.k === 'id' && t.s === 'λ');
  return { node, units: p.units, lambda };
}

const LAMBDAS = [complex(0.37), complex(1.91), complex(-2.3), complex(3.17)];

/** Every value a side can mean: ± is both signs, "5 or 2" both values. */
function sideValues(text: string, degrees: boolean, lambda?: Complex): Val[] | undefined {
  const parts = text.split(' or ');
  const out: Val[] = [];
  for (const part of parts) {
    const side = parseSide(stripUnit(part));
    if (!side) return undefined;
    const pms: (1 | -1)[] = /[±∓]/.test(part) ? [1, -1] : [1];
    for (const pm of pms) {
      const v = side.node({ pm, degrees, lambda });
      if (!v) return undefined;
      out.push(v);
    }
  }
  return out;
}

/** A unit after a value (40 − j30 Ω, 2 A, 10∠30° V) is not part of it. */
const stripUnit = (s: string) =>
  s.trim().replace(/(?<=[\d)⟩°\]])\s+(?:[kMmμnGp]?(?:Ω|V|A|W|VA|var|S|F|H)|rad\/s|m\/s|N|m)$/, '');

const hasLambda = (text: string) => /λ(?![₀-₉])/.test(text);

/** The largest number printed in a text (its terms set how far rounding can move a side). */
const largest = (text: string) =>
  Math.max(0, ...(text.replace(/(\d),(?=\d{3})/g, '$1').match(/\d+(?:\.\d+)?/g) ?? []).map(Number));

/**
 * Equal as printed. A line of whole numbers and fractions only (no decimal, no angle) is exact:
 * its sides agree to 10⁻⁹ (`big` < 0). Otherwise display rounding is allowed for as elsewhere in
 * the harness (`shownClose`): 0.2% of the size, 10⁻³, and 10⁻⁴ of the line's largest number.
 */
const closeTo = (a: Complex, b: Complex, big: number) => {
  const scale = Math.max(cAbs(a), cAbs(b));
  const tol = big < 0 ? 1e-9 * (1 + scale) : 2e-3 * scale + 1e-3 + 1e-4 * big;
  return Math.abs(a.re - b.re) <= tol && Math.abs(a.im - b.im) <= tol;
};

/** Entries in reading order, or undefined for a scaled identity (its size is unknown). */
function entries(v: Val): { shape: string; xs: Complex[] } | undefined {
  if (v.t === 's') return { shape: 's', xs: [v.z] };
  if (v.t === 'v') return { shape: `v${v.xs.length}`, xs: v.xs };
  if (v.t === 'm') {
    // A column (n × 1) or row (1 × n) matrix is a vector.
    if (v.m[0]!.length === 1) return { shape: `v${v.m.length}`, xs: v.m.map((r) => r[0]!) };
    if (v.m.length === 1) return { shape: `v${v.m[0]!.length}`, xs: v.m[0]! };
    return { shape: `m${v.m.length}x${v.m[0]!.length}`, xs: v.m.flat() };
  }
  return undefined;
}

function sameVal(a: Val, b: Val, big: number): boolean {
  if (a.t === 'I' && b.t === 'I') return closeTo(a.c, b.c, big);
  if (a.t === 'I' && b.t === 'm' && square(b.m))
    return sameVal({ t: 'm', m: eye(b.m.length, a.c) }, b, big);
  if (b.t === 'I') return sameVal(b, a, big);
  const [x, y] = [entries(a), entries(b)];
  if (!x || !y || x.shape !== y.shape) return false;
  return x.xs.every((z, i) => closeTo(z, y.xs[i]!, big));
}

/** Two sides' value lists agree: the same values in any order, or one value among the other's. */
function sameSet(a: Val[], b: Val[], big: number): boolean {
  if (a.length === 1 || b.length === 1) {
    const [one, many] = a.length === 1 ? [a[0]!, b] : [b[0]!, a];
    return many.some((v) => sameVal(one, v, big));
  }
  if (a.length !== b.length) return false;
  const left = [...b];
  return a.every((v) => {
    const k = left.findIndex((w) => sameVal(v, w, big));
    if (k < 0) return false;
    left.splice(k, 1);
    return true;
  });
}

/** Whether a line has anything this reader is for (a matrix, a vector, i or j, ∠, λ, det). */
export const ALGEBRA_LINE =
  /⟨|\[\[|∠|λ|\bdet\b|[ᵀ]|\d ?[ij]\b|\b[ij]\d|\b[ij][²³⁴]|[-−+] [ij]\b|\bj\(|R[₀-₉]+ (?:→|↔)|\bD[₀-₉]* ÷ D\b|^nullity = /;

/** How many sides of a line this reader reads (a label before ": " left out). */
export function readableSides(line: string): number {
  const body = line.slice(line.lastIndexOf(': ') + (line.includes(': ') ? 2 : 0));
  const degrees = line.includes('°');
  return body
    .replace(/^→\s*|^=\s*/, '')
    .split(/\s=\s/)
    .filter((t) => sideValues(t, degrees, hasLambda(t) ? LAMBDAS[0] : undefined)).length;
}

/** The value a side of a row-operation line has (its matrix), for the next operation. */
type Last = Val | undefined;

/**
 * Problems with one line's chain of equal sides; `prev` is the value the line before ended at
 * (a line that starts "= …" continues it). Returns the problems and the value this line ends
 * at.
 */
export function checkAlgebraLine(line: string, prev?: Last): { problems: string[]; last: Last } {
  const problems: string[] = [];
  const degrees = line.includes('°');
  // A label before the line's values ("Check: …", "R₂ → R₂ − 2R₁: …", "λ = 5: …").
  const colon = line.lastIndexOf(': ');
  const label = colon >= 0 ? line.slice(0, colon) : '';
  let body = colon >= 0 ? line.slice(colon + 2) : line;
  body = body.replace(/^→\s*/, '');
  const continues = /^=\s/.test(body);
  if (continues) body = body.replace(/^=\s*/, '');
  const sides = body.split(/\s=\s/);
  type Side = { text: string; lambda: boolean; vals?: Val[][] };
  const read: Side[] = sides.map((text) => {
    const lambda = hasLambda(text);
    const vals = lambda
      ? (() => {
          const at = LAMBDAS.map((l) => sideValues(text, degrees, l));
          return at.every((x) => x) ? (at as Val[][]) : undefined;
        })()
      : (() => {
          const v = sideValues(text, degrees);
          return v ? [v] : undefined;
        })();
    return { text, lambda, vals };
  });
  const big = /\d\.\d|∠|°/.test(line) ? largest(line) : -1;
  const chain: { text: string; lambda: boolean; vals: Val[][] }[] = [];
  if (continues && prev) chain.push({ text: '(the line before)', lambda: false, vals: [[prev]] });
  for (const s of read) if (s.vals) chain.push(s as (typeof chain)[number]);
  for (const lambda of [false, true]) {
    const same = chain.filter((s) => s.lambda === lambda);
    for (let k = 1; k < same.length; k++) {
      const [a, b] = [same[k - 1]!, same[k]!];
      const ok = a.vals.every((va, n) => sameSet(va, b.vals[n] ?? b.vals[0]!, big));
      if (!ok) problems.push(`"${a.text}" ≠ "${b.text}" in "${line}"`);
    }
  }
  // A row operation: the matrix before it, operated on, is the one printed.
  const ops = /^(?:R[₀-₉]+ (?:→|↔) [^,]+)(?:, R[₀-₉]+ (?:→|↔) [^,]+)*$/.test(label)
    ? label.split(', ')
    : undefined;
  const lastSide = [...read].reverse().find((s) => s.vals && !s.lambda);
  const last = lastSide?.vals?.[0]?.[0];
  if (ops && prev?.t === 'm' && last?.t === 'm') {
    const expected = applyOps(prev.m, ops);
    if (!expected) problems.push(`can't read the row operation "${label}"`);
    else if (!sameVal({ t: 'm', m: expected }, last, big))
      problems.push(`row operation "${label}" doesn't give "${body}"`);
  }
  return { problems, last: last ?? (continues ? prev : undefined) };
}

const rowIndex = (s: string) => Number([...s].map((c) => '₀₁₂₃₄₅₆₇₈₉'.indexOf(c)).join('')) - 1;

/** The matrix after row operations done at once from `m` ("R₂ → R₂ − 2R₁", "R₁ ↔ R₂"). */
function applyOps(m: Complex[][], ops: string[]): Complex[][] | undefined {
  const out = m.map((r) => [...r]);
  for (const op of ops) {
    const swap = /^R([₀-₉]+) ↔ R([₀-₉]+)$/.exec(op.trim());
    if (swap) {
      const [i, j] = [rowIndex(swap[1]!), rowIndex(swap[2]!)];
      if (!m[i] || !m[j]) return undefined;
      [out[i], out[j]] = [m[j]!, m[i]!];
      continue;
    }
    const to = /^R([₀-₉]+) → (.+)$/.exec(op.trim());
    if (!to) return undefined;
    const target = rowIndex(to[1]!);
    if (!m[target]) return undefined;
    // A combination of rows: each term a coefficient (2, (1/3), −) and a row.
    let row: Complex[] = m[0]!.map(() => zero);
    const rest = to[2]!.replace(/−/g, '-').replace(/\s+/g, '');
    const term = /([+-]?)(\([^()]*\)|[\d./]*)R([₀-₉]+)/gy;
    let at = 0;
    for (let t = term.exec(rest); t; t = term.exec(rest)) {
      at = term.lastIndex;
      const sign = t[1] === '-' ? -1 : 1;
      const k = t[2] ? sideValues(t[2], false) : [S(complex(1))];
      const kv = k && realOf(k[0]);
      const src = m[rowIndex(t[3]!)];
      if (kv === undefined || !src) return undefined;
      row = row.map((x, c) => cAdd(x, cMul(complex(sign * kv), src[c]!)));
    }
    if (at !== rest.length) return undefined;
    out[target] = row;
  }
  return out;
}

/**
 * Problems in a step's lines (empty when every chain holds): each line read on its own, a line
 * starting "= …" continuing the one before, a row operation checked against the matrix the
 * line before ended at.
 */
export function checkAlgebraLines(lines: readonly string[]): string[] {
  const problems: string[] = [];
  let prev: Last;
  for (const line of lines) {
    if (!ALGEBRA_LINE.test(line) && !/^=\s/.test(line)) {
      prev = undefined;
      continue;
    }
    if (/^=\s/.test(line) && !prev) continue;
    const r = checkAlgebraLine(line, prev);
    problems.push(...r.problems);
    prev = r.last;
  }
  return problems;
}

/**
 * A complex or matrix expression's value as one number, for the scalar reader: Re(…), Im(…),
 * |…| of a complex number, arg(…). Undefined when it isn't one number.
 */
export function evaluateAlgebra(text: string): Complex | undefined {
  const v = sideValues(text, text.includes('°'));
  return v?.length === 1 && v[0]!.t === 's' ? v[0]!.z : undefined;
}

/**
 * The scalar reader's pre-pass (`evaluate`): Re(…), Im(…) and arg(…) of a complex expression,
 * and |…| around one with i or j, become their number, so a complex value's part reads as a
 * number in a substituted line ("Re(Z) = Re((30 + j40) ÷ (1 − j2))").
 */
export function complexPrepass(text: string): string {
  let s = text;
  for (let guard = 0; guard < 20; guard++) {
    const m = /\b(Re|Im|arg)\(/.exec(s);
    if (!m) break;
    // The matching bracket.
    let depth = 0;
    let end = -1;
    for (let k = m.index + m[0].length - 1; k < s.length; k++) {
      if (s[k] === '(') depth++;
      else if (s[k] === ')' && --depth === 0) {
        end = k;
        break;
      }
    }
    if (end < 0) break;
    const z = evaluateAlgebra(s.slice(m.index, end + 1));
    if (!z) break;
    s = `${s.slice(0, m.index)}(${z.re})${s.slice(end + 1)}`;
  }
  // A determinant written out: det [[4, 7], [2, 6]].
  for (let guard = 0; guard < 20; guard++) {
    const m = /\bdet ?\[\[/.exec(s);
    if (!m) break;
    let depth = 0;
    let end = -1;
    for (let k = m.index + m[0].length - 2; k < s.length; k++) {
      if (s[k] === '[') depth++;
      else if (s[k] === ']' && --depth === 0) {
        end = k;
        break;
      }
    }
    const z = end < 0 ? undefined : evaluateAlgebra(s.slice(m.index, end + 1));
    if (!z) break;
    s = `${s.slice(0, m.index)}(${z.re})${s.slice(end + 1)}`;
  }
  return s.replace(/\|([^|]*(?:\d ?[ij]\b|\b[ij]\d|∠)[^|]*)\|/g, (whole, inner: string) => {
    const z = evaluateAlgebra(`|${inner}|`);
    return z ? `(${z.re})` : whole;
  });
}
