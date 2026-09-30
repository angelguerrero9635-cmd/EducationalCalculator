/**
 * Picture checks for the Grades 9–12 round 2 pictures of group H2E (`typesHs2e.ts`): what each
 * draws must agree with the values. Called from `repIssues` in `pictures.ts`. Test-only.
 */
import type { Hs2eSpec } from '../typesHs2e';

const whole = (x: number) => Math.abs(x - Math.round(x)) < 1e-9;
const num = (x: number | string, val: (id: string) => number | undefined) =>
  typeof x === 'number' ? x : val(x);

export function hs2eIssues(rep: Hs2eSpec, val: (id: string) => number | undefined): string[] {
  const out: string[] = [];
  switch (rep.kind) {
    case 'macromolecules': {
      // A chain of n monomers: whole, at least 2 (one bond); bonds and water are n − 1.
      const n = num(rep.count, val);
      if (n === undefined) break;
      if (!whole(n) || n < 2) out.push(`macromolecules: ${n} monomers (a whole number, 2 or more)`);
      for (const [id, what] of [
        [rep.bonds, 'bonds'],
        [rep.water, 'water molecules'],
      ] as const) {
        const x = id === undefined ? undefined : val(id);
        if (x !== undefined && Math.abs(x - (n - 1)) > 1e-9)
          out.push(`macromolecules: ${n} monomers make ${n - 1} ${what}, the value shows ${x}`);
      }
      break;
    }
  }
  return out;
}
