import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { url } from '../lib/site';
import { source } from '../lib/source';
import roadmap from '../data/milestones.json';
import baseline from '../data/benchmarks.json';

export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const origin = site ?? new URL('https://clis-wpi.github.io');
  const fullUrl = (path = '') => new URL(url(path), origin).href;
  const pages = await getCollection('pages');

  const sections: string[] = [
    '# NeoRU — Complete Project & Documentation Corpus',
    '',
    `Source: ${fullUrl()}`,
    `Repository: https://github.com/CLIS-WPI/NeoRU/`,
    `Status Snapshot: ${roadmap.asOf}`,
    `Affiliation: CLIS Lab, Department of Electrical and Computer Engineering, Worcester Polytechnic Institute`,
    `Founder: Milad Natanzi`,
    `Advisor: Bo Tang`,
    '',
    '---',
    '',
  ];

  // 1. Core site pages from src/content/pages/
  for (const page of pages) {
    const route = page.id === 'home' ? '' : page.id;
    sections.push(
      `## ${page.data.eyebrow}: ${page.data.title}`,
      `URL: ${fullUrl(route)}`,
      '',
      page.data.description,
      '',
      (page.body ?? '').trim(),
      '',
      '---',
      '',
    );
  }

  // 2. Reference Benchmark Baseline
  sections.push(
    `## Benchmark Baseline (${baseline.implementation})`,
    `Label: ${baseline.label}`,
    '',
    ...baseline.metrics.map((m) => `- ${m.label}: ${m.value} ${m.unit} (${m.scope})`),
    '',
    'Conditions:',
    ...baseline.conditions.map((c) => `- ${c.label}: ${c.value}`),
    '',
    baseline.evidenceNote,
    '',
    '---',
    '',
  );

  // 3. Roadmap Milestones
  sections.push(`## Roadmap Milestones (as of ${roadmap.asOf})`, '');
  for (const m of roadmap.milestones) {
    sections.push(`- [${m.status}] (${m.group}) **${m.title}**: ${m.summary}`);
  }
  sections.push('', '---', '');

  // 4. All Fumadocs Documentation Pages (auto-updated whenever content/docs/ changes)
  for (const doc of source.getPages()) {
    const slugPath = doc.slugs.length > 0 ? `docs/${doc.slugs.join('/')}` : 'docs';
    const processed = await doc.data.getText('processed');
    sections.push(
      `## Docs: ${doc.data.title}`,
      `URL: ${fullUrl(slugPath)}`,
      ...(doc.data.description ? ['', doc.data.description] : []),
      '',
      processed.trim(),
      '',
      '---',
      '',
    );
  }

  return new Response(sections.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
