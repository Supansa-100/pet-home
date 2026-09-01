const jwt = require('jsonwebtoken')
const config = require('../config/env')

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'ไม่พบ Token ในระบบ หรือรูปแบบไม่ถูกต้อง',
    })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, config.jwt.secret)
    req.user = decoded // เก็บข้อมูล user (id, role) ไว้ใช้ใน controller ถัดไป
    next()
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token ไม่ถูกต้องหรือหมดอายุแล้ว',
    })
  }
}

const verifyAdmin = (req, res, next) => {
  // ต้องผ่าน verifyToken มาก่อน ดังนั้น req.user ควรจะมีอยู่แล้ว
  if (req.user && req.user.role === 'admin') {
    next()
  } else {
    return res.status(403).json({
      success: false,
      message: 'คุณไม่มีสิทธิ์เข้าถึงส่วนนี้ (Admin เท่านั้น)'
    })
  }
}

module.exports = { verifyToken, verifyAdmin }
