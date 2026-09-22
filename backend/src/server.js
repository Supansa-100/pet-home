const app = require('./app')
const config = require('./config/env')
const { testConnection, ensureDatabaseExists } = require('./config/db')
const { initializeDatabase } = require('./config/initDB')
const { initCronJobs } = require('./services/sla.service')

// Start server (reloaded)
async function startServer() {
  console.log(`Starting server in ${config.nodeEnv} mode...`)

  // สร้าง database ก่อนถ้ายังไม่มี (สำคัญตอน deploy ขึ้น cloud ครั้งแรก)
  await ensureDatabaseExists()

  // ทดสอบการเชื่อมต่อฐานข้อมูลก่อนเริ่ม server
  const dbOk = await testConnection()
  if (!dbOk) {
    console.warn('⚠️ Warning: Database connection failed. Server will start but some features may not work.')
  } else {
    // กำหนดตารางในฐานข้อมูลผ่าน Backend โดยตรง
    await initializeDatabase()
  }

  // เริ่มต้นตั้งเวลา SLA Alerts Cron Job
  initCronJobs()

  const server = app.listen(config.port, () => {
    console.log(`🚀 Server is running on port ${config.port}`)
    console.log(`🔗 Health check: http://localhost:${config.port}/health`)
  })

  // จัดการ Graceful Shutdown
  const shutdown = () => {
    console.log('\n🛑 Shutting down server...')
    server.close(() => {
      console.log('Server closed.')
      process.exit(0)
    })
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

startServer()
