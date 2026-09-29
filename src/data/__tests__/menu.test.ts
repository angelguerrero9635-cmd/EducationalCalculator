import { MODULES } from '@/data/modules';

import { menuPath, menuTree, routePath, type MenuNode } from '../menu';
import { skillRoute, topicRoute } from '../selectors';

const leaves = (nodes: MenuNode[]): MenuNode[] =>
  nodes.flatMap((n) => (n.children ? leaves(n.children) : [n]));

describe('side menu', () => {
  const tree = menuTree();
  const all = leaves(tree);
  const paths = new Set(all.map((n) => routePath(n.route!)));

  it('lists every grade, then higher education', () => {
    expect(tree.map((n) => n.label)).toEqual([
      'Kindergarten',
      ...['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map((g) => `Grade ${g}`),
      'Higher Education',
    ]);
  });

  it('reaches every lesson page, main pages and problem types alike', () => {
    for (const m of MODULES) {
      // A college topic's page is its course's topic page ("he.physics.university-1#0").
      const [course, topic] = m.id.split('#');
      const route = topic === undefined ? skillRoute(m.id) : topicRoute(course!, Number(topic));
      expect([m.id, paths.has(routePath(route))]).toEqual([m.id, true]);
    }
  });

  it('has unique keys and a page at every leaf', () => {
    const keys: string[] = [];
    const walk = (nodes: MenuNode[]) =>
      nodes.forEach((n) => {
        keys.push(n.key);
        if (n.children) walk(n.children);
        else expect(n.route).toBeDefined();
      });
    walk(tree);
    expect(keys.filter((k, i) => keys.indexOf(k) !== i)).toEqual([]);
  });

  it('opens to the page the student is on', () => {
    const here = '/skill/m.3.area~split';
    expect(menuPath((r) => routePath(r) === here)).toEqual([
      'grade:3',
      'grade:3:math',
      'grade:3:math:Measurement & Data',
      'm.3.area',
      'm.3.area~split',
    ]);
  });
});
