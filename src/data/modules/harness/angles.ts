/**
 * Reading angle lines (HE-E19): degrees–minutes–seconds, compass bearings, azimuths, atan2 and
 * tan⁻¹ with its quadrant turn, the quadrant a point is in, and conversions between degrees,
 * radians and gradians. `anglePrepass` (run by `evaluate`) turns a DMS angle or a bearing into
 * decimal degrees; `checkAngleLines` (run by `sampling.test.ts` on every step's lines) checks
 * each chain of equal sides, each quadrant or compass claim against the point's signs, and that
 * tan⁻¹(y ÷ (−x)) is never left in the wrong quadrant. Test-only.
 *
 * A lone minute or second (12.5′, 25″) reads as the number in its own unit, so "0.2083 × 60 =
 * 12.5′" and "25″ ÷ 5 = 5″" hold; an angle with degrees and minutes (4°30′00″, 52°10′) reads in
 * degrees. A line mixing the two ("34° + 12.5′") is written with DMS angles throughout.
 */
import {
  atan2D,
  compassQuarter,
  parseBearing,
  parseDms,
  quadrantOf,
  QUADRANT_NAMES,
} from '@/engine/angles';

import { ALGEBRA_LINE } from './algebraLines';
import { angleUnitNow, evaluate, evaluateAll, setAngleUnit, shownClose } from './evaluate';

/** An angle with degrees and minutes (and seconds): 4°30′00″, −0°00′05″, 52°10′, 34° 12′ 30″. */
export const DMS_TOKEN = /(?<![\d.])\d+°\s?\d+(?:\.\d+)?′(?:\s?\d+(?:\.\d+)?″)?/g;
/** A quadrant bearing: N 52°10′ E, S 56.31° W. */
export const BEARING_TOKEN =
  /\b([NS]) (\d+(?:\.\d+)?°(?:\s?\d+(?:\.\d+)?′)?(?:\s?\d+(?:\.\d+)?″)?) ([EW])\b/g;

/**
 * A line's bearings and DMS angles as decimal degrees ("N 52°10′ E" → 52.1667°), an azimuth's
 * leading zeros dropped (052° → 52°), and a lone minute or second as its number (12.5′ → 12.5).
 */
export function anglePrepass(text: string): string {
  return text
    .replace(BEARING_TOKEN, (whole, ns: string, a: string, ew: string) => {
      const az = parseBearing(`${ns} ${a} ${ew}`);
      return az === undefined ? whole : `${az}°`;
    })
    .replace(DMS_TOKEN, (whole) => {
      const d = parseDms(whole);
      return d === undefined ? whole : `${d}°`;
    })
    .replace(/(?<![\d.])0+(?=\d+(?:\.\d+)?°)/g, '')
    .replace(/(\d)[′″](?![′″])/g, '$1');
}
/** Whether `anglePrepass` has anything to do in a text. */
export const ANGLE_MARKS = /\d[′″]|\b[NS] \d[^=]*°[^=]*?[EW]\b|(?<![\d.])0\d+(?:\.\d+)?°/;

/**
 * The lines this reader checks: a DMS angle, a bearing, a lone minute or second, atan2 or
 * tan⁻¹ of a negative bottom, a quadrant or axis claim, a compass direction, ± or "or" with an
 * inverse trig value, and a conversion between degrees, radians and gradians. Complex and
 * matrix lines (∠, j) are read by `algebraLines.ts`.
 */
export const ANGLE_LINE =
  /\d°\s?\d+′|\d[′″]|\b[NS] \d[^=]*°[^=]*?[EW]\b|tan⁻¹\([^()]*÷ \([−-]|atan2\(|is in quadrant|-axis|\) points |(?:sin|cos|tan)⁻¹\([^()]*\)[^=]*=[^=]*, or |±(?:sin|cos|tan)⁻¹|× π ÷ 180|× 180 ÷ π|\d (?:m?rad|grad)\b(?!\/)/;

export interface AngleProblem {
  /** 'wrong': a side, quadrant or direction that doesn't hold; 'unread': a side not read. */
  kind: 'wrong' | 'unread';
  text: string;
}

/** Half a unit of an angle's last DMS part, in degrees (whole seconds: 1/7200°). */
function dmsHalf(text: string): number {
  let half = 0;
  for (const m of text.matchAll(/(\d+)°\s?(\d+(?:\.(\d+))?)′(?:\s?\d+(?:\.(\d+))?″)?/g)) {
    const seconds = m[0].includes('″');
    const decimals = (seconds ? m[4] : m[3])?.length ?? 0;
    half = Math.max(half, (0.5 * 10 ** -decimals) / (seconds ? 3600 : 60));
  }
  return half;
}
const hasDms = (text: string) => /\d°\s?\d+(?:\.\d+)?′/.test(text);

/** The values a side can mean (± gives two), or undefined when it can't be read. */
function sideValues(side: string): number[] | undefined {
  const xs = evaluateAll(side.trim());
  return xs.length ? xs : undefined;
}

/**
 * The range a side can take when each decimal in it is off by half a unit of its last place
 * (a whole number is exact: 180°, 60, 3600), or undefined when it can't be read.
 */
function decimalRange(text: string): [number, number] | undefined {
  const nums = [...text.matchAll(/\d+\.\d+/g)];
  if (nums.length > 8) {
    const x = evaluate(text);
    return x === undefined ? undefined : [x, x];
  }
  let lo = Infinity;
  let hi = -Infinity;
  for (let mask = 0; mask < 1 << nums.length; mask++) {
    let at = 0;
    let out = '';
    nums.forEach((m, i) => {
      const half = 0.5 * 10 ** -m[0].split('.')[1]!.length;
      out += text.slice(at, m.index) + String(Number(m[0]) + ((mask >> i) & 1 ? half : -half));
      at = m.index! + m[0].length;
    });
    const x = evaluate(out + text.slice(at));
    if (x === undefined || !Number.isFinite(x)) return undefined;
    [lo, hi] = [Math.min(lo, x), Math.max(hi, x)];
  }
  return [lo, hi];
}

/**
 * Whether two sides agree as printed: a DMS angle to half its last part, decimals to half their
 * last place (whole numbers exact, a value shown to 4 decimals by 5 × 10⁻⁵), or a value shown
 * to fewer figures within display rounding (`shownClose`).
 */
function agree(a: number, b: number, sa: string, sb: string): boolean {
  const [da, db] = [hasDms(sa), hasDms(sb)];
  if (da && db) return Math.abs(a - b) <= dmsHalf(sa) + dmsHalf(sb) + 1e-9;
  if (da || db) {
    const [dms, other, value, plain] = da ? [sa, sb, a, b] : [sb, sa, b, a];
    const h = dmsHalf(dms) + 1e-9;
    if (Math.abs(value - plain) <= h) return true;
    const r = decimalRange(other);
    return r !== undefined && value >= r[0] - h && value <= r[1] + h;
  }
  if (shownClose(a, b)) return true;
  const [ra, rb] = [decimalRange(sa), decimalRange(sb)];
  if (!ra || !rb) return false;
  const slack = 5e-5 * Math.max(1, Math.abs(a), Math.abs(b));
  return ra[0] <= rb[1] + slack && rb[0] <= ra[1] + slack;
}

const NUMBER = String.raw`[−-]?\d+(?:\.\d+)?`;
const toNum = (s: string) => Number(s.replace('−', '-'));

/** A quadrant or axis claim: "(−8, 6) is in quadrant II: add 180°". */
function quadrantProblems(line: string): AngleProblem[] | undefined {
  const axis = new RegExp(
    String.raw`\((${NUMBER}), (${NUMBER})\) is on the (positive|negative) (x|y)-axis`,
  ).exec(line);
  if (axis) {
    const [x, y] = [toNum(axis[1]!), toNum(axis[2]!)];
    const along = axis[4] === 'x' ? x : y;
    const across = axis[4] === 'x' ? y : x;
    const ok = across === 0 && (axis[3] === 'positive' ? along > 0 : along < 0);
    return ok ? [] : [{ kind: 'wrong', text: `point is not on that axis: "${line}"` }];
  }
  const q = new RegExp(
    String.raw`\((${NUMBER}), (${NUMBER})\) is in quadrant (I|II|III|IV)\b(?:: (.*))?`,
  ).exec(line);
  if (!q) return undefined;
  const [x, y] = [toNum(q[1]!), toNum(q[2]!)];
  const named = QUADRANT_NAMES.indexOf(q[3] as (typeof QUADRANT_NAMES)[number]);
  const real = quadrantOf(x, y);
  if (named !== real) return [{ kind: 'wrong', text: `wrong quadrant: "${line}"` }];
  const tail = q[4];
  if (tail === undefined) return [];
  const half = /add (?:180°|π)$/.test(tail);
  const minus = /subtract (?:180°|π)$/.test(tail);
  const turn = /add (?:360°|2π)$/.test(tail);
  const asIs = /as it is$/.test(tail);
  const ok = real === 1 ? asIs : real === 2 ? half : real === 3 ? half || minus : turn || asIs;
  return ok || !(half || minus || turn || asIs)
    ? []
    : [{ kind: 'wrong', text: `quadrant turn is wrong: "${line}"` }];
}

/** A compass claim: "(east, north) = (−0.6, −0.4) points south-west: add 180°". */
function compassProblems(line: string): AngleProblem[] | undefined {
  const m = new RegExp(
    String.raw`\(east, north\) = \((${NUMBER}), (${NUMBER})\) points ([a-z -]+?)(?:: add (180|360)°)?$`,
  ).exec(line);
  if (!m) return undefined;
  const [e, n] = [toNum(m[1]!), toNum(m[2]!)];
  const problems: AngleProblem[] = [];
  if (m[3] !== compassQuarter(e, n))
    problems.push({ kind: 'wrong', text: `wrong compass quarter: "${line}"` });
  const add = n < 0 ? 180 : e < 0 && n > 0 ? 360 : 0;
  const said = m[4] === undefined ? 0 : Number(m[4]);
  if (n !== 0 && e !== 0 && said !== add)
    problems.push({ kind: 'wrong', text: `bearing turn is wrong: "${line}"` });
  return problems;
}

/**
 * The angle of a point: a side that is tan⁻¹(y ÷ (−x)) of a negative number, alone or with a
 * half or full turn (+ 180°, − π). Not a rotation's ½ tan⁻¹(B ÷ (A − C)), which keeps its
 * principal value.
 */
const POINT_ANGLE = new RegExp(
  String.raw`(?:^|= )(?:(?:180°?|π) [+−] )?tan⁻¹\(([^()]+) ÷ \(([−-][\d.,]+)\)\)(?: [+−] (?:180°?|360°?|π|2π))?(?= = |$)`,
);

/**
 * tan⁻¹(y ÷ (−x)) as a point's angle must end in the quadrant of (−x, y): the last side of its
 * chain is atan2(y, x) up to whole turns, in the clause's unit.
 */
function quadrantOfChain(clause: string, last: number | undefined): AngleProblem[] {
  const m = POINT_ANGLE.exec(clause);
  if (!m || last === undefined) return [];
  const [y, x] = [evaluate(m[1]!), evaluate(m[2]!)];
  if (y === undefined || x === undefined || x >= 0) return [];
  // (in the clause's unit, as `checkAngleLine` set it: a ° mark, "rad", else the page's)
  const deg = angleUnitNow() === 'degrees';
  const want = atan2D(y, x)! * (deg ? 1 : Math.PI / 180);
  const turn = deg ? 360 : 2 * Math.PI;
  const off = Math.abs(((((last - want) % turn) + turn * 1.5) % turn) - turn / 2);
  return off <= turn / 360
    ? []
    : [{ kind: 'wrong', text: `tan⁻¹ left in the wrong quadrant: "${clause}"` }];
}

/**
 * A side in letters (a rule, "atan2(dep, lat) + 360°"): letters left once function names,
 * angle units and a bearing's N, S, E, W are taken out. Not read, not an error.
 */
const symbolic = (side: string) =>
  /\p{L}/u.test(
    anglePrepass(side).replace(/\b(?:a?(?:sin|cos|tan)|atan2|sqrt|ln|log|m?rad|grad)\b|⁻¹|π/g, ''),
  );

/** Checks one angle line's chains, claims and quadrants. */
export function checkAngleLine(line: string): AngleProblem[] {
  const quadrant = quadrantProblems(line);
  if (quadrant) return quadrant;
  const compass = compassProblems(line);
  if (compass) return compass;
  const problems: AngleProblem[] = [];
  // (a label before the values: "Check: …"; a sentence after them is not read)
  const body = line.replace(/^[A-Za-z][^:=]*: /, '');
  for (const clause of body.split(/, or |; /)) {
    // A clause with a degree mark is in degrees throughout (tan⁻¹(6 ÷ 8) = 36.87°), one marked
    // rad in radians; else the page's unit.
    const page = angleUnitNow();
    setAngleUnit(
      clause.includes('°')
        ? 'degrees'
        : /(?:\d|\)|π) ?m?rad\b(?!\/)/.test(clause)
          ? 'radians'
          : page,
    );
    try {
      checkClause(clause, line, problems);
    } finally {
      setAngleUnit(page);
    }
  }
  return problems;
}

function checkClause(clause: string, line: string, problems: AngleProblem[]) {
  {
    const sides = clause.split(/ = /);
    // A name on the left ("θ", "azimuth", "φ") is no side.
    if (sides.length && !/\d|π/.test(sides[0]!)) sides.shift();
    const read = sides.map((text) => ({ text, xs: sideValues(text) }));
    for (const s of read) {
      if (!s.xs && /\d/.test(s.text) && !symbolic(s.text))
        problems.push({ kind: 'unread', text: `can't read angle side "${s.text}" in "${line}"` });
    }
    const chain = read.filter((s): s is { text: string; xs: number[] } => !!s.xs);
    for (let k = 1; k < chain.length; k++) {
      const [a, b] = [chain[k - 1]!, chain[k]!];
      const ok =
        a.xs.length === b.xs.length
          ? a.xs.every((x) => b.xs.some((y) => agree(x, y, a.text, b.text)))
          : a.xs.every((x) => b.xs.some((y) => agree(x, y, a.text, b.text))) ||
            b.xs.every((y) => a.xs.some((x) => agree(x, y, a.text, b.text)));
      if (!ok) problems.push({ kind: 'wrong', text: `"${a.text}" ≠ "${b.text}" in "${line}"` });
    }
    problems.push(...quadrantOfChain(clause, chain[chain.length - 1]?.xs[0]));
  }
}

/** Every angle line of a step checked (`ANGLE_LINE`, not complex or matrix lines). */
export function checkAngleLines(lines: readonly string[]): AngleProblem[] {
  return lines
    .filter((l) => ANGLE_LINE.test(l) && !ALGEBRA_LINE.test(l))
    .flatMap((l) => checkAngleLine(l));
}
