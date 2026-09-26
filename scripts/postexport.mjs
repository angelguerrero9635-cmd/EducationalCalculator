// After `expo export -p web` (static output): writes dist/sitemap.xml listing every
// pre-rendered page, adds dist/404.html (Vercel's not-found page) and removes Expo's route
// templates ("[id].html") and dev route list ("_sitemap.html"), which aren't real pages.
import { copyFileSync, existsSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const DIST = 'dist';
const SITE = 'https://educational-calculator.vercel.app';
// Pages that shouldn't be listed for search engines.
const UNLISTED = new Set(['/onboarding', '/paywall', '/+not-found', '/404']);

if (!existsSync(DIST)) throw new Error('dist/ not found: run `expo export -p web` first');

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

// Remove route templates, the dev route list and route-group copies ("(tabs)/…").
for (const file of walk(DIST)) {
  const rel = relative(DIST, file).split(sep).join('/');
  if (!rel.endsWith('.html')) continue;
  if (/\[[^/]+\]/.test(rel) || rel === '_sitemap.html' || /(^|\/)\([^/]+\)\//.test(rel)) {
    rmSync(file);
  }
}

// Drop folders left empty (e.g. the "(tabs)" route group).
const prune = (dir) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) prune(path);
  }
  if (dir !== DIST && readdirSync(dir).length === 0) rmSync(dir, { recursive: true });
};
prune(DIST);

copyFileSync(join(DIST, '+not-found.html'), join(DIST, '404.html'));

const urls = walk(DIST)
  .map((f) => relative(DIST, f).split(sep).join('/'))
  .filter((rel) => rel.endsWith('.html'))
  .map((rel) => '/' + rel.replace(/(^|\/)index\.html$/, '').replace(/\.html$/, ''))
  .map((path) => (path.length > 1 ? path.replace(/\/$/, '') : path))
  .filter((path) => !UNLISTED.has(path) && !path.startsWith('/gallery'))
  .sort();

const xmlEscape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
writeFileSync(
  join(DIST, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map((u) => `  <url><loc>${xmlEscape(SITE + u)}</loc></url>`).join('\n') +
    '\n</urlset>\n',
);
console.log(`sitemap.xml: ${urls.length} pages`);
