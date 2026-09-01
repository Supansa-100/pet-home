const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const errorHandler = require('./middlewares/errorHandler')
const notFound = require('./middlewares/notFound')
const { testConnection } = require('./config/db')

const app = express()

// Security headers
app.use(helmet())

// CORS
app.use(cors())

// Parse JSON and urlencoded body
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ─── Serve static files ──────────────────────────────────────────────────────
// สำหรับเสิร์ฟไฟล์รูปภาพอัปโหลด
app.use('/uploads', express.static('uploads'))
// เสิร์ฟ frontend (สำหรับ production multi-stage)
app.use(express.static('public'))

// ─── API Routes ──────────────────────────────────────────────────────────────
// Health check route
app.get('/health', async (req, res) => {
  const dbConnected = await testConnection()
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    db: dbConnected ? 'connected' : 'disconnected',
  })
})

const authRoutes = require('./routes/auth.routes')
app.use('/api/auth', authRoutes)

const petRoutes = require('./routes/pet.routes')
app.use('/api/pets', petRoutes)

const categoryRoutes = require('./routes/category.routes')
app.use('/api/categories', categoryRoutes)

const requestRoutes = require('./routes/request.routes')
app.use('/api/requests', requestRoutes)

const chatRoutes = require('./routes/chat.routes')
app.use('/api/chat', chatRoutes)

const adminRoutes = require('./routes/admin.routes')
app.use('/api/admin', adminRoutes)

const notificationRoutes = require('./routes/notification.routes')
app.use('/api/notifications', notificationRoutes)

// ─── 404 & Error Handlers ────────────────────────────────────────────────────
// Catch-all route สำหรับ Single Page Application (SPA) ให้ส่ง index.html
app.get('*', (req, res, next) => {
  // ยกเว้น API routes ถ้าไม่เจอให้เข้า 404 handler
  if (req.originalUrl.startsWith('/api/')) {
    return next()
  }
  // สำหรับ production, ถ้า req ไม่ใช่ API ให้ส่งกลับ index.html ของ frontend
  const path = require('path')
  res.sendFile(path.resolve(__dirname, '../public', 'index.html'), (err) => {
    if (err) {
      // ถ้าไม่ได้ build frontend (เช่น ตอน dev) ให้ next ไป
      next()
    }
  })
})

// จับ API route ที่ไม่มีอยู่
app.use('/api', notFound)

// Global Error Handler (ต้องอยู่สุดท้าย)
app.use(errorHandler)

module.exports = app
