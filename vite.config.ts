
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { sentryVitePlugin } from '@sentry/vite-plugin';

  export default defineConfig({
  envDir: path.resolve(__dirname, 'env'),
    plugins: [
      react(),
      visualizer({
        filename: 'dist/stats.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
      }),
      // Временно отключаем Sentry plugin до настройки проекта
      // sentryVitePlugin({
      //   org: 'buro-hi',
      //   project: 'crm-3-0',
      //   authToken: process.env.SENTRY_AUTH_TOKEN,
      //   sourcemaps: {
      //     assets: './build/**',
      //   },
      // }),
    ],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  build: {
    target: 'esnext',
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          // Выделяем vendor библиотеки в отдельные чанки
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'radix-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-popover',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-avatar'
          ],
          'ui-vendor': ['lucide-react', 'clsx'],
          'chart-vendor': ['recharts'],
          'form-vendor': ['react-hook-form'],
        },
      },
    },
    // Увеличиваем лимит для предупреждения о размере чанков
    chunkSizeWarningLimit: 1000,
    // Минификация
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Убираем console.log в продакшене
        drop_debugger: true,
      },
    },
  },
    server: {
      port: 3000,
      open: true,
    },
  });