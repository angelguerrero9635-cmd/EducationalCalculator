/**
 * Picture checks for round 3 group H3D (biology, H109). Called from the kinds' cases in
 * `pictures.ts` and `picturesHsg.ts`. Test-only.
 */
import { CODON_TABLE, effectOf, mutate, transcribe } from '@/components/module/reps/dnaMath';
import type { VariableDef } from '@/engine/types';

import type { Representation } from '../types';
import type { NeuronSpec } from '../typesHs3d';

const STOPS = ['UAA', 'UAG', 'UGA'];

/**
 * `dnaStrand` mutations (H109): the effect the caption names, worked out here from the bases.
 * With a template whose mRNA starts AUG: a change breaking the start codon is start-lost, an
 * insertion before base 1 leaves the start whole, a substitution turning the stop into a sense
 * codon is stop-lost, an insertion or deletion past the stop changes nothing; any other
 * insertion or deletion is a frameshift.
 */
export function mutationEffectIssues(
  template: string,
  m: { type: 'substitution' | 'insertion' | 'deletion'; at: number; base?: string },
): string[] {
  const got = effectOf(template, m);
  const mrna = transcribe(template);
  const after = transcribe(mutate(template, m));
  const codons = mrna.match(/.{3}/g) ?? [];
  const started = codons[0] === 'AUG';
  const stop = codons.findIndex((c) => STOPS.includes(c));
  const k = Math.ceil(m.at / 3) - 1;
  let want: string | undefined;
  if (m.type !== 'substitution') {
    if (!started) want = 'frameshift';
    else if (m.type === 'insertion' && m.at === 1) want = 'before-start';
    else if (k === 0 && after.slice(0, 3) !== 'AUG') want = 'start-lost';
    else if (stop >= 0 && m.at > 3 * (stop + 1)) want = 'none';
    else want = 'frameshift';
  } else if (started && k === 0) {
    // AUG is Met's only codon: any change to it loses the start.
    want = CODON_TABLE[after.slice(0, 3)] === 'Met' ? 'silent' : 'start-lost';
  } else if (k === stop) {
    want = STOPS.includes(after.slice(3 * k, 3 * k + 3)) ? 'silent' : 'stop-lost';
  }
  if (want !== undefined && got !== want)
    return [`dna: a ${m.type} at base ${m.at} reads as ${got}, expected ${want}`];
  return [];
}

/**
 * `pieChart` `stages` (H109): one per part, each part's name naming its stage ("Cells in
 * prophase"), so the drawing beside a name is the phase it counts.
 */
export function pieStageIssues(
  rep: Extract<Representation, { kind: 'pieChart' }>,
  byId: Map<string, VariableDef>,
): string[] {
  if (!rep.stages) return [];
  if (rep.stages.length !== rep.parts.length)
    return [`pie: ${rep.stages.length} stages for ${rep.parts.length} parts`];
  return rep.parts.flatMap((id, i) => {
    const name = (byId.get(id)?.name ?? '').toLowerCase();
    const stage = rep.stages![i]!;
    return name.includes(stage.toLowerCase())
      ? []
      : [`pie: part ${id} ("${name}") is drawn as ${stage}`];
  });
}

/**
 * `neuron` (H109): the length and speed are positive, and a time the page gives is the one the
 * scales draw, 1,000 × length ÷ speed ms.
 */
export function neuronIssues(
  rep: NeuronSpec,
  val: (x: string | number) => number | undefined,
): string[] {
  const out: string[] = [];
  const d = val(rep.length);
  const v = val(rep.speed);
  const t = rep.time === undefined ? undefined : val(rep.time);
  if (d !== undefined && !(d > 0)) out.push(`neuron: axon length ${d} is not positive`);
  if (v !== undefined && !(v > 0)) out.push(`neuron: speed ${v} is not positive`);
  if (d !== undefined && v !== undefined && v > 0 && t !== undefined) {
    const want = (1000 * d) / v;
    if (Math.abs(t - want) > 0.01 * Math.max(1, want))
      out.push(`neuron: ${t} ms drawn, 1,000 × ${d} ÷ ${v} = ${want} ms`);
  }
  return out;
}
