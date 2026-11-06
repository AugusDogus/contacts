import adapter from '@sveltejs/adapter-vercel';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import stylex from '@stylexjs/unplugin';

export default defineConfig({
  plugins: [
    sveltekit({
      adapter: adapter({ runtime: 'nodejs24.x', maxDuration: 60 }),
      // Cross-site form protection lives in hooks.server.ts so OAuth clients can reach the token endpoint.
      csrf: { trustedOrigins: ['*'] },
      experimental: { remoteFunctions: true },
      compilerOptions: { experimental: { async: true } }
    }),
    { ...stylex.vite({ useCSSLayers: true }), enforce: undefined, transformIndexHtml: undefined }
  ],
  server: { host: '0.0.0.0' }
});
