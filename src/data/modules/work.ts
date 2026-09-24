/**
 * Worked-arithmetic lines for the step-by-step (`StepText.work`): each line is one operation a
 * student can do with a pencil at that grade. Numbers are plain values (no templates), so these
 * are only for modules without convertible units.
 */

/** "240, 250, 260, 270"; long lists keep the first two and the last: "5, 10, …, 100". */
export function countList(from: number, step: number, count: number): string {
  const xs = Array.from({ length: count }, (_, i) => from + step * (i + 1));
  return xs.length > 20 ? `${xs[0]}, ${xs[1]}, …, ${xs[xs.length - 1]}` : xs.join(', ');
}

/** "4 + 4 + 4 = 12" (repeated addition), shortened past 10 addends. */
export function repeated(each: number, times: number): string {
  if (times <= 0) return `0 groups = 0`;
  const terms =
    times > 10 ? `${each} + ${each} + … (${times} times)` : Array(times).fill(each).join(' + ');
  return `${terms} = ${each * times}`;
}

/** Adds left to right, one addition per line: [3, 5, 2] → "3 + 5 = 8", "8 + 2 = 10". */
export function sumSteps(nums: number[], unit = '', evenTwo = false): string[] {
  if (nums.length < 2 || (nums.length === 2 && !evenTwo)) return [];
  const lines: string[] = [];
  let acc = nums[0]!;
  for (const n of nums.slice(1)) {
    lines.push(`${acc}${unit} + ${n}${unit} = ${acc + n}${unit}`);
    acc += n;
  }
  return lines;
}

/** A missing part: add the known parts, then take them from the total. */
export function missingPart(total: number, known: number[], unit = ''): string[] {
  const sum = known.reduce((a, b) => a + b, 0);
  return [
    ...(known.length > 1 ? [`${known.map((k) => `${k}${unit}`).join(' + ')} = ${sum}${unit}`] : []),
    `${total}${unit} − ${sum}${unit} = ${total - sum}${unit}`,
  ];
}

const places = (n: number) => ({
  h: Math.floor(n / 100) * 100,
  t: Math.floor((n % 100) / 10) * 10,
  o: n % 10,
});

/**
 * a + b the way it's taught, one step per line:
 * - within 20, make a ten (8 + 2 = 10, 10 + 3 = 13);
 * - within 100, jump the tens then the ones, going through the next ten (36 + 4 = 40, 40 + 3 = 43);
 * - past 100, add each place, then add the parts one at a time.
 * Facts that need no regrouping get no lines.
 */
export function addStrategy(a: number, b: number, unit = ''): string[] {
  const u = unit;
  const c = a + b;
  const [big, small] = a >= b ? [a, b] : [b, a];
  if (c <= 20) {
    const need = 10 - big;
    if (big >= 10 || need <= 0 || small <= need) return [];
    return [`${big}${u} + ${need}${u} = 10${u}`, `10${u} + ${small - need}${u} = ${c}${u}`];
  }
  if (c <= 100) {
    const { t, o } = places(small);
    const lines: string[] = [];
    let at = big;
    if (t > 0) {
      lines.push(`${at}${u} + ${t}${u} = ${at + t}${u}`);
      at += t;
    }
    const toTen = (10 - (at % 10)) % 10;
    if (o > 0 && toTen > 0 && o > toTen) {
      lines.push(`${at}${u} + ${toTen}${u} = ${at + toTen}${u}`);
      lines.push(`${at + toTen}${u} + ${o - toTen}${u} = ${c}${u}`);
    } else if (o > 0 && lines.length) {
      lines.push(`${at}${u} + ${o}${u} = ${c}${u}`);
    }
    // One line that only repeats the sum (35 + 20 = 55) shows nothing new.
    return lines.length > 1 ? lines : [];
  }
  const [pa, pb] = [places(a), places(b)];
  // Each place that has something to add, then the place totals one at a time.
  const rows = (
    [
      ['Hundreds', pa.h, pb.h],
      ['Tens', pa.t, pb.t],
      ['Ones', pa.o, pb.o],
    ] as const
  ).filter(([, x, y]) => x + y > 0);
  const parts = rows.map(([, x, y]) => x + y);
  // Places that only one number has need no adding (300 + 5 = 305).
  if (rows.filter(([, x, y]) => x > 0 && y > 0).length === 0) return [];
  return [
    ...rows
      .filter(([, x, y]) => x > 0 && y > 0)
      .map(([name, x, y]) => `${name}: ${x} + ${y} = ${x + y}`),
    ...sumSteps(parts),
    ...(parts.length === 2 ? [`${parts[0]} + ${parts[1]} = ${c}`] : []),
  ].map((l) => (u ? l.replace(/(\d+)(?![\d.])/g, `$1${u}`) : l));
}

/**
 * c − b the way it's taught, one step per line: jump back each place of b (434 − 100 = 334,
 * 334 − 70 = 264, 264 − 8 = 256), and take the ones back to the ten first when they cross it
 * (13 − 3 = 10, 10 − 2 = 8).
 */
export function subtractStrategy(c: number, b: number, unit = ''): string[] {
  const u = unit;
  const p = places(b);
  const jumps = [p.h, p.t].filter((x) => x > 0);
  const lines: string[] = [];
  let at = c;
  for (const j of jumps) {
    lines.push(`${at}${u} − ${j}${u} = ${at - j}${u}`);
    at -= j;
  }
  const back = at % 10;
  if (p.o > 0 && back > 0 && p.o > back) {
    lines.push(`${at}${u} − ${back}${u} = ${at - back}${u}`);
    lines.push(`${at - back}${u} − ${p.o - back}${u} = ${at - p.o}${u}`);
  } else if (p.o > 0 && lines.length) {
    lines.push(`${at}${u} − ${p.o}${u} = ${at - p.o}${u}`);
  }
  return lines.length > 1 ? lines : [];
}

/** Which is greater, by place: "Tens: 4 < 5, so 45 < 54". */
export function compareLine(a: number, b: number): string {
  if (a === b) return `${a} = ${b}`;
  const sign = a > b ? '>' : '<';
  for (const [name, size] of [
    ['Hundreds', 100],
    ['Tens', 10],
    ['Ones', 1],
  ] as const) {
    const [da, db] = [Math.floor(a / size) % 10, Math.floor(b / size) % 10];
    if (da !== db && (size === 1 || Math.max(a, b) >= size)) {
      return `${name}: ${da} ${da > db ? '>' : '<'} ${db}, so ${a} ${sign} ${b}`;
    }
  }
  return `${a} ${sign} ${b}`;
}

/**
 * The difference by counting up from the smaller number: to the next ten, the next hundred,
 * then the rest (256 + 4 = 260, 260 + 40 = 300, 300 + 134 = 434, so 4 + 40 + 134 = 178).
 */
export function countUp(from: number, to: number, unit = ''): string[] {
  if (to <= from) return [];
  const hops: number[] = [];
  let at = from;
  const nextTen = Math.ceil((at + 1) / 10) * 10;
  if (at % 10 !== 0 && nextTen < to) {
    hops.push(nextTen - at);
    at = nextTen;
  }
  const nextHundred = Math.ceil((at + 1) / 100) * 100;
  if (at % 100 !== 0 && nextHundred < to && to - from > 100) {
    hops.push(nextHundred - at);
    at = nextHundred;
  }
  // The rest by place: hundreds, then tens, then ones (300 + 100 = 400, 400 + 30 = 430, …).
  const rest = places(to - at);
  hops.push(...[rest.h, rest.t, rest.o].filter((x) => x > 0));
  if (hops.length <= 1) return [];
  const lines: string[] = [];
  at = from;
  for (const h of hops) {
    lines.push(`${at}${unit} + ${h}${unit} = ${at + h}${unit}`);
    at += h;
  }
  lines.push(`${hops.map((h) => `${h}${unit}`).join(' + ')} = ${to - from}${unit}`);
  return lines;
}

/**
 * Adds several numbers one at a time, making a ten first when two of them do (6 + 4 = 10), and
 * leaving out zeros: [1, 6, 4, 3] → "6 + 4 = 10", "10 + 1 = 11", "11 + 3 = 14".
 */
export function addAll(nums: number[], unit = ''): string[] {
  const xs = nums.filter((x) => x !== 0);
  for (let i = 0; i < xs.length; i++) {
    for (let j = i + 1; j < xs.length; j++) {
      if ((xs[i]! + xs[j]!) % 10 === 0 && (xs[i]! % 10) + (xs[j]! % 10) === 10) {
        const pair = [xs[i]!, xs[j]!];
        return sumSteps([...pair, ...xs.filter((_, k) => k !== i && k !== j)], unit, true);
      }
    }
  }
  return sumSteps(xs, unit, true);
}

/** Dealing one at a time: "Deal 1 to each group: 3, 6, 9, 12 used", "4 rounds → 4 in each group". */
export const dealLines = (groups: number, each: number, name: string) => [
  `Deal 1 to each ${name}: ${countList(0, groups, each)} used`,
  `${each} ${each === 1 ? 'round' : 'rounds'} → ${each} in each ${name}`,
];
