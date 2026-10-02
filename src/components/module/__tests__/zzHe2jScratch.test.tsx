// @ts-nocheck
/* Scratch: render group F demos to markup and check labels for overlap and clipping. */
import * as fs from 'fs';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

jest.mock('react-native', () => {
  const R = require('react');
  const pass = ({ children }: { children?: unknown }) => R.createElement(R.Fragment, null, children);
  const base: Record<string, unknown> = {
    View: pass,
    Text: pass,
    Pressable: pass,
    Platform: { OS: 'web', select: (o: Record<string, unknown>) => o.web ?? o.default },
    StyleSheet: { create: (x: unknown) => x, flatten: (x: unknown) => x ?? {}, absoluteFill: {} },
    useColorScheme: () => (process.env.SCHEME === 'dark' ? 'dark' : 'light'),
    Appearance: { getColorScheme: () => 'light', addChangeListener: () => ({ remove() {} }) },
    PanResponder: { create: () => ({ panHandlers: {} }) },
  };
  return new Proxy(base, { get: (t, k: string) => (k in t ? t[k] : pass) });
});
jest.mock('react-native-svg', () => {
  const R = require('react');
  const make = (tag: string) => (props: Record<string, unknown>) =>
    R.createElement(`x-${tag.toLowerCase()}`, props, props.children as never);
  const mod: Record<string, unknown> = { __esModule: true, default: make('svg') };
  return new Proxy(mod, { get: (t, k: string) => (k in t ? t[k] : make(k)) });
});
jest.mock('@/state/prefs', () => ({
  prefsStore: { subscribe: () => () => {}, get: () => ({ appearance: 'system' }) },
}));
jest.mock('@/state', () => ({ useUnitsPref: () => ['metric', () => {}] }));

import { GALLERY_MODULES } from '@/data/modules/gallery';
import { RepresentationView } from '@/components/module/reps';
import { useCalculator } from '@/components/module/useCalculator';

function Demo({ id }: { id: string }) {
  const m = GALLERY_MODULES.find((x) => x.id === id)!;
  const calc = useCalculator(m);
  return <RepresentationView spec={m.representation} calc={calc} />;
}

const W = 0.56;
it('renders', () => {
  const ids = GALLERY_MODULES.filter((m) => m.id.startsWith(process.env.IDS ?? 'g.he-stress')).map((m) => m.id);
  const report: string[] = [];
  for (const id of ids) {
    const html = renderToStaticMarkup(<Demo id={id} />);
    fs.writeFileSync(`/tmp/claude-0/-home-user-EducationalCalculator/b3dae256-82c0-5711-ad65-40b542496e7e/scratchpad/he2-j/out/${id}.html`, html);
    {
      const kebab = (k: string) => k.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());
      let svg = html.split('</x-svg>')[0]! + '</x-svg>';
      svg = svg.slice(svg.indexOf('<x-svg'));
      svg = svg.replace(/<(\/?)x-([a-z]+)/g, (_m, sl, t) => {
        const map: Record<string, string> = { svg: 'svg', g: 'g', line: 'line', path: 'path', rect: 'rect', circle: 'circle', polygon: 'polygon', polyline: 'polyline', text: 'text', tspan: 'tspan', defs: 'defs', lineargradient: 'linearGradient', radialgradient: 'radialGradient', stop: 'stop', ellipse: 'ellipse' };
        return `<${sl}${map[t] ?? t}`;
      });
      svg = svg.replace(/ ([a-z]+[A-Z][A-Za-z]*)=/g, (_m, k) => ` ${['x1','y1','x2','y2'].includes(k) ? k : kebab(k)}=`);
      svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg" style="background:white;font-family:sans-serif"');
      svg = svg.replace(/stop-color/g, 'stop-color').replace(/(stroke-dasharray|font-size)="([^"]*)"/g, '$1="$2"');
      fs.writeFileSync(`/tmp/claude-0/-home-user-EducationalCalculator/b3dae256-82c0-5711-ad65-40b542496e7e/scratchpad/he2-j/out/${id}.svg`, svg);
    }
    const svgW = Number(/<x-svg[^>]*width="([\d.]+)"/.exec(html)?.[1]);
    const svgH = Number(/<x-svg[^>]*height="([\d.]+)"/.exec(html)?.[1]);
    const scale = Number(/scale\(([\d.]+)\)/.exec(html)?.[1] ?? 1);
    const BW = svgW / scale;
    const BH = svgH / scale;
    // Text boxes: the x-text elements and their plain contents.
    const boxes: { t: string; x0: number; x1: number; y0: number; y1: number }[] = [];
    const re = /<x-text([^>]*)>(.*?)<\/x-text>/g;
    let mm: RegExpExecArray | null;
    while ((mm = re.exec(html))) {
      const attrs = mm[1]!;
      const get = (k: string) => new RegExp(`(?:^|\\s)${k}="([^"]*)"`).exec(attrs)?.[1];
      if (get('stroke') && get('stroke') !== 'none' && get('accessible') === 'false') continue; // halos
      const text = mm[2]!.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&');
      if (!text.trim()) continue;
      const x = Number(get('x'));
      const y = Number(get('y'));
      const fs_ = Number(get('fontSize') ?? get('fontsize') ?? 12);
      const anchor = get('textAnchor') ?? get('textanchor') ?? 'start';
      const w = text.length * fs_ * W;
      const x0 = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
      boxes.push({ t: text, x0, x1: x0 + w, y0: y - fs_ * 0.8, y1: y + fs_ * 0.2 });
    }
    const issues: string[] = [];
    for (const b of boxes) {
      if (b.x0 < -1 || b.x1 > BW + 1 || b.y0 < -1 || b.y1 > BH + 1)
        issues.push(`clipped "${b.t}" [${b.x0.toFixed(0)},${b.x1.toFixed(0)}]x[${b.y0.toFixed(0)},${b.y1.toFixed(0)}] in ${BW.toFixed(0)}x${BH.toFixed(0)}`);
    }
    const seen = new Set<string>();
    for (let i = 0; i < boxes.length; i++)
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i]!;
        const b = boxes[j]!;
        const k = `${a.t}|${b.t}|${a.x0}|${b.x0}`;
        if (seen.has(k)) continue;
        if (a.x0 < b.x1 - 2 && b.x0 < a.x1 - 2 && a.y0 < b.y1 - 1 && b.y0 < a.y1 - 1) {
          seen.add(k);
          issues.push(`overlap "${a.t}" / "${b.t}"`);
        }
      }
    // Text against lines and rect borders.
    const segs: [number, number, number, number, string][] = [];
    const attr = (a: string, k: string) => Number(new RegExp(`(?:^|\\s)${k}="([^"]*)"`).exec(a)?.[1]);
    for (const l of html.matchAll(/<x-line([^>]*)>/g))
      segs.push([attr(l[1]!, 'x1'), attr(l[1]!, 'y1'), attr(l[1]!, 'x2'), attr(l[1]!, 'y2'), 'line']);
    for (const r of html.matchAll(/<x-rect([^>]*)>/g)) {
      const a = r[1]!;
      if (/fill="url/.test(a) && !/stroke=/.test(a)) continue;
      const [x, y, w, h] = [attr(a, 'x'), attr(a, 'y'), attr(a, 'width'), attr(a, 'height')];
      segs.push([x, y, x + w, y, 'rect'], [x, y + h, x + w, y + h, 'rect'], [x, y, x, y + h, 'rect'], [x + w, y, x + w, y + h, 'rect']);
    }
    for (const p of html.matchAll(/<x-path d="M ([\d.-]+) ([\d.-]+) L ([\d.-]+) ([\d.-]+)/g))
      segs.push([+p[1]!, +p[2]!, +p[3]!, +p[4]!, 'path']);
    const hit = (b: (typeof boxes)[0], s: (typeof segs)[0]) => {
      const [x1, y1, x2, y2] = s;
      for (let k = 0; k <= 20; k++) {
        const x = x1 + ((x2 - x1) * k) / 20;
        const y = y1 + ((y2 - y1) * k) / 20;
        if (x > b.x0 + 1 && x < b.x1 - 1 && y > b.y0 + 1 && y < b.y1 - 1) return true;
      }
      return false;
    };
    for (const b of boxes)
      for (const s of segs)
        if (hit(b, s)) {
          issues.push(`"${b.t}" crosses a ${s[4]} (${s.slice(0, 4).map((v) => Math.round(v as number)).join(',')})`);
          break;
        }
    const caption = html.split("</x-svg>").pop()!.replace(/<[^>]+>/g, " ");
    report.push(`## ${id} (${BW.toFixed(0)}x${BH.toFixed(0)}) boxes ${boxes.length} segs ${segs.length} first ${JSON.stringify(boxes[0])}\n${issues.join('\n')}\n${caption ?? ''}`);
  }
  fs.writeFileSync(`/tmp/claude-0/-home-user-EducationalCalculator/b3dae256-82c0-5711-ad65-40b542496e7e/scratchpad/he2-j/out/report.txt`, report.join('\n\n'));
});
