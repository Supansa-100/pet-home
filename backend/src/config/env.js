require('dotenv').config()

const requiredEnvVars = [
  'DB_HOST',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'JWT_SECRET',
  'FRONTEND_URL'
]

// ตรวจสอบอย่างเคร่งครัดว่าตัวแปรที่จำเป็นต้องมี
const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar])
if (missingVars.length > 0) {
  throw new Error(`❌ Missing required environment variables: ${missingVars.join(', ')}. กรุณากำหนดในไฟล์ .env`)
}

module.exports = {
  port: process.env.PORT || 5001,
  nodeEnv: process.env.NODE_ENV || 'development',
  db: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 3306,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true',
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  frontendUrl: process.env.FRONTEND_URL,
}
