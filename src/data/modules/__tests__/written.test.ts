import { operationCount, simplifyChain } from '../simplify';
import {
  autoWritten,
  columnAdd,
  columnMultiply,
  columnSubtract,
  decimalColumns,
  longDivision,
  partialQuotients,
  standardMultiply,
  writtenText,
} from '../written';

const text = (w: ReturnType<typeof columnAdd>) => writtenText(w!).join('\n');

describe('written work grids', () => {
  it('adds in columns with carries above', () => {
    const w = columnAdd([38, 25])!;
    expect(w.says).toBe('38 + 25 = 63');
    expect(text(w)).toBe(['  1', '  3 8', '+ 2 5', '─────', '  6 3'].join('\n'));
    // The rule runs under the underlined cells only: the bracket's top spans the dividend.
    expect(writtenText(longDivision(74, 6)!).slice(0, 2)).toEqual(['    1 2\n    ───', '6 ) 7 4']);
    // The carry sits over the tens column, small and grey.
    expect(w.rows[0]![1]).toMatchObject({ text: '1', small: true });
  });

  it('adds several numbers and carries past the top place', () => {
    const w = columnAdd([1200, 180, 24])!;
    expect(w.says).toBe('1200 + 180 + 24 = 1404');
    expect(text(w).split('\n').slice(-1)[0]).toBe('  1 4 0 4');
    expect(columnAdd([950, 75])!.rows[0]!.map((c) => c.text)).toEqual(['', '1', '1', '', '']);
  });

  it('subtracts with regrouping marks', () => {
    const w = columnSubtract(63, 25)!;
    expect(w.says).toBe('63 − 25 = 38');
    expect(w.rows[0]!.map((c) => c.text)).toEqual(['', '5', '13']);
    expect(w.rows[1]!.map((c) => c.strike ?? false)).toEqual([false, true, true]);
    expect(text(w).split('\n').slice(-1)[0]).toBe('  3  8');
  });

  it('borrows across zeros', () => {
    const w = columnSubtract(400, 137)!;
    expect(w.rows[0]!.map((c) => c.text)).toEqual(['', '3', '9', '10']);
    expect(w.says).toBe('400 − 137 = 263');
    expect(columnSubtract(25, 63)).toBeUndefined();
  });

  it('multiplies by partial products, ones first, with the fact beside each', () => {
    const w = columnMultiply(43, 6)!;
    expect(w.says).toBe('43 × 6 = 258');
    const notes = w.rows.flatMap((r) => r.filter((c) => c.wide).map((c) => c.text));
    expect(notes).toEqual(['3 × 6', '40 × 6']);
    expect(text(w)).toContain('  2 5 8');
    expect(columnMultiply(23, 14)!.rows.length).toBe(2 + 4 + 1);
    // One partial product is no column work.
    expect(columnMultiply(40, 6)).toBeUndefined();
  });

  it('sets out long division with the bracket', () => {
    const w = longDivision(743, 6)!;
    expect(w.says).toBe('743 ÷ 6 = 123 remainder 5');
    expect(w.rows[0]!.map((c) => c.text)).toEqual(['', '', '1', '2', '3']);
    expect(w.rows[1]!.map((c) => c.text)).toEqual(['6', ')', '7', '4', '3']);
    const lines = text(w).split('\n');
    expect(lines.slice(-1)[0]?.trim()).toBe('5');
    // The next digit is brought down beside each difference.
    expect(w.rows[3]!.map((c) => c.text)).toEqual(['', '', '1', '4', '']);
  });

  it('writes a zero in the quotient and keeps bringing digits down', () => {
    const w = longDivision(618, 6)!;
    expect(w.says).toBe('618 ÷ 6 = 103');
    expect(w.rows[0]!.map((c) => c.text)).toEqual(['', '', '1', '0', '3']);
    expect(text(w).split('\n').slice(-1)[0]?.trim()).toBe('0');
    expect(longDivision(5, 6)).toBeUndefined();
  });

  it('picks the layout by grade and by what the numbers need', () => {
    expect(autoWritten('2', '38 + 25')?.says).toBe('38 + 25 = 63');
    expect(autoWritten('2', '30 + 20')).toBeUndefined();
    expect(autoWritten('5', '50 + 20 + 30')).toBeUndefined();
    expect(autoWritten('5', '1,000 − 998')).toBeUndefined();
    expect(autoWritten('1', '38 + 25')).toBeUndefined();
    expect(autoWritten('4', '1,200 + 180 + 24')?.says).toBe('1200 + 180 + 24 = 1404');
    expect(autoWritten('2', '63 − 25')?.says).toBe('63 − 25 = 38');
    expect(autoWritten('2', '68 − 25')).toBeUndefined();
    expect(autoWritten('4', '43 × 6')?.says).toBe('43 × 6 = 258');
    expect(autoWritten('3', '43 × 6')).toBeUndefined();
    expect(autoWritten('4', '40 × 6')).toBeUndefined();
    expect(autoWritten('4', '738 ÷ 6')?.says).toBe('738 ÷ 6 = 123');
    expect(autoWritten('4', '743 ÷ 6')).toBeUndefined();
    expect(autoWritten('8', '38 + 25')).toBeUndefined();
    expect(autoWritten('2', '356 + 10')).toBeUndefined();
    expect(autoWritten('3', '300 + 100')).toBeUndefined();
    expect(autoWritten('3', '392 − 390')).toBeUndefined();
    expect(autoWritten('4', '360 ÷ 4')).toBeUndefined();
    expect(autoWritten('4', '744 ÷ 6')?.says).toBe('744 ÷ 6 = 124');
    expect(autoWritten('4', '7,000 ÷ 10')).toBeUndefined();
    expect(autoWritten('4', '3 × 12')).toBeUndefined();
    expect(autoWritten('4', '2 × 13')).toBeUndefined();
    expect(autoWritten(undefined, '38 + 25')).toBeUndefined();
  });
});

describe('simplify chain', () => {
  it('works out one stage per line in the order of operations', () => {
    expect(simplifyChain('√(3² + 4²)')).toEqual(['√(9 + 16)', '√25', '5']);
    expect(simplifyChain('(24 − 7 − 7) ÷ 2')).toEqual(['(17 − 7) ÷ 2', '10 ÷ 2', '5']);
    expect(simplifyChain('2 × 3 + 4 × 5')).toEqual(['6 + 20', '26']);
    expect(simplifyChain('½ × (4 + 6) × 3')).toEqual(['½ × 10 × 3', '5 × 3', '15']);
    expect(simplifyChain('100 ÷ (1 + 5 ÷ 100)^2')).toEqual([
      '100 ÷ (1 + 0.05)^2',
      '100 ÷ 1.05^2',
      '100 ÷ 1.1025',
      '90.7029',
    ]);
  });

  it('keeps single operations, words and impossible stages out', () => {
    expect(simplifyChain('3 + 4')).toEqual([]);
    expect(simplifyChain('4 tens + 5 ones')).toEqual([]);
    expect(simplifyChain('√(3² − 4²)')).toEqual([]);
    expect(simplifyChain('12 ÷ (3 − 3) + 1')).toEqual([]);
    expect(operationCount('π × 3²')).toBe(2);
    expect(simplifyChain('π × 3²')).toEqual(['π × 9', '28.2743']);
    expect(simplifyChain('5 − 8 + 2')).toEqual(['(−3) + 2', '−1']);
    // What is in brackets, under a root or up in an exponent comes first.
    expect(simplifyChain('2 × 1 × 1.5^(2 − 1)')).toEqual([
      '2 × 1 × 1.5^1',
      '2 × 1 × 1.5',
      '2 × 1.5',
      '3',
    ]);
    expect(simplifyChain('3 × (2 + 4)²')).toEqual(['3 × 6²', '3 × 36', '108']);
  });
});

describe('Grade 5 written work', () => {
  it('multiplies one row per digit of the second factor', () => {
    const w = columnMultiply(234, 56, true)!;
    expect(w.says).toBe('234 × 56 = 13104');
    const notes = w.rows.flatMap((r) => r.filter((c) => c.wide).map((c) => c.text));
    expect(notes).toEqual(['234 × 6', '234 × 50']);
    // Grade 5: the standard algorithm, two carry rows, the factors, two rows and the sum.
    expect(autoWritten('5', '234 × 56')?.rows.length).toBe(2 + 2 + 2 + 1);
    expect(autoWritten('4', '234 × 56')?.rows.length).toBe(2 + 6 + 1);
    // A one-digit multiplier still goes by the digits of the first factor.
    expect(columnMultiply(234, 6, true)!.rows.length).toBe(2 + 3 + 1);
  });

  it('writes the standard algorithm with carries and the tens row’s 0', () => {
    expect(text(standardMultiply(234, 56)!)).toBe(
      [
        '      1 2',
        '      2 2',
        '      2 3 4',
        '×       5 6',
        '───────────',
        '    1 4 0 4',
        '+ 1 1 7 0 0',
        '───────────',
        '  1 3 1 0 4',
      ].join('\n'),
    );
    // × 40 is one row: 4,327 × 4 with the 0 written first.
    expect(standardMultiply(4327, 40)!.rows.length).toBe(1 + 2 + 1);
  });

  it('divides by partial quotients in Grade 4 and with the bracket in Grade 5', () => {
    const w = partialQuotients(743, 6)!;
    expect(w.says).toBe('743 ÷ 6 = 123 remainder 5');
    const notes = w.rows.flatMap((r) => r.filter((c) => c.wide).map((c) => c.text));
    expect(notes).toEqual(['100 × 6', '20 × 6', '3 × 6', '100 + 20 + 3 = 123']);
    expect(autoWritten('4', '744 ÷ 6')?.rows[1]![1]!.text).toBe('−');
    expect(autoWritten('5', '744 ÷ 6')?.rows[1]![1]!.text).toBe(')');
    // Every digit shares evenly: no grid.
    expect(autoWritten('4', '26 ÷ 2')).toBeUndefined();
  });

  it('adds and takes away decimals with the points lined up', () => {
    const w = decimalColumns('+', [0.4, 0.35])!;
    expect(w.says).toBe('0.40 + 0.35 = 0.75');
    expect(text(w)).toBe(['  0 . 4 0', '+ 0 . 3 5', '─────────', '  0 . 7 5'].join('\n'));
    const s = decimalColumns('−', [12.5, 3.75])!;
    expect(s.says).toBe('12.50 − 3.75 = 8.75');
    // (regrouping marks like "10" widen their columns in the text dump)
    expect(text(s).split('\n').slice(-1)[0]?.replace(/\s+/g, ' ').trim()).toBe('8 . 7 5');
    expect(autoWritten('5', '2.5 + 1.25')?.says).toBe('2.50 + 1.25 = 3.75');
    expect(autoWritten('5', '3 + 1.25')?.says).toBe('3.00 + 1.25 = 4.25');
    expect(autoWritten('4', '2.5 + 1.25')).toBeUndefined();
    expect(autoWritten('5', '1.25 − 2.5')).toBeUndefined();
  });
});
