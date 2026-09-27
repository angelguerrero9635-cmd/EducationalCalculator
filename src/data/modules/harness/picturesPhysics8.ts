/**
 * Picture checks for the Grade 8 physics and space pictures (`typesPhysics8.ts`): what each one
 * draws must agree with the values. Called from `repIssues` in `pictures.ts`. Test-only.
 */
import type { Physics8Spec } from '../typesPhysics8';

/**
 * Equal up to a unit prefix: the harness reads values in the shown units (mA, kΩ, cm), which
 * differ from the formula's by a power of ten.
 */
const near = (a: number, b: number) => {
  if (Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(a), Math.abs(b))) return true;
  if (!(a > 0 && b > 0) && !(a < 0 && b < 0)) return false;
  const k = Math.log10(a / b);
  return Math.abs(k - Math.round(k)) < 1e-4;
};

export function physics8Issues(
  rep: Physics8Spec,
  val: (id: string) => number | undefined,
): string[] {
  const out: string[] = [];
  const whole = (id: string | undefined, what: string, lo: number, hi: number) => {
    const x = id ? val(id) : undefined;
    if (x === undefined) return;
    if (Math.abs(x - Math.round(x)) > 1e-9 || x < lo || x > hi)
      out.push(`${what} ${x} is not a whole number from ${lo} to ${hi}`);
  };
  switch (rep.kind) {
    case 'spectrum': {
      const l = val(rep.wavelength);
      if (l !== undefined && l < 0) out.push(`wavelength ${l} is negative`);
      // speed = wavelength (in meters) × frequency; values the shown units round away are skipped.
      const s = typeof rep.speed === 'number' ? rep.speed : rep.speed ? val(rep.speed) : undefined;
      const f = rep.frequency ? val(rep.frequency) : undefined;
      if (l !== undefined && s !== undefined && f !== undefined && l > 1e-5) {
        const lf = l * (rep.meters ?? 1) * f;
        // A speed shown in km/h is 3.6 times its m/s.
        if (!near(s, lf) && !near(s / 3.6, lf))
          out.push(`speed ${s} is not wavelength ${l} × frequency ${f}`);
      }
      break;
    }
    case 'circuit': {
      const n = rep.count ? val(rep.count) : rep.bulbs.length;
      whole(rep.count, 'bulb count', 1, 4);
      if (rep.bulbs.length < 1 || rep.bulbs.length > 4)
        out.push(`${rep.bulbs.length} bulbs (1 to 4 fit)`);
      if (rep.count && rep.bulbs.length !== 1) out.push('a bulb count repeats one bulb');
      if (rep.branches && (rep.wiring !== 'parallel' || rep.branches.length !== rep.bulbs.length))
        out.push('branch currents are one per bulb of a parallel circuit');
      const on = rep.switch ? val(rep.switch) : 1;
      if (on !== undefined && on !== 0 && on !== 1) out.push(`switch ${on} is not 0 or 1`);
      const [V, I] = [val(rep.voltage), val(rep.current)];
      const Rs = (rep.count ? Array.from({ length: n ?? 0 }, () => rep.bulbs[0]!) : rep.bulbs).map(
        val,
      );
      if (Rs.some((r) => r !== undefined && !(r > 0))) out.push('a bulb with no resistance');
      if (V === undefined || I === undefined || on === undefined || n === undefined) break;
      if (Rs.some((r) => r === undefined || !(r > 0))) break;
      const R = Rs as number[];
      const expected =
        on === 0
          ? 0
          : rep.wiring === 'series'
            ? V / R.reduce((a, b) => a + b, 0)
            : R.reduce((a, r) => a + V / r, 0);
      if (!near(I, expected)) out.push(`meter reads ${I} A, the circuit gives ${expected} A`);
      rep.branches?.forEach((id, i) => {
        const b = val(id);
        if (b !== undefined && !near(b, on === 0 ? 0 : V / R[i]!))
          out.push(`branch ${i + 1} reads ${b} A, not V ÷ R = ${V / R[i]!} A`);
      });
      break;
    }
    case 'electromagnet': {
      whole(rep.turns, 'turns', 1, 200);
      whole(rep.clips, 'paper clips', 0, 24);
      const [N, I, S] = [
        val(rep.turns),
        val(rep.current),
        rep.strength ? val(rep.strength) : undefined,
      ];
      if (I !== undefined && I < 0) out.push(`current ${I} is negative`);
      if (N !== undefined && I !== undefined && S !== undefined && !near(S, N * I))
        out.push(`strength ${S} is not turns × current = ${N * I}`);
      break;
    }
    case 'orbit': {
      const [d, F] = [val(rep.distance), val(rep.pull)];
      const m = rep.mass ? val(rep.mass) : 1;
      if (d !== undefined && !(d > 0)) out.push(`distance ${d} is not above 0`);
      if (m !== undefined && !(m > 0)) out.push(`mass ${m} is not above 0`);
      if (d !== undefined && F !== undefined && m !== undefined && d > 0 && !near(F, m / d ** 2))
        out.push(`pull ${F} is not mass ÷ distance² = ${m / d ** 2}`);
      break;
    }
  }
  return out;
}
