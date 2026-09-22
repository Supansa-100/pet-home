const path = require('path')
const fs = require('fs')
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
// FRONTEND_URL รับได้หลายค่าโดยคั่นด้วยคอมมา เผื่อกรณีแยก deploy
// (เช่น frontend อยู่บน Vercel ที่มีทั้งโดเมน production และโดเมน preview)
const allowedOrigins = require('./config/env').frontendUrl
  .split(',')
  .map((url) => url.trim().replace(/\/$/, ''))
  .filter(Boolean)

if (!allowedOrigins.includes('http://localhost:5173')) {
  allowedOrigins.push('http://localhost:5173')
}

app.use(
  cors({
    origin: (origin, callback) => {
      // ไม่มี origin = เรียกจาก Postman/curl หรือเป็น request จากโดเมนเดียวกัน
      if (!origin) return callback(null, true)

      const normalized = origin.replace(/\/$/, '')
      if (allowedOrigins.includes(normalized)) return callback(null, true)

      // อนุญาต preview deployment ของ Vercel ที่ URL เปลี่ยนทุกครั้งที่ push
      if (process.env.ALLOW_VERCEL_PREVIEWS === 'true' && /^https:\/\/[\w-]+\.vercel\.app$/.test(normalized)) {
        return callback(null, true)
      }

      return callback(new Error(`CORS: ไม่อนุญาตให้เรียกจาก ${origin}`))
    },
    credentials: true,
  })
)

// Parse JSON and urlencoded body
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// ─── Serve static files ──────────────────────────────────────────────────────
// สำหรับเสิร์ฟไฟล์รูปภาพอัปโหลด
app.use('/uploads', express.static('uploads'))

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

const masterRoutes = require('./routes/master.routes')
app.use('/api/master', masterRoutes)

const dashboardRoutes = require('./routes/dashboard.routes')
app.use('/api/dashboard', dashboardRoutes)

const requestRoutes = require('./routes/request.routes')
app.use('/api/requests', requestRoutes)

const chatRoutes = require('./routes/chat.routes')
app.use('/api/chat', chatRoutes)

const adminRoutes = require('./routes/admin.routes')
app.use('/api/admin', adminRoutes)

const notificationRoutes = require('./routes/notification.routes')
app.use('/api/notifications', notificationRoutes)

// ─── 404 & Error Handlers ────────────────────────────────────────────────────

// จับ API route ที่ไม่มีอยู่
app.use('/api', notFound)

// ─── Serve React Build (Production / Single Container) ───────────────────────
// ถ้ามีโฟลเดอร์ public (ถูกคัดลอกมาจาก Stage build ของ Dockerfile) ให้เสิร์ฟหน้าเว็บด้วย
const clientDir = path.join(__dirname, '../public')

if (fs.existsSync(path.join(clientDir, 'index.html'))) {
  app.use(express.static(clientDir))

  // SPA catch-all: ทุก path ที่ไม่ใช่ /api ให้คืน index.html
  // เพื่อให้กด Refresh ที่หน้าลูก (เช่น /listings/123) แล้วไม่เจอ 404
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDir, 'index.html'))
  })

  console.log('🌐 Serving React build from', clientDir)
}

// Global Error Handler (ต้องอยู่สุดท้าย)
app.use(errorHandler)

module.exports = app
