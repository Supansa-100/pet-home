const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { pool } = require('../config/db')
const config = require('../config/env')

// สร้าง Token ย่อเพื่อให้เรียกใช้ได้ง่าย
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  })
}

// 1. สมัครสมาชิก
exports.register = async (req, res, next) => {
  try {
    const { email, password, full_name, phone, role } = req.body

    if (!email || !password || !full_name) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบถ้วน (Email, Password, Full Name)' })
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' })
    }

    const assignedRole = role === 'poster' ? 'poster' : 'adopter'

    // ตรวจสอบว่า email ซ้ำหรือไม่
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email])
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'อีเมลนี้ถูกใช้งานแล้ว' })
    }

    // แฮชรหัสผ่าน
    const hashedPassword = await bcrypt.hash(password, 12)

    // บันทึกลงฐานข้อมูล
    const [result] = await pool.query(
      'INSERT INTO users (email, password_hash, full_name, phone, role) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, full_name, phone || null, assignedRole]
    )

    res.status(201).json({
      success: true,
      message: 'สมัครสมาชิกสำเร็จ',
    })
  } catch (error) {
    next(error)
  }
}

// 2. เข้าสู่ระบบ
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกอีเมลและรหัสผ่าน' })
    }

    // ค้นหาผู้ใช้งานจากอีเมล
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email])
    const user = users[0]

    if (!user) {
      return res.status(401).json({ success: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' })
    }

    if (user.is_banned) {
      return res.status(403).json({ success: false, message: 'บัญชีของคุณถูกระงับการใช้งาน' })
    }

    // ตรวจสอบรหัสผ่าน
    const isMatch = await bcrypt.compare(password, user.password_hash)
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' })
    }

    // สร้าง Token
    const token = generateToken(user.id, user.role)

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        avatar_url: user.avatar_url,
      },
    })
  } catch (error) {
    next(error)
  }
}

// 3. ดูข้อมูลตัวเอง (Get Me)
exports.getMe = async (req, res, next) => {
  try {
    const [users] = await pool.query(
      'SELECT id, email, full_name, phone, role, avatar_url, created_at FROM users WHERE id = ?',
      [req.user.id]
    )
    const user = users[0]

    if (!user) {
      return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลผู้ใช้' })
    }

    res.json({ success: true, user })
  } catch (error) {
    next(error)
  }
}

// 4. อัปเดตโปรไฟล์
exports.updateProfile = async (req, res, next) => {
  try {
    const { full_name, phone, avatar_url } = req.body

    await pool.query(
      'UPDATE users SET full_name = COALESCE(?, full_name), phone = COALESCE(?, phone), avatar_url = COALESCE(?, avatar_url) WHERE id = ?',
      [full_name, phone, avatar_url, req.user.id]
    )

    res.json({ success: true, message: 'อัปเดตข้อมูลสำเร็จ' })
  } catch (error) {
    next(error)
  }
}

// 5. เปลี่ยนรหัสผ่าน
exports.changePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body

    if (!current_password || !new_password || new_password.length < 8) {
      return res.status(400).json({ success: false, message: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร' })
    }

    const [users] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id])
    const user = users[0]

    const isMatch = await bcrypt.compare(current_password, user.password_hash)
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'รหัสผ่านปัจจุบันไม่ถูกต้อง' })
    }

    const hashedNewPassword = await bcrypt.hash(new_password, 12)
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedNewPassword, req.user.id])

    res.json({ success: true, message: 'เปลี่ยนรหัสผ่านสำเร็จ' })
  } catch (error) {
    next(error)
  }
}
