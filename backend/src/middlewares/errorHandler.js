// Global error handler middleware
// ต้องลงทะเบียนเป็น middleware ตัวสุดท้ายใน app.js
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message)
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack)
  }

  const statusCode = err.statusCode || err.status || 500
  const message = err.message || 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์'

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

module.exports = errorHandler
