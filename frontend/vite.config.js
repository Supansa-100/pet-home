import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // โหลดค่าจากไฟล์ .env เข้ามาเอง เพราะ Vite ไม่ได้ใส่ค่าเหล่านี้ลงใน process.env
  // ถ้าไม่ทำขั้นตอนนี้ การตั้ง VITE_PROXY_TARGET ในไฟล์ .env จะไม่มีผลใดๆ แบบเงียบๆ
  const env = loadEnv(mode, process.cwd(), '')

  // ปลายทางของ backend สำหรับ dev server เรียงลำดับความสำคัญ:
  //   1. ไฟล์ frontend/.env
  //   2. environment variable จริงของเครื่อง (docker-compose ส่งค่านี้เข้ามา)
  //   3. ค่าปริยายสำหรับรันบนเครื่องตัวเอง
  const proxyTarget =
    env.VITE_PROXY_TARGET || process.env.VITE_PROXY_TARGET || 'http://127.0.0.1:5001'

  return {
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
  }
})
