import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// @ts-ignore
import { bundle } from './bundle';
import * as path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  base: '',
  plugins: [
    react(),
    bundle()
  ],
  resolve: {
    alias: {
      '@isomorphic': path.resolve(__dirname, '../playwright-core/src/utils/isomorphic'),
      '@protocol': path.resolve(__dirname, '../protocol/src'),
      '@testIsomorphic': path.resolve(__dirname, '../playwright-core/src/utils/testIsomorphic'),
      '@trace': path.resolve(__dirname, '../trace/src'),
      '@web': path.resolve(__dirname, '../web/src'),
    },
  },
  build: {
    outDir: path.resolve(__dirname, '../playwright-core/lib/vite/traceViewer'),
    // Output dir is shared with vite.config.ts, clearing it here is racy.
    emptyOutDir: false,
    rollupOptions: {
      input: {
        sw: path.resolve(__dirname, 'src/sw.ts'),
      },
      output: {
        entryFileNames: info => '[name].bundle.js',
        assetFileNames: () => '[name].[hash][extname]',
        manualChunks: undefined,
      },
    },
  }
});
