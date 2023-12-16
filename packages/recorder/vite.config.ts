import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      '@isomorphic': path.resolve(__dirname, '../playwright-core/src/utils/isomorphic'),
      '@protocol': path.resolve(__dirname, '../protocol/src'),
      '@web': path.resolve(__dirname, '../web/src'),
    },
  },
  build: {
    outDir: path.resolve(__dirname, '../playwright-core/lib/vite/recorder'),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  }
});
