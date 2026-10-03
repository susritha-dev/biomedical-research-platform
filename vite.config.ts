import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/monarch': {
        target: 'https://api-v3.monarchinitiative.org/v3/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/monarch/, ''),
      },
  plugins: [
    react(),
  ],

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
