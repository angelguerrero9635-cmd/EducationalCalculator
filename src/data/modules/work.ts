/**
 * Worked-arithmetic lines for the step-by-step (`StepText.work`): each line is one operation a
 * student can do with a pencil at that grade. Numbers are plain values (no templates), so these
 * are only for modules without convertible units.
 */

/** "240, 250, 260, 270"; long lists keep the first two and the last: "5, 10, …, 100". */
export function countList(from: number, step: number, count: number): string {
  const xs = Array.from({ length: count }, (_, i) => from + step * (i + 1));
  return xs.length > 10 ? `${xs[0]}, ${xs[1]}, …, ${xs[xs.length - 1]}` : xs.join(', ');
}

/** "4 + 4 + 4 = 12" (repeated addition), shortened past 10 addends. */
export function repeated(each: number, times: number): string {
  if (times <= 0) return `0 groups = 0`;
  const terms =
    times > 10 ? `${each} + ${each} + … (${times} times)` : Array(times).fill(each).join(' + ');
  return `${terms} = ${each * times}`;
}

/** Adds left to right, one addition per line: [3, 5, 2] → "3 + 5 = 8", "8 + 2 = 10". */
export function sumSteps(nums: number[], unit = ''): string[] {
  if (nums.length <= 2) return [];
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
 * a + b the way it's taught: within 100, jump by the tens of b then its ones (38 + 20 = 58,
 * 58 + 5 = 63); past 100, add each place and then the parts. Facts within 20 need no lines.
 */
export function addStrategy(a: number, b: number): string[] {
  const c = a + b;
  if (c <= 20) return [];
  if (c <= 100) {
    const [big, small] = a >= b ? [a, b] : [b, a];
    const { t, o } = places(small);
    if (t === 0 || o === 0) return [];
    return [`${big} + ${t} = ${big + t}`, `${big + t} + ${o} = ${c}`];
  }
  const [pa, pb] = [places(a), places(b)];
  const parts = [pa.h + pb.h, pa.t + pb.t, pa.o + pb.o];
  return [
    `Hundreds: ${pa.h} + ${pb.h} = ${parts[0]}`,
    `Tens: ${pa.t} + ${pb.t} = ${parts[1]}`,
    `Ones: ${pa.o} + ${pb.o} = ${parts[2]}`,
    `${parts.join(' + ')} = ${c}`,
  ];
}

/** c − b by jumping back each place of b: 434 − 100 = 334, 334 − 70 = 264, 264 − 8 = 256. */
export function subtractStrategy(c: number, b: number): string[] {
  const p = places(b);
  const jumps = [p.h, p.t, p.o].filter((x) => x > 0);
  if (jumps.length <= 1 || c <= 20) return [];
  const lines: string[] = [];
  let at = c;
  for (const j of jumps) {
    lines.push(`${at} − ${j} = ${at - j}`);
    at -= j;
  }
  return lines;
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
  hops.push(to - at);
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
