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
  timezone: 'Z',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

if (config.db.ssl) {
  poolConfig.ssl = { rejectUnauthorized: true }
}

const pool = mysql.createPool(poolConfig)

// สร้าง database ถ้ายังไม่มี
// จำเป็นตอน deploy ขึ้น cloud ครั้งแรก (เช่น TiDB Cloud) เพราะ pool ด้านบน
// ระบุชื่อ database ไว้ตั้งแต่ตอนเชื่อมต่อ ถ้า database ยังไม่ถูกสร้างจะต่อไม่ติด
// และ server จะข้ามขั้นตอนสร้างตารางไปทั้งหมด
async function ensureDatabaseExists() {
  let connection
  try {
    // เชื่อมต่อแบบไม่ระบุ database
    const { database, ...configWithoutDb } = poolConfig
    connection = await mysql.createConnection(configWithoutDb)

    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${config.db.name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    )
    return true
  } catch (error) {
    console.warn(`⚠️ ไม่สามารถตรวจสอบ/สร้าง database ได้: ${error.message}`)
    return false
  } finally {
    if (connection) await connection.end()
  }
}

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

module.exports = { pool, testConnection, ensureDatabaseExists }
