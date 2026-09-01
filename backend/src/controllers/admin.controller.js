const { pool } = require('../config/db')

exports.getDashboardStats = async (req, res, next) => {
  try {
    const [users] = await pool.query('SELECT COUNT(*) as count FROM users')
    const [listings] = await pool.query('SELECT COUNT(*) as count FROM pet_listings')
    const [requests] = await pool.query('SELECT COUNT(*) as count FROM adoption_requests')
    const [chats] = await pool.query('SELECT COUNT(*) as count FROM chat_rooms')

    res.json({
      success: true,
      data: {
        totalUsers: users[0].count,
        totalListings: listings[0].count,
        totalRequests: requests[0].count,
        totalChats: chats[0].count
      }
    })
  } catch (error) {
    next(error)
  }
}

exports.getAllUsers = async (req, res, next) => {
  try {
    const [users] = await pool.query(`
      SELECT id, email, full_name, phone, role, avatar_url, is_banned, created_at
      FROM users
      ORDER BY created_at DESC
    `)
    res.json({ success: true, data: users })
  } catch (error) {
    next(error)
  }
}

exports.toggleUserBan = async (req, res, next) => {
  try {
    const { id } = req.params
    
    // ป้องกันแอดมินแบนตัวเอง
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'ไม่สามารถแบนตัวเองได้' })
    }

    const [user] = await pool.query('SELECT is_banned FROM users WHERE id = ?', [id])
    if (user.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้' })
    }

    const newStatus = user[0].is_banned ? 0 : 1
    await pool.query('UPDATE users SET is_banned = ? WHERE id = ?', [newStatus, id])

    res.json({ 
      success: true, 
      message: newStatus ? 'แบนผู้ใช้สำเร็จ' : 'ปลดแบนผู้ใช้สำเร็จ',
      is_banned: newStatus
    })
  } catch (error) {
    next(error)
  }
}

exports.getAllListings = async (req, res, next) => {
  try {
    // เอาทั้งหมด รวมที่ถูกซ่อนด้วย
    const [listings] = await pool.query(`
      SELECT p.*, c.name as category_name, u.full_name as owner_name, u.email as owner_email
      FROM pet_listings p
      LEFT JOIN pet_categories c ON p.category_id = c.id
      LEFT JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `)
    res.json({ success: true, data: listings })
  } catch (error) {
    next(error)
  }
}
