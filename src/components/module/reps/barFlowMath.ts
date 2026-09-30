/**
 * The steps of a `bars` picture with `flows` (H100), shared by `BarsFlows.tsx` and the harness:
 * the start bar from 0, each flow from the running total (down when `out[i]`), the end bar from 0.
 */
export function flowSteps(values: number[], out: boolean[]) {
  const steps: { from: number; to: number }[] = [];
  let run = values[0] ?? 0;
  steps.push({ from: 0, to: run });
  for (let i = 1; i < values.length - 1; i++) {
    const next = run + (out[i] ? -1 : 1) * values[i]!;
    steps.push({ from: run, to: next });
    run = next;
  }
  steps.push({ from: 0, to: values[values.length - 1] ?? 0 });
  return { steps, reached: run };
}
