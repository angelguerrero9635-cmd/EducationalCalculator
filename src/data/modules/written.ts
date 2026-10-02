/**
 * Written work: the arithmetic a student sets out on paper, as a grid of digit cells the page
 * draws in columns and the review dump prints as text. Column addition and subtraction with
 * regrouping marks (Grades 2–5), partial products (Grades 4–5) and the long-division bracket
 * (Grade 4 on). `autoWritten` picks the layout for a plain arithmetic line by grade; a module
 * can set `written` on a step to choose (or with `false`, refuse) one.
 */
import {
  angleText,
  bracketed,
  complex,
  complexText,
  fromPolar,
  polarText,
  type Complex,
  type ComplexStyle,
} from '@/engine/complex';
import { decimalDigits, formatNumber, repeatingDecimal } from '@/engine/format';
import {
  det,
  det2Arithmetic,
  detLines,
  detText,
  exactShow,
  factor,
  withColumn,
  type Matrix,
  type Show,
  type Vector,
} from '@/engine/linalg';
import type { Relation, Values, VariableDef } from '@/engine/types';

import type { StepText } from './types';

/** Numbers in the line above the grid read as elsewhere: "1,000 − 178" (the grid's digits stay plain). */
const fn = (x: number) => formatNumber(x);

export interface WrittenCell {
  text: string;
  /** A regrouping mark written small above a column ("1" carried, "13" after a borrow). */
  small?: boolean;
  /** A digit crossed out when it was regrouped. */
  strike?: boolean;
  /** The line drawn under this cell (under the last addend, under a product taken away). */
  underline?: boolean;
  /** Side notes in grey ("40 × 6" next to a partial product). */
  muted?: boolean;
  /** A note cell that takes its own width (the partial-product labels). */
  wide?: boolean;
  /** A line down the cell's right side (synthetic division: after the divisor). */
  bar?: boolean;
  /** A box around the cell (synthetic division's remainder). */
  boxed?: boolean;
}

export interface Written {
  kind: 'grid';
  /** Rows of cells, each row right-aligned to `width` columns (missing cells are blank). */
  rows: WrittenCell[][];
  width: number;
  /** The equation the work shows, in one line ("38 + 25 = 63"), for the harness and the dump. */
  says: string;
  /** Column width in px when cells hold signed numbers, not digits (synthetic division). */
  cellWidth?: number;
}

const digitsOf = (n: number) => String(n).split('').map(Number);
const cell = (text: string, more: Partial<WrittenCell> = {}): WrittenCell => ({ text, ...more });
const blank = cell('');
/** Right-aligns `cells` to `width` columns. */
const right = (cells: WrittenCell[], width: number) =>
  [...Array<WrittenCell>(Math.max(0, width - cells.length)).fill(blank), ...cells] as WrittenCell[];

/** Column addition of whole numbers, carries written small above the columns. */
export function columnAdd(nums: number[]): Written | undefined {
  if (nums.length < 2 || nums.some((n) => !Number.isInteger(n) || n < 0)) return undefined;
  const sum = nums.reduce((a, b) => a + b, 0);
  const cols = Math.max(String(sum).length, ...nums.map((n) => String(n).length));
  // Carries into each column, from the ones up.
  const carries: number[] = Array<number>(cols + 1).fill(0);
  for (let i = 0; i < cols; i++) {
    const total = nums.reduce((a, n) => a + (Math.floor(n / 10 ** i) % 10), 0) + (carries[i] ?? 0);
    carries[i + 1] = Math.floor(total / 10);
  }
  // Columns are indexed from the left in the grid: column 0 is the sign column.
  const width = cols + 1;
  const col = (place: number) => width - 1 - place;
  const rows: WrittenCell[][] = [];
  if (carries.some((c, i) => c > 0 && i < cols)) {
    const row = Array<WrittenCell>(width).fill(blank);
    carries.forEach((c, place) => {
      if (c > 0 && place < cols) row[col(place)] = cell(String(c), { small: true, muted: true });
    });
    rows.push(row);
  }
  nums.forEach((n, i) => {
    const row = right(
      digitsOf(n).map((d) => cell(String(d))),
      width,
    );
    if (i > 0) row[0] = cell('+');
    if (i === nums.length - 1) row.forEach((c, k) => (row[k] = { ...c, underline: true }));
    rows.push(row);
  });
  rows.push(
    right(
      digitsOf(sum).map((d) => cell(String(d))),
      width,
    ),
  );
  return { kind: 'grid', rows, width, says: `${nums.map(fn).join(' + ')} = ${fn(sum)}` };
}

/** Column subtraction c − b, regrouped digits crossed out with the new values written above. */
export function columnSubtract(c: number, b: number): Written | undefined {
  if (!Number.isInteger(c) || !Number.isInteger(b) || b < 0 || c < b) return undefined;
  const top = digitsOf(c).reverse(); // ones first
  const bottom = digitsOf(b).reverse();
  const cur = [...top];
  const changed = new Set<number>();
  for (let i = 0; i < bottom.length; i++) {
    if (cur[i]! >= (bottom[i] ?? 0)) continue;
    // Borrow from the next column that has something, turning zeros on the way into 9s.
    let j = i + 1;
    while (cur[j] === 0) j++;
    cur[j]! -= 1;
    changed.add(j);
    for (let k = j - 1; k > i; k--) {
      cur[k] = 9;
      changed.add(k);
    }
    cur[i]! += 10;
    changed.add(i);
  }
  const width = top.length + 1;
  const col = (place: number) => width - 1 - place;
  const rows: WrittenCell[][] = [];
  if (changed.size) {
    const row = Array<WrittenCell>(width).fill(blank);
    for (const place of changed) row[col(place)] = cell(String(cur[place]), { small: true });
    rows.push(row);
  }
  rows.push(
    right(
      top.map((d, place) => cell(String(d), changed.has(place) ? { strike: true } : {})).reverse(),
      width,
    ),
  );
  const sub = right(
    digitsOf(b).map((d) => cell(String(d))),
    width,
  );
  sub[0] = cell('−');
  rows.push(sub.map((x) => ({ ...x, underline: true })));
  rows.push(
    right(
      digitsOf(c - b).map((d) => cell(String(d))),
      width,
    ),
  );
  return { kind: 'grid', rows, width, says: `${fn(c)} − ${fn(b)} = ${fn(c - b)}` };
}

/**
 * a × b by partial products, the first factor on top: each digit of the second factor times
 * each digit of the first, ones first, with the fact noted beside each row ("3 × 6").
 */
export function columnMultiply(
  a: number,
  b: number,
  /** Grade 5: one row per digit of the second factor (234 × 6, then 234 × 50), the standard algorithm. */
  byDigit = false,
): Written | undefined {
  if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0) return undefined;
  const parts: { value: number; note: string }[] = [];
  digitsOf(b)
    .reverse()
    .forEach((db, j) => {
      const y = db * 10 ** j;
      if (byDigit && b >= 10) {
        if (y > 0) parts.push({ value: a * y, note: `${a} × ${y}` });
        return;
      }
      digitsOf(a)
        .reverse()
        .forEach((da, i) => {
          const x = da * 10 ** i;
          if (x * y > 0) parts.push({ value: x * y, note: `${x} × ${y}` });
        });
    });
  if (parts.length < 2) return undefined;
  const product = a * b;
  const cols = String(product).length;
  const width = cols + 1;
  const digits = (n: number) =>
    right(
      digitsOf(n).map((d) => cell(String(d))),
      width,
    );
  const times = digits(b);
  times[0] = cell('×');
  const rows: WrittenCell[][] = [
    digits(a),
    times.map((x) => ({ ...x, underline: true })),
    ...parts.map((p, k) => [
      ...digits(p.value).map((x) => (k === parts.length - 1 ? { ...x, underline: true } : x)),
      cell(p.note, { small: true, muted: true, wide: true }),
    ]),
    digits(product),
  ];
  return { kind: 'grid', rows, width, says: `${fn(a)} × ${fn(b)} = ${fn(product)}` };
}

/**
 * n ÷ d in the long-division bracket: the quotient over the dividend, then for each place
 * the product taken away and the next digit brought down. The last row is the remainder.
 */
export function longDivision(n: number, d: number): Written | undefined {
  if (!Number.isInteger(n) || !Number.isInteger(d) || n < 0 || d <= 0 || n < d) return undefined;
  const digits = digitsOf(n);
  const width = digits.length + 2; // divisor, bracket, then the dividend's digits
  const quotientRow = Array<WrittenCell>(width).fill(blank);
  for (let i = 2; i < width; i++) quotientRow[i] = cell('', { underline: true });
  const rows: WrittenCell[][] = [
    quotientRow,
    [cell(String(d)), cell(')'), ...digits.map((x) => cell(String(x)))],
  ];
  let cur = 0;
  let started = false;
  let bottom: WrittenCell[] | undefined;
  digits.forEach((digit, i) => {
    const at = i + 2;
    cur = cur * 10 + digit;
    if (started && bottom) {
      // Bring the next digit down onto the row that holds the last difference.
      bottom[at] = cell(String(digit));
    }
    const qd = Math.floor(cur / d);
    if (qd === 0 && !started) return;
    started = true;
    quotientRow[at] = cell(String(qd), { underline: true });
    if (qd === 0) return;
    const product = qd * d;
    const productDigits = digitsOf(product);
    const take = Array<WrittenCell>(width).fill(blank);
    productDigits.forEach((x, k) => {
      take[at - productDigits.length + 1 + k] = cell(String(x));
    });
    take[at - productDigits.length] = cell('−');
    for (let k = at - productDigits.length; k <= at; k++)
      take[k] = { ...take[k]!, underline: true };
    rows.push(take);
    cur -= product;
    bottom = Array<WrittenCell>(width).fill(blank);
    const diff = digitsOf(cur);
    // A difference of 0 is written only when it is the remainder (the last row).
    if (cur > 0 || i === digits.length - 1) {
      diff.forEach((x, k) => {
        bottom![at - diff.length + 1 + k] = cell(String(x));
      });
    }
    rows.push(bottom);
  });
  const q = Math.floor(n / d);
  const r = n % d;
  return {
    kind: 'grid',
    rows,
    width,
    says: `${fn(n)} ÷ ${fn(d)} = ${fn(q)}${r ? ` remainder ${fn(r)}` : ''}`,
  };
}

/**
 * The standard algorithm for a × b (Grade 5, 5.NBT.5): one row per digit of the second
 * factor, the carries for each row written small above the first factor (the last row's
 * carries on top), a 0 placeholder at the end of the tens row, and the rows added.
 */
export function standardMultiply(a: number, b: number): Written | undefined {
  if (!Number.isInteger(a) || !Number.isInteger(b) || a < 10 || b < 2) return undefined;
  const bDigits = digitsOf(b).reverse(); // ones first
  if (bDigits.length > 2) return undefined;
  // A 0 in the ones (× 40): one row, the 0 written first, then × 4.
  const used = bDigits.map((db, j) => ({ db, j })).filter((x) => x.db > 0);
  const product = a * b;
  const rowsOf = used.map(({ db, j }) => a * db * 10 ** j);
  const cols = Math.max(String(product).length, String(a).length, String(b).length);
  const width = cols + 1;
  const col = (place: number) => width - 1 - place;
  const aDigits = digitsOf(a).reverse();
  const digits = (n: number) =>
    right(
      digitsOf(n).map((d) => cell(String(d))),
      width,
    );
  // Carries for each digit of the second factor: into each place of the first factor.
  const carryRows = used.map(({ db }) => {
    const row = Array<WrittenCell>(width).fill(blank);
    let carry = 0;
    let any = false;
    aDigits.forEach((da, i) => {
      const t = da * db + carry;
      carry = Math.floor(t / 10);
      if (carry > 0 && i < aDigits.length - 1) {
        row[col(i + 1)] = cell(String(carry), { small: true, muted: true });
        any = true;
      }
    });
    return any ? row : undefined;
  });
  const times = digits(b);
  times[0] = cell('×');
  // The tens row ends in its 0 placeholder, written like any digit.
  const lines: WrittenCell[][] = rowsOf.map((value) => digits(value));
  const rows: WrittenCell[][] = [
    ...[...carryRows].reverse().filter((r): r is WrittenCell[] => r !== undefined),
    digits(a),
    times.map((x) => ({ ...x, underline: true })),
  ];
  if (lines.length === 1) {
    rows.push(lines[0]!);
  } else {
    lines.forEach((line, j) => {
      const row = j === lines.length - 1 ? line.map((x) => ({ ...x, underline: true })) : line;
      if (j === lines.length - 1) row[0] = { ...cell('+'), underline: true };
      rows.push(row);
    });
    rows.push(digits(product));
  }
  return { kind: 'grid', rows, width, says: `${fn(a)} × ${fn(b)} = ${fn(product)}` };
}

/**
 * Decimals by the standard algorithm (6.NS.3): multiply as whole numbers (235 × 14 = 3,290),
 * then place the point by counting the decimal places in both factors (2 + 1 = 3: 3.290). The
 * factors are written right-aligned with their points, as on paper.
 */
export function decimalMultiply(a: number, b: number): Written | undefined {
  const places = (x: number) => (String(Number(x.toFixed(9))).split('.')[1] ?? '').length;
  const [pa, pb] = [places(a), places(b)];
  if (pa + pb === 0) return undefined;
  const [A, B] = [Math.round(a * 10 ** pa), Math.round(b * 10 ** pb)];
  // The factor with more digits goes on top; the other has at most two digits.
  const swap = String(B).length > String(A).length;
  const [top, bottom, pTop, pBottom] = swap ? [B, A, pb, pa] : [A, B, pa, pb];
  const grid = standardMultiply(top, bottom);
  const product = A * B;
  if (!grid || String(product).length <= pa + pb || String(top).length <= pTop) return undefined;
  if (pBottom > 0 && String(bottom).length <= pBottom) return undefined;
  const isDigit = (x: WrittenCell) => /^\d$/.test(x.text) && !x.small;
  /** Writes the point after the digit `k` places from the right ("2." "3" "5"). */
  const point = (row: WrittenCell[], k: number) => {
    if (k === 0) return row;
    const at = row.map((x, i) => (isDigit(x) ? i : -1)).filter((i) => i >= 0);
    const i = at[at.length - 1 - k];
    return i === undefined ? row : row.map((x, j) => (j === i ? { ...x, text: `${x.text}.` } : x));
  };
  const rows = grid.rows.map((r) => r.slice());
  const first = rows.findIndex((r) => r.some(isDigit) && !r.some((x) => x.small));
  rows[first] = point(rows[first]!, pTop);
  rows[first + 1] = point(rows[first + 1]!, pBottom);
  // The last row is the product: its point goes pa + pb places from the right.
  rows[rows.length - 1] = point(rows[rows.length - 1]!, pa + pb);
  const fmt = (x: number) => String(Number(x.toFixed(9)));
  return {
    kind: 'grid',
    rows,
    width: grid.width,
    says: `${fmt(a)} × ${fmt(b)} = ${fmt(Number((product / 10 ** (pa + pb)).toFixed(9)))}`,
  };
}

/**
 * n ÷ d by partial quotients (Grade 4, 4.NBT.6): take away a place's worth of groups at a
 * time (600 is 100 sixes), each partial quotient written beside, and add them at the end.
 */
export function partialQuotients(n: number, d: number): Written | undefined {
  if (!Number.isInteger(n) || !Number.isInteger(d) || n < 10 || d < 2 || n < d) return undefined;
  const q = Math.floor(n / d);
  const parts = digitsOf(q)
    .reverse()
    .map((x, i) => x * 10 ** i)
    .filter((x) => x > 0)
    .reverse();
  if (parts.length < 2) return undefined;
  const width = String(n).length + 2;
  const num = (x: number, more: Partial<WrittenCell> = {}) =>
    right(
      digitsOf(x).map((c) => cell(String(c), more)),
      width,
    );
  const note = (text: string) => cell(text, { small: true, muted: true, wide: true });
  const rows: WrittenCell[][] = [
    [cell(String(d)), cell(')'), ...digitsOf(n).map((x) => cell(String(x)))],
  ];
  let left = n;
  for (const part of parts) {
    const take = num(part * d).map((x, k) => (k >= 1 ? { ...x, underline: true } : x));
    take[1] = cell('−', { underline: true });
    rows.push([...take, note(`${part} × ${d}`)]);
    left -= part * d;
    rows.push(num(left));
  }
  const last = rows[rows.length - 1]!;
  rows[rows.length - 1] = [...last, note(`${parts.join(' + ')} = ${q}`)];
  return {
    kind: 'grid',
    rows,
    width,
    says: `${fn(n)} ÷ ${fn(d)} = ${fn(q)}${n % d ? ` remainder ${fn(n % d)}` : ''}`,
  };
}

/**
 * n ÷ d in the long-division bracket with a decimal dividend or quotient (Grade 6, 6.NS.2–3):
 * the point written in the dividend and carried straight up into the quotient, and zeros
 * written after the point until the division ends. Undefined when it would not end within
 * `maxPlaces` decimal places, or the divisor is not a whole number from 2 to 99.
 */
export function decimalLongDivision(
  n: number,
  d: number,
  maxPlaces = 3,
  repeat = false,
): Written | undefined {
  if (!Number.isInteger(d) || d < 2 || d > 99 || n <= 0) return undefined;
  const [intText, fracText = ''] = String(n).split('.');
  if (fracText.length > maxPlaces) return undefined;
  const digits = `${intText}${fracText}`.split('').map(Number);
  let fraction = fracText.length;
  // A whole number over d that repeats (Grade 7): divide until a remainder comes back, one
  // pass of the repeating block, and say which digits repeat.
  // (Blocks of up to 6 digits, as `repeatingDecimal` writes them.)
  const cycle = repeat && fracText === '' ? decimalDigits(n / d, 6) : undefined;
  if (cycle && cycle.repeat !== '') {
    const places = cycle.fixed.length + cycle.repeat.length;
    if (places > maxPlaces) return undefined;
    for (let k = 0; k < places; k++) digits.push(0);
    fraction = places;
  }
  // Zeros after the point until the division ends (or the places run out).
  let rem = 0;
  for (const x of digits) rem = (rem * 10 + x) % d;
  while (rem !== 0 && fraction < maxPlaces && !(cycle && cycle.repeat !== '')) {
    digits.push(0);
    fraction++;
    rem = (rem * 10) % d;
  }
  if (rem !== 0 && !(cycle && cycle.repeat !== '')) return undefined;
  const ints = intText!.length;
  const point = fraction > 0;
  // Columns: divisor, bracket, then the dividend's digits with the point in its own column.
  const col = (i: number) => 2 + i + (point && i >= ints ? 1 : 0);
  const width = 2 + digits.length + (point ? 1 : 0);
  const quotientRow = Array<WrittenCell>(width).fill(blank);
  for (let i = 2; i < width; i++) quotientRow[i] = cell('', { underline: true });
  const dividendRow: WrittenCell[] = [cell(String(d)), cell(')')];
  digits.forEach((x, i) => {
    if (point && i === ints) dividendRow.push(cell('.'));
    dividendRow.push(cell(String(x)));
  });
  if (point) quotientRow[2 + ints] = cell('.', { underline: true });
  const rows: WrittenCell[][] = [quotientRow, dividendRow];
  let cur = 0;
  let started = false;
  let bottom: WrittenCell[] | undefined;
  digits.forEach((digit, i) => {
    cur = cur * 10 + digit;
    if (started && bottom) bottom[col(i)] = cell(String(digit));
    const qd = Math.floor(cur / d);
    // Before the first digit that fits, nothing is written, except a 0 before the point.
    if (qd === 0 && !started) {
      if (point && i === ints - 1) quotientRow[col(i)] = cell('0', { underline: true });
      return;
    }
    started = true;
    quotientRow[col(i)] = cell(String(qd), { underline: true });
    if (qd === 0) return;
    const product = digitsOf(qd * d);
    const take = Array<WrittenCell>(width).fill(blank);
    product.forEach((x, k) => {
      take[col(i - product.length + 1 + k)] = cell(String(x), { underline: true });
    });
    const sign = Math.max(1, col(i - product.length + 1) - 1);
    // The rule runs unbroken under the product, across the point's column too.
    for (let k = sign + 1; k <= col(i); k++) {
      if (take[k] === blank) take[k] = cell('', { underline: true });
    }
    take[sign] = cell('−', { underline: true });
    rows.push(take);
    cur -= qd * d;
    bottom = Array<WrittenCell>(width).fill(blank);
    const diff = digitsOf(cur);
    if (cur > 0 || i === digits.length - 1) {
      diff.forEach((x, k) => {
        bottom![col(i - diff.length + 1 + k)] = cell(String(x));
      });
    }
    rows.push(bottom);
  });
  if (cycle && cycle.repeat !== '') {
    // The remainder is back where the block began: the digits from there repeat forever.
    rows[rows.length - 1]!.push(
      ...Array<WrittenCell>(Math.max(0, width - rows[rows.length - 1]!.length)).fill(blank),
      cell(`Remainder ${fn(rem)} again, so ${cycle.repeat} repeats`, { muted: true, wide: true }),
    );
    return { kind: 'grid', rows, width, says: `${fn(n)} ÷ ${fn(d)} = ${repeatingDecimal(n / d)}` };
  }
  const q = Number((n / d).toFixed(fraction));
  return { kind: 'grid', rows, width, says: `${fn(n)} ÷ ${fn(d)} = ${fn(q)}` };
}

/**
 * Column addition or subtraction of decimals: the numbers scaled to whole hundredths (or
 * tenths), worked in columns, and the point put back in every row (Grade 5, 5.NBT.7).
 */
export function decimalColumns(op: '+' | '−', nums: number[]): Written | undefined {
  const decimals = Math.max(...nums.map((x) => (String(x).split('.')[1] ?? '').length));
  if (decimals === 0 || decimals > 3 || nums.some((x) => x < 0)) return undefined;
  const scale = 10 ** decimals;
  const whole = nums.map((x) => Math.round(x * scale));
  const grid = op === '+' ? columnAdd(whole) : columnSubtract(whole[0]!, whole[1]!);
  if (!grid) return undefined;
  // Room for a 0 before the point (0.40), then the point column before the last `decimals`.
  const cols = Math.max(grid.width - 1, decimals + 1);
  const pad = cols - (grid.width - 1);
  const width = cols + 2;
  const rows = grid.rows.map((row) => {
    const cells = [row[0]!, ...Array<WrittenCell>(pad).fill(blank), ...row.slice(1, grid.width)];
    const at = cells.length - decimals;
    // Every digit row gets its point (and a 0 before it for 0.40); carry rows stay blank.
    const digitRow = cells.some((c) => /\d/.test(c.text) && !c.small);
    const under = cells[at]?.underline;
    const out = [
      ...cells.slice(0, at),
      cell(digitRow ? '.' : '', { underline: under }),
      ...cells.slice(at),
    ];
    if (digitRow) {
      // A 0 before the point (0.40) and in every empty place after it (0.05, 3.70).
      if (out[at - 1]!.text === '') out[at - 1] = cell('0', { underline: under });
      for (let k = at + 1; k < out.length; k++) {
        if (out[k]!.text === '') out[k] = cell('0', { underline: under });
      }
    }
    return out;
  });
  const text = (x: number) => (x / scale).toFixed(decimals);
  const result = op === '+' ? whole.reduce((x, y) => x + y, 0) : whole[0]! - whole[1]!;
  return {
    kind: 'grid',
    rows,
    width,
    says: `${nums.map((x) => x.toFixed(decimals)).join(` ${op} `)} = ${text(result)}`,
  };
}

/**
 * Synthetic division of a polynomial by x − k (Grade 11 on), set out as it is written: k and a
 * bar, the coefficients (a 0 for each missing power), the products k × each number below them,
 * a line, then the sums: the quotient's coefficients and the remainder in a box. `says` is the
 * same work nested, ((2 × 3 − 3) × 3 + 0) × 3 + 5 = 32, which is P(k).
 */
export function syntheticDivision(coefficients: number[], k: number): Written | undefined {
  if (coefficients.length < 2 || ![...coefficients, k].every(Number.isFinite)) return undefined;
  const sums: number[] = [];
  coefficients.forEach((a, i) => sums.push(i === 0 ? a : a + k * sums[i - 1]!));
  const width = coefficients.length + 1;
  const rows: WrittenCell[][] = [
    [cell(fn(k), { bar: true }), ...coefficients.map((a) => cell(fn(a)))],
    [
      cell('', { bar: true }),
      cell('', { underline: true }),
      ...sums.slice(0, -1).map((b) => cell(fn(k * b), { underline: true })),
    ],
    [
      blank,
      ...sums.slice(0, -1).map((b) => cell(fn(b))),
      cell(fn(sums[sums.length - 1]!), { boxed: true }),
    ],
  ];
  const kText = k < 0 ? `(${fn(k)})` : fn(k);
  const signed = (a: number) => (a < 0 ? ` − ${fn(-a)}` : ` + ${fn(a)}`);
  // Nested as it is worked: 2 × 3 − 3, then (2 × 3 − 3) × 3 + 0, …
  let nested = fn(coefficients[0]!);
  coefficients.slice(1).forEach((a, i) => {
    nested = `${i === 0 ? nested : `(${nested})`} × ${kText}${signed(a)}`;
  });
  return {
    kind: 'grid',
    rows,
    width,
    says: `${nested} = ${fn(sums[sums.length - 1]!)}`,
    cellWidth: 40,
  };
}

/** The grid as text lines for the review dump, columns right-aligned. */
export function writtenText(w: Written): string[] {
  // A remainder's box is "[32]" and a divisor's bar "3 |" in text.
  const shown = (c: WrittenCell) => (c.boxed ? `[${c.text}]` : c.bar ? `${c.text} |` : c.text);
  const widths = Array<number>(w.width).fill(1);
  for (const row of w.rows) {
    row.slice(0, w.width).forEach((c, i) => (widths[i] = Math.max(widths[i]!, shown(c).length)));
  }
  return w.rows.map((row) => {
    const cells = Array.from({ length: w.width }, (_, i) => row[i] ?? blank);
    // A crossed-out digit gets a combining stroke (zero width, so the columns stay aligned).
    const main = cells
      .map((c, i) => (c.strike ? `${c.text}\u0336` : shown(c)).padStart(widths[i]!))
      .join(' ')
      .trimEnd();
    const notes = row
      .slice(w.width)
      .map((c) => c.text)
      .join(' ');
    const line = notes ? `${main}   ${notes}` : main;
    if (!row.some((c) => c.underline)) return line;
    // The rule runs under the underlined cells only (the bracket's top, a product taken away).
    const rule = cells
      .map((c, i) => (c.underline ? '─' : ' ').repeat(widths[i]!))
      .join(' ')
      .replace(/─(?: ─)+/g, (m) => '─'.repeat(m.length))
      .trimEnd();
    return `${line}\n${rule}`;
  });
}

/**
 * The written work for a plain arithmetic line ("38 + 25", "743 ÷ 6") at a grade, or
 * undefined when a student at that grade does it in their head or in one line: column
 * addition and subtraction from Grade 2 when something regroups or the numbers pass 100,
 * partial products and the long-division bracket from Grade 4. Grade 6 on and college get
 * no grids (the arithmetic is below the lesson).
 */
export function autoWritten(grade: string | undefined, expr: string): Written | undefined {
  const g = grade === undefined ? Infinity : grade === 'K' ? 0 : Number(grade);
  if (g < 2 || g > 6) return undefined;
  const text = expr.replace(/,(?=\d{3}(?!\d))/g, '');
  const nums = (s: string) => s.split(/ [+−×÷] /).map(Number);
  /** Digits that matter: 240 has two, 1000 one. A number with one is added in the head. */
  const figures = (x: number) => String(x).replace(/0+$/, '').length;
  if (/^\d+( \+ \d+)+$/.test(text)) {
    const xs = nums(text);
    const sum = xs.reduce((a, b) => a + b, 0);
    const twoDigit = xs.filter((x) => x >= 10).length >= 2;
    const carries = Array.from({ length: String(sum).length }, (_, i) =>
      xs.reduce((a, x) => a + (Math.floor(x / 10 ** i) % 10), 0),
    ).some((t) => t >= 10);
    const columns = xs.filter((x) => figures(x) >= 2).length >= 2;
    // Tens that add to 100 or less (50 + 20 + 30) are added in the head.
    if (xs.every((x) => x % 10 === 0) && sum <= 100) return undefined;
    // Round numbers with at most two figures each (36,000 + 23,000) are added in the head.
    if (xs.every((x) => x % 100 === 0 && figures(x) <= 2)) return undefined;
    // Adding one place unit (999,000 + 1,000) moves one digit: done in the head.
    if (xs.length === 2 && xs.some((x) => x >= 10 && figures(x) === 1 && /^10+$/.test(String(x))))
      return undefined;
    return twoDigit && (carries || (sum >= 100 && columns)) ? columnAdd(xs) : undefined;
  }
  if (/^\d+ − \d+$/.test(text)) {
    const [c, b] = nums(text) as [number, number];
    // Nothing to set out for a number taken from itself.
    // A difference under 10 (1,000 − 998) is found by counting up, not in columns.
    if (b < 10 || c < b || c - b < 10) return undefined;
    // Round numbers with at most two figures each (61,000 − 28,000) are done in the head.
    if ([c, b].every((x) => x % 100 === 0 && figures(x) <= 2)) return undefined;
    const borrows = String(b)
      .split('')
      .reverse()
      .some((x, i) => Number(x) > Math.floor(c / 10 ** i) % 10);
    return borrows || (c >= 100 && figures(b) >= 2 && b % 10 !== 0)
      ? columnSubtract(c, b)
      : undefined;
  }
  if (g >= 4 && /^\d+ × \d+$/.test(text)) {
    const [a, b] = nums(text) as [number, number];
    // A multiple of ten times a digit (40 × 6) is a fact and a zero, not column work.
    const mental = (x: number, y: number) => y < 10 && /^[1-9]0+$/.test(String(x));
    // Times-table facts and products under 100 are done in the head, and so is multiplying
    // by 10, 100 or 1,000 (Grade 6: 40 × 10).
    const tenPower = (x: number) => g >= 6 && /^10+$/.test(String(x));
    if (Math.max(a, b) <= 12 || a * b < 100 || mental(a, b) || mental(b, a)) return undefined;
    if (tenPower(a) || tenPower(b)) return undefined;
    // Grade 5: the standard algorithm (bigger factor on top) when the second has 1 or 2 digits.
    if (g >= 5) {
      const [top, bottom] = a >= b ? [a, b] : [b, a];
      return standardMultiply(top, bottom) ?? columnMultiply(a, b, true);
    }
    return columnMultiply(a, b);
  }
  // Decimals (Grade 5): line up the points and add or take away in columns.
  if (g >= 5 && /^\d+\.\d+( \+ \d+(\.\d+)?)+$|^\d+ \+ \d+\.\d+/.test(text)) {
    return decimalColumns('+', nums(text));
  }
  if (g >= 5 && /^\d+(\.\d+)? − \d+(\.\d+)?$/.test(text) && text.includes('.')) {
    const [c, b] = nums(text) as [number, number];
    return c >= b ? decimalColumns('−', [c, b]) : undefined;
  }
  // Grade 6: a decimal dividend or quotient, and two-digit divisors (6.NS.2–3).
  if (g >= 6 && /^\d+(\.\d+)? ÷ \d+$/.test(text)) {
    const [n, d] = nums(text) as [number, number];
    // A fact or a one-digit answer is done in the head (0.8 ÷ 4, 45 ÷ 9).
    const places = (String(n).split('.')[1] ?? '').length;
    const scaled = Math.round(n * 10 ** places);
    if (d < 2 || (scaled % d === 0 && scaled / d < 10)) return undefined;
    // A fact with zeros (300 ÷ 30 = 10, 1,800 ÷ 6 = 300) is done in the head.
    let [n0, d0] = [n, d];
    while (n0 % 10 === 0 && d0 % 10 === 0) [n0, d0] = [n0 / 10, d0 / 10];
    if (Number.isInteger(n0 / d0) && d0 <= 12 && /^[1-9]0*$/.test(String(n0 / d0)))
      return undefined;
    return decimalLongDivision(n, d);
  }
  if (g >= 4 && /^\d+ ÷ \d+$/.test(text)) {
    const [n, d] = nums(text) as [number, number];
    if (n < 10 || d < 2 || d > 12 || n % d !== 0 || n / d < 10) return undefined;
    // A fact with zeros on the end (360 ÷ 4: 36 ÷ 4 = 9, so 90; 7,000 ÷ 10) needs no bracket.
    let [n0, d0] = [n, d];
    while (n0 % 10 === 0 && d0 % 10 === 0) [n0, d0] = [n0 / 10, d0 / 10];
    if (d0 === 1 || (n0 % 10 === 0 && (n0 / 10) % d0 === 0 && n0 / 10 < 100)) return undefined;
    // Every digit shares evenly (26 ÷ 2, 84 ÷ 4): divide each place in the head.
    if (n < 100 && digitsOf(n).every((x) => x % d === 0)) return undefined;
    // Grade 4 takes away groups by place (partial quotients); the bracket from Grade 5.
    return (g === 4 ? partialQuotients(n, d) : undefined) ?? longDivision(n, d);
  }
  return undefined;
}

// ── Linear algebra and complex values on a page (HE-E16, HE-E17) ──
//
// The solver works with numbers, so a matrix, a vector or a complex value is a group of
// numbers (`group`: counted once toward a page's values). These helpers declare the group,
// read it back, and give the relations whose steps print the worked lines of
// `engine/linalg.ts` and `engine/complex.ts`.

/** The relations and their step text, as a page spreads them into its module. */
export interface RulesOf {
  relations: Relation[];
  steps: Record<string, Record<string, StepText>>;
}

/** Joins rule sets: `{ ...joinRules(a, b), … }` in a module. */
export const joinRules = (...rs: RulesOf[]): RulesOf => ({
  relations: rs.flatMap((r) => r.relations),
  steps: Object.assign({}, ...rs.map((r) => r.steps)) as RulesOf['steps'],
});

const SUBS = '₀₁₂₃₄₅₆₇₈₉';
const subOf = (n: number) => [...String(n)].map((d) => SUBS[Number(d)]).join('');

/**
 * A matrix's entries as one group: ids `<id><row><column>` (A11, A12, …), symbols with
 * subscripts (a₁₁), names "<name>, row 1, column 2".
 */
export function matrixVariables(
  id: string,
  letter: string,
  name: string,
  rows: number,
  cols: number,
  extra: Partial<VariableDef> = {},
): VariableDef[] {
  return Array.from({ length: rows * cols }, (_, k) => {
    const [i, j] = [Math.floor(k / cols) + 1, (k % cols) + 1];
    return {
      id: `${id}${i}${j}`,
      symbol: `${letter}${subOf(i)}${subOf(j)}`,
      name: `${name}, row ${i}, column ${j}`,
      min: -1000,
      max: 1000,
      step: 0.01,
      group: id,
      ...extra,
    };
  });
}

/** A vector's components as one group: ids `<id>1`…, symbols u₁…, names "<name>, component 1". */
export function vectorVariables(
  id: string,
  letter: string,
  name: string,
  n: number,
  extra: Partial<VariableDef> = {},
): VariableDef[] {
  return Array.from({ length: n }, (_, k) => ({
    id: `${id}${k + 1}`,
    symbol: `${letter}${subOf(k + 1)}`,
    name: `${name}, component ${k + 1}`,
    min: -1000,
    max: 1000,
    step: 0.01,
    group: id,
    ...extra,
  }));
}

const matrixIds = (id: string, rows: number, cols: number) =>
  Array.from({ length: rows }, (_, i) =>
    Array.from({ length: cols }, (_, j) => `${id}${i + 1}${j + 1}`),
  );
const vectorIds = (id: string, n: number) => Array.from({ length: n }, (_, k) => `${id}${k + 1}`);

/** The matrix a group holds, or undefined while an entry is unknown. */
export function matrixOf(v: Values, id: string, rows: number, cols: number): Matrix | undefined {
  const m = matrixIds(id, rows, cols).map((r) => r.map((x) => v[x]));
  return m.every((r) => r.every((x) => x !== undefined)) ? (m as Matrix) : undefined;
}

/** The vector a group holds, or undefined while a component is unknown. */
export function vectorOf(v: Values, id: string, n: number): Vector | undefined {
  const x = vectorIds(id, n).map((k) => v[k]);
  return x.every((y) => y !== undefined) ? (x as Vector) : undefined;
}

/** Solvers that find `x` only (no value is worked back from it). */
const solveOnly = (vars: string[], x: string, f: (v: Values) => number | undefined) => ({
  ...Object.fromEntries(vars.map((y) => [y, () => undefined])),
  [x]: (v: Values) => {
    const y = f(v);
    return y === undefined || !Number.isFinite(y) ? undefined : Number(y.toPrecision(12));
  },
});

/** A matrix of value ids as a display template: "[[{A11}, {A12}], [{A21}, {A22}]]". */
const idMatrix = (ids: string[][]) =>
  `[${ids.map((r) => `[${r.map((y) => `{${y}}`).join(', ')}]`).join(', ')}]`;

/**
 * A square system A x = b solved by Cramer's rule (2 × 2 or 3 × 3; K u = F, node and mesh
 * equations): D = det A with its worked lines (2 × 2 arithmetic or 3 × 3 cofactors), then each
 * unknown xⱼ = Dⱼ ÷ D with Dⱼ worked. `a` is the matrix group's id, `b` the right side's and
 * `x` the unknowns' ids; `D` the determinant's. The unknowns are found from A and b only
 * (typing a solution doesn't find A).
 */
export function cramerRules(opts: {
  a: string;
  b: string;
  x: string[];
  D: string;
  show?: Show;
}): RulesOf {
  const { a, b, x, D, show = exactShow } = opts;
  const n = x.length;
  const A = matrixIds(a, n, n);
  const B = vectorIds(b, n);
  const flatA = A.flat();
  const mat = (v: Values) => matrixOf(v, a, n, n);
  const dVars = [D, ...flatA];
  const dRule: Relation = {
    id: 'D = det A',
    display: `{${D}} = det ${idMatrix(A)}`,
    vars: dVars,
    residual: (v) => v[D]! - det(mat(v)!),
    solve: solveOnly(dVars, D, (v) => {
      const m = mat(v);
      return m && det(m);
    }),
    check: (v) => `${show(v[D]!)} = ${detText(mat(v)!, show)}`,
  };
  const rules: RulesOf = {
    relations: [dRule],
    steps: {
      [dRule.id]: {
        [D]: {
          expr: (v) => detText(mat(v)!, show),
          how:
            n === 2
              ? 'Down the main diagonal, take away the other diagonal.'
              : 'Along the first row: each entry times its 2 × 2 minor, with signs +, −, +.',
          work: (v) => detLines(mat(v)!, show),
        },
      },
    },
  };
  x.forEach((xj, j) => {
    const name = `D${subOf(j + 1)}`;
    const vars = [xj, D, ...flatA, ...B];
    const withB = (v: Values) => {
      const m = mat(v);
      const r = vectorOf(v, b, n);
      return m && r && withColumn(m, j, r);
    };
    const rel: Relation = {
      id: `${xj} = ${name} ÷ D`,
      display: `{${xj}} = det ${idMatrix(A.map((r, i) => r.map((y, c) => (c === j ? B[i]! : y))))} ÷ {${D}}`,
      vars,
      residual: (v) => v[xj]! * v[D]! - det(withB(v)!),
      solve: solveOnly(vars, xj, (v) => {
        const m = withB(v);
        return m && v[D] ? det(m) / v[D]! : undefined;
      }),
      check: (v) => `${show(v[xj]!)} = ${show(det(withB(v)!))} ÷ ${factor(v[D]!, show)}`,
    };
    rules.relations.push(rel);
    rules.steps[rel.id] = {
      [xj]: {
        expr: (v) => `${show(det(withB(v)!))} ÷ ${factor(v[D]!, show)}`,
        how: `${name} is D with the right sides in column ${j + 1}; divide it by D.`,
        work: (v) => {
          const m = withB(v)!;
          const worked = n === 2 ? `${det2Arithmetic(m, show)} = ` : '';
          return [`${name} = ${detText(m, show)} = ${worked}${show(det(m))}`];
        },
      },
    };
  });
  return rules;
}

/** How a page writes its complex values: i (math) or j (electrical), and a unit after them. */
export interface ComplexOptions extends ComplexStyle {
  /** The unit written after the value in the one-value line ("40 − j30 Ω"). */
  unitText?: string;
  /** Also say the value in polar form ("= 50∠−36.87° Ω"). */
  polar?: boolean;
}

/**
 * A complex value as one group of two numbers: ids `<id>r` and `<id>i`, symbols "Re Z" and
 * "Im Z" (or `parts`), names "<name>, real part" and "<name>, imaginary part".
 */
export function complexVariables(
  id: string,
  symbol: string,
  name: string,
  extra: Partial<VariableDef> & { parts?: [string, string] } = {},
): VariableDef[] {
  const { parts = [`Re ${symbol}`, `Im ${symbol}`], ...more } = extra;
  const part = (k: 'r' | 'i', s: string, what: string): VariableDef => ({
    id: `${id}${k}`,
    symbol: s,
    name: `${name}, ${what} part`,
    min: -1e9,
    max: 1e9,
    group: id,
    ...more,
  });
  return [part('r', parts[0], 'real'), part('i', parts[1], 'imaginary')];
}

/**
 * A complex value typed in polar form as one group: its magnitude (`<id>m`, symbol "|V|") and
 * its angle in degrees (`<id>a`, "θ_V", −180° to 180°), as a phasor is given: 10∠30° V.
 */
export function polarVariables(
  id: string,
  symbol: string,
  name: string,
  extra: Partial<VariableDef> & { parts?: [string, string] } = {},
): VariableDef[] {
  const { parts = [`|${symbol}|`, `θ_${symbol}`], ...more } = extra;
  return [
    {
      id: `${id}m`,
      symbol: parts[0],
      name: `${name}, magnitude`,
      min: 0,
      max: 1e9,
      group: id,
      ...more,
    },
    {
      id: `${id}a`,
      symbol: parts[1],
      name: `${name}, angle`,
      min: -180,
      max: 180,
      step: 0.01,
      group: id,
      ...more,
      unit: '°',
    },
  ];
}

/**
 * The complex value a group holds (its real and imaginary parts, or with `polar` its magnitude
 * and angle), or undefined while a part is unknown.
 */
export function complexOf(v: Values, id: string, polar = false): Complex | undefined {
  const [x, y] = polar ? [v[`${id}m`], v[`${id}a`]] : [v[`${id}r`], v[`${id}i`]];
  if (x === undefined || y === undefined) return undefined;
  return polar ? fromPolar(x, y) : complex(x, y);
}

/**
 * A complex value worked out from others, as one value: two relations (the real and the
 * imaginary part). `formula` is the rule with `{Z}` for each complex input and `{x}` for each
 * real one ("{ZA} ÷ {ZB}"); `f` works it out; `lines` are the worked lines (from
 * `engine/complex.ts`), shown under the real part; the imaginary part's step ends with the one
 * value ("→ Z = −10 + j20 Ω", and its polar form when asked). Found forward only.
 */
export function complexRule(opts: {
  target: string;
  symbol: string;
  complexInputs: string[];
  /** The complex inputs typed in polar form (`polarVariables`). */
  polarInputs?: string[];
  realInputs?: string[];
  formula: string;
  f: (z: Record<string, Complex>, v: Values) => Complex | undefined;
  lines?: (z: Record<string, Complex>, v: Values) => string[];
  how: string;
  style?: ComplexOptions;
}): RulesOf {
  const { target, symbol, complexInputs, polarInputs = [], realInputs = [], formula } = opts;
  const { f, lines, how } = opts;
  const style = opts.style ?? {};
  const unit = style.unit ?? 'i';
  const show = style.show ?? ((x: number) => formatNumber(x));
  const isPolar = (z: string) => polarInputs.includes(z);
  const partsOf = (z: string) => (isPolar(z) ? [`${z}m`, `${z}a`] : [`${z}r`, `${z}i`]);
  const vars = [...complexInputs.flatMap(partsOf), ...realInputs];
  const inputs = (v: Values) => {
    const zs: Record<string, Complex> = {};
    for (const z of complexInputs) {
      const c = complexOf(v, z, isPolar(z));
      if (!c) return undefined;
      zs[z] = c;
    }
    return realInputs.every((x) => v[x] !== undefined) ? zs : undefined;
  };
  const value = (v: Values) => {
    const zs = inputs(v);
    return zs && f(zs, v);
  };
  // The rule with symbols (({ZAr} + j{ZAi})) and with numbers ((30 + j40)).
  const symbolic = formula.replace(/\{(\w+)\}/g, (_, z: string) =>
    !complexInputs.includes(z)
      ? `{${z}}`
      : isPolar(z)
        ? `({${z}m}∠{${z}a})`
        : unit === 'j'
          ? `({${z}r} + j{${z}i})`
          : `({${z}r} + {${z}i}i)`,
  );
  // (a polar input as typed, 10∠30°; a rectangular one in brackets, (30 + j40))
  const numeric = (v: Values) =>
    formula.replace(/\{(\w+)\}/g, (_, z: string) =>
      !complexInputs.includes(z)
        ? factor(v[z]!, show)
        : isPolar(z)
          ? `(${show(v[`${z}m`]!)}∠${angleText(v[`${z}a`]!, style.angleDecimals)})`
          : bracketed(complexOf(v, z)!, style),
    );
  const one = (v: Values) => {
    const z = value(v);
    if (!z) return '';
    const u = style.unitText ? ` ${style.unitText}` : '';
    const polar = style.polar ? ` = ${polarText(z, style)}${u}` : '';
    return `→ ${symbol} = ${complexText(z, style)}${u}${polar}`;
  };
  const part = (k: 'r' | 'i'): Relation => {
    const x = `${target}${k}`;
    const fn = k === 'r' ? 'Re' : 'Im';
    const of = (v: Values) => {
      const z = value(v);
      return z && (k === 'r' ? z.re : z.im);
    };
    return {
      id: `${fn} ${symbol} = ${fn}(${formula.replace(/[{}]/g, '')})`,
      display: `{${x}} = ${fn}(${symbolic})`,
      vars: [x, ...vars],
      residual: (v) => v[x]! - (of(v) ?? NaN),
      solve: solveOnly([x, ...vars], x, of),
      check: (v) => `${show(v[x]!)} = ${fn}(${numeric(v)})`,
    };
  };
  const [re, im] = [part('r'), part('i')];
  return {
    relations: [re, im],
    steps: {
      [re.id]: {
        [`${target}r`]: {
          expr: (v) => `Re(${numeric(v)})`,
          how,
          ...(lines ? { work: (v: Values) => lines(inputs(v)!, v) } : {}),
        },
      },
      [im.id]: {
        [`${target}i`]: {
          expr: (v) => `Im(${numeric(v)})`,
          how: `The imaginary part of the same ${symbol}.`,
          note: one,
        },
      },
    },
  };
}
