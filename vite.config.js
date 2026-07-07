import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import compression from 'vite-plugin-compression'

const backendTarget = 'http://localhost:3001'
const proxyOpts = { target: backendTarget, changeOrigin: true, secure: false }

export default defineConfig({
  plugins: [
    react(),
    compression({ algorithm: 'gzip', threshold: 1024 }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/') || id.includes('node_modules/react-router')) {
            return 'vendor'
          }
          if (id.includes('node_modules/@mui')) {
            return 'mui'
          }
          if (id.includes('node_modules/@tanstack')) {
            return 'query'
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
    sourcemap: false,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
  server: {
    proxy: {
      '/auth': proxyOpts,
      '/products': proxyOpts,
      '/cart': proxyOpts,
      '/orders': proxyOpts,
      '/user': proxyOpts,
      '/admin': proxyOpts,
      '/uploads': proxyOpts,
      '/reviews': proxyOpts,
      '/wishlist': proxyOpts,
      '/coupons': proxyOpts,
      '/collections': proxyOpts,
    }
  }
})
