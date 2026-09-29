/**
 * Picture checks for the Grades 9–12 group D pictures (`typesHsd.ts`): what each one draws must
 * agree with the values. Called from `repIssues` in `pictures.ts`. Test-only.
 */
import { principalOf, solutionsOf, toDegrees, trig } from '@/components/module/reps/hsdKit';

import { rectangleCounts, type Poly } from '@/components/module/reps/tiles';
import { CURVE_FIELDS, PATH_FIELDS, pathAt, polarR } from '@/components/module/reps/polar';

import type { HsdSpec, TileCounts } from '../typesHsd';

/** Equal to display rounding (values are read as shown, 4 decimals). */
const near = (a: number, b: number, tol = 1e-4) =>
  Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));

export function hsdIssues(rep: HsdSpec, val: (id: string) => number | undefined): string[] {
  const out: string[] = [];
  const num = (x: string | number | undefined) =>
    x === undefined ? undefined : typeof x === 'number' ? x : val(x);
  switch (rep.kind) {
    case 'unitCircle': {
      const raw = num(rep.angle);
      if (raw === undefined) break;
      const deg = toDegrees(raw, rep.measure);
      const RAD = Math.PI / 180;
      // The point drawn is (cos θ, sin θ): on the circle, and each named value matches it.
      const [x, y] = [Math.cos(deg * RAD), Math.sin(deg * RAD)];
      if (!near(x * x + y * y, 1, 1e-9)) out.push(`point (${x}, ${y}) is off the unit circle`);
      for (const fn of ['cos', 'sin', 'tan'] as const) {
        const v = num(rep[fn]);
        if (v === undefined) continue;
        const want = trig(fn, deg);
        if (fn === 'tan' && Math.abs(Math.cos(deg * RAD)) < 1e-9) {
          out.push(`tan θ is drawn at θ = ${deg}°, where it is undefined`);
          continue;
        }
        if (!near(v, want)) out.push(`${fn} θ = ${v}, but the point gives ${want}`);
      }
      const arc = num(rep.arc);
      if (arc !== undefined && !near(arc, deg * RAD))
        out.push(`arc length ${arc} is not θ in radians (${deg * RAD})`);
      const sol = rep.solutions;
      const c = num(sol?.value);
      if (sol && c !== undefined) {
        // Every marked angle satisfies the equation; the named solutions are marked.
        const marked = sol.principal
          ? [principalOf(sol.fn, c)].filter((a): a is number => a !== undefined)
          : solutionsOf(sol.fn, c);
        for (const a of marked) {
          if (!near(trig(sol.fn, a), c, 1e-6))
            out.push(`marked angle ${a}° gives ${sol.fn} = ${trig(sol.fn, a)}, not ${c}`);
          if (!sol.principal && (a < 0 || a >= 360)) out.push(`marked angle ${a}° is off one turn`);
        }
        for (const id of sol.angles ?? []) {
          const a = val(id);
          if (a === undefined) continue;
          const d = toDegrees(a, rep.measure);
          const hit = marked.some((m) => near(((((d - m) % 360) + 540) % 360) - 180, 0, 1e-4));
          if (!hit) out.push(`solution ${id} = ${a} is not one of the marked angles`);
        }
      }
      break;
    }
    case 'algebraTiles': {
      // Counts are whole, −10 to 10, and the tiles add up to the polynomial named.
      const tileCount = (x: string | number | undefined, what: string) => {
        const v = num(x);
        if (v === undefined) return undefined;
        if (Math.abs(v - Math.round(v)) > 1e-9 || Math.abs(v) > 10)
          out.push(`${what} ${v} is not a whole number of tiles from −10 to 10`);
        return v;
      };
      const poly = (t: TileCounts | undefined, what: string): Poly | undefined => {
        if (!t) return undefined;
        const [a, b, c] = [
          tileCount(t.x2 ?? 0, `${what} x² tiles`),
          tileCount(t.x ?? 0, `${what} x tiles`),
          tileCount(t.unit ?? 0, `${what} unit tiles`),
        ];
        return a === undefined || b === undefined || c === undefined
          ? undefined
          : { x2: a, x: b, unit: c };
      };
      const same = (p: Poly, q: Poly, what: string) => {
        if (!near(p.x2, q.x2) || !near(p.x, q.x) || !near(p.unit, q.unit))
          out.push(`${what}: the tiles make ${JSON.stringify(q)}, not ${JSON.stringify(p)}`);
      };
      switch (rep.mode) {
        case 'collect': {
          const a = poly(rep.tiles, 'first');
          const b = poly(rep.plus, 'second');
          const s = rep.sum
            ? [num(rep.sum.x2 ?? 0), num(rep.sum.x ?? 0), num(rep.sum.unit ?? 0)]
            : [];
          if (a && s.length && s.every((x) => x !== undefined)) {
            const tiles = {
              x2: a.x2 + (b?.x2 ?? 0),
              x: a.x + (b?.x ?? 0),
              unit: a.unit + (b?.unit ?? 0),
            };
            same({ x2: s[0]!, x: s[1]!, unit: s[2]! }, tiles, 'sum');
          }
          break;
        }
        case 'rectangle': {
          const f = rep.factors;
          const [p, q, r, s] = [
            tileCount(f.p, 'p'),
            tileCount(f.q, 'q'),
            tileCount(f.r, 'r'),
            tileCount(f.s, 's'),
          ];
          if ([p, q, r, s].some((x) => x === undefined)) break;
          // The edges hold −10 to 10 tiles each; the rectangle holds their products (up to 100).
          const tiles = rectangleCounts(p!, q!, r!, s!);
          const t = rep.product;
          const prod = t && [t.x2 ?? 0, t.x ?? 0, t.unit ?? 0].map(num);
          if (prod && prod.every((x) => x !== undefined))
            same({ x2: prod[0]!, x: prod[1]!, unit: prod[2]! }, tiles, 'product');
          break;
        }
        case 'square': {
          const b = num(rep.b);
          const k = rep.k ? val(rep.k) : undefined;
          const m = rep.missing ? val(rep.missing) : undefined;
          if (b === undefined) break;
          if (k !== undefined && !near(k, b / 2)) out.push(`half of b is ${b / 2}, not ${k}`);
          if (m !== undefined && !near(m, (b / 2) ** 2))
            out.push(`the missing corner holds ${(b / 2) ** 2} tiles, not ${m}`);
          tileCount(b / 2, 'x tiles on each side');
          tileCount(num(rep.c ?? 0), 'unit tiles');
          break;
        }
        case 'equation': {
          const [a, b, c, d] = [
            tileCount(rep.left.x, 'left x'),
            tileCount(rep.left.unit, 'left unit'),
            tileCount(rep.right.x, 'right x'),
            tileCount(rep.right.unit, 'right unit'),
          ];
          const x = rep.solution ? val(rep.solution) : undefined;
          if ([a, b, c, d, x].some((v) => v === undefined)) break;
          if (!near(a! * x! + b!, c! * x! + d!))
            out.push(`x = ${x}: the sides are ${a! * x! + b!} and ${c! * x! + d!}`);
          break;
        }
      }
      break;
    }
    case 'vectorDiagram': {
      const RAD = Math.PI / 180;
      // Each vector drawn from its components, or from its magnitude and direction.
      const vec = (v: (typeof rep.vectors)[number]) => {
        if (v.x !== undefined || v.y !== undefined) {
          const [x, y] = [num(v.x ?? 0), num(v.y ?? 0)];
          return x === undefined || y === undefined ? undefined : { x, y };
        }
        const [m, d] = [num(v.magnitude ?? 0), num(v.direction ?? 0)];
        if (m === undefined || d === undefined) return undefined;
        if (m < 0) out.push(`${v.name} has a negative length ${m}`);
        return { x: m * Math.cos(d * RAD), y: m * Math.sin(d * RAD) };
      };
      const vs = rep.vectors.map(vec);
      const [a, b] = vs;
      const check = (id: string | undefined, want: number, what: string) => {
        const got = num(id);
        if (got !== undefined && !near(got, want, 1e-3))
          out.push(`${what} is ${got}, the arrows give ${want}`);
      };
      const heading = (x: number, y: number) => (((Math.atan2(y, x) / RAD) % 360) + 360) % 360;
      if (rep.sum && a && b) {
        const s = { x: a.x + b.x, y: a.y + b.y };
        check(rep.result?.x, s.x, 'the resultant’s x');
        check(rep.result?.y, s.y, 'the resultant’s y');
        check(rep.result?.magnitude, Math.hypot(s.x, s.y), 'the resultant’s length');
        if (Math.hypot(s.x, s.y) > 1e-9)
          check(rep.result?.direction, heading(s.x, s.y), 'the resultant’s direction');
      }
      const k = num(rep.scalar?.k);
      if (rep.scalar && a && k !== undefined) {
        check(rep.scalar.x, k * a.x, 'kv’s x');
        check(rep.scalar.y, k * a.y, 'kv’s y');
      }
      if (rep.angle && a && b) {
        const dot = a.x * b.x + a.y * b.y;
        check(rep.angle.dot, dot, 'the dot product');
        const ma = Math.hypot(a.x, a.y);
        const mb = Math.hypot(b.x, b.y);
        if (ma > 1e-9 && mb > 1e-9)
          check(
            rep.angle.value,
            Math.acos(Math.max(-1, Math.min(1, dot / (ma * mb)))) / RAD,
            'the angle between',
          );
      }
      break;
    }
    case 'complexPlane': {
      const RAD = Math.PI / 180;
      // z from its parts or its polar form; the answer, modulus and argument match it.
      let z: { a: number; b: number } | undefined;
      if ('modulus' in rep.z) {
        const [r, t] = [num(rep.z.modulus), num(rep.z.argument)];
        if (r !== undefined && r < 0) out.push(`modulus ${r} is negative`);
        if (r !== undefined && t !== undefined)
          z = { a: r * Math.cos(t * RAD), b: r * Math.sin(t * RAD) };
      } else {
        const [a, b] = [num(rep.z.re), num(rep.z.im)];
        if (a !== undefined && b !== undefined) z = { a, b };
      }
      if (!z) break;
      const check = (id: string | undefined, want: number, what: string) => {
        const got = num(id);
        if (got !== undefined && !near(got, want, 1e-3))
          out.push(`${what} is ${got}, the picture gives ${want}`);
      };
      check(rep.modulus, Math.hypot(z.a, z.b), '|z|');
      if (Math.hypot(z.a, z.b) > 1e-9)
        check(rep.argument, (((Math.atan2(z.b, z.a) / RAD) % 360) + 360) % 360, 'arg z');
      const [c, d] = [num(rep.w?.re), num(rep.w?.im)];
      if (rep.w && c !== undefined && d !== undefined) {
        const op = rep.op ?? 'sum';
        const res =
          op === 'sum'
            ? { a: z.a + c, b: z.b + d }
            : op === 'difference'
              ? { a: z.a - c, b: z.b - d }
              : { a: z.a * c - z.b * d, b: z.a * d + z.b * c };
        check(rep.result?.re, res.a, `the ${op}'s real part`);
        check(rep.result?.im, res.b, `the ${op}'s imaginary part`);
      }
      break;
    }
    case 'polarGrid': {
      const RAD = Math.PI / 180;
      const read = (o: object, fields: string[]) => {
        const v: Record<string, number> = {};
        for (const k of fields) {
          const x = (o as Record<string, number | string | undefined>)[k];
          if (x === undefined) continue;
          const n = num(x);
          if (n === undefined) return undefined;
          v[k] = n;
        }
        return v;
      };
      const check = (id: string | undefined, want: number, what: string) => {
        const got = num(id);
        if (got !== undefined && !near(got, want, 1e-3))
          out.push(`${what} is ${got}, the picture gives ${want}`);
      };
      const [r, t] = [num(rep.point?.r), num(rep.point?.theta)];
      if (rep.point && r !== undefined && t !== undefined) {
        // The point sits on the curve, and x, y are r cos θ and r sin θ.
        const cv = rep.curve ? read(rep.curve, CURVE_FIELDS[rep.curve.shape]) : undefined;
        if (rep.curve && cv)
          check(rep.point.r as string, polarR(rep.curve, cv, t), 'r on the curve');
        check(rep.point.x, r * Math.cos(t * RAD), 'x');
        check(rep.point.y, r * Math.sin(t * RAD), 'y');
      }
      const p = rep.parametric;
      const pt = num(p?.t);
      if (p && pt !== undefined) {
        const pv = read(p, PATH_FIELDS[p.family]);
        if (pv) {
          const at = pathAt(p, pv, pt);
          check(p.x, at.x, 'x(t)');
          check(p.y, at.y, 'y(t)');
        }
      }
      break;
    }
  }
  return out;
}
