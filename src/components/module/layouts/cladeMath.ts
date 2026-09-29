/**
 * The cladogram's tree worked out (cladogramFigure.tsx), shared with its harness check
 * (harness/layoutFiguresHsh.ts): the taxa in order, every clade's members, where each node sits
 * and which branch a trait is marked on.
 */
import type { CladeTrait, CladeTree } from '@/data/modules/typesHsh';

/** A node of the laid-out tree. */
export interface CladeNode {
  /** The taxa under it, top to bottom. */
  taxa: string[];
  /** Its parent's index in the node list (−1 for the root). */
  parent: number;
  /** Steps to its farthest taxon (0 for a taxon). */
  height: number;
  /** A taxon's name. */
  name?: string;
  children: number[];
}

/** Every node, parents before children (the root first). */
export function cladeNodes(tree: CladeTree): CladeNode[] {
  const out: CladeNode[] = [];
  const visit = (t: CladeTree, parent: number): number => {
    const i = out.length;
    out.push({ taxa: [], parent, height: 0, children: [] });
    if (typeof t === 'string') {
      out[i]!.taxa = [t];
      out[i]!.name = t;
      return i;
    }
    for (const sub of t) {
      const j = visit(sub, i);
      out[i]!.children.push(j);
      out[i]!.taxa.push(...out[j]!.taxa);
      out[i]!.height = Math.max(out[i]!.height, out[j]!.height + 1);
    }
    return i;
  };
  visit(tree, -1);
  return out;
}

/** The taxa, top to bottom. */
export const cladeTaxa = (tree: CladeTree) => cladeNodes(tree)[0]!.taxa;

/**
 * The node whose taxa are exactly the trait's (the branch into it is where the trait appears),
 * or −1 when the taxa are not one clade.
 */
export function traitNode(nodes: CladeNode[], trait: CladeTrait): number {
  const want = new Set(trait.taxa);
  return nodes.findIndex((n) => n.taxa.length === want.size && n.taxa.every((t) => want.has(t)));
}

/** Whether a set of taxa is one clade: an ancestor and all its descendants. */
export const isClade = (nodes: CladeNode[], taxa: string[]) =>
  traitNode(nodes, { name: '', taxa }) >= 0;

/** Most taxa a cladogram draws. */
export const CLADE_MAX = 10;
