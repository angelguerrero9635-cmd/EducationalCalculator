/**
 * H106 (round 3, group B): `functionGraph` with `unitsOf`, the model for the Units rule. The
 * family's parameters are read once in the formula's units (where the page's relations hold) and
 * converted to the axes' shown units: with fₓ and f_y the formula units per shown unit of the x
 * and y values, the graph drawn is Y(X) = f(fₓ·X) ÷ f_y, written back as the same family with
 * converted parameters (h(t) = −4.9t² + 19.6t + 2 in m and s is h(t) = −16.08t² + 64.3t + 6.56 in
 * ft). Each parameter is replaced by a key the picture reads through `value`; `source` keeps the
 * field it came from (whether it is typed) and `scale` how a drag on it converts back. Pure, so
 * the picture and the harness convert the same way.
 */
import type {
  FunctionFamily,
  FunctionGraphSpec,
  NumOrVar,
  Piece,
} from '@/data/modules/typesFunctionGraph';

/** The prefix of a converted field's key (never a variable id). */
export const UNIT_KEY = '§u:';

export interface UnitConversion {
  /** The spec with each family field a key (the other fields as given, the axes with units). */
  spec: FunctionGraphSpec;
  /** A key's value in the shown units. */
  value: Map<string, number>;
  /** The field a key replaces: a variable id or a number. */
  source: Map<string, NumOrVar>;
  /** shown = formula × scale, for a field converted by a factor (a drag converts back). */
  scale: Map<string, number>;
}

type Num = (v: NumOrVar | undefined, fallback: number) => number;
type Put = (
  path: string,
  field: NumOrVar | undefined,
  fallback: number,
  by: number | ((x: number) => number),
) => string;

/** The x positions a spec names beside its family (read in the x axis's shown unit). */
export function unitPositionIds(spec: FunctionGraphSpec): string[] {
  const shade = typeof spec.shade === 'object' ? [spec.shade.from, spec.shade.to] : [];
  return [
    spec.at?.x,
    spec.secant?.x,
    spec.secant?.h,
    spec.limit?.x,
    spec.crossing?.x,
    ...shade,
  ].filter((v): v is string => typeof v === 'string');
}

/** One family converted to the shown units, each field through `put`. */
function convert(fam: FunctionFamily, num: Num, fx: number, fy: number, put: Put): FunctionFamily {
  const X = 1 / fx;
  const Y = 1 / fy;
  switch (fam.family) {
    case 'linear':
      return { ...fam, m: put('m', fam.m, 1, fx / fy), b: put('b', fam.b, 0, Y) };
    case 'absolute':
      return {
        ...fam,
        a: put('a', fam.a, 1, fx / fy),
        h: put('h', fam.h, 0, X),
        k: put('k', fam.k, 0, Y),
      };
    case 'quadratic':
      if (fam.form === 'standard')
        return {
          ...fam,
          a: put('a', fam.a, 1, (fx * fx) / fy),
          b: put('b', fam.b, 0, fx / fy),
          c: put('c', fam.c, 0, Y),
        };
      if (fam.form === 'vertex')
        return {
          ...fam,
          a: put('a', fam.a, 1, (fx * fx) / fy),
          h: put('h', fam.h, 0, X),
          k: put('k', fam.k, 0, Y),
        };
      return {
        ...fam,
        a: put('a', fam.a, 1, (fx * fx) / fy),
        p: put('p', fam.p, 0, X),
        q: put('q', fam.q, 0, X),
      };
    case 'exponential':
      return 'b' in fam
        ? {
            ...fam,
            a: put('a', fam.a, 1, Y),
            b: put('b', fam.b, 2, (b) => b ** fx),
            h: put('h', fam.h, 0, X),
            k: put('k', fam.k, 0, Y),
          }
        : {
            ...fam,
            a: put('a', fam.a, 1, Y),
            r: put('r', fam.r, 1, fx),
            h: put('h', fam.h, 0, X),
            k: put('k', fam.k, 0, Y),
          };
    case 'logistic':
      return {
        ...fam,
        K: put('K', fam.K, 1, Y),
        start: put('start', fam.start, 1, Y),
        r: put('r', fam.r, 1, fx),
      };
    case 'log': {
      // a·log_b(fₓX − h) + k = a·log_b(X − h/fₓ) + a·log_b(fₓ) + k.
      const a = num(fam.a, 1);
      const lnB = fam.b === undefined ? 1 : Math.log(num(fam.b, 10));
      return {
        ...fam,
        a: put('a', fam.a, 1, Y),
        h: put('h', fam.h, 0, X),
        k: put('k', fam.k, 0, (k) => (k + (a * Math.log(fx)) / lnB) * Y),
      };
    }
    case 'root':
      return {
        ...fam,
        a: put('a', fam.a, 1, fx ** (1 / fam.index) / fy),
        h: put('h', fam.h, 0, X),
        k: put('k', fam.k, 0, Y),
      };
    case 'polynomial': {
      if ('coefficients' in fam) {
        const n = fam.coefficients.length - 1;
        return {
          ...fam,
          coefficients: fam.coefficients.map((c, i) =>
            put(`coefficients.${i}`, c, 0, fx ** (n - i) / fy),
          ),
        };
      }
      const degree = fam.zeros.reduce((s, z) => s + num(z.times, 1), 0);
      return {
        ...fam,
        a: put('a', fam.a, 1, fx ** degree / fy),
        zeros: fam.zeros.map((z, i) => ({ ...z, x: put(`zeros.${i}.x`, z.x, 0, X) })),
      };
    }
    case 'rational':
      if ('top' in fam) throw new Error('a rational by its top is not converted'); // H106
      if ('p' in fam)
        return {
          ...fam,
          p: put('p', fam.p, 1, fx / fy),
          q: put('q', fam.q, 0, Y),
          r: put('r', fam.r, 1, fx),
        };
      return {
        ...fam,
        a: put('a', fam.a, 1, fx ** (fam.zeros.length - fam.poles.length) / fy),
        zeros: fam.zeros.map((z, i) => put(`zeros.${i}`, z, 0, X)),
        poles: fam.poles.map((p, i) => put(`poles.${i}`, p, 0, X)),
        k: put('k', fam.k, 0, Y),
      };
    case 'piecewise':
      return {
        ...fam,
        pieces: fam.pieces.map((p, i): Piece => ({
          ...p,
          f: convert(p.f, num, fx, fy, (path, field, d, by) =>
            put(`pieces.${i}.f.${path}`, field, d, by),
          ) as Piece['f'],
          ...(p.from === undefined ? {} : { from: put(`pieces.${i}.from`, p.from, 0, X) }),
          ...(p.to === undefined ? {} : { to: put(`pieces.${i}.to`, p.to, 0, X) }),
        })),
      };
    case 'sin':
    case 'cos':
    case 'tan':
      return {
        ...fam,
        a: put('a', fam.a, 1, Y),
        b: put('b', fam.b, 1, fx),
        h: put('h', fam.h, 0, X),
        k: put('k', fam.k, 0, Y),
      };
    case 'arcsin':
    case 'arccos':
    case 'arctan':
      return { ...fam, a: put('a', fam.a, 1, Y), k: put('k', fam.k, 0, Y) };
    case 'power': {
      if (!('p' in fam)) return fam; // HC10: a real exponent (its pages pin their units)
      // a·(fₓX − h)^(p/q) = a·fₓ^(p/q)·(X − h/fₓ)^(p/q).
      const e = num(fam.p, 1) / num(fam.q, 1);
      return {
        ...fam,
        a: put('a', fam.a, 1, fx ** e / fy),
        h: put('h', fam.h, 0, X),
        k: put('k', fam.k, 0, Y),
      };
    }
    default:
      return fam;
  }
}

/**
 * The spec converted to the shown units. `num` reads a field in the formula's units; `fx` and
 * `fy` are the formula units per shown unit of `unitsOf.x` and `.y` (1 when left out); `units`
 * names the shown units, added to the axis names.
 */
export function toShownUnits(
  spec: FunctionGraphSpec,
  num: Num,
  fx: number,
  fy: number,
  units: { x?: string; y?: string } = {},
): UnitConversion {
  const value = new Map<string, number>();
  const source = new Map<string, NumOrVar>();
  const scale = new Map<string, number>();
  const putFor =
    (prefix: string): Put =>
    (path, field, fallback, by) => {
      const key = `${UNIT_KEY}${prefix}${path}`;
      const x = num(field, fallback);
      value.set(key, typeof by === 'number' ? x * by : by(x));
      source.set(key, field ?? fallback);
      if (typeof by === 'number') scale.set(key, by);
      return key;
    };
  const main = convert(spec, num, fx, fy, putFor(''));
  const other = spec.other
    ? { ...convert(spec.other, num, fx, fy, putFor('other.')), name: spec.other.name }
    : undefined;
  const withUnit = (name: string | undefined, unit: string | undefined) =>
    name && unit ? `${name} (${unit})` : name;
  const axes = spec.axes
    ? { x: withUnit(spec.axes.x, units.x), y: withUnit(spec.axes.y, units.y) }
    : undefined;
  return {
    spec: {
      ...spec,
      ...main,
      ...(other ? { other } : {}),
      ...(axes ? { axes } : {}),
    } as FunctionGraphSpec,
    value,
    source,
    scale,
  };
}
