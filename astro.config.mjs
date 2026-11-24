import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://natanzi.github.io',
  base: '/NeoRUwebsite',
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
});
