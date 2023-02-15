import { defineConfig } from 'vite';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  base: '/library/',
  css: {
    devSourcemap: true,
  },
  postcss: {
    plugins: [autoprefixer({})],
  },
});
