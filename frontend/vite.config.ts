import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      // esbuild's minifier output IS valid JS (confirmed with `node --check`).
      // The real issue is upstream of esbuild: its identifier mangler happens
      // to rename a local variable to `of` (a legal contextual keyword) in
      // the pre-existing for-loop in src/lib/floorLayout.ts, and
      // es-module-lexer (used by vite:build-import-analysis) mis-lexes the
      // following `/` in the `for(...)` head as the start of a regex
      // literal, throwing a parse error. It's down to name-allocation luck,
      // not anything in the auth code. Terser's mangler doesn't produce `of`
      // here, so switching to it is a legitimate, effective workaround —
      // revisit after a Vite/es-module-lexer bump fixes the lexer, which is
      // the real long-term fix.
      minify: 'terser' as const,
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      // Dev-only proxy: apiService.ts now builds relative "/api/..." URLs
      // (same-origin, matching the single-service production deployment),
      // so in dev we forward those to the backend Express server directly.
      proxy: {
        '/api': {
          target: process.env.VITE_API_URL || 'http://localhost:4000',
          changeOrigin: true,
        },
      },
    },
  };
});
