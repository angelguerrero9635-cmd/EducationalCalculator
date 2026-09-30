/**
 * H99: a central limit theorem simulation (pure, so the harness checks what `CltHistogram.tsx`
 * draws): `samples` random samples of size n from a right-skewed population (exponential, mean
 * and standard deviation μ), each sample's mean, and those means counted in bins. Seeded: the
 * same values give the same picture.
 */
import { seeded } from './statMath';

export interface CltModel {
  means: number[];
  /** The bins' left edges share one width; counts[i] is how many means fall in bin i. */
  lo: number;
  width: number;
  counts: number[];
  /** The x-axis runs 0 to `xMax` (the population's spread, or the means' when wider). */
  xMax: number;
  se: number;
  /** The simulated means' own mean and standard deviation. */
  meanOfMeans: number;
  sdOfMeans: number;
  problem?: string;
}

export function cltModel(mu: number, n: number, samples: number, seed = 2026): CltModel {
  const se = mu / Math.sqrt(n);
  const empty = {
    means: [],
    lo: 0,
    width: 1,
    counts: [],
    xMax: 1,
    se,
    meanOfMeans: 0,
    sdOfMeans: 0,
  };
  if (!(mu > 0)) return { ...empty, problem: 'The population mean must be more than 0.' };
  if (!(n >= 1 && n <= 400) || !Number.isInteger(n))
    return { ...empty, problem: `Samples of ${n}: n is a whole number from 1 to 400.` };
  if (!(samples >= 10 && samples <= 5000) || !Number.isInteger(samples))
    return { ...empty, problem: `${samples} samples: a whole number from 10 to 5,000.` };
  const rand = seeded(seed + 7919 * n + samples);
  const means: number[] = [];
  for (let s = 0; s < samples; s++) {
    let sum = 0;
    for (let i = 0; i < n; i++) sum += -mu * Math.log(1 - rand());
    means.push(sum / n);
  }
  const xMax = Math.max(5 * mu, mu + 4.5 * se, ...means);
  const width = Math.max(se / 2.5, xMax / 60);
  const counts = Array.from({ length: Math.ceil(xMax / width) }, () => 0);
  for (const m of means) counts[Math.min(counts.length - 1, Math.floor(m / width))]! += 1;
  const meanOfMeans = means.reduce((a, b) => a + b, 0) / samples;
  const sdOfMeans = Math.sqrt(
    means.reduce((a, b) => a + (b - meanOfMeans) ** 2, 0) / Math.max(1, samples - 1),
  );
  return { means, lo: 0, width, counts, xMax, se, meanOfMeans, sdOfMeans };
}
