/**
 * Step-text phrases for the college pictures of round 1, group E (HC10, HC12), spread into PHRASES
 * (`evaluate.ts`). By the time they run, × is *, − is - and a bracket holds one number. Test-only.
 */
import { erf } from '@/components/module/reps/functionGraphHe1e';

const NUM = String.raw`-?\d+(?:\.\d+)?(?:e[-+]?\d+)?`;

export const HE1E_PHRASES: [RegExp, (...xs: number[]) => number][] = [
  // The error function, erf(0.3294) = 0.3589 (diffusion into a surface).
  // (a bracket around one number is unwrapped by now: "erf 0.3294")
  [new RegExp(`(?<![\\w.])erf\\s*\\(?\\s*(${NUM})\\s*\\)?`), (z) => erf(z)],
  // The unit step, u(−1.5) = 0 and u(2) = 1 (an input switched on at τ).
  [new RegExp(`(?<![\\w.])u\\s*\\(?\\s*(${NUM})\\s*\\)?`), (x) => (x >= 0 ? 1 : 0)],
];
