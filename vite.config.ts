import adapter from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import stylex from '@stylexjs/unplugin';

export default defineConfig({
  plugins: [
    sveltekit({
      adapter: adapter({ runtime: 'nodejs24.x', maxDuration: 60 }),
      experimental: { remoteFunctions: true },
      compilerOptions: { experimental: { async: true } }
    }),
    { ...stylex.vite({ useCSSLayers: true }), enforce: undefined, transformIndexHtml: undefined }
  ],
  server: { host: '0.0.0.0' }
});
