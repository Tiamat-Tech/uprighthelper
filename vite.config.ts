import { defineConfig } from 'vite';

export default defineConfig({
  base: '/uprighthelper/',
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: [
      '@tensorflow/tfjs',
      '@tensorflow/tfjs-backend-webgl',
      '@tensorflow-models/pose-detection',
    ],
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          tensorflow: [
            '@tensorflow/tfjs',
            '@tensorflow/tfjs-backend-webgl',
            '@tensorflow-models/pose-detection',
          ],
        },
      },
    },
  },
});
