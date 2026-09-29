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

describe('H82: an exponent on a bracket', () => {
  it('raises a bracketed group, brackets drawn, written against the box before it', () => {
    expect(equationParts('{A} = {P}(1 + {r})^{t}')).toEqual([
      box('A'),
      text('='),
      box('P'),
      {
        kind: 'power',
        base: {
          parts: [text('(1', { after: false }), text('+'), box('r'), text(')', { before: true })],
        },
        exponent: { id: 't' },
        tightBefore: true,
      },
    ]);
    expect(equationParts('({a} + {b}i)^2 = {p} + {q}i')[0]).toEqual({
      kind: 'power',
      base: {
        parts: [
          text('(', { after: true }),
          box('a'),
          text('+'),
          box('b'),
          text('i)', { before: true }),
        ],
      },
      exponent: { text: '2' },
    });
  });

  it('nests a power in the bracket', () => {
    expect(equationParts('({b}^{m})^{n} = {b}^{k}')[0]).toEqual({
      kind: 'power',
      base: {
        parts: [
          text('(', { after: true }),
          { kind: 'power', base: { id: 'b' }, exponent: { id: 'm' } },
          text(')', { before: true }),
        ],
      },
      exponent: { id: 'n' },
    });
    expect(equationIds('({b}^{m})^{n} = {b}^{k} = {P}')).toEqual(['b', 'm', 'n', 'b', 'k', 'P']);
  });

  it('leaves brackets without a power as text', () => {
    expect(equationParts('{p}(x + {q}) = {r}')[1]).toEqual(text('(x', { before: true }));
    expect(equationParts('({a} × 10^{n}) × ({c} × 10^{k})')[0]).toEqual(text('(', { after: true }));
  });
});

describe('H83: radicals', () => {
  const root = (body: object, index?: string, tight = false): EquationPart =>
    ({
      kind: 'root',
      ...(index ? { index } : {}),
      body,
      ...(tight ? { tightBefore: true } : {}),
    }) as EquationPart;

  it('puts the bar over a box, a number or a group, brackets dropped', () => {
    expect(equationParts('√{n} = {k}√{r}')).toEqual([
      root({ id: 'n' }),
      text('='),
      box('k'),
      root({ id: 'r' }, undefined, true),
    ]);
    expect(equationParts('{c} = {s}√2')[3]).toEqual(root({ text: '2' }, undefined, true));
    expect(equationParts('√({a}x + {b}) = {c}')[0]).toEqual(
      root({ parts: [box('a'), text('x', { before: true }), text('+'), box('b')] }),
    );
    expect(equationParts('∛{n} = {k}')[0]).toEqual(root({ id: 'n' }, '3'));
  });

  it('reads a radical as a fraction’s bottom', () => {
    expect(equationParts('{E} = {z} × {s}/√{n}')[4]).toEqual({
      kind: 'fraction',
      top: { id: 's' },
      bottom: { parts: [root({ id: 'n' })] },
    });
    expect(equationIds('{x} ± {z} × {s}/√{n}')).toEqual(['x', 'z', 's', 'n']);
  });
});

describe('H84: sign and operator boxes', () => {
  it('reads {s:sign}, {s:relation} and {o:op} as choice boxes', () => {
    expect(equationParts('{p}x + {q} {s:sign} {r}')).toEqual([
      box('p'),
      text('x', { before: true }),
      text('+'),
      box('q'),
      { kind: 'choice', id: 's', choices: 'sign' },
      box('r'),
    ]);
    expect(equationParts('{a} {o:op} {b} = {r}')[1]).toEqual({
      kind: 'choice',
      id: 'o',
      choices: 'op',
    });
    expect(equationParts('{l} {s1:relation} {a}x')[1]).toEqual({
      kind: 'choice',
      id: 's1',
      choices: 'relation',
    });
  });

  it('lists the sign’s value with the boxes', () => {
    expect(equationIds('{l} {s1:sign} {a}x + {b} {s2:sign} {r}')).toEqual([
      'l',
      's1',
      'a',
      'b',
      's2',
      'r',
    ]);
  });
});

describe('H85: subscripts and left scripts', () => {
  it('reads a subscript box or letter after letters', () => {
    expect(equationParts('log_{b}({x}) = {y}')).toEqual([
      { kind: 'sub', base: { text: 'log' }, sub: { id: 'b' } },
      text('(', { before: true, after: true }),
      box('x'),
      text(')', { before: true }),
      text('='),
      box('y'),
    ]);
    expect(equationParts('a_{n} = {a1} + (n − 1){d}')[0]).toEqual({
      kind: 'sub',
      base: { text: 'a' },
      sub: { id: 'n' },
    });
    expect(equationParts('a_n = {an}')[0]).toEqual({
      kind: 'sub',
      base: { text: 'a' },
      sub: { text: 'n' },
    });
  });

  it('stacks scripts on the left of the symbol after them', () => {
    expect(equationParts('^{A}_{Z}X → ^{A2}_{Z2}Y + ^{4}_{2}He')).toEqual([
      { kind: 'scripts', top: { id: 'A' }, bottom: { id: 'Z' } },
      text('X', { before: true }),
      text('→'),
      { kind: 'scripts', top: { id: 'A2' }, bottom: { id: 'Z2' } },
      text('Y', { before: true }),
      text('+'),
      { kind: 'scripts', top: { text: '4' }, bottom: { text: '2' } },
      text('He', { before: true }),
    ]);
    expect(equationParts('^{0}_{−1}e')[0]).toEqual({
      kind: 'scripts',
      top: { text: '0' },
      bottom: { parts: [text('−1')] },
    });
    expect(equationIds('^{A}_{Z}X → ^{A2}_{Z2}Y + ^{4}_{2}He')).toEqual(['A', 'Z', 'A2', 'Z2']);
  });
});

describe('every page’s equation', () => {
  it('lists each box in its template', () => {
    for (const m of TESTED_MODULES) {
      if (!m.equation) continue;
      const written = [...m.equation.matchAll(/\{([A-Za-z]\w*)(?::\w+)?\}/g)].map((x) => x[1]);
      expect([m.id, [...new Set(equationIds(m.equation))].sort()]).toEqual([
        m.id,
        [...new Set(written)].sort(),
      ]);
    }
  });
});
