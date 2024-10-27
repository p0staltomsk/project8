import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/project8/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    // Важно: правильная обработка путей для assets
    rollupOptions: {
      output: {
        // Убеждаемся что все ассеты будут с правильными путями
        entryFileNames: `assets/[name].[hash].js`,
        chunkFileNames: `assets/[name].[hash].js`,
        assetFileNames: `assets/[name].[hash].[ext]`
      }
    },
    // Добавляем настройки для модулей
    modulePreload: {
      polyfill: true
    },
    // Убеждаемся что все ассеты обрабатываются правильно
    assetsInlineLimit: 0,
    sourcemap: true
  },
  envPrefix: 'VITE_',
  server: {
    cors: true
  }
})
