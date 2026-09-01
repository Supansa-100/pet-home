const mysql = require('mysql2/promise')
const config = require('./env')

// สร้าง connection pool
const poolConfig = {
  host: config.db.host,
  port: config.db.port,
  database: config.db.name,
  user: config.db.user,
  password: config.db.password,
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

if (config.db.ssl) {
  poolConfig.ssl = { rejectUnauthorized: true }
}

const pool = mysql.createPool(poolConfig)

// ทดสอบการเชื่อมต่อ
async function testConnection() {
  try {
    const connection = await pool.getConnection()
    console.log(`✅ MySQL connected: ${config.db.host}:${config.db.port}/${config.db.name}`)
    connection.release()
    return true
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message)
    return false
  }
}

module.exports = { pool, testConnection }
