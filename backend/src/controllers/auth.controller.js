const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { pool } = require('../config/db')
const config = require('../config/env')
const { sendPasswordResetEmail } = require('../services/email.service')

// อายุของลิงก์รีเซ็ตรหัสผ่าน (นาที)
const RESET_TOKEN_TTL_MINUTES = 60

// เก็บเฉพาะค่า hash ของ token ลงฐานข้อมูล ไม่เก็บตัวจริง
const hashResetToken = (token) => crypto.createHash('sha256').update(token).digest('hex')

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

// 2.1 ลืมรหัสผ่าน — ส่งลิงก์ตั้งรหัสผ่านใหม่ไปทางอีเมล
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกอีเมล' })
    }

    // ตอบข้อความเดียวกันเสมอ ไม่ว่าอีเมลจะมีในระบบหรือไม่
    // เพื่อไม่ให้ผู้ไม่หวังดีใช้หน้านี้ไล่เดาว่าอีเมลไหนสมัครไว้แล้วบ้าง
    const genericResponse = {
      success: true,
      message: 'หากอีเมลนี้มีอยู่ในระบบ เราได้ส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปให้แล้ว กรุณาตรวจสอบกล่องจดหมาย'
    }

    const [users] = await pool.query('SELECT id, email, full_name, is_banned FROM users WHERE email = ?', [email])
    const user = users[0]

    if (!user || user.is_banned) {
      return res.json(genericResponse)
    }

    // ยกเลิก token เดิมที่ยังไม่ถูกใช้ เพื่อให้มีลิงก์ที่ใช้ได้เพียงอันล่าสุด
    await pool.query(
      'UPDATE password_resets SET used_at = NOW() WHERE user_id = ? AND used_at IS NULL',
      [user.id]
    )

    const token = crypto.randomBytes(32).toString('hex')

    await pool.query(
      'INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?, ?, NOW() + INTERVAL ? MINUTE)',
      [user.id, hashResetToken(token), RESET_TOKEN_TTL_MINUTES]
    )

    await sendPasswordResetEmail({
      toEmail: user.email,
      toName: user.full_name,
      token,
      expiresInMinutes: RESET_TOKEN_TTL_MINUTES
    })

    res.json(genericResponse)
  } catch (error) {
    next(error)
  }
}

// 2.2 ตั้งรหัสผ่านใหม่ด้วย token จากอีเมล
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, new_password } = req.body

    if (!token || !new_password) {
      return res.status(400).json({ success: false, message: 'ข้อมูลไม่ครบถ้วน' })
    }

    if (new_password.length < 8) {
      return res.status(400).json({ success: false, message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' })
    }

    const [rows] = await pool.query(
      `SELECT id, user_id FROM password_resets
       WHERE token_hash = ? AND used_at IS NULL AND expires_at > NOW()
       LIMIT 1`,
      [hashResetToken(token)]
    )

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'ลิงก์ไม่ถูกต้องหรือหมดอายุแล้ว กรุณาขอลิงก์ใหม่อีกครั้ง'
      })
    }

    const resetRecord = rows[0]
    const hashedPassword = await bcrypt.hash(new_password, 12)

    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, resetRecord.user_id])

    // ทำเครื่องหมายว่า token ถูกใช้แล้ว เพื่อไม่ให้นำลิงก์เดิมมาใช้ซ้ำ
    await pool.query('UPDATE password_resets SET used_at = NOW() WHERE id = ?', [resetRecord.id])

    res.json({ success: true, message: 'ตั้งรหัสผ่านใหม่สำเร็จ กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่' })
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

    const updates = []
    const values = []

    if (full_name !== undefined) {
      updates.push('full_name = ?')
      values.push(full_name)
    }
    if (phone !== undefined) {
      updates.push('phone = ?')
      values.push(phone)
    }
    if (avatar_url !== undefined) {
      updates.push('avatar_url = ?')
      values.push(avatar_url || null)
    }

    if (updates.length > 0) {
      values.push(req.user.id)
      await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values)
    }

    const [updatedUsers] = await pool.query(
      'SELECT id, email, full_name, phone, role, avatar_url, created_at FROM users WHERE id = ?',
      [req.user.id]
    )

    res.json({
      success: true,
      message: 'อัปเดตข้อมูลสำเร็จ',
      user: updatedUsers[0]
    })
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
