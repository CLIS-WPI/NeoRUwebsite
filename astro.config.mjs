import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import fumadocs from '@fumadocs/astro';

export default defineConfig({
  site: 'https://clis-wpi.github.io',
  base: '/NeoRUwebsite',
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  integrations: [
    fumadocs({
      components: './src/components/mdx.tsx',
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
