/**
 * HC51 schedules: the arithmetic the picture, the harness and the demos share. Periodic tasks
 * under rate-monotonic or EDF priorities (preemptive, deadline = period), and one-processor
 * job orders (FCFS, SJF, round robin) with every job arriving at 0.
 */

export interface Slice {
  /** The task's or job's index. */
  task: number;
  start: number;
  end: number;
}

const EPS = 1e-9;

/** Greatest common divisor of two whole numbers. */
const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

/** The least common multiple of the periods (to 0.001), or undefined past `cap`. */
export function hyperperiod(periods: number[], cap = 1000) {
  if (!periods.length || periods.some((t) => !(t > 0))) return undefined;
  const ints = periods.map((t) => Math.round(t * 1000));
  if (ints.some((t, i) => Math.abs(t / 1000 - periods[i]!) > 1e-9)) return undefined;
  let l = 1;
  for (const t of ints) {
    l = (l / gcd(l, t)) * t;
    if (l / 1000 > cap) return undefined;
  }
  return l / 1000;
}

/**
 * How much of the schedule a chart draws: the hyperperiod when its shortest run is at least
 * 1/100 of it, else twice the longest period; never more than 60 of the shortest period.
 */
export function chartSpan(set: { C: number; T: number }[]) {
  const H = hyperperiod(set.map((t) => t.T));
  const minC = Math.min(...set.map((t) => t.C));
  const minT = Math.min(...set.map((t) => t.T));
  const span = H !== undefined && H / minC <= 100 ? H : 2 * Math.max(...set.map((t) => t.T));
  return { H, span: Math.min(span, 60 * minT) };
}

/** The Liu–Layland bound for n tasks, n(2^(1/n) − 1). */
export const rmBound = (n: number) => n * (2 ** (1 / n) - 1);

/**
 * Periodic tasks (C, T) run to `horizon`, preemptive, on one processor: rate-monotonic (the
 * shorter period first) or EDF (the earlier deadline first), ties to the lower index. A job not
 * done by its deadline is a miss and is dropped there.
 */
export function periodic(tasks: { C: number; T: number }[], policy: 'rm' | 'edf', horizon: number) {
  type Job = { task: number; release: number; deadline: number; left: number };
  const slices: Slice[] = [];
  const misses: { task: number; at: number }[] = [];
  /** Each task's jobs' completion times (undefined when missed), in release order. */
  const done: (number | undefined)[][] = tasks.map(() => []);
  let ready: Job[] = [];
  const next = tasks.map(() => 0);
  let t = 0;
  for (let guard = 0; guard < 100000 && t < horizon - EPS; guard++) {
    tasks.forEach((k, i) => {
      while (next[i]! <= t + EPS && next[i]! < horizon - EPS) {
        ready.push({ task: i, release: next[i]!, deadline: next[i]! + k.T, left: k.C });
        next[i] = next[i]! + k.T;
      }
    });
    ready = ready.filter((j) => {
      if (j.deadline <= t + EPS && j.left > EPS) {
        misses.push({ task: j.task, at: j.deadline });
        done[j.task]!.push(undefined);
        return false;
      }
      return true;
    });
    const nextRelease = Math.min(horizon, ...next);
    if (!ready.length) {
      t = nextRelease;
      continue;
    }
    const key = (j: Job) => (policy === 'rm' ? tasks[j.task]!.T : j.deadline);
    const run = ready.reduce((a, b) =>
      key(b) < key(a) - EPS || (Math.abs(key(b) - key(a)) <= EPS && b.task < a.task) ? b : a,
    );
    const stop = Math.min(t + run.left, nextRelease, run.deadline);
    const last = slices[slices.length - 1];
    if (last && last.task === run.task && Math.abs(last.end - t) < EPS) last.end = stop;
    else slices.push({ task: run.task, start: t, end: stop });
    run.left -= stop - t;
    t = stop;
    if (run.left <= EPS) {
      done[run.task]!.push(t);
      ready = ready.filter((j) => j !== run);
    }
  }
  return { slices, misses, done };
}

/** One processor's order of jobs all arriving at 0: FCFS, SJF (ties by index) or round robin. */
export function jobOrder(bursts: number[], policy: 'fcfs' | 'sjf' | 'rr', quantum = 1) {
  const slices: Slice[] = [];
  const finish = bursts.map(() => 0);
  let t = 0;
  if (policy === 'rr') {
    const left = [...bursts];
    const queue = bursts.map((_, i) => i).filter((i) => bursts[i]! > EPS);
    for (let guard = 0; queue.length && guard < 10000; guard++) {
      const i = queue.shift()!;
      const run = Math.min(quantum, left[i]!);
      slices.push({ task: i, start: t, end: t + run });
      t += run;
      left[i] = left[i]! - run;
      if (left[i]! > EPS) queue.push(i);
      else finish[i] = t;
    }
  } else {
    const order = bursts.map((_, i) => i);
    if (policy === 'sjf') order.sort((a, b) => bursts[a]! - bursts[b]! || a - b);
    for (const i of order) {
      slices.push({ task: i, start: t, end: t + bursts[i]! });
      t += bursts[i]!;
      finish[i] = t;
    }
  }
  const waits = bursts.map((b, i) => finish[i]! - b);
  const avg = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;
  return { slices, finish, waits, avgWait: avg(waits), avgTurnaround: avg(finish) };
}
