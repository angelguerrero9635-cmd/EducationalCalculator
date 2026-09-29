/**
 * The equation input's template parser (equationTemplate.ts): the K–8 shapes stay as they were,
 * and each Grade 9–12 part (docs/EQUATION_INPUTS.md; tracker H81–H88) parses to its piece.
 */
import { TESTED_MODULES } from '@/data/modules';

import { equationIds, equationParts, type EquationPart } from '../equationTemplate';

const box = (id: string): EquationPart => ({ kind: 'box', id });
const text = (t: string, tight: { before?: boolean; after?: boolean } = {}): EquationPart => ({
  kind: 'text',
  text: t,
  ...(tight.before ? { tightBefore: true } : {}),
  ...(tight.after ? { tightAfter: true } : {}),
});

describe('K–8 templates', () => {
  it('reads boxes, fractions, mixed numbers and powers', () => {
    expect(equationParts('{a}/{b} + {c}/{d} = {s}/{m}')).toEqual([
      { kind: 'fraction', top: { id: 'a' }, bottom: { id: 'b' } },
      text('+'),
      { kind: 'fraction', top: { id: 'c' }, bottom: { id: 'd' } },
      text('='),
      { kind: 'fraction', top: { id: 's' }, bottom: { id: 'm' } },
    ]);
    expect(equationParts('{w} {r}/{b} = {s}/{b}')[0]).toEqual({
      kind: 'fraction',
      top: { id: 'r' },
      bottom: { id: 'b' },
      whole: 'w',
    });
    expect(equationParts('{n} ÷ 1/{b} = {q}')[2]).toEqual({
      kind: 'fraction',
      top: { text: '1' },
      bottom: { id: 'b' },
    });
    expect(equationParts('{n} × 10^{k} = {p}')).toEqual([
      box('n'),
      text('×'),
      { kind: 'power', base: { text: '10' }, exponent: { id: 'k' } },
      text('='),
      box('p'),
    ]);
    expect(equationParts('{a} + {b} × {c}^{e} = {v}')[4]).toEqual({
      kind: 'power',
      base: { id: 'c' },
      exponent: { id: 'e' },
    });
  });

  it('writes text against a box touching it', () => {
    expect(equationParts('{p}(x + {q}) = {r}')).toEqual([
      box('p'),
      text('(x', { before: true }),
      text('+'),
      box('q'),
      text(')', { before: true }),
      text('='),
      box('r'),
    ]);
    expect(equationParts('{a}° + {b}° = 180°').slice(0, 2)).toEqual([
      box('a'),
      text('°', { before: true }),
    ]);
  });

  it('keeps units with a slash as text', () => {
    expect(equationParts('{m} g ÷ {M} g/mol = {n} mol')).toEqual([
      box('m'),
      text('g'),
      text('÷'),
      box('M'),
      text('g/mol'),
      text('='),
      box('n'),
      text('mol'),
    ]);
  });
});

describe('H81: expression slots', () => {
  it('reads a group in braces as a fraction’s top or bottom', () => {
    expect(equationParts('z = {{x} − {m}}/{s}')).toEqual([
      text('z'),
      text('='),
      {
        kind: 'fraction',
        top: { parts: [box('x'), text('−'), box('m')] },
        bottom: { id: 's' },
      },
    ]);
    expect(equationParts('{a}/{sin({A}°)}')).toEqual([
      {
        kind: 'fraction',
        top: { id: 'a' },
        bottom: { parts: [text('sin(', { after: true }), box('A'), text('°)', { before: true })] },
      },
    ]);
    expect(equationParts('{a} km × {1000 m}/{1 km} = {b} m')[3]).toEqual({
      kind: 'fraction',
      top: { parts: [text('1000'), text('m')] },
      bottom: { parts: [text('1'), text('km')] },
    });
  });

  it('reads an expression, a product or letters as an exponent', () => {
    expect(equationParts('{a1} × {r}^{n − 1}')[2]).toEqual({
      kind: 'power',
      base: { id: 'r' },
      exponent: { parts: [text('n'), text('−'), text('1')] },
    });
    expect(equationParts('A = {P}e^{{r}{t}}')).toEqual([
      text('A'),
      text('='),
      box('P'),
      { kind: 'power', base: { text: 'e' }, exponent: { parts: [box('r'), box('t')] } },
    ]);
    expect(equationParts('{a} × {b}^x = {c}')[2]).toEqual({
      kind: 'power',
      base: { id: 'b' },
      exponent: { text: 'x' },
    });
    expect(equationParts('[H⁺] = 10^{−{p}}')[2]).toEqual({
      kind: 'power',
      base: { text: '10' },
      exponent: { parts: [text('−', { after: true }), box('p')] },
    });
  });

  it('binds an exponent before the bar', () => {
    const [first] = equationParts('{(x − {h})²}/{a}^2 = 1');
    expect(first).toEqual({
      kind: 'fraction',
      top: { parts: [text('(x'), text('−'), box('h'), text(')²', { before: true })] },
      bottom: {
        parts: [{ kind: 'power', base: { id: 'a' }, exponent: { text: '2' } }],
      },
    });
  });

  it('lists every box, in order', () => {
    expect(equationIds('{a}/{sin({A}°)} = {b}/{sin({B}°)}')).toEqual(['a', 'A', 'b', 'B']);
    expect(equationIds('A = {P}e^{{r}{t}}')).toEqual(['P', 'r', 't']);
  });
});

describe('every page’s equation', () => {
  it('lists each box in its template', () => {
    for (const m of TESTED_MODULES) {
      if (!m.equation) continue;
      const written = [...m.equation.matchAll(/\{(\w+)(?::\w+)?\}/g)].map((x) => x[1]);
      expect([m.id, [...new Set(equationIds(m.equation))].sort()]).toEqual([
        m.id,
        [...new Set(written)].sort(),
      ]);
    }
  });
});
