const { pool } = require('../config/db')

// 1. ส่งคำขอรับอุปการะ (Adopter)
exports.createRequest = async (req, res, next) => {
  const connection = await pool.getConnection()
  try {
    const listingId = req.params.id
    const adopterId = req.user.id
    const { message } = req.body

    if (!message) {
      return res.status(400).json({ success: false, message: 'กรุณากรอกข้อความแนะนำตัว' })
    }

    await connection.beginTransaction()

    // เช็คว่า listing มีอยู่และ status เป็น available
    const [listings] = await connection.query('SELECT user_id, status FROM pet_listings WHERE id = ?', [listingId])
    if (listings.length === 0) {
      await connection.rollback()
      return res.status(404).json({ success: false, message: 'ไม่พบประกาศ' })
    }

    if (listings[0].status !== 'available') {
      await connection.rollback()
      return res.status(400).json({ success: false, message: 'ประกาศนี้ไม่เปิดรับอุปการะแล้ว' })
    }
    
    // ห้ามเจ้าของส่งคำขอเอง
    if (listings[0].user_id === adopterId) {
      await connection.rollback()
      return res.status(400).json({ success: false, message: 'ไม่สามารถส่งคำขอให้ประกาศของตัวเองได้' })
    }

    // เช็คว่าเคยส่งคำขอที่ยัง pending/approved อยู่หรือไม่
    const [existing] = await connection.query(
      'SELECT id FROM adoption_requests WHERE listing_id = ? AND adopter_id = ? AND status IN ("pending", "approved")',
      [listingId, adopterId]
    )
    if (existing.length > 0) {
      await connection.rollback()
      return res.status(400).json({ success: false, message: 'คุณได้ส่งคำขอสำหรับประกาศนี้ไปแล้ว' })
    }

    // สร้างคำขอ
    await connection.query(
      'INSERT INTO adoption_requests (listing_id, adopter_id, message, status) VALUES (?, ?, ?, "pending")',
      [listingId, adopterId, message]
    )

    // สร้างห้องแชทอัตโนมัติ
    await connection.query(
      'INSERT INTO chat_rooms (listing_id, poster_id, adopter_id) VALUES (?, ?, ?)',
      [listingId, listings[0].user_id, adopterId]
    )

    // แจ้งเตือนเจ้าของประกาศ
    await connection.query(
      'INSERT INTO notifications (user_id, type, reference_id, message) VALUES (?, ?, ?, ?)',
      [listings[0].user_id, 'adoption_request', listingId, 'มีผู้ส่งคำขอรับอุปการะสัตว์เลี้ยงของคุณ']
    )

    await connection.commit()
    res.status(201).json({ success: true, message: 'ส่งคำขอรับอุปการะสำเร็จ' })
  } catch (error) {
    await connection.rollback()
    next(error)
  } finally {
    connection.release()
  }
}

// 2. ดูคำขอทั้งหมดของประกาศ (Owner)
exports.getRequestsByPet = async (req, res, next) => {
  try {
    const listingId = req.params.id
    const userId = req.user.id

    // ตรวจสอบว่าเป็นเจ้าของประกาศ
    const [listings] = await pool.query('SELECT user_id FROM pet_listings WHERE id = ?', [listingId])
    if (listings.length === 0) return res.status(404).json({ success: false, message: 'ไม่พบประกาศ' })
    if (listings[0].user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์เข้าถึงข้อมูลนี้' })
    }

    const [requests] = await pool.query(`
      SELECT r.*, u.full_name as adopter_name, u.avatar_url as adopter_avatar, u.phone as adopter_phone
      FROM adoption_requests r
      JOIN users u ON r.adopter_id = u.id
      WHERE r.listing_id = ?
      ORDER BY r.created_at DESC
    `, [listingId])

    res.json({ success: true, data: requests })
  } catch (error) {
    next(error)
  }
}

// 3. ดูคำขอที่ตัวเองส่ง (Adopter)
exports.getMyRequests = async (req, res, next) => {
  try {
    const [requests] = await pool.query(`
      SELECT r.*, p.name as pet_name, p.status as pet_status,
             (SELECT image_url FROM pet_images WHERE listing_id = p.id AND is_primary = 1 LIMIT 1) as pet_image
      FROM adoption_requests r
      JOIN pet_listings p ON r.listing_id = p.id
      WHERE r.adopter_id = ?
      ORDER BY r.created_at DESC
    `, [req.user.id])

    res.json({ success: true, data: requests })
  } catch (error) {
    next(error)
  }
}

// 3.1 ดูรายละเอียดคำขอรายตัว (ดูได้เฉพาะเจ้าของประกาศ, ผู้ส่งคำขอ หรือ Admin)
exports.getRequestById = async (req, res, next) => {
  try {
    const requestId = req.params.id
    const userId = req.user.id

    const [requests] = await pool.query(`
      SELECT r.*,
             p.name as pet_name, p.status as pet_status, p.user_id as owner_id,
             (SELECT image_url FROM pet_images WHERE listing_id = p.id AND is_primary = 1 LIMIT 1) as pet_image,
             owner.full_name as owner_name, owner.avatar_url as owner_avatar,
             adopter.full_name as adopter_name, adopter.avatar_url as adopter_avatar
      FROM adoption_requests r
      JOIN pet_listings p ON r.listing_id = p.id
      JOIN users owner ON p.user_id = owner.id
      JOIN users adopter ON r.adopter_id = adopter.id
      WHERE r.id = ?
    `, [requestId])

    if (requests.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบคำขอ' })
    }

    const request = requests[0]
    const isOwner = request.owner_id === userId
    const isAdopter = request.adopter_id === userId

    if (!isOwner && !isAdopter && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์เข้าถึงคำขอนี้' })
    }

    // แนบห้องแชทที่ผูกกับคำขอนี้ เพื่อให้กดเข้าแชทต่อได้ทันที
    const [rooms] = await pool.query(
      'SELECT id FROM chat_rooms WHERE listing_id = ? AND adopter_id = ? LIMIT 1',
      [request.listing_id, request.adopter_id]
    )
    request.chat_room_id = rooms[0]?.id || null

    res.json({ success: true, data: request })
  } catch (error) {
    next(error)
  }
}

// 4. อนุมัติคำขอ (Owner)
exports.approveRequest = async (req, res, next) => {
  const connection = await pool.getConnection()
  try {
    const requestId = req.params.id
    const userId = req.user.id

    await connection.beginTransaction()

    // 1. ดึงข้อมูล request พร้อมล็อกแถวไว้ (FOR UPDATE)
    // ป้องกัน Race Condition กรณีเจ้าของกดอนุมัติ 2 คำขอพร้อมกัน
    const [requests] = await connection.query(
      'SELECT r.*, p.user_id as owner_id, p.name as pet_name, p.status as pet_status FROM adoption_requests r JOIN pet_listings p ON r.listing_id = p.id WHERE r.id = ? FOR UPDATE',
      [requestId]
    )
    if (requests.length === 0) {
      await connection.rollback()
      return res.status(404).json({ success: false, message: 'ไม่พบคำขอ' })
    }

    const request = requests[0]

    if (request.owner_id !== userId && req.user.role !== 'admin') {
      await connection.rollback()
      return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์อนุมัติคำขอนี้' })
    }
    
    if (request.status !== 'pending') {
      await connection.rollback()
      return res.status(400).json({ success: false, message: 'คำขอนี้ถูกจัดการไปแล้ว' })
    }

    // กันกรณีมีคำขออื่นของประกาศเดียวกันถูกอนุมัติไปก่อนหน้าแล้ว
    if (request.pet_status === 'adopted') {
      await connection.rollback()
      return res.status(400).json({ success: false, message: 'ประกาศนี้ถูกอนุมัติให้ผู้อื่นไปแล้ว' })
    }

    // 2. อัปเดตสถานะ request เป็น approved
    await connection.query('UPDATE adoption_requests SET status = "approved", reviewed_at = NOW() WHERE id = ?', [requestId])

    // 3. อัปเดตสถานะ listing เป็น adopted
    await connection.query('UPDATE pet_listings SET status = "adopted" WHERE id = ?', [request.listing_id])

    // 4. ดึงรายชื่อคำขออื่นที่ค้างอยู่เพื่อแจ้งเตือน
    const [otherPending] = await connection.query(
      'SELECT adopter_id FROM adoption_requests WHERE listing_id = ? AND status = "pending" AND id != ?',
      [request.listing_id, requestId]
    )

    // ปฏิเสธ request อื่นๆ ทั้งหมดที่ pending ใน listing เดียวกัน
    await connection.query(
      'UPDATE adoption_requests SET status = "rejected", reviewed_at = NOW() WHERE listing_id = ? AND status = "pending" AND id != ?',
      [request.listing_id, requestId]
    )

    // แจ้งเตือนผู้ที่ได้รับอนุมัติ
    await connection.query(
      'INSERT INTO notifications (user_id, type, reference_id, message) VALUES (?, ?, ?, ?)',
      [
        request.adopter_id,
        'request_approved',
        request.listing_id,
        `ยินดีด้วย! คำขอรับอุปการะ "${request.pet_name}" ของคุณได้รับการอนุมัติแล้ว`
      ]
    )

    // แจ้งเตือนคิวอื่นๆ ที่ไม่ได้รับเลือก
    for (const other of otherPending) {
      await connection.query(
        'INSERT INTO notifications (user_id, type, reference_id, message) VALUES (?, ?, ?, ?)',
        [
          other.adopter_id,
          'request_rejected_adopted',
          request.listing_id,
          `"${request.pet_name}" ได้บ้านใหม่แล้ว ขอบคุณที่ให้ความสนใจในการรับอุปการะ`
        ]
      )
    }

    await connection.commit()
    res.json({ success: true, message: 'อนุมัติคำขอสำเร็จ' })
  } catch (error) {
    await connection.rollback()
    next(error)
  } finally {
    connection.release()
  }
}

// 5. ปฏิเสธคำขอ (Owner)
exports.rejectRequest = async (req, res, next) => {
  try {
    const requestId = req.params.id
    const userId = req.user.id

    const [requests] = await pool.query(
      'SELECT r.status, r.adopter_id, r.listing_id, p.user_id as owner_id, p.name as pet_name FROM adoption_requests r JOIN pet_listings p ON r.listing_id = p.id WHERE r.id = ?',
      [requestId]
    )
    if (requests.length === 0) return res.status(404).json({ success: false, message: 'ไม่พบคำขอ' })
    
    const request = requests[0]
    if (request.owner_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์ปฏิเสธคำขอนี้' })
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'คำขอนี้ถูกจัดการไปแล้ว' })
    }

    // อัปเดตแบบมีเงื่อนไข เพื่อกันการกดซ้ำพร้อมกัน (ถ้าโดนคนอื่นจัดการไปแล้วจะได้ 0 แถว)
    const [rejectResult] = await pool.query(
      'UPDATE adoption_requests SET status = "rejected", reviewed_at = NOW() WHERE id = ? AND status = "pending"',
      [requestId]
    )
    if (rejectResult.affectedRows === 0) {
      return res.status(400).json({ success: false, message: 'คำขอนี้ถูกจัดการไปแล้ว' })
    }

    // แจ้งเตือน Adopter ว่าไม่ผ่านการพิจารณา
    await pool.query(
      'INSERT INTO notifications (user_id, type, reference_id, message) VALUES (?, ?, ?, ?)',
      [
        request.adopter_id,
        'request_rejected',
        request.listing_id,
        `ขออภัย คำขอรับอุปการะ "${request.pet_name}" ไม่ผ่านการพิจารณา`
      ]
    )

    res.json({ success: true, message: 'ปฏิเสธคำขอสำเร็จ' })
  } catch (error) {
    next(error)
  }
}

// 6. ยกเลิกคำขอ (Adopter)
exports.cancelRequest = async (req, res, next) => {
  try {
    const requestId = req.params.id
    const userId = req.user.id

    const [requests] = await pool.query('SELECT status, adopter_id FROM adoption_requests WHERE id = ?', [requestId])
    if (requests.length === 0) return res.status(404).json({ success: false, message: 'ไม่พบคำขอ' })
    
    if (requests[0].adopter_id !== userId) {
      return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์ยกเลิกคำขอนี้' })
    }

    if (requests[0].status !== 'pending') {
      return res.status(400).json({ success: false, message: 'ไม่สามารถยกเลิกคำขอที่ถูกพิจารณาแล้วได้' })
    }

    const [cancelResult] = await pool.query(
      'UPDATE adoption_requests SET status = "cancelled" WHERE id = ? AND status = "pending"',
      [requestId]
    )
    if (cancelResult.affectedRows === 0) {
      return res.status(400).json({ success: false, message: 'ไม่สามารถยกเลิกคำขอที่ถูกพิจารณาแล้วได้' })
    }

    res.json({ success: true, message: 'ยกเลิกคำขอสำเร็จ' })
  } catch (error) {
    next(error)
  }
}

// 7. ดูคำขอทั้งหมดที่เข้ามาสำหรับสัตว์เลี้ยงของฉัน (Owner)
exports.getAllIncomingRequests = async (req, res, next) => {
  try {
    const userId = req.user.id

    const [requests] = await pool.query(`
      SELECT r.*, p.name as pet_name, p.status as pet_status,
             (SELECT image_url FROM pet_images WHERE listing_id = p.id AND is_primary = 1 LIMIT 1) as pet_image,
             u.full_name as adopter_name, u.avatar_url as adopter_avatar, u.phone as adopter_phone
      FROM adoption_requests r
      JOIN pet_listings p ON r.listing_id = p.id
      JOIN users u ON r.adopter_id = u.id
      WHERE p.user_id = ?
      ORDER BY r.created_at DESC
    `, [userId])

    res.json({ success: true, data: requests })
  } catch (error) {
    next(error)
  }
}

