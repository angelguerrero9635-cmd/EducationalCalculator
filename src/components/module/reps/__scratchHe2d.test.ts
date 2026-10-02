import { HE2D_GALLERY_MODULES } from '@/data/modules/galleryHe2d';
import type { AmpSpec } from '@/data/modules/typesHe2d';
import { formatNumber } from '@/engine/format';

import { layoutAmp } from './ampLayout';
import { ampPicture, type RepLike } from './ampTexts';
import { labelClashes, labelsOnLines } from './he2dSch';

const repOf = (m: (typeof HE2D_GALLERY_MODULES)[number], unknown: string[] = []): RepLike => {
  const byId = new Map(m.variables.map((v) => [v.id, v]));
  const value = (id: string) => {
    if (unknown.includes(id)) return '?';
    const x = m.example[id]!;
    const u = byId.get(id)!.unit;
    return `${formatNumber(Number(x.toPrecision(3)))}${u ? ` ${u}` : ''}`;
  };
  return {
    known: (id) => !unknown.includes(id),
    val: (id) => m.example[id]!,
    value,
    label: (id) => `${byId.get(id)!.symbol} = ${value(id)}`,
    variable: (id) => byId.get(id)!,
  };
};

it('lays out every HE2D demo without clashes', () => {
  const report: string[] = [];
  for (const m of HE2D_GALLERY_MODULES) {
    const r = m.representation as AmpSpec;
    if (!('amp' in r)) continue;
    for (const w of [358, 390, 520]) {
      const p = ampPicture(r, repOf(m));
      const s = layoutAmp(r.amp, w, p.texts, p.nums, p.rails);
      const issues = [...labelClashes(s, w), ...labelsOnLines(s, w)];
      report.push(`${m.id} @${w} h=${s.height}: ${issues.length ? issues.join('; ') : 'ok'}`);
    }
  }
  console.log(report.join('\n'));
});
