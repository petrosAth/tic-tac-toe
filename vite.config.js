import { defineConfig } from 'vite';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  base: '/tic-tac-toe/',
  css: {
    devSourcemap: true,
  },
  postcss: {
    plugins: [autoprefixer({})],
  },
});
