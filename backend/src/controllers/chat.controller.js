const { pool } = require('../config/db')

// 1. ดึงรายการห้องแชทของตนเอง
exports.getMyRooms = async (req, res, next) => {
  try {
    const userId = req.user.id

    const [rooms] = await pool.query(`
      SELECT cr.*, 
             p.name as pet_name, 
             (SELECT image_url FROM pet_images WHERE listing_id = p.id AND is_primary = 1 LIMIT 1) as pet_image,
             IF(cr.poster_id = ?, u_adopter.full_name, u_poster.full_name) as other_party_name,
             IF(cr.poster_id = ?, u_adopter.avatar_url, u_poster.avatar_url) as other_party_avatar,
             (SELECT message FROM chat_messages WHERE room_id = cr.id ORDER BY created_at DESC LIMIT 1) as last_message,
             (SELECT created_at FROM chat_messages WHERE room_id = cr.id ORDER BY created_at DESC LIMIT 1) as last_message_time,
             (SELECT COUNT(*) FROM chat_messages WHERE room_id = cr.id AND sender_id != ? AND is_read = 0) as unread_count
      FROM chat_rooms cr
      JOIN pet_listings p ON cr.listing_id = p.id
      JOIN users u_poster ON cr.poster_id = u_poster.id
      JOIN users u_adopter ON cr.adopter_id = u_adopter.id
      WHERE cr.poster_id = ? OR cr.adopter_id = ?
      ORDER BY last_message_time DESC, cr.created_at DESC
    `, [userId, userId, userId, userId, userId])

    res.json({ success: true, data: rooms })
  } catch (error) {
    next(error)
  }
}

// 2. ดึงข้อความในห้องแชท
exports.getRoomMessages = async (req, res, next) => {
  try {
    const roomId = req.params.id
    const userId = req.user.id

    // ตรวจสอบสิทธิ์
    const [rooms] = await pool.query('SELECT poster_id, adopter_id, listing_id FROM chat_rooms WHERE id = ?', [roomId])
    if (rooms.length === 0) return res.status(404).json({ success: false, message: 'ไม่พบห้องแชท' })
    
    const room = rooms[0]
    if (room.poster_id !== userId && room.adopter_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์เข้าถึงห้องแชทนี้' })
    }

    // ดึงข้อความ
    const [messages] = await pool.query(`
      SELECT * FROM chat_messages 
      WHERE room_id = ? 
      ORDER BY created_at ASC
    `, [roomId])

    // ดึงรายละเอียดประกาศและอีกฝ่าย
    const [petDetails] = await pool.query('SELECT name, status FROM pet_listings WHERE id = ?', [room.listing_id])
    const otherPartyId = room.poster_id === userId ? room.adopter_id : room.poster_id
    const [otherPartyDetails] = await pool.query('SELECT full_name, avatar_url, phone FROM users WHERE id = ?', [otherPartyId])

    res.json({ 
      success: true, 
      data: {
        messages,
        pet: petDetails[0],
        other_party: otherPartyDetails[0]
      }
    })
  } catch (error) {
    next(error)
  }
}

// 3. ส่งข้อความ
exports.sendMessage = async (req, res, next) => {
  try {
    const roomId = req.params.id
    const userId = req.user.id
    const { message } = req.body

    if (!message || message.trim() === '') {
      return res.status(400).json({ success: false, message: 'กรุณากรอกข้อความ' })
    }

    // ตรวจสอบสิทธิ์
    const [rooms] = await pool.query('SELECT poster_id, adopter_id FROM chat_rooms WHERE id = ?', [roomId])
    if (rooms.length === 0) return res.status(404).json({ success: false, message: 'ไม่พบห้องแชท' })
    
    const room = rooms[0]
    if (room.poster_id !== userId && room.adopter_id !== userId) {
      return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์ส่งข้อความในห้องนี้' })
    }

    // บันทึกข้อความ
    const [result] = await pool.query(
      'INSERT INTO chat_messages (room_id, sender_id, message) VALUES (?, ?, ?)',
      [roomId, userId, message]
    )

    // ดึงข้อความที่เพิ่งส่งกลับไปให้
    const [newMessage] = await pool.query('SELECT * FROM chat_messages WHERE id = ?', [result.insertId])

    // Update room's updated_at
    await pool.query('UPDATE chat_rooms SET updated_at = NOW() WHERE id = ?', [roomId])

    // แจ้งเตือนผู้รับข้อความ (Debounce 15 นาที ป้องกันการสแปมแจ้งเตือนทุกข้อความ)
    const recipientId = room.poster_id === userId ? room.adopter_id : room.poster_id
    const [recentNotif] = await pool.query(`
      SELECT id FROM notifications 
      WHERE user_id = ? 
        AND type = 'chat_message' 
        AND reference_id = ? 
        AND created_at >= NOW() - INTERVAL 15 MINUTE
      LIMIT 1
    `, [recipientId, roomId])

    if (recentNotif.length === 0) {
      const [senderUser] = await pool.query('SELECT full_name FROM users WHERE id = ?', [userId])
      const [petData] = await pool.query('SELECT name FROM pet_listings WHERE id = ?', [room.listing_id])
      const senderName = senderUser[0]?.full_name || 'คู่สนทนา'
      const petName = petData[0]?.name || 'สัตว์เลี้ยง'

      await pool.query(`
        INSERT INTO notifications (user_id, type, reference_id, message)
        VALUES (?, 'chat_message', ?, ?)
      `, [
        recipientId,
        roomId,
        `คุณมีข้อความใหม่จาก ${senderName} เกี่ยวกับ "${petName}"`
      ])
    }

    res.status(201).json({ success: true, data: newMessage[0] })
  } catch (error) {
    next(error)
  }
}

// 4. Mark as read
exports.markAsRead = async (req, res, next) => {
  try {
    const roomId = req.params.id
    const userId = req.user.id

    // อัปเดตข้อความทั้งหมดในห้องนี้ที่คนอื่นส่ง และยังไม่ได้อ่าน ให้เป็นอ่านแล้ว
    await pool.query(
      'UPDATE chat_messages SET is_read = 1 WHERE room_id = ? AND sender_id != ? AND is_read = 0',
      [roomId, userId]
    )

    res.json({ success: true, message: 'Marked as read' })
  } catch (error) {
    next(error)
  }
}

// 5. นับข้อความที่ยังไม่อ่านรวม
exports.getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id
    const [result] = await pool.query(`
      SELECT COUNT(*) as unread_count
      FROM chat_messages cm
      JOIN chat_rooms cr ON cm.room_id = cr.id
      WHERE (cr.poster_id = ? OR cr.adopter_id = ?)
        AND cm.sender_id != ?
        AND cm.is_read = 0
    `, [userId, userId, userId])
    
    res.json({ success: true, data: { unread_count: result[0].unread_count } })
  } catch (error) {
    next(error)
  }
}
