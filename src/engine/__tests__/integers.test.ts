import { formatNumber, parseNumber, parseValue } from '../format';
import * as z from '../integers';

describe('integer functions', () => {
  it('floor, ceiling and mod, signs as the courses write them', () => {
    expect(z.floorDiv(77, 64)).toBe(1);
    expect(z.floorDiv(-7, 4)).toBe(-2);
    expect(z.ceilDiv(10000, 4096)).toBe(3);
    expect(z.ceilDiv(-7, 4)).toBe(-1);
    expect(z.ceilDiv(8, 4)).toBe(2);
    expect(z.mod(77, 64)).toBe(13);
    expect(z.mod(-7, 4)).toBe(1);
    expect(z.mod(9, 8)).toBe(1);
    expect(z.floorDiv(3, 0)).toBeUndefined();
    // (past 2⁵³ the division is still exact)
    expect(z.floorDiv(2 ** 60, 3)).toBe(Number(2n ** 60n / 3n));
  });
  it('round, log₂ and its floor and ceiling', () => {
    expect(z.roundHalfAway(2.5)).toBe(3);
    expect(z.roundHalfAway(-2.5)).toBe(-3);
    expect(z.roundTo(37, 5)).toBe(35);
    expect(z.log2Exact(64)).toBe(6);
    expect(z.log2Exact(48)).toBeUndefined();
    expect(z.ceilLog2(5)).toBe(3);
    expect(z.ceilLog2(8)).toBe(3);
    expect(z.ceilLog2(1)).toBe(0);
    expect(z.ceilLog2(101)).toBe(7);
    expect(z.floorLog2(1000)).toBe(9);
    expect(z.floorLog2(1024)).toBe(10);
    expect(z.ceilLog2(2 ** 40 + 1)).toBe(41);
  });
  it('gcd, lcm, min and sort', () => {
    expect(z.gcd(84, 36)).toBe(12);
    expect(z.gcd(12, 18, 27)).toBe(3);
    expect(z.lcm(4, 6)).toBe(12);
    expect(z.lcm(4, 6, 10)).toBe(60);
    expect(z.sortedOf([5, 2, 9])).toEqual([2, 5, 9]);
  });
  it('writes the lines a student writes', () => {
    expect(z.floorLine(77, 64)).toBe('⌊77 ÷ 64⌋ = ⌊1.2031⌋ = 1');
    expect(z.floorLine(128, 64)).toBe('⌊128 ÷ 64⌋ = 2');
    expect(z.ceilLine(10000, 4096)).toBe('⌈10,000 ÷ 4,096⌉ = ⌈2.4414⌉ = 3');
    // (a quotient that would show as a whole number is not shown: 2 − 10⁻⁶ is not "⌈2⌉")
    expect(z.ceilLine(1999999, 1000000)).toBe('⌈1,999,999 ÷ 1,000,000⌉ = 2');
    expect(z.modLine(77, 64)).toBe('77 mod 64 = 77 − 64 × ⌊77 ÷ 64⌋ = 77 − 64 × 1 = 13');
    expect(z.modLine(-7, 4)).toBe('−7 mod 4 = −7 − 4 × ⌊−7 ÷ 4⌋ = −7 − 4 × (−2) = 1');
    expect(z.log2Line(64)).toBe('log₂ 64 = 6, since 2⁶ = 64');
    expect(z.ceilLog2Line(5)).toBe('⌈log₂ 5⌉ = 3, since 2² = 4 < 5 ≤ 8 = 2³');
    expect(z.floorLog2Line(1000)).toBe('⌊log₂ 1,000⌋ = 9, since 2⁹ = 512 ≤ 1,000 < 1,024 = 2¹⁰');
    expect(z.gcdLines(84, 36)).toEqual([
      'gcd(84, 36): 84 = 2 × 36 + 12',
      'gcd(36, 12): 36 = 3 × 12 + 0',
      'gcd(84, 36) = 12',
    ]);
    expect(z.lcmLine(4, 6)).toBe('lcm(4, 6) = 4 × 6 ÷ gcd(4, 6) = 24 ÷ 2 = 12');
    expect(z.minLine([12, 7, 9])).toBe('min(12, 7, 9) = 7');
    expect(z.sortLine([5, 2, 9])).toBe('sort(5, 2, 9) = (2, 5, 9)');
    expect(z.roundLine(37, 5)).toBe('round(37 ÷ 5) × 5 = round(7.4) × 5 = 35');
  });
});

describe('exact integers past 2⁵³', () => {
  it('counts exactly', () => {
    expect(z.bigPow(2, 64)).toBe(18446744073709551616n);
    expect(z.bigFactorial(25)).toBe(15511210043330985984000000n);
    expect(z.bigChoose(60, 30)).toBe(118264581564861424n);
    expect(z.bigPerm(10, 3)).toBe(720n);
    expect(z.groupDigits(2n ** 64n)).toBe('18,446,744,073,709,551,616');
    expect(z.groupDigits(-1234)).toBe('−1,234');
  });
  it('lines', () => {
    expect(z.powLine(2, 64)).toBe('2⁶⁴ = 18,446,744,073,709,551,616');
    expect(z.chooseLine(60, 30)).toBe('C(60, 30) = 60! ÷ (30! × 30!) = 118,264,581,564,861,424');
    expect(z.permLine(10, 3)).toBe('P(10, 3) = 10! ÷ 7! = 10 × 9 × 8 = 720');
    expect(z.factorialLine(6)).toBe('6! = 6 × 5 × 4 × 3 × 2 × 1 = 720');
    expect(z.stirlingLine(100)).toBe('ln(100!) ≈ 100 ln 100 − 100 + ½ ln(2π × 100) = 363.7385');
  });
  it('shows a value past 2⁵³ by its exact digits, only when they are its value', () => {
    const exact = z.exactInteger('C', (v) => z.bigChoose(v.n!, v.r!));
    const C = Number(z.bigChoose(60, 30));
    expect(exact({ n: 60, r: 30, C })).toBe('118,264,581,564,861,424');
    expect(exact({ n: 60, r: 30, C: 5 })).toBeUndefined();
    expect(formatNumber(C, { exact, values: { n: 60, r: 30, C } })).toBe('118,264,581,564,861,424');
    // (without it, scientific notation)
    expect(formatNumber(C)).toBe('1.1826 × 10¹⁷');
  });
});

describe('bases', () => {
  it('writes and reads a number in a base', () => {
    expect(z.baseText(45, 2)).toBe('101101₂');
    expect(z.baseText(45, 2, { bits: 8 })).toBe('00101101₂');
    expect(z.baseText(45, 2, { bits: 8, group: true })).toBe('0010 1101₂');
    expect(z.baseText(45, 16)).toBe('2D₁₆');
    expect(z.baseText(45, 16, { prefix: true, bits: 8 })).toBe('0x2D');
    expect(z.baseText(0x00400020, 16, { prefix: true, bits: 32 })).toBe('0x00400020');
    expect(z.baseText(45, 8)).toBe('55₈');
    for (const t of ['101101₂', '0b101101', '0x2D', '2D₁₆', '55₈', '0o55', '0010 1101₂', '0x2d'])
      expect(z.parseBased(t)).toBe(45n);
    expect(z.parseBased('101101', 2)).toBe(45n);
    expect(z.parseBased('2D')).toBeUndefined();
    expect(z.parseBased('102₂')).toBeUndefined();
  });
  it('repeated division, place value and grouping lines', () => {
    expect(z.divisionLines(45, 2)).toEqual([
      '45 ÷ 2 = 22 remainder 1',
      '22 ÷ 2 = 11 remainder 0',
      '11 ÷ 2 = 5 remainder 1',
      '5 ÷ 2 = 2 remainder 1',
      '2 ÷ 2 = 1 remainder 0',
      '1 ÷ 2 = 0 remainder 1',
      '45 = 101101₂',
    ]);
    expect(z.divisionLines(45, 16)).toEqual([
      '45 ÷ 16 = 2 remainder 13',
      '2 ÷ 16 = 0 remainder 2',
      'Digits past 9: 13 is D',
      '45 = 2D₁₆',
    ]);
    expect(z.placeValueLine(45, 2)).toBe(
      '101101₂ = 1 × 2⁵ + 0 × 2⁴ + 1 × 2³ + 1 × 2² + 0 × 2¹ + 1 × 2⁰ = 32 + 8 + 4 + 1 = 45',
    );
    expect(z.placeValueLine(45, 16)).toBe('2D₁₆ = 2 × 16¹ + 13 × 16⁰ = 32 + 13 = 45');
    expect(z.groupLines(45, 8, 16)).toEqual(['0010₂ = 2; 1101₂ = 13 = D₁₆', '0010 1101₂ = 2D₁₆']);
  });
  it('BCD', () => {
    expect(z.bcdText(59)).toBe('0101 1001');
    expect(z.bcdLines(59)).toEqual(['5 = 0101₂; 9 = 1001₂', '59 in BCD: 0101 1001']);
  });
  it("two's complement, ranges and wrapping", () => {
    expect(z.twosComplement(45, 8)).toBe(211);
    expect(z.twosComplement(128, 8)).toBe(128);
    expect(z.twosComplement(129, 8)).toBeUndefined();
    expect(z.signedValue(211, 8)).toBe(-45);
    expect(z.twosLines(45, 8)).toEqual([
      '45 = 00101101₂',
      'Invert every bit: 11010010₂',
      'Add 1: 11010010₂ + 1 = 11010011₂ = D3₁₆',
    ]);
    expect(z.signedLine(211, 8)).toBe(
      'Signed: 11010011₂ = −2⁷ + 2⁶ + 2⁴ + 2¹ + 2⁰ = −128 + 64 + 16 + 2 + 1 = −45',
    );
    expect(z.rangeLines(8)).toEqual([
      '8-bit unsigned, largest: 2⁸ − 1 = 255',
      '8-bit signed, least: −2⁷ = −128',
      '8-bit signed, largest: 2⁷ − 1 = 127',
    ]);
    expect(z.wrapLines(100, 50, 8)).toEqual([
      '8-bit sum: 100 + 50 = 150',
      '150 > 127, so 150 − 2⁸ = −106',
    ]);
  });
  it('bit fields', () => {
    // addi x10, x6, 10 is 0x00A30513: funct3 (bits 14–12) is 0, rd (11–7) is 10.
    expect(z.bitField(0x00a30513, 14, 12)).toBe(0);
    expect(z.bitField(0x00a30513, 11, 7)).toBe(10);
    expect(z.bitFieldLine(0x00a30513, 11, 7, { bits: 32 })).toBe(
      'Bits 11–7: ⌊0x00A30513 ÷ 2⁷⌋ mod 2⁵ = 83,466 mod 32 = 10',
    );
  });
  it('IPv4 quads, masks and subnets', () => {
    const a = z.parseIPv4('192.168.10.77')!;
    expect(z.ipv4Text(a)).toBe('192.168.10.77');
    expect(z.parseIPv4('192.168.10.256')).toBeUndefined();
    expect(z.ipv4Text(z.prefixMask(26))).toBe('255.255.255.192');
    expect(z.ipv4Text(z.networkOf(a, 26))).toBe('192.168.10.64');
    expect(z.ipv4Text(z.broadcastOf(a, 26))).toBe('192.168.10.127');
    expect(z.hostsOf(26)).toBe(62);
    expect(z.subnetLines(a, 26)).toEqual([
      'Mask /26: 11111111.11111111.11111111.11000000₂ = 255.255.255.192',
      'Block: 2^(32 − 26) = 2⁶ = 64',
      'Network: 192.168.10.77 AND 255.255.255.192 = 192.168.10.64',
      'Broadcast: 192.168.10.64 + 64 − 1 = 192.168.10.127',
      'Hosts: 64 − 2 = 62',
    ]);
  });
});

describe('values shown and typed in a base', () => {
  it('formatNumber shows a value in its form', () => {
    expect(formatNumber(45, { base: { radix: 2 } })).toBe('101101₂');
    expect(formatNumber(211, { base: { radix: 2, bits: 'n' }, values: { n: 8 } })).toBe(
      '11010011₂',
    );
    expect(formatNumber(45, { base: { radix: 2, bits: 'n' }, values: { n: 8 } })).toBe('00101101₂');
    expect(formatNumber(45, { base: { radix: 16, prefix: true } })).toBe('0x2D');
    expect(formatNumber(z.parseIPv4('10.0.0.1')!, { base: 'ipv4' })).toBe('10.0.0.1');
    expect(formatNumber(26, { base: 'prefix' })).toBe('/26');
    // (not a whole number from 0: shown as usual)
    expect(formatNumber(-3, { base: { radix: 2 } })).toBe('−3');
  });
  it('boxes take digits in their base', () => {
    expect(parseValue('101101', { base: { radix: 2 } })).toBe(45);
    expect(parseValue('0x2D', { base: { radix: 2 } })).toBe(45);
    expect(parseValue('2d', { base: { radix: 16 } })).toBe(45);
    expect(parseValue('102', { base: { radix: 2 } })).toBe('invalid');
    expect(parseValue('192.168.10.77', { base: 'ipv4' })).toBe(3232238157);
    expect(parseValue('/26', { base: 'prefix' })).toBe(26);
    expect(parseValue('', { base: 'prefix' })).toBeUndefined();
    expect(parseValue('12', {})).toBe(12);
  });
  it('parseNumber reads an explicit base or quad, and nothing it read before changes', () => {
    expect(parseNumber('101101₂')).toBe(45);
    expect(parseNumber('0x2D')).toBe(45);
    expect(parseNumber('192.168.10.77')).toBe(3232238157);
    expect(parseNumber('1.5')).toBe(1.5);
    expect(parseNumber('1,000')).toBe(1000);
    expect(parseNumber('1e3')).toBe(1000);
    expect(parseNumber('2 3/8')).toBe(2.375);
    expect(parseNumber('abc')).toBe('invalid');
  });
});
