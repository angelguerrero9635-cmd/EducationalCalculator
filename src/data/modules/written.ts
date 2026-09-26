/**
 * Written work: the arithmetic a student sets out on paper, as a grid of digit cells the page
 * draws in columns and the review dump prints as text. Column addition and subtraction with
 * regrouping marks (Grades 2–5), partial products (Grades 4–5) and the long-division bracket
 * (Grade 4 on). `autoWritten` picks the layout for a plain arithmetic line by grade; a module
 * can set `written` on a step to choose (or with `false`, refuse) one.
 */

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
  return { kind: 'grid', rows, width, says: `${nums.join(' + ')} = ${sum}` };
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
  return { kind: 'grid', rows, width, says: `${c} − ${b} = ${c - b}` };
}

/**
 * a × b by partial products, the first factor on top: each digit of the second factor times
 * each digit of the first, ones first, with the fact noted beside each row ("3 × 6").
 */
export function columnMultiply(a: number, b: number): Written | undefined {
  if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0) return undefined;
  const parts: { value: number; note: string }[] = [];
  digitsOf(b)
    .reverse()
    .forEach((db, j) => {
      digitsOf(a)
        .reverse()
        .forEach((da, i) => {
          const x = da * 10 ** i;
          const y = db * 10 ** j;
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
  return { kind: 'grid', rows, width, says: `${a} × ${b} = ${product}` };
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
    says: `${n} ÷ ${d} = ${q}${r ? ` remainder ${r}` : ''}`,
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
  if (g < 2 || g > 5) return undefined;
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
    return twoDigit && (carries || (sum >= 100 && columns)) ? columnAdd(xs) : undefined;
  }
  if (/^\d+ − \d+$/.test(text)) {
    const [c, b] = nums(text) as [number, number];
    if (b < 10 || c < b) return undefined;
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
    // Times-table facts and products under 100 are done in the head.
    if (Math.max(a, b) <= 12 || a * b < 100 || mental(a, b) || mental(b, a)) return undefined;
    return columnMultiply(a, b);
  }
  if (g >= 4 && /^\d+ ÷ \d+$/.test(text)) {
    const [n, d] = nums(text) as [number, number];
    if (n < 10 || d < 2 || d > 12 || n % d !== 0 || n / d < 10) return undefined;
    // A fact with zeros on the end (360 ÷ 4: 36 ÷ 4 = 9, so 90; 7,000 ÷ 10) needs no bracket.
    let [n0, d0] = [n, d];
    while (n0 % 10 === 0 && d0 % 10 === 0) [n0, d0] = [n0 / 10, d0 / 10];
    if (d0 === 1 || (n0 % 10 === 0 && (n0 / 10) % d0 === 0 && n0 / 10 < 100)) return undefined;
    return longDivision(n, d);
  }
  return undefined;
}
