import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { url } from '@/lib/site';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: 'NeoRU Docs',
      url: url('docs'),
    },
    githubUrl: 'https://github.com/CLIS-WPI/NeoRU/',
    links: [
      { text: 'Home', url: url() },
      { text: 'Architecture', url: url('architecture') },
      { text: 'Benchmarks', url: url('benchmarks') },
      { text: 'Roadmap', url: url('roadmap') },
      { text: 'About', url: url('team') },
    ],
  };
}
