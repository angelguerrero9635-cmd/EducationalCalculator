/**
 * The harness reads angle lines (HE-E19): every form `engine/angles.ts` writes is read back and
 * checked, and a wrong number, quadrant or compass quarter in any of them is caught.
 */
import * as an from '@/engine/angles';
import { formatNumber } from '@/engine/format';

import { ANGLE_LINE, anglePrepass, checkAngleLine, checkAngleLines } from '../angles';
import { evaluate, setAngleUnit } from '../evaluate';

const wrong = (line: string) =>
  expect([line, checkAngleLine(line).some((p) => p.kind === 'wrong')]).toEqual([line, true]);
const right = (lines: string[]) => {
  expect(checkAngleLines(lines)).toEqual([]);
};

/** A seeded generator, so a failure repeats. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

afterEach(() => setAngleUnit('radians'));

describe('evaluate reads angles', () => {
  it('reads DMS, bearings and azimuths as decimal degrees', () => {
    expect(anglePrepass('4°30′00″ + 1°15′')).toBe('4.5° + 1.25°');
    expect(evaluate('4°30′00″')).toBeCloseTo(4.5, 9);
    expect(evaluate('540°00′25″ − 540°00′00″')).toBeCloseTo(25 / 3600, 9);
    expect(evaluate('N 52°10′ E')).toBeCloseTo(52 + 10 / 60, 9);
    expect(evaluate('S 56.31° W')).toBeCloseTo(236.31, 9);
    expect(evaluate('052°')).toBe(52);
    // a lone minute or second is its number
    expect(evaluate('0.5 × 60')).toBe(30);
    expect(evaluate('25″ ÷ 5')).toBe(5);
    expect(evaluate('cos(4°30′00″)')).toBeCloseTo(Math.cos(4.5 * an.DEG), 9);
  });

  it('reads atan2 and a degree mark on a number', () => {
    setAngleUnit('degrees');
    expect(evaluate('atan2(6, −8)')).toBeCloseTo(143.1301, 3);
    expect(evaluate('tan⁻¹(6 ÷ (−8)) + 180°')).toBeCloseTo(143.1301, 3);
    expect(evaluate('−36.8699° + 180°')).toBeCloseTo(143.1301, 4);
    setAngleUnit('radians');
    expect(evaluate('atan2(−0.04, 0.03)')).toBeCloseTo(-0.9273, 4);
  });

  it('reads radians on a page of degrees when the line says rad', () => {
    setAngleUnit('degrees');
    expect(evaluate('tan⁻¹(1)')).toBeCloseTo(45, 9);
    expect(evaluate('sin(0.5236 rad)')).toBeCloseTo(0.5, 4);
    expect(evaluate('45° × π ÷ 180')).toBeCloseTo(Math.PI / 4, 9);
    expect(evaluate('0.7854 rad × 180 ÷ π')).toBeCloseTo(45, 3);
    expect(evaluate('50 grad × 360 ÷ 400')).toBe(45);
    // (radius is no unit)
    expect(evaluate('radius')).toBeUndefined();
  });
});

describe('checkAngleLines', () => {
  it('passes every form the engine writes, on random points', () => {
    const r = rng(19);
    const show = (x: number) => formatNumber(x);
    for (let k = 0; k < 300; k++) {
      const pick = () => Math.round((r() * 200 - 100) * 100) / 100;
      const [x, y] = [pick(), pick()];
      right(an.atan2Lines(y, x, { show }));
      right(an.atan2Lines(y, x, { show, full: true, form: 'atan2' }));
      right(an.atan2Lines(y / 100, x / 100, { show, unit: 'radians', name: 'φ' }));
      right(an.bearingLines(x, y, { show }));
      right(an.bearingLines(x, y, { show, bearing: 'dms' }));
      const a = r() * 720 - 360;
      right(an.toDmsLines(a));
      right(an.toDmsLines(a, 'dm'));
      right([an.fromDmsLine(a)]);
      right([an.angleConversionLine(a, '°', 'rad'), an.angleConversionLine(a, '°', 'grad')]);
      right([an.angleConversionLine(a * an.DEG, 'rad', '°')]);
      const s = Math.round((r() * 2 - 1) * 1000) / 1000;
      right(an.inverseTrigLines('sin', s));
      right(an.inverseTrigLines('cos', s));
    }
  });

  it('catches a wrong number, quadrant or quarter', () => {
    wrong('θ = tan⁻¹(6 ÷ (−8)) = −36.8699°');
    wrong('θ = tan⁻¹(6 ÷ (−8)) + 180° = −36.8699° + 180° = 134.1301°');
    wrong('(−8, 6) is in quadrant III: subtract 180°');
    wrong('(−8, 6) is in quadrant II: add 360°');
    wrong('(8, −6) is in quadrant IV: add 180°');
    wrong('(0, 5) is on the positive x-axis');
    wrong('(east, north) = (−0.6, −0.4) points south-east: add 180°');
    wrong('(east, north) = (−0.6, 0.4) points north-west: add 180°');
    wrong('236.3099° = S 56.3099° E');
    wrong('34.20833333° = 34°13′30″');
    wrong('4°30′00″ = 4 + 30 ÷ 60 + 0 ÷ 3600 = 4.6°');
    wrong('0.2083333333 × 60 = 13.5′');
    wrong('45° × π ÷ 180 = 0.8854 rad');
    wrong('θ = sin⁻¹(0.5) = 30°, or θ = 180° − 30° = 140°');
    wrong('θ = ±cos⁻¹(0.5) = ±50°');
    wrong('φ = tan⁻¹(0.04 ÷ (−0.03)) = −0.9273 rad');
    wrong('540°00′25″ − 540°00′00″ = 0°00′35″');
    // (25″ off two decimals of a degree is caught; 2″ is within their rounding)
    wrong('52.00° = N 51°59′35″ E');
    expect(checkAngleLine('52.00° = N 51°59′58″ E')).toEqual([]);
  });

  it('leaves complex and matrix lines to their reader, and other lines alone', () => {
    expect(ANGLE_LINE.test('θ = ∠(8 + j6) = tan⁻¹(6 ÷ (−8)) + 180° = 143.13°')).toBe(true);
    expect(checkAngleLines(['θ = ∠(8 + j6) = tan⁻¹(6 ÷ (−8)) + 180° = 1°'])).toEqual([]);
    expect(ANGLE_LINE.test('A = tan⁻¹(5 ÷ 12) = 22.62°')).toBe(false);
    // a conic's rotation keeps tan⁻¹'s principal value (½ of it), whatever A − C's sign
    setAngleUnit('degrees');
    expect(checkAngleLine('θ = tan⁻¹(-307 ÷ (-271 − 1)) ÷ 2')).toEqual([]);
    expect(checkAngleLine('φ = 180 + tan⁻¹(-4384.9328 ÷ (-8716.72))')).toEqual([]);
    expect(ANGLE_LINE.test('The 5′ end and the 3′ end')).toBe(true);
    expect(ANGLE_LINE.test('ω = 3 rad/s')).toBe(false);
  });
});
