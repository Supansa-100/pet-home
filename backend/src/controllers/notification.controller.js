const { pool } = require('../config/db')

// แจ้งเตือนรายข้อความของแชท จะไม่ขึ้นที่กระดิ่ง เพราะซ้ำซ้อนกับ badge ที่ไอคอนแชท
// (ยังบันทึกลงฐานข้อมูลตามเดิม และยังนับรวมตอนกด "อ่านทั้งหมด")
// หมายเหตุ: 'new_message' เป็นชื่อ type เดิมที่เคยใช้ จึงต้องกรองด้วยเพื่อให้ข้อมูลเก่าไม่โผล่
const CHAT_NOTIFICATION_TYPES = ['chat_message', 'new_message']

// ดึงรายการแจ้งเตือนของผู้ใช้ (ไม่รวมแจ้งเตือนรายข้อความของแชท)
exports.getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id

    const [notifications] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? AND type NOT IN (?) ORDER BY created_at DESC LIMIT 50',
      [userId, CHAT_NOTIFICATION_TYPES]
    )

    // นับจำนวนที่ยังไม่ได้อ่าน (ต้องกรองชนิดเดียวกัน ไม่งั้นตัวเลขบน badge จะไม่ตรงกับรายการ)
    const [unreadCountResult] = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0 AND type NOT IN (?)',
      [userId, CHAT_NOTIFICATION_TYPES]
    )
    
    const unreadCount = Number(unreadCountResult[0]?.count) || 0

    res.json({
      success: true,
      data: notifications,
      unreadCount
    })
  } catch (error) {
    next(error)
  }
}

// มาร์คว่าอ่านแล้วทั้งหมด
exports.markAllAsRead = async (req, res, next) => {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0',
      [req.user.id]
    )
    res.json({ success: true, message: 'อ่านการแจ้งเตือนทั้งหมดแล้ว' })
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
