import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { url } from '../lib/site';
import { source } from '../lib/source';
import roadmap from '../data/milestones.json';

export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const origin = site ?? new URL('https://clis-wpi.github.io');
  const fullUrl = (path = '') => new URL(url(path), origin).href;
  const pages = await getCollection('pages');
  const pageMap = new Map(pages.map((p) => [p.id, p]));

  const coreLinks = [
    ['Home', '', pageMap.get('home')?.data.description ?? 'NeoRU project overview'],
    ['Benchmarks', 'benchmarks', pageMap.get('benchmarks')?.data.description ?? 'Reference baseline and conditions'],
    ['Roadmap', 'roadmap', pageMap.get('roadmap')?.data.description ?? 'Development milestones'],
    ['How we build', 'how-we-build', pageMap.get('how-we-build')?.data.description ?? 'Engineering process'],
    ['Publications', 'publications', pageMap.get('publications')?.data.description ?? 'Publications record'],
    ['About', 'team', pageMap.get('team')?.data.description ?? 'Team and affiliation'],
  ];

  const docPages = source.getPages();

  const lines: string[] = [
    '# NeoRU — Open-Source Software O-RU (O-RAN Split 7.2x)',
    '',
    '> NeoRU is an open-source, software-defined Open Radio Unit (O-RU) for O-RAN 7.2x fronthaul, developed in the CLIS Lab (Department of Electrical and Computer Engineering, Worcester Polytechnic Institute) and founded by Milad Natanzi. Licensed under Apache 2.0. Status snapshot: ' + roadmap.asOf + '.',
    '',
    '## Key Facts',
    '- License: Apache 2.0 (public code release pending)',
    '- Repository: https://github.com/CLIS-WPI/NeoRU/',
    '- Target: One 20 MHz, 2x2 carrier on approximately one CPU core (engineering target; end-to-end measurement is still ahead)',
    '- Full AI-readable corpus: ' + new URL(`${import.meta.env.BASE_URL.replace(/\/$/, '')}/llms-full.txt`, origin).href,
    '',
    '## Site Pages',
    ...coreLinks.map(([title, slug, desc]) => `- [${title}](${fullUrl(slug)}): ${desc}`),
    '',
    '## Documentation (Fumadocs)',
    ...docPages.map((page) => {
      const slugPath = page.slugs.length > 0 ? `docs/${page.slugs.join('/')}` : 'docs';
      const desc = page.data.description ? `: ${page.data.description}` : '';
      return `- [${page.data.title}](${fullUrl(slugPath)})${desc}`;
    }),
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
