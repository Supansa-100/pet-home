import axios from 'axios'

// สร้าง axios instance
const api = axios.create({
  baseURL: '/api',
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
