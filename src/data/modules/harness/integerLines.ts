/**
 * Reading whole-number lines exactly (HE-E21): ⌊ ⌋, ⌈ ⌉, mod, round, log₂, gcd, lcm, min, max,
 * sort, n!, C(n, r), P(n, r), numbers in base 2, 8 and 16 (101101₂, 2D₁₆, 0x2D), dotted quads
 * (192.168.10.77, 11111111.…₂), AND, OR, XOR and shifts, and integers past 2⁵³, with BigInt
 * fractions, so a wrong last digit of 2⁶⁴ is caught where a float would round it away. A side
 * with a decimal in it (⌊1.2031⌋, log₂ 5) is compared within display rounding.
 *
 * Each line's chain of sides (=, ≈, <, ≤, >, ≥) must hold; "45 ÷ 2 = 22 remainder 1" must be a
 * true division; "Invert every bit: …" must flip the bits of the line before it; a line labelled
 * "Signed" reads its base-2 and base-16 numbers in two's complement at their written width.
 * Test-only.
 */

type Q = { n: bigint; d: bigint };
interface Num {
  /** The exact value, when every number in it was exact. */
  q?: Q;
  /** The value as a float (approximate when `q` is missing). */
  x: number;
}
type Val = Num | { list: Num[] };

const isNum = (v: Val): v is Num => !('list' in v);

// ── Exact fractions ──

const babs = (n: bigint) => (n < 0n ? -n : n);
function bgcd(a: bigint, b: bigint): bigint {
  [a, b] = [babs(a), babs(b)];
  while (b) [a, b] = [b, a % b];
  return a;
}
function frac(n: bigint, d: bigint): Q | undefined {
  if (d === 0n) return undefined;
  if (d < 0n) [n, d] = [-n, -d];
  const g = bgcd(n, d) || 1n;
  return { n: n / g, d: d / g };
}
/** A BigInt as a float, even past 10³⁰⁸ where Number() is Infinity (only for comparisons). */
function toFloat(q: Q): number {
  const x = Number(q.n) / Number(q.d);
  if (Number.isFinite(x)) return x;
  return Math.sign(Number(q.n)) * Math.exp(lnBig(babs(q.n)) - lnBig(q.d));
}
function lnBig(n: bigint): number {
  const s = n.toString();
  if (s.length <= 15) return Math.log(Number(n));
  return Math.log(Number(s.slice(0, 15))) + (s.length - 15) * Math.LN10;
}
const exact = (q: Q | undefined): Num | undefined => (q ? { q, x: toFloat(q) } : undefined);
const exactInt = (n: bigint) => exact({ n, d: 1n })!;
const approx = (x: number): Num | undefined => (Number.isFinite(x) ? { x } : undefined);
const isInt = (v: Num) => v.q !== undefined && v.q.d === 1n;
/** ⌊q⌋ exactly. */
function floorQ(q: Q): bigint {
  const t = q.n / q.d;
  return q.n % q.d !== 0n && q.n < 0n ? t - 1n : t;
}

// ── Tokens ──

type Tok =
  | { t: 'num'; v: Num; based?: { width: number; digits: string; radix: number } }
  | { t: 'op'; v: string }
  | { t: 'sup'; v: number }
  | { t: 'fn'; v: string }
  | { t: 'word'; v: string };

const SUPERS = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const RADIX: Record<string, number> = { '₂': 2, '₈': 8, '₁₆': 16, '₁₀': 10 };
const BITS: Record<number, number> = { 2: 1, 8: 3, 16: 4, 10: 0 };

function readDigits(digits: string, radix: number): bigint | undefined {
  const allowed = '0123456789ABCDEF'.slice(0, radix);
  let acc = 0n;
  for (const c of digits.toUpperCase()) {
    const d = allowed.indexOf(c);
    if (d < 0) return undefined;
    acc = acc * BigInt(radix) + BigInt(d);
  }
  return acc;
}

/** A based number token at the start of `s`: [whole match, value, digits, radix]. */
export const BASED =
  /^(?:0([xbo])([0-9A-Fa-f]+(?: [0-9A-Fa-f]{4})*)|([0-9A-F]+(?: [0-9A-F]{3,4})*)(₂|₈|₁₆|₁₀))/;
const DOTTED_BITS = /^[01]{8}(?:\.[01]{8}){3}₂/;
const QUAD = /^\d{1,3}(?:\.\d{1,3}){3}(?![\d.])/;

function quadValue(text: string, radix: number): bigint | undefined {
  const parts = text.replace(/₂$/, '').split('.');
  let acc = 0n;
  for (const p of parts) {
    const o = readDigits(p, radix);
    if (o === undefined || o > 255n) return undefined;
    acc = acc * 256n + o;
  }
  return acc;
}

const WORD_OPS = new Set(['mod', 'AND', 'OR', 'XOR']);
const FUNCS = new Set(['gcd', 'lcm', 'min', 'max', 'round', 'sort', 'C', 'P', 'ln', 'abs']);

function tokenize(text: string, signed: boolean): Tok[] | undefined {
  const toks: Tok[] = [];
  let s = text;
  while (s.length) {
    const ws = /^\s+/.exec(s);
    if (ws) {
      s = s.slice(ws[0].length);
      continue;
    }
    let m: RegExpExecArray | null;
    if ((m = DOTTED_BITS.exec(s))) {
      toks.push({ t: 'num', v: exactInt(quadValue(m[0], 2)!) });
    } else if ((m = QUAD.exec(s))) {
      const q = quadValue(m[0], 10);
      if (q === undefined) return undefined;
      toks.push({ t: 'num', v: exactInt(q) });
    } else if ((m = BASED.exec(s)) && !/^[A-Za-z]/.test(s.slice(m[0].length))) {
      const radix = m[1] ? { x: 16, b: 2, o: 8 }[m[1].toLowerCase() as 'x'] : RADIX[m[4]!]!;
      const digits = (m[2] ?? m[3]!).replace(/ /g, '');
      let v = readDigits(digits, radix);
      if (v === undefined) return undefined;
      const width = digits.length * BITS[radix]!;
      // Two's complement at the written width: the top bit weighs −2ʷ⁻¹.
      if (signed && width > 0 && v >= 1n << BigInt(width - 1)) v -= 1n << BigInt(width);
      toks.push({ t: 'num', v: exactInt(v), based: { width, digits, radix } });
    } else if ((m = /^\d+(?:\.\d+)?/.exec(s))) {
      const [w, f = ''] = m[0].split('.');
      toks.push({
        t: 'num',
        v: f
          ? { q: frac(BigInt(w! + f), 10n ** BigInt(f.length)), x: Number(m[0]) }
          : exactInt(BigInt(w!)),
      });
      // (a decimal is display-rounded: its exact value is not the true one)
      if (f) delete (toks[toks.length - 1] as { v: Num }).v.q;
    } else if ((m = /^⁻?[⁰¹²³⁴⁵⁶⁷⁸⁹]+/.exec(s))) {
      const e = Number([...m[0]].map((c) => (c === '⁻' ? '-' : SUPERS.indexOf(c))).join(''));
      toks.push({ t: 'sup', v: e });
    } else if ((m = /^(?:<<|>>|!!|[-+×·÷/^()⌊⌋⌈⌉,!|½π−])/.exec(s))) {
      toks.push({ t: 'op', v: m[0] === '−' ? '-' : m[0] === '·' ? '×' : m[0] });
    } else if ((m = /^log₂/.exec(s))) {
      toks.push({ t: 'fn', v: 'log₂' });
    } else if ((m = /^log₁₀/.exec(s))) {
      toks.push({ t: 'fn', v: 'log₁₀' });
    } else if ((m = /^[A-Za-z]+/.exec(s))) {
      const w = m[0];
      if (WORD_OPS.has(w)) toks.push({ t: 'op', v: w });
      else if (FUNCS.has(w)) toks.push({ t: 'fn', v: w });
      else return undefined;
    } else {
      return undefined;
    }
    s = s.slice(m[0].length);
  }
  return toks;
}

// ── Values ──

function arith(a: Num, b: Num, op: string): Num | undefined {
  if (a.q && b.q) {
    const [x, y] = [a.q, b.q];
    switch (op) {
      case '+':
        return exact(frac(x.n * y.d + y.n * x.d, x.d * y.d));
      case '-':
        return exact(frac(x.n * y.d - y.n * x.d, x.d * y.d));
      case '×':
        return exact(frac(x.n * y.n, x.d * y.d));
      case '÷':
      case '/':
        return y.n === 0n ? undefined : exact(frac(x.n * y.d, x.d * y.n));
    }
  }
  switch (op) {
    case '+':
      return approx(a.x + b.x);
    case '-':
      return approx(a.x - b.x);
    case '×':
      return approx(a.x * b.x);
    case '÷':
    case '/':
      return b.x === 0 ? undefined : approx(a.x / b.x);
  }
  return undefined;
}

function power(a: Num, e: Num): Num | undefined {
  if (a.q && isInt(e)) {
    const k = e.q!.n;
    if (babs(k) > 4096n) return undefined;
    // (keep the size sane: about 2⁶⁵⁵³⁶ at most)
    if (babs(a.q.n) > 1n && Number(babs(k)) * a.q.n.toString(2).length > 65536) return undefined;
    const [n, d] = k >= 0n ? [a.q.n ** k, a.q.d ** k] : [a.q.d ** -k, a.q.n ** -k];
    return exact(frac(n, d));
  }
  return approx(a.x ** e.x);
}

function factorial(a: Num, step: bigint): Num | undefined {
  if (!isInt(a) || a.q!.n < 0n || a.q!.n > 3000n) return undefined;
  let p = 1n;
  for (let k = a.q!.n; k > 1n; k -= step) p *= k;
  return exactInt(p);
}

function log2Of(a: Num): Num | undefined {
  if (a.q && a.q.n > 0n) {
    const { n, d } = a.q;
    const pow = (b: bigint) => (b & (b - 1n)) === 0n;
    if (d === 1n && pow(n)) return exactInt(BigInt(n.toString(2).length - 1));
    if (n === 1n && pow(d)) return exactInt(-BigInt(d.toString(2).length - 1));
  }
  if (a.q && a.q.n > 0n) return approx((lnBig(a.q.n) - lnBig(a.q.d)) / Math.LN2);
  return a.x > 0 ? approx(Math.log2(a.x)) : undefined;
}

/** ⌈log₂ x⌉ and ⌊log₂ x⌋ exactly for a whole x (the bits it takes). */
function roundedLog2(a: Num, ceil: boolean): Num | undefined {
  if (isInt(a) && a.q!.n >= 1n) {
    const n = a.q!.n;
    if (ceil) return exactInt(n === 1n ? 0n : BigInt((n - 1n).toString(2).length));
    return exactInt(BigInt(n.toString(2).length - 1));
  }
  return undefined;
}

function rounded(a: Num, how: 'floor' | 'ceil' | 'round'): Num {
  if (a.q) {
    if (how === 'floor') return exactInt(floorQ(a.q));
    if (how === 'ceil') return exactInt(-floorQ({ n: -a.q.n, d: a.q.d }));
    // a half away from 0
    const twice = { n: 2n * babs(a.q.n) + a.q.d, d: 2n * a.q.d };
    const r = floorQ(twice);
    return exactInt(a.q.n < 0n ? -r : r);
  }
  const f = how === 'floor' ? Math.floor : how === 'ceil' ? Math.ceil : Math.round;
  // (a display-rounded decimal: within 10⁻⁹ of a whole number counts as it)
  const near = Math.round(a.x);
  const x = Math.abs(a.x - near) < 1e-9 && how !== 'round' ? near : f(a.x);
  return { x: how === 'round' ? Math.sign(a.x) * Math.floor(Math.abs(a.x) + 0.5) : x };
}

function intOp(a: Num, b: Num, op: string): Num | undefined {
  if (op === 'mod') {
    if (a.q && b.q && b.q.n !== 0n) {
      const q = floorQ(frac(a.q.n * b.q.d, a.q.d * b.q.n)!);
      return arith(a, arith(b, exactInt(q), '×')!, '-');
    }
    return b.x === 0 ? undefined : approx(a.x - b.x * Math.floor(a.x / b.x));
  }
  if (!isInt(a) || !isInt(b) || a.q!.n < 0n || b.q!.n < 0n) return undefined;
  const [x, y] = [a.q!.n, b.q!.n];
  switch (op) {
    case 'AND':
      return exactInt(x & y);
    case 'OR':
      return exactInt(x | y);
    case 'XOR':
      return exactInt(x ^ y);
    case '<<':
      return y > 4096n ? undefined : exactInt(x << y);
    case '>>':
      return exactInt(x >> y);
  }
  return undefined;
}

function call(f: string, args: Val[]): Val | undefined {
  const nums = args.filter(isNum);
  if (nums.length !== args.length) return undefined;
  const ints = nums.every(isInt) ? nums.map((v) => v.q!.n) : undefined;
  switch (f) {
    case 'gcd':
    case 'lcm': {
      if (!ints || ints.length < 2) return undefined;
      if (f === 'gcd') return exactInt(ints.reduce((g, x) => bgcd(g, x), 0n));
      let l = 1n;
      for (const x of ints) {
        if (x === 0n) return exactInt(0n);
        l = (l / bgcd(l, x)) * babs(x);
      }
      return exactInt(l);
    }
    case 'min':
    case 'max': {
      if (nums.length < 1) return undefined;
      const cmp = (a: Num, b: Num) => compare(a, b);
      return nums.reduce((m, v) => ((f === 'min' ? cmp(v, m) < 0 : cmp(v, m) > 0) ? v : m));
    }
    case 'sort':
      return nums.length < 1 ? undefined : { list: [...nums].sort(compare) };
    case 'round':
      return nums.length === 1 ? rounded(nums[0]!, 'round') : undefined;
    case 'abs':
      return nums.length === 1
        ? nums[0]!.q
          ? exact({ n: babs(nums[0]!.q.n), d: nums[0]!.q.d })
          : approx(Math.abs(nums[0]!.x))
        : undefined;
    case 'C':
    case 'P': {
      if (!ints || ints.length !== 2) return undefined;
      const [n, r] = ints as [bigint, bigint];
      if (n < 0n || r < 0n || n > 100000n) return undefined;
      if (r > n) return exactInt(0n);
      let p = 1n;
      for (let k = n - r + 1n; k <= n; k++) p *= k;
      if (f === 'P') return exactInt(p);
      let rf = 1n;
      for (let k = 2n; k <= r; k++) rf *= k;
      return exactInt(p / rf);
    }
    case 'ln':
      if (nums.length !== 1) return undefined;
      return nums[0]!.q && nums[0]!.q.n > 0n
        ? approx(lnBig(nums[0]!.q.n) - lnBig(nums[0]!.q.d))
        : nums[0]!.x > 0
          ? approx(Math.log(nums[0]!.x))
          : undefined;
    case 'log₂':
      return nums.length === 1 ? log2Of(nums[0]!) : undefined;
    case 'log₁₀':
      return nums.length === 1 && nums[0]!.x > 0 ? approx(Math.log10(nums[0]!.x)) : undefined;
  }
  return undefined;
}

function compare(a: Num, b: Num): number {
  if (a.q && b.q) {
    const d = a.q.n * b.q.d - b.q.n * a.q.d;
    return d < 0n ? -1 : d > 0n ? 1 : 0;
  }
  return a.x < b.x ? -1 : a.x > b.x ? 1 : 0;
}

// ── Parser ──

class Parser {
  i = 0;
  constructor(private toks: Tok[]) {}
  peek(): Tok | undefined {
    return this.toks[this.i];
  }
  isOp(v: string) {
    const t = this.peek();
    return t?.t === 'op' && t.v === v;
  }
  take(v: string) {
    if (this.isOp(v)) {
      this.i++;
      return true;
    }
    return false;
  }
  done() {
    return this.i === this.toks.length;
  }
  expr(): Val | undefined {
    return this.binary(['OR'], () =>
      this.binary(['XOR'], () => this.binary(['AND'], () => this.shift())),
    );
  }
  binary(ops: string[], next: () => Val | undefined): Val | undefined {
    let a = next();
    while (a) {
      const t = this.peek();
      if (!(t?.t === 'op' && ops.includes(t.v))) break;
      this.i++;
      const b = next();
      if (!b || !isNum(a) || !isNum(b)) return undefined;
      a = intOp(a, b, t.v);
    }
    return a;
  }
  shift(): Val | undefined {
    return this.binary(['<<', '>>'], () => this.sum());
  }
  sum(): Val | undefined {
    let a = this.product();
    while (a) {
      const t = this.peek();
      if (!(t?.t === 'op' && (t.v === '+' || t.v === '-'))) break;
      this.i++;
      const b = this.product();
      if (!b || !isNum(a) || !isNum(b)) return undefined;
      a = arith(a, b, t.v);
    }
    return a;
  }
  startsPrimary() {
    const t = this.peek();
    if (!t) return false;
    if (t.t === 'num' || t.t === 'fn') return true;
    return t.t === 'op' && ['(', '⌊', '⌈', 'π', '½'].includes(t.v);
  }
  product(): Val | undefined {
    let a = this.unary();
    while (a) {
      const t = this.peek();
      let op: string;
      if (t?.t === 'op' && ['×', '÷', '/', 'mod'].includes(t.v)) {
        this.i++;
        op = t.v;
      } else if (this.startsPrimary()) {
        // Written side by side: 2π, ½ ln(…), 100 ln 100.
        op = '×';
      } else break;
      const b = this.unary();
      if (!b || !isNum(a) || !isNum(b)) return undefined;
      a = op === 'mod' ? intOp(a, b, op) : arith(a, b, op);
    }
    return a;
  }
  unary(): Val | undefined {
    if (this.take('-')) {
      const a = this.unary();
      return a && isNum(a) ? arith(exactInt(0n), a, '-') : undefined;
    }
    if (this.take('+')) return this.unary();
    return this.power();
  }
  power(): Val | undefined {
    const a = this.postfix();
    if (!a || !isNum(a)) return a;
    const t = this.peek();
    if (t?.t === 'sup') {
      this.i++;
      return power(a, exactInt(BigInt(t.v)));
    }
    if (this.take('^')) {
      const e = this.unary();
      return e && isNum(e) ? power(a, e) : undefined;
    }
    return a;
  }
  postfix(): Val | undefined {
    let a = this.primary();
    for (;;) {
      if (a && isNum(a) && this.take('!!')) a = factorial(a, 2n);
      else if (a && isNum(a) && this.take('!')) a = factorial(a, 1n);
      else break;
    }
    return a;
  }
  primary(): Val | undefined {
    const t = this.peek();
    if (!t) return undefined;
    this.i++;
    if (t.t === 'num') return t.v;
    if (t.t === 'fn') {
      if (this.isOp('(')) {
        this.i++;
        const args = this.args(')');
        return args && call(t.v, args);
      }
      // A function of one number without its bracket: log₂ 64, ln 100.
      if (!['log₂', 'log₁₀', 'ln'].includes(t.v)) return undefined;
      const a = this.power();
      return a && call(t.v, [a]);
    }
    if (t.t !== 'op') return undefined;
    switch (t.v) {
      case 'π':
        return { x: Math.PI };
      case '½':
        return exact({ n: 1n, d: 2n });
      case '(': {
        const args = this.args(')');
        if (!args) return undefined;
        return args.length === 1
          ? args[0]
          : args.every(isNum)
            ? { list: args as Num[] }
            : undefined;
      }
      case '⌊':
      case '⌈': {
        // ⌊log₂ n⌋ and ⌈log₂ n⌉ of a whole n exactly.
        const close = t.v === '⌊' ? '⌋' : '⌉';
        const at = this.i;
        const head = this.peek();
        if (head?.t === 'fn' && head.v === 'log₂') {
          this.i++;
          const inner = this.isOp('(') ? (this.i++, this.args(')')) : [this.power()];
          if (inner?.length === 1 && inner[0] && isNum(inner[0]) && this.take(close)) {
            const exactly = roundedLog2(inner[0], close === '⌉');
            if (exactly) return exactly;
          }
          this.i = at;
        }
        const a = this.expr();
        if (!a || !isNum(a) || !this.take(close)) return undefined;
        return rounded(a, close === '⌋' ? 'floor' : 'ceil');
      }
      case '|': {
        const a = this.sum();
        if (!a || !isNum(a) || !this.take('|')) return undefined;
        return call('abs', [a]);
      }
    }
    return undefined;
  }
  args(close: string): Val[] | undefined {
    const out: Val[] = [];
    for (;;) {
      const a = this.expr();
      if (!a) return undefined;
      out.push(a);
      if (this.take(',')) continue;
      return this.take(close) ? out : undefined;
    }
  }
}

/** A side's value read exactly where it can be, or undefined when it can't be read. */
export function readInteger(text: string, signed = false): Val | undefined {
  const toks = tokenize(plain(text), signed);
  if (!toks || toks.length === 0) return undefined;
  const p = new Parser(toks);
  const v = p.expr();
  return v && p.done() ? v : undefined;
}

/** The side's single number as a float (for `evaluate`), or undefined. */
export function integerValue(text: string): number | undefined {
  const v = readInteger(text);
  return v && isNum(v) ? v.x : undefined;
}

const plain = (s: string) =>
  s
    .replace(/(\d),(?=\d{3}(?!\d))/g, '$1')
    .replace(/−/g, '-')
    .trim();

// ── Lines ──

/** Whether a line has anything this reader is for. */
export const INTEGER_LINE =
  /[⌊⌈]|\bmod\b|\b(?:gcd|lcm|round|min|max|sort|C|P)\(|log₂|\d!|(?<![\p{L}\d_])\d+(?:₂|₈)|(?<![\p{L}\d_])[0-9A-F]+₁₆|\b0[xbo][0-9A-Fa-f]|\d+\.\d+\.\d+\.\d+|\b(?:AND|OR|XOR)\b|<<|>>|\bremainder\b|\d{16,}|^Invert every bit|^\d+-bit\b/u;

const RELATIONS = /\s(=|≈|<|≤|>|≥)\s/;

/** Splits at depth 0 (outside brackets and floor or ceiling bars) on `sep`. */
function splitTop(text: string, sep: RegExp): string[] {
  const out: string[] = [];
  let depth = 0;
  let start = 0;
  for (let k = 0; k < text.length; k++) {
    const c = text[k]!;
    if ('(⌊⌈['.includes(c)) depth++;
    else if (')⌋⌉]'.includes(c)) depth--;
    if (depth !== 0) continue;
    const m = sep.exec(text.slice(k));
    if (m && m.index === 0) {
      out.push(text.slice(start, k));
      start = k + m[0].length;
      k = start - 1;
    }
  }
  out.push(text.slice(start));
  return out;
}

const CLAUSE = /^(?:; |, so |, since |, and | → |, )/;

/** The largest number in a line, for the rounding allowance of its decimal sides. */
const largest = (text: string) =>
  Math.max(0, ...(plain(text).match(/\d+(?:\.\d+)?/g) ?? []).map(Number).filter(Number.isFinite));

function close(a: Num, b: Num, big: number): boolean {
  if (a.q && b.q) return compare(a, b) === 0;
  return Math.abs(a.x - b.x) <= 2e-3 * Math.max(Math.abs(a.x), Math.abs(b.x)) + 1e-3 + 1e-4 * big;
}
function same(a: Val, b: Val, big: number): boolean {
  if (isNum(a) && isNum(b)) return close(a, b, big);
  if (!isNum(a) && !isNum(b))
    return a.list.length === b.list.length && a.list.every((x, i) => close(x, b.list[i]!, big));
  return false;
}
function holdsRel(rel: string, a: Num, b: Num, big: number): boolean {
  if (rel === '=' || rel === '≈') return close(a, b, big);
  const c = compare(a, b);
  const eq = close(a, b, big);
  if (rel === '<') return c < 0 || (!a.q || !b.q ? eq : false);
  if (rel === '>') return c > 0 || (!a.q || !b.q ? eq : false);
  if (rel === '≤') return c <= 0 || eq;
  return c >= 0 || eq;
}

/** Numbers that can't be what they say: an octet past 255 (192.168.300.1), a digit 8 in base 8. */
function malformed(text: string): string[] {
  const out: string[] = [];
  const t = plain(text);
  for (const m of t.matchAll(/(?<![\p{L}\d_.])\d+(?:\.\d+){3}(?![\d.₂])/gu))
    if (m[0].split('.').some((o) => Number(o) > 255)) out.push(`"${m[0]}" has an octet past 255`);
  for (const m of t.matchAll(/(?<![\p{L}\d_.])([0-9A-F]+(?: [0-9A-F]{3,4})*)(₂|₈)/gu)) {
    const radix = RADIX[m[2]!]!;
    if (readDigits(m[1]!.replace(/ /g, ''), radix) === undefined)
      out.push(`"${m[0]}" has a digit base ${radix} doesn't have`);
  }
  for (const m of t.matchAll(/(?<![\p{L}\d_.])[01]{1,9}(?:\.[01]+){3}₂/gu))
    if (!/^[01]{8}(?:\.[01]{8}){3}₂$/.test(m[0])) out.push(`"${m[0]}" isn't four octets of 8 bits`);
  return out;
}

/**
 * A lone decimal said equal to a side worked out with no rounded number in it (ln, π, log₂ of
 * exact values: "… = 363.7385") must match it to its last decimal, not just within display
 * rounding of the line.
 */
function tight(rel: string, a: { v: Val; text: string }, b: { v: Val; text: string }): boolean {
  if (rel !== '=' || !isNum(a.v) || !isNum(b.v)) return true;
  const lone = (t: string) => /^-?\d+\.(\d+)$/.exec(plain(t));
  const [la, lb] = [lone(a.text), lone(b.text)];
  const [lit, other] = la ? [la, b] : lb ? [lb, a] : [undefined, undefined];
  if (!lit || !other || /\d\.\d/.test(other.text)) return true;
  const half = 0.5 * 10 ** -lit[1]!.length;
  return Math.abs((a.v as Num).x - (b.v as Num).x) <= half * 1.01 + 1e-9 * Math.abs((a.v as Num).x);
}

/** The value a line ends at, and the bits it was written in, for the line after it. */
export interface Last {
  v: Val;
  width?: number;
}

/**
 * Problems with one line; `prev` is where the line before ended (a line that starts "= …"
 * continues it, and "Invert every bit: …" flips it).
 */
export function checkIntegerLine(text: string, prev?: Last): { problems: string[]; last?: Last } {
  const problems: string[] = [];
  // (Grades 4–5 write "17 ÷ 5 = 3, remainder 2": the remainder belongs to the division)
  const line = text.replace(/, remainder /g, ' remainder ');
  const colon = line.lastIndexOf(': ');
  const label = colon >= 0 ? line.slice(0, colon) : '';
  let body = (colon >= 0 ? line.slice(colon + 2) : line).trim().replace(/^→\s*/, '');
  const signed = /\bsigned\b/i.test(label) && !/\bunsigned\b/i.test(label);
  const big = largest(line);
  problems.push(...malformed(body).map((m) => `${m} in "${line}"`));
  let last: Last | undefined;
  const widthOf = (text: string) => {
    const toks = tokenize(plain(text), false);
    return toks?.length === 1 && toks[0]!.t === 'num' ? toks[0]!.based?.width : undefined;
  };
  // Every bit flipped from the line before, at its written width.
  if (/^Invert every bit$/i.test(label)) {
    const v = readInteger(body);
    const w = widthOf(body);
    if (v && isNum(v) && w && prev && isNum(prev.v) && isInt(prev.v)) {
      const want = (1n << BigInt(prev.width ?? w)) - 1n - prev.v.q!.n;
      if (!isInt(v) || v.q!.n !== want)
        problems.push(`"${body}" doesn't flip every bit of the line before`);
    }
    return { problems, last: v ? { v, width: w } : undefined };
  }
  let continued = false;
  if (/^=\s/.test(body)) {
    body = body.replace(/^=\s*/, '');
    continued = !!prev;
  }
  const clauses = splitTop(body, CLAUSE);
  clauses.forEach((clause, ci) => {
    const parts = splitTop(clause, RELATIONS);
    // splitTop drops the separators: find them again in order.
    const rels: string[] = [];
    {
      let depth = 0;
      for (let k = 0; k < clause.length; k++) {
        const c = clause[k]!;
        if ('(⌊⌈['.includes(c)) depth++;
        else if (')⌋⌉]'.includes(c)) depth--;
        if (depth !== 0) continue;
        const m = RELATIONS.exec(clause.slice(k));
        if (m && m.index === 0) {
          rels.push(m[1]!);
          k += m[0].length - 1;
        }
      }
    }
    let before: { v: Val; text: string } | undefined =
      ci === 0 && continued && prev ? { v: prev.v, text: '(the line before)' } : undefined;
    let exactRun: { v: Val; text: string } | undefined;
    parts.forEach((part, k) => {
      const text = part.trim();
      const rel = k === 0 ? '=' : (rels[k - 1] ?? '=');
      // A division with its remainder: "45 ÷ 2 = 22 remainder 1".
      const rem = /^(.+?) remainder (.+)$/.exec(text);
      if (rem) {
        const div = k > 0 ? /^(.+) ÷ (.+)$/.exec(parts[k - 1]!.trim()) : null;
        const [a, b] = div ? [readInteger(div[1]!), readInteger(div[2]!)] : [];
        const [q, r] = [readInteger(rem[1]!), readInteger(rem[2]!)];
        if (a && b && q && r && [a, b, q, r].every((x) => isNum(x) && isInt(x))) {
          const [A, B, Qt, R] = [a, b, q, r].map((x) => (x as Num).q!.n) as bigint[];
          if (A !== Qt! * B! + R! || R! < 0n || R! >= babs(B!))
            problems.push(`"${parts[k - 1]!.trim()} = ${text}" isn't a true division in "${line}"`);
        }
        before = undefined;
        exactRun = undefined;
        return;
      }
      const v = readInteger(text, signed);
      if (!v) {
        before = undefined;
        exactRun = undefined;
        return;
      }
      if (before) {
        const ok =
          isNum(before.v) && isNum(v)
            ? holdsRel(rel, before.v, v, big) && tight(rel, before, { v, text })
            : rel === '=' && same(before.v, v, big);
        if (!ok) problems.push(`"${before.text}" ${rel} "${text}" doesn't hold in "${line}"`);
        // Exact sides of one run of "=" agree exactly, across a decimal between them
        // (round(1,619 ÷ 5) × 5 = round(323.8) × 5 = 1,620).
        if (ok && rel === '=' && exactRun && isNum(v) && v.q && compare(exactRun.v as Num, v) !== 0)
          problems.push(`"${exactRun.text}" = "${text}" doesn't hold in "${line}"`);
      }
      if (rel !== '=' || !before) exactRun = undefined;
      if (isNum(v) && v.q) exactRun = { v, text };
      before = { v, text };
      if (ci === clauses.length - 1 && k === parts.length - 1) last = { v, width: widthOf(text) };
    });
  });
  return { problems, last };
}

/** Problems with a step's lines, read in order (from the first with a whole-number mark). */
export function checkIntegerLines(lines: readonly string[]): string[] {
  const problems: string[] = [];
  let prev: Last | undefined;
  // Once a line has a whole-number mark, the step's lines after it are its work and are read
  // too ("8-bit sum: 100 + 50 = 150", then "150 > 127, so 150 − 2⁸ = −106").
  let reading = false;
  for (const line of lines) {
    reading ||= INTEGER_LINE.test(plain(line));
    if (!reading) continue;
    const r = checkIntegerLine(line, prev);
    problems.push(...r.problems);
    prev = r.last;
  }
  return problems;
}

// ── The scalar reader's pre-pass ──

/** Text `evaluate` hands to this reader: a based number, a quad, a bit operation, lcm, round. */
export const INTEGER_PREPASS =
  /(?<![\p{L}\d_])[01]+₂|(?<![\p{L}\d_])[0-7]+₈|(?<![\p{L}\d_])(?=[0-9A-F]*\d)[0-9A-F]+₁₆|\b0[xbo][0-9A-Fa-f]|\d+\.\d+\.\d+\.\d+|\d\s+(?:AND|OR|XOR)\s+\d|<<|>>|\blcm\(|\bround\(|\bgcd\((?:[^()]*,){2}/u;

/**
 * `evaluate`'s pre-pass: the whole text read exactly when it can be ("(45)"), else each based
 * number and dotted quad replaced by its decimal value.
 */
export function integerPrepass(text: string): string {
  const whole = readInteger(text);
  if (whole && isNum(whole)) return `(${whole.x})`;
  return text
    .replace(/(?<![\p{L}\d_.])[01]{8}(?:\.[01]{8}){3}₂/gu, (m) => String(quadValue(m, 2)))
    .replace(/(?<![\p{L}\d_.])\d{1,3}(?:\.\d{1,3}){3}(?![\d.])/gu, (m) =>
      String(quadValue(m, 10) ?? m),
    )
    .replace(
      /(?<![\p{L}\d_])(?:0([xbo])([0-9A-Fa-f]+)|((?=[0-9A-F]*\d)[0-9A-F]+)(₂|₈|₁₆))(?![\p{L}\d])/gu,
      (m, p?: string, pd?: string, sd?: string, sub?: string) => {
        const radix = p ? { x: 16, b: 2, o: 8 }[p.toLowerCase() as 'x'] : RADIX[sub!]!;
        const v = readDigits((pd ?? sd)!, radix);
        return v === undefined ? m : String(v);
      },
    );
}

/**
 * A result's value when it is written in a form (101101₂, 0x2D, 0010 1101₂, 192.168.10.64,
 * /26) at the start of `text`; undefined otherwise.
 */
export function formValueAt(text: string): number | undefined {
  const t = text.trim();
  const m =
    /^(?:[01]{8}(?:\.[01]{8}){3}₂|\d{1,3}(?:\.\d{1,3}){3}(?![\d.])|0[xbo][0-9A-Fa-f]+(?: [0-9A-Fa-f]{4})*|[0-9A-F]+(?: [0-9A-F]{3,4})*(?:₂|₈|₁₆))/.exec(
      t,
    );
  if (m) {
    const v = readInteger(m[0]);
    return v && isNum(v) ? v.x : undefined;
  }
  const prefix = /^\/(\d{1,2})(?!\d)/.exec(t);
  return prefix ? Number(prefix[1]) : undefined;
}
