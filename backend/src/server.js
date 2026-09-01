const app = require('./app')
const config = require('./config/env')
const { testConnection } = require('./config/db')

async function startServer() {
  console.log(`Starting server in ${config.nodeEnv} mode...`)

  // ทดสอบการเชื่อมต่อฐานข้อมูลก่อนเริ่ม server
  const dbOk = await testConnection()
  if (!dbOk) {
    console.warn('⚠️ Warning: Database connection failed. Server will start but some features may not work.')
  }

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
