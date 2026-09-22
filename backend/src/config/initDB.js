const fs = require('fs')
const path = require('path')
const { pool } = require('./db')

async function initializeDatabase() {
  console.log('⏳ Running database initialization...')
  
  const initDir = path.join(__dirname, '../../db/init')
  
  try {
    if (!fs.existsSync(initDir)) {
      console.warn(`⚠️ Init directory not found at ${initDir}. Skipping DB initialization.`)
      return
    }

    // ไฟล์ที่ชื่อมีคำว่า seed คือข้อมูลจำลองสำหรับทดสอบ (สัตว์เลี้ยงปลอม, บัญชี password123)
    // บน production ต้องไม่รันโดยอัตโนมัติ ไม่งั้นข้อมูลจริงจะปนกับข้อมูลปลอม
    // ถ้าต้องการข้อมูลตัวอย่างสำหรับเดโม ให้ตั้ง SEED_DEMO_DATA=true
    const isProduction = process.env.NODE_ENV === 'production'
    const allowSeed = process.env.SEED_DEMO_DATA === 'true'
    const skipSeedFiles = isProduction && !allowSeed

    const files = fs.readdirSync(initDir)
      .filter(file => file.endsWith('.sql'))
      .filter(file => {
        if (skipSeedFiles && file.includes('seed')) {
          console.log(`⏭️  ข้าม ${file} (ข้อมูลจำลอง ไม่รันบน production)`)
          return false
        }
        return true
      })
      .sort() // เรียงลำดับไฟล์ตามชื่อ 01-..., 02-...

    if (files.length === 0) {
      console.log('✅ No SQL initialization files found.')
      return
    }

    for (const file of files) {
      console.log(`📄 Executing ${file}...`)
      const filePath = path.join(initDir, file)
      let sqlContent = fs.readFileSync(filePath, 'utf-8')
      
      // ลบ comments และบรรทัดว่างออกเพื่อหลีกเลี่ยงปัญหา parser
      // แยกคำสั่ง SQL แต่ละอันด้วย ; (อาจจะไม่สมบูรณ์แบบสำหรับ trigger หรือ procedure ที่ใช้ DELIMITER)
      const statements = sqlContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0)

      const connection = await pool.getConnection()
      try {
        await connection.beginTransaction()
        for (const stmt of statements) {
          if (stmt) {
            await connection.query(stmt)
          }
        }
        await connection.commit()
        console.log(`✅ Successfully executed ${file}`)
      } catch (err) {
        await connection.rollback()
        console.error(`❌ Error executing ${file}:`, err.message)
        throw err
      } finally {
        connection.release()
      }
    }
    console.log('🎉 Database initialization complete!')
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message)
  }
}

module.exports = { initializeDatabase }
