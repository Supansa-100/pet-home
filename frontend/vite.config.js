import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// ปลายทางของ backend: รันบนเครื่องใช้ 127.0.0.1 แต่ถ้ารันใน Docker ให้ตั้ง
// VITE_PROXY_TARGET=http://backend:5001 เพื่อชี้ไปที่ service ชื่อ backend
const proxyTarget = process.env.VITE_PROXY_TARGET || 'http://127.0.0.1:5001'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // รองรับ Docker
    port: 5173,
    proxy: {
      // ส่งคำขอ /api/* ไปยัง backend
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
      },
      // ส่งคำขอ /uploads/* ไปยัง backend
      '/uploads': {
        target: proxyTarget,
        changeOrigin: true,
      },
    },
  },
})
