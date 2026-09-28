/**
 * Written work: the arithmetic a student sets out on paper, as a grid of digit cells the page
 * draws in columns and the review dump prints as text. Column addition and subtraction with
 * regrouping marks (Grades 2–5), partial products (Grades 4–5) and the long-division bracket
 * (Grade 4 on). `autoWritten` picks the layout for a plain arithmetic line by grade; a module
 * can set `written` on a step to choose (or with `false`, refuse) one.
 */
import { formatNumber } from '@/engine/format';

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
}

export interface Written {
  kind: 'grid';
  /** Rows of cells, each row right-aligned to `width` columns (missing cells are blank). */
  rows: WrittenCell[][];
  width: number;
  /** The equation the work shows, in one line ("38 + 25 = 63"), for the harness and the dump. */
  says: string;
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
export function decimalLongDivision(n: number, d: number, maxPlaces = 3): Written | undefined {
  if (!Number.isInteger(d) || d < 2 || d > 99 || n <= 0) return undefined;
  const [intText, fracText = ''] = String(n).split('.');
  if (fracText.length > maxPlaces) return undefined;
  const digits = `${intText}${fracText}`.split('').map(Number);
  let fraction = fracText.length;
  // Zeros after the point until the division ends (or the places run out).
  let rem = 0;
  for (const x of digits) rem = (rem * 10 + x) % d;
  while (rem !== 0 && fraction < maxPlaces) {
    digits.push(0);
    fraction++;
    rem = (rem * 10) % d;
  }
  if (rem !== 0) return undefined;
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

/** The grid as text lines for the review dump, columns right-aligned. */
export function writtenText(w: Written): string[] {
  const widths = Array<number>(w.width).fill(1);
  for (const row of w.rows) {
    row.slice(0, w.width).forEach((c, i) => (widths[i] = Math.max(widths[i]!, c.text.length)));
  }
  return w.rows.map((row) => {
    const cells = Array.from({ length: w.width }, (_, i) => row[i] ?? blank);
    // A crossed-out digit gets a combining stroke (zero width, so the columns stay aligned).
    const main = cells
      .map((c, i) => (c.strike ? `${c.text}\u0336` : c.text).padStart(widths[i]!))
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
