/**
 * Page fingerprints for scripts/ci-test.mjs: one hash per module (lessons and gallery demos) of
 * what its page says, so an engine change runs the heavy suites only on the pages whose text it
 * changed.
 *
 *   FINGERPRINT_OUT=.review/fingerprints/head.json pnpm -s test src/data/modules/__tests__/fingerprint.review.test.ts
 *
 * Each hash covers the module's definition (its functions as source) and the walkthrough from
 * the opening values, from each other value as the one to find, from each opening value at its
 * ends, and from three seeded samples. Skipped unless FINGERPRINT_OUT names an output file.
 */
import { solve } from '@/engine/solve';
import type { Values, VariableDef } from '@/engine/types';

import { TESTED_MODULES } from '..';
import { buildSteps } from '../buildSteps';
import { walkthroughText } from '../harness/walkText';
import type { ModuleDef } from '../types';

// Jest runs in Node; the test tsconfig has no Node types, so the few Node calls are declared here.
declare const require: (name: string) => {
  mkdirSync: (path: string, options: { recursive: boolean }) => void;
  writeFileSync: (path: string, text: string) => void;
  dirname: (path: string) => string;
  createHash: (kind: string) => { update: (text: string) => { digest: (enc: string) => string } };
};
const env: Record<string, string | undefined> =
  (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
const OUT = env.FINGERPRINT_OUT;

/** A small seeded generator, so a page's samples are the same on every run. */
function seeded(text: string) {
  let a = [...text].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261);
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A value for v: from its list, or in its range (near the example, anywhere, or small). */
function sample(v: VariableDef, example: number | undefined, r: () => number, k: number): number {
  if (v.allowed?.length) return v.allowed[Math.floor(r() * v.allowed.length)]!;
  const lo = v.min ?? -1000;
  const hi = v.max ?? 1000;
  let x =
    k === 0 && example !== undefined
      ? example * (0.5 + 1.5 * r())
      : k === 1
        ? lo + (hi - lo) * r()
        : lo + Math.min(hi - lo, 100) * r();
  x = Math.min(hi, Math.max(lo, x));
  if (v.integer) return Math.round(x);
  const step = v.step ?? 0.01;
  return Number((Math.round(x / step) * step).toPrecision(12));
}

function pageText(m: ModuleDef): string {
  const lines = [JSON.stringify(m, (_, x) => (typeof x === 'function' ? String(x) : x))];
  const walk = (label: string, givens: { id: string; value: number }[], seed?: Values) => {
    try {
      const result = solve(m, givens, seed);
      lines.push(`-- ${label}`);
      lines.push(
        ...(result.rejected
          ? [`rejected: ${result.rejected.reason}`]
          : walkthroughText(buildSteps(m, result))),
      );
    } catch (e) {
      lines.push(`-- ${label}: threw ${String(e)}`);
    }
  };
  const byId = new Map(m.variables.map((v) => [v.id, v]));
  walk(
    'opening',
    m.startWith.map((id) => ({ id, value: m.example[id]! })),
    m.example,
  );
  for (const v of m.variables.filter((x) => !m.startWith.includes(x.id) && !x.derived)) {
    const ids = m.variables.filter((x) => x.id !== v.id && !x.derived).map((x) => x.id);
    walk(
      `find ${v.id}`,
      ids.map((id) => ({ id, value: m.example[id]! })),
      m.example,
    );
  }
  for (const id of m.startWith) {
    const v = byId.get(id);
    for (const x of [v?.allowed?.[0] ?? v?.min, v?.allowed?.at(-1) ?? v?.max]) {
      if (x === undefined) continue;
      walk(`edge ${id} = ${x}`, [
        ...m.startWith.filter((o) => o !== id).map((o) => ({ id: o, value: m.example[o]! })),
        { id, value: x },
      ]);
    }
  }
  const r = seeded(m.id);
  for (let k = 0; k < 3; k++) {
    walk(
      `sample ${k}`,
      m.startWith.map((id) => ({ id, value: sample(byId.get(id)!, m.example[id], r, k) })),
    );
  }
  return lines.join('\n');
}

describe('page fingerprints', () => {
  (OUT ? it : it.skip)('writes one hash per page', () => {
    const crypto = require('node:crypto');
    const out: Record<string, { h: string; kind?: string }> = {};
    for (const m of TESTED_MODULES) {
      out[m.id] = {
        h: crypto.createHash('sha1').update(pageText(m)).digest('hex').slice(0, 16),
        kind: (m.representation as { kind?: string } | undefined)?.kind,
      };
    }
    const fs = require('node:fs');
    fs.mkdirSync(require('node:path').dirname(OUT!), { recursive: true });
    fs.writeFileSync(OUT!, JSON.stringify(out));
    expect(Object.keys(out).length).toBeGreaterThan(0);
  });
});
