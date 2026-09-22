import axios from 'axios'
import { API_BASE_URL } from '../config/env'

// ปลายทางของ API มาจากไฟล์ตั้งค่ากลาง src/config/env.js ที่อ่านค่าจาก frontend/.env
// - รันบนเครื่อง / Docker container เดียว: เว้น VITE_BACKEND_URL ว่างไว้ จะได้ '/api'
// - แยก deploy (เช่น frontend บน Vercel, backend บน Render):
//   ตั้ง VITE_BACKEND_URL = https://<backend-domain> (ไม่ต้องมี /api ต่อท้าย)

// สร้าง axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — แนบ JWT token ทุก request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pethome_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — จัดการ error กลาง
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token หมดอายุหรือไม่ถูกต้อง → ล้าง token และ redirect ไป login
      localStorage.removeItem('pethome_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
