const { pool } = require('../config/db')

// ดึงรายการแจ้งเตือนของผู้ใช้
exports.getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id

    const [notifications] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [userId]
    )

    // นับจำนวนที่ยังไม่ได้อ่าน
    const [unreadCountResult] = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
      [userId]
    )
    
    const unreadCount = unreadCountResult[0].count

    res.json({
      success: true,
      data: notifications,
      unreadCount
    })
  } catch (error) {
    next(error)
  }
}

// อัปเดตสถานะการอ่าน
exports.markAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id
    const notificationId = req.params.id

    // อ่านทั้งหมดถ้าไม่มี id
    if (notificationId === 'all') {
      await pool.query('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0', [userId])
    } else {
      await pool.query('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [notificationId, userId])
    }

    res.json({ success: true, message: 'อัปเดตสถานะสำเร็จ' })
  } catch (error) {
    next(error)
  }
}
