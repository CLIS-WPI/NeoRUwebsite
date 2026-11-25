import type { APIRoute } from 'astro';
import { url } from '../lib/site';
import { source } from '../lib/source';
import roadmap from '../data/milestones.json';

export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  const corePages = ['', 'architecture', 'benchmarks', 'roadmap', 'docs', 'how-we-build', 'team', 'publications'];
  const docSubpages = source
    .getPages()
    .filter((page) => page.slugs.length > 0)
    .map((page) => `docs/${page.slugs.join('/')}`);

  const allRoutes = [...new Set([...corePages, ...docSubpages])];
  const lastmod = roadmap.asOf;

  const entries = allRoutes
    .map((route) => `<url><loc>${new URL(url(route), site).href}</loc><lastmod>${lastmod}</lastmod></url>`)
    .join('');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</urlset>`,
    {
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    },
  );
};
