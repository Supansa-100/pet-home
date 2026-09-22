import axios from 'axios'

// ปลายทางของ API
// - รันบนเครื่อง / Docker container เดียว: ไม่ต้องตั้งค่า ใช้ '/api' บนโดเมนเดียวกัน
// - แยก deploy (เช่น frontend บน Vercel, backend บน Render):
//   ตั้ง VITE_API_URL = https://<backend-domain>/api ตอน build
const baseURL = import.meta.env.VITE_API_URL || '/api'

// สร้าง axios instance
const api = axios.create({
  baseURL,
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
