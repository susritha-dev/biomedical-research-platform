import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api/monarch': {
        target: 'https://api-v3.monarchinitiative.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/monarch/, '/v3/api'),
      },
      '/api/evidence': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
