const { pool } = require('../config/db')
const { sendCSV } = require('../utils/csv')

exports.getDashboardStats = async (req, res, next) => {
  try {
    const [users] = await pool.query('SELECT COUNT(*) as count FROM users')
    const [listings] = await pool.query('SELECT COUNT(*) as count FROM pet_listings')
    const [requests] = await pool.query('SELECT COUNT(*) as count FROM adoption_requests')
    const [chats] = await pool.query('SELECT COUNT(*) as count FROM chat_rooms')
    const [reports] = await pool.query('SELECT COUNT(*) as count FROM pet_reports')
    const [pendingReports] = await pool.query('SELECT COUNT(*) as count FROM pet_reports WHERE status = "pending"')

    // ประกาศที่หาบ้านสำเร็จแล้ว ใช้คำนวณอัตราการจับคู่สำเร็จ
    const [adopted] = await pool.query('SELECT COUNT(*) as count FROM pet_listings WHERE status = "adopted"')

    // ประกาศใหม่ที่ลงในวันนี้
    const [dailyListings] = await pool.query(
      'SELECT COUNT(*) as count FROM pet_listings WHERE DATE(created_at) = CURDATE()'
    )

    const totalListings = listings[0].count
    const totalAdopted = adopted[0].count

    res.json({
      success: true,
      data: {
        totalUsers: users[0].count,
        totalListings,
        totalRequests: requests[0].count,
        totalChats: chats[0].count,
        totalReports: reports[0].count,
        pendingReports: pendingReports[0].count,
        totalAdopted,
        dailyNewListings: dailyListings[0].count,
        // อัตราการจับคู่สำเร็จ = ประกาศที่ได้บ้าน / ประกาศทั้งหมด (หน่วยเป็น %)
        matchSuccessRate: totalListings > 0
          ? Math.round((totalAdopted / totalListings) * 1000) / 10
          : 0
      }
    })
  } catch (error) {
    next(error)
  }
}

// GET /api/admin/charts — ข้อมูลสำหรับกราฟในหน้า Admin Dashboard
exports.getDashboardCharts = async (req, res, next) => {
  try {
    const days = Math.min(parseInt(req.query.days) || 30, 90)

    // จำนวนประกาศใหม่รายวัน
    const [listingRows] = await pool.query(
      `SELECT DATE(created_at) as day, COUNT(*) as count
       FROM pet_listings
       WHERE created_at >= CURDATE() - INTERVAL ? DAY
       GROUP BY DATE(created_at)`,
      [days]
    )

    // จำนวนการจับคู่สำเร็จรายวัน (นับจากวันที่คำขอถูกอนุมัติ)
    const [adoptionRows] = await pool.query(
      `SELECT DATE(reviewed_at) as day, COUNT(*) as count
       FROM adoption_requests
       WHERE status = 'approved' AND reviewed_at >= CURDATE() - INTERVAL ? DAY
       GROUP BY DATE(reviewed_at)`,
      [days]
    )

    // แปลงผลลัพธ์เป็น map เพื่อ lookup ได้เร็ว
    const toKey = (value) => new Date(value).toISOString().slice(0, 10)
    const listingMap = new Map(listingRows.map((row) => [toKey(row.day), Number(row.count)]))
    const adoptionMap = new Map(adoptionRows.map((row) => [toKey(row.day), Number(row.count)]))

    // เติมวันที่ที่ไม่มีข้อมูลให้เป็น 0 เพื่อให้เส้นกราฟต่อเนื่องไม่ขาดช่วง
    const trend = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const key = date.toISOString().slice(0, 10)
      trend.push({
        date: key,
        label: `${date.getDate()}/${date.getMonth() + 1}`,
        newListings: listingMap.get(key) || 0,
        adoptions: adoptionMap.get(key) || 0
      })
    }

    // สัดส่วนชนิดสัตว์ (สำหรับ Pie Chart)
    const [categoryRows] = await pool.query(
      `SELECT c.name, COUNT(p.id) as count
       FROM pet_categories c
       LEFT JOIN pet_listings p ON p.category_id = c.id AND p.is_hidden = 0
       GROUP BY c.id, c.name
       HAVING count > 0
       ORDER BY count DESC`
    )

    res.json({
      success: true,
      data: {
        trend,
        categories: categoryRows.map((row) => ({ name: row.name, value: Number(row.count) }))
      }
    })
  } catch (error) {
    next(error)
  }
}

// GET /api/admin/export/:type — ส่งออกรายงานเป็นไฟล์ CSV
// รองรับ 3 รายงานตาม docs/planning/08-dashboard-report-notification.md ข้อ 2
exports.exportReport = async (req, res, next) => {
  try {
    const { type } = req.params
    const today = new Date().toISOString().slice(0, 10)

    // 1. User Growth Report — ยอดสมัครสมาชิกใหม่รายวัน
    if (type === 'user-growth') {
      const [rows] = await pool.query(`
        SELECT DATE(created_at) as signup_date,
               COUNT(*) as new_users,
               SUM(CASE WHEN is_banned = 1 THEN 1 ELSE 0 END) as banned_users
        FROM users
        GROUP BY DATE(created_at)
        ORDER BY signup_date DESC
      `)

      return sendCSV(res, `user-growth-${today}.csv`, [
        { key: 'signup_date', label: 'วันที่สมัคร' },
        { key: 'new_users', label: 'สมาชิกใหม่' },
        { key: 'banned_users', label: 'ถูกระงับบัญชี' }
      ], rows)
    }

    // 2. Adoption Success Metrics — สัตว์ที่ได้บ้าน พร้อมระยะเวลาที่ใช้หาบ้าน
    if (type === 'adoption-success') {
      const [rows] = await pool.query(`
        SELECT p.id as listing_id,
               p.name as pet_name,
               c.name as category_name,
               p.location,
               owner.full_name as owner_name,
               adopter.full_name as adopter_name,
               p.created_at as posted_at,
               r.reviewed_at as adopted_at,
               DATEDIFF(r.reviewed_at, p.created_at) as days_to_adopt
        FROM pet_listings p
        JOIN adoption_requests r ON r.listing_id = p.id AND r.status = 'approved'
        LEFT JOIN pet_categories c ON p.category_id = c.id
        LEFT JOIN users owner ON p.user_id = owner.id
        LEFT JOIN users adopter ON r.adopter_id = adopter.id
        ORDER BY r.reviewed_at DESC
      `)

      return sendCSV(res, `adoption-success-${today}.csv`, [
        { key: 'listing_id', label: 'รหัสประกาศ' },
        { key: 'pet_name', label: 'ชื่อสัตว์เลี้ยง' },
        { key: 'category_name', label: 'ชนิด' },
        { key: 'location', label: 'พื้นที่' },
        { key: 'owner_name', label: 'เจ้าของเดิม' },
        { key: 'adopter_name', label: 'ผู้รับอุปการะ' },
        { key: 'posted_at', label: 'วันที่ลงประกาศ' },
        { key: 'adopted_at', label: 'วันที่ได้บ้าน' },
        { key: 'days_to_adopt', label: 'จำนวนวันที่ใช้หาบ้าน' }
      ], rows)
    }

    // 3. Audit & Moderation Report — ผลการจัดการเนื้อหาที่ถูกรายงาน
    if (type === 'moderation') {
      const [rows] = await pool.query(`
        SELECT rep.id as report_id,
               rep.created_at as reported_at,
               p.id as listing_id,
               p.name as pet_name,
               p.is_hidden,
               p.status as listing_status,
               reporter.full_name as reporter_name,
               rep.reason,
               rep.details,
               rep.status as report_status,
               rep.admin_notes,
               rep.updated_at as handled_at
        FROM pet_reports rep
        LEFT JOIN pet_listings p ON rep.listing_id = p.id
        LEFT JOIN users reporter ON rep.reporter_id = reporter.id
        ORDER BY rep.created_at DESC
      `)

      return sendCSV(res, `moderation-${today}.csv`, [
        { key: 'report_id', label: 'รหัสรายงาน' },
        { key: 'reported_at', label: 'วันที่รายงาน' },
        { key: 'listing_id', label: 'รหัสประกาศ' },
        { key: 'pet_name', label: 'ชื่อสัตว์เลี้ยง' },
        { key: 'reporter_name', label: 'ผู้รายงาน' },
        { key: 'reason', label: 'เหตุผล' },
        { key: 'details', label: 'รายละเอียด' },
        { key: 'report_status', label: 'สถานะการจัดการ' },
        { key: 'admin_notes', label: 'บันทึกของแอดมิน' },
        { key: 'is_hidden', label: 'ประกาศถูกซ่อน' },
        { key: 'listing_status', label: 'สถานะประกาศ' },
        { key: 'handled_at', label: 'วันที่จัดการล่าสุด' }
      ], rows)
    }

    return res.status(400).json({
      success: false,
      message: 'ประเภทรายงานไม่ถูกต้อง (user-growth, adoption-success, moderation)'
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

// ดูรายการรายงานทั้งหมด
exports.getReports = async (req, res, next) => {
  try {
    const { status } = req.query
    let query = `
      SELECT r.*,
             p.name as pet_name, p.status as pet_status, p.is_hidden as pet_is_hidden,
             u_reporter.full_name as reporter_name, u_reporter.email as reporter_email,
             u_owner.id as owner_id, u_owner.full_name as owner_name, u_owner.email as owner_email
      FROM pet_reports r
      JOIN pet_listings p ON r.listing_id = p.id
      JOIN users u_reporter ON r.reporter_id = u_reporter.id
      JOIN users u_owner ON p.user_id = u_owner.id
    `
    const params = []
    if (status && ['pending', 'resolved', 'dismissed'].includes(status)) {
      query += ` WHERE r.status = ?`
      params.push(status)
    }
    query += ` ORDER BY r.created_at DESC`

    const [reports] = await pool.query(query, params)
    res.json({ success: true, data: reports })
  } catch (error) {
    next(error)
  }
}

// อัปเดตสถานะรายงาน (resolved / dismissed)
exports.updateReportStatus = async (req, res, next) => {
  try {
    const { id } = req.params
    const { status, admin_notes } = req.body

    if (!['resolved', 'dismissed', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'สถานะรายงานไม่ถูกต้อง' })
    }

    const [reports] = await pool.query('SELECT * FROM pet_reports WHERE id = ?', [id])
    if (reports.length === 0) {
      return res.status(404).json({ success: false, message: 'ไม่พบรายงาน' })
    }

    await pool.query(
      'UPDATE pet_reports SET status = ?, admin_notes = ? WHERE id = ?',
      [status, admin_notes !== undefined ? admin_notes : reports[0].admin_notes, id]
    )

    res.json({ success: true, message: 'อัปเดตสถานะรายงานสำเร็จ' })
  } catch (error) {
    next(error)
  }
}

// ตรวจสอบและสั่งรัน SLA Alerts ทันที (On-Demand / Manual Trigger)
const { runAllSLAChecks, getSLAStatus } = require('../services/sla.service')

exports.getSLAStatus = async (req, res, next) => {
  try {
    const status = getSLAStatus()
    res.json({
      success: true,
      data: status
    })
  } catch (error) {
    next(error)
  }
}

exports.triggerSLACheck = async (req, res, next) => {
  try {
    const summary = await runAllSLAChecks()
    res.json({
      success: true,
      message: `ตรวจสอบ SLA สำเร็จ พบการแจ้งเตือนใหม่ ${summary.totalAlerts} รายการ (ส่งอีเมล ${summary.emailsSent || 0} ฉบับ)`,
      data: summary
    })
  } catch (error) {
    next(error)
  }
}
