import type { APIRoute } from 'astro';
import { url } from '../lib/site';

export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  const pages = ['', 'architecture', 'benchmarks', 'roadmap', 'docs', 'how-we-build', 'team', 'publications'];
  const entries = pages.map((page) => `<url><loc>${new URL(url(page), site).href}</loc></url>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</urlset>`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
