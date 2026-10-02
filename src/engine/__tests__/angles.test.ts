import {
  acosBothD,
  angleConversionLine,
  angleFormText,
  angleRule,
  asinBothD,
  atan2D,
  atan2Lines,
  azimuthD,
  azimuthText,
  bearingLines,
  bearingText,
  dmsShort,
  dmsText,
  fromDmsLine,
  inverseTrigLines,
  parseAngle,
  parseBearing,
  parseDms,
  quadrantLine,
  toDmsLines,
  wrap180,
  wrap360,
} from '../angles';
import { formatNumber, parseNumber } from '../format';
import { conversionRule, convert, getUnit } from '../units';

const close = (x: number | undefined, y: number, tol = 1e-9) =>
  expect(Math.abs(x! - y)).toBeLessThanOrEqual(tol);

describe('angles in degrees', () => {
  it('turns and wraps', () => {
    expect(wrap360(-30)).toBe(330);
    expect(wrap360(360)).toBe(0);
    expect(wrap360(-0)).toBe(0);
    expect(wrap180(270)).toBe(-90);
    expect(wrap180(180)).toBe(180);
  });

  it('finds the angle of a point in its quadrant, and a bearing from east and north', () => {
    close(atan2D(6, 8), 36.86989764584402);
    close(atan2D(6, -8), 143.13010235415598);
    close(atan2D(-6, -8), -143.13010235415598);
    expect(atan2D(0, 0)).toBeUndefined();
    // a course east 94.56, north 73.88 is N 52° E; a slope falling west and south faces S 56° W
    close(azimuthD(94.56, 73.88), 52, 0.01);
    close(azimuthD(-0.6, -0.4), 236.30993247402023);
    close(azimuthD(-1, 1), 315);
    close(azimuthD(0, -1), 180);
  });

  it('gives both angles of a sine or a cosine', () => {
    const [a, b] = asinBothD(0.5)!;
    close(a, 30);
    close(b, 150);
    expect(asinBothD(1)).toEqual([90]);
    expect(asinBothD(2)).toBeUndefined();
    const c = acosBothD(0.5)!;
    close(c[0], 60);
    close(c[1], -60);
  });
});

describe('degrees, minutes and seconds', () => {
  it('writes an angle with its carry', () => {
    expect(dmsText(4.5)).toBe('4°30′00″');
    expect(dmsText(34 + 12 / 60 + 30 / 3600)).toBe('34°12′30″');
    expect(dmsText(540 + 25 / 3600)).toBe('540°00′25″');
    expect(dmsText(-5 / 3600)).toBe('−0°00′05″');
    // 59.9999″ rounds up to the next minute, never 60″
    expect(dmsText(10 + 59 / 60 + 59.9999 / 3600)).toBe('11°00′00″');
    expect(dmsText(52 + 10 / 60, 'dm')).toBe('52°10′');
    expect(dmsText(12.3456, 'dms', 1)).toBe('12°20′44.2″');
    expect(dmsShort(52)).toBe('52°');
    expect(dmsShort(52 + 10 / 60)).toBe('52°10′');
    expect(dmsShort(52 + 10 / 60 + 30 / 3600)).toBe('52°10′30″');
  });

  it('reads an angle typed or printed', () => {
    close(parseDms('34°12′30″'), 34.208333333333336);
    close(parseDms(`34° 12' 30"`), 34.208333333333336);
    close(parseDms('4°30′'), 4.5);
    close(parseDms('−0°00′05″'), -5 / 3600);
    close(parseDms('34.5°'), 34.5);
    expect(parseDms('34°75′')).toBeUndefined();
    expect(parseDms('34.5°10′')).toBeUndefined();
    expect(parseDms('34')).toBeUndefined();
  });

  it('converts both ways in lines that follow from each other', () => {
    expect(fromDmsLine(4.5)).toBe('4°30′00″ = 4 + 30 ÷ 60 + 0 ÷ 3600 = 4.5°');
    expect(toDmsLines(34 + 12.5 / 60)).toEqual([
      '0.2083333333 × 60 = 12.5′',
      '0.5 × 60 = 30″',
      '34.20833333° = 34°12′30″',
    ]);
    expect(toDmsLines(52 + 10 / 60, 'dm')).toEqual([
      '0.1666666667 × 60 = 10′',
      '52.16666667° = 52°10′',
    ]);
    expect(toDmsLines(30)).toEqual(['30° = 30°00′00″']);
  });
});

describe('bearings and azimuths', () => {
  it('writes and reads a quadrant bearing', () => {
    const short = (a: number) => dmsShort(a);
    expect(bearingText(52 + 10 / 60, short)).toBe('N 52°10′ E');
    expect(bearingText(236.31, (a) => `${formatNumber(a)}°`)).toBe('S 56.31° W');
    expect(bearingText(135, short)).toBe('S 45° E');
    expect(bearingText(300, short)).toBe('N 60° W');
    close(parseBearing('N 52°10′ E'), 52 + 10 / 60);
    close(parseBearing('S 56.31° W'), 236.31);
    close(parseBearing('s 45 e'), 135);
    close(parseBearing('N 60° W'), 300);
    expect(parseBearing('N 95° E')).toBeUndefined();
    expect(azimuthText(30)).toBe('030°');
    expect(azimuthText(236.31)).toBe('236.31°');
    expect(azimuthText(-30)).toBe('330°');
  });

  it('shows a value in its angle form and takes it typed', () => {
    expect(angleFormText(4.5, 'dms')).toBe('4°30′00″');
    expect(angleFormText(52 + 10 / 60, 'bearing')).toBe('N 52°10′ E');
    expect(angleFormText(236.31, 'bearing-decimal')).toBe('S 56.31° W');
    expect(angleFormText(52, 'azimuth')).toBe('052°');
    expect(formatNumber(4.5, { angleForm: 'dms' })).toBe('4°30′00″');
    close(parseAngle('N 30° E'), 30);
    close(parseNumber('34°12′30″') as number, 34.208333333333336);
    close(parseNumber('S 45° W') as number, 225);
    close(parseNumber('052°') as number, 52);
    expect(parseNumber('34°75′')).toBe('invalid');
    // plain numbers are unchanged
    expect(parseNumber('1,250.5')).toBe(1250.5);
  });
});

describe('atan2 lines', () => {
  it('names the quadrant and turns tan⁻¹ into it', () => {
    expect(atan2Lines(6, 8)).toEqual([
      '(8, 6) is in quadrant I: tan⁻¹ gives the angle as it is',
      'θ = tan⁻¹(6 ÷ 8) = 36.8699°',
    ]);
    expect(atan2Lines(6, -8)).toEqual([
      '(−8, 6) is in quadrant II: add 180°',
      'θ = tan⁻¹(6 ÷ (−8)) + 180° = −36.8699° + 180° = 143.1301°',
    ]);
    expect(atan2Lines(-6, -8)).toEqual([
      '(−8, −6) is in quadrant III: subtract 180°',
      'θ = tan⁻¹(−6 ÷ (−8)) − 180° = 36.8699° − 180° = −143.1301°',
    ]);
    expect(atan2Lines(-6, -8, { full: true })[1]).toBe(
      'θ = tan⁻¹(−6 ÷ (−8)) + 180° = 36.8699° + 180° = 216.8699°',
    );
    expect(atan2Lines(-6, 8, { full: true })[1]).toBe(
      'θ = tan⁻¹(−6 ÷ 8) + 360° = −36.8699° + 360° = 323.1301°',
    );
    expect(atan2Lines(6, -8, { form: 'atan2' })[1]).toBe(
      'θ = atan2(6, −8) = tan⁻¹(6 ÷ (−8)) + 180° = −36.8699° + 180° = 143.1301°',
    );
    expect(atan2Lines(5, 0)).toEqual(['(0, 5) is on the positive y-axis', 'θ = 90°']);
    expect(atan2Lines(0, -3)).toEqual(['(−3, 0) is on the negative x-axis', 'θ = 180°']);
  });

  it('works in radians with π', () => {
    // SHM phase: φ = atan2(−v₀/ω, x₀) = atan2(−0.04, 0.03)
    expect(atan2Lines(-0.04, 0.03, { unit: 'radians', name: 'φ' })).toEqual([
      '(0.03, −0.04) is in quadrant IV: tan⁻¹ gives the angle as it is',
      'φ = tan⁻¹(−0.04 ÷ 0.03) = −0.9273 rad',
    ]);
    expect(atan2Lines(0.04, -0.03, { unit: 'radians', name: 'φ' })[1]).toBe(
      'φ = tan⁻¹(0.04 ÷ (−0.03)) + π = −0.9273 + 3.1416 = 2.2143 rad',
    );
    expect(quadrantLine(-1, -1, 'radians')).toBe('(−1, −1) is in quadrant III: subtract π');
  });

  it('gives a compass bearing from east and north', () => {
    expect(bearingLines(-0.6, -0.4)).toEqual([
      '(east, north) = (−0.6, −0.4) points south-west: add 180°',
      'azimuth = tan⁻¹(−0.6 ÷ (−0.4)) + 180° = 56.3099° + 180° = 236.3099°',
      '236.3099° = S 56.3099° W',
    ]);
    const show = (x: number) => formatNumber(x, { decimals: 2 });
    // (the plan's 52°00′ course, from its rounded latitude and departure)
    expect(bearingLines(94.56, 73.88, { show, bearing: 'dms' })).toEqual([
      '(east, north) = (94.56, 73.88) points north-east',
      'azimuth = tan⁻¹(94.56 ÷ 73.88) = 52.00°',
      '52.00° = N 51°59′58″ E',
    ]);
    expect(bearingLines(-1, 1)[0]).toBe('(east, north) = (−1, 1) points north-west: add 360°');
    expect(bearingLines(0, -2)).toEqual([
      '(east, north) = (0, −2) points due south',
      'azimuth = 180°',
      '180° = S 0° E',
    ]);
  });

  it('writes both inverse trig answers where the page asks', () => {
    expect(inverseTrigLines('sin', 0.5)).toEqual([
      'θ = sin⁻¹(0.5) = 30°, or θ = 180° − 30° = 150°',
    ]);
    expect(inverseTrigLines('cos', 0.5)).toEqual(['θ = ±cos⁻¹(0.5) = ±60°']);
    expect(inverseTrigLines('sin', 1)).toEqual(['θ = sin⁻¹(1) = 90°']);
    expect(inverseTrigLines('tan', 1)).toEqual(['θ = tan⁻¹(1) = 45°']);
    expect(inverseTrigLines('sin', 0.5, { both: false, unit: 'radians' })).toEqual([
      'θ = sin⁻¹(0.5) = 0.5236 rad',
    ]);
  });
});

describe('angle units', () => {
  it('converts between degrees, radians, gradians, minutes, seconds and turns', () => {
    close(convert(180, '°', 'rad'), Math.PI);
    close(convert(100, 'grad', '°'), 90);
    close(convert(1, '°', '′'), 60, 1e-9);
    close(convert(1, '′', '″'), 60, 1e-9);
    close(convert(1, 'rev', '°'), 360, 1e-9);
    close(convert(1, 'mrad', 'μrad'), 1000, 1e-9);
    expect(getUnit('°')?.listed).toBe(true);
  });

  it('states the rule as a class writes it', () => {
    expect(angleRule('°', 'rad')).toBe('180° = π rad');
    expect(angleRule('rad', '°')).toBe('180° = π rad');
    expect(angleRule('grad', '°')).toBe('400 grad = 360°');
    expect(angleRule('′', '°')).toBe('1° = 60′');
    expect(angleRule('″', '′')).toBe('1′ = 60″');
    expect(angleRule('rev', '°')).toBe('1 rev = 360°');
    expect(angleRule('°', 'm')).toBeUndefined();
    expect(conversionRule('°C', 'K')).toBe('K = °C + 273.15');
    expect(conversionRule('°', 'rad')).toBe('180° = π rad');
    expect(conversionRule('cm', 'm')).toBeUndefined();
  });

  it('writes a conversion line', () => {
    expect(angleConversionLine(45, '°', 'rad')).toBe('45° × π ÷ 180 = 0.7854 rad');
    expect(angleConversionLine(Math.PI / 4, 'rad', '°')).toBe('0.7854 rad × 180 ÷ π = 45°');
    expect(angleConversionLine(50, 'grad', '°')).toBe('50 grad × 360 ÷ 400 = 45°');
    expect(angleConversionLine(1.5, '°', '′')).toBe('1.5° × 60 = 90′');
    expect(angleConversionLine(90, '′', '°')).toBe('90′ ÷ 60 = 1.5°');
  });
});
