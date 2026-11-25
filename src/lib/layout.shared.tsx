import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { url } from '@/lib/site';

const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span className="nr-brand">
          <img src={`${base}/favicon-192x192.png`} alt="" width={28} height={28} />
          <span className="nr-brand-name">
            Neo<b>RU</b>
          </span>
          <span className="nr-brand-docs">Docs</span>
        </span>
      ),
      url: url('docs'),
    },
    githubUrl: 'https://github.com/CLIS-WPI/NeoRU/',
    links: [
      { text: 'Home', url: url() },
      { text: 'Benchmarks', url: `${url()}#benchmarks` },
      { text: 'Roadmap', url: `${url()}#roadmap` },
      { text: 'About', url: `${url()}#about` },
    ],
  };
}
