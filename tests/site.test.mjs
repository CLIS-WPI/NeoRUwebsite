import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, join, relative, sep } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const dist = join(root, 'dist');
const origin = 'https://natanzi.github.io';
const base = '/NeoRUwebsite/';
const pages = ['', 'architecture', 'benchmarks', 'roadmap', 'docs', 'how-we-build', 'team', 'publications'];
const pageFile = (route) => join(dist, route, 'index.html');
const read = (path) => readFileSync(path, 'utf8');
const data = (name) => JSON.parse(read(join(root, 'src', 'data', `${name}.json`)));
const decode = (value) => value.replace(/&amp;/g, '&').replace(/&#(?:x([0-9a-f]+)|(\d+));/gi, (_, hex, dec) => String.fromCodePoint(parseInt(hex ?? dec, hex ? 16 : 10)));
const text = (html) => decode(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const attributes = (tag) => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map((match) => [match[1].toLowerCase(), decode(match[2] ?? match[3]) ]));

function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? files(join(directory, entry.name)) : [join(directory, entry.name)]);
}

test('milestones have valid editable dates, unique IDs, and explicit statuses', () => {
  const roadmap = data('milestones');
  assert.match(roadmap.asOf, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(new Date(`${roadmap.asOf}T00:00:00Z`).toISOString().slice(0, 10), roadmap.asOf);
  assert.ok(roadmap.milestones.length > 0);
  assert.equal(new Set(roadmap.milestones.map((item) => item.id)).size, roadmap.milestones.length, 'Duplicate milestone IDs');
  for (const item of roadmap.milestones) {
    assert.ok(['done', 'in_progress', 'planned'].includes(item.status), `${item.id}: unsupported status`);
    for (const key of ['id', 'title', 'group', 'summary']) assert.ok(typeof item[key] === 'string' && item[key].trim(), `${item.id}: missing ${key}`);
  }
  for (const group of ['Phase 2', 'Level 3', 'Level 4']) assert.ok(roadmap.milestones.some((item) => item.group === group), `${group} must remain a distinct roadmap group`);
});

test('all eight content pages and the GitHub Pages 404 are built', () => {
  for (const route of pages) {
    assert.ok(existsSync(pageFile(route)), `Missing ${route || 'home'}; run npm run build first`);
    const html = read(pageFile(route));
    assert.match(html, /<html[^>]+lang="en"/);
    assert.match(html, /<title>[^<]+<\/title>/);
    assert.match(html, /<main\b/);
    assert.match(html, /<h1\b/);
    const canonical = [...html.matchAll(/<link\b[^>]*>/g)].map(([tag]) => attributes(tag)).find((attrs) => attrs.rel === 'canonical');
    assert.equal(canonical?.href, `${origin}${base}${route ? `${route}/` : ''}`, `${route}: canonical mismatch`);
  }
  assert.ok(existsSync(join(dist, '404.html')), 'GitHub Pages requires dist/404.html');
});

test('Benchmarks, Docs, and Team are direct links in the main header', () => {
  for (const route of pages) {
    const header = read(pageFile(route)).match(/<header\b[^>]*>([\s\S]*?)<\/header>/i)?.[1];
    assert.ok(header, `${route || 'home'}: missing main header`);
    const links = [...header.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].map((match) => ({ ...attributes(match[1]), label: text(match[2]) }));
    for (const [slug, label] of [['benchmarks', 'Benchmarks'], ['docs', 'Docs'], ['team', 'Team']]) {
      assert.ok(links.some((link) => link.href === `${base}${slug}/` && link.label === label), `${route || 'home'}: ${label} is not a direct header link`);
    }
  }
});

test('every internal page link and local resource resolves under the project base', () => {
  assert.ok(existsSync(dist), 'Run npm run build before testing links');
  for (const file of files(dist).filter((path) => path.endsWith('.html'))) {
    const sourcePath = relative(dist, file).split(sep).join('/').replace(/index\.html$/, '');
    const sourceUrl = `${origin}${base}${sourcePath}`;
    const html = read(file);
    for (const [tag] of html.matchAll(/<[a-z][^>]*>/gi)) {
      const attrs = attributes(tag);
      const ref = attrs.href ?? attrs.src;
      if (!ref || /^(?:mailto:|tel:|data:|blob:)/i.test(ref)) continue;
      if (attrs.rel === 'canonical') continue;
      const target = new URL(ref, sourceUrl);
      if (target.origin !== origin) continue;
      assert.ok(target.pathname.startsWith(base), `${sourcePath}: ${ref} escapes the project base`);
      const local = join(dist, decodeURIComponent(target.pathname.slice(base.length)));
      const destination = existsSync(local) && statSync(local).isDirectory() ? join(local, 'index.html') : local;
      assert.ok(existsSync(destination), `${sourcePath}: missing destination ${ref}`);
      if (target.hash && destination.endsWith('.html')) {
        const ids = [...read(destination).matchAll(/\bid\s*=\s*["']([^"']+)["']/g)].map((match) => decode(match[1]));
        assert.ok(ids.includes(decodeURIComponent(target.hash.slice(1))), `${sourcePath}: missing anchor ${ref}`);
      }
    }
  }
});

test('published benchmarks preserve the reference identity, caveat, and power scope', () => {
  const benchmark = data('benchmarks');
  assert.equal(benchmark.implementation, 'ProtO-RU');
  assert.match(benchmark.label, /baseline.*reference implementation/i);
  assert.equal(benchmark.metrics.length, 2, 'Only the two supplied baseline metrics are publishable');
  assert.ok(benchmark.metrics.some((metric) => metric.value === '3.38'));
  assert.ok(benchmark.metrics.some((metric) => /33\.5/.test(metric.value) && /O-RU and DU together/i.test(metric.scope)));
  const body = text(read(pageFile('benchmarks')));
  assert.match(body, /NeoRU has not yet been measured end to end\./);
  assert.match(body, /ProtO-RU/);
  assert.match(body, /baseline.*reference implementation/i);
  assert.match(body, /3\.38/);
  assert.match(body, /33\.5/);
  assert.match(body, /O-RU and DU together/i);
  for (const required of [/20\s*MHz/i, /2\s*[×x]\s*2/, /30\s*kHz/i, /saturated test UE/i, /isolated cores/i, /AMD EPYC 9354/i]) assert.match(body, required);
});

test('withheld preliminary event-ring result is absent from published assets', () => {
  for (const file of files(dist).filter((path) => /\.(?:html|js|json|xml|txt)$/i.test(path))) {
    const body = text(read(file));
    assert.doesNotMatch(body, /\b20\s*(?:ns\b|nanoseconds?\b)/i, `${relative(dist, file)} publishes the withheld preliminary measurement`);
  }
});

test('the site loads no external page resources or tracking code', () => {
  for (const file of files(dist).filter((path) => /\.(?:html|css|js)$/i.test(path))) {
    const body = read(file);
    assert.doesNotMatch(body, /google-analytics|googletagmanager|connect\.facebook\.net|plausible\.io|hotjar|clarity\.ms|sendBeacon\s*\(/i, relative(dist, file));
    if (file.endsWith('.html')) {
      for (const [tag] of body.matchAll(/<a\b[^>]*>/gi)) {
        const ref = attributes(tag).href;
        if (ref && /^(?:https?:)?\/\//i.test(ref)) {
          const target = new URL(ref, origin);
          assert.ok(target.origin === origin || target.href.replace(/\/$/, '') === 'https://github.com/natanzi/NeoRUwebsite', `Unapproved public link in ${relative(dist, file)}: ${ref}`);
        }
      }
      for (const [tag] of body.matchAll(/<(?:script|img|source|video|audio|iframe|link)\b[^>]*>/gi)) {
        const attrs = attributes(tag);
        for (const ref of [attrs.src, attrs.href, ...(attrs.srcset?.split(',').map((part) => part.trim().split(/\s+/)[0]) ?? [])].filter(Boolean)) {
          if (!/^(?:https?:)?\/\//i.test(ref)) continue;
          assert.equal(new URL(ref, origin).origin, origin, `Remote resource in ${relative(dist, file)}: ${ref}`);
        }
      }
    }
    if (file.endsWith('.css')) assert.doesNotMatch(body, /(?:url\(|@import\s+)[\s"']*(?:https?:)?\/\//i, `External CSS resource in ${relative(dist, file)}`);
  }
});

test('the sitemap covers every public content page and excludes the 404', () => {
  const sitemap = read(join(dist, 'sitemap.xml'));
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  assert.deepEqual(locations.sort(), pages.map((route) => `${origin}${base}${route ? `${route}/` : ''}`).sort());
  assert.match(read(join(dist, 'robots.txt')), /Sitemap: https:\/\/natanzi\.github\.io\/NeoRUwebsite\/sitemap\.xml/);
});
