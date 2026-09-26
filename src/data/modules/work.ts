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
  // Starting from the second addend is said, not done silently.
  const swapped = a < b;
  if (c <= 20) {
    const need = 10 - big;
    if (big >= 10 || need <= 0 || small <= need) return [];
    return [
      ...(swapped ? [`Start with the bigger number, ${big}${u}.`] : []),
      `${big}${u} + ${need}${u} = 10${u}`,
      `10${u} + ${small - need}${u} = ${c}${u}`,
    ];
  }
  if (c <= 100) {
    const { t, o } = places(small);
    const lines: string[] = swapped
      ? [`Start with the bigger number: ${big}${u} + ${small}${u}.`]
      : [];
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
    return lines.length > (swapped ? 2 : 1) ? lines : [];
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
  // Places that only one number has need no adding (300 + 5 = 305), and a sum with nothing
  // to regroup (240 + 18 = 258) is one line the student can do in their head.
  if (rows.filter(([, x, y]) => x > 0 && y > 0).length === 0) return [];
  if (
    rows.every(([, x, y]) => x + y < (x >= 100 || y >= 100 ? 1000 : x >= 10 || y >= 10 ? 100 : 10))
  ) {
    return [];
  }
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
  // Places that tie are said first ("Hundreds: 3 = 3."), then the place that decides.
  const ties: string[] = [];
  for (const [name, size] of [
    ['Hundreds', 100],
    ['Tens', 10],
    ['Ones', 1],
  ] as const) {
    const [da, db] = [Math.floor(a / size) % 10, Math.floor(b / size) % 10];
    if (Math.max(a, b) < size) continue;
    if (da === db && size > 1) {
      ties.push(`${name}: ${da} = ${db}.`);
      continue;
    }
    if (da !== db) {
      return `${ties.join(' ')}${ties.length ? ' ' : ''}${name}: ${da} ${da > db ? '>' : '<'} ${db}, so ${a} ${sign} ${b}`;
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
  lines.push(`Jumps: ${hops.map((h) => `${h}${unit}`).join(' + ')} = ${to - from}${unit}`);
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

/**
 * `times` groups of `each`, the way Grade 3 learns it, one step per line: count by the size of
 * each group ("Count by 4s, 5 times"); for 6 to 9 groups, split the groups into 5 and the rest
 * (7 × 3 = 5 × 3 + 2 × 3).
 */
export function timesWork(times: number, each: number): string[] {
  if (times === 0 || each === 0) return ['Any number times 0 is 0.'];
  if (times === 1 || each === 1) return [`1 × a number is that number: ${times * each}`];
  // A multiple of ten times a one-digit number: the fact, then the zeros (Grade 3–4 place value).
  const zeros = (n: number) => String(n).length - String(n).replace(/0+$/, '').length;
  if (each <= 10 && times % 10 === 0 && times > 10) {
    const core = times / 10 ** zeros(times);
    return [`${core} × ${each} = ${core * each}, so ${times} × ${each} = ${times * each}`];
  }
  if (times <= 10 && each % 10 === 0 && each > 10) {
    const core = each / 10 ** zeros(each);
    return [`${times} × ${core} = ${times * core}, so ${times} × ${each} = ${times * each}`];
  }
  // A fact within 10 × 10 is counted by; break-apart is for the pages that teach it.
  if (times <= 10 && each <= 10) {
    return [`Count by ${each}s, ${times} times: ${countList(0, each, times)} → ${times * each}`];
  }
  // Bigger numbers split by place: 123 × 6 = 100 × 6 + 20 × 6 + 3 × 6.
  return placeTimesWork(times, each);
}

/** `times` × `each` by the places of `times`: "100 × 6 = 600", "20 × 6 = 120", "3 × 6 = 18", the sum. */
export function placeTimesWork(times: number, each: number): string[] {
  const parts: number[] = [];
  for (const size of [1000, 100, 10, 1]) {
    const digit = Math.floor(times / size) % 10;
    if (digit > 0 && times >= size) parts.push(digit * size);
  }
  if (parts.length <= 1) return [`${times} × ${each} = ${times * each}`];
  const products = parts.map((p) => p * each);
  return [
    ...parts.map((p, i) => `${p} × ${each} = ${products[i]}`),
    `${products.join(' + ')} = ${times * each}`,
  ];
}

/**
 * n ÷ d, thinking of the multiplication fact in the number sentence's order: "? × 4 = 24" when
 * the first factor is missing, "4 × ? = 24" when the second is. Then count by d to n.
 */
export function divideWork(n: number, d: number, missing: 'first' | 'second' = 'first'): string[] {
  if (d === 0) return [];
  const q = n / d;
  if (!Number.isInteger(q) || q < 0) return [];
  if (n === 0) return ['0 shared into any number of groups is 0.'];
  const think = missing === 'first' ? `Think: ? × ${d} = ${n}` : `Think: ${d} × ? = ${n}`;
  // Past ten counts, the fact is the shorter road.
  if (q > 10) return [think, `${n} ÷ ${d} = ${q} because ${q} × ${d} = ${n}`];
  return [think, `Count by ${d}s to ${n}: ${countList(0, d, q)} → ${q}`];
}

/**
 * A basic fact the way Grade 3 is taught to find it without counting every group: known
 * facts (× 2, × 10) in one line, the rest built from them (× 4 is double double, × 6 is five
 * groups and one more, × 9 is ten groups less one, × 7 and × 8 split into five groups and
 * the rest). `times` is the number of groups, `each` the size of each.
 */
export function factWork(times: number, each: number): string[] {
  const p = (k: number) => k * each;
  switch (times) {
    case 2:
      return [`Double ${each}: ${each} + ${each} = ${p(2)}`];
    case 4:
      return [
        `Double ${each}: ${each} + ${each} = ${p(2)}`,
        `Double again: ${p(2)} + ${p(2)} = ${p(4)}`,
      ];
    case 5:
      return [`10 × ${each} = ${p(10)}. Five groups are half of that: ${p(5)}`];
    case 6:
      return [`5 × ${each} = ${p(5)}`, `One more group: ${p(5)} + ${each} = ${p(6)}`];
    case 7:
      return [`5 × ${each} = ${p(5)} and 2 × ${each} = ${p(2)}`, `${p(5)} + ${p(2)} = ${p(7)}`];
    case 8:
      return [`5 × ${each} = ${p(5)} and 3 × ${each} = ${p(3)}`, `${p(5)} + ${p(3)} = ${p(8)}`];
    case 9:
      return [`10 × ${each} = ${p(10)}`, `One group less: ${p(10)} − ${each} = ${p(9)}`];
    case 10:
      return [`10 groups of ${each} is ${each} tens: ${p(10)}`];
    default:
      return [];
  }
}

/** "23 ones = 2 tens and 3 ones", "13 ones = 1 ten and 3 ones": trading ones for tens. */
export function regroupLine(ones: number): string {
  const t = Math.floor(ones / 10);
  const o = ones % 10;
  return `${ones} ones = ${t} ${t === 1 ? 'ten' : 'tens'} and ${o} ${o === 1 ? 'one' : 'ones'}`;
}
