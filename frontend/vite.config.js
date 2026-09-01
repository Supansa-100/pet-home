import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // รองรับ Docker
    port: 5173,
    proxy: {
      // ส่งคำขอ /api/* ไปยัง backend
      '/api': {
        target: 'http://backend:5001',
        changeOrigin: true,
      },
      // ส่งคำขอ /uploads/* ไปยัง backend
      '/uploads': {
        target: 'http://backend:5001',
        changeOrigin: true,
      },
    },
  },
})
