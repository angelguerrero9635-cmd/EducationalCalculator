/**
 * The simplifying a teacher writes under a substituted formula, one line per stage:
 *
 *   c = √(3² + 4²)
 *   c = √(9 + 16)
 *   c = √25
 *
 * Each line works out every operation whose operands are plain numbers and whose kind comes
 * first in the order of operations (powers and roots, then × and ÷, then + and −), the way
 * the work is shown in class. Lines are text; the last one is the value itself, which the
 * answer line shows, so callers usually drop it.
 */
import { formatNumber, plainDigits } from '@/engine/format';

type Node =
  | { kind: 'num'; value: number; text?: string }
  | { kind: 'bin'; op: '+' | '−' | '×' | '÷' | '/' | '^'; left: Node; right: Node }
  | { kind: 'pow'; base: Node; exp: 2 | 3 }
  | { kind: 'sqrt'; arg: Node }
  | { kind: 'neg'; arg: Node };

type Token =
  | { t: 'num'; value: number; text?: string }
  | { t: 'op'; v: string }
  | { t: '('; v?: undefined }
  | { t: ')'; v?: undefined };

const NUMBER = /^\d+(?:\.\d+)?/;

function tokenize(text: string): Token[] | undefined {
  const s = plainDigits(text).replace(/\s+/g, ' ').trim();
  const out: Token[] = [];
  let i = 0;
  while (i < s.length) {
    const ch = s[i]!;
    if (ch === ' ') {
      i++;
      continue;
    }
    const num = NUMBER.exec(s.slice(i));
    if (num) {
      out.push({ t: 'num', value: Number(num[0]) });
      i += num[0].length;
      continue;
    }
    if (ch === 'π') out.push({ t: 'num', value: Math.PI, text: 'π' });
    else if (ch === '½') out.push({ t: 'num', value: 0.5, text: '½' });
    else if (ch === '(') out.push({ t: '(' });
    else if (ch === ')') out.push({ t: ')' });
    else if ('+−×÷/^²³√-'.includes(ch)) out.push({ t: 'op', v: ch === '-' ? '−' : ch });
    else return undefined;
    i++;
  }
  return out;
}

/** Recursive-descent parser over the tokens; undefined when the text isn't plain arithmetic. */
function parse(tokens: Token[]): Node | undefined {
  let at = 0;
  const peek = () => tokens[at];
  const take = () => tokens[at++];
  const fail = { failed: false };

  const primary = (): Node => {
    const tok = take();
    if (!tok) {
      fail.failed = true;
      return { kind: 'num', value: NaN };
    }
    if (tok.t === 'num')
      return { kind: 'num', value: tok.value, ...(tok.text ? { text: tok.text } : {}) };
    if (tok.t === '(') {
      const inner = sum();
      if (peek()?.t !== ')') fail.failed = true;
      else take();
      return inner;
    }
    if (tok.t === 'op' && tok.v === '−') return { kind: 'neg', arg: unary() };
    if (tok.t === 'op' && tok.v === '√') return { kind: 'sqrt', arg: unary() };
    fail.failed = true;
    return { kind: 'num', value: NaN };
  };
  /** A primary with its squares and cubes: 3², (a + b)³. */
  const postfix = (): Node => {
    let node = primary();
    for (;;) {
      const p = peek();
      if (p?.t === 'op' && (p.v === '²' || p.v === '³')) {
        take();
        node = { kind: 'pow', base: node, exp: p.v === '²' ? 2 : 3 };
      } else return node;
    }
  };
  const unary = (): Node => postfix();
  const power = (): Node => {
    const base = unary();
    const p = peek();
    if (p?.t === 'op' && p.v === '^') {
      take();
      return { kind: 'bin', op: '^', left: base, right: power() };
    }
    return base;
  };
  const product = (): Node => {
    let node = power();
    for (;;) {
      const p = peek();
      if (p?.t === 'op' && (p.v === '×' || p.v === '÷' || p.v === '/')) {
        take();
        node = { kind: 'bin', op: p.v, left: node, right: power() };
      } else return node;
    }
  };
  const sum = (): Node => {
    let node = product();
    for (;;) {
      const p = peek();
      if (p?.t === 'op' && (p.v === '+' || p.v === '−')) {
        take();
        node = { kind: 'bin', op: p.v, left: node, right: product() };
      } else return node;
    }
  };
  const root = sum();
  if (fail.failed || at !== tokens.length) return undefined;
  return root;
}

/** Order of operations, higher first: powers and roots, then × ÷, then + −. */
const rank = (n: Node): number => {
  if (n.kind === 'pow' || n.kind === 'sqrt' || (n.kind === 'bin' && n.op === '^')) return 3;
  if (n.kind === 'bin' && (n.op === '×' || n.op === '÷' || n.op === '/')) return 2;
  if (n.kind === 'bin') return 1;
  return n.kind === 'neg' ? 4 : 0;
};

const isNum = (n: Node): n is Extract<Node, { kind: 'num' }> => n.kind === 'num';

/** Whether every operand of this operation is already a plain number. */
const ready = (n: Node): boolean => {
  switch (n.kind) {
    case 'num':
      return false;
    case 'bin':
      return isNum(n.left) && isNum(n.right);
    case 'pow':
      return isNum(n.base);
    case 'sqrt':
    case 'neg':
      return isNum(n.arg);
  }
};

const compute = (n: Node): number => {
  switch (n.kind) {
    case 'num':
      return n.value;
    case 'bin': {
      const [a, b] = [compute(n.left), compute(n.right)];
      return n.op === '+'
        ? a + b
        : n.op === '−'
          ? a - b
          : n.op === '^'
            ? a ** b
            : n.op === '×'
              ? a * b
              : a / b;
    }
    case 'pow':
      return compute(n.base) ** n.exp;
    case 'sqrt':
      return Math.sqrt(compute(n.arg));
    case 'neg':
      return -compute(n.arg);
  }
};

/**
 * Whether a child is worked inside brackets (or under a root, or up in an exponent): what is
 * in brackets comes first, whatever its operation.
 */
const grouped = (parent: Node, child: Node, rightSide: boolean): boolean => {
  if (parent.kind === 'sqrt') return true;
  if (parent.kind === 'pow') return child.kind !== 'num';
  if (parent.kind === 'bin' && parent.op === '^') return true;
  if (parent.kind === 'bin' && child.kind === 'bin') {
    return rank(child) < rank(parent) || (rank(child) === rank(parent) && rightSide);
  }
  return false;
};

type Stage = { depth: number; rank: number };
const later = (a: Stage, b: Stage) => a.depth > b.depth || (a.depth === b.depth && a.rank > b.rank);

/** The stage to work out next: the deepest brackets first, then the strongest operation. */
const nextStage = (n: Node, depth = 0): Stage | undefined => {
  if (n.kind === 'num') return undefined;
  let best: Stage | undefined = ready(n) ? { depth, rank: rank(n) } : undefined;
  const children: [Node, boolean][] =
    n.kind === 'bin'
      ? [
          [n.left, false],
          [n.right, true],
        ]
      : n.kind === 'pow'
        ? [[n.base, false]]
        : [[n.arg, false]];
  for (const [child, rightSide] of children) {
    const stage = nextStage(child, depth + (grouped(n, child, rightSide) ? 1 : 0));
    if (stage && (!best || later(stage, best))) best = stage;
  }
  return best;
};

/** Works out every ready operation at the stage (a number in a "−" is kept as a negative). */
const reduce = (n: Node, stage: Stage, depth = 0): Node => {
  if (n.kind === 'num') return n;
  if (ready(n) && depth === stage.depth && rank(n) === stage.rank) {
    return { kind: 'num', value: compute(n) };
  }
  const at = (child: Node, rightSide: boolean) =>
    reduce(child, stage, depth + (grouped(n, child, rightSide) ? 1 : 0));
  switch (n.kind) {
    case 'bin':
      return { ...n, left: at(n.left, false), right: at(n.right, true) };
    case 'pow':
      return { ...n, base: at(n.base, false) };
    case 'sqrt':
    case 'neg':
      return { ...n, arg: at(n.arg, false) };
  }
};

const fmt = (x: number) => formatNumber(x).replace('-', '−');

/** Prints a node with only the brackets the order of operations needs. */
function print(n: Node, parentRank = 0, rightSide = false): string {
  switch (n.kind) {
    case 'num': {
      if (n.text) return n.text;
      const s = fmt(n.value);
      // A negative number inside an expression is bracketed: 5 − (−3), not 5 − −3.
      return n.value < 0 && parentRank > 0 ? `(${s})` : s;
    }
    case 'neg':
      return `−${print(n.arg, 4)}`;
    case 'sqrt': {
      // √25 and √(9 + 16): brackets only around an expression.
      const inner = print(n.arg, 0);
      return isNum(n.arg) && n.arg.value >= 0 ? `√${inner}` : `√(${inner})`;
    }
    case 'pow': {
      const base = print(n.base, 4);
      const needs = !isNum(n.base) || n.base.value < 0;
      return `${needs && !base.startsWith('(') ? `(${base})` : base}${n.exp === 2 ? '²' : '³'}`;
    }
    case 'bin': {
      const r = rank(n);
      const left = print(n.left, r, false);
      const right = print(n.right, r, true);
      const text =
        n.op === '/'
          ? `${left}/${right}`
          : n.op === '^'
            ? `${left}^${right}`
            : `${left} ${n.op} ${right}`;
      // Brackets when this sits under a stronger operation, or to the right of − or ÷ at the
      // same level (8 − (5 − 3)), or as the base of a power.
      const needs = parentRank > r || (parentRank === r && rightSide) || parentRank === 4;
      return needs ? `(${text})` : text;
    }
  }
}

/** How many operations the expression has, or undefined when it isn't plain arithmetic. */
export function operationCount(text: string): number | undefined {
  const tokens = tokenize(text);
  const tree = tokens && parse(tokens);
  if (!tree) return undefined;
  const count = (n: Node): number => {
    switch (n.kind) {
      case 'num':
        return 0;
      case 'bin':
        return 1 + count(n.left) + count(n.right);
      case 'pow':
        return 1 + count(n.base);
      case 'sqrt':
        return 1 + count(n.arg);
      case 'neg':
        return count(n.arg);
    }
  };
  return count(tree);
}

/**
 * The lines after a substituted expression, one per stage of working out, ending with the
 * value. Empty when the text isn't plain arithmetic, has fewer than two operations, or a stage
 * doesn't come out to a number (a root of a negative, a division by zero).
 */
export function simplifyChain(text: string): string[] {
  const tokens = tokenize(text);
  let tree = tokens && parse(tokens);
  if (!tree || (operationCount(text) ?? 0) < 2) return [];
  const lines: string[] = [];
  for (let guard = 0; guard < 40 && tree.kind !== 'num'; guard++) {
    const stage = nextStage(tree);
    if (!stage) break;
    tree = reduce(tree, stage);
    // "5 − (−3)" and "−(−3)" are one stage each; the reader sees the sign settle on the next line.
    const line = print(tree);
    if (!Number.isFinite(compute(tree)) || /NaN|Infinity/.test(line)) return [];
    if (lines[lines.length - 1] !== line && line !== text.trim()) lines.push(line);
  }
  return lines;
}
