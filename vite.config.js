import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: '/dhailshop-pwa-fixed/',
    root: resolve(__dirname, 'src'),
    publicDir: resolve(__dirname, 'src/public'),
    build: {
      outDir: resolve(__dirname, 'dist'),
      emptyOutDir: true,
      rollupOptions: {
        input: resolve(__dirname, 'src/index.html'),
      },
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    define: {
      'import.meta.env.VITE_VAPID_KEY_PUBLIC': JSON.stringify(env.VITE_VAPID_KEY_PUBLIC),
    },
    server: {
      port: 5173,
      open: true,
    },
  };
});
